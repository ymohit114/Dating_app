import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/models/Message';
import socketManager from '@/lib/socket';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, emoji } = await req.json();

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'messageId and emoji are required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const message = await Message.findById(messageId);
      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      if (message.isDeleted) {
        return NextResponse.json({ error: 'Cannot react to deleted message' }, { status: 400 });
      }

      const existingIndex = message.reactions.findIndex(
        (r) => r.userId === authUser.userId && r.emoji === emoji
      );

      if (existingIndex > -1) {
        // Toggle OFF if already reacted with the same emoji
        message.reactions.splice(existingIndex, 1);
      } else {
        // Remove any previous reaction by this user and set the new one
        message.reactions = message.reactions.filter((r) => r.userId !== authUser.userId);
        message.reactions.push({ userId: authUser.userId, emoji });
      }

      await message.save();

      socketManager.emit(`chat:reaction`, {
        messageId,
        matchId: message.matchId.toString(),
        reactions: message.reactions,
      });

      return NextResponse.json({
        success: true,
        messageId,
        reactions: message.reactions,
      });
    }

    return NextResponse.json({ success: true, messageId, reactions: [{ userId: authUser.userId, emoji }] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
