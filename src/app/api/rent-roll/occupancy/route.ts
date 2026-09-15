import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";
import { calculateOccupancy, round2 } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const db = getRentRollDb();
    let properties = db.properties;
    let spaces = db.spaces;
    let leases = db.leases.filter(l => l.status === "active" || l.status === "under_notice");

    if (propertyId && propertyId !== "ALL") {
      properties = properties.filter(p => p.id === propertyId);
      spaces = spaces.filter(s => s.propertyId === propertyId);
      leases = leases.filter(l => l.propertyId === propertyId);
    }

    const totalPortfolioArea = properties.reduce((sum, p) => sum + p.totalArea, 0);
    const totalOccupiedArea = leases.reduce((sum, l) => sum + l.chargeableArea, 0);
    const portfolioOccupancy = calculateOccupancy(totalPortfolioArea, totalOccupiedArea);

    const propertyOccupancyList = properties.map(p => {
      const propLeases = leases.filter(l => l.propertyId === p.id);
      const propSpaces = spaces.filter(s => s.propertyId === p.id);
      const occupied = propLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
      const occData = calculateOccupancy(p.totalArea, occupied);

      return {
        propertyId: p.id,
        propertyName: p.name,
        city: p.city,
        grade: p.grade,
        totalArea: p.totalArea,
        occupiedArea: occData.occupiedArea,
        vacantArea: occData.vacantArea,
        occupancyPct: occData.occupancyPct,
        targetOccupancyPct: p.occupancyTargetPct || 90,
        gapToTargetPct: round2((p.occupancyTargetPct || 90) - occData.occupancyPct),
        spaces: propSpaces.map(sp => {
          const l = propLeases.find(lease => lease.spaceId === sp.id || lease.unitNumber === sp.unitNumber);
          return {
            ...sp,
            tenantName: l?.tenantName || "Vacant",
            monthlyRent: l?.monthlyRent || 0,
            expiryDate: l?.endDate || null,
          };
        }),
      };
    });

    return NextResponse.json({
      portfolio: portfolioOccupancy,
      properties: propertyOccupancyList,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/occupancy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
