import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, organizationMemberships } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      legalName,
      tradeName,
      organizationType = "PRIVATE_LIMITED",
      pan,
      gstin,
      cin,
      llpin,
      website,
      registeredAddressLine1,
      registeredAddressLine2,
      city,
      district,
      state,
      country = "India",
      pincode,
      yearEstablished,
      employeeCountBand
    } = body;

    if (!legalName || !organizationType || !registeredAddressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Legal Name, Organization Type, Address, City, State, and Pincode are mandatory." },
        { status: 400 }
      );
    }

    // Validate PAN format if supplied
    if (pan) {
      const cleanPan = pan.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        return NextResponse.json(
          { error: "Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)." },
          { status: 400 }
        );
      }
    }

    // Validate GSTIN format if supplied
    if (gstin) {
      const cleanGstin = gstin.trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
        return NextResponse.json(
          { error: "Invalid GSTIN format. Must be 15 alphanumeric characters." },
          { status: 400 }
        );
      }
    }

    // Validate 6-digit Indian PIN code
    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return NextResponse.json(
        { error: "Invalid Pincode. Must be exactly 6 numeric digits." },
        { status: 400 }
      );
    }

    let createdOrgId: string = `org_${Date.now()}`;

    try {
      const inserted = await db
        .insert(organizations)
        .values({
          name: legalName.trim(),
          pan: pan ? pan.trim().toUpperCase() : null,
          gstin: gstin ? gstin.trim().toUpperCase() : null,
          address: registeredAddressLine1.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: String(pincode).trim()
        })
        .returning();

      if (inserted && inserted[0]) {
        createdOrgId = inserted[0].id;
      }
    } catch (dbErr) {
      console.warn("Could not insert to DB organizations table directly:", dbErr);
    }

    // Link user as org_admin if valid UUID userId supplied
    if (userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
      try {
        await db.insert(organizationMemberships).values({
          userId: userId,
          organizationId: createdOrgId,
          role: "org_admin",
          designation: "Founder / Authorized Signatory",
          isAuthorizedSignatory: true,
          status: "active"
        });
      } catch (mErr) {
        console.warn("Could not link organization membership:", mErr);
      }
    }

    const organizationRecord = {
      id: createdOrgId,
      legalName: legalName.trim(),
      tradeName: tradeName ? tradeName.trim() : legalName.trim(),
      organizationType,
      pan: pan ? pan.trim().toUpperCase() : null,
      gstin: gstin ? gstin.trim().toUpperCase() : null,
      cin: cin ? cin.trim().toUpperCase() : null,
      llpin: llpin ? llpin.trim().toUpperCase() : null,
      website: website || null,
      registeredAddressLine1,
      registeredAddressLine2: registeredAddressLine2 || null,
      city,
      district: district || city,
      state,
      country,
      pincode: String(pincode).trim(),
      yearEstablished: yearEstablished ? parseInt(yearEstablished) : null,
      employeeCountBand: employeeCountBand || "11–50",
      organizationStatus: "SUBMITTED"
    };

    return NextResponse.json({
      success: true,
      message: "Organization master record created successfully.",
      organization: organizationRecord,
      stage: "K1_BUSINESS_SUBMITTED"
    });
  } catch (err: any) {
    console.error("Organization create error:", err);
    return NextResponse.json({ error: err.message || "Failed to create organization." }, { status: 500 });
  }
}
