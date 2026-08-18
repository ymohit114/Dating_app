import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdminLog from '@/models/AdminLog';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);

    const conn = await connectToDatabase();
    if (conn) {
      const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100).lean();
      const formatted = (logs || []).map((l: any) => ({
        id: l._id.toString(),
        admin: l.adminEmail || 'System Admin',
        action: (l.action || 'ADMIN_ACTION').toUpperCase(),
        target: l.targetId || l.targetType || 'system',
        ip: l.ipAddress || '127.0.0.1',
        time: l.createdAt ? new Date(l.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }) : new Date().toLocaleString(),
        details: l.details || l.action,
      }));
      return NextResponse.json({ success: true, logs: formatted });
    }

    return NextResponse.json({ success: true, logs: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
