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
import { supabase } from "@/lib/supabase";
import { eq, and, sql, desc, or, inArray, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);

    // Allow switching occupant for demo/testing or fetch first active occupant in org
    const requestedOccupantId = searchParams.get("occupant_id");
    const requestedEmail = searchParams.get("email");
    const requestedProp = searchParams.get("prop") || searchParams.get("property_name");
    const isTenant = auth.role === "occupant" || auth.role === "tenant";

    // 1. Find active occupants/tenancies with property metadata across the commercial portfolio
    const occConditions = [sql`${occupant.deleted_at} IS NULL`];
    if (auth.orgId) {
      occConditions.push(eq(occupant.org_id, auth.orgId));
    }
    if (isTenant && auth.userEmail) {
      occConditions.push(
        or(
          ilike(occupant.email, auth.userEmail),
          eq(occupant.id, auth.userId)
        )!
      );
    }

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
      .leftJoin(contract, and(eq(contract.occupant_id, occupant.id), sql`${contract.deleted_at} IS NULL`, sql`${contract.contract_status} != 'terminated'`))
      .leftJoin(space, and(eq(contract.space_id, space.id), sql`${space.deleted_at} IS NULL`))
      .leftJoin(building, and(eq(space.building_id, building.id), sql`${building.deleted_at} IS NULL`))
      .leftJoin(property, and(eq(building.property_id, property.id), sql`${property.deleted_at} IS NULL`))
      .where(and(...occConditions));

    // Prioritize occupants with issued invoices, then those with active contracts
    let occIdsWithInvoices = new Set<string>();
    try {
      const issuedInvoices = await db
        .select({ occupant_id: invoice.occupant_id })
        .from(invoice)
        .where(sql`${invoice.status}::text NOT IN ('draft', 'cancelled')`);
      occIdsWithInvoices = new Set(issuedInvoices.map((i) => i.occupant_id).filter(Boolean) as string[]);
    } catch (e) {}

    // Sort occupants so those with invoices and active contracts come first
    allOccupants.sort((a, b) => {
      const aWeight = occIdsWithInvoices.has(a.id) ? 2 : (a.property_name ? 1 : 0);
      const bWeight = occIdsWithInvoices.has(b.id) ? 2 : (b.property_name ? 1 : 0);
      return bWeight - aWeight;
    });

    // 0. Explicit check if requested occupant was deactivated or their property deleted
    if (requestedOccupantId) {
      const [specOcc] = await db
        .select({
          id: occupant.id,
          name: occupant.occupant_name,
          deleted_at: occupant.deleted_at,
          status: occupant.occupant_status,
        })
        .from(occupant)
        .where(eq(occupant.id, requestedOccupantId))
        .limit(1);

      if (specOcc) {
        if (specOcc.deleted_at || specOcc.status === "inactive") {
          return NextResponse.json(
            {
              success: false,
              property_deleted: true,
              account_deactivated: true,
              property_name: "Commercial Asset",
              message: "The property owner has deleted or decommissioned this commercial property. Associated leases and your tenant portal session have been deactivated.",
            },
            { status: 410 }
          );
        }

        // Check if all contracts for this occupant belong to deleted properties
        const allOccupantContracts = await db
          .select({
            propName: property.property_name,
            propDeleted: property.deleted_at,
            contractDeleted: contract.deleted_at,
            contractStatus: contract.contract_status,
          })
          .from(contract)
          .leftJoin(space, eq(contract.space_id, space.id))
          .leftJoin(building, eq(space.building_id, building.id))
          .leftJoin(property, eq(building.property_id, property.id))
          .where(eq(contract.occupant_id, requestedOccupantId));

        if (allOccupantContracts.length > 0) {
          const activeContracts = allOccupantContracts.filter(
            (c) => !c.propDeleted && !c.contractDeleted && c.contractStatus !== "terminated"
          );
          if (activeContracts.length === 0) {
            const propName = allOccupantContracts[0]?.propName || "Commercial Asset";
            return NextResponse.json(
              {
                success: false,
                property_deleted: true,
                account_deactivated: true,
                property_name: propName,
                message: `The property owner has deleted or decommissioned this commercial property (${propName}). Associated leases and your tenant portal session have been deactivated.`,
              },
              { status: 410 }
            );
          }
        }
      }
    }

    // Select targeted occupant strictly based on parameters or credentials
    let currentOccupant: any = null;
    if (isTenant) {
      if (requestedOccupantId) {
        currentOccupant = allOccupants.find((o) => o.id === requestedOccupantId);
        if (!currentOccupant) {
          return NextResponse.json({ error: "Access denied to requested occupant record" }, { status: 403 });
        }
      } else {
        currentOccupant =
          (auth.userEmail ? allOccupants.find((o) => o.email?.toLowerCase().trim() === auth.userEmail!.toLowerCase().trim()) : null) ||
          allOccupants[0] ||
          null;
      }
    } else {
      if (requestedOccupantId) {
        currentOccupant = allOccupants.find((o) => o.id === requestedOccupantId);
        if (!currentOccupant) {
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
          if (directOcc) currentOccupant = directOcc;
        }

        // If requested occupant record has no property/contracts, but a duplicate/sibling record with the same name does, prefer the active one!
        if (currentOccupant && !currentOccupant.property_name) {
          const activeSibling = allOccupants.find(
            (o) => o.occupant_name?.toLowerCase().trim() === currentOccupant.occupant_name?.toLowerCase().trim() && o.property_name
          );
          if (activeSibling) currentOccupant = activeSibling;
        }
      } else if (requestedProp) {
        currentOccupant = allOccupants.find(
          (o) => o.property_name && o.property_name.toLowerCase().includes(requestedProp.toLowerCase().trim())
        );
      } else if (requestedEmail) {
        currentOccupant = allOccupants.find(
          (o) => o.email && o.email.toLowerCase().trim() === requestedEmail.toLowerCase().trim()
        );
      }

      // Default for landlord/admin: pick first occupant (already sorted by invoice and lease priority)
      if (!currentOccupant && allOccupants.length > 0) {
        currentOccupant = allOccupants[0];
      }
    }

    if (!currentOccupant) {
      // Find if any properties were deleted recently
      const [lastDeleted] = await db
        .select({ name: property.property_name })
        .from(property)
        .where(sql`${property.deleted_at} IS NOT NULL`)
        .orderBy(desc(property.deleted_at))
        .limit(1);

      return NextResponse.json(
        {
          success: false,
          property_deleted: true,
          account_deactivated: true,
          property_name: lastDeleted?.name || "Commercial Property",
          message: `The property owner has deleted or decommissioned this commercial property. Associated leases and your tenant portal session have been deactivated.`,
        },
        { status: 410 }
      );
    }

    // Deduplicate occupants list by name so each tenant appears once in the dropdown switcher
    const seenNames = new Set<string>();
    const filteredOccupantsList: any[] = [];
    for (const o of allOccupants) {
      const nameKey = (o.occupant_name || "").toLowerCase().trim();
      if (nameKey && !seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        filteredOccupantsList.push(o);
      }
    }

    // Mark tenant as active on OfficeX once they access their portal
    if (currentOccupant?.id) {
      try {
        await db
          .update(occupant)
          .set({ occupant_status: "active" as any, updated_at: new Date() })
          .where(eq(occupant.id, currentOccupant.id));
      } catch (e) {}
    }

    // Find all matching occupant IDs for currentOccupant (e.g. duplicate rows with same company name)
    const matchingOccRows = await db
      .select({ id: occupant.id })
      .from(occupant)
      .where(
        and(
          or(
            eq(occupant.id, currentOccupant.id),
            ilike(occupant.occupant_name, currentOccupant.occupant_name.trim())
          ),
          sql`${occupant.deleted_at} IS NULL`
        )
      );
    const matchingOccupantIds = Array.from(new Set([currentOccupant.id, ...matchingOccRows.map((r) => r.id)]));

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
      .leftJoin(space, and(eq(contract.space_id, space.id), sql`${space.deleted_at} IS NULL`))
      .leftJoin(building, and(eq(space.building_id, building.id), sql`${building.deleted_at} IS NULL`))
      .leftJoin(property, and(eq(building.property_id, property.id), sql`${property.deleted_at} IS NULL`))
      .where(
        and(
          inArray(contract.occupant_id, matchingOccupantIds),
          sql`${contract.deleted_at} IS NULL`,
          sql`${contract.contract_status} != 'terminated'`
        )
      );

    // If no active contracts exist, check if the tenant's property was decommissioned
    if (contracts.length === 0) {
      const [deletedLease] = await db
        .select({ propName: property.property_name })
        .from(contract)
        .leftJoin(space, eq(contract.space_id, space.id))
        .leftJoin(building, eq(space.building_id, building.id))
        .leftJoin(property, eq(building.property_id, property.id))
        .where(
          and(
            inArray(contract.occupant_id, matchingOccupantIds),
            or(
              sql`${property.deleted_at} IS NOT NULL`,
              sql`${contract.deleted_at} IS NOT NULL`,
              eq(contract.contract_status, "terminated")
            )
          )
        )
        .limit(1);

      if (deletedLease) {
        const pName = deletedLease.propName || currentOccupant.property_name || "Commercial Property";
        return NextResponse.json(
          {
            success: false,
            property_deleted: true,
            account_deactivated: true,
            property_name: pName,
            message: `The property owner has deleted or decommissioned this commercial property (${pName}). Associated leases and your tenant portal session have been deactivated.`,
          },
          { status: 410 }
        );
      }
    }

    // 3. Fetch Invoices for this occupant (by occupant ID or contract ID)
    const contractIds = contracts.map((c) => c.contract_id);
    const invoiceConditions = [
      or(
        inArray(invoice.occupant_id, matchingOccupantIds),
        contractIds.length > 0 ? inArray(invoice.contract_id, contractIds) : sql`FALSE`
      )!,
    ];

    const occupantInvoices = await db
      .select()
      .from(invoice)
      .where(
        and(
          ...invoiceConditions,
          sql`${invoice.status}::text NOT IN ('draft', 'cancelled')`
        )
      )
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
      return bal > 0 && inv.status !== "draft" && inv.status !== "cancelled";
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

    // If no active contracts exist, check if the tenant's property was decommissioned
    if (contracts.length === 0) {
      const [deletedLease] = await db
        .select({ propName: property.property_name })
        .from(contract)
        .leftJoin(space, eq(contract.space_id, space.id))
        .leftJoin(building, eq(space.building_id, building.id))
        .leftJoin(property, eq(building.property_id, property.id))
        .where(
          and(
            inArray(contract.occupant_id, matchingOccupantIds),
            or(
              sql`${property.deleted_at} IS NOT NULL`,
              sql`${contract.deleted_at} IS NOT NULL`,
              eq(contract.contract_status, "terminated")
            )
          )
        )
        .limit(1);

      if (deletedLease) {
        const pName = deletedLease.propName || currentOccupant.property_name || "Commercial Property";
        return NextResponse.json(
          {
            success: false,
            property_deleted: true,
            account_deactivated: true,
            property_name: pName,
            message: `The property owner has deleted or decommissioned this commercial property (${pName}). Associated leases and your tenant portal session have been deactivated.`,
          },
          { status: 410 }
        );
      }
    }

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
      // 1. Check if landlord bank coordinates are in system_kv_store
      const { data: kv } = await supabase
        .from("system_kv_store")
        .select("data")
        .eq("key", "officex_landlord_bank_details")
        .maybeSingle();

      if (kv?.data && (kv.data as any).bankAccount) {
        const d = kv.data as any;
        landlordBank = {
          spv_name: d.spvName || "Panchshil Realty Infrastructure Ltd",
          beneficiary_name: d.spvName || "Panchshil Realty Infrastructure Ltd",
          name: d.spvName || "Panchshil Realty Infrastructure Ltd",
          bank_name: d.bankName || "HDFC Bank Limited",
          bankName: d.bankName || "HDFC Bank Limited",
          account_number: d.bankAccount,
          bank_account_number: d.bankAccount,
          bankAccountNumber: d.bankAccount,
          ifsc_code: d.bankIfsc || "HDFC0000060",
          bank_ifsc: d.bankIfsc || "HDFC0000060",
          bankIfscCode: d.bankIfsc || "HDFC0000060",
          branch: d.bankBranch || "Knowledge Park Commercial Branch, Pune",
          bankBranch: d.bankBranch || "Knowledge Park Commercial Branch, Pune",
          upi_id: d.upiId || `oxpay.${String(d.bankAccount).slice(-4)}@hdfcbank`,
        };
      } else {
        // 2. Query billingEntities (first check tenant's org, or any org)
        const beList = await db
          .select()
          .from(billingEntities)
          .where(sql`${billingEntities.bankAccountNumber} IS NOT NULL AND ${billingEntities.bankAccountNumber} != ''`)
          .orderBy(desc(billingEntities.isDefault), desc(billingEntities.createdAt))
          .limit(1);

        if (beList.length > 0 && beList[0].bankAccountNumber) {
          const be = beList[0];
          landlordBank = {
            spv_name: be.legalName || be.tradeName || "Commercial Landlord SPV",
            beneficiary_name: be.legalName || be.tradeName || "Commercial Landlord SPV",
            name: be.legalName || be.tradeName || "Commercial Landlord SPV",
            bank_name: be.bankName || "HDFC Bank Limited",
            bankName: be.bankName || "HDFC Bank Limited",
            account_number: be.bankAccountNumber,
            bank_account_number: be.bankAccountNumber,
            bankAccountNumber: be.bankAccountNumber,
            ifsc_code: be.bankIfsc || "HDFC0000060",
            bank_ifsc: be.bankIfsc || "HDFC0000060",
            bankIfscCode: be.bankIfsc || "HDFC0000060",
            branch: be.bankBranch || "Commercial Branch",
            bankBranch: be.bankBranch || "Commercial Branch",
            upi_id: `oxpay.${String(be.bankAccountNumber).slice(-4)}@hdfcbank`,
          };
        }
      }

      if (!landlordBank) {
        landlordBank = {
          spv_name: "Panchshil Realty Infrastructure Ltd",
          beneficiary_name: "Panchshil Realty Infrastructure Ltd",
          name: "Panchshil Realty Infrastructure Ltd",
          bank_name: "HDFC Bank Limited",
          bankName: "HDFC Bank Limited",
          account_number: "50200084920193",
          bank_account_number: "50200084920193",
          bankAccountNumber: "50200084920193",
          ifsc_code: "HDFC0000060",
          bank_ifsc: "HDFC0000060",
          bankIfscCode: "HDFC0000060",
          branch: "Knowledge Park Commercial Branch, Pune",
          bankBranch: "Knowledge Park Commercial Branch, Pune",
          upi_id: "panchshil.escrow@hdfcbank",
        };
      }
    } catch (e) {
      // Non-blocking fallback
      landlordBank = {
        spv_name: "Panchshil Realty Infrastructure Ltd",
        beneficiary_name: "Panchshil Realty Infrastructure Ltd",
        name: "Panchshil Realty Infrastructure Ltd",
        bank_name: "HDFC Bank Limited",
        bankName: "HDFC Bank Limited",
        account_number: "50200084920193",
        bank_account_number: "50200084920193",
        bankAccountNumber: "50200084920193",
        ifsc_code: "HDFC0000060",
        bank_ifsc: "HDFC0000060",
        bankIfscCode: "HDFC0000060",
        branch: "Knowledge Park Commercial Branch, Pune",
        bankBranch: "Knowledge Park Commercial Branch, Pune",
        upi_id: "panchshil.escrow@hdfcbank",
      };
    }

    let isOwnerSubscribed = false;
    try {
      const nowIso = new Date().toISOString();
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select("id, status, ends_at")
        .eq("status", "active")
        .gt("ends_at", nowIso)
        .limit(1);

      if (subData && subData.length > 0) {
        isOwnerSubscribed = true;
      } else {
        const { data: kvData } = await supabase
          .from("system_kv_store")
          .select("data")
          .eq("key", "officex_user_subscriptions")
          .maybeSingle();

        const subsMap = (kvData?.data as Record<string, any>) || {};
        const hasActive = Object.values(subsMap).some((s: any) => s.status === "active");
        if (hasActive) {
          isOwnerSubscribed = true;
        }
      }
    } catch (e) {
      console.warn("Portal summary subscription check error:", e);
    }

    return NextResponse.json({
      success: true,
      owner_subscribed: isOwnerSubscribed,
      owner_subscription_message: isOwnerSubscribed
        ? ""
        : "Rent roll is not yet subscribed by the property owner",
      occupant: currentOccupant,
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
          security_deposit_held_inr: Number(contracts[0]?.deposit_held || 0),
          breakdown: unpaidInvoices.length > 0 ? {
            base_rent_inr: Number(unpaidInvoices[0].base_rent || 0),
            cam_charges_inr: Number(unpaidInvoices[0].cam_charges || 0),
            utility_charges_inr: Number(unpaidInvoices[0].utility_charges || 0),
            gst_amount_inr: Number(unpaidInvoices[0].gst_amount || 0),
            gross_total_inr: Number(unpaidInvoices[0].gross_total || 0),
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
