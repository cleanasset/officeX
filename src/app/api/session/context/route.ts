import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { membership_id, workspace_url = '/properties', role = 'Commercial Member', org_name } = body;

    const response = NextResponse.json({
      success: true,
      active_membership_id: membership_id,
      active_workspace: workspace_url,
      active_role: role,
      active_org: org_name
    });

    response.cookies.set('officex_user_role', role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    response.cookies.set('officex_dashboard', workspace_url, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 86400 * 7
    });

    return response;
  } catch (error) {
    console.error('Error in /api/session/context:', error);
    return NextResponse.json(
      { error: 'Failed to update active workspace context.' },
      { status: 500 }
    );
  }
}
