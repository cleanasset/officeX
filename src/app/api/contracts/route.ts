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
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";
import { ensureTenantOrgRecord } from "@/lib/rent-roll/ensure-org";
import {
  addDaysYmd,
  addMonthsYmd,
  normalizeTdsPolicy,
  parseLocalYmd,
  roundInr,
} from "@/lib/rent-roll/billing/lease-financial-engine";
import { eq, and, sql, desc, or, ilike, ne } from "drizzle-orm";

/**
 * RR-CONT-01: Create Contract (Wizard Steps 1–7)
 */
export async function POST(req: Request) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required to create a lease contract" }, { status: 401 });
    }

    const auth = getAuthContext(req);
    if (auth.role === "occupant" || auth.role === "tenant") {
      return NextResponse.json({ error: "Forbidden: Tenants cannot create contracts" }, { status: 403 });
    }
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

      // If no space matched by name, check if there's an unused space in the building with 0 active contracts
      // (e.g. auto-provisioned placeholder like "Suite 101") to prevent duplicating square footage
      if (!candidateSpaceId && existingSpaces.length > 0) {
        for (const spc of existingSpaces) {
          const contractsCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(contract)
            .where(
              and(
                eq(contract.space_id, spc.spaceId),
                sql`${contract.deleted_at} IS NULL`,
                sql`${contract.contract_status} IN ('active', 'draft', 'future', 'notice_served', 'holding_over')`
              )
            );

          if (Number(contractsCount[0]?.count || 0) === 0) {
            candidateSpaceId = spc.spaceId;
            if (targetUnitName) {
              await db
                .update(space)
                .set({
                  space_name: targetUnitName,
                  floor_name: targetFloorName || null,
                  chargeable_area_sqft: body.area_sqft ? String(body.area_sqft) : undefined,
                  space_type: targetFloorName ? "floor" : "suite",
                  occupancy_status: "occupied",
                })
                .where(eq(space.id, spc.spaceId));
            }
            break;
          }
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

    const finalSpaceId = targetSpaceId || body.space_id;
    if (!finalSpaceId) {
      return NextResponse.json(
        { error: "Validation failed: A valid space (unit) must be selected for this lease contract." },
        { status: 422 }
      );
    }

    const finalOccupantId = body.occupant_id;
    if (!finalOccupantId) {
      return NextResponse.json(
        { error: "Validation failed: A valid tenant occupant must be selected for this lease contract." },
        { status: 422 }
      );
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

    // Area Capacity Sanity Check: Leased area cannot exceed property leasable capacity
    if (finalSpaceId && body.area_sqft) {
      const [spcRow] = await db
        .select({
          spaceArea: space.chargeable_area_sqft,
          bldArea: building.total_area_sqft,
          propArea: property.total_leasable_area_sqft,
          propName: property.property_name,
        })
        .from(space)
        .leftJoin(building, eq(space.building_id, building.id))
        .leftJoin(property, eq(building.property_id, property.id))
        .where(eq(space.id, finalSpaceId))
        .limit(1);

      if (spcRow) {
        const propCap = Number(spcRow.propArea) || Number(spcRow.bldArea) || 0;
        const reqArea = Number(body.area_sqft) || 0;
        if (propCap > 0 && reqArea > propCap * 1.1) {
          return NextResponse.json(
            {
              error: `Contract area (${reqArea.toLocaleString()} Sq.Ft) cannot exceed total property capacity (${propCap.toLocaleString()} Sq.Ft).`,
            },
            { status: 422 }
          );
        }
      }
    }

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
            eq(contract.space_id, payload.space_id),
            sql`${contract.deleted_at} IS NULL`,
            ne(contract.contract_status, "terminated")
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

    // Normalize statutory TDS, fit-out, escalation anchor, and billing metadata
    const normalizedTdsPolicy = body.tds_policy
      ? normalizeTdsPolicy(body.tds_policy)
      : body.tds_applicable === false
      ? normalizeTdsPolicy({ enabled: false })
      : normalizeTdsPolicy({ enabled: true });

    const fitoutDays = Math.max(0, Math.trunc(Number(body.fitout_days) || 0));
    const camPayableDuringFitout = body.cam_payable_during_fitout === true;
    const escalationAnchor: "start" | "rcd" = body.escalation_anchor === "rcd" ? "rcd" : "start";
    const rcdDate =
      body.commencement_date ||
      (fitoutDays > 0 && parseLocalYmd(payload.start_date)
        ? addDaysYmd(payload.start_date, fitoutDays)
        : payload.start_date);

    const financialMeta = {
      tds_policy: normalizedTdsPolicy,
      fitout_days: fitoutDays,
      cam_payable_during_fitout: camPayableDuringFitout,
      rcd_date: rcdDate,
      billing_entity: body.billing_entity || null,
      payment_terms: body.payment_terms || null,
      stamp_duty_sharing: body.stamp_duty_sharing || null,
      escalation_anchor: escalationAnchor,
      lock_in_months: body.lock_in_months ?? null,
      lock_in_end_date: body.lock_in_end_date || null,
    };

    // Build statutory metadata remarks if provided
    const tdsLabel = normalizedTdsPolicy.enabled
      ? normalizedTdsPolicy.sectionNote ||
        `Applicable (Rent ${normalizedTdsPolicy.rentRatePercent}%, CAM ${normalizedTdsPolicy.camRatePercent}%)`
      : "No TDS / Exempt (0%)";
    const statutoryNotes = [
      body.registration_status ? `Registration: ${body.registration_status}` : null,
      body.stamp_duty_amount ? `Stamp Duty: ₹${body.stamp_duty_amount} (Borne by: ${body.stamp_duty_borne_by || "Shared"})` : null,
      `TDS: ${tdsLabel}`,
      fitoutDays > 0 ? `Fit-out: ${fitoutDays}d (CAM during fit-out: ${camPayableDuringFitout ? "Billed" : "Waived"})` : null,
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
        commencement_date: rcdDate || payload.commencement_date || null,
        lock_in_period_days: payload.lock_in_period_days || (payload.lock_in_months ? payload.lock_in_months * 30 : 0),
        notice_period_days: payload.notice_period_days || 0,
        is_evergreen: payload.is_evergreen,
        is_template: payload.is_template,
        deposit_amount_inr: payload.deposit_amount_inr ? String(payload.deposit_amount_inr) : null,
        deposit_status: payload.deposit_status || "pending",
        remarks: combinedRemarks || null,
        source_row_id: JSON.stringify(financialMeta),
        created_by: auth.userId,
        updated_by: auth.userId,
        version: 1,
      })
      .returning();

    // Link Space(s) in contract_space
    const allLinkedSpaceIds = new Set<string>();
    if (payload.space_id) allLinkedSpaceIds.add(payload.space_id);
    if (Array.isArray(body.space_ids)) {
      for (const spId of body.space_ids) {
        if (spId) allLinkedSpaceIds.add(spId);
      }
    }

    for (const spId of allLinkedSpaceIds) {
      try {
        await db.insert(contractSpace).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_id: insertedContract.id,
          space_id: spId,
          created_by: auth.userId,
          updated_by: auth.userId,
        });
      } catch (linkErr) {
        console.warn(`[contract_space] Could not link space ${spId}:`, linkErr);
      }

      const todayStr = new Date().toISOString().split("T")[0];
      if (payload.start_date <= todayStr) {
        await db
          .update(space)
          .set({ occupancy_status: "occupied" })
          .where(eq(space.id, spId))
          .catch(() => {});
      }
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

        let stepNo = 1;
        if (Array.isArray(ch.rent_steps) && ch.rent_steps.length > 0) {
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
              cycle_months: st.cycle_months || 12,
              status: st.status || "scheduled",
              created_by: auth.userId,
              updated_by: auth.userId,
            });
          }
        } else if (
          (ch.component === "base_rent" || ch.invoice_group === "rent") &&
          (Number(body.escalation_value || payload.escalation_value || 0) > 0 || body.has_escalation)
        ) {
          // RR-01: Auto-generate full rentStep schedule across the entire lease term
          const escPct = Number(body.escalation_value || payload.escalation_value || 5);
          const initialRate = parseFloat(ch.rate || "0");
          const cycleMonths =
            body.escalation_frequency === "Quarterly" ? 3 :
            body.escalation_frequency === "Biannual" ? 24 :
            body.escalation_frequency === "Triennial" ? 36 : 12;

          const contractStart = payload.start_date;
          const contractEnd = payload.end_date;
          const todayStr = new Date().toISOString().split("T")[0];

          // Step 1: Base initial rate at lease start
          await db.insert(rentStep).values({
            org_id: orgId,
            client_account_id: clientAccountId,
            contract_charge_id: insertedCharge.id,
            step_no: stepNo++,
            effective_date: contractStart,
            escalation_type: "percentage",
            rate: String(initialRate),
            escalation_value: "0",
            cycle_months: cycleMonths,
            status: contractStart <= todayStr ? "applied" : "scheduled",
            created_by: auth.userId,
            updated_by: auth.userId,
          });

          // Subsequent stepped escalations (local YYYY-MM-DD arithmetic, anchor-aware)
          const escAnchorBase = escalationAnchor === "rcd" ? rcdDate : contractStart;
          let nextDateStr = body.escalation_start_date
            ? String(body.escalation_start_date).slice(0, 10)
            : addMonthsYmd(escAnchorBase, cycleMonths);

          let currentRate = initialRate;

          while (nextDateStr && nextDateStr <= contractEnd && stepNo <= 20) {
            currentRate = roundInr(currentRate * (1 + escPct / 100));
            const isDueOrPast = nextDateStr <= todayStr;

            await db.insert(rentStep).values({
              org_id: orgId,
              client_account_id: clientAccountId,
              contract_charge_id: insertedCharge.id,
              step_no: stepNo++,
              effective_date: nextDateStr,
              escalation_type: "percentage",
              rate: String(currentRate),
              escalation_value: String(escPct),
              cycle_months: cycleMonths,
              status: isDueOrPast ? "due" : "scheduled",
              created_by: auth.userId,
              updated_by: auth.userId,
            });

            nextDateStr = addMonthsYmd(nextDateStr, cycleMonths);
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

      // If escalation specified, provision full rentStep schedule for Escalation Calendar & Billing engines
      const escPct = Number(body.escalation_value || payload.escalation_value || 0);
      if (escPct > 0) {
        let stepNo = 1;
        const cycleMonths =
          body.escalation_frequency === "Quarterly" ? 3 :
          body.escalation_frequency === "Biannual" ? 24 :
          body.escalation_frequency === "Triennial" ? 36 : 12;

        const contractStart = payload.start_date;
        const contractEnd = payload.end_date;
        const todayStr = new Date().toISOString().split("T")[0];

        // Step 1: Base initial rate at lease start
        await db.insert(rentStep).values({
          org_id: orgId,
          client_account_id: clientAccountId,
          contract_charge_id: insertedCharge.id,
          step_no: stepNo++,
          effective_date: contractStart,
          escalation_type: "percentage",
          rate: String(rentRate),
          escalation_value: "0",
          status: contractStart <= todayStr ? "applied" : "scheduled",
          created_by: auth.userId,
          updated_by: auth.userId,
        });

        // Subsequent stepped escalations (local YYYY-MM-DD arithmetic, anchor-aware)
        const escAnchorBase = escalationAnchor === "rcd" ? rcdDate : contractStart;
        let nextDateStr = body.escalation_start_date
          ? String(body.escalation_start_date).slice(0, 10)
          : addMonthsYmd(escAnchorBase, cycleMonths);

        let currentRate = rentRate;

        while (nextDateStr && nextDateStr <= contractEnd && stepNo <= 20) {
          currentRate = roundInr(currentRate * (1 + escPct / 100));
          const isDueOrPast = nextDateStr <= todayStr;

          await db.insert(rentStep).values({
            org_id: orgId,
            client_account_id: clientAccountId,
            contract_charge_id: insertedCharge.id,
            step_no: stepNo++,
            effective_date: nextDateStr,
            escalation_type: "percentage",
            rate: String(currentRate),
            escalation_value: String(escPct),
            status: isDueOrPast ? "due" : "scheduled",
            created_by: auth.userId,
            updated_by: auth.userId,
          });

          nextDateStr = addMonthsYmd(nextDateStr, cycleMonths);
        }
      }
    }

    // Insert Concessions (and auto-provision Rent-Free Fit-out concession when fitout_days > 0)
    if (Array.isArray(body.concessions) && body.concessions.length > 0) {
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
    } else if (fitoutDays > 0 && parseLocalYmd(payload.start_date)) {
      const fitEndRaw = addDaysYmd(payload.start_date, fitoutDays - 1);
      const fitEndClamped = fitEndRaw > payload.end_date ? payload.end_date : fitEndRaw;
      await db.insert(concession).values({
        org_id: orgId,
        client_account_id: clientAccountId,
        contract_id: insertedContract.id,
        concession_type: "rent_free",
        start_date: payload.start_date,
        end_date: fitEndClamped,
        concession_value: "100",
        description: `Rent-free Fit-out Period (${fitoutDays} days)`,
        created_by: auth.userId,
        updated_by: auth.userId,
      });
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
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Authentication required to view contracts" }, { status: 401 });
    }

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
      auth.isSuperAdmin
        ? sql`1=1`
        : eq(contract.org_id, auth.orgId),
      sql`${contract.deleted_at} IS NULL`,
    ];

    // Strict occupant/tenant role isolation (§3.3 & §7.3)
    if (auth.role === "occupant" || auth.role === "tenant") {
      const tenantMatch = await db
        .select({ id: occupant.id })
        .from(occupant)
        .where(
          and(
            eq(occupant.org_id, auth.orgId),
            or(
              eq(occupant.id, auth.userId),
              auth.userEmail ? ilike(occupant.email, auth.userEmail) : sql`FALSE`
            )!
          )
        );
      const tenantIds = tenantMatch.map((t) => t.id);
      if (tenantIds.length === 0) {
        return NextResponse.json({
          contracts: [],
          total: 0,
          page,
          limit,
        });
      }
      conditions.push(sql`${contract.occupant_id} = ANY(${tenantIds})`);
    }

    if (!auth.isPortfolioRole && auth.clientAccountId) {
      conditions.push(eq(contract.client_account_id, auth.clientAccountId));
    } else if (searchParams.get("client_account_id")) {
      conditions.push(eq(contract.client_account_id, searchParams.get("client_account_id")!));
    }

    if (status && status !== "all") {
      conditions.push(eq(contract.contract_status, status as any));
    } else {
      conditions.push(sql`${contract.contract_status} != 'terminated'`);
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
        base_rent_charge: contractCharge.rate,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .leftJoin(
        contractCharge,
        and(
          eq(contractCharge.contract_id, contract.id),
          eq(contractCharge.component, "base_rent"),
          sql`${contractCharge.deleted_at} IS NULL`
        )
      )
      .where(
        and(
          ...conditions,
          sql`(${building.id} IS NULL OR ${building.deleted_at} IS NULL)`,
          sql`(${property.id} IS NULL OR ${property.deleted_at} IS NULL)`
        )
      )
      .orderBy(desc(contract.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count with matched table joins
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(
        and(
          ...conditions,
          sql`(${building.id} IS NULL OR ${building.deleted_at} IS NULL)`,
          sql`(${property.id} IS NULL OR ${property.deleted_at} IS NULL)`
        )
      );

    const formattedContracts = contractsList.map((item: any) => {
      let resolvedRent = Number(item.base_rent_charge || (item.contract as any)?.base_rent_rate || 0);
      if (resolvedRent === 0 && item.contract?.remarks) {
        const m = item.contract.remarks.match(/Base Rent:\s*₹?([0-9,]+)/i) || item.contract.remarks.match(/Rent:\s*₹?([0-9,]+)/i);
        if (m && m[1]) {
          resolvedRent = Number(m[1].replace(/,/g, "")) || 0;
        }
      }
      return {
        ...item.contract,
        ...item,
        contract: item.contract,
        base_rent_rate: resolvedRent,
        monthly_rent: resolvedRent,
      };
    });

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
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
