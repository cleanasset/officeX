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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, grade, address, city, pincode, totalArea, ownerCompany, imageUrl } = body;

    if (!name || !type || !address || !city || !pincode || !totalArea) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await db.insert(properties).values({
      name,
      type,
      grade: grade || "A",
      address,
      city,
      pincode,
      totalArea: String(totalArea),
      ownerCompany: ownerCompany || "OfficeX Management",
      imageUrl: imageUrl || null
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    await db.delete(properties).where(eq(properties.id, id));
    return NextResponse.json({ success: true, message: "Property listing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
