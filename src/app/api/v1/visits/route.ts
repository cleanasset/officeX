import { NextResponse } from "next/server";
import { getVisits, createVisit } from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || "";
    const status = searchParams.get("status") || "all";
    const visitorType = searchParams.get("visitorType") || "all";
    const search = searchParams.get("search") || "";

    const data = getVisits({
      propertyId: propertyId || undefined,
      status,
      visitorType,
      search
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      visitorName,
      company,
      mobile,
      email,
      visitorType = "guest",
      hostName,
      tenantName,
      purpose,
      visitStart,
      visitEnd,
      accessZone = "LOBBY",
      floor,
      building,
      vehicleRegistration,
      requiresApproval = false,
      propertyId,
      propertyName
    } = body;

    // Validation BR-V01, V-002, V-003
    if (!visitorName || !mobile || !visitStart || !visitEnd) {
      return NextResponse.json(
        { error: "Visitor Name, Mobile, Start Time, and End Time are required." },
        { status: 400 }
      );
    }

    const startTs = new Date(visitStart).getTime();
    const endTs = new Date(visitEnd).getTime();
    if (isNaN(startTs) || isNaN(endTs) || endTs <= startTs) {
      return NextResponse.json(
        { error: "End time must be strictly after start time." },
        { status: 400 }
      );
    }

    const result = createVisit({
      visitorName,
      company,
      mobile,
      email,
      visitorType,
      hostName,
      tenantName,
      purpose,
      visitStart,
      visitEnd,
      accessZone,
      floor,
      building,
      vehicleRegistration,
      requiresApproval,
      propertyId,
      propertyName
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      watchlistHit: result.watchlistHit,
      visit: result.visit
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
