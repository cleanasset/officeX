import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 0;

// 12 Standard Roles from OFFICEX Rent Roll Specification §5.14 & Table 21
export const SPEC_ROLES = [
  {
    key: "owner",
    label: "Owner / Client Principal",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    dashboardUrl: "/dashboard/owner",
    description: "Portfolio overview, monthly income, occupancy %, expirations, collections aging and owner statements.",
    icon: "Building2",
    isPrimary: true
  },
  {
    key: "property_manager",
    label: "Property Manager / Centre Manager",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dashboardUrl: "/dashboard/pm",
    description: "Daily task queue, pending contract submissions, rent escalations, deposits and document expiries.",
    icon: "ClipboardList",
    isPrimary: true
  },
  {
    key: "finance_manager",
    label: "Finance / AR Manager",
    badge: "bg-purple-100 text-purple-800 border-purple-300",
    dashboardUrl: "/dashboard/finance",
    description: "Aging analysis (0-90+ days), cash collection forecast, delinquent occupants, bad debt and invoice approvals.",
    icon: "Receipt",
    isPrimary: true
  },
  {
    key: "leasing_manager",
    label: "Leasing Manager",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    dashboardUrl: "/dashboard/leasing",
    description: "Deal pipeline Kanban (Lead → Won), vacancy list, upcoming lease renewals and occupant credit risk.",
    icon: "TrendingUp",
    isPrimary: true
  },
  {
    key: "facility_manager",
    label: "Facility Manager",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-300",
    dashboardUrl: "/dashboard/fm",
    description: "FM action queue, meter readings, CAM pool reconciliation and service charge disputes.",
    icon: "Zap",
    isPrimary: true
  },
  {
    key: "org_admin",
    label: "Organization Admin",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    dashboardUrl: "/dashboard/owner",
    description: "Full administrative access: subscription settings, billing entities, charge types and user management.",
    icon: "ShieldCheck",
    isPrimary: false
  },
  {
    key: "occupant",
    label: "Occupant (Tenant)",
    badge: "bg-teal-100 text-teal-800 border-teal-300",
    dashboardUrl: "/portal",
    description: "Tenant self-service portal: view & pay invoices, statement of account, documents and raise disputes.",
    icon: "Users",
    isPrimary: false
  },
  {
    key: "platform_support",
    label: "Platform Support",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    dashboardUrl: "/dashboard/pm",
    description: "Break-glass operational support: diagnostic queues, system health logs and tenant assistance.",
    icon: "Headphones",
    isPrimary: false
  },
  {
    key: "asset_manager",
    label: "Asset Manager",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    dashboardUrl: "/dashboard/owner",
    description: "Portfolio yield analytics, WALE optimization, capital expenditure and long-term lease rollover.",
    icon: "BarChart3",
    isPrimary: false
  },
  {
    key: "auditor",
    label: "Auditor / Compliance Officer",
    badge: "bg-slate-100 text-slate-800 border-slate-300",
    dashboardUrl: "/dashboard/finance",
    description: "Statutory compliance audit: immutable transaction logs, TDS reconciliation and GST validation.",
    icon: "FileCheck",
    isPrimary: false
  },
  {
    key: "admin_ops",
    label: "Admin / Operations",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    dashboardUrl: "/properties/rent-roll",
    description: "Data onboarding: legacy data import wizard, column mapping templates and exception resolution.",
    icon: "Layers",
    isPrimary: false
  },
  {
    key: "legal_counsel",
    label: "Legal / Contracts Counsel",
    badge: "bg-stone-100 text-stone-800 border-stone-300",
    dashboardUrl: "/dashboard/pm",
    description: "Lease clauses: lock-in periods, stamp duty compliance, eviction notices and dispute arbitration.",
    icon: "Scale",
    isPrimary: false
  }
];

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const emailCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("officex_user_email="));
    const userEmail = emailCookie
      ? decodeURIComponent(emailCookie.split("=")[1].trim())
      : null;

    let matchedUser: any = null;

    if (userEmail) {
      try {
        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, userEmail.toLowerCase()))
          .limit(1);
        if (found.length > 0) {
          matchedUser = found[0];
        }
      } catch (dbErr) {
        // Fallback gracefully
      }
    }

    const email = matchedUser?.email || userEmail || "director@officex.pro";
    const fullName = matchedUser?.fullName || email.split("@")[0] || "Commercial Leader";
    const currentStoredRole = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("officex_user_role="));
    const activeRoleLabel = currentStoredRole
      ? decodeURIComponent(currentStoredRole.split("=")[1].trim())
      : "Owner / Client Principal";

    return NextResponse.json({
      success: true,
      user: {
        id: matchedUser?.id || "usr_session_default",
        email: email,
        fullName: fullName,
        currentRole: activeRoleLabel,
      },
      roles: SPEC_ROLES,
      count: SPEC_ROLES.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/users/me:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles", message: error.message },
      { status: 500 }
    );
  }
}
