import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/discover',
  '/operations',
  '/ops',
  '/properties',
  '/property',
  '/portfolio',
  '/reporting',
  '/reports',
  '/tenant',
  '/vendor',
  '/admin',
  '/leasing',
  '/dashboard',
  '/app'
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicitly allow all public marketing, audience, and discovery routes
  if (
    pathname.startsWith('/public') ||
    pathname.startsWith('/marketplace') ||
    pathname.startsWith('/fm-marketplace') ||
    pathname.startsWith('/audiences') ||
    pathname.startsWith('/operate') ||
    pathname.startsWith('/manage') ||
    pathname.startsWith('/intelligence') ||
    pathname.startsWith('/managed-services') ||
    pathname.startsWith('/platform') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/resources')
  ) {
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for authentication in cookies
  const allCookies = request.cookies.getAll();
  const hasAuth = allCookies.some(
    (c) =>
      c.name === 'officex_auth' ||
      c.name === 'sb-access-token' ||
      c.name === 'sb-refresh-token' ||
      c.name.includes('-auth-token') ||
      c.name.startsWith('sb-')
  );

  if (!hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/discover/:path*',
    '/operations/:path*',
    '/ops/:path*',
    '/properties/:path*',
    '/property/:path*',
    '/portfolio/:path*',
    '/reporting/:path*',
    '/reports/:path*',
    '/tenant/:path*',
    '/vendor/:path*',
    '/admin/:path*',
    '/leasing/:path*',
    '/dashboard/:path*',
    '/app/:path*',
  ],
};
