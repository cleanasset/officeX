import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, occupant } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const occupantId = searchParams.get("occupant_id");

    const conditions = [
      eq(invoice.org_id, auth.orgId),
      sql`${invoice.balance_due} > 0`,
      sql`${invoice.due_date} < CURRENT_DATE`,
      sql`${invoice.status} != 'written_off'`,
    ];

    if (auth.clientAccountId && auth.clientAccountId !== "all") {
      conditions.push(eq(invoice.client_account_id, auth.clientAccountId));
    }
    if (occupantId) {
      conditions.push(eq(invoice.occupant_id, occupantId));
    }

    const overdueList = await db
      .select({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        gross_total: invoice.gross_total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        status: invoice.status,
        contract_id: invoice.contract_id,
        occupant_id: invoice.occupant_id,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
        days_overdue: sql<number>`GREATEST(0, (CURRENT_DATE - ${invoice.due_date}))::integer`,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .where(and(...conditions))
      .orderBy(desc(sql`(CURRENT_DATE - ${invoice.due_date})`));

    const enrichedList = overdueList.map((item) => {
      const days = item.days_overdue || 0;
      let alertTier = "1-6 days";
      if (days >= 90) alertTier = "90+ days";
      else if (days >= 60) alertTier = "60 days";
      else if (days >= 30) alertTier = "30 days";
      else if (days >= 7) alertTier = "7 days";

      return {
        ...item,
        alert_tier: alertTier,
      };
    });

    return NextResponse.json({
      success: true,
      total_overdue_count: enrichedList.length,
      data: enrichedList,
      overdue_invoices: enrichedList,
    });
  } catch (err: any) {
    console.error("List overdue invoices failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
