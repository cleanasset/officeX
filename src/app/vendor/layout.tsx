import React, { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

function VendorLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <Sidebar />
      
      {/* Main Panel */}
      <div className="flex-1 pl-0 md:pl-[260px] flex flex-col">
        {/* Top Header Bar */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 mt-[60px] p-8 overflow-y-auto">
          {children}
        </main>
      </div>
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
      <VendorLayoutContent>{children}</VendorLayoutContent>
    </Suspense>
  );
}
