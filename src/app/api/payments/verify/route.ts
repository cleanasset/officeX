import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is not configured on the server." },
        { status: 500 }
      );
    }

    // Verify cryptographic signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch:", {
        expected: generatedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { error: "Payment verification failed — invalid signature" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        message: "Payment verified successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
