import { clearAuthCookie } from './auth-storage';
import { supabase } from './supabase';

/**
 * Client-Side Authentication and Session Management Utility
 * Provides thorough, atomic session cleanup on logout.
 * IMPORTANT: Only clears auth/session state. User's property data,
 * org name, and onboarding state are preserved so they are instantly
 * available when the user logs back in.
 */

// Keys that represent AUTH/SESSION state — cleared on logout
const AUTH_SESSION_KEYS = [
  'officex_user_email',
  'officex_user_name',
  'officex_user_mobile',
  'officex_user_phone',
  'officex_subscription',
  'officex_session_active',
  'officex_email_verified',
  'officex_phone_verified',
  'officex_auth',
  'officex_user_role',
  'officex_active_portal',
  'officex_dashboard',
  'officex_trusted_device',
  'officex_oauth_context',
  'officex_payment_id',
  'officex_order_id',
];

// Prefixes that indicate auth session cookies (not data caches)
const AUTH_KEY_PREFIXES = ['officex_sub_', 'sb-'];

// Keys that represent USER DATA — only email convenience is preserved across logout
const DATA_KEYS_TO_KEEP = new Set([
  'officex_remembered_email',
]);

function isAuthKey(key: string): boolean {
  if (DATA_KEYS_TO_KEEP.has(key)) return false;
  if (AUTH_SESSION_KEYS.includes(key)) return true;
  for (const prefix of AUTH_KEY_PREFIXES) {
    if (key.startsWith(prefix)) return true;
  }
  // All officex_ data keys (properties, leases, org, etc.) belong to the user session
  // and MUST be purged on logout to guarantee absolute multi-tenant privacy.
  if (key.startsWith('officex_')) {
    return true;
  }
  if (key.includes('token') || key.startsWith('sb-')) return true;
  return false;
}

/**
 * Computes the exact post-logout destination based on current route context.
 * Rule:
 * 1. Rent Roll Dashboard or Rent Roll subpages -> Rent Roll landing page (/operate/rent-roll)
 * 2. Facilities Management / PM Dashboards -> FM Marketplace (/fm-marketplace)
 * 3. Commercial Operate routes -> Operate (/operate)
 * 4. Marketplace routes -> Marketplace (/marketplace)
 * 5. Properties registry or spaces -> Rent Roll landing page (/operate/rent-roll)
 * 6. Protected dashboard routes (/dashboard/owner, etc.) -> Rent Roll landing page (/operate/rent-roll)
 * 7. If currently on a public page (e.g. '/', '/operate/rent-roll', '/marketplace', etc.) -> Stay on that exact page!
 */
export function getLogoutRedirect(currentPath?: string): string {
  if (typeof window === "undefined" && !currentPath) return "/operate/rent-roll";
  const path = currentPath || (typeof window !== "undefined" ? window.location.pathname : "") || "/";

  // 1. Rent Roll Dashboard (/properties/rent-roll, /dashboard/rent-roll, /operate/rent-roll, etc.)
  if (
    path.includes("rent-roll") ||
    path.startsWith("/properties/rent-roll") ||
    path.startsWith("/operate/rent-roll")
  ) {
    return "/operate/rent-roll";
  }

  // 2. Facilities Management / PM Dashboards & FM Marketplace
  if (path.includes("fm-marketplace") || path.includes("/dashboard/pm")) {
    return "/fm-marketplace";
  }

  // 3. Commercial Space Marketplace
  if (path.includes("marketplace")) {
    return "/marketplace";
  }

  // 4. Commercial Operate Hub
  if (path.includes("operate")) {
    return "/operate";
  }

  // 5. Properties registry or spaces
  if (path.startsWith("/properties")) {
    return "/operate/rent-roll";
  }

  // 6. Generic authenticated app routes (e.g. /dashboard/owner, /dashboard, /onboarding, /admin, /settings)
  const isPrivateAppRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/admin") ||
    path.startsWith("/settings");

  if (isPrivateAppRoute) {
    if (typeof window !== "undefined") {
      const savedContext = localStorage.getItem("officex_oauth_context") || sessionStorage.getItem("officex_oauth_context");
      if (savedContext === "fm") return "/fm-marketplace";
      if (savedContext === "marketplace") return "/marketplace";
      if (savedContext === "operate") return "/operate";
    }
    // Default dashboard logout lands on the institutional Rent Roll landing page
    return "/operate/rent-roll";
  }

  // 7. If currently on a public page, stay on that exact page!
  return path || "/";
}

export async function performClientLogout(redirectTo?: string) {
  if (typeof window !== 'undefined') {
    // If redirectTo is omitted, or is a generic default like "/login" or "/", calculate the smart contextual logout destination
    const finalRedirect = (!redirectTo || redirectTo === '/login' || redirectTo === '/')
      ? getLogoutRedirect(window.location.pathname)
      : redirectTo;

    try {
      // 1. Invalidate server-side session cookies
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // Non-blocking
    }

    try {
      // 2. Sign out Supabase auth session directly
      await supabase.auth.signOut().catch(() => {});
    } catch {
      // Non-blocking
    }

    // 3. Clear sessionStorage completely (session-scoped)
    sessionStorage.clear();

    // 4. Remember email for login convenience without keeping active user session
    const currentEmail = localStorage.getItem('officex_user_email');
    if (currentEmail) {
      localStorage.setItem('officex_remembered_email', currentEmail);
    }

    // 5. Clear only auth/session keys from localStorage (preserve data caches)
    const keysToRemove: string[] = [
      'officex_user_email',
      'officex_user_name',
      'officex_user_mobile',
      'officex_user_role',
      'officex_session_active',
      'officex_auth',
      'officex_subscription',
      'officex_active_portal',
      'officex_dashboard',
      'officex_trusted_device'
    ];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (isAuthKey(key) || key.startsWith('sb-') || key.includes('token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // 6. Expire client-accessible auth cookies with domain support
    const cookieNames = [
      'officex_auth',
      'officex_session_active',
      'officex_user_role',
      'officex_user_email',
      'officex_user_name',
      'officex_user_mobile',
      'officex_user_phone',
      'officex_subscription',
      'officex_active_portal',
      'officex_dashboard',
      'officex_trusted_device'
    ];

    cookieNames.forEach((name) => {
      clearAuthCookie(name);
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    });

    // 7. Dispatch events so any open components immediately react
    window.dispatchEvent(new CustomEvent('officex_auth_change', { detail: { user: null } }));
    window.dispatchEvent(new Event('storage'));

    // 8. Navigate to calculated contextual target
    window.location.href = finalRedirect;
  }
}

/**
 * Single source of truth for client-side auth state.
 * Reads the `officex_session_active` cookie (set by server on login).
 * This eliminates the desync between localStorage / sessionStorage / cookies.
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  // Cookie is the canonical session indicator
  const cookies = document.cookie.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('officex_session_active='));
  if (sessionCookie && sessionCookie.split('=')[1] === '1') return true;
  // Fallback: check localStorage in case cookie was set httpOnly
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('officex_session_active') === '1';
  }
  return false;
}

/**
 * Read a named cookie value from document.cookie.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';').map(c => c.trim());
  const match = cookies.find(c => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

