"use client";
import React, { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function AuditTrailLogsDashboard() {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [search, setSearch] = useState("");

  const logs = [
    {
      time: "24-Aug 02:14:32",
      traceId: "TR-982410",
      user: "Rajesh Kumar",
      isAi: false,
      module: "Compliance",
      action: "Renewed Electrical Safety Cert (Apex Tower)",
      ip: "192.168.1.42",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      time: "24-Aug 01:05:11",
      traceId: "TR-973541",
      user: "SYSTEM AI",
      isAi: true,
      module: "Al Assistant",
      action: "Suggested Vendor TechServe for RFQ-089",
      ip: "—",
      severity: "AI Event",
      sevClass: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      time: "23-Aug 18:22:45",
      traceId: "TR-965410",
      user: "Amit K. (Auditor)",
      isAi: false,
      module: "Admin",
      action: "Modified RBAC matrix for Property Mgr role",
      ip: "10.0.4.15",
      severity: "Warning",
      sevClass: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      time: "23-Aug 11:45:02",
      traceId: "TR-952410",
      user: "Unknown Actor",
      isAi: false,
      isAlert: true,
      module: "Auth",
      moduleColor: "text-red-600 font-bold",
      action: "Failed login attempt (Invalid credentials)",
      actionColor: "text-red-600 font-semibold",
      ip: "198.51.100.4",
      severity: "Critical",
      sevClass: "text-red-700 bg-red-50 border-red-200"
    },
    {
      time: "23-Aug 10:12:33",
      traceId: "TR-951120",
      user: "System Batch",
      isAi: false,
      module: "Maintenance",
      action: "Auto-generated monthly PM tickets for HVAC",
      ip: "Internal",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      time: "23-Aug 09:05:15",
      traceId: "TR-950890",
      user: "Priya Singh",
      isAi: false,
      module: "Lease Mgt",
      action: "Uploaded signed contract DOC-882-v2.pdf",
      ip: "192.168.1.105",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      time: "22-Aug 16:45:00",
      traceId: "TR-945660",
      user: "System Batch",
      isAi: false,
      module: "Occupancy",
      action: "Sync complete with IoT badge scanners (Tower B)",
      ip: "Internal",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      time: "22-Aug 14:20:12",
      traceId: "TR-942110",
      user: "Rajesh Kumar",
      isAi: false,
      module: "Settings",
      action: "Updated notification preferences (Email enabled)",
      ip: "192.168.1.42",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      time: "22-Aug 11:05:44",
      traceId: "TR-939005",
      user: "SYSTEM AI",
      isAi: true,
      module: "Al Assistant",
      action: "Flagged anomalous energy usage spike on Floor 4",
      ip: "—",
      severity: "AI Event",
      sevClass: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      time: "22-Aug 08:30:00",
      traceId: "TR-935400",
      user: "Auth Service",
      isAi: false,
      module: "Auth",
      action: "Successful SSO key rotation",
      ip: "Internal",
      severity: "Info",
      sevClass: "text-emerald-700 bg-emerald-50 border-emerald-200"
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Activity Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and trace all administrative and system-level actions.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm">
          <Download size={14} /> Export Audit Log
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Trace ID, User, or Action..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
            />
          </div>
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white">
            <option>All Actors</option>
            <option>System AI</option>
            <option>Rajesh Kumar</option>
            <option>System Batch</option>
          </select>
          <select className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white">
            <option>All Modules</option>
            <option>Compliance</option>
            <option>AI Assistant</option>
            <option>Admin</option>
            <option>Auth</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <button
            onClick={() => setFilterSeverity("critical")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              filterSeverity === "critical"
                ? "bg-red-50 text-red-600 border-red-300"
                : "border-red-200 text-red-600 hover:bg-red-50/50"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity("warning")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              filterSeverity === "warning"
                ? "bg-amber-50 text-amber-600 border-amber-300"
                : "border-amber-200 text-amber-600 hover:bg-amber-50/50"
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => setFilterSeverity("info")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              filterSeverity === "info"
                ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50/50"
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6">TIMESTAMP</th>
              <th className="py-4 px-4">TRACE ID</th>
              <th className="py-4 px-4">USER / ACTOR</th>
              <th className="py-4 px-4">MODULE</th>
              <th className="py-4 px-6">ACTION PERFORMED</th>
              <th className="py-4 px-4">IP ADDRESS</th>
              <th className="py-4 px-6 text-right">SEVERITY</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.traceId} className="border-b border-gray-100 hover:bg-gray-50/50 text-xs">
                <td className="py-3.5 px-6 text-gray-500 font-mono">{log.time}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{log.traceId}</td>
                <td className="py-3.5 px-4">
                  {log.isAi ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      🤖 SYSTEM AI
                    </span>
                  ) : log.isAlert ? (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      🔕 Unknown Actor
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-800">{log.user}</span>
                  )}
                </td>
                <td className={`py-3.5 px-4 ${log.moduleColor || "text-gray-600"}`}>{log.module}</td>
                <td className={`py-3.5 px-6 ${log.actionColor || "text-gray-800"}`}>{log.action}</td>
                <td className="py-3.5 px-4 text-gray-500 font-mono">{log.ip}</td>
                <td className="py-3.5 px-6 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${log.sevClass}`}>
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing 10 of 2,491 log entries</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <ChevronLeft size={14} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">2</button>
            <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
