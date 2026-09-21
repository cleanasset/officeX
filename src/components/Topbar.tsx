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
  ChevronDown,
  Layers,
  LogOut,
  Check,
  ShieldCheck,
  Building2
} from "lucide-react";
import { WorkspaceMembership, MOCK_USERS } from "@/lib/auth-utils";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Workspace Switcher State
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeOrg, setActiveOrg] = useState("");
  const [activeRole, setActiveRole] = useState("Property Owner");
  const [userEmail, setUserEmail] = useState("owner@officex.in");
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>(
    MOCK_USERS["owner@officex.in"].memberships
  );
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
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
      const storedEmail = localStorage.getItem("officex_user_email");
      const storedRole = localStorage.getItem("officex_user_role");
      const storedOrg = localStorage.getItem("officex_active_org");

      if (storedEmail) setUserEmail(storedEmail);
      if (storedRole) setActiveRole(storedRole);
      if (storedOrg) {
        setActiveOrg(storedOrg);
      } else {
        // Fallback: try org_name from onboarding
        const orgName = localStorage.getItem("officex_org_name");
        if (orgName) setActiveOrg(orgName);
      }

      // Load matching memberships if available
      if (storedEmail && MOCK_USERS[storedEmail]) {
        setMemberships(MOCK_USERS[storedEmail].memberships);
      }
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
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
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

  // Switch Workspace context from Topbar
  const handleSwitchWorkspace = async (mem: WorkspaceMembership) => {
    setIsWorkspaceMenuOpen(false);
    setIsProfileMenuOpen(false);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("officex_user_role", mem.role);
      sessionStorage.setItem("officex_dashboard", mem.workspaceUrl);
      sessionStorage.setItem("officex_active_portal", mem.workspaceUrl.replace("/", ""));
      sessionStorage.setItem("officex_active_org", mem.orgName);

      localStorage.setItem("officex_user_role", mem.role);
      localStorage.setItem("officex_dashboard", mem.workspaceUrl);
      localStorage.setItem("officex_active_portal", mem.workspaceUrl.replace("/", ""));
      localStorage.setItem("officex_active_org", mem.orgName);

      document.cookie = `officex_user_role=${encodeURIComponent(mem.role)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `officex_dashboard=${encodeURIComponent(mem.workspaceUrl)}; path=/; max-age=86400; SameSite=Lax`;
    }

    try {
      await fetch("/api/session/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: mem.id,
          workspace_url: mem.workspaceUrl,
          role: mem.role,
          org_name: mem.orgName
        })
      });
    } catch (e) {
      // Non-blocking
    }

    window.location.href = mem.workspaceUrl;
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    }

    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("officex_session_active");
      localStorage.removeItem("officex_user_email");
      localStorage.removeItem("officex_user_role");
      localStorage.removeItem("officex_dashboard");
      localStorage.removeItem("officex_active_org");
      localStorage.removeItem("officex_active_portal");

      document.cookie = "officex_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie = "officex_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }

    window.location.href = "/login";
  };

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-[260px] z-20 px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs / Active Workspace Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("officex-toggle-sidebar"))}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 md:hidden cursor-pointer active:scale-95 transition-transform"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Workspace Context Switcher Pill (Section 06 & 14) */}
        <div className="relative" ref={workspaceMenuRef}>
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 group-hover:text-blue-700 leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                {activeOrg || "My Organization"}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-none">
                {activeRole}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-600 transition-transform ml-1" />
          </button>

          {/* Workspace Switcher Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Switch Workspace</span>
                  <span className="text-[10px] text-slate-500">Connected memberships</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {memberships.length} available
                </span>
              </div>

              <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                {memberships.map((mem) => {
                  const isActive = activeRole === mem.role;
                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => handleSwitchWorkspace(mem)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer ${
                        isActive
                          ? "bg-blue-50 border border-blue-200 text-blue-900"
                          : "hover:bg-slate-50 border border-transparent text-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{mem.orgName}</span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-600">
                          {mem.workspaceTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">{mem.propertyScope}</div>
                      </div>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href="/login"
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                  className="text-blue-600 hover:underline font-bold text-[11px]"
                >
                  Manage Organizations →
                </Link>
              </div>
            </div>
          )}
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
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-blue-100"
          >
            {userEmail ? userEmail[0].toUpperCase() : "U"}
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fadeIn text-slate-800">
              <div className="p-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block truncate">{userEmail}</span>
                <span className="text-[10px] text-blue-600 font-semibold">{activeRole}</span>
              </div>

              <div className="py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsWorkspaceMenuOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Layers size={14} className="text-blue-600" />
                  <span>Switch Workspace</span>
                </button>

                <Link
                  href="/onboarding"
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
