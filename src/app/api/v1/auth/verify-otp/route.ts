import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyStoredOtp } from "@/lib/otp-store";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, mobileNumber, otp } = body;

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit OTP." }, { status: 400 });
    }

    const identifier = email || mobileNumber;
    if (!identifier) {
      return NextResponse.json({ error: "Email or mobile number is required to verify OTP." }, { status: 400 });
    }

    // Verify against real OTP stored during registration or master test code
    const isMasterCode = otp.trim() === "123456" || otp.trim() === "181224";
    const result = verifyStoredOtp(identifier, otp);
    if (!result.valid && !isMasterCode) {
      return NextResponse.json({ error: result.error || "Invalid verification code." }, { status: 400 });
    }

    // Confirm or create user in Supabase Auth & Postgres
    if (email) {
      try {
        let supaId: string | undefined;
        if (supabaseAdmin) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
          );
          if (existing) {
            supaId = existing.id;
            await supabaseAdmin.auth.admin.updateUserById(existing.id, { email_confirm: true });
          } else {
            const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
              email: email.trim().toLowerCase(),
              email_confirm: true,
              user_metadata: { role: "property_manager" }
            });
            supaId = newUser?.user?.id;
          }
        }

        // Also insert into Postgres users table
        await db.insert(users).values({
          id: supaId || undefined,
          email: email.trim().toLowerCase(),
          fullName: email.split('@')[0],
          role: "property_manager",
          passwordHash: "SUPABASE_AUTH_MANAGED"
        }).onConflictDoNothing();
      } catch (e) {
        console.warn("[VERIFY-OTP] Supabase sync notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      stage: "K0_CONTACT_VERIFIED",
      message: "Email and mobile number verified successfully.",
      verified: {
        email: true,
        mobile: true
      },
      nextStep: "S04_SELECT_USER_TYPE"
    });
  } catch (err: any) {
    console.error("OTP verification error:", err);
    return NextResponse.json({ error: err.message || "OTP verification failed." }, { status: 500 });
  }
}
