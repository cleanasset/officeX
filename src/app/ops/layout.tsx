import React from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function PortalLayout({
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
        <main className="flex-1 mt-[60px] p-4 md:p-8 overflow-y-auto min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
