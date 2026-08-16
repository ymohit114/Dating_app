import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { notificationService } from '@/services/notification.service';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const notificationId = params.id;

    notificationService.markAsRead(userId, notificationId);
    return NextResponse.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
