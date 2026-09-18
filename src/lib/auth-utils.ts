/**
 * Authentication and Redirection Security Utilities for OfficeX
 * Ensures compliance with P0 enterprise security standards.
 */

// Allowed internal paths that can be redirected to after sign-in
const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/properties',
  '/property',
  '/tenant',
  '/leasing',
  '/ops',
  '/operations',
  '/vendor',
  '/admin',
  '/operate',
  '/reporting',
  '/reports',
  '/discover',
  '/app',
  '/public/search'
];

/**
 * Validates and sanitizes a redirect URL to prevent Open Redirect vulnerabilities.
 * Guarantees that users are only redirected to safe, internal relative paths.
 *
 * @param redirectUrl - The candidate redirect URL from query parameters
 * @param defaultFallback - The safe default fallback route (default: "/properties")
 * @returns A safe relative path starting with "/"
 */
export function validateRedirect(
  redirectUrl: string | null | undefined,
  defaultFallback: string = '/properties'
): string {
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return defaultFallback;
  }

  const trimmed = redirectUrl.trim();

  // Must start with a single "/" and must NOT start with "//" (protocol-relative URL)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultFallback;
  }

  // Reject any embedded protocol schemes (e.g. javascript:, http:, https:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.includes(':') || trimmed.includes('\\')) {
    return defaultFallback;
  }

  // Parse path without query strings or hashes for prefix checking
  const pathOnly = trimmed.split('?')[0].split('#')[0];

  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)
  );

  if (!isAllowed) {
    return defaultFallback;
  }

  return trimmed;
}

export type IdentifierType = 'email' | 'phone' | 'invalid';

/**
 * Detects whether the user entered a corporate email or a mobile number.
 */
export function detectIdentifierType(identifier: string): IdentifierType {
  const clean = identifier.trim();
  if (!clean) return 'invalid';

  // Check email
  if (clean.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(clean) ? 'email' : 'invalid';
  }

  // Check phone number: 10 digits (India 6-9 prefix), +91, or international E.164
  const digitsOnly = clean.replace(/[\s\-()]/g, '');
  
  // Indian 10-digit format starting with 6-9
  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    return 'phone';
  }

  // E.164 format: + followed by 8-15 digits
  if (/^\+?[1-9]\d{7,14}$/.test(digitsOnly)) {
    return 'phone';
  }

  return 'invalid';
}

/**
 * Normalizes email to lowercase or phone to canonical format.
 */
export function normalizeIdentifier(identifier: string): string {
  const clean = identifier.trim();
  const type = detectIdentifierType(clean);

  if (type === 'email') {
    return clean.toLowerCase();
  }

  if (type === 'phone') {
    const digitsOnly = clean.replace(/[\s\-()]/g, '');
    if (/^[6-9]\d{9}$/.test(digitsOnly)) {
      return `+91${digitsOnly}`;
    }
    if (digitsOnly.startsWith('+')) {
      return digitsOnly;
    }
    return `+${digitsOnly}`;
  }

  return clean;
}

/**
 * Masks identifier for display in OTP screens (e.g. "r***@acme.com" or "+91 98*** **210")
 */
export function maskIdentifier(identifier: string): string {
  const clean = identifier.trim();
  const type = detectIdentifierType(clean);

  if (type === 'email') {
    const [user, domain] = clean.split('@');
    if (!domain) return clean;
    const maskedUser = user.length <= 2 
      ? user[0] + '***' 
      : user[0] + '***' + user[user.length - 1];
    return `${maskedUser}@${domain}`;
  }

  if (type === 'phone') {
    const digitsOnly = clean.replace(/[\s\-()]/g, '');
    if (digitsOnly.length >= 10) {
      const lastFour = digitsOnly.slice(-4);
      const prefix = digitsOnly.startsWith('+') ? digitsOnly.slice(0, 3) : '+91';
      return `${prefix} ***** *${lastFour}`;
    }
  }

  return clean;
}
