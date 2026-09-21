/**
 * Razorpay Client Helper — Shared checkout flow for OfficeX
 *
 * Usage:
 *   import { initiateRazorpayPayment } from "@/lib/razorpay-client";
 *   await initiateRazorpayPayment({
 *     amount: 10000, // ₹100 in paise
 *     receipt: "SUB-ORG-123",
 *     description: "OfficeX Subscription",
 *     onSuccess: (res) => console.log("Paid!", res.razorpay_payment_id),
 *   });
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  amount?: number; // in paise, default 10000 (₹100)
  receipt?: string;
  description?: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillPhone?: string;
  notes?: Record<string, string>;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: any) => void;
}

export async function initiateRazorpayPayment(
  options: RazorpayCheckoutOptions
): Promise<void> {
  const {
    amount = 10000,
    receipt = `rcpt_${Date.now()}`,
    description = "OfficeX Payment",
    prefillName = "",
    prefillEmail = "",
    prefillPhone = "",
    notes = {},
    onSuccess,
    onFailure,
  } = options;

  try {
    // Step 1: Create order on server
    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, receipt, notes }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      throw new Error(err.error || "Failed to create payment order");
    }

    const orderData = await orderRes.json();

    // Step 2: Ensure Razorpay SDK is loaded
    if (!window.Razorpay) {
      throw new Error(
        "Razorpay SDK not loaded. Please refresh the page and try again."
      );
    }

    // Step 3: Open Razorpay Checkout
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "OfficeX",
      description,
      order_id: orderData.orderId,
      prefill: {
        name: prefillName,
        email: prefillEmail,
        contact: prefillPhone,
      },
      notes,
      theme: {
        color: "#0F8B7D",
      },
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          // Step 4: Verify payment on server
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json();
            throw new Error(
              err.error || "Payment verification failed on server"
            );
          }

          // Step 5: Payment verified — call success callback
          onSuccess(response);
        } catch (verifyError: any) {
          console.error("Payment verification error:", verifyError);
          if (onFailure) {
            onFailure(verifyError);
          } else {
            alert(
              `Payment received but verification failed: ${verifyError.message}`
            );
          }
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout dismissed by user.");
        },
      },
    });

    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay payment failed:", response.error);
      if (onFailure) {
        onFailure(response.error);
      } else {
        alert(
          `Payment failed: ${response.error.description || "Unknown error"}`
        );
      }
    });

    rzp.open();
  } catch (error: any) {
    console.error("initiateRazorpayPayment error:", error);
    if (onFailure) {
      onFailure(error);
    } else {
      alert(`Payment error: ${error.message}`);
    }
  }
}
