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
} from "lucide-react";

export default function VisitorMasterHistoryPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/vc/dashboard?orgId=org_officex_demo")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.recentVisits) {
          setVisits(json.data.recentVisits);
        }
      });
  }, []);

  const filtered = visits.filter(
    (v) =>
      (v.visitorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.hostName || "").toLowerCase().includes(search.toLowerCase())
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

        <button
          type="button"
          onClick={() => alert("Exporting visitor historical archive to CSV...")}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export Master CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visitor, host, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-72"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total Logs: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Visitor</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Host Name</th>
              <th className="py-3 px-4">Tenant / Floor</th>
              <th className="py-3 px-4">Visit Date & Time</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-white">{v.visitorName}</td>
                <td className="py-3.5 px-4">{v.company || "Guest"}</td>
                <td className="py-3.5 px-4">{v.hostName}</td>
                <td className="py-3.5 px-4">{v.tenantName || v.floor}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  {v.checkinAt ? new Date(v.checkinAt).toLocaleString() : "Scheduled"}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    v.status === "checked_in"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
