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
        l.status !== "expired"
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

      const propUnit = properties.flatMap(p => (p.units || []).map((u: any) => ({ ...u, propId: p.id, propName: p.name })))
        .find((u: any) => u.tenantName && u.tenantName.toLowerCase() === t.tradeName.toLowerCase());

      const resolvedPropId = primaryLease?.propertyId || propUnit?.propId || (properties.length === 1 ? properties[0].id : "");
      const resolvedPropName = primaryLease?.propertyName || propUnit?.propName || (properties.length === 1 ? properties[0].name : "");
      const resolvedUnit = primaryLease?.unitNumber || propUnit?.suiteNumber || "Suite 101";

      return {
        ...t,
        propertyId: resolvedPropId,
        propertyName: resolvedPropName,
        unitNumber: resolvedUnit,
        floorNumber: primaryLease?.floorNumber || propUnit?.floorNumber || 1,
        activeLeasesCount: tenantLeases.length,
        leasedProperties: leasedProps.length > 0 ? leasedProps : (resolvedPropName ? [resolvedPropName] : []),
        totalArea: totalArea || propUnit?.chargeableArea || 0,
        totalMonthlyRent: totalMonthlyRent || (propUnit ? (propUnit.askingRate || propUnit.contractedRentPsf || 150) * (propUnit.chargeableArea || 1) : 0),
        totalMonthlyBilling: totalMonthlyBilling || totalMonthlyRent || 0,
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
      tenantId,
      originalTradeName,
      nameChanged,
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
      notes,
      propertyId,
      propertyName,
      unitNumber,
      status,
      portalLive
    } = body;

    if (!tradeName) {
      return NextResponse.json({ error: "Missing required tenant tradeName" }, { status: 400 });
    }

    const db = getRentRollDb();
    if (!db.alerts) db.alerts = [];

    // Check if an existing tenant matches
    const existingIdx = db.tenants.findIndex(t =>
      (tenantId && t.id === tenantId) ||
      (originalTradeName && t.tradeName.toLowerCase() === originalTradeName.toLowerCase()) ||
      (body.inviteCode && t.inviteCode && t.inviteCode.toUpperCase() === body.inviteCode.toUpperCase()) ||
      (t.tradeName.toLowerCase() === tradeName.toLowerCase())
    );

    if (existingIdx >= 0) {
      const existing = db.tenants[existingIdx];
      const prevName = existing.tradeName;
      const hasNameChanged = Boolean(
        nameChanged ||
        (originalTradeName && originalTradeName.trim().toLowerCase() !== tradeName.trim().toLowerCase()) ||
        (prevName && prevName.trim().toLowerCase() !== tradeName.trim().toLowerCase())
      );

      db.tenants[existingIdx] = {
        ...existing,
        tradeName: tradeName.trim(),
        legalName: legalName ? legalName.trim() : (existing.legalName || tradeName.trim()),
        industry: industry || existing.industry || "Commercial Occupant",
        pan: pan || existing.pan || "",
        gstin: gstin || existing.gstin || "",
        contactPerson: (contactPerson || "").trim() || existing.contactPerson || "",
        contactEmail: (contactEmail || "").trim().toLowerCase() || existing.contactEmail || "",
        contactPhone: (contactPhone || "").trim() || existing.contactPhone || "",
        billingAddress: billingAddress || existing.billingAddress,
        billingCity: billingCity || existing.billingCity,
        billingState: billingState || existing.billingState,
        billingPincode: billingPincode || existing.billingPincode,
        status: (portalLive || status === "active") ? "active" : (status || existing.status || "active"),
        portalLive: true,
        inviteStatus: "accepted",
        propertyId: propertyId || existing.propertyId
      };

      // Clear any "Invite Pending" alerts for this tenant
      if (db.alerts) {
        db.alerts = db.alerts.filter(a => !(a.title && (a.title.includes(existing.tradeName) || a.title.includes(prevName) || (existing.inviteCode && a.title.includes(existing.inviteCode))) && a.title.includes("Invite Pending")));
      }

      // If tenant modified their name during onboarding/join, trigger notification for Rent Roll Dashboard
      if (hasNameChanged && prevName.toLowerCase() !== tradeName.trim().toLowerCase()) {
        const alertId = `ALT-NAME-${Date.now()}`;
        db.alerts.unshift({
          id: alertId,
          orgId: db.organization.id,
          propertyId: propertyId || existing.propertyId || db.properties?.[0]?.id,
          alertType: "compliance",
          title: `Tenant Legal Name Changed: ${tradeName.trim()}`,
          message: `Tenant "${prevName}" (Allocated Unit: ${unitNumber || "Leased Premises"}) changed their registered name to "${tradeName.trim()}". Review and update in Rent Roll & Contract.`,
          entityType: "tenant",
          entityId: existing.id,
          severity: "warning",
          isRead: false,
          triggerDate: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        });

        recordAuditLog({
          entityName: "Tenant",
          action: "TENANT_NAME_CHANGED",
          oldValues: { tradeName: prevName },
          newValues: { tradeName: tradeName.trim(), unitNumber: unitNumber || "Premises" },
          changedBy: contactPerson || "Tenant User"
        });

        // Synchronize linked leases & property units
        for (const l of db.leases || []) {
          if (l.tenantId === existing.id || (l.tenantName && l.tenantName.toLowerCase() === prevName.toLowerCase())) {
            l.tenantName = tradeName.trim();
          }
        }
        for (const p of db.properties || []) {
          for (const u of p.units || []) {
            if (u.tenantName && u.tenantName.toLowerCase() === prevName.toLowerCase()) {
              u.tenantName = tradeName.trim();
            }
          }
        }
      }

      saveRentRollDb(db);
      return NextResponse.json(db.tenants[existingIdx], { status: 200 });
    }

    // Otherwise, create a new tenant
    const newId = `TEN-${Date.now()}`;
    const newCode = `TNT-${Math.floor(100 + Math.random() * 900)}`;

    const newTenant: TenantEntity = {
      id: newId,
      orgId: db.organization.id,
      tenantCode: newCode,
      tradeName: tradeName.trim(),
      legalName: legalName || tradeName.trim(),
      industry: industry || "Commercial",
      pan: pan || "",
      gstin: gstin || "",
      tan: tan || "",
      cin: cin || "",
      contactPerson: (contactPerson || "").trim(),
      contactEmail: (contactEmail || "").trim().toLowerCase(),
      contactPhone: (contactPhone || "").trim(),
      billingAddress: billingAddress || "",
      billingCity: billingCity || "",
      billingState: billingState || "",
      billingPincode: billingPincode || "",
      status: status || "active",
      portalLive: portalLive || false,
      creditLimit: Number(creditLimit || 5000000),
      paymentTermsDays: Number(paymentTermsDays || 15),
      notes: notes || "",
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.tenants.push(newTenant);

    if (nameChanged && originalTradeName && originalTradeName.toLowerCase() !== tradeName.trim().toLowerCase()) {
      db.alerts.unshift({
        id: `ALT-NAME-${Date.now()}`,
        orgId: db.organization.id,
        propertyId: propertyId || db.properties?.[0]?.id,
        alertType: "compliance",
        title: `Tenant Legal Name Changed: ${tradeName.trim()}`,
        message: `Tenant "${originalTradeName}" (Allocated Unit: ${unitNumber || "Leased Premises"}) changed their registered name to "${tradeName.trim()}". Review and update in Rent Roll.`,
        entityType: "tenant",
        entityId: newTenant.id,
        severity: "warning",
        isRead: false,
        triggerDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      });
    }

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
