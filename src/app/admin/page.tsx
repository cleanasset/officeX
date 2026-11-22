"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
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
  Sliders, ArrowUpDown, CreditCard,
  Calendar, QrCode, Wrench, FileCheck2, Laptop, MessageSquare, RotateCcw, Loader2, ShieldAlert,
  Percent, Tag, ToggleLeft, ToggleRight, CheckSquare, HelpCircle, Package, Receipt
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
      if (tabParam === "pricing" && subParam) {
        if (["all", "marketplace", "saas_suites", "saas_modules", "fm", "coupons", "saas", "gst"].includes(subParam)) {
          if (subParam === "saas") setPricingSubTab("saas_suites");
          else if (subParam === "gst") setPricingSubTab("all");
          else setPricingSubTab(subParam as any);
        }
      }
    }

    const moduleParam = searchParams.get("module");
    if (moduleParam && ["package", "rent_roll", "marketplace", "cafm", "visitor", "compliance", "crm"].includes(moduleParam)) {
      setSelectedSaasModule(moduleParam as any);
    }

    if (subParam) {
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
  const [pricingSubTab, setPricingSubTab] = useState<"all" | "marketplace" | "saas_suites" | "saas_modules" | "fm" | "coupons">("all");
  const [selectedPricingItem, setSelectedPricingItem] = useState<string>("hotDesk");
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
  const [mpStatus, setMpStatus] = useState<string>("all");
  const [mpCounts, setMpCounts] = useState<{ pendingCount: number; changesRequestedCount: number; activeCount: number; total: number }>({
    pendingCount: 0,
    changesRequestedCount: 0,
    activeCount: 0,
    total: 0
  });
  const [moderatingListing, setModeratingListing] = useState<any | null>(null);
  const [modAdminRemarks, setModAdminRemarks] = useState<string>("");
  const [modRequestedDocs, setModRequestedDocs] = useState<string[]>([]);
  const [modActionLoading, setModActionLoading] = useState<boolean>(false);
  const [revertMode, setRevertMode] = useState<boolean>(false);
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
  const [saasSubTab, setSaasSubTab] = useState<
    | "overview"
    | "properties"
    | "pending_deletions"
    | "contracts"
    | "tenants"
    | "delegations"
    | "invoices"
    | "orgs"
    | "cafm_ppm"
    | "cafm_assets"
    | "cafm_breakdowns"
    | "cafm_amc"
    | "visitor_logs"
    | "turnstiles"
    | "guard_console"
    | "evacuation"
    | "compliance_licenses"
    | "compliance_renewals"
    | "compliance_vault"
    | "crm_stacking"
    | "crm_helpdesk"
    | "crm_amenities"
  >("overview");
  const [selectedSaasModule, setSelectedSaasModule] = useState<
    "package" | "rent_roll" | "marketplace" | "cafm" | "visitor" | "compliance" | "crm"
  >("package");
  const [userFilterRole, setUserFilterRole] = useState<string>("all");
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);
  const [inspectingTargetEmail, setInspectingTargetEmail] = useState<any | null>(null);

  const [selectedPendingDeletionIds, setSelectedPendingDeletionIds] = useState<string[]>([]);
  const [bulkGovernanceLoading, setBulkGovernanceLoading] = useState<boolean>(false);
  const [deletionProcessingState, setDeletionProcessingState] = useState<{
    active: boolean;
    title: string;
    message: string;
  }>({
    active: false,
    title: "",
    message: "",
  });

  const handleApprovePropertyDeletion = async (propertyId: string) => {
    if (!confirm("Are you sure you want to approve permanent deletion of this property? This will terminate associated leases and cancel invoices.")) return;
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: "Approving Permanent Property Deletion...",
      message: "Executing cascading deactivation: purging demarcated spaces, terminating lease contracts, cancelling associated invoices, and updating tenant registries. Please wait...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_deletion", id: propertyId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: "✓ Property deletion approved and permanently purged across all dashboards.", type: "success" });
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to approve deletion", type: "error" });
      }
    } catch {
      setToast({ text: "Network error approving deletion", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

  const handleRejectPropertyDeletion = async (propertyId: string) => {
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: "Rejecting Property Deletion Request...",
      message: "Restoring commercial property to active verified status...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_deletion", id: propertyId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: "✓ Deletion request rejected. Property restored to active.", type: "success" });
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to reject deletion", type: "error" });
      }
    } catch {
      setToast({ text: "Network error rejecting deletion", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

  const handleApproveAllDeletions = async () => {
    const pendingProps = saasProperties.filter((p) => p.pendingDeletion);
    if (pendingProps.length === 0) return;
    if (
      !confirm(
        `SUPER ADMIN GOVERNANCE:\n\nAre you sure you want to APPROVE permanent deletion for ALL ${pendingProps.length} pending properties?\n\n• All demarcated spaces will be purged.\n• All active lease contracts will be terminated.\n• All associated invoices will be cancelled.\n• Inactive tenant accounts will be decommissioned.\n• This action CANNOT be undone.`
      )
    ) {
      return;
    }
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: `Purging & Deactivating All ${pendingProps.length} Commercial Properties...`,
      message: "Institutional safety protocol in execution: cascading unit deallocation, lease contract termination, invoice cancellation, and clearing tenant registries. This may take a few moments. Please do not close or reload this window...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all_deletions" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: `✓ Successfully approved permanent deletion and cascaded deactivations for all ${data.count || pendingProps.length} properties.`, type: "success" });
        setSelectedPendingDeletionIds([]);
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to approve all deletions", type: "error" });
      }
    } catch {
      setToast({ text: "Network error approving all deletions", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

  const handleRejectAllDeletions = async () => {
    const pendingProps = saasProperties.filter((p) => p.pendingDeletion);
    if (pendingProps.length === 0) return;
    if (
      !confirm(
        `SUPER ADMIN GOVERNANCE:\n\nAre you sure you want to REJECT deletion requests for ALL ${pendingProps.length} pending properties and restore them to active status?`
      )
    ) {
      return;
    }
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: `Restoring All ${pendingProps.length} Properties...`,
      message: "Reverting deletion requests and restoring properties to active institutional status...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_all_deletions" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: `✓ Rejected deletion requests for all ${data.count || pendingProps.length} properties. Restored to active.`, type: "success" });
        setSelectedPendingDeletionIds([]);
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to reject all deletions", type: "error" });
      }
    } catch {
      setToast({ text: "Network error rejecting all deletions", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

  const handleApproveSelectedDeletions = async () => {
    if (selectedPendingDeletionIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to approve permanent deletion for ${selectedPendingDeletionIds.length} selected properties?\n\nThis will purge units, terminate contracts, and cancel invoices.`
      )
    ) {
      return;
    }
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: `Purging ${selectedPendingDeletionIds.length} Selected Properties...`,
      message: "Executing cascading deactivations: terminating lease contracts, cancelling associated invoices, and purging units...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_deletion", ids: selectedPendingDeletionIds }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: `✓ Approved permanent deletion for ${selectedPendingDeletionIds.length} selected properties.`, type: "success" });
        setSelectedPendingDeletionIds([]);
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to approve selected deletions", type: "error" });
      }
    } catch {
      setToast({ text: "Network error approving selected deletions", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

  const handleRejectSelectedDeletions = async () => {
    if (selectedPendingDeletionIds.length === 0) return;
    if (
      !confirm(
        `Reject deletion and restore ${selectedPendingDeletionIds.length} selected properties to active status?`
      )
    ) {
      return;
    }
    setBulkGovernanceLoading(true);
    setDeletionProcessingState({
      active: true,
      title: `Rejecting ${selectedPendingDeletionIds.length} Deletion Requests...`,
      message: "Restoring selected properties to active status...",
    });
    try {
      const res = await fetch("/api/admin/saas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_deletion", ids: selectedPendingDeletionIds }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ text: `✓ Rejected deletion for ${selectedPendingDeletionIds.length} properties. Restored to active.`, type: "success" });
        setSelectedPendingDeletionIds([]);
        await loadSaasData();
      } else {
        setToast({ text: data.error || "Failed to reject selected deletions", type: "error" });
      }
    } catch {
      setToast({ text: "Network error rejecting selected deletions", type: "error" });
    } finally {
      setDeletionProcessingState({ active: false, title: "", message: "" });
      setBulkGovernanceLoading(false);
    }
  };

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

  // Discounts & Special User Pricing State
  const [discountsList, setDiscountsList] = useState<any[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState<boolean>(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState<boolean>(false);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    discountPct: 100,
    type: "global",
    targetUserEmail: "",
    notes: "",
  });
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
      loadDiscounts();
    }
  }, [activeTab]);

  async function loadDiscounts() {
    setDiscountsLoading(true);
    try {
      const res = await fetch("/api/admin/discounts");
      const data = await res.json();
      if (data.success) {
        setDiscountsList(data.discounts || []);
      }
    } catch {
      showToast("Failed to load promotional discounts", "error");
    } finally {
      setDiscountsLoading(false);
    }
  }

  async function handleCreateDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!newDiscount.code) {
      showToast("Please enter a coupon code", "error");
      return;
    }
    if (newDiscount.type === "user_specific" && !newDiscount.targetUserEmail) {
      showToast("Please specify the target user email", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          discount: newDiscount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountsList(data.discounts);
        setShowAddDiscountModal(false);
        setNewDiscount({
          code: "",
          discountPct: 100,
          type: "global",
          targetUserEmail: "",
          notes: "",
        });
        showToast("✓ Discount coupon / special user pricing created successfully!", "success");
      }
    } catch {
      showToast("Failed to create discount", "error");
    }
  }

  async function handleToggleDiscount(id: string) {
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountsList(data.discounts);
        showToast("Discount status updated", "success");
      }
    } catch {
      showToast("Failed to toggle discount", "error");
    }
  }

  async function handleDeleteDiscount(id: string) {
    if (!confirm("Are you sure you want to revoke this discount code?")) return;
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountsList(data.discounts);
        showToast("Discount revoked", "success");
      }
    } catch {
      showToast("Failed to revoke discount", "error");
    }
  }

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
  }, [activeTab, mpPage, mpCity, mpStatus]);

  async function loadMarketplaceListings() {
    setMpLoading(true);
    try {
      const url = `/api/admin/marketplace?page=${mpPage}&limit=15&q=${encodeURIComponent(mpSearch)}&city=${encodeURIComponent(mpCity)}&status=${encodeURIComponent(mpStatus)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMpListings(data.listings || []);
        setMpTotalPages(data.pagination?.totalPages || 1);
        if (data.counts) {
          setMpCounts(data.counts);
        }
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

  // Admin Moderation: Approve and Publish to Marketplace
  async function handleApproveListing(listingId: string) {
    setModActionLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listingId,
          view: "moderation",
          action: "approve",
          adminRemarks: modAdminRemarks || "Approved and published by Super Admin"
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Listing approved and published live to public marketplace!");
        setModeratingListing(null);
        setRevertMode(false);
        setModAdminRemarks("");
        setModRequestedDocs([]);
        loadMarketplaceListings();
      } else {
        showToast(data.error || "Approval failed", "error");
      }
    } catch {
      showToast("Error approving listing", "error");
    } finally {
      setModActionLoading(false);
    }
  }

  // Admin Moderation: Revert with feedback notes and requested documents
  async function handleRevertListing(listingId: string) {
    if (!modAdminRemarks.trim() && modRequestedDocs.length === 0) {
      showToast("Please enter remarks or select at least one document to request", "error");
      return;
    }
    setModActionLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: listingId,
          view: "moderation",
          action: "revert",
          adminRemarks: modAdminRemarks,
          requestedDocs: modRequestedDocs
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Revert notice dispatched to host with document checklist!");
        setModeratingListing(null);
        setRevertMode(false);
        setModAdminRemarks("");
        setModRequestedDocs([]);
        loadMarketplaceListings();
      } else {
        showToast(data.error || "Revert failed", "error");
      }
    } catch {
      showToast("Error reverting listing", "error");
    } finally {
      setModActionLoading(false);
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
          {/* Main Pricing Matrix Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            
            {/* Top Header & Save Control */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Commercial Tariffs &amp; Statutory GST Architecture</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider border border-teal-200">
                    Dual-Panel Matrix
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure individual pricing on one side and dedicated GST taxation options on the other side for every Marketplace tier and SaaS subscription.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  disabled={pricingSaving || !pricingConfig}
                  onClick={handleSavePricing}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  <Save size={15} />
                  <span>{pricingSaving ? "Persisting to Database..." : "Save & Activate All Tariffs"}</span>
                </button>
              </div>
            </div>

            {pricingLoading || !pricingConfig ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-teal-600" />
                <p className="text-xs font-semibold">Loading commercial pricing matrix from system KV store...</p>
              </div>
            ) : (() => {
              const globalSacCode = pricingConfig.taxConfig?.sacCode || "997212";
              const globalGstEnabled = pricingConfig.taxConfig?.enabled !== false;
              const globalGstRate = Number(pricingConfig.taxConfig?.gstRatePct) || 18;
              const globalGstMode = pricingConfig.taxConfig?.gstMode || "exclusive";

              // Per-Item Tax Helper
              const getItemTax = (itemKey: string) => {
                const override = pricingConfig.taxConfig?.itemOverrides?.[itemKey];
                if (override) {
                  return {
                    enabled: override.enabled !== false,
                    gstRatePct: Number(override.gstRatePct) ?? globalGstRate,
                    gstMode: override.gstMode || globalGstMode,
                  };
                }
                return {
                  enabled: globalGstEnabled,
                  gstRatePct: globalGstRate,
                  gstMode: globalGstMode,
                };
              };

              const updateItemTax = (itemKey: string, patch: any) => {
                const current = getItemTax(itemKey);
                const updated = { ...current, ...patch };
                setPricingConfig({
                  ...pricingConfig,
                  taxConfig: {
                    ...pricingConfig.taxConfig,
                    itemOverrides: {
                      ...(pricingConfig.taxConfig?.itemOverrides || {}),
                      [itemKey]: updated,
                    },
                  },
                });
              };

              // Exact Tax Computation
              const calcItemTax = (basePrice: number, itemKey: string) => {
                const tax = getItemTax(itemKey);
                const isEnabled = tax.enabled;
                const rate = isEnabled ? (Number(tax.gstRatePct) || 0) : 0;
                const mode = tax.gstMode;

                let taxable = basePrice;
                let gstAmount = 0;
                let grossTotal = basePrice;

                if (!isEnabled || rate === 0) {
                  return { taxable: basePrice, gstAmount: 0, grossTotal: basePrice, rate: 0, mode, enabled: false };
                }

                if (mode === "inclusive") {
                  taxable = Math.round((basePrice / (1 + rate / 100)) * 100) / 100;
                  gstAmount = Math.round((basePrice - taxable) * 100) / 100;
                  grossTotal = basePrice;
                } else {
                  taxable = basePrice;
                  gstAmount = Math.round(((basePrice * rate) / 100) * 100) / 100;
                  grossTotal = taxable + gstAmount;
                }

                return { taxable, gstAmount, grossTotal, rate, mode, enabled: true };
              };

              // Quick Bulk Tax Applicator
              const applyBulkTax = (opts: { enabled?: boolean; rate?: number; mode?: "exclusive" | "inclusive" }) => {
                const newOverrides: Record<string, any> = { ...(pricingConfig.taxConfig?.itemOverrides || {}) };
                allCommercialItems.forEach((item) => {
                  const existing = getItemTax(item.key);
                  newOverrides[item.key] = {
                    enabled: opts.enabled !== undefined ? opts.enabled : existing.enabled,
                    gstRatePct: opts.rate !== undefined ? opts.rate : existing.gstRatePct,
                    gstMode: opts.mode !== undefined ? opts.mode : existing.gstMode,
                  };
                });
                setPricingConfig({
                  ...pricingConfig,
                  taxConfig: {
                    ...pricingConfig.taxConfig,
                    enabled: opts.enabled !== undefined ? opts.enabled : pricingConfig.taxConfig?.enabled,
                    gstRatePct: opts.rate !== undefined ? opts.rate : pricingConfig.taxConfig?.gstRatePct,
                    gstMode: opts.mode !== undefined ? opts.mode : pricingConfig.taxConfig?.gstMode,
                    itemOverrides: newOverrides,
                  },
                });
                setToast({ text: "Bulk GST options updated across all packages!", type: "success" });
              };

              // Master list of all commercial items
              const allCommercialItems = [
                // 1. Office Marketplace
                {
                  key: "hotDesk",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "Coworking Desk",
                  icon: "Laptop",
                  title: "Hot Desk (Flexi Desk)",
                  desc: "Flexible shared desk in premium open coworking area with high-speed internet & coffee access.",
                  unit: "per desk / mo",
                  price: pricingConfig.officeMarketplace?.hotDeskMonthlyMin ?? 7999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, hotDeskMonthlyMin: v }
                  }),
                },
                {
                  key: "dedicatedDesk",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "Assigned Workstation",
                  icon: "Laptop",
                  title: "Dedicated Desk",
                  desc: "Dedicated personal workstation with lockable storage pedestal and 24/7 biometric access.",
                  unit: "per desk / mo",
                  price: pricingConfig.officeMarketplace?.dedicatedDeskMonthlyMin ?? 11999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, dedicatedDeskMonthlyMin: v }
                  }),
                },
                {
                  key: "privateCabin",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "Private Office",
                  icon: "Building2",
                  title: "Private Team Cabin",
                  desc: "Fully acoustic-insulated private team office suite with executive executive chairs and whiteboards.",
                  unit: "per cabin / mo",
                  price: pricingConfig.officeMarketplace?.privateCabinMonthlyMin ?? 15999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, privateCabinMonthlyMin: v }
                  }),
                },
                {
                  key: "managedOffice",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "Enterprise Suite",
                  icon: "Building2",
                  title: "Managed Enterprise Office",
                  desc: "Custom bespoke buildout floor with dedicated reception, meeting rooms, pantry, and IT server rack.",
                  unit: "per seat / mo",
                  price: pricingConfig.officeMarketplace?.managedOfficeMonthlyMin ?? 18500,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, managedOfficeMonthlyMin: v }
                  }),
                },
                {
                  key: "dayPass",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "Instant Access",
                  icon: "Calendar",
                  title: "Coworking Day Pass",
                  desc: "Single-day access ticket to workspace amenities, high-speed WiFi, and cafeteria lounge.",
                  unit: "per pass / day",
                  price: pricingConfig.officeMarketplace?.dayPassRate ?? 499,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, dayPassRate: v }
                  }),
                },
                {
                  key: "virtualOffice",
                  category: "Office Marketplace",
                  categoryType: "marketplace",
                  badge: "GST Compliance",
                  icon: "FileText",
                  title: "Virtual Office & Address",
                  desc: "Statutory commercial address registration with mail handling, courier forwarding, and GST NOC.",
                  unit: "per address / mo",
                  price: pricingConfig.officeMarketplace?.virtualOfficeMonthlyMin ?? 1499,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    officeMarketplace: { ...pricingConfig.officeMarketplace, virtualOfficeMonthlyMin: v }
                  }),
                },

                // 2. SaaS Bundles
                {
                  key: "cafmEssentials",
                  category: "All-in-One CAFM Suite",
                  categoryType: "saas_suites",
                  badge: "CAFM Core",
                  icon: "Zap",
                  title: "CAFM Essentials Bundle",
                  desc: "Complete operational foundation: 52-Week PPM, QR Maintenance, Asset Registry, and Visitor Flow.",
                  unit: "per property / mo",
                  price: pricingConfig.saasModules?.cafmEssentialsMonthly ?? 19999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, cafmEssentialsMonthly: v }
                  }),
                },
                {
                  key: "cafmPro",
                  category: "All-in-One CAFM Suite",
                  categoryType: "saas_suites",
                  badge: "CAFM Enterprise Scale",
                  icon: "Zap",
                  title: "CAFM Pro Bundle",
                  desc: "Essentials + Rent Roll automation, CAM reconciliation, and IoT sub-metering engine.",
                  unit: "base rate / mo",
                  price: pricingConfig.saasModules?.cafmProMonthly ?? 39999,
                  sqftPrice: pricingConfig.saasModules?.cafmProRatePerSqft ?? 2.0,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, cafmProMonthly: v }
                  }),
                  setSqftPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, cafmProRatePerSqft: v }
                  }),
                },
                {
                  key: "cafmEnterprise",
                  category: "All-in-One CAFM Suite",
                  categoryType: "saas_suites",
                  badge: "Full Portfolio Platform",
                  icon: "Zap",
                  title: "CAFM Enterprise Portfolio",
                  desc: "Unlimited multi-tower CAFM deployment with Custom ERP APIs, Lease CRM, and dedicated SLA support.",
                  unit: "portfolio base / mo",
                  price: pricingConfig.saasModules?.cafmEnterpriseMonthly ?? 79999,
                  sqftPrice: pricingConfig.saasModules?.cafmEnterpriseRatePerSqft ?? 3.5,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, cafmEnterpriseMonthly: v }
                  }),
                  setSqftPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, cafmEnterpriseRatePerSqft: v }
                  }),
                },

                // 3. SaaS Standalone Modules
                {
                  key: "rentRollStarter",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Rent Roll Tier 1",
                  icon: "Table",
                  title: "Rent Roll Pro (Starter)",
                  desc: "Automated lease contracts, indexation escalations, and invoice runs for up to 50 active tenants.",
                  unit: "up to 50 tenants / mo",
                  price: pricingConfig.saasModules?.rentRollStarterMonthly ?? 9999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, rentRollStarterMonthly: v }
                  }),
                },
                {
                  key: "rentRollGrowth",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Rent Roll Tier 2",
                  icon: "Table",
                  title: "Rent Roll Pro (Growth)",
                  desc: "Comprehensive lease tracking, dynamic utility invoicing, and rent collection for up to 200 tenants.",
                  unit: "up to 200 tenants / mo",
                  price: pricingConfig.saasModules?.rentRollGrowthMonthly ?? 24999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, rentRollGrowthMonthly: v }
                  }),
                },
                {
                  key: "rentRollEnterprise",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Rent Roll Unlimited",
                  icon: "Table",
                  title: "Rent Roll Pro (Enterprise)",
                  desc: "Unlimited tenant leases, multi-entity GST invoicing, automated dunning, and payment gateway sync.",
                  unit: "unlimited tenants / mo",
                  price: pricingConfig.saasModules?.rentRollEnterpriseMonthly ?? 49999,
                  sqftPrice: pricingConfig.saasModules?.rentRollRatePerSqft ?? 1.0,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, rentRollEnterpriseMonthly: v }
                  }),
                  setSqftPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, rentRollRatePerSqft: v }
                  }),
                },
                {
                  key: "ppmModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "PPM & QR Asset",
                  icon: "QrCode",
                  title: "52-Week PPM & Asset QR Engine",
                  desc: "Preventive maintenance schedules, digital asset QR tags, mobile engineer checklists, and audit logs.",
                  unit: "per building / mo",
                  price: pricingConfig.saasModules?.ppmModuleMonthly ?? 6999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, ppmModuleMonthly: v }
                  }),
                },
                {
                  key: "visitorModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Access Control",
                  icon: "UserCheck",
                  title: "Visitor Flow & Speed-Gates",
                  desc: "QR pre-invitations, facial recognition turnstile sync, contractor NDA capture, and OTP check-in.",
                  unit: "per speed-gate / mo",
                  price: pricingConfig.saasModules?.visitorModuleMonthly ?? 4999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, visitorModuleMonthly: v }
                  }),
                },
                {
                  key: "complianceModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Statutory Shield",
                  icon: "FileCheck2",
                  title: "Statutory Compliance Calendar",
                  desc: "Fire safety NOCs, lift licenses, pollution control consents, and factory inspectorate compliance tracker.",
                  unit: "per property / mo",
                  price: pricingConfig.saasModules?.complianceModuleMonthly ?? 3999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, complianceModuleMonthly: v }
                  }),
                },
                {
                  key: "leaseCrm",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Deal Pipeline",
                  icon: "Briefcase",
                  title: "Commercial Lease Dealflow CRM",
                  desc: "Broker lead tracking, RFP/LOI generation, tenant fit-out approvals, and space vacancy pipeline.",
                  unit: "per leasing team / mo",
                  price: pricingConfig.saasModules?.leaseCrmMonthly ?? 5999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, leaseCrmMonthly: v }
                  }),
                },
                {
                  key: "helpdeskModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Tenant Experience",
                  icon: "MessageSquare",
                  title: "Tenant Helpdesk & Room Booking",
                  desc: "Multi-tenant ticketing with SLA breach alarms, conference room credit booking, and amenity passes.",
                  unit: "per building / mo",
                  price: pricingConfig.saasModules?.helpdeskModuleMonthly ?? 3499,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, helpdeskModuleMonthly: v }
                  }),
                },
                {
                  key: "camModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "CAM Auditor",
                  icon: "Receipt",
                  title: "CAM Reconciliation Engine",
                  desc: "Common area maintenance budgeting, proportionate tenant expense sharing, and audit certificates.",
                  unit: "per property / mo",
                  price: pricingConfig.saasModules?.camModuleMonthly ?? 3999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, camModuleMonthly: v }
                  }),
                },
                {
                  key: "submeteringModule",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "IoT Energy",
                  icon: "RotateCcw",
                  title: "Smart Sub-metering & Utilities",
                  desc: "Automated DG & Grid electric meter billing with dual-source tariffs and daily consumption alerts.",
                  unit: "per building / mo",
                  price: pricingConfig.saasModules?.submeteringModuleMonthly ?? 2499,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, submeteringModuleMonthly: v }
                  }),
                },
                {
                  key: "tenantPaymentGateway",
                  category: "Standalone SaaS Module",
                  categoryType: "saas_modules",
                  badge: "Fintech Fee",
                  icon: "CreditCard",
                  title: "Tenant Payment Gateway Fee",
                  desc: "Platform processing fee percentage charged on online tenant rent payments & card collections.",
                  unit: "% per transaction",
                  price: pricingConfig.saasModules?.tenantPaymentGatewayFeePct ?? 1.2,
                  isPercentage: true,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    saasModules: { ...pricingConfig.saasModules, tenantPaymentGatewayFeePct: v }
                  }),
                },

                // 4. FM Services & Rates
                {
                  key: "fmEmergencyCallout",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Rapid Response",
                  icon: "Wrench",
                  title: "Emergency Callout Fee",
                  desc: "Base emergency dispatch fee for 60-minute critical breakdown support (HVAC, electrical, or plumbing).",
                  unit: "per incident",
                  price: pricingConfig.fmMarketplace?.emergencyCalloutFee ?? 999,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: { ...pricingConfig.fmMarketplace, emergencyCalloutFee: v }
                  }),
                },
                {
                  key: "fmDeepCleaning",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Sanitization",
                  icon: "Wrench",
                  title: "Deep Cleaning Service",
                  desc: "Industrial grade floor scrubbing, carpet shampooing, facade cleaning, and workstation disinfection.",
                  unit: "per sq.ft (min ₹4,500)",
                  price: pricingConfig.fmMarketplace?.rateCards?.deepCleaningPerSqft ?? 1.8,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, deepCleaningPerSqft: v }
                    }
                  }),
                },
                {
                  key: "fmHvacAmc",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Climate Control",
                  icon: "Wrench",
                  title: "HVAC Annual Maintenance (AMC)",
                  desc: "Comprehensive chiller, VRF/VRV, and AHU servicing including quarterly coil cleaning & gas refills.",
                  unit: "per TR ton / year",
                  price: pricingConfig.fmMarketplace?.rateCards?.hvacAmcPerTonAnnual ?? 2200,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, hvacAmcPerTonAnnual: v }
                    }
                  }),
                },
                {
                  key: "fmElectricalAudit",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Power & Safety",
                  icon: "Wrench",
                  title: "Electrical Safety & Thermography",
                  desc: "Infrared thermal imaging, transformer oil tests, harmonic distortion audits, and earthing checks.",
                  unit: "per sq.ft",
                  price: pricingConfig.fmMarketplace?.rateCards?.electricalAuditPerSqft ?? 1.2,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, electricalAuditPerSqft: v }
                    }
                  }),
                },
                {
                  key: "fmSecurityGuard",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Guarding Services",
                  icon: "ShieldCheck",
                  title: "Security Guard Deployment",
                  desc: "PSARA licensed 8-hour shift security guard with uniform, emergency drills, and perimeter surveillance.",
                  unit: "per guard / mo",
                  price: pricingConfig.fmMarketplace?.rateCards?.securityGuardPerMonth ?? 24000,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, securityGuardPerMonth: v }
                    }
                  }),
                },
                {
                  key: "fmPlumbing",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Piping & Valves",
                  icon: "Wrench",
                  title: "Plumbing Base Callout Visit",
                  desc: "Scheduled master plumber inspection, pressure pump diagnosis, and restroom valve servicing.",
                  unit: "per visit",
                  price: pricingConfig.fmMarketplace?.rateCards?.plumbingBaseVisit ?? 1500,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, plumbingBaseVisit: v }
                    }
                  }),
                },
                {
                  key: "fmPestControl",
                  category: "FM Marketplace",
                  categoryType: "fm",
                  badge: "Pest Shield",
                  icon: "Wrench",
                  title: "Commercial Pest Control",
                  desc: "Eco-friendly gel-based cockroach, rodent, and termite eradication for commercial offices.",
                  unit: "per sq.ft",
                  price: pricingConfig.fmMarketplace?.rateCards?.pestControlPerSqft ?? 0.75,
                  setPrice: (v: number) => setPricingConfig({
                    ...pricingConfig,
                    fmMarketplace: {
                      ...pricingConfig.fmMarketplace,
                      rateCards: { ...pricingConfig.fmMarketplace?.rateCards, pestControlPerSqft: v }
                    }
                  }),
                },
              ];

              // Filter based on active sub tab
              const filteredCommercialItems = allCommercialItems.filter((item) => {
                if (pricingSubTab === "all") return true;
                if (pricingSubTab === "marketplace") return item.categoryType === "marketplace";
                if (pricingSubTab === "saas_suites") return item.categoryType === "saas_suites";
                if (pricingSubTab === "saas_modules") return item.categoryType === "saas_modules";
                if (pricingSubTab === "fm") return item.categoryType === "fm";
                return true;
              });

              // Currently selected item for the Live Tax Invoice simulator
              const activeSimulatedItem = allCommercialItems.find((i) => i.key === selectedPricingItem) || allCommercialItems[0];
              const simulatedTax = calcItemTax(activeSimulatedItem.price, activeSimulatedItem.key);

              return (
                <div className="space-y-6">

                  {/* SUB-NAVIGATION BAR */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
                      {[
                        { id: "all", label: "🌟 All Packages", count: allCommercialItems.length },
                        { id: "marketplace", label: "🏢 Office Marketplace", count: 6 },
                        { id: "saas_suites", label: "⚡ CAFM SaaS Suites", count: 3 },
                        { id: "saas_modules", label: "🧩 Standalone SaaS Modules", count: 11 },
                        { id: "fm", label: "🛠️ FM Marketplace", count: 7 },
                        { id: "coupons", label: "🏷️ Discounts & Grants" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setPricingSubTab(tab.id as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            pricingSubTab === tab.id
                              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== undefined && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              pricingSubTab === tab.id ? "bg-teal-100 text-teal-800 font-black" : "bg-slate-200 text-slate-600"
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Quick Global Info Pill */}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <Tag size={13} className="text-teal-600" />
                        <span>Default SAC Code: <strong className="text-slate-900">{globalSacCode}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* COUPOUNS TAB */}
                  {pricingSubTab === "coupons" ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Discount Coupons &amp; Enterprise Grants</h3>
                          <p className="text-xs text-slate-500">Configure promotional vouchers, client-specific fee waivers, and introductory credits.</p>
                        </div>
                        <button
                          onClick={() => {
                            const code = prompt("Enter new Coupon Code (e.g. WELCOME20):");
                            if (!code) return;
                            const pct = prompt("Enter Discount Percentage (e.g. 20):", "20");
                            if (!pct) return;
                            const existing = pricingConfig.coupons || [];
                            setPricingConfig({
                              ...pricingConfig,
                              coupons: [...existing, { code: code.toUpperCase(), discountPct: Number(pct), active: true }]
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Create New Coupon</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(pricingConfig.coupons || [
                          { code: "OFFICEX20", discountPct: 20, active: true },
                          { code: "STARTUP50", discountPct: 50, active: true },
                          { code: "FOUNDERFREE", discountPct: 100, active: false },
                        ]).map((c: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                                {c.code}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                              }`}>
                                {c.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 flex items-center justify-between">
                              <span>Discount Rate:</span>
                              <span className="text-base font-black text-slate-900">{c.discountPct}% OFF</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <button
                                onClick={() => {
                                  const list = [...(pricingConfig.coupons || [])];
                                  list[idx] = { ...list[idx], active: !list[idx].active };
                                  setPricingConfig({ ...pricingConfig, coupons: list });
                                }}
                                className="text-teal-700 hover:underline font-semibold"
                              >
                                {c.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => {
                                  const list = (pricingConfig.coupons || []).filter((_: any, i: number) => i !== idx);
                                  setPricingConfig({ ...pricingConfig, coupons: list });
                                }}
                                className="text-rose-600 hover:underline font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (

                    /* SPLIT DUAL-PANEL LAYOUT (LEFT: PRICING + GST SIDES, RIGHT: LIVE SIMULATOR) */
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                      {/* ============================================================== */}
                      {/* LEFT COLUMN: PACKAGES CARDS WITH TWO SIDES (PRICING & GST)     */}
                      {/* ============================================================== */}
                      <div className="xl:col-span-8 space-y-4">
                        
                        {/* Section Bar */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-2xl">
                          <div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                              Commercial Packages &amp; Dual-Side Configuration
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Each card provides pricing inputs on the left and dedicated GST options on the right. Click any card to preview in the live invoice simulator.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl">
                            {filteredCommercialItems.length} Available
                          </span>
                        </div>

                        {/* Package Cards List */}
                        <div className="space-y-4">
                          {filteredCommercialItems.map((pkg) => {
                            const isSelected = selectedPricingItem === pkg.key;
                            const tax = getItemTax(pkg.key);
                            const itemPrice = pkg.price;
                            const math = calcItemTax(itemPrice, pkg.key);

                            return (
                              <div
                                key={pkg.key}
                                onClick={() => setSelectedPricingItem(pkg.key)}
                                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                                  isSelected
                                    ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                                }`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                                  {/* -------------------------------------------------------- */}
                                  {/* SIDE 1: PRICINGS SIDE (LEFT)                             */}
                                  {/* -------------------------------------------------------- */}
                                  <div className="p-5 md:col-span-6 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                          {pkg.badge}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                          {pkg.category}
                                        </span>
                                      </div>

                                      <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <span>{pkg.title}</span>
                                        {isSelected && (
                                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" title="Active in Invoice Simulator" />
                                        )}
                                      </h3>

                                      <p className="text-xs text-slate-500 leading-relaxed">
                                        {pkg.desc}
                                      </p>
                                    </div>

                                    {/* Base Price Input Box */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                        <span>Base Price (INR)</span>
                                        <span className="text-[10px] font-normal text-slate-500">{pkg.unit}</span>
                                      </label>

                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                          {pkg.isPercentage ? "%" : "₹"}
                                        </span>
                                        <input
                                          type="number"
                                          step={pkg.isPercentage ? "0.1" : "1"}
                                          value={pkg.price}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => pkg.setPrice(Number(e.target.value))}
                                          className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
                                        />
                                      </div>

                                      {/* Secondary Sq.ft Surcharge for Pro / Enterprise Suites */}
                                      {pkg.sqftPrice !== undefined && (
                                        <div className="pt-2">
                                          <label className="text-[10px] font-bold text-slate-600 flex items-center justify-between mb-1">
                                            <span>Surcharge Per Sq.ft / Mo</span>
                                            <span className="text-slate-400">Area-based</span>
                                          </label>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                            <input
                                              type="number"
                                              step="0.1"
                                              value={pkg.sqftPrice}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => pkg.setSqftPrice && pkg.setSqftPrice(Number(e.target.value))}
                                              className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* -------------------------------------------------------- */}
                                  {/* SIDE 2: GST OPTIONS & TAX ENGINE (RIGHT)                 */}
                                  {/* -------------------------------------------------------- */}
                                  <div className="p-5 md:col-span-6 bg-slate-50/70 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                                        <div className="flex items-center gap-1.5">
                                          <Receipt size={14} className="text-teal-600" />
                                          <span className="text-xs font-black text-slate-800">GST Options</span>
                                        </div>

                                        {/* Individual GST YES / NO Toggle Button */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateItemTax(pkg.key, { enabled: !tax.enabled });
                                          }}
                                          className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                            tax.enabled
                                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                          }`}
                                        >
                                          {tax.enabled ? (
                                            <>
                                              <CheckCircle2 size={13} />
                                              <span>GST: YES (Taxable)</span>
                                            </>
                                          ) : (
                                            <>
                                              <X size={13} />
                                              <span>GST: NO (Exempt)</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      {/* GST Rate & Mode Selectors (Visible when GST is Enabled) */}
                                      {tax.enabled ? (
                                        <div className="space-y-3">
                                          {/* GST Rate Preset Buttons */}
                                          <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Rate %</span>
                                              <span className="text-[10px] font-black text-teal-700">{tax.gstRatePct}% Applied</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1.5" onClick={(e) => e.stopPropagation()}>
                                              {[18, 12, 5, 0].map((rate) => (
                                                <button
                                                  key={rate}
                                                  type="button"
                                                  onClick={() => updateItemTax(pkg.key, { gstRatePct: rate })}
                                                  className={`py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                                    tax.gstRatePct === rate
                                                      ? "bg-[#0F8B7D] text-white shadow-xs"
                                                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                                                  }`}
                                                >
                                                  {rate}%
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* GST Calculation Mode Toggle */}
                                          <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tax Mode</span>
                                            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
                                              <button
                                                type="button"
                                                onClick={() => updateItemTax(pkg.key, { gstMode: "exclusive" })}
                                                className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${
                                                  tax.gstMode === "exclusive"
                                                    ? "bg-slate-900 text-white shadow-2xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                                }`}
                                              >
                                                + Exclusive (+GST)
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => updateItemTax(pkg.key, { gstMode: "inclusive" })}
                                                className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer text-center ${
                                                  tax.gstMode === "inclusive"
                                                    ? "bg-slate-900 text-white shadow-2xs"
                                                    : "text-slate-600 hover:text-slate-900"
                                                }`}
                                              >
                                                Inclusive (Taxes In)
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs space-y-1">
                                          <div className="flex items-center gap-1.5 font-black text-[11px]">
                                            <ShieldCheck size={14} className="text-amber-600" />
                                            <span>Tax Exempt / Zero-Rated</span>
                                          </div>
                                          <p className="text-[10px] text-amber-800 leading-normal">
                                            No GST is levied on this package. Invoices will be generated at 0% tax.
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Live Price Breakdown Tag for this Item */}
                                    <div className="pt-2 border-t border-slate-200/60">
                                      {math.enabled ? (
                                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                                            <span>Taxable Value:</span>
                                            <span className="font-semibold text-slate-700">₹{math.taxable.toLocaleString("en-IN")}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-teal-700 text-[11px]">
                                            <span>GST ({math.rate}% {math.mode}):</span>
                                            <span className="font-bold">+ ₹{math.gstAmount.toLocaleString("en-IN")}</span>
                                          </div>
                                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-black text-slate-900">
                                            <span>Total Customer Price:</span>
                                            <span className="text-teal-800 font-black">₹{math.grossTotal.toLocaleString("en-IN")}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-0.5 text-xs text-emerald-900">
                                          <div className="flex items-center justify-between font-black">
                                            <span>Net Payable (0% Tax):</span>
                                            <span className="text-emerald-950 font-black text-sm">₹{math.grossTotal.toLocaleString("en-IN")}</span>
                                          </div>
                                          <span className="text-[10px] text-emerald-700 block">Exempt from statutory GST</span>
                                        </div>
                                      )}
                                    </div>

                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* City Multipliers & Bulk Pricing (If viewing Marketplace or All) */}
                        {(pricingSubTab === "all" || pricingSubTab === "marketplace") && (
                          <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div>
                                <h3 className="text-sm font-black text-slate-900">Tier-1 &amp; Tier-2 City Rate Multipliers</h3>
                                <p className="text-xs text-slate-500">Marketplace minimum tariffs scale automatically based on regional commercial real estate benchmarks.</p>
                              </div>
                              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                                9 Cities Configured
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(pricingConfig.officeMarketplace?.cityMultipliers || {}).map(([cityName, data]: [string, any]) => (
                                <div key={cityName} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-900">{cityName}</span>
                                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                                      {data.multiplier}x Multiplier
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <label className="text-[10px] text-slate-400 block mb-0.5">Factor</label>
                                      <input
                                        type="number"
                                        step="0.05"
                                        value={data.multiplier}
                                        onChange={(e) => {
                                          const mult = Number(e.target.value);
                                          setPricingConfig({
                                            ...pricingConfig,
                                            officeMarketplace: {
                                              ...pricingConfig.officeMarketplace,
                                              cityMultipliers: {
                                                ...pricingConfig.officeMarketplace.cityMultipliers,
                                                [cityName]: { ...data, multiplier: mult }
                                              }
                                            }
                                          });
                                        }}
                                        className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-[10px] text-slate-400 block mb-0.5">Floor (₹)</label>
                                      <input
                                        type="number"
                                        step="500"
                                        value={data.minPrice}
                                        onChange={(e) => {
                                          const floor = Number(e.target.value);
                                          setPricingConfig({
                                            ...pricingConfig,
                                            officeMarketplace: {
                                              ...pricingConfig.officeMarketplace,
                                              cityMultipliers: {
                                                ...pricingConfig.officeMarketplace.cityMultipliers,
                                                [cityName]: { ...data, minPrice: floor }
                                              }
                                            }
                                          });
                                        }}
                                        className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* ============================================================== */}
                      {/* RIGHT COLUMN: STICKY COMMERCIAL INSPECTOR & INVOICE SIMULATOR   */}
                      {/* ============================================================== */}
                      <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-6">
                        
                        {/* 1. LIVE CUSTOMER TAX INVOICE SIMULATOR */}
                        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <Receipt size={16} className="text-teal-400" />
                              <h3 className="text-xs font-black uppercase tracking-wider text-teal-400">Live Customer Tax Invoice</h3>
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                              Active Preview
                            </span>
                          </div>

                          {/* Invoice Header */}
                          <div className="text-[11px] space-y-1 text-slate-400">
                            <div className="flex justify-between">
                              <span>Billed By:</span>
                              <strong className="text-slate-200">OfficeX Technologies Pvt Ltd</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Statutory SAC Code:</span>
                              <span className="font-mono text-teal-300">{globalSacCode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Selected Package:</span>
                              <strong className="text-white truncate max-w-[180px]">{activeSimulatedItem.title}</strong>
                            </div>
                          </div>

                          {/* Invoice Line Item Card */}
                          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200">{activeSimulatedItem.title}</span>
                              <span className="font-mono text-slate-300">₹{simulatedTax.taxable.toLocaleString("en-IN")}</span>
                            </div>

                            {/* Tax Breakdown Rows */}
                            {simulatedTax.enabled && simulatedTax.rate > 0 ? (
                              <div className="space-y-1 text-[11px] pt-2 border-t border-slate-700 text-slate-400">
                                <div className="flex justify-between">
                                  <span>CGST ({(simulatedTax.rate / 2)}%):</span>
                                  <span className="font-mono text-slate-300">+ ₹{(simulatedTax.gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>SGST ({(simulatedTax.rate / 2)}%):</span>
                                  <span className="font-mono text-slate-300">+ ₹{(simulatedTax.gstAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-teal-400 font-bold">
                                  <span>Total GST ({simulatedTax.rate}% {simulatedTax.mode}):</span>
                                  <span className="font-mono">+ ₹{simulatedTax.gstAmount.toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-slate-700 text-[10px] text-amber-400 flex items-center gap-1">
                                <ShieldCheck size={12} />
                                <span>Zero-Rated / Exempt from GST</span>
                              </div>
                            )}

                            {/* Grand Total Row */}
                            <div className="pt-2.5 border-t border-slate-600 flex items-center justify-between text-sm font-black">
                              <span className="text-white">Net Total Payable:</span>
                              <span className="text-lg font-black text-teal-300 font-mono">
                                ₹{simulatedTax.grossTotal.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 text-center">
                            Calculations are simulated in real-time according to statutory CGST/SGST rules.
                          </p>
                        </div>

                        {/* 2. STATUTORY DEFAULTS & GLOBAL SAC CONTROLLER */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Tag size={15} className="text-teal-600" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Statutory Tax Defaults</h3>
                          </div>

                          {/* SAC Code Input */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                              <span>Master SAC / HSN Code</span>
                              <span className="text-[10px] font-normal text-slate-500">Real Estate / IT</span>
                            </label>
                            <input
                              type="text"
                              value={pricingConfig.taxConfig?.sacCode || "997212"}
                              onChange={(e) => setPricingConfig({
                                ...pricingConfig,
                                taxConfig: { ...pricingConfig.taxConfig, sacCode: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>

                          {/* Global Default Rate */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700">Default GST Rate (%)</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[18, 12, 5].map((rate) => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => setPricingConfig({
                                    ...pricingConfig,
                                    taxConfig: { ...pricingConfig.taxConfig, gstRatePct: rate }
                                  })}
                                  className={`py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                                    (Number(pricingConfig.taxConfig?.gstRatePct) || 18) === rate
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  {rate}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. BATCH QUICK ACTIONS */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Quick Batch Tax Actions
                          </span>
                          
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => applyBulkTax({ enabled: true, rate: 18, mode: "exclusive" })}
                              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-xs font-bold text-slate-800 transition flex items-center justify-between shadow-2xs cursor-pointer"
                            >
                              <span>⚡ Set All Packages to 18% Exclusive</span>
                              <ChevronRight size={14} className="text-slate-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => applyBulkTax({ enabled: false, rate: 0 })}
                              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-amber-500 text-xs font-bold text-slate-800 transition flex items-center justify-between shadow-2xs cursor-pointer"
                            >
                              <span>⚪ Set All Packages to Zero GST (Exempt)</span>
                              <ChevronRight size={14} className="text-slate-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => applyBulkTax({ mode: "inclusive" })}
                              className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold text-slate-800 transition flex items-center justify-between shadow-2xs cursor-pointer"
                            >
                              <span>🔄 Switch All to Inclusive (Tax Included)</span>
                              <ChevronRight size={14} className="text-slate-400" />
                            </button>
                          </div>
                        </div>

                        {/* 4. PERSISTENCE SAVE BUTTON */}
                        <div className="pt-2">
                          <button
                            disabled={pricingSaving || !pricingConfig}
                            onClick={handleSavePricing}
                            className="w-full py-3.5 rounded-2xl bg-[#0F8B7D] hover:bg-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-60"
                          >
                            <Save size={16} />
                            <span>{pricingSaving ? "Persisting Changes..." : "Save All Tariffs & GST Options"}</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: OFFICE MARKETPLACE MANAGER & MODERATION
          ========================================================================= */}
      {activeTab === "marketplace" && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Office Marketplace Listings Manager</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  Strict Admin Moderation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit new partner submissions, verify property media, request legal documents / Fire NOC, or approve spaces live to the marketplace.
              </p>
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
                title="Refresh listings"
              >
                <RefreshCw size={14} className={mpLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Status Filter Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => { setMpStatus("all"); setMpPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mpStatus === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All Spaces</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${mpStatus === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                {mpCounts.total || mpListings.length}
              </span>
            </button>

            <button
              onClick={() => { setMpStatus("pending_review"); setMpPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mpStatus === "pending_review" ? "bg-amber-500 text-white shadow-xs" : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Clock size={13} />
              <span>Pending Review / Audits</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${mpStatus === "pending_review" ? "bg-white/20 text-white" : "bg-amber-200 text-amber-900"}`}>
                {mpCounts.pendingCount}
              </span>
            </button>

            <button
              onClick={() => { setMpStatus("changes_requested"); setMpPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mpStatus === "changes_requested" ? "bg-rose-600 text-white shadow-xs" : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <AlertTriangle size={13} />
              <span>Changes Requested / Reverted</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${mpStatus === "changes_requested" ? "bg-white/20 text-white" : "bg-rose-200 text-rose-900"}`}>
                {mpCounts.changesRequestedCount}
              </span>
            </button>

            <button
              onClick={() => { setMpStatus("active"); setMpPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mpStatus === "active" ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Active on Live Marketplace</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${mpStatus === "active" ? "bg-white/20 text-white" : "bg-emerald-200 text-emerald-900"}`}>
                {mpCounts.activeCount}
              </span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Space Name &amp; Batch</th>
                  <th className="p-3">Brand / Operator</th>
                  <th className="p-3">City &amp; Area</th>
                  <th className="p-3">Starting Price</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
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
                  mpListings.map((l) => {
                    const mod = l.pricingPlans?.moderation;
                    const batchVer = mod?.batchVersion || 1;
                    const isPending = l.status === "pending_review" || l.status === "pending";
                    const isResubmitted = l.status === "resubmitted";
                    const isChangesReq = l.status === "changes_requested";

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{l.name}</span>
                            {batchVer > 1 && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-black uppercase">
                                Batch v{batchVer}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {l.vertical ? l.vertical.replace("_", " ").toUpperCase() : "COWORKING"} · {l.totalSeats ? `${l.totalSeats} seats` : "Flexible"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{l.brandName || "Independent"}</td>
                        <td className="p-3 text-slate-500">{l.locality || l.city}, {l.city}</td>
                        <td className="p-3 font-bold text-slate-900">₹{Number(l.startingPrice || 8500).toLocaleString("en-IN")}/mo</td>
                        <td className="p-3">
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                              <Clock size={10} /> Pending Audit
                            </span>
                          )}
                          {isResubmitted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
                              <RefreshCw size={10} className="animate-spin" /> Resubmitted (Batch v{batchVer})
                            </span>
                          )}
                          {isChangesReq && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                              <AlertTriangle size={10} /> Revert Sent
                            </span>
                          )}
                          {!isPending && !isResubmitted && !isChangesReq && (
                            <button
                              onClick={() => handleToggleListingStatus(l.id, l.status)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                                l.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {l.status}
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setModeratingListing(l);
                              setRevertMode(false);
                              setModAdminRemarks(l.pricingPlans?.moderation?.adminRemarks || "");
                              setModRequestedDocs(l.pricingPlans?.moderation?.requestedDocs || []);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1 ${
                              isPending || isResubmitted || isChangesReq
                                ? "bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            <ShieldCheck size={12} />
                            <span>{isPending || isResubmitted ? "Audit & Moderate" : isChangesReq ? "View Revert" : "Audit"}</span>
                          </button>

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
                    );
                  })
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

          {/* Module & Master Package Selector Bar (Point 6 & 9) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Module Scope:</span>
              <select
                value={selectedSaasModule}
                onChange={(e) => {
                  const newMod = e.target.value as any;
                  setSelectedSaasModule(newMod);
                  setSaasSubTab("overview");
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="package">📦 Master Enterprise Institutional Package (All SaaS Suites Included)</option>
                <option value="rent_roll">🏢 Standalone Rent Roll &amp; Lease-to-Cash SaaS</option>
                <option value="cafm">⚡ 52-Week CAFM &amp; Asset Maintenance SaaS</option>
                <option value="visitor">🛡️ Visitor Kiosks &amp; Lobby Security Compliance SaaS</option>
                <option value="compliance">📜 Statutory Compliance &amp; Audit Vault SaaS</option>
                <option value="crm">📊 Commercial Lease CRM &amp; Stacking SaaS</option>
                <option value="marketplace">🌐 Commercial Space &amp; Coworking Marketplace SaaS</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Entitlement Classification:</span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-[11px]">
                {selectedSaasModule === "package"
                  ? "Full Sovereign Package · Multi-Module Suite"
                  : "Individual Standalone SaaS Module"}
              </span>
            </div>
          </div>

          {/* SaaS Sub-Tab Navigation Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-bold scrollbar-none">
            {(() => {
              let moduleTabs: Array<{ id: any; label: string; icon: any }> = [];
              if (selectedSaasModule === "rent_roll") {
                moduleTabs = [
                  { id: "overview", label: "Rent Roll Overview", icon: Layers },
                  { id: "properties", label: "Properties & Floor Demarcation", icon: Building2 },
                  { id: "pending_deletions", label: "Deletion & Security Approvals", icon: AlertTriangle },
                  { id: "contracts", label: "Active Lease Contracts", icon: FileText },
                  { id: "tenants", label: "Tenant Directory & KYC", icon: Users },
                  { id: "delegations", label: "Property Delegations", icon: Briefcase },
                  { id: "invoices", label: "Rent Invoices & Billing", icon: DollarSign },
                ];
              } else if (selectedSaasModule === "cafm") {
                moduleTabs = [
                  { id: "overview", label: "CAFM Operations Overview", icon: Layers },
                  { id: "cafm_ppm", label: "52-Week PPM Schedule", icon: Calendar },
                  { id: "cafm_assets", label: "Equipment Passports & QR", icon: QrCode },
                  { id: "cafm_breakdowns", label: "Breakdown Tickets & MTTR", icon: Wrench },
                  { id: "cafm_amc", label: "Vendor AMC & SLA Contracts", icon: ShieldCheck },
                ];
              } else if (selectedSaasModule === "visitor") {
                moduleTabs = [
                  { id: "overview", label: "Visitor Security Overview", icon: Layers },
                  { id: "visitor_logs", label: "Passes & Visitor Logs", icon: Users },
                  { id: "turnstiles", label: "Lobby Turnstiles & Relays", icon: Zap },
                  { id: "guard_console", label: "Security Guard Gate Console", icon: Laptop },
                  { id: "evacuation", label: "Emergency Evacuation Roster", icon: AlertTriangle },
                ];
              } else if (selectedSaasModule === "compliance") {
                moduleTabs = [
                  { id: "overview", label: "Compliance Health Overview", icon: Layers },
                  { id: "compliance_licenses", label: "48 Commercial Licenses & NOCs", icon: FileCheck2 },
                  { id: "compliance_renewals", label: "Expiry Alerts & Renewals", icon: Clock },
                  { id: "compliance_vault", label: "Auditor Certificate Vault", icon: ShieldCheck },
                ];
              } else if (selectedSaasModule === "crm") {
                moduleTabs = [
                  { id: "overview", label: "Lease CRM Overview", icon: Layers },
                  { id: "crm_stacking", label: "Spatial Stacking Plan & Vacancy", icon: Layers },
                  { id: "crm_helpdesk", label: "Tenant QR Helpdesk", icon: MessageSquare },
                  { id: "crm_amenities", label: "Amenity & Room Bookings", icon: Calendar },
                ];
              } else {
                moduleTabs = [
                  { id: "overview", label: "Master Suite & Packages", icon: Layers },
                  { id: "properties", label: "Properties & Verification", icon: Building2 },
                  { id: "pending_deletions", label: "Deletion & Security Approvals", icon: AlertTriangle },
                  { id: "contracts", label: "Active Lease Contracts", icon: FileText },
                  { id: "tenants", label: "Tenant Directory & KYC", icon: Users },
                  { id: "delegations", label: "Property Delegations", icon: Briefcase },
                  { id: "invoices", label: "Invoices & Billing Audit", icon: DollarSign },
                  { id: "orgs", label: "Organizations & Quotas", icon: ShieldCheck },
                ];
              }

              return moduleTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = saasSubTab === tab.id;
                const pendingCount = tab.id === "pending_deletions" ? saasProperties.filter((p) => p.pendingDeletion).length : 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSaasSubTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#0F8B7D] text-white shadow-2xs font-extrabold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                    {pendingCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              });
            })()}
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

          {/* 0. ALL SAAS OVERVIEW & OPERATE PACKAGES */}
          {saasSubTab === "overview" && (
            <div className="space-y-6">
              {/* Executive Packages Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Operate SaaS Suite Packages</h3>
                    <p className="text-xs text-slate-500">Commercial real estate management modules active across the ecosystem.</p>
                  </div>
                  <Link
                    href="/operate/pricing"
                    target="_blank"
                    className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
                  >
                    View Public Pricing Matrix ↗
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Package 1: Rent Roll & Lease-to-Cash */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Rent Roll &amp; Lease-to-Cash</h4>
                          <span className="text-[10px] text-slate-400">Core Billing Suite</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• 39-Point canonical lease contract master</li>
                      <li>• Automated 5% step escalations &amp; alerts</li>
                      <li>• CAM common area expense pooling &amp; sub-meters</li>
                      <li>• 18% GST (SAC 997212) &amp; Section 194I TDS ledgers</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-700">₹1/sq.ft · ₹9,999/mo min</span>
                      <button
                        onClick={() => setSaasSubTab("contracts")}
                        className="text-[11px] font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                      >
                        Inspect Leases ({saasContracts.length}) →
                      </button>
                    </div>
                  </div>

                  {/* Package 2: 52-Week Maintenance CAFM */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Zap size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">52-Week CAFM &amp; PPM</h4>
                          <span className="text-[10px] text-slate-400">Facility Operations</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• 52-Week annual preventative maintenance calendar</li>
                      <li>• QR passports for DG sets, chillers &amp; STP</li>
                      <li>• Mean-Time-To-Repair (MTTR) work order tracking</li>
                      <li>• Direct FM contractor dispatch</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-700">₹6,999/mo base</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSaasModule("cafm");
                          setSaasSubTab("overview");
                        }}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Inspect CAFM Suite →
                      </button>
                    </div>
                  </div>

                  {/* Package 3: Visitor Flow & Lobby Turnstiles */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Users size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Visitor Flow &amp; Turnstiles</h4>
                          <span className="text-[10px] text-slate-400">Lobby &amp; Speed-Gates</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• Pre-invite WhatsApp barcode visitor passes</li>
                      <li>• 18-Second lobby turnstile transit</li>
                      <li>• Real-time overstay &amp; emergency evacuation list</li>
                      <li>• Dual-mode security guard terminal</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-700">₹4,999/mo base</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSaasModule("visitor");
                          setSaasSubTab("overview");
                        }}
                        className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                      >
                        Inspect Visitor Flow →
                      </button>
                    </div>
                  </div>

                  {/* Package 4: Statutory Compliance & Audit Vault */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Compliance &amp; Audit Vault</h4>
                          <span className="text-[10px] text-slate-400">Statutory Governance</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• 48 Pre-configured Indian commercial licenses</li>
                      <li>• 90, 60 &amp; 30-day automated alert escalations</li>
                      <li>• Tamper-proof certificate &amp; NOC vault</li>
                      <li>• Multi-entity REIT disclosure exports</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-700">Built-in Suite</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSaasModule("compliance");
                          setSaasSubTab("overview");
                        }}
                        className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                      >
                        Inspect Compliance →
                      </button>
                    </div>
                  </div>

                  {/* Package 5: Commercial Lease CRM & Stacking Plan */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          <Layers size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Leasing CRM &amp; Stacking</h4>
                          <span className="text-[10px] text-slate-400">Spatial Demising</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      <li>• Interactive multi-floor spatial stacking plans</li>
                      <li>• Instant LOI term sheet generation</li>
                      <li>• Vacancy absorption forecasting</li>
                      <li>• Demarcated units &amp; floorplates</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-700">Included in Growth</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSaasModule("crm");
                          setSaasSubTab("overview");
                        }}
                        className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        Inspect Lease CRM →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Client Organizations & Subscribed Quotas */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Client Organizations &amp; Subscribed Quotas</h3>
                    <p className="text-xs text-slate-500">Live landlord accounts and their licensed square footage capacity.</p>
                  </div>
                  <button
                    onClick={() => setSaasSubTab("orgs")}
                    className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer"
                  >
                    View All Entities ({orgsList.length}) →
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Organization Name</th>
                        <th className="p-3">PAN &amp; GSTIN</th>
                        <th className="p-3">Address / City</th>
                        <th className="p-3">Currency</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orgsList.length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-400">No organizations registered yet.</td></tr>
                      ) : (
                        orgsList.slice(0, 5).map((org) => (
                          <tr key={org.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3 font-bold text-slate-900">{org.name}</td>
                            <td className="p-3 font-mono text-[11px]">{org.pan || "—"} / {org.gstin || "—"}</td>
                            <td className="p-3 text-slate-600">{org.city || org.address || "—"}</td>
                            <td className="p-3 font-mono">{org.currency || "INR"}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                {org.subscription_status || "Active"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSaasSubTab("properties")}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-bold cursor-pointer"
                              >
                                View Buildings
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PENDING DELETIONS & SECURITY APPROVALS (Point 7) */}
          {saasSubTab === "pending_deletions" && (() => {
            const pendingList = saasProperties.filter((p) => p.pendingDeletion);
            const allSelected = pendingList.length > 0 && pendingList.every((p) => selectedPendingDeletionIds.includes(p.id));

            const toggleSelectAll = () => {
              if (allSelected) {
                setSelectedPendingDeletionIds([]);
              } else {
                setSelectedPendingDeletionIds(pendingList.map((p) => p.id));
              }
            };

            const toggleSelectItem = (id: string) => {
              if (selectedPendingDeletionIds.includes(id)) {
                setSelectedPendingDeletionIds(selectedPendingDeletionIds.filter((item) => item !== id));
              } else {
                setSelectedPendingDeletionIds([...selectedPendingDeletionIds, id]);
              }
            };

            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Commercial Property Deletion Governance</h3>
                    <p className="text-xs text-slate-500">
                      Institutional safety protocol: Commercial properties cannot be deleted without Super Admin verification and explicit approval.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      {pendingList.length} Pending Review
                    </span>

                    {pendingList.length > 0 && (
                      <>
                        <button
                          type="button"
                          disabled={bulkGovernanceLoading}
                          onClick={handleRejectAllDeletions}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                          title="Reject all pending deletion requests and restore properties to active"
                        >
                          <RotateCcw size={13} />
                          <span>Reject All</span>
                        </button>
                        <button
                          type="button"
                          disabled={bulkGovernanceLoading}
                          onClick={handleApproveAllDeletions}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                          title="Approve permanent deletion for all pending properties"
                        >
                          <Trash2 size={13} />
                          <span>Approve All</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bulk Selection Bar */}
                {selectedPendingDeletionIds.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                        {selectedPendingDeletionIds.length}
                      </span>
                      <span>{selectedPendingDeletionIds.length} property(ies) selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPendingDeletionIds([])}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-amber-100/60 font-semibold transition cursor-pointer"
                      >
                        Clear Selection
                      </button>
                      <button
                        type="button"
                        disabled={bulkGovernanceLoading}
                        onClick={handleRejectSelectedDeletions}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw size={12} />
                        <span>Reject Selected ({selectedPendingDeletionIds.length})</span>
                      </button>
                      <button
                        type="button"
                        disabled={bulkGovernanceLoading}
                        onClick={handleApproveSelectedDeletions}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        <span>Approve Selected ({selectedPendingDeletionIds.length})</span>
                      </button>
                    </div>
                  </div>
                )}

                {pendingList.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800">Zero Pending Deletion Requests</h4>
                    <p className="text-xs text-slate-500 mt-1">All commercial properties across portfolios are verified and secure.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 rounded text-teal-600 accent-teal-600 border-slate-300 cursor-pointer focus:ring-0"
                              title="Select / Deselect all pending properties"
                            />
                          </th>
                          <th className="p-3">Property Name &amp; Code</th>
                          <th className="p-3">Managed Area</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Requested By</th>
                          <th className="p-3">Requested At</th>
                          <th className="p-3 text-right">Governance Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingList.map((p) => {
                          const isSelected = selectedPendingDeletionIds.includes(p.id);
                          return (
                            <tr key={p.id} className={`transition ${isSelected ? "bg-amber-50/60" : "hover:bg-slate-50/60"}`}>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(p.id)}
                                  className="w-4 h-4 rounded text-teal-600 accent-teal-600 border-slate-300 cursor-pointer focus:ring-0"
                                />
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{p.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">{p.code}</div>
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-800">
                                {Number(p.totalAreaSqft || 0).toLocaleString("en-IN")} sq.ft
                              </td>
                              <td className="p-3 text-slate-600">
                                {p.city}, {p.state}
                              </td>
                              <td className="p-3 font-medium text-slate-700">
                                {p.deletionRequestedBy || "User Landlord"}
                              </td>
                              <td className="p-3 text-slate-500">
                                {p.deletionRequestedAt ? new Date(p.deletionRequestedAt).toLocaleString("en-IN") : "Recent"}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={bulkGovernanceLoading || deletionProcessingState.active}
                                    onClick={() => handleRejectPropertyDeletion(p.id)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Reject Request
                                  </button>
                                  <button
                                    type="button"
                                    disabled={bulkGovernanceLoading || deletionProcessingState.active}
                                    onClick={() => handleApprovePropertyDeletion(p.id)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Trash2 size={12} />
                                    <span>Approve Permanent Deletion</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

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

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 7. STANDALONE CAFM & 52-WEEK PPM SUB-TABS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {saasSubTab === "cafm_ppm" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={16} />
                    <span>52-Week Preventative Maintenance (PPM) Annual Matrix</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Statutory scheduled maintenance across DG Sets, Chillers, STP, Lifts, and Transformers to prevent downtime.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                    52 Active Service Weeks
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Asset &amp; System</th>
                      <th className="p-3">Schedule Week</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3">Checklist &amp; Task Scope</th>
                      <th className="p-3">Assigned Vendor</th>
                      <th className="p-3">Execution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { asset: "Cummins 750kVA DG Set 01", week: "Week 46 (Current)", freq: "Monthly", scope: "Lubricant change, B-Check, battery load test, fuel filter swap", vendor: "Sterling Generators Pvt Ltd", status: "In Progress" },
                      { asset: "York 250 TR Centrifugal Chiller A", week: "Week 47", freq: "Fortnightly", scope: "Condenser descaling, refrigerant pressure audit, oil analysis", vendor: "Johnson Controls India", status: "Scheduled" },
                      { asset: "100 KLD MBBR Sewage Treatment Plant", week: "Week 48", freq: "Weekly", scope: "Blower belt tension, dosing pump calibration, MLSS testing", vendor: "Thermax Onsite Services", status: "Scheduled" },
                      { asset: "Otis High-Speed Passenger Elevators (8 Units)", week: "Week 49", freq: "Monthly", scope: "Governor trip test, wire rope lubrication, brake liner check", vendor: "Otis Elevator Company", status: "Scheduled" },
                      { asset: "1500 kVA Dry Type Transformer 01", week: "Week 50", freq: "Quarterly", scope: "BDV oil breakdown test, winding temp calibration, earthing pit test", vendor: "ABB Power Grids", status: "Scheduled" },
                      { asset: "Wet Riser & Fire Sprinkler Jockey Pumps", week: "Week 51", freq: "Bi-Weekly", scope: "Auto cut-in pressure check, gland packing, diesel engine test", vendor: "Minimax Fire Protection", status: "Scheduled" },
                    ].map((ppm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900">{ppm.asset}</td>
                        <td className="p-3 font-mono text-[11px] font-bold text-slate-700">{ppm.week}</td>
                        <td className="p-3 font-medium text-slate-600">{ppm.freq}</td>
                        <td className="p-3 text-slate-600 max-w-xs">{ppm.scope}</td>
                        <td className="p-3 font-medium text-slate-800">{ppm.vendor}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ppm.status === "In Progress" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}>
                            {ppm.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "cafm_assets" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="text-blue-600" size={16} />
                    <span>Equipment Asset Passports &amp; Dynamic QR Registry</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Scan-to-inspect QR tags placed on critical machinery for instant maintenance histories and breakdown tickets.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    ✓ 248 Machinery QR Passports Active
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Equipment Tag &amp; Model</th>
                      <th className="p-3">Asset Category</th>
                      <th className="p-3">Floor / Location</th>
                      <th className="p-3">Capacity &amp; Rating</th>
                      <th className="p-3">Assigned AMC Vendor</th>
                      <th className="p-3">QR Passport Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { tag: "EQ-DG-01", name: "Cummins QSK23-G3 Diesel Generator", cat: "Power Backup", loc: "Basement 2, Sub-Station Room", cap: "750 kVA", vendor: "Sterling Generators Pvt Ltd" },
                      { tag: "EQ-HVAC-01", name: "York YMC2 Magnetic Bearing Chiller", cat: "HVAC Plant", loc: "Basement 1, Chiller Yard", cap: "250 TR", vendor: "Johnson Controls India" },
                      { tag: "EQ-STP-01", name: "Thermax Fluidized MBBR Bioreactor", cat: "Water Treatment", loc: "Basement 2, Utility Area", cap: "100 KLD", vendor: "Thermax Onsite Services" },
                      { tag: "EQ-LIFT-01", name: "Otis SkyRise High-Speed Elevator", cat: "Vertical Transport", loc: "Core Tower A, Shaft 1-4", cap: "20 Passenger / 2.5 m/s", vendor: "Otis Elevator Company" },
                      { tag: "EQ-TX-01", name: "ABB Cast Resin Dry Type Transformer", cat: "Electrical HT", loc: "Basement 1, HT Substation", cap: "1500 kVA", vendor: "ABB Power Grids" },
                    ].map((asset, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{asset.name}</div>
                          <span className="font-mono text-xs text-blue-700 font-bold">{asset.tag}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-600">{asset.cat}</td>
                        <td className="p-3 text-slate-600">{asset.loc}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{asset.cap}</td>
                        <td className="p-3 font-medium text-slate-700">{asset.vendor}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
                            <QrCode size={12} className="text-teal-700" />
                            <span>QR Verified</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "cafm_breakdowns" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="text-rose-600" size={16} />
                    <span>Mean-Time-To-Repair (MTTR) Breakdown Work Orders</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live breakdown response telemetry. Escalates automatically when work order exceeds contracted SLA resolution time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Avg MTTR: 38 Minutes
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Equipment Affected</th>
                      <th className="p-3">Issue Reported</th>
                      <th className="p-3">Severity &amp; SLA</th>
                      <th className="p-3">Assigned Technician</th>
                      <th className="p-3">Resolution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: "WO-2026-114", asset: "AHU-Level 4-North", issue: "Blower belt slipped off pulley, reduced airflow", prio: "P2 - High (2h SLA)", tech: "Ramesh Sharma (HVAC)", status: "RESOLVED" },
                      { id: "WO-2026-115", asset: "Elevator Car B3", issue: "Door sensor alignment trip on Floor 7", prio: "P1 - Critical (30m SLA)", tech: "Otis Onsite Resident", status: "RESOLVED" },
                      { id: "WO-2026-116", asset: "Basement Dewatering Sump Pump 2", issue: "Float switch stuck in low position", prio: "P2 - High (2h SLA)", tech: "Mahesh Patel (Plumbing)", status: "RESOLVED" },
                    ].map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">{wo.id}</td>
                        <td className="p-3 font-bold text-slate-800">{wo.asset}</td>
                        <td className="p-3 text-slate-600">{wo.issue}</td>
                        <td className="p-3 font-mono text-[11px] font-bold text-slate-700">{wo.prio}</td>
                        <td className="p-3 text-slate-800 font-medium">{wo.tech}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {wo.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "cafm_amc" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-purple-600" size={16} />
                    <span>Vendor Annual Maintenance Contracts (AMC) &amp; SLA Penalties</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Institutional contractor oversight, annual values, penalty clauses, and scheduled renewal triggers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold">
                    6 Active Vendor AMCs
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Contractor / Vendor</th>
                      <th className="p-3">Service Scope</th>
                      <th className="p-3">Contract Validity</th>
                      <th className="p-3">Annual Contract Value</th>
                      <th className="p-3">SLA Compliance</th>
                      <th className="p-3">Contract Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { vendor: "Johnson Controls India Pvt Ltd", scope: "Central Chiller Plant & BMS Automation", period: "01 Apr 2026 – 31 Mar 2027", acv: "₹14,50,000", sla: "99.4%", status: "ACTIVE" },
                      { vendor: "Otis Elevator Company (India) Ltd", scope: "Comprehensive Elevator & Escalator AMC", period: "01 Jul 2026 – 30 Jun 2027", acv: "₹18,20,000", sla: "99.8%", status: "ACTIVE" },
                      { vendor: "Sterling Generators Pvt Ltd", scope: "DG Sets Comprehensive Parts & Labor", period: "01 Jan 2026 – 31 Dec 2026", acv: "₹6,80,000", sla: "98.9%", status: "ACTIVE" },
                      { vendor: "Minimax Fire Safety Systems", scope: "Hydrant, Sprinklers & Gas Flooding AMC", period: "01 May 2026 – 30 Apr 2027", acv: "₹5,40,000", sla: "100.0%", status: "ACTIVE" },
                    ].map((amc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900">{amc.vendor}</td>
                        <td className="p-3 text-slate-600 font-medium">{amc.scope}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">{amc.period}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{amc.acv}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{amc.sla}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {amc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 8. VISITOR FLOW & GATE SECURITY SUB-TABS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {saasSubTab === "visitor_logs" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-purple-600" size={16} />
                    <span>Real-Time Visitor Passes &amp; Lobby Transit Telemetry</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pre-invited WhatsApp barcode passes, facial transit logs, and host tenant verification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                    Today: 142 Visitors Checked-In
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Visitor Name &amp; Company</th>
                      <th className="p-3">Host Tenant &amp; Floor</th>
                      <th className="p-3">Pass Delivery &amp; Mode</th>
                      <th className="p-3">Transit Gate</th>
                      <th className="p-3">Entry Timestamp</th>
                      <th className="p-3">Transit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: "Rohit Deshmukh", comp: "Tata Consultancy Services", host: "Deloitte Digital (Floor 8)", pass: "WhatsApp QR Pass", gate: "Turnstile Bank A - Lane 2", time: "10:14 AM Today", status: "INSIDE PREMISES" },
                      { name: "Pooja Singhania", comp: "Amazon Web Services", host: "KPMG Global (Floor 12)", pass: "Pre-Invite Barcode", gate: "Turnstile Bank B - Lane 1", time: "10:32 AM Today", status: "INSIDE PREMISES" },
                      { name: "Vikram Sethi", comp: "Cisco Systems India", host: "Goldman Sachs (Floor 15)", pass: "Self-Checkin Kiosk", gate: "Main Revolving Door 1", time: "11:05 AM Today", status: "INSIDE PREMISES" },
                    ].map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{v.name}</div>
                          <span className="text-slate-400 text-[10px]">{v.comp}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{v.host}</td>
                        <td className="p-3 font-mono text-[11px] text-teal-700 font-bold">{v.pass}</td>
                        <td className="p-3 text-slate-600 font-mono">{v.gate}</td>
                        <td className="p-3 font-mono text-slate-700">{v.time}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "turnstiles" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-purple-50/70 border border-purple-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="text-purple-600" size={16} />
                    <span>Lobby Speedgates &amp; Hardware Controller Relays</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Boon Edam &amp; Gunnebo optical turnstile IP controller integration with instant emergency break-glass relay.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    8 / 8 Gates Online · 18s Avg Transit
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Turnstile Bank A - Lane 1", ip: "192.168.10.41", vendor: "Gunnebo SpeedStile FL", ping: "2ms" },
                  { name: "Turnstile Bank A - Lane 2", ip: "192.168.10.42", vendor: "Gunnebo SpeedStile FL", ping: "3ms" },
                  { name: "Turnstile Bank B - Lane 1", ip: "192.168.10.43", vendor: "Boon Edam Speedlane", ping: "2ms" },
                  { name: "Turnstile Bank B - Lane 2", ip: "192.168.10.44", vendor: "Boon Edam Speedlane", ping: "4ms" },
                ].map((g, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{g.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-[11px] text-slate-500">{g.vendor}</div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-600">
                      <span>IP: {g.ip}</span>
                      <span className="text-emerald-700 font-bold">{g.ping}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {saasSubTab === "guard_console" && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Laptop size={18} className="text-teal-400" />
                    <span className="font-bold text-sm">Security Guard Touchscreen Terminal Simulation</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                    Terminal ID: SEC-LOBBY-01
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <QrCode size={32} className="mx-auto text-teal-400" />
                    <h5 className="font-bold text-xs">Scan WhatsApp Pass</h5>
                    <p className="text-[10px] text-slate-400">Aim 2D barcode scanner at visitor mobile device</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <Users size={32} className="mx-auto text-blue-400" />
                    <h5 className="font-bold text-xs">Manual Walk-In Entry</h5>
                    <p className="text-[10px] text-slate-400">Capture OTP, government ID proof, and webcam photograph</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <AlertTriangle size={32} className="mx-auto text-amber-400" />
                    <h5 className="font-bold text-xs">Overstay Verification</h5>
                    <p className="text-[10px] text-slate-400">Audit visitors on premises exceeding 8 hours</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {saasSubTab === "evacuation" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="text-rose-600" size={16} />
                    <span>Real-Time Life-Safety Emergency Evacuation Roster</span>
                  </h4>
                  <p className="text-xs text-rose-700">
                    Calculated headcounts of all tenants, visitors, and contractors currently past turnstile perimeter.
                  </p>
                </div>
                <button
                  onClick={() => alert("🚨 Emergency Evacuation Drill Alert Broadcast Triggered to all building occupants via WhatsApp and SMS.")}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Broadcast Emergency WhatsApp Drill
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase">Corporate Occupants</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">1,842</div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">Badge-in verified</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase">Guests &amp; Visitors</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">142</div>
                  <p className="text-[11px] text-purple-700 font-semibold mt-1">QR Pass active</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase">Facility Contractors</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">38</div>
                  <p className="text-[11px] text-blue-700 font-semibold mt-1">Vendor badges active</p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 9. STATUTORY COMPLIANCE & AUDIT VAULT SUB-TABS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {saasSubTab === "compliance_licenses" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="text-amber-700" size={16} />
                    <span>48 Pre-Configured Indian Commercial Statutory Licenses Matrix</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pre-seeded regulatory requirements for commercial business parks and high-rise commercial towers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                    ✓ 48 / 48 Statutory Licenses Monitored
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Statutory License &amp; Title</th>
                      <th className="p-3">Issuing Government Authority</th>
                      <th className="p-3">Current Validity</th>
                      <th className="p-3">Renewal Period</th>
                      <th className="p-3">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { title: "NOC for Fire Safety & Protection", auth: "State Directorate of Fire Services", valid: "Valid until 31 Dec 2026", renew: "Annual", status: "VALID & COMPLIANT" },
                      { title: "Consent to Operate (CTO - Air & Water)", auth: "State Pollution Control Board (SPCB)", valid: "Valid until 31 Mar 2028", renew: "5-Year", status: "VALID & COMPLIANT" },
                      { title: "Passenger Lift Inspectorate Licenses", auth: "Chief Electrical Inspectorate to Govt", valid: "Valid until 30 Sep 2027", renew: "Annual", status: "VALID & COMPLIANT" },
                      { title: "Diesel Storage & HSD Petroleum Class B License", auth: "Petroleum & Explosives Safety Org (PESO)", valid: "Valid until 31 Dec 2027", renew: "3-Year", status: "VALID & COMPLIANT" },
                      { title: "Building Occupancy Certificate (OC)", auth: "Urban Development Authority / Municipal Corp", valid: "Perpetual Commercial OC", renew: "Perpetual", status: "COMPLIANT" },
                    ].map((lic, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-bold text-slate-900">{lic.title}</td>
                        <td className="p-3 text-slate-600 font-medium">{lic.auth}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-700 font-bold">{lic.valid}</td>
                        <td className="p-3 font-mono text-slate-600">{lic.renew}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {lic.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "compliance_renewals" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="text-amber-700" size={16} />
                    <span>90, 60 &amp; 30-Day Automated Alert Escalation Engine</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Automated email and portal escalations sent to Chief Compliance Officer and Asset Managers before deadlines.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">90-Day Early Warning</span>
                  <div className="text-lg font-black text-slate-900">3 Licenses in Horizon</div>
                  <p className="text-[11px] text-slate-500">Initiate agency quote requests</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-700">60-Day Active Renewal</span>
                  <div className="text-lg font-black text-amber-900">1 License Under Renewal</div>
                  <p className="text-[11px] text-amber-700">Application submitted to Fire Dept</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Critical 30-Day Floor</span>
                  <div className="text-lg font-black text-emerald-900">0 Overdue Licenses</div>
                  <p className="text-[11px] text-emerald-700">Zero penalty exposure</p>
                </div>
              </div>
            </div>
          )}

          {saasSubTab === "compliance_vault" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-amber-700" size={16} />
                    <span>Tamper-Proof Auditor Certificate Vault &amp; REIT Compliance Disclosures</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Immutable certificate repository with SHA-256 integrity verification for institutional audits.
                  </p>
                </div>
                <button
                  onClick={() => alert("✓ REIT Compliance Disclosure Pack generated. Audit ledger downloaded.")}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Generate REIT Audit Pack (ZIP)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-900 block">Cryptographic Integrity Stamp:</span>
                <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 select-all">
                  SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 · Last Verified by Big-4 Auditor: 14 Nov 2026
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 10. LEASING CRM & SPATIAL STACKING SUB-TABS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {saasSubTab === "crm_stacking" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-teal-50/70 border border-teal-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="text-teal-700" size={16} />
                    <span>Multi-Floor Spatial Stacking Plan &amp; Vacancy Heatmap</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Floor-by-floor occupancy visualizations, leasable demised blocks, and tenant lease roll horizons.
                  </p>
                </div>
                <Link
                  href="/operate/stacking"
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition shadow-xs"
                >
                  Open Full Interactive Stacking Studio →
                </Link>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {[
                  { floor: "Floor 12", area: "25,000 sq.ft", occupant: "Deloitte Digital", rate: "₹95/sq.ft", status: "Occupied", expiry: "2029-08-31" },
                  { floor: "Floor 11", area: "25,000 sq.ft", occupant: "KPMG Global Delivery", rate: "₹92/sq.ft", status: "Occupied", expiry: "2028-11-30" },
                  { floor: "Floor 10", area: "12,500 sq.ft", occupant: "Microsoft R&D India", rate: "₹98/sq.ft", status: "Occupied", expiry: "2030-03-31" },
                  { floor: "Floor 10 (Unit B)", area: "12,500 sq.ft", occupant: "— VACANT SPACE —", rate: "₹95/sq.ft ask", status: "Vacant", expiry: "Available Now" },
                  { floor: "Floor 9", area: "25,000 sq.ft", occupant: "Scalezix Technologies", rate: "₹90/sq.ft", status: "Occupied", expiry: "2029-05-31" },
                ].map((st, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        {st.floor.replace("Floor ", "L")}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{st.occupant}</h5>
                        <span className="text-[11px] text-slate-500 font-mono">{st.area} · {st.rate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        st.status === "Occupied" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800 font-extrabold"
                      }`}>
                        {st.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{st.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {saasSubTab === "crm_helpdesk" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-teal-50/70 border border-teal-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="text-teal-700" size={16} />
                    <span>Corporate Tenant 10-Second QR Work Order Helpdesk</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Direct tenant-to-facility service tickets with SLA timer tracking and resolution dispatch.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    100% On-Time SLA Resolution
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Tenant &amp; Demised Floor</th>
                      <th className="p-3">Issue Category</th>
                      <th className="p-3">Reported Details</th>
                      <th className="p-3">SLA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: "HD-8841", tenant: "Deloitte Digital (Floor 8)", cat: "HVAC Temperature", desc: "Server room thermostat reading 24C, requires 20C cooling", sla: "RESOLVED (28m)" },
                      { id: "HD-8842", tenant: "KPMG Global (Floor 12)", cat: "Access Keycards", desc: "Batch of 10 RFID NFC cards configured for new onboarding", sla: "RESOLVED (15m)" },
                    ].map((hd) => (
                      <tr key={hd.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">{hd.id}</td>
                        <td className="p-3 font-bold text-slate-800">{hd.tenant}</td>
                        <td className="p-3 font-medium text-slate-700">{hd.cat}</td>
                        <td className="p-3 text-slate-600">{hd.desc}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {hd.sla}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {saasSubTab === "crm_amenities" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-teal-50/70 border border-teal-200 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="text-teal-700" size={16} />
                    <span>Shared Campus Amenity &amp; Conference Reservations</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Townhall auditoriums, boardroom bookings, and electric vehicle charging bays across tenant organizations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Executive Boardroom (24-Seater)", loc: "Level 14 Terrace", bookedBy: "Deloitte Strategy Meeting", time: "2:00 PM – 4:00 PM Today", status: "CONFIRMED" },
                  { name: "Townhall Auditorium (200-Seater)", loc: "Ground Floor Atrium", bookedBy: "KPMG All-Hands", time: "4:30 PM – 6:00 PM Today", status: "CONFIRMED" },
                  { name: "EV Fast Charger Bay 03", loc: "Basement 1 Parking", bookedBy: "Microsoft Corporate Fleet", time: "11:00 AM – 1:00 PM Today", status: "CHARGING" },
                ].map((am, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{am.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">{am.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{am.loc}</div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      <strong>{am.bookedBy}</strong>
                      <span className="block font-mono text-[10px] text-teal-700 mt-0.5">{am.time}</span>
                    </div>
                  </div>
                ))}
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

          {/* User Directory & Classification (Point 8 & 10) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Platform Users &amp; Multi-Tenant Classification</h3>
                <p className="text-xs text-slate-500">
                  Categorized view of individual SaaS subscribers, full suite package owners, marketplace operators, and corporate tenants.
                </p>
              </div>

              {/* Classification Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                {[
                  { id: "all", label: `All Users (${usersList.length})` },
                  { id: "package", label: "Full Package Suites" },
                  { id: "rent_roll", label: "Rent Roll SaaS" },
                  { id: "marketplace", label: "Marketplace Hosts" },
                  { id: "tenant", label: "Tenants" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setUserFilterRole(f.id)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs ${
                      userFilterRole === f.id
                        ? "bg-[#0F8B7D] text-white shadow-2xs font-extrabold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">User &amp; Organization</th>
                    <th className="p-3">Email &amp; Role</th>
                    <th className="p-3">SaaS / Marketplace Subscribed</th>
                    <th className="p-3">Portfolio Footprint</th>
                    <th className="p-3">Registered At</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList
                    .filter((u) => {
                      if (userFilterRole === "all") return true;
                      if (userFilterRole === "package") return u.role === "owner" || u.role === "super_admin";
                      if (userFilterRole === "rent_roll") return u.role === "owner" || u.role === "property_manager" || u.role === "finance_manager";
                      if (userFilterRole === "marketplace") return u.role === "marketplace_owner" || u.role === "broker";
                      if (userFilterRole === "tenant") return u.role === "tenant" || u.role === "occupant";
                      return true;
                    })
                    .map((u) => {
                      const userProps = saasProperties.filter((p) => p.orgId === u.orgId);
                      const totalArea = userProps.reduce((acc, p) => acc + Number(p.totalAreaSqft || 0), 0);
                      const isFullSuite = u.role === "super_admin" || u.role === "owner";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{u.fullName || "User Account"}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Org: {u.orgName || "Default SPV"}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-slate-700">{u.email}</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {isFullSuite ? (
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-50 text-purple-800 border border-purple-200">
                                  Full Enterprise Package
                                </span>
                              ) : u.role === "marketplace_owner" ? (
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                  Marketplace Listing Host
                                </span>
                              ) : u.role === "tenant" ? (
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                                  Occupant / Corporate Tenant
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                                  Rent Roll Standalone
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-800">
                              {userProps.length > 0 ? `${userProps.length} Props · ${totalArea.toLocaleString("en-IN")} sq.ft` : "0 Assets"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {saasContracts.filter((c) => c.orgId === u.orgId).length} Active Leases
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectingUser({ ...u, userProps, totalArea })}
                              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View Dossier</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

      {/* Dedicated Admin Marketplace Moderation & Approval Modal */}
      {moderatingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      {moderatingListing.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Batch v{moderatingListing.pricingPlans?.moderation?.batchVersion || 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      moderatingListing.status === "active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : moderatingListing.status === "changes_requested"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {moderatingListing.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {moderatingListing.brandName || "Independent"} · {moderatingListing.locality || moderatingListing.city}, {moderatingListing.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setModeratingListing(null);
                  setRevertMode(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-slate-700">
              {/* Left Column: Property Specs, Media & Submitted Docs (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Space Specifications Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Building2 size={14} className="text-teal-600" />
                    <span>Property &amp; Operator Specifications</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Vertical</span>
                      <p className="font-bold text-slate-900 capitalize">{moderatingListing.vertical?.replace("_", " ") || "Coworking"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Starting Rate</span>
                      <p className="font-bold text-teal-700">₹{Number(moderatingListing.startingPrice || 8500).toLocaleString("en-IN")}/mo</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Workstations</span>
                      <p className="font-bold text-slate-900">{moderatingListing.totalSeats ? `${moderatingListing.totalSeats} Seats` : "Flexible"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Area</span>
                      <p className="font-bold text-slate-900">{moderatingListing.totalAreaSqft ? `${moderatingListing.totalAreaSqft} sqft` : "N/A"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Building Grade</span>
                      <p className="font-bold text-slate-900">{moderatingListing.buildingGrade || "Grade A"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Operator Contact</span>
                      <p className="font-bold text-slate-900 truncate">{moderatingListing.consultantName || moderatingListing.brandName || "Partner"}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1">
                    <b>Address:</b> {moderatingListing.fullAddress || `${moderatingListing.locality || ""}, ${moderatingListing.city}`}
                  </div>
                </div>

                {/* Uploaded Photos & Media Gallery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Eye size={13} className="text-teal-600" />
                      <span>Uploaded Photos &amp; Media ({Array.isArray(moderatingListing.images) ? moderatingListing.images.length : (moderatingListing.featuredImage ? 1 : 0)})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Replaced automatically on batch updates</span>
                  </div>

                  {Array.isArray(moderatingListing.images) && moderatingListing.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {moderatingListing.images.map((img: string, idx: number) => (
                        <div key={idx} className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                            {idx === 0 ? "Cover" : `#${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : moderatingListing.featuredImage ? (
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={moderatingListing.featuredImage}
                        alt="Featured preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
                      No media uploaded yet for this property.
                    </div>
                  )}
                </div>

                {/* Host Notes / Resubmission Remarks */}
                {moderatingListing.pricingPlans?.moderation?.hostRemarks && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                      <RefreshCw size={13} className="text-teal-600" />
                      <span>Host Resubmission Note (Batch v{moderatingListing.pricingPlans?.moderation?.batchVersion || 2}):</span>
                    </div>
                    <p className="text-xs text-teal-800">
                      "{moderatingListing.pricingPlans?.moderation?.hostRemarks}"
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Audit Trail & Moderation Decision (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Audit & Revision History */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-teal-600" />
                    <span>Audit &amp; Revision Trail</span>
                  </h4>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {Array.isArray(moderatingListing.pricingPlans?.moderation?.history) &&
                    moderatingListing.pricingPlans.moderation.history.length > 0 ? (
                      moderatingListing.pricingPlans.moderation.history.map((h: any, i: number) => (
                        <div key={i} className="text-xs border-l-2 border-teal-500 pl-3 py-0.5 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 capitalize">{h.action?.replace("_", " ")}</span>
                            <span className="text-[10px] text-slate-400">
                              {h.timestamp ? new Date(h.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                          {h.note && <p className="text-slate-600 text-[11px]">"{h.note}"</p>}
                          {Array.isArray(h.requestedDocs) && h.requestedDocs.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {h.requestedDocs.map((d: string, di: number) => (
                                <span key={di} className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-center py-2">Initial submission logged.</div>
                    )}
                  </div>
                </div>

                {/* Moderation Actions Box */}
                {!revertMode ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                      <div>
                        <h5 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Approve &amp; Publish to Public Marketplace</span>
                        </h5>
                        <p className="text-[11px] text-emerald-700 mt-1">
                          Grants verified status. Normal users and seekers will be able to discover and rent this space immediately.
                        </p>
                      </div>

                      <button
                        onClick={() => handleApproveListing(moderatingListing.id)}
                        disabled={modActionLoading}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check size={14} />
                        <span>{modActionLoading ? "Publishing..." : "Approve & Publish Space"}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                      <div>
                        <h5 className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-rose-600" />
                          <span>Revert &amp; Request Documents from Operator</span>
                        </h5>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Flag missing Fire Safety NOC, layout blueprints, or blurry photos. Notifies the host on their dashboard &amp; email.
                        </p>
                      </div>

                      <button
                        onClick={() => setRevertMode(true)}
                        className="w-full py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle size={14} />
                        <span>Specify Missing Documents &amp; Revert</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-amber-900 text-xs flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>Select Documents &amp; Remarks for Operator</span>
                      </h5>
                      <button
                        onClick={() => setRevertMode(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Checkbox of requested documents */}
                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Required Documents</span>
                      {[
                        "Fire Safety NOC Certificate",
                        "Building Ownership Title Deed / Lease",
                        "Floor Layout & Workstation Blueprint",
                        "High-Resolution Workstation Photos",
                        "Latest Electricity / Utility Bill",
                        "GST Registration Certificate"
                      ].map((docName) => {
                        const checked = modRequestedDocs.includes(docName);
                        return (
                          <label key={docName} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setModRequestedDocs([...modRequestedDocs, docName]);
                                } else {
                                  setModRequestedDocs(modRequestedDocs.filter(d => d !== docName));
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span>{docName}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Remarks for Operator (Email &amp; Dashboard)</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Please provide Fire Safety NOC and update the floor plan before we can approve this space."
                        value={modAdminRemarks}
                        onChange={(e) => setModAdminRemarks(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setRevertMode(false)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleRevertListing(moderatingListing.id)}
                        disabled={modActionLoading}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {modActionLoading ? "Sending Revert..." : "Send Revert Notice"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Modal: Add Coupon / Special User Grant */}
      {showAddDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={18} className="text-[#0F8B7D]" />
                <span>Add Discount / User Grant</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDiscountModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  Promo / Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP50, PRABHAT100, SUMMER25"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  Discount Percentage (%) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newDiscount.discountPct}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discountPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
                >
                  <option value={100}>100% OFF (Full Complimentary Access)</option>
                  <option value={75}>75% OFF</option>
                  <option value={50}>50% OFF (Half Price)</option>
                  <option value={35}>35% OFF</option>
                  <option value={25}>25% OFF</option>
                  <option value={20}>20% OFF</option>
                  <option value={10}>10% OFF</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">
                  Eligibility Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDiscount({ ...newDiscount, type: "global" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                      newDiscount.type === "global"
                        ? "border-[#0F8B7D] bg-teal-50 text-[#0F8B7D]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Global (Any User)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDiscount({ ...newDiscount, type: "user_specific" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                      newDiscount.type === "user_specific"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Specific User Only
                  </button>
                </div>
              </div>

              {newDiscount.type === "user_specific" && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                  <label className="text-purple-900 block font-bold text-[11px]">
                    Authorized User Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. prabhat@gmail.com"
                    value={newDiscount.targetUserEmail}
                    onChange={(e) => setNewDiscount({ ...newDiscount, targetUserEmail: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-1.5 border border-purple-300 rounded-lg bg-white font-medium text-slate-900"
                  />
                  <p className="text-[10px] text-purple-700">Only this registered email will be permitted to activate this discount.</p>
                </div>
              )}

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Internal Admin Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Granted by founder for strategic pilot"
                  value={newDiscount.notes}
                  onChange={(e) => setNewDiscount({ ...newDiscount, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiscountModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F8B7D] hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save &amp; Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Comprehensive User Full Dossier (Point 10) */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-800 border border-teal-500/30 flex items-center justify-center font-black text-base">
                  {inspectingUser.fullName ? inspectingUser.fullName[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inspectingUser.fullName || "User Account"}</h3>
                  <p className="text-xs text-slate-500 font-mono">{inspectingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
                <span className="font-bold text-slate-900 uppercase mt-0.5 block">{inspectingUser.role}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Properties</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{inspectingUser.userProps?.length || 0} Registered</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Managed Area</span>
                <span className="font-bold text-teal-800 font-mono mt-0.5 block">
                  {Number(inspectingUser.totalArea || 0).toLocaleString("en-IN")} sq.ft
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered On</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {new Date(inspectingUser.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            {/* Subscribed Marketplaces & SaaS Packages */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Subscribed Marketplaces &amp; Entitlements</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-teal-600" />
                    <span className="font-semibold text-slate-800">Commercial Rent Roll SaaS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-blue-600" />
                    <span className="font-semibold text-slate-800">Office Marketplace</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">OPTIONAL</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-purple-600" />
                    <span className="font-semibold text-slate-800">Flex / Coworking Network</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">INCLUDED</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <span className="font-semibold text-slate-800">FM &amp; Statutory Compliance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Registered Properties List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Portfolio Assets</h4>
              {(!inspectingUser.userProps || inspectingUser.userProps.length === 0) ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                  No properties registered under this account yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Property Name</th>
                        <th className="p-2.5">City &amp; State</th>
                        <th className="p-2.5">Total Area</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectingUser.userProps.map((p: any) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                          <td className="p-2.5 text-slate-600">{p.city}, {p.state}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">
                            {Number(p.totalAreaSqft || 0).toLocaleString("en-IN")} sq.ft
                          </td>
                          <td className="p-2.5">
                            {p.pendingDeletion ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                Deletion Pending
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Verified Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect Target Email & Discount Audit (Point 11) */}
      {inspectingTargetEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-[#0F8B7D]" />
                <h3 className="text-base font-bold text-slate-900">Discount Code &amp; Target User Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingTargetEmail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Promo Code:</span>
                <span className="font-mono font-black text-sm text-[#0F8B7D]">{inspectingTargetEmail.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Discount Percentage:</span>
                <span className="font-mono font-black text-emerald-700">{inspectingTargetEmail.discountPct}% OFF</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Eligibility Scope:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                  {inspectingTargetEmail.type === "user_specific" ? "Target Specific User Grant" : "Global Public Code"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Target Email Address:</span>
                <span className="font-mono font-bold text-slate-900">
                  {inspectingTargetEmail.targetUserEmail || "All Platform Accounts (Global)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Times Redeemed:</span>
                <span className="font-mono font-bold text-slate-800">{inspectingTargetEmail.usedCount || 0} times</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  inspectingTargetEmail.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {inspectingTargetEmail.isActive ? "Active Live" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
              <span className="text-teal-900 font-bold text-[11px] block">Eligible Modules &amp; Packages:</span>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Applies to all Rent Roll Commercial Plans (Starter, Tech Park Campus, REIT Mega), Marketplace Listings, and Enterprise Master Packages.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectingTargetEmail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Full-Screen Institutional Deletion Governance Blocking Modal */}
      {deletionProcessingState.active && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none pointer-events-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-scaleUp">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {deletionProcessingState.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deletionProcessingState.message}
              </p>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 rounded-full animate-pulse w-full" />
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 font-medium leading-normal">
                Institutional Safety Lock: Database updates, invoice cancellations, and contract terminations are executing. All actions are blocked until completion.
              </p>
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
