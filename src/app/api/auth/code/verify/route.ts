import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { verifyStoredOtp } from '@/lib/otp-store';
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
    const { identifier, code } = body;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Enter the complete 6-digit verification code.' },
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

    // Verify against real OTP generated for this user
    let otpValid = false;
    let otpError = 'Invalid or expired verification code.';

    const otpResult = verifyStoredOtp(norm, code);
    if (otpResult.valid) {
      otpValid = true;
    } else {
      otpError = otpResult.error || otpError;
      // If phone identifier, also attempt verification with Supabase phone OTP
      if (norm.replace(/\D/g, '').length >= 10) {
        const e164 = norm.startsWith('+') ? norm : `+91${norm}`;
        try {
          const { data: supaData, error: supaErr } = await supabase.auth.verifyOtp({
            phone: e164,
            token: code,
            type: 'sms',
          });
          if (!supaErr && supaData?.session) {
            otpValid = true;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!otpValid) {
      return NextResponse.json(
        { error: otpError },
        { status: 401 }
      );
    }

    const defaultRole = 'Property Owner & Asset Manager';
    const defaultWorkspace = '/properties';

    const memberships = [
      {
        id: `mem_${Date.now()}`,
        orgId: 'org_officex',
        orgName: 'Commercial Asset Management',
        role: defaultRole,
        roleCode: 'OWNER' as const,
        workspaceTitle: 'Commercial Asset Desk',
        workspaceUrl: defaultWorkspace,
        propertyScope: 'Active Portfolio',
        badge: 'Asset Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      }
    ];

    const response = NextResponse.json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name: norm.split('@')[0] || 'Member',
        identifier: norm,
        role: defaultRole
      },
      memberships,
      needs_context_choice: false,
      redirect_url: defaultWorkspace
    });

    // Set secure HttpOnly session cookie
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

    return response;
  } catch (error) {
    console.error('Error in /api/auth/code/verify:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
