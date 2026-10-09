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
  Check
} from "lucide-react";

export default function SettingsSuitePage() {
  const [activeTab, setActiveTab] = useState<string>("s60");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // S-60 State
  const [orgData, setOrgData] = useState<any>(null);
  // S-61 State
  const [billingEntities, setBillingEntities] = useState<any[]>([]);
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
    setMessage("Organisation branding and financial preferences saved successfully.");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-3.5 sm:p-6 md:p-8 pb-28 md:pb-16 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                Screens S-60 to S-67
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-mono">ERP Administration & Governance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Settings className="text-[#0D7B6C] w-5 h-5 sm:w-6 sm:h-6" />
              Settings &amp; System Master Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure multi-state billing entities, charge catalogues, numbering sequences, maker-checker approval thresholds, and audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Org Admin Privileged Scope
            </span>
          </div>
        </div>

        {message && (
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("s60")}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s60" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building size={14} /> S-60 Organisation &amp; Branding
          </button>
          <button
            onClick={() => setActiveTab("s61")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s61" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CreditCard size={14} /> S-61 Billing Entities Master
          </button>
          <button
            onClick={() => setActiveTab("s62")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s62" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Percent size={14} /> S-62 Charge Types &amp; Taxes
          </button>
          <button
            onClick={() => setActiveTab("s63")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s63" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Hash size={14} /> S-63 Numbering &amp; Controls
          </button>
          <button
            onClick={() => setActiveTab("s64")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s64" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Bell size={14} /> S-64 Alert Rules
          </button>
          <button
            onClick={() => setActiveTab("s66")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s66" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users size={14} /> S-66 Users &amp; Approval Matrix
          </button>
          <button
            onClick={() => setActiveTab("s67")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "s67" ? "bg-[#0D7B6C] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Clock size={14} /> S-67 Audit Log Timeline
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading ERP configuration master...</p>
          </div>
        ) : (
          <>
            {/* TAB S-60: ORGANISATION & BRANDING */}
            {activeTab === "s60" && orgData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Organisation &amp; Branding Profile (S-60)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Corporate legal parameters and document rendering preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                      Corporate Identity
                    </h4>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Subscriber Trade Name</label>
                      <input
                        type="text"
                        defaultValue={orgData.organisation.name}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Company Legal Entity Name</label>
                      <input
                        type="text"
                        defaultValue={orgData.organisation.legal_name}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1 font-semibold">PAN Number</label>
                        <input
                          type="text"
                          defaultValue={orgData.organisation.pan}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-semibold">TAN Number</label>
                        <input
                          type="text"
                          defaultValue={orgData.organisation.tan}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Registered Headquarters Address</label>
                      <textarea
                        rows={2}
                        defaultValue={orgData.organisation.registered_address}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                      Branding &amp; Accounting Parameters
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1 font-semibold">Operating Currency</label>
                        <select defaultValue="inr" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium">
                          <option value="inr">INR (₹ - Indian Rupee)</option>
                          <option value="usd">USD ($ - SEZ IFSC)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1 font-semibold">Financial Year Cycle</label>
                        <select defaultValue="apr" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium">
                          <option value="apr">April to March (Indian FY)</option>
                          <option value="jan">January to December</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Primary Brand Theme Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          defaultValue="#0D7B6C"
                          className="w-10 h-10 border border-slate-300 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-slate-700">#0D7B6C (OFFICEX Emerald)</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">Invoice Legal Footer Disclaimer</label>
                      <textarea
                        rows={2}
                        defaultValue={orgData.branding.footer_disclaimer}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={handleSaveS60}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={14} /> Save Organisation Settings
                  </button>
                </div>
              </div>
            )}

            {/* TAB S-61: BILLING ENTITIES MASTER */}
            {activeTab === "s61" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Billing Entities Master (S-61)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Separate legal SPVs with unique GSTIN, State code, and bank accounts</p>
                  </div>
                  <button className="px-3.5 py-2 text-xs font-bold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm flex items-center gap-1.5">
                    <Plus size={14} /> Add Billing Entity
                  </button>
                </div>

                <div className="space-y-4">
                  {billingEntities.map((be) => (
                    <div key={be.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{be.legal_name}</h4>
                            {be.is_default && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                DEFAULT ENTITY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Trade Name: {be.trade_name} • Prefix: <strong>{be.invoice_prefix}</strong></p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 font-bold text-slate-800">
                            GSTIN: {be.gstin}
                          </span>
                          <span className="font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">
                            State: {be.state_code}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-semibold">Registered Office:</span>
                          <span className="text-slate-700">{be.registered_address}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Disbursement / Settlement Bank:</span>
                          <span className="text-slate-700 font-medium">
                            {be.bank_name} • A/c: {be.bank_account_number} (IFSC: {be.bank_ifsc})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB S-62: CHARGE TYPES & TAX PROFILES */}
            {activeTab === "s62" && chargesData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Charge Types &amp; Tax Profiles Catalogue (S-62)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">HSN/SAC codes, GST slabs, and TDS section mappings (Section 194I vs 194C)</p>
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Numbering Sequences &amp; Financial Controls (S-63)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configurable sequence masks and global financial freeze lock dates</p>
                </div>

                {/* Global Financial Lock Date Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0D7B6C] flex items-center justify-center font-bold">
                      <Lock size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Global Financial Lock Date:</span>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                          {numberingData.controls.global_lock_date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Transactions on or prior to this date cannot be created, edited or deleted retroactively.
                      </p>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                    Advance Lock Date
                  </button>
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alert Rules &amp; Notification Engine (S-64)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configurable trigger timing offsets (90/60/30 days), roles, and delivery channels</p>
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Users, Roles &amp; Approval Matrix (S-66)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">12 specification roles with dual-control maker-checker limits</p>
                </div>

                {/* Maker-Checker Thresholds */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Maker-Checker Financial Approval Matrix</h4>
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

                {/* Users Roster */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Staff &amp; Stakeholder Users</h4>
                    <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#0D7B6C] rounded-lg">
                      + Invite User
                    </button>
                  </div>

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
                            <td className="py-3 px-3 text-slate-600">{u.assigned_properties.join(", ")}</td>
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
                </div>
              </div>
            )}

            {/* TAB S-67: AUDIT LOG TIMELINE */}
            {activeTab === "s67" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Audit Log Timeline (S-67)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Immutable record of all financial changes, lease updates, and data exports</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter by action or user..."
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
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

                <div className="space-y-3">
                  {auditLogs
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
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
