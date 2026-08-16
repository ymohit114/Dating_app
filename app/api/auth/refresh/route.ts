import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, setAuthCookies } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    let token: string | undefined;

    // Check Authorization Bearer header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check cookie
    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const parsed = Object.fromEntries(
          cookieHeader.split(';').map((c) => {
            const [key, ...v] = c.trim().split('=');
            return [key, decodeURIComponent(v.join('='))];
          })
        );
        token = parsed.elance_refresh_token;
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      isEmailVerified: payload.isEmailVerified,
    });

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });

    // Update access cookie
    const isProd = process.env.NODE_ENV === 'production';
    response.headers.append(
      'Set-Cookie',
      `elance_access_token=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900${isProd ? '; Secure' : ''}`
    );

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Token refresh failed' }, { status: 500 });
  }
}
