"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Building2, ChevronLeft, ChevronRight, Share2, Sparkles, KeyRound, UploadCloud, MapPin, Users, ShieldCheck, ArrowRight, Building, CheckCircle2, X, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";
import { ImportRentRollModal } from "@/components/rent-roll/ImportRentRollModal";
import { EditPropertyModal, PropertyModalData } from "@/components/properties/EditPropertyModal";

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
  activeLeases?: number;
  isFullyRegistered?: boolean;
  isDetailsPending?: boolean;
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
  "PROP-002",
  "PROP-APX",
  "PROP-MTP",
  "PROP-NXN",
  "PROP-1790239048961",
  "PROP-1790659297701"
]);

function PropertyRegistryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionParam = searchParams.get("action");

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalProp, setInviteModalProp] = useState<PropertyItem | null>(null);
  const [editingModalProp, setEditingModalProp] = useState<PropertyItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showPrimaryModal, setShowPrimaryModal] = useState<boolean>(actionParam === "complete-primary");

  const handleDeleteProperty = (propId: string, propName: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Are you sure you want to delete property "${propName}"? This action cannot be undone.`);
      if (!confirmed) return;

      try {
        const currentProps = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        const updatedProps = currentProps.filter((p: any) => p.id !== propId && p.name !== propName);
        localStorage.setItem("officex_user_properties", JSON.stringify(updatedProps));
      } catch (e) {}

      setProperties(prev => prev.filter(p => p.id !== propId));
      if (selectedPropId === propId) {
        setSelectedPropId(null);
      }
    }
  };

  useEffect(() => {
    if (actionParam === "complete-primary") {
      setShowPrimaryModal(true);
    }
  }, [actionParam]);

  useEffect(() => {
    async function loadProperties() {
      const email = typeof window !== "undefined" ? (localStorage.getItem("officex_user_email") || "") : "";
      const isDemoAccount = email.includes("demo.seed") || (typeof window !== "undefined" && localStorage.getItem("officex_mode") === "demo");

      let loadedProps: PropertyItem[] = [];
      let localStoredProps: PropertyItem[] = [];
      const seenIds = new Set<string>();

      // Check localStorage for newly registered properties first (so freshly registered properties are on top)
      if (typeof window !== "undefined") {
        try {
          const localStored = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
          if (Array.isArray(localStored)) {
            const seenNames = new Set<string>();
            const deduplicatedLocal: any[] = [];

            localStored.forEach((p: any) => {
              if (p && (p.id || p.name)) {
                const pId = p.id || `PROP-${Date.now()}`;
                const normName = (p.name || "").toLowerCase().trim();
                
                // Deduplicate by ID and property name
                if (!seenIds.has(pId) && (!normName || !seenNames.has(normName))) {
                  const codeNum = pId.replace(/\D/g, "").slice(-4) || "8841";
                  localStoredProps.push({
                    id: pId,
                    name: p.name,
                    type: p.type || "Commercial Office",
                    location: p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : (p.location || p.address || "Commercial Location"),
                    area: p.totalArea ? Number(p.totalArea).toLocaleString() : (p.area || "25,000"),
                    occupied: p.activeLeasesCount || 0,
                    vacant: Math.max(0, (Number(p.totalArea) || 0) - (Number(p.occupiedArea) || 0)),
                    occPct: p.occupancyPct || 0,
                    grade: p.grade || "A",
                    inviteCode: p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                    ownerName: p.ownerName || p.owner_name || p.ownerCompany || (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) || "Commercial Property Owner",
                    isFullyRegistered: Boolean(p.isFullyRegistered),
                    isDetailsPending: p.isDetailsPending !== undefined ? Boolean(p.isDetailsPending) : (!p.isFullyRegistered && (!p.totalArea || p.totalArea === "0" || p.totalArea === 0))
                  });
                  seenIds.add(pId);
                  if (normName) seenNames.add(normName);
                  deduplicatedLocal.push(p);
                }
              }
            });

            // Clean up duplicates from localStorage automatically
            if (deduplicatedLocal.length !== localStored.length) {
              localStorage.setItem("officex_user_properties", JSON.stringify(deduplicatedLocal));
            }
          }
        } catch (e) {}
      }

      try {
        const emailQuery = email ? `?ownerEmail=${encodeURIComponent(email)}` : "";
        const [rrRes, genRes] = await Promise.all([
          fetch(`/api/rent-roll/properties${emailQuery}`),
          fetch(`/api/properties${email ? `?ownerCompany=${encodeURIComponent(email)}&userId=${encodeURIComponent(email)}` : ""}`)
        ]);

        if (rrRes.ok) {
          const data = await rrRes.json();
          if (Array.isArray(data) && data.length > 0) {
            data.filter((p: any) => Boolean(p && (p.id || p.name))).forEach((p: any) => {
              if (!seenIds.has(p.id)) {
                const codeNum = (p.id || String(Date.now())).replace(/\D/g, "").slice(-4) || "8841";
                loadedProps.push({
                  id: p.id,
                  name: p.name,
                  type: p.type || "Commercial Office",
                  location: p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : (p.location || p.address || "Commercial Location"),
                  area: p.totalArea ? Number(p.totalArea).toLocaleString() : "0",
                  occupied: p.activeLeasesCount || 0,
                  vacant: Math.max(0, (Number(p.totalArea) || 0) - (Number(p.occupiedArea) || 0)),
                  occPct: p.occupancyPct || 0,
                  grade: p.grade || "A",
                  inviteCode: p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                  ownerName: p.ownerName || p.owner_name || p.ownerCompany || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
                });
                seenIds.add(p.id);
              }
            });
          }
        }

        if (genRes.ok) {
          const genData = await genRes.json();
          if (Array.isArray(genData)) {
            genData.forEach((p: any) => {
              if (p && p.id && !seenIds.has(p.id)) {
                const codeNum = String(p.id).replace(/\D/g, "").slice(-4) || "8841";
                loadedProps.push({
                  id: p.id,
                  name: p.name,
                  type: p.type || "Commercial Office",
                  location: p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : (p.location || p.address || "Commercial Location"),
                  area: p.total_area || p.totalArea ? Number(p.total_area || p.totalArea).toLocaleString() : "0",
                  occupied: p.active_leases_count || p.activeLeasesCount || 0,
                  vacant: Math.max(0, (Number(p.total_area || p.totalArea) || 0) - (Number(p.occupied_area || p.occupiedArea) || 0)),
                  occPct: p.occupancy_pct || p.occupancyPct || 0,
                  grade: p.grade || "A",
                  inviteCode: p.invite_code || p.inviteCode || `OX-${codeNum.padStart(4, "7")}`,
                  ownerName: p.owner_name || p.ownerName || p.owner_company || p.ownerCompany || "Commercial Property Owner"
                });
                seenIds.add(p.id);
              }
            });
          }
        }
      } catch (e) {
        console.warn("API properties fetch error, falling back to local:", e);
      }

      const combined = [...localStoredProps, ...loadedProps];
      setProperties(combined);
      if (combined.length > 0) {
        setSelectedPropId(combined[0].id);
      } else {
        setSelectedPropId(null);
      }
      setIsLoading(false);
    }

    loadProperties();

    const handlePropertyAdded = () => {
      loadProperties();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("officex-property-added", handlePropertyAdded);
      window.addEventListener("storage", handlePropertyAdded);
      return () => {
        window.removeEventListener("officex-property-added", handlePropertyAdded);
        window.removeEventListener("storage", handlePropertyAdded);
      };
    }
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
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-teal-200 hover:border-teal-300 bg-teal-50/70 hover:bg-teal-100/60 text-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Bulk upload multiple properties, units, and tenant rosters from Excel/CSV"
            >
              <UploadCloud size={14} className="text-[#0F8B7D]" />
              <span>Bulk Import Portfolio</span>
            </button>
            <Link
              href="/properties/add"
              className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Property
            </Link>
          </div>
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
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
              <Link
                href="/properties/add"
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={14} /> Register Commercial Asset
              </Link>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-teal-200 hover:border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UploadCloud size={14} className="text-[#0F8B7D]" /> Bulk Import Portfolio (Excel / CSV)
              </button>
            </div>
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
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setEditingModalProp(p)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50 text-slate-600 hover:text-[#0F8B7D] transition-colors cursor-pointer"
                            title="Edit Property Details"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(p.id, p.name)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Property from Registry"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInviteModalProp(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white text-xs font-bold transition-all shadow-2xs"
                            title="Generate invitation link & building code for tenants"
                          >
                            <Share2 size={12} /> Invite
                          </button>
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

      {/* Side Details Drawer with Backdrop & Premium Slide-In */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSelectedPropId(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Content Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 text-[#0F8B7D] flex items-center justify-center font-black text-sm shadow-2xs">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 leading-tight">{selectedProp.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-mono font-bold border border-teal-200/80">
                          <KeyRound size={10} className="text-[#0F8B7D]" /> {selectedProp.inviteCode || "OX-8841"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Grade {selectedProp.grade} Commercial
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingModalProp(selectedProp)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 text-slate-600 hover:text-[#0F8B7D] transition-colors cursor-pointer"
                      title="Edit Property Details"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProperty(selectedProp.id, selectedProp.name)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Property"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPropId(null)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-5 flex-1">
                {/* 1. Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Leasable</span>
                    <strong className="text-sm font-mono font-black text-slate-900 block">
                      {(() => {
                        const raw = String(selectedProp.area || "").replace(/[^0-9]/g, "");
                        const num = Number(raw);
                        return (num && !isNaN(num) && num > 0) ? num.toLocaleString("en-IN") : "25,000";
                      })()} sq ft
                    </strong>
                    <span className="text-[10px] text-slate-500 font-medium">Super Built-up Area</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Occupancy Rate</span>
                    <strong className="text-sm font-mono font-black text-[#0F8B7D] block">{selectedProp.occPct}%</strong>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-[#0F8B7D] h-1.5 rounded-full" style={{ width: `${selectedProp.occPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Complete Property Registration Callout if form details pending */}
                {selectedProp.isDetailsPending && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Sparkles size={15} className="text-amber-600" />
                      <span>Property Registration Details Pending</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You initialized <strong className="font-extrabold">{selectedProp.name}</strong> from onboarding. Complete the detailed property setup form to configure units, floor plans, and contracts.
                    </p>
                    <Link
                      href={`/properties/add?propertyId=${selectedProp.id}&name=${encodeURIComponent(selectedProp.name)}`}
                      className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-black shadow-2xs text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Complete Add Property Form</span>
                    </Link>
                  </div>
                )}

                {/* 2. Building Details Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    Property Specifications
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-slate-400" /> Location
                      </span>
                      <span className="font-bold text-slate-900 text-right">{selectedProp.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Building size={13} className="text-slate-400" /> Property Type
                      </span>
                      <span className="font-bold text-slate-800 uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100">
                        {selectedProp.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Users size={13} className="text-slate-400" /> Active Leases
                      </span>
                      <span className="font-bold text-slate-900">{(selectedProp.activeLeases ?? selectedProp.occupied) || 0} Contracted</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={13} className="text-slate-400" /> Asset Status
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Operational (Active)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Instant Tenant Onboarding Callout */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold">
                    <Share2 size={14} className="text-[#0F8B7D]" />
                    <span>Tenant Workplace Invitation</span>
                  </div>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    Share your official building code (<strong className="font-mono">{selectedProp.inviteCode || "OX-8841"}</strong>) or direct WhatsApp invitation link so tenants can connect their dashboard.
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingModalProp(selectedProp)}
                    className="py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Pencil size={13} className="text-[#0F8B7D]" />
                    <span>Edit Property</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProperty(selectedProp.id, selectedProp.name)}
                    className="py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Property</span>
                  </button>
                </div>

                {selectedProp.isDetailsPending && (
                  <Link
                    href={`/properties/add?propertyId=${selectedProp.id}&name=${encodeURIComponent(selectedProp.name)}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-teal-700 hover:from-amber-700 hover:to-teal-800 text-white text-xs font-black shadow-md text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Complete Add Property Form</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setInviteModalProp(selectedProp)}
                  className="w-full py-3 rounded-xl bg-white hover:bg-teal-50 text-[#0F8B7D] border border-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                >
                  <Share2 size={14} /> Invite Tenants &amp; Share Link
                </button>

                <Link
                  href={`/properties/rent-roll?propertyId=${selectedProp.id}`}
                  className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-black shadow-md shadow-teal-900/10 text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Open Stacking Plan &amp; Rent Roll</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
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

      {/* Bulk Import Portfolio & Tenant Modal */}
      {isImportModalOpen && (
        <ImportRentRollModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setIsImportModalOpen(false);
            window.location.reload();
          }}
          properties={properties.map((p) => ({ id: p.id, name: p.name, city: p.location || "Commercial" }))}
        />
      )}

      {/* Edit Property Modal Popup */}
      {editingModalProp && (
        <EditPropertyModal
          isOpen={Boolean(editingModalProp)}
          onClose={() => setEditingModalProp(null)}
          property={editingModalProp}
          onSuccess={(updatedRecord) => {
            setProperties((prev) =>
              prev.map((p) =>
                p.id === updatedRecord.id
                  ? {
                      ...p,
                      name: updatedRecord.name,
                      type: updatedRecord.type || p.type,
                      location: updatedRecord.location || p.location,
                      area: updatedRecord.area || p.area,
                      grade: updatedRecord.grade || p.grade,
                      isFullyRegistered: true,
                      isDetailsPending: false
                    }
                  : p
              )
            );
            setEditingModalProp(null);
          }}
        />
      )}

      {/* Complete Your Primary Property Registry Popup Modal */}
      {showPrimaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center font-black">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">Complete Primary Property Registry</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      Step 1 of Setup
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your primary property from onboarding has been added to the master catalog.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrimaryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {properties[0]?.name || (typeof window !== "undefined" ? localStorage.getItem("officex_property_name") : "") || "Primary Commercial Asset"}
                </h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Primary Asset Registered
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Location: <strong>{properties[0]?.location || "Commercial Location"}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Now complete the full registry form to add floor plans, unit allocations, tenant agreements, and contract terms.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPrimaryModal(false)}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                View Catalog First
              </button>
              <Link
                href="/properties/add"
                onClick={() => setShowPrimaryModal(false)}
                className="px-6 py-2.5 bg-[#0F8B7D] hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={15} />
                <span>Complete Detailed Property Form</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyMasterRegistry() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500 font-bold">Loading Property Registry...</div>}>
      <PropertyRegistryContent />
    </Suspense>
  );
}
