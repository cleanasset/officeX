import { NextResponse } from "next/server";
import { db } from "@/db";
import { occupant, contract, space, building, property, contractCharge, organization, billingEntity } from "@/db/schema";
import { validatePanFormat, validateGstinFormat, validateCinFormat, validatePincodeFormat, validatePhoneFormat } from "@/db/validation";
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
import { checkOwnerTenantIdentityOverlap } from "@/lib/rent-roll/counterparty-guard";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const propertyId = searchParams.get("property_id");

    const conditions = [
      eq(occupant.org_id, auth.orgId),
      sql`${occupant.deleted_at} IS NULL`,
      sql`${occupant.occupant_status} != 'inactive'`,
    ];

    // Strict occupant isolation: occupants can only view their own profile
    if (auth.role === "occupant" || auth.role === "tenant") {
      conditions.push(
        or(
          eq(occupant.id, auth.userId),
          auth.userEmail ? ilike(occupant.email, auth.userEmail) : sql`FALSE`
        )!
      );
    }
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

    // Fetch all properties for this org to resolve unleased tenant property associations (strictly org-isolated)
    const orgProperties = await db
      .select({ id: property.id, name: property.property_name })
      .from(property)
      .where(and(eq(property.org_id, auth.orgId), sql`${property.deleted_at} IS NULL`));
    const propMap = new Map<string, string>();
    for (const p of orgProperties) {
      propMap.set(p.id, p.name);
      if (p.name) propMap.set(p.name.toLowerCase().trim(), p.name);
    }

    // Fetch all contract charges for accurate rent & CAM
    const chargesMap: Record<string, { rent: number; cam: number }> = {};
    const charges = await db
      .select()
      .from(contractCharge)
      .where(
        and(
          eq(contractCharge.org_id, auth.orgId),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      );
    for (const ch of charges) {
      if (!chargesMap[ch.contract_id]) chargesMap[ch.contract_id] = { rent: 0, cam: 0 };
      const val = parseFloat(ch.rate || "0");
      if (ch.component === "base_rent" || ch.invoice_group === "rent") {
        chargesMap[ch.contract_id].rent += val;
      } else if (ch.component === "cam" || ch.invoice_group === "cam") {
        chargesMap[ch.contract_id].cam += val;
      }
    }

    for (const item of list) {
      const occ = item.occupant;
      let associatedPropId = item.property?.id || null;
      let associatedPropName = item.property?.property_name || null;

      let occMeta: any = {};
      let propLookupKey = occ.source_row_id;
      if (occ.source_row_id && occ.source_row_id.startsWith("{")) {
        try {
          occMeta = JSON.parse(occ.source_row_id);
          propLookupKey = occMeta.property_id || null;
        } catch { }
      }

      if (!associatedPropName && propLookupKey) {
        if (propMap.has(propLookupKey)) {
          associatedPropId = propLookupKey;
          associatedPropName = propMap.get(propLookupKey)!;
        } else if (propMap.has(propLookupKey.toLowerCase().trim())) {
          associatedPropName = propMap.get(propLookupKey.toLowerCase().trim())!;
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

      let contractMeta: any = {};
      if (item.contract?.source_row_id && item.contract.source_row_id.startsWith("{")) {
        try {
          contractMeta = JSON.parse(item.contract.source_row_id);
        } catch { }
      }

      const rentRate = item.contract
        ? chargesMap[item.contract.id]?.rent || Number((item.contract as any)?.base_rent_rate || 0)
        : 0;
      const camRate = item.contract ? chargesMap[item.contract.id]?.cam || 0 : 0;
      const lockIn = item.contract?.lock_in_period_days
        ? Math.round(item.contract.lock_in_period_days / 30)
        : Number(contractMeta.lock_in_months || 0);
      const noticePeriod = item.contract?.notice_period_days
        ? Math.round(item.contract.notice_period_days / 30)
        : Number(contractMeta.notice_period_months || 0);
      const escalationStr = contractMeta.escalation_pct
        ? `${contractMeta.escalation_pct}%`
        : (item.contract as any)?.escalation_value || "5%";

      if (!seenOccupants.has(occ.id)) {
        seenOccupants.set(occ.id, {
          id: occ.id,
          tenant_name: occMeta.legal_name || occ.occupant_name,
          trade_name: occMeta.trade_name || occ.occupant_name,
          occupant_code: occ.occupant_code,
          occupant_type: occ.occupant_type,
          company_type: occ.occupant_type === "individual" ? "sole_proprietorship" : "pvt_ltd",
          pan: occ.pan_number,
          gstin: occ.gst_number,
          cin: occMeta.cin_number || occMeta.cin || "",
          cin_number: occMeta.cin_number || occMeta.cin || "",
          signatory_name: occMeta.signatory_name || "",
          signatory_designation: occMeta.signatory_designation || "",
          alt_contact_name: occMeta.alt_contact_name || "",
          alt_contact_phone: occMeta.alt_contact_phone || "",
          email: occ.email,
          phone: occ.phone,
          address: occ.address,
          billing_address: occ.address,
          city: occ.city || occMeta.city || "",
          state: occ.state || occMeta.state || "",
          postal_code: occ.postal_code || occMeta.postal_code || occMeta.pincode || "",
          pincode: occ.postal_code || occMeta.postal_code || occMeta.pincode || "",
          industry_sector: occ.industry_sector || occMeta.industry_type || "IT & Software",
          status: occ.occupant_status || "active",
          portal_status: (item.contract && (item.contract.contract_status === "active" || (item.contract as any).contract_status === "pending_acceptance")) || occ.occupant_status === "active" ? "active" : "pending",
          is_activated: Boolean(item.contract) || occ.occupant_status === "active",
          property_id: associatedPropId,
          property_name: associatedPropName,
          unit_number: item.space?.space_name || "--",
          space_code: item.space?.space_code || "--",
          area_sqft: Number((item.space as any)?.usable_area_sqft || (item.space as any)?.chargeable_area_sqft || 0),
          lease_status: item.contract ? (item.contract.contract_status === "active" ? "Active Lease" : item.contract.contract_status) : "Unassigned",
          contract_id: item.contract?.id || null,
          contract_code: item.contract?.contract_code || null,
          start_date: item.contract?.start_date || null,
          end_date: item.contract?.end_date || null,
          base_rent_rate: rentRate,
          cam_rate: camRate,
          gross_monthly_rent: rentRate,
          deposit_amount_inr: Number(item.contract?.deposit_amount_inr || 0),
          escalation_value: escalationStr,
          lock_in_months: lockIn,
          notice_period_months: noticePeriod,
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
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot register tenant records" }, { status: 403 });
    }

    const body = await req.json();

    const orgId = body.org_id || auth.orgId;
    const clientAccountId = body.client_account_id || auth.clientAccountId;

    await ensureTenantOrgRecord(orgId, clientAccountId, auth.userEmail);

    const name = body.tenant_name || body.occupant_name || "New Commercial Tenant";
    const panToTest = (body.pan || body.pan_number || "").trim().toUpperCase();
    const gstToTest = (body.gstin || body.gst_number || "").trim().toUpperCase();
    const tenantEmail = (body.email || "").trim().toLowerCase();
    const userEmail = (auth.userEmail || "").trim().toLowerCase();

    if (panToTest) {
      const panRes = validatePanFormat(panToTest);
      if (!panRes.isValid) {
        return NextResponse.json({ error: panRes.message || "Invalid PAN format." }, { status: 400 });
      }
    }

    const cinToTest = (body.cin_number || body.cin || "").trim().toUpperCase();
    if (cinToTest) {
      const cinRes = validateCinFormat(cinToTest);
      if (!cinRes.isValid) {
        return NextResponse.json({ error: cinRes.message || "Invalid CIN format." }, { status: 400 });
      }
    }

    if (gstToTest) {
      const gstRes = validateGstinFormat(gstToTest, panToTest || undefined);
      if (!gstRes.isValid) {
        return NextResponse.json({ error: gstRes.message || "Invalid GSTIN format." }, { status: 400 });
      }
    }

    const phoneToTest = (body.phone || body.mobile || "").trim();
    if (phoneToTest) {
      const phoneRes = validatePhoneFormat(phoneToTest);
      if (!phoneRes.isValid) {
        return NextResponse.json({ error: phoneRes.message || "Invalid mobile number." }, { status: 400 });
      }
    }

    const pinToTest = (body.pincode || body.postal_code || "").trim();
    if (pinToTest) {
      const pinRes = validatePincodeFormat(pinToTest);
      if (!pinRes.isValid) {
        return NextResponse.json({ error: pinRes.message || "Invalid pincode." }, { status: 400 });
      }
    }

    // 1. Strict Counterparty Isolation: Property Owner / Landlord / SPV cannot overlap Tenant on Email, Phone, PAN, or GSTIN
    try {
      const ownerEmails: string[] = [];
      const ownerPhones: string[] = [];
      const ownerPans: string[] = [];
      const ownerGstins: string[] = [];

      if (userEmail) ownerEmails.push(userEmail);

      const [landlordOrg] = await db
        .select()
        .from(organization)
        .where(eq(organization.id, orgId))
        .limit(1);

      if (landlordOrg) {
        let landlordMeta: any = {};
        if (landlordOrg.source_row_id && typeof landlordOrg.source_row_id === "string" && landlordOrg.source_row_id.startsWith("{")) {
          try { landlordMeta = JSON.parse(landlordOrg.source_row_id); } catch {}
        }
        if (landlordMeta.pan) ownerPans.push(landlordMeta.pan);
        if (landlordMeta.gstin) ownerGstins.push(landlordMeta.gstin);
        if (landlordMeta.email) ownerEmails.push(landlordMeta.email);
        if (landlordMeta.contact_email) ownerEmails.push(landlordMeta.contact_email);
        if (landlordMeta.phone) ownerPhones.push(landlordMeta.phone);
        if (landlordMeta.contact_phone) ownerPhones.push(landlordMeta.contact_phone);
        if (landlordMeta.primary_contact_phone) ownerPhones.push(landlordMeta.primary_contact_phone);
      }

      const orgProperties = await db
        .select({ source_row_id: property.source_row_id })
        .from(property)
        .where(and(eq(property.org_id, orgId), sql`${property.deleted_at} IS NULL`));

      for (const propRow of orgProperties) {
        if (propRow.source_row_id && typeof propRow.source_row_id === "string" && propRow.source_row_id.startsWith("{")) {
          try {
            const pMeta = JSON.parse(propRow.source_row_id);
            if (pMeta.contact_phone) ownerPhones.push(pMeta.contact_phone);
            if (pMeta.primary_contact_phone) ownerPhones.push(pMeta.primary_contact_phone);
            if (pMeta.contact_email) ownerEmails.push(pMeta.contact_email);
            if (pMeta.email) ownerEmails.push(pMeta.email);
            if (pMeta.pan) ownerPans.push(pMeta.pan);
            if (pMeta.gstin) ownerGstins.push(pMeta.gstin);
          } catch {}
        }
      }

      const orgBillingEntities = await db
        .select({ gst_number: billingEntity.gst_number })
        .from(billingEntity)
        .where(and(eq(billingEntity.org_id, orgId), sql`${billingEntity.deleted_at} IS NULL`));

      for (const be of orgBillingEntities) {
        if (be.gst_number) ownerGstins.push(be.gst_number);
      }

      const overlap = checkOwnerTenantIdentityOverlap(
        { emails: ownerEmails, phones: ownerPhones, pans: ownerPans, gstins: ownerGstins },
        {
          email: tenantEmail,
          phone: phoneToTest,
          altPhone: body.alt_contact_phone,
          pan: panToTest,
          gstin: gstToTest,
        }
      );

      if (overlap.hasConflict) {
        return NextResponse.json({ error: overlap.message }, { status: 422 });
      }
    } catch (err) {
      console.warn("Landlord self-lease check notice:", err);
    }

    if (panToTest || gstToTest) {

      // 2. Format validation for PAN and GSTIN independently (no cross-field blocking)
      // Entities, branch offices, and group companies can have differing PAN and GST numbers.

      // 3. Duplicate tenant check with precise field attribution (Point 4)
      const dupConditions = [];
      if (panToTest) dupConditions.push(eq(occupant.pan_number, panToTest));
      if (gstToTest) dupConditions.push(eq(occupant.gst_number, gstToTest));

      const existingDups = await db
        .select({
          id: occupant.id,
          name: occupant.occupant_name,
          code: occupant.occupant_code,
          pan: occupant.pan_number,
          gst: occupant.gst_number,
        })
        .from(occupant)
        .where(
          and(
            eq(occupant.org_id, orgId),
            sql`${occupant.deleted_at} IS NULL`,
            or(...dupConditions)!
          )
        );

      if (existingDups.length > 0) {
        const dup = existingDups[0];
        const collidedOnGst = gstToTest && dup.gst === gstToTest;
        const collidedOnPan = panToTest && dup.pan === panToTest;
        const collisionLabel =
          collidedOnGst && collidedOnPan
            ? `PAN (${panToTest}) & GSTIN (${gstToTest})`
            : collidedOnGst
              ? `GSTIN (${gstToTest})`
              : `PAN (${panToTest})`;

        return NextResponse.json(
          {
            error: `A tenant with the same ${collisionLabel} already exists: '${dup.name}' (${dup.code}). Duplicate corporate tax identifiers are not permitted.`,
            existingTenant: dup,
          },
          { status: 409 }
        );
      }
    }

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
        pan_number: panToTest || null,
        gst_number: gstToTest || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.billing_address || body.address || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: pinToTest || null,
        industry_sector: body.industry_sector || body.industry || body.industryType || null,
        occupant_status: "active",
        source_row_id: JSON.stringify({
          property_id: body.property_id || null,
          trade_name: body.trade_name || body.tenant_name || name,
          legal_name: body.company_name || body.legal_name || name,
          cin_number: cinToTest || null,
          signatory_name: body.signatory_name || body.signatory || null,
          signatory_designation: body.signatory_designation || null,
          alt_contact_name: body.alt_contact_name || null,
          alt_contact_phone: body.alt_contact_phone || null,
          city: body.city || null,
          state: body.state || null,
          postal_code: pinToTest || null,
          pincode: pinToTest || null,
          industry_type: body.industry_sector || body.industry || body.industryType || null,
        }),
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
          cin: cinToTest || null,
          cin_number: cinToTest || null,
          signatory_name: body.signatory_name || body.signatory || null,
          city: inserted.city,
          state: inserted.state,
          postal_code: inserted.postal_code,
          pincode: inserted.postal_code,
          industry_sector: inserted.industry_sector,
          status: inserted.occupant_status,
          property_id: body.property_id || null,
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

export async function DELETE(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tenant ID is required for deletion" }, { status: 400 });
    }

    await db
      .update(occupant)
      .set({ deleted_at: new Date(), updated_by: auth.userId })
      .where(and(eq(occupant.id, id), eq(occupant.org_id, auth.orgId)));

    return NextResponse.json({ success: true, message: "Tenant deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete tenant", message: err.message },
      { status: 500 }
    );
  }
}

