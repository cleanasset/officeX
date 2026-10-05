import fs from 'fs';
import path from 'path';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Storage path: /tmp in serverless/Vercel, or local data folder
const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? '/tmp'
  : path.join(/*turbopackIgnore: true*/ process.cwd(), 'data');

const RATE_LIMIT_FILE = path.join(DATA_DIR, 'officex_ratelimit.json');

// Global in-memory cache attached to globalThis to survive Next.js module re-evaluations
const globalForRateLimit = globalThis as unknown as {
  _officexRateLimitMap?: Map<string, RateLimitEntry>;
};

function readRateLimitsFromDisk(): Map<string, RateLimitEntry> {
  const map = new Map<string, RateLimitEntry>();
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      const content = fs.readFileSync(RATE_LIMIT_FILE, 'utf8');
      const parsed = JSON.parse(content);
      const now = Date.now();
      for (const [key, value] of Object.entries(parsed)) {
        const entry = value as RateLimitEntry;
        if (entry.resetAt > now) {
          map.set(key, entry);
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }
  return map;
}

function persistRateLimitsToDisk(map: Map<string, RateLimitEntry>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, RateLimitEntry> = {};
    const now = Date.now();
    for (const [key, entry] of map.entries()) {
      if (entry.resetAt > now) {
        obj[key] = entry;
      }
    }
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(obj), 'utf8');
  } catch {
    // Non-blocking fallback
  }
}

const memoryStore: Map<string, RateLimitEntry> =
  globalForRateLimit._officexRateLimitMap || readRateLimitsFromDisk();

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit._officexRateLimitMap = memoryStore;
}

/**
 * Robust, persistent rate limiter for API endpoints.
 * @param key Unique key to rate limit (e.g. client IP or identifier)
 * @param maxRequests Maximum allowed requests in window (default: 20)
 * @param windowSeconds Window duration in seconds (default: 60)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  let entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    memoryStore.set(key, entry);
    persistRateLimitsToDisk(memoryStore);
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  persistRateLimitsToDisk(memoryStore);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.count),
    retryAfterSeconds: 0
  };
}
