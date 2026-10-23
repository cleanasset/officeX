import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  contractSpace,
  contractCharge,
  rentStep,
  contractClause,
  concession,
  occupant,
  space,
  building,
  property,
  task,
} from "@/db/schema";
import {
  validateRequiredFields,
  validateContractDates,
  validateSpaceOverlap,
  validateDepositBounds,
  validateChargeDates,
} from "@/db/validation";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

/**
 * RR-CONT-01: Create Contract (Wizard Steps 1–7)
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const orgId = body.org_id || auth.orgId;
    let clientAccountId = body.client_account_id || auth.clientAccountId;

    const ensured = await ensureTenantOrgRecord(orgId, clientAccountId, auth.userEmail);
    clientAccountId = ensured.clientAccountId;

    // Auto-resolve or provision space_id for multi-tenant and multi-floor contracts
    let targetSpaceId = body.space_id;
    if (!targetSpaceId && (body.property_id || body.building_id)) {
      const spaceConditions = [
        eq(space.org_id, orgId),
        sql`${space.deleted_at} IS NULL`,
      ];
      if (body.building_id) {
        spaceConditions.push(eq(space.building_id, body.building_id));
      }

      const existingSpaces = await db
        .select({
          spaceId: space.id,
          buildingId: space.building_id,
          spaceName: space.space_name,
          spaceCode: space.space_code,
          floorName: space.floor_name,
        })
        .from(space)
        .innerJoin(building, eq(space.building_id, building.id))
        .where(
          and(
            ...spaceConditions,
            body.property_id ? eq(building.property_id, body.property_id) : sql`1=1`
          )
        );

      const targetUnitName = (body.space_name || body.space_unit || "").trim();
      const targetFloorName = (body.floor_name || body.floor || "").trim();

      // Check for an existing space that matches requested unit name or is completely vacant
      let candidateSpaceId: string | null = null;
      for (const spc of existingSpaces) {
        const nameMatches = targetUnitName && spc.spaceName.toLowerCase() === targetUnitName.toLowerCase();
        
        // Check if this space already has an active overlapping contract
        const activeContractsOnSpace = await db
          .select({
            id: contract.id,
            start_date: contract.start_date,
            end_date: contract.end_date,
            contract_status: contract.contract_status,
          })
          .from(contract)
          .where(
            and(
              eq(contract.space_id, spc.spaceId),
              sql`${contract.contract_status} IN ('active', 'draft', 'future', 'notice_served', 'holding_over')`,
              sql`${contract.deleted_at} IS NULL`
            )
          );

        const hasOverlap = activeContractsOnSpace.some((ac) => {
          const reqStart = new Date(body.start_date || new Date().toISOString());
          const reqEnd = new Date(body.end_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString());
          const exStart = new Date(ac.start_date);
          const exEnd = new Date(ac.end_date);
          return reqStart <= exEnd && exStart <= reqEnd;
        });

        if (nameMatches && !hasOverlap) {
          candidateSpaceId = spc.spaceId;
          break;
        } else if (!targetUnitName && !hasOverlap && !candidateSpaceId) {
          candidateSpaceId = spc.spaceId;
        }
      }

      if (candidateSpaceId) {
        targetSpaceId = candidateSpaceId;
      } else if (body.property_id || body.building_id) {
        // Find or provision building for this property
        let bldId = body.building_id;
        let propertyCode = "PR";
        let defaultArea = "5000";

        if (body.property_id) {
          const propRows = await db
            .select()
            .from(property)
            .where(eq(property.id, body.property_id))
            .limit(1);

          if (propRows.length > 0) {
            const p = propRows[0];
            propertyCode = p.property_code || "PR";
            defaultArea = String(p.total_leasable_area_sqft || 5000);

            if (!bldId) {
              const [existingBld] = await db
                .select({ id: building.id })
                .from(building)
                .where(and(eq(building.property_id, p.id), sql`${building.deleted_at} IS NULL`))
                .limit(1);

              if (existingBld) {
                bldId = existingBld.id;
              } else {
                const [newBld] = await db
                  .insert(building)
                  .values({
                    org_id: orgId,
                    client_account_id: clientAccountId,
                    property_id: p.id,
                    building_name: `${p.property_name} Tower 1`,
                    building_code: `BLD-${propertyCode}-01`,
                    total_area_sqft: p.total_leasable_area_sqft,
                  })
                  .returning();
                bldId = newBld.id;
              }
            }
          }
        }

        if (bldId) {
          const assignedUnitName = targetUnitName || (targetFloorName ? `${targetFloorName} Suite` : `Suite ${Math.floor(100 + Math.random() * 900)}`);
          const spaceArea = body.area_sqft ? String(body.area_sqft) : defaultArea;

          const [newSpc] = await db
            .insert(space)
            .values({
              org_id: orgId,
              client_account_id: clientAccountId,
              building_id: bldId,
              space_name: assignedUnitName,
              space_code: `SPC-${propertyCode}-${Math.floor(100 + Math.random() * 900)}`,
              floor_name: targetFloorName || null,
              chargeable_area_sqft: spaceArea,
              occupancy_status: "occupied",
              is_leasable: true,
              space_type: targetFloorName ? "floor" : "suite",
            })
            .returning();

          targetSpaceId = newSpc.id;
        }
      }
    }

    // Normalize billing_model enum (must be area | seats | fixed | hybrid)
    const rawBillingModel = String(body.billing_model || "").toLowerCase();
    const normalizedBillingModel = rawBillingModel.includes("seat")
      ? "seats"
      : rawBillingModel.includes("fixed")
      ? "fixed"
      : rawBillingModel.includes("hybrid")
      ? "hybrid"
      : "area";

    let finalSpaceId = targetSpaceId || body.space_id;
    if (!finalSpaceId) {
      const [anySpace] = await db
        .select({ id: space.id })
        .from(space)
        .where(eq(space.org_id, orgId))
        .limit(1);
      if (anySpace) {
        finalSpaceId = anySpace.id;
      } else {
        const [sysSpace] = await db.select({ id: space.id }).from(space).limit(1);
        if (sysSpace) {
          finalSpaceId = sysSpace.id;
        }
      }
    }

    let finalOccupantId = body.occupant_id;
    if (!finalOccupantId) {
      const [latestOcc] = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(eq(occupant.org_id, orgId))
        .orderBy(desc(occupant.created_at))
        .limit(1);
      if (latestOcc) {
        finalOccupantId = latestOcc.id;
      } else {
        const [anyOcc] = await db.select({ id: occupant.id }).from(occupant).orderBy(desc(occupant.created_at)).limit(1);
        if (anyOcc) finalOccupantId = anyOcc.id;
      }
    }

    const payload = {
      ...body,
      org_id: orgId,
      client_account_id: clientAccountId,
      space_id: finalSpaceId,
      occupant_id: finalOccupantId,
      contract_code: body.contract_code || `LEAS-${Date.now().toString().slice(-6)}`,
      contract_type: body.contract_type || "lease",
      direction: body.direction || "receivable",
      billing_model: normalizedBillingModel,
      contract_status: body.contract_status || "active",
      approval_status: body.approval_status || "approved",
      is_evergreen: body.is_evergreen ?? false,
      is_template: body.is_template ?? false,
      start_date: body.start_date || new Date().toISOString().split("T")[0],
      end_date: body.end_date || new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3).toISOString().split("T")[0],
      version: 1,
      created_by: auth.userId,
      updated_by: auth.userId,
    };

    // 1. Validate required fields
    const reqValidation = validateRequiredFields("contract", payload);
    if (!reqValidation.isValid) {
      console.error("Contract validation failed:", reqValidation.errors, payload);
      return NextResponse.json(
        { error: "Validation failed", details: reqValidation.errors },
        { status: 422 }
      );
    }

    // 2. Validate dates (§5.5a Rule 1 & Rule 2)
    const dateValidation = validateContractDates({
      start_date: payload.start_date,
      end_date: payload.end_date,
      commencement_date: payload.commencement_date,
    });
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: "Date validation failed", details: dateValidation.errors },
        { status: 422 }
      );
    }

    // 3. Validate deposit (§5.5a Rule 5)
    if (payload.deposit_amount_inr !== undefined && payload.deposit_amount_inr !== null) {
      const depValidation = validateDepositBounds(Number(payload.deposit_amount_inr));
      if (!depValidation.isValid) {
        return NextResponse.json(
          { error: "Deposit validation failed", details: depValidation.errors },
          { status: 422 }
        );
      }
    }

    // 4. Overlap check on space (RR-CONT-24)
    if (payload.space_id) {
      const existingContracts = await db
        .select({
          id: contract.id,
          contract_code: contract.contract_code,
          start_date: contract.start_date,
          end_date: contract.end_date,
          contract_status: contract.contract_status,
        })
        .from(contract)
        .where(
          and(
            eq(contract.org_id, orgId),
            eq(contract.space_id, payload.space_id)
          )
        );

      const overlapCheck = validateSpaceOverlap(existingContracts, {
        start_date: payload.start_date,
        end_date: payload.end_date,
      });

      if (!overlapCheck.isValid) {
        return NextResponse.json(
          { error: "Space conflict", details: overlapCheck.errors },
          { status: 409 }
        );
      }
    }

    // 5. Validate charges dates (§5.5a Rule 6)
    if (Array.isArray(body.charges)) {
      for (const ch of body.charges) {
        if (ch.start_date) {
          const chDateCheck = validateChargeDates(payload.start_date, ch.start_date);
          if (!chDateCheck.isValid) {
            return NextResponse.json(
              { error: "Charge date validation failed", details: chDateCheck.errors },
              { status: 422 }
            );
          }
        }
      }
    }

    // Build statutory metadata remarks if provided
    const statutoryNotes = [
      body.registration_status ? `Registration: ${body.registration_status}` : null,
      body.stamp_duty_amount ? `Stamp Duty: ₹${body.stamp_duty_amount} (Borne by: ${body.stamp_duty_borne_by || "Shared"})` : null,
      body.tds_applicable !== undefined ? `TDS Sec 194-I: ${body.tds_applicable ? "Applicable (10%)" : "Exempt"}` : null,
    ].filter(Boolean).join(" | ");

    const combinedRemarks = [
      payload.remarks || payload.notes,
      statutoryNotes ? `[Statutory: ${statutoryNotes}]` : null,
    ].filter(Boolean).join("\n");

    // Insert Contract
    const [insertedContract] = await db
      .insert(contract)
      .values({
        org_id: orgId,
        client_account_id: clientAccountId,
        contract_code: payload.contract_code,
        contract_type: payload.contract_type,
        direction: payload.direction || "receivable",
        billing_model: payload.billing_model,
        contract_status: payload.contract_status,
        approval_status: payload.approval_status,
        occupant_id: payload.occupant_id,
        space_id: payload.space_id,
        start_date: payload.start_date,
        end_date: payload.end_date,
        commencement_date: payload.commencement_date || null,
        lock_in_period_days: payload.lock_in_period_days || (payload.lock_in_months ? payload.lock_in_months * 30 : 0),
        notice_period_days: payload.notice_period_days || 0,
        is_evergreen: payload.is_evergreen,
        is_template: payload.is_template,
        deposit_amount_inr: payload.deposit_amount_inr ? String(payload.deposit_amount_inr) : null,
        deposit_status: payload.deposit_status || "pending",
        remarks: combinedRemarks || null,
        created_by: auth.userId,
        updated_by: auth.userId,
        version: 1,
      })
      .returning();

    // Link Space in contract_space
    if (payload.space_id) {
      await db.insert(contractSpace).values({
        org_id: orgId,
        client_account_id: clientAccountId,
        contract_id: insertedContract.id,
        space_id: payload.space_id,
        created_by: auth.userId,
        updated_by: auth.userId,
      });

      await db
        .update(space)
        .set({ occupancy_status: "occupied" })
        .where(eq(space.id, payload.space_id));
    }

    // Insert Charges & Rent Steps
    if (Array.isArray(body.charges) && body.charges.length > 0) {
      for (const ch of body.charges) {
        const defaultSac =
          ch.hsn_sac ||
          (ch.invoice_group === "cam" || ch.component === "cam"
            ? "997221"
            : ch.component === "parking" || ch.component === "parking_slot"
            ? "9967"
            : "997212");

        const [insertedCharge] = await db
          .insert(contractCharge)
          .values({
            org_id: orgId,
            client_account_id: clientAccountId,
            contract_id: insertedContract.id,
            component: ch.component || "base_rent",
            calc_basis: ch.calc_basis || "per_area",
            rate: ch.rate ? String(ch.rate) : "0",
            rate_period: ch.rate_period || "month",
            quantity_basis: ch.quantity_basis ? String(ch.quantity_basis) : null,
            is_included: ch.is_included ?? false,
            is_recoverable: ch.is_recoverable ?? false,
            invoice_group: ch.invoice_group || "rent",
            hsn_sac: defaultSac,
            billing_mode: ch.billing_mode || "advance",
            start_date: ch.start_date || payload.start_date,
            end_date: ch.end_date || payload.end_date,
            created_by: auth.userId,
            updated_by: auth.userId,
          })
          .returning();

        if (Array.isArray(ch.rent_steps)) {
          let stepNo = 1;
          for (const st of ch.rent_steps) {
            await db.insert(rentStep).values({
              org_id: orgId,
              client_account_id: clientAccountId,
              contract_charge_id: insertedCharge.id,
              step_no: stepNo++,
              effective_date: st.effective_date,
              escalation_type: st.escalation_type || "percentage",
              rate: String(st.rate),
              escalation_value: st.escalation_value ? String(st.escalation_value) : null,
              status: st.status || "scheduled",
              created_by: auth.userId,
              updated_by: auth.userId,
            });
          }
        }
      }
    } else if (Number(payload.base_rent_rate || body.base_rent_rate || 0) > 0) {
      // Auto-provision canonical base rent contractCharge for billing & rent roll engines
      const rentRate = Number(payload.base_rent_rate || body.base_rent_rate);
      const [insertedCharge] = await db
        .insert(contractCharge)
        .values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_id: insertedContract.id,
          component: "base_rent",
          calc_basis: "fixed",
          rate: String(rentRate),
          rate_period: "month",
          quantity_basis: "1",
          is_included: false,
          is_recoverable: false,
          invoice_group: "rent",
          billing_mode: "advance",
          start_date: payload.start_date,
          end_date: payload.end_date,
          created_by: auth.userId,
          updated_by: auth.userId,
        })
        .returning();

      // If escalation specified, provision rentStep for Escalation Calendar engine
      const escPct = Number(body.escalation_value || payload.escalation_value || 0);
      if (escPct > 0) {
        await db.insert(rentStep).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_charge_id: insertedCharge.id,
          step_no: 1,
          effective_date: payload.start_date,
          escalation_type: "percentage",
          rate: String(rentRate),
          escalation_value: String(escPct),
          status: "scheduled",
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      }
    }

    // Insert Concessions
    if (Array.isArray(body.concessions)) {
      for (const conc of body.concessions) {
        await db.insert(concession).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_id: insertedContract.id,
          concession_type: conc.concession_type || "rent_free",
          start_date: conc.start_date || payload.start_date,
          end_date: conc.end_date || payload.end_date,
          concession_value: String(conc.concession_value || 0),
          description: conc.description || null,
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      }
    }

    // Insert Clauses
    if (Array.isArray(body.clauses)) {
      for (const cl of body.clauses) {
        await db.insert(contractClause).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_id: insertedContract.id,
          clause_type: cl.clause_type || "lock_in",
          clause_title: cl.clause_title || "Terms Clause",
          clause_text: cl.clause_text || "Standard contract clause",
          status: cl.status || "open",
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Contract created successfully",
      contract: insertedContract,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating contract:", err);
    return NextResponse.json(
      { error: "Failed to create contract", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * RR-CONT-04 / §S-10: List Contracts with Filters & Multi-client Isolation
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const occupantId = searchParams.get("occupant_id");
    const propertyId = searchParams.get("property_id");
    const buildingId = searchParams.get("building_id");
    const spaceId = searchParams.get("space_id");
    const query = searchParams.get("query");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")));
    const offset = (page - 1) * limit;

    const conditions = [
      eq(contract.org_id, auth.orgId),
      sql`${contract.deleted_at} IS NULL`,
    ];

    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(contract.client_account_id, auth.clientAccountId));
    } else if (searchParams.get("client_account_id")) {
      conditions.push(eq(contract.client_account_id, searchParams.get("client_account_id")!));
    }

    if (status && status !== "all") {
      conditions.push(eq(contract.contract_status, status as any));
    }
    const approvalStatus = searchParams.get("approval_status");
    if (approvalStatus && approvalStatus !== "all") {
      conditions.push(eq(contract.approval_status, approvalStatus as any));
    }
    if (occupantId) {
      conditions.push(eq(contract.occupant_id, occupantId));
    }
    if (spaceId) {
      conditions.push(eq(contract.space_id, spaceId));
    }
    if (query) {
      conditions.push(
        ilike(contract.contract_code, `%${query}%`)
      );
    }

    const contractsList = await db
      .select({
        contract: contract,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
        occupant_type: occupant.occupant_type,
        occupant_email: occupant.email,
        space_name: space.space_name,
        space_code: space.space_code,
        chargeable_area_sqft: space.chargeable_area_sqft,
        total_seats: building.total_seats,
        building_name: building.building_name,
        property_name: property.property_name,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(and(...conditions))
      .orderBy(desc(contract.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contract)
      .where(and(...conditions));

    const formattedContracts = contractsList.map((item) => ({
      ...item.contract,
      ...item,
      contract: item.contract,
      base_rent_rate: Number((item.contract as any)?.base_rent_rate || 0),
    }));

    return NextResponse.json({
      success: true,
      data: formattedContracts,
      pagination: {
        total: Number(countResult?.count || 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult?.count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching contracts:", err);
    return NextResponse.json(
      { error: "Failed to fetch contracts", message: err.message },
      { status: 500 }
    );
  }
}
