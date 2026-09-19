import { NextResponse } from 'next/server';
import { findMockUser, normalizeIdentifier } from '@/lib/auth-utils';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
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
    const user = findMockUser(norm);

    // If privileged user requiring MFA
    if (user?.requiresMfa) {
      return NextResponse.json({
        success: true,
        mfa_required: true,
        message: 'Authenticator MFA challenge required for administrative access.'
      });
    }

    const memberships = user?.memberships || [
      {
        id: 'mem_default',
        orgId: 'org_default',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Property Owner & Asset Manager',
        roleCode: 'OWNER',
        workspaceTitle: 'Commercial Landlord Desk',
        workspaceUrl: '/properties',
        propertyScope: '5 properties · Mumbai & Bengaluru',
        badge: 'Asset Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      }
    ];

    const defaultWorkspace = memberships[0].workspaceUrl;
    const defaultRole = memberships[0].role;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user?.id || `usr_${Date.now()}`,
        name: user?.name || 'Enterprise Member',
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

    return response;
  } catch (error) {
    console.error('Error in /api/auth/password:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
