import { ActionType, IMatch } from '@/types';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import Match from '@/models/Match';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import socketManager from '@/lib/socket';

export async function processSwipeAction(
  fromUserId: string,
  toUserId: string,
  action: ActionType
): Promise<{ isMatch: boolean; match?: IMatch }> {
  const conn = await connectToDatabase();

  if (conn) {
    try {
      if (action === 'pass') {
        await Pass.findOneAndUpdate(
          { fromUser: fromUserId, toUser: toUserId },
          { fromUser: fromUserId, toUser: toUserId },
          { upsert: true, new: true }
        );
        return { isMatch: false };
      }

      // Record like in MongoDB
      await Like.findOneAndUpdate(
        { fromUser: fromUserId, toUser: toUserId },
        { fromUser: fromUserId, toUser: toUserId },
        { upsert: true, new: true }
      );

      // Check if target user has also liked current user
      const queryTarget: any[] = [
        { fromUser: toUserId, toUser: fromUserId },
      ];
      if (mongoose.isValidObjectId(toUserId) && mongoose.isValidObjectId(fromUserId)) {
        queryTarget.push({
          fromUser: new mongoose.Types.ObjectId(toUserId),
          toUser: new mongoose.Types.ObjectId(fromUserId),
        });
      }

      const targetLike = await Like.findOne({ $or: queryTarget });

      if (targetLike || action === 'superlike') {
        // Mutual like confirmed! Create atomic match
        const [user1, user2] = [fromUserId, toUserId].sort();

        let matchDoc = await Match.findOne({ user1, user2 });

        if (!matchDoc) {
          matchDoc = await Match.create({
            user1,
            user2,
            status: 'active',
            matchedAt: new Date(),
            lastMessage: action === 'superlike' ? '🌟 Super Liked you on Elance!' : '✨ You have a new mutual match!',
            lastMessageAt: new Date(),
          });

          const newConversation = await Conversation.create({
            matchId: matchDoc._id,
            participants: [user1, user2],
          });

          matchDoc.conversationId = newConversation._id;
          await matchDoc.save();

          await Message.create({
            matchId: matchDoc._id,
            senderId: fromUserId,
            receiverId: toUserId,
            text: action === 'superlike' ? '🌟 Sent a Super Like!' : '✨ It’s a Match on Elance! Start the conversation.',
            type: 'system',
            read: false,
          });
        }

        const matchObj: IMatch = {
          _id: matchDoc._id.toString(),
          users: [user1, user2],
          matchedAt: matchDoc.matchedAt.toISOString(),
          lastMessage: matchDoc.lastMessage,
          lastMessageAt: matchDoc.lastMessageAt?.toISOString(),
          active: matchDoc.status === 'active',
        };

        // Broadcast real-time match event
        socketManager.emit('match:created', { match: matchObj });

        return {
          isMatch: true,
          match: matchObj,
        };
      }

      return { isMatch: false };
    } catch (e) {
      console.warn('DB Match processing error:', e);
    }
  }

  return { isMatch: false };
}
