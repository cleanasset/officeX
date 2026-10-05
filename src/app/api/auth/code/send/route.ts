import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';
import { supabase } from '@/lib/supabase';
import { getRentRollData } from '@/lib/rent-roll-store';
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

    // Generate real 6-digit cryptographic verification code
    const { code, error: otpError } = generateAndStoreOtp(normalized);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 429 });
    }

    // 1. If identifier is an email address, dispatch real email
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

    // 2. If identifier is a mobile phone number
    if (type === 'phone') {
      const e164 = normalized.startsWith('+') ? normalized : `+91${normalized}`;
      
      // Attempt real Supabase SMS OTP
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

      // Check if this phone belongs to a tenant or account with an email on file
      try {
        const db = getRentRollData();
        const cleanDigits = normalized.replace(/\D/g, '');
        const matchedTenant = db.tenants?.find(t => 
          t.contactPhone && t.contactPhone.replace(/\D/g, '').endsWith(cleanDigits.slice(-10))
        );
        const linkedEmail = matchedTenant?.contactEmail;
        if (linkedEmail) {
          await sendOtpEmail({
            to: linkedEmail,
            otp: code,
            purpose: 'login',
          });
          const maskedEmail = maskIdentifier(linkedEmail);
          return NextResponse.json({
            success: true,
            message: `SMS gateway unavailable for this carrier. Verification code dispatched to registered email (${maskedEmail}).`,
            channel: 'email',
            masked: maskedEmail,
            cooldown: 30,
          });
        }
      } catch (storeErr) {
        console.warn('[CODE/SEND] Tenant email lookup error:', storeErr);
      }

      // If no SMS provider is configured and no email linked
      return NextResponse.json(
        {
          error: 'SMS delivery is currently unavailable for this phone number. Please sign in using your registered email address or Google account.',
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
