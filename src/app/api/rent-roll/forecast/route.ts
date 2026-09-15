import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { generate12MonthForecast, round2 } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const db = getRentRollDb();
    let leases = db.leases;

    if (propertyId && propertyId !== "ALL") {
      leases = leases.filter(l => l.propertyId === propertyId);
    }

    const forecast = generate12MonthForecast(leases.map(l => ({
      monthlyRent: l.monthlyRent,
      camMonthly: l.camMonthly,
      otherChargesMonthly: l.otherChargesMonthly,
      startDate: l.startDate,
      expiryDate: l.endDate,
      escalationPct: l.escalationPct,
      escalationFrequencyMonths: l.escalationFrequencyMonths,
      nextEscalationDate: l.nextEscalationDate,
      status: l.status,
    })));

    const annualProjectedGross = round2(forecast.reduce((sum, item) => sum + item.projectedGross, 0));
    const annualProjectedBase = round2(forecast.reduce((sum, item) => sum + item.projectedBaseRent, 0));
    const annualProjectedCam = round2(forecast.reduce((sum, item) => sum + item.projectedCam, 0));

    return NextResponse.json({
      months: forecast,
      annualProjectedGross,
      annualProjectedBase,
      annualProjectedCam,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/forecast error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
