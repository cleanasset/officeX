import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, NoticeEntity } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const db = getRentRollDb();
    return NextResponse.json(db.notices);
  } catch (error: any) {
    console.error("GET /api/rent-roll/notices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leaseId, noticeDate, effectiveDate, noticeReason, initiatedBy, remarks, penaltyAmount } = body;

    if (!leaseId || !noticeDate || !effectiveDate) {
      return NextResponse.json({ error: "Missing required notice parameters" }, { status: 400 });
    }

    const db = getRentRollDb();
    const lease = db.leases.find(l => l.id === leaseId || l.leaseCode === leaseId);
    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Update lease status to under_notice
    lease.status = "under_notice";
    lease.renewalStatus = "vacating";
    lease.terminationDate = effectiveDate;
    lease.terminationReason = `${initiatedBy === "tenant" ? "Tenant Notice" : "Landlord Notice"}: ${noticeReason}`;

    const newNotice: NoticeEntity = {
      id: `NTC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leaseId: lease.id,
      leaseCode: lease.leaseCode,
      tenantName: lease.tenantName,
      propertyName: lease.propertyName,
      noticeDate,
      effectiveDate,
      noticeReason: noticeReason || "lease_expiry",
      initiatedBy: initiatedBy || "tenant",
      remarks: remarks || "",
      penaltyAmount: Number(penaltyAmount || 0),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.notices.unshift(newNotice);

    // Create critical alert
    db.alerts.unshift({
      id: `ALT-${Date.now()}`,
      orgId: db.organization.id,
      alertType: "notice_served",
      title: `Notice Served: ${lease.tenantName}`,
      message: `Vacation notice effective ${effectiveDate} for ${lease.propertyName} (${lease.unitNumber}).`,
      entityType: "lease",
      entityId: lease.id,
      severity: "warning",
      isRead: false,
      triggerDate: noticeDate,
      createdAt: new Date().toISOString()
    });

    recordAuditLog({
      leaseId: lease.id,
      entityName: "LeaseNotice",
      action: "SERVE_NOTICE",
      newValues: { noticeId: newNotice.id, effectiveDate, initiatedBy },
      changedBy: "Property Manager"
    });

    saveRentRollDb(db);

    return NextResponse.json({
      success: true,
      message: "Notice served and lease status updated to Under Notice",
      notice: newNotice,
      updatedLease: lease
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/notices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
