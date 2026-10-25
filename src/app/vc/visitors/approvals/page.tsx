"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function VisitorApprovalQueuePage() {
  const [approvals, setApprovals] = useState([
    {
      id: "appr_1",
      visitorName: "Sunil Narang",
      company: "Deloitte Digital",
      visitorType: "client",
      hostName: "Neha Agarwal (HR Head)",
      tenantName: "FinTech Innovations",
      purpose: "Enterprise SaaS Security Audit & Pen-Test Kickoff",
      scheduledTime: "Today at 02:30 PM",
      riskLevel: "medium",
      status: "pending",
    },
    {
      id: "appr_2",
      visitorName: "Manoj Swaminathan",
      company: "Johnson Controls HVAC",
      visitorType: "contractor",
      hostName: "Rajesh Verma (FM Lead)",
      tenantName: "Clean Asset FM Services",
      purpose: "Chiller Plant Periodic Compressor Overhaul (PTW Required)",
      scheduledTime: "Today at 04:00 PM",
      riskLevel: "high",
      status: "pending",
    },
  ]);

  const [notice, setNotice] = useState("");

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setNotice(`Visit for ${item?.visitorName} was marked ${decision.toUpperCase()}. Notification sent to host.`);
    setTimeout(() => setNotice(""), 4000);
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

        <div className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
          {approvals.length} Requests Pending Action
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvals.length > 0 ? (
          approvals.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    item.riskLevel === "high"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {item.riskLevel.toUpperCase()} RISK • {item.visitorType.toUpperCase()}
                  </span>
                  <div className="text-base font-extrabold text-white mt-1.5">{item.visitorName}</div>
                  <div className="text-xs text-slate-400">{item.company}</div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-500">Scheduled:</span>
                  <div className="text-slate-200 font-medium">{item.scheduledTime}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Host:</span>
                  <span className="text-slate-200 font-semibold">{item.hostName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant Org:</span>
                  <span className="text-slate-200">{item.tenantName}</span>
                </div>
                <div className="pt-1 text-[11px] text-blue-300">
                  <span className="text-slate-500">Purpose: </span>
                  {item.purpose}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleDecision(item.id, "rejected")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision(item.id, "approved")}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Authorize & Issue Pass</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60" />
            <div className="text-sm font-semibold text-slate-300">All pending approvals are cleared!</div>
            <div className="text-xs">Incoming visitor pre-registrations will appear here in real time.</div>
          </div>
        )}
      </div>
    </div>
  );
}
