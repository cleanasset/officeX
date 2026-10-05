import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog, LeaseEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary, generateContractRentSteps, calculateInvoice } from "@/lib/rent-roll-engine";
import { getCleanUserEmail } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const tenantId = searchParams.get("tenantId");
    const search = searchParams.get("search")?.toLowerCase();
    const asOfDate = searchParams.get("asOfDate");
    const direction = searchParams.get("direction"); // receivable vs payable
    const contractType = searchParams.get("contractType");
    let ownerEmail = getCleanUserEmail(searchParams.get("ownerEmail"));

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = getCleanUserEmail(cookieStore.get("officex_user_email")?.value);
      } catch {}
    }

    const db = getRentRollDb();
    const viewMode = searchParams.get("viewMode") || "current"; // current, contracted, forecast
    const clientAccountId = searchParams.get("clientAccountId");
    const billingEntityId = searchParams.get("billingEntityId");

    let properties = db.properties || [];
    if (ownerEmail) {
      properties = properties.filter(p => 
        (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || 
        p.ownerUserId === ownerEmail
      );
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let leases = (db.leases || []).filter(l => validPropIds.has(l.propertyId));

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
    if (direction && direction !== "ALL") {
      leases = leases.filter(l => (l.direction || "receivable") === direction);
    }
    if (contractType && contractType !== "ALL") {
      leases = leases.filter(l => (l.contractType || "lease_deed") === contractType);
    }

    // As-Of Date filtering (RR-VW-03)
    if (asOfDate) {
      leases = leases.filter(l => l.startDate <= asOfDate && l.endDate >= asOfDate);
    }

    // View Mode Handling (RR-VW-03)
    if (viewMode === "current") {
      leases = leases.filter(l => l.status === "active" || l.status === "under_notice" || l.status === "holdover");
    } else if (viewMode === "contracted") {
      leases = leases.filter(l => l.status !== "terminated" && l.status !== "expired");
    } else if (viewMode === "forecast") {
      const activeDeals = (db.deals || []).filter(d => {
        if (!validPropIds.has(d.propertyId) || d.stage === "lost") return false;
        if (asOfDate) {
          const commDate = d.targetCommencementDate || "2027-01-01";
          if (commDate > asOfDate) return false;
        }
        return true;
      });
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
          direction: "receivable",
          contractType: "lease_deed",
          approvalStatus: "draft",
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

      const tenantInvoices = (db.invoices || []).filter(inv => inv.leaseId === lease.id);
      const totalOutstanding = tenantInvoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
      const overdueInvoices = tenantInvoices.filter(inv => inv.status === "overdue");

      return {
        ...lease,
        direction: lease.direction || "receivable",
        contractType: lease.contractType || "lease_deed",
        approvalStatus: lease.approvalStatus || (lease.status === "active" ? "active" : "draft"),
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
    const db = getRentRollDb();

    // Maker-Checker approval actions (RR-AUD-04, UAT-66)
    if (body.action === "approve") {
      const targetId = body.id || body.leaseId;
      const target = db.leases.find(l => l.id === targetId || l.leaseCode === targetId);
      if (!target) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }

      // Segregation of duties: Maker cannot approve own change (UAT-66)
      const checker = (body.approvedBy || "Chief Real Estate Officer").toLowerCase().trim();
      const maker = (target.createdBy || target.makerId || "").toLowerCase().trim();
      if (checker && maker && checker === maker) {
        return NextResponse.json({
          error: "Maker cannot approve their own financial terms change (Segregation of Duties / RR-AUD-04, UAT-66). An independent commercial checker must approve.",
          code: "MAKER_CHECKER_VIOLATION",
          maker,
          checker
        }, { status: 403 });
      }

      target.approvalStatus = "approved";
      target.status = "active";
      target.approvedBy = body.approvedBy || "Chief Real Estate Officer";
      target.approvedAt = new Date().toISOString();
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: "APPROVE_CONTRACT",
        newValues: { contractCode: target.leaseCode, approvedBy: target.approvedBy },
        changedBy: target.approvedBy || "Chief Real Estate Officer"
      });

      return NextResponse.json({ success: true, message: `Contract ${target.leaseCode} approved and activated.`, lease: target });
    }

    // Action: Upload Contract Document Version (RR-CON-04, UAT-22, UAT-23, Table 76)
    if (body.action === "add_document" || body.action === "upload_document") {
      const targetId = body.id || body.leaseId;
      const { documentType = "agreement", title, fileName, fileUrl = "/sample-lease-agreement.pdf", isExecuted = false, uploadedBy } = body;
      const { addContractDocumentVersion } = require("@/lib/rent-roll-store");
      try {
        const result = addContractDocumentVersion({
          leaseId: targetId,
          documentType,
          title: title || fileName,
          fileName: fileName || "Executed_Contract.pdf",
          fileUrl,
          uploadedBy: uploadedBy || "Commercial Executive",
          isExecuted
        });

        return NextResponse.json({
          success: true,
          message: `Uploaded document version ${result.document.versionNumber} for ${result.lease.leaseCode} (RR-CON-04, UAT-22, UAT-23).`,
          document: result.document,
          lease: result.lease
        }, { status: 201 });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
    }

    if (body.action === "reject") {
      const targetId = body.id || body.leaseId;
      const target = db.leases.find(l => l.id === targetId);
      if (!target) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }
      target.approvalStatus = "rejected";
      target.status = "draft";
      target.approvalRemarks = body.remarks || "Terms rejected by checker";
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: "REJECT_CONTRACT",
        newValues: { contractCode: target.leaseCode, remarks: target.approvalRemarks },
        changedBy: "Maker-Checker Approver"
      });

      return NextResponse.json({ success: true, message: `Contract ${target.leaseCode} rejected.`, lease: target });
    }

    // Contract Lifecycle Transitions (§4.6, Table 76: POST /contracts/{id}/transition)
    if (body.action === "transition") {
      const targetId = body.id || body.leaseId;
      const target = db.leases.find(l => l.id === targetId || l.leaseCode === targetId);
      if (!target) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }

      const transitionType = body.transition; // activate, serve_notice, renew, terminate, cancel
      const remarks = body.remarks || "";

      switch (transitionType) {
        case "activate":
          target.status = "active";
          target.approvalStatus = "approved";
          break;
        case "serve_notice":
          target.status = "under_notice";
          target.renewalStatus = "vacating";
          target.terminationDate = body.effectiveDate || target.endDate;
          break;
        case "renew":
          target.renewalStatus = "renewed";
          if (body.newEndDate) target.endDate = body.newEndDate;
          if (body.newMonthlyRent) {
            target.monthlyRent = Number(body.newMonthlyRent);
            target.baseRentPsf = Math.round((target.monthlyRent / target.chargeableArea) * 100) / 100;
          }
          break;
        case "terminate":
          target.status = "terminated";
          target.terminationDate = body.terminationDate || new Date().toISOString().split('T')[0];
          target.terminationReason = remarks || "Early Contract Termination";
          break;
        case "cancel":
          target.status = "draft";
          target.approvalStatus = "draft";
          break;
        default:
          return NextResponse.json({ error: `Unsupported transition: ${transitionType}` }, { status: 400 });
      }

      target.updatedAt = new Date().toISOString();
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: `TRANSITION_${transitionType.toUpperCase()}`,
        newValues: { contractCode: target.leaseCode, transitionType, remarks },
        changedBy: body.changedBy || "Commercial Operations"
      });

      return NextResponse.json({
        success: true,
        message: `Contract ${target.leaseCode} transitioned via ${transitionType}.`,
        lease: target
      });
    }

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
      notes,
      direction = "receivable",
      contractType = "lease_deed",
      billingModel = "area",
      spacesCovered = [],
      concessions = [],
      depositTransactions = [],
      contractClauses = [],
      approvalStatus,
      hvacModel = "cam_included",
      hvacWorkingHours = "08:00 AM - 08:00 PM (Mon-Sat)",
      hvacOvertimeRate = 0,
      hvacFixedMonthly = 0,
      electricityBillingType = "sub_metered",
      powerLoadKva = 0,
      dgBackupType = "100_percent",
      dgRatePerUnit = 0,
      waterBillingType = "cam_included",
      utilityTerms,
      utilityComponents = [],
    } = body;

    if (!propertyId || !tenantName || !startDate || !endDate || !monthlyRent || !chargeableArea) {
      return NextResponse.json({ error: "Missing required contract fields (property, tenant, dates, rent, area)" }, { status: 400 });
    }

    let prop = db.properties.find(p => p.id === propertyId || (body.propertyName && p.name.toLowerCase() === body.propertyName.toLowerCase()));
    if (!prop && (body.propertyName || propertyId)) {
      const propName = body.propertyName || (propertyId.startsWith("PROP-") ? "Commercial Asset 1" : propertyId);
      prop = {
        id: propertyId.startsWith("PROP-") ? propertyId : `PROP-${Date.now()}`,
        orgId: db.organization.id,
        name: propName,
        type: "Commercial Office",
        address: body.propertyAddress || db.organization.address || "Commercial Hub",
        city: body.city || db.organization.city || "Mumbai",
        state: body.state || db.organization.state || "Maharashtra",
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
        legalName: body.legalName || `${tenantName} India Pvt Ltd`,
        industry: body.industry || "Commercial Tenant",
        pan: (body.pan || body.tenantPan || "").toUpperCase().trim(),
        gstin: (body.gstin || body.tenantGstin || "").toUpperCase().trim(),
        contactPerson: (body.contactPerson || body.tenantContactPerson || "").trim(),
        contactEmail: (body.contactEmail || body.tenantEmail || "").trim(),
        contactPhone: (body.contactPhone || body.tenantPhone || "").trim(),
        billingAddress: body.billingAddress || prop.address || "",
        billingCity: body.billingCity || prop.city || "",
        billingState: body.billingState || prop.state || "",
        billingPincode: body.billingPincode || prop.pincode || "",
        status: "active",
        creditLimit: monthlyRent * 12,
        paymentTermsDays: 15,
        createdAt: new Date().toISOString().split('T')[0]
      };
      db.tenants.push(tenantObj);
    } else {
      if (body.contactPerson) tenantObj.contactPerson = body.contactPerson.trim();
      if (body.contactEmail || body.tenantEmail) tenantObj.contactEmail = (body.contactEmail || body.tenantEmail).trim();
      if (body.contactPhone || body.tenantPhone) tenantObj.contactPhone = (body.contactPhone || body.tenantPhone).trim();
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
    const generatedLeaseCode = leaseCode || `CTR-${prop.propertyCode || "PRP"}-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveApprovalStatus = approvalStatus || (db.config?.makerCheckerLease ? "submitted" : "active");
    const effectiveStatus = effectiveApprovalStatus === "submitted" ? "draft" : "active";

    const targetSpaceId = spaceId || `SPC-${prop.id.slice(-4)}-${unitNumber || "101"}`;

    const newLease: LeaseEntity = {
      id: newLeaseId,
      orgId: db.organization.id,
      clientAccountId: prop.clientAccountId || "CA-SELF",
      billingEntityId: prop.billingEntityId || db.billingEntities[0]?.id || "",
      propertyId: prop.id,
      propertyName: prop.name,
      spaceId: targetSpaceId,
      unitNumber: unitNumber || "Suite Commercial",
      floorNumber: Number(floorNumber || 1),
      tenantId: tenantObj.id,
      tenantName: tenantObj.tradeName,
      leaseCode: generatedLeaseCode,
      direction: direction as any,
      contractType: contractType as any,
      approvalStatus: effectiveApprovalStatus as any,
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
      status: effectiveStatus as any,
      renewalStatus: "not_due",
      billingFrequency: billingFrequency || "monthly",
      billingModel: billingModel as any,
      billingDueDay: Number(billingDueDay || 5),
      gstRate: 18,
      tdsRate: 10,
      brokerName: brokerName || "Direct / Internal",
      brokeragePaid: 0,
      notes: notes || "Standard Commercial Contract",
      createdBy: body.createdBy || "Leasing Executive",
      makerId: body.makerId || body.createdBy || "USR-MAKER-01",
      spacesCovered: spacesCovered.length > 0 ? spacesCovered : [{ spaceId: targetSpaceId, unitNumber: unitNumber || "Suite", areaSqft: numChargeable, floorNumber: Number(floorNumber || 1) }],
      concessions,
      depositTransactions,
      contractClauses,
      hvacModel,
      hvacWorkingHours,
      hvacOvertimeRate: Number(hvacOvertimeRate || 0),
      hvacFixedMonthly: Number(hvacFixedMonthly || 0),
      electricityBillingType,
      powerLoadKva: Number(powerLoadKva || 0),
      dgBackupType,
      dgRatePerUnit: Number(dgRatePerUnit || 0),
      waterBillingType,
      utilityTerms: utilityTerms || {
        hvacModel,
        hvacWorkingHours,
        hvacOvertimeRate: Number(hvacOvertimeRate || 0),
        hvacFixedMonthly: Number(hvacFixedMonthly || 0),
        electricityBillingType,
        powerLoadKva: Number(powerLoadKva || 0),
        dgBackupType,
        dgRatePerUnit: Number(dgRatePerUnit || 0),
        waterBillingType,
      },
      utilityComponents: Array.isArray(utilityComponents) ? utilityComponents : [],
      hasPendingDocument: !body.agreementDocumentName,
      agreementDocumentPending: !body.agreementDocumentName,
      documents: body.agreementDocumentName ? [
        {
          id: `DOC-${Date.now()}`,
          contractId: newLeaseId,
          documentType: "agreement",
          title: `Executed ${contractType} - ${tenantObj.tradeName}`,
          versionNumber: 1,
          fileUrl: "/sample-lease-agreement.pdf",
          fileName: body.agreementDocumentName,
          fileSizeBytes: 2450000,
          status: body.agreementStatus || "executed",
          isExecuted: body.agreementStatus === "executed",
          executionDate: startDate,
          uploadedBy: body.createdBy || "Org Super Admin",
          createdAt: new Date().toISOString()
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Auto-generate dated stepped escalations
    const initialSteps = generateContractRentSteps(
      startDate,
      endDate,
      summary.baseRentPsf,
      numChargeable,
      numEscPct,
      numEscFreq
    ).map(cs => ({
      id: `STEP-${newLeaseId}-${cs.stepNumber}`,
      contractId: newLeaseId,
      stepNumber: cs.stepNumber,
      effectiveDate: cs.effectiveDate,
      baseRatePsf: cs.baseRatePsf,
      monthlyBaseRent: cs.monthlyBaseRent,
      escalationPct: cs.escalationPct,
      stepType: "fixed_pct" as const,
      status: cs.status
    }));
    newLease.rentSteps = initialSteps;

    // Update target space status in inventory
    const targetSpace = db.spaces.find(s => s.id === targetSpaceId || s.unitNumber === unitNumber);
    if (targetSpace) {
      targetSpace.status = "occupied";
      targetSpace.currentLeaseId = newLease.id;
    } else {
      // Create space in inventory
      db.spaces.push({
        id: targetSpaceId,
        propertyId: prop.id,
        spaceCode: `${prop.propertyCode || "PRP"}-${unitNumber || "101"}`,
        buildingName: prop.name,
        floorNumber: Number(floorNumber || 1),
        unitNumber: unitNumber || "Suite",
        spaceType: "office",
        carpetArea: numCarpet,
        chargeableArea: numChargeable,
        standardRatePsf: summary.baseRentPsf,
        standardCamPsf: numCamPsf,
        standardMarketRentPsf: summary.baseRentPsf,
        potentialMonthlyRent: numMonthlyRent,
        daysVacant: 0,
        status: "occupied",
        currentLeaseId: newLease.id
      });
    }

    db.leases.unshift(newLease);

    // Auto-generate current month's opening invoice so tenant & owner can immediately view, settle, and pay it
    try {
      const today = new Date();
      const invoiceDateStr = today.toISOString().split('T')[0];
      const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const dueDateStr = dueDate.toISOString().split('T')[0];
      const fyYear = today.getMonth() >= 3 ? `${today.getFullYear()}-${today.getFullYear() + 1}` : `${today.getFullYear() - 1}-${today.getFullYear()}`;
      const invNum = `INV-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const calc = calculateInvoice({
        baseRent: newLease.monthlyRent,
        camCharges: newLease.camMonthly || 0,
        utilityCharges: newLease.utilityFixedMonthly || 0,
        otherCharges: newLease.otherChargesMonthly || 0,
        gstRate: newLease.gstRate || 18,
        tdsRate: newLease.tdsRate || 10,
        dueDate: dueDateStr,
        amountPaid: 0
      });

      const initialInvoice: any = {
        id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orgId: db.organization.id,
        billingEntityId: newLease.billingEntityId || db.billingEntities[0]?.id || "",
        clientAccountId: newLease.clientAccountId || "CA-SELF",
        leaseId: newLease.id,
        leaseCode: newLease.leaseCode,
        propertyId: newLease.propertyId,
        propertyName: newLease.propertyName,
        tenantId: newLease.tenantId,
        tenantName: newLease.tenantName,
        invoiceNumber: invNum,
        fyYear,
        invoiceDate: invoiceDateStr,
        dueDate: dueDateStr,
        periodStart: invoiceDateStr,
        periodEnd: dueDateStr,
        invoiceType: "consolidated",
        baseRent: newLease.monthlyRent,
        camCharges: newLease.camMonthly || 0,
        utilityCharges: newLease.utilityFixedMonthly || 0,
        otherCharges: newLease.otherChargesMonthly || 0,
        subtotal: calc.subtotal,
        gstRate: 18,
        gstAmount: calc.gstAmount,
        grossTotal: calc.grossTotal,
        tdsDeducted: calc.tdsDeducted,
        netPayable: calc.netPayable,
        amountPaid: 0,
        balanceDue: calc.netPayable,
        status: "issued",
        lineItems: [
          {
            id: `LINE-${Date.now()}-1`,
            chargeType: "base_rent",
            description: `Commercial Office Rent — ${newLease.unitNumber}`,
            quantity: newLease.chargeableArea,
            rate: newLease.baseRentPsf,
            amount: newLease.monthlyRent,
            gstRate: 18,
            sacCode: "997212"
          },
          ...(newLease.camMonthly ? [{
            id: `LINE-${Date.now()}-2`,
            chargeType: "cam",
            description: "Common Area Maintenance (CAM)",
            quantity: newLease.chargeableArea,
            rate: newLease.camRatePsf,
            amount: newLease.camMonthly,
            gstRate: 18,
            sacCode: "997212"
          }] : [])
        ],
        createdAt: new Date().toISOString()
      };

      if (!db.invoices) db.invoices = [];
      db.invoices.unshift(initialInvoice);
    } catch (invErr) {
      console.warn("Auto-invoice creation note:", invErr);
    }

    saveRentRollDb(db);

    recordAuditLog({
      entityName: "Contract",
      action: "CREATE_CONTRACT",
      newValues: {
        code: newLease.leaseCode,
        tenant: newLease.tenantName,
        property: prop.name,
        contractType: newLease.contractType,
        direction: newLease.direction,
        monthlyRent: newLease.monthlyRent
      },
      changedBy: "Org Admin"
    });

    return NextResponse.json({ success: true, lease: newLease });
  } catch (error: any) {
    console.error("POST /api/rent-roll/leases error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leaseId, action, document, approvedBy, rejectionReason } = body;

    if (!leaseId) {
      return NextResponse.json({ error: "Missing leaseId" }, { status: 400 });
    }

    const db = getRentRollDb();
    const leaseIdx = db.leases.findIndex(l => l.id === leaseId);
    if (leaseIdx < 0) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    const targetLease = db.leases[leaseIdx];

    if (action === "add_document") {
      if (!targetLease.documents) targetLease.documents = [];

      const docObj = {
        id: `DOC-${Date.now()}`,
        contractId: leaseId,
        documentType: document?.documentType || "agreement",
        title: document?.title || `Executed Lease Agreement - ${targetLease.tenantName}`,
        versionNumber: targetLease.documents.length + 1,
        fileUrl: document?.fileUrl || "/sample-lease-agreement.pdf",
        fileName: document?.fileName || `${targetLease.leaseCode}_Executed_Deed.pdf`,
        fileSizeBytes: document?.fileSizeBytes || 2450000,
        status: "executed",
        isExecuted: true,
        executionDate: new Date().toISOString().split("T")[0],
        uploadedBy: document?.uploadedBy || approvedBy || "Property Owner",
        createdAt: new Date().toISOString()
      };

      targetLease.documents.unshift(docObj as any);
      targetLease.hasPendingDocument = false;
      targetLease.agreementDocumentPending = false;
      targetLease.status = "active";

      // If user reconciled terms from the uploaded deed, update lease financials
      if (body.updateContractTerms) {
        const u = body.updateContractTerms;
        if (u.monthlyRent) {
          targetLease.monthlyRent = Number(u.monthlyRent);
          targetLease.totalMonthlyGross = Number(u.monthlyRent) + (targetLease.camMonthly || 0);
          targetLease.annualRentGross = targetLease.totalMonthlyGross * 12;
          if (targetLease.chargeableArea && targetLease.chargeableArea > 0) {
            targetLease.baseRentPsf = Math.round((targetLease.monthlyRent / targetLease.chargeableArea) * 100) / 100;
          }
        }
        if (u.securityDeposit) {
          targetLease.securityDepositPaid = Number(u.securityDeposit);
          targetLease.securityDepositAmount = Number(u.securityDeposit);
        }
        if (u.camMonthly !== undefined) {
          targetLease.camMonthly = Number(u.camMonthly);
          targetLease.totalMonthlyGross = (targetLease.monthlyRent || 0) + Number(u.camMonthly);
          targetLease.annualRentGross = targetLease.totalMonthlyGross * 12;
          if (targetLease.chargeableArea && targetLease.chargeableArea > 0) {
            targetLease.camRatePsf = Math.round((targetLease.camMonthly / targetLease.chargeableArea) * 100) / 100;
          }
        }
        if (u.chargeableArea) {
          targetLease.chargeableArea = Number(u.chargeableArea);
          if (targetLease.monthlyRent && targetLease.chargeableArea > 0) {
            targetLease.baseRentPsf = Math.round((targetLease.monthlyRent / targetLease.chargeableArea) * 100) / 100;
          }
        }
        if (u.escalationPct) targetLease.escalationPct = Number(u.escalationPct);
        if (u.lockInMonths) targetLease.lockInMonths = Number(u.lockInMonths);
        if (u.tenantName) {
          const oldName = targetLease.tenantName;
          targetLease.tenantName = u.tenantName.trim();
          const t = db.tenants.find(ten => ten.id === targetLease.tenantId || ten.tradeName === oldName);
          if (t) {
            t.tradeName = u.tenantName.trim();
            t.legalName = u.tenantName.trim();
          }
        }
      }

      // Also resolve any pending alert for missing document
      if (db.alerts) {
        db.alerts = db.alerts.filter(a => !(a.title.includes(targetLease.leaseCode) && a.title.includes("Document")));
      }

      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: "ADD_DOCUMENT",
        newValues: {
          code: targetLease.leaseCode,
          documentTitle: docObj.title,
          fileName: docObj.fileName
        },
        changedBy: approvedBy || "Property Owner"
      });

      return NextResponse.json({ success: true, lease: targetLease, document: docObj });
    }

    if (action === "approve") {
      targetLease.approvalStatus = "active";
      targetLease.status = "active";
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: "APPROVE_CONTRACT",
        newValues: { code: targetLease.leaseCode, status: "active" },
        changedBy: approvedBy || "Finance Controller"
      });

      return NextResponse.json({ success: true, lease: targetLease });
    }

    if (action === "reject") {
      targetLease.approvalStatus = "rejected";
      targetLease.status = "draft";
      targetLease.notes = `${targetLease.notes || ""} | Rejected by checker: ${rejectionReason || "Terms verification failed"}`;
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Contract",
        action: "REJECT_CONTRACT",
        newValues: { code: targetLease.leaseCode, reason: rejectionReason },
        changedBy: approvedBy || "Finance Controller"
      });

      return NextResponse.json({ success: true, lease: targetLease });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/rent-roll/leases error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
