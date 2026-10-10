"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SubscriptionGate from "@/components/SubscriptionGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionGate portalName="Operational Dashboard" fallbackLandingPage="/operate">
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
    </SubscriptionGate>
  );
}

