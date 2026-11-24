"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Clock,
  Building,
  QrCode,
  LogOut,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  Printer,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function LiveVisitorsInsidePage() {
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [actionMsg, setActionMsg] = useState("");
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors?status=inside&orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVisitors(json.data);
      }
    } catch (err) {
      console.error("Error loading live occupants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async (visitId: string, visitorName: string) => {
    setCheckingOutId(visitId);
    try {
      const res = await fetch("/api/vc/visitors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          checkoutNotes: "Checked out via Live Occupancy Radar",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionMsg(`Visitor ${visitorName} checked out successfully. Pass marked returned.`);
        setVisitors((prev) => prev.filter((v) => v.visitId !== visitId));
        setTimeout(() => setActionMsg(""), 4000);
      } else {
        alert(json.message || "Failed to check out visitor");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Network error processing checkout");
    } finally {
      setCheckingOutId(null);
    }
  };

  const filtered = visitors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (v.name || "").toLowerCase().includes(q) ||
      (v.company || "").toLowerCase().includes(q) ||
      (v.hostName || "").toLowerCase().includes(q) ||
      (v.floor || "").toLowerCase().includes(q) ||
      (v.passNumber || "").toLowerCase().includes(q);

    const matchesFloor = selectedFloor === "all" || (v.floor || "").includes(selectedFloor);
    const matchesType = selectedType === "all" || v.visitorType === selectedType;
    return matchesSearch && matchesFloor && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {actionMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Real-Time Radar (VC-08)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Live Visitors Inside Campus</h1>
          <p className="text-xs text-slate-400">
            Real-time directory of guests, contractors, and clients currently past the turnstiles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vc/visitors/emergency"
            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Emergency Roll Call</span>
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search visitor, company, pass #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-60"
            />
          </div>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Floors</option>
            <option value="Floor 8">Floor 8</option>
            <option value="Floor 4">Floor 4</option>
            <option value="Lobby">Lobby</option>
            <option value="Service">Service Core</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Visitor Types</option>
            <option value="client">Client</option>
            <option value="guest">Guest</option>
            <option value="contractor">Contractor</option>
            <option value="vip">VIP</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        <div className="text-slate-400 font-semibold">
          Active Inside: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Visitors Inside Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Visitor & Entity</th>
              <th className="py-3 px-4">Host & Tenant</th>
              <th className="py-3 px-4">Zone / Floor</th>
              <th className="py-3 px-4">Check-In Time</th>
              <th className="py-3 px-4">Pass Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {loading && visitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
                  <div>Loading live occupants from database...</div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((v) => (
                <tr key={v.visitId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                        {(v.name || "V").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{v.name}</span>
                          {v.visitorType === "vip" && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                              VIP
                            </span>
                          )}
                          {v.visitorType === "contractor" && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                              PTW LINKED
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{v.company || "Individual"} • {v.mobile}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{v.hostName || "Reception Desk"}</div>
                    <div className="text-slate-400 text-[11px]">{v.tenantName || "OfficeX Facility"}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{v.floor || "Lobby"}</div>
                    <div className="text-slate-500 text-[11px]">{v.zoneId || "General Access"}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {v.checkinAt ? new Date(v.checkinAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                    <div className="text-[10px] text-emerald-400 font-sans">SpeedGate Verified</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active Inside
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/vc/badges?name=${encodeURIComponent(v.name)}&pass=${encodeURIComponent(v.passNumber || "")}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Badge</span>
                    </Link>
                    <button
                      type="button"
                      disabled={checkingOutId === v.visitId}
                      onClick={() => handleCheckout(v.visitId, v.name)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {checkingOutId === v.visitId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      <span>Check Out</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <div>No visitors currently inside matching filter criteria.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
