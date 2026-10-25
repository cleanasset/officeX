"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  ShieldCheck,
} from "lucide-react";

export default function VisitorCheckoutPage() {
  const [passInput, setPassInput] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [badgeReturned, setBadgeReturned] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSuccess(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">Checkout Desk (VC-09)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Visitor Checkout & Pass Return</h1>
          <p className="text-xs text-slate-400">
            Record visitor exit, recover physical RFID badges, or log manual security overrides.
          </p>
        </div>
      </div>

      {!checkoutSuccess ? (
        <form onSubmit={handleCheckout} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Scan Exit QR or Enter Pass # / Mobile
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. PASS-2026-0891"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider"
              />
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
            <span className="font-semibold text-white">Physical Access Card / Badge Deposited</span>
            <input
              type="checkbox"
              checked={badgeReturned}
              onChange={(e) => setBadgeReturned(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Checkout Notes / Security Override Reason
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Regular meeting concluded. Escorted by host to lobby."
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Confirm Exit & Close Visit Pass</span>
          </button>
        </form>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Checkout Successfully Logged!</h2>
          <p className="text-xs text-slate-400">
            Pass {passInput || "PASS-2026-0891"} has been deactivated. Turnstile access closed.
          </p>

          <button
            type="button"
            onClick={() => {
              setCheckoutSuccess(false);
              setPassInput("");
              setCheckoutNotes("");
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Process Next Checkout
          </button>
        </div>
      )}
    </div>
  );
}
