import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  depositTransactions,
  invoice,
} from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq } from "drizzle-orm";

/**
 * S-47 Deposit Transactions API
 * Handles: receipt, top_up_demand, adjustment_against_dues, refund, forfeiture
 */
export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      contract_id,
      transaction_type, // receipt | top_up_demand | adjustment_against_dues | refund | forfeiture
      instrument_type = "bank_transfer", // bank_guarantee | bank_transfer | cheque | demand_draft
      amount,
      date: txDate = new Date().toISOString().split("T")[0],
      reference,
      bank_name,
      validity_date,
      invoice_ids = [],
      notes,
    } = body;

    if (!contract_id || !transaction_type || !amount) {
      return NextResponse.json(
        { error: "contract_id, transaction_type, and amount are mandatory" },
        { status: 400 }
      );
    }

    const txAmount = Number(amount);
    if (isNaN(txAmount) || txAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a valid positive number" },
        { status: 400 }
      );
    }

    // 1. Fetch current contract details
    const [c] = await db
      .select()
      .from(contract)
      .where(eq(contract.id, contract_id))
      .limit(1);

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const currentHeld = Number(c.deposit_amount_inr) || 0;

    // 2. Business Validations per Spec S-47
    if (transaction_type === "refund" && txAmount > currentHeld) {
      return NextResponse.json(
        {
          error: `Refund amount (₹${txAmount.toLocaleString("en-IN")}) exceeds total held deposit (₹${currentHeld.toLocaleString("en-IN")})`,
        },
        { status: 400 }
      );
    }

    // Determine initial status based on approval requirements
    let initialStatus = "active";
    if (transaction_type === "refund" || transaction_type === "forfeiture") {
      initialStatus = "pending_approval";
    }

    // 3. Insert transaction
    const [inserted] = await db
      .insert(depositTransactions)
      .values({
        contractId: contract_id,
        orgId: c.org_id || auth.orgId,
        occupantId: c.occupant_id,
        transactionType: transaction_type,
        instrumentType: instrument_type,
        amount: String(txAmount),
        bankName: bank_name,
        instrumentReference: reference,
        validityDate: validity_date || null,
        requiredDepositAmount: "300000",
        shortfallAmount: "0.00",
        status: initialStatus,
        invoiceIds: invoice_ids.length > 0 ? invoice_ids : null,
        notes: notes || null,
      })
      .returning();

    // 4. Update contract held deposit for receipts or immediate adjustments
    if (transaction_type === "receipt" || transaction_type === "received") {
      const newHeld = currentHeld + txAmount;
      await db
        .update(contract)
        .set({
          deposit_amount_inr: String(newHeld),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(contract.id, contract_id));
    } else if (transaction_type === "adjustment_against_dues") {
      const newHeld = Math.max(0, currentHeld - txAmount);
      await db
        .update(contract)
        .set({
          deposit_amount_inr: String(newHeld),
          updated_at: new Date(),
          updated_by: auth.userId,
        })
        .where(eq(contract.id, contract_id));

      // If invoice_ids provided, reduce their balance_due
      if (Array.isArray(invoice_ids) && invoice_ids.length > 0) {
        let remainingToAllocate = txAmount;
        for (const invId of invoice_ids) {
          if (remainingToAllocate <= 0) break;
          const [inv] = await db.select().from(invoice).where(eq(invoice.id, invId)).limit(1);
          if (inv) {
            const currentBal = Number(inv.balance_due) || 0;
            const allocAmt = Math.min(currentBal, remainingToAllocate);
            if (allocAmt > 0) {
              const newBal = currentBal - allocAmt;
              await db
                .update(invoice)
                .set({
                  balance_due: String(newBal),
                  status: newBal <= 0 ? "paid" : "partially_paid",
                  updated_at: new Date(),
                })
                .where(eq(invoice.id, invId));
              remainingToAllocate -= allocAmt;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message:
        initialStatus === "pending_approval"
          ? "Deposit transaction submitted for approval"
          : "Deposit transaction recorded successfully",
      transaction: inserted,
    });
  } catch (error: any) {
    console.error("POST /api/deposits/transaction error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record deposit transaction" },
      { status: 500 }
    );
  }
}

/**
 * Approve or reject deposit transactions (e.g. refund / forfeiture)
 */
export async function PUT(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();
    const { transaction_id, action, notes } = body;

    if (!transaction_id || !action) {
      return NextResponse.json(
        { error: "transaction_id and action ('approve' | 'reject') are required" },
        { status: 400 }
      );
    }

    const [tx] = await db
      .select()
      .from(depositTransactions)
      .where(eq(depositTransactions.id, transaction_id))
      .limit(1);

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const [updated] = await db
      .update(depositTransactions)
      .set({
        status: newStatus,
        approvedBy: auth.userId,
        notes: notes ? `${tx.notes || ""}\n[${action.toUpperCase()}] ${notes}` : tx.notes,
      })
      .where(eq(depositTransactions.id, transaction_id))
      .returning();

    // If approved refund, deduct from contract deposit balance
    if (action === "approve" && tx.transactionType === "refund") {
      const [c] = await db.select().from(contract).where(eq(contract.id, tx.contractId)).limit(1);
      if (c) {
        const currentHeld = Number(c.deposit_amount_inr) || 0;
        const newHeld = Math.max(0, currentHeld - Number(tx.amount));
        await db
          .update(contract)
          .set({
            deposit_amount_inr: String(newHeld),
            updated_at: new Date(),
            updated_by: auth.userId,
          })
          .where(eq(contract.id, tx.contractId));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deposit transaction ${action}d successfully`,
      transaction: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/deposits/transaction error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update transaction status" },
      { status: 500 }
    );
  }
}
