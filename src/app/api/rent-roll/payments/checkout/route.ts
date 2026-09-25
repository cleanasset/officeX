import { NextRequest, NextResponse } from "next/server";
import { processRazorpayCheckoutInStore, recordAuditLog } from "@/lib/rent-roll-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invoiceIds,
      tenantId,
      tenantName,
      amountPaid,
      paymentMode,
      paymentReference
    } = body;

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json({ success: false, error: "At least one invoice ID is required" }, { status: 400 });
    }

    if (!amountPaid || amountPaid <= 0) {
      return NextResponse.json({ success: false, error: "Valid amountPaid is required" }, { status: 400 });
    }

    const result = processRazorpayCheckoutInStore({
      invoiceIds,
      tenantId: tenantId || "TEN-TECHNOVA",
      tenantName: tenantName || "TechNova Solutions Pvt Ltd",
      amountPaid,
      paymentMode: paymentMode || "upi",
      paymentReference
    });

    recordAuditLog({
      entityName: "Collection",
      action: "PROCESS_ONLINE_CHECKOUT",
      newValues: {
        receiptNumber: result.receipt.receiptNumber,
        amount: amountPaid,
        invoices: invoiceIds,
        paymentMode
      },
      changedBy: "Tenant Portal Checkout Gateway"
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amountPaid.toLocaleString('en-IN')} settled successfully via ${paymentMode.toUpperCase()}. Receipt ${result.receipt.receiptNumber} generated.`,
      receipt: result.receipt,
      allocations: result.allocations,
      updatedInvoices: result.updatedInvoices
    });
  } catch (error: any) {
    console.error("Error processing checkout payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
