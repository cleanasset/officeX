"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, ChevronLeft, ChevronRight, Share2, Sparkles, KeyRound } from "lucide-react";
import Link from "next/link";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";

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
  inviteCode?: string;
  ownerName?: string;
}

const SEED_PROP_IDS = new Set([
  "357554cc-221d-4c7f-9465-32afcec7a8e7",
  "72b18ad7-0ee0-4ac5-bfc9-156c6dc10625",
  "8b1b9613-b890-4540-9139-6c2a6bb6cf60",
  "401f394a-6d27-4c23-9a21-411baa7eef3b",
  "cfa13505-71a5-4a43-be33-37497f416fdc",
  "cf5a0b49-c4fd-4762-ae22-40c42ac6332d",
  "PROP-FORTUNE-SKY",
  "PROP-001",
  "PROP-1790239048961"
]);

const SEED_PROP_NAMES = new Set([
  "fortune sky",
  "apex horizon tower",
  "signature tower b",
  "eka club",
  "business hub",
  "shivalik shilp",
  "apex business tower",
  "apex commercial tower",
  "meridian tech park",
  "nexus hub",
  "maker maxity",
  "godrej bkc horizon"
]);

export default function PropertyMasterRegistry() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalProp, setInviteModalProp] = useState<PropertyItem | null>(null);

  useEffect(() => {
    async function loadProperties() {
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "") : "";
      const isDemoAccount = email.includes("demo.seed") || (typeof window !== "undefined" && localStorage.getItem("officex_mode") === "demo");

      let loadedProps: PropertyItem[] = [];

      try {
        const res = await fetch("/api/rent-roll/properties");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const filtered = isDemoAccount
              ? data
              : data.filter((p: any) => {
                  const id = p?.id || "";
                  const name = (p?.name || "").toLowerCase().trim();
                  return !SEED_PROP_IDS.has(id) && !SEED_PROP_NAMES.has(name) && !name.includes("commercial portfolio");
                });

            if (filtered.length > 0) {
              loadedProps = filtered.map((p: any) => {
                const codeNum = (p.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                return {
                  id: p.id,
                  name: p.name,
                  type: p.type || "Commercial Office",
                  location: `${p.city || "Mumbai"}, ${p.state || "Maharashtra"}`,
                  area: p.totalArea ? Number(p.totalArea).toLocaleString() : "0",
                  occupied: p.activeLeasesCount || 0,
                  vacant: Math.max(0, (Number(p.totalArea) || 0) - (Number(p.occupiedArea) || 0)),
                  occPct: p.occupancyPct || 0,
                  grade: p.grade || "A",
                  inviteCode: p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                  ownerName: p.ownerName || p.owner_name || p.ownerCompany || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
                };
              });
            }
          }
        }
      } catch (e) {
        // Fallback to local
      }

      // Synchronize localStorage with backend truth, clearing out any ghost records
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("officex_user_properties", JSON.stringify(loadedProps));
        } catch (e) {}
      }

      setProperties(loadedProps);
      if (loadedProps.length > 0) {
        setSelectedPropId(loadedProps[0].id);
      } else {
        setSelectedPropId(null);
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

        {/* Master Table or Clean Empty State */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
              <Building2 size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No properties in master registry</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-sm leading-relaxed">
              Your property catalog is currently empty. Click below to register your commercial building asset and instantly get a tenant invitation link.
            </p>
            <Link
              href="/properties/add"
              className="mt-5 px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus size={14} /> Register Commercial Asset
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-6">PROPERTY ID</th>
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-4">TYPE</th>
                    <th className="py-3 px-4">LOCATION</th>
                    <th className="py-3 px-4">TOTAL AREA</th>
                    <th className="py-3 px-4">ACTIVE LEASES</th>
                    <th className="py-3 px-4">OCCUPANCY</th>
                    <th className="py-3 px-6 text-right">ACTION</th>
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
                      <td className="py-4 px-4">
                        <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#0F8B7D]" style={{ width: `${p.occPct}%` }} />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInviteModalProp(p);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white text-xs font-bold transition-all shadow-xs"
                          title="Generate invitation link & building code for tenants"
                        >
                          <Share2 size={12} /> Invite Tenants
                        </button>
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
              <div>
                <h2 className="text-base font-bold text-gray-900">{selectedProp.name}</h2>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-mono font-bold">
                  <KeyRound size={11} className="text-[#0F8B7D]" /> {selectedProp.inviteCode || "OX-8841"}
                </div>
              </div>
              <button onClick={() => setSelectedPropId(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-bold text-gray-800">{selectedProp.location}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Leasable</span><span className="font-bold text-gray-800">{selectedProp.area} sq ft</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Current Occupancy</span><span className="font-bold text-[#0F8B7D]">{selectedProp.occPct}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Property Grade</span><span className="font-bold text-teal-700">Grade {selectedProp.grade} Commercial</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Building Code</span><span className="font-mono font-bold text-gray-900">{selectedProp.inviteCode || "OX-8841"}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <button
              type="button"
              onClick={() => setInviteModalProp(selectedProp)}
              className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] border border-teal-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Share2 size={13} /> Invite Tenants & Share Link
            </button>

            <Link
              href={`/properties/rent-roll?propertyId=${selectedProp.id}`}
              className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold shadow-sm text-center flex items-center justify-center gap-2 transition-all"
            >
              Open Stacking Plan & Rent Roll →
            </Link>
          </div>
        </div>
      )}

      {/* Tenant Invitation Modal */}
      {inviteModalProp && (
        <TenantInviteModal
          isOpen={Boolean(inviteModalProp)}
          onClose={() => setInviteModalProp(null)}
          property={inviteModalProp}
        />
      )}
    </div>
  );
}
