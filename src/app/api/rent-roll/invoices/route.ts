import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, InvoiceEntity } from "@/lib/rent-roll-store";
import { calculateInvoice } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const tenantId = searchParams.get("tenantId");
    const search = searchParams.get("search")?.toLowerCase();

    const db = getRentRollDb();
    let invoices = db.invoices;

    if (status && status !== "ALL") {
      invoices = invoices.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (propertyId && propertyId !== "ALL") {
      invoices = invoices.filter(i => i.propertyId === propertyId);
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

// POST: Generate monthly invoices for all active leases or a specific lease
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leaseId, billingMonth, dueDate } = body;
    const db = getRentRollDb();

    const targetLeases = leaseId
      ? db.leases.filter(l => l.id === leaseId && l.status === "active")
      : db.leases.filter(l => l.status === "active");

    if (targetLeases.length === 0) {
      return NextResponse.json({ error: "No active leases found for billing generation" }, { status: 400 });
    }

    const createdInvoices: InvoiceEntity[] = [];
    const invoiceDateStr = new Date().toISOString().split('T')[0];
    const dueDateStr = dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const lease of targetLeases) {
      const invNum = `${db.organization.invoicePrefix}-${Math.floor(100 + Math.random() * 900)}`;
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

      const newInvoice: InvoiceEntity = {
        id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orgId: db.organization.id,
        leaseId: lease.id,
        leaseCode: lease.leaseCode,
        propertyId: lease.propertyId,
        propertyName: lease.propertyName,
        tenantId: lease.tenantId,
        tenantName: lease.tenantName,
        invoiceNumber: invNum,
        fyYear: "2026-27",
        invoiceDate: invoiceDateStr,
        dueDate: dueDateStr,
        periodStart: invoiceDateStr,
        periodEnd: dueDateStr,
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

    recordAuditLog({
      entityName: "InvoiceBatch",
      action: "GENERATE_INVOICES",
      newValues: { count: createdInvoices.length, billingMonth },
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
