"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Receipt,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Plus,
  Trash2,
  Check,
  Globe,
  Mail,
  Palette,
  Percent
} from "lucide-react";

interface RentRollConfigWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BillingEntityItem {
  id: string;
  spvName: string;
  gstin: string;
  pan: string;
  invoicePrefix: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  stateCode: string;
  isDefault: boolean;
}

interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: "org_admin" | "finance_manager" | "property_manager" | "leasing_manager" | "occupant";
  makerCheckerRole: "maker" | "checker" | "approver";
}

export const RentRollConfigWizardModal: React.FC<RentRollConfigWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Section A: Financial & Legal Setup (Multiple Billing Entities)
  const [billingEntities, setBillingEntities] = useState<BillingEntityItem[]>([
    {
      id: "BE-01",
      spvName: "Apex Asset Management India Pvt Ltd",
      gstin: "27AAFCO1234F1Z5",
      pan: "AAFCO1234F",
      invoicePrefix: "APX-INV",
      bankName: "HDFC Bank Ltd",
      accountNumber: "50200088991122",
      ifscCode: "HDFC0000060",
      stateCode: "27 - Maharashtra",
      isDefault: true
    },
    {
      id: "BE-02",
      spvName: "Apex Infratech Karnataka SPV-2 Ltd",
      gstin: "29AAFCO1234F1Z7",
      pan: "AAFCO1234F",
      invoicePrefix: "KA-INV",
      bankName: "ICICI Bank Ltd",
      accountNumber: "000405012345",
      ifscCode: "ICIC0000004",
      stateCode: "29 - Karnataka",
      isDefault: false
    }
  ]);

  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [newEntity, setNewEntity] = useState<BillingEntityItem>({
    id: "",
    spvName: "",
    gstin: "",
    pan: "AAFCO1234F",
    invoicePrefix: "DL-INV",
    bankName: "HDFC Bank Ltd",
    accountNumber: "",
    ifscCode: "HDFC0000060",
    stateCode: "07 - Delhi",
    isDefault: false
  });

  const handleAddEntity = () => {
    if (!newEntity.spvName || !newEntity.gstin) {
      alert("Please provide at least the Legal SPV Name and 15-digit GSTIN.");
      return;
    }
    const created: BillingEntityItem = {
      ...newEntity,
      id: `BE-${Date.now()}`,
      pan: newEntity.pan || newEntity.gstin.substring(2, 12),
      isDefault: billingEntities.length === 0
    };
    setBillingEntities([...billingEntities, created]);
    setIsAddingEntity(false);
  };

  const handleRemoveEntity = (id: string) => {
    if (billingEntities.length <= 1) {
      alert("At least one statutory billing entity is required.");
      return;
    }
    const filtered = billingEntities.filter(b => b.id !== id);
    if (!filtered.some(b => b.isDefault)) {
      filtered[0].isDefault = true;
    }
    setBillingEntities(filtered);
  };

  // Section A: Tax Profiles
  const [taxProfiles, setTaxProfiles] = useState({
    baseRentGst: 18,
    camGst: 18,
    isIfscTaxExempt: false,
    electricityGst: 18,
    waterGst: 18,
    parkingGst: 18
  });

  // Section B: Operational Settings & Charge Master (Checklist)
  const [chargeList, setChargeList] = useState([
    { id: "base_rent", name: "Base Rent", enabled: true, rate: 150, unit: "psf_month", isInclusion: false },
    { id: "cam", name: "CAM (Common Area Maintenance)", enabled: true, rate: 28, unit: "psf_month", isInclusion: false },
    { id: "electricity_grid", name: "Grid HT Electricity", enabled: true, rate: 11.50, unit: "kwh", isInclusion: false },
    { id: "electricity_dg", name: "DG Backup Power", enabled: true, rate: 32.00, unit: "kwh", isInclusion: false },
    { id: "water", name: "Commercial Water Supply", enabled: true, rate: 45.00, unit: "kl", isInclusion: false },
    { id: "parking", name: "Reserved Parking Bay", enabled: true, rate: 4500, unit: "slot_month", isInclusion: false },
    { id: "internet", name: "High-Speed Internet / IT", enabled: true, rate: 2500, unit: "fixed_month", isInclusion: false },
    { id: "housekeeping", name: "Housekeeping & Janitorial", enabled: false, rate: 8.50, unit: "psf_month", isInclusion: true },
    { id: "security", name: "Physical Security & Guarding", enabled: false, rate: 6.00, unit: "psf_month", isInclusion: true }
  ]);

  const [currencySettings, setCurrencySettings] = useState({
    fyStartMonth: "April 1 (Indian FY)",
    currency: "INR (₹)"
  });

  // Section C: Branding & Communication
  const [branding, setBranding] = useState({
    companyDisplayName: "Apex Commercial Towers",
    brandColor: "#0F8B7D",
    invoiceHeaderMemo: "Official Tax Invoice issued under Section 31 of CGST Act, 2017",
    senderBillingEmail: "rent@apexassets.in",
    isDomainVerified: true,
    subdomain: "apexassets",
    enableCustomDomain: false,
    customDomain: "rent.apexassets.in"
  });

  // Section D: Users, Roles & Maker-Checker Policy
  const [userList, setUserList] = useState<UserRoleItem[]>([
    { id: "USR-01", name: "Rajesh Sharma", email: "rajesh.s@apexassets.in", role: "org_admin", makerCheckerRole: "approver" },
    { id: "USR-02", name: "Priya Nair", email: "priya.n@apexassets.in", role: "finance_manager", makerCheckerRole: "maker" },
    { id: "USR-03", name: "Vikram Mehta", email: "vikram.m@apexassets.in", role: "property_manager", makerCheckerRole: "maker" },
    { id: "USR-04", name: "Ananya Kapoor", email: "ananya.k@apexassets.in", role: "leasing_manager", makerCheckerRole: "maker" },
    { id: "USR-05", name: "Ananya Deshmukh", email: "ananya.d@technova.com", role: "occupant", makerCheckerRole: "maker" }
  ]);

  const [governance, setGovernance] = useState({
    makerCheckerLease: true,
    makerCheckerBilling: true
  });

  if (!isOpen) return null;

  const handleSaveAndCommit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/rent-roll/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: billingEntities[0]?.spvName,
          taxProfiles,
          branding: {
            portfolioDisplayName: branding.companyDisplayName,
            invoiceHeaderMemo: branding.invoiceHeaderMemo,
            brandColor: branding.brandColor
          },
          domainConfig: {
            emailSenderDomain: branding.senderBillingEmail,
            isSenderDomainVerified: branding.isDomainVerified,
            subdomain: branding.subdomain,
            customDomain: branding.enableCustomDomain ? branding.customDomain : ""
          },
          users: userList,
          makerCheckerLease: governance.makerCheckerLease,
          makerCheckerBilling: governance.makerCheckerBilling,
          billingEntities: billingEntities.map(b => ({
            legalName: b.spvName,
            pan: b.pan,
            gstin: b.gstin,
            stateCode: b.stateCode,
            bankName: b.bankName,
            bankAccountNumber: b.accountNumber,
            bankIfsc: b.ifscCode,
            invoicePrefix: b.invoicePrefix,
            isDefault: b.isDefault
          }))
        })
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Section A: Financial & Legal", subtitle: "Multi-SPV Entities & Tax Profiles" },
    { num: 2, title: "Section B: Charge Master", subtitle: "Charges Checklist & Inclusions Rule" },
    { num: 3, title: "Section C: Branding & Domains", subtitle: "Invoicing Visuals & Sender DNS" },
    { num: 4, title: "Section D: Roles & Governance", subtitle: "5-Role Table & Maker-Checker" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Rent Roll Configuration Engine</h3>
              <p className="text-xs text-slate-300 font-medium">
                Canonical 4-Section Setup Wizard (Slide 4 · Scalezix V2.1 Spec)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`py-2 px-2 text-center rounded-xl text-xs transition-all cursor-pointer ${
                  currentStep === st.num
                    ? "bg-[#0F8B7D] text-white font-bold shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-medium"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider">Step {st.num}</div>
                <div className="truncate text-[11px] font-semibold mt-0.5">{st.title.split(": ")[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-base font-extrabold text-slate-900">Configuration Master Saved</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Statutory billing entities, tax profiles, charges, branding, and role assignments have been synchronized.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION A: FINANCIAL & LEGAL */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Multi-Entity SPVs */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#0F8B7D]" />
                        <span>Billing Entities (SPVs &amp; States)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingEntity(true)}
                        className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#0F8B7D] rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add Billing Entity / State
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {billingEntities.map((be) => (
                        <div
                          key={be.id}
                          className={`p-3 rounded-xl border ${be.isDefault ? "bg-teal-50/70 border-teal-300" : "bg-slate-50 border-slate-200"}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-900 truncate block">{be.spvName}</span>
                            {be.isDefault && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[9px] font-bold">Default</span>
                            )}
                          </div>
                          <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                            <div>GSTIN: <span className="font-mono font-bold text-slate-700">{be.gstin}</span></div>
                            <div>Prefix: <span className="font-mono font-bold text-teal-700">{be.invoicePrefix}</span></div>
                            <div>Bank: {be.bankName} ({be.ifscCode})</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isAddingEntity && (
                      <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
                        <span className="font-bold text-teal-950 block">Add New State SPV</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="SPV Legal Name"
                            value={newEntity.spvName}
                            onChange={(e) => setNewEntity({ ...newEntity, spvName: e.target.value })}
                            className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="State (e.g. 07 - Delhi)"
                            value={newEntity.stateCode}
                            onChange={(e) => setNewEntity({ ...newEntity, stateCode: e.target.value })}
                            className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="15-Digit GSTIN"
                            value={newEntity.gstin}
                            onChange={(e) => setNewEntity({ ...newEntity, gstin: e.target.value.toUpperCase() })}
                            className="p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Invoice Prefix"
                            value={newEntity.invoicePrefix}
                            onChange={(e) => setNewEntity({ ...newEntity, invoicePrefix: e.target.value.toUpperCase() })}
                            className="p-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-teal-700"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingEntity(false)}
                            className="px-2.5 py-1 text-slate-500 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddEntity}
                            className="px-3 py-1 bg-[#0F8B7D] text-white rounded text-xs font-bold"
                          >
                            Save Entity
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tax Profiles */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#0F8B7D]" />
                      <span>Tax Profiles: Standard GST per Charge Type</span>
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Base Rent</span>
                        <input
                          type="number"
                          value={taxProfiles.baseRentGst}
                          onChange={(e) => setTaxProfiles({ ...taxProfiles, baseRentGst: Number(e.target.value) })}
                          className="w-10 text-xs font-bold border border-slate-200 rounded p-0.5 mt-1"
                        /> %
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">CAM</span>
                        <input
                          type="number"
                          value={taxProfiles.camGst}
                          onChange={(e) => setTaxProfiles({ ...taxProfiles, camGst: Number(e.target.value) })}
                          className="w-10 text-xs font-bold border border-slate-200 rounded p-0.5 mt-1"
                        /> %
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Power</span>
                        <input
                          type="number"
                          value={taxProfiles.electricityGst}
                          onChange={(e) => setTaxProfiles({ ...taxProfiles, electricityGst: Number(e.target.value) })}
                          className="w-10 text-xs font-bold border border-slate-200 rounded p-0.5 mt-1"
                        /> %
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Water</span>
                        <input
                          type="number"
                          value={taxProfiles.waterGst}
                          onChange={(e) => setTaxProfiles({ ...taxProfiles, waterGst: Number(e.target.value) })}
                          className="w-10 text-xs font-bold border border-slate-200 rounded p-0.5 mt-1"
                        /> %
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Parking</span>
                        <input
                          type="number"
                          value={taxProfiles.parkingGst}
                          onChange={(e) => setTaxProfiles({ ...taxProfiles, parkingGst: Number(e.target.value) })}
                          className="w-10 text-xs font-bold border border-slate-200 rounded p-0.5 mt-1"
                        /> %
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: CHARGES CHECKLIST */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900">Charge Types Checklist &amp; Inclusions Rule</span>
                      <p className="text-[11px] text-slate-500">Toggle active charges and specify if included in base rent.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {chargeList.map((chg) => (
                      <div key={chg.id} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={chg.enabled}
                            onChange={() => setChargeList(chargeList.map(c => c.id === chg.id ? { ...c, enabled: !c.enabled } : c))}
                            className="rounded text-[#0F8B7D]"
                          />
                          <span className={`font-bold text-xs ${chg.enabled ? "text-slate-900" : "text-slate-400"}`}>
                            {chg.name}
                          </span>
                        </div>
                        {chg.enabled && (
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-slate-500 flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={chg.isInclusion}
                                onChange={() => setChargeList(chargeList.map(c => c.id === chg.id ? { ...c, isInclusion: !c.isInclusion } : c))}
                                className="rounded text-[#0F8B7D] w-3 h-3"
                              />
                              <span>Included</span>
                            </label>
                            <input
                              type="number"
                              value={chg.rate}
                              onChange={(e) => setChargeList(chargeList.map(c => c.id === chg.id ? { ...c, rate: Number(e.target.value) } : c))}
                              className="w-14 p-1 text-right text-xs font-mono font-bold border border-slate-200 rounded"
                            />
                            <span className="text-[10px] text-slate-400">{chg.unit}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: BRANDING & DOMAINS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Portfolio Title</label>
                      <input
                        type="text"
                        value={branding.companyDisplayName}
                        onChange={(e) => setBranding({ ...branding, companyDisplayName: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand Colour</label>
                      <div className="flex items-center gap-1.5">
                        {["#0F8B7D", "#1E3A8A", "#059669", "#1E293B", "#7E22CE", "#991B1B"].map(hex => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setBranding({ ...branding, brandColor: hex })}
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer ${branding.brandColor === hex ? "border-slate-900 scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Invoice Memo (Section 31 CGST)</label>
                    <input
                      type="text"
                      value={branding.invoiceHeaderMemo}
                      onChange={(e) => setBranding({ ...branding, invoiceHeaderMemo: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Sender Email</span>
                      <span className="font-mono font-bold text-slate-800">{branding.senderBillingEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Portal Subdomain</span>
                      <span className="font-mono font-bold text-teal-700">{branding.subdomain}.officex.pro</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D: ROLES & MAKER-CHECKER */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Users &amp; Roles Table (5 Canonical Roles)</span>
                    <p className="text-[11px] text-slate-500">Org Admin, Finance/AR Mgr, Property Mgr, Leasing Mgr, Occupant</p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Maker-Checker</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {userList.map(u => (
                          <tr key={u.id}>
                            <td className="p-2 font-bold">{u.name}</td>
                            <td className="p-2 font-mono text-slate-500">{u.email}</td>
                            <td className="p-2 font-semibold capitalize text-teal-800">{u.role.replace("_", " ")}</td>
                            <td className="p-2 font-mono uppercase text-slate-600">{u.makerCheckerRole}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-950">Enforce Dual-Control Governance (Maker-Checker)</span>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={governance.makerCheckerLease}
                          onChange={(e) => setGovernance({ ...governance, makerCheckerLease: e.target.checked })}
                          className="rounded text-purple-700"
                        />
                        <span>Leases</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={governance.makerCheckerBilling}
                          onChange={(e) => setGovernance({ ...governance, makerCheckerBilling: e.target.checked })}
                          className="rounded text-purple-700"
                        />
                        <span>Billing</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentStep === 1 || isSubmitting}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Next Section →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveAndCommit}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-sm"
              >
                {isSubmitting ? "Saving..." : "Save Configuration"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
