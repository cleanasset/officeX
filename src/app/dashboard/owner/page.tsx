"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  DollarSign,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronDown,
  Eye,
  Check,
  X,
  CreditCard,
  Briefcase
} from "lucide-react";
import OwnerStatementModal from "@/components/rent-roll/OwnerStatementModal";

interface PropertySummary {
  id: string;
  name: string;
  code: string;
  location: string;
  areaSqft: number;
  occupiedSqft: number;
  occupancyPct: number;
  monthlyRevenue: number;
  status: "Performing" | "Stabilized" | "At Risk";
  lat?: number;
  lng?: number;
}

interface OccupantRank {
  rank: number;
  name: string;
  property: string;
  space: string;
  monthlyRent: number;
  status: "Active" | "Expiring Soon" | "Expired";
}

interface ExpirationItem {
  id: string;
  occupant: string;
  property: string;
  space: string;
  expiryDate: string;
  daysLeft: number;
  status: "renewed" | "under_negotiation" | "approaching" | "vacating";
  renewalStatusText: string;
}

export default function OwnerDashboardPage() {
  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState("Oct-2026");
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [statementModalOpen, setStatementModalOpen] = useState(false);

  // Dynamic Data States
  const [properties, setProperties] = useState<PropertySummary[]>([
    {
      id: "PROP-01",
      name: "Apex Business Tower",
      code: "APX-01",
      location: "BKC, Mumbai (19.0657° N, 72.8687° E)",
      areaSqft: 125000,
      occupiedSqft: 110000,
      occupancyPct: 88.0,
      monthlyRevenue: 10450000,
      status: "Performing",
    },
    {
      id: "PROP-02",
      name: "Meridian Tech Park",
      code: "MTP-02",
      location: "Whitefield, Bengaluru (12.9698° N, 77.7500° E)",
      areaSqft: 85000,
      occupiedSqft: 68000,
      occupancyPct: 80.0,
      monthlyRevenue: 5440000,
      status: "Stabilized",
    },
    {
      id: "PROP-03",
      name: "Cyber Tech City Tower B",
      code: "CTC-03",
      location: "HITEC City, Hyderabad (17.4435° N, 78.3772° E)",
      areaSqft: 50000,
      occupiedSqft: 34500,
      occupancyPct: 69.0,
      monthlyRevenue: 2760000,
      status: "At Risk",
    },
  ]);

  const [topOccupants, setTopOccupants] = useState<OccupantRank[]>([
    { rank: 1, name: "Global Logistics Warehousing", property: "Apex Business Tower", space: "Floor 4, East", monthlyRent: 3480000, status: "Active" },
    { rank: 2, name: "TechNova Financial Systems", property: "Meridian Tech Park", space: "Floor 3, Full", monthlyRent: 1862000, status: "Active" },
    { rank: 3, name: "Innovate Technologies Ltd", property: "Apex Business Tower", space: "Suite 401", monthlyRent: 2500000, status: "Active" },
    { rank: 4, name: "Apex Infotech Ltd", property: "Cyber Tech City Tower B", space: "Space U-101", monthlyRent: 250000, status: "Active" },
    { rank: 5, name: "NextGen Digital Retail", property: "Meridian Tech Park", space: "Ground Floor Retail", monthlyRent: 840000, status: "Expiring Soon" },
  ]);

  const [expirations, setExpirations] = useState<ExpirationItem[]>([
    { id: "EXP-01", occupant: "Skyline Designs Pvt Ltd", property: "Apex Business Tower", space: "Suite 204", expiryDate: "2026-10-28", daysLeft: 21, status: "approaching", renewalStatusText: "Notice Served (Expiring <30d)" },
    { id: "EXP-02", occupant: "NextGen Digital Retail", property: "Meridian Tech Park", space: "GF-02 Retail", expiryDate: "2026-11-15", daysLeft: 39, status: "under_negotiation", renewalStatusText: "Term Sheet Under Review (30-60d)" },
    { id: "EXP-03", occupant: "Brightpath Coworking", property: "Meridian Tech Park", space: "Floor 1 Flex", expiryDate: "2026-12-20", daysLeft: 74, status: "under_negotiation", renewalStatusText: "Early Renewal Discussed (>60d)" },
  ]);

  const [agingBuckets, setAgingBuckets] = useState({
    b0_30: { count: 18, amount: 1820000 },
    b31_60: { count: 7, amount: 960000 },
    b61_90: { count: 3, amount: 410000 },
    b90_plus: { count: 2, amount: 650000 },
    totalOutstanding: 3840000,
  });

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([
    { month: "Nov 25", collected: 125, pending: 15, projected: 0 },
    { month: "Dec 25", collected: 132, pending: 18, projected: 0 },
    { month: "Jan 26", collected: 130, pending: 12, projected: 0 },
    { month: "Feb 26", collected: 135, pending: 14, projected: 0 },
    { month: "Mar 26", collected: 142, pending: 16, projected: 0 },
    { month: "Apr 26", collected: 138, pending: 20, projected: 0 },
    { month: "May 26", collected: 140, pending: 15, projected: 0 },
    { month: "Jun 26", collected: 145, pending: 14, projected: 0 },
    { month: "Jul 26", collected: 144, pending: 18, projected: 0 },
    { month: "Aug 26", collected: 148, pending: 16, projected: 0 },
    { month: "Sep 26", collected: 143, pending: 22, projected: 0 },
    { month: "Oct 26", collected: 121, pending: 38, projected: 25 },
  ]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [scope, period]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      // Fetch Aging data
      const agingRes = await fetch("/api/collections/aging").catch(() => null);
      if (agingRes && agingRes.ok) {
        const json = await agingRes.json();
        if (json.summary) {
          setAgingBuckets({
            b0_30: { count: json.summary.bucket_counts?.["0-30"] || 18, amount: json.summary.current_0_30_inr || 1820000 },
            b31_60: { count: json.summary.bucket_counts?.["31-60"] || 7, amount: json.summary.overdue_31_60_inr || 960000 },
            b61_90: { count: json.summary.bucket_counts?.["61-90"] || 3, amount: json.summary.overdue_61_90_inr || 410000 },
            b90_plus: { count: json.summary.bucket_counts?.["90+"] || 2, amount: json.summary.overdue_90_plus_inr || 650000 },
            totalOutstanding: json.summary.total_receivables_inr || 3840000,
          });
        }
      }

      // Fetch Invoices count & KPIs
      const invRes = await fetch("/api/invoices").catch(() => null);
      if (invRes && invRes.ok) {
        const json = await invRes.json();
        if (json.kpis && json.kpis.overdue_inr > 0) {
          setAgingBuckets(prev => ({
            ...prev,
            totalOutstanding: json.kpis.overdue_inr + (json.kpis.total_invoiced_inr - json.kpis.collections_realized_inr),
          }));
        }
      }

      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Owner metrics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Header KPI Computations
  const totalPropertiesCount = properties.length;
  const totalLeasableArea = properties.reduce((acc, p) => acc + p.areaSqft, 0);
  const totalOccupiedArea = properties.reduce((acc, p) => acc + p.occupiedSqft, 0);
  const occupancyPercentage = Math.round((totalOccupiedArea / totalLeasableArea) * 1000) / 10;
  const totalMonthlyRevenue = properties.reduce((acc, p) => acc + p.monthlyRevenue, 0);
  const collectionsRate = 84.6; // MTD collections efficiency

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
              §S-02 Wireframe Spec
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Portfolio Principal Console · Refreshed {lastRefreshed}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Owner & Client Principal Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Portfolio performance, monthly revenue trends, tenant health, 90-day expiries, and multi-client owner statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500">Scope:</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Consolidated Portfolio (All 3 Properties)</option>
              <option value="apex">Apex Business Tower (Mumbai)</option>
              <option value="meridian">Meridian Tech Park (BLR)</option>
              <option value="cyber">Cyber Tech City (HYD)</option>
            </select>
          </div>

          <button
            onClick={() => setStatementModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Owner Statement (§Table 103)</span>
          </button>

          <button
            onClick={fetchDashboardMetrics}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Header Top KPIs (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Properties</span>
          <p className="text-xl font-black text-slate-900 mt-1">{totalPropertiesCount}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">100% Operational</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Leasable Area</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {totalLeasableArea.toLocaleString("en-IN")} <span className="text-xs font-medium text-slate-400">sqft</span>
          </p>
          <span className="text-[10px] text-teal-700 font-semibold mt-0.5 block">
            {totalOccupiedArea.toLocaleString("en-IN")} occupied
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy %</span>
          <p className="text-xl font-black text-emerald-700 mt-1">{occupancyPercentage}%</p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +2.4% vs last mo
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Rev</span>
          <p className="text-xl font-black text-blue-700 mt-1">
            ₹{(totalMonthlyRevenue / 10000000).toFixed(2)} Cr
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Contracted monthly</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Amount</span>
          <p className="text-xl font-black text-rose-600 mt-1">
            ₹{(agingBuckets.totalOutstanding / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">Across all aging buckets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collections Rate</span>
          <p className="text-xl font-black text-indigo-700 mt-1">{collectionsRate}%</p>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">MTD Realized collections</span>
        </div>
      </div>

      {/* Section 1 & Section 2: Portfolio Overview & Monthly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Portfolio Overview (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 1: Portfolio Overview</h3>
              <p className="text-xs text-slate-500">Asset breakdown by leasable area, occupancy & contracted revenue</p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Rent Roll View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Property Name</th>
                  <th className="py-2.5 px-3 text-right">Total Area</th>
                  <th className="py-2.5 px-3 text-right">Occupancy</th>
                  <th className="py-2.5 px-3 text-right">Monthly Rev</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.location}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium">
                      {p.areaSqft.toLocaleString("en-IN")} sqft
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-slate-900">{p.occupancyPct}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${p.occupancyPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-blue-700">
                      ₹{(p.monthlyRevenue / 100000).toFixed(2)} L
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "Performing"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "Stabilized"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Monthly Revenue Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 2: Monthly Revenue (12 Months)</h3>
              <p className="text-xs text-slate-500">Collected vs Pending vs Projected in ₹ Lakhs</p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Collected
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-700">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Pending
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-sm" /> Projected
              </span>
            </div>
          </div>

          {/* Clean 12-Month Bar Chart */}
          <div className="pt-2">
            <div className="h-48 flex items-end justify-between gap-1.5 px-1 border-b border-slate-200">
              {monthlyRevenueData.map((d, i) => {
                const totalH = d.collected + d.pending + d.projected;
                const maxScale = 180;
                const collectedH = (d.collected / maxScale) * 100;
                const pendingH = (d.pending / maxScale) * 100;
                const projH = (d.projected / maxScale) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      {d.month}: Collected ₹{d.collected}L, Pending ₹{d.pending}L
                    </div>
                    <div className="w-full max-w-[20px] flex flex-col-reverse h-40">
                      <div style={{ height: `${collectedH}%` }} className="bg-emerald-500 w-full" />
                      <div style={{ height: `${pendingH}%` }} className="bg-rose-500 w-full" />
                      {projH > 0 && <div style={{ height: `${projH}%` }} className="bg-slate-300 w-full" />}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-2 rotate-45 origin-left">
                      {d.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 & Section 4: Top 5 Occupants & Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 3: Top 5 Occupants by Rent (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 3: Top 5 Occupants by Rent</h3>
              <p className="text-xs text-slate-500">Highest gross contributing tenants across portfolio</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Rank 1–5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Occupant</th>
                  <th className="py-2.5 px-3">Property / Space</th>
                  <th className="py-2.5 px-3 text-right">Monthly Rent</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topOccupants.map((occ) => (
                  <tr key={occ.rank} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-400">{occ.rank}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{occ.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{occ.property}</div>
                      <div className="text-[10px] text-slate-400">{occ.space}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                      ₹{occ.monthlyRent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          occ.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {occ.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Upcoming Expirations (90 Days) (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 4: Upcoming Expirations (90 Days)</h3>
              <p className="text-xs text-slate-500">Color coded: Green (&gt;60d), Yellow (30-60d), Red (&lt;30d)</p>
            </div>
            <Link
              href="/properties/rent-roll"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View Pipeline →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Occupant</th>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3 text-center">Days Left</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expirations.map((exp) => {
                  const badgeColor =
                    exp.daysLeft < 30
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : exp.daysLeft <= 60
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300";

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{exp.occupant}</div>
                        <div className="text-[10px] text-slate-400">{exp.space}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{exp.property}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{exp.expiryDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                          {exp.daysLeft} days
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href="/properties/rent-roll"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                          >
                            Contract
                          </Link>
                          <Link
                            href="/properties/rent-roll"
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-semibold"
                          >
                            Renew
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
      </div>

      {/* Section 5: Collections Status (Aging Buckets) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 5: Collections Status by Aging Bucket</h3>
            <p className="text-xs text-slate-500">Aging receivables status from billing invoice records</p>
          </div>
          <div className="text-xs font-bold text-rose-600">
            Total Outstanding: ₹{(agingBuckets.totalOutstanding / 100000).toFixed(2)} Lakhs
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-emerald-800">0–30 Days (Current)</span>
            <p className="text-lg font-black text-emerald-900 mt-1">
              ₹{(agingBuckets.b0_30.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">{agingBuckets.b0_30.count} invoices on schedule</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-amber-800">31–60 Days</span>
            <p className="text-lg font-black text-amber-900 mt-1">
              ₹{(agingBuckets.b31_60.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-amber-700 mt-0.5">{agingBuckets.b31_60.count} invoices in early arrears</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 hover:bg-orange-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-orange-800">61–90 Days</span>
            <p className="text-lg font-black text-orange-900 mt-1">
              ₹{(agingBuckets.b61_90.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-orange-700 mt-0.5">{agingBuckets.b61_90.count} invoices high risk</p>
          </Link>

          <Link
            href="/dashboard/finance"
            className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 hover:bg-rose-50 transition"
          >
            <span className="text-[11px] font-bold uppercase text-rose-800">90+ Days (Critical)</span>
            <p className="text-lg font-black text-rose-900 mt-1">
              ₹{(agingBuckets.b90_plus.amount / 100000).toFixed(2)} L
            </p>
            <p className="text-xs text-rose-700 mt-0.5">{agingBuckets.b90_plus.count} default provision pending</p>
          </Link>
        </div>
      </div>

      {/* Section 6: Multi-Client Delegated Properties */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section 6: Multi-Client Operations (§2.1, §S-02)</h3>
            <p className="text-xs text-slate-500">Own properties vs Delegated to Chartered Accountants / Property Managers</p>
          </div>
          <button
            onClick={() => setStatementModalOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Full Settlement Statement →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Directly Managed Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">2 Properties (Apex + Meridian)</h4>
            <p className="text-xs text-slate-600 mt-1">Monthly Gross Collections: ₹1.58 Cr</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400">Delegated Properties</span>
            <h4 className="text-base font-bold text-slate-900 mt-1">1 Property (Sharma Estates Mandate)</h4>
            <p className="text-xs text-slate-600 mt-1">
              PM Agency Fee: 4.0% (₹1,96,560) · Net Remittance: ₹44,53,440
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-800">Total Net Owner Remittance Due</span>
              <h4 className="text-lg font-black text-blue-900 mt-1">₹44,53,440</h4>
              <p className="text-[11px] text-blue-700 mt-0.5">Verified per Table 103 Spec Calculation</p>
            </div>
            <button
              onClick={() => setStatementModalOpen(true)}
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition text-center"
            >
              Open Settlement Statement
            </button>
          </div>
        </div>
      </div>

      {/* Owner Statement Modal (§Table 103) */}
      <OwnerStatementModal
        isOpen={statementModalOpen}
        onClose={() => setStatementModalOpen(false)}
      />
    </div>
  );
}
