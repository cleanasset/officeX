import { NextResponse } from 'next/server';
import {
  detectIdentifierType,
  normalizeIdentifier,
  maskIdentifier,
  ENTERPRISE_SSO_CONFIG,
  findMockUser
} from '@/lib/auth-utils';

export const revalidate = 0;

// Rate limiting map: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 1 minute window
    return true;
  }

  if (entry.count >= 25) {
    return false; // Exceeded 25 requests/minute
  }

  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please wait 60 seconds before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawIdentifier = body.identifier;

    if (!rawIdentifier || typeof rawIdentifier !== 'string') {
      return NextResponse.json(
        { error: 'Enter a valid work email or 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const type = detectIdentifierType(rawIdentifier);
    if (type === 'invalid') {
      return NextResponse.json(
        { error: 'Enter a valid work email or 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(rawIdentifier);
    const masked = maskIdentifier(normalized);
    const matchedUser = findMockUser(rawIdentifier);

    // 1. If Email: check if domain has enterprise SSO enabled
    if (type === 'email') {
      const domain = normalized.split('@')[1]?.toLowerCase() || '';
      const ssoConfig = ENTERPRISE_SSO_CONFIG[domain];

      if (ssoConfig) {
        return NextResponse.json({
          success: true,
          type: 'email',
          next: 'sso',
          domain: domain,
          org_name: ssoConfig.orgName,
          sso_provider: ssoConfig.provider,
          sso_url: ssoConfig.ssoUrl,
          masked: masked,
          message: `Single Sign-On (SSO) required for @${domain}`
        });
      }

      // Check if user has password configured
      const hasPassword = matchedUser ? matchedUser.hasPassword : true;
      const requiresMfa = matchedUser ? matchedUser.requiresMfa : false;

      return NextResponse.json({
        success: true,
        type: 'email',
        next: hasPassword ? 'password' : 'code',
        channel: 'email',
        masked: masked,
        has_password: hasPassword,
        mfa_required: requiresMfa,
        allow_code_fallback: true
      });
    }

    // 2. If Phone: Mobile OTP flow (WhatsApp first, SMS fallback)
    const requiresMfa = matchedUser ? matchedUser.requiresMfa : false;

    return NextResponse.json({
      success: true,
      type: 'phone',
      next: 'code',
      channel: 'whatsapp',
      fallback_channel: 'sms',
      masked: masked,
      mfa_required: requiresMfa,
      cooldown_seconds: 30
    });
  } catch (error) {
    console.error('Error in /api/auth/discover:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
