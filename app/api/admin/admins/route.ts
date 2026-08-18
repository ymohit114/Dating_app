import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);

    const conn = await connectToDatabase();
    if (conn) {
      const admins = await User.find({
        role: { $in: ['superadmin', 'admin', 'moderator'] },
      })
        .sort({ createdAt: 1 })
        .lean();

      const formatted = (admins || []).map((a: any) => ({
        id: a._id.toString(),
        email: a.email,
        role: a.role,
        status: a.status || 'active',
        lastLogin: a.updatedAt ? new Date(a.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Active',
      }));

      return NextResponse.json({ success: true, admins: formatted });
    }

    return NextResponse.json({
      success: true,
      admins: [
        {
          id: 'user_admin_mohit',
          email: 'mohit@gmail.com',
          role: 'superadmin',
          status: 'active',
          lastLogin: 'Active',
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
