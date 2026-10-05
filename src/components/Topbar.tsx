"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  HelpCircle,
  Building,
  MapPin,
  ArrowRight,
  Menu,
  Settings,
  FileText,
  Layers,
  LogOut,
  Building2
} from "lucide-react";
import { performClientLogout } from "@/lib/auth-client";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile Menu State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Generate breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const formattedBreadcrumb = pathParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("  >  ");

  const popularDestinations = [
    { name: "Ahmedabad", type: "City", count: "3 Listed Assets" },
    { name: "Mumbai", type: "City", count: "5 Listed Assets" },
    { name: "Bengaluru", type: "City", count: "4 Listed Assets" },
    { name: "Apex Business Tower", type: "Building", location: "BKC, Mumbai" },
    { name: "Meridian Tech Park", type: "Building", location: "Whitefield, Bengaluru" },
    { name: "Nexus Hub", type: "Building", location: "Hinjewadi, Pune" },
    { name: "AHU-04 (Air Handling Unit)", type: "Asset", location: "Apex Floor 4", count: "Health: 94%" },
    { name: "DG-02 (Diesel Generator)", type: "Asset", location: "Meridian Tech Park", count: "Health: 97%" },
    { name: "TKT-4890 (Water Leakage)", type: "Ticket", location: "Nexus Hub", count: "Status: Open" },
    { name: "WO-9081 (MEP Service)", type: "Work Order", location: "Apex Floor 4", count: "SLA: Normal" }
  ];

  // Sync session state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name") || sessionStorage.getItem("officex_user_name");
      const storedEmail = localStorage.getItem("officex_user_email") || sessionStorage.getItem("officex_user_email");

      if (storedName) setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
    }
  }, [pathname]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = popularDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) || (d.location && d.location.toLowerCase().includes(q))
      );
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(name)}`);
  };

  // Sign out handler
  const handleSignOut = async () => {
    await performClientLogout("/login");
  };

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-[260px] z-20 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Institutional Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("officex-toggle-sidebar"))}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 md:hidden cursor-pointer active:scale-95 transition-transform"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Clean Breadcrumb Hierarchy */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">OFFICEX</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-bold capitalize">
            {formattedBreadcrumb || "Commercial Portfolio"}
          </span>
        </div>
      </div>

      {/* Right Search, Notification and Profile Avatar */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search Input Box */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search assets, tickets, properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
              }}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs w-64 bg-slate-50 transition-colors"
            />
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Results
              </div>
              <div className="flex flex-col max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.name)}
                    className="p-3 text-left hover:bg-blue-50/50 flex items-center justify-between border-b border-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.type === "City" ? (
                        <MapPin size={14} className="text-blue-600" />
                      ) : item.type === "Asset" ? (
                        <Settings size={14} className="text-amber-500 animate-pulse" />
                      ) : item.type === "Ticket" || item.type === "Work Order" ? (
                        <FileText size={14} className="text-purple-500" />
                      ) : (
                        <Building size={14} className="text-blue-600" />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {item.location || item.count}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Link */}
        <Link
          href="/support"
          className="text-slate-500 hover:text-blue-600 transition-colors p-1"
          title="Help & Documentation"
        >
          <HelpCircle size={18} />
        </Link>

        {/* Notifications Icon with Red Dot */}
        <button className="relative text-slate-500 hover:text-blue-600 transition-colors p-1 cursor-pointer">
          <Bell size={18} />
          <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Mini Avatar & Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-blue-100"
          >
            {(userName || userEmail || "U")[0].toUpperCase()}
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn text-slate-800">
              <div className="p-3 border-b border-slate-100">
                <span suppressHydrationWarning className="text-xs font-bold text-slate-900 block truncate">{userName || userEmail}</span>
                {userName && <span className="text-[11px] text-slate-500 font-mono block truncate">{userEmail}</span>}
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Verified Commercial Account
                </span>
              </div>

              <div className="py-1 space-y-1">
                <Link
                  href="/properties"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Layers size={14} className="text-blue-600" />
                  <span>Portfolio Overview</span>
                </Link>

                <Link
                  href="/properties/organization"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Building2 size={14} className="text-slate-500" />
                  <span>Organization Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
