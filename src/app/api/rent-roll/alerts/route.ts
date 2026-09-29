import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb, saveRentRollDb, AlertEntity, RentRollDatabase } from "@/lib/rent-roll-store";

function computeDynamicAlerts(db: RentRollDatabase): AlertEntity[] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const dynamicAlerts: AlertEntity[] = [];

  // 1. Overdue Invoices Cadence Engine (RR-COL-04, UAT-64: 1/7/30/60/90+ days; escalation to owner at 60+)
  for (const inv of db.invoices || []) {
    if (inv.balanceDue > 0 && inv.dueDate && inv.dueDate < todayStr && inv.status !== "cancelled" && inv.status !== "draft") {
      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((now.getTime() - dueTime) / (1000 * 60 * 60 * 24));

      if (diffDays >= 90) {
        dynamicAlerts.push({
          id: `ALT-OD-90-${inv.id}`,
          orgId: db.organization.id,
          propertyId: inv.propertyId,
          alertType: "overdue_90_plus",
          title: `Overdue > 90 Days: ${inv.tenantName}`,
          message: `Invoice ${inv.invoiceNumber} for ₹${inv.balanceDue.toLocaleString('en-IN')} is ${diffDays} days past due (90+ Days Bucket). ESCALATED TO PROPERTY OWNER.`,
          entityType: "invoice",
          entityId: inv.id,
          severity: "critical",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      } else if (diffDays >= 60) {
        dynamicAlerts.push({
          id: `ALT-OD-60-${inv.id}`,
          orgId: db.organization.id,
          propertyId: inv.propertyId,
          alertType: "overdue_60_plus",
          title: `Overdue > 60 Days: ${inv.tenantName}`,
          message: `Invoice ${inv.invoiceNumber} for ₹${inv.balanceDue.toLocaleString('en-IN')} is ${diffDays} days past due (61-90 Days Bucket). ESCALATED TO PROPERTY OWNER.`,
          entityType: "invoice",
          entityId: inv.id,
          severity: "critical",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      } else if (diffDays >= 30) {
        dynamicAlerts.push({
          id: `ALT-OD-30-${inv.id}`,
          orgId: db.organization.id,
          propertyId: inv.propertyId,
          alertType: "overdue_30_plus",
          title: `Overdue > 30 Days: ${inv.tenantName}`,
          message: `Invoice ${inv.invoiceNumber} for ₹${inv.balanceDue.toLocaleString('en-IN')} is ${diffDays} days past due (31-60 Days Bucket).`,
          entityType: "invoice",
          entityId: inv.id,
          severity: "warning",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      } else if (diffDays >= 7) {
        dynamicAlerts.push({
          id: `ALT-OD-7-${inv.id}`,
          orgId: db.organization.id,
          propertyId: inv.propertyId,
          alertType: "overdue_7_plus",
          title: `Overdue 7+ Days: ${inv.tenantName}`,
          message: `Invoice ${inv.invoiceNumber} for ₹${inv.balanceDue.toLocaleString('en-IN')} is ${diffDays} days past due.`,
          entityType: "invoice",
          entityId: inv.id,
          severity: "warning",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      } else if (diffDays >= 1) {
        dynamicAlerts.push({
          id: `ALT-OD-1-${inv.id}`,
          orgId: db.organization.id,
          propertyId: inv.propertyId,
          alertType: "overdue_grace",
          title: `Payment Overdue: ${inv.tenantName}`,
          message: `Invoice ${inv.invoiceNumber} for ₹${inv.balanceDue.toLocaleString('en-IN')} was due on ${inv.dueDate}.`,
          entityType: "invoice",
          entityId: inv.id,
          severity: "info",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      }
    }
  }

  // 2. Upcoming Escalations (RR-ALR-02, UAT-27: 90/60/30 days)
  for (const l of db.leases || []) {
    if (l.nextEscalationDate && (l.status === "active" || l.status === "under_notice")) {
      const escTime = new Date(l.nextEscalationDate).getTime();
      const daysToEsc = Math.floor((escTime - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToEsc >= 0 && daysToEsc <= 90) {
        dynamicAlerts.push({
          id: `ALT-ESC-${l.id}`,
          orgId: db.organization.id,
          propertyId: l.propertyId,
          alertType: "escalation_due",
          title: `Escalation Approaching: ${l.tenantName}`,
          message: `Scheduled rent escalation of ${l.escalationPct}% due in ${daysToEsc} days (${l.nextEscalationDate}) on unit ${l.unitNumber}.`,
          entityType: "lease",
          entityId: l.id,
          severity: daysToEsc <= 30 ? "critical" : "warning",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      }
    }

    // 3. Lease Expiries (RR-ALR-01, UAT-26: 12/6/3/1 months)
    if (l.endDate && (l.status === "active" || l.status === "under_notice")) {
      const expTime = new Date(l.endDate).getTime();
      const daysToExpiry = Math.floor((expTime - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToExpiry >= 0 && daysToExpiry <= 365) {
        dynamicAlerts.push({
          id: `ALT-EXP-${l.id}`,
          orgId: db.organization.id,
          propertyId: l.propertyId,
          alertType: "lease_expiry",
          title: `Lease Expiry Pipeline: ${l.tenantName}`,
          message: `Contract ${l.leaseCode} expires in ${Math.round(daysToExpiry / 30)} months (${l.endDate}). Notice period: ${l.noticePeriodDays} days.`,
          entityType: "lease",
          entityId: l.id,
          severity: daysToExpiry <= 90 ? "critical" : daysToExpiry <= 180 ? "warning" : "info",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      }
    }

    // 4. Deposit Shortfall on Escalation (Table 100)
    if (l.securityDepositAmount && l.securityDepositPaid) {
      const shortfall = l.securityDepositAmount - l.securityDepositPaid;
      if (shortfall > 1000) {
        dynamicAlerts.push({
          id: `ALT-DEP-${l.id}`,
          orgId: db.organization.id,
          propertyId: l.propertyId,
          alertType: "deposit_shortfall",
          title: `Security Deposit Shortfall: ${l.tenantName}`,
          message: `Deposit held (₹${l.securityDepositPaid.toLocaleString('en-IN')}) is below required level (₹${l.securityDepositAmount.toLocaleString('en-IN')}). Shortfall: ₹${shortfall.toLocaleString('en-IN')}.`,
          entityType: "lease",
          entityId: l.id,
          severity: "warning",
          isRead: false,
          triggerDate: todayStr,
          createdAt: now.toISOString()
        });
      }
    }
  }

  return dynamicAlerts;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const severity = searchParams.get("severity");
    const db = getRentRollDb();

    // Compute dynamic live alerts from rent roll, invoices, escalations
    const dynamicAlerts = computeDynamicAlerts(db);

    // Merge with persisted manual alerts
    const persistedAlerts = db.alerts || [];
    const alertMap = new Map<string, AlertEntity>();

    dynamicAlerts.forEach(a => alertMap.set(a.id, a));
    persistedAlerts.forEach(a => {
      if (!alertMap.has(a.id)) alertMap.set(a.id, a);
    });

    let allAlerts = Array.from(alertMap.values());

    if (propertyId && propertyId !== "ALL") {
      allAlerts = allAlerts.filter(a => !a.propertyId || a.propertyId === propertyId);
    }
    if (severity && severity !== "ALL") {
      allAlerts = allAlerts.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
    }

    return NextResponse.json(allAlerts);
  } catch (error: any) {
    console.error("GET /api/rent-roll/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { alertId, markAllRead } = body;
    const db = getRentRollDb();

    if (!db.alerts) db.alerts = [];

    if (markAllRead) {
      db.alerts.forEach(a => a.isRead = true);
    } else if (alertId) {
      const target = db.alerts.find(a => a.id === alertId);
      if (target) {
        target.isRead = true;
      } else {
        db.alerts.push({
          id: alertId,
          orgId: db.organization.id,
          alertType: "acknowledged",
          title: "Acknowledged",
          message: "Alert marked read",
          entityType: "lease",
          severity: "info",
          isRead: true,
          triggerDate: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        });
      }
    }

    saveRentRollDb(db);
    return NextResponse.json({ success: true, message: "Alerts updated." });
  } catch (error: any) {
    console.error("PATCH /api/rent-roll/alerts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

