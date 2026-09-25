import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { calculateAgingBuckets, diffInDays, parseDate, round2 } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

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
      if (owned.length > 0) {
        properties = owned;
      }
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let invoices = db.invoices.filter(i => validPropIds.has(i.propertyId));

    if (propertyId && propertyId !== "ALL") {
      invoices = invoices.filter(i => i.propertyId === propertyId);
    }

    const agingInputs = invoices.map(i => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      tenantName: i.tenantName,
      invoiceDate: i.invoiceDate,
      dueDate: i.dueDate,
      grossTotal: i.grossTotal,
      tdsDeducted: i.tdsDeducted,
      amountPaid: i.amountPaid,
      balanceDue: i.balanceDue,
      status: i.status
    }));

    const summary = calculateAgingBuckets(agingInputs);
    const now = new Date();

    // Group overdue invoices by tenant
    const tenantMap = new Map<string, {
      tenantId: string;
      tenantName: string;
      propertyName: string;
      current: number;
      bucket0to30: number;
      bucket31to60: number;
      bucket61to90: number;
      bucket90Plus: number;
      totalOutstanding: number;
      invoices: Array<{
        invoiceNumber: string;
        dueDate: string;
        daysOverdue: number;
        balanceDue: number;
        status: string;
      }>;
    }>();

    for (const inv of invoices) {
      if (inv.balanceDue <= 0) continue;

      const due = parseDate(inv.dueDate);
      const daysOverdue = Math.max(0, diffInDays(now, due));

      let record = tenantMap.get(inv.tenantId);
      if (!record) {
        record = {
          tenantId: inv.tenantId,
          tenantName: inv.tenantName,
          propertyName: inv.propertyName,
          current: 0,
          bucket0to30: 0,
          bucket31to60: 0,
          bucket61to90: 0,
          bucket90Plus: 0,
          totalOutstanding: 0,
          invoices: []
        };
        tenantMap.set(inv.tenantId, record);
      }

      record.totalOutstanding = round2(record.totalOutstanding + inv.balanceDue);
      record.invoices.push({
        invoiceNumber: inv.invoiceNumber,
        dueDate: inv.dueDate,
        daysOverdue,
        balanceDue: inv.balanceDue,
        status: inv.status
      });

      if (daysOverdue === 0) {
        record.current = round2(record.current + inv.balanceDue);
      } else if (daysOverdue <= 30) {
        record.bucket0to30 = round2(record.bucket0to30 + inv.balanceDue);
      } else if (daysOverdue <= 60) {
        record.bucket31to60 = round2(record.bucket31to60 + inv.balanceDue);
      } else if (daysOverdue <= 90) {
        record.bucket61to90 = round2(record.bucket61to90 + inv.balanceDue);
      } else {
        record.bucket90Plus = round2(record.bucket90Plus + inv.balanceDue);
      }
    }

    const tenantBreakdown = Array.from(tenantMap.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding);

    return NextResponse.json({
      summary,
      tenantBreakdown,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/aging error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
