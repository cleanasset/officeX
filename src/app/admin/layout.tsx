"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getClientUserEmail, getAuthCookie } from "@/lib/auth-storage";

function PortalLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [isAuthorized, setIsAuthorized] = useState(isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    if (typeof window !== "undefined") {
      const email = (
        getClientUserEmail() ||
        getAuthCookie("officex_user_email") ||
        localStorage.getItem("officex_user_email") ||
        sessionStorage.getItem("officex_user_email") ||
        ""
      ).toLowerCase().trim();

      const isAuthActive = getAuthCookie("officex_session_active") === "1" || getAuthCookie("officex_auth") === "1";
      const isAdminCookie = getAuthCookie("officex_admin") === "1";
      const isSuperAdminRole = getAuthCookie("officex_role") === "super_admin";

      const isPermittedAdminEmail =
        email === "admin@gmail.com" ||
        email === "medistationlifecare@gmail.com";

      if (isAuthActive && (isAdminCookie || isSuperAdminRole) && isPermittedAdminEmail) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-400 tracking-wider">Verifying Super Admin Authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Panel */}
      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        {/* Top Header Bar */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 mt-[60px] p-4 md:p-8 overflow-y-auto min-w-0 max-w-full overflow-x-hidden pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Fixed Mobile Bottom App Bar */}
      <MobileBottomNav />
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </Suspense>
  );
}
