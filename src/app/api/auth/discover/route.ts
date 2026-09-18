import { NextResponse } from 'next/server';
import { detectIdentifierType, normalizeIdentifier, maskIdentifier } from '@/lib/auth-utils';

export const revalidate = 0;

// In-memory rate limiting map for brute-force enumeration protection: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 1 minute window
    return true;
  }

  if (entry.count >= 20) {
    return false; // Exceeded 20 requests/minute
  }

  entry.count += 1;
  return true;
}

// Known enterprise domains configured for SSO demonstration
const ENTERPRISE_SSO_DOMAINS = [
  'tcs.com',
  'infosys.com',
  'wipro.com',
  'hcl.com',
  'jll.com',
  'cbre.com',
  'cushmanwakefield.com',
  'colliers.com',
  'knightfrank.com',
  'dlf.in',
  'prestigeconstructions.com',
  'brookfieldproperties.com'
];

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

    // If email: check if domain has enterprise SSO enabled
    if (type === 'email') {
      const domain = normalized.split('@')[1] || '';
      const hasSSO = ENTERPRISE_SSO_DOMAINS.includes(domain.toLowerCase());

      if (hasSSO) {
        return NextResponse.json({
          success: true,
          type: 'email',
          next: 'sso',
          domain: domain,
          masked: masked,
          sso_provider: 'Enterprise SAML / OIDC',
          message: `Single Sign-On (SSO) required for @${domain}`
        });
      }

      // Default email flow: Password primary with OTP code option
      return NextResponse.json({
        success: true,
        type: 'email',
        next: 'password',
        channel: 'email',
        masked: masked,
        has_password: true,
        allow_code_fallback: true
      });
    }

    // If phone: Mobile OTP flow (WhatsApp / SMS)
    return NextResponse.json({
      success: true,
      type: 'phone',
      next: 'code',
      channel: 'whatsapp',
      fallback_channel: 'sms',
      masked: masked,
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
