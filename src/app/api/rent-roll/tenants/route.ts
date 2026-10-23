import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant, contract, space, building, property } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const propertyId = searchParams.get("property_id");

    const conditions = [
      eq(occupant.org_id, auth.orgId),
      sql`${occupant.deleted_at} IS NULL`,
    ];
    if (query) {
      conditions.push(
        or(
          ilike(occupant.occupant_name, `%${query}%`),
          ilike(occupant.occupant_code, `%${query}%`),
          ilike(occupant.pan_number, `%${query}%`),
          ilike(occupant.gst_number, `%${query}%`),
          ilike(occupant.email, `%${query}%`)
        )!
      );
    }

    const list = await db
      .select({
        occupant: occupant,
        contract: contract,
        space: space,
        building: building,
        property: property,
      })
      .from(occupant)
      .leftJoin(
        contract,
        and(eq(contract.occupant_id, occupant.id), sql`${contract.deleted_at} IS NULL`)
      )
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...conditions))
      .orderBy(desc(occupant.created_at));

    // Deduplicate occupants (in case an occupant has multiple contracts) or keep their primary contract
    const seenOccupants = new Map<string, any>();

    // Fetch all properties for this org to resolve unleased tenant property associations
    const orgProperties = await db
      .select({ id: property.id, name: property.property_name })
      .from(property)
      .where(and(eq(property.org_id, auth.orgId), sql`${property.deleted_at} IS NULL`));
    const propMap = new Map<string, string>();
    for (const p of orgProperties) {
      propMap.set(p.id, p.name);
      if (p.name) propMap.set(p.name.toLowerCase().trim(), p.name);
    }

    // Also fetch all non-deleted properties across DB as fallback for cross-org references
    const allDbProperties = await db
      .select({ id: property.id, name: property.property_name })
      .from(property)
      .where(sql`${property.deleted_at} IS NULL`);
    const fallbackPropMap = new Map<string, string>();
    for (const p of allDbProperties) {
      fallbackPropMap.set(p.id, p.name);
      if (p.name) fallbackPropMap.set(p.name.toLowerCase().trim(), p.name);
    }

    for (const item of list) {
      const occ = item.occupant;
      let associatedPropId = item.property?.id || null;
      let associatedPropName = item.property?.property_name || null;

      if (!associatedPropName && occ.source_row_id) {
        if (propMap.has(occ.source_row_id)) {
          associatedPropId = occ.source_row_id;
          associatedPropName = propMap.get(occ.source_row_id)!;
        } else if (propMap.has(occ.source_row_id.toLowerCase().trim())) {
          associatedPropName = propMap.get(occ.source_row_id.toLowerCase().trim())!;
        } else if (fallbackPropMap.has(occ.source_row_id)) {
          associatedPropId = occ.source_row_id;
          associatedPropName = fallbackPropMap.get(occ.source_row_id)!;
        }
      }

      // If still unassigned but this org has registered properties, link to primary property
      if (!associatedPropName && orgProperties.length > 0) {
        associatedPropId = orgProperties[0].id;
        associatedPropName = orgProperties[0].name;
      }

      if (!associatedPropName) {
        associatedPropName = "Unassigned";
      }

      if (propertyId && propertyId !== "all") {
        if (associatedPropId !== propertyId && associatedPropName !== propertyId) {
          continue;
        }
      }

      if (!seenOccupants.has(occ.id)) {
        seenOccupants.set(occ.id, {
          id: occ.id,
          tenant_name: occ.occupant_name,
          trade_name: occ.occupant_name,
          occupant_code: occ.occupant_code,
          pan: occ.pan_number,
          gstin: occ.gst_number,
          email: occ.email,
          phone: occ.phone,
          industry_sector: occ.industry_sector,
          status: occ.occupant_status || "active",
          property_id: associatedPropId,
          unit_number: item.space?.space_name || "--",
          space_code: item.space?.space_code || "--",
          area_sqft: Number((item.space as any)?.usable_area_sqft || (item.space as any)?.chargeable_area_sqft || 0),
          lease_status: item.contract ? (item.contract.contract_status === "active" ? "Active Lease" : item.contract.contract_status) : "Unassigned",
          contract_id: item.contract?.id || null,
          contract_code: item.contract?.contract_code || null,
          start_date: item.contract?.start_date || null,
          end_date: item.contract?.end_date || null,
          base_rent_rate: Number((item.contract as any)?.base_rent_rate || 0),
          cam_rate: 0,
          gross_monthly_rent: Number((item.contract as any)?.base_rent_rate || 0),
          deposit_amount_inr: Number((item.contract as any)?.deposit_amount_inr || 0),
          escalation_value: (item.contract as any)?.escalation_value || "0%",
          lock_in_months: item.contract ? Number((item.contract as any)?.lock_in_months || 0) : 0,
          notice_period_months: item.contract ? Number((item.contract as any)?.notice_period_months || 0) : 0,
        });
      }
    }

    const formatted = Array.from(seenOccupants.values());

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch tenants", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const orgId = body.org_id || auth.orgId;
    const clientAccountId = body.client_account_id || auth.clientAccountId;

    await ensureTenantOrgRecord(orgId, clientAccountId, auth.userEmail);

    const name = body.tenant_name || body.occupant_name || "New Commercial Tenant";
    const code =
      body.occupant_code ||
      body.tenant_code ||
      `OCC-${name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const [inserted] = await db
      .insert(occupant)
      .values({
        org_id: orgId,
        client_account_id: clientAccountId || null,
        occupant_code: code,
        occupant_name: name,
        occupant_type: body.occupant_type || "company",
        pan_number: body.pan || body.pan_number || null,
        gst_number: body.gstin || body.gst_number || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.billing_address || body.address || null,
        industry_sector: body.industry_sector || null,
        occupant_status: "active",
        source_row_id: body.property_id || null,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inserted.id,
          tenant_name: inserted.occupant_name,
          trade_name: inserted.occupant_name,
          occupant_code: inserted.occupant_code,
          pan: inserted.pan_number,
          gstin: inserted.gst_number,
          status: inserted.occupant_status,
          property_id: inserted.source_row_id || null,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create tenant", message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const id = body.id || body.tenant_id || body.occupant_id;

    if (!id) {
      return NextResponse.json({ error: "Tenant ID is required for update" }, { status: 400 });
    }

    const updateFields: any = {
      updated_at: new Date(),
      updated_by: auth.userId,
    };

    if (body.tenant_name || body.occupant_name) {
      updateFields.occupant_name = (body.tenant_name || body.occupant_name).trim();
    }
    if (body.email !== undefined) updateFields.email = body.email ? body.email.trim() : null;
    if (body.phone !== undefined) updateFields.phone = body.phone ? body.phone.trim() : null;
    if (body.pan || body.pan_number) updateFields.pan_number = (body.pan || body.pan_number).trim().toUpperCase();
    if (body.gstin || body.gst_number) updateFields.gst_number = (body.gstin || body.gst_number).trim().toUpperCase();
    if (body.billing_address || body.address) updateFields.address = (body.billing_address || body.address).trim();
    if (body.property_id !== undefined) updateFields.source_row_id = body.property_id || null;

    let [updated] = await db
      .update(occupant)
      .set(updateFields)
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId)))
      .returning();

    if (!updated) {
      updateFields.org_id = auth.orgId;
      [updated] = await db
        .update(occupant)
        .set(updateFields)
        .where(eq(occupant.id, id))
        .returning();
    }

    if (!updated) {
      return NextResponse.json({ error: "Tenant not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        tenant_name: updated.occupant_name,
        trade_name: updated.occupant_name,
        occupant_code: updated.occupant_code,
        pan: updated.pan_number,
        gstin: updated.gst_number,
        status: updated.occupant_status,
        property_id: updated.source_row_id || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update tenant", message: err.message },
      { status: 500 }
    );
  }
}

