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
import { eq, and, sql, desc, or, ilike } from "drizzle-orm";

/**
 * RR-CONT-01: Create Contract (Wizard Steps 1–7)
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const orgId = body.org_id || auth.orgId;
    const clientAccountId = body.client_account_id || auth.clientAccountId;

    if (!clientAccountId) {
      return NextResponse.json(
        { error: "client_account_id is required for multi-client isolation" },
        { status: 400 }
      );
    }

    const payload = {
      ...body,
      org_id: orgId,
      client_account_id: clientAccountId,
      contract_status: body.contract_status || "draft",
      approval_status: "draft",
      is_evergreen: body.is_evergreen ?? false,
      is_template: body.is_template ?? false,
      version: 1,
      created_by: auth.userId,
      updated_by: auth.userId,
    };

    // 1. Validate required fields
    const reqValidation = validateRequiredFields("contract", payload);
    if (!reqValidation.isValid) {
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
        remarks: payload.remarks || payload.notes || null,
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
    }

    // Insert Charges & Rent Steps
    if (Array.isArray(body.charges)) {
      for (const ch of body.charges) {
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

    return NextResponse.json({
      success: true,
      data: contractsList,
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
