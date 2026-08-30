"use client";
import React, { useState } from "react";
import { Plus, Filter, Eye } from "lucide-react";
import Link from "next/link";

export default function RFQDirectory() {
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [dateFilter, setDateFilter] = useState("Date Range: Any");

  const tabs = [
    { id: "all", label: "All RFQs", count: 12 },
    { id: "drafts", label: "Drafts", count: 2 },
    { id: "open", label: "Open for Bids", count: 4 },
    { id: "evaluation", label: "In Evaluation", count: 3 },
    { id: "awarded", label: "Awarded", count: 3 }
  ];

  const rfqs = [
    { id: "RFQ-089", title: "DG Maintenance", property: "Apex Tower", category: "MEP", posted: "20-Aug", deadline: "26-Aug", quotes: "5 received", status: "Open" },
    { id: "RFQ-085", title: "Deep Cleaning", property: "Meridian Park", category: "Housekeeping", posted: "18-Aug", deadline: "24-Aug", quotes: "8 received", status: "Evaluating" },
    { id: "RFQ-081", title: "24/7 Guard Service", property: "Nexus Hub", category: "Security", posted: "12-Aug", deadline: "18-Aug", quotes: "4 received", status: "Awarded" },
    { id: "RFQ-078", title: "Annual Pest Control", property: "Crystal Tower", category: "Pest Control", posted: "10-Aug", deadline: "16-Aug", quotes: "6 received", status: "Closed" },
    { id: "RFQ-075", title: "Elevator AMC", property: "Apex Tower", category: "MEP", posted: "05-Aug", deadline: "15-Aug", quotes: "3 received", status: "Awarded" },
    { id: "RFQ-072", title: "Facade Cleaning", property: "Meridian Park", category: "Housekeeping", posted: "01-Aug", deadline: "10-Aug", quotes: "7 received", status: "Evaluating" },
    { id: "RFQ-069", title: "Chiller Repair", property: "Nexus Hub", category: "HVAC", posted: "25-Jul", deadline: "05-Aug", quotes: "2 received", status: "Closed" },
    { id: "RFQ-065", title: "CCTV Upgrade", property: "Crystal Tower", category: "Security", posted: "20-Jul", deadline: "30-Jul", quotes: "5 received", status: "Awarded" }
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

  const filteredRfqs = rfqs.filter((rfq) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return rfq.status === "Open";
    if (activeTab === "evaluation") return rfq.status === "Evaluating";
    if (activeTab === "awarded") return rfq.status === "Awarded";
    if (activeTab === "drafts") return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">RFQ Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your Request for Quotations across properties.</p>
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
              <th className="py-3 pr-3">Posted Date</th>
              <th className="py-3 pr-3">Deadline</th>
              <th className="py-3 pr-3">Quotes</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRfqs.map((rfq) => (
              <tr key={rfq.id} className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
                <td className="py-4 pr-3 font-bold text-gray-500">{rfq.id}</td>
                <td className="py-4 pr-3 font-bold text-gray-900">{rfq.title}</td>
                <td className="py-4 pr-3 text-gray-600">{rfq.property}</td>
                <td className="py-4 pr-3 text-gray-600">{rfq.category}</td>
                <td className="py-4 pr-3 text-gray-600">{rfq.posted}</td>
                <td className="py-4 pr-3 text-gray-600">{rfq.deadline}</td>
                <td className="py-4 pr-3 text-gray-600">{rfq.quotes}</td>
                <td className="py-4 pr-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(rfq.status)}`}>
                    {rfq.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-xs font-bold text-[#0F8B7D] hover:underline cursor-pointer flex items-center gap-1">
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
