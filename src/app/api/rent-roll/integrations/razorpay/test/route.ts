import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const keyId = body.keyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = body.keySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Razorpay Credentials",
          message: "Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables or enter them above."
        },
        { status: 400 }
      );
    }

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const startTime = Date.now();

    // 1. Verify Authentication against Razorpay Live API
    const response = await fetch("https://api.razorpay.com/v1/payments?count=1", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        statusCode: response.status,
        error: data.error?.description || "Razorpay authentication failed",
        message: `Razorpay rejected the credentials with code: ${data.error?.code || response.statusText}.`,
        keyMode: keyId.startsWith("rzp_live") ? "LIVE" : "TEST"
      });
    }

    // 2. Optionally create a test order if action === "create_test_order"
    let testOrder = null;
    if (body.action === "create_test_order") {
      const rzpInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      testOrder = await rzpInstance.orders.create({
        amount: 100, // ₹1 (100 paise)
        currency: "INR",
        receipt: `test_int_${Date.now()}`,
        notes: {
          purpose: "OfficeX Gateway Live Integration Test",
          environment: keyId.startsWith("rzp_live") ? "production" : "sandbox"
        }
      });
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      latencyMs,
      keyMode: keyId.startsWith("rzp_live") ? "LIVE PRODUCTION" : "TEST SANDBOX",
      keyIdMasked: `${keyId.slice(0, 8)}...${keyId.slice(-4)}`,
      testOrder,
      message: `Verified successfully with Razorpay servers in ${latencyMs}ms. Credentials are authentic and ready.`
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        message: `Failed to contact Razorpay API: ${err.message}`
      },
      { status: 500 }
    );
  }
}
