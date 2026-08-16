import { NextResponse, type NextRequest } from 'next/server';

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
  const token = request.cookies.get('elance_access_token')?.value;

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 1. Admin Area Protection
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

    // Any other /admin route requires active admin authorization
    if (!token || !payload) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!hasAdminRole) {
      // Regular user trying to access admin panel
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'insufficient_privileges');
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Private User Routes Protection
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
