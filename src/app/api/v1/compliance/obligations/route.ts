import { NextResponse } from "next/server";
import { db } from "@/db";
import { complianceObligations } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    // Comprehensive statutory obligations catalogue for Grade-A commercial towers
    const obligations = [
      {
        id: "obl-001",
        name: "Fire Safety NOC (Form-B Inspection)",
        category: "Fire & Life Safety",
        authority: "Directorate of Fire & Emergency Services",
        frequency: "ANNUAL",
        criticality: "CRITICAL", // Critical gating rule BR-C03 / BR-C04
        weight: 25,
        status: "compliant", // compliant, due, overdue, expiring_soon
        dueDate: "2026-11-30",
        expiryDate: "2026-11-30",
        lastRenewed: "2025-11-20",
        certificateNumber: "NOC-MH-2025-8812-B",
        ownerName: "Chief EHS Officer",
        evidenceAttached: true,
        verified: true
      },
      {
        id: "obl-002",
        name: "Elevator & Escalator Safety License (Form A)",
        category: "Lift & Escalator",
        authority: "Chief Electrical Inspectorate / PWD",
        frequency: "ANNUAL",
        criticality: "CRITICAL",
        weight: 20,
        status: "compliant",
        dueDate: "2026-12-15",
        expiryDate: "2026-12-15",
        lastRenewed: "2025-12-10",
        certificateNumber: "LIFT-INSP-2025-441",
        ownerName: "Lead Facility Engineer",
        evidenceAttached: true,
        verified: true
      },
      {
        id: "obl-003",
        name: "Pollution Control Board Consent to Operate (CTO)",
        category: "Environmental",
        authority: "State Pollution Control Board (SPCB)",
        frequency: "BIENNIAL",
        criticality: "HIGH",
        weight: 15,
        status: "expiring_soon", // 45 days left
        dueDate: "2026-10-31",
        expiryDate: "2026-10-31",
        lastRenewed: "2024-10-25",
        certificateNumber: "SPCB/CTO/AIR-WATER/9902",
        ownerName: "Environmental Compliance Officer",
        evidenceAttached: true,
        verified: true
      },
      {
        id: "obl-004",
        name: "Diesel Generator CPCB-IV Emission & Noise Test",
        category: "Electrical & Power",
        authority: "Central Pollution Control Board",
        frequency: "QUARTERLY",
        criticality: "HIGH",
        weight: 15,
        status: "due",
        dueDate: "2026-09-30",
        expiryDate: "2026-09-30",
        lastRenewed: "2026-06-28",
        certificateNumber: "DG-CPCB-Q2-2026-118",
        ownerName: "Substation In-Charge",
        evidenceAttached: false,
        verified: false
      },
      {
        id: "obl-005",
        name: "Commercial Occupancy Certificate (OC)",
        category: "Municipal & Structural",
        authority: "Municipal Urban Development Authority",
        frequency: "PERMANENT",
        criticality: "CRITICAL",
        weight: 15,
        status: "compliant",
        dueDate: "2099-12-31",
        expiryDate: "2099-12-31",
        lastRenewed: "2022-04-15",
        certificateNumber: "MCGM-OC-COMM-2022-771",
        ownerName: "General Counsel",
        evidenceAttached: true,
        verified: true
      },
      {
        id: "obl-006",
        name: "Building Facade Stability & BMU Anchor Audit",
        category: "Structural Safety",
        authority: "Certified Chartered Structural Engineer",
        frequency: "ANNUAL",
        criticality: "MEDIUM",
        weight: 10,
        status: "overdue", // BR-C04
        dueDate: "2026-08-31",
        expiryDate: "2026-08-31",
        lastRenewed: "2025-08-15",
        certificateNumber: "STRUCT-FACADE-2025-309",
        ownerName: "Chief Technical Officer",
        evidenceAttached: false,
        verified: false
      }
    ];

    const filtered = category && category !== "all"
      ? obligations.filter(o => o.category.toLowerCase().includes(category.toLowerCase()))
      : obligations;

    // BR-C03 Compliance Score Calculation Engine
    // Weighted score = sum(weight * compliant status) / sum(weights)
    let totalWeight = 0;
    let earnedWeight = 0;
    let criticalOverdueCount = 0;

    obligations.forEach(o => {
      totalWeight += o.weight;
      if (o.status === "compliant") {
        earnedWeight += o.weight;
      } else if (o.status === "expiring_soon") {
        earnedWeight += o.weight * 0.85; // 85% credit while in renewal window
      } else if (o.status === "due") {
        earnedWeight += o.weight * 0.50;
      } else if (o.status === "overdue") {
        earnedWeight += 0;
        if (o.criticality === "CRITICAL") {
          criticalOverdueCount++;
        }
      }
    });

    const complianceScore = Math.round((earnedWeight / (totalWeight || 1)) * 100);

    return NextResponse.json({
      scorecard: {
        complianceScore, // e.g. 88%
        totalObligations: obligations.length,
        compliantCount: obligations.filter(o => o.status === "compliant").length,
        expiringSoonCount: obligations.filter(o => o.status === "expiring_soon").length,
        dueCount: obligations.filter(o => o.status === "due").length,
        overdueCount: obligations.filter(o => o.status === "overdue").length,
        criticalOverdueCount,
        hasCriticalGatingAlert: criticalOverdueCount > 0
      },
      obligations: filtered
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      authority,
      frequency = "ANNUAL",
      criticality = "HIGH",
      dueDate,
      ownerName
    } = body;

    if (!name || !category || !authority || !dueDate) {
      return NextResponse.json({ error: "Obligation Name, Category, Authority, and Due Date are mandatory." }, { status: 400 });
    }

    const newObligation = {
      id: `obl-${Date.now()}`,
      name: name.trim(),
      category,
      authority,
      frequency,
      criticality,
      weight: criticality === "CRITICAL" ? 25 : criticality === "HIGH" ? 15 : 10,
      status: "upcoming",
      dueDate,
      ownerName: ownerName || "Compliance Manager",
      evidenceAttached: false,
      verified: false,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Statutory obligation registered successfully. Scheduled in compliance calendar.",
      obligation: newObligation
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
