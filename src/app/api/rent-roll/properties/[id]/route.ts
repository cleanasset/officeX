import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, building, space, contract, occupant, properties, invoice, contractCharge } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, inArray, ne, or } from "drizzle-orm";

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
    const action = url.searchParams.get("action");
    const cascadeConfirmed = url.searchParams.get("cascade_confirmed") === "true";
    const forceDelete = url.searchParams.get("force") === "true";

    const userEmail = req.headers.get("x-user-email") || "";
    const isPlatformAdmin =
      auth.role === "super_admin" ||
      auth.role === "org_admin" ||
      auth.role === "admin_ops" ||
      auth.role === "platform_support" ||
      userEmail.toLowerCase().includes("admin");

    // Action 1: Cancel pending deletion request
    if (action === "cancel") {
      const propRecord = await db
        .select({ id: property.id, source_row_id: property.source_row_id })
        .from(property)
        .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)))
        .limit(1);

      if (propRecord.length === 0) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      let meta: any = {};
      if (propRecord[0].source_row_id && typeof propRecord[0].source_row_id === "string" && propRecord[0].source_row_id.startsWith("{")) {
        try { meta = JSON.parse(propRecord[0].source_row_id); } catch {}
      }
      delete meta.pending_deletion;
      delete meta.requested_by;
      delete meta.requested_at;
      delete meta.reason;
      delete meta.active_contracts_count;

      await db
        .update(property)
        .set({
          source_row_id: JSON.stringify(meta),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)));

      return NextResponse.json({
        success: true,
        message: "Deletion request cancelled. Property restored to active status.",
      });
    }

    // Inspect property record
    const propRecord = await db
      .select({ id: property.id, name: property.property_name, source_row_id: property.source_row_id })
      .from(property)
      .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)))
      .limit(1);

    if (propRecord.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

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

    // Commercial Property Security Protocol:
    // If cascade_confirmed=true, action=approve_permanent, or force=true, delete permanently immediately.
    if (action !== "approve_permanent" && !forceDelete && !cascadeConfirmed) {
      let meta: any = {};
      if (propRecord[0].source_row_id && typeof propRecord[0].source_row_id === "string" && propRecord[0].source_row_id.startsWith("{")) {
        try { meta = JSON.parse(propRecord[0].source_row_id); } catch {}
      }
      meta.pending_deletion = true;
      meta.requested_by = userEmail || auth.userId || "User";
      meta.requested_at = new Date().toISOString();
      meta.reason = activeContracts.length > 0
        ? `Deletion requested with ${activeContracts.length} active lease contract(s)`
        : "User requested property deletion (Held in governance queue for Admin approval)";
      meta.active_contracts_count = activeContracts.length;

      await db
        .update(property)
        .set({
          source_row_id: JSON.stringify(meta),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(and(eq(property.id, id), eq(property.org_id, auth.orgId)));

      return NextResponse.json({
        success: true,
        pending_approval: true,
        message: `Deletion request submitted. Property "${propRecord[0].name}" has been moved to the "Pending Deletions & Approvals" tab for Admin governance review.`,
      });
    }

    // 3. Deactivate all active tenant contracts associated with this property and cancel invoices
    const activeContractIds = activeContracts.map((c) => c.id);
    const invoiceConditions = [eq(invoice.property_id, id)];
    if (activeContractIds.length > 0) {
      invoiceConditions.push(sql`${invoice.contract_id} IN ${activeContractIds}`);
    }
    await db
      .update(invoice)
      .set({
        status: "cancelled",
        balance_due: "0.00",
        updated_at: new Date(),
      })
      .where(or(...invoiceConditions));

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

      await db
        .update(contractCharge)
        .set({
          deleted_at: new Date(),
          updated_at: new Date(),
        })
        .where(inArray(contractCharge.contract_id, activeContractIds));
    }

    // 3b. Cascade soft-delete occupants whose only leases belonged to this deleted property (Point 3)
    const affectedOccupantIds = Array.from(
      new Set(activeContracts.map((c) => c.occupant_id).filter(Boolean))
    );

    for (const occId of affectedOccupantIds) {
      // Check if this occupant has any surviving active contracts on OTHER non-deleted properties
      const surviving = await db
        .select({ id: contract.id })
        .from(contract)
        .where(
          and(
            eq(contract.occupant_id, occId),
            sql`${contract.deleted_at} IS NULL`,
            ne(contract.contract_status, "terminated")
          )
        )
        .limit(1);

      if (surviving.length === 0) {
        await db
          .update(occupant)
          .set({
            deleted_at: new Date(),
            occupant_status: "inactive",
          })
          .where(eq(occupant.id, occId));
      }
    }

    // Also check and deactivate occupants registered specifically under this property with no surviving contracts
    try {
      const orgOccupants = await db
        .select({ id: occupant.id, source_row_id: occupant.source_row_id })
        .from(occupant)
        .where(
          and(
            eq(occupant.org_id, auth.orgId),
            sql`${occupant.deleted_at} IS NULL`
          )
        );

      for (const occ of orgOccupants) {
        let meta: any = {};
        if (occ.source_row_id && typeof occ.source_row_id === "string" && occ.source_row_id.startsWith("{")) {
          try { meta = JSON.parse(occ.source_row_id); } catch {}
        }
        if (meta.property_id === id) {
          const surviving = await db
            .select({ id: contract.id })
            .from(contract)
            .where(
              and(
                eq(contract.occupant_id, occ.id),
                sql`${contract.deleted_at} IS NULL`,
                ne(contract.contract_status, "terminated")
              )
            )
            .limit(1);

          if (surviving.length === 0) {
            await db
              .update(occupant)
              .set({ deleted_at: new Date(), occupant_status: "inactive" })
              .where(eq(occupant.id, occ.id));
          }
        }
      }
    } catch (e) {
      console.warn("Orphaned occupant cascade check:", e);
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
