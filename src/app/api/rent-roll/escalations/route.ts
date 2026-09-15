import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";
import { calculateEscalationRent, computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");

    const db = getRentRollDb();
    let escalations = db.escalations;

    if (status && status !== "ALL") {
      escalations = escalations.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    if (propertyId && propertyId !== "ALL") {
      const leaseIds = db.leases.filter(l => l.propertyId === propertyId).map(l => l.id);
      escalations = escalations.filter(e => leaseIds.includes(e.leaseId));
    }

    return NextResponse.json(escalations);
  } catch (error: any) {
    console.error("GET /api/rent-roll/escalations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { escalationId, action, notes, customNewRent } = body; // action = "apply" | "waive" | "dispute"

    if (!escalationId || !action) {
      return NextResponse.json({ error: "Missing escalationId or action" }, { status: 400 });
    }

    const db = getRentRollDb();
    const escIndex = db.escalations.findIndex(e => e.id === escalationId);
    if (escIndex === -1) {
      return NextResponse.json({ error: "Escalation record not found" }, { status: 404 });
    }

    const esc = db.escalations[escIndex];
    const leaseIndex = db.leases.findIndex(l => l.id === esc.leaseId);
    if (leaseIndex === -1) {
      return NextResponse.json({ error: "Associated lease not found" }, { status: 404 });
    }

    const lease = db.leases[leaseIndex];

    if (action === "apply") {
      const newRentValue = customNewRent ? Number(customNewRent) : esc.newRent;
      const oldRent = lease.monthlyRent;

      // Update lease financials
      lease.monthlyRent = newRentValue;
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

      lease.baseRentPsf = summary.baseRentPsf;
      lease.totalMonthlyGross = summary.totalMonthlyGross;
      lease.annualRentGross = summary.annualRentGross;
      lease.nextEscalationDate = summary.nextEscalationDate.toISOString().split('T')[0];
      lease.updatedAt = new Date().toISOString();

      esc.status = "applied";
      esc.appliedAt = new Date().toISOString();
      esc.appliedBy = "Property Manager";
      esc.notes = notes || `Escalation applied. New monthly base rent: ₹${newRentValue.toLocaleString('en-IN')}`;

      // Schedule next escalation
      db.escalations.push({
        id: `ESC-${Date.now()}`,
        leaseId: lease.id,
        leaseCode: lease.leaseCode,
        tenantName: lease.tenantName,
        propertyName: lease.propertyName,
        escalationDate: lease.nextEscalationDate,
        previousRent: lease.monthlyRent,
        newRent: summary.nextEscalatedRent,
        escalationPct: lease.escalationPct,
        calculatedIncrease: summary.nextEscalatedRent - lease.monthlyRent,
        status: "pending",
        notes: "Auto-scheduled next cycle escalation"
      });

      recordAuditLog({
        leaseId: lease.id,
        entityName: "Escalation",
        action: "APPLY_ESCALATION",
        oldValues: { monthlyRent: oldRent },
        newValues: { monthlyRent: newRentValue, escalationPct: lease.escalationPct },
        changedBy: "Property Manager"
      });
    } else if (action === "waive") {
      esc.status = "waived";
      esc.notes = notes || "Escalation waived by commercial management agreement.";
      recordAuditLog({
        leaseId: lease.id,
        entityName: "Escalation",
        action: "WAIVE_ESCALATION",
        oldValues: { status: "pending" },
        newValues: { status: "waived", reason: notes },
        changedBy: "Management"
      });
    } else if (action === "dispute") {
      esc.status = "disputed";
      esc.notes = notes || "Tenant disputed escalation terms.";
    }

    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: `Escalation status updated to ${esc.status}`,
      escalation: esc,
      updatedLease: lease
    });
  } catch (error: any) {
    console.error("POST /api/rent-roll/escalations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
