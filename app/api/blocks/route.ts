import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Block from '@/models/Block';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const blockerId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const { blockedUserId } = await req.json();

    if (!blockedUserId) {
      return NextResponse.json({ error: 'blockedUserId is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      await Block.findOneAndUpdate(
        { blockerId, blockedUserId },
        { blockerId, blockedUserId },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'User blocked successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
