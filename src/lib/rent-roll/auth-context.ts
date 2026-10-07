import { NextRequest } from "next/server";

export type SpecRoleKey =
  | "super_admin"
  | "org_admin"
  | "owner"
  | "client_principal"
  | "property_manager"
  | "finance"
  | "finance_manager"
  | "approver"
  | "facility_manager"
  | "leasing_manager"
  | "asset_manager"
  | "occupant"
  | "auditor"
  | "admin_ops"
  | "platform_support"
  | "legal_counsel";

export interface RentRollAuthContext {
  orgId: string;
  clientAccountId?: string | null;
  userId: string;
  role: SpecRoleKey;
  isPortfolioRole: boolean;
}

export const DEFAULT_TEST_ORG_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_TEST_CLIENT_ID = "00000000-0000-0000-0000-000000000002";
export const DEFAULT_TEST_USER_ID = "00000000-0000-0000-0000-000000000003";

// §5.14 Permissions Matrix Mapping
export const ROLE_CAPABILITIES: Record<string, string[]> = {
  super_admin: ["*"],
  org_admin: ["*"],
  owner: [
    "view_portfolio",
    "view_owner_statement",
    "approve_contract",
    "view_financials",
    "view_invoices",
    "view_aging",
    "download_mis",
  ],
  client_principal: [
    "view_portfolio",
    "view_owner_statement",
    "view_financials",
    "view_invoices",
    "view_aging",
    "download_mis",
  ],
  property_manager: [
    "view_portfolio",
    "create_contract",
    "edit_contract",
    "submit_contract",
    "view_spaces",
    "record_exit",
    "view_today_queue",
    "snooze_task",
    "view_tenants",
  ],
  finance_manager: [
    "view_portfolio",
    "approve_contract",
    "reject_contract",
    "approve_invoice",
    "reject_invoice",
    "record_payment",
    "allocate_payment",
    "approve_writeoff",
    "create_billing_run",
    "view_financials",
    "view_aging",
    "view_owner_statement",
  ],
  finance: [
    "view_portfolio",
    "approve_contract",
    "reject_contract",
    "approve_invoice",
    "reject_invoice",
    "record_payment",
    "allocate_payment",
    "approve_writeoff",
    "create_billing_run",
    "view_financials",
    "view_aging",
  ],
  approver: [
    "approve_contract",
    "reject_contract",
    "approve_invoice",
    "reject_invoice",
    "approve_writeoff",
  ],
  leasing_manager: [
    "view_portfolio",
    "view_vacancies",
    "create_deal",
    "edit_deal",
    "advance_deal",
    "view_expiry_pipeline",
    "view_arrears_flag", // flag only, no amounts
  ],
  facility_manager: [
    "view_fm_tasks",
    "enter_meter_readings",
    "manage_cam_pools",
    "submit_service_dispute",
    "view_technical_compliance",
  ],
  occupant: [
    "view_own_invoices",
    "make_payment",
    "raise_dispute",
    "download_receipts",
    "view_statement_of_account",
  ],
  asset_manager: [
    "view_portfolio",
    "view_financials",
    "view_forecast",
    "view_pnl",
    "view_wale",
    "download_mis",
  ],
  auditor: [
    "view_portfolio",
    "view_financials",
    "view_audit_logs",
    "view_snapshots",
    "verify_tds",
    "download_mis",
  ],
  admin_ops: [
    "import_data",
    "map_schema",
    "fix_exceptions",
    "manage_templates",
  ],
  platform_support: [
    "view_diagnostics",
    "break_glass_read",
  ],
  legal_counsel: [
    "view_contracts",
    "review_clauses",
    "verify_stamp_duty",
  ],
};

/**
 * Checks if a role has the requested capability
 */
export function hasCapability(role: string, action: string): boolean {
  const normRole = (role || "").toLowerCase().replace(/\s+/g, "_");
  const caps = ROLE_CAPABILITIES[normRole] || [];
  if (caps.includes("*")) return true;
  return caps.includes(action);
}

/**
 * Server-side guard checking authorization
 */
export function assertRolePermission(
  auth: RentRollAuthContext,
  action: string,
  resource: string
): { allowed: boolean; reason?: string } {
  if (auth.role === "super_admin" || auth.role === "org_admin") {
    return { allowed: true };
  }

  // Explicit rule checks
  if (action === "approve_contract") {
    const approverRoles = ["finance_manager", "finance", "approver", "owner", "client_principal", "super_admin", "org_admin"];
    if (!approverRoles.includes(auth.role)) {
      return {
        allowed: false,
        reason: `Role '${auth.role}' is not authorized to approve contracts. Approver or Finance Manager role required.`,
      };
    }
  }

  if (action === "create_contract" && auth.role === "facility_manager") {
    return {
      allowed: false,
      reason: "Facility Managers cannot create or edit commercial rent contracts (§5.11).",
    };
  }

  const allowed = hasCapability(auth.role, action);
  if (!allowed) {
    return {
      allowed: false,
      reason: `Role '${auth.role}' does not have capability '${action}' on '${resource}'.`,
    };
  }

  return { allowed: true };
}

export function getAuthContext(req: Request | NextRequest): RentRollAuthContext {
  const headers = req.headers;
  let orgId = headers.get("x-org-id") || DEFAULT_TEST_ORG_ID;
  let clientAccountId = headers.get("x-client-account-id") || DEFAULT_TEST_CLIENT_ID;
  let userId = headers.get("x-user-id") || DEFAULT_TEST_USER_ID;
  let role = (headers.get("x-user-role") || "property_manager") as SpecRoleKey;

  // Check cookies if in request headers
  const cookieHeader = headers.get("cookie") || "";
  const roleCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("officex_role_key="));
  if (roleCookie) {
    role = decodeURIComponent(roleCookie.split("=")[1].trim()) as SpecRoleKey;
  }

  const clientCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("officex_client_account_id="));
  if (clientCookie) {
    clientAccountId = decodeURIComponent(clientCookie.split("=")[1].trim());
  }

  // Check URL query params if present
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("org_id")) orgId = url.searchParams.get("org_id")!;
    if (url.searchParams.get("client_account_id")) clientAccountId = url.searchParams.get("client_account_id")!;
    if (url.searchParams.get("user_id")) userId = url.searchParams.get("user_id")!;
    if (url.searchParams.get("role")) role = url.searchParams.get("role") as SpecRoleKey;
  } catch (e) {
    // ignore
  }

  const isPortfolioRole = [
    "super_admin",
    "org_admin",
    "owner",
    "property_manager",
    "finance",
    "finance_manager",
    "asset_manager",
  ].includes(role);

  return {
    orgId,
    clientAccountId: isPortfolioRole && clientAccountId === "all" ? null : clientAccountId,
    userId,
    role,
    isPortfolioRole,
  };
}
