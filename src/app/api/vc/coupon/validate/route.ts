import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || "").trim().toLowerCase();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    // Spec Requirement: coupon visitor001 gives 100% off
    if (code === "visitor001") {
      return NextResponse.json({
        valid: true,
        code: "visitor001",
        discountPercent: 100,
        discountAmount: 999,
        finalPrice: 0,
        badge: "100% OFF — VIP Launch Partner",
        message: "Coupon visitor001 applied! 100% discount granted. No payment required.",
      });
    }

    if (code === "officex50") {
      return NextResponse.json({
        valid: true,
        code: "officex50",
        discountPercent: 50,
        discountAmount: 499.5,
        finalPrice: 499.5,
        badge: "50% OFF",
        message: "50% promotional discount applied successfully.",
      });
    }

    return NextResponse.json(
      {
        valid: false,
        message: "Invalid or expired coupon code. Try visitor001 for 100% off.",
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: err?.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
