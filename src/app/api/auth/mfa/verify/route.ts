import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
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
    const { identifier, code, trust_device = false } = body;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Enter the complete 6-digit numeric code from your authenticator app.' },
        { status: 400 }
      );
    }

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is missing.' },
        { status: 400 }
      );
    }

    const norm = normalizeIdentifier(identifier);

    // Verify TOTP MFA challenge with Supabase Auth
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (totpFactor) {
        const { error: challengeError } = await supabase.auth.mfa.challengeAndVerify({
          factorId: totpFactor.id,
          code
        });

        if (challengeError) {
          return NextResponse.json(
            { error: 'Invalid or expired authenticator code. Please check your authenticator app and try again.' },
            { status: 401 }
          );
        }
      } else {
        // If MFA factor is not enrolled in Supabase, reject unverified arbitrary code
        return NextResponse.json(
          { error: 'MFA authenticator is not enrolled for this account. Please sign in via email code.' },
          { status: 400 }
        );
      }
    } catch {
      // In case MFA challenge fails, return error rather than blindly approving
      return NextResponse.json(
        { error: 'Invalid authenticator code. Please check your app and try again.' },
        { status: 401 }
      );
    }

    const defaultRole = 'Super Administrator';
    const defaultWorkspace = '/admin';

    const memberships = [
      {
        id: 'mem_super_admin',
        orgId: 'org_officex_core',
        orgName: 'OfficeX Platform HQ',
        role: defaultRole,
        roleCode: 'ADMIN' as const,
        workspaceTitle: 'Super Admin Console',
        workspaceUrl: defaultWorkspace,
        propertyScope: 'Global Platform Ecosystem',
        badge: 'Super Admin',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
        isLastUsed: true
      }
    ];

    const response = NextResponse.json({
      success: true,
      assurance_level: 'aal2',
      user: {
        id: `usr_${Date.now()}`,
        name: norm.split('@')[0] || 'Admin',
        identifier: norm,
        role: defaultRole
      },
      memberships,
      needs_context_choice: false,
      redirect_url: defaultWorkspace
    });

    // Set secure HttpOnly session cookies
    response.cookies.set('officex_auth', '1', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_session_active', '1', {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_user_email', encodeURIComponent(norm), {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_user_role', defaultRole, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    if (trust_device) {
      response.cookies.set('officex_trusted_device', '1', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 30
      });
    }

    return response;
  } catch (error) {
    console.error('Error in /api/auth/mfa/verify:', error);
    return NextResponse.json(
      { error: 'MFA verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
