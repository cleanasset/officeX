"use client";

import React, { useState, useEffect } from "react";
import { ListFilter, Search, RefreshCw, FileText } from "lucide-react";

export default function AuditTrailLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.traceId.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    
    const matchesSeverity = 
      severityFilter === "all" || 
      log.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Trail Ledger</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Immutable trace records detailing all system mutations, provisioning events, and KYC actions.</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-700"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="premium-card p-4 border border-gray-200 bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input 
            type="text" 
            placeholder="Search by Trace ID or Module..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
          />
          <Search size={14} className="absolute left-3.5 top-3 text-gray-600" />
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-xs bg-white"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

      </div>

      {/* Logs Table */}
      <div className="premium-card p-6 border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-4">Trace ID</th>
                <th className="py-4">Timestamp</th>
                <th className="py-4">Module</th>
                <th className="py-4">Severity</th>
                <th className="py-4">Action Event</th>
                <th className="py-4">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 font-mono font-bold text-red-600">{log.traceId}</td>
                  <td className="py-4 text-gray-600">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now"}
                  </td>
                  <td className="py-4 font-bold text-gray-900">{log.module}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      log.severity === "critical"
                        ? "bg-red-600 text-white font-bold border border-red-100"
                        : log.severity === "warning"
                        ? "bg-amber-600 text-white font-bold border border-amber-100"
                        : "bg-emerald-600 text-white font-bold border border-emerald-100"
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-4 text-gray-600 max-w-md break-words">{log.action}</td>
                  <td className="py-4 text-gray-600 font-mono">{log.ipAddress || "127.0.0.1"}</td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600">
                    <FileText size={32} className="mx-auto mb-2 text-gray-200" />
                    No audit log entries matched search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
