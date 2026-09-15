import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, LeaseEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const tenantId = searchParams.get("tenantId");
    const search = searchParams.get("search")?.toLowerCase();

    const db = getRentRollDb();
    let leases = db.leases;

    if (propertyId && propertyId !== "ALL") {
      leases = leases.filter(l => l.propertyId === propertyId);
    }
    if (status && status !== "ALL") {
      leases = leases.filter(l => l.status === status);
    }
    if (tenantId && tenantId !== "ALL") {
      leases = leases.filter(l => l.tenantId === tenantId);
    }
    if (search) {
      leases = leases.filter(l =>
        l.tenantName.toLowerCase().includes(search) ||
        l.leaseCode.toLowerCase().includes(search) ||
        l.propertyName.toLowerCase().includes(search) ||
        l.unitNumber.toLowerCase().includes(search)
      );
    }

    // Attach real-time computed financial summary to each lease
    const enrichedLeases = leases.map(lease => {
      const summary = computeFullLeaseSummary({
        chargeableArea: lease.chargeableArea,
        carpetArea: lease.carpetArea,
        monthlyRent: lease.monthlyRent,
        camRatePsf: lease.camRatePsf,
        utilityFixedMonthly: lease.utilityFixedMonthly,
        parkingChargesMonthly: lease.parkingChargesMonthly,
        signageChargesMonthly: lease.signageChargesMonthly,
        otherChargesMonthly: lease.otherChargesMonthly,
        startDate: lease.startDate,
        endDate: lease.endDate,
        lockInMonths: lease.lockInMonths,
        escalationPct: lease.escalationPct,
        escalationFrequencyMonths: lease.escalationFrequencyMonths,
        securityDepositMonths: lease.securityDepositMonths,
        securityDepositPaid: lease.securityDepositPaid,
      });

      // Find tenant's outstanding balance from unpaid invoices
      const tenantInvoices = db.invoices.filter(inv => inv.leaseId === lease.id);
      const totalOutstanding = tenantInvoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
      const overdueInvoices = tenantInvoices.filter(inv => inv.status === "overdue");

      return {
        ...lease,
        computed: summary,
        totalOutstanding,
        hasOverdue: overdueInvoices.length > 0,
      };
    });

    return NextResponse.json(enrichedLeases);
  } catch (error: any) {
    console.error("GET /api/rent-roll/leases error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      propertyId,
      spaceId,
      unitNumber,
      floorNumber,
      tenantId,
      tenantName,
      leaseCode,
      startDate,
      endDate,
      chargeableArea,
      carpetArea,
      monthlyRent,
      camRatePsf,
      utilityFixedMonthly,
      parkingChargesMonthly,
      signageChargesMonthly,
      otherChargesMonthly,
      securityDepositMonths,
      securityDepositPaid,
      escalationPct,
      escalationFrequencyMonths,
      lockInMonths,
      noticePeriodDays,
      billingFrequency,
      billingDueDay,
      brokerName,
      notes
    } = body;

    if (!propertyId || !tenantName || !startDate || !endDate || !monthlyRent || !chargeableArea) {
      return NextResponse.json({ error: "Missing required lease fields" }, { status: 400 });
    }

    const db = getRentRollDb();
    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Tenant lookup or creation
    let tenantObj = db.tenants.find(t => t.id === tenantId || t.tradeName.toLowerCase() === tenantName.toLowerCase());
    if (!tenantObj) {
      const newTenantId = `TEN-${Date.now()}`;
      tenantObj = {
        id: newTenantId,
        orgId: db.organization.id,
        tenantCode: `TNT-${Math.floor(100 + Math.random() * 900)}`,
        tradeName: tenantName,
        legalName: tenantName,
        industry: "Commercial Tenant",
        pan: "AABCT9999X",
        gstin: "27AABCT9999X1Z1",
        contactPerson: "Authorized Signatory",
        contactEmail: "admin@tenant.com",
        contactPhone: "+91 98000 00000",
        billingAddress: prop.address,
        billingCity: prop.city,
        billingState: prop.state,
        billingPincode: prop.pincode,
        status: "active",
        creditLimit: monthlyRent * 12,
        paymentTermsDays: 15,
        createdAt: new Date().toISOString().split('T')[0]
      };
      db.tenants.push(tenantObj);
    }

    const numChargeable = Number(chargeableArea);
    const numCarpet = Number(carpetArea || numChargeable * 0.85);
    const numMonthlyRent = Number(monthlyRent);
    const numCamPsf = Number(camRatePsf || 0);
    const numUtil = Number(utilityFixedMonthly || 0);
    const numPark = Number(parkingChargesMonthly || 0);
    const numSign = Number(signageChargesMonthly || 0);
    const numOther = Number(otherChargesMonthly || 0);
    const numEscPct = Number(escalationPct || 5);
    const numEscFreq = Number(escalationFrequencyMonths || 12);
    const numDepMonths = Number(securityDepositMonths || 6);
    const numDepPaid = Number(securityDepositPaid || numMonthlyRent * numDepMonths);

    const summary = computeFullLeaseSummary({
      chargeableArea: numChargeable,
      carpetArea: numCarpet,
      monthlyRent: numMonthlyRent,
      camRatePsf: numCamPsf,
      utilityFixedMonthly: numUtil,
      parkingChargesMonthly: numPark,
      signageChargesMonthly: numSign,
      otherChargesMonthly: numOther,
      startDate,
      endDate,
      lockInMonths: Number(lockInMonths || 36),
      escalationPct: numEscPct,
      escalationFrequencyMonths: numEscFreq,
      securityDepositMonths: numDepMonths,
      securityDepositPaid: numDepPaid,
    });

    const newLeaseId = `LEASE-${Math.floor(100 + Math.random() * 900)}`;
    const generatedLeaseCode = leaseCode || `LSE-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newLease: LeaseEntity = {
      id: newLeaseId,
      orgId: db.organization.id,
      propertyId: prop.id,
      propertyName: prop.name,
      spaceId: spaceId || `SPC-${newLeaseId}`,
      unitNumber: unitNumber || "Suite Commercial",
      floorNumber: Number(floorNumber || 1),
      tenantId: tenantObj.id,
      tenantName: tenantObj.tradeName,
      leaseCode: generatedLeaseCode,
      startDate,
      endDate,
      fitoutPeriodDays: 0,
      rentFreePeriodDays: 0,
      carpetArea: numCarpet,
      chargeableArea: numChargeable,
      monthlyRent: numMonthlyRent,
      baseRentPsf: summary.baseRentPsf,
      camRatePsf: numCamPsf,
      camMonthly: summary.camMonthly,
      utilityFixedMonthly: numUtil,
      parkingChargesMonthly: numPark,
      signageChargesMonthly: numSign,
      otherChargesMonthly: numOther,
      totalMonthlyGross: summary.totalMonthlyGross,
      annualRentGross: summary.annualRentGross,
      securityDepositMonths: numDepMonths,
      securityDepositAmount: summary.securityDepositRequired,
      securityDepositPaid: numDepPaid,
      securityDepositBank: "Corporate Bank Guarantee",
      securityDepositBgReference: `BG-2026-${newLeaseId}`,
      escalationPct: numEscPct,
      escalationFrequencyMonths: numEscFreq,
      nextEscalationDate: summary.nextEscalationDate.toISOString().split('T')[0],
      lockInMonths: Number(lockInMonths || 36),
      lockInEndDate: summary.lockInEndDate.toISOString().split('T')[0],
      noticePeriodDays: Number(noticePeriodDays || 90),
      status: "active",
      renewalStatus: "not_due",
      billingFrequency: billingFrequency || "monthly",
      billingDueDay: Number(billingDueDay || 5),
      gstRate: 18,
      tdsRate: 10,
      brokerName: brokerName || "Direct / Internal",
      brokeragePaid: 0,
      notes: notes || "Standard Commercial Agreement",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.leases.unshift(newLease);

    // Also schedule next escalation
    db.escalations.push({
      id: `ESC-${Date.now()}`,
      leaseId: newLease.id,
      leaseCode: newLease.leaseCode,
      tenantName: newLease.tenantName,
      propertyName: newLease.propertyName,
      escalationDate: newLease.nextEscalationDate,
      previousRent: newLease.monthlyRent,
      newRent: summary.nextEscalatedRent,
      escalationPct: newLease.escalationPct,
      calculatedIncrease: summary.nextEscalatedRent - newLease.monthlyRent,
      status: "pending",
      notes: "Auto-scheduled escalation on lease onboarding"
    });

    recordAuditLog({
      leaseId: newLease.id,
      entityName: "Lease",
      action: "CREATE_LEASE",
      newValues: { leaseCode: newLease.leaseCode, tenantName: newLease.tenantName, monthlyRent: newLease.monthlyRent },
      changedBy: "Property Manager"
    });

    saveRentRollDb(db);

    return NextResponse.json(newLease, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/leases error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
