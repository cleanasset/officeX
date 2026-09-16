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
      <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-gray-600">Calculating Accounts Receivable Aging Matrix...</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Current */}
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current (Not Due)</span>
          <div className="text-lg font-black text-gray-900 mt-1">{formatINR(summary.current)}</div>
          <span className="text-[10px] text-gray-400 font-medium">Due within grace period</span>
        </div>

        {/* 1-30 Days */}
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">1–30 Days Overdue</span>
          <div className="text-lg font-black text-amber-900 mt-1">{formatINR(summary.bucket0to30)}</div>
          <span className="text-[10px] text-amber-700 font-medium">First reminder cycle</span>
        </div>

        {/* 31-60 Days */}
        <div className="bg-white border border-orange-200 p-4 rounded-2xl shadow-xs bg-orange-50/20">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">31–60 Days Overdue</span>
          <div className="text-lg font-black text-orange-900 mt-1">{formatINR(summary.bucket31to60)}</div>
          <span className="text-[10px] text-orange-700 font-medium">Escalation notice</span>
        </div>

        {/* 61-90 Days */}
        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">61–90 Days Overdue</span>
          <div className="text-lg font-black text-rose-900 mt-1">{formatINR(summary.bucket61to90)}</div>
          <span className="text-[10px] text-rose-700 font-medium">Dunning notice stage</span>
        </div>

        {/* 90+ Days */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">90+ Days Overdue</span>
          <div className="text-lg font-black text-rose-700 mt-1">{formatINR(summary.bucket90Plus)}</div>
          <span className="text-[10px] text-rose-600 font-bold">Critical default risk</span>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white border border-amber-300 p-4 rounded-2xl shadow-xs bg-amber-50/30">
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Total Outstanding</span>
          <div className="text-lg font-black text-amber-950 mt-1">{formatINR(summary.totalOutstanding)}</div>
          <span className="text-[10px] text-amber-800 font-semibold">{summary.invoicesCount} Invoices Pending</span>
        </div>
      </div>

      {/* Reminder notification toast */}
      {reminderSentTenant && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-[#0F8B7D] text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-fadeIn">
          <span>Official Dunning notice &amp; automated payment link dispatched to {reminderSentTenant}.</span>
          <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-md font-bold">Sent</span>
        </div>
      )}

      {/* ──── TENANT-WISE AGING BREAKDOWN TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Accounts Receivable Aging by Tenant</h3>
            <p className="text-xs text-gray-500 font-medium">Click a tenant to expand invoice-level line items and trigger reminders</p>
          </div>
          <button
            onClick={onOpenRecordPayment}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            Record Payment Receipt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Tenant &amp; Property</th>
                <th className="p-3.5 text-right">Current</th>
                <th className="p-3.5 text-right text-amber-700">1–30 Days</th>
                <th className="p-3.5 text-right text-orange-700">31–60 Days</th>
                <th className="p-3.5 text-right text-rose-700">61–90 Days</th>
                <th className="p-3.5 text-right text-rose-800 font-black">90+ Days</th>
                <th className="p-3.5 text-right text-amber-900 font-black bg-amber-50/40">Total Due</th>
                <th className="p-3.5 text-center">Dunning Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {tenantBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500 text-xs">
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
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      >
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#0F8B7D]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <div className="font-bold text-gray-950">{t.tenantName}</div>
                            <div className="text-[11px] text-gray-500 font-normal">{t.propertyName}</div>
                          </div>
                        </td>

                        <td className="p-3.5 text-right font-mono text-gray-400">
                          {t.current > 0 ? formatINR(t.current) : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-amber-700 font-semibold">
                          {t.bucket0to30 > 0 ? formatINR(t.bucket0to30) : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-orange-700 font-semibold">
                          {t.bucket31to60 > 0 ? formatINR(t.bucket31to60) : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-rose-600 font-bold">
                          {t.bucket61to90 > 0 ? formatINR(t.bucket61to90) : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-rose-700 font-black">
                          {t.bucket90Plus > 0 ? formatINR(t.bucket90Plus) : "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono font-black text-amber-900 bg-amber-50/40">
                          {formatINR(t.totalOutstanding)}
                        </td>

                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSendReminder(t.tenantName)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3 text-[#0F8B7D]" />
                            <span>Send Demand</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Invoices List */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={8} className="p-4 pl-10 border-y border-gray-200">
                            <div className="space-y-2">
                              <p className="text-[11px] font-bold uppercase text-gray-500">
                                Pending Invoices for {t.tenantName}:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {t.invoices.map((inv, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-white border border-gray-200 rounded-xl text-xs flex justify-between items-center shadow-2xs"
                                  >
                                    <div>
                                      <span className="font-mono font-bold text-indigo-700">{inv.invoiceNumber}</span>
                                      <div className="text-[10px] text-gray-400 font-medium">Due: {inv.dueDate} ({inv.daysOverdue}d overdue)</div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-mono font-bold text-rose-600">{formatINR(inv.balanceDue)}</span>
                                      <span className="text-[10px] text-rose-600 block capitalize font-medium">{inv.status}</span>
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
