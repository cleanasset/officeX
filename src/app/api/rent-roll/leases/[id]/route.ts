import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getRentRollDb();
    const lease = db.leases.find(l => l.id === id || l.leaseCode === id || l.id.toLowerCase() === id.toLowerCase());

    if (!lease) {
      return NextResponse.json({ error: `Lease with ID/code '${id}' not found` }, { status: 404 });
    }

    const computed = computeFullLeaseSummary({
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

    const invoices = db.invoices.filter(i => i.leaseId === lease.id);
    const collections = db.collections.filter(c => c.leaseId === lease.id);
    const escalations = db.escalations.filter(e => e.leaseId === lease.id);
    const notices = db.notices.filter(n => n.leaseId === lease.id);

    return NextResponse.json({
      ...lease,
      computed,
      invoices,
      collections,
      escalations,
      notices,
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/leases/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getRentRollDb();
    const index = db.leases.findIndex(l => l.id === id || l.leaseCode === id);

    if (index === -1) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    const oldLease = db.leases[index];
    const updated = {
      ...oldLease,
      ...body,
      updatedAt: new Date().toISOString()
    };

    const summary = computeFullLeaseSummary({
      chargeableArea: updated.chargeableArea,
      carpetArea: updated.carpetArea,
      monthlyRent: updated.monthlyRent,
      camRatePsf: updated.camRatePsf,
      utilityFixedMonthly: updated.utilityFixedMonthly,
      parkingChargesMonthly: updated.parkingChargesMonthly,
      signageChargesMonthly: updated.signageChargesMonthly,
      otherChargesMonthly: updated.otherChargesMonthly,
      startDate: updated.startDate,
      endDate: updated.endDate,
      lockInMonths: updated.lockInMonths,
      escalationPct: updated.escalationPct,
      escalationFrequencyMonths: updated.escalationFrequencyMonths,
      securityDepositMonths: updated.securityDepositMonths,
      securityDepositPaid: updated.securityDepositPaid,
    });

    updated.baseRentPsf = summary.baseRentPsf;
    updated.camMonthly = summary.camMonthly;
    updated.totalMonthlyGross = summary.totalMonthlyGross;
    updated.annualRentGross = summary.annualRentGross;
    updated.securityDepositAmount = summary.securityDepositRequired;

    db.leases[index] = updated;

    recordAuditLog({
      leaseId: updated.id,
      entityName: "Lease",
      action: "UPDATE_LEASE",
      oldValues: oldLease,
      newValues: updated,
      changedBy: "Property Manager"
    });

    saveRentRollDb(db);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/rent-roll/leases/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getRentRollDb();
    const index = db.leases.findIndex(l => l.id === id || l.leaseCode === id);

    if (index === -1) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    const [deleted] = db.leases.splice(index, 1);

    recordAuditLog({
      leaseId: deleted.id,
      entityName: "Lease",
      action: "DELETE_LEASE",
      oldValues: deleted,
      changedBy: "Admin"
    });

    saveRentRollDb(db);

    return NextResponse.json({ success: true, message: `Lease ${deleted.leaseCode} deleted successfully` });
  } catch (error: any) {
    console.error("DELETE /api/rent-roll/leases/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
