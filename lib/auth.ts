import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'elance_access_secret_key_2026_modern';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'elance_refresh_secret_key_2026_long_lived';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  isEmailVerified?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12); // Cost factor 12 as per specification
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload as object, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload as object, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function extractAuthUser(req: Request): TokenPayload | null {
  // 1. Check Bearer Authorization header (for Flutter Mobile App / Postman)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const verified = verifyAccessToken(token);
    if (verified) return verified;
  }

  // 2. Check httpOnly Cookie (for Web Application)
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const parsed = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );
    if (parsed.elance_access_token) {
      const verified = verifyAccessToken(parsed.elance_access_token);
      if (verified) return verified;
    }
  }

  return null;
}

export function setAuthCookies(resHeaders: Headers, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Set Access Token (15m, httpOnly)
  resHeaders.append(
    'Set-Cookie',
    `elance_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900${isProd ? '; Secure' : ''}`
  );

  // Set Refresh Token (7d, httpOnly)
  resHeaders.append(
    'Set-Cookie',
    `elance_refresh_token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`
  );
}

export function clearAuthCookies(resHeaders: Headers) {
  resHeaders.append('Set-Cookie', 'elance_access_token=; Path=/; HttpOnly; Max-Age=0');
  resHeaders.append('Set-Cookie', 'elance_refresh_token=; Path=/; HttpOnly; Max-Age=0');
}

export function requireAdminAuth(
  req: Request,
  allowedRoles: ('moderator' | 'admin' | 'superadmin')[] = ['moderator', 'admin', 'superadmin']
): { user: TokenPayload | null; errorResponse: Response | null } {
  const authUser = extractAuthUser(req);
  if (!authUser) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  if (!allowedRoles.includes(authUser.role as any)) {
    return {
      user: null,
      errorResponse: new Response(
        JSON.stringify({ error: 'Forbidden: Insufficient administrative privileges.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { user: authUser, errorResponse: null };
}

