/**
 * CSRF and Origin Protection Utility for API routes
 * Protects state-changing endpoints from Cross-Site Request Forgery (CSRF)
 * by verifying standard Sec-Fetch-Site, Origin, and Referer headers against the host.
 */

export function validateCsrf(request: Request): { valid: boolean; error?: string } {
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  // Modern browsers send Sec-Fetch-Site
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return { valid: false, error: 'Cross-origin request blocked by CSRF policy.' };
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  const allowedHostnames = new Set([
    'localhost',
    '127.0.0.1',
    'officex.pro',
    'www.officex.pro',
    'office-x-black.vercel.app'
  ]);

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (host && originUrl.host === host) {
        return { valid: true };
      }
      if (allowedHostnames.has(originUrl.hostname) || originUrl.hostname.endsWith('.vercel.app')) {
        return { valid: true };
      }
      return { valid: false, error: 'Origin does not match allowed host.' };
    } catch {
      return { valid: false, error: 'Malformed Origin header.' };
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (host && refererUrl.host === host) {
        return { valid: true };
      }
      if (allowedHostnames.has(refererUrl.hostname) || refererUrl.hostname.endsWith('.vercel.app')) {
        return { valid: true };
      }
      return { valid: false, error: 'Referer does not match allowed host.' };
    } catch {
      return { valid: false, error: 'Malformed Referer header.' };
    }
  }

  // If neither Origin nor Referer is provided, check if it's a programmatic API call
  // Standard HTML form submission without Origin/Referer in cross-site context is prevented
  // by ensuring Sec-Fetch-Mode is not "navigate" or requiring custom header / JSON content
  const secFetchMode = request.headers.get('sec-fetch-mode');
  if (secFetchMode === 'navigate') {
    return { valid: false, error: 'Direct navigation POST without Origin/Referer blocked.' };
  }

  // Require JSON or custom header for state-changing endpoints without Origin/Referer
  const contentType = request.headers.get('content-type') || '';
  const hasAuthHeader = Boolean(request.headers.get('authorization'));
  const hasCustomHeader = Boolean(request.headers.get('x-user-email') || request.headers.get('x-requested-with'));

  if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data') && !hasAuthHeader && !hasCustomHeader) {
    return { valid: false, error: 'Missing Origin and Referer headers on state-changing request.' };
  }

  return { valid: true };
}
