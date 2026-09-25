import { NextRequest, NextResponse } from "next/server";
import { disputeInvoiceInStore, recordAuditLog } from "@/lib/rent-roll-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, reason, disputeAmount, disputeRemark } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "invoiceId is required" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ success: false, error: "Dispute reason is required" }, { status: 400 });
    }

    const updatedInvoice = disputeInvoiceInStore(
      invoiceId,
      reason,
      Number(disputeAmount) || 0,
      disputeRemark || ""
    );

    recordAuditLog({
      entityName: "Invoice",
      action: "RAISE_INVOICE_DISPUTE",
      newValues: {
        invoiceNumber: updatedInvoice.invoiceNumber,
        reason,
        disputeAmount,
        tenant: updatedInvoice.tenantName
      },
      changedBy: "Tenant Representative"
    });

    return NextResponse.json({
      success: true,
      message: `Dispute raised on invoice ${updatedInvoice.invoiceNumber}. Asset manager alerted.`,
      invoice: updatedInvoice
    });
  } catch (error: any) {
    console.error("Error raising invoice dispute:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
