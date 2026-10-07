"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Calendar,
  Layers,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  Printer,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Check,
  TrendingDown
} from "lucide-react";
import InvoiceDetailModal from "@/components/rent-roll/InvoiceDetailModal";

interface InvoiceItem {
  id: string;
  invoice_number: string;
  fy_year: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  base_rent: string;
  cam_charges: string;
  subtotal: string;
  gst_rate: string;
  gst_amount: string;
  gross_total: string;
  amount_paid: string;
  balance_due: string;
  status: string;
  occupant_name: string;
  occupant_code: string;
  property_name: string;
  building_name: string;
  space_name: string;
  contract_code: string;
  billing_model: string;
}

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [kpis, setKpis] = useState({
    total_invoiced_inr: 0,
    pending_approval_count: 0,
    pending_approval_inr: 0,
    overdue_count: 0,
    overdue_inr: 0,
    collections_realized_inr: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("2026-10");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  // Detail Modal State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [activeTab, monthFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (monthFilter) params.set("month", monthFilter);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setInvoices(json.invoices || []);
        if (json.kpis) setKpis(json.kpis);
      }
    } catch (e) {
      console.error("Error loading invoices:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleGenerateBatch = async () => {
    try {
      setBatchLoading(true);
      setBatchMessage(null);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing_month: monthFilter }),
      });
      const json = await res.json();
      if (res.ok) {
        setBatchMessage(
          `Batch complete: ${json.invoices_created} invoices generated (${json.invoices_skipped} skipped)`
        );
        await fetchInvoices();
      } else {
        setBatchMessage(`Error: ${json.error || "Batch generation failed"}`);
      }
    } catch (e: any) {
      setBatchMessage(`Error: ${e.message}`);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleQuickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/invoices/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_comment: "Approved via S-12 list action" }),
      });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (e) {
      console.error("Quick approve failed:", e);
    }
  };

  const openInvoiceDetail = (id: string) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Draft (Pending)</span>;
      case "issued":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">Issued</span>;
      case "partially_paid":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">Partially Paid</span>;
      case "paid":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Paid</span>;
      case "overdue":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">Overdue</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Breadcrumb & Title */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/properties/rent-roll" className="hover:text-blue-600 transition">Rent Roll</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium">Invoicing & Billing (§S-12)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Invoicing & Billing Register
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Generate, approve, and track commercial rent & flex workspace invoices with GST compliance.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleGenerateBatch}
                disabled={batchLoading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
              >
                {batchLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Run Invoicing Batch
              </button>

              <button
                onClick={fetchInvoices}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {batchMessage && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 text-sm">
            <p>{batchMessage}</p>
            <button onClick={() => setBatchMessage(null)} className="text-blue-500 hover:text-blue-800 text-xs font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top 4 KPI Cards (§S-12) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Invoiced</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                ₹{kpis.total_invoiced_inr.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Active billing run</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Approval</p>
              <h3 className="text-xl font-bold text-amber-600 mt-1">
                {kpis.pending_approval_count} <span className="text-xs text-slate-400 font-normal">invoices</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ₹{kpis.pending_approval_inr.toLocaleString("en-IN")} awaiting sign-off
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue Invoices</p>
              <h3 className="text-xl font-bold text-rose-600 mt-1">
                {kpis.overdue_count} <span className="text-xs text-slate-400 font-normal">invoices</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ₹{kpis.overdue_inr.toLocaleString("en-IN")} in arrears
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collections Realized</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">
                ₹{kpis.collections_realized_inr.toLocaleString("en-IN")}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Collected via bank transfer & UPI</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Invoices" },
                { id: "draft", label: "Draft (Pending)" },
                { id: "issued", label: "Issued" },
                { id: "partially_paid", label: "Partially Paid" },
                { id: "paid", label: "Paid" },
                { id: "overdue", label: "Overdue" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Month & Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search invoice or occupant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
            </div>
          </div>
        </div>

        {/* Invoice Data Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Occupant</th>
                  <th className="py-3 px-4">Property / Space</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">GST (18%)</th>
                  <th className="py-3 px-4 text-right font-bold">Total (₹)</th>
                  <th className="py-3 px-4 text-right">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No invoices found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => openInvoiceDetail(inv.id)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.invoice_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {inv.occupant_name || "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.occupant_code}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{inv.property_name || "Commercial Center"}</div>
                        <div className="text-[10px] text-slate-400">{inv.space_name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{parseFloat(inv.subtotal || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{parseFloat(inv.gst_amount || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{parseFloat(inv.gross_total || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {inv.due_date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {statusBadge(inv.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {inv.status === "draft" && (
                            <button
                              onClick={(e) => handleQuickApprove(inv.id, e)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                              title="Approve Draft Invoice"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => openInvoiceDetail(inv.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Screen S-13 Invoice Detail Modal */}
      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onInvoiceUpdated={fetchInvoices}
      />
    </div>
  );
}
