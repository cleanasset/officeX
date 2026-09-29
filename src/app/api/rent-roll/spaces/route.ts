import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, SpaceEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");

    const db = getRentRollDb();
    let spaces = db.spaces || [];

    if (propertyId && propertyId !== "ALL") {
      spaces = spaces.filter(s => s.propertyId === propertyId);
    }
    if (status && status !== "ALL") {
      spaces = spaces.filter(s => s.status === status);
    }

    // Enrich spaces with active lease data if occupied
    const enrichedSpaces = spaces.map(sp => {
      const activeLease = db.leases.find(l => 
        (l.spaceId === sp.id || (l.spacesCovered && l.spacesCovered.some(sc => sc.spaceId === sp.id))) &&
        (l.status === "active" || l.status === "under_notice")
      );

      return {
        ...sp,
        isOccupied: !!activeLease,
        activeLease: activeLease ? {
          id: activeLease.id,
          leaseCode: activeLease.leaseCode,
          tenantName: activeLease.tenantName,
          contractType: activeLease.contractType || "lease_deed",
          direction: activeLease.direction || "receivable",
          monthlyRent: activeLease.monthlyRent,
          baseRentPsf: activeLease.baseRentPsf,
          camMonthly: activeLease.camMonthly,
          startDate: activeLease.startDate,
          endDate: activeLease.endDate,
          lockInEndDate: activeLease.lockInEndDate,
          escalationPct: activeLease.escalationPct,
          approvalStatus: activeLease.approvalStatus || "active"
        } : null
      };
    });

    return NextResponse.json(enrichedSpaces);
  } catch (error: any) {
    console.error("GET /api/rent-roll/spaces error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();

    if (!body.propertyId || !body.unitNumber) {
      return NextResponse.json({ error: "Property ID and Unit Number are required" }, { status: 400 });
    }

    const prop = db.properties.find(p => p.id === body.propertyId);
    if (!prop) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const spaceId = `SPC-${Date.now()}`;
    const chargeableArea = Number(body.chargeableArea) || 1000;
    const standardRate = Number(body.standardRatePsf) || 150;
    const standardCam = Number(body.standardCamPsf) || 25;

    const newSpace: SpaceEntity = {
      id: spaceId,
      propertyId: prop.id,
      spaceCode: body.spaceCode || `U-${body.unitNumber}`,
      buildingName: prop.name,
      floorNumber: Number(body.floorNumber) || 1,
      unitNumber: body.unitNumber,
      spaceType: body.spaceType || "office",
      carpetArea: Number(body.carpetArea) || Math.round(chargeableArea * 0.8),
      chargeableArea,
      seatCapacity: body.seatCapacity ? Number(body.seatCapacity) : undefined,
      standardRatePsf: standardRate,
      standardCamPsf: standardCam,
      standardMarketRentPsf: standardRate,
      potentialMonthlyRent: Math.round(chargeableArea * standardRate),
      daysVacant: 0,
      marketAvailableDate: new Date().toISOString().split("T")[0],
      status: "vacant"
    };

    if (!db.spaces) db.spaces = [];
    db.spaces.push(newSpace);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "Space",
      action: "CREATE_SPACE",
      newValues: {
        spaceId: newSpace.id,
        unit: newSpace.unitNumber,
        area: newSpace.chargeableArea,
        property: prop.name
      },
      changedBy: "Property Manager"
    });

    return NextResponse.json({ success: true, space: newSpace });
  } catch (error: any) {
    console.error("POST /api/rent-roll/spaces error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
