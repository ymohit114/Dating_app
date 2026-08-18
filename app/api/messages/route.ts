import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/models/Message';
import Match from '@/models/Match';
import Block from '@/models/Block';
import socketManager from '@/lib/socket';
import { messageRateLimiter, createRateLimitResponse } from '@/lib/rateLimit';
import { sanitizeMongoInput, sanitizeHtmlText } from '@/lib/security';
import { analyzeMessageSafety } from '@/lib/chatSafety';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const messages = await Message.find({ matchId }).sort({ createdAt: 1 }).lean();
      if (messages) {
        const formatted = messages.map((m: any) => ({
          _id: m._id.toString(),
          matchId: m.matchId.toString(),
          senderId: m.senderId.toString(),
          receiverId: m.receiverId?.toString() || '',
          text: m.isDeleted ? 'This message was deleted' : m.text,
          mediaUrl: m.isDeleted ? undefined : m.mediaUrl,
          type: m.type,
          read: m.read,
          isDeleted: Boolean(m.isDeleted),
          reactions: m.reactions || [],
          createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, messages: formatted });
      }
    }

    return NextResponse.json({ success: true, messages: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const senderId = authUser.userId;

    // 1. Rate Limiting (30 messages per minute per user)
    const rateCheck = messageRateLimiter.check(`user_${senderId}`);
    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.resetMs, 'You are sending messages too quickly. Please wait a moment.');
    }

    const rawBody = await req.json();
    const body = sanitizeMongoInput(rawBody);
    const { matchId, receiverId, text, mediaUrl, type = 'text' } = body;

    if (!matchId || !text || !text.trim()) {
      return NextResponse.json({ error: 'matchId and text are required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      let actualReceiverId = receiverId;

      const match = await Match.findById(matchId).lean();
      if (match) {
        const u1 = match.user1.toString();
        const u2 = match.user2.toString();
        actualReceiverId = u1 === senderId.toString() ? u2 : u1;
      }

      // 2. Block Verification: Ensure neither user has blocked the other
      if (actualReceiverId) {
        const isBlocked = await Block.findOne({
          $or: [
            { blockerId: senderId, blockedId: actualReceiverId },
            { blockerId: actualReceiverId, blockedId: senderId },
          ],
        });

        if (isBlocked) {
          return NextResponse.json(
            { error: 'You cannot send messages to this user because of privacy and safety settings.' },
            { status: 403 }
          );
        }
      }

      // 3. XSS & Chat Safety Analysis (Mask phone/UPI, strip HTML injection)
      const cleanInput = sanitizeHtmlText(text);
      const safetyResult = analyzeMessageSafety(cleanInput);

      const newMessage = await Message.create({
        matchId,
        senderId,
        receiverId: actualReceiverId,
        text: safetyResult.maskedText,
        originalText: cleanInput,
        mediaUrl,
        type,
        read: false,
        isDeleted: false,
        reactions: [],
      });

      // Update match preview
      await Match.findByIdAndUpdate(matchId, {
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
      });

      const formatted = {
        _id: newMessage._id.toString(),
        matchId: newMessage.matchId.toString(),
        senderId: newMessage.senderId.toString(),
        receiverId: newMessage.receiverId?.toString() || '',
        text: newMessage.text,
        mediaUrl: newMessage.mediaUrl,
        type: newMessage.type,
        read: newMessage.read,
        isDeleted: false,
        reactions: [],
        createdAt: newMessage.createdAt ? new Date(newMessage.createdAt).toISOString() : new Date().toISOString(),
      };

      socketManager.emit(`chat:${matchId}`, formatted);
      return NextResponse.json({ success: true, message: formatted });
    }

    // In-memory fallback
    const mockMessage = {
      _id: `msg_${Date.now()}`,
      matchId,
      senderId,
      receiverId: receiverId || '',
      text: text.trim(),
      mediaUrl,
      type,
      read: false,
      isDeleted: false,
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    socketManager.emit(`chat:${matchId}`, mockMessage);
    return NextResponse.json({ success: true, message: mockMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const message = await Message.findById(messageId);
      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      // Ensure user is the author or admin
      if (message.senderId.toString() !== authUser.userId.toString() && authUser.role !== 'superadmin' && authUser.role !== 'moderator') {
        return NextResponse.json({ error: 'Cannot delete messages sent by others' }, { status: 403 });
      }

      if (!message.originalText && message.text) {
        message.originalText = message.text;
      }
      message.isDeleted = true;
      await message.save();

      socketManager.emit(`chat:deleted`, { messageId, matchId: message.matchId.toString() });
      return NextResponse.json({ success: true, messageId });
    }

    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
