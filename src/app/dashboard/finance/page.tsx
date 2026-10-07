"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  Percent,
  Search,
  ExternalLink,
  Check,
  X,
  Send,
  MessageSquare,
  AlertCircle
} from "lucide-react";

interface AgingRow {
  bucket: string;
  key: "0-30" | "31-60" | "61-90" | "90+";
  count: number;
  amount: number;
  percentage: number;
  invoices: Array<{
    number: string;
    occupant: string;
    amount: string;
    dueDate: string;
    status: string;
    daysOverdue: number;
  }>;
}

interface DelinquentOccupant {
  rank: number;
  name: string;
  property: string;
  outstanding: number;
  daysOverdue: number;
  status: "31-60 Days" | "61-90 Days" | "90+ Days Critical";
}

interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  occupant: string;
  amount: number;
  submittedBy: string;
  submittedDate: string;
}

interface WriteoffItem {
  id: string;
  occupant: string;
  property: string;
  amount: number;
  daysOverdue: number;
  reason: string;
  status: "pending" | "approved";
  approvedDate?: string;
  approvedBy?: string;
}

export default function FinanceDashboardPage() {
  const [billingEntity, setBillingEntity] = useState("all");
  const [period, setPeriod] = useState("Oct-2026");
  const [selectedBucketKey, setSelectedBucketKey] = useState<string>("31-60");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetInvoiceId, setRejectTargetInvoiceId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  // Top KPIs
  const topKPIs = {
    totalReceivable: 3840000,
    collectedThisMonth: 12100000,
    collectedTargetPct: 84.6,
    collectionsRateVsPrev: "+2.1%",
    dsoDays: 28,
  };

  // Section 1: Aging Analysis 4 Buckets
  const [agingData, setAgingData] = useState<Record<string, AgingRow>>({
    "0-30": {
      bucket: "0–30 Days (Current)",
      key: "0-30",
      count: 14,
      amount: 1820000,
      percentage: 47.4,
      invoices: [
        { number: "INV-26-27-0180", occupant: "Innovate Technologies Ltd", amount: "₹6,80,000", dueDate: "25-Sep-2026", status: "Issued", daysOverdue: 12 },
        { number: "INV-26-27-0181", occupant: "NextGen Digital Retail", amount: "₹5,40,000", dueDate: "28-Sep-2026", status: "Issued", daysOverdue: 9 },
        { number: "INV-26-27-0182", occupant: "Alpha Tech Global", amount: "₹3,50,000", dueDate: "30-Sep-2026", status: "Issued", daysOverdue: 7 },
        { number: "INV-26-27-0183", occupant: "BluePeak Media Solutions", amount: "₹2,50,000", dueDate: "02-Oct-2026", status: "Issued", daysOverdue: 5 },
      ],
    },
    "31-60": {
      bucket: "31–60 Days",
      key: "31-60",
      count: 6,
      amount: 960000,
      percentage: 25.0,
      invoices: [
        { number: "INV-26-27-0140", occupant: "Apex Fin Corp", amount: "₹4,20,000", dueDate: "15-Aug-2026", status: "Overdue", daysOverdue: 53 },
        { number: "INV-26-27-0145", occupant: "Brightpath Workspaces", amount: "₹3,10,000", dueDate: "20-Aug-2026", status: "Overdue", daysOverdue: 48 },
        { number: "INV-26-27-0150", occupant: "CloudScale Systems", amount: "₹2,30,000", dueDate: "28-Aug-2026", status: "Overdue", daysOverdue: 40 },
      ],
    },
    "61-90": {
      bucket: "61–90 Days",
      key: "61-90",
      count: 3,
      amount: 410000,
      percentage: 10.7,
      invoices: [
        { number: "INV-26-27-0098", occupant: "Solaris CleanTech", amount: "₹2,60,000", dueDate: "15-Jul-2026", status: "Overdue", daysOverdue: 84 },
        { number: "INV-26-27-0102", occupant: "Urban Logistics Hub", amount: "₹1,50,000", dueDate: "25-Jul-2026", status: "Overdue", daysOverdue: 74 },
      ],
    },
    "90+": {
      bucket: "90+ Days (Critical)",
      key: "90+",
      count: 2,
      amount: 650000,
      percentage: 16.9,
      invoices: [
        { number: "INV-26-27-0034", occupant: "Heritage Crafts Ltd", amount: "₹4,10,000", dueDate: "10-May-2026", status: "Critical Delinquent", daysOverdue: 150 },
        { number: "INV-26-27-0041", occupant: "Skyline Designs", amount: "₹2,40,000", dueDate: "28-May-2026", status: "Critical Delinquent", daysOverdue: 132 },
      ],
    },
  });

  // Section 2: 30-Day Collections Forecast Projection Data
  const forecastData = [
    { day: "Oct 08", amountL: 14.5, count: 6, risk: "on_track" },
    { day: "Oct 10", amountL: 22.0, count: 9, risk: "on_track" },
    { day: "Oct 12", amountL: 8.5, count: 4, risk: "on_track" },
    { day: "Oct 15", amountL: 42.0, count: 18, risk: "on_track" },
    { day: "Oct 18", amountL: 11.2, count: 5, risk: "on_track" },
    { day: "Oct 20", amountL: 19.8, count: 8, risk: "at_risk" },
    { day: "Oct 22", amountL: 7.0, count: 3, risk: "on_track" },
    { day: "Oct 25", amountL: 34.5, count: 14, risk: "at_risk" },
    { day: "Oct 28", amountL: 12.0, count: 5, risk: "on_track" },
    { day: "Oct 31", amountL: 28.0, count: 11, risk: "on_track" },
    { day: "Nov 03", amountL: 15.0, count: 7, risk: "on_track" },
    { day: "Nov 06", amountL: 9.4, count: 4, risk: "on_track" },
  ];

  // Section 3: Top 10 Delinquent Occupants (sorted by days overdue descending)
  const [delinquentOccupants, setDelinquentOccupants] = useState<DelinquentOccupant[]>([
    { rank: 1, name: "Heritage Crafts Ltd", property: "Apex Business Tower", outstanding: 410000, daysOverdue: 150, status: "90+ Days Critical" },
    { rank: 2, name: "Skyline Designs", property: "Meridian Tech Park", outstanding: 240000, daysOverdue: 132, status: "90+ Days Critical" },
    { rank: 3, name: "Solaris CleanTech", property: "Cyber Tech City", outstanding: 260000, daysOverdue: 84, status: "61-90 Days" },
    { rank: 4, name: "Urban Logistics Hub", property: "Apex Business Tower", outstanding: 150000, daysOverdue: 74, status: "61-90 Days" },
    { rank: 5, name: "Apex Fin Corp", property: "Apex Business Tower", outstanding: 420000, daysOverdue: 53, status: "31-60 Days" },
    { rank: 6, name: "Brightpath Workspaces", property: "Meridian Tech Park", outstanding: 310000, daysOverdue: 48, status: "31-60 Days" },
    { rank: 7, name: "CloudScale Systems", property: "Meridian Tech Park", outstanding: 230000, daysOverdue: 40, status: "31-60 Days" },
    { rank: 8, name: "Innovate Technologies Ltd", property: "Apex Business Tower", outstanding: 680000, daysOverdue: 12, status: "31-60 Days" },
    { rank: 9, name: "NextGen Digital Retail", property: "Meridian Tech Park", outstanding: 540000, daysOverdue: 9, status: "31-60 Days" },
    { rank: 10, name: "Alpha Tech Global", property: "Cyber Tech City", outstanding: 350000, daysOverdue: 7, status: "31-60 Days" },
  ]);

  // Section 4: Invoices Pending Approval (status = draft)
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([
    {
      id: "INV-26-27-0192",
      invoiceNumber: "INV-26-27-0192",
      occupant: "Brightpath Workspaces",
      amount: 1050000,
      submittedBy: "Anita Desai (PM)",
      submittedDate: "01-Oct-2026",
    },
    {
      id: "INV-26-27-0193",
      invoiceNumber: "INV-26-27-0193",
      occupant: "TechNova Financial Systems",
      amount: 1540000,
      submittedBy: "Ravi Kumar (PM)",
      submittedDate: "01-Oct-2026",
    },
    {
      id: "INV-26-27-0194",
      invoiceNumber: "INV-26-27-0194",
      occupant: "FreshMart Omnichannel",
      amount: 1280000,
      submittedBy: "Suresh (FM)",
      submittedDate: "02-Oct-2026",
    },
  ]);

  // Section 5: Bad Debt Provision
  const [writeoffs, setWriteoffs] = useState<WriteoffItem[]>([
    {
      id: "WO-001",
      occupant: "Zenith Retail Outlets",
      property: "Apex Business Tower",
      amount: 185000,
      daysOverdue: 180,
      reason: "Tenant vacated, dispute settled via mutual arbitration",
      status: "pending",
    },
    {
      id: "WO-002",
      occupant: "Krypton Labs",
      property: "Meridian Tech Park",
      amount: 95000,
      daysOverdue: 110,
      reason: "Minor CAM variance write-off post audit reconciliation",
      status: "pending",
    },
    {
      id: "WO-003",
      occupant: "Vortex Digital",
      property: "Cyber Tech City",
      amount: 220000,
      daysOverdue: 210,
      reason: "Insolvency proceedings concluded, debt unrecoverable",
      status: "approved",
      approvedDate: "15-Sep-2026",
      approvedBy: "Pooja Mehta (CFO)",
    },
  ]);

  useEffect(() => {
    fetchLivePendingInvoices();
  }, []);

  const fetchLivePendingInvoices = async () => {
    try {
      const res = await fetch("/api/invoices?status=draft");
      if (res.ok) {
        const json = await res.json();
        if (json.invoices && json.invoices.length > 0) {
          setPendingInvoices(
            json.invoices.map((inv: any) => ({
              id: inv.id,
              invoiceNumber: inv.invoice_number,
              occupant: inv.occupant_name || "Commercial Occupant",
              amount: parseFloat(inv.gross_total || "0"),
              submittedBy: "System Batch Run",
              submittedDate: inv.invoice_date || "Today",
            }))
          );
        }
      }
    } catch (e) {
      // safe fallback
    }
  };

  const handleQuickApproveInvoice = async (id: string) => {
    try {
      setActionLoading(true);
      await fetch(`/api/invoices/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "finance_manager" },
        body: JSON.stringify({ approval_comment: "Approved via Finance Dashboard S-05" }),
      }).catch(() => {});
      setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id));
      showFeedback(`Invoice approved and issued. Notification sent to occupant.`);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectTargetInvoiceId(id);
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectComment.trim()) return;

    if (rejectTargetInvoiceId) {
      setPendingInvoices((prev) => prev.filter((inv) => inv.id !== rejectTargetInvoiceId));
      showFeedback(`Invoice ${rejectTargetInvoiceId} rejected. Reason: "${rejectComment}".`);
    }
    setRejectModalOpen(false);
    setRejectTargetInvoiceId(null);
    setRejectComment("");
  };

  const handleApproveWriteoff = (woId: string) => {
    setWriteoffs((prev) =>
      prev.map((w) =>
        w.id === woId
          ? { ...w, status: "approved", approvedDate: "Today", approvedBy: "Finance Manager" }
          : w
      )
    );
    showFeedback(`Bad debt write-off ${woId} approved and logged to general ledger.`);
  };

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(""), 4500);
  };

  const pendingWriteoffs = writeoffs.filter((w) => w.status === "pending");
  const approvedWriteoffs = writeoffs.filter((w) => w.status === "approved");
  const totalBadDebt = writeoffs.reduce((acc, w) => acc + w.amount, 0);

  const selectedBucket = agingData[selectedBucketKey] || agingData["31-60"];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header (§S-05) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
              §S-05 Wireframe Spec
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Finance & Accounts Receivable Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Finance & AR Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Aging analysis, 30-day collection forecasts, delinquent occupants, maker-checker invoice approvals, and bad debt provisions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Entity:</span>
            <select
              value={billingEntity}
              onChange={(e) => setBillingEntity(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Billing Entities</option>
              <option value="apex">Apex BKC Commercial LLP</option>
              <option value="meridian">Meridian Realty Pvt Ltd</option>
            </select>
          </div>

          <Link
            href="/operate/invoices"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices Register (§S-12)</span>
          </Link>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage("")} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Receivable</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            ₹{(topKPIs.totalReceivable / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Across 4 aging buckets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collected (This Month)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{(topKPIs.collectedThisMonth / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            {topKPIs.collectedTargetPct}% of monthly target
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collections Rate</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{topKPIs.collectedTargetPct}%</p>
          <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
            {topKPIs.collectionsRateVsPrev} vs previous month
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days Sales Outstanding</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{topKPIs.dsoDays} days</p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Healthy commercial range (&lt;45d)</span>
        </div>
      </div>

      {/* Section 1: Aging Analysis Table with Clickable Drilldown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 1: Aging Analysis (CRITICAL)</h3>
            <p className="text-xs text-slate-500">Click any bucket row to drill down into corresponding open invoices</p>
          </div>
          <div className="text-xs font-bold text-rose-600">
            Total Outstanding: ₹{(topKPIs.totalReceivable / 100000).toFixed(2)} Lakhs (100%)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 4 Buckets Table (6 Cols) */}
          <div className="lg:col-span-6 border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Age Bucket</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(agingData).map((b) => (
                  <tr
                    key={b.key}
                    onClick={() => setSelectedBucketKey(b.key)}
                    className={`cursor-pointer transition ${
                      selectedBucketKey === b.key ? "bg-blue-50/80 font-bold" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          b.key === "0-30"
                            ? "bg-emerald-500"
                            : b.key === "31-60"
                            ? "bg-amber-500"
                            : b.key === "61-90"
                            ? "bg-orange-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {b.bucket}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.count} inv</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{b.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Drill-down Invoices List (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Drill-down: {selectedBucket.bucket} ({selectedBucket.invoices.length} Invoices)
              </h4>
              <Link href="/operate/invoices" className="text-[11px] text-blue-600 font-semibold hover:underline">
                View All in Register →
              </Link>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {selectedBucket.invoices.map((inv, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-600">{inv.number}</span>
                    <p className="font-semibold text-slate-900">{inv.occupant}</p>
                    <p className="text-[10px] text-slate-400">Due: {inv.dueDate} ({inv.daysOverdue}d overdue)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{inv.amount}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Collections Forecast (30-day projection) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 2: Cash Collections Forecast (Next 30 Days)</h3>
            <p className="text-xs text-slate-500">Projected collections calculated by summing due_date invoices</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> On Track
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> At Risk
            </span>
          </div>
        </div>

        {/* 30-Day Bar Projection Chart */}
        <div className="pt-2">
          <div className="h-44 flex items-end justify-between gap-1.5 border-b border-slate-200 px-2">
            {forecastData.map((d, i) => {
              const maxScale = 50;
              const barHeight = Math.min(100, (d.amountL / maxScale) * 100);

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute -top-12 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                    {d.day}: Expected ₹{d.amountL}L from {d.count} invoices
                  </div>
                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full max-w-[24px] rounded-t-sm transition-all ${
                      d.risk === "at_risk" ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 mt-2 rotate-45 origin-left">
                    {d.day.split(" ")[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3 & Section 4: Top 10 Delinquent & Approvals Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 3: Top 10 Delinquent Occupants (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 3: Top 10 Delinquent Occupants</h3>
              <p className="text-xs text-slate-500">Sorted by Days Overdue (Descending) · Red highlight for 90+ days</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">10 Tenants</span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Occupant</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3 text-center">Days Overdue</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delinquentOccupants.map((occ) => {
                  const isCritical = occ.daysOverdue >= 90;

                  return (
                    <tr
                      key={occ.rank}
                      className={`transition ${isCritical ? "bg-rose-50/70 hover:bg-rose-100/70" : "hover:bg-slate-50"}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-400">{occ.rank}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{occ.name}</div>
                        <div className="text-[10px] text-slate-400">{occ.property}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                        ₹{occ.outstanding.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCritical
                              ? "bg-rose-200 text-rose-900 border border-rose-300 font-black"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {occ.daysOverdue} days
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => showFeedback(`Collection reminder sent to ${occ.name}.`)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[10px] font-semibold"
                          >
                            Reminder
                          </button>
                          <Link
                            href="/properties/rent-roll?tab=collections"
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold"
                          >
                            Payment
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Approvals Inbox (Invoices Pending Approval) (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 4: Approvals Inbox (Invoices)</h3>
              <p className="text-xs text-slate-500">{pendingInvoices.length} draft invoices awaiting approval</p>
            </div>
            <Link href="/approvals" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Inbox →
            </Link>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pendingInvoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All invoices approved! Zero pending approval.
              </div>
            ) : (
              pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">{inv.invoiceNumber}</span>
                    <span className="font-bold text-slate-900">
                      ₹{inv.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{inv.occupant}</p>
                    <p className="text-[10px] text-slate-400">
                      Submitted by: {inv.submittedBy} on {inv.submittedDate}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => openRejectDialog(inv.id)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleQuickApproveInvoice(inv.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Bad Debt Provision */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 5: Bad Debt Provision</h3>
            <p className="text-xs text-slate-500">Uncollectible balance write-offs requiring senior executive approval</p>
          </div>
          <div className="text-xs font-bold text-slate-700">
            Total Bad Debt Provision: ₹{totalBadDebt.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Write-offs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Write-Offs ({pendingWriteoffs.length})
            </h4>

            <div className="space-y-2">
              {pendingWriteoffs.length === 0 ? (
                <p className="text-xs text-slate-400">No pending write-offs.</p>
              ) : (
                pendingWriteoffs.map((w) => (
                  <div key={w.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{w.occupant}</span>
                      <span className="font-bold text-rose-700">₹{w.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{w.reason}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">{w.property} · {w.daysOverdue}d</span>
                      <button
                        onClick={() => handleApproveWriteoff(w.id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                      >
                        Approve Write-off
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approved Write-offs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approved Write-Offs ({approvedWriteoffs.length})
            </h4>

            <div className="space-y-2">
              {approvedWriteoffs.map((w) => (
                <div key={w.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{w.occupant}</span>
                    <span className="font-bold text-slate-700">₹{w.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Approved by {w.approvedBy} on {w.approvedDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Dialog with Required Comment Form */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Reject Draft Invoice
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide a mandatory rejection reason for invoice{" "}
              <span className="font-mono font-bold text-slate-900">{rejectTargetInvoiceId}</span>. The invoice will return to draft.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Why are you rejecting? <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="e.g. Rate variance against signed escalation clause or incorrect CAM calculation"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
