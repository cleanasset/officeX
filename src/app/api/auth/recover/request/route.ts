import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateCsrf } from '@/lib/csrf';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error || 'CSRF validation failed.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Enter your work email or mobile number.' },
        { status: 400 }
      );
    }

    const type = detectIdentifierType(identifier);
    if (type === 'invalid') {
      return NextResponse.json(
        { error: 'Enter a valid work email or 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(identifier);
    const masked = maskIdentifier(normalized);

    // Check if account exists in Supabase Auth
    let userExists = false;
    if (supabaseAdmin) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingUser = usersData?.users?.find(
          (u) => (type === 'email' && u.email?.toLowerCase() === normalized.toLowerCase()) ||
                 (type === 'phone' && (u.phone === normalized || u.phone === `+91${normalized}`))
        );
        if (existingUser) {
          userExists = true;
          if (!existingUser.email_confirmed_at && type === 'email') {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              email_confirm: true,
            });
          }
        }
      } catch (adminErr) {
        console.warn('[RECOVER] Supabase admin user check error:', adminErr);
      }
    }

    // Only dispatch recovery codes if user account actually exists
    if (userExists) {
      // Generate real cryptographic OTP
      const { code: otp, error: otpError } = generateAndStoreOtp(normalized);
      if (otpError) {
        return NextResponse.json({ error: otpError }, { status: 429 });
      }

      if (type === 'email') {
        // Trigger real Supabase Auth reset password email
        try {
          await supabase.auth.resetPasswordForEmail(normalized, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.officex.pro'}/login?reset=true`,
          });
        } catch (e) {
          console.warn('[RECOVER] Supabase reset exception:', e);
        }

        // Dispatch real 6-digit cryptographic OTP email
        const emailRes = await sendOtpEmail({
          to: normalized,
          otp,
          purpose: 'recovery',
        });
        if (!emailRes.success) {
          console.warn(`[RECOVER] Email dispatch notice for ${masked}: ${emailRes.error}`);
        }
      } else {
        // Phone recovery
        const e164 = normalized.startsWith('+') ? normalized : `+91${normalized}`;
        try {
          await supabase.auth.signInWithOtp({ phone: e164 });
        } catch (smsErr) {
          console.warn('[RECOVER] SMS dispatch error for phone:', smsErr);
        }
      }
    }

    // Uniform response to protect against account enumeration
    return NextResponse.json({
      success: true,
      message: `If an account exists for ${masked}, a 6-digit recovery code has been dispatched.`,
      masked
    });
  } catch (error) {
    console.error('Error in /api/auth/recover/request:', error);
    return NextResponse.json(
      { error: 'Failed to process recovery request.' },
      { status: 500 }
    );
  }
}
