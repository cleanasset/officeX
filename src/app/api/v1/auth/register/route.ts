import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAndStoreOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, mobileNumber, password, mobileCountryCode = "+91" } = body;

    if (!fullName || !email || !mobileNumber || !password) {
      return NextResponse.json(
        { error: "Full Name, Work Email, Mobile Number, and Password are mandatory." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please Sign In." },
          { status: 409 }
        );
      }
    } catch (e) {
      console.warn("DB check fallback:", e);
    }

    // Generate real 6-digit cryptographic verification code
    const { code, error: otpError } = generateAndStoreOtp(cleanEmail);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 429 });
    }

    // Send the real email to the user's inbox
    await sendOtpEmail({
      to: cleanEmail,
      otp: code,
      name: fullName.trim(),
      purpose: "registration",
    });

    const userId = `usr_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email address.",
      userId: userId,
      user: {
        id: userId,
        fullName: fullName.trim(),
        email: cleanEmail,
        mobileNumber: `${mobileCountryCode}${cleanMobile}`,
        emailVerified: false,
        mobileVerified: false,
        status: "PENDING_CONTACT",
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message || "Registration failed." }, { status: 500 });
  }
}
