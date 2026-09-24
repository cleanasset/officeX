import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { generate12MonthForecast, round2 } from "@/lib/rent-roll-engine";

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
      properties = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
    } else if (!isDemo) {
      properties = [];
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let leases = db.leases.filter(l => validPropIds.has(l.propertyId));

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
