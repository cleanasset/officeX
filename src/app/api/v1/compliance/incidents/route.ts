import { NextResponse } from "next/server";
import { getVisitorComplianceDb, logIncident } from "@/lib/visitor-compliance-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId") || "";

    const db = getVisitorComplianceDb();
    let incidents = db.incidents || [];

    if (propertyId && propertyId !== "ALL") {
      incidents = incidents.filter(i => !i.propertyId || i.propertyId === propertyId);
    }

    return NextResponse.json({
      totalIncidents: incidents.length,
      openCount: incidents.filter(i => i.status !== "closed").length,
      criticalCount: incidents.filter(i => i.severity === "critical").length,
      incidents
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      location,
      type = "Safety Hazard",
      severity = "moderate",
      description,
      immediateAction,
      reportedBy = "Operations Staff",
      propertyId
    } = body;

    if (!title || !location || !immediateAction) {
      return NextResponse.json(
        { error: "Incident Title, Location, and Immediate Action are required." },
        { status: 400 }
      );
    }

    const result = logIncident({
      title,
      location,
      type,
      severity,
      description,
      immediateAction,
      reportedBy,
      propertyId
    });

    return NextResponse.json({
      success: true,
      message: result.isCritical
        ? "🚨 CRITICAL INCIDENT LOGGED. High-priority EHS escalation and SMS broadcast dispatched."
        : "Incident recorded and corrective action assigned.",
      incident: result.incident,
      capa: result.capa
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
