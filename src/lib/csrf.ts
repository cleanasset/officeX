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

  // For testing tools / server-side non-browser calls that don't supply Origin/Referer
  return { valid: true };
}
