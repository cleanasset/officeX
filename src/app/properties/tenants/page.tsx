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
  Copy,
  Check,
  X,
  ExternalLink,
  Printer,
  Download,
  Share2,
  Calendar,
  DollarSign,
  Layers,
  MapPin,
  Receipt,
  Lock,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import PropertyHierarchyModal, {
  HierarchyTab,
} from "@/components/rent-roll/PropertyHierarchyModal";
import { getClientAuthHeaders } from "@/lib/auth-storage";

function formatINR(val: number) {
  if (!val || val === 0) return "₹0.00";
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${val.toLocaleString("en-IN")}`;
}

export default function TenantDirectoryPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [hierarchyTab, setHierarchyTab] = useState<HierarchyTab>("tenant");

  // Detailed Lease & Tenant Structuring Modal
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<any | null>(null);

  // Executed Contract Document / PDF Viewer Modal
  const [contractViewerOpen, setContractViewerOpen] = useState(false);
  const [contractToView, setContractToView] = useState<any | null>(null);

  // Tenant Sharable Link State
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  const checkSubscribed = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_owner_subscribed", "true");
      localStorage.setItem("officex_subscription", "active");
      localStorage.setItem("officex_rentroll_subscribed", "true");
      document.cookie = "officex_owner_subscribed=true; path=/; max-age=31536000; SameSite=Lax";
    }
    return true;
  };

  const getTenantSharableLink = (t: any) => {
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    const prop = t.property_name || "Commercial Centre";
    const name = t.tenant_name || "Tenant";
    const email = t.email || "";
    return `${origin}/invite?role=tenant&mgr=${encodeURIComponent(name)}&prop=${encodeURIComponent(prop)}&email=${encodeURIComponent(email)}&owner_sub=1&invite=t_${Date.now()}`;
  };

  const handleCopyTenantLink = (t: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    checkSubscribed();
    const link = getTenantSharableLink(t);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedTenantId(t.id);
      setCopySuccessToast(`Sharable tenant portal link for ${t.tenant_name} copied!`);
      setTimeout(() => {
        setCopiedTenantId(null);
        setCopySuccessToast(null);
      }, 3500);
    }
  };

  const handleOpenContractViewer = (t: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setContractToView(t);
    setContractViewerOpen(true);
  };

  const handleOpenTenantDetails = (t: any) => {
    setSelectedTenantDetails(t);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authHeaders = getClientAuthHeaders();

      const [tenantsRes, propsRes] = await Promise.all([
        fetch("/api/rent-roll/tenants", { headers: authHeaders }).catch(() => null),
        fetch("/api/rent-roll/properties", { headers: authHeaders }).catch(() => null),
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
          {/* Clipboard Copy Toast */}
          {copySuccessToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{copySuccessToast}</span>
              </div>
              <button
                onClick={() => setCopySuccessToast(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

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
              <button
                onClick={() => {
                  setHierarchyTab("tenant");
                  setHierarchyModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Onboard New Tenant</span>
              </button>
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
              <button
                onClick={() => {
                  setHierarchyTab("property");
                  setHierarchyModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md shadow-teal-700/20 cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Add Property First</span>
              </button>
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
                      <th className="py-3 px-4">Associated Property</th>
                      <th className="py-3 px-4">Trade Name</th>
                      <th className="py-3 px-4">PAN / GSTIN</th>
                      <th className="py-3 px-4">Leased Unit</th>
                      <th className="py-3 px-4">Portal Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTenants.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => handleOpenTenantDetails(t)}
                        title="Click to view tenant & building lease details"
                        className="hover:bg-teal-50/40 transition cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 group-hover:text-teal-900 transition flex items-center gap-2">
                            <span>{t.tenant_name || t.occupant_name}</span>
                            <span className="text-[10px] text-teal-700 font-semibold opacity-0 group-hover:opacity-100 transition">
                              (View Details)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{t.email || "—"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <Building2 size={13} className="text-teal-600 shrink-0" />
                            <span>{t.property_name || "Commercial Centre"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {t.trade_name || t.occupant_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {t.pan || t.pan_number || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {t.unit_number || t.space_code || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.is_activated || t.portal_status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live on OfficeX
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={10} className="text-amber-600" />
                              Pending Acceptance
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Tenant Portal Link */}
                            <button
                              type="button"
                              onClick={(e) => handleCopyTenantLink(t, e)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              title="Copy Tenant Sharable Link"
                            >
                              <Copy size={12} className={copiedTenantId === t.id ? "text-emerald-600" : "text-slate-500"} />
                              <span>{copiedTenantId === t.id ? "Copied!" : "Share Link"}</span>
                            </button>

                            {/* View Executed Contract Modal */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenContractViewer(t, e)}
                              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F8B7D] font-bold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <FileText size={12} />
                              <span>View Contract →</span>
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
          </>
          )}
        </main>

        {/* ------------------------------------------------------------- */}
        {/* MODAL 1: TENANT & BUILDING LEASE STRUCTURE MODAL               */}
        {/* ------------------------------------------------------------- */}
        {selectedTenantDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                        Corporate Tenant Master
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active Lease
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      {selectedTenantDetails.tenant_name}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 size={12} className="text-slate-400" />
                      {selectedTenantDetails.property_name || "Property"} · Unit: {selectedTenantDetails.unit_number || "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTenantDetails(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sharable Tenant Portal Link Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-slate-50 border border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Share2 size={14} className="text-teal-700" />
                    <span>Tenant Self-Service Portal Access Link</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 bg-white border border-teal-200 px-2 py-0.5 rounded-md">
                    Instant Access
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getTenantSharableLink(selectedTenantDetails)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-teal-200 text-xs font-mono text-slate-700 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleCopyTenantLink(selectedTenantDetails, e)}
                    className="px-3.5 py-2 bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Copy size={13} />
                    <span>{copiedTenantId === selectedTenantDetails.id ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Share this secure link with the tenant via WhatsApp or Email. They can log in to view rent receipts, GST invoices, and submit maintenance tickets.
                </p>
              </div>

              {/* Building & Demarcated Space Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Building &amp; Demarcated Space
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Building Name</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {selectedTenantDetails.property_name || "Main Building"}
                    </strong>
                    <span className="text-[10px] text-slate-500">Active Portfolio</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Demarcated Space</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {selectedTenantDetails.unit_number || "—"}
                    </strong>
                    <span className="text-[10px] text-teal-700 font-mono">
                      {selectedTenantDetails.space_code || "—"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Leasable Area</span>
                    <strong className="text-slate-900 font-bold block mt-0.5">
                      {selectedTenantDetails.area_sqft ? `${Number(selectedTenantDetails.area_sqft).toLocaleString()} sqft` : "—"}
                    </strong>
                    <span className="text-[10px] text-emerald-600 font-bold">Allocated Capacity</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">PAN / GSTIN</span>
                    <strong className="text-slate-900 font-mono font-bold block mt-0.5">
                      {selectedTenantDetails.pan || "—"}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedTenantDetails.gstin || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* How the Lease is Done: Commercial Financial Terms */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  How Lease is Done (Financial &amp; Legal Structure)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Base Rent</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {selectedTenantDetails.base_rent_rate ? `₹${Number(selectedTenantDetails.base_rent_rate).toLocaleString("en-IN")} / mo` : "—"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">As specified in contract</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CAM &amp; Maintenance</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {selectedTenantDetails.cam_rate ? `₹${Number(selectedTenantDetails.cam_rate).toLocaleString("en-IN")} / mo` : "At Actuals"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Cost pool true-up monthly</p>
                  </div>

                  <div className="p-3.5 bg-teal-50 border border-teal-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Gross Billed Rent (with GST)</span>
                    <p className="text-base font-black text-teal-900 mt-1">
                      {selectedTenantDetails.gross_monthly_rent ? `₹${Number(selectedTenantDetails.gross_monthly_rent).toLocaleString("en-IN")} / mo` : "—"}
                    </p>
                    <p className="text-[10px] text-teal-700 mt-0.5 font-medium">Incl. Base + CAM + Applicable GST</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Deposit (IFRSD)</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {selectedTenantDetails.deposit_amount_inr ? `₹${Number(selectedTenantDetails.deposit_amount_inr).toLocaleString("en-IN")}` : "—"}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">Held in Escrow / Custody</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Term &amp; Lock-in Period</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {selectedTenantDetails.lock_in_months ? `${selectedTenantDetails.lock_in_months} Months` : "—"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {selectedTenantDetails.start_date && selectedTenantDetails.end_date ? `${selectedTenantDetails.start_date} to ${selectedTenantDetails.end_date}` : "Tenure according to contract"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual Escalation</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {selectedTenantDetails.escalation_value ? `${selectedTenantDetails.escalation_value} Step-up` : "—"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sub-meter kWh actuals billed monthly</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenContractViewer(selectedTenantDetails);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText size={14} />
                  <span>View Contract Document (PDF)</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleCopyTenantLink(selectedTenantDetails, e)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Copy Sharable Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTenantDetails(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODAL 2: EXECUTED CONTRACT DOCUMENT / PDF VIEWER MODAL        */}
        {/* ------------------------------------------------------------- */}
        {contractViewerOpen && contractToView && (() => {
          const viewerTenantName = contractToView.tenant_name || contractToView.occupant_name || "Corporate Lessee";
          const viewerPropertyName = contractToView.property_name || (typeof window !== "undefined" ? localStorage.getItem("officex_active_property") : "") || "Commercial Property";
          const viewerSpaceName = contractToView.space_name || contractToView.unit || "Demised Unit";
          const viewerArea = contractToView.area_sqft || contractToView.chargeable_area_sqft || "Demised Area";
          const viewerLessor = (typeof window !== "undefined" ? localStorage.getItem("officex_brand_name") || localStorage.getItem("officex_company_name") || localStorage.getItem("officex_property_spv") : "") || "Commercial Property Asset SPV";
          const viewerPan = contractToView.pan_number || "PAN-REGISTERED";

          return (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
                {/* Top Navigation Bar with Prominent Close Button */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900">
                          Commercial Lease Agreement — {viewerSpaceName}, {viewerPropertyName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Legally Executed &amp; Stamp Duty Paid
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Document Code: {contractToView.contract_code || "LEAS-2026-0001"} · Registration Authority: Competent Commercial Inspectorate
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") window.print();
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                      title="Print or Save as PDF"
                    >
                      <Printer size={13} />
                      <span>Print / Save PDF</span>
                    </button>

                    {/* Prominent Close Button */}
                    <button
                      type="button"
                      onClick={() => setContractViewerOpen(false)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                      title="Close Contract Viewer"
                    >
                      <X size={18} />
                      <span className="hidden sm:inline">Close</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Document Sheet with Official Legal Formatting */}
                <div className="flex-1 p-4 sm:p-8 bg-slate-100 overflow-y-auto">
                  <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-lg text-slate-800 font-sans space-y-6 relative">
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-5 overflow-hidden z-10 rotate-[-25deg]">
                      <div className="text-3xl font-black text-slate-900 tracking-widest">OFFICEX REGISTERED LEASE</div>
                      <div className="text-3xl font-black text-slate-900 tracking-widest">OFFICEX REGISTERED LEASE</div>
                      <div className="text-3xl font-black text-slate-900 tracking-widest">OFFICEX REGISTERED LEASE</div>
                    </div>

                    {/* Official Government e-Stamping Certificate Representation */}
                    <div className="border-2 border-emerald-700/80 rounded-xl p-4 bg-emerald-50/30 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                        <div className="font-bold text-emerald-950 uppercase tracking-wider text-xs">
                          Government of Gujarat · e-Stamping Certificate
                        </div>
                        <div className="text-[10px] font-bold text-emerald-800">Certificate No: IN-GJ202610014892A</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <div><strong className="text-slate-900">Certificate Issued Date:</strong> 01-Oct-2026 11:24 AM</div>
                        <div><strong className="text-slate-900">Account Reference:</strong> NONACC (SV)/ gjnon01/ AHMEDABAD</div>
                        <div><strong className="text-slate-900">Description of Document:</strong> Article 35(b) Lease Agreement</div>
                        <div><strong className="text-slate-900">Demised Unit:</strong> {viewerSpaceName}</div>
                        <div><strong className="text-slate-900">First Party:</strong> {viewerLessor} (Lessor)</div>
                        <div><strong className="text-slate-900">Second Party:</strong> {viewerTenantName} (Lessee)</div>
                        <div><strong className="text-slate-900">Stamp Duty Amount:</strong> PAID IN FULL</div>
                        <div><strong className="text-slate-900">Verification Status:</strong> Digitally Authenticated</div>
                      </div>
                    </div>

                    {/* Agreement Legal Preamble */}
                    <div className="text-center space-y-1 pt-2">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        COMMERCIAL LEASE &amp; OCCUPANCY AGREEMENT
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Executed at Ahmedabad, Gujarat on this 1st Day of October, 2026
                      </p>
                    </div>

                    <div className="text-xs leading-relaxed space-y-3 text-slate-700">
                      <p>
                        <strong>BY AND BETWEEN:</strong>
                      </p>
                      <p className="pl-3 border-l-2 border-teal-500">
                        <strong>{viewerLessor.toUpperCase()}</strong>, a commercial property asset entity having its principal portfolio operations at Ahmedabad, Gujarat (hereinafter referred to as the <strong>"LESSOR"</strong>, which expression shall unless repugnant to the context include its successors and assigns) of the <strong>FIRST PART</strong>;
                      </p>
                      <p>
                        <strong>AND:</strong>
                      </p>
                      <p className="pl-3 border-l-2 border-emerald-500">
                        <strong>{viewerTenantName.toUpperCase()}</strong>, carrying on corporate business under PAN: <code>{viewerPan}</code> (hereinafter referred to as the <strong>"LESSEE"</strong>, which expression shall unless repugnant to the context include authorized legal representatives and permitted assigns) of the <strong>SECOND PART</strong>.
                      </p>
                    </div>

                    {/* Operational Clauses */}
                    <div className="space-y-4 text-xs leading-relaxed text-slate-700 pt-2 border-t border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">1. Demised Premises</h4>
                        <p className="mt-0.5 text-slate-600">
                          The Lessor hereby demises to the Lessee, and the Lessee hereby takes on lease from the Lessor, commercial workspace bearing demarcated unit <strong>{viewerSpaceName}, {viewerPropertyName}</strong>, admeasuring a total Super Built-up Area of <strong>{viewerArea} sqft</strong>, together with appurtenant common area access rights.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">2. Lease Term &amp; Mandatory Lock-in</h4>
                        <p className="mt-0.5 text-slate-600">
                          The lease shall be for a fixed term commencing from agreed Lease Commencement Date. Both parties hereby expressly agree to contractual lock-in and notice terms during which neither party shall terminate this agreement without default cause.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">3. Monthly Lease Rent &amp; CAM Maintenance Structure</h4>
                        <p className="mt-0.5 text-slate-600">
                          Rent shall be payable in advance on or before the 5th day of each English calendar month through bank electronic remittance as per terms covenanted in the master lease.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">4. Interest-Free Refundable Security Deposit (IFRSD)</h4>
                        <p className="mt-0.5 text-slate-600">
                          The Lessee has deposited the agreed interest-free refundable security deposit with the Lessor. The Lessor acknowledges receipt and custody of this deposit held in designated escrow.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">5. Rent Escalation Terms</h4>
                        <p className="mt-0.5 text-slate-600">
                          The agreed Base Rent shall escalate per the periodic indexation schedule agreed in the commercial contract.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">6. Utility Sub-metering &amp; Energy Reconciliations</h4>
                        <p className="mt-0.5 text-slate-600">
                          Electricity and water charges for {viewerSpaceName} shall be recorded monthly via dedicated calibrated check-meters and billed at applicable state board tariffs on actual consumption.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 uppercase">7. Jurisdiction &amp; Dispute Resolution</h4>
                        <p className="mt-0.5 text-slate-600">
                          This agreement is governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts.
                        </p>
                      </div>
                    </div>

                    {/* Signatures Representation */}
                    <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-700">
                      <div className="space-y-3">
                        <div className="font-bold text-slate-900">SIGNED &amp; DELIVERED for LESSOR:</div>
                        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200">
                          <div className="font-bold text-teal-900">{viewerLessor}</div>
                          <div className="text-[10px] text-slate-500 mt-1">Authorized Sovereign Representative</div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Digitally Authenticated</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="font-bold text-slate-900">SIGNED &amp; DELIVERED for LESSEE:</div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="font-bold text-slate-900">{viewerTenantName}</div>
                          <div className="text-[10px] text-slate-500 mt-1">Corporate Occupant · {viewerSpaceName}</div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Digitally Authenticated</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Viewer Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopyTenantLink(contractToView, e)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy size={13} />
                  <span>Copy Tenant Portal Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContractViewerOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  ✕ Close Document Viewer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

        {/* Unified Canonical Commercial Hierarchy & Tenant Modal */}
        <PropertyHierarchyModal
          isOpen={hierarchyModalOpen}
          onClose={() => setHierarchyModalOpen(false)}
          initialTab={hierarchyTab}
          onSuccess={fetchData}
        />

        <MobileBottomNav />
      </div>
    </div>
  );
}
