import { IReport } from '@/types';
import { SEED_REPORTS } from '@/utils/seedData';
import connectToDatabase from '@/lib/mongodb';
import Report from '@/models/Report';
import Block from '@/models/Block';
import User from '@/models/User';
import AdminLog from '@/models/AdminLog';

const BANNED_KEYWORDS = [
  'scam', 'crypto investment', 'whatsapp me for fun', 'free cash', 'paypal me', 'send money'
];

export async function checkContentModeration(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  const lower = text.toLowerCase();
  for (const word of BANNED_KEYWORDS) {
    if (lower.includes(word)) {
      return { isSafe: false, reason: `Contains flagged commercial or spam keyword: "${word}"` };
    }
  }
  return { isSafe: true };
}

export async function createReport(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  description?: string
) {
  const conn = await connectToDatabase();
  if (conn) {
    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason,
      description,
      status: 'pending',
    });
    return report;
  }
  return {
    _id: `rep_${Date.now()}`,
    reporterId,
    reportedUserId,
    reason,
    description,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export async function blockUser(blockerId: string, blockedUserId: string) {
  const conn = await connectToDatabase();
  if (conn) {
    await Block.findOneAndUpdate(
      { blockerId, blockedId: blockedUserId },
      { blockerId, blockedId: blockedUserId },
      { upsert: true, new: true }
    );
    return true;
  }
  return true;
}

export async function unblockUser(blockerId: string, blockedUserId: string) {
  const conn = await connectToDatabase();
  if (conn) {
    await Block.findOneAndDelete({ blockerId, blockedId: blockedUserId });
    return true;
  }
  return true;
}

export async function getReportsList(): Promise<IReport[]> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const reports = await Report.find()
        .sort({ createdAt: -1 })
        .lean();
      if (reports && reports.length > 0) {
        return reports.map((r: any) => ({
          _id: r._id.toString(),
          reporterId: r.reporterId.toString(),
          reportedUserId: r.reportedUserId.toString(),
          reason: r.reason,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (e) {
      console.warn('DB Reports error, using seed reports:', e);
    }
  }
  return SEED_REPORTS;
}

export async function resolveReport(
  adminId: string,
  reportId: string,
  action: 'ban' | 'dismiss' | 'warn' | 'resolved'
): Promise<boolean> {
  const conn = await connectToDatabase();
  if (conn) {
    try {
      const report = await Report.findById(reportId);
      if (report) {
        report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
        await report.save();

        if (action === 'ban') {
          await User.findByIdAndUpdate(report.reportedUserId, { status: 'banned' });
        }

        // Audit Log entry
        await AdminLog.create({
          adminId,
          action: action === 'dismiss' ? 'report_dismissed' : 'report_resolved',
          targetType: 'report',
          targetId: reportId,
          details: `Report resolved with action: ${action}`,
        });

        return true;
      }
    } catch (e) {
      console.warn('DB resolve report error:', e);
    }
  }
  return true;
}
