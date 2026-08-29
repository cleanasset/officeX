"use client";

import React, { useState } from "react";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoiPage() {
  const router = useRouter();
  const [loiList] = useState([
    { id: 1, tenant: "Razorpay Software", property: "Apex Floor 4", deposit: "₹15,00,000", leasePeriod: "3 Years", status: "Signed", onboardStatus: "Pending Onboarding" },
    { id: 2, tenant: "Paytm Services", property: "Meridian Block B", deposit: "₹24,00,000", leasePeriod: "5 Years", status: "Pending Tenant Sign", onboardStatus: "N/A" }
  ]);

  const [message, setMessage] = useState("");

  const handleOnboardInit = (tenant: string) => {
    router.push(`/leasing/onboard?tenant=${encodeURIComponent(tenant)}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LOI & Lease Workflow</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Generate Terms Sheets, dispatch letters of intent, and manage digital signature locks.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant Name</th>
              <th className="py-4">Property / Unit</th>
              <th className="py-4">Security Deposit</th>
              <th className="py-4">Lease Term</th>
              <th className="py-4">E-Sign Status</th>
              <th className="py-4">Onboarding Flow</th>
            </tr>
          </thead>
          <tbody>
            {loiList.map((loi) => (
              <tr key={loi.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  {loi.tenant}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{loi.property}</td>
                <td className="py-4 text-gray-700 font-semibold">{loi.deposit}</td>
                <td className="py-4 text-gray-900 font-extrabold">{loi.leasePeriod}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    loi.status === "Signed" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}>
                    {loi.status}
                  </span>
                </td>
                <td className="py-4">
                  {loi.status === "Signed" ? (
                    <button 
                      onClick={() => handleOnboardInit(loi.tenant)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Init Onboarding <ArrowRight size={10} />
                    </button>
                  ) : (
                    <span className="text-gray-400 font-bold">Awaiting Execution</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
