"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  
  // Generate simple breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const formattedBreadcrumb = pathParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("  >  ");

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 fixed top-0 right-0 left-[260px] z-20 px-8 flex items-center justify-between shadow-sm">
      
      {/* Left Breadcrumbs */}
      <div className="text-xs font-bold text-gray-700 uppercase tracking-widest">
        {formattedBreadcrumb || "Dashboard"}
      </div>

      {/* Right Search, Notification and Avatar */}
      <div className="flex items-center gap-6">
        
        {/* Search Input Box */}
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search properties, tickets..."
            className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0F8B7D] text-xs w-60 bg-gray-50 transition-colors"
          />
          <Search size={14} className="absolute left-3.5 top-2.5 text-gray-600" />
        </div>

        {/* Support Link */}
        <a href="#help" className="text-gray-500 hover:text-[#0F8B7D] transition-colors" title="Help & Documentation">
          <HelpCircle size={18} />
        </a>

        {/* Notifications Icon with Red Dot */}
        <button className="relative text-gray-500 hover:text-[#0F8B7D] transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse-green"></span>
        </button>

        {/* User Mini Avatar */}
        <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-primary-teal text-xs shadow-sm">
          U
        </div>

      </div>

    </header>
  );
}
