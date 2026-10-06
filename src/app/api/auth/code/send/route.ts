import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';
import { supabase } from '@/lib/supabase';
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
        { error: 'Identifier is required to send verification code.' },
        { status: 400 }
      );
    }

    const type = detectIdentifierType(identifier);
    if (type === 'invalid') {
      return NextResponse.json(
        { error: 'Please enter a valid work email or mobile number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(identifier);
    const masked = maskIdentifier(normalized);

    const { code, error: otpError } = generateAndStoreOtp(normalized);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 429 });
    }

    if (type === 'email') {
      const emailRes = await sendOtpEmail({
        to: normalized,
        otp: code,
        purpose: 'login',
      });

      if (!emailRes.success) {
        return NextResponse.json(
          { error: emailRes.error || 'Failed to dispatch verification email.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${masked}.`,
        channel: 'email',
        masked,
        cooldown: 30,
      });
    }

    if (type === 'phone') {
      const e164 = normalized.startsWith('+') ? normalized : `+91${normalized}`;
      
      try {
        const { error: supaErr } = await supabase.auth.signInWithOtp({
          phone: e164,
        });
        if (!supaErr) {
          return NextResponse.json({
            success: true,
            message: `Verification code sent via SMS to ${masked}.`,
            channel: 'sms',
            masked,
            cooldown: 30,
          });
        }
      } catch (err) {
        console.warn('[CODE/SEND] Supabase phone OTP dispatch exception:', err);
      }

      return NextResponse.json(
        {
          error: 'SMS delivery is currently unavailable for this phone number. Please sign in using your registered email address.',
          fallback_required: 'email'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unsupported identifier type.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in /api/auth/code/send:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
