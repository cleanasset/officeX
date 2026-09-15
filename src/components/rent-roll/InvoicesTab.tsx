"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Download,
  Eye,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  leaseId: string;
  leaseCode: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  invoiceDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  baseRent: number;
  camCharges: number;
  utilityCharges: number;
  otherCharges: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  grossTotal: number;
  tdsDeducted: number;
  netPayable: number;
  amountPaid: number;
  balanceDue: number;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  paidDate?: string;
  paymentMode?: string;
  referenceNumber?: string;
}

interface InvoicesTabProps {
  invoices: InvoiceItem[];
  onOpenTaxInvoice: (invoice: InvoiceItem) => void;
  onOpenRecordPayment: (invoice: InvoiceItem) => void;
  onOpenGenerateInvoices: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoices,
  onOpenTaxInvoice,
  onOpenRecordPayment,
  onOpenGenerateInvoices,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "ALL" && inv.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (
      search &&
      !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !inv.tenantName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.propertyName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalBilled = invoices.reduce((sum, i) => sum + i.grossTotal, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case "overdue":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      case "partially_paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Issued
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ──── TOP BILLING KPI SUMMARY CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced (Gross)</span>
          <div className="text-2xl font-bold text-white mt-1">{formatINR(totalBilled)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{invoices.length} Invoices Issued</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Collected / Cleared</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatINR(totalCollected)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}% Collection Rate
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Total Receivables Due</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{formatINR(totalOutstanding)}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {invoices.filter((i) => i.status === "overdue").length} Invoices Overdue
          </p>
        </div>
      </div>

      {/* ──── CONTROLS & FILTER BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {["ALL", "paid", "overdue", "issued", "partially_paid"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Invoices" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search invoice # or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onOpenGenerateInvoices}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Invoices</span>
          </button>
        </div>
      </div>

      {/* ──── INVOICES DATA TABLE ──── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 font-semibold tracking-wider border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Tenant & Property</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Base Rent</th>
                <th className="p-3 text-right">CAM</th>
                <th className="p-3 text-right">GST (18%)</th>
                <th className="p-3 text-right font-bold text-amber-300">Gross Total</th>
                <th className="p-3 text-right">TDS (10%)</th>
                <th className="p-3 text-right font-bold text-white">Net Payable</th>
                <th className="p-3 text-right text-emerald-400">Paid</th>
                <th className="p-3 text-right text-red-400">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  {/* Invoice # */}
                  <td className="p-3 font-mono font-bold text-amber-400">
                    <button
                      onClick={() => onOpenTaxInvoice(inv)}
                      className="hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{inv.invoiceNumber}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 block">{inv.leaseCode}</span>
                  </td>

                  {/* Tenant & Property */}
                  <td className="p-3">
                    <div className="font-bold text-white">{inv.tenantName}</div>
                    <div className="text-[11px] text-slate-400">{inv.propertyName}</div>
                  </td>

                  {/* Due Date */}
                  <td className="p-3 font-mono text-slate-300">
                    <div>{inv.dueDate}</div>
                    <div className="text-[10px] text-slate-500">Issued: {inv.invoiceDate}</div>
                  </td>

                  {/* Base Rent */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(inv.baseRent)}
                  </td>

                  {/* CAM */}
                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatINR(inv.camCharges)}
                  </td>

                  {/* GST */}
                  <td className="p-3 text-right font-mono text-slate-400">
                    {formatINR(inv.gstAmount)}
                  </td>

                  {/* Gross Total */}
                  <td className="p-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10">
                    {formatINR(inv.grossTotal)}
                  </td>

                  {/* TDS */}
                  <td className="p-3 text-right font-mono text-slate-400">
                    -{formatINR(inv.tdsDeducted)}
                  </td>

                  {/* Net Payable */}
                  <td className="p-3 text-right font-mono font-bold text-white">
                    {formatINR(inv.netPayable)}
                  </td>

                  {/* Amount Paid */}
                  <td className="p-3 text-right font-mono text-emerald-400">
                    {inv.amountPaid > 0 ? formatINR(inv.amountPaid) : "₹0"}
                  </td>

                  {/* Balance Due */}
                  <td className="p-3 text-right font-mono">
                    {inv.balanceDue > 0 ? (
                      <span className="text-red-400 font-bold">{formatINR(inv.balanceDue)}</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">₹0</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    {getStatusBadge(inv.status)}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenTaxInvoice(inv)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                        title="View Tax Invoice Drawer"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>View</span>
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => onOpenRecordPayment(inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                          title="Record Payment Receipt"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Settle</span>
                        </button>
                      )}
                    </div>
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
