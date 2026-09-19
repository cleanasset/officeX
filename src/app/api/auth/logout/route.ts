import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function POST(request: Request) {
  const response = NextResponse.json({
    success: true,
    message: 'Successfully signed out of OfficeX.'
  });

  const cookiesToClear = [
    'officex_auth',
    'officex_session_active',
    'officex_user_role',
    'officex_user_email',
    'officex_user_name',
    'officex_active_portal',
    'officex_dashboard',
    'officex_trusted_device'
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
      sameSite: 'lax'
    });
  });

  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL('/login', url.origin);

  const response = NextResponse.redirect(redirectUrl);

  const cookiesToClear = [
    'officex_auth',
    'officex_session_active',
    'officex_user_role',
    'officex_user_email',
    'officex_user_name',
    'officex_active_portal',
    'officex_dashboard',
    'officex_trusted_device'
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
      sameSite: 'lax'
    });
  });

  return response;
}
