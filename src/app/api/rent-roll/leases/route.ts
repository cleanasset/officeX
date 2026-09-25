import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, LeaseEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const tenantId = searchParams.get("tenantId");
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
    const viewMode = searchParams.get("viewMode") || "current"; // current, contracted, forecast
    const clientAccountId = searchParams.get("clientAccountId");
    const billingEntityId = searchParams.get("billingEntityId");

    let properties = db.properties;
    if (ownerEmail) {
      const owned = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
      if (owned.length > 0) {
        properties = owned;
      }
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let leases = db.leases.filter(l => validPropIds.has(l.propertyId));

    if (propertyId && propertyId !== "ALL") {
      leases = leases.filter(l => l.propertyId === propertyId);
    }
    if (clientAccountId && clientAccountId !== "ALL") {
      leases = leases.filter(l => l.clientAccountId === clientAccountId);
    }
    if (billingEntityId && billingEntityId !== "ALL") {
      leases = leases.filter(l => l.billingEntityId === billingEntityId);
    }
    if (status && status !== "ALL") {
      leases = leases.filter(l => l.status === status);
    }
    if (tenantId && tenantId !== "ALL") {
      leases = leases.filter(l => l.tenantId === tenantId);
    }

    // View Mode Handling (RR-VW-03)
    if (viewMode === "current") {
      // Exclude pipeline/future contracts not yet commenced
      leases = leases.filter(l => l.status === "active" || l.status === "under_notice" || l.status === "holdover");
    } else if (viewMode === "contracted") {
      // Includes active + future/draft contracts
      leases = leases.filter(l => l.status !== "terminated" && l.status !== "expired");
    } else if (viewMode === "forecast") {
      // Includes contracted + adds virtual rows for deals weighted by probability
      const activeDeals = db.deals.filter(d => validPropIds.has(d.propertyId) && d.stage !== "lost");
      activeDeals.forEach(deal => {
        const prop = properties.find(p => p.id === deal.propertyId);
        const monthlyRent = Math.round((deal.proposedAreaSqft || 10000) * (deal.targetRentPsf || 200));
        const weightedRent = Math.round((monthlyRent * deal.probabilityPct) / 100);
        leases.push({
          id: `VIRTUAL-DEAL-${deal.id}`,
          orgId: deal.orgId,
          propertyId: deal.propertyId,
          propertyName: prop?.name || "Pipeline Asset",
          spaceId: deal.proposedSpaceId || "SPC-PIPE",
          unitNumber: "Pipeline Space",
          floorNumber: 1,
          tenantId: `PROSPECT-${deal.id}`,
          tenantName: `${deal.prospectName} (${deal.probabilityPct}% Prob)`,
          leaseCode: `DEAL-${deal.id.slice(-4)}`,
          startDate: deal.targetCommencementDate || "2027-01-01",
          endDate: "2030-12-31",
          fitoutPeriodDays: 0,
          rentFreePeriodDays: 0,
          carpetArea: Math.round((deal.proposedAreaSqft || 10000) * 0.8),
          chargeableArea: deal.proposedAreaSqft || 10000,
          monthlyRent: weightedRent,
          baseRentPsf: deal.targetRentPsf,
          camRatePsf: 25,
          camMonthly: Math.round((deal.proposedAreaSqft || 10000) * 25),
          utilityFixedMonthly: 0,
          parkingChargesMonthly: 0,
          signageChargesMonthly: 0,
          otherChargesMonthly: 0,
          totalMonthlyGross: weightedRent + Math.round((deal.proposedAreaSqft || 10000) * 25),
          annualRentGross: (weightedRent + Math.round((deal.proposedAreaSqft || 10000) * 25)) * 12,
          securityDepositMonths: 6,
          securityDepositAmount: weightedRent * 6,
          securityDepositPaid: 0,
          escalationPct: 15,
          escalationFrequencyMonths: 36,
          nextEscalationDate: "2030-01-01",
          lockInMonths: 36,
          lockInEndDate: "2030-01-01",
          noticePeriodDays: 90,
          status: "draft",
          renewalStatus: "not_due",
          billingFrequency: "monthly",
          billingDueDay: 5,
          gstRate: 18,
          tdsRate: 10,
          brokeragePaid: 0,
          createdAt: deal.createdAt,
          updatedAt: deal.createdAt
        });
      });
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
    let prop = db.properties.find(p => p.id === propertyId || (body.propertyName && p.name.toLowerCase() === body.propertyName.toLowerCase()));
    if (!prop && (body.propertyName || propertyId)) {
      const propName = body.propertyName || (propertyId.startsWith("PROP-") ? "Commercial Asset 1" : propertyId);
      prop = {
        id: propertyId.startsWith("PROP-") ? propertyId : `PROP-${Date.now()}`,
        orgId: db.organization.id,
        name: propName,
        type: "Commercial Office",
        address: body.propertyAddress || "Commercial Hub",
        city: body.city || "Mumbai",
        state: "Maharashtra",
        microMarket: body.city || "CBD",
        pincode: "400001",
        grade: "A",
        totalArea: Number(chargeableArea) * 2 || 50000,
        chargeableArea: Number(chargeableArea) * 2 || 50000,
        occupancyTargetPct: 90,
      };
      db.properties.push(prop);
    } else if (!prop) {
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
