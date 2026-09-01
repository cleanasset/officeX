"use client";

import React, { useState } from "react";
import { 
  Search, CheckCircle, TrendingUp, DollarSign, Calendar, AlertTriangle, 
  FileText, Download, Building, ShieldCheck, Filter, ArrowUpRight, 
  ChevronDown, ChevronUp, Clock, User, Check, Sparkles, BookOpen, AlertCircle,
  CreditCard, ArrowRight, Wallet, PieChart, Shield
} from "lucide-react";

interface RentRollEntry {
  propertyId: string;
  propertyName: string;
  floor: string;
  unit: string;
  tenantId: string;
  tenantName: string;
  leaseId: string;
  areaSqFt: number;
  leaseStart: string;
  leaseEnd: string;
  lockInEnd: string;
  noticePeriodDays: number;
  baseMonthlyRent: string;
  baseRentPsf: number;
  escalationPct: number;
  nextEscalationDate: string;
  currentMonthlyRent: string;
  camPsf: number;
  camMonthly: string;
  utilityMonthly: string;
  gstAmount: string;
  totalMonthlyBilling: string;
  depositRequired: string;
  depositReceived: string;
  outstanding: string;
  overdueDays: number;
  expiryAlert: string;
  escalationAlert: string;
  leaseStatus: "Active" | "Notice Served" | "Expiring Soon";
}

