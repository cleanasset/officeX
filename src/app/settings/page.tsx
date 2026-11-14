"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Building,
  CreditCard,
  Percent,
  Hash,
  Bell,
  Users,
  ShieldCheck,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lock,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Save,
  Check,
  X,
  Info,
  Mail,
  UserPlus,
  Landmark,
  UploadCloud,
  RotateCcw,
  Trash2
} from "lucide-react";

export default function SettingsSuitePage() {
  const [activeTab, setActiveTab] = useState<string>("s60");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSetupReminder, setShowSetupReminder] = useState<boolean>(false);

  // S-60 State
  const [orgData, setOrgData] = useState<any>(null);
  // S-61 State
  const [billingEntities, setBillingEntities] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastDismissed = localStorage.getItem("officex_setup_reminder_dismissed_at");
      const fiveHoursMs = 5 * 60 * 60 * 1000;
      const shouldCheck = !lastDismissed || Date.now() - Number(lastDismissed) > fiveHoursMs;

      const hasLogo = Boolean(orgData?.branding?.logo_url || localStorage.getItem("officex_company_logo"));
      const hasBanking = billingEntities.length > 0;
      if (shouldCheck && (!hasLogo || !hasBanking)) {
        setShowSetupReminder(true);
      } else {
        setShowSetupReminder(false);
      }
    }
  }, [orgData, billingEntities]);

  const handleDismissReminder = () => {
    setShowSetupReminder(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_setup_reminder_dismissed_at", Date.now().toString());
    }
  };
  // S-62 State
  const [chargesData, setChargesData] = useState<any>(null);
  // S-63 State
  const [numberingData, setNumberingData] = useState<any>(null);
  // S-64 State
  const [alertRules, setAlertRules] = useState<any[]>([]);
  // S-66 State
  const [usersData, setUsersData] = useState<any>(null);
  // S-67 State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditSearch, setAuditSearch] = useState("");

  // Modals
  const [showAddBillingEntityModal, setShowAddBillingEntityModal] = useState(false);
  const [newBillingEntity, setNewBillingEntity] = useState({
    legal_name: "",
    trade_name: "",
    pan: "",
    gstin: "",
    state_code: "29",
    registered_address: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    bank_branch: "",
    invoice_prefix: "INV-2026",
    is_default: true,
  });

  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "property_manager",
    assigned_properties: "All Portfolio Properties",
  });

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === "s60" && !orgData) {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success) setOrgData(json.data);
      } else if (tab === "s61" && billingEntities.length === 0) {
        const res = await fetch("/api/settings/billing-entities");
        const json = await res.json();
        if (json.success) setBillingEntities(json.data);
      } else if (tab === "s62" && !chargesData) {
        const res = await fetch("/api/settings/charges");
        const json = await res.json();
        if (json.success) setChargesData(json.data);
      } else if (tab === "s63" && !numberingData) {
        const res = await fetch("/api/settings/numbering");
        const json = await res.json();
        if (json.success) setNumberingData(json.data);
      } else if (tab === "s64" && alertRules.length === 0) {
        const res = await fetch("/api/settings/alerts");
        const json = await res.json();
        if (json.success) setAlertRules(json.data);
      } else if (tab === "s66" && !usersData) {
        const res = await fetch("/api/settings/users");
        const json = await res.json();
        if (json.success) setUsersData(json.data);
      } else if (tab === "s67" && auditLogs.length === 0) {
        const res = await fetch("/api/settings/audit");
        const json = await res.json();
        if (json.success) setAuditLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveS60 = async () => {
    setSaving(true);
    try {
      if (orgData?.branding?.primary_color && typeof window !== "undefined") {
        localStorage.setItem("officex_brand_color", orgData.branding.primary_color);
        document.documentElement.style.setProperty("--brand-color", orgData.branding.primary_color);
        document.documentElement.style.setProperty("--primary-teal", orgData.branding.primary_color);
        document.documentElement.style.setProperty("--color-primary-teal", orgData.branding.primary_color);
        window.dispatchEvent(new CustomEvent("officex_brand_color_change", { detail: orgData.branding.primary_color }));
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Company profile & branding preferences saved successfully.");
      } else {
        setMessage("Failed to save settings. Please try again.");
      }
    } catch (e) {
      setMessage("Error saving company settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleBrandColorChange = (newColor: string) => {
    setOrgData({
      ...orgData,
      branding: { ...orgData.branding, primary_color: newColor },
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_brand_color", newColor);
      document.documentElement.style.setProperty("--brand-color", newColor);
      document.documentElement.style.setProperty("--primary-teal", newColor);
      document.documentElement.style.setProperty("--color-primary-teal", newColor);
      window.dispatchEvent(new CustomEvent("officex_brand_color_change", { detail: newColor }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setOrgData({
        ...orgData,
        branding: { ...orgData.branding, logo_url: dataUrl },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_company_logo", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setOrgData({
      ...orgData,
      branding: { ...orgData.branding, logo_url: "" },
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("officex_company_logo");
    }
  };

  const handleCreateBillingEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillingEntity.legal_name || !newBillingEntity.gstin || !newBillingEntity.pan) {
      alert("Please fill in Legal Entity Name, PAN, and GSTIN.");
      return;
    }

    try {
      const res = await fetch("/api/settings/billing-entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBillingEntity),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh billing entities
        const refetch = await fetch("/api/settings/billing-entities");
        const json = await refetch.json();
        if (json.success) setBillingEntities(json.data);

        setShowAddBillingEntityModal(false);
        setNewBillingEntity({
          legal_name: "",
          trade_name: "",
          pan: "",
          gstin: "",
          state_code: "29",
          registered_address: "",
          bank_name: "",
          bank_account_number: "",
          bank_ifsc: "",
          bank_branch: "",
          invoice_prefix: "INV-2026",
          is_default: false,
        });
        setMessage("Billing entity registered successfully.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error creating billing entity:", err);
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email) {
      alert("Please enter team member's full name and email address.");
      return;
    }

    const created = {
      id: `usr-${Date.now()}`,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      assigned_properties: [newUser.assigned_properties],
      last_login: "Invited (Pending login)",
      status: "active",
    };

    if (usersData) {
      setUsersData({
        ...usersData,
        users: [created, ...(usersData.users || [])],
      });
    }

    setShowInviteUserModal(false);
    setNewUser({
      full_name: "",
      email: "",
      role: "property_manager",
      assigned_properties: "All Portfolio Properties",
    });
    setMessage(`Invitation link sent to ${newUser.email}.`);
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
              Company &amp; Portfolio Profile
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">Landlord &amp; Asset Entity Setup</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="text-[#0D7B6C] w-5 h-5 sm:w-6 sm:h-6" />
            Company &amp; Billing Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your company profile, legal billing SPVs, GSTIN, bank disbursement accounts, and team access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} /> Landlord Company Scope
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {showSetupReminder && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 mt-0.5 sm:mt-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">Incomplete Enterprise Profile &amp; Banking Details</h4>
              <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5 leading-relaxed">
                {!orgData?.branding?.logo_url && "• Please upload your official Company Logo. "}
                {billingEntities.length === 0 && "• Add your Legal Entity SPV and Disbursement Bank Account. "}
                These are required to issue legally valid GST invoices and process tenant rent disbursements.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setActiveTab(billingEntities.length === 0 ? "s61" : "s60")}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
            >
              Complete Now
            </button>
            <button
              onClick={handleDismissReminder}
              className="px-2.5 py-1.5 text-xs text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition"
              title="Snooze for 5 hours"
            >
              Dismiss (5h)
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation Grouped by Purpose */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-2 border-b border-slate-200 text-xs font-bold">
        {/* Core Profile */}
        <button
          onClick={() => setActiveTab("s60")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s60" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building size={14} /> Company Profile
        </button>
        <button
          onClick={() => setActiveTab("s61")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s61" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <CreditCard size={14} /> Billing SPVs &amp; Bank Accounts
        </button>

        <span className="hidden sm:inline-block text-slate-300 mx-1">|</span>

        {/* Operations */}
        <button
          onClick={() => setActiveTab("s66")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s66" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users size={14} /> Team &amp; Roles
        </button>
        <button
          onClick={() => setActiveTab("s64")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s64" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Bell size={14} /> Alert Rules
        </button>

        <span className="hidden sm:inline-block text-slate-300 mx-1">|</span>

        {/* Compliance Masters */}
        <button
          onClick={() => setActiveTab("s62")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s62" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Percent size={14} /> Tax Slabs (SAC/GST)
        </button>
        <button
          onClick={() => setActiveTab("s63")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s63" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Hash size={14} /> Document Sequences
        </button>
        <button
          onClick={() => setActiveTab("s67")}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "s67" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock size={14} /> Audit Trail
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-sm">Loading configuration...</p>
        </div>
      ) : (
        <>
          {/* TAB S-60: ORGANISATION & BRANDING */}
          {activeTab === "s60" && orgData && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Company &amp; Branding Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Your organization's primary identity for rent roll invoices, statements, and tenant communications.</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Scope: Individual Landlord Account
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Company Details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                    Corporate Identity
                  </h4>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">
                      Company / Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prestige Estates / Brigade Realty / Apex Properties"
                      value={orgData.organisation?.name || ""}
                      onChange={(e) =>
                        setOrgData({
                          ...orgData,
                          organisation: { ...orgData.organisation, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Legal Entity Registered Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Commercial Real Estate Assets LLP"
                      value={orgData.organisation?.legal_name || ""}
                      onChange={(e) =>
                        setOrgData({
                          ...orgData,
                          organisation: { ...orgData.organisation, legal_name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">PAN Number</label>
                      <input
                        type="text"
                        placeholder="e.g. AAACA1234A"
                        value={orgData.organisation?.pan || ""}
                        onChange={(e) =>
                          setOrgData({
                            ...orgData,
                            organisation: { ...orgData.organisation, pan: e.target.value.toUpperCase() },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">GSTIN</label>
                      <input
                        type="text"
                        placeholder="e.g. 29AAACA1234A1Z5"
                        value={orgData.organisation?.gstin || ""}
                        onChange={(e) =>
                          setOrgData({
                            ...orgData,
                            organisation: { ...orgData.organisation, gstin: e.target.value.toUpperCase() },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Registered Office Address</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 4th Floor, Commercial Wing, MG Road, Bengaluru, Karnataka 560001"
                      value={orgData.organisation?.registered_address || ""}
                      onChange={(e) =>
                        setOrgData({
                          ...orgData,
                          organisation: { ...orgData.organisation, registered_address: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                    />
                  </div>
                </div>

                {/* Contact & Branding */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                    Contact &amp; Invoice Branding
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Website</label>
                      <input
                        type="text"
                        placeholder="https://yourcompany.com"
                        value={orgData.organisation?.website || ""}
                        onChange={(e) =>
                          setOrgData({
                            ...orgData,
                            organisation: { ...orgData.organisation, website: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Accounts / Support Email</label>
                      <input
                        type="email"
                        placeholder="billing@yourcompany.com"
                        value={orgData.organisation?.support_email || ""}
                        onChange={(e) =>
                          setOrgData({
                            ...orgData,
                            organisation: { ...orgData.organisation, support_email: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Operating Currency</label>
                      <select
                        value={orgData.financial_controls?.operating_currency || "INR (₹)"}
                        onChange={(e) =>
                          setOrgData({
                            ...orgData,
                            financial_controls: { ...orgData.financial_controls, operating_currency: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      >
                        <option value="INR (₹)">INR (₹ - Indian Rupee)</option>
                        <option value="USD ($)">USD ($ - SEZ IFSC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Financial Year Cycle</label>
                      <select
                        defaultValue="apr"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                      >
                        <option value="apr">April to March (Indian FY)</option>
                        <option value="jan">January to December</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Logo Upload */}
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Company / Brand Logo</label>
                    <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                      {orgData.branding?.logo_url ? (
                        <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={orgData.branding.logo_url}
                            alt="Company Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/60 flex flex-col items-center justify-center text-slate-400 shrink-0">
                          <Building size={20} />
                          <span className="text-[9px] mt-0.5">No Logo</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5">
                            <UploadCloud size={13} className="text-[#0D7B6C]" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>

                          {orgData.branding?.logo_url && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Remove logo"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Supports PNG, JPG, or SVG up to 2MB. Displayed on tenant invoices, receipts, and leases.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Brand Theme Color</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="color"
                        value={orgData.branding?.primary_color || "#0D7B6C"}
                        onChange={(e) => handleBrandColorChange(e.target.value)}
                        className="w-10 h-10 border border-slate-300 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {orgData.branding?.primary_color || "#0D7B6C"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBrandColorChange("#0D7B6C")}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-2xs transition"
                        title="Reset to default brand color"
                      >
                        <RotateCcw size={11} className="text-slate-500" />
                        <span>Reset to Default OfficeX Teal (#0D7B6C)</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Applied to: Action buttons, active navigation highlights, invoice accent headers, and tenant portal badges.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Invoice Legal Footer Disclaimer</label>
                    <textarea
                      rows={2}
                      value={orgData.branding?.footer_disclaimer || ""}
                      onChange={(e) =>
                        setOrgData({
                          ...orgData,
                          branding: { ...orgData.branding, footer_disclaimer: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSaveS60}
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] disabled:bg-slate-400 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save size={14} /> {saving ? "Saving..." : "Save Company Settings"}
                </button>
              </div>
            </div>
          )}

          {/* TAB S-61: BILLING ENTITIES MASTER */}
          {activeTab === "s61" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Billing Entities &amp; SPVs</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Separate legal entities (LLPs, Private Limiteds, Proprietorships) with distinct GSTIN and settlement bank accounts.</p>
                </div>
                <button
                  onClick={() => setShowAddBillingEntityModal(true)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={14} /> Add Billing Entity
                </button>
              </div>

              {billingEntities.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl p-6">
                  <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Billing Entities Registered Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Add your company or SPV details along with GSTIN and Bank Account to issue legal tax invoices and receive rent disbursements.
                  </p>
                  <button
                    onClick={() => setShowAddBillingEntityModal(true)}
                    className="px-4 py-2 bg-[#0D7B6C] hover:bg-[#09574C] text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add First Billing Entity
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingEntities.map((be) => (
                    <div key={be.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{be.legal_name}</h4>
                            {be.is_default && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                PRIMARY ENTITY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Trade Name: {be.trade_name} • Invoice Prefix: <strong>{be.invoice_prefix}</strong></p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 font-bold text-slate-800">
                            GSTIN: {be.gstin}
                          </span>
                          <span className="font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">
                            State Code: {be.state_code}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-semibold">Registered Office:</span>
                          <span className="text-slate-700">{be.registered_address}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Disbursement Bank Account:</span>
                          <span className="text-slate-700 font-medium">
                            {be.bank_name || "Bank Not Configured"} {be.bank_account_number && `• A/c: ${be.bank_account_number}`} {be.bank_ifsc && `(IFSC: ${be.bank_ifsc})`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB S-62: CHARGE TYPES & TAX PROFILES */}
          {activeTab === "s62" && chargesData && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Standard Charge Types &amp; Tax Catalog</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statutory HSN/SAC classification, 18% GST rates, and standard Indian TDS deduction sections.</p>
              </div>

              {/* Explanatory Banner for User */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-emerald-900">Pre-Configured Statutory Standards (India):</span> In Indian commercial leasing, Base Lease Rent is classified under <strong>SAC 997212</strong> (18% GST, 10% TDS under Section 194-I), and CAM maintenance services fall under contractual upkeep (18% GST, 2% TDS under Section 194-C). The platform automatically applies these statutory rules to your rent roll calculations so you don't need to manually configure tax equations.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Charge Component</th>
                      <th className="py-2.5 px-3">Billing Model</th>
                      <th className="py-2.5 px-3">HSN / SAC</th>
                      <th className="py-2.5 px-3">SAC Description</th>
                      <th className="py-2.5 px-3 text-center">GST Slab</th>
                      <th className="py-2.5 px-3 text-center">TDS Section</th>
                      <th className="py-2.5 px-3 text-right">TDS Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chargesData.charges.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{c.charge_type}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 uppercase text-[11px]">{c.billing_model}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0D7B6C]">{c.hsn_sac_code}</td>
                        <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs">{c.hsn_description}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">{c.gst_rate_pct}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800 text-[11px]">
                            {c.tds_section}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{c.tds_rate_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB S-63: NUMBERING & FINANCIAL CONTROLS */}
          {activeTab === "s63" && numberingData && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Numbering &amp; Sequential Controls</h3>
                <p className="text-xs text-slate-500 mt-0.5">Consecutive invoice serialization conforming to Indian GST Rule 46(b).</p>
              </div>

              {/* Explanatory Banner for User */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
                <Info size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-teal-900">Automated Numbering Engine:</span> Under GST regulations, every tax invoice issued must follow a consecutive sequential number unique for a financial year (not exceeding 16 alphanumeric characters). The system automatically increments this sequence (e.g. <code>INV/2026-27/0001</code>) with every invoice generated.
                </div>
              </div>

              {/* Numbering Series Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Document Type</th>
                      <th className="py-2.5 px-3">Prefix</th>
                      <th className="py-2.5 px-3">Sequence Mask Pattern</th>
                      <th className="py-2.5 px-3">Next Generated Number</th>
                      <th className="py-2.5 px-3">Reset Cycle</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {numberingData.sequences.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-bold text-slate-900">{s.title}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{s.prefix}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{s.mask}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0D7B6C]">{s.next_number}</td>
                        <td className="py-3 px-3 text-slate-600 capitalize">{s.reset_frequency.replace("_", " ")}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB S-64: ALERT RULES CONFIGURATION */}
          {activeTab === "s64" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Alert Rules &amp; Reminders</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated notifications for lease expiries, rent step escalations, and lock-in windows.</p>
              </div>

              {/* Explanatory Banner for User */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-amber-900">Proactive Lease Lifecycle Alerts:</span> The system runs a daily automated monitor across your tenant contracts. Whenever a contract approaches its lock-in end or expiry (365d, 180d, 90d, 30d) or a scheduled rent hike is due, alerts are automatically triggered so no revenue escalation is missed.
                </div>
              </div>

              <div className="space-y-3">
                {alertRules.map((rule) => (
                  <div key={rule.code} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {rule.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          rule.severity === "critical" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-semibold">Channels:</span>
                        {rule.channels.in_app && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-medium">In-app</span>}
                        {rule.channels.email && <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-medium">Email</span>}
                        {rule.channels.whatsapp && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-medium rounded">WhatsApp</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 text-slate-600">
                      <div>
                        <span>Offsets: <strong>{rule.trigger_offsets.join("d, ")}d</strong></span>
                        <span className="mx-2">•</span>
                        <span>Auto-resolves: <em>{rule.auto_resolves}</em></span>
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        Target: {rule.recipients.join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB S-66: USERS, ROLES & APPROVAL MATRIX */}
          {activeTab === "s66" && usersData && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Team Members &amp; Operational Roles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Invite property managers, accountants, and staff to assist with your portfolio operations.</p>
                </div>
                <button
                  onClick={() => setShowInviteUserModal(true)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus size={14} /> Invite Team Member
                </button>
              </div>

              {/* Explanatory Banner for User */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                <Info size={16} className="text-slate-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-slate-900">Access Roles &amp; Dual Controls:</span> You can delegate day-to-day operations to external Property Managers or Accountants while maintaining sovereign owner controls. For high-value transactions (such as major rent credit notes), dual-authorization ensures maker and checker are separate.
                </div>
              </div>

              {/* Users Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Portfolio Users</h4>

                {usersData.users && usersData.users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">User</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Assigned Scope / Properties</th>
                          <th className="py-2.5 px-3">Last Active</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersData.users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{u.full_name}</span>
                              <span className="text-slate-400 text-[11px]">{u.email}</span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-700 capitalize">
                              {u.role.replace("_", " ")}
                            </td>
                            <td className="py-3 px-3 text-slate-600">{Array.isArray(u.assigned_properties) ? u.assigned_properties.join(", ") : u.assigned_properties}</td>
                            <td className="py-3 px-3 text-slate-500">{u.last_login}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-4">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No additional team members invited yet. Only your owner account has access.</p>
                  </div>
                )}
              </div>

              {/* Maker-Checker Thresholds */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dual-Control Financial Approval Safeguards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {usersData.approval_matrix.map((m: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900">{m.action_name}</div>
                      <div className="flex justify-between text-slate-600">
                        <span>Maker: <strong>{m.maker_role}</strong></span>
                        <span>Checker: <strong>{m.checker_role}</strong></span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                        {m.threshold_rule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB S-67: AUDIT LOG TIMELINE */}
          {activeTab === "s67" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Audit Trail History</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Immutable timestamped record of financial changes, lease amendments, and data actions for statutory compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter actions..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D7B6C]"
                    />
                  </div>
                  <a
                    href="/api/settings/audit?format=csv"
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
                  >
                    <Download size={14} /> Export CSV
                  </a>
                </div>
              </div>

              {/* Explanatory Banner for User */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                <Info size={16} className="text-slate-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-slate-900">Compliance &amp; RERA Record:</span> This is a permanent, non-editable security log of all major actions performed on your portfolio. It provides proof of who created leases, adjusted rent numbers, or generated invoices during external financial audits.
                </div>
              </div>

              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl p-4">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No audit events logged yet. Events are recorded automatically when properties and leases are updated.</p>
                  </div>
                ) : (
                  auditLogs
                    .filter((l) =>
                      auditSearch
                        ? l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          l.user_name.toLowerCase().includes(auditSearch.toLowerCase())
                        : true
                    )
                    .map((log) => (
                      <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {log.action}
                            </span>
                            <span className="font-bold text-slate-900">{log.entity}</span>
                            <span className="font-mono text-slate-400 text-[11px]">{log.record_id}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                        </div>

                        <p className="text-slate-700">{log.details}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500 text-[11px]">
                          <span>User: <strong>{log.user_name}</strong> ({log.user_role})</span>
                          <span>IP: {log.ip_address} • Source: {log.source}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Add Billing Entity */}
      {showAddBillingEntityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Billing SPV / Entity</h3>
              <button
                onClick={() => setShowAddBillingEntityModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBillingEntity} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    Legal Entity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prestige Estates Projects Ltd"
                    value={newBillingEntity.legal_name}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, legal_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Trade / Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prestige Tech Park SPV"
                    value={newBillingEntity.trade_name}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, trade_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AAACA1234A"
                    value={newBillingEntity.pan}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, pan: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">
                    GSTIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="29AAACA1234A1Z5"
                    value={newBillingEntity.gstin}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">State Code</label>
                  <input
                    type="text"
                    placeholder="29 (KA)"
                    value={newBillingEntity.state_code}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, state_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Registered Entity Address</label>
                <textarea
                  rows={2}
                  placeholder="Official registered company office address"
                  value={newBillingEntity.registered_address}
                  onChange={(e) => setNewBillingEntity({ ...newBillingEntity, registered_address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Disbursement Bank Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={newBillingEntity.bank_name}
                      onChange={(e) => setNewBillingEntity({ ...newBillingEntity, bank_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50200012345678"
                      value={newBillingEntity.bank_account_number}
                      onChange={(e) => setNewBillingEntity({ ...newBillingEntity, bank_account_number: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0000123"
                      value={newBillingEntity.bank_ifsc}
                      onChange={(e) => setNewBillingEntity({ ...newBillingEntity, bank_ifsc: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-semibold">Invoice Number Prefix</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026"
                      value={newBillingEntity.invoice_prefix}
                      onChange={(e) => setNewBillingEntity({ ...newBillingEntity, invoice_prefix: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={newBillingEntity.is_default}
                    onChange={(e) => setNewBillingEntity({ ...newBillingEntity, is_default: e.target.checked })}
                    className="rounded text-[#0D7B6C] focus:ring-[#0D7B6C]"
                  />
                  Set as primary default billing entity
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBillingEntityModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0D7B6C] hover:bg-[#09574C] text-white font-bold rounded-xl shadow-sm"
                  >
                    Save Billing Entity
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite User */}
      {showInviteUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Operational Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="property_manager">Property Manager (Maker: Lease amendments, inspections)</option>
                  <option value="finance_maker">Finance / Accountant (Drafts invoices & receipts)</option>
                  <option value="asset_manager">Asset Manager (Checker: Approves leases & credit notes)</option>
                  <option value="auditor">Auditor / Viewer (Read-only access to rent roll & reports)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteUserModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D7B6C] hover:bg-[#09574C] text-white font-bold rounded-xl shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}