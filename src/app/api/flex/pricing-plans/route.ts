import { NextResponse } from "next/server";
import { db } from "@/db";
import { pricingPlans, property } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * S-15 Pricing Plan (Flex & Seats add-on) API
 * Reusable seat plans with inclusions and chargeable extras
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");

    const plansList = await db
      .select({
        id: pricingPlans.id,
        org_id: pricingPlans.orgId,
        property_id: pricingPlans.propertyId,
        property_name: property.property_name,
        plan_name: pricingPlans.planName,
        seat_type: pricingPlans.seatType,
        rate_per_month: pricingPlans.ratePerMonth,
        rate_period: sql<string>`coalesce(pricing_plans.rate_period, 'month')`,
        inclusions: pricingPlans.inclusions,
        chargeable_extras: sql<any>`pricing_plans.chargeable_extras`,
        property_ids: sql<any>`pricing_plans.property_ids`,
        security_deposit_months: pricingPlans.securityDepositMonths,
        is_active: sql<boolean>`coalesce(pricing_plans.is_active, true)`,
        created_at: pricingPlans.createdAt,
      })
      .from(pricingPlans)
      .leftJoin(property, eq(pricingPlans.propertyId, property.id))
      .where(auth.orgId ? eq(pricingPlans.orgId, auth.orgId) : undefined)
      .orderBy(desc(pricingPlans.createdAt));

    // Properties list for dropdowns
    const propertiesList = await db
      .select({ id: property.id, property_name: property.property_name, property_code: property.property_code })
      .from(property)
      .where(auth.orgId ? eq(property.org_id, auth.orgId) : undefined);

    return NextResponse.json({
      plans: plansList,
      properties: propertiesList,
    });
  } catch (error: any) {
    console.error("GET /api/flex/pricing-plans error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      id,
      property_id,
      plan_name,
      seat_type,
      rate_per_month,
      rate_period = "month",
      inclusions = ["high_speed_wifi", "housekeeping", "electricity"],
      chargeable_extras = [
        { item: "Meeting Room Credits", rate: 800, unit: "hour" },
        { item: "Reserved Parking Slot", rate: 4000, unit: "slot/month" },
      ],
      property_ids = [],
      security_deposit_months = 2,
      is_active = true,
    } = body;

    if (!plan_name || !seat_type || !rate_per_month) {
      return NextResponse.json(
        { error: "plan_name, seat_type, and rate_per_month are mandatory" },
        { status: 400 }
      );
    }

    // Default property if not specified
    let targetPropertyId = property_id;
    if (!targetPropertyId) {
      const [firstProp] = await db.select({ id: property.id }).from(property).limit(1);
      targetPropertyId = firstProp?.id;
    }

    if (id) {
      // Update
      const [updated] = await db
        .update(pricingPlans)
        .set({
          planName: plan_name,
          seatType: seat_type,
          ratePerMonth: String(rate_per_month),
          inclusions: inclusions,
          securityDepositMonths: Number(security_deposit_months),
        })
        .where(eq(pricingPlans.id, id))
        .returning();

      // Update raw additional columns
      await db.execute(sql`
        UPDATE pricing_plans 
        SET rate_period = ${rate_period},
            chargeable_extras = ${JSON.stringify(chargeable_extras)}::jsonb,
            property_ids = ${JSON.stringify(property_ids)}::jsonb,
            is_active = ${Boolean(is_active)}
        WHERE id = ${id}::uuid
      `);

      return NextResponse.json({
        success: true,
        message: "Pricing plan updated successfully",
        plan: updated,
      });
    }

    // Insert new plan
    const [inserted] = await db
      .insert(pricingPlans)
      .values({
        orgId: auth.orgId,
        propertyId: targetPropertyId,
        planName: plan_name,
        seatType: seat_type,
        ratePerMonth: String(rate_per_month),
        inclusions: inclusions,
        securityDepositMonths: Number(security_deposit_months),
      })
      .returning();

    await db.execute(sql`
      UPDATE pricing_plans 
      SET rate_period = ${rate_period},
          chargeable_extras = ${JSON.stringify(chargeable_extras)}::jsonb,
          property_ids = ${JSON.stringify(property_ids)}::jsonb,
          is_active = ${Boolean(is_active)}
      WHERE id = ${inserted.id}::uuid
    `);

    return NextResponse.json({
      success: true,
      message: "Pricing plan created successfully",
      plan: inserted,
    });
  } catch (error: any) {
    console.error("POST /api/flex/pricing-plans error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save pricing plan" },
      { status: 500 }
    );
  }
}
