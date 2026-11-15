"use client";

export interface OfficeXNotification {
  id: string;
  title: string;
  message: string;
  tag?: string;
  route?: string;
  time?: string;
  unread: boolean;
  severity?: "info" | "warning" | "critical";
  timestamp?: string;
}

/**
 * Universally dispatches an administrative or operational notification
 * so the Topbar Bell badge updates in real-time across the entire ERP.
 */
export function notifyAdminAction(notification: {
  title: string;
  message: string;
  tag?: string;
  route?: string;
  severity?: "info" | "warning" | "critical";
}) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("officex_notifications");
    const existing: OfficeXNotification[] = stored ? JSON.parse(stored) : [];
    
    const newNotif: OfficeXNotification = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: notification.title,
      message: notification.message,
      tag: notification.tag || "ADMIN",
      route: notification.route || "/properties/registry",
      time: "Just now",
      unread: true,
      severity: notification.severity || "info",
      timestamp: new Date().toISOString(),
    };

    // Prepend new notification and cap at 50 records
    const updated = [newNotif, ...existing.filter((n) => n.id !== newNotif.id)].slice(0, 50);
    localStorage.setItem("officex_notifications", JSON.stringify(updated));

    // Dispatch custom event to instantly wake Topbar and other subscribers
    window.dispatchEvent(new CustomEvent("officex-notification-refresh"));
  } catch (e) {
    console.warn("Failed to dispatch administrative notification:", e);
  }
}
