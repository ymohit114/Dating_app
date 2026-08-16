import { NextResponse } from 'next/server';
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { registerSchema } from '@/lib/validations';
import { INITIAL_CURRENT_PROFILE } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { firstName, email, password, dateOfBirth, gender } = validated.data;
    const conn = await connectToDatabase();

    if (conn) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password with bcrypt cost factor 12
      const passwordHash = await hashPassword(password);
      const newUser = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        role: 'user',
        status: 'active',
        isEmailVerified: false,
      });

      const newProfile = await Profile.create({
        userId: newUser._id,
        firstName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        interestedIn: gender === 'man' ? ['women'] : ['men'],
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
            isPrimary: true,
            displayOrder: 0,
          },
        ],
        bio: 'Hello! I am new on Elance.',
        city: 'New Delhi',
        country: 'India',
        relationshipGoal: 'Long-term',
        interests: ['Coffee', 'Travel'],
        isProfileComplete: false,
        verificationStatus: 'unverified',
      });

      const payload = {
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      };

      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);

      const response = NextResponse.json({
        success: true,
        user: {
          _id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          isEmailVerified: newUser.isEmailVerified,
        },
        profile: newProfile,
        accessToken,
      });

      setAuthCookies(response.headers, accessToken, refreshToken);
      return response;
    }

    // Standalone fallback
    const simulatedUserId = `user_${Date.now()}`;
    const payload = {
      userId: simulatedUserId,
      email,
      role: 'user' as const,
      isEmailVerified: false,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const simulatedProfile = {
      ...INITIAL_CURRENT_PROFILE,
      _id: `prof_${Date.now()}`,
      userId: simulatedUserId,
      firstName,
      gender,
      isProfileComplete: false,
    };

    const response = NextResponse.json({
      success: true,
      user: {
        _id: simulatedUserId,
        email,
        role: 'user',
        status: 'active',
        isEmailVerified: false,
      },
      profile: simulatedProfile,
      accessToken,
    });

    setAuthCookies(response.headers, accessToken, refreshToken);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
