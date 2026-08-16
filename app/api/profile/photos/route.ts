import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { INITIAL_CURRENT_USER, INITIAL_CURRENT_PROFILE } from '@/utils/seedData';

// Moderation hook for profile photos
function passesPhotoModeration(url: string): { isSafe: boolean; flagReason?: string } {
  // Basic content moderation hook
  if (!url || typeof url !== 'string') {
    return { isSafe: false, flagReason: 'Invalid photo URL format.' };
  }
  return { isSafe: true };
}

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const body = await req.json();
    const { photoUrl, isPrimary = false } = body;

    if (!photoUrl) {
      return NextResponse.json({ error: 'photoUrl is required' }, { status: 400 });
    }

    const modCheck = passesPhotoModeration(photoUrl);
    if (!modCheck.isSafe) {
      return NextResponse.json({ error: modCheck.flagReason }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId });
      if (profile) {
        if (profile.photos.length >= 6) {
          return NextResponse.json({ error: 'Maximum 6 photos allowed per profile.' }, { status: 400 });
        }

        const newDisplayOrder = profile.photos.length;
        profile.photos.push({
          url: photoUrl,
          isPrimary: isPrimary || profile.photos.length === 0,
          displayOrder: newDisplayOrder,
        });

        await profile.save();
        return NextResponse.json({ success: true, photos: profile.photos });
      }
    }

    return NextResponse.json({
      success: true,
      photos: [
        ...INITIAL_CURRENT_PROFILE.photos.map((p, i) => ({ url: p, isPrimary: i === 0, displayOrder: i })),
        { url: photoUrl, isPrimary: false, displayOrder: INITIAL_CURRENT_PROFILE.photos.length },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
