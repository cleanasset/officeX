import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    const conditions = [
      eq(occupant.org_id, auth.orgId),
      sql`${occupant.deleted_at} IS NULL`,
    ];
    if (query) {
      conditions.push(
        or(
          ilike(occupant.occupant_name, `%${query}%`),
          ilike(occupant.occupant_code, `%${query}%`),
          ilike(occupant.pan_number, `%${query}%`),
          ilike(occupant.gst_number, `%${query}%`)
        )!
      );
    }

    const list = await db
      .select()
      .from(occupant)
      .where(and(...conditions))
      .orderBy(desc(occupant.created_at));

    // Map occupant model to friendly tenant directory schema
    const formatted = list.map((occ) => ({
      id: occ.id,
      tenant_name: occ.occupant_name,
      trade_name: occ.occupant_name,
      occupant_code: occ.occupant_code,
      pan: occ.pan_number,
      gstin: occ.gst_number,
      email: occ.email,
      phone: occ.phone,
      industry_sector: occ.industry_sector,
      status: occ.occupant_status || "active",
      unit_number: "Suite Master",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch tenants", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const name = body.tenant_name || body.occupant_name || "New Commercial Tenant";
    const code =
      body.occupant_code ||
      body.tenant_code ||
      `OCC-${name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const [inserted] = await db
      .insert(occupant)
      .values({
        org_id: body.org_id || auth.orgId,
        client_account_id: body.client_account_id || null,
        occupant_name: name,
        occupant_code: code,
        occupant_type: body.occupant_type || "company",
        pan_number: body.pan || body.pan_number || null,
        gst_number: body.gstin || body.gst_number || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.billing_address || body.address || null,
        industry_sector: body.industry_sector || null,
        occupant_status: "active",
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inserted.id,
          tenant_name: inserted.occupant_name,
          trade_name: inserted.occupant_name,
          occupant_code: inserted.occupant_code,
          pan: inserted.pan_number,
          gstin: inserted.gst_number,
          status: inserted.occupant_status,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create tenant", message: err.message },
      { status: 500 }
    );
  }
}
