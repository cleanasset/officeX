import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";
import { calculateEscalationRent, computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties.filter(p => {
      const lower = (p.name || "").toLowerCase().trim();
      return lower !== "fortune sky" && lower !== "apex horizon tower" && lower !== "signature tower b";
    });

    if (ownerEmail) {
      const owned = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
      if (owned.length > 0) {
        properties = owned;
      }
    }

    const validPropIds = new Set(properties.map(p => p.id));
    const validLeaseIds = new Set(db.leases.filter(l => validPropIds.has(l.propertyId)).map(l => l.id));
    let escalations = db.escalations.filter(e => validLeaseIds.has(e.leaseId));

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
    const { escalationId, leaseId, action, notes, customNewRent } = body; // action = "apply" | "waive" | "dispute"

    if ((!escalationId && !leaseId) || !action) {
      return NextResponse.json({ error: "Missing escalationId/leaseId or action" }, { status: 400 });
    }

    const db = getRentRollDb();
    let esc = db.escalations.find(e => (escalationId && e.id === escalationId) || (leaseId && e.leaseId === leaseId && e.status === "pending"));
    
    let lease = db.leases.find(l => (esc && l.id === esc.leaseId) || (leaseId && l.id === leaseId));
    if (!lease) {
      return NextResponse.json({ error: "Associated lease not found" }, { status: 404 });
    }

    if (!esc) {
      // Create on-the-fly escalation record for this lease
      const escalationMultiplier = 1 + (lease.escalationPct || 15) / 100;
      const targetNewRent = customNewRent ? Number(customNewRent) : Math.round(lease.monthlyRent * escalationMultiplier);
      esc = {
        id: `ESC-${Date.now()}`,
        leaseId: lease.id,
        leaseCode: lease.leaseCode,
        tenantName: lease.tenantName,
        propertyName: lease.propertyName,
        escalationDate: lease.nextEscalationDate || new Date().toISOString().split('T')[0],
        previousRent: lease.monthlyRent,
        newRent: targetNewRent,
        escalationPct: lease.escalationPct || 15,
        calculatedIncrease: targetNewRent - lease.monthlyRent,
        status: "pending",
        notes: "On-demand compounding escalation"
      };
      db.escalations.push(esc);
    }

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
