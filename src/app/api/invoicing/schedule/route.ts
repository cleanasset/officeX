import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/invoicing/schedule — Invoicing cycle schedule & approval queue counts (§RR-FIN-01, §S-05)
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);

    // Calculate next billing run date (1st of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextBillingDate = nextMonth.toISOString().split("T")[0];

    const todayStr = now.toISOString().split("T")[0];

    // Query status counts
    const invoices = await db
      .select({
        status: invoice.status,
        due_date: invoice.due_date,
        balance_due: invoice.balance_due,
      })
      .from(invoice)
      .where(
        and(
          eq(invoice.org_id, auth.orgId),
          auth.isPortfolioRole ? undefined : (auth.clientAccountId ? eq(invoice.client_account_id, auth.clientAccountId) : undefined)
        )
      );

    let draftCount = 0;
    let approvedCount = 0;
    let overdueCount = 0;
    let paidCount = 0;

    for (const inv of invoices) {
      const balance = parseFloat(inv.balance_due || "0");
      if (inv.status === "draft") {
        draftCount++;
      } else if (inv.status === "issued" || inv.status === "partially_paid") {
        if (inv.due_date && inv.due_date < todayStr && balance > 0) {
          overdueCount++;
        } else {
          approvedCount++;
        }
      } else if (inv.status === "paid") {
        paidCount++;
      } else if (inv.status === "overdue") {
        overdueCount++;
      }
    }

    return NextResponse.json({
      success: true,
      next_billing_date: nextBillingDate,
      invoices_due_for_approval: draftCount,
      aging_summary: {
        draft: draftCount,
        approved: approvedCount,
        overdue: overdueCount,
        paid: paidCount,
      },
      billing_cycles: [
        { cycle_name: "Advance Commercial Rent", frequency: "Monthly", cut_off_day: 1, grace_period_days: 15 },
        { cycle_name: "CAM True-up Reconciliation", frequency: "Quarterly", cut_off_day: 5, grace_period_days: 30 },
        { cycle_name: "Flex Workspace Desks", frequency: "Monthly", cut_off_day: 1, grace_period_days: 7 },
      ],
    });
  } catch (err: any) {
    console.error("GET /api/invoicing/schedule error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch schedule" }, { status: 500 });
  }
}
