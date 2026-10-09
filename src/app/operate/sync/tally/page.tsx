"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle,
  Database,
  Building,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Code2,
  Table,
  Check
} from "lucide-react";

export default function TallySyncPage() {
  const [period, setPeriod] = useState("Oct-2026");
  const [voucherType, setVoucherType] = useState("all");
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, [period, voucherType]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sync/tally?period=${period}&type=${voucherType}`);
      const json = await res.json();
      if (json.success && json.data) {
        setVouchers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    try {
      const res = await fetch("/api/sync/tally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, voucher_type: voucherType }),
      });
      const json = await res.json();
      if (json.success) {
        setSynced(true);
        setTimeout(() => setSynced(false), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                RR-INT-01
              </span>
              <span className="text-xs text-slate-500 font-mono">ERP Accounting Integration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Database className="text-[#0D7B6C]" size={26} />
              Tally Prime &amp; ERP Accounting Sync
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Export sales register, receipt vouchers, and credit notes mapped directly to Tally Prime XML schema and ledger heads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm font-medium text-slate-700"
            >
              <option value="Oct-2026">October 2026</option>
              <option value="Sep-2026">September 2026</option>
            </select>

            <select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm font-medium text-slate-700"
            >
              <option value="all">All Vouchers</option>
              <option value="sales">Sales Register (Invoices)</option>
              <option value="receipts">Receipts Register</option>
              <option value="credit_notes">Credit Notes</option>
            </select>

            <a
              href={`/api/sync/tally?period=${period}&type=${voucherType}&format=xml`}
              download
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0D7B6C] hover:bg-[#09574C] rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Code2 size={16} /> Download Tally XML
            </a>

            <a
              href={`/api/sync/tally?period=${period}&type=${voucherType}&format=csv`}
              download
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
            >
              <Table size={16} /> Export CSV Journal
            </a>
          </div>
        </div>

        {synced && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <span>Tally ERP journal entries posted and verified successfully.</span>
          </div>
        )}

        {/* Ledger Mapping Overview Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Tally Company Name:</span>
            <span className="font-bold text-slate-900 text-sm">Meridian Tech Park SPV</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Debtors Control Ledger:</span>
            <span className="font-bold text-slate-900 text-sm">Sundry Debtors (Commercial)</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Income Ledger Heads:</span>
            <span className="font-bold text-slate-900 text-sm">Rent Income • CAM Recovery</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Tax Ledger Heads:</span>
            <span className="font-bold text-slate-900 text-sm">Output CGST/SGST/IGST • TDS 194I</span>
          </div>
        </div>

        {/* Vouchers List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Generated Accounting Journal Vouchers ({vouchers.length} Total)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dual-entry balanced debits and credits ready for automated Tally Prime import</p>
            </div>
            <button
              onClick={handleTriggerSync}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0D7B6C] rounded-lg shadow-sm"
            >
              Sync to ERP Server
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-[#0D7B6C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Generating Tally accounting vouchers...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((v, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {v.voucher_number}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{v.party_ledger}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 font-mono">{v.date}</span>
                      <span className="font-bold text-slate-900 text-sm">₹{v.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">{v.narration}</p>

                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Tally Ledger Account</th>
                          <th className="py-2 px-3 text-right">Debit (INR)</th>
                          <th className="py-2 px-3 text-right">Credit (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {v.entries.map((entry: any, eIdx: number) => (
                          <tr key={eIdx}>
                            <td className="py-1.5 px-3 font-sans font-medium text-slate-800">{entry.ledger}</td>
                            <td className="py-1.5 px-3 text-right text-emerald-700 font-semibold">
                              {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right text-slate-700">
                              {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
