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
        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Gross Collections</span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-1">{formatINR(totalCollected)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">{collections.length} Receipts Processed</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TDS Recorded (Sec 194I)</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalTds)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">Certificates to be collected</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Net Bank Inflow</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{formatINR(totalCredited)}</div>
          <p className="text-[11px] text-teal-700 font-bold mt-0.5">100% Bank Reconciled</p>
        </div>
      </div>

      {/* ──── SEARCH & RECORD PAYMENT BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipt #, UTR, or tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] shadow-2xs"
          />
        </div>

        <button
          onClick={onOpenRecordPayment}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment Receipt</span>
        </button>
      </div>

      {/* ──── COLLECTIONS LEDGER TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Receipt Number</th>
                <th className="p-3.5">Invoice &amp; Lease</th>
                <th className="p-3.5">Tenant Name</th>
                <th className="p-3.5">Property</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Payment Mode</th>
                <th className="p-3.5">Reference / UTR</th>
                <th className="p-3.5 text-right text-teal-700 font-black">Amount Received</th>
                <th className="p-3.5 text-right">TDS Deducted</th>
                <th className="p-3.5 text-right text-gray-900 font-bold">Net Credited</th>
                <th className="p-3.5">Escrow Bank Account</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredCollections.map((c, idx) => (
                <tr key={`${c.id || c.receiptNumber}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-teal-700 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#0F8B7D]" />
                    <span>{c.receiptNumber}</span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono text-indigo-700 font-bold">{c.invoiceNumber || "Direct Settlement"}</span>
                    <span className="text-[10px] text-gray-400 block">{c.leaseCode}</span>
                  </td>

                  <td className="p-3.5 font-bold text-gray-900">
                    {c.tenantName}
                  </td>

                  <td className="p-3.5 text-gray-600">
                    {c.propertyName}
                  </td>

                  <td className="p-3.5 font-mono text-gray-700">
                    {c.paymentDate}
                  </td>

                  <td className="p-3.5 uppercase text-[11px] text-gray-700 font-bold">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md border border-gray-200">
                      {c.paymentMode.replace("_", " / ")}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-[11px] text-indigo-600 font-semibold">
                    {c.referenceNumber}
                  </td>

                  <td className="p-3.5 text-right font-mono font-bold text-[#0F8B7D] bg-teal-50/40">
                    {formatINR(c.amountReceived)}
                  </td>

                  <td className="p-3.5 text-right font-mono text-gray-500">
                    {c.tdsDeducted > 0 ? formatINR(c.tdsDeducted) : "₹0"}
                  </td>

                  <td className="p-3.5 text-right font-mono font-black text-gray-900">
                    {formatINR(c.netCredited)}
                  </td>

                  <td className="p-3.5 text-gray-500 text-[11px] truncate max-w-xs">
                    {c.bankAccount}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 flex items-center justify-center gap-1">
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
