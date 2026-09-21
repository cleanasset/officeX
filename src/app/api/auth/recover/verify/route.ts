import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { verifyStoredOtp } from '@/lib/otp-store';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { error: 'Identifier and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim();
    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: 'Enter the complete 6-digit verification code.' },
        { status: 400 }
      );
    }

    const norm = normalizeIdentifier(identifier);

    // 1. Try Supabase Auth verifyOtp if available
    try {
      if (norm.includes('@')) {
        const { data: supaData, error: supaErr } = await supabase.auth.verifyOtp({
          email: norm,
          token: cleanCode,
          type: 'recovery',
        });
        if (!supaErr && supaData?.session) {
          return NextResponse.json({
            success: true,
            message: 'Code verified successfully via Supabase.',
            verified: true,
            provider: 'supabase',
          });
        }
      }
    } catch (e) {
      console.warn('[RECOVER VERIFY] Supabase verifyOtp fallback:', e);
    }

    // 2. Verify against internal cryptographic OTP store (do not consume yet)
    const localVerification = verifyStoredOtp(norm, cleanCode, false);
    if (localVerification.valid) {
      return NextResponse.json({
        success: true,
        message: 'Code verified successfully.',
        verified: true,
        provider: 'local',
      });
    }

    return NextResponse.json(
      { error: localVerification.error || 'Invalid or expired recovery code. Please check your email or request a new code.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in /api/auth/recover/verify:', error);
    return NextResponse.json(
      { error: 'Failed to verify recovery code.' },
      { status: 500 }
    );
  }
}
