"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Clock,
  UserCheck,
  Settings,
  Sliders,
  CheckCircle2,
  Database,
  FileCode2
} from "lucide-react";

export interface AuditLogItem {
  id: string;
  leaseId?: string;
  entityName: string;
  action: string;
  oldValues?: any;
  newValues?: any;
  changedBy: string;
  timestamp: string;
}

interface AuditTabProps {
  logs: AuditLogItem[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  return (
    <div className="space-y-6">
      {/* ──── SYSTEM CONFIGURATION SETTINGS ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Institutional Rent Roll Engine Parameters</span>
            </h3>
            <p className="text-xs text-slate-400">Global tax, accounting fiscal year, and automated compliance thresholds</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Engine v2.4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Default Commercial GST</span>
            <div className="text-base font-bold text-white mt-1">18.00% (CGST 9% + SGST 9%)</div>
            <p className="text-[10px] text-slate-500 mt-0.5">HSN/SAC Code 997212</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Fiscal Year Cycle</span>
            <div className="text-base font-bold text-white mt-1">April 1 – March 31 (FY 2026–27)</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Invoice sequence resets April 1</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Expiry Alert Threshold</span>
            <div className="text-base font-bold text-purple-300 mt-1">90 / 60 / 30 Days Prior</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Automated renewal notices</p>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Escalation Alert Advance</span>
            <div className="text-base font-bold text-cyan-300 mt-1">30 Days Advance Notice</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Dispatches tenant notice letter</p>
          </div>
        </div>
      </div>

      {/* ──── CHRONOLOGICAL AUDIT TRAIL ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Commercial Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400">Complete trace history of lease modifications, escalations, collections and notices</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{logs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Operator / System</th>
                <th className="p-3">Modification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </td>

                  <td className="p-3 font-semibold text-white">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[11px] border border-slate-700">
                      {log.entityName}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-amber-400 font-bold">
                    {log.action}
                  </td>

                  <td className="p-3 text-slate-300">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{log.changedBy}</span>
                    </span>
                  </td>

                  <td className="p-3 text-slate-400 font-mono text-[11px] truncate max-w-md">
                    {log.newValues ? JSON.stringify(log.newValues) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
