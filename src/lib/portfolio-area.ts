import { useState, useEffect } from "react";
import { getClientAuthHeaders } from "./auth-storage";

/**
 * Universal Portfolio Area Helper & Hook
 * Guarantees that any user who adds properties (e.g. 500,000 sq.ft across 1 or more assets)
 * CANNOT subscribe for anything less than their cumulative property square footage.
 */

export function getStoredPortfolioSqft(): number {
  if (typeof window === "undefined") return 0;
  try {
    const rawTotal = Number(localStorage.getItem("officex_total_portfolio_sqft") || 0);
    if (rawTotal > 0) return rawTotal;

    const snap = JSON.parse(localStorage.getItem("officex_onboarded_property_details") || "{}");
    const snapArea = Number(snap?.areaSqft || 0);
    if (snapArea > 0) return snapArea;

    const propArea = Number(localStorage.getItem("officex_property_area") || 0);
    if (propArea > 0) return propArea;
  } catch {
    // Non-blocking
  }
  return 0;
}

export function saveUniversalPortfolioSqft(sqft: number): void {
  if (typeof window === "undefined" || !sqft || sqft <= 0) return;
  try {
    localStorage.setItem("officex_total_portfolio_sqft", String(Math.round(sqft)));
    sessionStorage.setItem("officex_total_portfolio_sqft", String(Math.round(sqft)));
  } catch {
    // Non-blocking
  }
}

export async function fetchUniversalPortfolioSqft(): Promise<number> {
  const localVal = getStoredPortfolioSqft();
  if (typeof window === "undefined") return localVal;

  try {
    const headers = getClientAuthHeaders();
    const res = await fetch("/api/subscription/portfolio-area", { headers, cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const serverArea = Number(data.totalPortfolioSqft || 0);
      if (data.success && (data.propertyCount === 0 || serverArea === 0)) {
        // User has NO properties registered in the system. Purge stale local values.
        localStorage.removeItem("officex_total_portfolio_sqft");
        sessionStorage.removeItem("officex_total_portfolio_sqft");
        localStorage.removeItem("officex_onboarded_property_details");
        return 0;
      }
      if (serverArea > 0) {
        saveUniversalPortfolioSqft(serverArea);
        return serverArea;
      }
      return 0;
    }
  } catch (err) {
    console.warn("[Portfolio-Area] Failed to fetch server portfolio area:", err);
  }

  return localVal;
}

/**
 * React Hook for Universal Portfolio Square Footage
 * Enforces the mandatory minimum subscription floor across all subscription surfaces.
 */
export function useUniversalPortfolioSqft(baseFallbackFloor = 1000) {
  const [totalPortfolioSqft, setTotalPortfolioSqft] = useState<number>(() => {
    const stored = getStoredPortfolioSqft();
    return stored > 0 ? stored : 0;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchUniversalPortfolioSqft().then((val) => {
      if (isMounted) {
        setTotalPortfolioSqft(val);
        setLoading(false);
      }
    });

    const handleStorageChange = () => {
      const updated = getStoredPortfolioSqft();
      setTotalPortfolioSqft(updated > 0 ? updated : 0);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const minAllowedSqft = Math.max(totalPortfolioSqft, baseFallbackFloor);

  return {
    totalPortfolioSqft,
    minAllowedSqft,
    loading,
    refreshPortfolioArea: fetchUniversalPortfolioSqft,
  };
}

