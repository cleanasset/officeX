import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, TenantEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    const db = getRentRollDb();
    let tenants = db.tenants;

    if (status && status !== "ALL") {
      tenants = tenants.filter(t => t.status === status);
    }
    if (search) {
      tenants = tenants.filter(t =>
        t.tradeName.toLowerCase().includes(search) ||
        t.legalName.toLowerCase().includes(search) ||
        t.tenantCode.toLowerCase().includes(search) ||
        t.gstin?.toLowerCase().includes(search) ||
        t.pan?.toLowerCase().includes(search)
      );
    }

    const enriched = tenants.map(t => {
      const activeLeases = db.leases.filter(l => l.tenantId === t.id && l.status === "active");
      const totalArea = activeLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
      const totalMonthlyRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
      const totalMonthlyBilling = activeLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);

      const tenantInvoices = db.invoices.filter(i => i.tenantId === t.id);
      const outstanding = tenantInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
      const overdueInvoices = tenantInvoices.filter(i => i.status === "overdue");

      return {
        ...t,
        activeLeasesCount: activeLeases.length,
        leasedProperties: Array.from(new Set(activeLeases.map(l => l.propertyName))),
        totalArea,
        totalMonthlyRent,
        totalMonthlyBilling,
        outstanding,
        hasOverdue: overdueInvoices.length > 0,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("GET /api/rent-roll/tenants error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tradeName,
      legalName,
      industry,
      pan,
      gstin,
      tan,
      cin,
      contactPerson,
      contactEmail,
      contactPhone,
      billingAddress,
      billingCity,
      billingState,
      billingPincode,
      creditLimit,
      paymentTermsDays,
      notes
    } = body;

    if (!tradeName || !contactPerson || !contactEmail || !contactPhone) {
      return NextResponse.json({ error: "Missing required tenant fields" }, { status: 400 });
    }

    const db = getRentRollDb();
    const newId = `TEN-${Date.now()}`;
    const newCode = `TNT-${Math.floor(100 + Math.random() * 900)}`;

    const newTenant: TenantEntity = {
      id: newId,
      orgId: db.organization.id,
      tenantCode: newCode,
      tradeName,
      legalName: legalName || tradeName,
      industry: industry || "Commercial",
      pan: pan || "",
      gstin: gstin || "",
      tan: tan || "",
      cin: cin || "",
      contactPerson,
      contactEmail,
      contactPhone,
      billingAddress: billingAddress || "",
      billingCity: billingCity || "",
      billingState: billingState || "",
      billingPincode: billingPincode || "",
      status: "active",
      creditLimit: Number(creditLimit || 5000000),
      paymentTermsDays: Number(paymentTermsDays || 15),
      notes: notes || "",
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.tenants.push(newTenant);

    recordAuditLog({
      entityName: "Tenant",
      action: "CREATE_TENANT",
      newValues: { tenantCode: newTenant.tenantCode, tradeName: newTenant.tradeName },
      changedBy: "Admin"
    });

    saveRentRollDb(db);

    return NextResponse.json(newTenant, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/tenants error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
