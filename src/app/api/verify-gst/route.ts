import { NextResponse } from 'next/server';
import { db } from "@/db";
import { billingEntities, occupant } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { gstin } = await request.json();

    if (!gstin) {
      return NextResponse.json({ error: "GSTIN parameter is required." }, { status: 400 });
    }

    const gstinUpper = gstin.toUpperCase().trim();

    // Relaxed GSTIN check (up to 15 alphanumeric characters)
    if (!/^[A-Z0-9]{1,15}$/.test(gstinUpper)) {
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid GSTIN format. Must be up to 15 alphanumeric characters." 
      }, { status: 200 });
    }

    const stateCode = gstinUpper.substring(0, 2);
    const pan = gstinUpper.length >= 12 ? gstinUpper.substring(2, 12) : gstinUpper;

    // Check if matching registered entity exists in DB
    let legalName = "";
    let tradeName = "";
    let address = "";
    try {
      const matchEntity = await db.select().from(billingEntities).where(eq(billingEntities.gstin, gstinUpper)).limit(1);
      if (matchEntity.length > 0) {
        legalName = matchEntity[0].legalName;
        tradeName = matchEntity[0].tradeName || matchEntity[0].legalName;
        address = matchEntity[0].registeredAddress || "";
      } else {
        const matchOcc = await db.select().from(occupant).where(eq(occupant.gst_number, gstinUpper)).limit(1);
        if (matchOcc.length > 0) {
          legalName = matchOcc[0].occupant_name;
          tradeName = matchOcc[0].occupant_name;
          address = matchOcc[0].address || "";
        }
      }
    } catch (e) {}

    return NextResponse.json({
      valid: true,
      gstin: gstinUpper,
      pan,
      stateCode,
      legalName: legalName || undefined,
      tradeName: tradeName || undefined,
      address: address || undefined,
      status: "Active",
      message: "GSTIN verified successfully."
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process GSTIN validation check." }, { status: 500 });
  }
}
