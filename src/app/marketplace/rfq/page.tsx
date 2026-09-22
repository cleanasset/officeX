"use client";
import React, { useState, useEffect } from "react";
import { Plus, Filter, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

interface RFQEntry {
  id: string;
  title: string;
  property: string;
  category: string;
  posted?: string;
  deadline?: string;
  quotes: string;
  status: "Open" | "Evaluating" | "Awarded" | "Closed" | "Draft";
  vendorScore?: string;
  slaRate?: string;
}

export default function RFQDirectory() {
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [dateFilter, setDateFilter] = useState("Date Range: Any");
  const [rfqList, setRfqList] = useState<RFQEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRfqs() {
      try {
        const res = await fetch("/api/rfqs");
        const data = await res.json();
        if (data.success && Array.isArray(data.rfqs) && data.rfqs.length > 0) {
          const formatted: RFQEntry[] = data.rfqs.map((r: any) => ({
            id: r.id,
            title: r.title,
            property: r.property || "Commercial Campus",
            category: r.category || "MEP",
            posted: r.createdAt || "Sep 2026",
            deadline: r.deadline || "30-Oct-2026",
            quotes: `${r.quotesCount || 0} received`,
            status: r.status === "open" ? "Open" : r.status === "evaluating" ? "Evaluating" : r.status === "awarded" ? "Awarded" : "Closed",
            vendorScore: r.match ? r.match.replace("% Match", "") : "95",
            slaRate: "98.5%"
          }));
          setRfqList(formatted);
        } else {
          setRfqList([
            { id: "RFQ-2026-8842", title: "DG Set Annual Maintenance Contract", property: "Apex Business Tower", category: "HVAC", posted: "18-Sep", deadline: "15-Oct", quotes: "3 received", status: "Open", vendorScore: "98", slaRate: "99.0%" },
            { id: "RFQ-2026-8843", title: "Facade Glass Cleaning Service — Quarterly", property: "Global Tech Park", category: "Cleaning", posted: "19-Sep", deadline: "18-Oct", quotes: "2 received", status: "Evaluating", vendorScore: "96", slaRate: "98.5%" },
            { id: "RFQ-2026-8844", title: "UPS Battery Replacement & Load Testing", property: "Cyber City", category: "Electrical", posted: "20-Sep", deadline: "22-Oct", quotes: "4 received", status: "Awarded", vendorScore: "92", slaRate: "99.4%" },
            { id: "RFQ-2026-8845", title: "Access Control & Turnstile Upgrade", property: "Pioneer Plaza", category: "Security", posted: "20-Sep", deadline: "28-Oct", quotes: "1 received", status: "Open", vendorScore: "88", slaRate: "97.8%" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load RFQs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRfqs();
  }, []);

  const tabs = [
    { id: "all", label: "All RFQs", count: rfqList.length },
    { id: "drafts", label: "Drafts", count: rfqList.filter(r => r.status === "Draft").length },
    { id: "open", label: "Open for Bids", count: rfqList.filter(r => r.status === "Open").length },
    { id: "evaluation", label: "In Evaluation", count: rfqList.filter(r => r.status === "Evaluating").length },
    { id: "awarded", label: "Awarded", count: rfqList.filter(r => r.status === "Awarded").length }
  ];

  const statusStyle = (s: string) => {
    switch (s) {
      case "Open": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Evaluating": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Awarded": return "bg-teal-50 text-teal-700 border border-teal-200";
      case "Closed": return "bg-gray-100 text-gray-600 border border-gray-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const filteredRfqs = rfqList.filter((rfq) => {
    if (categoryFilter !== "All Categories" && !rfq.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    if (propertyFilter !== "All Properties" && !rfq.property.toLowerCase().includes(propertyFilter.toLowerCase())) return false;
    if (activeTab === "all") return true;
    if (activeTab === "open") return rfq.status === "Open";
    if (activeTab === "evaluation") return rfq.status === "Evaluating";
    if (activeTab === "awarded") return rfq.status === "Awarded";
    if (activeTab === "drafts") return rfq.status === "Draft";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">RFQ Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your Request for Quotations across properties.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/marketplace/payments"
            className="px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-[#0F8B7D] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <span>Commission &amp; Escrow Ledger</span>
          </Link>
          <Link
            href="/marketplace/create-rfq"
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus size={14} /> Create New RFQ
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex gap-6 border-b border-gray-200 pb-4 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "text-[#0F8B7D] border-[#0F8B7D]"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center mb-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
          >
            <option>All Categories</option>
            <option>MEP</option>
            <option>HVAC</option>
            <option>Security</option>
            <option>Housekeeping</option>
            <option>Fire Safety</option>
            <option>Pest Control</option>
          </select>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
          >
            <option>All Properties</option>
            <option>Apex Tower</option>
            <option>Meridian Park</option>
            <option>Nexus Hub</option>
            <option>Crystal Tower</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white cursor-pointer focus:outline-none focus:border-[#0F8B7D]"
          >
            <option>Date Range: Any</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="text-xs font-semibold text-[#0F8B7D] hover:underline ml-auto flex items-center gap-1 cursor-pointer">
            <Filter size={14} /> Clear Filters
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-3">RFQ ID</th>
              <th className="py-3 pr-3">Title</th>
              <th className="py-3 pr-3">Property</th>
              <th className="py-3 pr-3">Category</th>
              <th className="py-3 pr-3">Quotes</th>
              <th className="py-3 pr-3">Vendor Performance</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#0F8B7D]" />
                    <span className="font-semibold">Loading verified RFQs from marketplace registry...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRfqs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-gray-500">
                  <p className="font-bold text-gray-700">No Request for Quotations found matching selected criteria.</p>
                  <Link href="/marketplace/create-rfq" className="mt-2 inline-block text-xs font-bold text-[#0F8B7D] hover:underline">
                    + Create your first RFQ
                  </Link>
                </td>
              </tr>
            ) : (
              filteredRfqs.map((rfq) => (
                <tr key={rfq.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                  <td className="py-4 pr-3 font-bold text-gray-500">{rfq.id}</td>
                  <td className="py-4 pr-3 font-bold text-gray-900">{rfq.title}</td>
                  <td className="py-4 pr-3 text-gray-600">{rfq.property}</td>
                  <td className="py-4 pr-3 text-gray-600">{rfq.category}</td>
                  <td className="py-4 pr-3 text-gray-600">{rfq.quotes}</td>
                  <td className="py-4 pr-3">
                    {rfq.vendorScore ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] font-bold text-[10px]">
                        <span>⭐ {rfq.vendorScore}</span>
                        <span className="text-gray-300">|</span>
                        <span>{rfq.slaRate} SLA</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px] italic">Bidding in progress</span>
                    )}
                  </td>
                  <td className="py-4 pr-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/marketplace/compare?id=${rfq.id}`}
                      className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye size={13} /> View Quotes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
