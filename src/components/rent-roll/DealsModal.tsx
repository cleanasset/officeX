"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  Building2,
  DollarSign,
  Plus,
  CheckCircle2,
  ArrowRight,
  Handshake,
  Percent,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface DealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Array<{ id: string; name: string; city: string }>;
  onContractCreated?: () => void;
  onSuccess?: () => void;
}

export const DealsModal: React.FC<DealsModalProps> = ({
  isOpen,
  onClose,
  properties,
  onContractCreated,
  onSuccess
}) => {
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Deal Form State
  const [prospectName, setProspectName] = useState("");
  const [targetPropertyId, setTargetPropertyId] = useState(properties[0]?.id || "");
  const [proposedArea, setProposedArea] = useState<number>(10000);
  const [targetRatePsf, setTargetRatePsf] = useState<number>(200);
  const [targetDate, setTargetDate] = useState("2027-01-01");
  const [probability, setProbability] = useState<number>(60);
  const [brokerName, setBrokerName] = useState("");

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rent-roll/deals");
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeals();
    }
  }, [isOpen]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rent-roll/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName,
          propertyId: targetPropertyId,
          proposedAreaSqft: proposedArea,
          targetRentPsf: targetRatePsf,
          targetCommencementDate: targetDate,
          probabilityPct: probability,
          brokerName,
          stage: "term_sheet"
        })
      });
      if (res.ok) {
        setSuccessMsg(`Prospect deal "${prospectName}" created successfully!`);
        setProspectName("");
        await fetchDeals();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertDeal = async (dealId: string, dealName: string) => {
    if (!confirm(`Convert prospect deal "${dealName}" into an active commercial contract?`)) return;

    try {
      const res = await fetch("/api/rent-roll/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert_to_contract",
          dealId
        })
      });
      if (res.ok) {
        setSuccessMsg(`🎉 Deal "${dealName}" successfully converted into contract! Added to rent roll.`);
        if (onContractCreated) onContractCreated();
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
      alert("Error converting deal");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Leasing Pipeline &amp; Deals Register</h3>
              <p className="text-xs text-gray-500">
                Track prospects, probability-weighted revenue &amp; convert won deals to draft contracts (§4.7A, RR-CON-07)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Create Deal Form */}
          <form onSubmit={handleCreateDeal} className="p-4 bg-gray-50 rounded-xl border border-gray-200/90 space-y-3">
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              Add New Leasing Prospect Deal
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Prospect / Tenant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Tech Solutions"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Property</label>
                <select
                  value={targetPropertyId}
                  onChange={(e) => setTargetPropertyId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Proposed Area (SqFt)</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={proposedArea}
                  onChange={(e) => setProposedArea(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Base Rate PSF (₹)</label>
                <input
                  type="number"
                  placeholder="200"
                  value={targetRatePsf}
                  onChange={(e) => setTargetRatePsf(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Commencement Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Probability (%)</label>
                <select
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
                >
                  <option value={20}>20% - Early Viewing</option>
                  <option value={40}>40% - Proposal Under Review</option>
                  <option value={60}>60% - Term Sheet Negotiation</option>
                  <option value={80}>80% - Final Legal Draft</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !prospectName.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Adding..." : "Add Pipeline Deal"}</span>
              </button>
            </div>
          </form>

          {/* Deals Register Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Active Prospect Deals ({deals.length})
              </h4>
            </div>

            {deals.length === 0 ? (
              <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                <Handshake className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium">No active pipeline deals logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Prospect</th>
                      <th className="py-2.5 px-3">Property</th>
                      <th className="py-2.5 px-3 text-right">Area</th>
                      <th className="py-2.5 px-3 text-right">Target Rent PSF</th>
                      <th className="py-2.5 px-3 text-right">Monthly Est.</th>
                      <th className="py-2.5 px-3 text-center">Probability</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {deals.map((d) => {
                      const estMonthly = (d.proposedAreaSqft || 0) * (d.targetRentPsf || 0);
                      return (
                        <tr key={d.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-gray-900">{d.prospectName}</td>
                          <td className="py-2.5 px-3 text-gray-600">{d.propertyName}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-700">{d.proposedAreaSqft?.toLocaleString()} sqft</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-700">₹{d.targetRentPsf}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{formatINR(estMonthly)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {d.probabilityPct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-gray-700 uppercase text-[10px]">
                              {d.stage.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {d.stage === "won" ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Converted</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConvertDeal(d.id, d.prospectName)}
                                className="px-2.5 py-1 bg-[#0F8B7D] hover:bg-teal-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>Convert to Lease</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Seamlessly flows into Forecast View with weighted probability calculation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
