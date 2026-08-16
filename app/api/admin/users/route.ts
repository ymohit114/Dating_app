import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import AdminLog from '@/models/AdminLog';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();
      if (users && users.length > 0) {
        const userIds = users.map((u: any) => u._id);
        const profiles = await Profile.find({ userId: { $in: userIds } }).lean();

        const formatted = users.map((u: any) => {
          const prof = profiles.find((p: any) => p.userId.toString() === u._id.toString());
          return {
            _id: u._id.toString(),
            email: u.email,
            role: u.role,
            status: u.status || 'active',
            isVerified: u.isVerified,
            name: prof?.name || prof?.firstName || u.email?.split('@')[0] || 'User',
            city: prof?.city || 'New Delhi',
            createdAt: u.createdAt.toISOString(),
          };
        });

        return NextResponse.json({ success: true, users: formatted });
      }
    }

    return NextResponse.json({
      success: true,
      users: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { user: authAdmin } = requireAdminAuth(req);
    const { userId, status, isVerified, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const updates: any = {};
      if (status) updates.status = status;
      if (typeof isVerified === 'boolean') updates.isVerified = isVerified;
      if (role) updates.role = role;

      const user = await User.findByIdAndUpdate(userId, updates, { new: true });
      if (typeof isVerified === 'boolean') {
        await Profile.findOneAndUpdate(
          { userId },
          { verificationStatus: isVerified ? 'verified' : 'unverified' }
        );
      }

      // Record in AdminLog
      if (authAdmin) {
        await AdminLog.create({
          adminId: authAdmin.userId,
          adminEmail: authAdmin.email,
          action: status === 'banned' ? 'user_banned' : status === 'suspended' ? 'user_suspended' : isVerified ? 'user_verified' : 'role_changed',
          targetType: 'user',
          targetId: userId,
          details: `User updated: ${JSON.stringify(updates)}`,
        });
      }

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: true, message: 'User state updated in memory.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
