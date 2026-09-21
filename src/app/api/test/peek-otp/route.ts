import { NextResponse } from 'next/server';
import { peekOtpForTesting } from '@/lib/otp-store';

export const revalidate = 0;

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier') || '';
  const code = peekOtpForTesting(identifier);

  return NextResponse.json({ identifier, code });
}
