"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getClientUserEmail, getAuthCookie } from "@/lib/auth-storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  // The top-level Workspace Hub (/dashboard) is the sovereign launchpad for all users.
  const isWorkspaceHub = pathname === "/dashboard";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email =
        getClientUserEmail() ||
        getAuthCookie("officex_user_email") ||
        localStorage.getItem("officex_user_email") ||
        sessionStorage.getItem("officex_user_email");

      const sessionActive =
        getAuthCookie("officex_session_active") === "1" ||
        localStorage.getItem("officex_session_active") === "1" ||
        localStorage.getItem("officex_onboarding_completed") === "1";

      // If neither email nor active session flag exists, redirect to login
      if (!email && !sessionActive && !isWorkspaceHub) {
        // Also check if any Supabase token exists before redirecting
        let hasSbToken = false;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
              hasSbToken = true;
              break;
            }
          }
        } catch {}

        if (!hasSbToken) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
      }

      setIsVerifying(false);
    }
  }, [pathname, router, isWorkspaceHub]);

  if (isWorkspaceHub) {
    return <>{children}</>;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0D7B6C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      {/* Canonical Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel Flow beside Sidebar */}
      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />
        <main className="flex-1 mt-[60px] p-4 md:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
