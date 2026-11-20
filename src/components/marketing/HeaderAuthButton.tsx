"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getAuthCookie, clearAuthCookie } from "@/lib/auth-storage";
import { performClientLogout, getLogoutRedirect } from "@/lib/auth-client";
import ModuleChooserModal from "@/components/dashboard/ModuleChooserModal";

interface HeaderAuthButtonProps {
  className?: string;
  /** Context key passed to /login?context=... for contextual portal filtering */
  loginContext?: "marketplace" | "fm" | "operate" | "properties" | "rent-roll" | "";
  /** Explicit redirect target; if omitted, automatically derives from current page URL */
  redirectUrl?: string;
  onSignInClick?: () => void;
}

export default function HeaderAuthButton({ className = "", loginContext = "", redirectUrl, onSignInClick }: HeaderAuthButtonProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModuleChooserOpen, setIsModuleChooserOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkAuth = (authUser?: any) => {
      if (typeof window !== "undefined") {
        const hasAuthCookie =
          document.cookie.includes("officex_session_active=1") ||
          document.cookie.includes("officex_auth=1") ||
          document.cookie.includes("officex_auth=true") ||
          getAuthCookie("officex_auth") === "1";
        const sessionActive =
          sessionStorage.getItem("officex_session_active") === "1" ||
          localStorage.getItem("officex_session_active") === "1";

        if (!hasAuthCookie && !sessionActive && !authUser) {
          setIsLoggedIn(false);
          setUserName("");
          setUserRole("");
          setIsSubscribed(false);
          return;
        }

        let email =
          authUser?.email ||
          sessionStorage.getItem("officex_user_email") ||
          localStorage.getItem("officex_user_email") ||
          getAuthCookie("officex_user_email") ||
          "";
        let name =
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          sessionStorage.getItem("officex_user_name") ||
          localStorage.getItem("officex_user_name") ||
          "";

        // If email belongs to jiya and name was defaulting to email prefix, normalize to "jiya"
        if ((!name || name.toLowerCase() === email.split("@")[0].toLowerCase() || name.toLowerCase() === "jiyapatel181224") && email.toLowerCase().startsWith("jiyapatel181224")) {
          name = "jiya";
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_user_name", "jiya");
            sessionStorage.setItem("officex_user_name", "jiya");
          }
        }

        if (!name && email) {
          name = email.split("@")[0].replace(/[._-]/g, " ");
        }
        if (!name) name = "Member";

        // Query active profile to ensure DB full name takes precedence
        if (email) {
          fetch("/api/users/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.user?.fullName) {
                const dbName = data.user.fullName.trim();
                if (dbName && /[a-zA-Z]/.test(dbName) && dbName.toLowerCase() !== email.split("@")[0].toLowerCase()) {
                  setUserName(dbName);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("officex_user_name", dbName);
                    sessionStorage.setItem("officex_user_name", dbName);
                  }
                }
              }
            })
            .catch(() => {});
        }

        const rawRole =
          authUser?.user_metadata?.role ||
          sessionStorage.getItem("officex_user_role") ||
          localStorage.getItem("officex_user_role") ||
          "Property Owner & Asset Manager";

        let role = "Property Owner & Asset Manager";
        if (rawRole === "super_admin" || rawRole === "Super Administrator" || email === "admin@gmail.com" || email === "medistationlifecare@gmail.com") {
          role = "Super Administrator";
        } else if (rawRole === "tenant" || rawRole === "tenant_admin" || rawRole === "Tenant Occupant") {
          role = "Tenant Occupant";
        } else if (rawRole === "broker" || rawRole === "Broker / Channel Partner") {
          role = "Broker / Channel Partner";
        } else if (rawRole === "vendor" || rawRole === "vendor_admin" || rawRole === "Facility / Service Vendor") {
          role = "Facility / Service Vendor";
        } else if (rawRole === "owner" || rawRole === "Property Owner & Asset Manager" || rawRole === "Commercial Owner" || rawRole === "Property Manager") {
          role = "Property Owner & Asset Manager";
          if (typeof window !== "undefined") {
            localStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
            sessionStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
          }
        } else {
          role = rawRole;
        }

        const globalSub =
          localStorage.getItem("officex_subscription") === "active" ||
          sessionStorage.getItem("officex_subscription") === "active" ||
          document.cookie.includes("officex_subscription=active");

        const sub = globalSub || (email
          ? sessionStorage.getItem(`officex_sub_${email}`) === "active" ||
            localStorage.getItem(`officex_sub_${email}`) === "active" ||
            document.cookie.includes(`officex_sub_${encodeURIComponent(email)}=active`)
          : false);

        setIsLoggedIn(true);
        setUserName(name);
        setUserRole(role);
        setIsSubscribed(sub);
      }
    };

    checkAuth();

    // Check Supabase session directly on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAuth(session.user);
      }
    }).catch(() => {});

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAuth(session.user);
      } else if (event === "SIGNED_OUT") {
        checkAuth(null);
      }
    });

    window.addEventListener("storage", () => checkAuth());
    window.addEventListener("officex_auth_change", ((e: CustomEvent) => checkAuth(e?.detail?.user)) as EventListener);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("storage", () => checkAuth());
      window.removeEventListener("officex_auth_change", ((e: CustomEvent) => checkAuth(e?.detail?.user)) as EventListener);
    };
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setMenuOpen(false);
    await performClientLogout(getLogoutRedirect(targetRedirect));
  };

  // Determine exact destination page where user currently is
  const targetRedirect = redirectUrl || (typeof window !== "undefined" && window.location.pathname ? `${window.location.pathname}${window.location.search || ""}` : pathname) || "/";

  const effectiveContext = loginContext || (
    targetRedirect.includes("rent-roll") ? "rent-roll" :
    targetRedirect.includes("fm-marketplace") ? "fm" :
    targetRedirect.includes("operate") ? "operate" :
    targetRedirect.includes("properties") ? "properties" :
    targetRedirect.includes("marketplace") ? "marketplace" : ""
  );

  const queryParams = new URLSearchParams();
  if (effectiveContext) {
    queryParams.set("context", effectiveContext);
  }
  queryParams.set("redirect", targetRedirect);

  const loginHref = `/login?${queryParams.toString()}`;

  const getDashboardTarget = () => {
    const p = (pathname || "").toLowerCase();
    if (p.includes("/operate/rent-roll") || p.includes("/properties/rent-roll") || p.includes("/properties/registry")) {
      if (isSubscribed) {
        return { href: "/properties/rent-roll", label: "Open Rent Roll Dashboard", sub: "Institutional Leases & Billing" };
      }
      return { href: "/properties/registry", label: "Open Property Registry", sub: "Properties, Units & Leases" };
    }
    if (p.includes("/operate/visitors")) {
      return { href: "/visitors", label: "Open Visitor Management", sub: "Digital Kiosk & QR Passes" };
    }
    if (p.includes("/operate/ppm")) {
      return { href: "/operate/ppm", label: "Open PPM Maintenance", sub: "52-Week MEP Maintenance" };
    }
    if (p.includes("/operate/compliance")) {
      return { href: "/operate/compliance", label: "Open Compliance Calendar", sub: "Statutory Licenses & NOCs" };
    }
    if (p.includes("/operate/helpdesk")) {
      return { href: "/operate/helpdesk", label: "Open Facility Helpdesk", sub: "SLA Tickets & Work Orders" };
    }
    if (p.includes("/operate/lease-crm")) {
      return { href: "/operate/lease-crm", label: "Open Commercial Leasing CRM", sub: "Stacking Plans & Pipeline" };
    }
    if (p === "/operate" || p.startsWith("/operate")) {
      return { href: "/dashboard?context=operate", label: "Open SaaS Workspaces Hub", sub: "Select Commercial SaaS Tool" };
    }
    if (p.includes("/marketplace") && !p.includes("/fm-marketplace")) {
      return { href: "/marketplace", label: "Open Office Marketplace", sub: "Commercial Listings & Leads" };
    }
    if (p.includes("/fm-marketplace")) {
      return { href: "/fm-marketplace", label: "Open FM Procurement Desk", sub: "RFQs, Vendor Bids & Work Orders" };
    }
    return { href: "/dashboard", label: "Go to My Dashboard", sub: "Choose Your Active Workspace" };
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = getDashboardTarget();
    router.push(target.href);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    router.push("/settings");
  };

  if (!mounted) {
    return (
      <Link
        href={loginHref}
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors ${className}`}
      >
        Sign In
      </Link>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all border border-slate-200 shadow-2xs cursor-pointer"
          title={`Signed in as ${userName}`}
        >
          <div className="w-5 h-5 rounded-full bg-[#0F8B7D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[110px] truncate font-bold text-slate-800">{userName.split(" ")[0]}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Profile Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 text-sm truncate">{userName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  Signed In
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{userRole}</p>
            </div>

            {/* Core User Navigation */}
            <div className="py-1.5 space-y-0.5">
              {/* Context-aware Dashboard entry */}
              {(() => {
                const target = getDashboardTarget();
                return (
                  <button
                    type="button"
                    onClick={handleDashboardClick}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <LayoutDashboard size={13} className="stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">{target.label}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {target.sub}
                      </span>
                    </div>
                  </button>
                );
              })()}

              {/* Profile & KYC */}
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:text-[#0F8B7D] hover:bg-teal-50/70 transition-colors group text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <User size={13} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-[#0F8B7D] transition-colors">Profile &amp; KYC</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isSubscribed ? "Account &amp; Organization" : "Subscription Required"}
                  </span>
                </div>
              </button>
            </div>

            {/* Sign Out */}
            <div className="pt-1.5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-Module Chooser Modal */}
        <ModuleChooserModal
          isOpen={isModuleChooserOpen}
          onClose={() => setIsModuleChooserOpen(false)}
        />
      </div>
    );
  }

  if (onSignInClick) {
    return (
      <button
        type="button"
        onClick={onSignInClick}
        className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors cursor-pointer ${className}`}
      >
        Sign In
      </button>
    );
  }

  return (
    <Link
      href={loginHref}
      className={`text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors cursor-pointer ${className}`}
    >
      Sign In
    </Link>
  );
}
