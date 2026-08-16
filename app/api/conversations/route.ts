import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Match from '@/models/Match';
import Profile from '@/models/Profile';
import { SEED_MATCHES, INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const conn = await connectToDatabase();
    if (conn) {
      const matches = await Match.find({ users: userId, active: true })
        .sort({ updatedAt: -1 })
        .lean();

      if (matches && matches.length > 0) {
        const otherUserIds = matches.map((m: any) =>
          m.users.find((u: any) => u.toString() !== userId)
        );
        const profiles = await Profile.find({ userId: { $in: otherUserIds } }).lean();

        const formatted = matches.map((m: any) => {
          const otherId = m.users.find((u: any) => u.toString() !== userId)?.toString();
          const prof = profiles.find((p: any) => p.userId.toString() === otherId);
          return {
            _id: m._id.toString(),
            matchId: m._id.toString(),
            participants: m.users.map((u: any) => u.toString()),
            lastMessage: m.lastMessage,
            lastMessageAt: m.lastMessageAt ? m.lastMessageAt.toISOString() : undefined,
            updatedAt: m.updatedAt.toISOString(),
            otherProfile: prof,
          };
        });

        return NextResponse.json({ conversations: formatted });
      }
    }

    return NextResponse.json({
      conversations: SEED_MATCHES.map((m) => ({
        _id: m._id,
        matchId: m._id,
        participants: m.users,
        lastMessage: m.lastMessage,
        lastMessageAt: m.lastMessageAt,
        updatedAt: m.matchedAt,
        otherProfile: m.otherProfile,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
