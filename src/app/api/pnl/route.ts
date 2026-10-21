import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoice, expenses, property, camPoolCosts } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { sql, eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7); // e.g. "2026-10"

    // 1. Resolve real property details
    let propertyName = "All Portfolio Properties";
    if (propertyId && propertyId !== "all") {
      try {
        const propRec = await db
          .select({ name: property.property_name })
          .from(property)
          .where(eq(property.id, propertyId))
          .limit(1);
        if (propRec.length > 0 && propRec[0].name) {
          propertyName = propRec[0].name;
        }
      } catch (e) {}
    } else {
      try {
        const firstProp = await db
          .select({ name: property.property_name })
          .from(property)
          .limit(1);
        if (firstProp.length > 0 && firstProp[0].name) {
          propertyName = firstProp[0].name;
        }
      } catch (e) {}
    }

    // 2. Query real live invoices
    const invoiceConditions = [sql`${invoice.status} IS NOT NULL`];
    if (auth.orgId) {
      invoiceConditions.push(eq(invoice.org_id, auth.orgId));
    }
    if (propertyId && propertyId !== "all") {
      invoiceConditions.push(eq(invoice.property_id, propertyId));
    }

    const invoices = await db
      .select({
        id: invoice.id,
        invoiceDate: invoice.invoice_date,
        periodStart: invoice.period_start,
        baseRent: invoice.base_rent,
        camCharges: invoice.cam_charges,
        utilityCharges: invoice.utility_charges,
        subtotal: invoice.subtotal,
        grossTotal: invoice.gross_total,
      })
      .from(invoice)
      .where(and(...invoiceConditions));

    let rentRevenue = 0;
    let camRevenue = 0;
    let utilityRevenue = 0;
    let subtotalSum = 0;

    invoices.forEach((inv) => {
      const base = parseFloat(String(inv.baseRent || "0"));
      const cam = parseFloat(String(inv.camCharges || "0"));
      const util = parseFloat(String(inv.utilityCharges || "0"));
      const sub = parseFloat(String(inv.subtotal || "0"));

      rentRevenue += base;
      camRevenue += cam;
      utilityRevenue += util;
      subtotalSum += sub;
    });

    const otherRevenue = Math.max(0, subtotalSum - (rentRevenue + camRevenue + utilityRevenue));
    const totalRevenue = rentRevenue + camRevenue + utilityRevenue + otherRevenue;

    // 3. Query real operating expenses from expenses table and cam_pool_costs
    const expenseConditions: any[] = [];
    if (auth.orgId) {
      expenseConditions.push(eq(expenses.orgId, auth.orgId));
    }
    if (propertyId && propertyId !== "all") {
      expenseConditions.push(eq(expenses.propertyId, propertyId));
    }

    let realExpenses: any[] = [];
    try {
      realExpenses = await db
        .select()
        .from(expenses)
        .where(expenseConditions.length > 0 ? and(...expenseConditions) : sql`1=1`);
    } catch (e) {}

    let realCamCosts: any[] = [];
    try {
      realCamCosts = await db.select().from(camPoolCosts);
    } catch (e) {}

    // Group real expenses by category
    const categoryMap = new Map<string, number>();
    realExpenses.forEach((exp) => {
      const cat = exp.expenseCategory || exp.description || "General Operations";
      const amt = parseFloat(String(exp.totalAmount || exp.amount || "0"));
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amt);
    });

    realCamCosts.forEach((cost) => {
      const cat = cost.category || "CAM Facility Maintenance";
      const amt = parseFloat(String(cost.actual_cost || cost.budget_amount || "0"));
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + amt);
    });

    const opexCategories: Array<{ category: string; amount: number; code: string }> = [];
    categoryMap.forEach((amount, category) => {
      const code = `OPEX-${category.slice(0, 3).toUpperCase()}`;
      opexCategories.push({ category, amount: Math.round(amount), code });
    });

    const totalOpex = opexCategories.reduce((sum, c) => sum + c.amount, 0);

    // 4. Formula F-19: Net Operating Income (NOI) and Net Margin %
    const noi = totalRevenue - totalOpex;
    const noiMarginPct = totalRevenue > 0 ? Math.round((noi / totalRevenue) * 1000) / 10 : 0;
    const marginStatus = noiMarginPct >= 65 ? "green" : noiMarginPct >= 60 ? "amber" : "red";

    // 5. Real 12-Month Historical Trend from actual invoices
    const monthlyMap = new Map<string, { revenue: number; opex: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { revenue: 0, opex: 0 });
    }

    invoices.forEach((inv) => {
      const dateStr = inv.periodStart || inv.invoiceDate;
      if (dateStr) {
        const key = dateStr.slice(0, 7);
        if (monthlyMap.has(key)) {
          const cur = monthlyMap.get(key)!;
          cur.revenue += parseFloat(String(inv.subtotal || inv.grossTotal || "0"));
        }
      }
    });

    realExpenses.forEach((exp) => {
      if (exp.expenseDate) {
        const key = String(exp.expenseDate).slice(0, 7);
        if (monthlyMap.has(key)) {
          const cur = monthlyMap.get(key)!;
          cur.opex += parseFloat(String(exp.totalAmount || exp.amount || "0"));
        }
      }
    });

    const monthlyTrends = Array.from(monthlyMap.entries()).map(([monthKey, val]) => {
      const [y, m] = monthKey.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1, 1);
      const label = d.toLocaleString("en-US", { month: "short" }) + "-" + y.slice(2);
      const rev = Math.round(val.revenue);
      const exp = Math.round(val.opex);
      return {
        month: label,
        revenue: rev,
        opex: exp,
        noi: rev - exp,
      };
    });

    return NextResponse.json({
      success: true,
      period,
      property: propertyName,
      revenue: {
        contracted_base_rent: Math.round(rentRevenue),
        cam_recoveries: Math.round(camRevenue),
        metered_utility_recoveries: Math.round(utilityRevenue),
        car_parking_and_other: Math.round(otherRevenue),
        total_revenue: Math.round(totalRevenue),
      },
      operating_expenses: {
        categories: opexCategories,
        total_operating_expenses: Math.round(totalOpex),
      },
      formula_f19: {
        name: "F-19: Net Operating Income & Margin",
        equation: "NOI = Property Revenue − Operating Expenses; Margin = NOI ÷ Revenue",
        net_operating_income_inr: Math.round(noi),
        noi_margin_pct: noiMarginPct,
        benchmark_status: marginStatus,
        target_benchmark: "Office Prime: ≥ 60.0% (Green)",
      },
      monthly_trend_12m: monthlyTrends,
    });
  } catch (err: any) {
    console.error("GET /api/pnl error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load Property P&L Statement" },
      { status: 500 }
    );
  }
}
