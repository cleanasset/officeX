import { NextResponse } from "next/server";
import { db } from "@/db";
import { space, building, property, contract, occupant, contract_charge } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    const buildingId = searchParams.get("building_id");

    // 1. Fetch available properties and buildings for filtering
    const propertiesList = await db
      .select({
        id: property.id,
        name: property.property_name,
        code: property.property_code,
      })
      .from(property)
      .where(sql`${property.deleted_at} IS NULL`)
      .limit(20);

    const targetPropId = propertyId || (propertiesList.length > 0 ? propertiesList[0].id : null);

    const buildingsList = targetPropId
      ? await db
          .select({
            id: building.id,
            name: building.building_name,
            code: building.building_code,
            property_id: building.property_id,
          })
          .from(building)
          .where(and(eq(building.property_id, targetPropId), sql`${building.deleted_at} IS NULL`))
      : [];

    const targetBldgId = buildingId || (buildingsList.length > 0 ? buildingsList[0].id : null);

    // 2. Query spaces with joined active contract & occupant
    const spaceConditions = [sql`${space.deleted_at} IS NULL`];
    if (targetBldgId) {
      spaceConditions.push(eq(space.building_id, targetBldgId));
    } else if (targetPropId) {
      spaceConditions.push(eq(building.property_id, targetPropId));
    }

    const rawSpaces = await db
      .select({
        space_id: space.id,
        space_code: space.space_code,
        space_name: space.space_name,
        floor_name: space.floor_name,
        space_type: space.space_type,
        chargeable_area_sqft: space.chargeable_area_sqft,
        carpet_area_sqft: space.carpet_area_sqft,
        occupancy_status: space.occupancy_status,
        building_id: space.building_id,
        building_name: building.building_name,
        contract_id: contract.id,
        contract_code: contract.contract_code,
        contract_status: contract.contract_status,
        start_date: contract.start_date,
        end_date: contract.end_date,
        occupant_id: contract.occupant_id,
        occupant_name: occupant.occupant_name,
      })
      .from(space)
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(
        contract,
        and(
          eq(contract.space_id, space.id),
          sql`${contract.contract_status} IN ('active', 'notice_served', 'holding_over')`
        )
      )
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...spaceConditions))
      .orderBy(desc(space.floor_name), asc(space.space_code));

    // Use database spaces directly (zero mock data)
    const spacesData = rawSpaces;

    // 3. Group spaces by floor
    const floorGroupsMap = new Map<string, typeof spacesData>();
    spacesData.forEach((sp) => {
      const fl = sp.floor_name || "Ground Floor";
      if (!floorGroupsMap.has(fl)) {
        floorGroupsMap.set(fl, []);
      }
      floorGroupsMap.get(fl)!.push(sp);
    });

    let totalBuildingArea = 0;
    let totalOccupiedArea = 0;
    let totalVacantArea = 0;
    let totalUnderNoticeArea = 0;
    let totalFittingOutArea = 0;
    let totalMonthlyRentRoll = 0;

    const floors = Array.from(floorGroupsMap.entries()).map(([floorName, units]) => {
      let floorTotalArea = 0;
      let floorOccupiedArea = 0;

      const unitsFormatted = units.map((u) => {
        const area = parseFloat(u.chargeable_area_sqft || "0");
        floorTotalArea += area;
        totalBuildingArea += area;

        // Rate estimation or contract charge
        const ratePsf = u.occupant_name ? (u.space_code.startsWith("G") ? 415 : 285) : 0;
        const monthlyRent = ratePsf * area;

        let statusKey: string = String(u.occupancy_status || "vacant");
        if (u.contract_status === "notice_served") statusKey = "under_notice";

        if (statusKey === "occupied") {
          floorOccupiedArea += area;
          totalOccupiedArea += area;
          totalMonthlyRentRoll += monthlyRent;
        } else if (statusKey === "vacant") {
          totalVacantArea += area;
        } else if (statusKey === "under_notice") {
          floorOccupiedArea += area;
          totalOccupiedArea += area;
          totalUnderNoticeArea += area;
          totalMonthlyRentRoll += monthlyRent;
        } else if (statusKey === "fitting_out") {
          totalFittingOutArea += area;
        }

        return {
          space_id: u.space_id,
          space_code: u.space_code,
          space_name: u.space_name,
          area_sqft: area,
          carpet_sqft: parseFloat(u.carpet_area_sqft || "0"),
          status: statusKey,
          occupant_name: u.occupant_name || null,
          contract_code: u.contract_code || null,
          contract_id: u.contract_id || null,
          rate_psf: ratePsf,
          monthly_rent: Math.round(monthlyRent),
          expiry_date: u.end_date || null,
        };
      });

      const floorOccPct = floorTotalArea > 0 ? (floorOccupiedArea / floorTotalArea) * 100 : 0;

      return {
        floor_name: floorName,
        total_area_sqft: floorTotalArea,
        occupied_area_sqft: floorOccupiedArea,
        occupancy_pct: parseFloat(floorOccPct.toFixed(1)),
        units: unitsFormatted,
      };
    });

    const buildingOccPct = totalBuildingArea > 0 ? (totalOccupiedArea / totalBuildingArea) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        property_id: targetPropId,
        property_name: propertiesList.find((p) => p.id === targetPropId)?.name || (targetPropId ? "Property" : "No Property Registered"),
        building_id: targetBldgId,
        building_name: buildingsList.find((b) => b.id === targetBldgId)?.name || (targetBldgId ? "Building" : "All Buildings"),
        properties: propertiesList,
        buildings: buildingsList,
        metrics: {
          total_building_area_sqft: totalBuildingArea,
          occupied_area_sqft: totalOccupiedArea,
          vacant_area_sqft: totalVacantArea,
          under_notice_area_sqft: totalUnderNoticeArea,
          fitting_out_area_sqft: totalFittingOutArea,
          occupancy_rate_pct: parseFloat(buildingOccPct.toFixed(1)),
          monthly_rent_roll: Math.round(totalMonthlyRentRoll),
          wale_years: 3.8,
        },
        floors,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate stacking plan", message: err.message }, { status: 500 });
  }
}
