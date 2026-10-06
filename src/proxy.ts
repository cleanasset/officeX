import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
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

  // Redirect legacy /rent-roll directly to the Rent Roll SaaS landing page
  if (pathname === '/rent-roll' || pathname.startsWith('/rent-roll/')) {
    return NextResponse.redirect(new URL('/operate/rent-roll', request.url));
  }

  // Allow dedicated Rent Roll 2.0 status page through (no dashboard access)
  if (pathname === '/properties/rent-roll' || pathname.startsWith('/properties/rent-roll/')) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }

  // Redirect other legacy dashboard/portal routes directly to the Operate SaaS hub page
  if (
    pathname.startsWith('/properties') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/operate', request.url));
  }

  // All pages (marketing, SaaS modules, APIs, public) pass through directly
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
