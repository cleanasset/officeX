"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  List,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Percent,
  User,
  X,
  FileCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface DealItem {
  id: string;
  leadId?: string;
  propertyId: string;
  propertyName?: string;
  spaceId?: string;
  spaceName?: string;
  prospectName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  stage: "inquiry" | "tour" | "term_sheet" | "loi_signed" | "agreement_drafted" | "converted" | "lost";
  proposedAreaSqft?: string;
  targetRentPsf?: string;
  proposedMonthlyRent?: string;
  probabilityPct?: number;
  expectedHandoverDate?: string;
  brokerName?: string;
  brokerCommissionPct?: string;
  notes?: string;
  createdAt: string;
}

const STAGES = [
  { key: "inquiry", label: "Inquiry", color: "border-blue-400 bg-blue-50/50 text-blue-700" },
  { key: "tour", label: "Site Tour", color: "border-indigo-400 bg-indigo-50/50 text-indigo-700" },
  { key: "term_sheet", label: "Term Sheet", color: "border-amber-400 bg-amber-50/50 text-amber-700" },
  { key: "loi_signed", label: "LOI Signed", color: "border-purple-400 bg-purple-50/50 text-purple-700" },
  { key: "agreement_drafted", label: "Agreement Drafted", color: "border-teal-400 bg-teal-50/50 text-teal-700" },
  { key: "converted", label: "Converted to Lease", color: "border-emerald-400 bg-emerald-50/50 text-emerald-700" },
];

