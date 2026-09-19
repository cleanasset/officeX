import { NextResponse } from 'next/server';
import { findMockUser, normalizeIdentifier } from '@/lib/auth-utils';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, code, trust_device = false } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Enter the complete 6-digit code from your authenticator app.' },
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
    const user = findMockUser(norm);

    const memberships = user?.memberships || [
      {
        id: 'mem_super_admin',
        orgId: 'org_officex_core',
        orgName: 'OfficeX Platform HQ',
        role: 'Super Administrator',
        roleCode: 'ADMIN',
        workspaceTitle: 'Super Admin Console',
        workspaceUrl: '/admin',
        propertyScope: 'Global Platform Ecosystem',
        badge: 'Super Admin',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
        isLastUsed: true
      }
    ];

    const defaultWorkspace = memberships[0].workspaceUrl;
    const defaultRole = memberships[0].role;

    const response = NextResponse.json({
      success: true,
      assurance_level: 'aal2',
      user: {
        id: user?.id || `usr_${Date.now()}`,
        name: user?.name || 'Super Admin',
        identifier: norm,
        role: defaultRole
      },
      memberships,
      needs_context_choice: memberships.length > 1,
      redirect_url: defaultWorkspace
    });

    // Set secure session cookies
    response.cookies.set('officex_auth', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_session_active', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_user_role', defaultRole, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    if (trust_device) {
      response.cookies.set('officex_trusted_device', '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 86400 * 30 // 30 days
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
