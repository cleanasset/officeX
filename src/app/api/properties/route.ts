import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(properties).orderBy(desc(properties.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { complianceCertificates, userProperties } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      grade,
      address,
      city,
      state,
      microMarket,
      pincode,
      totalArea,
      ownerCompany,
      ownerName,
      ownerUserId,
      imageUrl,
      latitude,
      longitude,
      compliance
    } = body;

    if (!name || !type || !address || !city || !pincode || !totalArea) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sanitize Grade enum
    const validGrades = ["A", "B", "C", "A+", "B+"];
    let sanitizedGrade: "A" | "B" | "C" | "A+" | "B+" = "A";
    if (grade) {
      const clean = grade.replace(/^Grade\s+/i, "").trim();
      if (validGrades.includes(clean)) {
        sanitizedGrade = clean as any;
      }
    }

    const inserted = await db.insert(properties).values({
      name,
      type,
      grade: sanitizedGrade,
      address,
      city,
      state: state || null,
      microMarket: microMarket || null,
      pincode,
      totalArea: String(totalArea),
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      ownerName: ownerName || null,
      ownerCompany: ownerCompany || "OfficeX Management",
      ownerUserId: ownerUserId || null,
      imageUrl: imageUrl || null
    }).returning();

    const createdProperty = inserted[0];

    // Link to user_properties if ownerUserId exists
    if (ownerUserId) {
      try {
        await db.insert(userProperties).values({
          userId: ownerUserId,
          propertyId: createdProperty.id
        }).onConflictDoNothing();
      } catch (e) {
        console.warn("Could not link user_properties:", e);
      }
    }

    // Insert Compliance Certificates if provided
    if (compliance && createdProperty.id) {
      const today = new Date();
      const getStatus = (dateStr?: string) => {
        if (!dateStr) return "valid";
        const exp = new Date(dateStr);
        if (isNaN(exp.getTime())) return "valid";
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "expired";
        if (diffDays <= 60) return "expiring_soon";
        return "valid";
      };

      const certsToInsert: Array<{
        propertyId: string;
        name: string;
        issuingAuthority: string;
        expiryDate: string;
        status: string;
      }> = [];

      if (compliance.fireNocExpiry) {
        certsToInsert.push({
          propertyId: createdProperty.id,
          name: "Fire Safety NOC",
          issuingAuthority: "State Fire & Emergency Services",
          expiryDate: compliance.fireNocExpiry,
          status: getStatus(compliance.fireNocExpiry)
        });
      }

      if (compliance.liftLicenseExpiry) {
        certsToInsert.push({
          propertyId: createdProperty.id,
          name: "Lift / Elevator Safety License",
          issuingAuthority: "Chief Electrical Inspectorate",
          expiryDate: compliance.liftLicenseExpiry,
          status: getStatus(compliance.liftLicenseExpiry)
        });
      }

      if (compliance.pollutionConsentExpiry) {
        certsToInsert.push({
          propertyId: createdProperty.id,
          name: "Pollution Control Board Consent (CTO)",
          issuingAuthority: "State Pollution Control Board",
          expiryDate: compliance.pollutionConsentExpiry,
          status: getStatus(compliance.pollutionConsentExpiry)
        });
      }

      if (compliance.occupancyCertificate) {
        certsToInsert.push({
          propertyId: createdProperty.id,
          name: "Building Occupancy Certificate (OC)",
          issuingAuthority: "Municipal Urban Development Authority",
          expiryDate: "2099-12-31",
          status: "valid"
        });
      }

      if (certsToInsert.length > 0) {
        try {
          await db.insert(complianceCertificates).values(certsToInsert);
        } catch (err) {
          console.warn("Could not insert compliance certificates:", err);
        }
      }
    }

    return NextResponse.json(createdProperty);
  } catch (error: any) {
    console.error("Property creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { leaseUnits } from "@/db/schema";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    // Clean up dependent child records first
    try {
      await db.delete(complianceCertificates).where(eq(complianceCertificates.propertyId, id));
    } catch (e) {
      console.warn("Could not delete compliance certificates:", e);
    }

    try {
      await db.delete(leaseUnits).where(eq(leaseUnits.propertyId, id));
    } catch (e) {
      console.warn("Could not delete lease units:", e);
    }

    try {
      await db.delete(userProperties).where(eq(userProperties.propertyId, id));
    } catch (e) {
      console.warn("Could not delete user properties:", e);
    }

    // Delete property from database
    await db.delete(properties).where(eq(properties.id, id));
    return NextResponse.json({ success: true, message: "Property listing deleted successfully" });
  } catch (error: any) {
    console.error("Property deletion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
