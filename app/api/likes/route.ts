import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { extractAuthUser } from '@/lib/auth';
import { processSwipeAction } from '@/services/matching.service';
import connectToDatabase from '@/lib/mongodb';
import Like from '@/models/Like';
import Pass from '@/models/Pass';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toUserId, action } = await req.json();

    if (!toUserId || !action) {
      return NextResponse.json({ error: 'toUserId and action are required' }, { status: 400 });
    }

    const result = await processSwipeAction(authUser.userId, toUserId, action);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Swipe action failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = authUser.userId;
    const conn = await connectToDatabase();

    if (conn) {
      // Find all likes sent TO current user
      const queryConds: any[] = [{ toUser: currentUserId }];
      if (mongoose.isValidObjectId(currentUserId)) {
        queryConds.push({ toUser: new mongoose.Types.ObjectId(currentUserId) });
      }

      const dbLikes = await Like.find({ $or: queryConds })
        .sort({ createdAt: -1 })
        .lean();

      if (dbLikes && dbLikes.length > 0) {
        // Exclude users already matched with current user
        const existingMatches = await Match.find({
          $or: [
            { user1: currentUserId },
            { user2: currentUserId },
          ],
        }).lean();

        const matchedUserIds = new Set<string>();
        existingMatches.forEach((m: any) => {
          matchedUserIds.add(m.user1.toString());
          matchedUserIds.add(m.user2.toString());
        });

        // Filter likes from unmatched users
        const pendingSenderIds = dbLikes
          .map((l: any) => l.fromUser.toString())
          .filter((senderId: string) => !matchedUserIds.has(senderId) && senderId !== currentUserId);

        const profiles = await Profile.find({
          userId: { $in: pendingSenderIds },
        }).lean();

        const formatted = dbLikes
          .filter((l: any) => pendingSenderIds.includes(l.fromUser.toString()))
          .map((l: any) => {
            const senderId = l.fromUser.toString();
            const prof: any = profiles.find((p: any) => p.userId.toString() === senderId);
            if (!prof) return null;

            return {
              profile: {
                _id: prof._id.toString(),
                userId: prof.userId.toString(),
                name: prof.name || prof.firstName || 'Candidate',
                age: prof.age || 24,
                birthdate: prof.birthdate || '2000-01-01',
                gender: prof.gender || 'man',
                interestedIn: prof.interestedIn || 'women',
                photos: prof.photos && prof.photos.length > 0
                  ? prof.photos.map((p: any) => (typeof p === 'string' ? p : p.url))
                  : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
                bio: prof.bio || '',
                job: prof.job || '',
                company: prof.company || '',
                school: prof.school || '',
                height: prof.height || 175,
                location: {
                  type: 'Point' as const,
                  coordinates: prof.location?.coordinates || [77.209, 28.6139],
                  city: prof.city || prof.location?.city || 'New Delhi',
                },
                passions: prof.passions || prof.interests || [],
                prompts: prof.prompts || [],
                relationshipGoal: prof.relationshipGoal || 'Long-term',
                isVerified: prof.verificationStatus === 'verified' || prof.isVerified || false,
                isBoosted: false,
                onlineStatus: 'online' as const,
              },
              likedAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
              type: 'like',
            };
          })
          .filter(Boolean);

        return NextResponse.json({ success: true, likes: formatted });
      }
    }

    return NextResponse.json({ success: true, likes: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
