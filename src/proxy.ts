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

  // Redirect legacy /rent-roll directly to the Rent Roll master page
  if (pathname === '/rent-roll' || pathname.startsWith('/rent-roll/')) {
    return NextResponse.redirect(new URL('/properties/rent-roll', request.url));
  }

  // All pages (marketing, SaaS modules, APIs, properties, portal, public) pass through directly
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
