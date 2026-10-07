"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  User,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface ExpiryPipelineViewProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated?: (deal: any) => void;
}

export default function ExpiryPipelineView({
  isOpen,
  onClose,
  onDealCreated,
}: ExpiryPipelineViewProps) {
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filterWindow, setFilterWindow] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPipeline();
    }
  }, [isOpen, filterWindow]);

  async function loadPipeline() {
    try {
      setLoading(true);
      const url = filterWindow === "all" ? "/api/rent-roll/expiry-pipeline" : `/api/rent-roll/expiry-pipeline?window=${filterWindow}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setPipelineData(json.data || []);
        if (json.counts) setCounts(json.counts);
      }
    } catch (e) {
      console.error("Failed to load expiry pipeline", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRenewalDeal(contractId: string) {
    try {
      setActionLoadingId(contractId);
      const res = await fetch("/api/rent-roll/expiry-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_id: contractId }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        if (onDealCreated) onDealCreated(json.deal);
        loadPipeline();
      } else {
        alert(json.error || "Failed to create renewal deal");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  if (!isOpen) return null;

  const buckets = [
    { key: "1", label: "1 Month (Critical)", count: counts.critical_1m || 0, badge: "bg-rose-100 text-rose-800" },
    { key: "3", label: "3 Months (Urgent)", count: counts.urgent_3m || 0, badge: "bg-amber-100 text-amber-800" },
    { key: "6", label: "6 Months (Planning)", count: counts.planning_6m || 0, badge: "bg-blue-100 text-blue-800" },
    { key: "12", label: "12 Months (Upcoming)", count: counts.upcoming_12m || 0, badge: "bg-slate-100 text-slate-800" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Lease Expiry Pipeline (§S-24)</h3>
              <p className="text-xs text-slate-500">
                Nightly proactive renewal alerts at 12, 6, 3, and 1 months before contract expiration (RR-CONT-09)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPipeline}
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

        {/* Filter Buckets */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterWindow("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterWindow === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Windows ({pipelineData.length})
          </button>
          {buckets.map((b) => (
            <button
              key={b.key}
              onClick={() => setFilterWindow(b.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                filterWindow === b.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{b.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${b.badge}`}>
                {b.count}
              </span>
            </button>
          ))}
        </div>

        {/* Body Cards */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading lease expiry pipeline...</div>
          ) : pipelineData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 text-slate-400 text-xs">
              No leases expiring in the selected time horizon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelineData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 border shadow-xs space-y-3 text-xs transition hover:shadow-md ${
                    item.alert_bucket === "critical_1m"
                      ? "border-rose-300 ring-1 ring-rose-200"
                      : item.alert_bucket === "urgent_3m"
                      ? "border-amber-300"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{item.contract_code}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.priority === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : item.priority === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.days_left} Days Left
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.occupant_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Space: {item.space_name} ({item.space_code})
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Expiry Date:</span>
                      <strong className="text-slate-900 font-mono">{item.expiry_date}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Renewal Stage:</span>
                      <span className="capitalize font-medium text-teal-800">{item.renewal_stage?.replace(/_/g, " ")}</span>
                    </div>
                  </div>

                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleCreateRenewalDeal(item.id)}
                    className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {actionLoadingId === item.id ? "Creating Deal..." : "Create Renewal Deal"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