export default function LeaseCrmPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<any[]>([]);

  // Drawer / Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Form fields
  const [prospectName, setProspectName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [stage, setStage] = useState<DealItem["stage"]>("inquiry");
  const [proposedAreaSqft, setProposedAreaSqft] = useState("");
  const [targetRentPsf, setTargetRentPsf] = useState("");
  const [probabilityPct, setProbabilityPct] = useState(50);
  const [expectedHandoverDate, setExpectedHandoverDate] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerCommissionPct, setBrokerCommissionPct] = useState("");
  const [notes, setNotes] = useState("");

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/deals");
      const json = await res.json();
      if (json.success || json.deals) {
        setDeals(json.deals || []);
      }
      const propRes = await fetch("/api/properties");
      const propJson = await propRes.json();
      if (propJson.properties) {
        setProperties(propJson.properties);
      }
    } catch (e) {
      console.error("Failed to load deals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const area = parseFloat(proposedAreaSqft || "0");
      const psf = parseFloat(targetRentPsf || "0");
      const monthly = area * psf;

      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName,
          contactName,
          contactEmail,
          contactPhone,
          propertyId: propertyId || (properties[0]?.id || ""),
          stage,
          proposedAreaSqft: area.toString(),
          targetRentPsf: psf.toString(),
          proposedMonthlyRent: monthly.toString(),
          probabilityPct: Number(probabilityPct),
          expectedHandoverDate,
          brokerName,
          brokerCommissionPct,
          notes,
        }),
      });
      const json = await res.json();
      if (json.success || json.deal) {
        setIsDrawerOpen(false);
        resetForm();
        fetchDeals();
      } else {
        alert(json.error || "Failed to create deal");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToContract = async (dealId: string) => {
    if (!confirm("Convert this deal into an active or draft contract in the Rent Roll?")) return;
    try {
      setConvertingId(dealId);
      const res = await fetch(`/api/deals/${dealId}/convert-to-contract`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "Deal converted successfully!");
        fetchDeals();
      } else {
        alert(json.error || "Conversion failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setConvertingId(null);
    }
  };

  const resetForm = () => {
    setProspectName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setProposedAreaSqft("");
    setTargetRentPsf("");
    setProbabilityPct(50);
    setExpectedHandoverDate("");
    setBrokerName("");
    setBrokerCommissionPct("");
    setNotes("");
  };

  const filteredDeals = deals.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.prospectName.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q) ||
      (d.propertyName && d.propertyName.toLowerCase().includes(q)) ||
      (d.brokerName && d.brokerName.toLowerCase().includes(q))
    );
  });

  const totalWeightedPipeline = deals.reduce((sum, d) => {
    const area = parseFloat(d.proposedAreaSqft || "0");
    const psf = parseFloat(d.targetRentPsf || "0");
    const monthly = d.proposedMonthlyRent ? parseFloat(d.proposedMonthlyRent) : area * psf;
    const prob = (d.probabilityPct ?? 50) / 100;
    return sum + (monthly * prob);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Screen S-18 &middot; Deal Register & CRM
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Leasing Pipeline (D-22 / F-24)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Commercial Leasing Deals & Pipeline CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track prospective corporate tenants through leasing stages, probability weighting, and convert approved LOIs into Rent Roll contracts.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Deal
          </button>

          <button
            onClick={fetchDeals}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Deals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Pipeline Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Active Deals
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {deals.filter((d) => d.stage !== "lost" && d.stage !== "converted").length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total in negotiation pipeline
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Weighted Monthly Run-Rate
          </span>
          <div className="text-xl sm:text-2xl font-black text-teal-600">
            ₹{Math.round(totalWeightedPipeline).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Probability-adjusted inflow (D-22)
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            LOI & Draft Agreements
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            {deals.filter((d) => d.stage === "loi_signed" || d.stage === "agreement_drafted").length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Closing within 30 days
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Converted Contracts
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {deals.filter((d) => d.stage === "converted").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Leases onboarded to rent roll
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tenant, property, broker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <strong>{filteredDeals.length}</strong> deal records
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-4">
          {STAGES.map((st) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === st.key);
            return (
              <div key={st.key} className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-w-[240px]">
                <div className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold mb-3 flex items-center justify-between ${st.color}`}>
                  <span>{st.label}</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full text-[10px]">{stageDeals.length}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      No deals in {st.label}
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const area = parseFloat(deal.proposedAreaSqft || "0");
                      const psf = parseFloat(deal.targetRentPsf || "0");
                      const rentVal = deal.proposedMonthlyRent ? parseFloat(deal.proposedMonthlyRent) : area * psf;
                      return (
                        <div
                          key={deal.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition group"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{deal.prospectName}</h4>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {deal.probabilityPct ?? 50}%
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            {area > 0 && <div>{area.toLocaleString("en-IN")} sq ft &bull; ₹{psf} psf</div>}
                            <div className="font-bold text-slate-800 font-mono">
                              ₹{Math.round(rentVal).toLocaleString("en-IN")}/mo
                            </div>
                            {deal.expectedHandoverDate && (
                              <div className="text-[10px] text-slate-400">Target: {deal.expectedHandoverDate}</div>
                            )}
                          </div>

                          {deal.stage !== "converted" && (
                            <button
                              onClick={() => handleConvertToContract(deal.id)}
                              disabled={convertingId === deal.id}
                              className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <FileCheck className="w-3 h-3 text-teal-400" /> Convert to Contract
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Prospect</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Proposed Area</th>
                  <th className="py-3 px-4 text-right">Target Rent (₹)</th>
                  <th className="py-3 px-4 text-center">Probability</th>
                  <th className="py-3 px-4">Handover Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No commercial deals matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((d) => {
                    const area = parseFloat(d.proposedAreaSqft || "0");
                    const psf = parseFloat(d.targetRentPsf || "0");
                    const rentVal = d.proposedMonthlyRent ? parseFloat(d.proposedMonthlyRent) : area * psf;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{d.prospectName}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{d.contactName}</div>
                          <div className="text-[10px] text-slate-400">{d.contactEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                            {d.stage.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {area.toLocaleString("en-IN")} sqft
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                          ₹{Math.round(rentVal).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-teal-700">
                          {d.probabilityPct ?? 50}%
                        </td>
                        <td className="py-3 px-4 text-slate-500">{d.expectedHandoverDate || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          {d.stage !== "converted" && (
                            <button
                              onClick={() => handleConvertToContract(d.id)}
                              disabled={convertingId === d.id}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <FileCheck className="w-3 h-3 text-teal-400" /> Convert
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* S-18 Deal Form Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded">
                    S-18 Deal Form
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    New Commercial Leasing Prospect
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="p-4 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prospect / Tenant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy Corporate HQ, Barclays Tech Center"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Property</label>
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.property_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pipeline Stage *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Proposed Area (Sq.Ft.)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={proposedAreaSqft}
                      onChange={(e) => setProposedAreaSqft(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Rent (₹ PSF)</label>
                    <input
                      type="number"
                      placeholder="e.g. 210"
                      value={targetRentPsf}
                      onChange={(e) => setTargetRentPsf(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Probability % (D-22)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={probabilityPct}
                      onChange={(e) => setProbabilityPct(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Handover Date</label>
                    <input
                      type="date"
                      value={expectedHandoverDate}
                      onChange={(e) => setExpectedHandoverDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Broker / Agency</label>
                    <input
                      type="text"
                      placeholder="e.g. JLL, CBRE, Cushman"
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Broker Commission %</label>
                    <input
                      type="number"
                      placeholder="e.g. 8.33"
                      value={brokerCommissionPct}
                      onChange={(e) => setBrokerCommissionPct(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commercial Notes / Terms</label>
                  <textarea
                    rows={3}
                    placeholder="Lock-in requirements, fitout period, car parking allotment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {submitting ? "Saving Deal..." : "Create Deal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
