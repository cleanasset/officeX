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

    // 1. Fetch live active contracts with their spaces
    const contractConditions = [sql`${contract.contract_status} IN ('active', 'notice_served', 'holding_over')`];
    if (auth.orgId) {
      contractConditions.push(eq(contract.org_id, auth.orgId));
    }

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
      .where(and(...contractConditions));

    // Fetch all real contract charges
    let allCharges: any[] = [];
    try {
      allCharges = await db.select().from(contract_charge);
    } catch (e) {}

    // Fetch all scheduled rent steps
    let allSteps: any[] = [];
    try {
      allSteps = await db.select().from(rent_step);
    } catch (e) {}

    // Fetch open pipeline deals
    let openDeals: any[] = [];
    try {
      openDeals = await db
        .select()
        .from(deals)
        .where(sql`${deals.stage} NOT IN ('lost', 'closed_lost')`);
    } catch (e) {}

    // Build contract monthly rent map
    const contractRentMap = new Map<string, { baseRent: number; charges: any[] }>();
    activeContracts.forEach((c) => {
      const cCharges = allCharges.filter((ch) => ch.contract_id === c.id);
      let monthlyRent = 0;
      const area = parseFloat(c.spaceArea || "0");

      if (cCharges.length > 0) {
        cCharges.forEach((ch) => {
          if (ch.is_included) return;
          const rate = parseFloat(ch.rate || "0");
          if (ch.calc_basis === "per_sqft" || ch.calc_basis === "per_area") {
            const qty = parseFloat(ch.quantity_basis || String(area || 0));
            monthlyRent += rate * qty;
          } else if (ch.calc_basis === "fixed") {
            monthlyRent += rate;
          } else if (ch.calc_basis === "per_seat") {
            const seats = parseFloat(ch.quantity_basis || "1");
            monthlyRent += rate * seats;
          } else {
            monthlyRent += rate;
          }
        });
      } else {
        // If no explicit charges linked, derive from space area or fallback to 0
        monthlyRent = area > 0 ? area * 100 : 0;
      }

      contractRentMap.set(c.id, { baseRent: monthlyRent, charges: cCharges });
    });

    // 2. Generate 12 months sequence starting current calendar month
    const months: MonthForecast[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const mStr = `${monthNames[d.getMonth()]}-${d.getFullYear()}`;
      const ymStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthStartStr = `${ymStr}-01`;
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const monthEndStr = `${ymStr}-${String(lastDay).padStart(2, "0")}`;

      let contractedRent = 0;
      let scheduledEscalations = 0;
      let renewalsProjected = 0;

      // Evaluate each contract in this month window
      activeContracts.forEach((c) => {
        const rentInfo = contractRentMap.get(c.id);
        const baseRent = rentInfo?.baseRent || 0;
        if (baseRent <= 0) return;

        // Check if contract has already started
        if (c.startDate && c.startDate > monthEndStr) return;

        // Check if contract has expired before this month
        const isExpiringThisOrPast = c.endDate && c.endDate < monthStartStr;
        const isExpiringDuringMonth = c.endDate && c.endDate >= monthStartStr && c.endDate <= monthEndStr;

        if (isExpiringThisOrPast) {
          // Contract already expired, apply renewal probability
          renewalsProjected += baseRent * renewalPct;
        } else if (isExpiringDuringMonth) {
          // Expires mid-month
          contractedRent += baseRent * 0.5;
          renewalsProjected += baseRent * 0.5 * renewalPct;
        } else {
          // Active contract
          // Check for scheduled escalations in rent_step
          const cSteps = allSteps.filter(
            (st) => st.effective_date && st.effective_date <= monthEndStr && rentInfo?.charges.some((ch) => ch.id === st.contract_charge_id)
          );
          let escalationAdd = 0;
          if (cSteps.length > 0) {
            cSteps.forEach((st) => {
              if (st.escalation_type === "fixed_percentage") {
                const pct = parseFloat(st.escalation_value || "5") / 100;
                escalationAdd += baseRent * pct;
              } else if (st.escalation_type === "fixed_amount") {
                escalationAdd += parseFloat(st.escalation_value || "0");
              }
            });
          }
          contractedRent += baseRent;
          scheduledEscalations += escalationAdd;
        }
      });

      // Pipeline deals weighted by probability_pct (Formula D-22 / F-24)
      let pipelineWeighted = 0;
      openDeals.forEach((deal) => {
        const area = parseFloat(deal.proposedAreaSqft || "0");
        const psf = parseFloat(deal.targetRentPsf || "0");
        const proposedRent = (deal as any).proposedMonthlyRent ? parseFloat((deal as any).proposedMonthlyRent) : (area * psf);
        const prob = (deal.probabilityPct != null ? Number(deal.probabilityPct) : 50) / 100;
        
        // Deals expected after 1-2 months lead time
        if (i >= 1 && proposedRent > 0) {
          pipelineWeighted += proposedRent * prob;
        }
      });

      const totalRevenue = contractedRent + scheduledEscalations + renewalsProjected + pipelineWeighted;

      months.push({
        month: mStr,
        year_month: ymStr,
        contracted_rent: Math.round(contractedRent),
        scheduled_escalations: Math.round(scheduledEscalations),
        renewals_projected: Math.round(renewalsProjected),
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
      period_start: months[0]?.month || "Current",
      period_end: months[11]?.month || "12M Out",
      kpis: {
        k15_12m_forecast_total_inr: k15ForecastTotal,
        average_monthly_run_rate_inr: averageMonthlyRunRate,
        contracted_share_pct: contractedSharePct,
        pipeline_deals_count: openDeals.length,
        active_leases_count: activeContracts.length,
        retention_assumption_pct: Math.round(renewalPct * 100),
      },
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
