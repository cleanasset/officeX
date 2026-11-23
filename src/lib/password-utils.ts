/**
 * Password Hashing & Verification Utilities
 * Uses bcryptjs for portable password hashing (pure JS, works on Vercel/Edge).
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored hash.
 * Returns true if they match.
 */
export async function verifyPassword(plainText: string, storedHash: string): Promise<boolean> {
  // If the stored value looks like a bcrypt hash, use bcrypt.compare
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compare(plainText, storedHash);
  }

  // Legacy: plain-text comparison for migration period
  // (existing users who haven't been rehashed yet)
  return storedHash === plainText;
}

/**
 * Check if a stored hash is already bcrypt-hashed (vs plain text).
 */
export function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
}

/**
 * Validate password strength (minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 digit).
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one digit.' };
  }
  return { valid: true };
}

