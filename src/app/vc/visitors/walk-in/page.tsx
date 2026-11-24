"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Building,
  User,
  Phone,
  Camera,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function WalkInRegistrationPage() {
  const [visitorName, setVisitorName] = useState("");
  const [company, setCompany] = useState("");
  const [mobile, setMobile] = useState("");
  const [hostName, setHostName] = useState("");
  const [purpose, setPurpose] = useState("Consultation / Meeting");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [passNumber, setPassNumber] = useState("");
  const [qrToken, setQrToken] = useState("");

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const org = typeof window !== "undefined" ? localStorage.getItem("officex_org_id") || "default_org" : "default_org";
      const res = await fetch("/api/vc/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: org,
          name: visitorName,
          company,
          mobile,
          hostName: hostName || "Reception Duty Officer",
          purpose,
          visitorType: "guest",
          isWalkIn: true,
          floor: "Lobby",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.message || "Failed to register walk-in visitor");
        setIsSubmitting(false);
        return;
      }

      setPassNumber(json.data.passNumber);
      setQrToken(json.data.qrToken);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Walk-in error:", err);
      setErrorMsg("Network error connecting to kiosk service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Walk-In Kiosk (VC-05)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Lobby Walk-In Registration</h1>
          <p className="text-xs text-slate-400">
            Self-service touch kiosk for unannounced guests, job candidates, and courier agents.
          </p>
        </div>

        <Link
          href="/vc/visitors/live"
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          View Inside
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleWalkInSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Kiosk Express Mode — Instant Turnstile Token</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ankit Singhania"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Individual or PwC India"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number (SMS verification) *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Person / Host You Are Visiting *</label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Jaitley or Company Name"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Visit Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Host Consent & NDA Acknowledgement</span>
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Pass...</span>
                </>
              ) : (
                <>
                  <span>Submit & Request Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Walk-In Pass Generated in Database!</h2>
          <div className="text-xs font-mono font-bold text-blue-400">{passNumber}</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Host {hostName || "Reception"} notified. Record saved to database. Present pass number at reception.
          </p>

          <div className="flex justify-center gap-3 pt-3">
            <Link
              href={`/vc/visitors/check-in`}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold shadow-md"
            >
              Check In At Desk Now
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setVisitorName("");
                setCompany("");
                setMobile("");
                setHostName("");
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md"
            >
              Register Another Walk-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
