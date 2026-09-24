import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, PropertyEntity } from "@/lib/rent-roll-store";

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

    let scopedProps: PropertyEntity[] = [];
    if (ownerEmail || ownerUserId) {
      scopedProps = cleanDbProps.filter(p => 
        (ownerEmail && (p.ownerEmail || "").toLowerCase().trim() === ownerEmail) ||
        (ownerUserId && p.ownerUserId === ownerUserId)
      );
    } else if (isDemo) {
      scopedProps = cleanDbProps;
    } else {
      scopedProps = [];
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
      type,
      address,
      city,
      state,
      microMarket,
      pincode,
      grade,
      totalArea,
      chargeableArea,
      assetValue,
      ownerEmail,
      ownerUserId,
      ownerName
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
      ownerEmail: effectiveEmail,
      ownerUserId: ownerUserId || "",
      ownerName: ownerName || "",
    };
    db.properties.push(newProp);
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
