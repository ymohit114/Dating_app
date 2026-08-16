import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { extractAuthUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';

export async function GET(req: Request) {
  const authUser = extractAuthUser(req);

  if (!authUser || !authUser.userId) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 });
  }

  const conn = await connectToDatabase();
  if (conn) {
    try {
      let user = null;
      if (mongoose.isValidObjectId(authUser.userId)) {
        user = await User.findById(authUser.userId).select('-passwordHash').lean();
      }
      if (!user && authUser.email) {
        user = await User.findOne({ email: authUser.email.toLowerCase() }).select('-passwordHash').lean();
      }

      if (!user) {
        return NextResponse.json({ user: null, profile: null }, { status: 401 });
      }

      const profile = await Profile.findOne({
        $or: [{ userId: user._id.toString() }, { userId: authUser.userId }],
      }).lean();

      return NextResponse.json({
        user: {
          _id: user._id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
        profile: profile || null,
      });
    } catch (e) {
      console.warn('DB Fetch me error:', e);
      return NextResponse.json({ user: null, profile: null }, { status: 401 });
    }
  }

  // If DB connection is offline but a valid signed JWT was provided
  return NextResponse.json({
    user: {
      _id: authUser.userId,
      email: authUser.email,
      role: authUser.role,
      status: 'active',
      isEmailVerified: authUser.isEmailVerified,
    },
    profile: null,
  });
}
