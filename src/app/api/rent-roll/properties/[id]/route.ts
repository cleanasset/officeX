import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, contract, occupant, properties } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, inArray, ne } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const url = new URL(req.url);
    const isImpactCheck = url.searchParams.get("action") === "impact";

    const [p] = await db
      .select()
      .from(property)
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId), sql`${property.deleted_at} IS NULL`));

    if (!p) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    if (isImpactCheck) {
      // Find all buildings and spaces under this property
      const bldgs = await db
        .select({ id: building.id, name: building.building_name })
        .from(building)
        .where(and(eq(building.property_id, id), sql`${building.deleted_at} IS NULL`));

      const bldgIds = bldgs.map((b) => b.id);
      let sps: any[] = [];
      let activeContracts: any[] = [];

      if (bldgIds.length > 0) {
        sps = await db
          .select({ id: space.id, space_name: space.space_name })
          .from(space)
          .where(and(inArray(space.building_id, bldgIds), sql`${space.deleted_at} IS NULL`));

        const spIds = sps.map((s) => s.id);
        if (spIds.length > 0) {
          activeContracts = await db
            .select({
              id: contract.id,
              contract_code: contract.contract_code,
              status: contract.contract_status,
              space_id: contract.space_id,
              occupant_id: contract.occupant_id,
              occupant_name: occupant.occupant_name,
              occupant_email: occupant.email,
            })
            .from(contract)
            .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
            .where(
              and(
                inArray(contract.space_id, spIds),
                sql`${contract.deleted_at} IS NULL`,
                ne(contract.contract_status, "terminated")
              )
            );
        }
      }

      return NextResponse.json({
        success: true,
        impact: {
          has_impact: activeContracts.length > 0,
          active_contracts_count: activeContracts.length,
          buildings_count: bldgs.length,
          spaces_count: sps.length,
          contracts: activeContracts.map((c) => ({
            id: c.id,
            code: c.contract_code,
            tenant_name: c.occupant_name || "Commercial Occupant",
            tenant_email: c.occupant_email || "",
            status: c.status,
          })),
        },
      });
    }

    return NextResponse.json({ success: true, data: p });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch property", message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(property)
      .set({
        property_name: body.property_name,
        address: body.address,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code || body.pincode,
        total_leasable_area_sqft: body.total_leasable_area_sqft ? String(body.total_leasable_area_sqft) : undefined,
        total_leasable_seats: body.total_leasable_seats !== undefined ? Number(body.total_leasable_seats) : undefined,
        property_type: body.property_type,
        updated_by: auth.userId,
        updated_at: new Date(),
      })
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update property", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(req);
    const { id } = await params;
    const url = new URL(req.url);
    const cascadeConfirmed = url.searchParams.get("cascade_confirmed") === "true";

    // 1. Gather buildings and spaces
    const bldgs = await db
      .select({ id: building.id })
      .from(building)
      .where(eq(building.property_id, id));

    const bldgIds = bldgs.map((b) => b.id);
    let activeContracts: any[] = [];
    let spIds: string[] = [];

    if (bldgIds.length > 0) {
      const sps = await db
        .select({ id: space.id })
        .from(space)
        .where(inArray(space.building_id, bldgIds));
      spIds = sps.map((s) => s.id);

      if (spIds.length > 0) {
        activeContracts = await db
          .select({
            id: contract.id,
            contract_code: contract.contract_code,
            occupant_id: contract.occupant_id,
            occupant_name: occupant.occupant_name,
          })
          .from(contract)
          .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
          .where(
            and(
              inArray(contract.space_id, spIds),
              sql`${contract.deleted_at} IS NULL`,
              ne(contract.contract_status, "terminated")
            )
          );
      }
    }

    // 2. Strict Safety Safeguard: If property has active tenant leases and user hasn't explicitly confirmed cascade
    if (activeContracts.length > 0 && !cascadeConfirmed) {
      return NextResponse.json(
        {
          error: `Property has ${activeContracts.length} active tenant lease contract(s). Deletion will terminate all contracts, stop active billing, and revoke tenant and third-party portal access. Explicit confirmation required.`,
          requires_confirmation: true,
          active_contracts_count: activeContracts.length,
          contracts: activeContracts.map((c) => ({
            id: c.id,
            code: c.contract_code,
            tenant_name: c.occupant_name || "Commercial Tenant",
          })),
        },
        { status: 409 }
      );
    }

    // 3. Deactivate all active tenant contracts associated with this property
    if (spIds.length > 0 && activeContracts.length > 0) {
      await db
        .update(contract)
        .set({
          contract_status: "terminated",
          deleted_at: new Date(),
          updated_by: auth.userId,
          updated_at: new Date(),
        })
        .where(inArray(contract.space_id, spIds));
    }

    // 4. Cascade delete spaces and buildings
    if (bldgIds.length > 0) {
      if (spIds.length > 0) {
        await db
          .update(space)
          .set({ deleted_at: new Date(), updated_by: auth.userId })
          .where(inArray(space.id, spIds));
      }

      await db
        .update(building)
        .set({ deleted_at: new Date(), updated_by: auth.userId })
        .where(inArray(building.id, bldgIds));
    }

    // 5. Soft-delete property in Rent Roll master
    await db
      .update(property)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)));

    // 6. Also delete from marketplace / SaaS properties table if present
    try {
      await db.delete(properties).where(eq(properties.id, id));
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Property and ${activeContracts.length} associated tenant contract(s) have been deleted and deactivated successfully.`,
      terminated_contracts_count: activeContracts.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete property", message: err.message }, { status: 500 });
  }
}
