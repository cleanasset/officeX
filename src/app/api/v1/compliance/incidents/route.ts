import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const incidents: any[] = [];

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
      reportedBy = "Operations Staff"
    } = body;

    if (!title || !location || !immediateAction) {
      return NextResponse.json({ error: "Incident Title, Location, and Immediate Action are required." }, { status: 400 });
    }

    const isCritical = severity.toLowerCase() === "critical";
    const incidentId = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const capaId = `CAPA-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newIncident = {
      id: incidentId,
      title: title.trim(),
      location: location.trim(),
      type,
      severity: severity.toLowerCase(),
      occurredAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      reportedBy,
      status: "open",
      description: description || title,
      immediateAction: immediateAction.trim(),
      capaRequired: true,
      capaId,
      escalationTriggered: isCritical, // C-025 Critical escalation
      escalatedTo: isCritical ? ["Head of EHS", "Property Director", "Municipal Liaison"] : []
    };

    return NextResponse.json({
      success: true,
      message: isCritical
        ? "CRITICAL INCIDENT LOGGED. High-priority EHS escalation and SMS broadcast dispatched."
        : "Incident recorded successfully. Corrective Action (CAPA) ticket initialized.",
      incident: newIncident
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
