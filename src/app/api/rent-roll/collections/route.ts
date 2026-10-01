import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, CollectionEntity, PaymentAllocationEntity } from "@/lib/rent-roll-store";
import { round2, allocatePaymentToInvoice } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const propertyId = searchParams.get("propertyId");
    const leaseId = searchParams.get("leaseId");
    const search = searchParams.get("search")?.toLowerCase();
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties.filter(p => {
      const lower = (p.name || "").toLowerCase().trim();
      return lower !== "fortune sky" && lower !== "apex horizon tower" && lower !== "signature tower b";
    });

    if (ownerEmail) {
      const owned = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
      if (owned.length > 0) properties = owned;
    }

    const validPropIds = new Set(properties.map(p => p.id));
    const validLeaseIds = new Set(db.leases.filter(l => validPropIds.has(l.propertyId)).map(l => l.id));
    let collections = db.collections.filter(c => validLeaseIds.has(c.leaseId));

    if (propertyId && propertyId !== "ALL") {
      const propLeaseIds = new Set(db.leases.filter(l => l.propertyId === propertyId).map(l => l.id));
      collections = collections.filter(c => propLeaseIds.has(c.leaseId));
    }
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
    const db = getRentRollDb();

    // Action: Refund Payment (Table 76: POST /refunds)
    if (body.action === "refund") {
      const { paymentId, receiptNumber: targetReceipt, refundAmount, reason = "Excess payment refund" } = body;
      const payment = db.collections.find(c => c.id === paymentId || c.receiptNumber === targetReceipt);
      if (!payment) {
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      const refundAmt = Number(refundAmount || payment.amountReceived);
      payment.notes = `${payment.notes || ""} [REFUNDED ₹${refundAmt} on ${new Date().toISOString().split("T")[0]}: ${reason}]`;

      // If payment was allocated to an invoice, restore invoice balance
      if (payment.invoiceId || payment.invoiceNumber) {
        const inv = db.invoices.find(i => i.id === payment.invoiceId || i.invoiceNumber === payment.invoiceNumber);
        if (inv) {
          inv.amountPaid = Math.max(0, (inv.amountPaid || 0) - refundAmt);
          inv.balanceDue = round2(inv.netPayable - inv.amountPaid);
          inv.status = inv.balanceDue > 0 ? (inv.amountPaid > 0 ? "partially_paid" : "issued") : "paid";
        }
      }

      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Collection",
        action: "PROCESS_REFUND",
        newValues: { receiptNumber: payment.receiptNumber, refundAmt, reason },
        changedBy: body.refundedBy || "Finance Controller"
      });

      return NextResponse.json({
        success: true,
        message: `Refund of ₹${refundAmt.toLocaleString('en-IN')} processed for ${payment.receiptNumber} (Table 76).`,
        payment
      });
    }

    // Action: Manual Allocation with Audit Trail (RR-PAY-04, UAT-17)
    if (body.action === "manual_allocation") {
      const { paymentId, allocations, allocatedBy } = body;
      if (!Array.isArray(allocations) || allocations.length === 0) {
        return NextResponse.json({ error: "allocations array is required for manual allocation" }, { status: 400 });
      }

      const totalManualAllocated = allocations.reduce((sum: number, a: any) => sum + Number(a.allocatedAmount || 0), 0);
      const allocatedRecords: any[] = [];
      const newPaymentId = paymentId || `REC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      for (const item of allocations) {
        const inv = db.invoices.find(i => i.id === item.invoiceId || i.invoiceNumber === item.invoiceId);
        if (inv) {
          const allocAmt = Number(item.allocatedAmount);
          inv.amountPaid = round2((inv.amountPaid || 0) + allocAmt);
          inv.balanceDue = round2(Math.max(0, inv.netPayable - inv.amountPaid));
          inv.status = inv.balanceDue <= 0.01 ? "paid" : "partially_paid";

          const allocRec: PaymentAllocationEntity = {
            id: `ALLOC-${Date.now()}-${inv.id.slice(-4)}`,
            paymentId: newPaymentId,
            invoiceId: inv.id,
            allocatedGst: round2(allocAmt * 0.18),
            allocatedBaseRent: round2(allocAmt * 0.82),
            allocatedCam: 0,
            allocatedOther: 0,
            totalAllocated: allocAmt,
            allocatedAt: new Date().toISOString()
          };
          if (!db.paymentAllocations) db.paymentAllocations = [];
          db.paymentAllocations.unshift(allocRec);
          allocatedRecords.push({ invoiceNumber: inv.invoiceNumber, allocated: allocAmt, balanceDue: inv.balanceDue });
        }
      }

      saveRentRollDb(db);

      recordAuditLog({
        entityName: "PaymentAllocation",
        action: "MANUAL_ALLOCATION",
        newValues: {
          totalAllocated: totalManualAllocated,
          invoicesCount: allocations.length,
          allocatedBy: allocatedBy || "Authorized Finance Specialist"
        },
        changedBy: allocatedBy || "Authorized Finance Specialist"
      });

      return NextResponse.json({
        success: true,
        message: `Manual allocation of ₹${totalManualAllocated.toLocaleString('en-IN')} completed with audit trail (UAT-17).`,
        allocatedRecords
      });
    }

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

    if (!amountReceived || Number(amountReceived) <= 0 || !referenceNumber || (!invoiceId && !leaseId)) {
      return NextResponse.json({ error: "Missing or invalid payment settlement fields. Valid amount (> 0), UTR reference number, and invoice or lease are required." }, { status: 400 });
    }

    // Duplicate payment reference check (RR-PAY-03, UAT-34: No duplicate allocation)
    const existingPayment = db.collections.find(c => c.referenceNumber === referenceNumber);
    if (existingPayment) {
      return NextResponse.json({
        success: false,
        duplicate: true,
        error: `Duplicate payment detected. Reference ${referenceNumber} has already been allocated to receipt ${existingPayment.receiptNumber} (UAT-34).`,
        existingReceipt: existingPayment
      }, { status: 409 });
    }

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

    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
    const receiptNum = `REC-2026-${uniqueSuffix}`;
    const newPaymentId = `REC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Multi-invoice or Oldest-First Allocation (RR-PAY-03)
    if (body.action === "allocate_oldest_first" || Array.isArray(body.invoiceIds)) {
      let candidateInvoices = db.invoices.filter(i => 
        i.leaseId === lease.id && (i.status === "issued" || i.status === "overdue" || i.status === "partially_paid")
      );

      if (Array.isArray(body.invoiceIds) && body.invoiceIds.length > 0) {
        candidateInvoices = candidateInvoices.filter(i => body.invoiceIds.includes(i.id));
      }

      // Sort chronological (oldest due date first)
      candidateInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      let remainingToAllocate = amt;
      const allocatedInvoices: any[] = [];

      for (const inv of candidateInvoices) {
        if (remainingToAllocate <= 0) break;
        const due = inv.balanceDue;
        const allocAmt = Math.min(remainingToAllocate, due);

        const alloc = allocatePaymentToInvoice(allocAmt, {
          baseRent: inv.baseRent,
          camCharges: inv.camCharges,
          gstAmount: inv.gstAmount,
          otherCharges: inv.otherCharges || 0,
          balanceDue: inv.balanceDue
        });

        const allocRec: PaymentAllocationEntity = {
          id: `ALLOC-${Date.now()}-${inv.id.slice(-4)}`,
          paymentId: newPaymentId,
          invoiceId: inv.id,
          allocatedGst: alloc.allocatedGst,
          allocatedBaseRent: alloc.allocatedBaseRent,
          allocatedCam: alloc.allocatedCam,
          allocatedOther: alloc.allocatedOther,
          totalAllocated: alloc.totalAllocated,
          allocatedAt: new Date().toISOString()
        };

        if (!db.paymentAllocations) db.paymentAllocations = [];
        db.paymentAllocations.unshift(allocRec);

        inv.amountPaid = round2((inv.amountPaid || 0) + allocAmt);
        inv.balanceDue = round2(Math.max(0, inv.netPayable - inv.amountPaid));
        inv.paidDate = payDate;
        inv.paymentMode = paymentMode || "neft_rtgs";
        inv.referenceNumber = referenceNumber;
        inv.status = inv.balanceDue <= 0.01 ? "paid" : "partially_paid";

        allocatedInvoices.push({ invoiceNumber: inv.invoiceNumber, allocated: allocAmt, newStatus: inv.status });
        remainingToAllocate = round2(remainingToAllocate - allocAmt);
      }

      const multiReceipt: CollectionEntity = {
        id: newPaymentId,
        orgId: db.organization.id,
        invoiceNumber: allocatedInvoices.map(a => a.invoiceNumber).join(", "),
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
        notes: notes || `Oldest-first allocation across ${allocatedInvoices.length} invoices.`,
        createdAt: new Date().toISOString()
      };

      db.collections.unshift(multiReceipt);
      saveRentRollDb(db);

      return NextResponse.json({
        success: true,
        message: `Allocated ₹${amt.toLocaleString('en-IN')} across ${allocatedInvoices.length} invoices (Oldest-First)`,
        receipt: multiReceipt,
        allocatedInvoices
      }, { status: 201 });
    }

    // Calculate sub-ledger allocation hierarchy for single invoice (RR-PAY-04)
    let allocationRecord: PaymentAllocationEntity | null = null;

    if (invoice) {
      const alloc = allocatePaymentToInvoice(amt, {
        baseRent: invoice.baseRent,
        camCharges: invoice.camCharges,
        gstAmount: invoice.gstAmount,
        otherCharges: invoice.otherCharges || 0,
        balanceDue: invoice.balanceDue
      });

      allocationRecord = {
        id: `ALLOC-${Date.now()}`,
        paymentId: newPaymentId,
        invoiceId: invoice.id,
        allocatedGst: alloc.allocatedGst,
        allocatedBaseRent: alloc.allocatedBaseRent,
        allocatedCam: alloc.allocatedCam,
        allocatedOther: alloc.allocatedOther,
        totalAllocated: alloc.totalAllocated,
        allocatedAt: new Date().toISOString()
      };

      if (!db.paymentAllocations) db.paymentAllocations = [];
      db.paymentAllocations.unshift(allocationRecord);

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

    const newReceipt: CollectionEntity = {
      id: newPaymentId,
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
      allocation: allocationRecord,
      updatedInvoice: invoice
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/collections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
