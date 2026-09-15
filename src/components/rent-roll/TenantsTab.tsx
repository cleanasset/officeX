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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search tenant name, GSTIN, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={onOpenAddTenant}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tenant Entity</span>
        </button>
      </div>

      {/* ──── TENANT CARDS GRID ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectTenant(t)}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-xl shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {t.tradeName}
                  </h4>
                  <p className="text-[11px] text-slate-400">{t.legalName}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {t.tenantCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold">
                  {t.industry}
                </span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-semibold">
                  {t.activeLeasesCount} Active Leases
                </span>
              </div>
            </div>

            {/* Financial Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Leased Area</span>
                <p className="font-mono font-bold text-slate-200">{t.totalArea.toLocaleString()} sqft</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Monthly Rent</span>
                <p className="font-mono font-bold text-emerald-400">{formatINR(t.totalMonthlyRent)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Gross Monthly Bill</span>
                <p className="font-mono font-bold text-amber-300">{formatINR(t.totalMonthlyBilling)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding</span>
                <p className={`font-mono font-bold ${t.outstanding > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {t.outstanding > 0 ? formatINR(t.outstanding) : "₹0"}
                </p>
              </div>
            </div>

            {/* Statutory & Contact Details */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span>GSTIN: <span className="font-mono text-slate-300">{t.gstin || "—"}</span></span>
                <span>PAN: <span className="font-mono text-slate-300">{t.pan || "—"}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{t.contactPerson}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{t.contactEmail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
