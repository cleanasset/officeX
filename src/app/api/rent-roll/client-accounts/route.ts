import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, ClientAccountEntity } from "@/lib/rent-roll-store";

export async function GET() {
  try {
    const db = getRentRollDb();
    const accounts = db.clientAccounts || [];
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("GET /api/rent-roll/client-accounts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contactPerson, contactEmail, contactPhone, accountCode } = body;

    if (!name) {
      return NextResponse.json({ error: "Account Name is required." }, { status: 400 });
    }

    const db = getRentRollDb();
    const newAccount: ClientAccountEntity = {
      id: `CA-${Date.now()}`,
      orgId: db.organization.id,
      accountCode: accountCode || `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      contactPerson: contactPerson || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      portalAccessEnabled: true,
      status: "active"
    };

    if (!db.clientAccounts) db.clientAccounts = [];
    db.clientAccounts.push(newAccount);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "ClientAccount",
      action: "CREATE_CLIENT_ACCOUNT",
      newValues: { name, accountCode: newAccount.accountCode },
      changedBy: "Org Asset Manager"
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/client-accounts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
