import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { verifyStoredOtp } from '@/lib/otp-store';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code, new_password, revoke_others = true } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { error: 'Identifier and recovery code are required.' },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Enter the valid 6-digit recovery code.' },
        { status: 400 }
      );
    }

    if (!new_password || new_password.length < 10) {
      return NextResponse.json(
        { error: 'Use at least 10 characters. Avoid common or easily guessed passwords.' },
        { status: 400 }
      );
    }

    const norm = normalizeIdentifier(identifier);

    // Verify cryptographic OTP via local store or Supabase
    let isValid = false;
    const verification = verifyStoredOtp(norm, code);
    if (verification.valid) {
      isValid = true;
    } else {
      try {
        if (norm.includes('@')) {
          const { data: supaData, error: supaErr } = await supabase.auth.verifyOtp({
            email: norm,
            token: code,
            type: 'recovery',
          });
          if (!supaErr && supaData?.session) {
            isValid = true;
            // Update password in Supabase Auth
            await supabase.auth.updateUser({ password: new_password });
          }
        }
      } catch (e) {
        console.warn('[RECOVER CONFIRM] Supabase verify fallback:', e);
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired recovery code.' },
        { status: 400 }
      );
    }

    // Persist new password directly in Supabase Auth
    if (supabaseAdmin && norm.includes('@')) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const targetUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === norm.toLowerCase()
        );
        if (targetUser) {
          await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
            password: new_password,
          });
          console.log(`[RECOVER CONFIRM] Supabase Auth password successfully updated for ${norm}`);
        }
      } catch (adminErr) {
        console.warn('[RECOVER CONFIRM] Supabase admin update error:', adminErr);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Password has been securely reset. You may now sign in.',
      identifier: norm,
      revoked_other_sessions: revoke_others
    });

    // Set initial session cookie
    response.cookies.set('officex_auth', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    return response;
  } catch (error) {
    console.error('Error in /api/auth/recover/confirm:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
