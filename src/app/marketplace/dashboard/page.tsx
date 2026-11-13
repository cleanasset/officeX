"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Building,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  X,
  Check,
  FileText,
  Image as ImageIcon
} from "lucide-react";

export default function MarketplaceOwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"listings" | "enquiries" | "visits" | "pipeline">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Moderation & Batch Resubmission state
  const [resubmittingListing, setResubmittingListing] = useState<any | null>(null);
  const [resubmitPhotos, setResubmitPhotos] = useState<string[]>([]);
  const [resubmitRemarks, setResubmitRemarks] = useState<string>("");
  const [resubmitLoading, setResubmitLoading] = useState<boolean>(false);
  const [previewListing, setPreviewListing] = useState<any | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }

  const toggleListingStatus = async (item: any) => {
    const targetStatus = item.status === "active" ? "paused" : "active";
    setUpdatingId(item.id || item.slug);
    try {
      const res = await fetch(`/api/marketplace/listings/${item.slug || item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, status: targetStatus } : l))
        );
        showToast(`Listing status updated to ${targetStatus}`);
      }
    } catch (err) {
      console.error("Failed to toggle listing status:", err);
      showToast("Failed to toggle status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) {
          setResubmitPhotos((prev) => [...prev, res]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setResubmitPhotos((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput("");
  };

  const handleRemovePhoto = (idx: number) => {
    setResubmitPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleHostResubmit = async () => {
    if (!resubmittingListing) return;
    setResubmitLoading(true);
    try {
      const currentBatch = Number(resubmittingListing.pricingPlans?.moderation?.batchVersion) || 1;
      const nextBatch = currentBatch + 1;

      const res = await fetch(`/api/marketplace/listings/${resubmittingListing.slug || resubmittingListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resubmit",
          status: "resubmitted",
          images: resubmitPhotos.length > 0 ? resubmitPhotos : resubmittingListing.images,
          hostRemarks: resubmitRemarks || `Batch v${nextBatch} with updated files uploaded by host`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Batch v${nextBatch} resubmitted! Admin has been notified for re-audit.`);
        setListings((prev) =>
          prev.map((l) => (l.id === resubmittingListing.id ? (data.listing || { ...l, status: "resubmitted" }) : l))
        );
        setResubmittingListing(null);
        setResubmitPhotos([]);
        setResubmitRemarks("");
      } else {
        showToast(data.error || "Failed to resubmit batch", "error");
      }
    } catch {
      showToast("Network error resubmitting batch", "error");
    } finally {
      setResubmitLoading(false);
    }
  };

  async function loadData() {
    setLoading(true);
    try {
      const [listRes, enqRes] = await Promise.all([
        fetch("/api/marketplace/listings?status=all&limit=50"),
        fetch("/api/marketplace/enquiries")
      ]);

      if (listRes.ok) {
        const lData = await listRes.json();
        setListings(lData.listings || []);
      }

      if (enqRes.ok) {
        const eData = await enqRes.json();
        setEnquiries(eData.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to load marketplace dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="flex items-center gap-2 font-black text-base text-white tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-[#0F8B7D] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              OX
            </span>
            <span>OFFICEX <span className="text-teal-400 font-medium text-xs">Marketplace</span></span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold">
            Partner Operator Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operate/rent-roll"
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span>Switch to Rent Roll SaaS</span>
            <ArrowRight size={13} className="text-teal-400" />
          </Link>

          <Link
            href="/marketplace/list-space"
            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={14} />
            <span>List Space</span>
          </Link>
        </div>
      </header>

      {/* Critical Role Separation Notice Banner */}
      <div className="bg-teal-900/40 border-b border-teal-500/20 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-teal-200">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-teal-400 shrink-0" />
          <span>
            <b>Marketplace Lister Dashboard:</b> You are managing space discovery, inbound inquiries, and site visits for your listed centers.
          </span>
        </div>
        <Link
          href="/operate/rent-roll"
          className="underline font-bold text-teal-300 hover:text-white shrink-0 ml-2"
        >
          Manage Lease Contracts &amp; Collections in Rent Roll →
        </Link>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Moderation Alert Banners for Operator */}
        {listings.some((l) => l.status === "changes_requested") && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-950">Action Required: Document Revisions Requested</h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  OfficeX Admin has requested legal compliance documents, Fire NOC, or updated photos for your listing. Please update and resubmit.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const target = listings.find((l) => l.status === "changes_requested");
                if (target) {
                  setResubmittingListing(target);
                  setResubmitPhotos(target.images || []);
                  setResubmitRemarks("");
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition"
            >
              <UploadCloud size={14} />
              <span>Update Documents &amp; Resubmit</span>
            </button>
          </div>
        )}

        {listings.some((l) => l.status === "pending_review" || l.status === "pending" || l.status === "resubmitted") && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-amber-600 shrink-0" />
              <span>
                <b>Verification In Queue:</b> Spaces marked "Pending Verification" are undergoing compliance and photo review. Public discovery will activate automatically upon Admin approval.
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
              Admin Review: 2-4 Business Hours
            </span>
          </div>
        )}

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Active Public Listings</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Building2 size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {listings.filter((l) => l.status === "active").length}
            </p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> Live on Marketplace
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Under Admin Audit</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {listings.filter((l) => l.status === "pending_review" || l.status === "pending" || l.status === "resubmitted").length}
            </p>
            <span className="text-[11px] text-amber-700 font-medium">Pending verification</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Revisions Requested</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {listings.filter((l) => l.status === "changes_requested").length}
            </p>
            <span className="text-[11px] text-rose-600 font-bold">Action required</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Inbound Seeker Leads</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{enquiries.length > 0 ? enquiries.length : 8}</p>
            <span className="text-[11px] text-slate-500 font-medium">Corporate inquiries</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold">
          {[
            { id: "listings", label: `My Listings (${listings.length})`, icon: Building2 },
            { id: "enquiries", label: `Inbound Inquiries (${enquiries.length})`, icon: Users },
            { id: "visits", label: "Site Visit Schedule", icon: Calendar },
            { id: "pipeline", label: "Deals Pipeline Kanban", icon: TrendingUp }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0F8B7D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: My Listings */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => {
                const mod = item.pricingPlans?.moderation;
                const batchVer = Number(mod?.batchVersion) || 1;
                const isPending = item.status === "pending_review" || item.status === "pending";
                const isResubmitted = item.status === "resubmitted";
                const isChangesReq = item.status === "changes_requested";
                const isActive = item.status === "active";

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header with dynamic badges */}
                      <div className="h-44 relative bg-slate-900">
                        <img
                          src={item.featuredImage || (item.images && item.images[0]) || "/images/workspace_managed_suite.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => toggleListingStatus(item)}
                              disabled={updatingId === (item.id || item.slug)}
                              className="px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Click to toggle status"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>LIVE (ACTIVE)</span>
                            </button>
                          )}

                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs bg-amber-500 text-white flex items-center gap-1">
                              <Clock size={11} />
                              <span>PENDING AUDIT (Batch v{batchVer})</span>
                            </span>
                          )}

                          {isResubmitted && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs bg-blue-600 text-white flex items-center gap-1">
                              <RefreshCw size={11} className="animate-spin" />
                              <span>RESUBMITTED (Batch v{batchVer})</span>
                            </span>
                          )}

                          {isChangesReq && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs bg-rose-600 text-white flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>REVISION REQUIRED</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-md capitalize">
                            {item.vertical?.replace("_", " ") || "Coworking"}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="text-sm font-black truncate">{item.name}</h4>
                          <p className="text-[11px] text-gray-200 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-teal-400 shrink-0" /> {item.locality || item.city}, {item.city}
                          </p>
                        </div>
                      </div>

                      {/* Card Content based on Status */}
                      {/* CASE A: PENDING / RESUBMITTED (Hide active stats, show verification queue) */}
                      {(isPending || isResubmitted) && (
                        <div className="p-4 space-y-3 text-xs">
                          <div className={`p-3 rounded-xl border ${isResubmitted ? "bg-blue-50/70 border-blue-200" : "bg-amber-50/70 border-amber-200"}`}>
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              {isResubmitted ? (
                                <>
                                  <RefreshCw size={13} className="text-blue-600 animate-spin" />
                                  <span className="text-blue-900 font-extrabold">Batch v{batchVer} In Re-Audit</span>
                                </>
                              ) : (
                                <>
                                  <Clock size={13} className="text-amber-600" />
                                  <span className="text-amber-900 font-extrabold">Admin Approval Pending</span>
                                </>
                              )}
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isResubmitted ? "text-blue-800" : "text-amber-800"}`}>
                              {isResubmitted
                                ? "Your updated documents & replacement photos have been received by the Admin Console. Live marketplace search will activate upon approval."
                                : "Space submitted for quality check. Public discovery & bookings remain held until Admin verifies fire compliance, specifications, and media."}
                            </p>
                          </div>

                          <div className="flex justify-between text-slate-500 pt-1">
                            <span>Target Rate:</span>
                            <span className="font-bold text-slate-800">₹{Number(item.startingPrice || 8500).toLocaleString("en-IN")}/mo</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Capacity:</span>
                            <span className="font-bold text-slate-800">{item.totalSeats ? `${item.totalSeats} Workstations` : "Flexible"}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Compliance Status:</span>
                            <span className="font-bold text-amber-600">Under Admin Verification</span>
                          </div>
                        </div>
                      )}

                      {/* CASE B: CHANGES REQUESTED (Show Admin remarks & requested docs with direct resubmit CTA) */}
                      {isChangesReq && (
                        <div className="p-4 space-y-3 text-xs">
                          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between text-rose-900 font-black">
                              <span className="flex items-center gap-1.5">
                                <AlertTriangle size={14} className="text-rose-600" />
                                <span>Admin Revert Remarks:</span>
                              </span>
                              <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                                Action Needed
                              </span>
                            </div>

                            <p className="text-xs text-rose-800 bg-white p-2.5 rounded-lg border border-rose-100 font-medium italic">
                              "{mod?.adminRemarks || "Please upload Fire Safety NOC, layout blueprints, or updated photos."}"
                            </p>

                            {Array.isArray(mod?.requestedDocs) && mod.requestedDocs.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-rose-700 uppercase block mb-1">
                                  Requested Documents:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {mod.requestedDocs.map((d: string, di: number) => (
                                    <span key={di} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                                      • {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setResubmittingListing(item);
                                setResubmitPhotos(item.images || []);
                                setResubmitRemarks("");
                              }}
                              className="w-full mt-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <UploadCloud size={14} />
                              <span>Update Documents &amp; Resubmit Batch</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CASE C: ACTIVE LISTING (Show live metrics and normal dashboard stats) */}
                      {isActive && (
                        <div className="p-4 space-y-2.5 text-xs">
                          <div className="flex justify-between items-center text-slate-600 border-b border-gray-100 pb-2">
                            <span>Starting Price</span>
                            <span className="font-extrabold text-[#0F8B7D] text-sm">
                              ₹{Math.round(Number(item.startingPrice || 8500)).toLocaleString("en-IN")}/mo
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Capacity:</span>
                            <span className="font-bold text-slate-800">{item.totalSeats ? `${item.totalSeats} Workstations` : "Flexible"}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Photos:</span>
                            <span className="font-bold text-slate-800">{item.images?.length || 1} Images</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer based on status */}
                    <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                      {isActive ? (
                        <>
                          <span className="text-[10px] font-bold text-slate-500">Rating: {item.avgRating || "4.8"} ★</span>
                          <Link
                            href={`/marketplace/${item.slug || item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:underline"
                          >
                            View Live Listing <ArrowUpRight size={13} />
                          </Link>
                        </>
                      ) : isChangesReq ? (
                        <>
                          <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                            <Mail size={12} /> Notice sent to email
                          </span>
                          <button
                            onClick={() => {
                              setResubmittingListing(item);
                              setResubmitPhotos(item.images || []);
                              setResubmitRemarks("");
                            }}
                            className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                          >
                            Resubmit Batch v{batchVer + 1} →
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-amber-500" /> Awaiting Clearance
                          </span>
                          <button
                            onClick={() => setPreviewListing(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          >
                            <span>Preview Details</span>
                            <Eye size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Inbound Inquiries */}
        {activeTab === "enquiries" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Inbound Seeker Inquiries &amp; Leads</h3>
              <span className="text-xs text-slate-500">{enquiries.length} Inquiries Logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 pl-5">Seeker / Company</th>
                    <th className="p-3.5">Center Listing</th>
                    <th className="p-3.5">Requirement</th>
                    <th className="p-3.5">Move-in</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(enquiries.length > 0 ? enquiries : [
                    {
                      id: "enq-1",
                      seekerName: "Rohan Varma",
                      companyName: "FinScale Technologies",
                      seekerEmail: "rohan@finscale.io",
                      seekerPhone: "+91 98450 11223",
                      listingName: "Executive Hub - Connaught Place",
                      seatsRequired: 35,
                      moveInDate: "Immediate",
                      status: "new"
                    },
                    {
                      id: "enq-2",
                      seekerName: "Priya Nair",
                      companyName: "Cognitive AI Labs",
                      seekerEmail: "priya@cognitive.ai",
                      seekerPhone: "+91 97120 44556",
                      listingName: "Apex Workspaces - GolfLinks Tech Park",
                      seatsRequired: 50,
                      moveInDate: "Next Month",
                      status: "visit_scheduled"
                    }
                  ]).map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 pl-5">
                        <p className="font-bold text-slate-900">{lead.companyName || lead.seekerName}</p>
                        <p className="text-[11px] text-slate-500">{lead.seekerName} · {lead.seekerPhone}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{lead.listingName || "Commercial Space"}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{lead.seatsRequired || 20} Seats</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{lead.moveInDate || "Immediate"}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0F8B7D]">
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right space-x-2">
                        <a
                          href={`tel:${lead.seekerPhone}`}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-slate-700 hover:bg-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Phone size={11} /> Call
                        </a>
                        <a
                          href={`mailto:${lead.seekerEmail}`}
                          className="px-2.5 py-1 rounded-lg bg-[#0F8B7D] text-white hover:bg-[#0D7A6E] text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Mail size={11} /> Reply
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Site Visits */}
        {activeTab === "visits" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scheduled Space Tours &amp; Site Visits</h3>
                <p className="text-xs text-slate-500">Corporate client visits booked for your centers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold text-[10px]">Today · 11:30 AM</span>
                  <span className="font-bold text-emerald-700">Confirmed</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">FinScale Technologies (35 Seats)</h4>
                <p className="text-slate-600 flex items-center gap-1"><MapPin size={12} className="text-[#0F8B7D]" /> Executive Suites - 4th Floor</p>
                <p className="text-slate-500 text-[11px]">Visitor: Rohan Varma (+91 98450 11223)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white font-bold text-[10px]">Tomorrow · 03:00 PM</span>
                  <span className="font-bold text-teal-700">Scheduled</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Cognitive AI Labs (50 Seats)</h4>
                <p className="text-slate-600 flex items-center gap-1"><MapPin size={12} className="text-[#0F8B7D]" /> Prime Workspaces - Tower B</p>
                <p className="text-slate-500 text-[11px]">Visitor: Priya Nair (+91 97120 44556)</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pipeline Kanban */}
        {activeTab === "pipeline" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Stage 1 */}
            <div className="bg-slate-100/70 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-slate-700">Inbound Leads</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">3</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-teal-700">Executive Hub CP</span>
                <p className="font-bold text-slate-900">Apex Global Logistics</p>
                <p className="text-slate-500 text-[11px]">25 Seats · ₹2.1L/mo</p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-slate-100/70 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-slate-700">Site Visit</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">2</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-teal-700">Apex GolfLinks</span>
                <p className="font-bold text-slate-900">FinScale Technologies</p>
                <p className="text-slate-500 text-[11px]">35 Seats · Tour Today</p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-slate-100/70 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-slate-700">Negotiation / LOI</span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">1</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-teal-700">Indiranagar Center</span>
                <p className="font-bold text-slate-900">Zeta Robotics</p>
                <p className="text-slate-500 text-[11px]">60 Seats · LOI Drafted</p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-slate-100/70 rounded-2xl p-3 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-slate-700">Closed Won</span>
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">1</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700">Lease Signed</span>
                <p className="font-bold text-slate-900">CloudSync Systems</p>
                <p className="text-slate-500 text-[11px]">40 Seats · Move-in 1st Nov</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Host Document Re-upload & Batch Resubmission Modal */}
      {resubmittingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      Update Files &amp; Resubmit Batch
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Batch v{(Number(resubmittingListing.pricingPlans?.moderation?.batchVersion) || 1) + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {resubmittingListing.name} · {resubmittingListing.city}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setResubmittingListing(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
              {/* Admin Feedback Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-black">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Admin Revert Remarks &amp; Required Documents:</span>
                </div>
                <p className="text-xs text-amber-900 font-medium bg-white p-2.5 rounded-xl border border-amber-200 italic">
                  "{resubmittingListing.pricingPlans?.moderation?.adminRemarks || "Please upload Fire Safety NOC or updated workstation media."}"
                </p>

                {Array.isArray(resubmittingListing.pricingPlans?.moderation?.requestedDocs) &&
                resubmittingListing.pricingPlans.moderation.requestedDocs.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                      Checklist of Requested Items:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resubmittingListing.pricingPlans.moderation.requestedDocs.map((doc: string, di: number) => (
                        <span key={di} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200 flex items-center gap-1">
                          <Check size={11} className="text-amber-700" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo & File Upload Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-teal-600" />
                    <span>Upload Updated Files &amp; Media ({resubmitPhotos.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Replaces previous batch files</span>
                </div>

                {/* Drag and Drop Zone */}
                <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50 hover:bg-teal-50/30 group">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-teal-600 group-hover:scale-105 transition mb-2">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to select updated documents or photos
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, WebP supported (multiple files allowed)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Direct Image URL Paste Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. Cloudinary, Imgur, S3)..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPhotoUrl()}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-teal-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Photos Preview Grid */}
                {resubmitPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {resubmitPhotos.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={`Batch preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={10} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-teal-600 text-white text-[9px] font-bold">
                            Cover Photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Host Remarks to Admin */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                  Remarks for Admin Review Team
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Attached Fire Safety NOC certificate and updated high-res photos as requested."
                  value={resubmitRemarks}
                  onChange={(e) => setResubmitRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-teal-500 bg-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setResubmittingListing(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHostResubmit}
                disabled={resubmitLoading}
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud size={14} />
                <span>
                  {resubmitLoading
                    ? "Submitting..."
                    : `Submit Batch v${(Number(resubmittingListing.pricingPlans?.moderation?.batchVersion) || 1) + 1} to Admin`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Submission Modal for Pending / Resubmitted Listings */}
      {previewListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Listing Submission Preview</h3>
                  <span className="text-[10px] text-amber-600 font-bold">Status: Pending Admin Clearance</span>
                </div>
              </div>
              <button onClick={() => setPreviewListing(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden bg-slate-900 relative">
              <img
                src={previewListing.featuredImage || (previewListing.images && previewListing.images[0]) || "/images/workspace_managed_suite.jpg"}
                alt={previewListing.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                Batch v{previewListing.pricingPlans?.moderation?.batchVersion || 1}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Space Name:</span>
                <span className="font-bold text-slate-900">{previewListing.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">City / Location:</span>
                <span className="font-bold text-slate-900">{previewListing.locality || previewListing.city}, {previewListing.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Starting Price:</span>
                <span className="font-bold text-teal-700">₹{Number(previewListing.startingPrice || 8500).toLocaleString("en-IN")}/mo</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-bold text-slate-900">{previewListing.totalSeats ? `${previewListing.totalSeats} Workstations` : "Flexible"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Photos Uploaded:</span>
                <span className="font-bold text-slate-900">{previewListing.images?.length || 1} Images</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <b>Notice:</b> This space will only become visible to seekers on the public marketplace once the Super Admin approves the submission.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewListing(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn ${
          toast.type === "error" ? "bg-rose-900 border-rose-700" : "bg-slate-900 border-slate-700"
        }`}>
          {toast.type === "error" ? (
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
