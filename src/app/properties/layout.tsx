import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

function PortalLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background w-full max-w-full overflow-x-hidden">
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

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth gate: check for session cookies
  const cookieStore = await cookies();
  const hasAuth = cookieStore.get("officex_auth")?.value === "1" ||
                  cookieStore.get("officex_session_active")?.value === "1";
  
  if (!hasAuth) {
    redirect("/login?redirect=/properties");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </Suspense>
  );
}
