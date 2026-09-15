import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getRentRollDb();
    const tenant = db.tenants.find(t => t.id === id || t.tenantCode === id || t.id.toLowerCase() === id.toLowerCase());

    if (!tenant) {
      return NextResponse.json({ error: `Tenant with ID/code '${id}' not found` }, { status: 404 });
    }

    const leases = db.leases.filter(l => l.tenantId === tenant.id);
    const invoices = db.invoices.filter(i => i.tenantId === tenant.id);
    const collections = db.collections.filter(c => c.tenantId === tenant.id);

    return NextResponse.json({
      ...tenant,
      leases,
      invoices,
      collections,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/tenants/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getRentRollDb();
    const index = db.tenants.findIndex(t => t.id === id || t.tenantCode === id);

    if (index === -1) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const oldTenant = db.tenants[index];
    const updated = {
      ...oldTenant,
      ...body,
    };

    db.tenants[index] = updated;

    recordAuditLog({
      entityName: "Tenant",
      action: "UPDATE_TENANT",
      oldValues: oldTenant,
      newValues: updated,
      changedBy: "Admin"
    });

    saveRentRollDb(db);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/rent-roll/tenants/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getRentRollDb();
    const index = db.tenants.findIndex(t => t.id === id || t.tenantCode === id);

    if (index === -1) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const hasActiveLeases = db.leases.some(l => l.tenantId === id && l.status === "active");
    if (hasActiveLeases) {
      return NextResponse.json({ error: "Cannot delete tenant with active leases" }, { status: 400 });
    }

    const [deleted] = db.tenants.splice(index, 1);

    recordAuditLog({
      entityName: "Tenant",
      action: "DELETE_TENANT",
      oldValues: deleted,
      changedBy: "Admin"
    });

    saveRentRollDb(db);

    return NextResponse.json({ success: true, message: `Tenant ${deleted.tradeName} deleted` });
  } catch (error: any) {
    console.error("DELETE /api/rent-roll/tenants/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
