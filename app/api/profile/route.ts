import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { profileSchema } from '@/lib/validations';
import { sanitizeMongoInput, sanitizeHtmlText } from '@/lib/security';

export async function GET(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId: authUser.userId }).lean();
      if (profile) return NextResponse.json({ profile });
    }

    return NextResponse.json({ profile: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const rawBody = await req.json();
    const body = sanitizeMongoInput(rawBody);

    // Sanitize string fields against XSS
    if (body.bio) body.bio = sanitizeHtmlText(body.bio);
    if (body.name) body.name = sanitizeHtmlText(body.name);
    if (body.firstName) body.firstName = sanitizeHtmlText(body.firstName);
    if (body.job) body.job = sanitizeHtmlText(body.job);
    if (body.occupation) body.occupation = sanitizeHtmlText(body.occupation);
    if (body.school) body.school = sanitizeHtmlText(body.school);
    if (body.education) body.education = sanitizeHtmlText(body.education);
    if (body.company) body.company = sanitizeHtmlText(body.company);

    const validated = profileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Invalid profile data' },
        { status: 400 }
      );
    }

    const updates = validated.data;
    const conn = await connectToDatabase();

    if (conn) {
      const updated = await Profile.findOneAndUpdate(
        { userId: authUser.userId },
        {
          $set: {
            ...updates,
            isProfileComplete: true,
          },
        },
        { new: true, upsert: true }
      );
      return NextResponse.json({ success: true, profile: updated });
    }

    return NextResponse.json({
      success: true,
      profile: {
        _id: `prof_${authUser.userId}`,
        userId: authUser.userId,
        ...updates,
        isProfileComplete: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
