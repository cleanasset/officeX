import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, CollectionEntity } from "@/lib/rent-roll-store";
import { round2 } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const propertyId = searchParams.get("propertyId");
    const leaseId = searchParams.get("leaseId");
    const search = searchParams.get("search")?.toLowerCase();

    const db = getRentRollDb();
    let collections = db.collections;

    if (tenantId && tenantId !== "ALL") {
      collections = collections.filter(c => c.tenantId === tenantId);
    }
    if (leaseId && leaseId !== "ALL") {
      collections = collections.filter(c => c.leaseId === leaseId);
    }
    if (search) {
      collections = collections.filter(c =>
        c.receiptNumber.toLowerCase().includes(search) ||
        c.tenantName.toLowerCase().includes(search) ||
        c.referenceNumber?.toLowerCase().includes(search) ||
        c.invoiceNumber?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(collections);
  } catch (error: any) {
    console.error("GET /api/rent-roll/collections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      leaseId,
      amountReceived,
      tdsDeducted,
      bankCharges,
      paymentMode,
      referenceNumber,
      paymentDate,
      bankAccount,
      notes
    } = body;

    if (!amountReceived || !referenceNumber || (!invoiceId && !leaseId)) {
      return NextResponse.json({ error: "Missing required payment settlement fields" }, { status: 400 });
    }

    const db = getRentRollDb();
    const amt = Number(amountReceived);
    const tds = Number(tdsDeducted || 0);
    const charges = Number(bankCharges || 0);
    const netCredited = round2(amt - charges);
    const payDate = paymentDate || new Date().toISOString().split('T')[0];

    let invoice = db.invoices.find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    let lease = db.leases.find(l => l.id === leaseId || l.id === invoice?.leaseId);

    if (!lease && invoice) {
      lease = db.leases.find(l => l.id === invoice.leaseId);
    }

    if (!lease) {
      return NextResponse.json({ error: "Associated lease not found" }, { status: 404 });
    }

    // Update invoice if specified
    if (invoice) {
      invoice.amountPaid = round2((invoice.amountPaid || 0) + amt);
      invoice.tdsDeducted = round2((invoice.tdsDeducted || 0) + tds);
      invoice.balanceDue = round2(Math.max(0, invoice.netPayable - invoice.amountPaid));
      invoice.paidDate = payDate;
      invoice.paymentMode = paymentMode || "neft_rtgs";
      invoice.referenceNumber = referenceNumber;

      if (invoice.balanceDue <= 0.01) {
        invoice.status = "paid";
      } else {
        invoice.status = "partially_paid";
      }
    }

    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
    const receiptNum = `REC-2026-${uniqueSuffix}`;
    const newReceipt: CollectionEntity = {
      id: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orgId: db.organization.id,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber,
      leaseId: lease.id,
      leaseCode: lease.leaseCode,
      tenantId: lease.tenantId,
      tenantName: lease.tenantName,
      propertyName: lease.propertyName,
      receiptNumber: receiptNum,
      paymentDate: payDate,
      paymentMode: paymentMode || "neft_rtgs",
      referenceNumber: referenceNumber,
      amountReceived: amt,
      tdsDeducted: tds,
      bankCharges: charges,
      netCredited,
      bankAccount: bankAccount || "HDFC Bank Corporate Account",
      notes: notes || "Payment received and reconciled.",
      createdAt: new Date().toISOString()
    };

    db.collections.unshift(newReceipt);

    recordAuditLog({
      leaseId: lease.id,
      entityName: "Collection",
      action: "RECORD_PAYMENT",
      newValues: { receiptNumber: receiptNum, amountReceived: amt, referenceNumber },
      changedBy: "Finance Officer"
    });

    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: `Payment receipt ${receiptNum} recorded successfully`,
      receipt: newReceipt,
      updatedInvoice: invoice
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/collections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
