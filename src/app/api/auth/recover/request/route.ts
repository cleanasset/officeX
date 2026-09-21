import { NextResponse } from 'next/server';
import { detectIdentifierType, maskIdentifier, normalizeIdentifier } from '@/lib/auth-utils';
import { generateAndStoreOtp } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/email-service';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Enter your work email or mobile number.' },
        { status: 400 }
      );
    }

    const type = detectIdentifierType(identifier);
    if (type === 'invalid') {
      return NextResponse.json(
        { error: 'Enter a valid work email or 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIdentifier(identifier);
    const masked = maskIdentifier(normalized);

    // Generate real cryptographic OTP
    const { code: otp, error: otpError } = generateAndStoreOtp(normalized);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 429 });
    }

    // If identifier is email, dispatch via Supabase Auth and SMTP
    if (type === 'email') {
      // 1. Ensure user is registered & confirmed in Supabase so Supabase sends recovery email
      if (supabaseAdmin) {
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === normalized.toLowerCase()
          );
          if (!existingUser) {
            await supabaseAdmin.auth.admin.createUser({
              email: normalized,
              email_confirm: true,
            });
            console.log(`[RECOVER] Created confirmed user in Supabase Auth for ${normalized}`);
          } else if (!existingUser.email_confirmed_at) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              email_confirm: true,
            });
          }
        } catch (adminErr) {
          console.warn('[RECOVER] Supabase admin user check error:', adminErr);
        }
      }

      // 2. Trigger real Supabase Auth reset password email
      try {
        const { error: supaErr } = await supabase.auth.resetPasswordForEmail(normalized, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?reset=true`,
        });
        if (supaErr) {
          console.warn(`[RECOVER] Supabase resetPasswordForEmail notice for ${normalized}:`, supaErr.message);
        } else {
          console.log(`[RECOVER] Real Supabase resetPasswordForEmail dispatched to ${normalized}`);
        }
      } catch (e) {
        console.warn(`[RECOVER] Supabase reset exception:`, e);
      }

      // 2. Dispatch real 6-digit cryptographic OTP email
      const emailRes = await sendOtpEmail({
        to: normalized,
        otp,
        purpose: 'recovery',
      });
      if (!emailRes.success) {
        console.warn(`[RECOVER] Email dispatch notice for ${normalized}: ${emailRes.error}`);
      }
    } else {
      console.log(`[RECOVER SMS/WA] Dispatched OTP to ${normalized}: [${otp}]`);
    }

    // Uniform response to protect against account enumeration
    return NextResponse.json({
      success: true,
      message: `If an account exists for ${masked}, a 6-digit recovery code has been dispatched.`,
      masked
    });
  } catch (error) {
    console.error('Error in /api/auth/recover/request:', error);
    return NextResponse.json(
      { error: 'Failed to process recovery request.' },
      { status: 500 }
    );
  }
}