export default function RentRollMaster() {
  const [activeTab, setActiveTab] = useState<
    "rentroll" | "invoices" | "collections" | "aging" | "escalations" | "pnl" | "tenants" | "dictionary"
  >("rentroll");
  
  const [selectedProperty, setSelectedProperty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeaseId, setExpandedLeaseId] = useState<string | null>("LEASE-001");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const rentRollData: RentRollEntry[] = [
    {
      propertyId: "PROP-001",
      propertyName: "One BKC (Apex Tower)",
      floor: "Floor 4",
      unit: "Suite 401 (North Wing)",
      tenantId: "TEN-101",
      tenantName: "Tata Digital Ltd",
      leaseId: "LEASE-001",
      areaSqFt: 25000,
      leaseStart: "01-Sep-2024",
      leaseEnd: "31-Aug-2029",
      lockInEnd: "31-Aug-2027",
      noticePeriodDays: 90,
      baseMonthlyRent: "₹46,25,000",
      baseRentPsf: 185,
      escalationPct: 5,
      nextEscalationDate: "01-Sep-2026",
      currentMonthlyRent: "₹46,25,000",
      camPsf: 22,
      camMonthly: "₹5,50,000",
      utilityMonthly: "₹1,85,000",
      gstAmount: "₹9,64,800",
      totalMonthlyBilling: "₹63,24,800",
      depositRequired: "₹2,77,50,000",
      depositReceived: "₹2,77,50,000",
      outstanding: "₹0",
      overdueDays: 0,
      expiryAlert: "Normal (3y+)",
      escalationAlert: "Due in 365d",
      leaseStatus: "Active"
    },
    {
      propertyId: "PROP-001",
      propertyName: "One BKC (Apex Tower)",
      floor: "Floor 8",
      unit: "Entire Horizon Plate",
      tenantId: "TEN-102",
      tenantName: "Google India Pvt Ltd",
      leaseId: "LEASE-002",
      areaSqFt: 32000,
      leaseStart: "15-Oct-2024",
      leaseEnd: "14-Oct-2030",
      lockInEnd: "14-Oct-2028",
      noticePeriodDays: 120,
      baseMonthlyRent: "₹62,40,000",
      baseRentPsf: 195,
      escalationPct: 5,
      nextEscalationDate: "15-Oct-2026",
      currentMonthlyRent: "₹62,40,000",
      camPsf: 22,
      camMonthly: "₹7,04,000",
      utilityMonthly: "₹2,40,000",
      gstAmount: "₹12,93,120",
      totalMonthlyBilling: "₹84,77,120",
      depositRequired: "₹3,74,40,000",
      depositReceived: "₹3,74,40,000",
      outstanding: "₹0",
      overdueDays: 0,
      expiryAlert: "Normal (4y+)",
      escalationAlert: "Due in 14 mos",
      leaseStatus: "Active"
    },
    {
      propertyId: "PROP-002",
      propertyName: "Maker Maxity Mumbai",
      floor: "Floor 5",
      unit: "Suite 501",
      tenantId: "TEN-103",
      tenantName: "Deloitte Digital",
      leaseId: "LEASE-003",
      areaSqFt: 18500,
      leaseStart: "01-Jan-2024",
      leaseEnd: "31-Dec-2028",
      lockInEnd: "31-Dec-2026",
      noticePeriodDays: 90,
      baseMonthlyRent: "₹33,30,000",
      baseRentPsf: 180,
      escalationPct: 5,
      nextEscalationDate: "01-Jan-2027",
      currentMonthlyRent: "₹33,30,000",
      camPsf: 20,
      camMonthly: "₹3,70,000",
      utilityMonthly: "₹1,20,000",
      gstAmount: "₹6,87,600",
      totalMonthlyBilling: "₹45,07,600",
      depositRequired: "₹1,99,80,000",
      depositReceived: "₹1,99,80,000",
      outstanding: "₹45,07,600",
      overdueDays: 14,
      expiryAlert: "Normal (2y+)",
      escalationAlert: "Scheduled",
      leaseStatus: "Active"
    },
    {
      propertyId: "PROP-003",
      propertyName: "Godrej BKC Horizon",
      floor: "Floor 6",
      unit: "Suite 602",
      tenantId: "TEN-104",
      tenantName: "Wipro Cloud Infra",
      leaseId: "LEASE-004",
      areaSqFt: 14000,
      leaseStart: "15-Feb-2023",
      leaseEnd: "14-Feb-2027",
      lockInEnd: "14-Feb-2025",
      noticePeriodDays: 90,
      baseMonthlyRent: "₹23,80,000",
      baseRentPsf: 170,
      escalationPct: 7,
      nextEscalationDate: "15-Feb-2026",
      currentMonthlyRent: "₹23,80,000",
      camPsf: 18,
      camMonthly: "₹2,52,000",
      utilityMonthly: "₹95,000",
      gstAmount: "₹4,90,860",
      totalMonthlyBilling: "₹32,17,860",
      depositRequired: "₹1,42,80,000",
      depositReceived: "₹1,42,80,000",
      outstanding: "₹0",
      overdueDays: 0,
      expiryAlert: "Expiring in 6 mos",
      escalationAlert: "Due Soon",
      leaseStatus: "Expiring Soon"
    }
  ];

  const handleExportWorkbook = () => {
    const headers = [
      "Property ID", "Property Name", "Floor", "Unit", "Tenant ID", "Tenant Name", "Lease ID",
      "Area SqFt", "Lease Start", "Lease End", "Lock-in End", "Notice Days", "Base Rent", "Base Rent psf",
      "Escalation %", "Next Escalation", "Current Rent", "CAM psf", "CAM Monthly", "Utility", "GST Amount",
      "Total Monthly Billing", "Deposit Required", "Deposit Received", "Outstanding", "Overdue Days", "Lease Status"
    ];

    const rows = rentRollData.map(d => [
      d.propertyId, `"${d.propertyName}"`, d.floor, `"${d.unit}"`, d.tenantId, `"${d.tenantName}"`, d.leaseId,
      d.areaSqFt, d.leaseStart, d.leaseEnd, d.lockInEnd, d.noticePeriodDays, `"${d.baseMonthlyRent}"`, d.baseRentPsf,
      `${d.escalationPct}%`, d.nextEscalationDate, `"${d.currentMonthlyRent}"`, d.camPsf, `"${d.camMonthly}"`,
      `"${d.utilityMonthly}"`, `"${d.gstAmount}"`, `"${d.totalMonthlyBilling}"`, `"${d.depositRequired}"`,
      `"${d.depositReceived}"`, `"${d.outstanding}"`, d.overdueDays, d.leaseStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OFFICEX_Rent_Roll_Master_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded official 39-column Rent Roll Master workbook!");
  };

  const filteredData = rentRollData.filter(d => {
    const matchesProperty = selectedProperty === "All" || d.propertyName.includes(selectedProperty);
    const matchesSearch = !searchQuery.trim() || 
      d.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.leaseId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProperty && matchesSearch;
  });

  const totalArea = rentRollData.reduce((acc, curr) => acc + curr.areaSqFt, 0);

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900">Institutional Rent Roll Master</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black">
              Institutional Grade-A Ledger
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Multi-sheet commercial tenancy schedule, CAM reconciliation, and automated escalation index.
          </p>
        </div>
        <button
          onClick={handleExportWorkbook}
          className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
        >
          <Download size={14} /> Export Rent Roll (.xlsx / .csv)
        </button>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">LEASED AREA</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalArea.toLocaleString()} sq.ft.</p>
          <span className="text-[10px] text-emerald-600 font-bold">● 94.2% Occupancy across BKC</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY INVOICED GTV</span>
          <p className="text-2xl font-black text-gray-900 mt-1">₹2.25 Crores</p>
          <span className="text-[10px] text-gray-400">Rent + CAM + Utility + GST</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY CAM RECOVERY</span>
          <p className="text-2xl font-black text-teal-700 mt-1">₹18.76 Lakhs</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Cost Recovery</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SECURITY DEPOSITS HELD</span>
          <p className="text-2xl font-black text-gray-900 mt-1">₹9.94 Crores</p>
          <span className="text-[10px] text-teal-700 font-bold">Held in Escrow Reserves</span>
        </div>
      </div>

      {/* Clean Structured Tabs Bar (No Ugly Scrollbars) */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 text-xs font-bold">
        {[
          { key: "rentroll" as const, label: "Rent Roll Master", icon: FileText },
          { key: "invoices" as const, label: "Monthly Invoices", icon: DollarSign },
          { key: "collections" as const, label: "Collections", icon: CheckCircle },
          { key: "aging" as const, label: "Outstanding & Aging", icon: AlertTriangle },
          { key: "escalations" as const, label: "Escalations", icon: TrendingUp },
          { key: "pnl" as const, label: "P&L Summary", icon: Building },
          { key: "tenants" as const, label: "Tenant Directory", icon: User },
          { key: "dictionary" as const, label: "Field Dictionary", icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
              }`}
            >
              <Icon size={13} className={isActive ? "text-[#0F8B7D]" : "text-gray-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Structured Master Rent Roll */}
      {activeTab === "rentroll" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200/80">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tenant name, building, or Lease ID..."
                className="w-full text-xs bg-transparent border-none outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">CAMPUS:</span>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 text-xs focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="All">All Properties (3 Buildings)</option>
                <option value="One BKC">One BKC (Apex Tower)</option>
                <option value="Maker Maxity">Maker Maxity Mumbai</option>
                <option value="Godrej BKC">Godrej BKC Horizon</option>
              </select>
            </div>
          </div>

          {/* Structured Financial Table: Mobile Cards for <md, Wide Grid for >=md */}
          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-2xs">
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-12 bg-gray-50/80 p-3 px-4 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left items-center">
                  <div className="col-span-1">LEASE ID</div>
                  <div className="col-span-2">TENANT &amp; UNIT</div>
                  <div className="col-span-2">BUILDING</div>
                  <div className="col-span-1">AREA</div>
                  <div className="col-span-1">BASE RENT</div>
                  <div className="col-span-1">CAM / MO</div>
                  <div className="col-span-2">GROSS BILLING</div>
                  <div className="col-span-1">ESCALATION</div>
                  <div className="col-span-1 text-right">STATUS</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredData.map((d) => {
                    const isExpanded = expandedLeaseId === d.leaseId;

                    return (
                      <div key={d.leaseId} className="transition-colors">
                        {/* Primary Row */}
                        <div 
                          onClick={() => setExpandedLeaseId(isExpanded ? null : d.leaseId)}
                          className="grid grid-cols-12 p-3.5 px-4 items-center text-xs hover:bg-teal-50/20 transition-colors cursor-pointer group"
                        >
                          <div className="col-span-1 font-mono font-bold text-[#0F8B7D]">{d.leaseId}</div>
                          <div className="col-span-2">
                            <span className="font-bold text-gray-900 block group-hover:text-[#0F8B7D]">{d.tenantName}</span>
                            <span className="text-[10px] text-gray-400">{d.unit}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-700 block truncate">{d.propertyName}</span>
                            <span className="text-[10px] text-gray-400">{d.floor}</span>
                          </div>
                          <div className="col-span-1 font-semibold text-gray-800">{d.areaSqFt.toLocaleString()} sf</div>
                          <div className="col-span-1 font-bold text-gray-900">{d.baseMonthlyRent}</div>
                          <div className="col-span-1 text-gray-600">{d.camMonthly}</div>
                          <div className="col-span-2">
                            <span className="font-black text-gray-900 block">{d.totalMonthlyBilling}</span>
                            <span className="text-[10px] text-teal-700 font-semibold">Incl. 18% GST</span>
                          </div>
                          <div className="col-span-1">
                            <span className="font-semibold text-amber-700 block text-[11px]">{d.nextEscalationDate}</span>
                            <span className="text-[9px] text-gray-400 font-bold">+{d.escalationPct}% Escalation</span>
                          </div>
                          <div className="col-span-1 flex items-center justify-end gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                              d.leaseStatus === "Active" 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}>
                              {d.leaseStatus}
                            </span>
                            {isExpanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                          </div>
                        </div>

                        {/* Structured Drilldown Card */}
                        {isExpanded && (
                          <div className="p-5 px-6 bg-gray-50/70 border-t border-gray-100 space-y-4 animate-in fade-in duration-150">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">LEASE PERIOD &amp; LOCK-IN</span>
                                <p className="font-bold text-gray-900">Lease: {d.leaseStart} → {d.leaseEnd}</p>
                                <p className="font-bold text-teal-700">Lock-in: {d.lockInEnd}</p>
                                <p className="text-[10px] text-gray-400">Notice Period: {d.noticePeriodDays} Days</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">SECURITY DEPOSITS HELD</span>
                                <p className="font-bold text-gray-900">Required: {d.depositRequired}</p>
                                <p className="font-black text-emerald-700">Received: {d.depositReceived}</p>
                                <p className="text-[10px] text-gray-400">6 Months Interest-Free Escrow</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">TAX &amp; RECONCILIATION</span>
                                <p className="font-bold text-gray-900">Base GST (18%): {d.gstAmount}</p>
                                <p className="font-bold text-gray-900">CAM Rate: ₹{d.camPsf}/sq.ft.</p>
                                <p className="text-[10px] text-gray-400">Monthly Utility: {d.utilityMonthly}</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">PAYMENT AUDIT STATUS</span>
                                  <p className={`font-black text-xs mt-0.5 ${d.outstanding === "₹0" ? "text-emerald-700" : "text-amber-700"}`}>
                                    {d.outstanding === "₹0" ? "✅ Fully Paid · Zero Dues" : `⚠ Outstanding: ${d.outstanding}`}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); showToast(`Generated formal invoice pack for ${d.tenantName}!`); }}
                                  className="w-full py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-[10px] shadow-2xs transition-all cursor-pointer text-center"
                                >
                                  Download Invoice Pack
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Dedicated Tenancy Cards (< md) */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredData.map((d) => {
                const isExpanded = expandedLeaseId === d.leaseId;

                return (
                  <div key={d.leaseId} className="p-4 space-y-3">
                    <div 
                      onClick={() => setExpandedLeaseId(isExpanded ? null : d.leaseId)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#0F8B7D]">{d.leaseId}</span>
                          <h3 className="text-sm font-bold text-gray-900 leading-snug">{d.tenantName}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">{d.propertyName} · {d.unit}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 ${
                          d.leaseStatus === "Active" 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {d.leaseStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-xl mt-3 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">AREA</span>
                          <span className="font-bold text-gray-800">{d.areaSqFt.toLocaleString()} sq.ft.</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">TOTAL MONTHLY</span>
                          <span className="font-black text-gray-900">{d.totalMonthlyBilling}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">BASE RENT</span>
                          <span className="font-semibold text-gray-700">{d.baseMonthlyRent}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 block uppercase">NEXT ESCALATION</span>
                          <span className="font-semibold text-amber-700">{d.nextEscalationDate} (+{d.escalationPct}%)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs font-bold text-[#0F8B7D]">
                        <span>{isExpanded ? "Hide Details" : "View Lease & Audit"}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    {/* Mobile Expanded Detail Box */}
                    {isExpanded && (
                      <div className="p-3.5 bg-gray-50/90 rounded-xl space-y-3 text-xs border border-gray-200/80 animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">LEASE &amp; LOCK-IN</span>
                          <p className="font-bold text-gray-800">Lease: {d.leaseStart} → {d.leaseEnd}</p>
                          <p className="text-teal-700 font-bold">Lock-in: {d.lockInEnd}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">DEPOSITS &amp; CAM</span>
                          <p className="font-bold text-gray-800">Deposit: {d.depositReceived}</p>
                          <p className="text-gray-600">CAM: {d.camMonthly} (₹{d.camPsf}/sf)</p>
                          <p className="text-gray-600">GST (18%): {d.gstAmount}</p>
                        </div>

                        <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                          <p className={`font-black text-xs ${d.outstanding === "₹0" ? "text-emerald-700" : "text-amber-700"}`}>
                            {d.outstanding === "₹0" ? "✅ Fully Paid · Zero Dues" : `⚠ Outstanding: ${d.outstanding}`}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); showToast(`Generated formal invoice pack for ${d.tenantName}!`); }}
                            className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs shadow-xs transition-all cursor-pointer text-center"
                          >
                            Download Invoice Pack
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-gray-900">Monthly GST Commercial Invoices</h3>
              <p className="text-xs text-gray-400 mt-0.5">Automated GST compliance invoices generated on 1st of every calendar month</p>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">INVOICE NO</th>
                  <th className="p-3">TENANT</th>
                  <th className="p-3">BILLING MONTH</th>
                  <th className="p-3">RENT AMOUNT</th>
                  <th className="p-3">CAM RECOVERY</th>
                  <th className="p-3">GST (18%)</th>
                  <th className="p-3">TOTAL</th>
                  <th className="p-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rentRollData.map((d, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">INV-2026-08{i + 1}</td>
                    <td className="p-3 font-bold text-gray-900">{d.tenantName}</td>
                    <td className="p-3 text-gray-500">August 2026</td>
                    <td className="p-3 font-semibold">{d.baseMonthlyRent}</td>
                    <td className="p-3 text-gray-600">{d.camMonthly}</td>
                    <td className="p-3 font-mono">{d.gstAmount}</td>
                    <td className="p-3 font-black text-gray-900">{d.totalMonthlyBilling}</td>
                    <td className="p-3 text-right"><span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">Issued</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Collections Ledger */}
      {activeTab === "collections" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-gray-900">Collections &amp; Bank Reconciliation Ledger</h3>
              <p className="text-xs text-gray-400 mt-0.5">Real-time payment receipts, RTGS/NEFT UTR references, and automated invoice clearance</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              98.2% Monthly Realization
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">RECEIPT NO</th>
                  <th className="p-3">TENANT</th>
                  <th className="p-3">PAYMENT DATE</th>
                  <th className="p-3">AMOUNT RECEIVED</th>
                  <th className="p-3">PAYMENT MODE</th>
                  <th className="p-3">UTR / REFERENCE</th>
                  <th className="p-3 text-right">RECONCILIATION</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { r: "REC-2026-881", t: "Tata Digital Ltd", d: "02-Aug-2026", a: "₹63,24,800", m: "RTGS / HDFC Bank", utr: "HDFCR520260802008912" },
                  { r: "REC-2026-882", t: "Google India Pvt Ltd", d: "03-Aug-2026", a: "₹84,77,120", m: "Corporate Wire", utr: "CITIN20260803991204" },
                  { r: "REC-2026-883", t: "Wipro Cloud Infra", d: "05-Aug-2026", a: "₹32,17,860", m: "NEFT / ICICI", utr: "ICICN20260805128790" }
                ].map((c, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">{c.r}</td>
                    <td className="p-3 font-bold text-gray-900">{c.t}</td>
                    <td className="p-3 text-gray-500">{c.d}</td>
                    <td className="p-3 font-black text-emerald-700">{c.a}</td>
                    <td className="p-3 text-gray-600">{c.m}</td>
                    <td className="p-3 font-mono text-[10px] text-gray-500">{c.utr}</td>
                    <td className="p-3 text-right"><span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">100% Cleared</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Outstanding & Aging */}
      {activeTab === "aging" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Receivables Aging &amp; Credit Risk Analysis</h3>
            <p className="text-xs text-gray-400 mt-0.5">30-day, 60-day, 90-day overdue buckets with interest penalty calculations</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">TENANT</th>
                  <th className="p-3">CURRENT (0-30D)</th>
                  <th className="p-3">31 - 60 DAYS</th>
                  <th className="p-3">61 - 90 DAYS</th>
                  <th className="p-3">90+ DAYS</th>
                  <th className="p-3">TOTAL OVERDUE</th>
                  <th className="p-3 text-right">CREDIT RISK</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: "Tata Digital Ltd", c: "₹0", d30: "₹0", d60: "₹0", d90: "₹0", tot: "₹0", r: "Low Risk", rColor: "bg-emerald-50 text-emerald-800" },
                  { t: "Google India Pvt Ltd", c: "₹0", d30: "₹0", d60: "₹0", d90: "₹0", tot: "₹0", r: "Low Risk", rColor: "bg-emerald-50 text-emerald-800" },
                  { t: "Deloitte Digital", c: "₹45,07,600", d30: "₹0", d60: "₹0", d90: "₹0", tot: "₹45,07,600", r: "14d Due (Moderate)", rColor: "bg-amber-50 text-amber-800" },
                  { t: "Wipro Cloud Infra", c: "₹0", d30: "₹0", d60: "₹0", d90: "₹0", tot: "₹0", r: "Low Risk", rColor: "bg-emerald-50 text-emerald-800" }
                ].map((ag, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{ag.t}</td>
                    <td className="p-3">{ag.c}</td>
                    <td className="p-3 text-gray-400">{ag.d30}</td>
                    <td className="p-3 text-gray-400">{ag.d60}</td>
                    <td className="p-3 text-gray-400">{ag.d90}</td>
                    <td className="p-3 font-black text-gray-900">{ag.tot}</td>
                    <td className="p-3 text-right"><span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${ag.rColor}`}>{ag.r}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Escalations */}
      {activeTab === "escalations" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Contractual Escalation Index &amp; 30/90 Day Timers</h3>
            <p className="text-xs text-gray-400 mt-0.5">Automated compounding rent revisions with notice period escalation alerts</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">TENANT</th>
                  <th className="p-3">CURRENT BASE RENT</th>
                  <th className="p-3">ESCALATION %</th>
                  <th className="p-3">DUE DATE</th>
                  <th className="p-3">REVISED BASE RENT</th>
                  <th className="p-3">MONTHLY REVENUE GAIN</th>
                  <th className="p-3 text-right">ALERT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rentRollData.map((d, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{d.tenantName}</td>
                    <td className="p-3 font-semibold">{d.baseMonthlyRent}</td>
                    <td className="p-3 font-bold text-teal-700">+{d.escalationPct}% p.a.</td>
                    <td className="p-3 font-semibold text-amber-700">{d.nextEscalationDate}</td>
                    <td className="p-3 font-bold text-gray-900">
                      ₹{(Math.round(parseInt(d.baseMonthlyRent.replace(/[^\d]/g, "")) * (1 + d.escalationPct / 100))).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-black text-emerald-700">
                      +₹{(Math.round(parseInt(d.baseMonthlyRent.replace(/[^\d]/g, "")) * (d.escalationPct / 100))).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right"><span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-bold">Scheduled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: P&L Summary */}
      {activeTab === "pnl" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-gray-900">Property-wise Net Operating Income (NOI) Summary</h3>
              <p className="text-xs text-gray-400 mt-0.5">Gross Lease Revenue, CAM Recovery, Operating Expenses, and Net Operating Margin</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black">
              NOI Margin: 82.4%
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">PROPERTY</th>
                  <th className="p-3">GROSS RENT REVENUE</th>
                  <th className="p-3">CAM REVENUE</th>
                  <th className="p-3">TOTAL REVENUE</th>
                  <th className="p-3">OPERATING COSTS (OPEX)</th>
                  <th className="p-3">NET OPERATING INCOME (NOI)</th>
                  <th className="p-3 text-right">MARGIN %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: "One BKC (Apex Tower)", r: "₹1,08,65,000", c: "₹12,54,000", t: "₹1,21,19,000", o: "₹18,50,000", noi: "₹1,02,69,000", m: "84.7%" },
                  { p: "Maker Maxity Mumbai", r: "₹33,30,000", c: "₹3,70,000", t: "₹37,00,000", o: "₹6,80,000", noi: "₹30,20,000", m: "81.6%" },
                  { p: "Godrej BKC Horizon", r: "₹23,80,000", c: "₹2,52,000", t: "₹26,32,000", o: "₹5,10,000", noi: "₹21,22,000", m: "80.6%" }
                ].map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900 flex items-center gap-1.5">
                      <Building size={13} className="text-[#0F8B7D]" /> {p.p}
                    </td>
                    <td className="p-3 font-semibold">{p.r}</td>
                    <td className="p-3 text-gray-600">{p.c}</td>
                    <td className="p-3 font-bold text-gray-900">{p.t}</td>
                    <td className="p-3 text-red-600 font-semibold">{p.o}</td>
                    <td className="p-3 font-black text-emerald-700">{p.noi}</td>
                    <td className="p-3 text-right"><span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-black">{p.m}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Tenant Directory */}
      {activeTab === "tenants" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Tenant Legal Entity &amp; Compliance Directory</h3>
            <p className="text-xs text-gray-400 mt-0.5">Statutory GSTIN, PAN numbers, registered addresses, and primary corporate contacts</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">TENANT ID</th>
                  <th className="p-3">LEGAL COMPANY NAME</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">PAN</th>
                  <th className="p-3">CONTACT PERSON</th>
                  <th className="p-3">EMAIL &amp; MOBILE</th>
                  <th className="p-3 text-right">KYC STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "TEN-101", n: "Tata Digital Limited", g: "27AAACT2727Q1ZB", pan: "AAACT2727Q", c: "Aditya Verma (Head RE)", e: "aditya.verma@tatadigital.com", m: "+91 98201 44821" },
                  { id: "TEN-102", n: "Google India Private Limited", g: "27AAACG9014M1Z2", pan: "AAACG9014M", c: "Priya Nair (Director Workplace)", e: "pnair@google.com", m: "+91 98190 22391" },
                  { id: "TEN-103", n: "Deloitte Digital India LLP", g: "27AABBD3910F1Z4", pan: "AABBD3910F", c: "Rahul Mehta (Partner RE)", e: "rmehta@deloitte.com", m: "+91 98210 55102" },
                  { id: "TEN-104", n: "Wipro Limited", g: "27AAACW1209K1ZY", pan: "AAACW1209K", c: "Sneha Rao (Admin VP)", e: "sneha.rao@wipro.com", m: "+91 98330 11984" }
                ].map((t, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">{t.id}</td>
                    <td className="p-3 font-black text-gray-900">{t.n}</td>
                    <td className="p-3 font-mono text-gray-700">{t.g}</td>
                    <td className="p-3 font-mono text-gray-700">{t.pan}</td>
                    <td className="p-3 font-semibold text-gray-800">{t.c}</td>
                    <td className="p-3 text-gray-500">
                      <div>{t.e}</div>
                      <div className="text-[10px] text-gray-400">{t.m}</div>
                    </td>
                    <td className="p-3 text-right"><span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">100% Verified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 8: Field Dictionary */}
      {activeTab === "dictionary" && (
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Institutional Field Dictionary &amp; Formula Spec</h3>
            <p className="text-xs text-gray-400 mt-0.5">Reference definitions based on OFFICEX Institutional Specification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: "Base Monthly Rent", def: "Contractual starting monthly rent before escalations. Derived from Area Sq Ft × Base Rent / Sq Ft.", src: "Lease Agreement" },
              { field: "CAM Monthly", def: "Common Area Maintenance charges calculated on chargeable area. Standardized at ₹18–₹22/sqft across BKC Grade A+ assets.", src: "FM Service Ledger" },
              { field: "GST Amount", def: "18% Goods & Services Tax levied on Base Rent + CAM + Utility charges.", src: "Statutory Tax Rule" },
              { field: "Escalation Rate", def: "Annual compounding rent increase (standard 5% p.a., triennial 15%).", src: "Escalation Matrix" },
              { field: "Net Operating Income (NOI)", def: "Gross Monthly Billing minus CAM Operating Expenses, property taxes, and insurance reserves.", src: "Financial MIS" }
            ].map((f) => (
              <div key={f.field} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-xs">{f.field}</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[9px] font-bold">{f.src}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">{f.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
