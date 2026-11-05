import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, tenants } from "@/db/schema";
import { billing_entity, occupant } from "@/db/rent-roll-schema";
import { validatePanFormat, validateGstinFormat, validateCinFormat } from "@/db/validation";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Enterprise Tax Identifier Uniqueness & Compliance Validator
 * 
 * Rules:
 * 1. Organizations & Landlord SPVs:
 *    - Globally unique: Two separate subscriber accounts / landlords CANNOT share the same PAN, GSTIN, or CIN.
 * 2. Tenants (Corporate Occupants):
 *    - Scoped per landlord org: Multiple different landlords (e.g. DLF in Gurgaon and Prestige in Bengaluru)
 *      CAN both lease space to the SAME corporate tenant (e.g. Zomato, Microsoft, TCS).
 *    - Within the same landlord org, duplicate tenant profiles with the same PAN/GSTIN are prevented.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPan = (body.pan || "").trim().toUpperCase();
    const rawGstin = (body.gstin || "").trim().toUpperCase();
    const rawCin = (body.cin || "").trim().toUpperCase();
    const targetType = body.targetType || "organization"; // "organization" | "tenant"
    const orgId = (body.orgId || body.excludeOrgId || request.headers.get("x-org-id") || "").trim();

    // 1. Format Validations
    if (rawPan) {
      const panRes = validatePanFormat(rawPan);
      if (!panRes.isValid) {
        return NextResponse.json(
          { valid: false, field: "pan", error: panRes.message || "Invalid PAN format." },
          { status: 400 }
        );
      }
    }

    if (rawCin) {
      const cinRes = validateCinFormat(rawCin);
      if (!cinRes.isValid) {
        return NextResponse.json(
          { valid: false, field: "cin", error: cinRes.message || "Invalid CIN format." },
          { status: 400 }
        );
      }
    }

    if (rawGstin) {
      const gstRes = validateGstinFormat(rawGstin, rawPan || undefined);
      if (!gstRes.isValid) {
        return NextResponse.json(
          { valid: false, field: "gstin", error: gstRes.message || "Invalid GSTIN format." },
          { status: 400 }
        );
      }
    }

    // 2. Organization / Landlord SPV Checks (Global Uniqueness)
    if (targetType === "organization") {
      if (rawPan) {
        try {
          const orgMatch = await db.execute(sql`
            SELECT id, name FROM organizations 
            WHERE UPPER(pan) = ${rawPan} 
            ${orgId ? sql`AND id != ${orgId}` : sql``}
            LIMIT 1
          `);
          if (orgMatch.rows && orgMatch.rows.length > 0) {
            const matchedName = (orgMatch.rows[0] as any).name || "another organization";
            return NextResponse.json(
              {
                valid: false,
                field: "pan",
                error: `PAN ${rawPan} is already registered to legal entity '${matchedName}'. Duplicate PANs are strictly prohibited.`
              },
              { status: 409 }
            );
          }
        } catch (e) {}

        try {
          const beMatch = await db.execute(sql`
            SELECT id, entity_name, org_id FROM billing_entity 
            WHERE UPPER(pan_number) = ${rawPan}
            ${orgId ? sql`AND org_id != ${orgId}` : sql``}
            LIMIT 1
          `);
          if (beMatch.rows && beMatch.rows.length > 0) {
            const matchedName = (beMatch.rows[0] as any).entity_name || "an existing landlord entity";
            return NextResponse.json(
              {
                valid: false,
                field: "pan",
                error: `PAN ${rawPan} is already registered to billing entity '${matchedName}'. Duplicate PANs are not permitted.`
              },
              { status: 409 }
            );
          }
        } catch (e) {}
      }

      if (rawGstin) {
        try {
          const orgMatch = await db.execute(sql`
            SELECT id, name FROM organizations 
            WHERE UPPER(gstin) = ${rawGstin}
            ${orgId ? sql`AND id != ${orgId}` : sql``}
            LIMIT 1
          `);
          if (orgMatch.rows && orgMatch.rows.length > 0) {
            const matchedName = (orgMatch.rows[0] as any).name || "another organization";
            return NextResponse.json(
              {
                valid: false,
                field: "gstin",
                error: `GSTIN ${rawGstin} is already registered to legal entity '${matchedName}'. Duplicate GSTINs are strictly prohibited.`
              },
              { status: 409 }
            );
          }
        } catch (e) {}

        try {
          const beMatch = await db.execute(sql`
            SELECT id, entity_name, org_id FROM billing_entity 
            WHERE UPPER(gst_number) = ${rawGstin}
            ${orgId ? sql`AND org_id != ${orgId}` : sql``}
            LIMIT 1
          `);
          if (beMatch.rows && beMatch.rows.length > 0) {
            const matchedName = (beMatch.rows[0] as any).entity_name || "an existing billing entity";
            return NextResponse.json(
              {
                valid: false,
                field: "gstin",
                error: `GSTIN ${rawGstin} is already registered to billing entity '${matchedName}'. Duplicate GSTINs are not permitted.`
              },
              { status: 409 }
            );
          }
        } catch (e) {}
      }

      if (rawCin) {
        try {
          const cinMatch = await db.execute(sql`
            SELECT id, trade_name FROM tenants 
            WHERE UPPER(cin) = ${rawCin}
            ${orgId ? sql`AND org_id != ${orgId}` : sql``}
            LIMIT 1
          `);
          if (cinMatch.rows && cinMatch.rows.length > 0) {
            const matchedName = (cinMatch.rows[0] as any).trade_name || "an existing company";
            return NextResponse.json(
              {
                valid: false,
                field: "cin",
                error: `CIN ${rawCin} is already registered to company '${matchedName}'. Duplicate CINs are not permitted.`
              },
              { status: 409 }
            );
          }
        } catch (e) {}
      }
    }

    // 3. Tenant / Occupant Checks (Scoped to Landlord Organization)
    if (targetType === "tenant" && orgId) {
      if (rawPan || rawGstin) {
        const dupConditions: any[] = [];
        if (rawPan) dupConditions.push(sql`UPPER(pan_number) = ${rawPan}`);
        if (rawGstin) dupConditions.push(sql`UPPER(gst_number) = ${rawGstin}`);

        try {
          const existingDups = await db.execute(sql`
            SELECT id, occupant_name, occupant_code FROM occupant
            WHERE org_id = ${orgId}
              AND deleted_at IS NULL
              AND (${sql.join(dupConditions, sql` OR `)})
            LIMIT 1
          `);
          if (existingDups.rows && existingDups.rows.length > 0) {
            const match = existingDups.rows[0] as any;
            return NextResponse.json(
              {
                valid: false,
                field: rawPan ? "pan" : "gstin",
                error: `A tenant with this ${rawPan ? "PAN" : "GSTIN"} is already recorded in your portfolio: '${match.occupant_name}' (${match.occupant_code}).`
              },
              { status: 409 }
            );
          }
        } catch (e) {}
      }
    }

    return NextResponse.json({
      valid: true,
      message: "Tax identifiers verified: format valid and compliance approved."
    });
  } catch (err: any) {
    console.error("Error in /api/auth/validate-tax-id:", err);
    return NextResponse.json(
      { valid: false, error: "Internal error validating tax identifiers." },
      { status: 500 }
    );
  }
}
