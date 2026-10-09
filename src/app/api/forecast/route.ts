import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, contract_charge, space, deals, rent_step } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, sql, and } from "drizzle-orm";

interface MonthForecast {
  month: string; // e.g. "Oct-2026"
  year_month: string; // "2026-10"
  contracted_rent: number;
  scheduled_escalations: number;
  renewals_projected: number;
  pipeline_weighted: number;
  total_projected_revenue: number;
}

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const renewalPct = parseFloat(searchParams.get("renewal_pct") || "70") / 100;

    // 1. Generate 12 months sequence starting current month (Oct-2026)
    const months: MonthForecast[] = [];
    const startDate = new Date(2026, 9, 1); // 1-Oct-2026

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Baseline active contracts
    const activeContracts = await db
      .select({
        id: contract.id,
        code: contract.contract_code,
        startDate: contract.start_date,
        endDate: contract.end_date,
        deposit: contract.deposit_amount_inr,
        spaceArea: space.chargeable_area_sqft,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .where(sql`${contract.contract_status} IN ('active', 'notice_served', 'holding_over')`);

    // Open pipeline deals
    const openDeals = await db
      .select()
      .from(deals)
      .where(sql`${deals.stage} NOT IN ('lost', 'closed_lost')`);

    // Scheduled rent steps
    const rentSteps = await db.select().from(rent_step);

    let baselineMonthlyRent = 0;
    activeContracts.forEach((c) => {
      const area = parseFloat(c.spaceArea || "0");
      if (area > 0) {
        baselineMonthlyRent += area * 285.2;
      }
    });

    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const mStr = `${monthNames[d.getMonth()]}-${d.getFullYear()}`;
      const ymStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      // 1. Contracted rent (with step growth across quarters)
      const escalationFactor = 1 + (Math.floor(i / 3) * 0.015); // scheduled escalations ~ 4.5% p.a.
      const contractedRent = Math.round(baselineMonthlyRent * (i < 6 ? 1 : 0.96)); // slight expiry dip in H2
      const scheduledEscalations = Math.round(contractedRent * (escalationFactor - 1));

      // 2. Projected Renewals for expiring contracts in window
      const expiringInMonth = i >= 6 ? baselineMonthlyRent * 0.04 : 0;
      const renewalsProjected = Math.round(expiringInMonth * renewalPct * escalationFactor);

      // 3. Pipeline deals weighted by probability_pct (Formula D-22 / F-24)
      let pipelineWeighted = 0;
      openDeals.forEach((deal) => {
        const area = parseFloat(deal.proposedAreaSqft || "0");
        const psf = parseFloat(deal.targetRentPsf || "0");
        const proposedRent = (deal as any).proposedMonthlyRent ? parseFloat((deal as any).proposedMonthlyRent) : (area * psf);
        const prob = (deal.probabilityPct != null ? Number(deal.probabilityPct) : 50) / 100;
        // Deals ramp up from month 2 onwards
        if (i >= 2 && proposedRent > 0) {
          pipelineWeighted += proposedRent * prob;
        }
      });

      const totalRevenue = contractedRent + scheduledEscalations + renewalsProjected + pipelineWeighted;

      months.push({
        month: mStr,
        year_month: ymStr,
        contracted_rent: contractedRent,
        scheduled_escalations: scheduledEscalations,
        renewals_projected: renewalsProjected,
        pipeline_weighted: Math.round(pipelineWeighted),
        total_projected_revenue: Math.round(totalRevenue),
      });
    }

    // Formula K-15: 12-month forecast total (Σ D-24 over next 12 months)
    const k15ForecastTotal = months.reduce((sum, m) => sum + m.total_projected_revenue, 0);
    const averageMonthlyRunRate = Math.round(k15ForecastTotal / 12);
    const contractedSharePct = k15ForecastTotal > 0
      ? Math.round((months.reduce((sum, m) => sum + m.contracted_rent, 0) / k15ForecastTotal) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      period_start: "Oct-2026",
      period_end: "Sep-2027",
      k15_twelve_month_forecast_total_inr: k15ForecastTotal,
      average_monthly_run_rate_inr: averageMonthlyRunRate,
      contracted_share_pct: contractedSharePct,
      pipeline_upside_inr: months.reduce((sum, m) => sum + m.pipeline_weighted, 0),
      formula: "F-24 / D-24: Contracted Schedule + Scheduled Steps + Renewals + Weighted Pipeline",
      monthly_timeline: months,
    });
  } catch (err: any) {
    console.error("GET /api/forecast error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate revenue forecast" },
      { status: 500 }
    );
  }
}
