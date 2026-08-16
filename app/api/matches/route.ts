import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = authUser.userId;
    const conn = await connectToDatabase();

    if (conn) {
      const userConditions: any[] = [
        { user1: currentUserId },
        { user2: currentUserId },
      ];
      if (mongoose.isValidObjectId(currentUserId)) {
        const objId = new mongoose.Types.ObjectId(currentUserId);
        userConditions.push({ user1: objId }, { user2: objId });
      }

      const matches = await Match.find({
        $or: userConditions,
        status: 'active',
      })
        .sort({ updatedAt: -1 })
        .lean();

      if (matches && matches.length > 0) {
        // Collect other user IDs in each pair
        const otherUserIds = matches.map((m: any) => {
          const u1 = m.user1.toString();
          const u2 = m.user2.toString();
          return u1 === currentUserId.toString() ? u2 : u1;
        });

        const profiles = await Profile.find({
          userId: { $in: otherUserIds },
        }).lean();

        const formatted = matches.map((m: any) => {
          const u1 = m.user1.toString();
          const u2 = m.user2.toString();
          const otherId = u1 === currentUserId.toString() ? u2 : u1;
          const prof: any = profiles.find((p: any) => p.userId.toString() === otherId);

          return {
            _id: m._id.toString(),
            users: [u1, u2],
            matchedAt: m.matchedAt ? new Date(m.matchedAt).toISOString() : new Date().toISOString(),
            lastMessage: m.lastMessage || '✨ You matched! Say hello 👋',
            lastMessageAt: m.lastMessageAt ? new Date(m.lastMessageAt).toISOString() : new Date().toISOString(),
            active: m.status === 'active',
            otherProfile: prof
              ? {
                  _id: prof._id.toString(),
                  userId: prof.userId.toString(),
                  name: prof.name || prof.firstName || 'Member',
                  age: prof.age || 24,
                  photos: prof.photos && prof.photos.length > 0
                    ? prof.photos.map((p: any) => (typeof p === 'string' ? p : p.url))
                    : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
                  bio: prof.bio || '',
                  location: {
                    type: 'Point' as const,
                    coordinates: prof.location?.coordinates || [77.209, 28.6139],
                    city: prof.city || prof.location?.city || 'New Delhi',
                  },
                  isVerified: prof.verificationStatus === 'verified' || prof.isVerified || false,
                  onlineStatus: 'online' as const,
                }
              : {
                  _id: `prof_${otherId}`,
                  userId: otherId,
                  name: 'Member',
                  age: 24,
                  photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
                  location: { type: 'Point' as const, coordinates: [77.209, 28.6139], city: 'New Delhi' },
                  isVerified: true,
                  onlineStatus: 'online' as const,
                },
          };
        });

        return NextResponse.json({ success: true, matches: formatted });
      }
    }

    return NextResponse.json({ success: true, matches: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
