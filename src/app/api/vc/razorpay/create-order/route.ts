import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db";
import { vcSubscriptions } from "@/db/visitor-compliance-schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      planName = "Commercial Pass",
      billingCycle = "monthly",
      couponCode = "",
      orgName = "Commercial Enterprise",
      orgId = "org_vc_default",
      userEmail = "",
    } = body;

    const basePrice = 999;
    const isFullDiscount = couponCode.trim().toLowerCase() === "visitor001";
    const finalAmount = isFullDiscount ? 0 : basePrice;

    // If 100% discount, bypass Razorpay and activate instantly
    if (finalAmount === 0) {
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + 1); // 1 month access

      const [newSub] = await db
        .insert(vcSubscriptions)
        .values({
          orgId,
          orgName,
          planName,
          billingCycle,
          amount: "0.00",
          currency: "INR",
          couponCode: "visitor001",
          discountAmount: "999.00",
          razorpayOrderId: "FREE_COUPON_VISITOR001",
          status: "active",
          startsAt: new Date(),
          endsAt,
        })
        .returning();

      return NextResponse.json({
        success: true,
        freeAccess: true,
        message: "Coupon visitor001 accepted! 100% free access granted.",
        subscription: newSub,
        redirectUrl: "/vc/dashboard",
      });
    }

    // Otherwise, create Razorpay Order
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay credentials not configured in environment.",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Amount in smallest currency unit (paise for INR: 999 * 100 = 99900)
    const options = {
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `rcpt_vc_${Date.now()}`,
      notes: {
        orgId,
        orgName,
        planName,
        userEmail,
        couponCode,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      freeAccess: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      planName,
      billingCycle,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
