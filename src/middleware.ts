import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected application route prefixes requiring server-side authentication
const PROTECTED_PREFIXES = [
  '/properties',
  '/property',
  '/admin',
  '/leasing',
  '/ops',
  '/operate',
  '/vendor',
  '/tenant',
  '/reporting',
  '/reports',
  '/compliance',
  '/crm',
  '/inventory',
  '/facility',
  '/insights',
  '/workspaces'
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // 1. Canonical Domain Redirection (Production)
  if (host === 'office-x-black.vercel.app') {
    const canonicalUrl = new URL(pathname + search, 'https://www.officex.pro');
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // 2. Auth Cookie Verification
  const authCookie = request.cookies.get('officex_auth')?.value;
  const isAuthenticated = !!authCookie && authCookie !== '0' && authCookie !== '';

  // Check if current route requires authentication
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If attempting to access protected route without valid session
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect directly to requested target or dashboard
  if (pathname === '/login' && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetUrl = redirectParam && redirectParam.startsWith('/')
      ? new URL(redirectParam, request.url)
      : new URL('/properties', request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Pass through with security response headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, svg, png, jpg, etc.)
     * - api routes (handled independently)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
