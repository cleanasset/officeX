"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, FileText, ExternalLink } from "lucide-react";

export default function VendorKYCVerification() {
  const [kycQueue, setKycQueue] = useState([
    {
      id: "V-901",
      companyName: "SafeGuard Security Services",
      gstin: "27AAACG9876C1ZY",
      services: "Security, Manned Patrols",
      joined: "Aug 20, 2026",
      status: "pending",
      docs: ["GSTIN Registration certificate", "Labor License Form V", "General Liability Insurance"]
    },
    {
      id: "V-902",
      companyName: "AquaClean Environmental solutions",
      gstin: "29AABCA1234F2ZX",
      services: "Housekeeping, Waste Management",
      joined: "Aug 22, 2026",
      status: "pending",
      docs: ["GSTIN Registration certificate", "EPF & ESIC declarations"]
    }
  ]);

  const [message, setMessage] = useState("");

  const handleApprove = (id: string, name: string) => {
    setKycQueue(kycQueue.filter(k => k.id !== id));
    setMessage(`KYC approved for ${name}! Vendor is now active in the Marketplace matching engine.`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleReject = (id: string, name: string) => {
    setKycQueue(kycQueue.filter(k => k.id !== id));
    setMessage(`KYC rejected for ${name}. Notification sent for document re-upload.`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor KYC Verification</h1>
        <p className="text-sm text-gray-600 font-semibold mt-1">Audit tax details, labor licenses, and liability insurance before marketplace listing.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      {/* KYC Queue List */}
      <div className="flex flex-col gap-6">
        {kycQueue.map((item, idx) => (
          <div key={idx} className="premium-card p-6 border border-gray-200 bg-white flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{item.companyName}</h3>
                  <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mt-1 block">GSTIN: {item.gstin}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                  Awaiting Verification
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-600 font-semibold uppercase tracking-wider text-[9px]">Services Offered</div>
                  <div className="font-bold text-gray-900 mt-1">{item.services}</div>
                </div>
                <div>
                  <div className="text-gray-600 font-semibold uppercase tracking-wider text-[9px]">Applied On</div>
                  <div className="font-bold text-gray-900 mt-1">{item.joined}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-600 font-semibold uppercase tracking-wider text-[9px] mb-2">Uploaded Certificates</div>
                <div className="flex flex-wrap gap-2">
                  {item.docs.map((doc, dIdx) => (
                    <span key={dIdx} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-center gap-1.5">
                      <FileText size={12} className="text-gray-600" />
                      {doc}
                      <ExternalLink size={10} className="text-gray-600 cursor-pointer" />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 justify-center">
              <button 
                onClick={() => handleApprove(item.id, item.companyName)}
                className="flex-1 md:w-40 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={14} /> Approve KYC
              </button>
              <button 
                onClick={() => handleReject(item.id, item.companyName)}
                className="flex-1 md:w-40 py-2.5 rounded-xl border border-red-200 hover:bg-red-600 text-white font-bold font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <X size={14} /> Reject KYC
              </button>
            </div>
          </div>
        ))}

        {kycQueue.length === 0 && (
          <div className="premium-card p-12 text-center border border-gray-200 bg-white">
            <ShieldCheck size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 text-sm">KYC Onboarding Queue Clear</h3>
            <p className="text-xs text-gray-600 font-semibold mt-1">There are no pending vendor verification records to audit.</p>
          </div>
        )}
      </div>

    </div>
  );
}
