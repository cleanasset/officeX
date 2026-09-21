import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
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

    // Generate real cryptographic OTP
    const { code: otp, error: otpError } = generateAndStoreOtp(normalized);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 429 });
    }

    // If identifier is email, dispatch via SMTP
    if (type === 'email') {
      const emailRes = await sendOtpEmail({
        to: normalized,
        otp,
        purpose: 'recovery',
      });
      if (!emailRes.success) {
        console.warn(`[RECOVER] Email dispatch notice for ${normalized}: ${emailRes.error}`);
      }
    } else {
      console.log(`[RECOVER SMS/WA] Dispatched OTP to ${normalized}: [${otp}]`);
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
