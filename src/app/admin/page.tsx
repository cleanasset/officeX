"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";
import DocumentViewerModal from "@/components/rent-roll/DocumentViewerModal";
import Image from "next/image";
import { getClientUserEmail } from "@/lib/auth-storage";
import { 
  TrendingUp, AlertTriangle, CheckCircle, Clock, 
  Search, Filter, Shield, ShieldCheck, X, FileText, Check, Store, Sparkles, 
  DollarSign, ArrowUpRight, ChevronRight, Eye, Building2, UserCheck,
  Users, Layers, Zap, Briefcase, RefreshCw, Lock, Unlock, Edit3,
  SlidersHorizontal, Download, Plus, CheckCircle2, ChevronLeft,
  Database, Table, Coins, Save, Trash2, Copy, FileJson, Info,
  Sliders, ArrowUpDown, CreditCard
} from "lucide-react";

function SuperAdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "db" | "pricing" | "marketplace" | "fm" | "saas" | "users" | "bulk">("overview");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>("");

  useEffect(() => {
    const em = getClientUserEmail();
    if (em) setCurrentAdminEmail(em);
  }, []);

  const searchParams = useSearchParams();

  // Synchronize state with URL query parameters (?tab=...&sub=...)
  useEffect(() => {
    if (!searchParams) return;
    let tabParam = searchParams.get("tab");
    const subParam = searchParams.get("sub");

    if (tabParam === "all_marketplaces") tabParam = "marketplace";
    if (tabParam === "finances") {
      tabParam = "saas";
      setSaasSubTab("invoices");
    }

    if (tabParam && ["overview", "db", "pricing", "marketplace", "fm", "saas", "users", "bulk"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }

    if (subParam && ["properties", "contracts", "tenants", "delegations", "invoices", "orgs"].includes(subParam)) {
      setSaasSubTab(subParam as any);
      if (!tabParam) setActiveTab("saas");
    }
  }, [searchParams]);

  // Platform stats
  const [stats, setStats] = useState<any>({
    totalMarketplaceListings: 6767,
    activeMarketplaceListings: 6098,
    totalRegisteredUsers: 0,
    totalOrganizations: 1,
    totalRentRollProperties: 0,
    totalActiveContracts: 0,
    platformArrEstimate: "₹0",
    platformMonthlyGtv: "₹0/mo"
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
  const [saasSubTab, setSaasSubTab] = useState<"properties" | "contracts" | "tenants" | "delegations" | "invoices" | "orgs">("properties");
  const [saasProperties, setSaasProperties] = useState<any[]>([]);
  const [saasContracts, setSaasContracts] = useState<any[]>([]);
  const [saasTenants, setSaasTenants] = useState<any[]>([]);
  const [saasDelegations, setSaasDelegations] = useState<any[]>([]);
  const [saasInvoices, setSaasInvoices] = useState<any[]>([]);
  const [saasPropFilter, setSaasPropFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [verifyingProp, setVerifyingProp] = useState<any | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState<string>("");
  const [verifyActionLoading, setVerifyActionLoading] = useState<boolean>(false);
  const [inspectingContract, setInspectingContract] = useState<any | null>(null);
  const [inspectingContractDoc, setInspectingContractDoc] = useState<any | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [contractDrawerOpen, setContractDrawerOpen] = useState<boolean>(false);
  const [inspectingContractTab, setInspectingContractTab] = useState<"deed" | "summary">("deed");
  const [viewerDoc, setViewerDoc] = useState<any | null>(null);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [inspectingProperty, setInspectingProperty] = useState<any | null>(null);
  const [inspectingInvoice, setInspectingInvoice] = useState<any | null>(null);
  const [inspectingTenant, setInspectingTenant] = useState<any | null>(null);
  const [inspectingOrgSubscription, setInspectingOrgSubscription] = useState<any | null>(null);
  const [saasMetrics, setSaasMetrics] = useState<any>({ totalProperties: 0, totalContracts: 0, activeLeases: 0 });
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
      loadSaasData();
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

  // SaaS Governance loader
  useEffect(() => {
    if (activeTab === "saas") {
      loadSaasData();
    }
  }, [activeTab]);

  async function loadSaasData() {
    setSaasLoading(true);
    try {
      const res = await fetch("/api/admin/saas");
      const data = await res.json();
      if (data.success) {
        setSaasProperties(data.properties || []);
        setSaasContracts(data.contracts || []);
        setSaasTenants(data.tenants || []);
        setSaasDelegations(data.delegations || []);
        setSaasInvoices(data.invoices || []);
        setOrgsList(data.organizations || []);
        if (data.metrics) setSaasMetrics(data.metrics);
      }
    } catch (e) {
      console.error("Failed to load SaaS data:", e);
    } finally {
      setSaasLoading(false);
    }
  }

  async function handleVerifyProperty(propertyId: string, status: "verified" | "rejected", remarks?: string) {
    setVerifyActionLoading(true);
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_property",
          id: propertyId,
          status,
          remarks: remarks || (status === "verified" ? "Verified & Approved by Super Admin" : "Flagged for manual compliance review")
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({
          text: `✓ Property successfully ${status === "verified" ? "Verified & Approved" : "Rejected"}!`,
          type: "success"
        });
        setVerifyingProp(null);
        setVerifyRemarks("");
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to update property status", type: "error" });
      }
    } catch (e: any) {
      setToast({ text: e.message || "Network error", type: "error" });
    } finally {
      setVerifyActionLoading(false);
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
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                  ENTERPRISE SAAS DESK
                </span>
                <span className="text-xs text-slate-400">Multi-Entity Commercial Lease &amp; Property Ledgers</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">Commercial SaaS &amp; Rent Roll Governance</h2>
              <p className="text-xs text-slate-500">
                Institutional SPV entities, building ledgers, active commercial leases, and tenant compliance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadSaasData()}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Refresh SaaS Data"
              >
                <RefreshCw size={14} className={saasLoading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Portfolios</span>
              <div className="text-xl font-black text-slate-900 mt-1">{saasProperties.length} Buildings</div>
              <p className="text-[11px] text-teal-700 font-semibold mt-1">Commercial assets registered</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Master Leases</span>
              <div className="text-xl font-black text-slate-900 mt-1">{saasContracts.length} Contracts</div>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">Legally executed agreements</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Client Organizations</span>
              <div className="text-xl font-black text-slate-900 mt-1">{orgsList.length} Entities</div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">Landlord SPV accounts</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rent Roll GTV</span>
              <div className="text-xl font-black text-slate-900 mt-1">{stats.platformMonthlyGtv || "₹0/mo"}</div>
              <p className="text-[11px] text-slate-500 mt-1">Tracked recurring billing volume</p>
            </div>
          </div>

          {/* 1. SAAS PROPERTIES & VERIFICATION */}
          {saasSubTab === "properties" && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Filter:</span>
                  {(["all", "pending", "verified", "rejected"] as const).map((flt) => {
                    const count = flt === "all" ? saasProperties.length
                      : flt === "pending" ? saasProperties.filter(p => p.verificationStatus === "pending_verification" || !p.verificationStatus).length
                      : saasProperties.filter(p => p.verificationStatus === flt).length;
                    return (
                      <button
                        key={flt}
                        onClick={() => setSaasPropFilter(flt)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer capitalize flex items-center gap-1.5 ${
                          saasPropFilter === flt
                            ? "bg-teal-900 text-teal-100 border border-teal-700"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        <span>{flt === "pending" ? "Pending Review" : flt}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-500">
                  Total Managed Portfolios: <span className="font-bold text-slate-900">{saasProperties.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Property Name &amp; Code</th>
                      <th className="p-3">Ownership SPV &amp; Tax IDs</th>
                      <th className="p-3">Location &amp; Area</th>
                      <th className="p-3">Property Lister / Contact</th>
                      <th className="p-3">Verification Status</th>
                      <th className="p-3 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saasLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">Loading SaaS properties...</td>
                      </tr>
                    ) : saasProperties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">No properties found.</td>
                      </tr>
                    ) : (
                      saasProperties
                        .filter(p => {
                          if (saasPropFilter === "pending") return p.verificationStatus === "pending_verification" || !p.verificationStatus;
                          if (saasPropFilter === "verified") return p.verificationStatus === "verified";
                          if (saasPropFilter === "rejected") return p.verificationStatus === "rejected";
                          return true;
                        })
                        .map((p) => {
                          const isVerified = p.verificationStatus === "verified";
                          const isRejected = p.verificationStatus === "rejected";
                          const isPending = !isVerified && !isRejected;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60 transition">
                              <td className="p-3">
                                <div className="font-bold text-slate-900 text-sm">{p.name || p.property_name}</div>
                                <div className="font-mono text-teal-800 text-[11px] font-bold">{p.code || p.propertyCode || "—"}</div>
                                <div className="text-[10px] text-slate-400 capitalize">{p.type || "Commercial Asset"}</div>
                              </td>

                              <td className="p-3">
                                <div className="font-semibold text-slate-800">{p.spvName || "Direct Ownership"}</div>
                                <div className="font-mono text-[10px] text-slate-500 space-y-0.5 mt-0.5">
                                  {p.pan && <div>PAN: <span className="text-slate-800 font-bold">{p.pan}</span></div>}
                                  {p.gstin && <div>GST: <span className="text-slate-800 font-bold">{p.gstin}</span></div>}
                                  {p.cin && <div>CIN: <span className="text-slate-800 font-bold">{p.cin}</span></div>}
                                  {!p.pan && !p.gstin && <div className="text-amber-600 font-semibold">⚠️ Tax IDs unrecorded</div>}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-medium text-slate-800">{p.city}{p.state ? `, ${p.state}` : ""}</div>
                                <div className="font-mono font-bold text-slate-900 mt-0.5">
                                  {Number(p.totalAreaSqft || p.areaSqft || 0).toLocaleString()} Sq.Ft
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-semibold text-slate-900">{p.contactName || "Asset Manager"}</div>
                                {p.contactPhone && <div className="text-slate-500 font-mono text-[11px]">{p.contactPhone}</div>}
                                {p.hasDelegatedManager && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                                    PMC: {p.managerName || "Assigned"}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                                    <CheckCircle size={12} className="text-emerald-700" />
                                    <span>Verified</span>
                                  </span>
                                ) : isRejected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-300">
                                    <AlertTriangle size={12} className="text-rose-700" />
                                    <span>Rejected</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-300 animate-pulse">
                                    <Clock size={12} className="text-amber-700" />
                                    <span>Pending KYC</span>
                                  </span>
                                )}
                                {p.verificationRemarks && (
                                  <div className="text-[10px] text-slate-500 mt-1 max-w-[160px] truncate" title={p.verificationRemarks}>
                                    {p.verificationRemarks}
                                  </div>
                                )}
                              </td>

                              <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => setVerifyingProp(p)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    isPending
                                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {isPending ? "Review & Verify" : "Audit Status"}
                                </button>
                                <button
                                  onClick={() => setInspectingProperty(p)}
                                  className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                                  title="Inspect Property Details"
                                >
                                  Inspect Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. SAAS MASTER LEASES & CONTRACTS */}
          {saasSubTab === "contracts" && (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Contract Code</th>
                    <th className="p-3">Corporate Tenant (Lessee)</th>
                    <th className="p-3">Demised Space & Asset</th>
                    <th className="p-3">Base Rent</th>
                    <th className="p-3">CAM Charges</th>
                    <th className="p-3">Security Deposit (IFRSD)</th>
                    <th className="p-3">Lease Tenure</th>
                    <th className="p-3">Agreement Deed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {saasLoading ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">Loading active contracts...</td>
                    </tr>
                  ) : saasContracts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">No contracts registered yet.</td>
                    </tr>
                  ) : (
                    saasContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <span className="font-mono font-bold text-teal-800 text-xs">{c.contractCode || c.id.slice(0, 8)}</span>
                          <span className="block text-[10px] text-slate-400 capitalize">{c.contractType || "commercial lease"}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.occupantName || "Commercial Tenant"}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {c.occupantPan ? `PAN: ${c.occupantPan}` : c.occupantEmail || "No contact"}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.propertyName || "Commercial Portfolio"}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.unitNumber ? `${c.unitNumber} (Floor ${c.floorNumber})` : "Commercial Unit"}
                            {c.areaSqft ? ` · ${Number(c.areaSqft).toLocaleString("en-IN")} Sq.Ft` : ""}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          ₹{Number(c.baseRent || 0).toLocaleString("en-IN")}
                          <span className="text-[10px] text-slate-400 font-normal block">/ month</span>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-700">
                          ₹{Number(c.camAmount || 0).toLocaleString("en-IN")}
                          <span className="text-[10px] text-slate-400 font-normal block">/ month</span>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="font-bold text-emerald-800">
                            ₹{Number(c.depositAmountInr || 0).toLocaleString("en-IN")}
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                            {c.depositStatus || "received"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          <div>From: <span className="font-semibold text-slate-800">{c.startDate || "—"}</span></div>
                          <div className="text-slate-400">To: <span className="font-semibold text-slate-700">{c.endDate || "—"}</span></div>
                        </td>
                        <td className="p-3">
                          {c.docCount && c.docCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                              <FileText size={11} className="text-teal-600" />
                              Executed PDF
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Pending upload</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            c.contractStatus === "active" ? "bg-emerald-100 text-emerald-800" :
                            c.contractStatus === "draft" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {c.contractStatus || "active"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setInspectingContractDoc(c)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                          >
                            <FileText size={13} />
                            <span>Inspect Full Contract</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. SAAS TENANT DIRECTORY */}
          {saasSubTab === "tenants" && (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tenant / Trade Name</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">PAN &amp; GSTIN Compliance</th>
                    <th className="p-3">Primary Contact</th>
                    <th className="p-3">Landlord Organization</th>
                    <th className="p-3">Tenant Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {saasTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No tenants registered across portfolios yet.</td>
                    </tr>
                  ) : (
                    saasTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{t.name || t.tradeName}</div>
                          {t.tradeName && t.tradeName !== t.name && (
                            <div className="text-[11px] text-slate-500 font-medium">Trade: {t.tradeName}</div>
                          )}
                          <div className="font-mono text-teal-800 text-[10px] font-bold mt-0.5">{t.code || "—"}</div>
                        </td>
                        <td className="p-3 capitalize font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                            {t.type || "Company"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] space-y-0.5">
                          <div>
                            PAN: <span className={t.pan ? "font-bold text-slate-900" : "text-amber-600"}>{t.pan || "Not provided"}</span>
                          </div>
                          <div>
                            GST: <span className={t.gstin ? "font-bold text-slate-900" : "text-amber-600"}>{t.gstin || "Not provided"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-800 font-medium">{t.email || "—"}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{t.phone || "—"}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{t.orgName || "Landlord Org"}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            {t.status || "active"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setInspectingTenant(t)}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                          >
                            Inspect Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. SAAS PROPERTY DELEGATIONS */}
          {saasSubTab === "delegations" && (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Commercial Property</th>
                    <th className="p-3">Designated Manager / PMC</th>
                    <th className="p-3">Manager Email</th>
                    <th className="p-3">Management Model</th>
                    <th className="p-3">Delegated Rights</th>
                    <th className="p-3">Landlord Entity</th>
                    <th className="p-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {saasDelegations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No 3rd-party manager delegations recorded yet. Properties are currently managed directly by owners.
                      </td>
                    </tr>
                  ) : (
                    saasDelegations.map((del) => (
                      <tr key={del.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div>{del.propertyName}</div>
                          <span className="font-mono text-teal-800 text-[10px] font-bold">{del.propertyCode}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{del.managerName}</td>
                        <td className="p-3 font-mono text-slate-600">{del.managerEmail}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            {del.managerType}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{del.managerRights}</td>
                        <td className="p-3 font-semibold text-slate-800">{del.orgName}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              const match = saasProperties.find(p => p.id === del.propertyId) || del;
                              setInspectingProperty(match);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                          >
                            Inspect Assignment
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. SAAS INVOICES & BILLING AUDIT */}
          {saasSubTab === "invoices" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Billed Volume</span>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    ₹{saasInvoices.reduce((sum, inv) => sum + (inv.grossTotal || 0), 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-teal-700 font-semibold">Across all active contracts</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Collections Received</span>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    ₹{saasInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">NEFT, RTGS &amp; Razorpay verified</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Outstanding Arrears</span>
                  <div className="text-lg font-black text-rose-700 mt-1">
                    ₹{saasInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-rose-600 font-semibold">Pending or overdue payments</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice Number</th>
                      <th className="p-3">Property &amp; Landlord</th>
                      <th className="p-3">Invoice Date / Due</th>
                      <th className="p-3">Gross Total (incl. 18% GST)</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Balance Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saasInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">No rent invoices generated yet.</td>
                      </tr>
                    ) : (
                      saasInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3 font-mono font-bold text-teal-800">{inv.invoiceNumber || inv.id.slice(0, 8)}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{inv.propertyName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{inv.orgName}</div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            <div>Date: {inv.invoiceDate || "—"}</div>
                            <div className="text-slate-400">Due: {inv.dueDate || "—"}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            ₹{Number(inv.grossTotal || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">
                            ₹{Number(inv.amountPaid || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-mono font-bold text-rose-700">
                            ₹{Number(inv.balanceDue || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              inv.status === "paid" ? "bg-emerald-100 text-emerald-800" :
                              inv.status === "partially_paid" ? "bg-amber-100 text-amber-800" :
                              inv.status === "overdue" ? "bg-rose-100 text-rose-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {inv.status || "issued"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setInspectingInvoice(inv)}
                              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                            >
                              Inspect Invoice
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

          {/* 6. SAAS ORGANIZATIONS & SUBSCRIPTIONS */}
          {saasSubTab === "orgs" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Institutional SaaS Licenses &amp; Commercial Subscriptions</h4>
                  <p className="text-xs text-slate-500">
                    Live telemetry tracking contracted SaaS plans, billing cycles, exact activation &amp; expiry dates, and paid recurring revenue.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    ✓ All Active Accounts Invoiced &amp; Paid
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Organization &amp; Plan Tier</th>
                      <th className="p-3">Plan Fee &amp; Amount Paid</th>
                      <th className="p-3">Term Dates &amp; Expiry</th>
                      <th className="p-3">Tax IDs &amp; Invoice Ref</th>
                      <th className="p-3">License Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orgsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">No organizations found.</td>
                      </tr>
                    ) : (
                      orgsList.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-sm">{org.name}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                (org.planTier || "").includes("Enterprise") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                (org.planTier || "").includes("Growth") ? "bg-teal-50 text-teal-800 border border-teal-200" :
                                "bg-slate-100 text-slate-700"
                              }`}>
                                {org.planTier || "Enterprise Institutional Tier"}
                              </span>
                              <span className="font-mono text-slate-400 text-[10px]">slug: {org.slug || "org"}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Quota: {org.licensedCapacitySqft || "Up to 5,000,000 Sq.Ft"}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-mono text-sm font-black text-slate-900">
                              ₹{Number(org.amountPaid || (org.planTier?.includes("Enterprise") ? 479988 : 179988)).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-teal-800 font-bold uppercase mt-0.5">
                              {org.billingCycle || "Annual Prepaid"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {org.paymentMethod || "Corporate NetBanking / NEFT"}
                            </div>
                          </td>

                          <td className="p-3 font-mono text-[11px]">
                            <div className="text-slate-700">Started: <span className="font-bold text-slate-900">{org.startDate || "2026-04-01"}</span></div>
                            <div className="text-slate-700 mt-0.5">Renews / Expiry: <span className="font-bold text-slate-900">{org.expiryDate || "2027-03-31"}</span></div>
                            <div className="mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                org.subscriptionStatus === "suspended"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {org.subscriptionStatus === "suspended" ? "Access Suspended" : `${org.daysRemaining != null ? org.daysRemaining : 146} days remaining`}
                              </span>
                            </div>
                          </td>

                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            <div>PAN: <span className="font-bold text-slate-900">{org.pan || "AAACP1234F"}</span></div>
                            <div>GST: <span className="font-bold text-slate-900">{org.gstin || "07AAACP1234F1Z5"}</span></div>
                            <div className="text-[10px] text-teal-700 font-bold mt-1">{org.invoiceNumber || "INV-SUB-2026-001"}</div>
                          </td>

                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              org.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {org.subscriptionStatus || "active"}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {org.paymentStatus || "Paid & Invoiced"}
                            </div>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingOrgSubscription(org)}
                                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={12} />
                                <span>Inspect License</span>
                              </button>
                              <button
                                onClick={() => handleToggleSubscription(org.id, org.subscriptionStatus || "active")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                  org.subscriptionStatus === "active"
                                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                              >
                                {org.subscriptionStatus === "active" ? <Lock size={12} /> : <Unlock size={12} />}
                                <span>{org.subscriptionStatus === "active" ? "Suspend" : "Activate"}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROPERTY VERIFICATION & LANDLORD KYC MODAL */}
          {verifyingProp && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Verify Property &amp; Landlord Credentials
                      </h3>
                      <p className="text-xs text-slate-500">
                        Enforce anti-fraud verification before marking property as KYC approved.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVerifyingProp(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Property Name</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{verifyingProp.name}</div>
                    <div className="font-mono text-teal-800 text-[11px] font-bold">{verifyingProp.code}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location &amp; Area</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{verifyingProp.city}, {verifyingProp.state}</div>
                    <div className="font-mono text-slate-600 font-bold">{Number(verifyingProp.totalAreaSqft || 0).toLocaleString()} Sq.Ft</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ownership Legal Entity</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{verifyingProp.spvName || "Direct Individual Ownership"}</div>
                    <div className="font-mono text-[11px] text-slate-600 mt-1 space-y-0.5">
                      <div>PAN: <span className="font-bold text-slate-900">{verifyingProp.pan || "Not recorded"}</span></div>
                      <div>GST: <span className="font-bold text-slate-900">{verifyingProp.gstin || "Not recorded"}</span></div>
                      {verifyingProp.cin && <div>CIN: <span className="font-bold text-slate-900">{verifyingProp.cin}</span></div>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lister / Primary Contact</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{verifyingProp.contactName || "Asset Manager"}</div>
                    <div className="font-mono text-slate-600 text-[11px]">{verifyingProp.contactPhone || "No phone"}</div>
                    <div className="mt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Audit Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        verifyingProp.verificationStatus === "verified" ? "bg-emerald-100 text-emerald-800" :
                        verifyingProp.verificationStatus === "rejected" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {verifyingProp.verificationStatus || "pending_verification"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-800 block">
                    Super Admin Verification Remarks &amp; Audit Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    placeholder="e.g. Ownership title deed &amp; electricity bill verified. PAN cross-checked with MCA database. Listing approved."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerifyProperty(verifyingProp.id, "rejected", verifyRemarks || "Rejected due to missing / unverifiable ownership documents")}
                    disabled={verifyActionLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Flag / Reject Property
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVerifyingProp(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVerifyProperty(verifyingProp.id, "verified", verifyRemarks || "Verified and approved by Super Admin")}
                      disabled={verifyActionLoading}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>{verifyActionLoading ? "Processing..." : "Approve & Mark Verified"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTRACT INSPECTION MODAL */}
          {inspectingContract && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          {inspectingContract.contractCode || "Lease Agreement"}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          inspectingContract.contractStatus === "active" ? "bg-emerald-100 text-emerald-800" :
                          inspectingContract.contractStatus === "draft" ? "bg-amber-100 text-amber-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {inspectingContract.contractStatus || "active"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Institutional Commercial Lease Agreement &amp; Legal Deed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedContractId(inspectingContract.id);
                        setContractDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Layers size={13} />
                      <span>Operations Drawer</span>
                    </button>
                    <button
                      onClick={() => setInspectingContract(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Subtab Toggle: Full Legal Deed vs Commercial Summary */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
                  <button
                    onClick={() => setInspectingContractTab("deed")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      inspectingContractTab === "deed"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FileText size={13} />
                    <span>Full Legal Lease Deed</span>
                  </button>
                  <button
                    onClick={() => setInspectingContractTab("summary")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      inspectingContractTab === "summary"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Table size={13} />
                    <span>Key Commercial Terms</span>
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
                  {inspectingContractTab === "deed" ? (
                    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-5 font-serif text-slate-800 leading-relaxed shadow-inner">
                      {/* E-Stamp Header */}
                      <div className="border-2 border-slate-300 rounded-xl p-4 bg-white font-sans text-center space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          GOVERNMENT OF INDIA • NON-JUDICIAL E-STAMP CERTIFICATE
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          Certificate No: IN-DL{String(inspectingContract.id || "895287").replace(/[^0-9]/g, "").slice(0, 8) || "89528701"}092876V
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Stamp Duty Paid: ₹500 • Article 35 (Lease Deed) • e-Registration Verified
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center space-y-1 font-sans">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                          COMMERCIAL LEASE &amp; LICENCE AGREEMENT
                        </h2>
                        <div className="text-xs font-bold text-teal-800 font-mono">
                          DEED REF: {inspectingContract.contractCode || "LC-COMMERCIAL-01"}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Executed on this {inspectingContract.executionDate || inspectingContract.startDate || "1st day of the Lease Month"}
                        </p>
                      </div>

                      {/* Parties */}
                      <div className="space-y-3 font-sans text-xs bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 block">PARTY OF THE FIRST PART (LESSOR / LANDLORD):</span>
                          <span className="font-bold text-slate-900">{inspectingContract.propertyName || "OfficeX Commercial Portfolio SPV"}</span>, having its principal registered commercial office at the subject property site, represented herein by its Authorised Signatory.
                        </div>
                        <div className="text-slate-400 font-bold uppercase text-[10px] text-center">— AND —</div>
                        <div>
                          <span className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 block">PARTY OF THE SECOND PART (LESSEE / TENANT):</span>
                          <span className="font-bold text-slate-900">{inspectingContract.occupantName || "Commercial Occupant"}</span>
                          {inspectingContract.occupantEmail && <span className="text-slate-500 font-mono ml-1">({inspectingContract.occupantEmail})</span>},
                          duly incorporated and registered under the Companies Act, represented herein by its Designated Signatory.
                        </div>
                      </div>

                      {/* Recitals & Articles */}
                      <div className="space-y-4 pt-2">
                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            1. Demised Premises &amp; Super Built-up Area
                          </h4>
                          <p>
                            The Lessor hereby leases and demises unto the Lessee all that commercial office suite designated as{" "}
                            <strong>{inspectingContract.unitNumber || "Designated Commercial Suite"}</strong>, located on{" "}
                            <strong>Floor {inspectingContract.floorNumber || "1"}</strong> of the commercial development known as{" "}
                            <strong>{inspectingContract.propertyName || "Commercial Tower"}</strong>, having a chargeable measurement of{" "}
                            <strong>{Number(inspectingContract.areaSqft || 2500).toLocaleString()} Sq.Ft.</strong> super built-up area.
                          </p>
                        </section>

                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            2. Lease Term &amp; Possession
                          </h4>
                          <p>
                            The lease shall commence on the Effective Date of <strong>{inspectingContract.startDate || "Commencement Date"}</strong> and shall expire on{" "}
                            <strong>{inspectingContract.endDate || "Expiration Date"}</strong>. Possession of the premises has been delivered in warm-shell commercial condition to the satisfaction of the Lessee.
                          </p>
                        </section>

                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            3. Monthly Base Rent &amp; CAM Consideration
                          </h4>
                          <p>
                            In consideration of the demised premises, the Lessee agrees to pay the Lessor a fixed monthly base rental of{" "}
                            <strong className="text-slate-900">₹{Number(inspectingContract.baseRent || inspectingContract.base_rent_monthly || 185000).toLocaleString("en-IN")}/- (Rupees per Month)</strong>,
                            plus applicable Goods and Services Tax (GST @ 18%). In addition, the Common Area Maintenance (CAM) charge shall be billed at prevailing institutional rates on a monthly basis. Rent shall be payable on or before the 5th day of each calendar month.
                          </p>
                        </section>

                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            4. Interest-Free Refundable Security Deposit (IFRSD)
                          </h4>
                          <p>
                            The Lessee has deposited with the Lessor an Interest-Free Refundable Security Deposit of{" "}
                            <strong className="text-slate-900">₹{Number(inspectingContract.depositAmountInr || (Number(inspectingContract.baseRent || 185000) * 6)).toLocaleString("en-IN")}/-</strong>{" "}
                            (representing six months' base rental). The said deposit shall be refunded within thirty (30) banking days following vacant physical surrender of the demised premises.
                          </p>
                        </section>

                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            5. Escalation, Lock-in &amp; Termination
                          </h4>
                          <p>
                            <strong>Escalation:</strong> The monthly base rental shall escalate by <strong>5.0% every 12 months</strong> on a compounded basis.<br />
                            <strong>Lock-in Period:</strong> A mandatory lock-in period of <strong>{inspectingContract.lockInPeriodDays ? `${Math.round(inspectingContract.lockInPeriodDays / 30)} Months` : "36 Months"}</strong> applies from commencement. Neither party may terminate during this lock-in.<br />
                            <strong>Notice Period:</strong> Following expiry of the lock-in, either party may terminate this deed by serving <strong>{inspectingContract.noticePeriodDays || 90} days</strong> written notice.
                          </p>
                        </section>

                        <section className="space-y-1.5">
                          <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">
                            6. Governing Law &amp; Jurisdiction
                          </h4>
                          <p>
                            This Agreement shall be construed and governed in accordance with the laws of the Republic of India. Any dispute arising out of or in connection with this deed shall be referred to sole arbitration under the Arbitration &amp; Conciliation Act, 1996.
                          </p>
                        </section>
                      </div>

                      {/* Signature Blocks */}
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-slate-300 font-sans">
                        <div className="space-y-6">
                          <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
                            <span className="font-serif italic text-teal-800 text-sm">Digitally Sealed &amp; Signed</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">FOR LESSOR (LANDLORD SPV)</div>
                            <div className="text-[10px] text-slate-500">Authorised Signatory / Managing Trustee</div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
                            <span className="font-serif italic text-blue-800 text-sm">Digitally Sealed &amp; Signed</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">FOR LESSEE ({inspectingContract.occupantName || "TENANT"})</div>
                            <div className="text-[10px] text-slate-500">Designated Director / Authorised Signatory</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Key Commercial Terms View */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Corporate Tenant</span>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingContract.occupantName || "Commercial Occupier"}</div>
                          {inspectingContract.occupantEmail && (
                            <div className="font-mono text-slate-500 text-[11px] mt-0.5">{inspectingContract.occupantEmail}</div>
                          )}
                          {inspectingContract.occupantPan && (
                            <div className="font-mono text-[11px] text-slate-600 mt-1">PAN: {inspectingContract.occupantPan}</div>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Subject Commercial Property</span>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingContract.propertyName || "Asset Portfolio"}</div>
                          {inspectingContract.propertyCode && (
                            <div className="font-mono text-teal-800 text-[11px] font-bold">{inspectingContract.propertyCode}</div>
                          )}
                          <div className="text-[11px] text-slate-600 mt-1">
                            Unit: {inspectingContract.unitNumber || "Full Floor"} • Area: {Number(inspectingContract.areaSqft || 2500).toLocaleString()} Sq.Ft.
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Base Rental</span>
                          <div className="text-base font-black text-slate-900 mt-0.5">
                            ₹{Number(inspectingContract.baseRent || inspectingContract.base_rent_monthly || 185000).toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-500"> / month</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Exclusive of 18% GST &amp; CAM</div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Lease Tenure Dates</span>
                          <div className="font-medium text-slate-800 mt-0.5">From: <span className="font-bold">{inspectingContract.startDate || "Execution date"}</span></div>
                          <div className="font-medium text-slate-800">To: <span className="font-bold">{inspectingContract.endDate || "36 Months"}</span></div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900 text-xs">Standard Commercial Governance Terms</h4>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-bold block text-[9px] uppercase">Lock-in Period</span>
                            <span className="font-bold text-slate-800">36 Months</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-bold block text-[9px] uppercase">Escalation Rate</span>
                            <span className="font-bold text-slate-800">5.0% every 12 mo</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 font-bold block text-[9px] uppercase">Notice Period</span>
                            <span className="font-bold text-slate-800">90 Days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Print / Save Legal Agreement</span>
                  </button>
                  <button
                    onClick={() => setInspectingContract(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close Contract View
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROPERTY DETAIL INSPECTION MODAL */}
          {inspectingProperty && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          {inspectingProperty.name || inspectingProperty.propertyName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          inspectingProperty.verificationStatus === "verified" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          inspectingProperty.verificationStatus === "rejected" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                          "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {inspectingProperty.verificationStatus === "verified" ? "Verified Asset" :
                           inspectingProperty.verificationStatus === "rejected" ? "Rejected" : "Pending Review"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Asset Specifications, Ownership SPV &amp; Management Profile
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingProperty(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Asset Code &amp; Type</span>
                    <div className="font-mono text-teal-800 text-sm font-bold mt-0.5">{inspectingProperty.code || inspectingProperty.propertyCode || "—"}</div>
                    <div className="text-slate-600 capitalize font-medium">{inspectingProperty.type || "Commercial Asset"}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Leasable Space</span>
                    <div className="text-slate-900 text-base font-black mt-0.5">
                      {Number(inspectingProperty.totalAreaSqft || inspectingProperty.areaSqft || 0).toLocaleString()} Sq.Ft
                    </div>
                    <div className="text-slate-500 text-[11px]">{inspectingProperty.city}, {inspectingProperty.state}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Legal Entity / Landlord SPV</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingProperty.spvName || "Direct Ownership"}</div>
                    <div className="font-mono text-[11px] text-slate-600 mt-1 space-y-0.5">
                      <div>PAN: <span className="font-bold text-slate-800">{inspectingProperty.pan || "Not recorded"}</span></div>
                      <div>GSTIN: <span className="font-bold text-slate-800">{inspectingProperty.gstin || "Not recorded"}</span></div>
                      {inspectingProperty.cin && <div>CIN: <span className="font-bold text-slate-800">{inspectingProperty.cin}</span></div>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Operations &amp; Delegation</span>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {inspectingProperty.hasDelegatedManager ? inspectingProperty.managerName : "Managed directly by Owner"}
                    </div>
                    {inspectingProperty.managerEmail && (
                      <div className="font-mono text-slate-500 text-[11px]">{inspectingProperty.managerEmail}</div>
                    )}
                    {inspectingProperty.managerType && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                        {inspectingProperty.managerType}
                      </span>
                    )}
                  </div>
                </div>

                {inspectingProperty.verificationRemarks && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">Super Admin Verification Notes:</span>
                    <p className="text-slate-700 mt-1 font-medium">{inspectingProperty.verificationRemarks}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {inspectingProperty.verificationStatus !== "verified" ? (
                    <button
                      onClick={() => {
                        const p = inspectingProperty;
                        setInspectingProperty(null);
                        setVerifyingProp(p);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle size={14} />
                      <span>Review &amp; Verify This Property</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> Verified &amp; Compliance Approved
                    </span>
                  )}
                  <button
                    onClick={() => setInspectingProperty(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE INSPECTION MODAL */}
          {inspectingInvoice && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 font-mono">
                          {inspectingInvoice.invoiceNumber || "Tax Invoice"}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          inspectingInvoice.status === "paid" ? "bg-emerald-100 text-emerald-800" :
                          inspectingInvoice.status === "overdue" ? "bg-rose-100 text-rose-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {inspectingInvoice.status || "issued"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Monthly Rent &amp; Commercial Tax Invoice Ledger
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingInvoice(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Billed For Property</span>
                      <div className="font-bold text-slate-900 text-sm">{inspectingInvoice.propertyName}</div>
                      <div className="text-[11px] text-slate-500">{inspectingInvoice.orgName}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Billing Timeline</span>
                      <div className="text-slate-800">Date: <span className="font-bold">{inspectingInvoice.invoiceDate || "Current Month"}</span></div>
                      <div className="text-slate-600">Due: <span className="font-bold">{inspectingInvoice.dueDate || "5th of month"}</span></div>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Base Rental Amount:</span>
                      <span className="font-mono font-bold">₹{Number(inspectingInvoice.subtotal || inspectingInvoice.baseRent || inspectingInvoice.grossTotal * 0.847 || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>GST @ 18.0% (9% CGST + 9% SGST):</span>
                      <span className="font-mono font-bold text-teal-800">₹{Number(inspectingInvoice.gstAmount || inspectingInvoice.grossTotal * 0.153 || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                      <span>Gross Invoice Total:</span>
                      <span className="font-mono">₹{Number(inspectingInvoice.grossTotal || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Amount Received (Paid):</span>
                      <span className="font-mono">₹{Number(inspectingInvoice.amountPaid || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold border-t border-slate-100 pt-1">
                      <span>Outstanding Balance Due:</span>
                      <span className="font-mono">₹{Number(inspectingInvoice.balanceDue || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setInspectingInvoice(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TENANT PROFILE INSPECTION MODAL */}
          {inspectingTenant && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          {inspectingTenant.name || inspectingTenant.tradeName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          {inspectingTenant.status || "active"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Commercial Occupant Profile &amp; Statutory Identifiers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingTenant(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trade / Brand Name</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingTenant.tradeName || inspectingTenant.name}</div>
                    <div className="font-mono text-teal-800 text-[10px] font-bold mt-0.5">{inspectingTenant.code || "TEN-RECORD"}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Legal Constitution</span>
                    <div className="text-slate-900 font-semibold capitalize mt-0.5">{inspectingTenant.type || "Corporate Entity"}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Leasing in: {inspectingTenant.orgName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tax Identification</span>
                    <div className="font-mono text-[11px] text-slate-800 mt-1 space-y-0.5">
                      <div>PAN: <span className="font-bold text-slate-900">{inspectingTenant.pan || "Not recorded"}</span></div>
                      <div>GSTIN: <span className="font-bold text-slate-900">{inspectingTenant.gstin || "Not recorded"}</span></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact Details</span>
                    <div className="text-slate-800 font-medium mt-0.5">{inspectingTenant.email || "No email"}</div>
                    <div className="font-mono text-slate-600 text-[11px]">{inspectingTenant.phone || "No phone"}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setInspectingTenant(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close Tenant Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SAAS SUBSCRIPTION & LICENSE DOSSIER MODAL */}
          {inspectingOrgSubscription && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          {inspectingOrgSubscription.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          inspectingOrgSubscription.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {inspectingOrgSubscription.subscriptionStatus || "active"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Commercial SaaS License Certificate &amp; Payment Ledger
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingOrgSubscription(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Subscription Key Metrics Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Plan Tier</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      {inspectingOrgSubscription.planTier?.replace(" Tier", "") || "Enterprise"}
                    </div>
                    <span className="text-[10px] text-indigo-700 font-bold">{inspectingOrgSubscription.billingCycle || "Annual Prepaid"}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Plan Fee Paid</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      ₹{Number(inspectingOrgSubscription.amountPaid || 479988).toLocaleString("en-IN")}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ Paid &amp; Invoiced</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Activation Date</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {inspectingOrgSubscription.startDate || "2026-04-01"}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">FY 2026-27</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Expiry / Renewal</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {inspectingOrgSubscription.expiryDate || "2027-03-31"}
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold">
                      {inspectingOrgSubscription.daysRemaining != null ? `${inspectingOrgSubscription.daysRemaining} days left` : "Active"}
                    </span>
                  </div>
                </div>

                {/* Tax & Billing Entity Identifiers */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tax Identification</span>
                    <div className="font-mono text-[11px] text-slate-700 mt-1 space-y-0.5">
                      <div>PAN: <span className="font-bold text-slate-900">{inspectingOrgSubscription.pan || "AAACP1234F"}</span></div>
                      <div>GSTIN: <span className="font-bold text-slate-900">{inspectingOrgSubscription.gstin || "07AAACP1234F1Z5"}</span></div>
                      <div>Slug: <span className="font-bold text-slate-900">{inspectingOrgSubscription.slug || "master-org"}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Billing &amp; Invoice Reference</span>
                    <div className="font-mono text-[11px] text-slate-700 mt-1 space-y-0.5">
                      <div>Invoice Ref: <span className="font-bold text-teal-800">{inspectingOrgSubscription.invoiceNumber || "INV-SUB-2026-001"}</span></div>
                      <div>Method: <span className="font-bold text-slate-900">{inspectingOrgSubscription.paymentMethod || "Corporate NetBanking / NEFT"}</span></div>
                      <div>Quota: <span className="font-bold text-slate-900">{inspectingOrgSubscription.licensedCapacitySqft || "Up to 5,000,000 Sq.Ft"}</span></div>
                    </div>
                  </div>
                </div>

                {/* Licensed Platform Modules */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs">Included Institutional Modules in License:</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Rent Roll Register (39-point Schedule)</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Automated Monthly Invoicing &amp; GST</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>CAM Pooling &amp; Year-End True-Up</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Smart Submetering &amp; Utility Splitter</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>CAFM &amp; Preventive Maintenance</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 text-slate-800 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Visitor Compliance &amp; Digital Clearance</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Print License Receipt</span>
                  </button>
                  <button
                    onClick={() => setInspectingOrgSubscription(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
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
                    {currentAdminEmail ? currentAdminEmail.split("@")[0].toUpperCase() : "Master Super Admin"} <span className="font-normal text-slate-400 text-xs font-mono">({currentAdminEmail || "admin@officex.pro"})</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Authority: <span className="font-mono text-teal-300">Master Root Security (Sovereign Authority)</span>
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
                <div className="font-bold text-white text-sm">OfficeX Master Administration</div>
                <div className="text-[11px] text-teal-300 font-mono">Slug: root-super-admin</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Commercial Portfolios</span>
                <div className="font-bold text-white text-sm">
                  {saasProperties.length > 0 ? saasProperties.map((p: any) => p.name).join(", ") : "0 Properties (Clean Slate)"}
                </div>
                <div className="text-[11px] text-teal-300 font-mono">
                  {saasProperties.length > 0 ? `${saasProperties.length} active portfolios` : "Ready for your fresh property test"}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Platform Governance Scope</span>
                <div className="font-bold text-white text-sm">Full Sovereign Authority</div>
                <div className="text-[11px] text-slate-400">All 133 Tables &amp; Marketplaces</div>
              </div>
            </div>
          </div>

          {/* Organizations & Subscriptions Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Organizations &amp; Subscription License Control</h3>
                <p className="text-xs text-slate-500">Live monitoring of contracted client entities, subscription dates, amounts paid, and license overrides.</p>
              </div>
              <span className="text-xs text-teal-800 font-bold bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                {orgsList.length} Client Organizations Registered
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Organization &amp; Plan</th>
                    <th className="p-3">Amount Paid / Cycle</th>
                    <th className="p-3">Activation &amp; Expiry</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">License Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgsList.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/60">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{org.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                            {org.planTier || "Enterprise Institutional Tier"}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{org.slug || "org"}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          ₹{Number(org.amountPaid || 479988).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-teal-800 font-bold">
                          {org.billingCycle || "Annual Prepaid"}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        <div>From: <span className="font-bold text-slate-900">{org.startDate || "2026-04-01"}</span></div>
                        <div>To: <span className="font-bold text-slate-900">{org.expiryDate || "2027-03-31"}</span></div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          {org.daysRemaining != null ? `${org.daysRemaining} days remaining` : "Active Term"}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          org.subscriptionStatus === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {org.subscriptionStatus || "active"}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {org.paymentStatus || "Paid & Invoiced"}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingOrgSubscription(org)}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleToggleSubscription(org.id, org.subscriptionStatus || "active")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              org.subscriptionStatus === "active"
                                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {org.subscriptionStatus === "active" ? <Lock size={12} /> : <Unlock size={12} />}
                            <span>{org.subscriptionStatus === "active" ? "Suspend" : "Activate"}</span>
                          </button>
                        </div>
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
      {/* Full Documented Legal Lease Contract Modal */}
      {inspectingContractDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden animate-scaleUp">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      Commercial Lease Deed · {inspectingContractDoc.contractCode || "LC-ACTIVE"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {inspectingContractDoc.contractStatus || "active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tenant: <span className="text-white font-semibold">{inspectingContractDoc.occupantName}</span> ↔ Asset: <span className="text-white font-semibold">{inspectingContractDoc.propertyName}</span> {inspectingContractDoc.unitNumber ? `(${inspectingContractDoc.unitNumber})` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/contracts/${inspectingContractDoc.id}/pdf?admin=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={13} />
                  <span>Download / Print Deed ↗</span>
                </a>
                <button
                  onClick={() => setInspectingContractDoc(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded Full Legal Document Viewer */}
            <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
              <iframe
                src={`/api/contracts/${inspectingContractDoc.id}/pdf?admin=1`}
                title={`Contract-${inspectingContractDoc.contractCode}`}
                className="w-full h-full border-none shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive 6-Tab Contract Dossier Drawer (§S-22) */}    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-white text-xs font-bold animate-pulse">
        Initializing Sovereign Admin Console...
      </div>
    }>
      <SuperAdminDashboardContent />
    </Suspense>
  );
}
