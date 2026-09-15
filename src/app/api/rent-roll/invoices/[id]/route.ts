import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getRentRollDb();
    const invoice = db.invoices.find(i => i.id === id || i.invoiceNumber === id || i.id.toLowerCase() === id.toLowerCase());

    if (!invoice) {
      return NextResponse.json({ error: `Invoice with ID/number '${id}' not found` }, { status: 404 });
    }

    const lease = db.leases.find(l => l.id === invoice.leaseId);
    const tenant = db.tenants.find(t => t.id === invoice.tenantId);
    const collections = db.collections.filter(c => c.invoiceId === invoice.id || c.invoiceNumber === invoice.invoiceNumber);

    return NextResponse.json({
      ...invoice,
      lease,
      tenant,
      collections,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/invoices/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getRentRollDb();
    const index = db.invoices.findIndex(i => i.id === id || i.invoiceNumber === id);

    if (index === -1) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const oldInv = db.invoices[index];
    const updated = {
      ...oldInv,
      ...body
    };

    db.invoices[index] = updated;

    recordAuditLog({
      leaseId: updated.leaseId,
      entityName: "Invoice",
      action: "UPDATE_INVOICE",
      oldValues: oldInv,
      newValues: updated,
      changedBy: "Finance Officer"
    });

    saveRentRollDb(db);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/rent-roll/invoices/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
