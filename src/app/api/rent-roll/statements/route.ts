import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, OwnerStatementEntity } from "@/lib/rent-roll-store";
import { calculateOwnerStatement } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientAccountId = searchParams.get("clientAccountId");
    const db = getRentRollDb();

    let statements = db.ownerStatements || [];
    if (clientAccountId && clientAccountId !== "ALL") {
      statements = statements.filter(s => s.clientAccountId === clientAccountId);
    }

    return NextResponse.json(statements);
  } catch (error: any) {
    console.error("GET /api/rent-roll/statements error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientAccountId,
      periodMonth, // "2026-09"
      reimbursableExpenses = 0
    } = body;

    if (!clientAccountId || !periodMonth) {
      return NextResponse.json({ error: "clientAccountId and periodMonth are required." }, { status: 400 });
    }

    const db = getRentRollDb();
    const client = db.clientAccounts.find(c => c.id === clientAccountId);
    const mandate = db.managementMandates.find(m => m.clientAccountId === clientAccountId && m.status === "active");

    const feeModel = mandate ? mandate.feeModel : "pct_collections";
    const feeRate = mandate ? mandate.feeRate : 3.5;

    // Calculate totals for this client account
    const clientProps = db.properties.filter(p => p.clientAccountId === clientAccountId);
    const clientPropIds = new Set(clientProps.map(p => p.id));
    const totalArea = clientProps.reduce((sum, p) => sum + p.chargeableArea, 0);

    const periodInvoices = db.invoices.filter(inv =>
      clientPropIds.has(inv.propertyId) && inv.periodStart.startsWith(periodMonth)
    );
    const grossBilled = periodInvoices.reduce((sum, inv) => sum + inv.grossTotal, 0);

    const periodCollections = db.collections.filter(col =>
      col.paymentDate.startsWith(periodMonth) &&
      db.leases.some(l => l.id === col.leaseId && clientPropIds.has(l.propertyId))
    );
    const totalCollected = periodCollections.reduce((sum, col) => sum + col.amountReceived, 0);
    const totalArrears = periodInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    const calc = calculateOwnerStatement(
      grossBilled,
      totalCollected,
      totalArrears,
      feeModel,
      feeRate,
      totalArea,
      reimbursableExpenses
    );

    const statement: OwnerStatementEntity = {
      id: `STMT-${Date.now()}`,
      orgId: db.organization.id,
      clientAccountId,
      clientAccountName: client?.name || "Client Account",
      statementNumber: `STMT-${client?.accountCode || "CLI"}-${periodMonth}`,
      periodMonth,
      grossBilled: calc.grossBilled,
      totalCollected: calc.totalCollected,
      totalArrears: calc.totalArrears,
      operatorManagementFee: calc.operatorManagementFee,
      reimbursableExpenses: calc.reimbursableExpenses,
      netRemittanceAmount: calc.netRemittanceAmount,
      remittanceStatus: "pending",
      issuedAt: new Date().toISOString()
    };

    db.ownerStatements.unshift(statement);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "OwnerStatement",
      action: "GENERATE_STATEMENT",
      newValues: { statementNumber: statement.statementNumber, netRemittance: statement.netRemittanceAmount },
      changedBy: "Portfolio Operator"
    });

    return NextResponse.json(statement, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/statements error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
