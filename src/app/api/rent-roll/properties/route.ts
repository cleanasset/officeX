import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, PropertyEntity } from "@/lib/rent-roll-store";

export async function GET() {
  try {
    const db = getRentRollDb();
    const properties = db.properties.map(p => {
      const propLeases = db.leases.filter(l => l.propertyId === p.id && (l.status === "active" || l.status === "under_notice"));
      const occupiedArea = propLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
      const occupancyPct = p.totalArea > 0 ? Math.round((occupiedArea / p.totalArea) * 1000) / 10 : 0;
      const totalMonthlyRent = propLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
      const totalBilling = propLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);

      return {
        ...p,
        activeLeasesCount: propLeases.length,
        occupiedArea,
        vacantArea: Math.max(0, p.totalArea - occupiedArea),
        occupancyPct,
        totalMonthlyRent,
        totalBilling,
      };
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("GET /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, address, city, state, microMarket, pincode, grade, totalArea, chargeableArea, assetValue } = body;
    if (!name) {
      return NextResponse.json({ error: "Property name is required" }, { status: 400 });
    }
    const db = getRentRollDb();
    const newProp: PropertyEntity = {
      id: `PROP-${Date.now()}`,
      orgId: db.organization.id,
      name,
      type: type || "Commercial Office",
      address: address || "Commercial Business District",
      city: city || "Mumbai",
      state: state || "Maharashtra",
      microMarket: microMarket || city || "CBD",
      pincode: pincode || "400001",
      grade: grade || "A",
      totalArea: Number(totalArea) || 50000,
      chargeableArea: Number(chargeableArea) || Number(totalArea) || 50000,
      occupancyTargetPct: 95,
      assetValue: Number(assetValue) || 0,
    };
    db.properties.push(newProp);
    saveRentRollDb(db);
    return NextResponse.json(newProp);
  } catch (error: any) {
    console.error("POST /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
