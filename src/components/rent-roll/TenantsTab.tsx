"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Building,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { formatINR } from "./DashboardTab";

export interface TenantSummary {
  id: string;
  tenantCode: string;
  tradeName: string;
  legalName: string;
  industry: string;
  pan: string;
  gstin: string;
  tan?: string;
  cin?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  status: "active" | "inactive" | "prospect" | "blacklisted";
  activeLeasesCount: number;
  leasedProperties: string[];
  totalArea: number;
  totalMonthlyRent: number;
  totalMonthlyBilling: number;
  outstanding: number;
  hasOverdue: boolean;
}

interface TenantsTabProps {
  tenants: TenantSummary[];
  onOpenAddTenant: () => void;
  onSelectTenant: (tenant: TenantSummary) => void;
}

export const TenantsTab: React.FC<TenantsTabProps> = ({
  tenants,
  onOpenAddTenant,
  onSelectTenant,
}) => {
  const [search, setSearch] = useState<string>("");

  const filteredTenants = tenants.filter((t) => {
    if (
      search &&
      !t.tradeName.toLowerCase().includes(search.toLowerCase()) &&
      !t.legalName.toLowerCase().includes(search.toLowerCase()) &&
      !t.tenantCode.toLowerCase().includes(search.toLowerCase()) &&
      !t.gstin.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ──── TOP BAR ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenant name, GSTIN, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#0F8B7D] shadow-2xs"
          />
        </div>

        <button
          onClick={onOpenAddTenant}
          className="px-4 py-2 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tenant Entity</span>
        </button>
      </div>

      {/* ──── TENANT CARDS GRID ──── */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-500 shadow-xs">
          <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No tenant entities found</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Click &quot;Add New Tenant Entity&quot; above to register corporate tenants, or add a lease agreement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTenant(t)}
              className="bg-white border border-gray-200 hover:border-[#0F8B7D]/50 p-5 rounded-2xl shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-sm"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-black text-gray-950 group-hover:text-[#0F8B7D] transition-colors">
                      {t.tradeName}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium">{t.legalName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {t.tenantCode}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium">
                  {t.industry}
                </span>
              </div>

              {/* Financial & Lease Summary */}
              <div className="bg-gray-50/70 p-3 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Leases:</span>
                  <span className="font-bold text-gray-900">{t.activeLeasesCount} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Demised Area:</span>
                  <span className="font-bold text-gray-900">{t.totalArea.toLocaleString()} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Contractual Rent:</span>
                  <span className="font-black text-[#0F8B7D]">{formatINR(t.totalMonthlyRent)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-500 font-bold">Outstanding AR:</span>
                  <span className={`font-mono font-bold ${t.outstanding > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {t.outstanding > 0 ? formatINR(t.outstanding) : "Nil (Current)"}
                  </span>
                </div>
              </div>

              {/* Statutory & Contact Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span>GSTIN: <span className="font-mono text-gray-900 font-bold">{t.gstin || "—"}</span></span>
                  <span>PAN: <span className="font-mono text-gray-900 font-bold">{t.pan || "—"}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium truncate">
                  <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{t.contactPerson}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{t.contactEmail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
