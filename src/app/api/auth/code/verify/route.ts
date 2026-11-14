import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { verifyStoredOtp } from '@/lib/otp-store';
import { supabase, supabaseAdmin } from '@/lib/supabase';
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

    let otpValid = false;
    let otpError = 'Invalid or expired verification code.';

    const otpResult = verifyStoredOtp(norm, code);
    if (otpResult.valid) {
      otpValid = true;
    } else {
      otpError = otpResult.error || otpError;
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

    const isSuperAdmin = norm === 'admin@gmail.com' || norm === 'medistationlifecare@gmail.com';
    const effectiveUserId = String(supaUserId || `usr_${Date.now()}`);
    const shortId = effectiveUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'active';

    const defaultRole = isSuperAdmin ? 'Super Administrator' : 'Property Owner & Asset Manager';

    const memberships = isSuperAdmin
      ? [
          {
            id: 'mem_admin',
            orgId: 'org_admin',
            orgName: 'OfficeX Platform Governance',
            role: 'Super Administrator',
            roleCode: 'SUPER_ADMIN',
            workspaceTitle: 'Master Control Center',
            workspaceUrl: '/admin',
            propertyScope: 'All Global Portfolios',
            badge: 'Super Admin',
            badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
            isLastUsed: true
          }
        ]
      : [
          {
            id: `mem_rent_roll_${shortId}`,
            orgId: 'org_officex',
            orgName: 'Commercial Asset Management',
            role: defaultRole,
            roleCode: 'OWNER',
            workspaceTitle: 'Commercial Rent Roll & Leases Desk',
            workspaceUrl: '/properties/rent-roll',
            propertyScope: 'Active Leases & Rent Roll Governance',
            badge: 'Rent Roll',
            badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-400/30',
            isLastUsed: true
          },
          {
            id: `mem_marketplace_${shortId}`,
            orgId: 'org_officex',
            orgName: 'Commercial Marketplace',
            role: 'Property Owner / Partner',
            roleCode: 'PARTNER',
            workspaceTitle: 'Office Marketplace & Listings',
            workspaceUrl: '/marketplace',
            propertyScope: 'Public Office & Coworking Directory',
            badge: 'Marketplace',
            badgeColor: 'bg-teal-500/20 text-teal-700 border-teal-400/30',
            isLastUsed: false
          },
          {
            id: `mem_cafm_${shortId}`,
            orgId: 'org_officex',
            orgName: 'Facility Engineering Operations',
            role: 'Operations & Maintenance',
            roleCode: 'OPERATIONS',
            workspaceTitle: '52-Week CAFM & PPM Suite',
            workspaceUrl: '/admin?tab=saas&module=cafm',
            propertyScope: 'Plant, DG & Maintenance Schedules',
            badge: 'CAFM Operations',
            badgeColor: 'bg-blue-500/20 text-blue-700 border-blue-400/30',
            isLastUsed: false
          },
          {
            id: `mem_visitor_${shortId}`,
            orgId: 'org_officex',
            orgName: 'Campus Security & Life Safety',
            role: 'Security & Access Control',
            roleCode: 'SECURITY',
            workspaceTitle: 'Visitor Flow & Security Gate',
            workspaceUrl: '/admin?tab=saas&module=visitor',
            propertyScope: 'Turnstile Relays & WhatsApp Passes',
            badge: 'Visitor Flow',
            badgeColor: 'bg-indigo-500/20 text-indigo-700 border-indigo-400/30',
            isLastUsed: false
          }
        ];

    const response = NextResponse.json({
      success: true,
      user: {
        id: effectiveUserId,
        name: userFullName || norm.split('@')[0] || 'Member',
        identifier: norm,
        role: defaultRole
      },
      memberships,
      needs_context_choice: !isSuperAdmin,
      needs_onboarding: false,
      redirect_url: isSuperAdmin ? '/admin' : null
    });

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
