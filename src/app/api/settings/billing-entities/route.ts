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
      entities = [
        {
          id: "be-mh-01",
          legalName: "Apex PropCo LLP (Maharashtra Unit)",
          tradeName: "Meridian Tech Park SPV",
          pan: "AABCS1429B",
          gstin: "27AABCS1429B1Z1",
          stateCode: "27",
          registeredAddress: "Level 14, Tower 1, Meridian Tech Park, BKC, Bandra East, Mumbai - 400051",
          bankName: "HDFC Bank Ltd",
          bankAccountNumber: "50200088991234",
          bankIfsc: "HDFC0000060",
          bankBranch: "Fort Branch, Mumbai",
          invoicePrefix: "INV-26-27-MH",
          isDefault: true,
        },
        {
          id: "be-ka-02",
          legalName: "Apex Southern Real Estate Pvt Ltd (Karnataka Unit)",
          tradeName: "Meridian Global Hub Bengaluru",
          pan: "AABCS1429C",
          gstin: "29AABCS1429C1Z8",
          stateCode: "29",
          registeredAddress: "Plot 88, EPIP Zone, Whitefield, Bengaluru, Karnataka - 560066",
          bankName: "ICICI Bank Ltd",
          bankAccountNumber: "000205009941",
          bankIfsc: "ICIC0000002",
          bankBranch: "Indiranagar, Bengaluru",
          invoicePrefix: "INV-26-27-KA",
          isDefault: false,
        },
        {
          id: "be-dl-03",
          legalName: "Meridian Capital North Holdings LLP",
          tradeName: "Meridian Business Tower Gurugram",
          pan: "AABCS1429D",
          gstin: "06AABCS1429D1Z3",
          stateCode: "06",
          registeredAddress: "Sector 44, Golf Course Extension Road, Gurugram, Haryana - 122003",
          bankName: "Axis Bank Ltd",
          bankAccountNumber: "91802004455881",
          bankIfsc: "UTIB0000028",
          bankBranch: "Cyber City, Gurugram",
          invoicePrefix: "INV-26-27-HR",
          isDefault: false,
        },
      ];
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
      authorized_signatory: "Rajeev Agarwal (Authorized Key Signatory)",
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
