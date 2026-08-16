import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { processSwipeAction } from '@/services/matching.service';
import { discoverActionSchema } from '@/lib/validations';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const fromUserId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const body = await req.json();
    const validated = discoverActionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }

    const { targetUserId, action } = validated.data;
    const result = await processSwipeAction(fromUserId, targetUserId, action);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Swipe action failed' }, { status: 500 });
  }
}
