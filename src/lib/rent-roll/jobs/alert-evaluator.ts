import { db } from "@/db";
import { contract, space, building, invoice, payment, occupant, dispute } from "@/db/rent-roll-schema";
import { sql, eq, and, lte, gte } from "drizzle-orm";

export interface AlertInstance {
  code: string;
  name: string;
  category: "contract" | "billing" | "collection" | "compliance";
  severity: "critical" | "action" | "info";
  entity_id: string;
  entity_code: string;
  occupant_name: string | null;
  message: string;
  target_link: string;
  auto_resolves_when: string;
  channels_notified: string[];
}

export interface AlertEvaluationResult {
  evaluation_time: string;
  total_evaluated: number;
  critical_count: number;
  action_count: number;
  info_count: number;
  alerts: AlertInstance[];
}

/**
 * Nightly Alert Engine — §9 & RR-AL-01..22
 * Evaluates live database records at nightly intervals.
 * Zero mock prefeeded data: strictly evaluates real contracts, invoices, and spaces.
 */
export async function runNightlyAlertEvaluation(orgId?: string): Promise<AlertEvaluationResult> {
  const alerts: AlertInstance[] = [];
  const now = new Date();
  const nowStr = now.toISOString().split("T")[0];
  const ninetyDaysOut = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    // 1. Fetch real active contracts
    const contractConditions = [sql`${contract.deleted_at} IS NULL`];
    if (orgId) contractConditions.push(eq(contract.org_id, orgId));

    const contracts = await db
      .select({
        id: contract.id,
        code: contract.contract_code,
        status: contract.contract_status,
        startDate: contract.start_date,
        endDate: contract.end_date,
        lockInDays: contract.lock_in_period_days,
        occupantId: contract.occupant_id,
        occupantName: occupant.occupant_name,
        spaceId: contract.space_id,
      })
      .from(contract)
      .leftJoin(occupant, eq(contract.occupant_id, occupant.id))
      .where(and(...contractConditions));

    contracts.forEach((c) => {
      // AL-01: Contract expiry within 90 days
      if (c.status === "active" && c.endDate && c.endDate <= ninetyDaysOut && c.endDate >= nowStr) {
        alerts.push({
          code: "AL-01",
          name: "Contract Expiry Cadence",
          category: "contract",
          severity: "action",
          entity_id: c.id,
          entity_code: c.code || "CNT",
          occupant_name: c.occupantName || "Occupant",
          message: `Lease for ${c.occupantName || "Occupant"} expires on ${c.endDate}. Renewal or exit negotiation required.`,
          target_link: `/operate/contracts?id=${c.id}`,
          auto_resolves_when: "Renewal deal won, notice or exit recorded",
          channels_notified: ["in_app", "email"],
        });
      }

      // AL-02: Lock-in expiration
      if (c.status === "active" && c.startDate && c.lockInDays) {
        const start = new Date(c.startDate);
        const lockInEnd = new Date(start.getTime() + c.lockInDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        if (lockInEnd <= ninetyDaysOut && lockInEnd >= nowStr) {
          alerts.push({
            code: "AL-02",
            name: "Lock-In Expiration Notification",
            category: "contract",
            severity: "info",
            entity_id: c.id,
            entity_code: c.code || "CNT",
            occupant_name: c.occupantName || "Occupant",
            message: `Contractual lock-in period for ${c.occupantName || "Occupant"} ends on ${lockInEnd}. Break clause options activate.`,
            target_link: `/operate/contracts?id=${c.id}`,
            auto_resolves_when: "Lock-in period elapsed",
            channels_notified: ["in_app"],
          });
        }
      }

      // AL-05: Holding over without valid lease
      if (c.status === "holding_over") {
        alerts.push({
          code: "AL-05",
          name: "Holding Over Without Valid Lease",
          category: "contract",
          severity: "critical",
          entity_id: c.id,
          entity_code: c.code || "CNT",
          occupant_name: c.occupantName || "Occupant",
          message: `${c.occupantName || "Occupant"} is holding over past agreed lease expiry.`,
          target_link: `/operate/contracts?id=${c.id}`,
          auto_resolves_when: "Exit or renewal recorded",
          channels_notified: ["in_app", "email"],
        });
      }
    });

    // 2. Fetch real overdue invoices
    const invoiceConditions = [
      sql`${invoice.status} IS NOT NULL`,
      sql`CAST(${invoice.balance_due} AS numeric) > 0`,
    ];
    if (orgId) invoiceConditions.push(eq(invoice.org_id, orgId));

    const invoices = await db
      .select({
        id: invoice.id,
        number: invoice.invoice_number,
        dueDate: invoice.due_date,
        balance: invoice.balance_due,
        occupantId: invoice.occupant_id,
        occupantName: occupant.occupant_name,
        status: invoice.status,
      })
      .from(invoice)
      .leftJoin(occupant, eq(invoice.occupant_id, occupant.id))
      .where(and(...invoiceConditions));

    invoices.forEach((inv) => {
      if (inv.dueDate && inv.dueDate < nowStr) {
        alerts.push({
          code: "AL-08",
          name: "Invoice Overdue — Aging Trigger",
          category: "collection",
          severity: "critical",
          entity_id: inv.id,
          entity_code: inv.number || "INV",
          occupant_name: inv.occupantName || "Occupant",
          message: `Invoice ${inv.number} for ${inv.occupantName || "Occupant"} overdue. Outstanding balance ₹${Number(inv.balance || 0).toLocaleString("en-IN")}.`,
          target_link: `/operate/invoices?id=${inv.id}`,
          auto_resolves_when: "Payment receipt posted and matched",
          channels_notified: ["in_app", "email"],
        });
      }
    });

    // 3. AL-09: Unallocated cash older than 48 hours
    try {
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().split("T")[0];
      const unallocated = await db
        .select({
          id: payment.id,
          code: payment.payment_code,
          amount: payment.amount_inr,
          date: payment.payment_date,
          occupantName: occupant.occupant_name,
        })
        .from(payment)
        .leftJoin(occupant, eq(payment.occupant_id, occupant.id))
        .where(
          and(
            sql`${payment.deleted_at} IS NULL`,
            eq(payment.is_matched, false),
            lte(payment.payment_date, twoDaysAgo)
          )
        );

      unallocated.forEach((p) => {
        alerts.push({
          code: "AL-09",
          name: "Unallocated Cash > 48h Aging",
          category: "collection",
          severity: "action",
          entity_id: p.id,
          entity_code: p.code || "PAY",
          occupant_name: p.occupantName || "Occupant",
          message: `Unallocated payment of ₹${Number(p.amount || 0).toLocaleString("en-IN")} received on ${p.date} remains unallocated past 48h SLA.`,
          target_link: `/operate/payments?id=${p.id}`,
          auto_resolves_when: "Payment allocated against invoice",
          channels_notified: ["in_app", "email"],
        });
      });
    } catch (e) {}

    // 4. AL-21: Dispute resolution SLA > 7 days
    try {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const openDisputes = await db
        .select({
          id: dispute.id,
          code: dispute.dispute_code,
          reason: dispute.dispute_reason,
          createdAt: dispute.created_at,
          occupantName: occupant.occupant_name,
        })
        .from(dispute)
        .leftJoin(occupant, eq(dispute.occupant_id, occupant.id))
        .where(
          and(
            eq(dispute.dispute_status, "open"),
            lte(dispute.created_at, sevenDaysAgo)
          )
        );

      openDisputes.forEach((disp) => {
        alerts.push({
          code: "AL-21",
          name: "Dispute SLA Breach (> 7 Days)",
          category: "collection",
          severity: "critical",
          entity_id: disp.id,
          entity_code: disp.code || "DISP",
          occupant_name: disp.occupantName || "Occupant",
          message: `Dispute ${disp.code} by ${disp.occupantName || "Occupant"} for reason "${disp.reason || "Billing error"}" has breached the 7-day resolution SLA.`,
          target_link: `/operate/disputes?id=${disp.id}`,
          auto_resolves_when: "Dispute resolved or adjustment note issued",
          channels_notified: ["in_app", "email"],
        });
      });
    } catch (e) {}

    // 5. AL-22: Vacant spaces
    try {
      const vacantSpaces = await db
        .select({
          id: space.id,
          code: space.space_code,
          name: space.space_name,
          area: space.chargeable_area_sqft,
        })
        .from(space)
        .where(
          and(
            sql`${space.deleted_at} IS NULL`,
            eq(space.occupancy_status, "vacant")
          )
        );

      vacantSpaces.forEach((sp) => {
        alerts.push({
          code: "AL-22",
          name: "Vacant Space Absorption Alert",
          category: "compliance",
          severity: "info",
          entity_id: sp.id,
          entity_code: sp.code || "SPC",
          occupant_name: null,
          message: `Space ${sp.name || sp.code} (${sp.area || 0} sqft) is vacant and available for lease listing.`,
          target_link: `/operate/stacking?spaceId=${sp.id}`,
          auto_resolves_when: "Contract executed for premises",
          channels_notified: ["in_app"],
        });
      });
    } catch (e) {}

  } catch (err) {
    console.warn("Alert evaluation database query note:", err);
  }

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const action = alerts.filter((a) => a.severity === "action").length;
  const info = alerts.filter((a) => a.severity === "info").length;

  return {
    evaluation_time: now.toISOString(),
    total_evaluated: alerts.length,
    critical_count: critical,
    action_count: action,
    info_count: info,
    alerts,
  };
}
