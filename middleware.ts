import { NextResponse, type NextRequest } from 'next/server';
import { isAuthorizedAdminDevice } from '@/lib/deviceLock';

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
  
  // Extract access token from httpOnly cookie or Bearer header
  let token = request.cookies.get('elance_access_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Base security response headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ── 0. HARDWARE DEVICE LOCKDOWN FOR ADMIN ──────────────────────────────────
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminRoute) {
    const isThisLaptop = isAuthorizedAdminDevice(request);
    if (!isThisLaptop) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Security Exception: This device is not authorized to access the Admin Console.' },
          { status: 403 }
        );
      }
      // On other devices, completely hide the admin panel (404 Not Found)
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  // 1. Admin API Route Protection (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const payload = token ? decodeJwtPayload(token) : null;
    const hasAdminRole = payload && ['moderator', 'admin', 'superadmin'].includes(payload.role || '');

    if (!token || !payload || !hasAdminRole) {
      return NextResponse.json(
        { error: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }
    return response;
  }

  // 2. Admin UI Protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const payload = token ? decodeJwtPayload(token) : null;
    const hasAdminRole = payload && ['moderator', 'admin', 'superadmin'].includes(payload.role || '');

    if (isLoginPage) {
      if (hasAdminRole) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return response;
    }

    if (!token || !payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasAdminRole) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'insufficient_privileges');
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 3. User Private Page Protection
  const protectedUserRoutes = ['/profile', '/discover', '/likes', '/matches', '/chat', '/settings', '/onboarding'];
  const isProtectedUserRoute = protectedUserRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtectedUserRoute) {
    const payload = token ? decodeJwtPayload(token) : null;
    if (!token || !payload || !payload.userId) {
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
