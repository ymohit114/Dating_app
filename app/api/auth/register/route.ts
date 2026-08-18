import { NextResponse } from 'next/server';
import { hashPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { registerSchema } from '@/lib/validations';
import { authRateLimiter, getClientIp, createRateLimitResponse } from '@/lib/rateLimit';
import { sanitizeMongoInput, sanitizeHtmlText, normalizeEmail } from '@/lib/security';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (Account creation throttling)
    const clientIp = getClientIp(req);
    const rateCheck = authRateLimiter.check(clientIp);
    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.resetMs, 'Too many registration attempts. Please try again later.');
    }

    const rawBody = await req.json();
    const body = sanitizeMongoInput(rawBody);
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { firstName, name, email, password, dateOfBirth, gender } = validated.data;
    const cleanEmail = normalizeEmail(email);
    const displayName = sanitizeHtmlText((name || firstName).trim());

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
        firstName: displayName,
        name: displayName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        interestedIn: gender === 'man' ? ['women'] : ['men'],
        photos: [],
        bio: '',
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
      _id: `prof_${Date.now()}`,
      userId: simulatedUserId,
      firstName: displayName,
      name: displayName,
      gender,
      photos: [],
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
