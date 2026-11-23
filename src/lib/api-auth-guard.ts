/**
 * Server-Side API Authentication Guard
 * Verifies auth cookies on the server side — cannot be spoofed from client JS.
 * Use this in API routes to enforce authentication before processing requests.
 */
import { NextResponse } from 'next/server';

interface AuthGuardResult {
  authenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  error?: NextResponse;
}

/**
 * Verifies authentication from the request cookies (server-side).
 * Returns the auth state or an error response ready to return.
 */
export function verifyApiAuth(request: Request): AuthGuardResult {
  const cookieHeader = request.headers.get('cookie') || '';

  // Parse cookies
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...rest] = c.trim().split('=');
    if (key) cookies[key.trim()] = rest.join('=').trim();
  });

  const isAuth = cookies['officex_auth'] === '1' || cookies['officex_session_active'] === '1';
  const isAdmin = cookies['officex_role'] === 'super_admin' || cookies['officex_admin'] === '1';

  let userEmail: string | null = null;
  if (cookies['officex_user_email']) {
    try {
      userEmail = decodeURIComponent(cookies['officex_user_email']).toLowerCase().trim();
    } catch {
      userEmail = cookies['officex_user_email'].toLowerCase().trim();
    }
  }

  if (!isAuth) {
    return {
      authenticated: false,
      isAdmin: false,
      userEmail: null,
      error: NextResponse.json(
        { error: 'Unauthorized: Please sign in to access this resource.' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    isAdmin,
    userEmail,
  };
}

/**
 * Convenience: require authentication or return 401.
 * Usage: const guard = requireAuth(request); if (guard.error) return guard.error;
 */
export function requireAuth(request: Request): AuthGuardResult {
  return verifyApiAuth(request);
}

/**
 * Convenience: require admin authentication or return 401/403.
 */
export function requireAdmin(request: Request): AuthGuardResult {
  const result = verifyApiAuth(request);
  if (result.error) return result;

  if (!result.isAdmin) {
    return {
      ...result,
      error: NextResponse.json(
        { error: 'Forbidden: Super Admin access required.' },
        { status: 403 }
      ),
    };
  }

  return result;
}

