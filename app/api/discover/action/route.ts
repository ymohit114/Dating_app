import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { processSwipeAction } from '@/services/matching.service';
import { discoverActionSchema } from '@/lib/validations';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';
import { swipeRateLimiter, getClientIp, createRateLimitResponse } from '@/lib/rateLimit';
import { sanitizeMongoInput } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const fromUserId = authUser?.userId || INITIAL_CURRENT_USER._id;

    // 1. Rate Limiting (60 swipes per minute per user/IP)
    const rateKey = authUser?.userId ? `user_${authUser.userId}` : getClientIp(req);
    const rateCheck = swipeRateLimiter.check(rateKey);
    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.resetMs, 'You are swiping too fast. Please slow down.');
    }

    const rawBody = await req.json();
    const body = sanitizeMongoInput(rawBody);
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
