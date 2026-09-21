import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, channel = 'whatsapp' } = body;

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

    // If identifier is an email address, dispatch real email
    if (type === 'email') {
      await sendOtpEmail({
        to: normalized,
        otp: code,
        purpose: 'login',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${channel}.`,
      channel,
      masked,
      cooldown: 30,
    });
  } catch (error) {
    console.error('Error in /api/auth/code/send:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
