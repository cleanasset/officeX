import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, DealEntity, LeaseEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const db = getRentRollDb();

    let deals = db.deals || [];
    if (propertyId && propertyId !== "ALL") {
      deals = deals.filter(d => d.propertyId === propertyId);
    }

    return NextResponse.json(deals);
  } catch (error: any) {
    console.error("GET /api/rent-roll/deals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const db = getRentRollDb();

    // Action: Convert Won Deal to Contract (RR-CON-07)
    if (action === "convert_to_contract") {
      const { dealId } = body;
      const deal = db.deals.find(d => d.id === dealId);
      if (!deal) {
        return NextResponse.json({ error: "Deal not found" }, { status: 404 });
      }

      const prop = db.properties.find(p => p.id === deal.propertyId);
      const monthlyRent = Math.round(deal.proposedAreaSqft * deal.targetRentPsf);
      const newContractId = `LEASE-CONV-${Date.now()}`;

      const newLease: LeaseEntity = {
        id: newContractId,
        orgId: db.organization.id,
        clientAccountId: prop?.clientAccountId || "CA-SELF",
        billingEntityId: prop?.billingEntityId || "BE-APX-01",
        propertyId: deal.propertyId,
        propertyName: prop?.name || "Commercial Property",
        spaceId: deal.proposedSpaceId || "SPC-NEW",
        unitNumber: "Proposed Unit",
        floorNumber: 1,
        tenantId: `TEN-${Date.now()}`,
        tenantName: deal.prospectName,
        leaseCode: `CNT-${Date.now().toString().slice(-4)}`,
        startDate: deal.targetCommencementDate || "2027-01-01",
        endDate: "2032-12-31",
        fitoutPeriodDays: 30,
        rentFreePeriodDays: 30,
        carpetArea: Math.round(deal.proposedAreaSqft * 0.8),
        chargeableArea: deal.proposedAreaSqft,
        monthlyRent,
        baseRentPsf: deal.targetRentPsf,
        camRatePsf: 25,
        camMonthly: Math.round(deal.proposedAreaSqft * 25),
        utilityFixedMonthly: 25000,
        parkingChargesMonthly: 30000,
        signageChargesMonthly: 10000,
        otherChargesMonthly: 0,
        totalMonthlyGross: monthlyRent + Math.round(deal.proposedAreaSqft * 25),
        annualRentGross: (monthlyRent + Math.round(deal.proposedAreaSqft * 25)) * 12,
        securityDepositMonths: 6,
        securityDepositAmount: monthlyRent * 6,
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
        brokerName: deal.brokerName,
        brokeragePaid: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      deal.stage = "won";
      deal.convertedContractId = newContractId;

      db.leases.unshift(newLease);
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "Deal",
        action: "CONVERT_DEAL_TO_CONTRACT",
        newValues: { dealId, convertedContractId: newContractId, tenantName: deal.prospectName },
        changedBy: "Leasing Director"
      });

      return NextResponse.json({ success: true, contract: newLease, deal });
    }

    // Default Action: Create new prospect deal
    const {
      propertyId,
      prospectName,
      industry,
      contactPerson,
      contactEmail,
      contactPhone,
      proposedAreaSqft,
      targetRentPsf,
      targetCommencementDate,
      stage = "qualified",
      probabilityPct = 50,
      brokerName
    } = body;

    if (!propertyId || !prospectName) {
      return NextResponse.json({ error: "propertyId and prospectName are required." }, { status: 400 });
    }

    const prop = db.properties.find(p => p.id === propertyId);
    const newDeal: DealEntity = {
      id: `DEAL-${Date.now()}`,
      orgId: db.organization.id,
      propertyId,
      propertyName: prop?.name,
      prospectName,
      industry,
      contactPerson,
      contactEmail,
      contactPhone,
      proposedAreaSqft: Number(proposedAreaSqft) || 10000,
      targetRentPsf: Number(targetRentPsf) || 200,
      targetCommencementDate: targetCommencementDate || "2027-01-01",
      stage,
      probabilityPct: Number(probabilityPct) || 50,
      brokerName,
      createdAt: new Date().toISOString()
    };

    db.deals.unshift(newDeal);
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "Deal",
      action: "CREATE_PROSPECT_DEAL",
      newValues: { prospectName, propertyId, targetRentPsf },
      changedBy: "Leasing Team"
    });

    return NextResponse.json(newDeal, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/deals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
