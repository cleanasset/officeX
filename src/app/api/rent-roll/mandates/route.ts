import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, ManagementMandateEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientAccountId = searchParams.get("clientAccountId");
    const db = getRentRollDb();

    let mandates = db.managementMandates || [];
    if (clientAccountId && clientAccountId !== "ALL") {
      mandates = mandates.filter(m => m.clientAccountId === clientAccountId);
    }

    // Enrich with client account name
    const enriched = mandates.map(m => {
      const client = (db.clientAccounts || []).find(c => c.id === m.clientAccountId);
      return {
        ...m,
        clientAccountName: client?.name || "Client Account",
        clientAccountCode: client?.accountCode || "CLI"
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("GET /api/rent-roll/mandates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientAccountId,
      mandateName,
      feeModel = "pct_collections",
      feeRate = 4.0,
      settlementType = "direct_to_owner",
      startDate,
      endDate
    } = body;

    if (!clientAccountId || !mandateName) {
      return NextResponse.json(
        { error: "Client Account and Mandate Name are mandatory." },
        { status: 400 }
      );
    }

    const db = getRentRollDb();
    if (!db.managementMandates) db.managementMandates = [];

    const newMandate: ManagementMandateEntity = {
      id: `MAN-${Date.now()}`,
      orgId: db.organization.id,
      clientAccountId,
      mandateName,
      feeModel,
      feeRate: Number(feeRate),
      settlementType,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || undefined,
      status: "active"
    };

    db.managementMandates.push(newMandate);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "ManagementMandate",
      action: "CREATE_MANAGEMENT_MANDATE",
      newValues: {
        mandateName,
        clientAccountId,
        feeModel,
        feeRate,
        settlementType
      },
      changedBy: "Corporate Asset Manager"
    });

    return NextResponse.json({ success: true, mandate: newMandate }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/mandates error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
