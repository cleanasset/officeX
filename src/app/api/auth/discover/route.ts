import { NextResponse } from 'next/server';
import {
  detectIdentifierType,
  normalizeIdentifier,
  maskIdentifier,
  ENTERPRISE_SSO_CONFIG
} from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limiter';
import { validateCsrf } from '@/lib/csrf';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { supabaseAdmin } from '@/lib/supabase';

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
        { error: 'Please enter a valid work or personal email address.' },
        { status: 400 }
      );
    }

    const type = detectIdentifierType(rawIdentifier);
    if (type === 'invalid') {
      return NextResponse.json(
        { error: 'Please enter a valid work or personal email address.' },
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
      const cleanEmail = normalized.toLowerCase().trim();
      const domain = cleanEmail.split('@')[1]?.toLowerCase() || '';
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

      // Check if user exists in database or Supabase Auth
      let userFound = false;
      let userName = '';

      // Check PostgreSQL users table
      try {
        const dbUsers = await db
          .select({ id: users.id, email: users.email, fullName: users.fullName })
          .from(users)
          .where(eq(users.email, cleanEmail))
          .limit(1);

        if (dbUsers.length > 0) {
          userFound = true;
          userName = dbUsers[0].fullName || '';
        }
      } catch (dbErr) {
        console.warn('[AUTH_DISCOVER] DB check notice:', dbErr);
      }

      // Check Supabase Auth if supabaseAdmin is available
      if (!userFound && supabaseAdmin) {
        try {
          const { data: usersData, error: supaErr } = await supabaseAdmin.auth.admin.listUsers();
          if (!supaErr && usersData?.users) {
            const match = usersData.users.find(
              (u) => u.email?.toLowerCase().trim() === cleanEmail
            );
            if (match) {
              userFound = true;
              userName = match.user_metadata?.full_name || '';
            }
          }
        } catch (supaEx) {
          console.warn('[AUTH_DISCOVER] Supabase Auth check notice:', supaEx);
        }
      }

      if (!userFound) {
        return NextResponse.json(
          {
            error: 'No account found with this email. You must have a registered email ID to log in. Please sign up first.',
            user_exists: false,
            not_registered: true
          },
          { status: 404 }
        );
      }

      // User exists in database -> proceed to password
      return NextResponse.json({
        success: true,
        type: 'email',
        next: 'password',
        channel: 'email',
        masked: masked,
        user_name: userName,
        has_password: true,
        mfa_required: false,
        allow_code_fallback: true
      });
    }

    // 2. If Phone: SMS / WhatsApp gateway is not configured
    return NextResponse.json(
      {
        error: 'Mobile phone OTP is currently unavailable. Please sign in using your registered email address or Google.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in /api/auth/discover:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
