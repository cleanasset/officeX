"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoleKey = localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key");
      const storedRole = (localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "").toLowerCase();

      if (storedRoleKey === "property_manager" || storedRole.includes("property")) {
        router.replace("/dashboard/pm");
      } else if (storedRoleKey === "finance_manager" || storedRole.includes("finance")) {
        router.replace("/dashboard/finance");
      } else if (storedRoleKey === "leasing_manager" || storedRole.includes("leasing") || storedRole.includes("broker")) {
        router.replace("/dashboard/leasing");
      } else if (storedRoleKey === "facility_manager" || storedRole.includes("facility") || storedRole.includes("fm")) {
        router.replace("/dashboard/fm");
      } else {
        router.replace("/dashboard/owner");
      }
    } else {
      router.replace("/dashboard/owner");
    }
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Routing to your assigned dashboard view...</p>
      </div>
    </div>
  );
}
