import { NextResponse } from 'next/server';
import {
  detectIdentifierType,
  normalizeIdentifier,
  maskIdentifier,
  ENTERPRISE_SSO_CONFIG
} from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limiter';
import { validateCsrf } from '@/lib/csrf';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error || 'CSRF validation failed.' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Check persistent rate limit: 25 attempts per minute per IP
    const rateLimit = checkRateLimit(`discover_ip_${ip}`, 25, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many sign-in attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.` },
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

    // Rate limit per target identifier as well to prevent brute force targeting a specific account
    const idLimit = checkRateLimit(`discover_id_${normalized}`, 10, 60);
    if (!idLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts for this account. Please wait ${idLimit.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

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

      // Default real behavior: offer password sign in with one-time code fallback
      return NextResponse.json({
        success: true,
        type: 'email',
        next: 'password',
        channel: 'email',
        masked: masked,
        has_password: true,
        mfa_required: false,
        allow_code_fallback: true
      });
    }

    // 2. If Phone: Mobile OTP flow (WhatsApp first, SMS fallback)
    return NextResponse.json({
      success: true,
      type: 'phone',
      next: 'code',
      channel: 'whatsapp',
      fallback_channel: 'sms',
      masked: masked,
      mfa_required: false,
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
