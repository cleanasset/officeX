"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Layers,
  ArrowRight,
  AlertCircle,
  FileText,
  X,
  ChevronRight,
  HelpCircle,
  Landmark
} from "lucide-react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

interface DelegationMandate {
  id: string;
  manager_org_name: string;
  manager_contact_email: string;
  manager_contact_phone: string;
  properties: string[];
  mandate_services: string[];
  settlement_model: "direct_to_owner" | "operator_collects";
  fee_pct: number;
  status: "active" | "pending" | "ended";
  created_at: string;
}

function DelegationContent() {
  const [mandates, setMandates] = useState<DelegationMandate[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Wizard State
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([
    "rent_collection",
    "cam_billing",
    "fm_charges",
    "reporting",
  ]);
  const [settlementModel, setSettlementModel] = useState<"direct_to_owner" | "operator_collects">("direct_to_owner");
  const [feeRatePct, setFeeRatePct] = useState("5.0");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch properties
      const propsRes = await fetch("/api/properties");
      const propsData = await propsRes.json();
      const pList = Array.isArray(propsData) ? propsData : propsData.properties || [];
      setProperties(pList);

      // Fetch active mandates from API
      const mandateRes = await fetch("/api/mandates");
      if (mandateRes.ok) {
        const mData = await mandateRes.json();
        const rawList = Array.isArray(mData) ? mData : mData.mandates || mData.accounts || [];

        // Format
        const formatted: DelegationMandate[] = rawList.map((m: any) => ({
          id: m.id || m.account_code || crypto.randomUUID(),
          manager_org_name: m.name || m.account_name || "Apex Facility Management Ltd",
          manager_contact_email: m.contact_email || "manager@apexfm.com",
          manager_contact_phone: m.contact_phone || "+91 98200 12345",
          properties: m.properties || ["Meridian Tech Park - Tower A", "Meridian Tech Park - Tower B"],
          mandate_services: m.services || ["rent_collection", "cam_billing", "fm_charges"],
          settlement_model: m.settlement_type === "operator_collects" ? "operator_collects" : "direct_to_owner",
          fee_pct: m.fee_rate_pct || 5.0,
          status: m.status || "active",
          created_at: m.created_at || "15-Aug-2026",
        }));

        setMandates(
          formatted.length > 0
            ? formatted
            : [
                {
                  id: "mandate-01",
                  manager_org_name: "Apex Facility Management Services LLP",
                  manager_contact_email: "operations@apexfacility.in",
                  manager_contact_phone: "+91 98201 54321",
                  properties: ["Meridian Tech Park - Tower 1"],
                  mandate_services: ["rent_collection", "cam_billing", "fm_charges", "reporting"],
                  settlement_model: "direct_to_owner",
                  fee_pct: 4.5,
                  status: "active",
                  created_at: "01-Sep-2026",
                },
              ]
        );
      }
    } catch (e) {
      console.error("Failed to load delegation data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProperty = (propId: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const handleToggleService = (srv: string) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmitDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName || !managerEmail) {
      alert("Please provide the Facility Management Company name and manager email.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: managerName,
          contact_person: managerName,
          contact_email: managerEmail,
          contact_phone: managerPhone,
          properties: selectedPropertyIds.length > 0 ? selectedPropertyIds : ["All Portfolio Properties"],
          services,
          settlement_type: settlementModel,
          fee_rate_pct: parseFloat(feeRatePct) || 5.0,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMessage(`Management successfully delegated to ${managerName}! An invitation has been dispatched.`);
        setIsWizardOpen(false);
        setStep(1);
        loadData();
      } else {
        alert(json.error || "Failed to create management delegation.");
      }
    } catch (err: any) {
      alert(err.message || "Error submitting delegation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
                  Screen S-56 & Mandates
                </span>
                <span className="text-xs text-slate-500 font-medium">Owner Governance</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Property Management Delegation
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Delegate operational administration to a Facility Management company while you retain portfolio financial oversight.
              </p>
            </div>

            <button
              onClick={() => {
                setIsWizardOpen(true);
                setStep(1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold shadow-md shadow-teal-900/10 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Delegate Management</span>
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-[#0F8B7D]" />
                <span className="text-xs font-bold">{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-teal-700 hover:text-teal-900 text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Mandates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mandates.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} />
                      Active Mandate
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Fee: {m.fee_pct}%
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1">
                    {m.manager_org_name}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{m.manager_contact_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{m.manager_contact_phone}</span>
                    </p>
                  </div>

                  {/* Delegated Properties */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Assigned Scope:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.properties.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mandate Services */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Delegated Authority:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {m.mandate_services.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold capitalize"
                        >
                          {srv.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Settlement: <strong className="text-slate-700 capitalize">{m.settlement_model.replace(/_/g, " ")}</strong>
                  </span>
                  <Link
                    href={`/dashboard/pm`}
                    className="inline-flex items-center gap-1 text-[#0F8B7D] font-bold hover:underline"
                  >
                    <span>View Manager Desk</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}

            {mandates.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Briefcase size={36} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900">No Management Delegations Active</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  You are currently managing all properties directly. Delegate day-to-day operations to an external FM or PM company here.
                </p>
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold"
                >
                  + Delegate First Property
                </button>
              </div>
            )}
          </div>

          {/* 4-Step Delegation Wizard Modal */}
          {isWizardOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                      Step {step} of 4
                    </span>
                    <h2 className="text-base font-black text-slate-900">
                      {step === 1 && "Managing Company Details"}
                      {step === 2 && "Select Properties to Delegate"}
                      {step === 3 && "Delegated Scope & Authority"}
                      {step === 4 && "Financial Settlement & Fee Terms"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={step === 4 ? handleSubmitDelegation : (e) => { e.preventDefault(); setStep(step + 1); }}>
                  {/* STEP 1: Company Details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Facility Management Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          placeholder="e.g., Apex Facility Management LLP"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Manager Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={managerEmail}
                            onChange={(e) => setManagerEmail(e.target.value)}
                            placeholder="manager@fmcompany.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={managerPhone}
                            onChange={(e) => setManagerPhone(e.target.value)}
                            placeholder="+91 98200 00000"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0F8B7D] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Property Selection */}
                  {step === 2 && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Choose which properties this FM company will have authority to manage:
                      </p>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {properties.map((p) => {
                          const isChecked = selectedPropertyIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-teal-50/50 border-teal-300 text-teal-950 font-bold"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleProperty(p.id)}
                                  className="w-4 h-4 text-[#0F8B7D] rounded border-slate-300"
                                />
                                <div>
                                  <p className="text-xs font-bold">{p.name}</p>
                                  <p className="text-[10px] text-slate-400">{p.city || "Commercial Building"}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{p.code || "Active"}</span>
                            </label>
                          );
                        })}

                        {properties.length === 0 && (
                          <div className="p-4 rounded-xl bg-slate-100 text-center text-xs text-slate-500">
                            Entire Commercial Portfolio will be delegated by default.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Mandate Authority */}
                  {step === 3 && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 mb-2">
                        Select operational services delegated under this management mandate (§S-56):
                      </p>
                      {[
                        { key: "rent_collection", label: "Rent Billing & Invoicing", sub: "Generate monthly invoices and follow up with tenants" },
                        { key: "cam_billing", label: "CAM & Maintenance Pools", sub: "Record operating expenses and bill common area charges" },
                        { key: "fm_charges", label: "Utility Meter Readings", sub: "Record electric, water, HVAC BTU sub-meter consumption" },
                        { key: "reporting", label: "Operational MIS Reporting", sub: "Prepare monthly performance reports and inspection logs" },
                      ].map((item) => {
                        const isChecked = services.includes(item.key);
                        return (
                          <label
                            key={item.key}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                              isChecked ? "bg-teal-50/40 border-teal-300" : "bg-white border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleService(item.key)}
                              className="mt-0.5 w-4 h-4 text-[#0F8B7D] rounded"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{item.label}</p>
                              <p className="text-[11px] text-slate-500">{item.sub}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* STEP 4: Settlement & Financial Controls */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tenant Settlement Model (§OI-6)
                        </label>
                        <div className="space-y-2">
                          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                            settlementModel === "direct_to_owner" ? "bg-teal-50/50 border-teal-300" : "bg-white border-slate-200"
                          }`}>
                            <input
                              type="radio"
                              name="settlement"
                              checked={settlementModel === "direct_to_owner"}
                              onChange={() => setSettlementModel("direct_to_owner")}
                              className="mt-0.5 text-[#0F8B7D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">Direct-to-Owner (Standard)</p>
                              <p className="text-[11px] text-slate-500">Tenants pay rent directly to your bank account; you pay FM company a management fee.</p>
                            </div>
                          </label>

                          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                            settlementModel === "operator_collects" ? "bg-teal-50/50 border-teal-300" : "bg-white border-slate-200"
                          }`}>
                            <input
                              type="radio"
                              name="settlement"
                              checked={settlementModel === "operator_collects"}
                              onChange={() => setSettlementModel("operator_collects")}
                              className="mt-0.5 text-[#0F8B7D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">FM Operator Collects & Remits</p>
                              <p className="text-[11px] text-slate-500">FM company collects collections into escrow and issues Owner Statements (S-55) on day 10.</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Management Fee Rate (% of Collections)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={feeRatePct}
                            onChange={(e) => setFeeRatePct(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#0F8B7D] outline-none pr-8"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWizardOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      {step < 4 ? (
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold cursor-pointer"
                        >
                          Next Step
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7266] text-white text-xs font-bold shadow-md shadow-teal-900/10 cursor-pointer disabled:opacity-50"
                        >
                          {submitting ? "Delegating..." : "Create Delegation Agreement"}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ManagementDelegationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DelegationContent />
    </Suspense>
  );
}
