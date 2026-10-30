export function setAuthCookie(name: string, value: string, maxAge = 86400) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  // 1. Current origin / host cookie
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  // 2. Wildcard root domain cookie so officex.pro and www.officex.pro share context in InPrivate windows
  if (typeof window !== "undefined" && window.location.hostname.includes("officex.pro")) {
    document.cookie = `${name}=${encodeURIComponent(value)}; domain=.officex.pro; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  }
}

export function getAuthCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
}

export function clearAuthCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  if (typeof window !== "undefined" && window.location.hostname.includes("officex.pro")) {
    document.cookie = `${name}=; domain=.officex.pro; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  }
}

const PURGED_TEST_ACCOUNTS = new Set([
  "jiya.scalezix@gmail.com",
  "jeel@gmail.com",
  "jiya@scalezix.com",
  "admin.cleanasset@gmail.com",
  "jiya.d.patel@tsuniv.edu.in",
  "jiyapatel181224@gmail.com",
  "jiya@gmail.com",
  "scalezix@gmail.com",
  "tanmay@gmail.com",
  "kashvi@gmail.com",
  "patel@gmail.com",
  "jp@gmail.com",
  "jps@management.in",
  "jp@management.in",
  "manager@gmail.com",
  "tenant@gmail.com",
  "cbre.mgr@example.com"
]);

/**
 * Universal client-side resolver for user email across all sessions, cookies and localStorage.
 * Guarantees that all API requests consistently pass the user identity header.
 * Automatically purges stale data caches when user accounts switch or if from purged test accounts.
 */
export function getClientUserEmail(): string {
  if (typeof window === "undefined") return "";

  const sanitizeStaleUserCache = (email: string) => {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    
    // If the browser holds session data from a purged test account, wipe it completely
    if (PURGED_TEST_ACCOUNTS.has(cleanEmail)) {
      const keysToWipe = [
        "officex_user_properties",
        "officex_active_leases",
        "officex_active_tenants",
        "officex_onboarded_property_details",
        "officex_selected_property",
        "officex_total_portfolio_sqft",
        "officex_org_id",
        "officex_org_name",
        "officex_client_account_id",
        "officex_property_name"
      ];
      keysToWipe.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
        try { sessionStorage.removeItem(k); } catch {}
      });
      return "";
    }

    // Check if user email switched in active session
    const lastActive = (localStorage.getItem("officex_active_session_owner") || "").trim().toLowerCase();
    if (lastActive && lastActive !== cleanEmail) {
      const keysToWipe = [
        "officex_user_properties",
        "officex_active_leases",
        "officex_active_tenants",
        "officex_onboarded_property_details",
        "officex_selected_property",
        "officex_total_portfolio_sqft",
        "officex_org_id",
        "officex_org_name",
        "officex_client_account_id",
        "officex_property_name"
      ];
      keysToWipe.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
        try { sessionStorage.removeItem(k); } catch {}
      });
    }
    try { localStorage.setItem("officex_active_session_owner", cleanEmail); } catch {}
    return cleanEmail;
  };

  const fromLocal = (localStorage.getItem("officex_user_email") || "").trim().toLowerCase();
  if (fromLocal) {
    const cleaned = sanitizeStaleUserCache(fromLocal);
    if (cleaned) return cleaned;
  }

  const fromSession = (sessionStorage.getItem("officex_user_email") || "").trim().toLowerCase();
  if (fromSession) {
    const cleaned = sanitizeStaleUserCache(fromSession);
    if (cleaned) {
      try { localStorage.setItem("officex_user_email", cleaned); } catch {}
      return cleaned;
    }
  }

  const fromCookie = getAuthCookie("officex_user_email").trim().toLowerCase();
  if (fromCookie) {
    const cleaned = sanitizeStaleUserCache(fromCookie);
    if (cleaned) {
      try { localStorage.setItem("officex_user_email", cleaned); } catch {}
      return cleaned;
    }
  }

  // 4. Check active Supabase auth session token in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          const sbEmail = (parsed.user?.email || "").trim().toLowerCase();
          if (sbEmail) {
            const cleaned = sanitizeStaleUserCache(sbEmail);
            if (cleaned) {
              try {
                localStorage.setItem("officex_user_email", cleaned);
                setAuthCookie("officex_user_email", cleaned);
              } catch {}
              return cleaned;
            }
          }
        }
      }
    }
  } catch {}

  // 5. Mobile login fallback
  const fromMobile = (localStorage.getItem("officex_user_mobile") || sessionStorage.getItem("officex_user_mobile") || "").trim();
  if (fromMobile) {
    const mobileEmail = `${fromMobile.replace(/\D/g, "")}@officex.pro`;
    try {
      localStorage.setItem("officex_user_email", mobileEmail);
      setAuthCookie("officex_user_email", mobileEmail);
    } catch {}
    return mobileEmail;
  }

  return "";
}

/**
 * Helper to build auth headers for client-side fetch requests
 */
export function getClientAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const email = getClientUserEmail();
  if (email) headers["x-user-email"] = email;

  if (typeof window !== "undefined") {
    const orgId = localStorage.getItem("officex_org_id") || getAuthCookie("officex_org_id");
    if (orgId) headers["x-org-id"] = orgId;
    const clientAccId = localStorage.getItem("officex_client_account_id") || getAuthCookie("officex_client_account_id");
    if (clientAccId) headers["x-client-account-id"] = clientAccId;
  }
  return headers;
}

