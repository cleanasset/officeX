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
  Users,
  Coins,
  ChevronRight,
  Edit2,
  Eye,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import PropertyHierarchyModal, {
  HierarchyTab,
} from "@/components/rent-roll/PropertyHierarchyModal";
import PropertyDetailModal from "@/components/rent-roll/PropertyDetailModal";
import RentRollExcelImporterModal from "@/components/rent-roll/RentRollExcelImporterModal";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function SpaceAndBuildingRegistryPage() {
  const [activeTab, setActiveTab] = useState<"properties" | "units">("properties");
  const [properties, setProperties] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [registerRows, setRegisterRows] = useState<any[]>([]);
  const [selectedPropertyIdForHierarchy, setSelectedPropertyIdForHierarchy] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [hierarchyTab, setHierarchyTab] = useState<HierarchyTab>("property");
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<any | null>(null);
  const [propertyDetailMode, setPropertyDetailMode] = useState<"view" | "edit">("view");
  const [excelImporterOpen, setExcelImporterOpen] = useState(false);

  useEffect(() => {
    fetchRegistryData();
  }, []);

  const fetchRegistryData = async () => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();

      const [propsRes, spacesRes, regRes] = await Promise.all([
        fetch("/api/rent-roll/properties", { headers: authHeaders }).catch(() => null),
        fetch("/api/spaces", { headers: authHeaders }).catch(() => null),
        fetch("/api/rent-roll/register?view=current", { headers: authHeaders }).catch(() => null),
      ]);

      let loadedProps: any[] = [];
      if (propsRes && propsRes.ok) {
        const json = await propsRes.json();
        if (Array.isArray(json.data)) {
          loadedProps = json.data;
          setProperties(json.data);
        }
      }

      let loadedRegRows: any[] = [];
      if (regRes && regRes.ok) {
        const json = await regRes.json();
        if (Array.isArray(json.rows)) {
          loadedRegRows = json.rows;
          setRegisterRows(json.rows);
        }
      }

      if (spacesRes && spacesRes.ok) {
        const json = await spacesRes.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setSpaces(
            json.data.map((s: any) => {
              const matchedRow = loadedRegRows.find(
                (r: any) =>
                  r.space_id === s.id ||
                  (s.space_name && r.space_name?.toLowerCase() === s.space_name.toLowerCase()) ||
                  (s.space_code && r.space_code?.toLowerCase() === s.space_code.toLowerCase())
              );
              const occName = matchedRow?.occupant_name || null;
              const isOccupied = Boolean(occName) || s.occupancy_status === "occupied" || s.occupancy_status === "leased";
              return {
                id: s.id,
                space_number: s.space_name || s.space_code,
                building_name: s.building_name || s.property_name || "Main Tower",
                floor_name: s.floor_name || (s.space_name?.toLowerCase().includes("ground") ? "Ground Floor" : s.space_name?.toLowerCase().includes("floor") ? s.space_name : null),
                floor_number: s.floor_name ? s.floor_name.replace(/floor\s*/i, "") : "1",
                chargeable_area: Number(s.chargeable_area_sqft || s.area_sqft || 0),
                status: isOccupied ? "occupied" : "available",
                occupant_name: occName,
                contract_code: matchedRow?.contract_code || null,
                standard_rate_psf: Number(matchedRow?.rate_per_sqft || s.standard_rate_psf || s.rate_per_sqft || 85),
                workstations: s.workstations_count || null,
                fitout: s.fitout_condition || null,
                space_type: s.space_type || "Office",
              };
            })
          );
        } else if (loadedProps.length > 0) {
          setSpaces(
            loadedProps.map((p: any) => ({
              id: p.id,
              space_number: `Unit ${p.property_code ? p.property_code.slice(-4) : "101"}`,
              building_name: p.property_name,
              floor_number: "1",
              chargeable_area: Number(p.total_leasable_area_sqft || 0),
              status: "available",
              occupant_name: null,
              contract_code: null,
              standard_rate_psf: Number(p.price_per_sqft || 85),
            }))
          );
        } else {
          setSpaces([]);
        }
      }
    } catch (e) {
      console.error(e);
      setProperties([]);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpaceOccupancy = async (spaceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "occupied" || currentStatus === "leased" ? "vacant" : "occupied";
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ occupancy_status: nextStatus }),
      });
      if (res.ok) {
        setSpaces((prev) =>
          prev.map((s) => (s.id === spaceId ? { ...s, status: nextStatus } : s))
        );
      }
    } catch {}
  };

  const handleDeleteProperty = async (propertyId: string, propertyName: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${propertyName}" and all its units from your portfolio?\n\nThis will remove the property and its leasable spaces.`
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/rent-roll/properties/${propertyId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          const activeProp = localStorage.getItem("officex_active_property");
          if (activeProp === propertyName || activeProp === propertyId) {
            localStorage.removeItem("officex_active_property");
          }
        }
        await fetchRegistryData();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Failed to delete property");
      }
    } catch {
      alert("Network error deleting property");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string, spaceNumber: string) => {
    if (!confirm(`Are you sure you want to permanently delete unit "${spaceNumber}"?\n\nThis will remove it from the space registry and rent roll.`)) {
      return;
    }
    try {
      const authHeaders = getClientAuthHeaders();
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
        await fetchRegistryData();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Failed to delete unit");
      }
    } catch {
      alert("Network error deleting unit");
    }
  };

  const filteredProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (p.property_name && p.property_name.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.property_code && p.property_code.toLowerCase().includes(q))
    );
  });

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
                <span className="text-[#0F8B7D] font-bold">Property &amp; Space Registry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Property &amp; Space Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Master database of registered commercial properties, towers, floors, and demarcated units.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchRegistryData}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="Refresh Registry"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
              </button>
              <button
                onClick={() => setExcelImporterOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Upload in Bulk</span>
              </button>
              <button
                onClick={() => {
                  setHierarchyTab("property");
                  setHierarchyModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Register Property</span>
              </button>
              <button
                onClick={() => {
                  setHierarchyTab("space");
                  setHierarchyModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <Layers size={15} />
                <span>Demarcate Unit</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation: Properties vs Demarcated Units */}
          <div className="flex items-center gap-3 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("properties")}
              className={`pb-3 px-2 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "properties"
                  ? "border-[#0F8B7D] text-[#0F8B7D]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 size={16} />
              <span>Registered Properties ({properties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("units")}
              className={`pb-3 px-2 text-xs sm:text-sm font-black flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === "units"
                  ? "border-[#0F8B7D] text-[#0F8B7D]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={16} />
              <span>Demarcated Units &amp; Spaces ({spaces.length})</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "properties"
                    ? "Search property name, city, code..."
                    : "Search unit number, wing, or tower..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <span className="text-slate-500 font-semibold hidden sm:inline">Showing:</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                {activeTab === "properties"
                  ? `${filteredProperties.length} Properties`
                  : `${filteredSpaces.length} Units Demarcated`}
              </span>
            </div>
          </div>

          {/* TAB 1: REGISTERED PROPERTIES */}
          {activeTab === "properties" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-teal-600" />
                  <span>Loading property registry records...</span>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="p-12 sm:p-16 text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                    <Building2 size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-900">No properties registered yet</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Register your property or business park to manage leases, rent rolls, and tenant allocations.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setExcelImporterOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Upload via Excel Sheet</span>
                    </button>
                    <button
                      onClick={() => {
                        setHierarchyTab("property");
                        setHierarchyModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-700/20 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Register Property Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Property Name</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Leasable Area</th>
                        <th className="py-3 px-4">Base Rate PSF</th>
                        <th className="py-3 px-4">Occupancy &amp; Tenants</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.map((p) => {
                        const propRegRows = registerRows.filter(
                          (r) =>
                            r.property_id === p.id ||
                            (r.property_name && r.property_name.toLowerCase() === p.property_name.toLowerCase())
                        );
                        const propSpaces = spaces.filter(
                          (s) =>
                            s.property_id === p.id ||
                            (s.building_name && s.building_name.toLowerCase().includes(p.property_name.toLowerCase()))
                        );

                        const rawOccupants = [
                          ...propRegRows.map((r) => r.occupant_name),
                          ...propSpaces.map((s) => s.occupant_name),
                        ].filter((name) => name && !name.includes("Vacant") && name !== "—");

                        const uniqueOccupants = Array.from(new Set(rawOccupants));

                        const occupiedSqft =
                          propRegRows
                            .filter((r) => r.occupant_name && !r.occupant_name.includes("Vacant") && r.occupant_name !== "—")
                            .reduce((sum, r) => sum + (Number(r.area_sqft) || 0), 0) ||
                          propSpaces
                            .filter((s) => s.status === "occupied" || Boolean(s.occupant_name))
                            .reduce((sum, s) => sum + (Number(s.chargeable_area) || 0), 0);

                        const totalPropArea =
                          Number(p.total_leasable_area_sqft) ||
                          propSpaces.reduce((sum, s) => sum + (Number(s.chargeable_area) || 0), 0) ||
                          1;
                        const occupancyPct = totalPropArea > 0 ? Math.min(100, Math.round((occupiedSqft / totalPropArea) * 100)) : 0;
                        const isFullyLeased = occupancyPct >= 99 || (uniqueOccupants.length > 0 && occupiedSqft >= totalPropArea);

                        // Effective Base Rate PSF
                        const effectivePsf =
                          Number(p.price_per_sqft) > 0
                            ? Number(p.price_per_sqft)
                            : propRegRows.find((r) => Number(r.current_rate_per_sqft) > 0)?.current_rate_per_sqft ||
                              propSpaces.find((s) => Number(s.standard_rate_psf) > 0)?.standard_rate_psf ||
                              85;

                        return (
                          <tr
                            key={p.id}
                            onClick={() => {
                              setSelectedPropertyForDetail(p);
                              setPropertyDetailMode("view");
                            }}
                            className="hover:bg-teal-50/40 transition cursor-pointer group"
                          >
                            <td className="py-3.5 px-4 font-black text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#0F8B7D] group-hover:text-white transition">
                                  <Building size={14} />
                                </div>
                                <div>
                                  <span className="group-hover:text-[#0F8B7D] transition">{p.property_name}</span>
                                  <div className="text-[10px] text-slate-400 font-normal">
                                    {p.property_type ? p.property_type.toUpperCase() : "COMMERCIAL"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                              {p.property_code || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-semibold">
                              <div className="flex items-center gap-1 text-slate-600">
                                <MapPin size={12} className="text-teal-600 shrink-0" />
                                <span>{p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : "India"}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900">
                              {Number(p.total_leasable_area_sqft || 0).toLocaleString("en-IN")} sq.ft
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              ₹{Number(effectivePsf).toLocaleString("en-IN")}/sqft
                            </td>
                            <td className="py-3.5 px-4">
                              {uniqueOccupants.length > 0 ? (
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                                    <Users size={12} className="text-[#0F8B7D] shrink-0" />
                                    <span>{uniqueOccupants.join(", ")}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {occupiedSqft > 0 ? `${occupiedSqft.toLocaleString("en-IN")} sq.ft leased` : "Contract active"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">— Vacant Asset</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isFullyLeased ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  100% Leased
                                </span>
                              ) : occupancyPct > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                  {occupancyPct}% Leased
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Vacant Asset
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setSelectedPropertyForDetail(p);
                                    setPropertyDetailMode("view");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="View All Details"
                                >
                                  <Eye size={12} />
                                  <span>Details</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPropertyForDetail(p);
                                    setPropertyDetailMode("edit");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Edit Property"
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>

                                {uniqueOccupants.length > 0 ? (
                                  <Link
                                    href={`/properties/tenants?property=${encodeURIComponent(p.id)}`}
                                    className="px-2.5 py-1 rounded-lg bg-teal-100/90 hover:bg-teal-200 text-teal-900 border border-teal-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                    title={`View enrolled tenant(s): ${uniqueOccupants.join(", ")}`}
                                  >
                                    <Users size={12} />
                                    <span>Tenants ({uniqueOccupants.length}: {uniqueOccupants[0]})</span>
                                  </Link>
                                ) : null}

                                {!isFullyLeased ? (
                                  <button
                                    onClick={() => {
                                      setSelectedPropertyIdForHierarchy(p.id);
                                      setHierarchyTab("tenant");
                                      setHierarchyModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 text-[11px] font-bold transition cursor-pointer"
                                    title="Add / Lease space to tenant"
                                  >
                                    + Tenant
                                  </button>
                                ) : null}

                                <Link
                                  href={`/properties/rent-roll?property=${encodeURIComponent(p.id)}`}
                                  className="text-[#0F8B7D] font-bold text-xs hover:underline flex items-center gap-0.5 ml-1"
                                >
                                  <span>Rent Roll</span>
                                  <ChevronRight size={13} />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProperty(p.id, p.property_name)}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                                  title="Delete Property from Portfolio"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEMARCATED UNITS & SPACES */}
          {activeTab === "units" && (
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
                    You haven&apos;t demarcated any individual office floors or spaces yet. Demarcate units to allocate to tenants.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setHierarchyTab("space");
                        setHierarchyModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-700/20 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Demarcate Unit Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Space # / Unit</th>
                        <th className="py-3 px-4">Tower / Property</th>
                        <th className="py-3 px-4">Floor</th>
                        <th className="py-3 px-4">Chargeable Sq.Ft</th>
                        <th className="py-3 px-4">Base Rate PSF</th>
                        <th className="py-3 px-4">Occupant / Lessee</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSpaces.map((space) => (
                        <tr key={space.id} className="hover:bg-teal-50/30 transition">
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            <div>
                              <span>{space.space_number}</span>
                              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="uppercase">{space.space_type || "Office"}</span>
                                {space.workstations && (
                                  <>
                                    <span>•</span>
                                    <span>{space.workstations} Desks</span>
                                  </>
                                )}
                                {space.fitout && (
                                  <>
                                    <span>•</span>
                                    <span>{space.fitout}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">
                            {space.building_name || "Main Tower"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {space.floor_name || (space.floor_number === 0 || space.floor_number === "0" ? "Ground Floor" : `Floor ${space.floor_number || 1}`)}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            {parseFloat(space.chargeable_area || 0).toLocaleString("en-IN")} sq.ft
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            ₹{space.standard_rate_psf > 0 ? space.standard_rate_psf : 85}/sqft
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {space.occupant_name ? (
                              <div className="flex items-center gap-1.5 text-teal-800">
                                <Building size={12} className="text-[#0F8B7D] shrink-0" />
                                <span>{space.occupant_name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-normal italic">— (Vacant)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleSpaceOccupancy(space.id, space.status)}
                              title="Click to toggle Vacant / Occupied"
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                space.status === "occupied" || space.status === "leased"
                                  ? "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  space.status === "occupied" || space.status === "leased"
                                    ? "bg-blue-600"
                                    : "bg-emerald-600"
                                }`}
                              />
                              <span>
                                {space.status === "occupied" || space.status === "leased"
                                  ? space.occupant_name ? `Occupied (${space.occupant_name})` : "Occupied (Tenant)"
                                  : "Vacant (Available)"}
                              </span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href="/properties/rent-roll"
                                className="text-[#0F8B7D] font-bold text-xs hover:underline flex items-center gap-0.5"
                              >
                                <span>Rent Roll</span>
                                <ChevronRight size={13} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteSpace(space.id, space.space_number)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete unit from space registry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Unified Canonical Commercial Hierarchy, Space & Property Modal */}
        <PropertyHierarchyModal
          isOpen={hierarchyModalOpen}
          onClose={() => {
            setHierarchyModalOpen(false);
            setSelectedPropertyIdForHierarchy(undefined);
          }}
          initialTab={hierarchyTab}
          initialPropertyId={selectedPropertyIdForHierarchy}
          onSuccess={fetchRegistryData}
        />

        {/* Full Property Detail & Edit Modal */}
        <PropertyDetailModal
          property={selectedPropertyForDetail}
          isOpen={Boolean(selectedPropertyForDetail)}
          onClose={() => setSelectedPropertyForDetail(null)}
          onPropertyUpdated={fetchRegistryData}
          initialMode={propertyDetailMode}
        />

        {/* Bulk Excel Importer Modal */}
        <RentRollExcelImporterModal
          isOpen={excelImporterOpen}
          onClose={() => setExcelImporterOpen(false)}
          onSuccess={() => {
            setExcelImporterOpen(false);
            fetchRegistryData();
          }}
        />

        <MobileBottomNav />
      </div>
    </div>
  );
}
