import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, BillingEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientAccountId = searchParams.get("clientAccountId");
    const db = getRentRollDb();

    let entities = db.billingEntities || [];
    if (clientAccountId && clientAccountId !== "ALL") {
      entities = entities.filter(be => be.clientAccountId === clientAccountId);
    }

    return NextResponse.json(entities);
  } catch (error: any) {
    console.error("GET /api/rent-roll/billing-entities error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      legalName,
      tradeName,
      pan,
      gstin,
      stateCode,
      registeredAddress,
      bankName,
      bankAccountNumber,
      bankIfsc,
      bankBranch,
      invoicePrefix,
      clientAccountId,
      isDefault
    } = body;

    if (!legalName || !pan || !gstin) {
      return NextResponse.json({ error: "Legal Name, PAN and GSTIN are required." }, { status: 400 });
    }

    const db = getRentRollDb();
    const newEntity: BillingEntity = {
      id: `BE-${Date.now()}`,
      orgId: db.organization.id,
      clientAccountId: clientAccountId || "CA-SELF",
      legalName,
      tradeName: tradeName || legalName,
      pan: pan.toUpperCase().trim(),
      gstin: gstin.toUpperCase().trim(),
      stateCode: stateCode || gstin.substring(0, 2),
      registeredAddress: registeredAddress || "",
      bankName,
      bankAccountNumber,
      bankIfsc,
      bankBranch,
      invoicePrefix: invoicePrefix || "INV-2026",
      isDefault: !!isDefault
    };

    if (isDefault) {
      db.billingEntities.forEach(be => { be.isDefault = false; });
    }

    db.billingEntities.push(newEntity);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "BillingEntity",
      action: "CREATE_BILLING_ENTITY",
      newValues: { legalName, gstin, invoicePrefix },
      changedBy: "Org Finance Admin"
    });

    return NextResponse.json(newEntity, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/billing-entities error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
