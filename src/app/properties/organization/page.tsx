"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  FileText,
  BadgeAlert,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { ProfileAndBankingModal } from "@/components/rent-roll/ProfileAndBankingModal";

export default function OrganizationProfilePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"profile" | "banking" | "spvs" | "governance">("profile");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAccountNum, setShowAccountNum] = useState(false);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rent-roll/organization");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load organization data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openModal = (tab: "profile" | "banking" | "spvs" | "governance") => {
    setModalTab(tab);
    setIsEditModalOpen(true);
  };

  const org = data?.organization || {};
  const billingEntities = data?.billingEntities || [];
  const primaryEntity = billingEntities.find((b: any) => b.isDefault) || billingEntities[0] || {};
  const branding = data?.config?.branding || {};

  // Resolve values with fallback to local storage or defaults
  const legalName = org.legalName || org.name || (typeof window !== "undefined" ? localStorage.getItem("officex_org_name") : "") || "Organization Name";
  const tradeName = org.tradeName || legalName;
  const pan = (org.pan || primaryEntity.pan || "").toUpperCase();
  const gstin = (org.gstin || primaryEntity.gstin || "").toUpperCase();
  const address = org.address || primaryEntity.registeredAddress || "";
  const city = org.city || "";
  const state = org.state || primaryEntity.stateCode || "";
  const currency = org.currency || "INR (₹)";

  const bankName = org.bankName || primaryEntity.bankName || "HDFC Bank";
  const bankAccountNumber = org.bankAccountNumber || primaryEntity.bankAccountNumber || "";
  const bankIfsc = (org.bankIfsc || primaryEntity.bankIfsc || "").toUpperCase();
  const bankBranch = org.bankBranch || primaryEntity.bankBranch || "Corporate Banking Branch";
  const accountType = org.accountType || "Corporate Current Account";

  const contactPerson = org.contactPerson || (typeof window !== "undefined" ? localStorage.getItem("officex_user_name") : "") || "Portfolio Executive";
  const contactEmail = org.contactEmail || (typeof window !== "undefined" ? localStorage.getItem("officex_user_email") : "") || "finance@domain.com";
  const contactPhone = org.contactPhone || "+91 98765 43210";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/properties" className="hover:text-slate-900 transition-colors">Portfolio</Link>
            <ChevronRight size={12} />
            <span className="text-teal-700">Organization Profile</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="text-[#0F8B7D]" size={26} />
            Organization &amp; Settlement Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your live corporate legal entity, Indian tax registration (GSTIN/PAN), settlement bank accounts, and SPVs configured during onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchOrganization()}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#0F8B7D]" : ""} />
          </button>

          <button
            onClick={() => openModal("profile")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F8B7D] hover:bg-[#0D7A6D] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Profile &amp; Banking</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-50/50 via-emerald-50/20 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F8B7D] to-teal-400 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {legalName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{legalName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Verified Commercial Entity
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  FY 2026-27 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                <span>Trade / Brand Name: <strong className="text-slate-700">{tradeName}</strong></span>
                <span>•</span>
                <span>Currency: <strong className="text-slate-700">{currency}</strong></span>
              </p>
              {address && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>{address}{city ? `, ${city}` : ""}{state ? `, ${state}` : ""}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-right hidden md:block">
              <span className="text-[11px] text-slate-400 font-mono block">Primary Entity ID</span>
              <span className="text-xs font-mono font-bold text-slate-700">{org.id || primaryEntity.id || "ORG-OFFICEX-001"}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal("banking")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <CreditCard size={13} className="text-[#0F8B7D]" />
                <span>Bank Details</span>
              </button>
              <button
                onClick={() => openModal("spvs")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Layers size={13} className="text-blue-600" />
                <span>Manage SPVs ({billingEntities.length || 1})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Statutory Tax Compliance & Settlement Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Statutory & Tax Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tax &amp; Statutory Compliance</h3>
                <p className="text-[11px] text-slate-500">Government of India tax identity details</p>
              </div>
            </div>
            <button
              onClick={() => openModal("profile")}
              className="text-xs font-semibold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              <span>Edit</span>
              <Edit3 size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {/* PAN */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Permanent Account Number (PAN)</span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  {pan || "Not Provided"}
                </span>
              </div>
              {pan && (
                <button
                  onClick={() => handleCopy(pan, "pan")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="Copy PAN"
                >
                  {copiedField === "pan" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {/* GSTIN */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GST Identification Number (GSTIN)</span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  {gstin || "Not Provided"}
                </span>
              </div>
              {gstin && (
                <button
                  onClick={() => handleCopy(gstin, "gstin")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="Copy GSTIN"
                >
                  {copiedField === "gstin" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {/* State & Invoicing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">State Jurisdiction</span>
                <span className="text-xs font-semibold text-slate-800 block truncate mt-0.5">
                  {state || "Gujarat / Maharashtra"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Invoice Series</span>
                <span className="text-xs font-mono font-semibold text-slate-800 block truncate mt-0.5">
                  {primaryEntity.invoicePrefix || org.invoicePrefix || "INV-2026"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Settlement Bank Account */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Settlement Bank Account</h3>
                <p className="text-[11px] text-slate-500">Destination account for tenant rent deposits</p>
              </div>
            </div>
            <button
              onClick={() => openModal("banking")}
              className="text-xs font-semibold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              <span>Update</span>
              <Edit3 size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Bank Name & Branch */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bank &amp; Branch</span>
                <span className="text-sm font-bold text-slate-900 capitalize block">
                  {bankName}
                </span>
                {bankBranch && <span className="text-[11px] text-slate-500 block">{bankBranch}</span>}
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                Active
              </span>
            </div>

            {/* Account Number */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Number</span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  {bankAccountNumber
                    ? (showAccountNum
                        ? bankAccountNumber
                        : `•••• •••• ${bankAccountNumber.slice(-4)}`)
                    : "Not Configured"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {bankAccountNumber && (
                  <button
                    onClick={() => setShowAccountNum(!showAccountNum)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    title={showAccountNum ? "Mask Account" : "Reveal Account"}
                  >
                    {showAccountNum ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
                {bankAccountNumber && (
                  <button
                    onClick={() => handleCopy(bankAccountNumber, "bankAccountNumber")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedField === "bankAccountNumber" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* IFSC & Account Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">IFSC Code</span>
                  <span className="text-xs font-mono font-bold text-slate-900 block truncate mt-0.5">
                    {bankIfsc || "Not Set"}
                  </span>
                </div>
                {bankIfsc && (
                  <button
                    onClick={() => handleCopy(bankIfsc, "bankIfsc")}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  >
                    {copiedField === "bankIfsc" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Type</span>
                <span className="text-xs font-semibold text-slate-800 block truncate mt-0.5">
                  {accountType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple SPVs & Billing Entities Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-blue-600" size={18} />
              Billing Entities &amp; SPVs ({billingEntities.length || 1})
            </h3>
            <p className="text-xs text-slate-500">
              Commercial properties can be billed under individual Special Purpose Vehicles (SPVs) with distinct GSTINs and settlement banks.
            </p>
          </div>
          <button
            onClick={() => openModal("spvs")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 transition-colors"
          >
            <Plus size={13} />
            <span>Add / Manage SPVs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(billingEntities.length > 0 ? billingEntities : [primaryEntity]).map((be: any, index: number) => (
            <div key={be.id || index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{be.legalName || legalName}</h4>
                    {be.isDefault && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block">{be.tradeName || tradeName}</span>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  {be.invoicePrefix || `INV-${index + 1}`}
                </span>
              </div>

              <div className="text-[11px] space-y-1 pt-2 border-t border-slate-200/60 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="font-mono font-medium text-slate-800">{be.gstin || gstin || "Pending"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PAN:</span>
                  <span className="font-mono font-medium text-slate-800">{be.pan || pan || "Pending"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <span className="font-medium text-slate-800">{be.bankName || bankName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authorized Representatives & Governance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Representative */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authorized Contact Person</h3>
                <p className="text-[11px] text-slate-500">Commercial lease signatory &amp; primary executive</p>
              </div>
            </div>
            <button
              onClick={() => openModal("profile")}
              className="text-xs font-semibold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              <span>Edit</span>
              <Edit3 size={12} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Designated Representative</span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">{contactPerson}</span>
              <span className="text-[11px] text-slate-500 block">Portfolio Executive &amp; Asset Owner</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Official Email</span>
                  <span className="text-xs font-medium text-slate-800 truncate block">{contactEmail}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Mobile Contact</span>
                  <span className="text-xs font-medium text-slate-800 truncate block">{contactPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration & Tenant Settlement Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">ERP &amp; Settlement Routing</h3>
                <p className="text-[11px] text-slate-500">Live connectors for Tally, Zoho, and virtual accounts</p>
              </div>
            </div>
            <Link
              href="/properties/integrations"
              className="text-xs font-semibold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              <span>Integrations Hub</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  TP
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Tally Prime Direct Sync</span>
                  <span className="text-[11px] text-slate-500">Voucher &amp; Tenant Ledger Export</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                Ready
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  ZB
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Zoho Books API</span>
                  <span className="text-[11px] text-slate-500">Automatic Invoice Reconciliation</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
                Configurable
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Escrow / Nodal Settlement Routing</span>
                  <span className="text-[11px] text-slate-500">Direct Tenant-to-Landlord Bank Gateway</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Organization Modal */}
      <ProfileAndBankingModal
        isOpen={isEditModalOpen}
        initialTab={modalTab}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchOrganization();
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
