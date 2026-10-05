import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const emailCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('officex_user_email='));
    const email = emailCookie ? decodeURIComponent(emailCookie.split('=')[1].trim()) : null;

    const authCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('officex_auth='));
    const isAuthed = !!authCookie && authCookie.split('=')[1].trim() !== '';

    if (!email || !isAuthed) {
      return NextResponse.json(
        { error: 'No active session or memberships found.' },
        { status: 401 }
      );
    }

    const defaultMembership = {
      id: `mem_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      orgId: 'org_officex',
      orgName: 'Commercial Asset Management',
      role: 'Property Owner & Asset Manager',
      roleCode: 'OWNER',
      workspaceTitle: 'Commercial Rent Roll Desk',
      workspaceUrl: '/properties/rent-roll',
      propertyScope: 'Active Portfolio',
      badge: 'Asset Owner',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      isLastUsed: true
    };

    return NextResponse.json({
      success: true,
      user_id: `usr_${email}`,
      name: email.split('@')[0] || 'Member',
      identifier: email,
      preferred_context: defaultMembership.id,
      memberships: [defaultMembership]
    });
  } catch (error) {
    console.error('Error in /api/me/contexts:', error);
    return NextResponse.json(
      { error: 'Unable to retrieve workspace contexts.' },
      { status: 500 }
    );
  }
}
