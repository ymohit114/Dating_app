import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { INITIAL_CURRENT_PROFILE } from '@/utils/seedData';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const conn = await connectToDatabase();
  if (conn && userId) {
    try {
      const profile = await Profile.findOne({ userId });
      if (profile) return NextResponse.json({ profile });
    } catch (e) {
      console.warn('DB Profile error:', e);
    }
  }

  return NextResponse.json({ profile: INITIAL_CURRENT_PROFILE });
}

export async function PUT(req: Request) {
  const authUser = extractAuthUser(req);
  const updates = await req.json();

  const conn = await connectToDatabase();
  if (conn && authUser?.userId) {
    try {
      const updated = await Profile.findOneAndUpdate(
        { userId: authUser.userId },
        { $set: updates },
        { new: true, upsert: true }
      );
      return NextResponse.json({ profile: updated });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    profile: {
      ...INITIAL_CURRENT_PROFILE,
      ...updates,
    },
  });
}
