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
      body: JSON.stringify({
        amount: Math.round(Number(amount) || 10000),
        receipt,
        notes,
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      throw new Error(err.error || "Failed to create payment order");
    }

    const orderData = await orderRes.json();
    if (!orderData.orderId) {
      throw new Error("Invalid order response from payment server");
    }

    // Step 2: Ensure Razorpay SDK script is loaded
    if (!window.Razorpay) {
      const loaded = await new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!loaded || !window.Razorpay) {
        throw new Error(
          "Failed to load Razorpay checkout SDK. Please check your internet connection."
        );
      }
    }

    // Step 3: Build sanitized prefill without empty strings
    const prefill: Record<string, string> = {};
    if (prefillName && prefillName.trim()) {
      prefill.name = prefillName.trim();
    }
    if (prefillEmail && prefillEmail.trim()) {
      prefill.email = prefillEmail.trim();
    }
    if (prefillPhone && prefillPhone.trim()) {
      prefill.contact = prefillPhone.trim();
    }

    // Step 4: Sanitize description & notes (ASCII only, reasonable lengths)
    const cleanDescription = (description || "OfficeX Payment")
      .replace(/[\u2014\u2013]/g, "-")
      .replace(/[^\x20-\x7E]/g, "")
      .slice(0, 255);

    const cleanNotes: Record<string, string> = {};
    if (notes && typeof notes === "object") {
      for (const [k, v] of Object.entries(notes)) {
        if (v !== undefined && v !== null) {
          cleanNotes[String(k).slice(0, 40)] = String(v).slice(0, 255);
        }
      }
    }

    // Step 5: Open Razorpay Checkout with server order key priority
    const rzpKey = orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!rzpKey) {
      throw new Error("Razorpay Key ID is not configured on the server or client.");
    }

    const checkoutOptions: any = {
      key: rzpKey,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "OfficeX",
      description: cleanDescription,
      order_id: orderData.orderId,
      theme: {
        color: "#0F8B7D",
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          console.log("Razorpay checkout dismissed by user.");
        },
      },
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          // Verify payment on server
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

          // Payment verified — call success callback
          onSuccess(response);
        } catch (verifyError: any) {
          console.error("Payment verification error:", verifyError);
          if (onFailure) {
            onFailure(verifyError);
          } else {
            console.error(
              `Payment verification failed: ${verifyError.message}`
            );
          }
        }
      },
    };

    if (Object.keys(prefill).length > 0) {
      checkoutOptions.prefill = prefill;
    }
    if (Object.keys(cleanNotes).length > 0) {
      checkoutOptions.notes = cleanNotes;
    }

    const rzp = new window.Razorpay(checkoutOptions);

    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay payment failed:", response?.error);
      const err = response?.error || {
        description: "Payment failed or was cancelled.",
      };
      if (onFailure) {
        onFailure(err);
      }
    });

    rzp.open();
  } catch (error: any) {
    console.error("initiateRazorpayPayment error:", error);
    if (onFailure) {
      onFailure(error);
    } else {
      console.error(`Payment initialization error: ${error.message}`);
    }
  }
}
