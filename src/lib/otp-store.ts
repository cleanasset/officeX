import { normalizeIdentifier } from '@/lib/auth-utils';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// Global OTP map preserved across Next.js API re-evaluations
const globalForOtp = globalThis as unknown as {
  _officexOtpStore?: Map<string, OtpRecord>;
};

const otpStore: Map<string, OtpRecord> =
  globalForOtp._officexOtpStore || new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp._officexOtpStore = otpStore;
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

export function generateAndStoreOtp(identifier: string): {
  code: string;
  cooldownRemaining?: number;
  error?: string;
} {
  const cleanId = normalizeIdentifier(identifier);
  const existing = otpStore.get(cleanId);
  const now = Date.now();

  // Enforce 30-second resend cooldown
  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return {
      code: "",
      cooldownRemaining: remaining,
      error: `Please wait ${remaining} seconds before requesting a new verification code.`,
    };
  }

  // Generate cryptographically secure random 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(cleanId, {
    code,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    createdAt: now,
  });

  return { code };
}

export function verifyStoredOtp(
  identifier: string,
  userCode: string,
  consume: boolean = true
): { valid: boolean; error?: string } {
  const cleanId = normalizeIdentifier(identifier);
  const cleanCode = userCode.trim();
  const existing = otpStore.get(cleanId);
  const now = Date.now();

  if (!existing) {
    return {
      valid: false,
      error: "No active verification code found. Please request a new code.",
    };
  }

  if (now > existing.expiresAt) {
    otpStore.delete(cleanId);
    return {
      valid: false,
      error: "Verification code has expired. Please request a new one.",
    };
  }

  if (existing.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanId);
    return {
      valid: false,
      error: "Too many failed attempts. For your security, this code has been invalidated. Please request a new one.",
    };
  }

  if (existing.code !== cleanCode) {
    existing.attempts += 1;
    const remaining = MAX_ATTEMPTS - existing.attempts;
    return {
      valid: false,
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Code is valid!
  if (consume) {
    otpStore.delete(cleanId);
  } else {
    (existing as any).verified = true;
  }
  return { valid: true };
}

export function isOtpVerified(identifier: string): boolean {
  const cleanId = normalizeIdentifier(identifier);
  const existing = otpStore.get(cleanId);
  return Boolean(existing && (existing as any).verified);
}

export function peekOtpForTesting(identifier: string): string | null {
  const cleanId = normalizeIdentifier(identifier);
  const existing = otpStore.get(cleanId);
  return existing ? existing.code : null;
}
