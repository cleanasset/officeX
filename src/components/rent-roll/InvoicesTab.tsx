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
  ArrowUpRight,
  FileSpreadsheet
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
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled" | "disputed";
  paidDate?: string;
  paymentMode?: string;
  referenceNumber?: string;
  invoiceType?: "rent" | "cam" | "consolidated";
  disputeReason?: string;
  cancellationReason?: string;
  currency?: string;
  reportingAmountInr?: number;
}

interface InvoicesTabProps {
  invoices: InvoiceItem[];
  onOpenTaxInvoice: (invoice: InvoiceItem) => void;
  onOpenRecordPayment: (invoice: InvoiceItem) => void;
  onOpenGenerateInvoices: () => void;
  onOpenAdjustmentNote?: (invoice: InvoiceItem) => void;
  onRefresh?: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoices,
  onOpenTaxInvoice,
  onOpenRecordPayment,
  onOpenGenerateInvoices,
  onOpenAdjustmentNote,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const handleDispute = async (invoiceId: string) => {
    const reason = prompt("Enter reason for disputing this invoice (RR-COL-02 / UAT-32):");
    if (!reason) return;
    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispute", invoiceId, disputeReason: reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Invoice flagged as disputed. Follow-up task generated.");
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "Failed to dispute invoice.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    const reason = prompt("Enter reason for voiding/cancelling this invoice:");
    if (!reason) return;
    try {
      const res = await fetch("/api/rent-roll/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", invoiceId, cancelReason: reason })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Invoice cancelled and voided.");
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "Failed to cancel invoice.");
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      case "disputed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Disputed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-300 flex items-center gap-1 line-through">
            Void
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatINR(totalBilled)}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{invoices.length} Invoices Issued</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Collected</span>
          <div className="text-xl sm:text-2xl font-black text-teal-700 mt-1">{formatINR(totalCollected)}</div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}% Collection Rate
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Receivables Due</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{formatINR(totalOutstanding)}</div>
          <p className="text-[10px] text-rose-500 font-medium mt-0.5">
            {invoices.filter((i) => i.status === "overdue").length} Overdue
          </p>
        </div>
      </div>

      {/* ──── CONTROLS & FILTER BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white p-2.5 sm:px-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {["ALL", "paid", "overdue", "issued", "partially_paid", "disputed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#0F8B7D] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st === "ALL" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0F8B7D]"
            />
          </div>

          <a
            href="/api/rent-roll/export/tally"
            download
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            title="Download Tally Prime XML Sales Vouchers"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Tally XML</span>
          </a>

          <button
            onClick={onOpenGenerateInvoices}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* ──── INVOICES DATA TABLE ──── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-extrabold tracking-wider border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Tenant &amp; Property</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Base Rent</th>
                <th className="p-3 text-right">CAM</th>
                <th className="p-3 text-right">GST</th>
                <th className="p-3 text-right font-black text-amber-900 bg-amber-50/40">Gross</th>
                <th className="p-3 text-right">TDS</th>
                <th className="p-3 text-right font-bold text-slate-900">Net Payable</th>
                <th className="p-3 text-right text-teal-700 font-bold">Paid</th>
                <th className="p-3 text-right text-rose-600 font-bold">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-gray-500">
                    <Receipt className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No invoices generated yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Invoices will automatically generate when you have active leases, or click &quot;Generate Invoices Run&quot; above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  {/* Invoice # & Type */}
                  <td className="p-3 font-mono font-bold text-indigo-700">
                    <button
                      onClick={() => onOpenTaxInvoice(inv)}
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{inv.invoiceNumber}</span>
                    </button>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-normal">{inv.leaseCode}</span>
                      {inv.invoiceType === "rent" && (
                        <span className="text-[9px] font-bold bg-teal-50 text-teal-700 px-1 py-0.2 rounded border border-teal-200">
                          Rent
                        </span>
                      )}
                      {inv.invoiceType === "cam" && (
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200">
                          CAM
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tenant & Property */}
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-xs">{inv.tenantName}</div>
                    <div className="text-[10px] text-slate-400">{inv.propertyName}</div>
                  </td>

                  {/* Due Date */}
                  <td className="p-3 font-mono text-slate-700">
                    <div className="font-medium text-xs">{inv.dueDate}</div>
                  </td>

                  {/* Base Rent */}
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatINR(inv.baseRent)}
                  </td>

                  {/* CAM */}
                  <td className="p-3 text-right font-mono text-slate-700">
                    {formatINR(inv.camCharges)}
                  </td>

                  {/* GST */}
                  <td className="p-3 text-right font-mono text-slate-500">
                    {formatINR(inv.gstAmount)}
                  </td>

                  {/* Gross Total */}
                  <td className="p-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30">
                    {formatINR(inv.grossTotal)}
                  </td>

                  {/* TDS */}
                  <td className="p-3 text-right font-mono text-slate-500">
                    -{formatINR(inv.tdsDeducted)}
                  </td>

                  {/* Net Payable */}
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(inv.netPayable)}
                  </td>

                  {/* Amount Paid */}
                  <td className="p-3 text-right font-mono text-teal-700 font-bold">
                    {inv.amountPaid > 0 ? formatINR(inv.amountPaid) : "₹0"}
                  </td>

                  {/* Balance Due */}
                  <td className="p-3 text-right font-mono">
                    {inv.balanceDue > 0 ? (
                      <span className="text-rose-600 font-bold">{formatINR(inv.balanceDue)}</span>
                    ) : (
                      <span className="text-teal-700 font-medium">₹0</span>
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
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Tax Invoice Drawer"
                      >
                        <Eye className="w-3 h-3 text-[#0F8B7D]" />
                        <span>View</span>
                      </button>

                      {onOpenAdjustmentNote && (
                        <button
                          onClick={() => onOpenAdjustmentNote(inv)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Issue Credit Note / Debit Note (RR-BIL-08)"
                        >
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>Adj Note</span>
                        </button>
                      )}

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

                      {inv.balanceDue > 0 && inv.status !== "disputed" && inv.status !== "cancelled" && (
                        <button
                          onClick={() => handleDispute(inv.id)}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Dispute invoice terms (RR-COL-02 / UAT-32)"
                        >
                          <AlertTriangle className="w-3 h-3 text-purple-600" />
                          <span>Dispute</span>
                        </button>
                      )}

                      {inv.amountPaid === 0 && inv.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelInvoice(inv.id)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Void / Cancel Invoice"
                        >
                          <span>Void</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
