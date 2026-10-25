"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderArchive,
  Upload,
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function EvidenceVaultPage() {
  const [evidence] = useState([
    {
      id: "DOC-2026-001",
      name: "Form 15 Annual Fire NOC Certificate.pdf",
      category: "Fire Safety",
      authority: "State Fire Services",
      issueDate: "2025-12-28",
      expiryDate: "2026-12-28",
      status: "Verified & Active",
      verifiedBy: "Clean Asset Lead Auditor",
    },
    {
      id: "DOC-2026-002",
      name: "Elevator Inspection & Fitness Certificate.pdf",
      category: "Lift / HVAC",
      authority: "Chief Electrical Inspector",
      issueDate: "2026-05-06",
      expiryDate: "2026-11-06",
      status: "Expiring in 12 Days",
      verifiedBy: "FM Director",
    },
    {
      id: "DOC-2026-003",
      name: "Pollution Control Board CTO Discharge Test Report.pdf",
      category: "Environmental",
      authority: "State PCB",
      issueDate: "2026-08-15",
      expiryDate: "2027-08-15",
      status: "Verified & Active",
      verifiedBy: "EHS Manager",
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">Evidence Vault (CM-05)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Digital Evidence & Document Vault</h1>
          <p className="text-xs text-slate-400">
            Tamper-proof digital repository for government licenses, test certificates, and audit reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Upload Certificate Document")}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document Proof</span>
        </button>
      </div>

      <div className="space-y-3">
        {evidence.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{doc.name}</div>
                <div className="text-slate-400 mt-0.5">
                  Authority: <strong className="text-slate-200">{doc.authority}</strong> • Domain: {doc.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-slate-300 font-mono font-medium">{doc.issueDate} to {doc.expiryDate}</span>
                <div className="text-[10px] text-emerald-400">Verified by {doc.verifiedBy}</div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                doc.status.includes("Expiring")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {doc.status}
              </span>

              <button
                type="button"
                onClick={() => alert(`Downloading verified PDF for ${doc.name}`)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
