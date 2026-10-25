import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { db } from "@/db";
import { vcSubscriptions } from "@/db/visitor-compliance-schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orgId = "org_vc_default",
      orgName = "Commercial Enterprise",
      planName = "Commercial Pass",
      billingCycle = "monthly",
      amount = "999.00",
      couponCode = "",
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server secret missing" },
        { status: 500 }
      );
    }

    // Generate expected HMAC signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature verification failed." },
        { status: 400 }
      );
    }

    // Insert active subscription record
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + 1);

    const [subscription] = await db
      .insert(vcSubscriptions)
      .values({
        orgId,
        orgName,
        planName,
        billingCycle,
        amount,
        currency: "INR",
        couponCode,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "active",
        startsAt: new Date(),
        endsAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Subscription is active.",
      subscription,
      redirectUrl: "/vc/dashboard",
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
