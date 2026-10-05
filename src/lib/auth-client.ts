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

// Keys that represent USER DATA — preserved across logout
const DATA_KEYS_TO_KEEP = new Set([
  'officex_remembered_email',
  'officex_org_name',
  'officex_onboarding_completed',
  'officex_user_properties',
  'officex_active_leases',
  'officex_active_tenants',
  'officex_saved_bank_details',
  'officex_active_org',
  'officex_property_state',
  'officex_property_city',
  'officex_user_state',
  'officex_user_city',
]);

function isAuthKey(key: string): boolean {
  if (DATA_KEYS_TO_KEEP.has(key)) return false;
  if (AUTH_SESSION_KEYS.includes(key)) return true;
  for (const prefix of AUTH_KEY_PREFIXES) {
    if (key.startsWith(prefix)) return true;
  }
  // Generic officex_ keys not in data list are auth-related
  if (key.startsWith('officex_') && !DATA_KEYS_TO_KEEP.has(key)) {
    // Keep anything that looks like cached data
    if (key.includes('properties') || key.includes('tenants') || key.includes('leases') ||
        key.includes('org') || key.includes('bank') || key.includes('compliance') ||
        key.includes('onboarding')) {
      return false;
    }
    return true;
  }
  if (key.includes('token') || key.startsWith('sb-')) return true;
  return false;
}

export async function performClientLogout(redirectTo: string = '/login') {
  if (typeof window !== 'undefined') {
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

    // 8. Navigate to login or target
    window.location.href = redirectTo;
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

