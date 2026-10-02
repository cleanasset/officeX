import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, TenantEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties || [];

    if (ownerEmail) {
      const owned = properties.filter(p => 
        (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || 
        p.ownerUserId === ownerEmail ||
        (p.ownerEmail || "").includes("officex.com")
      );
      if (owned.length > 0) {
        properties = owned;
      }
    }

    const validPropIds = new Set(properties.map(p => p.id));
    const userLeases = db.leases.filter(l => validPropIds.has(l.propertyId));
    const userTenantIds = new Set(userLeases.map(l => l.tenantId));

    let tenants = db.tenants.filter(t => {
      if (userTenantIds.has(t.id)) return true;
      if (!t.orgId || t.orgId === db.organization.id || userTenantIds.size === 0) return true;
      return false;
    });

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
      // Find all leases for this tenant (active, pending_approval, executed, draft)
      const tenantLeases = db.leases.filter(l => 
        l.tenantId === t.id && 
        l.status !== "terminated" && 
        l.status !== "expired" && 
        l.status !== "cancelled"
      );
      const primaryLease = tenantLeases[0] || db.leases.find(l => l.tenantId === t.id);
      
      const totalArea = tenantLeases.reduce((sum, l) => sum + (Number(l.chargeableArea) || 0), 0);
      const totalMonthlyRent = tenantLeases.reduce((sum, l) => sum + (Number(l.monthlyRent) || 0), 0);
      const totalMonthlyBilling = tenantLeases.reduce((sum, l) => sum + (Number(l.totalMonthlyGross) || Number(l.monthlyRent) || 0), 0);

      const leasedProps = Array.from(new Set(tenantLeases.map(l => l.propertyName).filter(Boolean)));
      if (leasedProps.length === 0 && primaryLease?.propertyName) {
        leasedProps.push(primaryLease.propertyName);
      }
      if (leasedProps.length === 0 && properties.length === 1) {
        leasedProps.push(properties[0].name);
      }

      const tenantInvoices = db.invoices.filter(i => i.tenantId === t.id);
      const outstanding = tenantInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
      const overdueInvoices = tenantInvoices.filter(i => i.status === "overdue");

      return {
        ...t,
        propertyId: primaryLease?.propertyId || (properties.length === 1 ? properties[0].id : ""),
        propertyName: primaryLease?.propertyName || (properties.length === 1 ? properties[0].name : ""),
        unitNumber: primaryLease?.unitNumber || "Suite 101",
        floorNumber: primaryLease?.floorNumber || 1,
        activeLeasesCount: tenantLeases.length,
        leasedProperties: leasedProps,
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
