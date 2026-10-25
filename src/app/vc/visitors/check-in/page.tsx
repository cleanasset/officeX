"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Printer,
  ChevronLeft,
  Camera,
  Car,
} from "lucide-react";

export default function ReceptionCheckInPage() {
  const [passQuery, setPassQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [verifiedVisitor, setVerifiedVisitor] = useState<any>(null);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passQuery.trim()) return;

    // Simulated verified guest lookup
    setVerifiedVisitor({
      passNumber: passQuery.toUpperCase(),
      name: "Deepak Singhal",
      company: "McKinsey & Co",
      host: "Arun Jaitley (Director)",
      tenant: "TechCorp Solutions Ltd",
      floor: "Floor 8 East Wing",
      status: "Pre-Approved",
      watchlistStatus: "CLEARED (No match)",
      vehicle: "DL 03 CE 5541",
    });
    setCheckedInSuccess(false);
  };

  const handleConfirmCheckin = () => {
    setCheckedInSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Reception Check-In (VC-04)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Reception & Speed-Gate Desk</h1>
          <p className="text-xs text-slate-400">
            Scan visitor invitation QR token or search by mobile number to issue turnstile access credentials.
          </p>
        </div>

        <Link
          href="/vc/visitors/live"
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          View Inside (3)
        </Link>
      </div>

      {/* QR Scanner / Lookup Box */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-400" />
          <span>Scan Guest Pass or Enter Mobile / Pass #</span>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="e.g. PASS-2026-0891 or +91 98201 11223"
            value={passQuery}
            onChange={(e) => setPassQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono tracking-wider"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
          <span>Camera Scanner:</span>
          <button
            type="button"
            onClick={() => {
              setPassQuery("PASS-2026-0891");
              setVerifiedVisitor({
                passNumber: "PASS-2026-0891",
                name: "Vikram Malhotra",
                company: "Apex Global Advisory",
                host: "Arun Jaitley (Director)",
                tenant: "TechCorp Solutions Ltd",
                floor: "Floor 8 East Wing",
                status: "Pre-Approved",
                watchlistStatus: "CLEARED (No match)",
                vehicle: "HR 26 DQ 9901",
              });
            }}
            className="text-blue-400 font-bold hover:underline"
          >
            Simulate WebCam Scan (PASS-2026-0891)
          </button>
        </div>
      </div>

      {/* Verified Guest Details Card */}
      {verifiedVisitor && !checkedInSuccess && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-2xl space-y-5 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                VERIFICATION PASSED
              </span>
              <h2 className="text-xl font-black text-white mt-1">{verifiedVisitor.name}</h2>
              <div className="text-xs text-slate-400">{verifiedVisitor.company}</div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-400">{verifiedVisitor.passNumber}</span>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{verifiedVisitor.watchlistStatus}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500">Host Person:</span>
              <div className="text-white font-semibold">{verifiedVisitor.host}</div>
            </div>
            <div>
              <span className="text-slate-500">Tenant / Org:</span>
              <div className="text-white font-semibold">{verifiedVisitor.tenant}</div>
            </div>
            <div>
              <span className="text-slate-500">Authorized Zone:</span>
              <div className="text-slate-200">{verifiedVisitor.floor}</div>
            </div>
            <div>
              <span className="text-slate-500">Allocated Vehicle:</span>
              <div className="text-slate-200">{verifiedVisitor.vehicle || "None"}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Turnstiles will unlatch for 15 seconds</span>
            </span>

            <button
              type="button"
              onClick={handleConfirmCheckin}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Open Turnstile & Check In</span>
            </button>
          </div>
        </div>
      )}

      {/* Checked In Success */}
      {checkedInSuccess && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Visitor Checked In!</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Speed-gate #1 opened. Push notification dispatched to {verifiedVisitor?.host}.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/vc/badges?name=${verifiedVisitor?.name}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Visitor Badge</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setVerifiedVisitor(null);
                setPassQuery("");
                setCheckedInSuccess(false);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
            >
              Scan Next Guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
