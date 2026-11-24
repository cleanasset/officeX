"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function VisitorApprovalQueuePage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors/approvals?orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApprovals(json.data);
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (visitId: string, decision: "approved" | "rejected") => {
    setProcessingId(visitId);
    try {
      const res = await fetch("/api/vc/visitors/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          decision,
          reason: `Decision executed via web console: ${decision.toUpperCase()}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setApprovals((prev) => prev.filter((a) => a.visitId !== visitId));
        setNotice(`Visit was successfully ${decision.toUpperCase()}. Access credentials updated.`);
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(json.message || "Failed to process decision");
      }
    } catch (err) {
      console.error("Decision error:", err);
      alert("Network error processing decision");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Approval Queue (VC-03)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Host & Security Approvals</h1>
          <p className="text-xs text-slate-400">
            Review pending visitor access requests, high-risk contractor visits, and unannounced walk-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
            {approvals.length} Requests Pending Action
          </div>
          <button
            type="button"
            onClick={fetchApprovals}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && approvals.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
          <div>Checking live approval queue...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.length > 0 ? (
            approvals.map((item) => (
              <div
                key={item.visitId}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.riskLevel === "critical" || item.riskLevel === "high"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {item.riskLevel?.toUpperCase()} RISK • {item.visitorType?.toUpperCase()}
                    </span>
                    <div className="text-base font-extrabold text-white mt-1.5">{item.visitorName}</div>
                    <div className="text-xs text-slate-400">{item.company || "Individual"} • {item.mobile}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    {new Date(item.visitStart).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Requested Host:</span>
                    <div className="text-white font-semibold">{item.hostName || "Reception Desk"}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Tenant / Location:</span>
                    <div className="text-white font-semibold">{item.tenantName || item.floor || "Lobby"}</div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-900">
                    <span className="text-slate-500 text-[11px]">Purpose:</span>
                    <div className="text-slate-200">{item.purpose || "Business Meeting"}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={processingId === item.visitId}
                    onClick={() => handleDecision(item.visitId, "rejected")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Reject Access
                  </button>

                  <button
                    type="button"
                    disabled={processingId === item.visitId}
                    onClick={() => handleDecision(item.visitId, "approved")}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {processingId === item.visitId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    <span>Approve Pass</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-60" />
              <div className="font-bold text-white text-base">Approval Queue is Clear</div>
              <div className="text-xs text-slate-400 mt-1">No visitors or contractors are currently waiting for authorization.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
