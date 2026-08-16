import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);

    const conn = await connectToDatabase();
    if (conn) {
      const matches = await Match.find().sort({ updatedAt: -1 }).lean();

      const userIds = new Set<string>();
      matches.forEach((m: any) => {
        if (m.user1) userIds.add(m.user1.toString());
        if (m.user2) userIds.add(m.user2.toString());
      });

      const userIdsArray = Array.from(userIds);

      const [profiles, users] = await Promise.all([
        Profile.find({ userId: { $in: userIdsArray } }).lean(),
        User.find({ _id: { $in: userIdsArray } }).select('email role status').lean(),
      ]);

      const userMap = new Map<string, any>();
      users.forEach((u: any) => userMap.set(u._id.toString(), u));

      const profileMap = new Map<string, any>();
      profiles.forEach((p: any) => profileMap.set(p.userId.toString(), p));

      const formatted = matches.map((m: any) => {
        const u1Id = m.user1?.toString() || '';
        const u2Id = m.user2?.toString() || '';
        const u1Profile = profileMap.get(u1Id);
        const u2Profile = profileMap.get(u2Id);
        const u1User = userMap.get(u1Id);
        const u2User = userMap.get(u2Id);

        const u1Name = u1Profile?.name || u1Profile?.firstName || u1User?.email?.split('@')[0] || 'User 1';
        const u2Name = u2Profile?.name || u2Profile?.firstName || u2User?.email?.split('@')[0] || 'User 2';

        return {
          _id: m._id.toString(),
          matchedAt: m.matchedAt ? new Date(m.matchedAt).toISOString() : new Date().toISOString(),
          status: m.status || 'active',
          lastMessage: m.lastMessage || '✨ Matched! Conversation active.',
          lastMessageAt: m.lastMessageAt ? new Date(m.lastMessageAt).toISOString() : new Date().toISOString(),
          user1: {
            _id: u1Id,
            name: u1Name,
            email: u1User?.email || '',
            photo: u1Profile?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          },
          user2: {
            _id: u2Id,
            name: u2Name,
            email: u2User?.email || '',
            photo: u2Profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          },
        };
      });

      return NextResponse.json({ success: true, matches: formatted });
    }

    return NextResponse.json({ success: true, matches: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
