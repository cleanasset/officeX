"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  ArrowRight,
  Plus,
  RefreshCw,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  FileText,
} from "lucide-react";

interface DealsRegisterViewProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertToContract: (deal: any) => void;
}

export default function DealsRegisterView({
  isOpen,
  onClose,
  onConvertToContract,
}: DealsRegisterViewProps) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [convertingId, setConvertingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDeals();
    }
  }, [isOpen]);

  async function loadDeals() {
    try {
      setLoading(true);
      const res = await fetch("/api/deals");
      const json = await res.json();
      if (json.success) {
        setDeals(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load deals", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert(dealItem: any) {
    try {
      setConvertingId(dealItem.id);
      const res = await fetch(`/api/deals/${dealItem.id}/convert-to-contract`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        if (json.prefill) {
          onConvertToContract(json.prefill);
        } else {
          onConvertToContract(json.contract);
        }
        onClose();
      } else {
        alert(json.error || "Failed to convert deal");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConvertingId(null);
    }
  }

  if (!isOpen) return null;

  const stages = [
    { key: "lead", label: "Lead", color: "border-slate-300 bg-slate-50 text-slate-700" },
    { key: "site_visit", label: "Site Visit", color: "border-blue-300 bg-blue-50 text-blue-700" },
    { key: "proposal", label: "Proposal", color: "border-indigo-300 bg-indigo-50 text-indigo-700" },
    { key: "loi", label: "LOI Executed", color: "border-amber-300 bg-amber-50 text-amber-700" },
    { key: "agreement_drafting", label: "Agreement Drafting", color: "border-orange-300 bg-orange-50 text-orange-700" },
    { key: "won", label: "Won / Executed", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Leasing Deals Register (§S-18)</h3>
              <p className="text-xs text-slate-500">
                Pipeline deals converted seamlessly to Rent Roll contracts without re-keying (RR-CONT-15, UAT-61)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-md transition ${viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md transition ${viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
              >
                List
              </button>
            </div>
            <button
              onClick={loadDeals}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading leasing pipeline deals...</div>
          ) : viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[460px]">
              {stages.map((st) => {
                const stageDeals = deals.filter((d) => d.deal_stage === st.key);
                return (
                  <div key={st.key} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className={`px-3 py-2 border-b border-slate-100 flex justify-between items-center ${st.color}`}>
                      <span className="font-semibold text-xs">{st.label}</span>
                      <span className="text-[11px] font-bold px-1.5 rounded-full bg-white/80">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                      {stageDeals.length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-slate-300">Empty</div>
                      ) : (
                        stageDeals.map((d) => (
                          <div
                            key={d.id}
                            className="p-3 bg-slate-50/70 hover:bg-white rounded-lg border border-slate-200 shadow-xs transition space-y-2 text-xs"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">{d.deal_code}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                                {d.probability_percent}%
                              </span>
                            </div>

                            <p className="font-bold text-slate-900 leading-tight">{d.deal_name}</p>

                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              <p className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-slate-400" />
                                ₹{Number(d.estimated_rent_inr || 0).toLocaleString("en-IN")}/mo
                              </p>
                              {d.estimated_start_date && (
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  Est: {d.estimated_start_date}
                                </p>
                              )}
                            </div>

                            {/* Convert to Contract Button for eligible stages */}
                            {["loi", "agreement_drafting", "won"].includes(d.deal_stage) && (
                              <button
                                disabled={convertingId === d.id}
                                onClick={() => handleConvert(d)}
                                className="w-full mt-2 py-1.5 px-2 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded text-[11px] flex items-center justify-center gap-1 transition shadow-xs disabled:opacity-50"
                              >
                                <ArrowRight className="w-3 h-3" />
                                {convertingId === d.id ? "Converting..." : "Convert to Contract"}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Deal Code</th>
                    <th className="p-3">Deal Name</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Probability</th>
                    <th className="p-3">Estimated Monthly Rent</th>
                    <th className="p-3">Est. Start</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-700">{d.deal_code}</td>
                      <td className="p-3 font-medium text-slate-900">{d.deal_name}</td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {d.deal_stage?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-teal-800">{d.probability_percent}%</td>
                      <td className="p-3 font-semibold text-slate-900">
                        ₹{Number(d.estimated_rent_inr || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-slate-500">{d.estimated_start_date || "—"}</td>
                      <td className="p-3 text-right">
                        {["loi", "agreement_drafting", "won"].includes(d.deal_stage) ? (
                          <button
                            disabled={convertingId === d.id}
                            onClick={() => handleConvert(d)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
                          >
                            Convert to Contract
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Advance to LOI first</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
