import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

/**
 * RR-CONT-12, §S-14: Occupants CRUD
 * - Multi-client: client_account_id is optional (tenants can span multiple properties)
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    const conditions = [
      eq(occupant.org_id, auth.orgId),
      sql`${occupant.deleted_at} IS NULL`,
    ];
    if (status) conditions.push(eq(occupant.occupant_status, status as any));
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

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch occupants", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const payload = {
      ...body,
      org_id: body.org_id || auth.orgId,
      occupant_code: body.occupant_code,
      occupant_name: body.occupant_name,
      occupant_type: body.occupant_type || "company",
      is_critical_occupant: body.is_critical_occupant ?? false,
      occupant_status: body.occupant_status || "active",
    };

    const reqVal = validateRequiredFields("occupant", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(occupant)
      .values({
        org_id: payload.org_id,
        client_account_id: body.client_account_id || null, // Optional per RR-CONT-12
        occupant_code: payload.occupant_code,
        occupant_name: payload.occupant_name,
        occupant_type: payload.occupant_type,
        pan_number: body.pan_number || body.pan || null,
        gst_number: body.gst_number || body.gstin || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        email: body.email || body.contact_email || null,
        phone: body.phone || body.contact_phone || null,
        industry_sector: body.industry_sector || body.industry || null,
        is_critical_occupant: payload.is_critical_occupant,
        occupant_status: payload.occupant_status,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create occupant", message: err.message }, { status: 500 });
  }
}
