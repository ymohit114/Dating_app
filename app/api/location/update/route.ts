import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { locationUpdateSchema } from '@/lib/validations';
import { INITIAL_CURRENT_USER, INITIAL_CURRENT_PROFILE } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;

    const body = await req.json();
    const validated = locationUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Invalid coordinates' },
        { status: 400 }
      );
    }

    const { latitude, longitude } = validated.data;

    const conn = await connectToDatabase();
    if (conn) {
      // MongoDB GeoJSON Point coordinates format: [longitude, latitude]
      await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        },
        { upsert: false }
      );
    } else {
      INITIAL_CURRENT_PROFILE.location.coordinates = [longitude, latitude];
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated securely.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
