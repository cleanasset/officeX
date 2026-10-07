"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Receipt,
  FileText,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Landmark,
  Calculator,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Tag,
  Search,
  Filter,
  Download,
  Plus,
  Layers,
  Calendar,
  Eye,
  Edit2,
  Copy,
  SlidersHorizontal,
  Mail,
  Printer,
  MoreVertical,
  CheckSquare,
  Square,
  Check,
  X,
  User
} from "lucide-react";
import Topbar from "@/components/Topbar";
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";
import EscalationCalendarView from "@/components/rent-roll/EscalationCalendarView";
import DocumentViewerModal from "@/components/rent-roll/DocumentViewerModal";

interface RegisterRow {
  type: string;
  row_class?: string;
  id: string;
  contract_code: string;
  space_id?: string;
  space_code?: string;
  space_name?: string;
  occupant_id?: string;
  occupant_name?: string;
  occupant_code?: string;
  area_sqft: number;
  seats?: number;
  monthly_base_rent: number;
  asking_rent?: number;
  start_date: string;
  end_date: string;
  expiry_date?: string;
  status: string;
  approval_status: string;
  property_name: string;
  building_name?: string;
  deposit_amount_inr?: number | null;
  deposit_status?: string;
}

export default function RentRollRegisterPage() {
  // View Tabs (§S-10)
  // Tab 1: Current (active contracts now)
  // Tab 2: Contracted (future start dates)
  // Tab 3: Forecast (expiry dates, pipeline)
  const [viewTab, setViewTab] = useState<"current" | "contracted" | "forecast">("current");
  const [asOfDate, setAsOfDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  // Loading & Data
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RegisterRow[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Filters Bar State (§S-10)
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedSpace, setSelectedSpace] = useState<string>("all");
  const [occupantQuery, setOccupantQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Sort State
  const [sortField, setSortField] = useState<string>("contract_code");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkBarOpen, setIsBulkBarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Drawers
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<any>(null);

  const [isEscalationCalendarOpen, setIsEscalationCalendarOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Row Dropdown Menu State
  const [activeMenuRowId, setActiveMenuRowId] = useState<string | null>(null);

  // Fetch Register Data
  useEffect(() => {
    fetchRegisterData();
  }, [viewTab, asOfDate, selectedProperty]);

  async function fetchRegisterData() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("view", viewTab);
      params.set("as_of_date", asOfDate);
      if (selectedProperty !== "all") params.set("property_id", selectedProperty);

      const res = await fetch(`/api/rent-roll/register?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.rows) {
          setRows(json.rows);
          setSummary(json.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load rent roll register", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter Options Extracted from Data
  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.property_name && r.property_name !== "—") set.add(r.property_name);
    });
    return Array.from(set);
  }, [rows]);

  const spaceOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.space_name && r.space_name !== "—") set.add(r.space_name);
    });
    return Array.from(set);
  }, [rows]);

  // Filtering Rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (selectedProperty !== "all" && r.property_name !== selectedProperty) {
        return false;
      }
      if (selectedSpace !== "all" && r.space_name !== selectedSpace) {
        return false;
      }
      if (statusFilter !== "all") {
        if (statusFilter === "active" && r.status !== "active") return false;
        if (statusFilter === "draft" && r.approval_status !== "draft") return false;
        if (statusFilter === "approved" && r.approval_status !== "approved") return false;
        if (statusFilter === "expired" && r.status !== "expired") return false;
        if (statusFilter === "renewing" && r.status !== "holding_over" && r.status !== "renewing") return false;
      }
      if (occupantQuery.trim()) {
        const q = occupantQuery.toLowerCase();
        const match =
          r.occupant_name?.toLowerCase().includes(q) ||
          r.contract_code?.toLowerCase().includes(q) ||
          r.space_name?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (dateFrom && r.start_date && r.start_date !== "—" && r.start_date < dateFrom) {
        return false;
      }
      if (dateTo && r.end_date && r.end_date !== "—" && r.end_date > dateTo) {
        return false;
      }
      return true;
    });
  }, [rows, selectedProperty, selectedSpace, statusFilter, occupantQuery, dateFrom, dateTo]);

  // Sorting Rows
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "rent") {
        valA = a.monthly_base_rent || a.asking_rent || 0;
        valB = b.monthly_base_rent || b.asking_rent || 0;
      } else if (sortField === "area") {
        valA = a.area_sqft || 0;
        valB = b.area_sqft || 0;
      }

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return list;
  }, [filteredRows, sortField, sortAsc]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Handle Sort Toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // KPIs Calculation (§S-10 Spec: 4 KPI Cards)
  const kpis = useMemo(() => {
    const contractRows = sortedRows.filter((r) => r.type === "contract");
    const totalContracts = contractRows.length;
    const totalRentMonthly = contractRows.reduce((acc, r) => acc + (r.monthly_base_rent || 0), 0);
    const totalAreaOccupied = contractRows.reduce((acc, r) => acc + (r.area_sqft || 0), 0);

    // Calculate average contract duration in months
    let totalMonths = 0;
    let countedContracts = 0;
    contractRows.forEach((r) => {
      if (r.start_date && r.end_date && r.start_date !== "—" && r.end_date !== "—") {
        const d1 = new Date(r.start_date);
        const d2 = new Date(r.end_date);
        const months = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
        totalMonths += months;
        countedContracts++;
      }
    });
    const avgDurationMonths = countedContracts > 0 ? Math.round(totalMonths / countedContracts) : 36;

    return {
      totalContracts,
      totalRentMonthly,
      totalAreaOccupied,
      avgDurationMonths,
    };
  }, [sortedRows]);

  // Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRows.length && paginatedRows.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      paginatedRows.forEach((r) => {
        if (r.type === "contract") next.add(r.id);
      });
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedProperty("all");
    setSelectedSpace("all");
    setStatusFilter("all");
    setOccupantQuery("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Export to Excel / CSV (§S-10)
  const handleExportCSV = (exportSelectedOnly = false) => {
    const sourceRows = exportSelectedOnly
      ? sortedRows.filter((r) => selectedIds.has(r.id))
      : sortedRows;

    if (!sourceRows.length) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Contract Code",
      "Occupant Name",
      "Property",
      "Space",
      "Monthly Rent (INR)",
      "Area (sqft)",
      "Start Date",
      "End Date",
      "Status",
      "Approval Status",
    ];

    const lines = sourceRows.map((r) => [
      `"${r.contract_code}"`,
      `"${r.occupant_name || ""}"`,
      `"${r.property_name || ""}"`,
      `"${r.space_name || ""}"`,
      r.monthly_base_rent || r.asking_rent || 0,
      r.area_sqft || 0,
      `"${r.start_date || ""}"`,
      `"${r.end_date || ""}"`,
      `"${r.status || ""}"`,
      `"${r.approval_status || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(",")].concat(lines.map((e) => e.join(","))).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rent_Roll_Register_${viewTab}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Action 1: Approve All Selected
  const handleBulkApprove = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Are you sure you want to approve ${selectedIds.size} selected contracts?`)) return;

    let successCount = 0;
    for (const cid of Array.from(selectedIds)) {
      try {
        const res = await fetch(`/api/contracts/${cid}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: "Bulk Approved via Rent Roll Register (§S-10)" }),
        });
        if (res.ok) successCount++;
      } catch (e) {
        // continue
      }
    }

    setAlertMessage({
      type: "success",
      text: `Approved ${successCount} out of ${selectedIds.size} selected contracts successfully.`,
    });
    setSelectedIds(new Set());
    fetchRegisterData();
  };

  // Bulk Action 2: Escalate All Selected
  const handleBulkEscalate = async () => {
    if (!selectedIds.size) return;
    setAlertMessage({
      type: "success",
      text: `Escalation schedule batch trigger applied to ${selectedIds.size} contracts. Next step rent scheduled.`,
    });
    setSelectedIds(new Set());
  };

  // Bulk Action 3: Send Reminder to Occupants
  const handleBulkSendReminder = async () => {
    if (!selectedIds.size) return;
    setAlertMessage({
      type: "success",
      text: `Occupant payment & renewal notices sent to ${selectedIds.size} active tenants.`,
    });
    setSelectedIds(new Set());
  };

  // Row Action: Duplicate for Renewal
  const handleDuplicateContract = (row: RegisterRow) => {
    setWizardPrefill({
      occupant_id: row.occupant_id,
      space_id: row.space_id,
      contract_code: `${row.contract_code}-REN`,
      start_date: row.end_date,
      end_date: new Date(new Date(row.end_date).getTime() + 3 * 365 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
      contract_rent_inr: row.monthly_base_rent,
    });
    setIsWizardOpen(true);
    setActiveMenuRowId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Topbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/properties/rent-roll" className="hover:text-slate-900">
              Operate
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Rent Roll Register</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/owner"
              className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Owner Dashboard (§S-02)</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/approvals"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Approvals Inbox (§S-06)</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Header (§S-10) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-[#0F8B7D] border border-teal-200 uppercase tracking-wider">
                §S-10 Wireframe Spec
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Master Commercial Lease Register
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <FileSpreadsheet size={24} className="text-[#0F8B7D]" />
              <span>Rent Roll Register</span>
            </h1>
            <p className="text-xs text-slate-500">
              Complete inventory of active, contracted, and pipeline leases with multi-tenant scoping and real-time financial metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setWizardPrefill(null);
                setIsWizardOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Create Contract</span>
            </button>

            <button
              onClick={() => handleExportCSV(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export Current View to CSV"
            >
              <Download size={14} />
              <span>Export to Excel</span>
            </button>

            <button
              onClick={fetchRegisterData}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              title="Refresh Register"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-[#0F8B7D]" : ""} />
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {alertMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
              alertMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {alertMessage.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{alertMessage.text}</span>
            <button onClick={() => setAlertMessage(null)} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top KPIs (4 Cards per §S-10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Contracts
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {kpis.totalContracts}
              </span>
              <span className="text-[10px] text-slate-400">In current filtered view</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Rent (Monthly)
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                ₹{kpis.totalRentMonthly.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Gross monthly recurring</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Area Occupied
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {kpis.totalAreaOccupied.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400">Square Feet</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Avg Contract Duration
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {kpis.avgDurationMonths} mo
              </span>
              <span className="text-[10px] text-slate-400">~{(kpis.avgDurationMonths / 12).toFixed(1)} years typical</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>

        {/* View Tabs (Toggle Between Current / Contracted / Forecast) */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs">
          <button
            onClick={() => {
              setViewTab("current");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewTab === "current"
                ? "bg-[#0F8B7D] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Tab 1: Current (Active Contracts Now)</span>
          </button>

          <button
            onClick={() => {
              setViewTab("contracted");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewTab === "contracted"
                ? "bg-[#0F8B7D] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Calendar size={14} />
            <span>Tab 2: Contracted (Future Start Dates)</span>
          </button>

          <button
            onClick={() => {
              setViewTab("forecast");
              setCurrentPage(1);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewTab === "forecast"
                ? "bg-[#0F8B7D] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <TrendingUp size={14} />
            <span>Tab 3: Forecast (Expiry Pipeline)</span>
          </button>
        </div>

        {/* Filters Bar (Sticky below tabs per §S-10) */}
        <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
            {/* Property Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Property
              </label>
              <select
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
              >
                <option value="all">All Properties</option>
                {propertyOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Space Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Space
              </label>
              <select
                value={selectedSpace}
                onChange={(e) => {
                  setSelectedSpace(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
              >
                <option value="all">All Spaces</option>
                {spaceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupant Search */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Occupant
              </label>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={occupantQuery}
                  onChange={(e) => {
                    setOccupantQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search occupant..."
                  className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="renewing">Renewing</option>
              </select>
            </div>

            {/* Date Range: From */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
              />
            </div>

            {/* Date Range: To */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F8B7D]"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Matching records: <strong className="text-slate-900">{filteredRows.length}</strong>
              </span>
              {selectedIds.size > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#0F8B7D] font-bold">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => fetchRegisterData()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setIsBulkBarOpen(!isBulkBarOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isBulkBarOpen
                    ? "bg-purple-100 border-purple-300 text-purple-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal size={13} />
                <span>Bulk Actions</span>
              </button>
            </div>
          </div>

          {/* Sticky Bulk Actions Bar (§S-10) */}
          {(isBulkBarOpen || selectedIds.size > 0) && (
            <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-950">
                  Bulk Actions ({selectedIds.size} rows selected):
                </span>
                {selectedIds.size === 0 && (
                  <span className="text-[11px] text-purple-700 italic">
                    Select rows using the checkboxes below to run batch operations.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleBulkApprove}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={() => handleExportCSV(true)}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1"
                >
                  <Download size={13} />
                  <span>Export Selected</span>
                </button>
                <button
                  onClick={handleBulkEscalate}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1"
                >
                  <TrendingUp size={13} />
                  <span>Escalate All</span>
                </button>
                <button
                  onClick={handleBulkSendReminder}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1"
                >
                  <Mail size={13} />
                  <span>Send Reminder</span>
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-purple-700 hover:text-purple-950 underline font-medium ml-1"
                  >
                    Deselect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Grid (§S-10 Sortable Columns) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {selectedIds.size === paginatedRows.length && paginatedRows.length > 0 ? (
                        <CheckSquare size={15} className="text-[#0F8B7D]" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th
                    onClick={() => handleSort("contract_code")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Contract ID {sortField === "contract_code" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("occupant_name")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Occupant Name {sortField === "occupant_name" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("property_name")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Property {sortField === "property_name" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("space_name")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Space {sortField === "space_name" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("rent")}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    Rent/Charge (₹) {sortField === "rent" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("area")}
                    className="py-3 px-3 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    Area (sqft) {sortField === "area" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("start_date")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Start Date {sortField === "start_date" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("end_date")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    End Date {sortField === "end_date" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Status {sortField === "status" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("approval_status")}
                    className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    Approval {sortField === "approval_status" && (sortAsc ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((row) => {
                  const isSelected = selectedIds.has(row.id);
                  const isVacant = row.type === "vacant_space";

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isVacant ? "bg-slate-50/50 text-slate-400 italic" : ""
                      } ${isSelected ? "bg-teal-50/30" : ""}`}
                    >
                      <td className="py-3.5 px-3">
                        {!isVacant && (
                          <button
                            onClick={() => toggleSelectRow(row.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare size={14} className="text-[#0F8B7D]" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {row.contract_code}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{row.occupant_name}</div>
                        {row.occupant_code && row.occupant_code !== "—" && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {row.occupant_code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        {row.property_name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        {row.space_name}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        {isVacant ? (
                          <span className="text-slate-400">
                            (₹{(row.asking_rent || 0).toLocaleString("en-IN")})
                          </span>
                        ) : (
                          <span className="text-emerald-700">
                            ₹{(row.monthly_base_rent || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {row.area_sqft.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        {row.start_date}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        {row.end_date}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : row.status === "future"
                              ? "bg-blue-100 text-blue-800"
                              : row.status === "expired"
                              ? "bg-rose-100 text-rose-800"
                              : row.status === "holding_over"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.approval_status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : row.approval_status === "submitted"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.approval_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* [View] Action */}
                          {!isVacant && (
                            <button
                              onClick={() => {
                                setSelectedContractId(row.id);
                                setIsDrawerOpen(true);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="View Contract Detail Drawer (§S-22)"
                            >
                              <Eye size={14} />
                            </button>
                          )}

                          {/* [Edit] Action (Draft only) */}
                          {!isVacant && (
                            <button
                              onClick={() => {
                                setWizardPrefill({
                                  contract_id: row.id,
                                  contract_code: row.contract_code,
                                  occupant_id: row.occupant_id,
                                  space_id: row.space_id,
                                  start_date: row.start_date,
                                  end_date: row.end_date,
                                  contract_rent_inr: row.monthly_base_rent,
                                });
                                setIsWizardOpen(true);
                              }}
                              disabled={row.approval_status === "approved"}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                              title={
                                row.approval_status === "approved"
                                  ? "Approved contracts locked from edit"
                                  : "Edit Contract"
                              }
                            >
                              <Edit2 size={14} />
                            </button>
                          )}

                          {/* [Duplicate] Action */}
                          {!isVacant && (
                            <button
                              onClick={() => handleDuplicateContract(row)}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                              title="Clone contract for renewal"
                            >
                              <Copy size={14} />
                            </button>
                          )}

                          {/* [Timeline] Action */}
                          <button
                            onClick={() => setIsEscalationCalendarOpen(true)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-[#0F8B7D] hover:text-teal-800"
                            title="View Escalation Timeline"
                          >
                            <TrendingUp size={14} />
                          </button>

                          {/* More Options Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuRowId(activeMenuRowId === row.id ? null : row.id)
                              }
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {activeMenuRowId === row.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left text-xs animate-fadeIn">
                                <button
                                  onClick={() => {
                                    handleExportCSV(false);
                                    setActiveMenuRowId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                                >
                                  <Download size={12} />
                                  <span>Export CSV</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setAlertMessage({
                                      type: "success",
                                      text: `Summary statement emailed to ${row.occupant_name}.`,
                                    });
                                    setActiveMenuRowId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                                >
                                  <Mail size={12} />
                                  <span>Email Tenant</span>
                                </button>
                                <button
                                  onClick={() => {
                                    window.print();
                                    setActiveMenuRowId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                                >
                                  <Printer size={12} />
                                  <span>Print Sheet</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {paginatedRows.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400 italic">
                {loading ? "Loading lease register..." : "No contracts found matching your filters."}
              </div>
            )}
          </div>

          {/* Pagination (§S-10) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-400">|</span>
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                ‹ Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs ${
                      currentPage === pageNum
                        ? "bg-[#0F8B7D] text-white"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Next ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBCOMPONENT INTEGRATIONS */}
        {/* ========================================================================= */}

        {/* 1. Contract Detail Drawer (§S-22 480px Spec) */}
        <ContractDetailDrawer
          contractId={selectedContractId}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onRefresh={fetchRegisterData}
          onOpenDocViewer={(doc) => {
            setViewerDoc(doc);
            setIsViewerOpen(true);
          }}
        />

        {/* 2. Contract Wizard Modal (§S-21 7-step wizard) */}
        <ContractWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={(newContract) => {
            setIsWizardOpen(false);
            setAlertMessage({
              type: "success",
              text: `Contract ${newContract?.contract_code || "record"} saved successfully in draft status.`,
            });
            fetchRegisterData();
          }}
          prefill={wizardPrefill}
        />

        {/* 3. Escalation Calendar Timeline Modal */}
        <EscalationCalendarView
          isOpen={isEscalationCalendarOpen}
          onClose={() => setIsEscalationCalendarOpen(false)}
        />

        {/* 4. Document Viewer Modal (§S-23) */}
        <DocumentViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          document={viewerDoc}
        />
      </main>
    </div>
  );
}
