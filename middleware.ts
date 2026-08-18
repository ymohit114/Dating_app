import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_SECRET_KEY = 'mohit_laptop_access_2026';
const ADMIN_DEVICE_COOKIE = 'elance_laptop_cert';

function decodeJwtPayload(token: string): { userId?: string; email?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null; // Expired
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract access token from cookie or Bearer header
  let token = request.cookies.get('elance_access_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const payload = token ? decodeJwtPayload(token) : null;
  const hasAdminRole = Boolean(payload && ['moderator', 'admin', 'superadmin'].includes(payload.role || ''));

  // Base security response headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Check for unlock query key and stamp persistent cookie
  const queryKey = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('secret') || request.nextUrl.searchParams.get('unlock');
  if (queryKey === ADMIN_SECRET_KEY) {
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set(ADMIN_DEVICE_COOKIE, ADMIN_SECRET_KEY, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
    });
  }

  // 1. Admin API Protection (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }
    return response;
  }

  // 2. Admin UI Protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Always serve the admin login page
    if (pathname === '/admin/login') {
      return response;
    }

    // Require active admin login for any other admin screen
    if (!hasAdminRole) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // 3. User Private Page Protection
  const protectedUserRoutes = ['/profile', '/discover', '/likes', '/matches', '/chat', '/settings', '/onboarding'];
  const isProtectedUserRoute = protectedUserRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtectedUserRoute) {
    if (!payload || !payload.userId) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
