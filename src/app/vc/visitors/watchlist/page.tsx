"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  X,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SecurityWatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("high");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notice, setNotice] = useState("");

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors/watchlist?orgId=${encodeURIComponent(org)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setWatchlist(json.data);
      }
    } catch (err) {
      console.error("Error loading watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch("/api/vc/visitors/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: org,
          name,
          mobile,
          reason,
          severity,
          createdBy: "Chief Security Officer",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to add to watchlist");
        setIsSubmitting(false);
        return;
      }

      setNotice(`Entity ${name} added to restricted watchlist.`);
      setModalOpen(false);
      setName("");
      setMobile("");
      setReason("");
      fetchWatchlist();
      setTimeout(() => setNotice(""), 4000);
    } catch (err: any) {
      console.error("Watchlist submit error:", err);
      setErrorMsg("Network error adding to watchlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, entityName: string) => {
    if (!confirm(`Are you sure you want to remove ${entityName} from the watchlist?`)) return;

    try {
      const res = await fetch(`/api/vc/visitors/watchlist?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setWatchlist((prev) => prev.filter((item) => item.id !== id));
        setNotice(`Removed ${entityName} from watchlist.`);
        setTimeout(() => setNotice(""), 4000);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to remove entity");
    }
  };

  const filtered = watchlist.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (item.name || "").toLowerCase().includes(q) ||
      (item.mobile || "").includes(q) ||
      (item.reason || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-rose-400 font-bold">Security Watchlist (VC-14)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Campus Blacklist & Watchlist</h1>
          <p className="text-xs text-slate-400">
            Restricted identity register automatically checked during pre-registration and kiosk check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchWatchlist}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Watchlist</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restricted name, phone, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="text-slate-400 font-semibold">
          Restricted Records: <span className="text-white font-mono font-bold">{filtered.length}</span>
        </div>
      </div>

      {loading && watchlist.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-400 mb-2" />
          <div>Querying security watchlist from database...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-rose-900/40 hover:border-rose-700/60 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                      {item.severity} Alert
                    </span>
                    <div className="text-base font-extrabold text-white mt-1.5">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{item.mobile || "No phone listed"}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="text-slate-500 text-[11px] font-semibold mb-0.5">Restriction Reason:</div>
                  <div className="line-clamp-2">{item.reason}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Authorized by: {item.createdBy || "Security Admin"}</span>
                  <span>Active since: {new Date(item.activeFrom).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <div className="font-bold text-white text-base">Watchlist is Clear</div>
              <div className="text-xs text-slate-400 mt-1">No persons or contractors are currently flagged on the restricted entry list.</div>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-extrabold text-white">Add Entity to Watchlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Number (Matching Key)</label>
                <input
                  type="tel"
                  placeholder="+91 98111 22334"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Restriction Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="critical">Critical (Hard Gate Block)</option>
                  <option value="high">High (Requires Security Manager Escort)</option>
                  <option value="medium">Medium (Enhanced Verification)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Reason for Blacklisting *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed operational incident description..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Add to Restricted List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
