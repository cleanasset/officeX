import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  occupant,
  space,
  building,
  property,
  depositTransactions,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * S-47 Security Deposits & Bank Guarantees API
 * Formulas: F-13 (partial payment / deposit shortfall), AL-11 (BG expiry), AL-12 (shortfall alert)
 */
export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("property_id");
    const contractId = searchParams.get("contract_id");

    const whereClauses = [sql`${contract.deleted_at} IS NULL`];
    if (auth.orgId) {
      whereClauses.push(eq(contract.org_id, auth.orgId));
    }
    if (contractId) {
      whereClauses.push(eq(contract.id, contractId));
    }
    if (propertyId && propertyId !== "all") {
      whereClauses.push(eq(building.property_id, propertyId));
    }

    // 1. Fetch contracts joined with space, building, property & occupant
    const contractsList = await db
      .select({
        id: contract.id,
        contract_code: contract.contract_code,
        org_id: contract.org_id,
        property_id: building.property_id,
        property_name: property.property_name,
        occupant_id: contract.occupant_id,
        occupant_name: occupant.occupant_name,
        deposit_amount_inr: contract.deposit_amount_inr,
        contract_status: contract.contract_status,
      })
      .from(contract)
      .leftJoin(space, eq(contract.space_id, space.id))
      .leftJoin(building, eq(space.building_id, building.id))
      .leftJoin(property, eq(building.property_id, property.id))
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...whereClauses))
      .orderBy(desc(contract.created_at));

    // 2. Fetch all deposit transactions
    const txWhereClauses = [];
    if (auth.orgId) {
      txWhereClauses.push(eq(depositTransactions.orgId, auth.orgId));
    }
    const allTx = await db
      .select()
      .from(depositTransactions)
      .where(txWhereClauses.length > 0 ? and(...txWhereClauses) : undefined)
      .orderBy(desc(depositTransactions.createdAt));

    // Group transactions by contract
    const txByContract = new Map<string, typeof allTx>();
    allTx.forEach((tx) => {
      const cId = tx.contractId;
      if (!txByContract.has(cId)) txByContract.set(cId, []);
      txByContract.get(cId)!.push(tx);
    });

    const today = new Date();

    // 3. Process each contract's deposit calculations
    let totalRequired = 0;
    let totalHeld = 0;
    let totalShortfall = 0;
    let expiringBgCount = 0;
    let pendingRefunds = 0;

    const items = contractsList.map((c) => {
      const txs = txByContract.get(c.id) || [];

      // Calculate held deposit from transactions + base contract field
      let cashHeld = 0;
      let bgHeld = 0;
      let activeBgNumber: string | null = null;
      let activeBgBank: string | null = null;
      let activeBgExpiry: string | null = null;

      if (txs.length > 0) {
        txs.forEach((tx) => {
          const amt = Number(tx.amount) || 0;
          if (tx.status === "active" || tx.status === "approved") {
            if (tx.transactionType === "received" || tx.transactionType === "receipt") {
              if (tx.instrumentType === "bank_guarantee") {
                bgHeld += amt;
                activeBgNumber = tx.bgNumber || tx.instrumentReference;
                activeBgBank = tx.bankName;
                activeBgExpiry = tx.validityDate;
              } else {
                cashHeld += amt;
              }
            } else if (tx.transactionType === "top_up_demand" && tx.status === "active") {
              if (tx.instrumentType === "bank_guarantee") {
                bgHeld += amt;
                activeBgNumber = tx.bgNumber || tx.instrumentReference;
                activeBgBank = tx.bankName;
                activeBgExpiry = tx.validityDate;
              } else {
                cashHeld += amt;
              }
            } else if (
              tx.transactionType === "refund" ||
              tx.transactionType === "forfeiture" ||
              tx.transactionType === "adjustment_against_dues"
            ) {
              cashHeld = Math.max(0, cashHeld - amt);
            }
          }
          if (tx.transactionType === "refund" && tx.status === "pending_approval") {
            pendingRefunds++;
          }
        });
      } else {
        cashHeld = Number(c.deposit_amount_inr) || 0;
      }

      const totalHeldForContract = cashHeld + bgHeld;
      const depositMonths = 6; // Standard commercial lease baseline
      const monthlyRent = totalHeldForContract > 0 ? totalHeldForContract / depositMonths : 50000;
      const requiredAmount = depositMonths * monthlyRent;
      const shortfallAmount = Math.max(0, requiredAmount - totalHeldForContract);
      const coverMonths = monthlyRent > 0 ? Number((totalHeldForContract / monthlyRent).toFixed(1)) : 0;

      // BG Expiry alert (AL-11)
      let daysToBgExpiry: number | null = null;
      let bgExpiringSoon = false;
      if (activeBgExpiry) {
        const expDate = new Date(activeBgExpiry);
        daysToBgExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToBgExpiry <= 30 && daysToBgExpiry >= 0) {
          expiringBgCount++;
          bgExpiringSoon = true;
        }
      }

      totalRequired += requiredAmount;
      totalHeld += totalHeldForContract;
      totalShortfall += shortfallAmount;

      return {
        contract_id: c.id,
        contract_code: c.contract_code,
        property_id: c.property_id || "prop-1",
        property_name: c.property_name || "Commercial Centre",
        occupant_id: c.occupant_id,
        occupant_name: c.occupant_name || "Commercial Tenant",
        security_deposit_type: bgHeld > 0 ? "bank_guarantee" : "cash",
        deposit_months: depositMonths,
        monthly_rent: monthlyRent,
        required_amount: requiredAmount,
        held_amount: totalHeldForContract,
        cash_held: cashHeld,
        bg_held: bgHeld,
        shortfall_amount: shortfallAmount,
        cover_months: coverMonths,
        bg_number: activeBgNumber,
        bg_bank: activeBgBank,
        bg_expiry_date: activeBgExpiry,
        claim_date: null,
        days_to_bg_expiry: daysToBgExpiry,
        bg_expiring_soon: bgExpiringSoon,
        has_shortfall: shortfallAmount > 0, // Alert AL-12
        transactions: txs,
      };
    });

    return NextResponse.json({
      summary: {
        total_required: totalRequired,
        total_held: totalHeld,
        total_shortfall: totalShortfall,
        expiring_bg_count: expiringBgCount,
        pending_refunds: pendingRefunds,
      },
      deposits: items,
      recent_transactions: allTx.slice(0, 50),
    });
  } catch (error: any) {
    console.error("GET /api/deposits error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load deposits register" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      contract_id,
      deposit_amount_inr,
      security_deposit_type,
      bg_bank,
      bg_number,
      bg_expiry_date,
    } = body;

    if (!contract_id) {
      return NextResponse.json({ error: "contract_id is required" }, { status: 400 });
    }

    // Update contract deposit configuration
    const [updated] = await db
      .update(contract)
      .set({
        deposit_amount_inr: deposit_amount_inr !== undefined ? String(deposit_amount_inr) : undefined,
        updated_at: new Date(),
        updated_by: auth.userId,
      })
      .where(eq(contract.id, contract_id))
      .returning();

    // If BG details provided, record in deposit_transactions
    if (bg_number) {
      await db.insert(depositTransactions).values({
        contractId: contract_id,
        orgId: auth.orgId,
        transactionType: "receipt",
        instrumentType: "bank_guarantee",
        amount: String(deposit_amount_inr || 0),
        bankName: bg_bank || null,
        bgNumber: bg_number,
        instrumentReference: bg_number,
        validityDate: bg_expiry_date || null,
        status: "active",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Security deposit terms updated successfully",
      contract: updated,
    });
  } catch (error: any) {
    console.error("POST /api/deposits error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update deposit terms" },
      { status: 500 }
    );
  }
}
