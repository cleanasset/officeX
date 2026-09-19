import { NextResponse } from 'next/server';
import { findMockUser, MOCK_USERS } from '@/lib/auth-utils';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Check if user is logged in via cookie or headers
    const cookieHeader = request.headers.get('cookie') || '';
    const emailCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('officex_user_email='));
    const email = emailCookie ? decodeURIComponent(emailCookie.split('=')[1].trim()) : null;

    const user = email ? findMockUser(email) : MOCK_USERS['owner@officex.in'];

    if (!user) {
      return NextResponse.json(
        { error: 'No active session or memberships found.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      name: user.name,
      identifier: user.identifier,
      preferred_context: user.preferredContextId || user.memberships[0]?.id,
      memberships: user.memberships
    });
  } catch (error) {
    console.error('Error in /api/me/contexts:', error);
    return NextResponse.json(
      { error: 'Unable to retrieve workspace contexts.' },
      { status: 500 }
    );
  }
}
