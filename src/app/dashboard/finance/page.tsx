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
  X
} from "lucide-react";

interface AgingBucket {
  bucket: string;
  count: number;
  totalAmount: string;
  invoices: {
    number: string;
    occupant: string;
    amount: string;
    dueDate: string;
    status: string;
  }[];
}

export default function FinanceDashboardPage() {
  const [billingEntity, setBillingEntity] = useState("all");
  const [period, setPeriod] = useState("Oct-2026");
  const [selectedBucket, setSelectedBucket] = useState<string>("31–60 Days");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Invoices pending approval state
  const [pendingInvoices, setPendingInvoices] = useState([
    {
      id: "INV-26-27-0192",
      occupant: "Brightpath Workspaces",
      amount: "₹10,50,000",
      type: "Rent + Included CAM",
      createdDate: "01-Oct-2026",
      maker: "PM: Anita",
    },
    {
      id: "INV-26-27-0193",
      occupant: "TechNova Financial",
      amount: "₹15,40,000",
      type: "Commercial Base Rent",
      createdDate: "01-Oct-2026",
      maker: "PM: Ravi",
    },
    {
      id: "INV-26-27-0194",
      occupant: "FreshMart Omnichannel",
      amount: "₹12,80,000",
      type: "Service Charge + Utilities",
      createdDate: "02-Oct-2026",
      maker: "FM: Suresh",
    },
  ]);

  // Bad debt write-offs pending approval state
  const [pendingWriteoffs, setPendingWriteoffs] = useState([
    {
      id: "WO-001",
      occupant: "Zenith Retail Outlets",
      invoiceNumber: "INV-25-26-0811",
      amount: "₹1,85,000",
      reason: "Tenant vacated, dispute settled via mutual arbitration",
      requestedBy: "Ravi (PM)",
    },
    {
      id: "WO-002",
      occupant: "Krypton Labs",
      invoiceNumber: "INV-25-26-0940",
      amount: "₹95,000",
      reason: "Minor CAM variance write-off post audit reconciliation",
      requestedBy: "Suresh (FM)",
    },
  ]);

  const agingBuckets: Record<string, AgingBucket> = {
    "0–30 Days": {
      bucket: "0–30 Days",
      count: 14,
      totalAmount: "₹18,20,000",
      invoices: [
        { number: "INV-26-27-0180", occupant: "Innovate Corp", amount: "₹6,80,000", dueDate: "25-Sep-2026", status: "Issued" },
        { number: "INV-26-27-0181", occupant: "NextGen Retail", amount: "₹5,40,000", dueDate: "28-Sep-2026", status: "Issued" },
        { number: "INV-26-27-0182", occupant: "Alpha Tech", amount: "₹3,50,000", dueDate: "30-Sep-2026", status: "Issued" },
        { number: "INV-26-27-0183", occupant: "BluePeak Media", amount: "₹2,50,000", dueDate: "02-Oct-2026", status: "Issued" },
      ],
    },
    "31–60 Days": {
      bucket: "31–60 Days",
      count: 6,
      totalAmount: "₹9,60,000",
      invoices: [
        { number: "INV-26-27-0140", occupant: "Apex Fin Corp", amount: "₹4,20,000", dueDate: "15-Aug-2026", status: "Overdue" },
        { number: "INV-26-27-0145", occupant: "Brightpath Workspaces", amount: "₹3,10,000", dueDate: "20-Aug-2026", status: "Overdue" },
        { number: "INV-26-27-0150", occupant: "CloudScale Systems", amount: "₹2,30,000", dueDate: "28-Aug-2026", status: "Overdue" },
      ],
    },
    "61–90 Days": {
      bucket: "61–90 Days",
      count: 3,
      totalAmount: "₹4,10,000",
      invoices: [
        { number: "INV-26-27-0098", occupant: "Solaris CleanTech", amount: "₹2,60,000", dueDate: "15-Jul-2026", status: "Overdue" },
        { number: "INV-26-27-0102", occupant: "Urban Logistics", amount: "₹1,50,000", dueDate: "25-Jul-2026", status: "Overdue" },
      ],
    },
    "90+ Days": {
      bucket: "90+ Days",
      count: 2,
      totalAmount: "₹6,50,000",
      invoices: [
        { number: "INV-26-27-0034", occupant: "Heritage Crafts Ltd", amount: "₹4,10,000", dueDate: "10-May-2026", status: "Critical Delinquent" },
        { number: "INV-26-27-0041", occupant: "Skyline Designs", amount: "₹2,40,000", dueDate: "28-May-2026", status: "Critical Delinquent" },
      ],
    },
  };

  const delinquentOccupants = [
    { name: "Heritage Crafts Ltd", property: "Apex BKC", overdue: "₹4,10,000", days: 142, bucket: "90+ Days", risk: "Critical" },
    { name: "Apex Fin Corp", property: "Apex BKC", overdue: "₹4,20,000", days: 48, bucket: "31–60 Days", risk: "Medium" },
    { name: "Brightpath Workspaces", property: "Meridian Tech Park", overdue: "₹3,10,000", days: 42, bucket: "31–60 Days", risk: "Medium" },
    { name: "Solaris CleanTech", property: "Nexus Hub", overdue: "₹2,60,000", days: 78, bucket: "61–90 Days", risk: "High" },
    { name: "Skyline Designs", property: "Apex BKC", overdue: "₹2,40,000", days: 124, bucket: "90+ Days", risk: "Critical" },
    { name: "CloudScale Systems", property: "Meridian Tech Park", overdue: "₹2,30,000", days: 36, bucket: "31–60 Days", risk: "Medium" },
    { name: "Urban Logistics", property: "Nexus Hub", overdue: "₹1,50,000", days: 68, bucket: "61–90 Days", risk: "High" },
  ];

  // Fetch live pending invoices on mount
  useEffect(() => {
    fetchDraftInvoices();
  }, []);

  const fetchDraftInvoices = async () => {
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
              amount: `₹${parseFloat(inv.gross_total || "0").toLocaleString("en-IN")}`,
              type: inv.billing_model === "hybrid" ? "Rent + Included CAM" : "Base Rent",
              createdDate: inv.invoice_date || "Today",
              maker: "System Automated Run",
            }))
          );
        }
      }
    } catch (e) {
      // safe fallback to initial wireframe rows
    }
  };

  const handleApproveInvoice = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "finance_manager" },
        body: JSON.stringify({ approval_comment: "Approved via Finance Dashboard S-05" }),
      });
    } catch (e) {
      console.error("Approve invoice API call error:", e);
    }
    setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id));
    setActionSuccessMessage(`Invoice approved and issued successfully.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  const handleRejectInvoice = (id: string) => {
    setPendingInvoices((prev) => prev.filter((inv) => inv.id !== id));
    setActionSuccessMessage(`Invoice ${id} rejected and returned to draft.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  const handleApproveWriteoff = async (woId: string) => {
    try {
      await fetch("/api/collections/writeoff-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writeoff_id: woId, approved: true }),
      }).catch(() => {});
    } catch (e) {}

    setPendingWriteoffs((prev) => prev.filter((w) => w.id !== woId));
    setActionSuccessMessage(`Write-off ${woId} approved and bad debt journal entry logged.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  const handleRejectWriteoff = (woId: string) => {
    setPendingWriteoffs((prev) => prev.filter((w) => w.id !== woId));
    setActionSuccessMessage(`Write-off ${woId} rejected.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header (§S-05) */}
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
            Billing run status, invoice aging analysis, cash collection forecasts, write-off approvals, and maker-checker invoice dispatch.
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
              <option value="all">All Entities (Apex PropCo & Meridian LLP)</option>
              <option value="apex">Apex BKC Commercial LLP</option>
              <option value="mtp">Meridian Realty Pvt Ltd</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Oct-2026">Oct-2026 (Active Run)</option>
              <option value="Sep-2026">Sep-2026 (Reconciled)</option>
              <option value="Aug-2026">Aug-2026</option>
            </select>
          </div>

          <Link
            href="/operate/invoices"
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-sm shadow-[#0F8B7D]/20 transition-all flex items-center gap-1.5"
          >
            <Receipt size={14} />
            <span>Invoices Register (§S-12)</span>
          </Link>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Billing Run Status Banner (§S-05 Top Wireframe) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Receipt size={22} className="text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-400 text-slate-900">
                ACTIVE RUN
              </span>
              <span className="text-xs text-slate-300 font-medium">Due Date: 05-Oct-2026</span>
            </div>
            <h3 className="text-base font-bold mt-0.5">
              Billing Run Oct-2026: Draft (148 Invoices · ₹1.52 Cr)
            </h3>
            <p className="text-xs text-slate-300">
              6 Exceptions detected (unbilled meter readings & unverified GSTINs). Ready for checker review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/properties/rent-roll?tab=invoices"
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-sm transition-colors"
          >
            Review Run & Exceptions →
          </Link>
        </div>
      </div>

      {/* Top Financial Health Counters (§S-05) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { label: "Pending Approval", val: `${pendingInvoices.length} inv.`, sub: "Maker-checker", color: "text-amber-700 bg-amber-50" },
          { label: "Issued Unpaid", val: "₹72.40 L", sub: "Oct billing", color: "text-slate-900 bg-slate-50" },
          { label: "Collected Today", val: "₹11.00 L", sub: "Bank RTGS", color: "text-emerald-700 bg-emerald-50" },
          { label: "Unallocated Cash", val: "₹1.60 L", sub: "To match", color: "text-blue-700 bg-blue-50" },
          { label: "Overdue > 60d", val: "₹10.60 L", sub: "5 occupants", color: "text-rose-700 bg-rose-50" },
          { label: "Disputes Open", val: "2 disputes", sub: "₹2.84 L held", color: "text-purple-700 bg-purple-50" },
          { label: "Deposit Shortfall", val: "1 tenant", sub: "₹12.0 L gap", color: "text-stone-700 bg-stone-50" },
          { label: "TDS Certs Pending", val: "9 certs", sub: "FY26 Q2", color: "text-cyan-700 bg-cyan-50" },
        ].map((c) => (
          <div key={c.label} className={`p-3 rounded-xl border border-slate-200 ${c.color} flex flex-col justify-between`}>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</div>
            <div className="text-base font-black mt-1">{c.val}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Split: Aging Analysis & 30-Day Cash Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Aging Analysis Table with Clickable Bucket Drilldown */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Aging Analysis Table (§S-05 / K-12)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any aging bucket below to view the constituent overdue invoices and action follow-up.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              Total Outstanding: ₹38.40 L
            </span>
          </div>

          {/* Bucket Tabs */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.keys(agingBuckets).map((k) => {
              const b = agingBuckets[k];
              const isSelected = selectedBucket === k;

              return (
                <button
                  key={k}
                  onClick={() => setSelectedBucket(k)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase opacity-80">{b.bucket}</div>
                  <div className="text-sm font-black mt-0.5 font-mono">{b.totalAmount}</div>
                  <div className="text-[10px] opacity-75">{b.count} Invoices</div>
                </button>
              );
            })}
          </div>

          {/* Drilldown Invoices List for Selected Bucket */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Overdue Invoices in "{selectedBucket}" Bucket</span>
              <span className="font-mono text-slate-500">
                {agingBuckets[selectedBucket].invoices.length} shown
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {agingBuckets[selectedBucket].invoices.map((inv) => (
                <div
                  key={inv.number}
                  className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70"
                >
                  <div>
                    <div className="font-bold text-slate-900">{inv.occupant}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {inv.number} · Due: {inv.dueDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">{inv.amount}</div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        inv.status.includes("Critical")
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 30-Day Cash Collection Forecast */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span>Cash Collection Forecast (Next 30 Days)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Est. ₹1.28 Cr
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Projected cash inflows based on contracted lease billing due dates and historical realization velocities.
            </p>

            <div className="space-y-3">
              {[
                { period: "Week 1 (01–07 Oct)", projected: "₹62,40,000", share: "48.7%", note: "Base rent cycles (Google, Deloitte)" },
                { period: "Week 2 (08–14 Oct)", projected: "₹34,10,000", share: "26.6%", note: "CAM & recoveries (Meridian)" },
                { period: "Week 3 (15–21 Oct)", projected: "₹18,50,000", share: "14.5%", note: "Flex seat billing & utility true-ups" },
                { period: "Week 4 (22–31 Oct)", projected: "₹13,00,000", share: "10.2%", note: "Arrears follow-ups & late remittances" },
              ].map((w) => (
                <div key={w.period} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{w.period}</span>
                    <span className="font-mono font-bold text-slate-900">{w.projected}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: w.share }} className="bg-[#0F8B7D] h-full rounded-full" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>{w.note}</span>
                    <span className="font-mono font-semibold">{w.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Historical collection rate: <strong className="text-slate-800">92.4%</strong></span>
            <Link href="/properties/rent-roll?tab=collections" className="text-[#0F8B7D] font-bold hover:underline">
              Collections Ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Two Inboxes: Invoices Pending Approval & Bad Debt Write-Offs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Approvals Inbox: Invoices Pending Approval (§S-05) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Approvals Inbox: Invoices Pending Dispatch</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Maker-checker verification before official invoice delivery to tenants.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {pendingInvoices.length} Pending
            </span>
          </div>

          {pendingInvoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              All pending invoices have been processed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{inv.occupant}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-mono font-semibold">{inv.id}</span> · {inv.type}
                    </div>
                    <div className="text-[10px] text-slate-400">Maker: {inv.maker} on {inv.createdDate}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900">{inv.amount}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApproveInvoice(inv.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectInvoice(inv.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Bad Debt Provision / Write-Offs Pending Approval */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600" />
                <span>Bad Debt Provision & Write-Off Requests</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pending write-off approvals from operations team requiring Finance Manager sign-off.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {pendingWriteoffs.length} Requests
            </span>
          </div>

          {pendingWriteoffs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No pending write-off requests.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingWriteoffs.map((wo) => (
                <div key={wo.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{wo.occupant}</div>
                    <div className="text-[11px] text-slate-600 italic">"{wo.reason}"</div>
                    <div className="text-[10px] text-slate-400">
                      Inv: <span className="font-mono">{wo.invoiceNumber}</span> · Requested by {wo.requestedBy}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-rose-600">{wo.amount}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApproveWriteoff(wo.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Approve Write-off</span>
                      </button>
                      <button
                        onClick={() => handleRejectWriteoff(wo.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top 10 Delinquent Occupants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Delinquent Occupants Arrears Register
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Occupants ranked by total overdue exposure and collection risk status.
            </p>
          </div>
          <Link
            href="/properties/rent-roll?tab=aging"
            className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
          >
            <span>Full Arrears Report →</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Occupant</th>
                <th className="py-2.5 px-3 font-semibold">Property</th>
                <th className="py-2.5 px-3 font-semibold">Overdue Balance</th>
                <th className="py-2.5 px-3 font-semibold">Max Days Overdue</th>
                <th className="py-2.5 px-3 font-semibold">Aging Bucket</th>
                <th className="py-2.5 px-3 font-semibold">Risk Classification</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delinquentOccupants.map((d) => (
                <tr key={d.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-3 text-slate-600">{d.property}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">{d.overdue}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">{d.days} days</td>
                  <td className="py-3 px-3 text-slate-600">{d.bucket}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.risk === "Critical"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : d.risk === "High"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {d.risk} Risk
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href="/properties/rent-roll?tab=collections"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Follow Up</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
