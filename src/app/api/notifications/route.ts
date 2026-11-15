import { NextResponse } from "next/server";
import { db } from "@/db";
import { property, contract, alertNotifications } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { supabase } from "@/lib/supabase";

function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Recently";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const notifications: any[] = [];

    const userEmail = (auth.userEmail || req.headers.get("x-user-email") || "").toLowerCase().trim();
    const isPlatformAdmin =
      auth.role === "super_admin" ||
      auth.role === "org_admin" ||
      auth.role === "admin_ops" ||
      auth.role === "platform_support" ||
      userEmail === "admin.cleanasset@gmail.com" ||
      userEmail === "admin@officex.pro" ||
      userEmail === "admin@gmail.com" ||
      userEmail.includes("admin");

    // =========================================================================
    // FLOW 1: SUPER ADMIN NOTIFICATIONS (Approval Tasks & Platform Governance)
    // =========================================================================
    if (isPlatformAdmin) {
      // 1. Pending Property Deletions across all client portfolios
      try {
        const pendingProps = await db
          .select({
            id: property.id,
            name: property.property_name,
            source_row_id: property.source_row_id,
            updated_at: property.updated_at,
            total_area: property.total_leasable_area_sqft,
          })
          .from(property)
          .where(sql`${property.deleted_at} IS NULL`);

        for (const p of pendingProps) {
          let meta: any = {};
          if (p.source_row_id && typeof p.source_row_id === "string" && p.source_row_id.startsWith("{")) {
            try { meta = JSON.parse(p.source_row_id); } catch {}
          }
          if (meta.pending_deletion) {
            notifications.push({
              id: `admin-prop-del-${p.id}`,
              title: `Pending Deletion Approval: ${p.name}`,
              message: `${meta.requested_by ? `User ${meta.requested_by} requested deletion. ` : ""}${meta.reason || "Property marked for deletion"}. Requires Super Admin review.`,
              tag: "APPROVAL",
              route: "/admin?tab=saas&module=rent_roll&sub=pending_deletions",
              time: formatRelativeTime(meta.requested_at || p.updated_at),
              unread: true,
              severity: "critical",
              timestamp: meta.requested_at || p.updated_at || new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn("Error fetching admin pending property deletion notifications:", e);
      }

      // 2. Pending Lease Contracts (Maker-Checker Governance)
      try {
        const pendingContracts = await db
          .select({
            id: contract.id,
            code: contract.contract_code,
            status: contract.contract_status,
            created_at: contract.created_at,
          })
          .from(contract)
          .where(
            and(
              sql`${contract.deleted_at} IS NULL`,
              sql`${contract.contract_status} IN ('submitted', 'pending_approval')`
            )
          )
          .limit(10);

        for (const c of pendingContracts) {
          notifications.push({
            id: `admin-contract-${c.id}`,
            title: `Lease Contract Pending: ${c.code || "Commercial Lease"}`,
            message: `Agreement submitted for Maker-Checker governance sign-off.`,
            tag: "APPROVAL",
            route: "/approvals",
            time: formatRelativeTime(c.created_at),
            unread: true,
            severity: "warning",
            timestamp: c.created_at || new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Error fetching contract notifications for admin:", e);
      }
    }

    // =========================================================================
    // FLOW 2: PROPERTY OWNER & REGULAR USER NOTIFICATIONS
    // (Decisions from Admin, Tenant updates, and Subscription Alerts)
    // =========================================================================
    if (!isPlatformAdmin) {
      // 1. Check if an admin recently REJECTED a deletion request for this user's properties
      try {
        const userProps = await db
          .select({
            id: property.id,
            name: property.property_name,
            source_row_id: property.source_row_id,
            updated_at: property.updated_at,
          })
          .from(property)
          .where(
            and(
              eq(property.org_id, auth.orgId),
              sql`${property.deleted_at} IS NULL`
            )
          );

        for (const p of userProps) {
          let meta: any = {};
          if (p.source_row_id && typeof p.source_row_id === "string" && p.source_row_id.startsWith("{")) {
            try { meta = JSON.parse(p.source_row_id); } catch {}
          }
          if (meta.deletion_rejected_at) {
            const rejectedDate = new Date(meta.deletion_rejected_at);
            const daysAgo = (Date.now() - rejectedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysAgo <= 7) {
              notifications.push({
                id: `user-prop-rejected-${p.id}`,
                title: `Deletion Request Rejected: ${p.name}`,
                message: `The Super Admin reviewed and rejected the deletion request. Property remains active in your registry.`,
                tag: "GOVERNANCE",
                route: "/properties/registry",
                time: formatRelativeTime(meta.deletion_rejected_at),
                unread: true,
                severity: "info",
                timestamp: meta.deletion_rejected_at,
              });
            }
          }
        }
      } catch (e) {
        console.warn("Error fetching user property decision notifications:", e);
      }

      // 2. Subscription Expiry & Days Countdown Warning
      if (auth.userEmail) {
        try {
          const { data: subRow } = await supabase
            .from("user_subscriptions")
            .select("ends_at, status, plan_id, metadata")
            .eq("email", auth.userEmail.toLowerCase())
            .order("ends_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (subRow && subRow.ends_at) {
            const endDate = new Date(subRow.ends_at);
            const now = new Date();
            const diffMs = endDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (daysLeft <= 5 && daysLeft >= 0) {
              notifications.push({
                id: `sub-expiring-${daysLeft}`,
                title: `Subscription Expiring in ${daysLeft} Day${daysLeft === 1 ? "" : "s"}!`,
                message: `Your commercial plan expires on ${endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}. Renew now to avoid interruption.`,
                tag: "SUBSCRIPTION",
                route: "/pricing",
                time: "Critical Alert",
                unread: true,
                severity: "critical",
                timestamp: new Date().toISOString(),
              });
            } else if (daysLeft < 0) {
              notifications.push({
                id: "sub-expired-notice",
                title: "Subscription Has Expired",
                message: `Your subscription lapsed on ${endDate.toLocaleDateString("en-IN")}. Please renew to maintain portfolio access.`,
                tag: "BILLING",
                route: "/pricing",
                time: "Expired",
                unread: true,
                severity: "critical",
                timestamp: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.warn("Error fetching subscription status for notification:", e);
        }
      }
    }

    // 4. Database Alert Notifications (Alerts from alertNotifications table)
    try {
      const dbAlerts = await db
        .select()
        .from(alertNotifications)
        .where(
          and(
            eq(alertNotifications.orgId, auth.orgId),
            eq(alertNotifications.isRead, false)
          )
        )
        .orderBy(desc(alertNotifications.createdAt))
        .limit(15);

      for (const a of dbAlerts) {
        notifications.push({
          id: `db-${a.id}`,
          title: a.title,
          message: a.message,
          tag: a.alertType ? a.alertType.toUpperCase() : "ALERT",
          route: a.entityType === "lease" ? "/properties/rent-roll?tab=contracts" : "/dashboard",
          time: formatRelativeTime(a.createdAt),
          unread: !a.isRead,
          severity: a.severity || "info",
          timestamp: a.createdAt || new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("DB alert notifications query notice:", e);
    }

    // Sort notifications so critical / newest appear first
    notifications.sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1;
      if (b.severity === "critical" && a.severity !== "critical") return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unread_count: unreadCount,
      data: notifications,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch notifications", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthContext(req);
    const body = await req.json().catch(() => ({}));

    // Action: Mark all read
    if (body.markAllRead) {
      try {
        await db
          .update(alertNotifications)
          .set({ isRead: true })
          .where(eq(alertNotifications.orgId, auth.orgId));
      } catch {}
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    // Action: Mark single notification read
    if (body.id && body.id.startsWith("db-")) {
      const realId = body.id.replace("db-", "");
      try {
        await db
          .update(alertNotifications)
          .set({ isRead: true })
          .where(and(eq(alertNotifications.id, realId), eq(alertNotifications.orgId, auth.orgId)));
      } catch {}
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update notification", message: err.message }, { status: 500 });
  }
}
