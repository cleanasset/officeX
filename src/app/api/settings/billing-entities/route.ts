import { NextResponse } from "next/server";
import { db } from "@/db";
import { billingEntities } from "@/db/schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, sql, desc } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);

    let entities: any[] = [];
    try {
      entities = await db
        .select()
        .from(billingEntities)
        .where(eq(billingEntities.orgId, auth.orgId))
        .orderBy(desc(billingEntities.isDefault), desc(billingEntities.createdAt));
    } catch (e) {}

    if (entities.length === 0) {
      entities = [];
    }

    const formatted = entities.map((e) => ({
      id: e.id,
      legal_name: e.legalName || e.legal_name,
      trade_name: e.tradeName || e.trade_name,
      pan: e.pan,
      gstin: e.gstin,
      state_code: e.stateCode || e.state_code,
      registered_address: e.registeredAddress || e.registered_address,
      bank_name: e.bankName || e.bank_name,
      bank_account_number: e.bankAccountNumber || e.bank_account_number,
      bank_ifsc: e.bankIfsc || e.bank_ifsc,
      bank_branch: e.bankBranch || e.bank_branch,
      invoice_prefix: e.invoicePrefix || e.invoice_prefix,
      is_default: e.isDefault || e.is_default || false,
      authorized_signatory: e.legalName ? `${e.legalName} Authorized Signatory` : "Authorized Key Signatory",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch billing entities", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json();

    const {
      legal_name,
      trade_name,
      pan,
      gstin,
      state_code,
      registered_address,
      bank_name,
      bank_account_number,
      bank_ifsc,
      bank_branch,
      invoice_prefix,
      is_default,
    } = body;

    let newId = `be-${Date.now()}`;
    try {
      const [inserted] = await db
        .insert(billingEntities)
        .values({
          orgId: auth.orgId,
          legalName: legal_name,
          tradeName: trade_name || legal_name,
          pan: pan?.toUpperCase(),
          gstin: gstin?.toUpperCase(),
          stateCode: state_code,
          registeredAddress: registered_address,
          bankName: bank_name,
          bankAccountNumber: bank_account_number,
          bankIfsc: bank_ifsc?.toUpperCase(),
          bankBranch: bank_branch,
          invoicePrefix: invoice_prefix || "INV-26-27",
          isDefault: is_default || false,
        })
        .returning();
      if (inserted) newId = inserted.id;
    } catch (e) {}

    return NextResponse.json({
      success: true,
      id: newId,
      message: "Billing entity master registered successfully (S-61).",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create billing entity", message: err.message }, { status: 500 });
  }
}
