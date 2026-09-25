import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, InvoiceEntity, AdjustmentNoteEntity } from "@/lib/rent-roll-store";
import { calculateInvoice } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const tenantId = searchParams.get("tenantId");
    const clientAccountId = searchParams.get("clientAccountId");
    const billingEntityId = searchParams.get("billingEntityId");
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
    let invoices = db.invoices.filter(i => validPropIds.has(i.propertyId));

    if (status && status !== "ALL") {
      invoices = invoices.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (propertyId && propertyId !== "ALL") {
      invoices = invoices.filter(i => i.propertyId === propertyId);
    }
    if (clientAccountId && clientAccountId !== "ALL") {
      invoices = invoices.filter(i => i.clientAccountId === clientAccountId);
    }
    if (billingEntityId && billingEntityId !== "ALL") {
      invoices = invoices.filter(i => i.billingEntityId === billingEntityId);
    }
    if (tenantId && tenantId !== "ALL") {
      invoices = invoices.filter(i => i.tenantId === tenantId);
    }
    if (search) {
      invoices = invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(search) ||
        i.tenantName.toLowerCase().includes(search) ||
        i.propertyName.toLowerCase().includes(search) ||
        i.leaseCode.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("GET /api/rent-roll/invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Generate monthly invoices or create Adjustment Notes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();

    // Action: Create Credit Note / Debit Note (RR-BIL-08)
    if (body.action === "create_adjustment_note") {
      const { invoiceId, noteType = "credit_note", reason, amount, gstRate = 18 } = body;
      const targetInvoice = db.invoices.find(i => i.id === invoiceId);
      if (!targetInvoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const numAmount = Number(amount);
      const gstAmount = Math.round((numAmount * gstRate) / 100);
      const totalAdjustment = numAmount + gstAmount;

      const note: AdjustmentNoteEntity = {
        id: `ADJ-${Date.now()}`,
        orgId: db.organization.id,
        invoiceId,
        noteType: noteType as "credit_note" | "debit_note",
        noteNumber: `${noteType === "credit_note" ? "CN" : "DN"}-${Date.now().toString().slice(-6)}`,
        reason: reason || "Billing adjustment",
        amount: numAmount,
        gstAmount,
        totalAdjustment,
        issuedDate: new Date().toISOString().split("T")[0],
        status: "applied",
        createdAt: new Date().toISOString()
      };

      if (noteType === "credit_note") {
        targetInvoice.balanceDue = Math.max(0, targetInvoice.balanceDue - totalAdjustment);
        if (targetInvoice.balanceDue === 0) targetInvoice.status = "paid";
      } else {
        targetInvoice.balanceDue += totalAdjustment;
        targetInvoice.grossTotal += totalAdjustment;
      }

      if (!db.adjustmentNotes) db.adjustmentNotes = [];
      db.adjustmentNotes.unshift(note);
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "AdjustmentNote",
        action: noteType.toUpperCase(),
        newValues: { noteNumber: note.noteNumber, invoiceNumber: targetInvoice.invoiceNumber, totalAdjustment },
        changedBy: "Finance Billing Admin"
      });

      return NextResponse.json({ success: true, adjustmentNote: note, updatedInvoice: targetInvoice }, { status: 201 });
    }

    // Default Action: Billing Run (RR-BIL-01)
    const { leaseId, billingMonth, dueDate, invoiceType = "consolidated" } = body;

    const targetLeases = leaseId
      ? db.leases.filter(l => l.id === leaseId && (l.status === "active" || l.status === "under_notice"))
      : db.leases.filter(l => l.status === "active" || l.status === "under_notice");

    if (targetLeases.length === 0) {
      return NextResponse.json({ error: "No active leases found for billing generation" }, { status: 400 });
    }

    const createdInvoices: InvoiceEntity[] = [];
    const invoiceDateStr = new Date().toISOString().split('T')[0];
    const dueDateStr = dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fyYear = "2026-27";

    for (const lease of targetLeases) {
      const prop = db.properties.find(p => p.id === lease.propertyId);
      const billingEntity = db.billingEntities.find(b => b.id === (lease.billingEntityId || prop?.billingEntityId)) || db.billingEntities[0];
      const prefix = billingEntity?.invoicePrefix || "APX-INV";

      if (invoiceType === "separate") {
        // Multi-invoice: Separate Base Rent and CAM invoices (RR-BIL-02)
        // 1. Base Rent Invoice
        const rentCalc = calculateInvoice({
          baseRent: lease.monthlyRent,
          camCharges: 0,
          utilityCharges: 0,
          otherCharges: 0,
          gstRate: lease.gstRate || 18,
          tdsRate: lease.tdsRate || 10,
          dueDate: dueDateStr,
          amountPaid: 0
        });

        const rentInvoice: InvoiceEntity = {
          id: `INV-RENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orgId: db.organization.id,
          billingEntityId: billingEntity?.id,
          clientAccountId: lease.clientAccountId,
          leaseId: lease.id,
          leaseCode: lease.leaseCode,
          propertyId: lease.propertyId,
          propertyName: lease.propertyName,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName,
          invoiceNumber: `${prefix}-RENT-${Math.floor(1000 + Math.random() * 9000)}`,
          fyYear,
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          periodStart: invoiceDateStr,
          periodEnd: dueDateStr,
          invoiceType: "rent",
          baseRent: lease.monthlyRent,
          camCharges: 0,
          utilityCharges: 0,
          otherCharges: 0,
          subtotal: rentCalc.subtotal,
          gstRate: lease.gstRate || 18,
          gstAmount: rentCalc.gstAmount,
          grossTotal: rentCalc.grossTotal,
          tdsDeducted: rentCalc.tdsDeducted,
          netPayable: rentCalc.netPayable,
          amountPaid: 0,
          balanceDue: rentCalc.netPayable,
          status: "issued",
          createdAt: new Date().toISOString()
        };

        // 2. CAM Invoice (No TDS on CAM)
        const camCalc = calculateInvoice({
          baseRent: 0,
          camCharges: lease.camMonthly,
          utilityCharges: lease.utilityFixedMonthly || 0,
          otherCharges: lease.otherChargesMonthly || 0,
          gstRate: 18,
          tdsRate: 0, // CAM exempt from 194I
          dueDate: dueDateStr,
          amountPaid: 0
        });

        const camInvoice: InvoiceEntity = {
          id: `INV-CAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orgId: db.organization.id,
          billingEntityId: billingEntity?.id,
          clientAccountId: lease.clientAccountId,
          leaseId: lease.id,
          leaseCode: lease.leaseCode,
          propertyId: lease.propertyId,
          propertyName: lease.propertyName,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName,
          invoiceNumber: `${prefix}-CAM-${Math.floor(1000 + Math.random() * 9000)}`,
          fyYear,
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          periodStart: invoiceDateStr,
          periodEnd: dueDateStr,
          invoiceType: "cam",
          baseRent: 0,
          camCharges: lease.camMonthly,
          utilityCharges: lease.utilityFixedMonthly || 0,
          otherCharges: lease.otherChargesMonthly || 0,
          subtotal: camCalc.subtotal,
          gstRate: 18,
          gstAmount: camCalc.gstAmount,
          grossTotal: camCalc.grossTotal,
          tdsDeducted: 0,
          netPayable: camCalc.netPayable,
          amountPaid: 0,
          balanceDue: camCalc.netPayable,
          status: "issued",
          createdAt: new Date().toISOString()
        };

        db.invoices.unshift(rentInvoice, camInvoice);
        createdInvoices.push(rentInvoice, camInvoice);
      } else {
        // Consolidated GST Tax Invoice
        const calc = calculateInvoice({
          baseRent: lease.monthlyRent,
          camCharges: lease.camMonthly,
          utilityCharges: lease.utilityFixedMonthly,
          otherCharges: lease.otherChargesMonthly || 0,
          gstRate: lease.gstRate || 18,
          tdsRate: lease.tdsRate || 10,
          dueDate: dueDateStr,
          amountPaid: 0
        });

        const invNum = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newInvoice: InvoiceEntity = {
          id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orgId: db.organization.id,
          billingEntityId: billingEntity?.id,
          clientAccountId: lease.clientAccountId,
          leaseId: lease.id,
          leaseCode: lease.leaseCode,
          propertyId: lease.propertyId,
          propertyName: lease.propertyName,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName,
          invoiceNumber: invNum,
          fyYear,
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          periodStart: invoiceDateStr,
          periodEnd: dueDateStr,
          invoiceType: "consolidated",
          baseRent: lease.monthlyRent,
          camCharges: lease.camMonthly,
          utilityCharges: lease.utilityFixedMonthly,
          otherCharges: lease.otherChargesMonthly || 0,
          subtotal: calc.subtotal,
          gstRate: lease.gstRate || 18,
          gstAmount: calc.gstAmount,
          grossTotal: calc.grossTotal,
          tdsDeducted: calc.tdsDeducted,
          netPayable: calc.netPayable,
          amountPaid: 0,
          balanceDue: calc.netPayable,
          status: "issued",
          createdAt: new Date().toISOString()
        };

        db.invoices.unshift(newInvoice);
        createdInvoices.push(newInvoice);
      }
    }

    recordAuditLog({
      entityName: "BillingRun",
      action: "GENERATE_INVOICE_RUN",
      newValues: { count: createdInvoices.length, billingMonth, invoiceType },
      changedBy: "Finance Billing System"
    });

    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: `Generated ${createdInvoices.length} invoice(s) successfully`,
      invoices: createdInvoices
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
