import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { calculateNOI, calculateCapRate, round2 } from "@/lib/rent-roll-engine";

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
    let leases = db.leases.filter(l => validPropIds.has(l.propertyId));
    let expenses = db.expenses.filter(e => validPropIds.has(e.propertyId));

    if (propertyId && propertyId !== "ALL") {
      properties = properties.filter(p => p.id === propertyId);
      leases = leases.filter(l => l.propertyId === propertyId);
      expenses = expenses.filter(e => e.propertyId === propertyId);
    }

    const activeLeases = leases.filter(l => l.status === "active" || l.status === "under_notice");

    // Revenue streams
    const monthlyBaseRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
    const monthlyCamRecovery = activeLeases.reduce((sum, l) => sum + l.camMonthly, 0);
    const monthlyUtilityRecovery = activeLeases.reduce((sum, l) => sum + l.utilityFixedMonthly, 0);
    const monthlyGrossRevenue = round2(monthlyBaseRent + monthlyCamRecovery + monthlyUtilityRecovery);

    // Expense categorization
    const expenseCategories: Record<string, number> = {
      cam: 0,
      property_tax: 0,
      insurance: 0,
      utility_water: 0,
      utility_power: 0,
      repairs_maintenance: 0,
      statutory_fees: 0,
      mgmt_fee: 0,
      other: 0,
    };

    for (const exp of expenses) {
      const cat = exp.expenseCategory || "other";
      expenseCategories[cat] = round2((expenseCategories[cat] || 0) + exp.amount);
    }

    const totalMonthlyExpenses = round2(Object.values(expenseCategories).reduce((sum, val) => sum + val, 0));
    const noiData = calculateNOI({
      grossRevenue: monthlyGrossRevenue,
      totalExpenses: totalMonthlyExpenses
    });

    const totalAssetVal = properties.reduce((sum, p) => sum + (p.assetValue || 0), 0);
    const capRateData = calculateCapRate(noiData.noi * 12, totalAssetVal);

    // Property-by-property comparison
    const propertyPnL = properties.map(p => {
      const propLeases = activeLeases.filter(l => l.propertyId === p.id);
      const propExpenses = expenses.filter(e => e.propertyId === p.id);

      const propGrossRev = round2(propLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0));
      const propExp = round2(propExpenses.reduce((sum, e) => sum + e.amount, 0));
      const propNOI = calculateNOI({ grossRevenue: propGrossRev, totalExpenses: propExp });
      const propCap = calculateCapRate(propNOI.noi * 12, p.assetValue || 0);

      return {
        propertyId: p.id,
        propertyName: p.name,
        city: p.city,
        grade: p.grade,
        grossMonthlyRevenue: propGrossRev,
        monthlyExpenses: propExp,
        monthlyNOI: propNOI.noi,
        annualNOI: round2(propNOI.noi * 12),
        oerPct: propNOI.oerPct,
        capRatePct: propCap.capRatePct,
        assetValue: p.assetValue || 0,
      };
    });

    return NextResponse.json({
      portfolio: {
        monthlyBaseRent,
        monthlyCamRecovery,
        monthlyUtilityRecovery,
        monthlyGrossRevenue,
        annualGrossRevenue: round2(monthlyGrossRevenue * 12),
        expenseBreakdown: expenseCategories,
        totalMonthlyExpenses,
        annualExpenses: round2(totalMonthlyExpenses * 12),
        monthlyNOI: noiData.noi,
        annualNOI: round2(noiData.noi * 12),
        oerPct: noiData.oerPct,
        totalAssetValue: totalAssetVal,
        capRatePct: capRateData.capRatePct,
      },
      propertyPnL,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/pnl error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
