import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, PropertyEntity, SpaceEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const ownerUserId = searchParams.get("ownerUserId")?.trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail && !ownerUserId) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();

    // Exclude any legacy dummy properties if ever present
    const cleanDbProps = db.properties.filter(p => {
      const lower = (p.name || "").toLowerCase().trim();
      return lower !== "fortune sky" && lower !== "apex horizon tower" && lower !== "signature tower b";
    });

    const clientAccountId = searchParams.get("clientAccountId");
    let scopedProps: PropertyEntity[] = [];

    if (clientAccountId && clientAccountId !== "ALL") {
      scopedProps = cleanDbProps.filter(p => p.clientAccountId === clientAccountId);
    } else if (ownerEmail || ownerUserId) {
      const owned = cleanDbProps.filter(p => 
        (ownerEmail && (p.ownerEmail || "").toLowerCase().trim() === ownerEmail) ||
        (ownerUserId && p.ownerUserId === ownerUserId)
      );
      scopedProps = owned.length > 0 ? owned : cleanDbProps;
    } else {
      scopedProps = cleanDbProps;
    }

    const properties = scopedProps.map(p => {
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
    const {
      name,
      propertyCode,
      type,
      address,
      city,
      state,
      microMarket,
      pincode,
      grade,
      totalArea,
      chargeableArea,
      carpetArea,
      currency,
      operatingCurrency,
      areaUnit,
      geoLat,
      geoLng,
      status,
      assetValue,
      ownerEmail,
      ownerUserId,
      ownerName,
      clientAccountId,
      billingEntityId,
      towers,
      units,
      compliance,
      sourceSystem,
      version,
      dataQualityStatus
    } = body;
    if (!name) {
      return NextResponse.json({ error: "Property name is required" }, { status: 400 });
    }

    let effectiveEmail = (ownerEmail || "").toLowerCase().trim();
    if (!effectiveEmail) {
      try {
        const cookieStore = await cookies();
        effectiveEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    const propId = `PROP-${Date.now()}`;
    const newProp: PropertyEntity = {
      id: propId,
      orgId: body.orgId || db.organization.id,
      propertyCode: propertyCode || `PRP-${Date.now().toString().slice(-4)}`,
      clientAccountId: clientAccountId || "CLI-DEFAULT",
      billingEntityId: billingEntityId || undefined,
      name: name.trim(),
      type: type || "Commercial Office",
      address: address || "",
      city: city || "",
      state: state || "",
      microMarket: microMarket || city || "",
      pincode: pincode || "",
      grade: (grade as any) || "A",
      totalArea: Number(totalArea) || Number(chargeableArea) || 0,
      chargeableArea: Number(chargeableArea) || Number(totalArea) || 0,
      carpetArea: Number(carpetArea) || 0,
      occupancyTargetPct: 95,
      assetValue: Number(assetValue) || 0,
      operatingCurrency: currency || operatingCurrency || "INR",
      areaUnit: areaUnit || "sqft",
      geoLat: geoLat || "",
      geoLng: geoLng || "",
      status: status || "operational",
      towers: Array.isArray(towers) ? towers : [],
      units: Array.isArray(units) ? units : [],
      compliance: compliance || {},
      ownerEmail: effectiveEmail,
      ownerUserId: ownerUserId || "",
      ownerName: ownerName || "",
      sourceSystem: sourceSystem || "manual",
      version: Number(version) || 1,
      dataQualityStatus: dataQualityStatus || "passed"
    };
    db.properties.push(newProp);

    // Sync leasable units into db.spaces for immediate platform-wide lease contracting
    if (Array.isArray(units) && units.length > 0) {
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const spaceRow: SpaceEntity = {
          id: u.id || `SPC-${Date.now()}-${i + 1}`,
          propertyId: propId,
          spaceCode: u.spaceCode || `${newProp.propertyCode}-${u.buildingCode || 'T1'}-${String(u.floorNumber || 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
          buildingName: u.buildingCode || (towers && towers[0]?.name) || "Tower 1",
          floorNumber: Number(u.floorNumber) || 1,
          unitNumber: u.suiteNumber || `Suite ${u.floorNumber}0${i + 1}`,
          spaceType: (u.spaceType as any) || "office",
          carpetArea: Number(u.carpetArea) || 0,
          chargeableArea: Number(u.chargeableArea) || 0,
          seatCapacity: Number(u.seatCapacity) || undefined,
          standardRatePsf: Number(u.askingRate) || 0,
          standardCamPsf: Number(body.standardCamPsf) || 0,
          status: (u.status as any) || "vacant"
        };
        db.spaces.push(spaceRow);
      }
    }

    saveRentRollDb(db);
    return NextResponse.json(newProp);
  } catch (error: any) {
    console.error("POST /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query param is preferred
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Property ID is required for deletion" }, { status: 400 });
    }

    const db = getRentRollDb();
    const propIndex = db.properties.findIndex(p => p.id === id);

    if (propIndex === -1) {
      return NextResponse.json({ error: `Property with ID ${id} not found` }, { status: 404 });
    }

    const deletedProp = db.properties[propIndex];

    // Remove the property
    db.properties.splice(propIndex, 1);

    // Clean up spaces associated with this property
    db.spaces = db.spaces.filter(s => s.propertyId !== id);

    // Clean up leases associated with this property
    const removedLeaseIds = new Set(db.leases.filter(l => l.propertyId === id).map(l => l.id));
    db.leases = db.leases.filter(l => l.propertyId !== id);

    // Clean up escalations for removed leases
    db.escalations = db.escalations.filter(e => !removedLeaseIds.has(e.leaseId));

    // Clean up invoices for removed leases or property
    db.invoices = db.invoices.filter(i => i.propertyId !== id && !removedLeaseIds.has(i.leaseId));

    // Clean up expenses for removed property
    db.expenses = db.expenses.filter(e => e.propertyId !== id);

    // Save database
    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: `Property "${deletedProp.name}" removed successfully`,
      deletedId: id,
      deletedProperty: deletedProp
    });
  } catch (error: any) {
    console.error("DELETE /api/rent-roll/properties error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
