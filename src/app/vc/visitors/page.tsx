"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Building,
  UserCheck,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Loader2,
  UserPlus,
} from "lucide-react";

export default function VisitorMasterHistoryPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors?status=${statusFilter}&orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVisits(json.data);
      }
    } catch (err) {
      console.error("Error fetching visitor history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const handleExportCSV = () => {
    if (visits.length === 0) {
      alert("No records to export");
      return;
    }

    const headers = ["PassNumber,VisitorName,Company,Mobile,HostName,TenantName,Floor,VisitStart,Status"];
    const rows = visits.map((v) =>
      `"${v.passNumber || ""}","${v.name || ""}","${v.company || ""}","${v.mobile || ""}","${v.hostName || ""}","${v.tenantName || ""}","${v.floor || ""}","${v.visitStart || ""}","${v.status || ""}"`
    );

    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `officex_visitor_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = visits.filter(
    (v) =>
      !search ||
      (v.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.hostName || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.passNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Visitor Master Log (VC-10)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Visitor History & Records</h1>
          <p className="text-xs text-slate-400">
            Complete historical audit trail of all guests, contractors, deliveries, and VIP arrivals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vc/visitors/pre-register"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pre-Register Guest</span>
          </Link>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search visitor, host, company, pass #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-72"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled / Expected</option>
            <option value="inside">Active Inside</option>
            <option value="checked_out">Checked Out</option>
            <option value="overstay">Overstay Alert</option>
            <option value="denied">Denied Access</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchVisits}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="text-xs text-slate-400">
            Total Logs: <span className="text-white font-mono font-bold">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Visitor & Pass #</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Host Name</th>
              <th className="py-3 px-4">Tenant / Floor</th>
              <th className="py-3 px-4">Visit Window</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {loading && visits.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
                  <div>Loading master visitor log from database...</div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((v) => (
                <tr key={v.visitId} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{v.name}</div>
                    <div className="text-[11px] text-blue-400 font-mono">{v.passNumber || "No Pass #"}</div>
                  </td>
                  <td className="py-3.5 px-4">{v.company || "Individual"}</td>
                  <td className="py-3.5 px-4">{v.hostName || "Reception Desk"}</td>
                  <td className="py-3.5 px-4">{v.tenantName || v.floor || "Lobby"}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {v.visitStart ? new Date(v.visitStart).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        v.status === "checked_in"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : v.status === "checked_out"
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : v.status === "overstay"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : v.status === "denied"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {v.status?.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div>No visitor history records found matching criteria.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
