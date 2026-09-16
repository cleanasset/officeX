"use client";

import React from "react";
import {
  Building2,
  Filter,
  Plus,
  Receipt,
  Download,
  Search,
  RefreshCw,
  Bell,
  Sparkles,
  FileSpreadsheet
} from "lucide-react";

interface RentRollHeaderProps {
  properties: Array<{ id: string; name: string; city: string }>;
  selectedProperty: string;
  onSelectProperty: (id: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddLease: () => void;
  onOpenRecordPayment: () => void;
  onOpenGenerateInvoices: () => void;
  onExportCsv: (type: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export const RentRollHeader: React.FC<RentRollHeaderProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onOpenAddLease,
  onOpenRecordPayment,
  onOpenGenerateInvoices,
  onExportCsv,
  onRefresh,
  isLoading,
  unreadAlertsCount,
  onOpenAlerts,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Badge */}
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-[#0F8B7D] shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-gray-950 tracking-tight">
                  Rent Roll Master &amp; Commercial Financials
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-50 text-[#0F8B7D] border border-teal-200 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F8B7D] animate-pulse"></span>
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Institutional 39-column lease registry, CAM recoveries, automated GST invoicing, escalation triggers &amp; portfolio NOI
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenAlerts}
            className="relative px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Management Alerts"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onExportCsv("rentroll")}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export 39-column CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={onOpenGenerateInvoices}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>Generate Invoices</span>
          </button>

          <button
            onClick={onOpenRecordPayment}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={onOpenAddLease}
            className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lease</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#0F8B7D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="mt-3.5 pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Property Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Property:</span>
            <select
              value={selectedProperty}
              onChange={(e) => onSelectProperty(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] font-medium shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Portfolio Properties (5)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] font-medium shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Leases</option>
              <option value="under_notice">Under Notice</option>
              <option value="expired">Expired</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenant, lease #, space..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 placeholder-gray-400 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};
