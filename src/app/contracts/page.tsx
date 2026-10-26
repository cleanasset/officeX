"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Building2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Clock,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";
import { getClientAuthHeaders } from "@/lib/auth-storage";

function formatINR(val: number) {
  if (!val || isNaN(val)) return "₹0";
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const headers = getClientAuthHeaders();
      const res = await fetch("/api/contracts", { headers });
      if (res.ok) {
        const json = await res.json();
        setContracts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) {
      console.error("Failed to load contracts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const occupant = (c.occupant_name || c.tenant_name || "").toLowerCase();
    const prop = (c.property_name || c.building_name || "").toLowerCase();
    const space = (c.space_name || c.unit_name || "").toLowerCase();
    const code = (c.contract_code || "").toLowerCase();
    return occupant.includes(q) || prop.includes(q) || space.includes(q) || code.includes(q);
  });

  const totalMonthlyBaseRent = filteredContracts.reduce(
    (acc, c) => acc + (Number(c.monthly_base_rent || c.base_rent || 0) || 0),
    0
  );
  const totalArea = filteredContracts.reduce(
    (acc, c) => acc + (Number(c.chargeable_area_sqft || c.area_sqft || 0) || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 md:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header with Breadcrumb and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Link href="/dashboard/owner" className="hover:text-teal-700 transition flex items-center gap-1">
                    <ArrowLeft size={13} />
                    <span>Workspace Dashboard</span>
                  </Link>
                  <span>/</span>
                  <span className="text-[#0D7B6C] font-extrabold">Commercial Contracts</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0D7B6C]/10 border border-[#0D7B6C]/20 flex items-center justify-center text-[#0D7B6C]">
                    <FileText size={22} />
                  </div>
                  <span>Contracts &amp; Lease Register</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Manage all executed commercial lease deeds, lock-in clauses, stepped escalations, and security deposits across your portfolio.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={fetchContracts}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer"
                  title="Refresh Contracts"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#0D7B6C] hover:bg-[#0A6357] text-white text-xs font-extrabold transition flex items-center gap-2 shadow-sm cursor-pointer group"
                >
                  <Plus size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Add New Contract</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Active Contracts</span>
                  <FileText size={18} className="text-[#0D7B6C]" />
                </div>
                <div className="text-2xl font-black text-slate-900">{filteredContracts.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Across all demarcated units</div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Committed Rent</span>
                  <DollarSign size={18} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{formatINR(totalMonthlyBaseRent)}<span className="text-xs text-slate-400 font-normal"> /mo</span></div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">Monthly base lease commitments</div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Leased Area</span>
                  <Layers size={18} className="text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalArea.toLocaleString("en-IN")}<span className="text-xs text-slate-400 font-normal"> Sq.Ft.</span></div>
                <div className="text-[11px] text-slate-500 mt-1">Demarcated chargeable space</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <Search size={18} className="text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search by tenant name, property, unit, or contract code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Lease Contracts Directory</h3>
                <span className="text-xs text-slate-500 font-medium">Showing {filteredContracts.length} records</span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading contracts...</span>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Contracts Recorded</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You can create lease contracts freely for any property and tenant in your workspace.
                  </p>
                  <button
                    type="button"
                    onClick={() => setWizardOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#0D7B6C] text-white text-xs font-bold shadow-xs hover:bg-[#0A6357] transition cursor-pointer"
                  >
                    + Add First Contract
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Tenant / Occupant</th>
                        <th className="py-3 px-4">Property &amp; Space</th>
                        <th className="py-3 px-4">Area</th>
                        <th className="py-3 px-4">Monthly Base Rent</th>
                        <th className="py-3 px-4">Lease Term</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredContracts.map((c, idx) => (
                        <tr key={c.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{c.occupant_name || c.tenant_name || "Commercial Tenant"}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.contract_code || `CTR-${idx + 101}`}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{c.property_name || c.building_name || "Commercial Building"}</div>
                            <div className="text-[11px] text-slate-500">{c.space_name || c.unit_name || "Demarcated Unit"}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {Number(c.chargeable_area_sqft || c.area_sqft || 0).toLocaleString("en-IN")} sq.ft
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatINR(Number(c.monthly_base_rent || c.base_rent || 0))}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{c.start_date || "—"} to {c.end_date || "—"}</div>
                            {c.lock_in_months && (
                              <div className="text-[10px] text-teal-700 font-medium">{c.lock_in_months}M Lock-in</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {c.status || "Active"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContractId(c.id);
                                setDrawerOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <MobileBottomNav />

      {/* Contract Creation Wizard Modal */}
      <ContractWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          setWizardOpen(false);
          fetchContracts();
        }}
      />

      {/* Contract Detail Drawer */}
      {selectedContractId && (
        <ContractDetailDrawer
          contractId={selectedContractId}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedContractId(null);
          }}
          onRefresh={fetchContracts}
          onOpenDocViewer={() => {}}
        />
      )}
    </div>
  );
}
