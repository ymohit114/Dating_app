import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Match from '@/models/Match';
import Message from '@/models/Message';
import Report from '@/models/Report';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = requireAdminAuth(req);

    const conn = await connectToDatabase();
    if (conn) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersWeek,
        totalMatches,
        matchesToday,
        totalMessages,
        messagesToday,
        pendingReports,
        suspendedUsers,
        bannedUsers,
        allUsers,
        allMatches,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({ createdAt: { $gte: startOfToday } }),
        User.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Match.countDocuments({ status: 'active' }),
        Match.countDocuments({ matchedAt: { $gte: startOfToday } }),
        Message.countDocuments(),
        Message.countDocuments({ createdAt: { $gte: startOfToday } }),
        Report.countDocuments({ status: 'pending' }),
        User.countDocuments({ status: 'suspended' }),
        User.countDocuments({ status: 'banned' }),
        User.find({ createdAt: { $gte: startOfWeek } }).select('createdAt').lean(),
        Match.find({ createdAt: { $gte: startOfWeek } }).select('createdAt matchedAt').lean(),
      ]);

      // Calculate real daily 7-day breakdown
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days: { day: string; dateStr: string; signups: number; matches: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const dayLabel = dayNames[d.getDay()];

        const daySignups = allUsers.filter((u: any) => {
          const c = new Date(u.createdAt);
          return c >= dayStart && c <= dayEnd;
        }).length;

        const dayMatches = allMatches.filter((m: any) => {
          const c = new Date(m.matchedAt || m.createdAt);
          return c >= dayStart && c <= dayEnd;
        }).length;

        last7Days.push({
          day: dayLabel,
          dateStr: dayStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          signups: daySignups,
          matches: dayMatches,
        });
      }

      return NextResponse.json({
        success: true,
        metrics: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsersToday: newUsersToday || 0,
          newUsersWeek: newUsersWeek || 0,
          totalMatches: totalMatches || 0,
          matchesToday: matchesToday || 0,
          totalMessages: totalMessages || 0,
          messagesToday: messagesToday || 0,
          pendingReports: pendingReports || 0,
          suspendedUsers: suspendedUsers || 0,
          bannedUsers: bannedUsers || 0,
          premiumUsers: 0,
          revenue: 0,
        },
        chartData: last7Days,
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newUsersWeek: 0,
        totalMatches: 0,
        matchesToday: 0,
        totalMessages: 0,
        messagesToday: 0,
        pendingReports: 0,
        suspendedUsers: 0,
        bannedUsers: 0,
        premiumUsers: 0,
        revenue: 0,
      },
      chartData: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
