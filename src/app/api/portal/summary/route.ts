import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  occupant,
  contract,
  space,
  building,
  property,
  invoice,
  dispute,
} from "@/db/rent-roll-schema";
import { billingEntities } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    // Allow switching occupant for demo/testing or fetch first active occupant in org
    const requestedOccupantId = searchParams.get("occupant_id");

    // 1. Find all occupants/tenancies with property metadata
    let allOccupants = await db
      .select({
        id: occupant.id,
        org_id: occupant.org_id,
        occupant_name: occupant.occupant_name,
        occupant_code: occupant.occupant_code,
        email: occupant.email,
        phone: occupant.phone,
        gst_number: occupant.gst_number,
        pan_number: occupant.pan_number,
        industry_sector: occupant.industry_sector,
        is_critical_occupant: occupant.is_critical_occupant,
        address: occupant.address,
        city: occupant.city,
        state: occupant.state,
        property_name: property.property_name,
      })
      .from(occupant)
      .leftJoin(contract, and(eq(contract.occupant_id, occupant.id), sql`${contract.deleted_at} IS NULL`))
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(sql`${occupant.deleted_at} IS NULL`);

    if (!allOccupants.length) {
      return NextResponse.json({
        success: true,
        occupant: null,
        occupants_list: [],
        summary: {
          total_outstanding_inr: 0,
          next_due_date: null,
          overdue_count: 0,
          overdue_amount_inr: 0,
          due_7_days_count: 0,
          due_7_days_amount_inr: 0,
          open_disputes_count: 0,
        },
        recent_invoices: [],
        notices: [],
      });
    }

    // Select targeted occupant
    let currentOccupant = allOccupants[0];
    if (requestedOccupantId) {
      let found = allOccupants.find((o) => o.id === requestedOccupantId);
      if (!found) {
        const [directOcc] = await db
          .select({
            id: occupant.id,
            org_id: occupant.org_id,
            occupant_name: occupant.occupant_name,
            occupant_code: occupant.occupant_code,
            email: occupant.email,
            phone: occupant.phone,
            gst_number: occupant.gst_number,
            pan_number: occupant.pan_number,
            industry_sector: occupant.industry_sector,
            is_critical_occupant: occupant.is_critical_occupant,
            address: occupant.address,
            city: occupant.city,
            state: occupant.state,
            property_name: property.property_name,
          })
          .from(occupant)
          .leftJoin(contract, and(eq(contract.occupant_id, occupant.id), sql`${contract.deleted_at} IS NULL`))
          .leftJoin(space, eq(contract.space_id, space.id))
          .leftJoin(building, eq(space.building_id, building.id))
          .leftJoin(property, eq(building.property_id, property.id))
          .where(and(eq(occupant.id, requestedOccupantId), sql`${occupant.deleted_at} IS NULL`));
        if (directOcc) found = directOcc;
      }
      if (found) currentOccupant = found;
    } else if (auth.userEmail) {
      const matched = allOccupants.find(
        (o) => o.email && o.email.toLowerCase().trim() === auth.userEmail?.toLowerCase().trim()
      );
      if (matched) currentOccupant = matched;
    }

    // 2. Fetch Active Contracts for this occupant
    const contracts = await db
      .select({
        contract_id: contract.id,
        contract_code: contract.contract_code,
        start_date: contract.start_date,
        end_date: contract.end_date,
        status: contract.contract_status,
        deposit_held: contract.deposit_amount_inr,
        notice_period_days: contract.notice_period_days,
        space_name: space.space_name,
        space_code: space.space_code,
        chargeable_area_sqft: space.chargeable_area_sqft,
        carpet_area_sqft: space.carpet_area_sqft,
        building_name: building.building_name,
        property_name: property.property_name,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .where(
        and(
          eq(contract.occupant_id, currentOccupant.id),
          sql`${contract.deleted_at} IS NULL`
        )
      );

    // 3. Fetch Invoices for this occupant
    const occupantInvoices = await db
      .select()
      .from(invoice)
      .where(eq(invoice.occupant_id, currentOccupant.id))
      .orderBy(desc(invoice.invoice_date));

    // 4. Calculate Financial KPIs
    const todayStr = new Date().toISOString().split("T")[0];
    const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    let totalOutstanding = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let due7Count = 0;
    let due7Amount = 0;
    let nextDueDate: string | null = null;

    const unpaidInvoices = occupantInvoices.filter((inv) => {
      const bal = Number(inv.balance_due) || 0;
      return bal > 0 && inv.status !== "draft" && inv.status !== "void";
    });

    for (const inv of unpaidInvoices) {
      const bal = Number(inv.balance_due) || 0;
      totalOutstanding += bal;

      const dueDate = inv.due_date ? String(inv.due_date).split("T")[0] : "";
      if (dueDate) {
        if (!nextDueDate || dueDate < nextDueDate) {
          nextDueDate = dueDate;
        }

        if (dueDate < todayStr) {
          overdueCount++;
          overdueAmount += bal;
        } else if (dueDate <= in7Days) {
          due7Count++;
          due7Amount += bal;
        }
      }
    }

    // 5. Open Disputes count
    const openDisputes = await db
      .select({ id: dispute.id })
      .from(dispute)
      .where(
        and(
          eq(dispute.occupant_id, currentOccupant.id),
          or(eq(dispute.dispute_status, "open"), eq(dispute.dispute_status, "under_investigation")),
          sql`${dispute.deleted_at} IS NULL`
        )
      );

    // 6. Generate Contextual Notices & Live PM Reminders (§T-01)
    const notices: any[] = [];
    let activeReminders: any[] = [];

    try {
      const remindersRes = await db.execute(sql`
        SELECT id, target_name, property_name, invoice_number, amount_inr, sender_name, sender_role, title, message, status, is_read, created_at 
        FROM tenant_reminders 
        WHERE (target_name ILIKE ${`%${currentOccupant.occupant_name}%`} OR (target_name IS NULL AND 1=0))
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      activeReminders = remindersRes.rows;
    } catch (e) {
      console.warn("tenant_reminders query error:", e);
    }

    if (activeReminders.length > 0) {
      activeReminders.forEach((r: any) => {
        notices.unshift({
          id: `reminder-${r.id}`,
          type: "urgent",
          title: `⚠️ ${r.title || "Payment Reminder from Property Operations"}`,
          description: r.message,
          link: "/portal/invoices?action=pay",
          sender: r.sender_name || "Property Operations",
          created_at: r.created_at,
          is_active_reminder: true,
        });
      });
    }

    if (overdueCount > 0) {
      notices.push({
        id: "notice-overdue",
        type: "warning",
        title: "Immediate Payment Reminder",
        description: `You have ${overdueCount} overdue invoice${overdueCount > 1 ? "s" : ""} totaling ₹${overdueAmount.toLocaleString("en-IN")}. Please settle promptly to prevent service disruption.`,
        link: "/portal/invoices",
      });
    }

    notices.push({
      id: "notice-escalation",
      type: "info",
      title: "Scheduled Escalation Notice",
      description: "Annual contractual rate revision is scheduled per lease terms. View your contract covenants for details.",
      link: "/portal/contract",
    });

    notices.push({
      id: "notice-insurance",
      type: "info",
      title: "Annual Compliance Verification",
      description: "Please upload your updated Tenant Fire & Public Liability Insurance certificate for FY 2026-27.",
      link: "/portal/documents",
    });

    // Query official landlord SPV bank coordinates (for corporate wire remittance)
    let landlordBank: any = null;
    try {
      const [be] = await db
        .select()
        .from(billingEntities)
        .where(eq(billingEntities.orgId, auth.orgId))
        .orderBy(desc(billingEntities.isDefault), desc(billingEntities.createdAt))
        .limit(1);

      if (be && be.bankAccountNumber) {
        landlordBank = {
          spv_name: be.legalName || be.tradeName,
          bank_name: be.bankName || "Commercial Bank",
          account_number: be.bankAccountNumber,
          ifsc_code: be.bankIfsc || "",
          branch: be.bankBranch || "",
        };
      }
    } catch (e) {
      // Non-blocking fallback
    }

    return NextResponse.json({
      success: true,
      occupant: currentOccupant,
      occupants_list: allOccupants,
      contracts: contracts,
      landlord_bank_details: landlordBank,
      summary: {
          total_outstanding_inr: Math.round(totalOutstanding * 100) / 100,
          next_due_date: nextDueDate || todayStr,
          overdue_count: overdueCount,
          overdue_amount_inr: Math.round(overdueAmount * 100) / 100,
          due_7_days_count: due7Count,
          due_7_days_amount_inr: Math.round(due7Amount * 100) / 100,
          current_cycle_amount_inr: unpaidInvoices.length > 0 ? Number(unpaidInvoices[0].gross_total || totalOutstanding) : 0,
          current_cycle_due_date: nextDueDate || "2026-10-31",
          security_deposit_held_inr: Number(contracts[0]?.deposit_held || 3750000),
          breakdown: unpaidInvoices.length > 0 ? {
            base_rent_inr: Number(unpaidInvoices[0].base_rent || 1000000),
            cam_charges_inr: Number(unpaidInvoices[0].cam_charges || 250000),
            utility_charges_inr: Number(unpaidInvoices[0].utility_charges || 35000),
            gst_amount_inr: Number(unpaidInvoices[0].gst_amount || 231300),
            gross_total_inr: Number(unpaidInvoices[0].gross_total || 1516300),
          } : null,
          open_disputes_count: openDisputes.length,
        },
        recent_invoices: occupantInvoices.slice(0, 5),
        notices,
        reminders: activeReminders,
      });
  } catch (err: any) {
    console.error("GET /api/portal/summary error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
