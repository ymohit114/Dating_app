import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Report from '@/models/Report';
import { getReportsList, resolveReport } from '@/services/moderation.service';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function GET(req: Request) {
  try {
    const reports = await getReportsList();
    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const reporterId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const { reportedUserId, reason, description } = await req.json();

    if (!reportedUserId || !reason) {
      return NextResponse.json({ error: 'reportedUserId and reason are required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const newReport = await Report.create({
        reporterId,
        reportedUserId,
        reason,
        description,
        status: 'pending',
      });
      return NextResponse.json({ report: newReport });
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully for safety moderation review.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { reportId, action } = await req.json();
    const authAdmin = extractAuthUser(req);
    const adminId = authAdmin?.userId || 'admin_sys_01';
    const success = await resolveReport(adminId, reportId, action);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
