import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OfficeX Server-Side Route Protection Middleware
 * Enforces authentication at the edge before any page or API route is served.
 * Cookie `officex_auth` is HttpOnly — cannot be spoofed from client-side JS.
 */

// ─── Public pages (no auth required) ────────────────────────────────────────
const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/about',
  '/careers',
  '/contact',
  '/demo',
  '/faq',
  '/pricing',
  '/privacy',
  '/terms',
  '/security',
  '/support',
  '/thank-you',
  '/platform',
  '/invite',
  '/onboarding',
  '/discover',
  '/list-space',
  '/fm-marketplace',
  '/calq',
  '/admin/login',
]);

const PUBLIC_PATH_PREFIXES = [
  '/public/',
  '/marketplace',
  '/coworking-space',
  '/managed-office',
  '/virtual-office',
  '/day-pass',
  '/audiences/',
  '/resources/',
  '/vendor/register',
  '/vendor/quote',
];

// ─── Public API routes ──────────────────────────────────────────────────────
const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/marketplace/listings',
  '/api/marketplace/detect-location',
  '/api/marketplace/enquiries',
  '/api/marketplace/list-space',
  '/api/geocode',
  '/api/verify-gst',
  '/api/pricing',
  '/api/v1/auth/',
  '/api/session',
  '/api/subscription/coupons/validate',
  '/api/subscription/owner-check',
  '/api/subscription/status',
  '/api/vc/coupon',
  '/api/vc/subscription',
  '/api/portal/',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function isPublicApiPath(pathname: string): boolean {
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/templates/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.map')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 2. Always allow public pages and public API routes
  if (isPublicPath(pathname) || isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // 3. Read the HttpOnly auth cookie (set by server on login)
  const authCookie = request.cookies.get('officex_auth');
  const isAuth = authCookie?.value === '1';

  // 4. Admin pages: require auth + admin role
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const roleCookie = request.cookies.get('officex_role');
    const adminCookie = request.cookies.get('officex_admin');
    const isAdmin = roleCookie?.value === 'super_admin' || adminCookie?.value === '1';

    if (!isAuth || !isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Admin API routes: require auth + admin role (return 401 JSON)
  if (pathname.startsWith('/api/admin')) {
    const roleCookie = request.cookies.get('officex_role');
    const adminCookie = request.cookies.get('officex_admin');
    const isAdmin = roleCookie?.value === 'super_admin' || adminCookie?.value === '1';

    if (!isAuth || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 6. Protected API routes: require auth
  if (pathname.startsWith('/api/')) {
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to access this resource.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 7. Protected app pages: require auth, redirect to login
  if (!isAuth) {
    // Don't redirect cron or webhook-type routes
    if (pathname.startsWith('/api/cron')) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

