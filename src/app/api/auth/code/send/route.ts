import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';

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

    // Mock code generation (Fixed demo code 482910 allows seamless QA/UAT verification)
    const demoCode = '482910';

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${channel}.`,
      channel,
      masked,
      cooldown: 30,
      demo_code: demoCode
    });
  } catch (error) {
    console.error('Error in /api/auth/code/send:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
