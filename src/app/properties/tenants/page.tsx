"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Building2,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function TenantDirectoryPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, propsRes] = await Promise.all([
        fetch("/api/rent-roll/tenants").catch(() => null),
        fetch("/api/rent-roll/properties").catch(() => null),
      ]);

      if (propsRes && propsRes.ok) {
        const pJson = await propsRes.json();
        if (Array.isArray(pJson.data)) {
          setProperties(pJson.data);
        }
      }

      if (tenantsRes && tenantsRes.ok) {
        const tJson = await tenantsRes.json();
        if (Array.isArray(tJson.data)) {
          setTenants(tJson.data);
        }
      }
    } catch (e) {
      console.error(e);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (t.tenant_name && t.tenant_name.toLowerCase().includes(q)) ||
      (t.trade_name && t.trade_name.toLowerCase().includes(q)) ||
      (t.pan && t.pan.toLowerCase().includes(q));

    const matchesProp =
      selectedPropertyId === "all" ||
      t.property_id === selectedPropertyId ||
      t.property_name === selectedPropertyId;

    return matchesSearch && matchesProp;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Link href="/properties" className="hover:text-slate-800">Portfolio</Link>
                <span>/</span>
                <span className="text-[#0F8B7D] font-bold">Tenant Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Tenant Directory &amp; Occupants
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Corporate entities, verified GSTIN/PAN legal masters, lease counterparties, and authorized SPOCs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="Refresh Tenants"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
              </button>
              <Link
                href="/profile/complete"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition"
              >
                <Plus size={16} />
                <span>Onboard New Tenant</span>
              </Link>
            </div>
          </div>

          {/* If No Properties Registered Yet: Point 8 Requirement */}
          {!loading && properties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-amber-300 p-10 text-center max-w-lg mx-auto shadow-2xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950">
                  No Property Registered Yet
                </h3>
                <p className="text-xs text-amber-900/80 mt-1 max-w-md mx-auto leading-relaxed">
                  You must register a commercial property or tower before adding tenants and executing lease agreements.
                </p>
              </div>
              <Link
                href="/profile/complete"
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md shadow-teal-700/20"
              >
                <Plus size={16} />
                <span>+ Add Property First</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Search bar & Registered Property Dropdown */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tenant name, legal entity, PAN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  {/* Registered Property Dropdown */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                    >
                      <option value="all">All Registered Properties ({properties.length})</option>
                      {properties.map((p) => (
                        <option key={p.id || p.property_name} value={p.id || p.property_name}>
                          {p.property_name} ({p.city || "Commercial"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-semibold self-end md:self-auto">
                  <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {filteredTenants.length} Occupants Registered
                  </span>
                </div>
              </div>

              {/* Table or Empty State */}
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-teal-600" />
                    <span>Loading tenant directory...</span>
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <div className="p-12 sm:p-16 text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                      <Users size={28} />
                    </div>
                    <h4 className="text-base font-black text-slate-900">No tenants found</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      No corporate occupants registered for the selected property filter.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Link
                        href="/profile/complete"
                        className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-700/20"
                      >
                        <Plus size={15} />
                        <span>Add Tenant to Property</span>
                      </Link>
                    </div>
                  </div>
                ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Tenant Entity</th>
                      <th className="py-3 px-4">Trade Name</th>
                      <th className="py-3 px-4">PAN / GSTIN</th>
                      <th className="py-3 px-4">Leased Unit</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-teal-50/30 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {t.tenant_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {t.trade_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {t.pan || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {t.unit_number || "Unit Allocated"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            Active Lease
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/properties/rent-roll?tab=contracts"
                            className="text-[#0F8B7D] font-bold text-xs hover:underline"
                          >
                            View Contract →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
