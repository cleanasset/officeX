"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, ShieldCheck, RefreshCw, Clock, Filter, AlertCircle } from "lucide-react";

export default function AuditTrailLogsDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/audit");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error(e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search === "" ||
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.entity || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterAction === "all" ||
      (log.action || "").toLowerCase().includes(filterAction.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-wider">
              System Audit Desk
            </span>
            <span className="text-xs text-slate-400 font-medium">Compliance &amp; Security Timeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#0F8B7D] w-6 h-6 shrink-0" />
            <span>Immutable System Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-proof, timestamped event ledger capturing contract revisions, financial changes, and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAuditLogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <a
            href="/api/settings/audit?format=csv"
            className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c6e63] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-bold">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Filter:</span>
          {["all", "contract", "lease", "invoice", "property"].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterAction(filter)}
              className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer shrink-0 ${
                filterAction === filter
                  ? "bg-[#0F8B7D] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter === "all" ? "All Events" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Querying immutable audit log database...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center p-6 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Audit Events Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Real tamper-proof audit records will appear here as users create properties, execute lease contracts, adjust rent escalations, or issue tax invoices.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">TIMESTAMP</th>
                  <th className="py-3.5 px-4">ACTION</th>
                  <th className="py-3.5 px-4">ENTITY / TARGET</th>
                  <th className="py-3.5 px-4">PERFORMED BY</th>
                  <th className="py-3.5 px-4">DETAILS</th>
                  <th className="py-3.5 px-4 text-right">SOURCE / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.entity}</span>
                      {log.record_id && (
                        <span className="text-[10px] font-mono text-slate-400">ID: {String(log.record_id).slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{log.user_role || "User"}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {log.ip_address} ({log.source})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredLogs.length > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredLogs.length} verified audit records</span>
            <span className="font-semibold text-slate-400">RERA &amp; Statutory Compliance Compliant</span>
          </div>
        )}
      </div>
    </div>
  );
}
