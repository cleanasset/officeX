import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { verifyStoredOtp } from '@/lib/otp-store';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateCsrf } from '@/lib/csrf';
import { getRentRollDb } from '@/lib/rent-roll-store';

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

    // Auto-provision user in Supabase Auth & PostgreSQL database
    let supaUserId: string | undefined;
    const userEmail = norm.includes('@') ? norm : `${norm.replace(/\D/g, '')}@officex.pro`;
    const userFullName = norm.split('@')[0] || 'Commercial Member';

    if (supabaseAdmin) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
        );

        if (existingAuthUser) {
          supaUserId = existingAuthUser.id;
          await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
            email_confirm: true,
            user_metadata: { role: 'Commercial Owner', full_name: userFullName }
          });
        } else {
          const { data: newAuthUser } = await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            email_confirm: true,
            user_metadata: {
              role: 'Commercial Owner',
              full_name: userFullName
            }
          });
          if (newAuthUser?.user?.id) {
            supaUserId = newAuthUser.user.id;
          }
        }
      } catch (authSyncErr) {
        console.warn('[SUPABASE-SYNC] Supabase Auth admin operation exception:', authSyncErr);
      }
    }

    // Sync into PostgreSQL public.users table in Supabase
    try {
      const client = supabaseAdmin || supabase;
      if (client) {
        await client
          .from('users')
          .upsert(
            {
              id: supaUserId || undefined,
              email: userEmail,
              full_name: userFullName,
              role: 'property_manager',
              password_hash: 'SUPABASE_AUTH_MANAGED'
            },
            { onConflict: 'email' }
          );
      }
    } catch (pgSyncErr) {
      console.warn('[SUPABASE-SYNC] public.users sync exception:', pgSyncErr);
    }

    const defaultRole = 'Property Owner & Asset Manager';

    // Verify if user already has an active property / organization
    const db = getRentRollDb();
    const userOwnedProps = (db.properties || []).filter(p => 
      p.ownerEmail && userEmail && p.ownerEmail.toLowerCase() === userEmail.toLowerCase()
    );
    const hasExistingOrg = Boolean(db.organization?.name && db.organization.name.trim() !== "");
    const isNewUser = userOwnedProps.length === 0;

    const memberships = isNewUser ? [] : [
      {
        id: `mem_${Date.now()}`,
        orgId: db.organization?.id || 'org_officex',
        orgName: db.organization?.tradeName || db.organization?.name || 'Commercial Asset Management',
        role: defaultRole,
        roleCode: 'OWNER' as const,
        workspaceTitle: 'Commercial Asset Desk',
        workspaceUrl: '/properties/rent-roll',
        propertyScope: 'Active Portfolio',
        badge: 'Asset Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      }
    ];

    const response = NextResponse.json({
      success: true,
      user: {
        id: supaUserId || `usr_${Date.now()}`,
        name: userFullName || norm.split('@')[0] || 'Member',
        identifier: norm,
        role: defaultRole
      },
      memberships,
      needs_context_choice: false,
      needs_onboarding: isNewUser,
      redirect_url: isNewUser ? '/onboarding?context=rent-roll' : '/properties/rent-roll'
    });

    if (isNewUser) {
      response.cookies.set('officex_onboarding_completed', '0', { path: '/', maxAge: 86400 });
    }

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
