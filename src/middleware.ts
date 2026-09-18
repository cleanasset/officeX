import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRedirect } from '@/lib/auth-utils';

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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Canonical domain enforcement: Redirect staging Vercel domain to production canonical domain
  if (host.includes('office-x-black.vercel.app')) {
    const canonicalUrl = new URL(`https://officex.pro${pathname}${search}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // Explicitly allow all public marketing, audience, auth, and discovery routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
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
    pathname.startsWith('/resources') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy')
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
    // Sanitize redirect target to ensure it is internal relative path
    const safeRedirect = validateRedirect(pathname, '/properties');
    loginUrl.searchParams.set('redirect', safeRedirect);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

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

export default middleware;
