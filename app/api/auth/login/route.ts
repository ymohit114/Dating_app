import { NextResponse } from 'next/server';
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { loginSchema } from '@/lib/validations';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const { email, password } = validated.data;
    const cleanEmail = email.toLowerCase().trim();
    const isSuperAdminEmail = cleanEmail === 'mohit@gmail.com' || cleanEmail === 'mohit@gmai.com';
    const isAdminEmail = isSuperAdminEmail || cleanEmail.includes('admin');

    const conn = await connectToDatabase();

    if (conn) {
      let user = await User.findOne({ email: cleanEmail });

      if (!user && isSuperAdminEmail) {
        // Auto-provision Superadmin on first login if not yet in database
        const passwordHash = await hashPassword(password);
        user = await User.create({
          email: cleanEmail,
          passwordHash,
          role: 'superadmin',
          status: 'active',
          isEmailVerified: true,
        });
      }

      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (user.status === 'banned' || user.status === 'suspended') {
        return NextResponse.json(
          { error: 'This account has been suspended for safety policy violations.' },
          { status: 403 }
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Ensure superadmin has correct role
      if (isSuperAdminEmail && user.role !== 'superadmin') {
        user.role = 'superadmin';
        await user.save();
      }

      const profile = await Profile.findOne({ userId: user._id });

      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      };

      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);

      const response = NextResponse.json({
        success: true,
        user: {
          _id: user._id.toString(),
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
        profile: profile || null,
        accessToken,
      });

      setAuthCookies(response.headers, accessToken, refreshToken);
      return response;
    }

    // Standalone fallback
    const payload = {
      userId: isSuperAdminEmail ? 'user_superadmin_01' : `user_${Date.now()}`,
      email: cleanEmail,
      role: isSuperAdminEmail ? ('superadmin' as const) : isAdminEmail ? ('admin' as const) : ('user' as const),
      isEmailVerified: true,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        _id: payload.userId,
        email: cleanEmail,
        role: payload.role,
        status: 'active',
        isEmailVerified: true,
      },
      profile: null,
      accessToken,
    });

    setAuthCookies(response.headers, accessToken, refreshToken);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 500 });
  }
}
