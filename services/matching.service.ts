import { ActionType, IMatch } from '@/types';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import Match from '@/models/Match';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Profile from '@/models/Profile';
import User from '@/models/User';
import socketManager from '@/lib/socket';

/**
 * Creates a mutual match, conversation, and initial system message
 */
export async function createMutualMatch(
  fromUserId: string,
  toUserId: string,
  initialText: string = '✨ It’s a Match on Elance! Start the conversation.'
): Promise<IMatch> {
  const [user1, user2] = [fromUserId, toUserId].sort();

  let matchDoc = await Match.findOne({ user1, user2 });

  if (!matchDoc) {
    matchDoc = await Match.create({
      user1,
      user2,
      status: 'active',
      matchedAt: new Date(),
      lastMessage: initialText,
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
      text: initialText,
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
  return matchObj;
}

/**
 * Auto-evaluates scheduled likes from/to managed profiles whose delay (8-9 hours) has elapsed
 */
export async function processScheduledMatches(): Promise<number> {
  const conn = await connectToDatabase();
  if (!conn) return 0;

  try {
    const now = new Date();
    const pendingLikes = await Like.find({
      scheduledMatchAt: { $exists: true, $lte: now },
      isProcessed: { $ne: true },
    }).limit(50);

    let processedCount = 0;
    for (const l of pendingLikes) {
      await createMutualMatch(
        l.fromUser.toString(),
        l.toUser.toString(),
        '✨ It’s a Match on Elance! Start the conversation.'
      );
      l.isProcessed = true;
      await l.save();
      processedCount++;
    }

    return processedCount;
  } catch (err) {
    console.error('Error processing scheduled matches:', err);
    return 0;
  }
}

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

      // Check if target user is a managed/seed profile
      const targetProfile = await Profile.findOne({
        $or: [
          { userId: toUserId },
          ...(mongoose.isValidObjectId(toUserId) ? [{ userId: new mongoose.Types.ObjectId(toUserId) }] : []),
          ...(mongoose.isValidObjectId(toUserId) ? [{ _id: new mongoose.Types.ObjectId(toUserId) }] : []),
        ],
      }).lean();

      const isTargetManaged = targetProfile?.isManaged === true;

      // Calculate scheduled 8-9 hours delay for managed profiles (8.5 hours average: 8h 30m)
      const scheduledMatchAt = isTargetManaged
        ? new Date(Date.now() + (8 * 60 + 30) * 60 * 1000)
        : undefined;

      // Record like in MongoDB
      await Like.findOneAndUpdate(
        { fromUser: fromUserId, toUser: toUserId },
        { 
          fromUser: fromUserId, 
          toUser: toUserId,
          ...(scheduledMatchAt ? { scheduledMatchAt, isProcessed: false } : {})
        },
        { upsert: true, new: true }
      );

      // Check if target user has already liked current user (or if superlike)
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

      if (targetLike || (action === 'superlike' && !isTargetManaged)) {
        const matchObj = await createMutualMatch(
          fromUserId,
          toUserId,
          action === 'superlike' ? '🌟 Sent a Super Like!' : '✨ It’s a Match on Elance! Start the conversation.'
        );

        return {
          isMatch: true,
          match: matchObj,
        };
      }

      return { isMatch: false };
    } catch (error) {
      console.error('Swipe action DB error:', error);
      return { isMatch: false };
    }
  }

  return { isMatch: false };
}
