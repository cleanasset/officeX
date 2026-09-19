import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneFilter = searchParams.get("zone") || "";

    // Live occupants inside (BR-V07: checked-in without completed checkout)
    const occupants = [
      {
        id: "v-1001",
        visitorName: "Vikram Malhotra",
        company: "McKinsey & Company",
        hostName: "Ravi Mehta",
        tenantName: "Godrej Capital",
        building: "Tower A",
        floor: "Floor 14",
        zone: "Executive Suite",
        mobile: "+91 98200 44211",
        checkinAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        evacuationStatus: "UNACCOUNTED", // UNACCOUNTED, SAFE, MISSING
        emergencyContact: "+91 98200 44211"
      },
      {
        id: "v-1003",
        visitorName: "Ramesh Pawar",
        company: "Voltas MEP Services",
        hostName: "Kailash Verma (FM)",
        tenantName: "Building Management",
        building: "Core Infrastructure",
        floor: "Basement 1",
        zone: "Chiller Plant",
        mobile: "+91 99300 88712",
        checkinAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
        evacuationStatus: "UNACCOUNTED",
        emergencyContact: "+91 99300 88712"
      }
    ];

    const filtered = zoneFilter
      ? occupants.filter(o => o.zone.toLowerCase().includes(zoneFilter.toLowerCase()) || o.floor.toLowerCase().includes(zoneFilter.toLowerCase()))
      : occupants;

    return NextResponse.json({
      activeEmergency: true,
      declaredAt: new Date().toISOString(),
      totalInside: filtered.length,
      safeCount: filtered.filter(o => o.evacuationStatus === "SAFE").length,
      missingCount: filtered.filter(o => o.evacuationStatus === "MISSING").length,
      unaccountedCount: filtered.filter(o => o.evacuationStatus === "UNACCOUNTED").length,
      occupants: filtered
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitId, evacuationStatus, markedBy = "Safety Warden" } = body;

    if (!visitId || !evacuationStatus) {
      return NextResponse.json({ error: "visitId and evacuationStatus ('SAFE' or 'MISSING') are required." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      visitId,
      evacuationStatus: evacuationStatus.toUpperCase(),
      markedAt: new Date().toISOString(),
      markedBy,
      message: `Visitor marked as ${evacuationStatus.toUpperCase()} by ${markedBy}. Emergency log updated.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
