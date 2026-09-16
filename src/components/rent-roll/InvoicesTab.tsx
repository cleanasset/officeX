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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case "overdue":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      case "partially_paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Issued
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ──── TOP BILLING KPI SUMMARY CARDS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Invoiced (Gross)</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalBilled)}</div>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{invoices.length} Invoices Issued</p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Collected / Cleared</span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-1">{formatINR(totalCollected)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}% Collection Rate
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-4.5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Total Receivables Due</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{formatINR(totalOutstanding)}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
            {invoices.filter((i) => i.status === "overdue").length} Invoices Overdue
          </p>
        </div>
      </div>

      {/* ──── CONTROLS & FILTER BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "paid", "overdue", "issued", "partially_paid"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0F8B7D] text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {st === "ALL" ? "All Invoices" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoice # or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] shadow-2xs"
            />
          </div>

          <button
            onClick={onOpenGenerateInvoices}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Invoices</span>
          </button>
        </div>
      </div>

      {/* ──── INVOICES DATA TABLE ──── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/95 text-gray-600 font-bold tracking-wider border-b border-gray-200 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Invoice Number</th>
                <th className="p-3.5">Tenant &amp; Property</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right">Base Rent</th>
                <th className="p-3.5 text-right">CAM</th>
                <th className="p-3.5 text-right">GST (18%)</th>
                <th className="p-3.5 text-right font-black text-amber-900 bg-amber-50/40">Gross Total</th>
                <th className="p-3.5 text-right">TDS (10%)</th>
                <th className="p-3.5 text-right font-bold text-gray-900">Net Payable</th>
                <th className="p-3.5 text-right text-teal-700 font-bold">Paid</th>
                <th className="p-3.5 text-right text-rose-600 font-bold">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  {/* Invoice # */}
                  <td className="p-3.5 font-mono font-bold text-indigo-700">
                    <button
                      onClick={() => onOpenTaxInvoice(inv)}
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{inv.invoiceNumber}</span>
                    </button>
                    <span className="text-[10px] text-gray-400 font-normal block">{inv.leaseCode}</span>
                  </td>

                  {/* Tenant & Property */}
                  <td className="p-3.5">
                    <div className="font-bold text-gray-900">{inv.tenantName}</div>
                    <div className="text-[11px] text-gray-500">{inv.propertyName}</div>
                  </td>

                  {/* Due Date */}
                  <td className="p-3.5 font-mono text-gray-700">
                    <div className="font-semibold">{inv.dueDate}</div>
                    <div className="text-[10px] text-gray-400">Issued: {inv.invoiceDate}</div>
                  </td>

                  {/* Base Rent */}
                  <td className="p-3.5 text-right font-mono text-gray-700">
                    {formatINR(inv.baseRent)}
                  </td>

                  {/* CAM */}
                  <td className="p-3.5 text-right font-mono text-gray-700">
                    {formatINR(inv.camCharges)}
                  </td>

                  {/* GST */}
                  <td className="p-3.5 text-right font-mono text-gray-500">
                    {formatINR(inv.gstAmount)}
                  </td>

                  {/* Gross Total */}
                  <td className="p-3.5 text-right font-mono font-black text-amber-900 bg-amber-50/40">
                    {formatINR(inv.grossTotal)}
                  </td>

                  {/* TDS */}
                  <td className="p-3.5 text-right font-mono text-gray-500">
                    -{formatINR(inv.tdsDeducted)}
                  </td>

                  {/* Net Payable */}
                  <td className="p-3.5 text-right font-mono font-black text-gray-900">
                    {formatINR(inv.netPayable)}
                  </td>

                  {/* Amount Paid */}
                  <td className="p-3.5 text-right font-mono text-teal-700 font-bold">
                    {inv.amountPaid > 0 ? formatINR(inv.amountPaid) : "₹0"}
                  </td>

                  {/* Balance Due */}
                  <td className="p-3.5 text-right font-mono">
                    {inv.balanceDue > 0 ? (
                      <span className="text-rose-600 font-black">{formatINR(inv.balanceDue)}</span>
                    ) : (
                      <span className="text-teal-700 font-bold">₹0</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3.5 text-center">
                    {getStatusBadge(inv.status)}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenTaxInvoice(inv)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Tax Invoice Drawer"
                      >
                        <Eye className="w-3 h-3 text-[#0F8B7D]" />
                        <span>View</span>
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => onOpenRecordPayment(inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
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
