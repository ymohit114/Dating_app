import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { processScheduledMatches } from '@/services/matching.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = authUser.userId;
    const conn = await connectToDatabase();

    if (conn) {
      // Evaluate any elapsed scheduled matches from managed profiles
      await processScheduledMatches();

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
                  userId: otherId,
                  name: prof.name || prof.firstName || 'Match',
                  age: prof.dateOfBirth
                    ? Math.abs(new Date(Date.now() - new Date(prof.dateOfBirth).getTime()).getUTCFullYear() - 1970)
                    : 24,
                  gender: prof.gender || 'woman',
                  photos: prof.photos && prof.photos.length > 0 ? prof.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'],
                  bio: prof.bio || 'Living life with intention and good vibes ✨',
                  job: prof.job || prof.occupation || 'Creative Professional',
                  location: {
                    city: prof.city || prof.location?.city || 'New Delhi',
                  },
                  onlineStatus: 'online',
                  isVerified: prof.verificationStatus === 'verified' || prof.isVerified === true,
                }
              : {
                  _id: `prof_${otherId}`,
                  userId: otherId,
                  name: 'Match',
                  age: 24,
                  photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'],
                  bio: 'Hey there! Nice to meet you.',
                  location: { city: 'New Delhi' },
                  onlineStatus: 'online',
                  isVerified: true,
                },
          };
        });

        return NextResponse.json({ success: true, matches: formatted });
      }

      return NextResponse.json({ success: true, matches: [] });
    }

    return NextResponse.json({ success: true, matches: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
