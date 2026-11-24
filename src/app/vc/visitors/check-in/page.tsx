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
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

export default function ReceptionCheckInPage() {
  const [passQuery, setPassQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [verifiedVisitor, setVerifiedVisitor] = useState<any>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);
  const [vehicleReg, setVehicleReg] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setVerifiedVisitor(null);
    setCheckedInSuccess(false);

    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch(`/api/vc/visitors/verify?query=${encodeURIComponent(passQuery.trim())}&orgId=${encodeURIComponent(org)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "No matching visitor or active pass found");
        return;
      }

      setVerifiedVisitor(json.data);
      if (json.data.vehicleReg) {
        setVehicleReg(json.data.vehicleReg);
      }
    } catch (err: any) {
      console.error("Lookup error:", err);
      setErrorMsg("Network error connecting to verification service");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!verifiedVisitor?.visitId) return;

    setIsCheckingIn(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/vc/visitors/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: verifiedVisitor.visitId,
          vehicleReg: vehicleReg || undefined,
          checkinMethod: "reception_gate",
          accessPoint: "Main Lobby Speed-Gate #1",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to complete check-in");
        return;
      }

      setCheckedInSuccess(true);
    } catch (err: any) {
      console.error("Check-in error:", err);
      setErrorMsg("Failed to connect to check-in service");
    } finally {
      setIsCheckingIn(false);
    }
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
          View Live Inside
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
            placeholder="e.g. PASS-891024-A1B2 or +91 98201 11223"
            value={passQuery}
            onChange={(e) => setPassQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? "Verifying..." : "Verify"}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verified Guest Details Card */}
      {verifiedVisitor && !checkedInSuccess && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-2xl space-y-5 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                verifiedVisitor.canCheckIn
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {verifiedVisitor.canCheckIn ? "VERIFICATION PASSED" : `BLOCKED: ${verifiedVisitor.clearance}`}
              </span>
              <h2 className="text-xl font-black text-white mt-1">{verifiedVisitor.name}</h2>
              <div className="text-xs text-slate-400">{verifiedVisitor.company || "Individual Visitor"}</div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-400">{verifiedVisitor.passNumber || "NO PASS"}</span>
              <div className={`text-[11px] font-semibold mt-0.5 ${verifiedVisitor.isWatchlisted ? "text-red-400" : "text-emerald-400"}`}>
                {verifiedVisitor.isWatchlisted ? "WATCHLIST MATCH (RESTRICTED)" : "WATCHLIST CLEARED"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500">Host Person:</span>
              <div className="text-white font-semibold">{verifiedVisitor.hostName || "Reception Desk"}</div>
            </div>
            <div>
              <span className="text-slate-500">Tenant / Org:</span>
              <div className="text-white font-semibold">{verifiedVisitor.tenantName || "OfficeX Facility"}</div>
            </div>
            <div>
              <span className="text-slate-500">Authorized Zone / Floor:</span>
              <div className="text-slate-200">{verifiedVisitor.floor || "Lobby"}</div>
            </div>
            <div>
              <span className="text-slate-500">Allocated Vehicle:</span>
              <input
                type="text"
                placeholder="Enter reg (e.g. DL 03 CE 5541)"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>

          {verifiedVisitor.isWatchlisted && (
            <div className="p-3 bg-red-950/70 border border-red-500 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <strong>Security Alert:</strong> {verifiedVisitor.watchlistReason || "Identity is on restricted entry list."} Contact Security Manager.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Turnstiles will unlatch for 15 seconds</span>
            </span>

            <button
              type="button"
              disabled={!verifiedVisitor.canCheckIn || isCheckingIn}
              onClick={handleConfirmCheckin}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>{isCheckingIn ? "Opening Gate..." : "Open Turnstile & Check In"}</span>
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
            Speed-gate #1 opened. Visit logged into live building occupancy and notification dispatched to host {verifiedVisitor?.hostName}.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/vc/badges?name=${encodeURIComponent(verifiedVisitor?.name || "")}&pass=${encodeURIComponent(verifiedVisitor?.passNumber || "")}`}
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
