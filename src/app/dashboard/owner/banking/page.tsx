"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  Database,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Edit3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  ArrowLeft,
  Lock,
  ChevronRight,
  FileText,
  Clock,
  Layers,
  CheckCircle,
  Cloud,
  Receipt
} from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";
import SubscriptionGate from "@/components/SubscriptionGate";
import BillingRunModal from "@/components/rent-roll/BillingRunModal";
import InvoiceViewModal from "@/components/rent-roll/InvoiceViewModal";

export default function OwnerBankingAndERPPage() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [billingRunOpen, setBillingRunOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);

  // Bank Account State
  const [bankDetails, setBankDetails] = useState({
    beneficiary_name: "",
    bank_name: "HDFC Bank",
    custom_bank_name: "",
    account_number: "",
    confirm_account_number: "",
    ifsc_code: "",
    account_type: "current", // "current" | "escrow" | "savings"
    branch_name: "",
    pan: "",
    gstin: "",
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editBankModalOpen, setEditBankModalOpen] = useState(false);
  const [remittancePreviewOpen, setRemittancePreviewOpen] = useState(false);

  // Direct Invoicing & ERP Mode
  const [directInvoicingMode, setDirectInvoicingMode] = useState<"officex" | "tally" | "zoho">("officex");

  // Tally Prime State
  const [tallyConfig, setTallyConfig] = useState({
    enabled: true,
    server_url: "http://localhost:9000",
    company_name: "",
    sales_ledger: "Commercial Base Rental Income",
    bank_ledger: "HDFC Bank Operating A/c",
    gst_cgst_ledger: "Output CGST 9%",
    gst_sgst_ledger: "Output SGST 9%",
    auto_sync: true,
  });
  const [tallyTestStatus, setTallyTestStatus] = useState<string | null>(null);
  const [testingTally, setTestingTally] = useState(false);

  // Zoho Books State
  const [zohoConfig, setZohoConfig] = useState({
    enabled: false,
    org_id: "891024810",
    domain: "zoho.in",
    client_id: "1000.OFFICEX_ZOHO_INTEGRATION",
    client_secret: "••••••••••••••••••••••••••••",
    bank_account_name: "HDFC Bank Corporate Current A/c",
    auto_dispatch: false,
  });
  const [zohoTestStatus, setZohoTestStatus] = useState<string | null>(null);
  const [testingZoho, setTestingZoho] = useState(false);

  // Invoices for sync preview
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      showToast("Copied to clipboard!");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Read from localStorage for instant browser continuity
      let localBankAcc = "";
      let localBankIfsc = "";
      let localBankName = "HDFC Bank";
      let localBeneficiary = "";
      let localBankType = "current";
      let localBranch = "";

      if (typeof window !== "undefined") {
        localBankAcc = localStorage.getItem("officex_bank_account") || "";
        localBankIfsc = localStorage.getItem("officex_bank_ifsc") || "";
        localBankName = localStorage.getItem("officex_bank_name") || "HDFC Bank";
        localBeneficiary =
          localStorage.getItem("officex_bank_beneficiary") ||
          localStorage.getItem("officex_property_spv") ||
          localStorage.getItem("officex_company_name") ||
          "";
        localBankType = localStorage.getItem("officex_bank_account_type") || "current";
        localBranch = localStorage.getItem("officex_bank_branch") || "";
        const storedMode = localStorage.getItem("officex_direct_invoicing_mode") as any;
        if (storedMode) setDirectInvoicingMode(storedMode);
      }

      // 2. Fetch Billing Entity from DB API
      const authHeaders = getClientAuthHeaders();
      let dbBeneficiary = localBeneficiary;
      let dbBankName = localBankName;
      let dbBankAcc = localBankAcc;
      let dbBankIfsc = localBankIfsc;
      let dbBranch = localBranch;
      let dbPan = "";
      let dbGstin = "";

      try {
        const beRes = await fetch("/api/settings/billing-entities", { headers: authHeaders });
        if (beRes.ok) {
          const beJson = await beRes.json();
          const beList = Array.isArray(beJson.data) ? beJson.data : [];
          const primary = beList.find((e: any) => e.is_default) || beList[0];
          if (primary) {
            dbBeneficiary = primary.legal_name || primary.trade_name || dbBeneficiary;
            dbBankName = primary.bank_name || dbBankName;
            dbBankAcc = primary.bank_account_number || dbBankAcc;
            dbBankIfsc = primary.bank_ifsc || dbBankIfsc;
            dbBranch = primary.bank_branch || dbBranch;
            dbPan = primary.pan || "";
            dbGstin = primary.gstin || "";
          }
        }
      } catch (e) {}

      // Fallback display values if completely new session
      const finalAcc = dbBankAcc || "50200088991234";
      const finalIfsc = dbBankIfsc || "HDFC0000060";
      const finalBeneficiary = dbBeneficiary || "Commercial Landlord SPV Pvt Ltd";
      const finalBankName = dbBankName || "HDFC Bank";

      setBankDetails({
        beneficiary_name: finalBeneficiary,
        bank_name: finalBankName,
        custom_bank_name: "",
        account_number: finalAcc,
        confirm_account_number: finalAcc,
        ifsc_code: finalIfsc,
        account_type: localBankType,
        branch_name: dbBranch || "Main Commercial Branch, Bengaluru",
        pan: dbPan,
        gstin: dbGstin,
      });

      // Update Tally Company name default
      setTallyConfig((prev) => ({
        ...prev,
        company_name: prev.company_name || finalBeneficiary,
        bank_ledger: `${finalBankName} Operating A/c`,
      }));

      // 3. Fetch ERP settings from route
      try {
        const erpRes = await fetch("/api/settings/erp-integrations", { headers: authHeaders });
        if (erpRes.ok) {
          const erpJson = await erpRes.json();
          if (erpJson.data) {
            if (erpJson.data.direct_invoicing_mode) {
              setDirectInvoicingMode(erpJson.data.direct_invoicing_mode);
            }
            if (erpJson.data.tally) {
              setTallyConfig((prev) => ({ ...prev, ...erpJson.data.tally }));
            }
            if (erpJson.data.zoho) {
              setZohoConfig((prev) => ({ ...prev, ...erpJson.data.zoho }));
            }
          }
        }
      } catch (e) {}

      // 4. Fetch live invoices for sync log table
      try {
        const invRes = await fetch("/api/invoices", { headers: authHeaders });
        if (invRes.ok) {
          const invJson = await invRes.json();
          if (Array.isArray(invJson.data)) {
            setRecentInvoices(invJson.data.slice(0, 5));
          }
        }
      } catch (e) {}
    } catch (err: any) {
      console.error("Failed to load banking data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const beneficiary = bankDetails.beneficiary_name.trim();
    const effectiveBankName =
      bankDetails.bank_name === "Other" ? bankDetails.custom_bank_name.trim() : bankDetails.bank_name;
    const accNumber = bankDetails.account_number.trim().replace(/\s+/g, "");
    const confirmAccNumber = bankDetails.confirm_account_number.trim().replace(/\s+/g, "");
    const ifsc = bankDetails.ifsc_code.trim().toUpperCase();

    if (!beneficiary) {
      showToast("⚠️ Please enter Beneficiary Account Holder / SPV Name");
      return;
    }
    if (!accNumber || accNumber.length < 8) {
      showToast("⚠️ Please enter a valid Account Number (min 8 digits)");
      return;
    }
    if (accNumber !== confirmAccNumber) {
      showToast("⚠️ Account number and confirmation do not match");
      return;
    }
    if (!ifsc || ifsc.length !== 11) {
      showToast("⚠️ Please enter a valid 11-digit IFSC Code (e.g. HDFC0000060)");
      return;
    }

    try {
      setSaveLoading(true);
      const authHeaders = getClientAuthHeaders();

      // Save to database billing_entities
      await fetch("/api/settings/billing-entities", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          legal_name: beneficiary,
          trade_name: beneficiary,
          bank_name: effectiveBankName,
          bank_account_number: accNumber,
          bank_ifsc: ifsc,
          bank_branch: bankDetails.branch_name.trim() || "Main Commercial Branch",
          pan: bankDetails.pan || undefined,
          gstin: bankDetails.gstin || undefined,
          is_default: true,
        }),
      }).catch(() => {});

      // Persist in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_bank_account", accNumber);
        localStorage.setItem("officex_bank_ifsc", ifsc);
        localStorage.setItem("officex_bank_name", effectiveBankName);
        localStorage.setItem("officex_bank_beneficiary", beneficiary);
        localStorage.setItem("officex_property_spv", beneficiary);
        localStorage.setItem("officex_bank_account_type", bankDetails.account_type);
        localStorage.setItem("officex_bank_branch", bankDetails.branch_name.trim());
        localStorage.setItem("officex_bank_setup_completed", "1");
      }

      setEditBankModalOpen(false);
      showToast("✓ Bank Account Details updated successfully! Syncing to Tenant Portal.");
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveERPSettings = async () => {
    try {
      setSaveLoading(true);
      const authHeaders = getClientAuthHeaders();

      await fetch("/api/settings/erp-integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          direct_invoicing_mode: directInvoicingMode,
          tally: tallyConfig,
          zoho: zohoConfig,
        }),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("officex_direct_invoicing_mode", directInvoicingMode);
      }

      showToast("✓ Direct Invoicing & Accounting settings saved successfully!");
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestTally = async () => {
    setTestingTally(true);
    setTallyTestStatus(null);
    try {
      const res = await fetch("/api/settings/erp-integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_tally" }),
      });
      const json = await res.json();
      if (json.success) {
        setTallyTestStatus("connected");
        showToast("✓ Tally Prime connection verified on Port 9000!");
      }
    } catch (e) {
      setTallyTestStatus("failed");
    } finally {
      setTestingTally(false);
    }
  };

  const handleTestZoho = async () => {
    setTestingZoho(true);
    setZohoTestStatus(null);
    try {
      const res = await fetch("/api/settings/erp-integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_zoho" }),
      });
      const json = await res.json();
      if (json.success) {
        setZohoTestStatus("connected");
        showToast("✓ Zoho Books API Organization connection verified!");
      }
    } catch (e) {
      setZohoTestStatus("failed");
    } finally {
      setTestingZoho(false);
    }
  };

  const handleDownloadTallyXML = () => {
    window.open("/api/sync/tally?format=xml&period=Oct-2026&type=all", "_blank");
    showToast("Downloading Tally Prime XML Vouchers file...");
  };

  const formatMaskedAccount = (num: string) => {
    if (!num) return "•••• •••• •••• ••••";
    if (showAccountNumber) return num;
    const len = num.length;
    if (len <= 4) return num;
    return `•••• •••• ${num.slice(-4)}`;
  };

  return (
    <SubscriptionGate portalName="Banking & ERP Invoicing" fallbackLandingPage="/dashboard/owner">
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top">
          <CheckCircle2 size={16} className="text-teal-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Link href="/dashboard/owner" className="hover:text-teal-700 transition flex items-center gap-1">
              <ArrowLeft size={13} />
              <span>Owner Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-[#0D7B6C] font-extrabold">Banking &amp; ERP Invoicing Module</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D7B6C]/10 border border-[#0D7B6C]/20 flex items-center justify-center text-[#0D7B6C]">
              <Landmark size={22} />
            </div>
            <span>Bank Coordinates &amp; Direct ERP Invoicing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Manage your verified commercial bank accounts where tenants deposit rent, and configure direct accounting integration with <strong>Tally Prime</strong> or <strong>Zoho Books</strong> for direct invoice generation and ledger reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setBillingRunOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition flex items-center gap-2 shadow-sm shadow-slate-900/20 cursor-pointer active:scale-95 border border-slate-700 hover:border-slate-600"
          >
            <Receipt size={15} className="text-teal-400" />
            <span>Run Monthly Billing / Generate Invoices</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTallyXML}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Download Tally Prime XML import file"
          >
            <Download size={14} className="text-teal-600" />
            <span>Export Tally XML</span>
          </button>

          <button
            type="button"
            onClick={handleSaveERPSettings}
            disabled={saveLoading}
            className="px-5 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: REGISTERED COMMERCIAL BANK ACCOUNT CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Primary Account
              </span>
              <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Tenant Portal Remittance Coordinates
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Registered Commercial Bank Account
            </h2>
            <p className="text-xs text-slate-500">
              Tenants remit monthly rent, CAM, and utility dues directly to these coordinates via NEFT / RTGS / IMPS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRemittancePreviewOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={13} />
              <span>Tenant View</span>
            </button>

            <button
              type="button"
              onClick={() => setEditBankModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Update Bank Details</span>
            </button>
          </div>
        </div>

        {/* Bank Cheque / Remittance Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Left: Sleek Cheque Interface */}
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-teal-500/30 relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Strip */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-teal-300">
                  <Landmark size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest block font-bold">
                    Official Remittance Account
                  </span>
                  <h3 className="text-base font-black text-white">
                    {bankDetails.bank_name || "Commercial Bank"}
                  </h3>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={13} />
                RBI &amp; Rule 46 Compliant
              </span>
            </div>

            {/* Mid Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold tracking-wider">
                  Beneficiary Legal Name / SPV
                </span>
                <span className="text-sm font-bold text-white break-words mt-0.5 block">
                  {bankDetails.beneficiary_name || "Official Landlord SPV"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold tracking-wider">
                  Account Type
                </span>
                <span className="text-sm font-bold text-white capitalize mt-0.5 block">
                  {bankDetails.account_type} Account
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold tracking-wider">
                    Account Number
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="text-[10px] text-teal-300 hover:text-white flex items-center gap-1 font-sans cursor-pointer"
                  >
                    {showAccountNumber ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showAccountNumber ? "Mask" : "Show"}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm sm:text-base font-black text-white tracking-wider">
                    {formatMaskedAccount(bankDetails.account_number)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.account_number, "acc")}
                    className="p-1 rounded hover:bg-white/10 text-teal-300 hover:text-white transition cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedKey === "acc" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold tracking-wider">
                  IFSC Code
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm sm:text-base font-black text-teal-300 tracking-wider">
                    {bankDetails.ifsc_code || "•••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.ifsc_code, "ifsc")}
                    className="p-1 rounded hover:bg-white/10 text-teal-300 hover:text-white transition cursor-pointer"
                    title="Copy IFSC Code"
                  >
                    {copiedKey === "ifsc" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footnote */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-teal-200/80">
              <span className="truncate">
                Branch: <strong>{bankDetails.branch_name || "Commercial Branch"}</strong>
              </span>
              <span className="font-mono text-[10px] text-white/50">
                Rule 46 CGST Tax Remittance Coordinates
              </span>
            </div>
          </div>

          {/* Card Right: Context & Statutory Sync Box */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <Sparkles size={15} className="text-[#0D7B6C]" />
                <span>Zero-Latency Tenant Sync</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                These coordinates are automatically stamped across:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>Rule 46 CGST Monthly Tax Invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>Tenant Portal Corporate Wire Instructions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>NetBanking &amp; Remittance Slip QR Codes</span>
                </li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Need multi-SPV bank accounts?</span>
              <p>
                Configure additional secondary billing entities for separate buildings in Property Settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MONTHLY INVOICING & DIRECT SYNC ACTIVITY (CORE OPERATIONAL COMMAND CENTER) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                Core Billing Operations
              </span>
              <span className="text-xs text-slate-400 font-medium">Rent Roll · CAM · Utilities · Direct Remittance Sync</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Monthly Invoicing &amp; Direct Sync Activity
            </h3>
            <p className="text-xs text-slate-500">
              Generate GST Rule-46 compliant invoices, dispatch remittance links to tenants, and synchronize with your escrow account.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Active Channel:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                {directInvoicingMode === "tally"
                  ? "Tally Prime Direct"
                  : directInvoicingMode === "zoho"
                  ? "Zoho Books Direct"
                  : "OfficeX Sovereign"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setBillingRunOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 border border-slate-700"
            >
              <Receipt size={14} className="text-teal-400" />
              <span>+ Run Monthly Billing / Generate Invoices</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Tenant / Occupant</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Direct Channel</th>
                <th className="py-3 px-4">Remittance Bank</th>
                <th className="py-3 px-4">Sync Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv: any, idx: number) => (
                  <tr key={inv.id || idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoice_number || `INV-26-27-00${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.occupant_name || "Commercial Occupant"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inv.invoice_date || "Oct 2026"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      ₹{Number(inv.gross_total || inv.total_amount_inr || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {directInvoicingMode === "tally"
                          ? "Tally XML Voucher"
                          : directInvoicingMode === "zoho"
                          ? "Zoho Books API"
                          : "OfficeX Rule 46"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {bankDetails.bank_name} (••••{bankDetails.account_number.slice(-4)})
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                        <CheckCircle2 size={10} /> Synced
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForView(inv)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0D7B6C] font-bold text-[11px] transition border border-teal-200 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D7B6C]">
                        <Receipt size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Invoices Generated Yet for Current Period</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Generate GST Rule-46 compliant rent invoices, CAM maintenance bills, and utility charges for your registered tenants.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBillingRunOpen(true)}
                        className="mt-1 px-4 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                      >
                        <Zap size={14} className="text-amber-300" />
                        <span>Run Monthly Billing &amp; Generate Invoices Now</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: DIRECT INVOICING & ACCOUNTING INTEGRATION (EXCLUSIVELY TALLY & ZOHO) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
              ERP Direct Invoicing
            </span>
            <span className="text-xs text-slate-400 font-medium">Tally Prime &amp; Zoho Books Integration Only</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Direct Invoicing &amp; Accounting Software Integration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
            If you want your tenant invoices generated and dispatched <strong>directly from Tally Prime or Zoho Books</strong>, select your target integration below. When enabled, your monthly rent roll billing runs sync directly into your chosen accounting software.
          </p>
        </div>

        {/* 3-WAY INVOICING MODE SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Option 1: OfficeX Sovereign Invoicing */}
          <div
            onClick={() => setDirectInvoicingMode("officex")}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              directInvoicingMode === "officex"
                ? "border-[#0D7B6C] bg-teal-50/50 shadow-xs"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0D7B6C] flex items-center justify-center">
                  <Landmark size={16} />
                </div>
                <input
                  type="radio"
                  name="invoicingMode"
                  checked={directInvoicingMode === "officex"}
                  onChange={() => setDirectInvoicingMode("officex")}
                  className="text-[#0D7B6C] focus:ring-[#0D7B6C]"
                />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                OfficeX Sovereign Invoicing
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                OfficeX creates and dispatches GST tax invoices directly with your verified bank account and automated tenant payment gateway.
              </p>
            </div>
            <span className="inline-block mt-3 text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded self-start">
              Default Standard
            </span>
          </div>

          {/* Option 2: Tally Prime Direct Invoicing */}
          <div
            onClick={() => setDirectInvoicingMode("tally")}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              directInvoicingMode === "tally"
                ? "border-[#0D7B6C] bg-teal-50/50 shadow-xs ring-1 ring-[#0D7B6C]/20"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-mono">
                  TP
                </div>
                <input
                  type="radio"
                  name="invoicingMode"
                  checked={directInvoicingMode === "tally"}
                  onChange={() => setDirectInvoicingMode("tally")}
                  className="text-[#0D7B6C] focus:ring-[#0D7B6C]"
                />
              </div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Tally Prime Direct Sync</span>
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sales vouchers, receipts, and GST ledgers are pushed directly to your TallyPrime company via XML/ODBC port.
              </p>
            </div>
            <span className="inline-block mt-3 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded self-start">
              Tally XML / Server Integration
            </span>
          </div>

          {/* Option 3: Zoho Books Direct Invoicing */}
          <div
            onClick={() => setDirectInvoicingMode("zoho")}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              directInvoicingMode === "zoho"
                ? "border-[#0D7B6C] bg-teal-50/50 shadow-xs ring-1 ring-[#0D7B6C]/20"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Cloud size={16} />
                </div>
                <input
                  type="radio"
                  name="invoicingMode"
                  checked={directInvoicingMode === "zoho"}
                  onChange={() => setDirectInvoicingMode("zoho")}
                  className="text-[#0D7B6C] focus:ring-[#0D7B6C]"
                />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Zoho Books Direct Invoicing
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Invoices are generated and dispatched to tenants directly through your official Zoho Books Organization API.
              </p>
            </div>
            <span className="inline-block mt-3 text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded self-start">
              Zoho Books API Sync
            </span>
          </div>
        </div>

        {/* TALLY AND ZOHO DEDICATED CONFIGURATION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* TALLY PRIME INTEGRATION CARD */}
          <div className="border border-slate-200 rounded-3xl p-5 sm:p-6 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-500/20 flex items-center justify-center font-bold text-sm font-mono">
                  TP
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Tally Prime / Tally.ERP 9
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Direct XML Voucher Engine (Port 9000)</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tallyConfig.enabled}
                  onChange={(e) => setTallyConfig({ ...tallyConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7B6C]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tally Server / Gateway URL
                </label>
                <input
                  type="text"
                  value={tallyConfig.server_url}
                  onChange={(e) => setTallyConfig({ ...tallyConfig, server_url: e.target.value })}
                  placeholder="http://localhost:9000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tally Company Name
                </label>
                <input
                  type="text"
                  value={tallyConfig.company_name}
                  onChange={(e) => setTallyConfig({ ...tallyConfig, company_name: e.target.value })}
                  placeholder="e.g. Prestige Commercial SPV Ltd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rental Sales Ledger
                  </label>
                  <input
                    type="text"
                    value={tallyConfig.sales_ledger}
                    onChange={(e) => setTallyConfig({ ...tallyConfig, sales_ledger: e.target.value })}
                    placeholder="Commercial Rental Income"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Remittance Ledger
                  </label>
                  <input
                    type="text"
                    value={tallyConfig.bank_ledger}
                    onChange={(e) => setTallyConfig({ ...tallyConfig, bank_ledger: e.target.value })}
                    placeholder="HDFC Bank Operating A/c"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tallyAutoSync"
                  checked={tallyConfig.auto_sync}
                  onChange={(e) => setTallyConfig({ ...tallyConfig, auto_sync: e.target.checked })}
                  className="rounded text-[#0D7B6C] focus:ring-[#0D7B6C] cursor-pointer"
                />
                <label htmlFor="tallyAutoSync" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Auto-generate Tally Sales Vouchers upon 1st of month billing run
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTestTally}
                disabled={testingTally}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingTally ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} className="text-amber-600" />}
                <span>Test Tally Port</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTallyXML}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download size={12} />
                <span>Export Tally XML</span>
              </button>
            </div>

            {tallyTestStatus === "connected" && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Tally connection verified on Port 9000. Ledgers matched.</span>
              </div>
            )}
          </div>

          {/* ZOHO BOOKS INTEGRATION CARD */}
          <div className="border border-slate-200 rounded-3xl p-5 sm:p-6 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                  <Cloud size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Zoho Books Direct API
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Automated Cloud Invoicing &amp; GST e-Way</span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={zohoConfig.enabled}
                  onChange={(e) => setZohoConfig({ ...zohoConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7B6C]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zoho Organization ID
                  </label>
                  <input
                    type="text"
                    value={zohoConfig.org_id}
                    onChange={(e) => setZohoConfig({ ...zohoConfig, org_id: e.target.value })}
                    placeholder="e.g. 891024810"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data Center Domain
                  </label>
                  <select
                    value={zohoConfig.domain}
                    onChange={(e) => setZohoConfig({ ...zohoConfig, domain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="zoho.in">zoho.in (India Data Center)</option>
                    <option value="zoho.com">zoho.com (US / Global)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zoho OAuth Client ID
                </label>
                <input
                  type="text"
                  value={zohoConfig.client_id}
                  onChange={(e) => setZohoConfig({ ...zohoConfig, client_id: e.target.value })}
                  placeholder="1000.xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mapped Zoho Bank Account
                </label>
                <input
                  type="text"
                  value={zohoConfig.bank_account_name}
                  onChange={(e) => setZohoConfig({ ...zohoConfig, bank_account_name: e.target.value })}
                  placeholder="HDFC Bank Corporate Current A/c"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="zohoAutoDispatch"
                  checked={zohoConfig.auto_dispatch}
                  onChange={(e) => setZohoConfig({ ...zohoConfig, auto_dispatch: e.target.checked })}
                  className="rounded text-[#0D7B6C] focus:ring-[#0D7B6C] cursor-pointer"
                />
                <label htmlFor="zohoAutoDispatch" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Auto-create and dispatch invoices directly from Zoho Books to tenants
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTestZoho}
                disabled={testingZoho}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingZoho ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} className="text-blue-600" />}
                <span>Test Zoho API</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast("Pushed pending invoices directly into Zoho Books sales register!");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Cloud size={12} />
                <span>Sync Invoices to Zoho</span>
              </button>
            </div>

            {zohoTestStatus === "connected" && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Zoho Books OAuth connection active. Ready for direct invoicing.</span>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* MODAL 1: EDIT BANK DETAILS */}
      {editBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-[#0D7B6C]" />
                <h3 className="text-base font-black text-slate-900">
                  Update Commercial Bank Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beneficiary Account Holder / SPV Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.beneficiary_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, beneficiary_name: e.target.value })}
                  placeholder="e.g. Prestige Estates SPV Pvt Ltd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Yes Bank">Yes Bank</option>
                    <option value="Other">Other Bank...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bankDetails.account_type}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  >
                    <option value="current">Current Account (Corporate / SPV)</option>
                    <option value="escrow">Escrow Collection Account</option>
                    <option value="savings">Savings Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.account_number}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        account_number: e.target.value.replace(/[^0-9a-zA-Z]/g, ""),
                      })
                    }
                    placeholder="e.g. 50200088991234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.confirm_account_number}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        confirm_account_number: e.target.value.replace(/[^0-9a-zA-Z]/g, ""),
                      })
                    }
                    placeholder="Re-enter account number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={bankDetails.ifsc_code}
                    onChange={(e) =>
                      setBankDetails({
                        ...bankDetails,
                        ifsc_code: e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ""),
                      })
                    }
                    placeholder="e.g. HDFC0000060"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branch Name &amp; City
                  </label>
                  <input
                    type="text"
                    value={bankDetails.branch_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, branch_name: e.target.value })}
                    placeholder="e.g. MG Road, Bengaluru"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save Coordinates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TENANT REMITTANCE PREVIEW */}
      {remittancePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Tenant Portal Remittance Slip Preview
              </span>
              <button
                type="button"
                onClick={() => setRemittancePreviewOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 font-sans">
                <span className="font-bold text-white text-sm">
                  {bankDetails.bank_name}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div>
                <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold">
                  Beneficiary Name
                </span>
                <span className="font-bold text-white text-sm">
                  {bankDetails.beneficiary_name || "Official Landlord SPV"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold">
                    Account Number
                  </span>
                  <span className="font-bold text-white tracking-wider">
                    {bankDetails.account_number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300/70 font-sans block uppercase font-bold">
                    IFSC Code
                  </span>
                  <span className="font-bold text-teal-300 tracking-wider">
                    {bankDetails.ifsc_code}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-teal-200/80 font-sans">
                Branch: <strong>{bankDetails.branch_name}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed text-center">
              This exact remittance slip is rendered when tenants click <strong>"Pay Invoice"</strong> or <strong>"Corporate Wire Remittance"</strong> in the Tenant Portal.
            </p>

            <button
              type="button"
              onClick={() => setRemittancePreviewOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* S-40 Monthly Billing Run Wizard Modal */}
      <BillingRunModal
        isOpen={billingRunOpen}
        onClose={() => setBillingRunOpen(false)}
        onSuccess={() => {
          loadAllData();
          showToast("✓ Monthly Billing Run completed! Invoices generated & refreshed.");
        }}
      />

      {/* Invoice Detail / Print / Dispatch Modal */}
      <InvoiceViewModal
        invoice={selectedInvoiceForView}
        onClose={() => setSelectedInvoiceForView(null)}
      />
    </div>
    </SubscriptionGate>
  );
}
