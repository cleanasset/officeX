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

    const generatedCode =
      (body.property_code && body.property_code.trim()) ||
      (body.property_name
        ? body.property_name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900)
        : `PROP-${Date.now().toString(36).toUpperCase()}`);

    const validPropertyTypes = ["office", "residential", "retail", "flex_workspace", "mixed"];
    let normalizedType = "office";
    if (body.property_type) {
      const lower = String(body.property_type).toLowerCase();
      if (validPropertyTypes.includes(lower)) {
        normalizedType = lower;
      } else if (lower.includes("retail")) {
        normalizedType = "retail";
      } else if (lower.includes("residential")) {
        normalizedType = "residential";
      } else if (lower.includes("flex")) {
        normalizedType = "flex_workspace";
      } else {
        normalizedType = "office";
      }
    }

    const payload = {
      ...body,
      org_id: body.org_id || auth.orgId,
      client_account_id: body.client_account_id || auth.clientAccountId,
      property_name: body.property_name || "Commercial Tower",
      property_code: generatedCode,
      total_leasable_area_sqft: body.total_leasable_area_sqft || 50000,
      property_type: normalizedType,
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
        address: body.address || body.address_line1 || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || body.pincode || null,
        country_code: body.country_code || "IN",
        total_leasable_area_sqft: String(payload.total_leasable_area_sqft),
        total_leasable_seats: (body.total_leasable_seats || body.total_seats) ? Number(body.total_leasable_seats || body.total_seats) : null,
        property_type: payload.property_type as any,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create property", message: err.message }, { status: 500 });
  }
}
