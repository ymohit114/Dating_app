import connectToDatabase from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import { IConversation, IMessage, IMatch } from '@/types';
import { SEED_MATCHES, SEED_MESSAGES, SEED_PROFILES } from '@/utils/seedData';
import socketManager from '@/lib/socket';

export class ChatService {
  async getConversations(userId: string): Promise<IMatch[]> {
    const conn = await connectToDatabase();
    if (conn) {
      const matches = await Match.find({
        $or: [{ user1: userId }, { user2: userId }],
        status: 'active',
      })
        .sort({ updatedAt: -1 })
        .lean();

      const populatedMatches: IMatch[] = [];

      for (const m of matches) {
        const otherUserId = m.user1.toString() === userId ? m.user2.toString() : m.user1.toString();
        const otherProfDoc = await Profile.findOne({ userId: otherUserId }).lean();

        let otherProfileObj = undefined;
        if (otherProfDoc) {
          otherProfileObj = {
            _id: otherProfDoc._id.toString(),
            userId: otherProfDoc.userId.toString(),
            name: otherProfDoc.firstName || 'Candidate',
            age: 24,
            birthdate: otherProfDoc.dateOfBirth?.toISOString() || '2000-01-01',
            gender: otherProfDoc.gender,
            interestedIn: (otherProfDoc.interestedIn?.[0] as any) || 'everyone',
            photos: otherProfDoc.photos?.map((p: any) => (typeof p === 'string' ? p : p.url)) || [],
            bio: otherProfDoc.bio || '',
            location: otherProfDoc.location || { type: 'Point', coordinates: [77.209, 28.6139] },
            passions: otherProfDoc.interests || [],
            prompts: [],
            isVerified: otherProfDoc.verificationStatus === 'verified',
          };
        }

        populatedMatches.push({
          _id: m._id.toString(),
          users: [m.user1.toString(), m.user2.toString()],
          matchedAt: m.matchedAt.toISOString(),
          lastMessage: m.lastMessage,
          lastMessageAt: m.lastMessageAt?.toISOString(),
          active: m.status === 'active',
          otherProfile: otherProfileObj,
        });
      }

      return populatedMatches;
    }

    return SEED_MATCHES;
  }

  async getMessages(matchId: string, currentUserId: string): Promise<IMessage[]> {
    const conn = await connectToDatabase();
    if (conn) {
      // Verify current user is a participant of this match
      const match = await Match.findById(matchId).lean();
      if (!match) {
        throw new Error('Match not found.');
      }

      const isParticipant =
        match.user1.toString() === currentUserId || match.user2.toString() === currentUserId;
      if (!isParticipant) {
        throw new Error('Unauthorized to view conversation messages.');
      }

      const docs = await Message.find({ matchId }).sort({ createdAt: 1 }).lean();
      return docs.map((d: any) => ({
        _id: d._id.toString(),
        matchId: d.matchId.toString(),
        senderId: d.senderId.toString(),
        receiverId: d.receiverId.toString(),
        text: d.text,
        mediaUrl: d.mediaUrl,
        type: d.type || 'text',
        read: d.read,
        createdAt: d.createdAt.toISOString(),
      }));
    }

    return SEED_MESSAGES.filter((m) => m.matchId === matchId || matchId.startsWith('match_'));
  }

  async sendMessage(
    matchId: string,
    senderId: string,
    text: string,
    mediaUrl?: string,
    type: string = 'text'
  ): Promise<IMessage> {
    const conn = await connectToDatabase();
    if (conn) {
      const match = await Match.findById(matchId);
      if (!match) throw new Error('Match not found.');

      const isUser1 = match.user1.toString() === senderId;
      const isUser2 = match.user2.toString() === senderId;
      if (!isUser1 && !isUser2) {
        throw new Error('Unauthorized to post messages to this match.');
      }

      const receiverId = isUser1 ? match.user2.toString() : match.user1.toString();

      const newMsg = await Message.create({
        matchId: match._id,
        senderId,
        receiverId,
        text,
        mediaUrl,
        type,
        read: false,
      });

      match.lastMessage = text;
      match.lastMessageAt = new Date();
      await match.save();

      const formattedMsg: IMessage = {
        _id: newMsg._id.toString(),
        matchId: match._id.toString(),
        senderId,
        receiverId,
        text,
        mediaUrl,
        type: newMsg.type as any,
        read: false,
        createdAt: newMsg.createdAt.toISOString(),
      };

      // Broadcast socket event
      socketManager.emit('message:received', { message: formattedMsg });
      return formattedMsg;
    }

    const fallbackMsg: IMessage = {
      _id: `msg_${Date.now()}`,
      matchId,
      senderId,
      receiverId: 'user_seed_1',
      text,
      mediaUrl,
      type: type as any,
      read: false,
      createdAt: new Date().toISOString(),
    };

    socketManager.emit('message:received', { message: fallbackMsg });
    return fallbackMsg;
  }
}

export const chatService = new ChatService();
export default chatService;
