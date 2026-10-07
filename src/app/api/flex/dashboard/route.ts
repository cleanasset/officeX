import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { calculateCentrePnL } from "@/lib/rent-roll/flex/centre-pnl";
import { db } from "@/db";
import { contract, space } from "@/db/rent-roll-schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const pnlList = await calculateCentrePnL(auth.orgId);

    const totalSeats = pnlList.reduce((sum, c) => sum + c.total_seats, 0);
    const occupiedSeats = pnlList.reduce((sum, c) => sum + c.occupied_seats, 0);
    const vacantSeats = pnlList.reduce((sum, c) => sum + c.vacant_seats, 0);
    const avgOccupancy = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 1000) / 10 : 0;

    const totalFlexRevenue = pnlList.reduce((sum, c) => sum + c.revenue.total_flex_revenue_inr, 0);
    const totalHeadLeaseCost = pnlList.reduce((sum, c) => sum + c.costs.head_lease_cost_inr, 0);
    const totalNetIncome = pnlList.reduce((sum, c) => sum + c.net_operating_income_inr, 0);

    return NextResponse.json({
      success: true,
      summary: {
        total_centres: pnlList.length,
        total_seats: totalSeats,
        occupied_seats: occupiedSeats,
        vacant_seats: vacantSeats,
        overall_occupancy_pct: avgOccupancy,
        total_monthly_revenue_inr: Math.round(totalFlexRevenue * 100) / 100,
        total_head_lease_payable_inr: Math.round(totalHeadLeaseCost * 100) / 100,
        net_operating_income_inr: Math.round(totalNetIncome * 100) / 100,
      },
      centres: pnlList,
      data: {
        summary: {
          total_centres: pnlList.length,
          total_seats: totalSeats,
          occupied_seats: occupiedSeats,
          vacant_seats: vacantSeats,
          overall_occupancy_pct: avgOccupancy,
          total_monthly_revenue_inr: Math.round(totalFlexRevenue * 100) / 100,
          total_head_lease_payable_inr: Math.round(totalHeadLeaseCost * 100) / 100,
          net_operating_income_inr: Math.round(totalNetIncome * 100) / 100,
        },
        centres: pnlList,
      },
    });
  } catch (err: any) {
    console.error("Flex dashboard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
