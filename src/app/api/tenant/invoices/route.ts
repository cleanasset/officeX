import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTenantId = searchParams.get("tenantId");
    const requestedEmail = searchParams.get("email")?.toLowerCase();
    const requestedName = searchParams.get("name") || searchParams.get("tenantName");

    const db = getRentRollDb();

    // Look up specific tenant by ID, email, or name
    let activeTenant = null;
    if (requestedTenantId) {
      activeTenant = db.tenants.find((t) => t.id === requestedTenantId || t.tenantCode === requestedTenantId);
    } else if (requestedEmail) {
      activeTenant = db.tenants.find((t) => t.contactEmail?.toLowerCase() === requestedEmail);
    } else if (requestedName) {
      activeTenant = db.tenants.find(
        (t) => t.tradeName?.toLowerCase() === requestedName.toLowerCase() ||
               t.legalName?.toLowerCase() === requestedName.toLowerCase()
      );
    }

    if (!activeTenant) {
      return NextResponse.json({
        tenant: null,
        leases: [],
        invoices: [],
        pendingInvoices: [],
        collections: [],
        summary: {
          totalOutstanding: 0,
          pendingCount: 0,
          nextDueInvoice: null,
          activeLeaseCount: 0,
        },
      });
    }

    const tenantId = activeTenant.id;

    // Find all leases for this tenant
    const leases = db.leases.filter((l) => l.tenantId === tenantId);
    const leaseIds = new Set(leases.map((l) => l.id));

    // Find all invoices for this tenant's leases
    const invoices = db.invoices.filter((i) => leaseIds.has(i.leaseId) || i.tenantId === tenantId);

    // Find all collections / receipts for this tenant
    const collections = db.collections.filter((c) => leaseIds.has(c.leaseId) || c.tenantId === tenantId);

    // Calculate dues summary
    const pendingInvoices = invoices.filter((i) => i.status === "issued" || i.status === "overdue" || i.status === "partially_paid");
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
