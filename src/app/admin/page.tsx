"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, 
  Search, Filter, Shield, ShieldCheck, X, FileText, Check, Store, Sparkles, 
  DollarSign, ArrowUpRight, ChevronRight, Eye, Building2, UserCheck,
  Users, Layers, Zap, Briefcase, RefreshCw, Lock, Unlock, Edit3,
  SlidersHorizontal, Download, Plus, CheckCircle2, ChevronLeft,
  Database, Table, Coins, Save, Trash2, Copy, FileJson, Info,
  Sliders, ArrowUpDown
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "db" | "pricing" | "marketplace" | "fm" | "saas" | "users" | "bulk">("overview");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Platform stats
  const [stats, setStats] = useState<any>({
    totalMarketplaceListings: 6767,
    activeMarketplaceListings: 6098,
    totalRegisteredUsers: 42,
    totalOrganizations: 15,
    totalRentRollProperties: 28,
    totalActiveContracts: 84,
    platformArrEstimate: "₹14.8 Cr",
    platformMonthlyGtv: "₹1.23 Cr"
  });

  // =========================================================================
  // TAB 1: DATABASE EXPLORER STATE
  // =========================================================================
  const [dbTables, setDbTables] = useState<Array<{ name: string; count: number }>>([]);
  const [dbCategories, setDbCategories] = useState<Record<string, string[]>>({});
  const [selectedTable, setSelectedTable] = useState<string>("marketplace_listings");
  const [dbColumns, setDbColumns] = useState<any[]>([]);
  const [dbPrimaryKey, setDbPrimaryKey] = useState<string>("id");
  const [dbRows, setDbRows] = useState<any[]>([]);
  const [dbTotalRows, setDbTotalRows] = useState<number>(0);
  const [dbPage, setDbPage] = useState<number>(1);
  const [dbLimit, setDbLimit] = useState<number>(15);
  const [dbSearch, setDbSearch] = useState<string>("");
  const [dbSortBy, setDbSortBy] = useState<string>("");
  const [dbSortDir, setDbSortDir] = useState<"asc" | "desc">("desc");
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [tableFilterSearch, setTableFilterSearch] = useState<string>("");

  // Inspect Row Modal State
  const [inspectRow, setInspectRow] = useState<any | null>(null);
  const [inspectModalTab, setInspectModalTab] = useState<"table" | "json">("table");

  // Edit Row Modal State
  const [editRowData, setEditRowData] = useState<any | null>(null);
  const [editRowLoading, setEditRowLoading] = useState<boolean>(false);

  // =========================================================================
  // TAB 2: MASTER PRICING STATE
  // =========================================================================
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState<boolean>(false);
  const [pricingSaving, setPricingSaving] = useState<boolean>(false);
  const [bulkPricingCity, setBulkPricingCity] = useState<string>("all");
  const [bulkPricingPct, setBulkPricingPct] = useState<number>(5);
  const [bulkPricingApplying, setBulkPricingApplying] = useState<boolean>(false);

  // =========================================================================
  // TAB 3: MARKETPLACE STATE
  // =========================================================================
  const [mpListings, setMpListings] = useState<any[]>([]);
  const [mpLoading, setMpLoading] = useState<boolean>(false);
  const [mpSearch, setMpSearch] = useState<string>("");
  const [mpCity, setMpCity] = useState<string>("all");
  const [mpPage, setMpPage] = useState<number>(1);
  const [mpTotalPages, setMpTotalPages] = useState<number>(1);
  const [editingListing, setEditingListing] = useState<any | null>(null);

  // =========================================================================
  // TAB 4: USERS STATE
  // =========================================================================
  const [usersList, setUsersList] = useState<any[]>([]);
  const [orgsList, setOrgsList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  // =========================================================================
  // TAB 5: BULK PROPERTIES STATE
  // =========================================================================
  const [bulkInput, setBulkInput] = useState<string>(
    "Prestige Cyber Tech, Bengaluru, 45000\nDivi Towers, Hyderabad, 32000\nCyber Horizon, Gurgaon, 65000\nDLF Square, Noida, 28000"
  );
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // =========================================================================
  // TAB 6: FM MARKETPLACE STATE
  // =========================================================================
  const [fmRfqs, setFmRfqs] = useState<any[]>([]);
  const [fmLoading, setFmLoading] = useState<boolean>(false);

  // =========================================================================
  // TAB 7: SAAS PORTFOLIOS STATE
  // =========================================================================
  const [saasProperties, setSaasProperties] = useState<any[]>([]);
  const [saasLoading, setSaasLoading] = useState<boolean>(false);

  // =========================================================================
  // DATA LOADERS
  // =========================================================================

  // Overview stats loader & initial asset hydration
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/overview");
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error("Failed to load overview:", e);
      }
      loadUsersAndOrgs();
      loadSaasProperties();
    }
    loadStats();
  }, []);

  // Database tables list loader
  useEffect(() => {
    if (activeTab === "db" && dbTables.length === 0) {
      loadDbTables();
    }
  }, [activeTab]);

  async function loadDbTables() {
    try {
      const res = await fetch("/api/admin/db?action=tables");
      const data = await res.json();
      if (data.success) {
        setDbTables(data.tables || []);
        setDbCategories(data.categories || {});
      }
    } catch (e) {
      console.error("Failed to load DB tables:", e);
    }
  }

  // Load records for selected database table
  useEffect(() => {
    if (activeTab === "db" && selectedTable) {
      loadTableData();
    }
  }, [selectedTable, dbPage, dbLimit, dbSortBy, dbSortDir, activeTab]);

  async function loadTableData() {
    setDbLoading(true);
    try {
      const sortParam = dbSortBy ? `&sortBy=${encodeURIComponent(dbSortBy)}&sortDir=${dbSortDir}` : "";
      const searchParam = dbSearch.trim() ? `&search=${encodeURIComponent(dbSearch.trim())}` : "";
      const url = `/api/admin/db?table=${encodeURIComponent(selectedTable)}&page=${dbPage}&limit=${dbLimit}${sortParam}${searchParam}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDbColumns(data.columns || []);
        setDbPrimaryKey(data.primaryKey || "id");
        setDbRows(data.rows || []);
        setDbTotalRows(data.pagination?.total || 0);
      } else {
        showToast(data.error || "Failed to load table data", "error");
      }
    } catch (e: any) {
      showToast("Error loading table records", "error");
    } finally {
      setDbLoading(false);
    }
  }

  // Master Pricing Loader
  useEffect(() => {
    if (activeTab === "pricing") {
      loadPricingConfig();
    }
  }, [activeTab]);

  async function loadPricingConfig() {
    setPricingLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && data.pricing) {
        setPricingConfig(data.pricing);
      }
    } catch (e) {
      showToast("Failed to load global pricing matrix", "error");
    } finally {
      setPricingLoading(false);
    }
  }

  async function handleSavePricing() {
    if (!pricingConfig) return;
    setPricingSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: pricingConfig })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Global Pricing Matrix updated and active across OfficeX!");
      } else {
        showToast(data.error || "Failed to update pricing", "error");
      }
    } catch {
      showToast("Network error saving pricing", "error");
    } finally {
      setPricingSaving(false);
    }
  }

  async function handleApplyBulkMarketplacePricing() {
    if (!pricingConfig) return;
    if (!confirm(`Are you sure you want to adjust all marketplace listing prices by ${bulkPricingPct > 0 ? "+" : ""}${bulkPricingPct}% ${bulkPricingCity !== "all" ? `in ${bulkPricingCity}` : "nationwide"}?`)) {
      return;
    }
    setBulkPricingApplying(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing: pricingConfig,
          applyToMarketplaceListings: true,
          city: bulkPricingCity,
          percentageAdjustment: bulkPricingPct
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Updated ${data.bulkModifiedCount || 0} marketplace listing prices!`);
      } else {
        showToast(data.error || "Bulk price update failed", "error");
      }
    } catch {
      showToast("Bulk price update error", "error");
    } finally {
      setBulkPricingApplying(false);
    }
  }

  // Marketplace tab loader
  useEffect(() => {
    if (activeTab === "marketplace") {
      loadMarketplaceListings();
    }
  }, [activeTab, mpPage, mpCity]);

  async function loadMarketplaceListings() {
    setMpLoading(true);
    try {
      const url = `/api/admin/marketplace?page=${mpPage}&limit=15&q=${encodeURIComponent(mpSearch)}&city=${encodeURIComponent(mpCity)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMpListings(data.listings || []);
        setMpTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to load marketplace listings:", e);
    } finally {
      setMpLoading(false);
    }
  }

  // FM RFQs loader
  useEffect(() => {
    if (activeTab === "fm") {
      loadFmRfqs();
    }
  }, [activeTab]);

  async function loadFmRfqs() {
    setFmLoading(true);
    try {
      const res = await fetch("/api/rfqs");
      const data = await res.json();
      if (data.success && data.rfqs) {
        setFmRfqs(data.rfqs);
      }
    } catch (e) {
      console.error("Failed to load FM RFQs:", e);
    } finally {
      setFmLoading(false);
    }
  }

  // SaaS Properties loader
  useEffect(() => {
    if (activeTab === "saas") {
      loadSaasProperties();
    }
  }, [activeTab]);

  async function loadSaasProperties() {
    setSaasLoading(true);
    try {
      const res = await fetch("/api/rent-roll/properties");
      const data = await res.json();
      if (data.success && data.properties) {
        setSaasProperties(data.properties);
      }
    } catch (e) {
      console.error("Failed to load SaaS properties:", e);
    } finally {
      setSaasLoading(false);
    }
  }

  // Users loader
  useEffect(() => {
    if (activeTab === "users") {
      loadUsersAndOrgs();
    }
  }, [activeTab]);

  async function loadUsersAndOrgs() {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
        setOrgsList(data.organizations || []);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setUsersLoading(false);
    }
  }

  // =========================================================================
  // DATABASE RECORD ACTIONS
  // =========================================================================

  async function handleSaveRowEdit() {
    if (!editRowData) return;
    setEditRowLoading(true);
    try {
      const pkVal = editRowData[dbPrimaryKey];
      const res = await fetch("/api/admin/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          id: pkVal,
          primaryKeyCol: dbPrimaryKey,
          data: editRowData
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Updated record in ${selectedTable}`);
        setEditRowData(null);
        loadTableData();
      } else {
        showToast(data.error || "Failed to update record", "error");
      }
    } catch {
      showToast("Error updating database record", "error");
    } finally {
      setEditRowLoading(false);
    }
  }

  async function handleDeleteRow(row: any) {
    const pkVal = row[dbPrimaryKey];
    if (!confirm(`Are you sure you want to permanently delete record ${pkVal} from ${selectedTable}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/db", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          id: pkVal,
          primaryKeyCol: dbPrimaryKey
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Deleted record ${pkVal} from ${selectedTable}`);
        loadTableData();
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch {
      showToast("Error deleting database record", "error");
    }
  }

  // Toggle Organization Subscription
  async function handleToggleSubscription(orgId: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, subscriptionStatus: nextStatus })
      });
      if (res.ok) {
        setOrgsList(prev => prev.map(o => o.id === orgId ? { ...o, subscriptionStatus: nextStatus } : o));
        showToast(`Organization subscription set to ${nextStatus.toUpperCase()}`);
      }
    } catch (e) {
      showToast("Failed to update subscription", "error");
    }
  }

  // Toggle Marketplace Listing status
  async function handleToggleListingStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        setMpListings(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus } : l));
        showToast(`Listing ${id.slice(0, 8)} status set to ${nextStatus}`);
      }
    } catch (e) {
      showToast("Failed to update listing status", "error");
    }
  }

  // Save Listing Edits
  async function handleSaveListingEdit() {
    if (!editingListing) return;
    try {
      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingListing.id,
          name: editingListing.name,
          brandName: editingListing.brandName,
          startingPrice: editingListing.startingPrice,
          status: editingListing.status
        })
      });
      if (res.ok) {
        setMpListings(prev => prev.map(l => l.id === editingListing.id ? editingListing : l));
        setEditingListing(null);
        showToast("Listing saved successfully!");
      }
    } catch {
      showToast("Error updating listing", "error");
    }
  }

  // Process Bulk Properties Simulation
  async function handleProcessBulk() {
    setBulkLoading(true);
    try {
      const lines = bulkInput.split("\n").map(l => l.trim()).filter(Boolean);
      const props = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          name: parts[0] || "Commercial Property",
          city: parts[1] || "Bengaluru",
          areaSqft: Number(parts[2]) || 25000,
        };
      });

      const res = await fetch("/api/admin/bulk-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties: props, simulateOnly: true })
      });
      const data = await res.json();
      if (data.success) {
        setBulkResults(data.properties || []);
        showToast(`✓ Generated unique collision-proof codes for ${data.totalProcessed} properties!`);
      }
    } catch {
      showToast("Failed to process bulk properties", "error");
    } finally {
      setBulkLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Filter tables list based on search
  const filteredDbTables = dbTables.filter(t => 
    !tableFilterSearch.trim() || t.name.toLowerCase().includes(tableFilterSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans relative max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn ${
          toast.type === "error" ? "bg-rose-900 border-rose-700" : "bg-slate-900 border-slate-700"
        }`}>
          {toast.type === "error" ? (
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle size={16} className="text-teal-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header with Admin Badge & Live Links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-removebg-preview.png"
            alt="OfficeX"
            width={44}
            height={44}
            className="object-contain shrink-0"
            style={{ width: "auto", height: "40px" }}
            priority
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck size={12} className="text-teal-400" />
                SOVEREIGN ADMIN
              </span>
              <span className="text-xs text-teal-300 font-mono font-bold">medistationlifecare@gmail.com</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 font-bold">Medistn tech</span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 font-mono">admin@gmail.com</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              OfficeX Master Platform Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Universal control for all database records, platform pricing, marketplaces, and SaaS portfolios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/admin/login"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Lock size={13} />
            <span>Admin Auth Status</span>
          </a>
          <a
            href="/marketplace"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Live Marketplace</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto border border-slate-200">
        {[
          { id: "overview", label: "Overview & Telemetry", icon: TrendingUp },
          { id: "db", label: `Database Explorer (${dbTables.length || "133"} Tables)`, icon: Database },
          { id: "pricing", label: "Master Pricing & Tariffs", icon: Coins },
          { id: "marketplace", label: `Office Marketplace (${stats.totalMarketplaceListings})`, icon: Building2 },
          { id: "fm", label: "FM Marketplace & RFQs", icon: Briefcase },
          { id: "saas", label: `SaaS & Rent Roll (${stats.totalRentRollProperties})`, icon: Layers },
          { id: "users", label: `Users & Subscriptions (${stats.totalRegisteredUsers})`, icon: Users },
          { id: "bulk", label: "Bulk Property Code Engine", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[#0F8B7D]" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB: OVERVIEW & TELEMETRY
          ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Marketplace Listings</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalMarketplaceListings.toLocaleString()}</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">✓ {stats.activeMarketplaceListings.toLocaleString()} Active Listings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rent Roll Properties</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalRentRollProperties}</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">Across 15 Organizations</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Platform Users</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalRegisteredUsers}</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">Super Admin, Owners &amp; Tenants</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Lease Contracts</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalActiveContracts}</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">Est. GTV {stats.platformMonthlyGtv}/mo</div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F8B7D] text-white flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Live Database Explorer &amp; Record Inspector</h4>
                  <p className="text-xs text-slate-600">Inspect every single column, raw JSON detail, and edit records across 133 tables.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("db")}
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
              >
                Open Database Explorer →
              </button>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Coins size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Master Pricing &amp; Tariffs Matrix</h4>
                  <p className="text-xs text-slate-600">Control marketplace starting rates, FM commission %, and SaaS tier pricing.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("pricing")}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
              >
                Open Pricing Control Center →
              </button>
            </div>
          </div>

          {/* =========================================================================
              MANAGED ENTITIES & ASSET ALLOCATION: WHICH MARKETPLACE & WHICH SAAS
              ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    SOVEREIGN ASSET ALLOCATION MATRIX
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Account: medistationlifecare@gmail.com</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Which Marketplace &amp; Which SaaS Are You Managing?
                </h3>
                <p className="text-xs text-slate-500">
                  Direct breakdown of all verified marketplaces, commercial buildings, and SaaS ERP modules under your active management.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("marketplace")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 size={13} className="text-teal-700" />
                  <span>Marketplaces ({stats.totalMarketplaceListings})</span>
                </button>
                <button
                  onClick={() => setActiveTab("saas")}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers size={13} className="text-[#0F8B7D]" />
                  <span>SaaS Portfolios (9 Properties)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pillar A: MARKETPLACES YOU MANAGE */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50/50 to-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0F8B7D] text-white flex items-center justify-center font-bold">
                      <Store size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">1. Office Marketplace</h4>
                      <span className="text-[11px] text-teal-700 font-semibold">6,767 Verified Listings · 7 Major Metros</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    Active &amp; Governed
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 bg-white border border-slate-200 rounded-xl p-3.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Coverage Regions:</span>
                    <span className="font-bold text-slate-900">Delhi-NCR, Bengaluru, Mumbai, Pune, Hyderabad, Kolkata</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Space Inventory:</span>
                    <span className="font-bold text-slate-900">Hot Desks, Dedicated Desks, Private Cabins, Enterprise Suites</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Managed Pricing Floor:</span>
                    <span className="font-mono font-bold text-slate-900">₹7,999 to ₹18,500/mo</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Verified Operators:</span>
                    <span className="font-bold text-slate-900">Awfis, 91Springboard, WeWork, Innov8, Independent Hubs</span>
                  </div>
                </div>

                {/* Sub-Pillar: FM Marketplace */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">2. FM Marketplace (Procurement Gateway)</h4>
                        <span className="text-[10px] text-slate-500">Facility management contracts &amp; vendor KYC</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold uppercase">
                      5.0% Commission
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-100/70 text-slate-700">
                      <span className="font-bold block text-slate-900">Deep Cleaning &amp; Housekeeping</span>
                      <span>₹1.80/sqft base callout</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 text-slate-700">
                      <span className="font-bold block text-slate-900">HVAC AMC &amp; VRV</span>
                      <span>₹2,200/ton annual contract</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 text-slate-700">
                      <span className="font-bold block text-slate-900">PSARA Security Guarding</span>
                      <span>₹24,000/guard/month</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 text-slate-700">
                      <span className="font-bold block text-slate-900">Electrical &amp; DG Sets</span>
                      <span>₹1.20/sqft inspection</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab("marketplace")}
                    className="flex-1 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer text-center"
                  >
                    Manage Marketplace Listings →
                  </button>
                  <button
                    onClick={() => setActiveTab("pricing")}
                    className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Adjust Tariffs
                  </button>
                </div>
              </div>

              {/* Pillar B: SAAS MODULES & COMMERCIAL PORTFOLIOS YOU MANAGE */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50/50 to-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">SaaS Portfolios &amp; Commercial ERP</h4>
                      <span className="text-[11px] text-indigo-700 font-semibold">9 Active Commercial Buildings · 84 Leases</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Live ERP Active
                  </span>
                </div>

                {/* Primary User Property Callout */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                      ★ Your Primary Sovereign Commercial Asset:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-mono text-[10px] font-bold">
                      Code: SYT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black text-slate-900">SYNERGY TOWER</h5>
                    <span className="text-xs text-slate-600 font-medium">Noida, Uttar Pradesh</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Organization: <span className="font-semibold text-slate-800">medistationlifecare's Commercial Entity</span>
                  </p>
                </div>

                {/* Active SaaS Modules Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Active SaaS Modules Under Your Governance:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        Rent Roll &amp; Leases
                      </span>
                      <span className="text-[10px] text-slate-500">39-point agreement register</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        Invoicing &amp; Billing
                      </span>
                      <span className="text-[10px] text-slate-500">Automated monthly rent runs</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        CAM Pooling Ledger
                      </span>
                      <span className="text-[10px] text-slate-500">Quarterly true-up engine</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        Smart Submetering
                      </span>
                      <span className="text-[10px] text-slate-500">Power, water &amp; BTU meters</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        CAFM Work Orders
                      </span>
                      <span className="text-[10px] text-slate-500">Preventive maintenance</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Check size={13} className="text-teal-600" />
                        Visitor &amp; Access (VC)
                      </span>
                      <span className="text-[10px] text-slate-500">Turnstile clearance &amp; badges</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href="/properties/rent-roll"
                    target="_blank"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer text-center"
                  >
                    Launch Commercial Rent Roll ERP →
                  </a>
                  <button
                    onClick={() => setActiveTab("saas")}
                    className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    View All 9 Buildings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: UNIVERSAL DATABASE EXPLORER & RECORD INSPECTOR
          ========================================================================= */}
      {activeTab === "db" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Universal Database Explorer &amp; Record Inspector</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                    PostgreSQL Live
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Inspect every single detail stored in the database. Filter, sort, inspect full JSON blobs, and edit records in real time.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search in table */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search in ${selectedTable}...`}
                    value={dbSearch}
                    onChange={(e) => setDbSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadTableData()}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none w-56 focus:border-teal-500"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Refresh Table */}
                <button
                  onClick={() => loadTableData()}
                  className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  title="Reload table records"
                >
                  <RefreshCw size={14} className={dbLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Table Selector Strip with Categories */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Table size={13} className="text-teal-600" />
                  <span>Select Table to Inspect ({dbTables.length} total in schema):</span>
                </span>
                <input
                  type="text"
                  placeholder="Filter table names..."
                  value={tableFilterSearch}
                  onChange={(e) => setTableFilterSearch(e.target.value)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 outline-none font-normal"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
                {filteredDbTables.slice(0, 30).map((tbl) => {
                  const isSelected = selectedTable === tbl.name;
                  return (
                    <button
                      key={tbl.name}
                      onClick={() => {
                        setSelectedTable(tbl.name);
                        setDbPage(1);
                        setDbSearch("");
                        setDbSortBy("");
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{tbl.name}</span>
                      {tbl.count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? "bg-teal-500/30 text-teal-300" : "bg-slate-200 text-slate-600"
                        }`}>
                          {tbl.count > 999 ? `${(tbl.count/1000).toFixed(1)}k` : tbl.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Meta Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-mono">public.{selectedTable}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{dbTotalRows.toLocaleString()} Total Records</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{dbColumns.length} Columns</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-mono text-[11px]">PK: {dbPrimaryKey}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Rows per page:</span>
                <select
                  value={dbLimit}
                  onChange={(e) => {
                    setDbLimit(Number(e.target.value));
                    setDbPage(1);
                  }}
                  className="p-1 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Live Data Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 bg-slate-50 border-r border-slate-200 text-center w-28">Actions</th>
                    {dbColumns.map((col) => (
                      <th
                        key={col.column_name}
                        onClick={() => {
                          if (dbSortBy === col.column_name) {
                            setDbSortDir(d => d === "asc" ? "desc" : "asc");
                          } else {
                            setDbSortBy(col.column_name);
                            setDbSortDir("desc");
                          }
                        }}
                        className="p-3 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{col.column_name}</span>
                          <span className="text-[9px] text-slate-400 font-normal lowercase font-mono">({col.data_type})</span>
                          {dbSortBy === col.column_name && (
                            <ArrowUpDown size={11} className="text-teal-600 ml-1" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbLoading ? (
                    <tr>
                      <td colSpan={dbColumns.length + 1} className="p-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={16} className="animate-spin text-teal-600" />
                          <span>Querying PostgreSQL {selectedTable}...</span>
                        </div>
                      </td>
                    </tr>
                  ) : dbRows.length === 0 ? (
                    <tr>
                      <td colSpan={dbColumns.length + 1} className="p-12 text-center text-slate-400">
                        No records found in table `{selectedTable}`.
                      </td>
                    </tr>
                  ) : (
                    dbRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/40 transition">
                        {/* Action buttons */}
                        <td className="p-2 border-r border-slate-100 whitespace-nowrap text-center bg-white sticky left-0 shadow-2xs">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setInspectRow(row);
                                setInspectModalTab("table");
                              }}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition cursor-pointer"
                              title="Inspect Every Detail & Raw JSON"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => setEditRowData({ ...row })}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Edit Row"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Render all row values */}
                        {dbColumns.map((col) => {
                          const val = row[col.column_name];
                          let displayVal = "—";
                          let isJson = false;

                          if (val !== null && val !== undefined) {
                            if (typeof val === "object") {
                              displayVal = JSON.stringify(val);
                              isJson = true;
                            } else if (typeof val === "boolean") {
                              displayVal = val ? "true" : "false";
                            } else {
                              displayVal = String(val);
                            }
                          }

                          return (
                            <td key={col.column_name} className="p-3 max-w-[240px] truncate font-mono text-[11px]">
                              {isJson ? (
                                <button
                                  onClick={() => {
                                    setInspectRow(row);
                                    setInspectModalTab("json");
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-700 hover:bg-teal-100 font-bold text-[10px] truncate max-w-[200px] text-left block"
                                >
                                  {displayVal.slice(0, 35)}...
                                </button>
                              ) : typeof val === "boolean" ? (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  val ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {displayVal}
                                </span>
                              ) : (
                                <span title={displayVal}>{displayVal}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Showing {dbRows.length} of {dbTotalRows.toLocaleString()} rows (Page {dbPage} of {Math.ceil(dbTotalRows / dbLimit) || 1})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={dbPage <= 1}
                  onClick={() => setDbPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={dbPage >= Math.ceil(dbTotalRows / dbLimit)}
                  onClick={() => setDbPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: MASTER PRICING & TARIFFS CONTROL CENTER
          ========================================================================= */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">OfficeX Master Pricing &amp; Tariffs Matrix</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    Executive Control
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Admin governance over marketplace starting rates, FM rate cards, vendor commissions, and SaaS module subscription fees.
                </p>
              </div>

              <button
                disabled={pricingSaving || !pricingConfig}
                onClick={handleSavePricing}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                <Save size={14} />
                <span>{pricingSaving ? "Persisting to Database..." : "Save & Activate Global Pricing"}</span>
              </button>
            </div>

            {pricingLoading || !pricingConfig ? (
              <div className="p-12 text-center text-slate-400">Loading pricing matrix from system KV store...</div>
            ) : (
              <div className="space-y-8">
                {/* 1. Office Marketplace Tariffs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 size={16} className="text-[#0F8B7D]" />
                        <span>Office Marketplace Starting &amp; Floor Rates</span>
                      </h3>
                      <p className="text-xs text-slate-500">Base monthly rates for desk configurations, private suites, and passes.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Hot Desk (INR/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.hotDeskMonthlyMin || 7999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            hotDeskMonthlyMin: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Default starting price</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Dedicated Desk (INR/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.dedicatedDeskMonthlyMin || 11999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            dedicatedDeskMonthlyMin: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Reserved seat standard</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Private Cabin (INR/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.privateCabinMonthlyMin || 15999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            privateCabinMonthlyMin: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Acoustic private suite</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Managed Office (INR/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.managedOfficeMonthlyMin || 18500}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            managedOfficeMonthlyMin: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Enterprise turnkey unit</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Day Pass (INR/day)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.dayPassRate || 499}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            dayPassRate: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Walk-in daily tariff</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Virtual Office (INR/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.officeMarketplace?.virtualOfficeMonthlyMin || 1499}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          officeMarketplace: {
                            ...pricingConfig.officeMarketplace,
                            virtualOfficeMonthlyMin: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">GST Registration &amp; Mail</span>
                    </div>
                  </div>

                  {/* Bulk Marketplace Listing Price Modifier */}
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Bulk Marketplace Listings Price Modifier</h4>
                      <p className="text-[11px] text-slate-600">
                        Adjust starting prices across all 6,767 live marketplace listings in one click by applying a percentage markup or discount.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={bulkPricingCity}
                        onChange={(e) => setBulkPricingCity(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                      >
                        <option value="all">All Cities (Nationwide)</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Noida">Noida</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                      </select>

                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs">
                        <span className="font-bold text-slate-500">%</span>
                        <input
                          type="number"
                          value={bulkPricingPct}
                          onChange={(e) => setBulkPricingPct(Number(e.target.value))}
                          className="w-14 font-mono font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <button
                        disabled={bulkPricingApplying}
                        onClick={handleApplyBulkMarketplacePricing}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                      >
                        {bulkPricingApplying ? "Updating..." : "Apply Price Adjustment"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. FM Marketplace Rate Cards */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Briefcase size={16} className="text-teal-700" />
                      <span>Facility Management (FM) Rate Cards &amp; Platform Commission</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard vendor callout fees, category rate cards, and OfficeX platform fee on awarded contracts.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Platform Commission %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={pricingConfig.fmMarketplace?.platformCommissionPct || 5.0}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          fmMarketplace: {
                            ...pricingConfig.fmMarketplace,
                            platformCommissionPct: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-teal-700 font-semibold">% fee on awarded RFQ contracts</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Deep Cleaning (₹/sqft)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={pricingConfig.fmMarketplace?.rateCards?.deepCleaningPerSqft || 1.8}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          fmMarketplace: {
                            ...pricingConfig.fmMarketplace,
                            rateCards: {
                              ...pricingConfig.fmMarketplace?.rateCards,
                              deepCleaningPerSqft: Number(e.target.value)
                            }
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Institutional floor rate</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">HVAC AMC (₹/ton/yr)</label>
                      <input
                        type="number"
                        value={pricingConfig.fmMarketplace?.rateCards?.hvacAmcPerTonAnnual || 2200}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          fmMarketplace: {
                            ...pricingConfig.fmMarketplace,
                            rateCards: {
                              ...pricingConfig.fmMarketplace?.rateCards,
                              hvacAmcPerTonAnnual: Number(e.target.value)
                            }
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Chiller &amp; VRV annual plan</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Security Guard (₹/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.fmMarketplace?.rateCards?.securityGuardPerMonth || 24000}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          fmMarketplace: {
                            ...pricingConfig.fmMarketplace,
                            rateCards: {
                              ...pricingConfig.fmMarketplace?.rateCards,
                              securityGuardPerMonth: Number(e.target.value)
                            }
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">PSARA certified 8-hr shift</span>
                    </div>
                  </div>
                </div>

                {/* 3. SaaS Subscription Modules & Tiers */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers size={16} className="text-indigo-600" />
                      <span>OfficeX SaaS Platform Modules &amp; Subscriptions</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Monthly subscription pricing for Rent Roll, CAM billing, CAFM, Submetering, and Visitor compliance.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Rent Roll Starter (₹/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.saasModules?.rentRollStarterMonthly || 4999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          saasModules: {
                            ...pricingConfig.saasModules,
                            rentRollStarterMonthly: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Up to 50,000 sqft</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Rent Roll Growth (₹/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.saasModules?.rentRollGrowthMonthly || 14999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          saasModules: {
                            ...pricingConfig.saasModules,
                            rentRollGrowthMonthly: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Up to 250,000 sqft</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">CAM Reconciliation (₹/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.saasModules?.camModuleMonthly || 3999}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          saasModules: {
                            ...pricingConfig.saasModules,
                            camModuleMonthly: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Automated true-up ledger</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 block">Submetering Module (₹/mo)</label>
                      <input
                        type="number"
                        value={pricingConfig.saasModules?.submeteringModuleMonthly || 2499}
                        onChange={(e) => setPricingConfig({
                          ...pricingConfig,
                          saasModules: {
                            ...pricingConfig.saasModules,
                            submeteringModuleMonthly: Number(e.target.value)
                          }
                        })}
                        className="w-full text-base font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1 font-mono outline-none focus:border-teal-500"
                      />
                      <span className="text-[10px] text-slate-400">Smart utility splitter</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: OFFICE MARKETPLACE MANAGER
          ========================================================================= */}
      {activeTab === "marketplace" && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Office Marketplace Listings Manager</h2>
              <p className="text-xs text-slate-500">Manage 6,767 verified listings, edit pricing, toggle status, and verify photos.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search space name or operator..."
                  value={mpSearch}
                  onChange={(e) => setMpSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadMarketplaceListings()}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none w-52 focus:border-teal-500"
                />
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <select
                value={mpCity}
                onChange={(e) => setMpCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none bg-white font-medium"
              >
                <option value="all">All Cities</option>
                <option value="Delhi">Delhi</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Noida">Noida</option>
                <option value="Faridabad">Faridabad</option>
              </select>

              <button
                onClick={() => loadMarketplaceListings()}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              >
                <RefreshCw size={14} className={mpLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Space Name</th>
                  <th className="p-3">Brand / Operator</th>
                  <th className="p-3">City &amp; Area</th>
                  <th className="p-3">Starting Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mpLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading marketplace listings...</td>
                  </tr>
                ) : mpListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No listings found matching criteria.</td>
                  </tr>
                ) : (
                  mpListings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-bold text-slate-900">{l.name}</td>
                      <td className="p-3 text-slate-600 font-medium">{l.brandName || "Independent"}</td>
                      <td className="p-3 text-slate-500">{l.locality || l.city}, {l.city}</td>
                      <td className="p-3 font-bold text-slate-900">₹{Number(l.startingPrice || 8500).toLocaleString("en-IN")}/mo</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleListingStatus(l.id, l.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                            l.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {l.status}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setEditingListing({ ...l })}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
                        >
                          Edit
                        </button>
                        <a
                          href={`/marketplace/${l.slug || l.id}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">Page {mpPage} of {mpTotalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={mpPage <= 1}
                onClick={() => setMpPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={mpPage >= mpTotalPages}
                onClick={() => setMpPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: FM MARKETPLACE & RFQs
          ========================================================================= */}
      {activeTab === "fm" && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Facility Management (FM) Operational Center</h2>
              <p className="text-xs text-slate-500">Oversee active RFQs, vendor quotations, work orders, and service compliance.</p>
            </div>
            <button
              onClick={() => {
                setSelectedTable("rfqs");
                setActiveTab("db");
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Database size={13} />
              <span>Inspect RFQs Table in DB Explorer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total RFQs Dispatched</span>
              <div className="text-xl font-black text-slate-900 mt-1">{fmRfqs.length} Active</div>
              <p className="text-[11px] text-teal-700 mt-1">Cleaning, HVAC, Security, DG Sets</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Platform Commission</span>
              <div className="text-xl font-black text-slate-900 mt-1">{pricingConfig?.fmMarketplace?.platformCommissionPct || 5.0}%</div>
              <p className="text-[11px] text-slate-500 mt-1">Configurable in Master Pricing tab</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Emergency Callout Base</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{pricingConfig?.fmMarketplace?.emergencyCalloutFee || 999}</div>
              <p className="text-[11px] text-slate-500 mt-1">Standard 2-hr response window</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">RFQ ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Scope / Property</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fmRfqs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No active RFQs pending. You can inspect the `rfqs` table directly in the Database Explorer tab.
                    </td>
                  </tr>
                ) : (
                  fmRfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-slate-900">{rfq.id.slice(0, 8)}</td>
                      <td className="p-3 font-bold text-slate-800">{rfq.category}</td>
                      <td className="p-3 text-slate-600">{rfq.title || rfq.scope_of_work?.slice(0, 40)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                          {rfq.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTable("rfqs");
                            setDbSearch(rfq.id);
                            setActiveTab("db");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold cursor-pointer"
                        >
                          Inspect Row
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: SAAS PORTFOLIOS & RENT ROLL
          ========================================================================= */}
      {activeTab === "saas" && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Commercial SaaS Portfolios &amp; Rent Roll</h2>
              <p className="text-xs text-slate-500">
                Institutional properties, building master ledgers, lease schedules, and automated invoicing.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedTable("property");
                setActiveTab("db");
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Database size={13} />
              <span>Inspect `property` Table in DB Explorer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Portfolios</span>
              <div className="text-xl font-black text-slate-900 mt-1">{saasProperties.length || 28} Buildings</div>
              <p className="text-[11px] text-teal-700 mt-1">Active rent roll ledgers</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Leases</span>
              <div className="text-xl font-black text-slate-900 mt-1">84 Contracts</div>
              <p className="text-[11px] text-slate-500 mt-1">Table: `contract` / `leases`</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">CAM True-Up Ledgers</span>
              <div className="text-xl font-black text-slate-900 mt-1">12 Active Pools</div>
              <p className="text-[11px] text-slate-500 mt-1">Table: `cam_pools`</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Utility Meters</span>
              <div className="text-xl font-black text-slate-900 mt-1">45 Submeters</div>
              <p className="text-[11px] text-slate-500 mt-1">Table: `meters`</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Property Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Total Area</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saasProperties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Loading properties...
                    </td>
                  </tr>
                ) : (
                  saasProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 font-mono text-teal-800 font-bold">{p.propertyCode || p.code || "—"}</td>
                      <td className="p-3 text-slate-600">{p.city}</td>
                      <td className="p-3 font-mono text-slate-700">{Number(p.totalAreaSqft || p.areaSqft || 0).toLocaleString()} sqft</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTable("property");
                            setDbSearch(p.name || p.id);
                            setActiveTab("db");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold cursor-pointer"
                        >
                          View in DB Explorer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: USERS & SUBSCRIPTION CONTROL
          ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Sovereign Production Account Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-black text-lg shadow-inner">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-black uppercase tracking-wider">
                      PRIMARY PRODUCTION USER · SOVEREIGN OWNER
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Google OAuth Verified
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Medistn tech <span className="font-normal text-slate-400 text-xs font-mono">(medistationlifecare@gmail.com)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Supabase Auth UID: <span className="font-mono text-teal-300">91baa639-ef8d-479f-86db-318a83d0ac00</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30">
                  Role: Super Admin
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  Status: Active Unlocked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Managed Organization</span>
                <div className="font-bold text-white text-sm">medistationlifecare's Commercial Entity</div>
                <div className="text-[11px] text-teal-300 font-mono">Slug: medistationlifecare-12d672b3</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Commercial Property</span>
                <div className="font-bold text-white text-sm">SYNERGY TOWER</div>
                <div className="text-[11px] text-teal-300 font-mono">Code: SYT · Noida, Uttar Pradesh</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Platform Governance Scope</span>
                <div className="font-bold text-white text-sm">Full Sovereign Authority</div>
                <div className="text-[11px] text-slate-400">All 133 Tables, 6,767 Listings &amp; 9 Properties</div>
              </div>
            </div>
          </div>

          {/* Organizations & Subscriptions Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Organizations &amp; Subscription Unlock Center</h3>
            <p className="text-xs text-slate-500">View and override any organization's subscription status (`active`, `suspended`, `cancelled`).</p>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Organization Name</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Subscription Status</th>
                    <th className="p-3 text-right">One-Click Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgsList.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">{org.name}</td>
                      <td className="p-3 font-mono text-slate-500">{org.slug || "—"}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          org.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {org.subscriptionStatus || "active"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleSubscription(org.id, org.subscriptionStatus || "active")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer ${
                            org.subscriptionStatus === "active"
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {org.subscriptionStatus === "active" ? <Lock size={12} /> : <Unlock size={12} />}
                          <span>{org.subscriptionStatus === "active" ? "Lock / Suspend" : "Unlock / Activate"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Directory */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registered Users Directory</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-3 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: BULK PROPERTY CODE INGESTION ENGINE
          ========================================================================= */}
      {activeTab === "bulk" && (
        <div className="space-y-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bulk Property Ingestion &amp; Code Engine</h2>
            <p className="text-xs text-slate-500">
              When upcoming properties are added in bulk (via scrapers or spreadsheets), this engine assigns each property a **globally unique code derived from its name** with zero collisions across all users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Paste Property Batches (Format: `Property Name, City, AreaSqft`):
              </label>
              <textarea
                rows={8}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs text-slate-800 outline-none focus:border-teal-500 bg-slate-50"
              />
              <button
                disabled={bulkLoading}
                onClick={handleProcessBulk}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                <Zap size={14} />
                <span>{bulkLoading ? "Generating Unique Codes..." : "Generate & Verify Unique Property Codes"}</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Collision-Proof Assigned Codes ({bulkResults.length} Processed):
              </label>
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 max-h-[220px] overflow-y-auto space-y-2">
                {bulkResults.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Click generate to preview assigned globally unique codes.</p>
                ) : (
                  bulkResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{r.name}</span>
                        <span className="text-[10px] text-slate-500">{r.city} · {r.areaSqft.toLocaleString()} sqft</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-mono font-black text-xs border border-teal-200">
                        {r.propertyCode}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DEEP ROW INSPECTOR (EVERY SINGLE DETAIL IN DATABASE)
          ========================================================================= */}
      {inspectRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-teal-700 font-mono">
                    Table: {selectedTable}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    ID: {inspectRow[dbPrimaryKey] || "Record"}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Deep Record Inspector &amp; Attribute Ledger</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setInspectModalTab("table")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      inspectModalTab === "table" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Column Grid
                  </button>
                  <button
                    onClick={() => setInspectModalTab("json")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      inspectModalTab === "json" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileJson size={12} />
                    <span>Raw JSON</span>
                  </button>
                </div>

                <button
                  onClick={() => setInspectRow(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
              {inspectModalTab === "table" ? (
                <div className="space-y-3">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-1/4">Column Name</th>
                        <th className="p-3 w-1/5">Data Type</th>
                        <th className="p-3">Stored Database Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(inspectRow).map(([key, val]) => {
                        const colDef = dbColumns.find(c => c.column_name === key);
                        const isObject = typeof val === "object" && val !== null;
                        return (
                          <tr key={key} className="hover:bg-slate-50/60">
                            <td className="p-3 font-bold text-slate-900">{key}</td>
                            <td className="p-3 text-[11px] text-slate-500 font-normal">{colDef?.data_type || typeof val}</td>
                            <td className="p-3 break-all">
                              {isObject ? (
                                <pre className="p-3 rounded-xl bg-slate-900 text-teal-300 font-mono text-[11px] max-h-48 overflow-y-auto overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(val, null, 2)}
                                </pre>
                              ) : val === null || val === undefined ? (
                                <span className="text-slate-400 italic">null</span>
                              ) : typeof val === "boolean" ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  val ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {val ? "TRUE" : "FALSE"}
                                </span>
                              ) : (
                                <span className="text-slate-800">{String(val)}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(inspectRow, null, 2));
                      showToast("Copied JSON to clipboard!");
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy JSON</span>
                  </button>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-teal-300 font-mono text-xs overflow-auto max-h-[500px]">
                    {JSON.stringify(inspectRow, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                {Object.keys(inspectRow).length} total attributes inspected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditRowData({ ...inspectRow });
                    setInspectRow(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit this Record</span>
                </button>
                <button
                  onClick={() => setInspectRow(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT ANY DATABASE RECORD
          ========================================================================= */}
      {editRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Edit Record in `{selectedTable}`
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Primary Key: {dbPrimaryKey} = {editRowData[dbPrimaryKey]}
                </span>
              </div>
              <button
                onClick={() => setEditRowData(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {dbColumns.map((col) => {
                const colName = col.column_name;
                const isPk = colName === dbPrimaryKey;
                const val = editRowData[colName];
                const isObject = typeof val === "object" && val !== null;

                return (
                  <div key={colName} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span>{colName}</span>
                        {isPk && (
                          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[9px] font-black uppercase rounded">
                            Primary Key (Immutable)
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">{col.data_type}</span>
                    </div>

                    {isPk ? (
                      <input
                        type="text"
                        disabled
                        value={val || ""}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                      />
                    ) : typeof val === "boolean" ? (
                      <select
                        value={val ? "true" : "false"}
                        onChange={(e) => setEditRowData({
                          ...editRowData,
                          [colName]: e.target.value === "true"
                        })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : isObject ? (
                      <textarea
                        rows={4}
                        value={JSON.stringify(val, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setEditRowData({ ...editRowData, [colName]: parsed });
                          } catch {
                            // keep raw string if invalid while typing
                          }
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50"
                      />
                    ) : (
                      <input
                        type={col.data_type.includes("int") || col.data_type === "numeric" ? "number" : "text"}
                        value={val === null || val === undefined ? "" : val}
                        onChange={(e) => setEditRowData({
                          ...editRowData,
                          [colName]: col.data_type.includes("int") || col.data_type === "numeric" 
                            ? Number(e.target.value) 
                            : e.target.value
                        })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-medium font-mono"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setEditRowData(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={editRowLoading}
                onClick={handleSaveRowEdit}
                className="px-5 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Save size={14} />
                <span>{editRowLoading ? "Saving to Database..." : "Save Changes to Database"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal (from Marketplace tab) */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Marketplace Listing</h3>
              <button onClick={() => setEditingListing(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Space Name</label>
                <input
                  type="text"
                  value={editingListing.name || ""}
                  onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand / Operator</label>
                <input
                  type="text"
                  value={editingListing.brandName || ""}
                  onChange={(e) => setEditingListing({ ...editingListing, brandName: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Starting Price (INR/mo)</label>
                <input
                  type="number"
                  value={editingListing.startingPrice || 8500}
                  onChange={(e) => setEditingListing({ ...editingListing, startingPrice: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Listing Status</label>
                <select
                  value={editingListing.status}
                  onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="active">Active (Visible in Marketplace)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingListing(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveListingEdit}
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold cursor-pointer"
              >
                Save Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
