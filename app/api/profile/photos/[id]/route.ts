import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { INITIAL_CURRENT_USER, INITIAL_CURRENT_PROFILE } from '@/utils/seedData';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const photoIndex = Number(params.id);

    const conn = await connectToDatabase();
    if (conn) {
      const profile = await Profile.findOne({ userId });
      if (profile && !isNaN(photoIndex)) {
        profile.photos.splice(photoIndex, 1);
        await profile.save();
        return NextResponse.json({ photos: profile.photos });
      }
    }

    return NextResponse.json({ success: true, photos: INITIAL_CURRENT_PROFILE.photos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
