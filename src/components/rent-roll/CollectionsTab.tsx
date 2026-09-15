"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  FileCheck2,
  Building,
  DollarSign,
  Plus
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface CollectionReceipt {
  id: string;
  receiptNumber: string;
  invoiceNumber?: string;
  leaseCode: string;
  tenantName: string;
  propertyName: string;
  paymentDate: string;
  paymentMode: string;
  referenceNumber: string;
  amountReceived: number;
  tdsDeducted: number;
  bankCharges: number;
  netCredited: number;
  bankAccount: string;
  notes?: string;
}

interface CollectionsTabProps {
  collections: CollectionReceipt[];
  onOpenRecordPayment: () => void;
}

export const CollectionsTab: React.FC<CollectionsTabProps> = ({
  collections,
  onOpenRecordPayment,
}) => {
  const [search, setSearch] = useState<string>("");

  const filteredCollections = collections.filter((c) => {
    if (
      search &&
      !c.receiptNumber.toLowerCase().includes(search.toLowerCase()) &&
      !c.tenantName.toLowerCase().includes(search.toLowerCase()) &&
      !c.referenceNumber?.toLowerCase().includes(search.toLowerCase()) &&
      !c.propertyName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalCollected = collections.reduce((sum, c) => sum + c.amountReceived, 0);
  const totalTds = collections.reduce((sum, c) => sum + c.tdsDeducted, 0);
  const totalCredited = collections.reduce((sum, c) => sum + c.netCredited, 0);

  return (
    <div className="space-y-4">
      {/* ──── TOP COLLECTIONS KPI SUMMARY ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Gross Collections</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalCollected)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{collections.length} Receipts Processed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TDS Recorded (Sec 194I)</span>
          <div className="text-2xl font-bold text-white mt-1">{formatINR(totalTds)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Certificates to be collected</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Net Bank Inflow</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{formatINR(totalCredited)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">100% Bank Reconciled</p>
        </div>
      </div>

      {/* ──── SEARCH & RECORD PAYMENT BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search receipt #, UTR, or tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={onOpenRecordPayment}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment Receipt</span>
        </button>
      </div>

      {/* ──── COLLECTIONS LEDGER TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Receipt Number</th>
                <th className="p-3">Invoice & Lease</th>
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Property</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Reference / UTR</th>
                <th className="p-3 text-right text-emerald-400 font-bold">Amount Received</th>
                <th className="p-3 text-right">TDS Deducted</th>
                <th className="p-3 text-right text-white font-bold">Net Credited</th>
                <th className="p-3">Escrow Bank Account</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCollections.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>{c.receiptNumber}</span>
                  </td>

                  <td className="p-3">
                    <span className="font-mono text-amber-400 font-semibold">{c.invoiceNumber || "Direct Settlement"}</span>
                    <span className="text-[10px] text-slate-500 block">{c.leaseCode}</span>
                  </td>

                  <td className="p-3 font-bold text-white">
                    {c.tenantName}
                  </td>

                  <td className="p-3 text-slate-300">
                    {c.propertyName}
                  </td>

                  <td className="p-3 font-mono text-slate-300">
                    {c.paymentDate}
                  </td>

                  <td className="p-3 uppercase text-[11px] text-slate-300 font-semibold">
                    <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
                      {c.paymentMode.replace("_", " / ")}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-cyan-300">
                    {c.referenceNumber}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-emerald-400 bg-emerald-950/10">
                    {formatINR(c.amountReceived)}
                  </td>

                  <td className="p-3 text-right font-mono text-slate-400">
                    {c.tdsDeducted > 0 ? formatINR(c.tdsDeducted) : "₹0"}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-white">
                    {formatINR(c.netCredited)}
                  </td>

                  <td className="p-3 text-slate-400 text-[11px] truncate max-w-xs">
                    {c.bankAccount}
                  </td>

                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Reconciled
                    </span>
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
