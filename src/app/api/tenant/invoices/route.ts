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
    // Look up specific tenant by ID, email, or name with graceful fallback
    let activeTenant = null;
    if (requestedTenantId) {
      activeTenant = db.tenants.find((t) => t.id === requestedTenantId || t.tenantCode === requestedTenantId);
    }
    if (!activeTenant && requestedName) {
      activeTenant = db.tenants.find(
        (t) => t.tradeName?.toLowerCase() === requestedName.toLowerCase() ||
               t.legalName?.toLowerCase() === requestedName.toLowerCase()
      );
    }
    if (!activeTenant && requestedEmail) {
      activeTenant = db.tenants.find((t) => t.contactEmail && t.contactEmail.toLowerCase() === requestedEmail);
    }
    if (!activeTenant) {
      // Fallback to the first tenant with an active lease for default tenant portal view
      activeTenant = db.tenants.find((t) => db.leases.some((l) => l.tenantId === t.id)) || db.tenants[0] || null;
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

    // Resolve Landlord settlement bank details for receiving rent directly
    const firstLease = leases[0];
    const property = firstLease ? db.properties.find(p => p.id === firstLease.propertyId) : db.properties[0];
    const billingEntity = firstLease?.billingEntityId 
      ? db.billingEntities.find(b => b.id === firstLease.billingEntityId)
      : (db.billingEntities[0] || null);

    const landlordBank = {
      beneficiaryName: billingEntity?.legalName || property?.ownerName || db.organization.name || "Commercial Property SPV",
      bankName: billingEntity?.bankName || "HDFC Bank Ltd",
      accountNumber: billingEntity?.bankAccountNumber || "50200088991122",
      ifsc: billingEntity?.bankIfsc || "HDFC0000060",
      branch: billingEntity?.bankBranch || "BKC Special Financial Services Branch",
      upiVpa: "landlord.rent@hdfcbank",
      gstin: billingEntity?.gstin || "27AAFCO1234F1Z5",
      pan: billingEntity?.pan || "AAFCO1234F",
      accountType: "Current Account"
    };

    return NextResponse.json({
      tenant: activeTenant || null,
      leases,
      invoices,
      pendingInvoices,
      collections,
      landlordBank,
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
