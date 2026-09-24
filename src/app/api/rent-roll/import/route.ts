import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, LeaseEntity, TenantEntity, PropertyEntity, SpaceEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary, round2 } from "@/lib/rent-roll-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, propertyId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No lease rows provided for import" }, { status: 400 });
    }

    let ownerEmail = body.ownerEmail?.toLowerCase().trim();
    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();

    // Find or create target property
    let targetProperty: PropertyEntity | undefined;
    if (propertyId && propertyId !== "ALL") {
      targetProperty = db.properties.find(p => p.id === propertyId);
    }

    const importedLeases: LeaseEntity[] = [];

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const rawPropName = (row.propertyName || row.buildingName || targetProperty?.name || "Commercial Building A").trim();
      
      // Ensure property exists under user
      let prop = db.properties.find(p => 
        p.name.toLowerCase().trim() === rawPropName.toLowerCase() &&
        (!ownerEmail || (p.ownerEmail || "").toLowerCase().trim() === ownerEmail)
      );

      if (!prop) {
        prop = {
          id: `PROP-${Date.now()}-${i}`,
          orgId: db.organization.id,
          name: rawPropName,
          type: "Commercial Office",
          address: row.address || "Commercial Business District",
          city: row.city || "Mumbai",
          state: row.state || "Maharashtra",
          microMarket: row.microMarket || row.city || "Prime CBD",
          pincode: row.pincode || "400001",
          grade: "A",
          totalArea: Number(row.chargeableArea || 50000) * 5,
          chargeableArea: Number(row.chargeableArea || 50000) * 5,
          occupancyTargetPct: 95,
          assetValue: 0,
          ownerEmail: ownerEmail || "",
          ownerUserId: "",
          ownerName: row.ownerName || "Property Owner",
        };
        db.properties.push(prop);
      }

      // Find or create Tenant
      const rawTenantName = (row.tenantName || `Tenant ${i + 1}`).trim();
      let tenant = db.tenants.find(t => 
        t.tradeName.toLowerCase().trim() === rawTenantName.toLowerCase() ||
        t.legalName.toLowerCase().trim() === rawTenantName.toLowerCase()
      );

      if (!tenant) {
        tenant = {
          id: `TEN-${Date.now()}-${i}`,
          orgId: db.organization.id,
          tenantCode: `TNT-${Math.floor(1000 + Math.random() * 9000)}`,
          tradeName: rawTenantName,
          legalName: row.legalName || rawTenantName,
          industry: row.industry || "Commercial Corporate",
          pan: row.pan || "AAACX1234F",
          gstin: row.gstin || "27AAACX1234F1Z1",
          contactPerson: row.contactPerson || "Admin / Facilities Head",
          contactEmail: row.contactEmail || `contact@${rawTenantName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          contactPhone: row.contactPhone || "+91 98000 00000",
          billingAddress: prop.address,
          billingCity: prop.city,
          billingState: prop.state,
          billingPincode: prop.pincode,
          status: "active",
          creditLimit: 50000000,
          paymentTermsDays: 15,
          createdAt: new Date().toISOString()
        };
        db.tenants.push(tenant);
      }

      // Space
      const unitNumber = row.unitNumber || `Suite ${101 + i}`;
      const floorNumber = Number(row.floorNumber) || 1;
      const chargeableArea = Number(row.chargeableArea) || 5000;
      const carpetArea = Number(row.carpetArea) || Math.round(chargeableArea * 0.75);
      const monthlyRent = Number(row.monthlyRent) || Math.round(chargeableArea * 150);
      const camRatePsf = Number(row.camRatePsf) || 20;
      const utilityFixedMonthly = Number(row.utilityFixedMonthly) || 0;

      const space: SpaceEntity = {
        id: `SPC-${Date.now()}-${i}`,
        propertyId: prop.id,
        buildingName: prop.name,
        floorNumber,
        unitNumber,
        spaceType: "office",
        carpetArea,
        chargeableArea,
        standardRatePsf: round2(monthlyRent / chargeableArea),
        standardCamPsf: camRatePsf,
        status: "leased",
        currentLeaseId: `LEASE-${Date.now()}-${i}`
      };
      db.spaces.push(space);

      // Financial Engine calculation
      const startDate = row.startDate || new Date().toISOString().split("T")[0];
      const endDate = row.endDate || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const escalationPct = Number(row.escalationPct) || 5;
      const escalationFrequencyMonths = Number(row.escalationFrequencyMonths) || 24;
      const securityDepositMonths = Number(row.securityDepositMonths) || 6;
      const lockInMonths = Number(row.lockInMonths) || 36;
      const noticePeriodDays = Number(row.noticePeriodDays) || 90;

      const summary = computeFullLeaseSummary({
        chargeableArea,
        carpetArea,
        monthlyRent,
        camRatePsf,
        utilityFixedMonthly,
        startDate,
        endDate,
        lockInMonths,
        escalationPct,
        escalationFrequencyMonths,
        securityDepositMonths,
      });

      const lease: LeaseEntity = {
        id: space.currentLeaseId!,
        orgId: db.organization.id,
        propertyId: prop.id,
        propertyName: prop.name,
        spaceId: space.id,
        unitNumber,
        floorNumber,
        tenantId: tenant.id,
        tenantName: tenant.tradeName,
        leaseCode: `LSE-${new Date().getFullYear()}-${String(db.leases.length + i + 1).padStart(3, "0")}`,
        startDate,
        endDate,
        fitoutPeriodDays: 0,
        rentFreePeriodDays: 0,
        carpetArea,
        chargeableArea,
        monthlyRent,
        baseRentPsf: summary.baseRentPsf,
        camRatePsf,
        camMonthly: summary.camMonthly,
        utilityFixedMonthly,
        parkingChargesMonthly: 0,
        signageChargesMonthly: 0,
        otherChargesMonthly: 0,
        totalMonthlyGross: summary.totalMonthlyGross,
        annualRentGross: summary.annualRentGross,
        securityDepositMonths,
        securityDepositAmount: summary.securityDepositRequired,
        securityDepositPaid: summary.securityDepositRequired,
        securityDepositBank: "Scheduled Commercial Bank Guarantee",
        securityDepositBgReference: `BG-${new Date().getFullYear()}-${1000 + i}`,
        escalationPct,
        escalationFrequencyMonths,
        nextEscalationDate: row.nextEscalationDate || new Date(Date.now() + escalationFrequencyMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        lockInMonths,
        lockInEndDate: row.lockInEndDate || new Date(Date.now() + lockInMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        noticePeriodDays,
        status: "active",
        renewalStatus: "not_due",
        billingFrequency: "monthly",
        billingDueDay: 5,
        gstRate: 18,
        tdsRate: 10,
        brokerName: row.brokerName || "Direct / JLL India",
        brokeragePaid: round2(monthlyRent * 0.5),
        notes: `Imported via Rent Roll Excel/CSV upload.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.leases.push(lease);
      importedLeases.push(lease);
    }

    recordAuditLog({
      entityName: "RentRoll",
      action: "IMPORT_RENT_ROLL",
      newValues: { importedCount: importedLeases.length },
      changedBy: ownerEmail || "Portfolio Manager"
    });

    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      importedCount: importedLeases.length,
      leases: importedLeases
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
