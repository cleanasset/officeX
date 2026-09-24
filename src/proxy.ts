import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRedirect } from '@/lib/auth-utils';

const protectedPaths = [
  '/properties',
  '/property',
  '/portfolio',
  '/ops',
  '/operations',
  '/tenant',
  '/vendor',
  '/admin',
  '/leasing',
  '/reporting',
  '/reports',
  '/dashboard',
  '/discover',
  '/app',
  '/compliance'
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.hostname ||
    '';

  // Canonical domain enforcement: Redirect staging Vercel domain to production canonical domain
  if (host.includes('office-x-black.vercel.app')) {
    const canonicalUrl = new URL(`https://officex.pro${pathname}${search}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // Explicitly allow all public marketing, audience, auth, and discovery routes
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/tenant/join') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/api') ||
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
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/thank-you') ||
    pathname.startsWith('/calq')
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

  const requestHeaders = new Headers(request.headers);
  const fullTarget = search ? `${pathname}${search}` : pathname;
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-search', search);
  requestHeaders.set('x-url', fullTarget);

  if (!hasAuth) {
    const loginUrl = new URL('/login', request.url);
    const safeRedirect = validateRedirect(fullTarget, '/properties');
    loginUrl.searchParams.set('redirect', safeRedirect);

    // Automatically infer and attach the domain login context
    if (pathname.startsWith('/properties/rent-roll') || safeRedirect.includes('rent-roll')) {
      loginUrl.searchParams.set('context', 'rent-roll');
    } else if (pathname.startsWith('/ops') || pathname.startsWith('/operations') || safeRedirect.includes('operate')) {
      loginUrl.searchParams.set('context', 'operate');
    } else if (pathname.startsWith('/vendor') || safeRedirect.includes('fm')) {
      loginUrl.searchParams.set('context', 'fm');
    } else if (pathname.startsWith('/leasing') || pathname.startsWith('/marketplace') || safeRedirect.includes('marketplace')) {
      loginUrl.searchParams.set('context', 'marketplace');
    } else if (pathname.startsWith('/properties')) {
      loginUrl.searchParams.set('context', 'properties');
    }

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export default proxy;

