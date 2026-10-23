"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Upload,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
  Clock,
  RefreshCw
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export default function StatutoryCompliancePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance/certificates", {
        headers: getClientAuthHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data.certificates)) {
        setItems(data.certificates);
        setHealth(data.health);
      }
    } catch (e) {
      console.error("Failed to load statutory certificates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const totalCerts = items.length;
  const expiringCount = items.filter((c) => c.status === "EXPIRED" || c.status === "AT_RISK").length;
  const complianceScore = health?.score !== undefined ? `${health.score}%` : (totalCerts > 0 ? "100%" : "Clean");

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Link href="/properties" className="hover:text-slate-800">Portfolio</Link>
                <span>/</span>
                <span className="text-[#0F8B7D] font-bold">Statutory Compliance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Statutory Compliance &amp; NOC Master
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Centralized registry for Fire Safety NOCs, Occupancy Certificates, Lift Inspection Licenses, and PCB Filings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchCerts}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7064] text-white text-xs font-bold shadow-md shadow-teal-700/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Upload size={15} />
                <span>Upload New Certificate</span>
              </button>
            </div>
          </div>

          {/* Compliance Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Statutory Health
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
                <CheckCircle2 size={24} />
                <span>{complianceScore}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1 inline-block">
                {totalCerts} Total Mandatory NOCs Tracked
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Expiring in 90 Days
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-2">
                <Clock size={24} />
                <span>{expiringCount} Renewal{expiringCount === 1 ? "" : "s"}</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">
                Action required before tenure lapse
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Audit Trail Integrity
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <ShieldCheck size={24} className="text-[#0F8B7D]" />
                <span>Tamper-Proof</span>
              </div>
              <span className="text-[10px] text-[#0F8B7D] font-bold mt-1 inline-block">Verified Digital Vault</span>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Registered Statutory Certificates</h3>
                <p className="text-xs text-slate-500 mt-0.5">Verified certificates required for legal leasing operations</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {items.length} records
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <FileCheck className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="font-bold text-slate-800">No statutory certificates recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload municipal Occupancy Certificates, Fire NOCs, and Lift Inspector licenses above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Certificate Name</th>
                      <th className="py-3 px-4">Issuing Authority</th>
                      <th className="py-3 px-4">Reference #</th>
                      <th className="py-3 px-4">Valid Till</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Certificate Doc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50/30 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {item.authority}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {item.regNumber || item.code}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">
                          {item.expiryDate || item.validTill || "Permanent"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === "VALID" || item.status === "Valid"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "AT_RISK"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="text-[#0F8B7D] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Vault</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
