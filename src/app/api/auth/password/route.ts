import { NextResponse } from 'next/server';
import { normalizeIdentifier } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';
import { validateCsrf } from '@/lib/csrf';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
      return NextResponse.json({ error: csrf.error || 'CSRF validation failed.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Enter your password to continue.' },
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

    // Require email for password-based authentication
    if (!norm.includes('@')) {
      return NextResponse.json(
        { error: 'Mobile sign-in uses one-time verification codes. Please choose "Sign in with one-time code".' },
        { status: 400 }
      );
    }

    let supaUser: any = null;
    let userName = norm.split('@')[0] || 'Member';
    let userRole = 'Property Owner & Asset Manager';
    let userId = `user_${Date.now()}`;

    // Master Sovereign Admin authentication check
    const isMasterAdminLogin =
      (norm === 'admin@gmail.com' && (password === 'admin123' || password === 'admin001')) ||
      (norm === 'medistationlifecare@gmail.com' && (password === 'admin123' || password === 'admin001'));

    if (isMasterAdminLogin) {
      userRole = 'Super Administrator';
      userName = norm === 'admin@gmail.com' ? 'OfficeX Super Administrator' : 'Medistn Tech (Master Admin)';
      userId = '00000000-0000-0000-0000-000000000001';

      // Ensure user row exists in postgres
      try {
        const dbUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, norm.toLowerCase().trim()))
          .limit(1);

        if (dbUsers.length === 0) {
          await db.insert(users).values({
            id: userId as any,
            email: norm.toLowerCase().trim(),
            fullName: userName,
            passwordHash: password,
            role: 'super_admin'
          });
        } else {
          userId = dbUsers[0].id;
        }
      } catch (err) {
        console.warn('Admin user auto-seed notice:', err);
      }
    } else {
      // 1. Authenticate with Supabase Auth
      try {
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: norm,
          password
        });

        if (supaAuth?.user) {
          supaUser = supaAuth.user;
          userId = supaUser.id;
          userRole = supaUser.user_metadata?.role || userRole;
          userName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || userName;
        }
      } catch {}

      // 2. Fallback to PostgreSQL users table if Supabase is unavailable or managed in DB
      if (!supaUser) {
        const dbUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, norm.toLowerCase().trim()))
          .limit(1);

        if (dbUsers.length === 0) {
          return NextResponse.json(
            { error: 'No account found with this email. Please sign up to create an account.' },
            { status: 404 }
          );
        }

        const dbUser = dbUsers[0];
        if (
          dbUser.passwordHash &&
          dbUser.passwordHash !== 'SUPABASE_AUTH_MANAGED' &&
          dbUser.passwordHash !== 'INVITED_DELEGATION' &&
          dbUser.passwordHash !== password
        ) {
          return NextResponse.json(
            { error: 'Incorrect password. Please verify your credentials or reset your password.' },
            { status: 401 }
          );
        }

        userId = dbUser.id;
        userName = dbUser.fullName || userName;
        userRole =
          dbUser.role === 'super_admin' || norm === 'admin@gmail.com'
            ? 'Super Administrator'
            : dbUser.role === 'tenant_admin'
            ? 'Tenant Occupant'
            : dbUser.role === 'property_manager'
              ? 'Property Manager'
              : 'Property Owner & Asset Manager';
      }
    }

    const isSuperAdmin = userRole === 'Super Administrator' || norm === 'admin@gmail.com' || norm === 'medistationlifecare@gmail.com';
    const effectiveUserId = String(supaUser?.id || userId || `usr_${Date.now()}`);
    const shortId = effectiveUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'active';

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
            role: userRole,
            roleCode: 'OWNER',
            workspaceTitle: 'Commercial Rent Roll & Leases Desk',
            workspaceUrl: '/properties/rent-roll',
            propertyScope: 'Active Leases & Rent Roll Governance',
            badge: 'Rent Roll',
            badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-400/30',
            isLastUsed: false
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
        name: userName,
        identifier: norm,
        role: userRole
      },
      memberships,
      needs_context_choice: !isSuperAdmin,
      redirect_url: isSuperAdmin ? '/admin' : null
    });

    // Secure HttpOnly session cookie
    response.cookies.set('officex_auth', '1', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    if (isSuperAdmin) {
      response.cookies.set('officex_admin', '1', {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 7
      });
      response.cookies.set('officex_role', 'super_admin', {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 7
      });
    }

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

    response.cookies.set('officex_user_role', userRole, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    return response;
  } catch (error: any) {
    console.error('Error in /api/auth/password:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
