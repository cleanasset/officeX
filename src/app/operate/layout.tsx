"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SubscriptionGate from "@/components/SubscriptionGate";

// Public marketing & product landing pages under /operate render their own sovereign
// MarketingHeader, full-width Hero, Pricing tables, and Footer. They must NEVER be squeezed
// inside the internal application Sidebar or Topbar.
const MARKETING_LANDING_ROUTES = new Set([
  "/operate",
  "/operate/rent-roll",
  "/operate/rent-roll/pricing",
  "/operate/helpdesk",
  "/operate/ppm",
  "/operate/compliance",
  "/operate/visitors",
]);

// Internal Financial and Rent Roll calculation routes that require an active subscription
const PAID_FINANCIAL_ROUTES = new Set([
  "/operate/owner-statements",
  "/operate/forecast",
  "/operate/pnl",
  "/operate/mis",
  "/operate/collections",
  "/operate/invoices",
  "/operate/stacking",
  "/operate/cam-pools",
  "/operate/snapshots",
  "/operate/escalations",
  "/operate/exceptions",
  "/operate/head-leases",
]);

export default function OperateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const cleanPath = pathname.replace(/\/$/, "");

  const isMarketingLanding = MARKETING_LANDING_ROUTES.has(cleanPath);

  if (isMarketingLanding) {
    return <>{children}</>;
  }

  const isPaidFinancial = PAID_FINANCIAL_ROUTES.has(cleanPath);

  const mainContent = isPaidFinancial ? (
    <SubscriptionGate portalName="Rent Roll & Financial Suite" fallbackLandingPage="/dashboard/owner">
      {children}
    </SubscriptionGate>
  ) : (
    children
  );

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
        {/* Canonical Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Panel Flow beside Sidebar */}
        <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
          <Topbar />
          <main className="flex-1 mt-[60px] p-3 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full pb-24 md:pb-8">
            {mainContent}
          </main>
        </div>

        {/* Fixed Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </Suspense>
  );
}
