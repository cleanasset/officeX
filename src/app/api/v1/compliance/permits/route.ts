import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const permits = [
      {
        id: "PTW-2026-401",
        permitType: "HOT_WORK",
        title: "Chilled Water Header Pipe Arc Welding & Flange Fitting",
        contractor: "Voltas Mechanical Contractors",
        location: "Basement 1, AHU Plant Room",
        validFrom: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        riskControls: "Fire blankets deployed, 2x 9kg DCP extinguishers on-site, gas detector active, 60-min continuous fire watch post-job.",
        vendorPrerequisiteValid: true, // Contractor insurance & welding cert valid
        status: "active",
        approverName: "Chief EHS Manager",
        approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "PTW-2026-402",
        permitType: "HEIGHT_WORK",
        title: "North Facade Glass Cleaning & BMU Cradle Operation",
        contractor: "Apex Facility Solutions LLP",
        location: "External Perimeter - Floors 10 to 18",
        validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
        riskControls: "Full-body harness with double lanyard, wind speed meter < 25 km/h, drop-zone barricaded 15m radius.",
        vendorPrerequisiteValid: true,
        status: "pending_approval",
        approverName: null,
        approvedAt: null
      },
      {
        id: "PTW-2026-403",
        permitType: "CONFINED_SPACE",
        title: "Raw Water Underground Sump Tank De-sludging",
        contractor: "AquaTech Environmental Services",
        location: "Basement 3, Domestic Water Tank 02",
        validFrom: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 56 * 60 * 60 * 1000).toISOString(),
        riskControls: "Forced mechanical ventilation, multi-gas 4-gas sniffer test (O2, H2S, CO, LEL), lifeline tripod stand.",
        vendorPrerequisiteValid: false, // BR-C11 / C-029: Vendor PSARA/Medical fitness certificate expired!
        prerequisiteError: "Contractor Confined Space Medical Fitness Certificate expired on 10-Sep-2026.",
        status: "approval_blocked",
        approverName: null,
        approvedAt: null
      }
    ];

    return NextResponse.json({
      totalPermits: permits.length,
      activeCount: permits.filter(p => p.status === "active").length,
      pendingCount: permits.filter(p => p.status === "pending_approval").length,
      blockedCount: permits.filter(p => p.status === "approval_blocked").length,
      permits
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      permitType = "HOT_WORK",
      title,
      contractor,
      location,
      validFrom,
      validTo,
      riskControls,
      // For approval requests (BR-C11, C-029)
      isApprovalAction = false,
      permitId,
      vendorPrerequisiteValid = true
    } = body;

    // BR-C11 / C-029: Validate contractor statutory prerequisites
    if (isApprovalAction) {
      if (!vendorPrerequisiteValid) {
        return NextResponse.json(
          {
            error: "BR-C11 Violation: Cannot approve permit. Mandatory vendor compliance certificate or workman insurance is expired.",
            code: "EXPIRED_PREREQUISITE_BLOCKED"
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        permitId,
        status: "active",
        approvedAt: new Date().toISOString(),
        message: "Permit approved. Safety controls verified. Active permit issued."
      });
    }

    if (!title || !contractor || !validFrom || !validTo || !riskControls) {
      return NextResponse.json({ error: "Title, Contractor, Validity Window, and Risk Controls are required." }, { status: 400 });
    }

    const newPermit = {
      id: `PTW-2026-${Math.floor(100 + Math.random() * 900)}`,
      permitType,
      title: title.trim(),
      contractor: contractor.trim(),
      location: location || "Building Campus",
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      riskControls: riskControls.trim(),
      vendorPrerequisiteValid: true,
      status: "pending_approval",
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Permit requested and submitted for EHS review.",
      permit: newPermit
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
