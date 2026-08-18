import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Message from '@/models/Message';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth';
import { resolveToCloudinaryUrl } from '@/lib/cloudinary';
import socketManager from '@/lib/socket';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);
    if (errorResponse) return errorResponse;

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ success: true, conversations: [] });

    // 1. Find all managed user IDs
    const managedProfiles = await Profile.find({ isManaged: true }).select('userId name firstName photos').lean();
    const managedUserIds = managedProfiles.map(p => p.userId.toString());

    if (managedUserIds.length === 0) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    // 2. Find all matches containing any managed user
    const matches = await Match.find({
      $or: [
        { user1: { $in: managedUserIds } },
        { user2: { $in: managedUserIds } },
      ],
      status: 'active',
    })
      .sort({ updatedAt: -1 })
      .lean();

    // 3. For each match, collect messages and participant profiles
    const conversations = await Promise.all(
      matches.map(async (m: any) => {
        const u1 = m.user1.toString();
        const u2 = m.user2.toString();

        const managedId = managedUserIds.includes(u1) ? u1 : u2;
        const realUserId = managedId === u1 ? u2 : u1;

        const [managedProf, realProf, realUserDoc, messages] = await Promise.all([
          Profile.findOne({ userId: managedId }).lean(),
          Profile.findOne({ userId: realUserId }).lean(),
          User.findOne({ _id: realUserId }).select('email status').lean(),
          Message.find({ matchId: m._id }).sort({ createdAt: 1 }).lean(),
        ]);

        return {
          matchId: m._id.toString(),
          managedProfile: {
            userId: managedId,
            name: managedProf?.name || managedProf?.firstName || 'Managed Model',
            photo: resolveToCloudinaryUrl(managedProf?.photos?.[0] || managedProf?.profilePicture),
          },
          realUser: {
            userId: realUserId,
            name: realProf?.name || realProf?.firstName || 'Registered Member',
            email: realUserDoc?.email || 'user@example.com',
            photo: resolveToCloudinaryUrl(realProf?.photos?.[0] || realProf?.profilePicture),
            city: realProf?.city || realProf?.location?.city || 'New Delhi',
          },
          lastMessage: m.lastMessage,
          lastMessageAt: m.lastMessageAt ? new Date(m.lastMessageAt).toISOString() : new Date().toISOString(),
          messages: (messages || []).map((msg: any) => ({
            _id: msg._id.toString(),
            senderId: msg.senderId.toString(),
            receiverId: msg.receiverId.toString(),
            text: msg.text,
            isManagedSender: msg.senderId.toString() === managedId,
            createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
            isDeleted: msg.isDeleted || false,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { matchId, managedUserId, realUserId, text } = body;

    if (!matchId || !managedUserId || !realUserId || !text?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required parameters (matchId, managedUserId, realUserId, text)' } },
        { status: 400 }
      );
    }

    const conn = await connectToDatabase();
    if (!conn) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    // 1. Create message from the managed profile to the real user
    const newMsg = await Message.create({
      matchId: new mongoose.Types.ObjectId(matchId),
      senderId: new mongoose.Types.ObjectId(managedUserId),
      receiverId: new mongoose.Types.ObjectId(realUserId),
      text: text.trim(),
      type: 'text',
      read: false,
    });

    // 2. Update Match metadata
    await Match.findByIdAndUpdate(matchId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
    });

    // 3. Emit real-time socket event so user sees message instantly
    socketManager.emit(`chat:${matchId}`, {
      message: {
        _id: newMsg._id.toString(),
        matchId,
        senderId: managedUserId,
        receiverId: realUserId,
        text: text.trim(),
        createdAt: newMsg.createdAt.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        _id: newMsg._id.toString(),
        senderId: managedUserId,
        receiverId: realUserId,
        text: text.trim(),
        createdAt: newMsg.createdAt.toISOString(),
        isManagedSender: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
