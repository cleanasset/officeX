"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  FileText,
  Mail,
  Phone,
  X,
  FileSpreadsheet,
} from "lucide-react";

interface AgingOccupantRow {
  occupant_id: string;
  occupant_name: string;
  pan_number?: string;
  contract_code: string;
  property_name: string;
  total_outstanding: number;
  bucket_0_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  oldest_due_days: number;
  disputed_amount: number;
  last_reminder_sent?: string;
  invoices_count: number;
}

export default function AgeingCollectionsPage() {
  const [rows, setRows] = useState<AgingOccupantRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<string>("all");

  // Dunning Notice Modal
  const [dunningModalOpen, setDunningModalOpen] = useState(false);
  const [activeDunningRow, setActiveDunningRow] = useState<AgingOccupantRow | null>(null);
  const [dunningChannel, setDunningChannel] = useState<"email" | "whatsapp" | "both">("both");
  const [sendingNotice, setSendingNotice] = useState(false);

  // S-45: Log Follow-up & Promise to Pay (PTP AL-10) Modal
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [activeFollowupRow, setActiveFollowupRow] = useState<AgingOccupantRow | null>(null);
  const [followupChannel, setFollowupChannel] = useState<"call" | "email" | "whatsapp" | "visit" | "legal_notice">("call");
  const [followupOutcome, setFollowupOutcome] = useState<"promised" | "disputed" | "no_response" | "paid" | "other">("promised");
  const [ptpDate, setPtpDate] = useState("");
  const [ptpAmount, setPtpAmount] = useState("");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Write-Off Modal
  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [activeWriteOffRow, setActiveWriteOffRow] = useState<AgingOccupantRow | null>(null);
  const [writeOffAmount, setWriteOffAmount] = useState("");
  const [writeOffReason, setWriteOffReason] = useState("Tenant Insolvency / Abandoned Premise");
  const [submittingWriteOff, setSubmittingWriteOff] = useState(false);

  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = ["Occupant", "Contract", "Property", "Total Outstanding", "0-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Oldest Days Overdue", "Invoices Count"];
    const csvContent = [
      headers.join(","),
      ...rows.map(r => [
        `"${String(r.occupant_name || '').replace(/"/g, '""')}"`,
        `"${r.contract_code || ''}"`,
        `"${r.property_name || ''}"`,
        r.total_outstanding || 0,
        r.bucket_0_30 || (r as any).current_0_30 || 0,
        r.bucket_31_60 || 0,
        r.bucket_61_90 || 0,
        r.bucket_90_plus || 0,
        r.oldest_due_days || 0,
        r.invoices_count || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `officex_ageing_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowupRow) return;
    try {
      setSubmittingFollowup(true);
      const res = await fetch("/api/collections/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: activeFollowupRow.occupant_id,
          channel: followupChannel,
          outcome: followupOutcome,
          ptp_date: followupOutcome === "promised" ? ptpDate : null,
          ptp_amount: followupOutcome === "promised" ? parseFloat(ptpAmount || "0") : null,
          due_date: nextFollowupDate || null,
          notes: followupNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to log follow-up");
      alert(json.message || "Follow-up logged successfully!");
      setFollowupModalOpen(false);
      fetchAgingData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingFollowup(false);
    }
  };

  const fetchAgingData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections/aging");
      const json = await res.json();
      if (json.success || json.occupants) {
        setRows(json.occupants || []);
        setSummary(json.summary || null);
      }
    } catch (e) {
      console.error("Failed to load ageing report:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgingData();
  }, []);

  const handleSendDunningNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDunningRow) return;
    try {
      setSendingNotice(true);
      const res = await fetch("/api/collections/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: activeDunningRow.occupant_id,
          channel: dunningChannel,
          outstanding_amount: activeDunningRow.total_outstanding,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "Statutory payment reminder notice dispatched successfully!");
        setDunningModalOpen(false);
        fetchAgingData();
      } else {
        alert(json.error || "Failed to dispatch notice");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSendingNotice(false);
    }
  };

  const handleRequestWriteOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWriteOffRow) return;
    try {
      setSubmittingWriteOff(true);
      const res = await fetch("/api/collections/writeoff-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupant_id: activeWriteOffRow.occupant_id,
          contract_code: activeWriteOffRow.contract_code,
          amount_inr: parseFloat(writeOffAmount),
          reason: writeOffReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "Write-off request submitted to Maker-Checker Approval Inbox (S-06).");
        setWriteOffModalOpen(false);
        fetchAgingData();
      } else {
        alert(json.error || "Failed to submit write-off request");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingWriteOff(false);
    }
  };

  const filteredRows = rows.filter((r) => {
    const b90 = Number(r.bucket_90_plus || 0);
    const b60 = Number(r.bucket_61_90 || 0);
    const b30 = Number(r.bucket_31_60 || 0);
    if (selectedBucket === "90_plus" && b90 <= 0) return false;
    if (selectedBucket === "61_90" && b60 <= 0) return false;
    if (selectedBucket === "31_60" && b30 <= 0) return false;
    if (search) {
      const q = search.toLowerCase();
      const occName = String(r.occupant_name || "").toLowerCase();
      const ctrCode = String(r.contract_code || "").toLowerCase();
      const propName = String(r.property_name || "").toLowerCase();
      return occName.includes(q) || ctrCode.includes(q) || propName.includes(q);
    }
    return true;
  });

  const totalOutstanding = summary?.total_outstanding ?? rows.reduce((s, r) => s + (Number(r.total_outstanding) || 0), 0);
  const total90Plus = summary?.bucket_90_plus ?? rows.reduce((s, r) => s + (Number(r.bucket_90_plus) || 0), 0);
  const totalDisputed = rows.reduce((s, r) => s + (Number(r.disputed_amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 p-3.5 sm:p-6 pb-28 md:pb-16 space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
              Screen S-45 &middot; Ageing & Collections
            </span>
            <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Formula F-13 (4-Bucket Ageing)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Receivables Ageing Register & Dunning Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            4-Bucket receivables tracking (0–30, 31–60, 61–90, 90+ days), formal payment reminder notices, and bad-debt write-off controls.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/operate/payments"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            Payment Centre (S-43)
          </Link>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-200 flex items-center gap-1.5 shadow-2xs"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchAgingData}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
            title="Refresh Ageing"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4-Bucket Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Receivables Overdue
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {rows.length} active tenant accounts
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            0–30 Days (Current Due)
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600">
            ₹{(summary?.bucket_0_30 ?? rows.reduce((s, r) => s + (r.bucket_0_30 || 0), 0)).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Standard grace period billing
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            31–60 Days (Actionable Overdue)
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            ₹{(summary?.bucket_31_60 ?? rows.reduce((s, r) => s + (r.bucket_31_60 || 0), 0)).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Triggers AL-10 warning alerts
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] sm:text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
            90+ Days (Legal / Default Risk)
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            ₹{total90Plus.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Requires formal legal dunning notice
          </div>
        </div>
      </div>

      {/* Filter and Bucket Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tenant name, contract code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "all", label: "All Overdue" },
            { key: "31_60", label: "31–60d" },
            { key: "61_90", label: "61–90d" },
            { key: "90_plus", label: "90+ Days Risk" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedBucket(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedBucket === tab.key ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredRows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <div className="font-bold text-slate-700">Zero Receivables Overdue</div>
            <p className="text-xs text-slate-500 mt-1">All tenant billing collections are cleared and current.</p>
          </div>
        ) : (
          filteredRows.map((r) => (
            <div key={r.occupant_id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{r.occupant_name || "Occupant"}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{r.contract_code || "—"} &bull; {r.property_name || "—"}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  (r.oldest_due_days || 0) > 90 ? "bg-rose-100 text-rose-800" :
                  (r.oldest_due_days || 0) > 30 ? "bg-amber-100 text-amber-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {r.oldest_due_days || 0}d Overdue
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block">0-30d</span>
                  <span className="font-bold text-slate-800">₹{Number(r.bucket_0_30 ?? (r as any).current_0_30 ?? 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">31-60d</span>
                  <span className="font-bold text-amber-700">₹{Number(r.bucket_31_60 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">61-90d</span>
                  <span className="font-bold text-orange-700">₹{Number(r.bucket_61_90 || 0).toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">90+d</span>
                  <span className="font-bold text-rose-700">₹{Number(r.bucket_90_plus || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Arrears</div>
                  <div className="text-base font-black text-rose-700 font-mono">₹{Number(r.total_outstanding || 0).toLocaleString("en-IN")}</div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setActiveFollowupRow(r);
                      setPtpAmount(String(r.total_outstanding || 0));
                      setFollowupModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Phone className="w-3 h-3" /> Follow-up
                  </button>
                  <button
                    onClick={() => {
                      setActiveDunningRow(r);
                      setDunningModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" /> Remind
                  </button>
                  <button
                    onClick={() => {
                      setActiveWriteOffRow(r);
                      setWriteOffAmount(String(r.bucket_90_plus || 0));
                      setWriteOffModalOpen(true);
                    }}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Write-Off
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Occupant & Contract</th>
                <th className="py-3 px-4 text-right">0–30 Days (₹)</th>
                <th className="py-3 px-4 text-right">31–60 Days (₹)</th>
                <th className="py-3 px-4 text-right">61–90 Days (₹)</th>
                <th className="py-3 px-4 text-right">90+ Days (₹)</th>
                <th className="py-3 px-4 text-right font-bold">Total Overdue</th>
                <th className="py-3 px-4 text-center">Oldest Age</th>
                <th className="py-3 px-4 text-center">Dunning Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No overdue receivables matching filter. Collections are in prime standing.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.occupant_id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.occupant_name || "Occupant"}</div>
                      <div className="text-[10px] font-mono text-slate-400">{r.contract_code || "—"} &bull; {r.property_name || "—"}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ₹{Number(r.bucket_0_30 ?? (r as any).current_0_30 ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                      ₹{Number(r.bucket_31_60 || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-orange-700">
                      ₹{Number(r.bucket_61_90 || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-700">
                      ₹{Number(r.bucket_90_plus || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      ₹{Number(r.total_outstanding || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (r.oldest_due_days || 0) > 90 ? "bg-rose-100 text-rose-800" :
                        (r.oldest_due_days || 0) > 30 ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {r.oldest_due_days || 0} days
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveFollowupRow(r);
                            setPtpAmount(r.total_outstanding.toString());
                            setFollowupModalOpen(true);
                          }}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <Phone className="w-3 h-3" /> Follow-up
                        </button>
                        <button
                          onClick={() => {
                            setActiveDunningRow(r);
                            setDunningModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3 h-3" /> Remind
                        </button>
                        <button
                          onClick={() => {
                            setActiveWriteOffRow(r);
                            setWriteOffAmount(r.bucket_90_plus.toString());
                            setWriteOffModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                        >
                          Write-Off
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dunning Reminder Notice Modal */}
      {dunningModalOpen && activeDunningRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded">
                  Dunning Workflow &middot; AL-10
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Dispatch Payment Demand Notice</h3>
              </div>
              <button onClick={() => setDunningModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSendDunningNotice} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Recipient: <strong>{activeDunningRow.occupant_name}</strong></div>
                <div>Contract: <span className="font-mono">{activeDunningRow.contract_code}</span></div>
                <div>Arrears Overdue: <strong className="text-rose-700 font-mono">₹{Number(activeDunningRow.total_outstanding || 0).toLocaleString("en-IN")}</strong></div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dispatch Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDunningChannel("email")}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      dunningChannel === "email" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    Email Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setDunningChannel("whatsapp")}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      dunningChannel === "whatsapp" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setDunningChannel("both")}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      dunningChannel === "both" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    Both Channels
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                Notice will automatically attach the certified PDF Statement of Account, outstanding invoices list, and Razorpay quick payment link.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDunningModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotice}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {sendingNotice ? "Dispatching..." : "Send Demand Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bad Debt Write-Off Modal */}
      {writeOffModalOpen && activeWriteOffRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                  Formula F-13 &middot; RR-COL-06
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Request Bad Debt Write-Off</h3>
              </div>
              <button onClick={() => setWriteOffModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRequestWriteOff} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Write-Off Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={writeOffAmount}
                  onChange={(e) => setWriteOffAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Accounting Justification / Reason *</label>
                <select
                  value={writeOffReason}
                  onChange={(e) => setWriteOffReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Tenant Insolvency / Abandoned Premise">Tenant Insolvency / Abandoned Premise</option>
                  <option value="Legal Dispute Settlement Compromise">Legal Dispute Settlement Compromise</option>
                  <option value="Statutory Time-Barred Limitation">Statutory Time-Barred Limitation</option>
                  <option value="Small Balance Write-Off (< ₹1,000)">Small Balance Write-Off (&lt; ₹1,000)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Per governance controls (`S-66`), this write-off request will be routed to the <strong>Finance Manager & Asset Owner</strong> Checker approval matrix before the ledger adjustment note is posted.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWriteOffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWriteOff}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {submittingWriteOff ? "Submitting..." : "Submit for Approval (S-06)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* S-45: Collection Follow-up & Promise to Pay (PTP) Modal */}
      {followupModalOpen && activeFollowupRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-[#0F8B7D] rounded">
                  Screen S-45 &middot; AL-10 PTP Tracking
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Log Collection Follow-up &amp; PTP</h3>
              </div>
              <button onClick={() => setFollowupModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleLogFollowupSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Occupant: <strong>{activeFollowupRow.occupant_name}</strong></div>
                <div>Contract: <span className="font-mono">{activeFollowupRow.contract_code}</span></div>
                <div>Total Outstanding: <strong className="text-rose-700 font-mono">₹{Number(activeFollowupRow.total_outstanding || 0).toLocaleString("en-IN")}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interaction Channel *</label>
                  <select
                    value={followupChannel}
                    onChange={(e: any) => setFollowupChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                  >
                    <option value="call">Phone Call</option>
                    <option value="email">Email Follow-up</option>
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="visit">Premise In-Person Visit</option>
                    <option value="legal_notice">Formal Legal Demand Notice</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Call / Visit Outcome *</label>
                  <select
                    value={followupOutcome}
                    onChange={(e: any) => setFollowupOutcome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                  >
                    <option value="promised">Promised to Pay (PTP)</option>
                    <option value="disputed">Disputed Invoice</option>
                    <option value="no_response">No Response / Unreachable</option>
                    <option value="paid">Already Paid (UTR pending)</option>
                    <option value="other">Other Commercial Reason</option>
                  </select>
                </div>
              </div>

              {followupOutcome === "promised" && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-3">
                  <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider block">
                    Promise-to-Pay (PTP) Commitment
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">PTP Date *</label>
                      <input
                        type="date"
                        required
                        value={ptpDate}
                        onChange={(e) => setPtpDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-xs focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Promised Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={ptpAmount}
                        onChange={(e) => setPtpAmount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-900 focus:ring-2 focus:ring-[#0F8B7D]"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-teal-800">
                    If this date passes without matching receipt, system triggers <strong>Alert AL-10 (Promise Broken)</strong> to Finance.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={nextFollowupDate}
                  onChange={(e) => setNextFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes &amp; Discussion Summary</label>
                <textarea
                  rows={2}
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="Spoke with Head of Accounts; agreed on payment date..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFollowupModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFollowup}
                  className="px-5 py-2 bg-[#0F8B7D] hover:bg-[#0c6e63] text-white rounded-xl font-bold transition shadow-sm"
                >
                  {submittingFollowup ? "Saving..." : "Save Follow-up (Task S-45)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
