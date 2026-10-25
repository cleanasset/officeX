"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function SecurityWatchlistPage() {
  const [watchlist, setWatchlist] = useState([
    {
      id: "wl_1",
      name: "Harish Chandra Verma",
      mobile: "+91 98990 01122",
      reason: "Trespassing attempt without host approval; prior verbal misconduct with security.",
      severity: "critical",
      addedBy: "Chief Security Officer",
      activeFrom: "2026-08-14",
    },
    {
      id: "wl_2",
      name: "Karan Johar Tech Vendor",
      mobile: "+91 97112 44332",
      reason: "Blacklisted contractor technician; forged electrical qualification certificate.",
      severity: "high",
      addedBy: "EHS Lead",
      activeFrom: "2026-09-01",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("high");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setWatchlist([
      {
        id: `wl_${Date.now()}`,
        name,
        mobile,
        reason,
        severity,
        addedBy: "Security Admin",
        activeFrom: new Date().toISOString().split("T")[0],
      },
      ...watchlist,
    ]);
    setModalOpen(false);
    setName("");
    setMobile("");
    setReason("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
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

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Watchlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchlist.map((item) => (
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
                <div className="text-xs text-slate-400">{item.mobile}</div>
              </div>

              <span className="text-xs text-slate-500 font-mono">Since {item.activeFrom}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 block mb-0.5">Enforcement Reason:</span>
              <div className="text-rose-200/90 leading-relaxed">{item.reason}</div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>Added by: <strong className="text-slate-300">{item.addedBy}</strong></span>
              <span className="text-rose-400 font-semibold">Immediate Block at SpeedGate</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Add Person to Security Watchlist</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unknown Individual"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason for Blacklisting *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed security justification..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  Confirm Restrict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
