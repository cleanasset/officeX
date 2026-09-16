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
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                <Sliders className="w-4 h-4" />
              </div>
              <span>Institutional Rent Roll Engine Parameters</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Global tax, accounting fiscal year, and automated compliance thresholds</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 self-start sm:self-auto">
            Engine v2.4 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-500">Default Commercial GST</span>
            <div className="text-sm font-black text-gray-900 mt-1">18.00% (CGST 9% + SGST 9%)</div>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">HSN/SAC Code 997212</p>
          </div>

          <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-500">Fiscal Year Cycle</span>
            <div className="text-sm font-black text-gray-900 mt-1">April 1 – March 31 (FY 2026–27)</div>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Invoice sequence resets April 1</p>
          </div>

          <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-500">Expiry Alert Threshold</span>
            <div className="text-sm font-black text-purple-900 mt-1">90 / 60 / 30 Days Prior</div>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Automated renewal notices</p>
          </div>

          <div className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-500">Escalation Alert Advance</span>
            <div className="text-sm font-black text-blue-900 mt-1">30 Days Advance Notice</div>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Dispatches tenant notice letter</p>
          </div>
        </div>
      </div>

      {/* ──── CHRONOLOGICAL AUDIT TRAIL ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 text-[#0F8B7D] rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Immutable Commercial Audit Log</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Complete trace history of lease modifications, escalations, collections and notices</p>
          </div>
          <span className="text-xs text-gray-500 font-mono font-bold bg-gray-100 px-2.5 py-1 rounded-lg">{logs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Action Performed</th>
                <th className="p-3.5">Operator / System</th>
                <th className="p-3.5">Modification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </td>

                  <td className="p-3.5 font-bold text-gray-900">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] border border-gray-200">
                      {log.entityName}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-indigo-700 font-bold">
                    {log.action}
                  </td>

                  <td className="p-3.5 text-gray-700">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold">{log.changedBy}</span>
                    </span>
                  </td>

                  <td className="p-3.5 text-gray-500 font-mono text-[11px] truncate max-w-md">
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
