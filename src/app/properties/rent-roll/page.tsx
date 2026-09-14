"use client";

import React, { useState } from "react";
import { 
  Search, CheckCircle, TrendingUp, DollarSign, Calendar, AlertTriangle, 
  FileText, Download, Building, ShieldCheck, Filter, ArrowUpRight, 
  ChevronDown, ChevronUp, Clock, User, Check, Sparkles, BookOpen, AlertCircle,
  CreditCard, ArrowRight, Wallet, PieChart, Shield, Plus, X, Eye, Printer,
  Receipt, RefreshCw
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

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  property: string;
  billingMonth: string;
  dueDate: string;
  baseRent: string;
  camRecovery: string;
  utilityRecovery: string;
  gstAmount: string;
  totalAmount: string;
  status: "Paid" | "Pending" | "Overdue";
  paidDate?: string;
  paymentMode?: string;
  utr?: string;
  tdsDeducted?: string;
}

interface CollectionReceipt {
  receiptNo: string;
  invoiceNo: string;
  tenant: string;
  paymentDate: string;
  amountReceived: string;
  paymentMode: string;
  utr: string;
  reconciliationStatus: string;
}

export default function RentRollMaster() {
  const [activeTab, setActiveTab] = useState<
    "rentroll" | "invoices" | "collections" | "aging" | "escalations" | "pnl" | "tenants" | "dictionary"
  >("rentroll");
  
  const [selectedProperty, setSelectedProperty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeaseId, setExpandedLeaseId] = useState<string | null>("LEASE-001");
  const [toast, setToast] = useState<string | null>(null);

  // Modals & Drawers
  const [showAddLeaseModal, setShowAddLeaseModal] = useState(false);
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<InvoiceItem | null>(null);
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<InvoiceItem | null>(null);
  const [activeTenantForView, setActiveTenantForView] = useState<any | null>(null);

  // Payment Settlement Form State
  const [paymentMode, setPaymentMode] = useState("RTGS / Corporate NetBanking");
  const [settlementUtr, setSettlementUtr] = useState(`HDFCR52026${Math.floor(100000 + Math.random() * 900000)}`);
  const [tdsPercentage, setTdsPercentage] = useState("10"); // 10% TDS Sec 194-I

  // New Lease Form State
  const [newLease, setNewLease] = useState({
    tenantName: "Morgan Stanley India Securities",
    property: "One BKC (Apex Tower)",
    floor: "Floor 9",
    unit: "Suite 901 (East Wing)",
    areaSqFt: 22000,
    baseRentPsf: 205,
    camPsf: 24,
    leaseStart: "2026-10-01",
    leaseEnd: "2031-09-30",
    lockInEnd: "2029-09-30",
    noticePeriodDays: 90,
    escalationPct: 5,
    depositMonths: 6
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Master Rent Roll Data (Realistic varied rates across Grade-A Campuses)
  const [rentRollData, setRentRollData] = useState<RentRollEntry[]>([
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
      tenantName: "Google Enterprise Services",
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
      baseMonthlyRent: "₹38,85,000",
      baseRentPsf: 210,
      escalationPct: 5,
      nextEscalationDate: "01-Jan-2027",
      currentMonthlyRent: "₹38,85,000",
      camPsf: 25,
      camMonthly: "₹4,62,500",
      utilityMonthly: "₹1,50,000",
      gstAmount: "₹8,09,550",
      totalMonthlyBilling: "₹53,07,050",
      depositRequired: "₹2,33,10,000",
      depositReceived: "₹2,33,10,000",
      outstanding: "₹53,07,050",
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
  ]);

  // Master Invoices State
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "INV-101",
      invoiceNo: "INV-2026-081",
      leaseId: "LEASE-001",
      tenantId: "TEN-101",
      tenantName: "Tata Digital Ltd",
      property: "One BKC (Apex Tower)",
      billingMonth: "August 2026",
      dueDate: "05-Aug-2026",
      baseRent: "₹46,25,000",
      camRecovery: "₹5,50,000",
      utilityRecovery: "₹1,85,000",
      gstAmount: "₹9,64,800",
      totalAmount: "₹63,24,800",
      status: "Paid",
      paidDate: "02-Aug-2026",
      paymentMode: "RTGS / HDFC Bank",
      utr: "HDFCR520260802008912",
      tdsDeducted: "₹4,62,500"
    },
    {
      id: "INV-102",
      invoiceNo: "INV-2026-082",
      leaseId: "LEASE-002",
      tenantId: "TEN-102",
      tenantName: "Google Enterprise Services",
      property: "One BKC (Apex Tower)",
      billingMonth: "August 2026",
      dueDate: "05-Aug-2026",
      baseRent: "₹62,40,000",
      camRecovery: "₹7,04,000",
      utilityRecovery: "₹2,40,000",
      gstAmount: "₹12,93,120",
      totalAmount: "₹84,77,120",
      status: "Paid",
      paidDate: "03-Aug-2026",
      paymentMode: "Corporate Wire / Citibank",
      utr: "CITIN20260803991204",
      tdsDeducted: "₹6,24,000"
    },
    {
      id: "INV-103",
      invoiceNo: "INV-2026-083",
      leaseId: "LEASE-003",
      tenantId: "TEN-103",
      tenantName: "Deloitte Digital",
      property: "Maker Maxity Mumbai",
      billingMonth: "August 2026",
      dueDate: "05-Aug-2026",
      baseRent: "₹38,85,000",
      camRecovery: "₹4,62,500",
      utilityRecovery: "₹1,50,000",
      gstAmount: "₹8,09,550",
      totalAmount: "₹53,07,050",
      status: "Overdue",
      paidDate: undefined,
      paymentMode: undefined,
      utr: undefined
    },
    {
      id: "INV-104",
      invoiceNo: "INV-2026-084",
      leaseId: "LEASE-004",
      tenantId: "TEN-104",
      tenantName: "Wipro Cloud Infra",
      property: "Godrej BKC Horizon",
      billingMonth: "August 2026",
      dueDate: "05-Aug-2026",
      baseRent: "₹23,80,000",
      camRecovery: "₹2,52,000",
      utilityRecovery: "₹95,000",
      gstAmount: "₹4,90,860",
      totalAmount: "₹32,17,860",
      status: "Paid",
      paidDate: "05-Aug-2026",
      paymentMode: "NEFT / ICICI Bank",
      utr: "ICICN20260805128790",
      tdsDeducted: "₹2,38,000"
    }
  ]);

  // Master Collections Receipts State
  const [collections, setCollections] = useState<CollectionReceipt[]>([
    { receiptNo: "REC-2026-881", invoiceNo: "INV-2026-081", tenant: "Tata Digital Ltd", paymentDate: "02-Aug-2026", amountReceived: "₹63,24,800", paymentMode: "RTGS / HDFC Bank", utr: "HDFCR520260802008912", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-882", invoiceNo: "INV-2026-082", tenant: "Google Enterprise Services", paymentDate: "03-Aug-2026", amountReceived: "₹84,77,120", paymentMode: "Corporate Wire", utr: "CITIN20260803991204", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-883", invoiceNo: "INV-2026-084", tenant: "Wipro Cloud Infra", paymentDate: "05-Aug-2026", amountReceived: "₹32,17,860", paymentMode: "NEFT / ICICI", utr: "ICICN20260805128790", reconciliationStatus: "100% Cleared" }
  ]);

  // Handle Payment Settlement (Marks Paid, clears outstanding, creates collection receipt)
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceForPayment) return;

    const invoice = activeInvoiceForPayment;
    const nowStr = "14-Sep-2026";
    const receiptNum = `REC-2026-${Math.floor(884 + Math.random() * 100)}`;

    // 1. Update Invoice status
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return {
          ...inv,
          status: "Paid",
          paidDate: nowStr,
          paymentMode: paymentMode,
          utr: settlementUtr,
          tdsDeducted: `₹${Math.round(parseInt(inv.baseRent.replace(/[^\d]/g, "")) * (parseInt(tdsPercentage) / 100)).toLocaleString("en-IN")}`
        };
      }
      return inv;
    }));

    // 2. Clear outstanding balance in Rent Roll Master
    setRentRollData(prev => prev.map(entry => {
      if (entry.leaseId === invoice.leaseId) {
        return {
          ...entry,
          outstanding: "₹0",
          overdueDays: 0
        };
      }
      return entry;
    }));

    // 3. Add to Collections Ledger
    const newReceipt: CollectionReceipt = {
      receiptNo: receiptNum,
      invoiceNo: invoice.invoiceNo,
      tenant: invoice.tenantName,
      paymentDate: nowStr,
      amountReceived: invoice.totalAmount,
      paymentMode: paymentMode,
      utr: settlementUtr,
      reconciliationStatus: "100% Cleared"
    };
    setCollections([newReceipt, ...collections]);

    showToast(`Payment of ${invoice.totalAmount} recorded for ${invoice.tenantName}! Outstanding cleared to ₹0.`);
    setActiveInvoiceForPayment(null);
  };

  // Handle Add New Lease Submission
  const handleAddNewLease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLease.tenantName.trim()) {
      showToast("Please provide tenant company name.");
      return;
    }

    const baseMonthlyNum = newLease.areaSqFt * newLease.baseRentPsf;
    const camMonthlyNum = newLease.areaSqFt * newLease.camPsf;
    const utilityNum = 175000;
    const taxableTotal = baseMonthlyNum + camMonthlyNum + utilityNum;
    const gstNum = Math.round(taxableTotal * 0.18);
    const grossTotalNum = taxableTotal + gstNum;
    const depositNum = baseMonthlyNum * newLease.depositMonths;

    const leaseIdGen = `LEASE-00${rentRollData.length + 1}`;
    const tenantIdGen = `TEN-10${rentRollData.length + 1}`;

    const newEntry: RentRollEntry = {
      propertyId: newLease.property.includes("One BKC") ? "PROP-001" : newLease.property.includes("Maker") ? "PROP-002" : "PROP-003",
      propertyName: newLease.property,
      floor: newLease.floor,
      unit: newLease.unit,
      tenantId: tenantIdGen,
      tenantName: newLease.tenantName,
      leaseId: leaseIdGen,
      areaSqFt: newLease.areaSqFt,
      leaseStart: newLease.leaseStart,
      leaseEnd: newLease.leaseEnd,
      lockInEnd: newLease.lockInEnd,
      noticePeriodDays: newLease.noticePeriodDays,
      baseMonthlyRent: `₹${baseMonthlyNum.toLocaleString("en-IN")}`,
      baseRentPsf: newLease.baseRentPsf,
      escalationPct: newLease.escalationPct,
      nextEscalationDate: "01-Oct-2027",
      currentMonthlyRent: `₹${baseMonthlyNum.toLocaleString("en-IN")}`,
      camPsf: newLease.camPsf,
      camMonthly: `₹${camMonthlyNum.toLocaleString("en-IN")}`,
      utilityMonthly: `₹${utilityNum.toLocaleString("en-IN")}`,
      gstAmount: `₹${gstNum.toLocaleString("en-IN")}`,
      totalMonthlyBilling: `₹${grossTotalNum.toLocaleString("en-IN")}`,
      depositRequired: `₹${depositNum.toLocaleString("en-IN")}`,
      depositReceived: `₹${depositNum.toLocaleString("en-IN")}`,
      outstanding: "₹0",
      overdueDays: 0,
      expiryAlert: "Normal (5y)",
      escalationAlert: "Scheduled in 12m",
      leaseStatus: "Active"
    };

    setRentRollData([...rentRollData, newEntry]);
    setShowAddLeaseModal(false);
    showToast(`Registered new commercial lease ${leaseIdGen} for ${newLease.tenantName}!`);
  };

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
    link.setAttribute("download", `OFFICEX_Institutional_Rent_Roll_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exported 39-column Institutional Rent Roll Master to CSV!");
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
  const totalOutstanding = rentRollData.reduce((acc, curr) => {
    const num = parseInt(curr.outstanding.replace(/[^\d]/g, "")) || 0;
    return acc + num;
  }, 0);

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-in fade-in duration-200">
          <CheckCircle size={16} className="text-teal-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Institutional Rent Roll Master</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black uppercase tracking-wider">
              Grade-A Landlord Ledger
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time lease contracts, CAM reconciliation, automated escalation index, and live payment settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportWorkbook}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
          >
            <Download size={14} /> Export Rent Roll (.csv)
          </button>
          <button
            onClick={() => setShowAddLeaseModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={14} /> Add Commercial Lease
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL LEASED AREA</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalArea.toLocaleString()} sq.ft.</p>
          <span className="text-[10px] text-emerald-600 font-bold">● 94.6% Occupancy across BKC</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY INVOICED GTV</span>
          <p className="text-2xl font-black text-gray-900 mt-1">₹2.33 Crores</p>
          <span className="text-[10px] text-gray-400">Rent + CAM + Utility + GST</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">MONTHLY CAM RECOVERY</span>
          <p className="text-2xl font-black text-teal-700 mt-1">₹19.68 Lakhs</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Cost Recovery</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL OUTSTANDING DUES</span>
          <p className={`text-2xl font-black mt-1 ${totalOutstanding === 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {totalOutstanding === 0 ? "₹0 (Zero Dues)" : `₹${totalOutstanding.toLocaleString("en-IN")}`}
          </p>
          <span className="text-[10px] font-bold text-teal-700">
            {totalOutstanding === 0 ? "100% Collected" : "1 Invoice Pending Collection"}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 text-xs font-bold">
        {[
          { key: "rentroll" as const, label: "Rent Roll Master", icon: FileText },
          { key: "invoices" as const, label: "Monthly Invoices", icon: DollarSign },
          { key: "collections" as const, label: "Collections Ledger", icon: CheckCircle },
          { key: "aging" as const, label: "Receivables Aging", icon: AlertTriangle },
          { key: "escalations" as const, label: "Escalations Index", icon: TrendingUp },
          { key: "pnl" as const, label: "NOI & P&L", icon: Building },
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

      {/* ========================================================================= */}
      {/* TAB 1: MASTER RENT ROLL TABLE */}
      {/* ========================================================================= */}
      {activeTab === "rentroll" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant name, building, or Lease ID..."
                className="w-full text-xs bg-transparent border-none outline-none text-gray-800"
              />
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">CAMPUS:</span>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 text-xs focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="All">All Properties (3 Campuses)</option>
                <option value="One BKC">One BKC (Apex Tower)</option>
                <option value="Maker Maxity">Maker Maxity Mumbai</option>
                <option value="Godrej BKC">Godrej BKC Horizon</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[1020px]">
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
                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">LEASE PERIOD &amp; LOCK-IN</span>
                                <p className="font-bold text-gray-900">Lease: {d.leaseStart} → {d.leaseEnd}</p>
                                <p className="font-bold text-teal-700">Lock-in: {d.lockInEnd}</p>
                                <p className="text-[10px] text-gray-400">Notice Period: {d.noticePeriodDays} Days</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">SECURITY DEPOSITS HELD</span>
                                <p className="font-bold text-gray-900">Required: {d.depositRequired}</p>
                                <p className="font-black text-emerald-700">Received: {d.depositReceived}</p>
                                <p className="text-[10px] text-gray-400">6 Months Interest-Free Escrow</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">TAX &amp; RECONCILIATION</span>
                                <p className="font-bold text-gray-900">Base GST (18%): {d.gstAmount}</p>
                                <p className="font-bold text-gray-900">CAM Rate: ₹{d.camPsf}/sq.ft.</p>
                                <p className="text-[10px] text-gray-400">Monthly Utility: {d.utilityMonthly}</p>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">PAYMENT AUDIT STATUS</span>
                                  <p className={`font-black text-xs mt-0.5 ${d.outstanding === "₹0" ? "text-emerald-700" : "text-amber-700"}`}>
                                    {d.outstanding === "₹0" ? "✅ Fully Paid · Zero Dues" : `⚠ Outstanding: ${d.outstanding}`}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const inv = invoices.find(i => i.leaseId === d.leaseId);
                                      if (inv) {
                                        setActiveInvoiceForView(inv);
                                      } else {
                                        showToast(`Invoice generated for ${d.tenantName}`);
                                      }
                                    }}
                                    className="w-full py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-[10px] shadow-2xs transition-all cursor-pointer text-center"
                                  >
                                    View Invoice
                                  </button>
                                  {d.outstanding !== "₹0" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const pendingInv = invoices.find(i => i.leaseId === d.leaseId && i.status !== "Paid");
                                        if (pendingInv) setActiveInvoiceForPayment(pendingInv);
                                      }}
                                      className="w-full py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-[10px] shadow-2xs transition-all cursor-pointer text-center"
                                    >
                                      Settle Dues
                                    </button>
                                  )}
                                </div>
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredData.map((d) => (
                <div key={d.leaseId} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#0F8B7D]">{d.leaseId}</span>
                      <h3 className="font-bold text-gray-900 text-sm">{d.tenantName}</h3>
                      <p className="text-xs text-gray-500">{d.propertyName} · {d.unit}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                      {d.leaseStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold">AREA</span>
                      <span className="font-bold text-gray-800">{d.areaSqFt.toLocaleString()} sq.ft.</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold">TOTAL BILLING</span>
                      <span className="font-black text-gray-900">{d.totalMonthlyBilling}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY INVOICES (Interactive Payments & Status Update) */}
      {/* ========================================================================= */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900">Commercial GST Invoices</h3>
              <p className="text-xs text-gray-400 mt-0.5">Automated tax invoices with live collection tracking &amp; instant settlement</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {invoices.filter(i => i.status === "Paid").length} of {invoices.length} Settled
              </span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">INVOICE NO</th>
                  <th className="p-3">TENANT &amp; PROPERTY</th>
                  <th className="p-3">BILLING MONTH</th>
                  <th className="p-3">BASE RENT</th>
                  <th className="p-3">CAM RECOVERY</th>
                  <th className="p-3">GST (18%)</th>
                  <th className="p-3">TOTAL GROSS</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">{inv.invoiceNo}</td>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block">{inv.tenantName}</span>
                      <span className="text-[10px] text-gray-400">{inv.property}</span>
                    </td>
                    <td className="p-3 text-gray-600">{inv.billingMonth}</td>
                    <td className="p-3 font-semibold">{inv.baseRent}</td>
                    <td className="p-3 text-gray-600">{inv.camRecovery}</td>
                    <td className="p-3 font-mono text-gray-700">{inv.gstAmount}</td>
                    <td className="p-3 font-black text-gray-900">{inv.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : inv.status === "Overdue"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        ● {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveInvoiceForView(inv)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} /> View Tax Invoice
                        </button>

                        {inv.status !== "Paid" && (
                          <button
                            onClick={() => setActiveInvoiceForPayment(inv)}
                            className="px-3 py-1 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <CreditCard size={12} /> Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COLLECTIONS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === "collections" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-gray-900">Collections &amp; Real-Time Reconciliation</h3>
              <p className="text-xs text-gray-400 mt-0.5">Automated bank UTR references, RTGS payment matching, and clearance status</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {collections.length} Cleared Transactions
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">RECEIPT NO</th>
                  <th className="p-3">INVOICE NO</th>
                  <th className="p-3">TENANT</th>
                  <th className="p-3">PAYMENT DATE</th>
                  <th className="p-3">AMOUNT RECEIVED</th>
                  <th className="p-3">PAYMENT MODE</th>
                  <th className="p-3">UTR / BANK REFERENCE</th>
                  <th className="p-3 text-right">RECONCILIATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collections.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">{c.receiptNo}</td>
                    <td className="p-3 font-mono text-gray-600">{c.invoiceNo}</td>
                    <td className="p-3 font-bold text-gray-900">{c.tenant}</td>
                    <td className="p-3 text-gray-500">{c.paymentDate}</td>
                    <td className="p-3 font-black text-emerald-700">{c.amountReceived}</td>
                    <td className="p-3 text-gray-600">{c.paymentMode}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-700">{c.utr}</td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        {c.reconciliationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RECEIVABLES AGING */}
      {/* ========================================================================= */}
      {activeTab === "aging" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Receivables Aging &amp; Overdue Risk Matrix</h3>
            <p className="text-xs text-gray-400 mt-0.5">30-day, 60-day, 90-day overdue buckets with live reconciliation link</p>
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
              <tbody className="divide-y divide-gray-100">
                {rentRollData.map((d, i) => {
                  const hasOverdue = d.outstanding !== "₹0";

                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{d.tenantName}</td>
                      <td className="p-3">{hasOverdue ? d.outstanding : "₹0"}</td>
                      <td className="p-3 text-gray-400">₹0</td>
                      <td className="p-3 text-gray-400">₹0</td>
                      <td className="p-3 text-gray-400">₹0</td>
                      <td className={`p-3 font-black ${hasOverdue ? "text-amber-600" : "text-gray-900"}`}>{d.outstanding}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          hasOverdue ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {hasOverdue ? `${d.overdueDays}d Due (Moderate)` : "Low Risk (Nil Dues)"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ESCALATIONS INDEX */}
      {/* ========================================================================= */}
      {activeTab === "escalations" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Contractual Escalation Index &amp; Revenue Projection</h3>
            <p className="text-xs text-gray-400 mt-0.5">Automated compounding rent revisions with notice period escalation triggers</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                  <th className="p-3">TENANT</th>
                  <th className="p-3">CURRENT BASE RENT</th>
                  <th className="p-3">ESCALATION %</th>
                  <th className="p-3">NEXT REVISION DATE</th>
                  <th className="p-3">REVISED BASE RENT</th>
                  <th className="p-3">ANNUAL REVENUE GAIN</th>
                  <th className="p-3 text-right">ALERT STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rentRollData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{d.tenantName}</td>
                    <td className="p-3 font-semibold">{d.baseMonthlyRent}</td>
                    <td className="p-3 font-bold text-teal-700">+{d.escalationPct}% p.a.</td>
                    <td className="p-3 font-semibold text-amber-700">{d.nextEscalationDate}</td>
                    <td className="p-3 font-bold text-gray-900">
                      ₹{(Math.round(parseInt(d.baseMonthlyRent.replace(/[^\d]/g, "")) * (1 + d.escalationPct / 100))).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-black text-emerald-700">
                      +₹{(Math.round(parseInt(d.baseMonthlyRent.replace(/[^\d]/g, "")) * (d.escalationPct / 100) * 12)).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-bold">
                        Scheduled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: P&L SUMMARY */}
      {activeTab === "pnl" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-gray-900">Property-wise Net Operating Income (NOI)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Gross Lease Revenue, CAM Recovery, Operating Expenses, and Net Margin</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black">
              NOI Margin: 83.1%
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
              <tbody className="divide-y divide-gray-100">
                {[
                  { p: "One BKC (Apex Tower)", r: "₹1,08,65,000", c: "₹12,54,000", t: "₹1,21,19,000", o: "₹18,50,000", noi: "₹1,02,69,000", m: "84.7%" },
                  { p: "Maker Maxity Mumbai", r: "₹38,85,000", c: "₹4,62,500", t: "₹43,47,500", o: "₹7,20,000", noi: "₹36,27,500", m: "83.4%" },
                  { p: "Godrej BKC Horizon", r: "₹23,80,000", c: "₹2,52,000", t: "₹26,32,000", o: "₹5,10,000", noi: "₹21,22,000", m: "80.6%" }
                ].map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
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

      {/* ========================================================================= */}
      {/* TAB 7: TENANT DIRECTORY */}
      {activeTab === "tenants" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Tenant Legal Entity &amp; Compliance Directory</h3>
            <p className="text-xs text-gray-400 mt-0.5">Statutory GSTIN, PAN, corporate contacts, and security deposit escrow</p>
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
              <tbody className="divide-y divide-gray-100">
                {[
                  { id: "TEN-101", n: "Tata Digital Limited", g: "27AAACT2727Q1ZB", pan: "AAACT2727Q", c: "Aditya Verma (Head RE)", e: "aditya.verma@tatadigital.com", m: "+91 98201 44821" },
                  { id: "TEN-102", n: "Google Enterprise Solutions Ltd", g: "27AAACG9014M1Z2", pan: "AAACG9014M", c: "Priya Nair (Director Workplace)", e: "pnair@google.com", m: "+91 98190 22391" },
                  { id: "TEN-103", n: "Deloitte Digital Enterprise LLP", g: "27AABBD3910F1Z4", pan: "AABBD3910F", c: "Rahul Mehta (Partner RE)", e: "rmehta@deloitte.com", m: "+91 98210 55102" },
                  { id: "TEN-104", n: "Wipro Limited", g: "27AAACW1209K1ZY", pan: "AAACW1209K", c: "Sneha Rao (Admin VP)", e: "sneha.rao@wipro.com", m: "+91 98330 11984" }
                ].map((t, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setActiveTenantForView(t)}
                    className="hover:bg-teal-50/20 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-[#0F8B7D]">{t.id}</td>
                    <td className="p-3 font-black text-gray-900">{t.n}</td>
                    <td className="p-3 font-mono text-gray-700">{t.g}</td>
                    <td className="p-3 font-mono text-gray-700">{t.pan}</td>
                    <td className="p-3 font-semibold text-gray-800">{t.c}</td>
                    <td className="p-3 text-gray-500">
                      <div>{t.e}</div>
                      <div className="text-[10px] text-gray-400">{t.m}</div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        100% Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: FIELD DICTIONARY */}
      {activeTab === "dictionary" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-black text-gray-900">Institutional Field Dictionary &amp; Formula Spec</h3>
            <p className="text-xs text-gray-400 mt-0.5">Reference formulas based on OFFICEX Institutional Specification</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: "Base Monthly Rent", def: "Contractual starting monthly rent before escalations. Derived from Area Sq Ft × Base Rent / Sq Ft.", src: "Lease Agreement" },
              { field: "CAM Monthly", def: "Common Area Maintenance charges calculated on chargeable area. Standardized at ₹18–₹25/sqft across BKC Grade A+ assets.", src: "FM Service Ledger" },
              { field: "GST Amount", def: "18% Goods & Services Tax levied on Base Rent + CAM + Utility charges under SAC 997212.", src: "Statutory Tax Rule" },
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

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD PAYMENT & SETTLEMENT MODAL (NO RAZORPAY NEEDED) */}
      {/* ========================================================================= */}
      {activeInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-teal-300" />
                <h3 className="font-bold text-sm">Record Commercial Rent Payment</h3>
              </div>
              <button
                onClick={() => setActiveInvoiceForPayment(null)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="p-6 space-y-4 text-xs">
              <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">INVOICE NUMBER</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{activeInvoiceForPayment.invoiceNo}</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">{activeInvoiceForPayment.tenantName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">BILLING AMOUNT</span>
                  <span className="font-black text-emerald-700 text-base">{activeInvoiceForPayment.totalAmount}</span>
                  <p className="text-[10px] text-gray-400">Due: {activeInvoiceForPayment.dueDate}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  PAYMENT CHANNEL / MODE
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="RTGS / Corporate NetBanking">RTGS / Corporate NetBanking (Direct Landlord Escrow)</option>
                  <option value="NEFT Corporate Transfer">NEFT Corporate Transfer</option>
                  <option value="Corporate Wire (Citibank/HSBC)">Corporate Wire (Citibank / HSBC Overseas Transfer)</option>
                  <option value="Escrow Auto-Debit Instruction">Escrow Standing Auto-Debit Instruction</option>
                  <option value="Demand Draft / Banker's Cheque">Demand Draft / Banker&apos;s Cheque</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    BANK UTR / TRANSACTION REF #
                  </label>
                  <input
                    required
                    value={settlementUtr}
                    onChange={(e) => setSettlementUtr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    TDS DEDUCTION (SEC 194-I)
                  </label>
                  <select
                    value={tdsPercentage}
                    onChange={(e) => setTdsPercentage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="10">10% Statutory TDS (₹{Math.round(parseInt(activeInvoiceForPayment.baseRent.replace(/[^\d]/g, "")) * 0.1).toLocaleString("en-IN")})</option>
                    <option value="2">2% Plant/Machinery TDS</option>
                    <option value="0">0% (Nil TDS Certificate Uploaded)</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Gross Invoice Total:</span>
                  <span className="font-bold text-gray-900">{activeInvoiceForPayment.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>TDS Deducted by Tenant:</span>
                  <span className="font-bold text-amber-700">
                    -₹{Math.round(parseInt(activeInvoiceForPayment.baseRent.replace(/[^\d]/g, "")) * (parseInt(tdsPercentage) / 100)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-gray-900">
                  <span>Net Escrow Credit:</span>
                  <span className="font-black text-emerald-700">
                    ₹{(parseInt(activeInvoiceForPayment.totalAmount.replace(/[^\d]/g, "")) - Math.round(parseInt(activeInvoiceForPayment.baseRent.replace(/[^\d]/g, "")) * (parseInt(tdsPercentage) / 100))).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceForPayment(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Confirm &amp; Settle Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW FORMAL GST TAX INVOICE */}
      {/* ========================================================================= */}
      {activeInvoiceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-teal-300" />
                <h3 className="font-bold text-sm">Commercial GST Tax Invoice · SAC 997212</h3>
              </div>
              <button
                onClick={() => setActiveInvoiceForView(null)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {/* Invoice Header */}
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">OFFICEX REAL ESTATE ASSET SPV</h2>
                  <p className="text-gray-500 text-[11px]">Apex Commercial Tower, Bandra Kurla Complex, Mumbai 400051</p>
                  <p className="font-mono text-[10px] text-gray-600 mt-1">GSTIN: 27AAAC09912K1Z9 | PAN: AAAC09912K</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-widest block">TAX INVOICE</span>
                  <p className="font-mono text-sm font-black text-gray-900">{activeInvoiceForView.invoiceNo}</p>
                  <p className="text-[11px] text-gray-500">Date: {activeInvoiceForView.dueDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">BILLED TO (TENANT):</span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{activeInvoiceForView.tenantName}</p>
                  <p className="text-gray-600">{activeInvoiceForView.property}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">LEASE REFERENCE:</span>
                  <span className="font-mono font-bold text-teal-700">{activeInvoiceForView.leaseId}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Billing Month: {activeInvoiceForView.billingMonth}</p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                  <tr className="border-b border-gray-200">
                    <th className="p-3">ITEM DESCRIPTION</th>
                    <th className="p-3">SAC CODE</th>
                    <th className="p-3 text-right">TAXABLE VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block">Commercial Office Base Rent</span>
                      <span className="text-[10px] text-gray-400">Monthly contract lease rate</span>
                    </td>
                    <td className="p-3 font-mono">997212</td>
                    <td className="p-3 text-right font-semibold">{activeInvoiceForView.baseRent}</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block">Common Area Maintenance (CAM)</span>
                      <span className="text-[10px] text-gray-400">Operation &amp; security recovery</span>
                    </td>
                    <td className="p-3 font-mono">997212</td>
                    <td className="p-3 text-right font-semibold">{activeInvoiceForView.camRecovery}</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block">Utility &amp; Power Sub-station Recovery</span>
                    </td>
                    <td className="p-3 font-mono">997212</td>
                    <td className="p-3 text-right font-semibold">{activeInvoiceForView.utilityRecovery}</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td colSpan={2} className="p-3 text-right font-bold text-gray-600">CGST (9%) + SGST (9%):</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">{activeInvoiceForView.gstAmount}</td>
                  </tr>
                  <tr className="bg-teal-50/50 border-t-2 border-teal-200">
                    <td colSpan={2} className="p-3 text-right font-black text-gray-900 text-sm">TOTAL AMOUNT PAYABLE:</td>
                    <td className="p-3 text-right font-black text-emerald-700 text-base">{activeInvoiceForView.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Details if Paid */}
              {activeInvoiceForView.status === "Paid" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">PAID &amp; RECONCILED</span>
                    <span>Paid on {activeInvoiceForView.paidDate} via {activeInvoiceForView.paymentMode}</span>
                  </div>
                  <span className="font-mono font-bold text-xs">{activeInvoiceForView.utr}</span>
                </div>
              )}
            </div>

              <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
                <button
                  onClick={() => setActiveInvoiceForView(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white cursor-pointer"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast(`Printing Tax Invoice ${activeInvoiceForView.invoiceNo}...`)}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} /> Print Invoice
                  </button>
                  <button
                    onClick={() => showToast(`Downloaded PDF Tax Invoice ${activeInvoiceForView.invoiceNo}`)}
                    className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD NEW COMMERCIAL LEASE */}
      {/* ========================================================================= */}
      {showAddLeaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-teal-300" />
                <h3 className="font-bold text-sm">Register New Commercial Tenancy</h3>
              </div>
              <button
                onClick={() => setShowAddLeaseModal(false)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewLease} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  TENANT LEGAL ENTITY NAME *
                </label>
                <input
                  required
                  value={newLease.tenantName}
                  onChange={(e) => setNewLease({ ...newLease, tenantName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    CAMPUS / PROPERTY
                  </label>
                  <select
                    value={newLease.property}
                    onChange={(e) => setNewLease({ ...newLease, property: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                  >
                    <option value="One BKC (Apex Tower)">One BKC (Apex Tower)</option>
                    <option value="Maker Maxity Mumbai">Maker Maxity Mumbai</option>
                    <option value="Godrej BKC Horizon">Godrej BKC Horizon</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    UNIT / FLOOR
                  </label>
                  <input
                    value={newLease.unit}
                    onChange={(e) => setNewLease({ ...newLease, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    AREA (SQ.FT.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newLease.areaSqFt}
                    onChange={(e) => setNewLease({ ...newLease, areaSqFt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    BASE RENT (₹/SF)
                  </label>
                  <input
                    type="number"
                    value={newLease.baseRentPsf}
                    onChange={(e) => setNewLease({ ...newLease, baseRentPsf: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    CAM RATE (₹/SF)
                  </label>
                  <input
                    type="number"
                    value={newLease.camPsf}
                    onChange={(e) => setNewLease({ ...newLease, camPsf: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    LEASE START DATE
                  </label>
                  <input
                    type="date"
                    value={newLease.leaseStart}
                    onChange={(e) => setNewLease({ ...newLease, leaseStart: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    LOCK-IN END DATE
                  </label>
                  <input
                    type="date"
                    value={newLease.lockInEnd}
                    onChange={(e) => setNewLease({ ...newLease, lockInEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              {/* Dynamic Auto-computed summary preview */}
              <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Computed Base Rent:</span>
                  <span className="font-bold text-gray-900">₹{(newLease.areaSqFt * newLease.baseRentPsf).toLocaleString("en-IN")} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Computed CAM Recovery:</span>
                  <span className="font-bold text-gray-900">₹{(newLease.areaSqFt * newLease.camPsf).toLocaleString("en-IN")} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Monthly Total (Incl. GST):</span>
                  <span className="font-black text-teal-800">
                    ₹{Math.round(((newLease.areaSqFt * newLease.baseRentPsf) + (newLease.areaSqFt * newLease.camPsf) + 175000) * 1.18).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddLeaseModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Register Lease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 4: TENANT DOSSIER DRAWER */}
      {/* ========================================================================= */}
      {activeTenantForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto p-6 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeTenantForView.id}</span>
                    <h2 className="text-base font-black text-gray-900">{activeTenantForView.n}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTenantForView(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">CORPORATE GSTIN</span>
                    <span className="font-mono font-bold text-gray-800">{activeTenantForView.g}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">PERMANENT ACCT # (PAN)</span>
                    <span className="font-mono font-bold text-gray-800">{activeTenantForView.pan}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                  <span className="text-gray-400 text-[10px] font-bold uppercase block">PRIMARY LEASE OFFICER</span>
                  <p className="font-bold text-gray-900">{activeTenantForView.c}</p>
                  <p className="text-gray-600">{activeTenantForView.e}</p>
                  <p className="text-gray-600">{activeTenantForView.m}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setActiveTenantForView(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Sent monthly ledger statement to ${activeTenantForView.e}`);
                  setActiveTenantForView(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Email Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
