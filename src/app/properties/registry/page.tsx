"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PropertyItem {
  id: string;
  name: string;
  type: string;
  location: string;
  area: string | number;
  occupied: number;
  vacant: number;
  occPct: number;
  grade?: string;
}

export default function PropertyMasterRegistry() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/rent-roll/properties");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              type: p.type || "Commercial Office",
              location: `${p.city || "Mumbai"}, ${p.state || "Maharashtra"}`,
              area: Number(p.totalArea || 0).toLocaleString(),
              occupied: p.activeLeasesCount || 0,
              vacant: Math.max(0, (p.totalArea || 0) - (p.occupiedArea || 0)),
              occPct: p.occupancyPct || 0,
              grade: p.grade || "A"
            }));
            setProperties(mapped);
            if (mapped.length > 0) setSelectedPropId(mapped[0].id);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback to local
      }

      if (typeof window !== "undefined") {
        let local = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");

        // Auto-detect: if no saved properties but onboarding org data exists, create from org data
        if (local.length === 0) {
          const orgName = localStorage.getItem("officex_org_name") || localStorage.getItem("officex_active_org") || "";
          const orgCity = localStorage.getItem("officex_org_city") || "";
          const orgState = localStorage.getItem("officex_org_state") || "";
          const userName = localStorage.getItem("officex_user_name") || "";

          if (orgName) {
            const autoProperty = {
              id: `prop-auto-${Date.now()}`,
              name: orgName,
              city: orgCity,
              state: orgState || orgCity,
              type: "Commercial Office",
              totalArea: "",
              ownerName: userName,
              createdAt: new Date().toISOString()
            };
            local = [autoProperty];
            localStorage.setItem("officex_user_properties", JSON.stringify(local));
          }
        }

        // Final fallback: fetch org from database if still no properties
        if (local.length === 0) {
          const uid = localStorage.getItem("officex_user_id") || "";
          try {
            const orgRes = await fetch(`/api/me/organization${uid ? `?userId=${uid}` : ""}`);
            const orgData = await orgRes.json();
            if (orgData.organizations && orgData.organizations.length > 0) {
              const org = orgData.organizations[0];
              if (org.properties && org.properties.length > 0) {
                local = org.properties.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  city: p.city || "",
                  state: p.state || "",
                  type: p.type || "Commercial Office",
                  totalArea: p.total_area || 15000,
                  grade: p.grade || "A",
                  ownerName: p.owner_name || localStorage.getItem("officex_user_name") || "",
                  createdAt: p.created_at || new Date().toISOString()
                }));
              } else {
                const dbProp = {
                  id: org.id || `prop-db-${Date.now()}`,
                  name: org.name || "My Commercial Property",
                  city: org.city || "",
                  state: org.state || "",
                  type: "Commercial Office",
                  totalArea: 15000,
                  grade: "A",
                  ownerName: localStorage.getItem("officex_user_name") || "",
                  createdAt: org.createdAt || new Date().toISOString()
                };
                local = [dbProp];
              }
              localStorage.setItem("officex_user_properties", JSON.stringify(local));
              localStorage.setItem("officex_org_name", org.name || "");
              localStorage.setItem("officex_active_org", org.name || "");
              localStorage.setItem("officex_org_city", org.city || "");
              localStorage.setItem("officex_org_state", org.state || "");
            }
          } catch (e) {
            // silently fail
          }
        }

        const mapped = (local || []).map((p: any) => ({
          id: p?.id || `prop-${Math.random().toString(36).substring(7)}`,
          name: p?.name || p?.propertyName || "Commercial Tower",
          type: p?.type || p?.subType || "Commercial Office",
          location: `${p?.city || "Mumbai"}${p?.state ? `, ${p.state}` : ""}`,
          area: Number(p?.totalArea || p?.totalAreaSft || 0).toLocaleString(),
          occupied: 0,
          vacant: Number(p?.totalArea || p?.totalAreaSft || 0),
          occPct: 0,
          grade: p?.grade || "A"
        }));
        setProperties(mapped);
        if (mapped.length > 0) setSelectedPropId(mapped[0].id);
      }
      setIsLoading(false);
    }

    loadProperties();
  }, []);

  const filteredProperties = (properties || []).filter((p) =>
    (p?.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (p?.location || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (p?.id || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const selectedProp = (properties || []).find((p) => p?.id === selectedPropId);

  return (
    <div className="flex gap-6 font-sans relative">
      {/* Table Side */}
      <div className={`flex-1 flex flex-col gap-6 ${selectedProp ? "mr-[400px]" : ""}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Property Registry</h1>
            <p className="text-sm text-gray-500 mt-1">Master catalog of all managed real estate assets.</p>
          </div>
          <Link
            href="/properties/add"
            className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={14} /> Add Property
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by name, city, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#0F8B7D]"
          />
        </div>

        {/* Master Table or Empty State */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-3">
              <Building2 size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No properties in master registry</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Your property catalog is currently empty. Click below to add your first commercial building asset.
            </p>
            <Link
              href="/properties/add"
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus size={14} /> Register Commercial Asset
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-6">PROPERTY ID</th>
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">LOCATION</th>
                    <th className="py-3 px-4">TOTAL AREA</th>
                    <th className="py-3 px-4">ACTIVE LEASES</th>
                    <th className="py-3 px-6">OCCUPANCY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPropId(p.id)}
                      className={`border-b border-gray-100 text-xs hover:bg-gray-50/50 cursor-pointer ${
                        selectedPropId === p.id ? "bg-teal-50/30" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-mono text-gray-500">{p.id}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{p.name}</td>
                      <td className="py-4 px-4 text-gray-600">{p.type}</td>
                      <td className="py-4 px-4 text-gray-600">{p.location}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{p.area} sqft</td>
                      <td className="py-4 px-4 text-gray-700">{p.occupied}</td>
                      <td className="py-4 px-6">
                        <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${p.occPct}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {filteredProperties.length} of {properties.length} properties</p>
            </div>
          </div>
        )}
      </div>

      {/* Side Details Drawer */}
      {selectedProp && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-base font-bold text-gray-900">{selectedProp.name}</h2>
              <button onClick={() => setSelectedPropId(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-bold text-gray-800">{selectedProp.location}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Leasable</span><span className="font-bold text-gray-800">{selectedProp.area} sq ft</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Current Occupancy</span><span className="font-bold text-[#0F8B7D]">{selectedProp.occPct}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Property Grade</span><span className="font-bold text-teal-700">Grade {selectedProp.grade} Commercial</span></div>
              </div>
            </div>
          </div>

          <Link
            href="/properties/rent-roll?tab=occupancy"
            className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold mt-4 shadow-sm text-center block"
          >
            Open Stacking Plan &amp; Units
          </Link>
        </div>
      )}
    </div>
  );
}
