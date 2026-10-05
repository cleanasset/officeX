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

    // Authenticate with real Supabase Auth
    const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
      email: norm,
      password
    });

    if (supaErr || !supaAuth?.user) {
      return NextResponse.json(
        { error: supaErr?.message || 'Incorrect password. Please verify your credentials or sign in with a one-time code.' },
        { status: 401 }
      );
    }

    const supaUser = supaAuth.user;
    const userRole = supaUser.user_metadata?.role || 'Property Owner & Asset Manager';
    const userName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || norm.split('@')[0] || 'Member';

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
