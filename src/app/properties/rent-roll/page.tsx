"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function RentRollMasterContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<
    "rentroll" | "invoices" | "collections" | "aging" | "escalations" | "pnl" | "tenants" | "dictionary"
  >("rentroll");

  useEffect(() => {
    if (
      tabParam &&
      ["rentroll", "invoices", "collections", "aging", "escalations", "pnl", "tenants", "dictionary"].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Sync user leases & clean mode for new accounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("officex_mode");
      const email = localStorage.getItem("officex_user_email") || "";
      const savedLeases = localStorage.getItem("officex_user_leases");

      if (savedLeases) {
        try {
          setRentRollData(JSON.parse(savedLeases));
        } catch {
          setRentRollData([]);
        }
      } else if (mode === "clean_test" || (email && !email.includes("demo.seed"))) {
        setRentRollData([]);
      }
    }
  }, []);
  
  const [selectedProperty, setSelectedProperty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLeaseId, setExpandedLeaseId] = useState<string | null>(null);
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

  // Master Rent Roll Data
  const [rentRollData, setRentRollData] = useState<RentRollEntry[]>([
    // ──── One BKC (Apex Tower), Mumbai — BKC Premium ₹240–₹285 PSF ────
    {
      propertyId: "PROP-001", propertyName: "One BKC (Apex Tower)", floor: "Floor 4", unit: "Suite 401 (North Wing)",
      tenantId: "TEN-101", tenantName: "Tata Digital Ltd", leaseId: "LEASE-001",
      areaSqFt: 25000, leaseStart: "01-Sep-2024", leaseEnd: "31-Aug-2029", lockInEnd: "31-Aug-2027",
      noticePeriodDays: 90, baseMonthlyRent: "₹60,00,000", baseRentPsf: 240, escalationPct: 5,
      nextEscalationDate: "01-Sep-2026", currentMonthlyRent: "₹60,00,000",
      camPsf: 24, camMonthly: "₹6,00,000", utilityMonthly: "₹2,10,000",
      gstAmount: "₹12,25,800", totalMonthlyBilling: "₹80,35,800",
      depositRequired: "₹3,60,00,000", depositReceived: "₹3,60,00,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (3y+)", escalationAlert: "Due in 365d", leaseStatus: "Active"
    },
    {
      propertyId: "PROP-001", propertyName: "One BKC (Apex Tower)", floor: "Floor 8", unit: "Entire Horizon Plate",
      tenantId: "TEN-102", tenantName: "Google Enterprise Services", leaseId: "LEASE-002",
      areaSqFt: 32000, leaseStart: "15-Oct-2024", leaseEnd: "14-Oct-2030", lockInEnd: "14-Oct-2028",
      noticePeriodDays: 120, baseMonthlyRent: "₹91,20,000", baseRentPsf: 285, escalationPct: 5,
      nextEscalationDate: "15-Oct-2026", currentMonthlyRent: "₹91,20,000",
      camPsf: 24, camMonthly: "₹7,68,000", utilityMonthly: "₹2,85,000",
      gstAmount: "₹18,31,140", totalMonthlyBilling: "₹1,20,04,140",
      depositRequired: "₹5,47,20,000", depositReceived: "₹5,47,20,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (4y+)", escalationAlert: "Due in 14 mos", leaseStatus: "Active"
    },
    // ──── Maker Maxity, BKC Mumbai — ₹210–₹250 PSF ────
    {
      propertyId: "PROP-002", propertyName: "Maker Maxity Mumbai", floor: "Floor 5", unit: "Suite 501",
      tenantId: "TEN-103", tenantName: "Deloitte Digital", leaseId: "LEASE-003",
      areaSqFt: 18500, leaseStart: "01-Jan-2024", leaseEnd: "31-Dec-2028", lockInEnd: "31-Dec-2026",
      noticePeriodDays: 90, baseMonthlyRent: "₹46,25,000", baseRentPsf: 250, escalationPct: 5,
      nextEscalationDate: "01-Jan-2027", currentMonthlyRent: "₹46,25,000",
      camPsf: 22, camMonthly: "₹4,07,000", utilityMonthly: "₹1,55,000",
      gstAmount: "₹9,33,660", totalMonthlyBilling: "₹61,20,660",
      depositRequired: "₹2,77,50,000", depositReceived: "₹2,77,50,000",
      outstanding: "₹61,20,660", overdueDays: 38, expiryAlert: "Normal (2y+)", escalationAlert: "Scheduled", leaseStatus: "Active"
    },
    {
      propertyId: "PROP-002", propertyName: "Maker Maxity Mumbai", floor: "Floor 11", unit: "Suite 1101 (West Wing)",
      tenantId: "TEN-106", tenantName: "McKinsey & Company", leaseId: "LEASE-006",
      areaSqFt: 14000, leaseStart: "01-Apr-2025", leaseEnd: "31-Mar-2030", lockInEnd: "31-Mar-2028",
      noticePeriodDays: 120, baseMonthlyRent: "₹29,40,000", baseRentPsf: 210, escalationPct: 7,
      nextEscalationDate: "01-Apr-2027", currentMonthlyRent: "₹29,40,000",
      camPsf: 22, camMonthly: "₹3,08,000", utilityMonthly: "₹1,10,000",
      gstAmount: "₹6,04,440", totalMonthlyBilling: "₹39,62,440",
      depositRequired: "₹1,76,40,000", depositReceived: "₹1,76,40,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (4y+)", escalationAlert: "Due in 19 mos", leaseStatus: "Active"
    },
    // ──── Godrej BKC Horizon, Mumbai — ₹195–₹220 PSF ────
    {
      propertyId: "PROP-003", propertyName: "Godrej BKC Horizon", floor: "Floor 6", unit: "Suite 602",
      tenantId: "TEN-104", tenantName: "Wipro Cloud Infra", leaseId: "LEASE-004",
      areaSqFt: 14000, leaseStart: "15-Feb-2023", leaseEnd: "14-Feb-2027", lockInEnd: "14-Feb-2025",
      noticePeriodDays: 90, baseMonthlyRent: "₹27,30,000", baseRentPsf: 195, escalationPct: 7,
      nextEscalationDate: "15-Feb-2026", currentMonthlyRent: "₹27,30,000",
      camPsf: 20, camMonthly: "₹2,80,000", utilityMonthly: "₹95,000",
      gstAmount: "₹5,58,900", totalMonthlyBilling: "₹36,63,900",
      depositRequired: "₹1,63,80,000", depositReceived: "₹1,63,80,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Expiring in 6 mos", escalationAlert: "Due Soon", leaseStatus: "Expiring Soon"
    },
    {
      propertyId: "PROP-003", propertyName: "Godrej BKC Horizon", floor: "Floor 3", unit: "Suite 301 (South Wing)",
      tenantId: "TEN-107", tenantName: "HSBC Global Services", leaseId: "LEASE-007",
      areaSqFt: 22000, leaseStart: "01-Jun-2024", leaseEnd: "31-May-2029", lockInEnd: "31-May-2027",
      noticePeriodDays: 90, baseMonthlyRent: "₹48,40,000", baseRentPsf: 220, escalationPct: 5,
      nextEscalationDate: "01-Jun-2027", currentMonthlyRent: "₹48,40,000",
      camPsf: 20, camMonthly: "₹4,40,000", utilityMonthly: "₹1,75,000",
      gstAmount: "₹9,81,900", totalMonthlyBilling: "₹64,36,900",
      depositRequired: "₹2,90,40,000", depositReceived: "₹2,90,40,000",
      outstanding: "₹64,36,900", overdueDays: 12, expiryAlert: "Normal (3y+)", escalationAlert: "Due in 21 mos", leaseStatus: "Active"
    },
    // ──── Shivalik Shilp, Ahmedabad (GIFT City Corridor) — ₹65–₹85 PSF ────
    {
      propertyId: "PROP-004", propertyName: "Shivalik Shilp, Ahmedabad", floor: "Floor 7", unit: "Suite 701",
      tenantId: "TEN-108", tenantName: "Infosys BPM Ltd", leaseId: "LEASE-008",
      areaSqFt: 28000, leaseStart: "01-Mar-2025", leaseEnd: "28-Feb-2030", lockInEnd: "28-Feb-2028",
      noticePeriodDays: 90, baseMonthlyRent: "₹23,80,000", baseRentPsf: 85, escalationPct: 5,
      nextEscalationDate: "01-Mar-2027", currentMonthlyRent: "₹23,80,000",
      camPsf: 15, camMonthly: "₹4,20,000", utilityMonthly: "₹1,40,000",
      gstAmount: "₹5,29,200", totalMonthlyBilling: "₹34,69,200",
      depositRequired: "₹1,42,80,000", depositReceived: "₹1,42,80,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (4y+)", escalationAlert: "Due in 18 mos", leaseStatus: "Active"
    },
    {
      propertyId: "PROP-004", propertyName: "Shivalik Shilp, Ahmedabad", floor: "Floor 4", unit: "Suite 401",
      tenantId: "TEN-109", tenantName: "Adani Digital Labs", leaseId: "LEASE-009",
      areaSqFt: 12000, leaseStart: "15-Nov-2024", leaseEnd: "14-Nov-2028", lockInEnd: "14-Nov-2026",
      noticePeriodDays: 60, baseMonthlyRent: "₹7,80,000", baseRentPsf: 65, escalationPct: 7,
      nextEscalationDate: "15-Nov-2026", currentMonthlyRent: "₹7,80,000",
      camPsf: 15, camMonthly: "₹1,80,000", utilityMonthly: "₹65,000",
      gstAmount: "₹1,84,500", totalMonthlyBilling: "₹12,09,500",
      depositRequired: "₹46,80,000", depositReceived: "₹46,80,000",
      outstanding: "₹12,09,500", overdueDays: 45, expiryAlert: "Normal (2y+)", escalationAlert: "Due in 14 mos", leaseStatus: "Notice Served"
    },
    // ──── Business Hub, Pune (Hinjewadi IT Park) — ₹55–₹75 PSF ────
    {
      propertyId: "PROP-005", propertyName: "Business Hub, Pune", floor: "Floor 2", unit: "Suite 201 (Full Floor)",
      tenantId: "TEN-105", tenantName: "Persistent Systems", leaseId: "LEASE-005",
      areaSqFt: 35000, leaseStart: "01-Jul-2024", leaseEnd: "30-Jun-2029", lockInEnd: "30-Jun-2027",
      noticePeriodDays: 90, baseMonthlyRent: "₹26,25,000", baseRentPsf: 75, escalationPct: 5,
      nextEscalationDate: "01-Jul-2027", currentMonthlyRent: "₹26,25,000",
      camPsf: 16, camMonthly: "₹5,60,000", utilityMonthly: "₹1,80,000",
      gstAmount: "₹6,05,700", totalMonthlyBilling: "₹39,70,700",
      depositRequired: "₹1,57,50,000", depositReceived: "₹1,57,50,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (3y+)", escalationAlert: "Due in 22 mos", leaseStatus: "Active"
    },
    {
      propertyId: "PROP-005", propertyName: "Business Hub, Pune", floor: "Floor 5", unit: "Suite 502",
      tenantId: "TEN-110", tenantName: "Tech Mahindra Ltd", leaseId: "LEASE-010",
      areaSqFt: 8500, leaseStart: "01-Aug-2025", leaseEnd: "31-Jul-2028", lockInEnd: "31-Jul-2027",
      noticePeriodDays: 60, baseMonthlyRent: "₹4,67,500", baseRentPsf: 55, escalationPct: 5,
      nextEscalationDate: "01-Aug-2027", currentMonthlyRent: "₹4,67,500",
      camPsf: 16, camMonthly: "₹1,36,000", utilityMonthly: "₹48,000",
      gstAmount: "₹1,17,270", totalMonthlyBilling: "₹7,68,770",
      depositRequired: "₹28,05,000", depositReceived: "₹28,05,000",
      outstanding: "₹0", overdueDays: 0, expiryAlert: "Normal (2y+)", escalationAlert: "Due in 23 mos", leaseStatus: "Active"
    }
  ]);

  // Master Invoices State — 10 Invoices matching 10 Tenants (Sep 2026 billing cycle)
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    { id: "INV-101", invoiceNo: "INV-2026-091", leaseId: "LEASE-001", tenantId: "TEN-101", tenantName: "Tata Digital Ltd", property: "One BKC (Apex Tower)", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹60,00,000", camRecovery: "₹6,00,000", utilityRecovery: "₹2,10,000", gstAmount: "₹12,25,800", totalAmount: "₹80,35,800", status: "Paid", paidDate: "03-Sep-2026", paymentMode: "RTGS / HDFC Bank", utr: "HDFCR520260903008912", tdsDeducted: "₹6,00,000" },
    { id: "INV-102", invoiceNo: "INV-2026-092", leaseId: "LEASE-002", tenantId: "TEN-102", tenantName: "Google Enterprise Services", property: "One BKC (Apex Tower)", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹91,20,000", camRecovery: "₹7,68,000", utilityRecovery: "₹2,85,000", gstAmount: "₹18,31,140", totalAmount: "₹1,20,04,140", status: "Paid", paidDate: "02-Sep-2026", paymentMode: "Corporate Wire / Citibank", utr: "CITIN20260902991204", tdsDeducted: "₹9,12,000" },
    { id: "INV-103", invoiceNo: "INV-2026-093", leaseId: "LEASE-003", tenantId: "TEN-103", tenantName: "Deloitte Digital", property: "Maker Maxity Mumbai", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹46,25,000", camRecovery: "₹4,07,000", utilityRecovery: "₹1,55,000", gstAmount: "₹9,33,660", totalAmount: "₹61,20,660", status: "Overdue", paidDate: undefined, paymentMode: undefined, utr: undefined },
    { id: "INV-104", invoiceNo: "INV-2026-094", leaseId: "LEASE-004", tenantId: "TEN-104", tenantName: "Wipro Cloud Infra", property: "Godrej BKC Horizon", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹27,30,000", camRecovery: "₹2,80,000", utilityRecovery: "₹95,000", gstAmount: "₹5,58,900", totalAmount: "₹36,63,900", status: "Paid", paidDate: "05-Sep-2026", paymentMode: "NEFT / ICICI Bank", utr: "ICICN20260905128790", tdsDeducted: "₹2,73,000" },
    { id: "INV-105", invoiceNo: "INV-2026-095", leaseId: "LEASE-005", tenantId: "TEN-105", tenantName: "Persistent Systems", property: "Business Hub, Pune", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹26,25,000", camRecovery: "₹5,60,000", utilityRecovery: "₹1,80,000", gstAmount: "₹6,05,700", totalAmount: "₹39,70,700", status: "Paid", paidDate: "04-Sep-2026", paymentMode: "RTGS / Kotak Bank", utr: "KOTKR20260904556789", tdsDeducted: "₹2,62,500" },
    { id: "INV-106", invoiceNo: "INV-2026-096", leaseId: "LEASE-006", tenantId: "TEN-106", tenantName: "McKinsey & Company", property: "Maker Maxity Mumbai", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹29,40,000", camRecovery: "₹3,08,000", utilityRecovery: "₹1,10,000", gstAmount: "₹6,04,440", totalAmount: "₹39,62,440", status: "Paid", paidDate: "01-Sep-2026", paymentMode: "Corporate Wire / HSBC", utr: "HSBC520260901440210", tdsDeducted: "₹2,94,000" },
    { id: "INV-107", invoiceNo: "INV-2026-097", leaseId: "LEASE-007", tenantId: "TEN-107", tenantName: "HSBC Global Services", property: "Godrej BKC Horizon", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹48,40,000", camRecovery: "₹4,40,000", utilityRecovery: "₹1,75,000", gstAmount: "₹9,81,900", totalAmount: "₹64,36,900", status: "Pending", paidDate: undefined, paymentMode: undefined, utr: undefined },
    { id: "INV-108", invoiceNo: "INV-2026-098", leaseId: "LEASE-008", tenantId: "TEN-108", tenantName: "Infosys BPM Ltd", property: "Shivalik Shilp, Ahmedabad", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹23,80,000", camRecovery: "₹4,20,000", utilityRecovery: "₹1,40,000", gstAmount: "₹5,29,200", totalAmount: "₹34,69,200", status: "Paid", paidDate: "04-Sep-2026", paymentMode: "NEFT / SBI Corporate", utr: "SBIN520260904887621", tdsDeducted: "₹2,38,000" },
    { id: "INV-109", invoiceNo: "INV-2026-099", leaseId: "LEASE-009", tenantId: "TEN-109", tenantName: "Adani Digital Labs", property: "Shivalik Shilp, Ahmedabad", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹7,80,000", camRecovery: "₹1,80,000", utilityRecovery: "₹65,000", gstAmount: "₹1,84,500", totalAmount: "₹12,09,500", status: "Overdue", paidDate: undefined, paymentMode: undefined, utr: undefined },
    { id: "INV-110", invoiceNo: "INV-2026-100", leaseId: "LEASE-010", tenantId: "TEN-110", tenantName: "Tech Mahindra Ltd", property: "Business Hub, Pune", billingMonth: "September 2026", dueDate: "05-Sep-2026", baseRent: "₹4,67,500", camRecovery: "₹1,36,000", utilityRecovery: "₹48,000", gstAmount: "₹1,17,270", totalAmount: "₹7,68,770", status: "Paid", paidDate: "05-Sep-2026", paymentMode: "NEFT / Axis Bank", utr: "AXISR20260905334521", tdsDeducted: "₹46,750" }
  ]);

  // Master Collections Receipts State
  const [collections, setCollections] = useState<CollectionReceipt[]>([
    { receiptNo: "REC-2026-901", invoiceNo: "INV-2026-091", tenant: "Tata Digital Ltd", paymentDate: "03-Sep-2026", amountReceived: "₹80,35,800", paymentMode: "RTGS / HDFC Bank", utr: "HDFCR520260903008912", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-902", invoiceNo: "INV-2026-092", tenant: "Google Enterprise Services", paymentDate: "02-Sep-2026", amountReceived: "₹1,20,04,140", paymentMode: "Corporate Wire / Citibank", utr: "CITIN20260902991204", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-903", invoiceNo: "INV-2026-094", tenant: "Wipro Cloud Infra", paymentDate: "05-Sep-2026", amountReceived: "₹36,63,900", paymentMode: "NEFT / ICICI Bank", utr: "ICICN20260905128790", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-904", invoiceNo: "INV-2026-095", tenant: "Persistent Systems", paymentDate: "04-Sep-2026", amountReceived: "₹39,70,700", paymentMode: "RTGS / Kotak Bank", utr: "KOTKR20260904556789", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-905", invoiceNo: "INV-2026-096", tenant: "McKinsey & Company", paymentDate: "01-Sep-2026", amountReceived: "₹39,62,440", paymentMode: "Corporate Wire / HSBC", utr: "HSBC520260901440210", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-906", invoiceNo: "INV-2026-098", tenant: "Infosys BPM Ltd", paymentDate: "04-Sep-2026", amountReceived: "₹34,69,200", paymentMode: "NEFT / SBI Corporate", utr: "SBIN520260904887621", reconciliationStatus: "100% Cleared" },
    { receiptNo: "REC-2026-907", invoiceNo: "INV-2026-100", tenant: "Tech Mahindra Ltd", paymentDate: "05-Sep-2026", amountReceived: "₹7,68,770", paymentMode: "NEFT / Axis Bank", utr: "AXISR20260905334521", reconciliationStatus: "100% Cleared" }
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

    const updatedRentRoll = [...rentRollData, newEntry];
    setRentRollData(updatedRentRoll);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_user_leases", JSON.stringify(updatedRentRoll));
    }
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
  const totalMonthlyBillingNum = rentRollData.reduce((acc, curr) => {
    return acc + (parseInt(curr.totalMonthlyBilling.replace(/[^\d]/g, "")) || 0);
  }, 0);
  const totalCamNum = rentRollData.reduce((acc, curr) => {
    return acc + (parseInt(curr.camMonthly.replace(/[^\d]/g, "")) || 0);
  }, 0);
  const pendingInvoicesCount = invoices.filter(i => i.status !== "Paid").length;

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header — Clean & Uncluttered */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rent Roll Master</h1>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200/80 text-[10.5px] font-black uppercase tracking-wider">
              Landlord Portfolio Suite
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Institutional commercial lease registry, CAM recoveries, indexation escalations, and automated tenant billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportWorkbook}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all"
          >
            <Download size={14} className="text-[#0F8B7D]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddLeaseModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus size={15} />
            <span>Add Commercial Lease</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs — Spacious 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL LEASED AREA</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
              <Building size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalArea.toLocaleString()} <span className="text-xs font-bold text-slate-500">sq.ft.</span></p>
            <span className="text-[11px] text-emerald-600 font-extrabold mt-1 inline-block">● 96.2% Portfolio Occupancy</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">MONTHLY INVOICED GTV</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{(totalMonthlyBillingNum / 10000000).toFixed(2)} Cr</p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Rent + CAM + Utility + GST</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">CAM RECOVERY</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-[#0F8B7D] tracking-tight">₹{(totalCamNum / 100000).toFixed(2)} L</p>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">100% Cost Recovery</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">OUTSTANDING DUES</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-black tracking-tight ${totalOutstanding === 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {totalOutstanding === 0 ? "₹0 Dues" : `₹${(totalOutstanding / 100000).toFixed(2)} L`}
            </p>
            <span className="text-[11px] font-bold text-[#0F8B7D] mt-1 inline-block">
              {pendingInvoicesCount === 0 ? "100% Collected" : `${pendingInvoicesCount} Pending Invoice${pendingInvoicesCount > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
              className={`px-4 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#0F8B7D] text-white font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-1 max-w-md bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant, building, or Lease ID..."
                className="w-full text-xs font-medium bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Campus:</span>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="All">All Properties (5 Campuses)</option>
                <option value="One BKC">One BKC (Apex Tower) — Mumbai</option>
                <option value="Maker Maxity">Maker Maxity — Mumbai</option>
                <option value="Godrej BKC">Godrej BKC Horizon — Mumbai</option>
                <option value="Shivalik Shilp">Shivalik Shilp — Ahmedabad</option>
                <option value="Business Hub">Business Hub — Pune</option>
              </select>
            </div>
          </div>

          {/* Clean Desktop Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[10.5px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">TENANT &amp; LEASE</th>
                    <th className="py-3.5 px-4">BUILDING &amp; UNIT</th>
                    <th className="py-3.5 px-4">AREA (SQ.FT)</th>
                    <th className="py-3.5 px-4">BASE RENT</th>
                    <th className="py-3.5 px-4">GROSS BILLING</th>
                    <th className="py-3.5 px-4">NEXT ESCALATION</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 px-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">No Leases in Rent Roll Yet</h4>
                            <p className="text-xs text-slate-500 max-w-sm mt-1">
                              You haven&apos;t recorded any tenant lease agreements yet. Click below to add your first commercial lease agreement.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddLeaseModal(true)}
                            className="mt-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} /> Add First Lease Agreement
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((d) => {
                      const isExpanded = expandedLeaseId === d.leaseId;

                      return (
                        <React.Fragment key={d.leaseId}>
                          <tr 
                            onClick={() => setExpandedLeaseId(isExpanded ? null : d.leaseId)}
                            className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${
                              isExpanded ? "bg-teal-50/20" : ""
                            }`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[11px] font-extrabold text-[#0F8B7D] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/70">
                                  {d.leaseId}
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-900 text-sm block">{d.tenantName}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block truncate max-w-[200px]">{d.propertyName}</span>
                              <span className="text-[11px] text-slate-500 font-medium">{d.unit}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-slate-900 block">{d.areaSqFt.toLocaleString()} sq.ft.</span>
                              <span className="text-[11px] text-slate-400 font-medium">₹{d.baseRentPsf}/psf</span>
                            </td>
                            <td className="py-4 px-4 font-extrabold text-slate-900">
                              {d.baseMonthlyRent}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-black text-slate-900 block">{d.totalMonthlyBilling}</span>
                              <span className="text-[10px] text-teal-700 font-bold">Incl. GST &amp; CAM</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-amber-700 block">{d.nextEscalationDate}</span>
                              <span className="text-[10px] text-slate-400 font-bold">+{d.escalationPct}% Indexation</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                d.leaseStatus === "Active" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {d.leaseStatus}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                              >
                                {isExpanded ? "Hide" : "Details"}
                              </button>
                            </td>
                          </tr>

                          {/* Spacious Lease Detail Drawer Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="p-0 bg-slate-50/80 border-b border-slate-200">
                                <div className="p-5 sm:p-6 space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-black text-slate-900">Lease Specification &amp; Audit Trail</h4>
                                      <span className="text-xs text-slate-500">({d.leaseId})</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">Tenant: {d.tenantName}</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">LEASE &amp; LOCK-IN DATES</span>
                                      <p className="font-bold text-slate-900">Lease: {d.leaseStart} → {d.leaseEnd}</p>
                                      <p className="font-bold text-[#0F8B7D]">Lock-in Until: {d.lockInEnd}</p>
                                      <p className="text-[11px] text-slate-500">Notice Period: {d.noticePeriodDays} Days</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">SECURITY DEPOSITS</span>
                                      <p className="font-bold text-slate-900">Required: {d.depositRequired}</p>
                                      <p className="font-black text-emerald-700">Received: {d.depositReceived}</p>
                                      <p className="text-[11px] text-slate-500">6-Month Nodal Escrow Vault</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">RECOVERIES &amp; TAX</span>
                                      <p className="font-bold text-slate-900">CAM Rate: ₹{d.camPsf}/psf ({d.camMonthly})</p>
                                      <p className="font-bold text-slate-900">GST (18%): {d.gstAmount}</p>
                                      <p className="text-[11px] text-slate-500">Utility: {d.utilityMonthly}</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between">
                                      <div>
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">PAYMENT AUDIT</span>
                                        <p className={`font-black text-xs mt-0.5 ${d.outstanding === "₹0" ? "text-emerald-700" : "text-amber-700"}`}>
                                          {d.outstanding === "₹0" ? "✅ Fully Settled (Zero Dues)" : `⚠ Outstanding: ${d.outstanding}`}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const inv = invoices.find(i => i.leaseId === d.leaseId);
                                            if (inv) setActiveInvoiceForView(inv);
                                            else showToast(`Invoice available for ${d.tenantName}`);
                                          }}
                                          className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors text-center cursor-pointer"
                                        >
                                          View Invoice
                                        </button>
                                        {d.outstanding !== "₹0" && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const pendingInv = invoices.find(i => i.leaseId === d.leaseId && i.status !== "Paid");
                                              if (pendingInv) setActiveInvoiceForPayment(pendingInv);
                                            }}
                                            className="w-full py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-[11px] transition-colors text-center cursor-pointer"
                                          >
                                            Settle Dues
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">No Leases in Rent Roll Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      You haven&apos;t recorded any tenant lease agreements yet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddLeaseModal(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] text-white font-bold text-xs hover:bg-teal-800 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add First Lease Agreement
                  </button>
                </div>
              ) : (
                filteredData.map((d) => (
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
                ))
              )}
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
      {activeTab === "aging" && (() => {
        const overdueEntries = rentRollData.filter(d => d.outstanding !== "₹0");
        const bucket030 = overdueEntries.filter(d => d.overdueDays <= 30);
        const bucket3160 = overdueEntries.filter(d => d.overdueDays > 30 && d.overdueDays <= 60);
        const bucket6190 = overdueEntries.filter(d => d.overdueDays > 60 && d.overdueDays <= 90);
        const bucket90plus = overdueEntries.filter(d => d.overdueDays > 90);

        const parseAmount = (s: string) => parseInt(s.replace(/[^\d]/g, "")) || 0;
        const total030 = bucket030.reduce((a, d) => a + parseAmount(d.outstanding), 0);
        const total3160 = bucket3160.reduce((a, d) => a + parseAmount(d.outstanding), 0);
        const total6190 = bucket6190.reduce((a, d) => a + parseAmount(d.outstanding), 0);
        const total90plus = bucket90plus.reduce((a, d) => a + parseAmount(d.outstanding), 0);
        const grandTotal = total030 + total3160 + total6190 + total90plus;
        const maxBucket = Math.max(total030, total3160, total6190, total90plus, 1);

        return (
        <div className="space-y-5">
          {/* Visual Ageing Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Receivables Ageing — Visual Breakdown</h3>
                <p className="text-xs text-gray-400 mt-0.5">Overdue buckets: 0–30 / 31–60 / 61–90 / 90+ days with proportional bar visualization</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${grandTotal === 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                Total Overdue: {grandTotal === 0 ? "₹0 (Zero Dues)" : `₹${grandTotal.toLocaleString("en-IN")}`}
              </span>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-emerald-50/70 rounded-xl border border-emerald-200/60 p-3.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">0 – 30 Days</span>
                <p className="text-lg font-black text-emerald-800 mt-0.5">₹{total030.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">{bucket030.length} tenant{bucket030.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="bg-amber-50/70 rounded-xl border border-amber-200/60 p-3.5">
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">31 – 60 Days</span>
                <p className="text-lg font-black text-amber-800 mt-0.5">₹{total3160.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-amber-600 font-semibold">{bucket3160.length} tenant{bucket3160.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="bg-orange-50/70 rounded-xl border border-orange-200/60 p-3.5">
                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block">61 – 90 Days</span>
                <p className="text-lg font-black text-orange-800 mt-0.5">₹{total6190.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-orange-600 font-semibold">{bucket6190.length} tenant{bucket6190.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="bg-red-50/70 rounded-xl border border-red-200/60 p-3.5">
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider block">90+ Days</span>
                <p className="text-lg font-black text-red-800 mt-0.5">₹{total90plus.toLocaleString("en-IN")}</p>
                <span className="text-[10px] text-red-600 font-semibold">{bucket90plus.length} tenant{bucket90plus.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3">
              {[
                { label: "0 – 30 Days", total: total030, color: "bg-emerald-500", textColor: "text-emerald-700", entries: bucket030 },
                { label: "31 – 60 Days", total: total3160, color: "bg-amber-500", textColor: "text-amber-700", entries: bucket3160 },
                { label: "61 – 90 Days", total: total6190, color: "bg-orange-500", textColor: "text-orange-700", entries: bucket6190 },
                { label: "90+ Days", total: total90plus, color: "bg-red-500", textColor: "text-red-700", entries: bucket90plus }
              ].map((bucket) => (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${bucket.textColor}`}>{bucket.label}</span>
                    <span className="font-black text-gray-900">₹{bucket.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${bucket.color} rounded-lg transition-all duration-700 ease-out flex items-center`}
                      style={{ width: `${maxBucket > 0 ? Math.max((bucket.total / maxBucket) * 100, bucket.total > 0 ? 4 : 0) : 0}%` }}
                    >
                      {bucket.total > 0 && (
                        <span className="text-white text-[9px] font-bold px-2 truncate">
                          {bucket.entries.map(e => e.tenantName).join(", ")}
                        </span>
                      )}
                    </div>
                    {bucket.total === 0 && (
                      <span className="absolute inset-0 flex items-center px-3 text-[10px] text-gray-400 font-semibold">No overdue receivables</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Aging Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4 text-xs">
            <div>
              <h3 className="text-base font-black text-gray-900">Tenant-wise Aging Detail</h3>
              <p className="text-xs text-gray-400 mt-0.5">Per-tenant overdue bucketing with credit risk classification</p>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/70">
                    <th className="p-3">TENANT</th>
                    <th className="p-3">PROPERTY</th>
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
                    const amt = parseAmount(d.outstanding);
                    const in030 = hasOverdue && d.overdueDays <= 30;
                    const in3160 = hasOverdue && d.overdueDays > 30 && d.overdueDays <= 60;
                    const in6190 = hasOverdue && d.overdueDays > 60 && d.overdueDays <= 90;
                    const in90p = hasOverdue && d.overdueDays > 90;
                    const riskLabel = !hasOverdue ? "Low Risk" : d.overdueDays <= 30 ? "Moderate" : d.overdueDays <= 60 ? "Elevated" : d.overdueDays <= 90 ? "High" : "Critical";
                    const riskColor = !hasOverdue ? "bg-emerald-50 text-emerald-800 border-emerald-200" : d.overdueDays <= 30 ? "bg-amber-50 text-amber-800 border-amber-200" : d.overdueDays <= 60 ? "bg-amber-50 text-amber-800 border-amber-200" : d.overdueDays <= 90 ? "bg-orange-50 text-orange-800 border-orange-200" : "bg-red-50 text-red-800 border-red-200";

                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{d.tenantName}</td>
                        <td className="p-3 text-gray-500">{d.propertyName}</td>
                        <td className={`p-3 ${in030 ? "font-bold text-emerald-700" : "text-gray-400"}`}>{in030 ? `₹${amt.toLocaleString("en-IN")}` : "₹0"}</td>
                        <td className={`p-3 ${in3160 ? "font-bold text-amber-700" : "text-gray-400"}`}>{in3160 ? `₹${amt.toLocaleString("en-IN")}` : "₹0"}</td>
                        <td className={`p-3 ${in6190 ? "font-bold text-orange-700" : "text-gray-400"}`}>{in6190 ? `₹${amt.toLocaleString("en-IN")}` : "₹0"}</td>
                        <td className={`p-3 ${in90p ? "font-bold text-red-700" : "text-gray-400"}`}>{in90p ? `₹${amt.toLocaleString("en-IN")}` : "₹0"}</td>
                        <td className={`p-3 font-black ${hasOverdue ? "text-amber-600" : "text-gray-900"}`}>{d.outstanding}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${riskColor}`}>
                            {hasOverdue ? `${d.overdueDays}d — ${riskLabel}` : "Nil Dues"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

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
                  { p: "One BKC (Apex Tower) — Mumbai", r: "₹1,51,20,000", c: "₹13,68,000", t: "₹1,64,88,000", o: "₹24,50,000", noi: "₹1,40,38,000", m: "85.1%" },
                  { p: "Maker Maxity — Mumbai", r: "₹75,65,000", c: "₹7,15,000", t: "₹82,80,000", o: "₹13,80,000", noi: "₹69,00,000", m: "83.3%" },
                  { p: "Godrej BKC Horizon — Mumbai", r: "₹75,70,000", c: "₹7,20,000", t: "₹82,90,000", o: "₹14,20,000", noi: "₹68,70,000", m: "82.9%" },
                  { p: "Shivalik Shilp — Ahmedabad", r: "₹31,60,000", c: "₹6,00,000", t: "₹37,60,000", o: "₹5,80,000", noi: "₹31,80,000", m: "84.6%" },
                  { p: "Business Hub — Pune", r: "₹30,92,500", c: "₹6,96,000", t: "₹37,88,500", o: "₹6,40,000", noi: "₹31,48,500", m: "83.1%" }
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
                  { id: "TEN-104", n: "Wipro Limited", g: "27AAACW1209K1ZY", pan: "AAACW1209K", c: "Sneha Rao (Admin VP)", e: "sneha.rao@wipro.com", m: "+91 98330 11984" },
                  { id: "TEN-105", n: "Persistent Systems Ltd", g: "27AAACP0129L1Z8", pan: "AAACP0129L", c: "Amit Deshmukh (Facilities Head)", e: "amit.deshmukh@persistent.com", m: "+91 98902 44190" },
                  { id: "TEN-106", n: "McKinsey & Company India LLP", g: "27AAAAM1124H1Z3", pan: "AAAAM1124H", c: "Vikram Singhania (Ops Lead)", e: "vikram_singhania@mckinsey.com", m: "+91 98205 77123" },
                  { id: "TEN-107", n: "HSBC Global Services India", g: "27AAACH8890K1ZX", pan: "AAACH8890K", c: "Farhan Merchant (VP Infra)", e: "farhan.merchant@hsbc.co.in", m: "+91 98214 33091" },
                  { id: "TEN-108", n: "Infosys BPM Limited", g: "24AAACI4419M1ZR", pan: "AACI4419M", c: "Meera Patel (Regional Admin)", e: "meera.patel@infosys.com", m: "+91 98795 66012" },
                  { id: "TEN-109", n: "Adani Digital Labs Pvt Ltd", g: "24AAACA9923N1ZY", pan: "AACA9923N", c: "Rajesh Joshi (Head CRE)", e: "rajesh.joshi@adani.com", m: "+91 98250 88234" },
                  { id: "TEN-110", n: "Tech Mahindra Limited", g: "27AAACT1190P1ZQ", pan: "AAACT1190P", c: "Neha Kulkarni (CRE Manager)", e: "neha.kulkarni@techmahindra.com", m: "+91 98901 33456" }
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

export default function RentRollMaster() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-400">Loading Rent Roll Master...</div>}>
      <RentRollMasterContent />
    </Suspense>
  );
}
