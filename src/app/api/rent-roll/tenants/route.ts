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
    const propMap = new Map(orgProperties.map((p) => [p.id, p.name]));

    for (const item of list) {
      const occ = item.occupant;
      const associatedPropId = item.property?.id || (occ.source_row_id && propMap.has(occ.source_row_id) ? occ.source_row_id : null);
      const associatedPropName = item.property?.property_name || (associatedPropId ? propMap.get(associatedPropId) : null) || "Unassigned";

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
          property_name: associatedPropName,
          unit_number: item.space?.space_name || (item.contract ? "Active Leased Unit" : "Pending Lease Allocation"),
          lease_status: item.contract ? (item.contract.contract_status === "active" ? "Active Lease" : item.contract.contract_status) : "Pending Lease Allocation",
          contract_id: item.contract?.id || null,
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
