"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Edit,
  Save,
  Lock,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function LandlordBankingPage() {
  const [spvName, setSpvName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank Commercial Escrow");
  const [virtualAccount, setVirtualAccount] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSpv = localStorage.getItem("officex_property_spv") || localStorage.getItem("officex_active_org") || "";
      const storedAcc = localStorage.getItem("officex_bank_account") || "";
      const storedIfsc = localStorage.getItem("officex_bank_ifsc") || "";

      setSpvName(storedSpv);
      setBankAccount(storedAcc);
      setBankIfsc(storedIfsc);
      if (storedAcc) {
        setVirtualAccount(`OXRTGS${storedAcc.slice(-6)}`);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_property_spv", spvName);
      localStorage.setItem("officex_bank_account", bankAccount);
      localStorage.setItem("officex_bank_ifsc", bankIfsc);
    }
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Link href="/properties" className="hover:text-slate-800">Portfolio</Link>
                <span>/</span>
                <span className="text-[#0F8B7D] font-bold">Banking &amp; Accounting</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Landlord SPV Banking &amp; Escrow
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Statutory banking coordinates for automated rent remittances, Razorpay escrow settlement, and CAM pools.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Edit size={14} />
                  <span>Edit Banking Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Success Message */}
          {isSaved && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Banking coordinates saved successfully. Remittance accounts are active.</span>
            </div>
          )}

          {/* Banking Coordinates Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0">
                  <Landmark size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {spvName || "Commercial Landlord Entity"}
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Verified Commercial Remittance SPV
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="mt-6 space-y-4 max-w-lg">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    SPV / Landlord Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={spvName}
                    onChange={(e) => setSpvName(e.target.value)}
                    placeholder="e.g. Apex Realty Developers LLP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="e.g. 50200012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0000123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <Save size={14} />
                    <span>Save Coordinates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Holder / Legal SPV
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    {spvName || "Not configured yet"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Number
                  </span>
                  <div className="text-sm font-mono font-black text-slate-900 mt-1">
                    {bankAccount ? `••••••••${bankAccount.slice(-4)}` : "Not configured"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bank IFSC Code
                  </span>
                  <div className="text-sm font-mono font-black text-slate-900 mt-1">
                    {bankIfsc || "Not configured"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Virtual Remittance Code (RTGS/NEFT)
                  </span>
                  <div className="text-sm font-mono font-black text-teal-700 mt-1">
                    {virtualAccount || "Auto-assigned on First Bill"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
