"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Building,
  MapPin,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function SpaceAndBuildingRegistryPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rent-roll/spaces").catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setSpaces(json.data);
        }
      } else {
        // Fallback: check properties to build spaces summary
        const propRes = await fetch("/api/rent-roll/properties").catch(() => null);
        if (propRes && propRes.ok) {
          const json = await propRes.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            setSpaces(
              json.data.map((p: any, idx: number) => ({
                id: p.id,
                space_number: `T1-FL0${idx + 1}-01`,
                building_name: p.property_name,
                floor_number: idx + 1,
                chargeable_area: p.total_leasable_area_sqft || 0,
                status: "available",
                standard_rate_psf: p.price_per_sqft || 0,
              }))
            );
          } else {
            setSpaces([]);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpaces = spaces.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (s.space_number && s.space_number.toLowerCase().includes(q)) ||
      (s.building_name && s.building_name.toLowerCase().includes(q));
    const matchBuilding =
      selectedBuilding === "all" || s.building_name === selectedBuilding;
    return matchSearch && matchBuilding;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Link href="/properties" className="hover:text-slate-800">Portfolio</Link>
                <span>/</span>
                <span className="text-[#0F8B7D] font-bold">Space &amp; Building Registry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Space &amp; Building Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Master database of commercial towers, floors, demarcated leasable units, and carpet areas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchSpaces}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="Refresh Registry"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
              </button>
              <Link
                href="/properties/rent-roll?action=add-space"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition"
              >
                <Plus size={16} />
                <span>Demarcate New Unit</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search unit number, wing, or tower..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <span className="text-slate-500 font-semibold hidden sm:inline">Showing:</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                {filteredSpaces.length} Units Demarcated
              </span>
            </div>
          </div>

          {/* Units Table or Clean Empty State */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                <RefreshCw size={24} className="animate-spin text-teal-600" />
                <span>Loading space registry records...</span>
              </div>
            ) : filteredSpaces.length === 0 ? (
              <div className="p-12 sm:p-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Layers size={28} />
                </div>
                <h4 className="text-base font-black text-slate-900">No units demarcated yet</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You haven&apos;t added any commercial floors or spaces yet. Add your property units to track occupancy, leases, and escalations.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Link
                    href="/onboarding"
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-700/20"
                  >
                    <Plus size={15} />
                    <span>Onboard Property First</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Space # / Unit</th>
                      <th className="py-3 px-4">Tower / Building</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Chargeable Sq.Ft</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSpaces.map((space) => (
                      <tr key={space.id} className="hover:bg-teal-50/30 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {space.space_number}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {space.building_name || "Main Tower"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          Floor {space.floor_number || 1}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {parseFloat(space.chargeable_area || 0).toLocaleString("en-IN")} sq.ft
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              space.status === "leased"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {space.status || "Available"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/properties/rent-roll"
                            className="text-[#0F8B7D] font-bold text-xs hover:underline"
                          >
                            View in Rent Roll →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
