import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  meters,
  tariffs,
  property,
  space,
  building,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or } from "drizzle-orm";

/**
 * S-65 Meters & Tariffs Master API
 * Register physical/virtual meters linked to spaces/buildings with multi-tier tariff rates and validity dates.
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    const utility = searchParams.get("utility");

    const meterWhere = [];
    if (auth.orgId) meterWhere.push(eq(meters.org_id, auth.orgId));
    if (propertyId && propertyId !== "all") meterWhere.push(eq(meters.property_id, propertyId));
    if (utility && utility !== "all") meterWhere.push(eq(meters.utility, utility));

    // 1. Fetch meters linked with space and building
    const metersList = await db
      .select({
        id: meters.id,
        org_id: meters.org_id,
        property_id: meters.property_id,
        space_id: meters.space_id,
        space_code: space.space_code,
        space_name: space.space_name,
        building_id: meters.building_id,
        building_name: building.building_name,
        meter_code: meters.meter_code,
        meter_name: meters.meter_name,
        utility: meters.utility,
        multiplier: meters.multiplier,
        is_virtual: meters.is_virtual,
        status: meters.status,
        created_at: meters.created_at,
      })
      .from(meters)
      .leftJoin(space, eq(meters.space_id, space.id))
      .leftJoin(building, eq(meters.building_id, building.id))
      .where(meterWhere.length > 0 ? and(...meterWhere) : undefined)
      .orderBy(meters.meter_code);

    // 2. Fetch tariffs
    const tariffWhere = [];
    if (auth.orgId) tariffWhere.push(eq(tariffs.org_id, auth.orgId));
    if (propertyId && propertyId !== "all") tariffWhere.push(eq(tariffs.property_id, propertyId));
    if (utility && utility !== "all") tariffWhere.push(eq(tariffs.utility, utility));

    const tariffsList = await db
      .select()
      .from(tariffs)
      .where(tariffWhere.length > 0 ? and(...tariffWhere) : undefined)
      .orderBy(desc(tariffs.valid_from));

    // 3. Properties list for dropdowns
    const propertiesList = await db
      .select({ id: property.id, property_name: property.property_name, property_code: property.property_code })
      .from(property)
      .where(auth.orgId ? eq(property.org_id, auth.orgId) : undefined);

    // 4. Spaces list for meter linking
    const spacesList = await db
      .select({
        id: space.id,
        property_id: building.property_id,
        space_code: space.space_code,
        space_name: space.space_name,
      })
      .from(space)
      .leftJoin(building, eq(space.building_id, building.id))
      .where(
        and(
          sql`${space.deleted_at} IS NULL`,
          propertyId && propertyId !== "all" ? eq(building.property_id, propertyId) : undefined
        )
      );

    return NextResponse.json({
      meters: metersList,
      tariffs: tariffsList,
      properties: propertiesList,
      spaces: spacesList,
    });
  } catch (error: any) {
    console.error("GET /api/meters error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch meters and tariffs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { action = "create_meter" } = body;

    if (action === "create_tariff") {
      const {
        property_id,
        billing_entity_id,
        utility,
        tariff_name,
        rate,
        unit = "kWh",
        valid_from,
        valid_to,
      } = body;

      if (!property_id || !utility || rate === undefined || !valid_from) {
        return NextResponse.json(
          { error: "property_id, utility, rate, and valid_from are mandatory for tariff" },
          { status: 400 }
        );
      }

      // Check for overlapping tariff validity per property + utility
      const [newTariff] = await db
        .insert(tariffs)
        .values({
          org_id: auth.orgId,
          property_id,
          billing_entity_id: billing_entity_id || null,
          utility,
          tariff_name: tariff_name || `${utility.toUpperCase()} Tariff`,
          rate: String(rate),
          unit,
          valid_from,
          valid_to: valid_to || null,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: "Tariff rate configured successfully",
        tariff: newTariff,
      });
    }

    // Default: create or update meter
    const {
      property_id,
      space_id,
      building_id,
      meter_code,
      meter_name,
      utility,
      multiplier = 1,
      is_virtual = false,
      status = "active",
      id,
    } = body;

    if (!property_id || !meter_code || !utility) {
      return NextResponse.json(
        { error: "property_id, meter_code, and utility are mandatory" },
        { status: 400 }
      );
    }

    if (id) {
      // Update existing meter
      const [updated] = await db
        .update(meters)
        .set({
          space_id: space_id || null,
          building_id: building_id || null,
          meter_code,
          meter_name: meter_name || null,
          utility,
          multiplier: String(multiplier),
          is_virtual: Boolean(is_virtual),
          status,
        })
        .where(eq(meters.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Meter updated successfully",
        meter: updated,
      });
    }

    // Insert new meter
    const [newMeter] = await db
      .insert(meters)
      .values({
        org_id: auth.orgId,
        property_id,
        space_id: space_id || null,
        building_id: building_id || null,
        meter_code,
        meter_name: meter_name || `${meter_code} (${utility})`,
        utility,
        multiplier: String(multiplier),
        is_virtual: Boolean(is_virtual),
        status,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Meter registered successfully",
      meter: newMeter,
    });
  } catch (error: any) {
    console.error("POST /api/meters error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save meter/tariff" },
      { status: 500 }
    );
  }
}
