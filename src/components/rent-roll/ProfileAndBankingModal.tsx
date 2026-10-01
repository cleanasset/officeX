"use client";

import React, { useState, useEffect } from "react";
import {
  X,
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
  Save,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";

interface BillingEntityItem {
  id?: string;
  legalName: string;
  tradeName?: string;
  pan: string;
  gstin: string;
  stateCode: string;
  registeredAddress: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  invoicePrefix: string;
  isDefault: boolean;
}

interface ProfileAndBankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: "profile" | "banking" | "spvs" | "governance";
}

export const ProfileAndBankingModal: React.FC<ProfileAndBankingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "banking"
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "banking" | "spvs" | "governance">(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAccountNum, setShowAccountNum] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Profile / Organization State
  const [orgProfile, setOrgProfile] = useState({
    legalName: "",
    tradeName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    role: "Portfolio Executive & Asset Owner",
    pan: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    currency: "INR"
  });

  // Primary Banking Details State
  const [bankingData, setBankingData] = useState({
    bankName: "HDFC Bank Ltd",
    bankAccountNumber: "",
    bankIfsc: "",
    bankBranch: "",
    accountType: "Corporate Current Account",
    settlementRouting: "direct_escrow", // direct_escrow, nodal, virtual_ac
    isVerified: true
  });

  // Multiple SPV Billing Entities State
  const [billingEntities, setBillingEntities] = useState<BillingEntityItem[]>([]);
  const [isAddingSpv, setIsAddingSpv] = useState(false);
  const [newSpv, setNewSpv] = useState<BillingEntityItem>({
    legalName: "",
    tradeName: "",
    pan: "",
    gstin: "",
    stateCode: "27",
    registeredAddress: "",
    bankName: "HDFC Bank Ltd",
    bankAccountNumber: "",
    bankIfsc: "",
    bankBranch: "",
    invoicePrefix: "INV-2026",
    isDefault: false
  });

  // Governance Settings State
  const [governance, setGovernance] = useState({
    makerCheckerLease: true,
    makerCheckerBilling: true,
    defaultGstPct: 18,
    defaultPaymentDueDays: 15,
    invoiceHeaderMemo: ""
  });

  // Load current values on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch from backend /api/rent-roll/organization
        const orgRes = await fetch("/api/rent-roll/organization");
        if (orgRes.ok) {
          const data = await orgRes.json();
          if (isMounted && data) {
            const org = data.organization || data;
            const entities: BillingEntityItem[] = data.billingEntities || [];
            const defaultEntity = entities.find(e => e.isDefault) || entities[0];

            // Local storage overrides for personal contact if present
            const localUser = typeof window !== "undefined" ? {
              name: localStorage.getItem("officex_user_name") || "",
              email: localStorage.getItem("officex_user_email") || "",
              phone: localStorage.getItem("officex_user_phone") || "",
              role: localStorage.getItem("officex_user_role") || "Portfolio Executive & Asset Owner"
            } : { name: "", email: "", phone: "", role: "" };

            setOrgProfile({
              legalName: org.name || org.legalName || localStorage.getItem("officex_org_name") || "",
              tradeName: org.tradeName || org.name || "",
              contactPerson: org.contactPerson || localUser.name || "Portfolio Admin",
              contactEmail: org.contactEmail || localUser.email || "cfo@officex.com",
              contactPhone: org.contactPhone || localUser.phone || "+91 98200 11223",
              role: localUser.role || "Portfolio Executive & Asset Owner",
              pan: org.pan || "",
              gstin: org.gstin || "",
              address: org.address || "",
              city: org.city || "",
              state: org.state || "",
              pincode: org.pincode || "",
              currency: org.currency || "INR"
            });

            if (defaultEntity) {
              setBankingData({
                bankName: defaultEntity.bankName || "HDFC Bank Ltd",
                bankAccountNumber: defaultEntity.bankAccountNumber || "",
                bankIfsc: defaultEntity.bankIfsc || "",
                bankBranch: defaultEntity.bankBranch || "",
                accountType: "Corporate Current Account",
                settlementRouting: "direct_escrow",
                isVerified: true
              });
            }

            setBillingEntities(entities);

            if (data.config) {
              setGovernance({
                makerCheckerLease: data.config.makerCheckerLease ?? true,
                makerCheckerBilling: data.config.makerCheckerBilling ?? true,
                defaultGstPct: data.config.defaultGstPct || 18,
                defaultPaymentDueDays: data.config.defaultPaymentDueDays || 15,
                invoiceHeaderMemo: data.config.branding?.invoiceHeaderMemo || ""
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile and banking data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [isOpen]);

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Sync primary banking details into the default billing entity
      let updatedEntities = [...billingEntities];
      if (updatedEntities.length === 0) {
        updatedEntities.push({
          id: `BE-${Date.now()}`,
          legalName: orgProfile.legalName || "Primary Asset SPV",
          tradeName: orgProfile.tradeName || orgProfile.legalName || "Primary Asset",
          pan: orgProfile.pan.toUpperCase().trim(),
          gstin: orgProfile.gstin.toUpperCase().trim(),
          stateCode: orgProfile.gstin ? orgProfile.gstin.substring(0, 2) : "27",
          registeredAddress: orgProfile.address,
          bankName: bankingData.bankName,
          bankAccountNumber: bankingData.bankAccountNumber,
          bankIfsc: bankingData.bankIfsc.toUpperCase().trim(),
          bankBranch: bankingData.bankBranch,
          invoicePrefix: "INV-2026",
          isDefault: true
        });
      } else {
        const defIdx = updatedEntities.findIndex(e => e.isDefault);
        const targetIdx = defIdx !== -1 ? defIdx : 0;
        updatedEntities[targetIdx] = {
          ...updatedEntities[targetIdx],
          bankName: bankingData.bankName,
          bankAccountNumber: bankingData.bankAccountNumber,
          bankIfsc: bankingData.bankIfsc.toUpperCase().trim(),
          bankBranch: bankingData.bankBranch,
          legalName: updatedEntities[targetIdx].legalName || orgProfile.legalName,
          pan: orgProfile.pan ? orgProfile.pan.toUpperCase().trim() : updatedEntities[targetIdx].pan,
          gstin: orgProfile.gstin ? orgProfile.gstin.toUpperCase().trim() : updatedEntities[targetIdx].gstin
        };
      }

      // 2. Post to /api/rent-roll/organization
      const res = await fetch("/api/rent-roll/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: orgProfile.legalName,
          name: orgProfile.legalName,
          tradeName: orgProfile.tradeName,
          pan: orgProfile.pan.toUpperCase().trim(),
          gstin: orgProfile.gstin.toUpperCase().trim(),
          address: orgProfile.address,
          city: orgProfile.city,
          state: orgProfile.state,
          pincode: orgProfile.pincode,
          currency: orgProfile.currency,
          contactPerson: orgProfile.contactPerson,
          contactEmail: orgProfile.contactEmail,
          contactPhone: orgProfile.contactPhone,
          bankName: bankingData.bankName,
          bankAccountNumber: bankingData.bankAccountNumber,
          bankIfsc: bankingData.bankIfsc.toUpperCase().trim(),
          bankBranch: bankingData.bankBranch,
          billingEntities: updatedEntities,
          makerCheckerLease: governance.makerCheckerLease,
          makerCheckerBilling: governance.makerCheckerBilling,
          defaultGstPct: Number(governance.defaultGstPct) || 18,
          defaultPaymentDueDays: Number(governance.defaultPaymentDueDays) || 15,
          branding: {
            invoiceHeaderMemo: governance.invoiceHeaderMemo
          }
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile and banking details");
      }

      // 3. Update localStorage session variables so user sees changes immediately
      if (typeof window !== "undefined") {
        if (orgProfile.legalName) localStorage.setItem("officex_org_name", orgProfile.legalName);
        if (orgProfile.contactPerson) localStorage.setItem("officex_user_name", orgProfile.contactPerson);
        if (orgProfile.contactEmail) localStorage.setItem("officex_user_email", orgProfile.contactEmail);
        if (orgProfile.contactPhone) localStorage.setItem("officex_user_phone", orgProfile.contactPhone);
        if (orgProfile.role) localStorage.setItem("officex_user_role", orgProfile.role);
      }

      setBillingEntities(updatedEntities);
      setSaveSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSpvEntity = () => {
    if (!newSpv.legalName || !newSpv.gstin) {
      alert("Please provide at least Legal SPV Name and 15-digit GSTIN.");
      return;
    }
    const created: BillingEntityItem = {
      ...newSpv,
      id: `BE-${Date.now()}`,
      pan: newSpv.pan || newSpv.gstin.substring(2, 12),
      bankIfsc: newSpv.bankIfsc.toUpperCase().trim(),
      gstin: newSpv.gstin.toUpperCase().trim(),
      isDefault: billingEntities.length === 0
    };
    setBillingEntities([...billingEntities, created]);
    setIsAddingSpv(false);
    setNewSpv({
      legalName: "",
      tradeName: "",
      pan: orgProfile.pan || "",
      gstin: "",
      stateCode: orgProfile.state || "27",
      registeredAddress: orgProfile.address || "",
      bankName: bankingData.bankName || "HDFC Bank Ltd",
      bankAccountNumber: "",
      bankIfsc: "",
      bankBranch: "",
      invoicePrefix: "INV-2026",
      isDefault: false
    });
  };

  const handleRemoveSpvEntity = (id?: string) => {
    if (billingEntities.length <= 1) {
      alert("At least one statutory billing entity must remain configured.");
      return;
    }
    setBillingEntities(billingEntities.filter(b => b.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* ──── MODAL HEADER ──── */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-teal-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Profile & Banking Settings</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Institutional KYC
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Manage your entity legal profile, bank settlement accounts, and statutory tax parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ──── TAB NAVIGATION ──── */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("banking")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "banking"
                ? "bg-white text-teal-700 shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span>Primary Banking Details</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-white text-teal-700 shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Organization & Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("spvs")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "spvs"
                ? "bg-white text-teal-700 shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>SPV Entities & State GSTINs ({billingEntities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("governance")}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "governance"
                ? "bg-white text-teal-700 shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Invoicing & Dual Controls</span>
          </button>
        </div>

        {/* ──── BODY CONTENT ──── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading current banking and profile configuration...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: BANKING DETAILS */}
              {activeTab === "banking" && (
                <div className="space-y-6">
                  {/* Bank Account Highlights Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-teal-300" />
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-300/80 font-bold uppercase tracking-wider block">Official Collection Bank</span>
                          <span className="text-sm font-bold text-white">{bankingData.bankName || "HDFC Bank Ltd"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Escrow Nodal Verified
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs relative z-10">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 block text-[10px] font-medium mb-1">Account Number</span>
                        <div className="flex items-center justify-between font-mono font-bold text-sm text-white">
                          <span>
                            {showAccountNum 
                              ? (bankingData.bankAccountNumber || "Not Configured")
                              : (bankingData.bankAccountNumber ? `•••• •••• ${bankingData.bankAccountNumber.slice(-4)}` : "•••• •••• ••••")}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowAccountNum(!showAccountNum)}
                              className="text-slate-400 hover:text-white p-1"
                              title={showAccountNum ? "Hide" : "Reveal"}
                            >
                              {showAccountNum ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankingData.bankAccountNumber, "accNum")}
                              className="text-slate-400 hover:text-white p-1"
                              title="Copy"
                            >
                              {copiedField === "accNum" ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 block text-[10px] font-medium mb-1">IFSC Code</span>
                        <div className="flex items-center justify-between font-mono font-bold text-sm text-white">
                          <span>{bankingData.bankIfsc || "HDFC0000060"}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(bankingData.bankIfsc, "ifsc")}
                            className="text-slate-400 hover:text-white p-1"
                            title="Copy"
                          >
                            {copiedField === "ifsc" ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-slate-400 block text-[10px] font-medium mb-1">Branch Location</span>
                        <span className="font-semibold text-slate-200 block truncate">{bankingData.bankBranch || "BKC Special Financial Services Branch"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form to Edit Banking Details */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-teal-600" />
                      <span>Edit Primary Bank Details for Rent & CAM Collections</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Bank Name</label>
                        <select
                          value={bankingData.bankName}
                          onChange={(e) => setBankingData({ ...bankingData, bankName: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-600"
                        >
                          <option value="HDFC Bank Ltd">HDFC Bank Ltd</option>
                          <option value="ICICI Bank Ltd">ICICI Bank Ltd</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="Axis Bank Ltd">Axis Bank Ltd</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                          <option value="HSBC India">HSBC India</option>
                          <option value="Citibank N.A.">Citibank N.A.</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Account Type</label>
                        <select
                          value={bankingData.accountType}
                          onChange={(e) => setBankingData({ ...bankingData, accountType: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-600"
                        >
                          <option value="Corporate Current Account">Corporate Current Account</option>
                          <option value="Escrow Nodal Collection A/c">Escrow Nodal Collection A/c (Razorpay / Bank Escrow)</option>
                          <option value="Strata Asset Trust Remittance A/c">Strata Asset Trust Remittance A/c</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Bank Account Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankingData.bankAccountNumber}
                          onChange={(e) => setBankingData({ ...bankingData, bankAccountNumber: e.target.value.replace(/[^0-9]/g, "") })}
                          placeholder="e.g. 50200088991122"
                          className="w-full text-xs font-mono font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">9 to 18 numeric digits printed on commercial invoices</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          IFSC Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankingData.bankIfsc}
                          onChange={(e) => setBankingData({ ...bankingData, bankIfsc: e.target.value.toUpperCase().trim() })}
                          placeholder="e.g. HDFC0000060"
                          maxLength={11}
                          className="w-full text-xs font-mono uppercase font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">11 characters (e.g. 4 letters, 0, 6 alphanumeric)</span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Branch Location / Address</label>
                        <input
                          type="text"
                          value={bankingData.bankBranch}
                          onChange={(e) => setBankingData({ ...bankingData, bankBranch: e.target.value })}
                          placeholder="e.g. Bandra Kurla Complex (BKC) Branch, Mumbai 400051"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & ORGANIZATION */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Entity Profile Card */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span>Commercial Asset Organization Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Organization / Company Legal Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={orgProfile.legalName}
                          onChange={(e) => setOrgProfile({ ...orgProfile, legalName: e.target.value })}
                          placeholder="e.g. Apex Asset Management India Pvt Ltd"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Trade Name / Brand Display</label>
                        <input
                          type="text"
                          value={orgProfile.tradeName}
                          onChange={(e) => setOrgProfile({ ...orgProfile, tradeName: e.target.value })}
                          placeholder="e.g. Apex Business Towers"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Entity PAN (Income Tax)</label>
                        <input
                          type="text"
                          value={orgProfile.pan}
                          onChange={(e) => setOrgProfile({ ...orgProfile, pan: e.target.value.toUpperCase().trim() })}
                          placeholder="e.g. AAFCO1234F"
                          maxLength={10}
                          className="w-full text-xs font-mono uppercase font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Primary GSTIN (State GST)</label>
                        <input
                          type="text"
                          value={orgProfile.gstin}
                          onChange={(e) => setOrgProfile({ ...orgProfile, gstin: e.target.value.toUpperCase().trim() })}
                          placeholder="e.g. 27AAFCO1234F1Z5"
                          maxLength={15}
                          className="w-full text-xs font-mono uppercase font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Registered Office Address</label>
                        <input
                          type="text"
                          value={orgProfile.address}
                          onChange={(e) => setOrgProfile({ ...orgProfile, address: e.target.value })}
                          placeholder="e.g. Level 14, Tower 2, One International Center, Senapati Bapat Marg"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">City</label>
                        <input
                          type="text"
                          value={orgProfile.city}
                          onChange={(e) => setOrgProfile({ ...orgProfile, city: e.target.value })}
                          placeholder="e.g. Mumbai"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">State & Pincode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={orgProfile.state}
                            onChange={(e) => setOrgProfile({ ...orgProfile, state: e.target.value })}
                            placeholder="e.g. Maharashtra"
                            className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                          />
                          <input
                            type="text"
                            value={orgProfile.pincode}
                            onChange={(e) => setOrgProfile({ ...orgProfile, pincode: e.target.value })}
                            placeholder="e.g. 400013"
                            className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Contact Profile */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-600" />
                      <span>Authorized Representative / Contact Profile</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={orgProfile.contactPerson}
                          onChange={(e) => setOrgProfile({ ...orgProfile, contactPerson: e.target.value })}
                          placeholder="e.g. Aditya Singhal"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Platform User Role</label>
                        <input
                          type="text"
                          value={orgProfile.role}
                          onChange={(e) => setOrgProfile({ ...orgProfile, role: e.target.value })}
                          placeholder="e.g. Managing Director / Chief Asset Officer"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Official Email Address</label>
                        <input
                          type="email"
                          value={orgProfile.contactEmail}
                          onChange={(e) => setOrgProfile({ ...orgProfile, contactEmail: e.target.value })}
                          placeholder="e.g. aditya@apexrealty.in"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Direct Mobile Phone</label>
                        <input
                          type="tel"
                          value={orgProfile.contactPhone}
                          onChange={(e) => setOrgProfile({ ...orgProfile, contactPhone: e.target.value })}
                          placeholder="e.g. +91 98200 11223"
                          className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SPV BILLING ENTITIES */}
              {activeTab === "spvs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Configured SPV Entities & Bank Accounts</h3>
                      <p className="text-[11px] text-slate-500">Each entity issues GST-compliant tax invoices under its specific state registration & bank account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingSpv(true)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Billing SPV</span>
                    </button>
                  </div>

                  {isAddingSpv && (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-900">Add New Legal SPV Entity</span>
                        <button onClick={() => setIsAddingSpv(false)} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          placeholder="Legal SPV Name (e.g. Apex Realty Commercial SPV 1 Pvt Ltd)"
                          value={newSpv.legalName}
                          onChange={(e) => setNewSpv({ ...newSpv, legalName: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="15-digit GSTIN (e.g. 27AAFCO1234F1Z5)"
                          value={newSpv.gstin}
                          onChange={(e) => setNewSpv({ ...newSpv, gstin: e.target.value.toUpperCase().trim() })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono uppercase"
                        />
                        <input
                          type="text"
                          placeholder="Bank Name (e.g. HDFC Bank Ltd)"
                          value={newSpv.bankName}
                          onChange={(e) => setNewSpv({ ...newSpv, bankName: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={newSpv.bankAccountNumber}
                          onChange={(e) => setNewSpv({ ...newSpv, bankAccountNumber: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code (e.g. HDFC0000060)"
                          value={newSpv.bankIfsc}
                          onChange={(e) => setNewSpv({ ...newSpv, bankIfsc: e.target.value.toUpperCase().trim() })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono uppercase"
                        />
                        <input
                          type="text"
                          placeholder="Invoice Prefix (e.g. APX-INV-)"
                          value={newSpv.invoicePrefix}
                          onChange={(e) => setNewSpv({ ...newSpv, invoicePrefix: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSpvEntity}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Confirm & Add SPV Entity
                      </button>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {billingEntities.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                        No separate SPVs added. Using primary organization bank account as default.
                      </div>
                    ) : (
                      billingEntities.map((be, idx) => (
                        <div key={be.id || idx} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                              {be.stateCode || "IN"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{be.legalName}</span>
                                {be.isDefault && (
                                  <span className="px-2 py-0.2 rounded-full text-[9px] bg-teal-100 text-teal-800 font-bold">Default SPV</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-medium">
                                <span>GSTIN: <strong className="font-mono text-slate-700">{be.gstin || "N/A"}</strong></span>
                                <span>Bank: <strong className="text-slate-700">{be.bankName || "HDFC Bank"}</strong></span>
                                <span>A/c: <strong className="font-mono text-slate-700">{be.bankAccountNumber ? `••••${be.bankAccountNumber.slice(-4)}` : "N/A"}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveSpvEntity(be.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                              title="Delete Entity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: GOVERNANCE & INVOICE CONTROLS */}
              {activeTab === "governance" && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 text-xs">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-teal-600" />
                      <span>Commercial Governance & Maker-Checker Settings</span>
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={governance.makerCheckerLease}
                          onChange={(e) => setGovernance({ ...governance, makerCheckerLease: e.target.checked })}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">Require Dual Approval for New Leases (RR-AUD-04)</span>
                          <span className="text-[11px] text-slate-500">Commercial terms entered by an executive must be approved by an independent checker before becoming active.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={governance.makerCheckerBilling}
                          onChange={(e) => setGovernance({ ...governance, makerCheckerBilling: e.target.checked })}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">Require Approval for Monthly Batch Invoicing</span>
                          <span className="text-[11px] text-slate-500">Draft invoices must be verified before final dispatch and generation of tax serial numbers.</span>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Default GST Rate (%)</label>
                        <input
                          type="number"
                          value={governance.defaultGstPct}
                          onChange={(e) => setGovernance({ ...governance, defaultGstPct: Number(e.target.value) })}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Invoice Due Days</label>
                        <input
                          type="number"
                          value={governance.defaultPaymentDueDays}
                          onChange={(e) => setGovernance({ ...governance, defaultPaymentDueDays: Number(e.target.value) })}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Standard Invoice Memo / Bank Transfer Notes</label>
                        <textarea
                          rows={2}
                          value={governance.invoiceHeaderMemo}
                          onChange={(e) => setGovernance({ ...governance, invoiceHeaderMemo: e.target.value })}
                          placeholder="e.g. Please quote Invoice Number in NEFT/RTGS transfer narration. TDS certificate (Form 16A) must be provided quarterly."
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ──── MODAL FOOTER ──── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Details saved and updated across dashboard!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
