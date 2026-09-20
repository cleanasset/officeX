import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantId = searchParams.get("tenantId");

    const db = getRentRollDb();

    // If specific tenantId provided, filter by that; otherwise default to the primary tenant (TNT-001 / TCS)
    const activeTenant = requestedTenantId
      ? db.tenants.find((t) => t.id === requestedTenantId || t.tenantCode === requestedTenantId)
      : db.tenants[0];

    const tenantId = activeTenant ? activeTenant.id : db.tenants[0]?.id;

    // Find all leases for this tenant
    const leases = db.leases.filter((l) => l.tenantId === tenantId);
    const leaseIds = new Set(leases.map((l) => l.id));

    // Find all invoices for this tenant's leases
    const invoices = db.invoices.filter((i) => leaseIds.has(i.leaseId) || i.tenantId === tenantId);

    // Find all collections / receipts for this tenant
    const collections = db.collections.filter((c) => leaseIds.has(c.leaseId) || c.tenantId === tenantId);

    // Calculate dues summary
    const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue" || i.status === "partially_paid");
    const totalOutstanding = pendingInvoices.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);
    const nextDueInvoice = pendingInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] || null;

    return NextResponse.json({
      tenant: activeTenant || null,
      leases,
      invoices,
      pendingInvoices,
      collections,
      summary: {
        totalOutstanding,
        pendingCount: pendingInvoices.length,
        nextDueInvoice,
        activeLeaseCount: leases.filter((l) => l.status === "active").length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/tenant/invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
