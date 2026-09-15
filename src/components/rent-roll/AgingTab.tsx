"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Send,
  Building,
  DollarSign,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Calendar
} from "lucide-react";
import { formatINR } from "./DashboardTab";

interface AgingData {
  summary: {
    current: number;
    bucket0to30: number;
    bucket31to60: number;
    bucket61to90: number;
    bucket90Plus: number;
    totalOutstanding: number;
    invoicesCount: number;
  };
  tenantBreakdown: Array<{
    tenantId: string;
    tenantName: string;
    propertyName: string;
    current: number;
    bucket0to30: number;
    bucket31to60: number;
    bucket61to90: number;
    bucket90Plus: number;
    totalOutstanding: number;
    invoices: Array<{
      invoiceNumber: string;
      dueDate: string;
      daysOverdue: number;
      balanceDue: number;
      status: string;
    }>;
  }>;
}

interface AgingTabProps {
  agingData: AgingData | null;
  onOpenRecordPayment: () => void;
}

export const AgingTab: React.FC<AgingTabProps> = ({ agingData, onOpenRecordPayment }) => {
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [reminderSentTenant, setReminderSentTenant] = useState<string | null>(null);

  if (!agingData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-400">Calculating Accounts Receivable Aging Matrix...</p>
      </div>
    );
  }

  const { summary, tenantBreakdown } = agingData;

  const handleSendReminder = (tenantName: string) => {
    setReminderSentTenant(tenantName);
    setTimeout(() => {
      setReminderSentTenant(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* ──── AGING BUCKET CARDS ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Current */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current (Not Due)</span>
          <div className="text-lg font-bold text-white mt-1">{formatINR(summary.current)}</div>
          <span className="text-[10px] text-slate-500">Due within grace period</span>
        </div>

        {/* 1-30 Days */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">1–30 Days Overdue</span>
          <div className="text-lg font-bold text-amber-300 mt-1">{formatINR(summary.bucket0to30)}</div>
          <span className="text-[10px] text-slate-500">First reminder cycle</span>
        </div>

        {/* 31-60 Days */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">31–60 Days Overdue</span>
          <div className="text-lg font-bold text-orange-300 mt-1">{formatINR(summary.bucket31to60)}</div>
          <span className="text-[10px] text-slate-500">Escalation to Management</span>
        </div>

        {/* 61-90 Days */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">61–90 Days Overdue</span>
          <div className="text-lg font-bold text-red-300 mt-1">{formatINR(summary.bucket61to90)}</div>
          <span className="text-[10px] text-slate-500">Dunning notice stage</span>
        </div>

        {/* 90+ Days */}
        <div className="bg-slate-900 border border-red-900/60 p-3.5 rounded-xl shadow bg-red-950/20">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">90+ Days Overdue</span>
          <div className="text-lg font-bold text-red-400 mt-1">{formatINR(summary.bucket90Plus)}</div>
          <span className="text-[10px] text-red-400">Critical default risk</span>
        </div>

        {/* Total Outstanding */}
        <div className="bg-slate-900 border border-amber-500/30 p-3.5 rounded-xl shadow bg-amber-950/10">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Total Outstanding</span>
          <div className="text-lg font-bold text-amber-300 mt-1">{formatINR(summary.totalOutstanding)}</div>
          <span className="text-[10px] text-slate-400">{summary.invoicesCount} Invoices Pending</span>
        </div>
      </div>

      {/* Reminder notification toast */}
      {reminderSentTenant && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold rounded-lg flex items-center justify-between animate-fadeIn">
          <span>Official Dunning notice & automated payment link dispatched to {reminderSentTenant}.</span>
          <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded">Sent</span>
        </div>
      )}

      {/* ──── TENANT-WISE AGING BREAKDOWN TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Accounts Receivable Aging by Tenant</h3>
            <p className="text-xs text-slate-400">Click a tenant to expand invoice-level line items and trigger reminders</p>
          </div>
          <button
            onClick={onOpenRecordPayment}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            Record Payment Receipt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Tenant & Property</th>
                <th className="p-3 text-right">Current</th>
                <th className="p-3 text-right text-amber-400">1–30 Days</th>
                <th className="p-3 text-right text-orange-400">31–60 Days</th>
                <th className="p-3 text-right text-red-400">61–90 Days</th>
                <th className="p-3 text-right text-red-500 font-bold">90+ Days</th>
                <th className="p-3 text-right text-amber-300 font-bold">Total Due</th>
                <th className="p-3 text-center">Dunning Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tenantBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    No overdue accounts receivable found. All tenants in good standing!
                  </td>
                </tr>
              ) : (
                tenantBreakdown.map((t) => {
                  const isExpanded = expandedTenant === t.tenantId;
                  return (
                    <React.Fragment key={t.tenantId}>
                      <tr
                        onClick={() => setExpandedTenant(isExpanded ? null : t.tenantId)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <div>
                            <div>{t.tenantName}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{t.propertyName}</div>
                          </div>
                        </td>

                        <td className="p-3 text-right font-mono text-slate-400">
                          {t.current > 0 ? formatINR(t.current) : "—"}
                        </td>

                        <td className="p-3 text-right font-mono text-amber-300 font-semibold">
                          {t.bucket0to30 > 0 ? formatINR(t.bucket0to30) : "—"}
                        </td>

                        <td className="p-3 text-right font-mono text-orange-300 font-semibold">
                          {t.bucket31to60 > 0 ? formatINR(t.bucket31to60) : "—"}
                        </td>

                        <td className="p-3 text-right font-mono text-red-300 font-bold">
                          {t.bucket61to90 > 0 ? formatINR(t.bucket61to90) : "—"}
                        </td>

                        <td className="p-3 text-right font-mono text-red-400 font-bold">
                          {t.bucket90Plus > 0 ? formatINR(t.bucket90Plus) : "—"}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10">
                          {formatINR(t.totalOutstanding)}
                        </td>

                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSendReminder(t.tenantName)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1.5 mx-auto transition-all"
                          >
                            <Send className="w-3 h-3 text-amber-400" />
                            <span>Send Demand</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Invoices List */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70">
                          <td colSpan={8} className="p-4 pl-10">
                            <div className="space-y-2">
                              <p className="text-[11px] font-semibold uppercase text-slate-400">
                                Pending Invoices for {t.tenantName}:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {t.invoices.map((inv, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-mono font-bold text-amber-400">{inv.invoiceNumber}</span>
                                      <div className="text-[10px] text-slate-500">Due: {inv.dueDate} ({inv.daysOverdue} days overdue)</div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-bold text-red-400">{formatINR(inv.balanceDue)}</span>
                                      <span className="text-[10px] text-red-400 block capitalize">{inv.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
