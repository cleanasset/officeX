"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  QrCode,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Sparkles,
  Download,
} from "lucide-react";

export default function BadgePassPage() {
  const [badgeType, setBadgeType] = useState<"standard" | "vip" | "contractor">("standard");
  const [visitorName, setVisitorName] = useState("Vikram Malhotra");
  const [company, setCompany] = useState("Apex Global Advisory");
  const [hostName, setHostName] = useState("Arun Jaitley (Director)");
  const [zone, setZone] = useState("Tower 1 • Floor 8 East");
  const [passNumber, setPassNumber] = useState("PASS-2026-0891");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Badge Designer & Issuance (VC-07)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Commercial Visitor Pass Badge</h1>
          <p className="text-xs text-slate-400">
            Thermal label printer or color card badge template with encrypted gate QR credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Printer className="w-4 h-4" />
          <span>Print Pass (Thermal/A4)</span>
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Badge Template:</span>
          <button
            type="button"
            onClick={() => setBadgeType("standard")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              badgeType === "standard"
                ? "bg-blue-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            Standard Guest
          </button>
          <button
            type="button"
            onClick={() => setBadgeType("vip")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              badgeType === "vip"
                ? "bg-purple-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            VIP Gold
          </button>
          <button
            type="button"
            onClick={() => setBadgeType("contractor")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              badgeType === "contractor"
                ? "bg-amber-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            Contractor PTW
          </button>
        </div>

        <div className="text-slate-500 font-mono">Format: 86mm x 54mm Standard CR80</div>
      </div>

      {/* Pass Canvas Preview */}
      <div className="flex justify-center py-6">
        <div className={`w-80 rounded-3xl p-6 border shadow-2xl space-y-4 text-center transition-all ${
          badgeType === "vip"
            ? "bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 border-purple-500/50"
            : badgeType === "contractor"
            ? "bg-gradient-to-b from-amber-950 via-slate-950 to-slate-950 border-amber-500/50"
            : "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-slate-700"
        }`}>
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="text-left">
              <div className="text-xs font-black tracking-tight text-white">CYBERCITY</div>
              <div className="text-[9px] text-slate-400">COMMERCIAL TOWERS</div>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
              badgeType === "vip"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : badgeType === "contractor"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
            }`}>
              {badgeType.toUpperCase()} PASS
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center py-2">
            <div className="w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg">
              <QrCode className="w-full h-full text-slate-950" />
            </div>
          </div>

          {/* Guest Identity */}
          <div className="space-y-1">
            <div className="text-lg font-black text-white">{visitorName}</div>
            <div className="text-xs text-slate-400">{company}</div>
          </div>

          {/* Permitted Zone & Host */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px] text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Host:</span>
              <span className="font-semibold text-slate-200">{hostName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Access Zone:</span>
              <span className="font-semibold text-blue-400">{zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validity:</span>
              <span className="font-mono text-emerald-400 font-bold">TODAY ONLY</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            {passNumber} • Turnstile Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
