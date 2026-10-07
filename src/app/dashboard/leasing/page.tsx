"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  RefreshCw,
  Tag,
  ChevronRight,
  ExternalLink,
  ChevronDown
} from "lucide-react";

interface DealCard {
  id: string;
  name: string;
  tenantName: string;
  property: string;
  areaSqft: number;
  estMonthlyRent: string;
  probability: number;
  stage: "enquiry" | "site_visit" | "proposal" | "loi" | "agreement" | "won";
}

export default function LeasingDashboardPage() {
  const [scope, setScope] = useState("all");
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);

  // Kanban Deals State
  const [deals, setDeals] = useState<DealCard[]>([
    {
      id: "DEAL-012",
      name: "FinTech Hub Expansion",
      tenantName: "Apex FinTech Global",
      property: "Apex Business Tower",
      areaSqft: 12500,
      estMonthlyRent: "₹36,25,000",
      probability: 25,
      stage: "enquiry",
    },
    {
      id: "DEAL-014",
      name: "BioPharma Labs Campus",
      tenantName: "BioPharma Healthcare",
      property: "Meridian Tech Park",
      areaSqft: 18000,
      estMonthlyRent: "₹18,00,000",
      probability: 45,
      stage: "site_visit",
    },
    {
      id: "DEAL-015",
      name: "LogiTrans North Wing",
      tenantName: "LogiTrans India Ltd",
      property: "Nexus Corporate Hub",
      areaSqft: 9800,
      estMonthlyRent: "₹24,50,000",
      probability: 60,
      stage: "proposal",
    },
    {
      id: "DEAL-016",
      name: "Edutech Virtual Campus",
      tenantName: "Orbit Edutech Pvt Ltd",
      property: "Meridian Tech Park",
      areaSqft: 14200,
      estMonthlyRent: "₹14,20,000",
      probability: 80,
      stage: "loi",
    },
    {
      id: "DEAL-017",
      name: "Retail Flagship Experience",
      tenantName: "HyperRetail Stores",
      property: "Apex Business Tower",
      areaSqft: 8500,
      estMonthlyRent: "₹24,65,000",
      probability: 90,
      stage: "agreement",
    },
    {
      id: "DEAL-010",
      name: "SaaS Headquarters Floor 8",
      tenantName: "CloudScale Software",
      property: "Apex Business Tower",
      areaSqft: 16000,
      estMonthlyRent: "₹46,40,000",
      probability: 100,
      stage: "won",
    },
  ]);

  const stages: { key: DealCard["stage"]; label: string; badge: string }[] = [
    { key: "enquiry", label: "Lead / Enquiry", badge: "bg-slate-100 text-slate-700" },
    { key: "site_visit", label: "Site Visit", badge: "bg-blue-100 text-blue-700" },
    { key: "proposal", label: "Proposal / Qual.", badge: "bg-purple-100 text-purple-700" },
    { key: "loi", label: "LOI Drafted", badge: "bg-amber-100 text-amber-700" },
    { key: "agreement", label: "Agreement / Neg.", badge: "bg-orange-100 text-orange-700" },
    { key: "won", label: "Won (Closed)", badge: "bg-emerald-100 text-emerald-700" },
  ];

  const moveDealStage = (dealId: string, direction: "next" | "prev") => {
    const stageOrder: DealCard["stage"][] = [
      "enquiry",
      "site_visit",
      "proposal",
      "loi",
      "agreement",
      "won",
    ];

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        const currentIndex = stageOrder.indexOf(d.stage);
        const nextIndex =
          direction === "next"
            ? Math.min(stageOrder.length - 1, currentIndex + 1)
            : Math.max(0, currentIndex - 1);
        return { ...d, stage: stageOrder[nextIndex] };
      })
    );
  };

  // Expiry Pipeline (§S-24 / §S-04)
  const expiryBuckets = [
    { label: "0–30 Days", count: 0, rent: "₹0", color: "bg-emerald-50 text-emerald-800" },
    { label: "31–90 Days", count: 1, rent: "₹10.50 L", color: "bg-amber-50 text-amber-800", tenant: "Brightpath Workspaces" },
    { label: "91–180 Days", count: 1, rent: "₹14.20 L", color: "bg-blue-50 text-blue-800", tenant: "Orbit Edutech" },
    { label: "181–365 Days", count: 2, rent: "₹34.80 L", color: "bg-purple-50 text-purple-800", tenant: "Apex Fin & NextGen" },
    { label: "365+ Days", count: 6, rent: "₹1.12 Cr", color: "bg-slate-50 text-slate-800", tenant: "Innovate, Google, Deloitte" },
  ];

  // Vacant and reserved space list (§S-04 Wireframe)
  const vacantSpaces = [
    {
      code: "APX-09",
      property: "Apex Business Tower",
      area: "10,200 sq ft",
      askingRate: "₹290 / sq ft",
      vacantSince: "01-Apr-2026",
      daysVacant: 181,
      deal: "DEAL-012 (Enquiry)",
      hasArrears: false,
    },
    {
      code: "MTP-T2-02",
      property: "Meridian Tower 2",
      area: "18,500 sq ft",
      askingRate: "₹100 / sq ft",
      vacantSince: "01-Jan-2026",
      daysVacant: 271,
      deal: "DEAL-014 (Site Visit)",
      hasArrears: false,
      isHighDays: true,
    },
    {
      code: "NXH-03B",
      property: "Nexus Corporate Hub",
      area: "6,400 sq ft",
      askingRate: "₹140 / sq ft",
      vacantSince: "01-Aug-2026",
      daysVacant: 59,
      deal: "None",
      hasArrears: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header (§S-04) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
              §S-04 Wireframe Spec
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Commercial Deal Pipeline & Vacancy Optimization
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Leasing Manager Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Pipeline Kanban board, vacancy inventory, 12-month lease expiry forecast, and occupant retention risk.
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
              <option value="all">All Properties</option>
              <option value="apex">Apex Business Tower</option>
              <option value="meridian">Meridian Tech Park</option>
              <option value="nexus">Nexus Corporate Hub</option>
            </select>
          </div>

          <Link
            href="/properties/rent-roll"
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>Vacancy List (§S-10)</span>
          </Link>

          <button
            onClick={() => setNewDealModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-sm shadow-[#0F8B7D]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ New Deal (§4.7A)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip (§S-04 Top Wireframe) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Vacant / Reserved Area
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            55,700 sq ft
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            26.6% portfolio vacancy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Vacant Coworking Seats
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            38 Seats
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Meridian Floor 4 Flex
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Expiring in 12 Months
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            2 / ₹43.50 L pm
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Revenue at risk (K-09)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Deals in Open Pipeline
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            6 / ₹1.18 Cr pm
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Weighted: ₹68.4 L (D-22)
          </div>
        </div>
      </div>

      {/* Expiry Pipeline Horizontal Tracker (§S-24 / §S-04 Wireframe) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" />
              <span>Expiry Pipeline & Upcoming Contract Rollovers (§S-24)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Contracts approaching expiry grouped by lead time windows for renewal outreach.
            </p>
          </div>
          <Link
            href="/properties/rent-roll?tab=escalations"
            className="text-xs font-bold text-[#0F8B7D] hover:underline"
          >
            Renewal Register →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {expiryBuckets.map((b) => (
            <div
              key={b.label}
              className={`p-3.5 rounded-xl border border-slate-200 ${b.color} flex flex-col justify-between`}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {b.label}
                </div>
                <div className="text-xl font-black mt-1">
                  {b.count} Contract{b.count !== 1 ? "s" : ""}
                </div>
                <div className="text-xs font-mono font-bold mt-0.5">
                  {b.rent}
                </div>
              </div>
              {b.tenant && (
                <div className="text-[10px] opacity-75 mt-2 truncate">
                  Key: {b.tenant}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Kanban Board (§S-04 Core Wireframe) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#0F8B7D]" />
              <span>Deals Pipeline Kanban Board (§4.7A Deal-to-Contract)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Move deals across stages from initial Enquiry to Won lease agreement without manual re-keying.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {deals.length} Active Deals
          </span>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.key);

            return (
              <div
                key={stage.key}
                className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col min-w-[200px]"
              >
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    {stage.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-slate-700 border">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900 leading-snug">
                        {deal.tenantName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {deal.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{deal.property}</div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">
                          {deal.estMonthlyRent}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {deal.areaSqft.toLocaleString()} sq ft
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-teal-700">
                          {deal.probability}% prob.
                        </span>
                        <div className="flex items-center gap-1">
                          {stage.key !== "enquiry" && (
                            <button
                              onClick={() => moveDealStage(deal.id, "prev")}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              title="Move back"
                            >
                              ←
                            </button>
                          )}
                          {stage.key !== "won" && (
                            <button
                              onClick={() => moveDealStage(deal.id, "next")}
                              className="px-1.5 py-0.5 rounded bg-[#0F8B7D] hover:bg-[#0c7367] text-white font-bold"
                              title="Advance stage"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-slate-400 italic">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vacant & Reserved Spaces Inventory (§S-04 Bottom Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Vacant & Reserved Commercial Space Inventory
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Days vacant and prospective deals linked. Note: Arrears indicator shows Yes/No flag only per §S-04 security rules.
            </p>
          </div>
          <span className="text-xs text-slate-500">3 Available Plates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Space Code</th>
                <th className="py-2.5 px-3 font-semibold">Building & Property</th>
                <th className="py-2.5 px-3 font-semibold">Chargeable Area</th>
                <th className="py-2.5 px-3 font-semibold">Asking Rate (Target)</th>
                <th className="py-2.5 px-3 font-semibold">Vacant Since</th>
                <th className="py-2.5 px-3 font-semibold">Days Vacant</th>
                <th className="py-2.5 px-3 font-semibold">Active Deal Linked</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vacantSpaces.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {s.code}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{s.property}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{s.area}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#0F8B7D]">
                    {s.askingRate}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{s.vacantSince}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono font-bold ${
                        s.isHighDays ? "text-rose-600 font-black" : "text-slate-700"
                      }`}
                    >
                      {s.daysVacant} days
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {s.deal}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setNewDealModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      + Create Deal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Deal Modal (§4.7A) */}
      {newDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900">
              Create New Leasing Pipeline Deal (§4.7A)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter prospective occupant terms. Converts to contract upon LOI execution.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNewDealModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prospect / Tenant Name</label>
                <input
                  required
                  placeholder="e.g. Acme FinTech Global"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Area (sq ft)</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Monthly Rent (₹)</label>
                  <input
                    required
                    placeholder="2500000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setNewDealModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white font-bold"
                >
                  Save Deal Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
