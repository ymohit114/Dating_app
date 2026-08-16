import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/models/Message';
import Match from '@/models/Match';
import socketManager from '@/lib/socket';
import { sendMessageSchema } from '@/lib/validations';
import { SEED_MESSAGES, INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const conn = await connectToDatabase();

    if (conn) {
      const messages = await Message.find({ matchId: conversationId })
        .sort({ createdAt: 1 })
        .lean();

      if (messages && messages.length > 0) {
        const formatted = messages.map((m: any) => ({
          _id: m._id.toString(),
          conversationId: m.matchId.toString(),
          senderId: m.senderId.toString(),
          receiverId: m.receiverId.toString(),
          message: m.text,
          messageType: m.type,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
        }));
        return NextResponse.json({ messages: formatted });
      }
    }

    const filtered = SEED_MESSAGES.filter((m) => m.matchId === conversationId);
    return NextResponse.json({
      messages: filtered.map((m) => ({
        _id: m._id,
        conversationId: m.matchId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        message: m.text,
        messageType: m.type || 'text',
        read: m.read,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const authUser = extractAuthUser(req);
    const senderId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const body = await req.json();
    const validated = sendMessageSchema.safeParse({
      conversationId,
      message: body.message || body.text,
      messageType: body.messageType || 'text',
    });

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const { message, messageType } = validated.data;
    const receiverId = body.receiverId || 'user_seed_1';

    const conn = await connectToDatabase();
    if (conn) {
      const newMessage = await Message.create({
        matchId: conversationId,
        senderId,
        receiverId,
        text: message,
        type: messageType,
        read: false,
      });

      await Match.findByIdAndUpdate(conversationId, {
        lastMessage: message,
        lastMessageAt: new Date(),
      });

      const formatted = {
        _id: newMessage._id.toString(),
        conversationId,
        senderId,
        receiverId,
        message,
        messageType,
        read: false,
        createdAt: newMessage.createdAt.toISOString(),
      };

      socketManager.emit(`chat:${conversationId}`, formatted);
      return NextResponse.json({ message: formatted });
    }

    const mockMessage = {
      _id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      receiverId,
      message,
      messageType,
      read: false,
      createdAt: new Date().toISOString(),
    };

    socketManager.emit(`chat:${conversationId}`, mockMessage);
    return NextResponse.json({ message: mockMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
