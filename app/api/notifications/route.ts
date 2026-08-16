import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { notificationService } from '@/services/notification.service';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const notifications = notificationService.getUserNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const { notificationId } = await req.json();

    if (notificationId) {
      notificationService.markAsRead(userId, notificationId);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
