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
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    // Allow switching occupant for demo/testing or fetch first active occupant in org
    const requestedOccupantId = searchParams.get("occupant_id");

    // 1. Find all occupants in this organization
    const allOccupants = await db
      .select({
        id: occupant.id,
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
      })
      .from(occupant)
      .where(and(eq(occupant.org_id, auth.orgId), sql`${occupant.deleted_at} IS NULL`));

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
      const found = allOccupants.find((o) => o.id === requestedOccupantId);
      if (found) currentOccupant = found;
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

    // 6. Generate Contextual Notices (§T-01)
    const notices: any[] = [];

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

    return NextResponse.json({
      success: true,
      occupant: currentOccupant,
      occupants_list: allOccupants,
      contracts: contracts,
      summary: {
        total_outstanding_inr: Math.round(totalOutstanding * 100) / 100,
        next_due_date: nextDueDate || todayStr,
        overdue_count: overdueCount,
        overdue_amount_inr: Math.round(overdueAmount * 100) / 100,
        due_7_days_count: due7Count,
        due_7_days_amount_inr: Math.round(due7Amount * 100) / 100,
        open_disputes_count: openDisputes.length,
      },
      recent_invoices: occupantInvoices.slice(0, 5),
      notices,
    });
  } catch (err: any) {
    console.error("GET /api/portal/summary error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
