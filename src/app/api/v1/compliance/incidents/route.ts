import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const incidents = [
      {
        id: "INC-2026-081",
        title: "False Fire Alarm Activation - Zone 4 AHU Smoke Detector",
        location: "Tower A, 8th Floor Server Room",
        type: "Fire & Safety",
        severity: "minor",
        occurredAt: "2026-09-15T10:14:00.000Z",
        reportedBy: "Kailash Verma (FM Duty Tech)",
        status: "closed",
        immediateAction: "Silenced hooter, checked server rack, verified no thermal heat; sensor dust cleaned.",
        capaRequired: true,
        capaId: "CAPA-2026-104",
        capaStatus: "closed"
      },
      {
        id: "INC-2026-082",
        title: "Diesel Transfer Pipe Minor Weep Leakage",
        location: "Basement 2, Bulk Fuel Storage Room",
        type: "Environmental & Hazardous Material",
        severity: "moderate",
        occurredAt: "2026-09-17T14:30:00.000Z",
        reportedBy: "Sanjay Shinde (DG Operator)",
        status: "capa_assigned",
        immediateAction: "Isolated valve line 2B, deployed sand spill kit, containment boom placed around sump.",
        capaRequired: true,
        capaId: "CAPA-2026-105",
        capaStatus: "in_progress"
      },
      {
        id: "INC-2026-083",
        title: "Passenger Lift 4 Door Interlock Safety Trip",
        location: "Core B, Ground Lobby",
        type: "Vertical Transportation",
        severity: "critical", // Critical incident C-025
        occurredAt: "2026-09-18T08:45:00.000Z",
        reportedBy: "Lobby Security Guard",
        status: "investigating",
        immediateAction: "Lift grounded to pit, car safely evacuated (0 passengers trapped), barricaded, OEM Otis summoned.",
        capaRequired: true,
        capaId: "CAPA-2026-106",
        capaStatus: "pending_verification"
      }
    ];

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
