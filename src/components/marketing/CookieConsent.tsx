"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("officex_dpdp_consent");
      if (!consent) {
        setShow(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("officex_dpdp_consent", "accepted");
    } catch {
      // ignore
    }
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("officex_dpdp_consent", "declined");
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Privacy and Cookie Notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#071324] text-white p-5 rounded-2xl shadow-2xl border border-slate-700 animate-fadeIn"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={18} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-white">DPDP Act 2023 &amp; Cookie Notice</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            We use strictly necessary cookies and anonymized analytics to secure commercial transactions and enhance platform functionality in compliance with the Digital Personal Data Protection Act 2023.
          </p>
          <div className="mt-3 flex items-center gap-2.5">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0c7368] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Necessary Only
            </button>
            <Link
              href="/privacy"
              className="text-[11px] text-slate-400 hover:text-white underline ml-auto"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close notice"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
