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

    // Support batch replacement/update if an array is posted
    if (Array.isArray(body)) {
      const db = getRentRollDb();
      db.billingEntities = body.map((be: any, idx: number) => ({
        id: be.id || `BE-${Date.now()}-${idx}`,
        orgId: db.organization.id,
        clientAccountId: be.clientAccountId || "CA-SELF",
        legalName: be.legalName || be.spvName,
        tradeName: be.tradeName || be.legalName || be.spvName,
        pan: (be.pan || "").toUpperCase().trim(),
        gstin: (be.gstin || "").toUpperCase().trim(),
        stateCode: be.stateCode || (be.gstin ? be.gstin.substring(0, 2) : "27"),
        registeredAddress: be.registeredAddress || "",
        bankName: be.bankName || "HDFC Bank Ltd",
        bankAccountNumber: be.bankAccountNumber || be.accountNumber || "",
        bankIfsc: (be.bankIfsc || be.ifscCode || "").toUpperCase().trim(),
        bankBranch: be.bankBranch || "",
        invoicePrefix: be.invoicePrefix || `INV-${idx + 1}`,
        isDefault: be.isDefault ?? idx === 0
      }));
      saveRentRollDb(db);
      return NextResponse.json({ success: true, count: db.billingEntities.length, entities: db.billingEntities });
    }

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
      bankName: bankName || "HDFC Bank Ltd",
      bankAccountNumber: bankAccountNumber || "",
      bankIfsc: bankIfsc || "",
      bankBranch: bankBranch || "",
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Billing Entity ID required." }, { status: 400 });
    }

    const db = getRentRollDb();
    const beforeCount = db.billingEntities.length;
    db.billingEntities = db.billingEntities.filter(be => be.id !== id);

    if (db.billingEntities.length === beforeCount) {
      return NextResponse.json({ error: "Billing Entity not found." }, { status: 404 });
    }

    // Ensure at least one default remains
    if (db.billingEntities.length > 0 && !db.billingEntities.some(be => be.isDefault)) {
      db.billingEntities[0].isDefault = true;
    }

    saveRentRollDb(db);
    return NextResponse.json({ success: true, remaining: db.billingEntities.length });
  } catch (error: any) {
    console.error("DELETE /api/rent-roll/billing-entities error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
