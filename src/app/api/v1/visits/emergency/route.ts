import { NextResponse } from "next/server";
import { getVisitorComplianceDb, updateEmergencyEvacuationStatus } from "@/lib/visitor-compliance-store";
import { computeEmergencyRollCall } from "@/lib/visitor-compliance-engine";

export async function GET() {
  try {
    const db = getVisitorComplianceDb();
    const activeVisits = (db.visits || []).filter(v => v.status === "checked_in" || v.status === "overstay");
    
    const rollCall = computeEmergencyRollCall(
      activeVisits.map(v => ({
        id: v.id,
        visitorName: v.visitorName,
        company: v.company,
        hostName: v.hostName,
        tenantName: v.tenantName,
        building: v.building || "Tower A",
        floor: v.floor || "G",
        zone: v.zone,
        checkinAt: v.checkinAt || v.visitStart,
        status: v.evacuationStatus || "UNACCOUNTED"
      }))
    );

    return NextResponse.json({
      emergencyEvacuationActive: !!db.config.emergencyEvacuationActive,
      emergencyDeclaredAt: db.config.emergencyDeclaredAt,
      rollCall
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { active, markedSafeVisits } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "'active' boolean flag is required." }, { status: 400 });
    }

    const result = updateEmergencyEvacuationStatus(active, markedSafeVisits);
    return NextResponse.json({
      success: true,
      message: active ? "🚨 EMERGENCY EVACUATION PROTOCOL ACTIVATED. Live roll call initiated." : "Emergency evacuation stood down.",
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
