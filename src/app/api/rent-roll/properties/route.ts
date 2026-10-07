import { NextResponse } from "next/server";
import { db } from "@/db";
import { property } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

/**
 * RR-CONT-11, §S-11: Properties CRUD
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const propertyType = searchParams.get("property_type");

    const conditions = [
      eq(property.org_id, auth.orgId),
      sql`${property.deleted_at} IS NULL`,
    ];
    if (propertyType) conditions.push(eq(property.property_type, propertyType as any));
    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(property.client_account_id, auth.clientAccountId));
    }
    if (query) {
      conditions.push(
        or(
          ilike(property.property_name, `%${query}%`),
          ilike(property.property_code, `%${query}%`),
          ilike(property.city, `%${query}%`)
        )!
      );
    }

    const list = await db
      .select()
      .from(property)
      .where(and(...conditions))
      .orderBy(desc(property.created_at));

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch properties", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const payload = {
      ...body,
      org_id: body.org_id || auth.orgId,
      client_account_id: body.client_account_id || auth.clientAccountId,
      property_name: body.property_name,
      property_code: body.property_code,
      total_leasable_area_sqft: body.total_leasable_area_sqft,
      property_type: body.property_type || "office",
    };

    const reqVal = validateRequiredFields("property", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    const [inserted] = await db
      .insert(property)
      .values({
        org_id: payload.org_id,
        client_account_id: payload.client_account_id,
        property_name: payload.property_name,
        property_code: payload.property_code,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        country_code: body.country_code || "IN",
        total_leasable_area_sqft: String(payload.total_leasable_area_sqft),
        total_leasable_seats: body.total_leasable_seats ? Number(body.total_leasable_seats) : null,
        property_type: payload.property_type,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create property", message: err.message }, { status: 500 });
  }
}
