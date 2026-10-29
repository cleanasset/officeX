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
  AlertCircle
} from "lucide-react";

export default function MarketplaceOwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"listings" | "enquiries" | "visits" | "pipeline">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [listRes, enqRes] = await Promise.all([
          fetch("/api/marketplace/listings?limit=12"),
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
        {/* KPI Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Active Listings</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center">
                <Building2 size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{listings.length > 0 ? listings.length : 12}</p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> 100% Verified Centers
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Inbound Seeker Leads</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{enquiries.length > 0 ? enquiries.length : 8}</p>
            <span className="text-[11px] text-slate-500 font-medium">From corporate seekers</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Site Visits Scheduled</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">4</p>
            <span className="text-[11px] text-purple-600 font-bold">2 Visits Today</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">Pipeline Deal Value</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign size={15} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">₹48.5L</p>
            <span className="text-[11px] text-slate-500 font-medium">Estimated 12-mo TCV</span>
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
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative bg-slate-900">
                      <img
                        src={item.featuredImage || "/images/workspace_managed_suite.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          {item.status.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                          {item.vertical}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="text-sm font-black truncate">{item.name}</h4>
                        <p className="text-[11px] text-gray-200 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-teal-400 shrink-0" /> {item.locality || item.city}
                        </p>
                      </div>
                    </div>

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
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">Rating: {item.avgRating || "4.5"} ★</span>
                    <Link
                      href={`/marketplace/${item.slug || item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:underline"
                    >
                      View Live Listing <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
