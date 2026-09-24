import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb } from "@/lib/rent-roll-store";

export async function GET() {
  try {
    const db = getRentRollDb();
    return NextResponse.json(db.organization || {});
  } catch (error: any) {
    console.error("GET /api/rent-roll/organization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getRentRollDb();
    db.organization = {
      ...db.organization,
      name: body.name || body.legalName || db.organization.name || "",
      pan: body.pan || db.organization.pan || "",
      gstin: body.gstin || db.organization.gstin || "",
      address: body.address || db.organization.address || "",
      city: body.city || db.organization.city || "",
      state: body.state || db.organization.state || "",
      pincode: body.pincode || db.organization.pincode || "",
      currency: body.currency || db.organization.currency || "INR",
    };
    saveRentRollDb(db);
    return NextResponse.json({ success: true, organization: db.organization });
  } catch (error: any) {
    console.error("POST /api/rent-roll/organization error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
