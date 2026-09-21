import { NextResponse } from "next/server";
import crypto from "crypto";

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

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch:", {
        expected: generatedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 }
      );
    }

    // Signature verified — payment is authentic
    // Optionally persist to audit log here via DB insert

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
