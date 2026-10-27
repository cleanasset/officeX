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
        dbUser.role === 'tenant_admin'
          ? 'Tenant Occupant'
          : dbUser.role === 'property_manager'
            ? 'Property Manager'
            : 'Property Owner & Asset Manager';
    }

    const memberships = [
      {
        id: `mem_${supaUser.id.slice(0, 8)}`,
        orgId: 'org_officex',
        orgName: 'Commercial Asset Management',
        role: userRole,
        roleCode: (supaUser.user_metadata?.roleCode as any) || 'OWNER',
        workspaceTitle: 'Commercial Rent Roll Desk',
        workspaceUrl: '/properties/rent-roll',
        propertyScope: 'Active Commercial Portfolio',
        badge: 'Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      }
    ];

    const response = NextResponse.json({
      success: true,
      user: {
        id: supaUser.id,
        name: userName,
        identifier: norm,
        role: userRole
      },
      memberships,
      needs_context_choice: false,
      redirect_url: '/properties/rent-roll'
    });

    // Secure HttpOnly session cookie
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
