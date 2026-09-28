import { NextRequest, NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, InvoiceEntity } from "@/lib/rent-roll-store";
import { calculateInvoice } from "@/lib/rent-roll-engine";

export const dynamic = "force-dynamic";

/**
 * Automated Rent Roll Monthly Cycle Cron Job
 * Schedule: 0 0 1 * * (1st of every month at midnight UTC)
 *
 * Actions performed:
 * 1. Generates recurring monthly invoices for all active commercial leases
 * 2. Scans for rent step escalations due within 60 days and creates alerts
 * 3. Scans for lease expiries within 30, 60, and 90 days
 * 4. Records an audit entry for governance & compliance
 */
export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  try {
    // 1. Verify authorization if CRON_SECRET is configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const db = getRentRollDb();
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear();
    const billingMonthStr = `${currentMonth} ${currentYear}`;
    const invoiceDateStr = now.toISOString().split("T")[0];
    const dueDateStr = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const activeLeases = db.leases.filter(
      (l) => l.status === "active" || l.status === "under_notice"
    );

    let generatedCount = 0;
    const generatedInvoiceNumbers: string[] = [];

    // 2. Automated Monthly Billing Generation
    for (const lease of activeLeases) {
      // Check if invoice for this lease and current month already exists
      const currentMonthPrefix = invoiceDateStr.slice(0, 7); // "YYYY-MM"
      const existing = db.invoices.some(
        (i) => i.leaseId === lease.id && i.invoiceDate.startsWith(currentMonthPrefix)
      );

      if (!existing) {
        const prop = db.properties.find((p) => p.id === lease.propertyId);
        const billingEntity =
          db.billingEntities.find(
            (b) => b.id === (lease.billingEntityId || prop?.billingEntityId)
          ) || db.billingEntities[0];

        const prefix = billingEntity?.invoicePrefix || "APX-INV";
        const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
        const invoiceNum = `${prefix}-${currentYear}-${uniqueSuffix}`;

        const calc = calculateInvoice({
          baseRent: lease.monthlyRent,
          camCharges: lease.camMonthly || 0,
          utilityCharges: lease.utilityFixedMonthly || 0,
          otherCharges: 0,
          gstRate: lease.gstRate || 18,
          tdsRate: lease.tdsRate || 10,
          dueDate: dueDateStr,
          amountPaid: 0,
        });

        const newInvoice: InvoiceEntity = {
          id: `INV-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orgId: db.organization.id,
          propertyId: lease.propertyId,
          propertyName: lease.propertyName,
          leaseId: lease.id,
          leaseCode: lease.leaseCode,
          tenantId: lease.tenantId,
          tenantName: lease.tenantName,
          billingEntityId: billingEntity?.id || "BE-APX-01",
          clientAccountId: lease.clientAccountId || "CA-SELF",
          invoiceNumber: invoiceNum,
          fyYear: "2026-27",
          invoiceDate: invoiceDateStr,
          dueDate: dueDateStr,
          periodStart: `${currentMonthPrefix}-01`,
          periodEnd: dueDateStr,
          baseRent: lease.monthlyRent,
          camCharges: lease.camMonthly || 0,
          utilityCharges: lease.utilityFixedMonthly || 0,
          otherCharges: 0,
          subtotal: calc.baseRent + calc.camCharges + calc.utilityCharges,
          grossTotal: calc.grossTotal,
          gstRate: lease.gstRate || 18,
          gstAmount: calc.gstAmount,
          tdsDeducted: calc.tdsDeducted,
          netPayable: calc.netPayable,
          amountPaid: 0,
          balanceDue: calc.balanceDue,
          status: "issued",
          pdfUrl: `/api/rent-roll/invoices/mock/${invoiceNum}.pdf`,
          createdAt: now.toISOString(),
        };

        db.invoices.unshift(newInvoice);
        generatedCount++;
        generatedInvoiceNumbers.push(invoiceNum);
      }
    }

    // 3. Scan Upcoming Escalations (next 60 days)
    const upcomingEscalations = db.escalations.filter((e) => {
      if (e.status !== "pending") return false;
      const escDate = new Date(e.escalationDate);
      const diffDays = Math.round((escDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60;
    });

    // 4. Scan Expiring Leases (next 90 days)
    const expiringSoon = activeLeases.filter((l) => {
      const expDate = new Date(l.endDate);
      const diffDays = Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 90;
    });

    // 5. Save state & record audit log
    if (generatedCount > 0) {
      saveRentRollDb(db);
      recordAuditLog({
        entityName: "AutomatedBillingRun",
        action: "EXECUTE_MONTHLY_CYCLE",
        newValues: {
          billingMonth: billingMonthStr,
          invoicesGenerated: generatedCount,
          invoiceNumbers: generatedInvoiceNumbers,
          upcomingEscalations: upcomingEscalations.length,
          expiringLeases: expiringSoon.length,
        },
        changedBy: "OfficeX Automated Cron Daemon",
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      billingMonth: billingMonthStr,
      generatedInvoices: generatedCount,
      totalActiveLeases: activeLeases.length,
      upcomingEscalationsCount: upcomingEscalations.length,
      expiringLeasesCount: expiringSoon.length,
      message: `Automated cycle completed. Generated ${generatedCount} invoices for ${billingMonthStr}.`,
    });
  } catch (error: any) {
    console.error("Cron /api/cron/rent-roll-billing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
