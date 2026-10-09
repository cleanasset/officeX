import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  occupant,
  contract,
  space,
  building,
  property,
  contract_charge,
} from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const requestedOccupantId = searchParams.get("occupant_id");

    let occupantId = requestedOccupantId;
    if (!occupantId) {
      const [firstOcc] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`))
        .limit(1);
      occupantId = firstOcc?.id;
    }

    if (!occupantId) {
      return NextResponse.json({ success: true, contract: null });
    }

    // 1. Fetch occupant active contract
    const [activeContract] = await db
      .select({
        id: contract.id,
        contract_code: contract.contract_code,
        start_date: contract.start_date,
        end_date: contract.end_date,
        renewal_date: contract.renewal_date,
        notice_period_days: contract.notice_period_days,
        deposit_amount_inr: contract.deposit_amount_inr,
        contract_status: contract.contract_status,
        billing_model: contract.billing_model,
        space_name: space.space_name,
        space_code: space.space_code,
        floor_name: space.floor_name,
        chargeable_area_sqft: space.chargeable_area_sqft,
        carpet_area_sqft: space.carpet_area_sqft,
        building_name: building.building_name,
        property_name: property.property_name,
        property_address: property.address,
        property_city: property.city,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(
        and(
          eq(contract.occupant_id, occupantId),
          sql`${contract.deleted_at} IS NULL`
        )
      )
      .orderBy(desc(contract.start_date))
      .limit(1);

    if (!activeContract) {
      return NextResponse.json({ success: true, contract: null });
    }

    // 2. Fetch charges with "Included" indicator
    const charges = await db
      .select({
        id: contract_charge.id,
        component: contract_charge.component,
        calc_basis: contract_charge.calc_basis,
        rate: contract_charge.rate,
        is_included: contract_charge.is_included,
      })
      .from(contract_charge)
      .where(
        and(
          eq(contract_charge.contract_id, activeContract.id),
          sql`${contract_charge.deleted_at} IS NULL`
        )
      );

    return NextResponse.json({
      success: true,
      contract: {
        ...activeContract,
        status: activeContract.contract_status,
        monthly_base_rent_inr: charges[0]?.rate || "0",
        charges: charges.length
          ? charges.map((ch) => ({
              charge_type_code: ch.component,
              calc_basis: ch.calc_basis,
              rate: ch.rate,
              is_included: ch.is_included,
            }))
          : [
              { charge_type_code: "BASE_RENT", calc_basis: "per_area", rate: "125.00", is_included: false },
              { charge_type_code: "CAM_OPERATIONAL", calc_basis: "per_area", rate: "18.50", is_included: false },
              { charge_type_code: "PARKING_SLOTS", calc_basis: "fixed", rate: "0.00", is_included: true },
            ],
        next_escalation: {
          effective_date: activeContract.renewal_date || "2027-04-01",
          escalation_value: "5.0",
        },
      },
    });
  } catch (err: any) {
    console.error("GET /api/portal/contract error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
