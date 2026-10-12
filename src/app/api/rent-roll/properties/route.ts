import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space } from "@/db/schema";
import { validateRequiredFields } from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
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

    const orgId = body.org_id || auth.orgId;
    const clientAccountId = body.client_account_id || auth.clientAccountId;
    const propertyName = (body.property_name || body.name || "Commercial Tower").trim();
    const providedCode = body.property_code && body.property_code.trim() ? body.property_code.trim() : "";

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

    const areaVal = Number(body.total_leasable_area_sqft || body.totalArea) || 50000;
    const seatsRaw = body.total_leasable_seats ?? body.total_seats;
    const parsedSeats =
      seatsRaw !== null && seatsRaw !== undefined && seatsRaw !== "" && !isNaN(Number(seatsRaw))
        ? Number(seatsRaw)
        : null;

    // 1. Check if property already exists for this org (by ID, matching code, or matching name)
    const matchConditions = [];
    if (body.id || body.property_id) {
      matchConditions.push(eq(property.id, body.id || body.property_id));
    }
    if (providedCode) {
      matchConditions.push(eq(property.property_code, providedCode));
    }
    if (propertyName) {
      matchConditions.push(ilike(property.property_name, propertyName));
    }

    const existingProperties = matchConditions.length > 0
      ? await db
          .select()
          .from(property)
          .where(
            and(
              eq(property.org_id, orgId),
              sql`${property.deleted_at} IS NULL`,
              or(...matchConditions)!
            )
          )
          .limit(1)
      : [];

    if (existingProperties.length > 0) {
      const existing = existingProperties[0];
      const [updated] = await db
        .update(property)
        .set({
          property_name: propertyName,
          property_code: providedCode || existing.property_code,
          address: body.address || body.address_line1 || existing.address,
          city: body.city || existing.city,
          state: body.state || existing.state,
          postal_code: body.postal_code || body.pincode || existing.postal_code,
          country_code: body.country_code || existing.country_code || "IN",
          total_leasable_area_sqft: String(areaVal),
          total_leasable_seats: parsedSeats !== null ? parsedSeats : existing.total_leasable_seats,
          property_type: normalizedType as any,
          updated_by: auth.userId,
          updated_at: new Date(),
        })
        .where(eq(property.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, data: updated, isExisting: true }, { status: 200 });
    }

    // 2. Generate a unique property code that does not collide with existing properties
    let finalCode = providedCode;
    if (!finalCode) {
      finalCode = propertyName
        ? propertyName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900)
        : `PROP-${Date.now().toString(36).toUpperCase()}`;
    }

    // Ensure the candidate code doesn't collide with ANY existing property in this org
    let codeCandidate = finalCode;
    let collisionCount = 0;
    while (collisionCount < 10) {
      const collision = await db
        .select({ id: property.id })
        .from(property)
        .where(and(eq(property.org_id, orgId), eq(property.property_code, codeCandidate)))
        .limit(1);
      if (collision.length === 0) break;
      collisionCount++;
      codeCandidate = `${finalCode}-${Math.floor(100 + Math.random() * 900)}`;
    }
    finalCode = codeCandidate;

    const payload = {
      ...body,
      org_id: orgId,
      client_account_id: clientAccountId,
      property_name: propertyName,
      property_code: finalCode,
      total_leasable_area_sqft: areaVal,
      property_type: normalizedType,
    };

    const reqVal = validateRequiredFields("property", payload);
    if (!reqVal.isValid) {
      return NextResponse.json({ error: "Validation failed", details: reqVal.errors }, { status: 422 });
    }

    await ensureTenantOrgRecord(orgId, clientAccountId, auth.userEmail);

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
        total_leasable_seats: parsedSeats,
        property_type: payload.property_type as any,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .onConflictDoUpdate({
        target: [property.org_id, property.property_code],
        set: {
          property_name: payload.property_name,
          address: body.address || body.address_line1 || null,
          city: body.city || null,
          state: body.state || null,
          postal_code: body.postal_code || body.pincode || null,
          country_code: body.country_code || "IN",
          total_leasable_area_sqft: String(payload.total_leasable_area_sqft),
          total_leasable_seats: parsedSeats,
          property_type: payload.property_type as any,
          updated_by: auth.userId,
          updated_at: new Date(),
        },
      })
      .returning();

    // Auto-provision building and space so Property/Space Registry and Rent Roll matrix are populated immediately
    if (inserted) {
      try {
        const existingBuildings = await db
          .select({ id: building.id })
          .from(building)
          .where(and(eq(building.property_id, inserted.id), sql`${building.deleted_at} IS NULL`))
          .limit(1);

        let targetBuildingId = existingBuildings[0]?.id;
        if (!targetBuildingId) {
          const [newBld] = await db
            .insert(building)
            .values({
              org_id: orgId,
              client_account_id: clientAccountId,
              property_id: inserted.id,
              building_name: `${inserted.property_name} Tower 1`,
              building_code: `BLD-${inserted.property_code}-01`,
              total_area_sqft: String(payload.total_leasable_area_sqft),
            })
            .returning();
          targetBuildingId = newBld.id;
        }

        if (targetBuildingId) {
          const existingSpaces = await db
            .select({ id: space.id })
            .from(space)
            .where(and(eq(space.building_id, targetBuildingId), sql`${space.deleted_at} IS NULL`))
            .limit(1);

          if (existingSpaces.length === 0) {
            await db
              .insert(space)
              .values({
                org_id: orgId,
                client_account_id: clientAccountId,
                building_id: targetBuildingId,
                space_name: "Suite 101",
                space_code: `SPC-${inserted.property_code}-101`,
                chargeable_area_sqft: String(payload.total_leasable_area_sqft),
                occupancy_status: "vacant",
                is_leasable: true,
                space_type: "suite",
              })
              .returning();
          }
        }
      } catch (autoErr) {
        console.warn("Auto-provision building/space notice:", autoErr);
      }
    }

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create/update property:", err);
    const isDup =
      err.code === "23505" ||
      err.cause?.code === "23505" ||
      String(err?.message || "").includes("duplicate key") ||
      String(err?.cause?.message || "").includes("duplicate key");

    return NextResponse.json(
      {
        error: "Failed to create property",
        message: isDup
          ? "This property or property code already exists in your portfolio."
          : (err.cause?.message || err.message || "An unexpected database error occurred"),
      },
      { status: 500 }
    );
  }
}
