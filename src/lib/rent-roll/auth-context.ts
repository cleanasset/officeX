import { NextRequest } from "next/server";

export interface RentRollAuthContext {
  orgId: string;
  clientAccountId?: string | null;
  userId: string;
  role: "super_admin" | "owner" | "property_manager" | "finance" | "approver" | "facility_manager" | "client_principal" | "occupant";
  isPortfolioRole: boolean;
}

export const DEFAULT_TEST_ORG_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_TEST_CLIENT_ID = "00000000-0000-0000-0000-000000000002";
export const DEFAULT_TEST_USER_ID = "00000000-0000-0000-0000-000000000003";

export function getAuthContext(req: Request | NextRequest): RentRollAuthContext {
  const headers = req.headers;
  let orgId = headers.get("x-org-id") || DEFAULT_TEST_ORG_ID;
  let clientAccountId = headers.get("x-client-account-id") || DEFAULT_TEST_CLIENT_ID;
  let userId = headers.get("x-user-id") || DEFAULT_TEST_USER_ID;
  let role = (headers.get("x-user-role") || "property_manager") as RentRollAuthContext["role"];

  // Check URL query params if not in headers
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("org_id")) orgId = url.searchParams.get("org_id")!;
    if (url.searchParams.get("client_account_id")) clientAccountId = url.searchParams.get("client_account_id")!;
    if (url.searchParams.get("user_id")) userId = url.searchParams.get("user_id")!;
    if (url.searchParams.get("role")) role = url.searchParams.get("role") as RentRollAuthContext["role"];
  } catch (e) {
    // ignore
  }

  const isPortfolioRole = ["super_admin", "owner", "property_manager", "finance"].includes(role);

  return {
    orgId,
    clientAccountId: isPortfolioRole && clientAccountId === "all" ? null : clientAccountId,
    userId,
    role,
    isPortfolioRole,
  };
}
