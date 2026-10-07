"use client";

import React from "react";
import { X, Download, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    file_name: string;
    doc_type: string;
    version: number;
    status: string;
    storage_path?: string;
  } | null;
  userName?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
  userName = "Finance Officer",
}: DocumentViewerModalProps) {
  if (!isOpen || !document) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const watermarkText = `CONFIDENTIAL — ${userName.toUpperCase()} — ${todayStr}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{document.file_name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  v{document.version}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
                  {document.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 capitalize">
                Type: {document.doc_type.replace(/_/g, " ")} • Protected under RR-CONT-05
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/documents/${document.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Logged
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body with Dynamic Watermark */}
        <div className="relative flex-1 p-8 bg-slate-100/50 overflow-y-auto min-h-[420px] flex items-center justify-center select-none">
          {/* Watermark overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-15 overflow-hidden z-10 rotate-[-25deg]">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest">{watermarkText}</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest">{watermarkText}</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest">{watermarkText}</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest">{watermarkText}</div>
          </div>

          {/* Document Preview Mock Sheet */}
          <div className="relative z-0 w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-slate-700 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                  {document.doc_type.replace(/_/g, " ")}
                </h4>
                <p className="text-xs text-slate-500">OFFICEX Secure Repository • Document #{document.id.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Legally Executed
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p>
                <strong>PARTY A (LESSOR):</strong> Prime Office REIT Management Ltd.
              </p>
              <p>
                <strong>PARTY B (LESSEE):</strong> Tenant / Occupant Legal Party
              </p>
              <p>
                <strong>DEMISED PREMISES:</strong> Commercial Suite & Space Allocation
              </p>
              <p>
                <strong>EXECUTION DATE:</strong> Recorded in OFFICEX Audit Ledger
              </p>
              <p className="pt-2 text-[11px] text-slate-400">
                [This document is encrypted and digitally stamped. Viewing is logged in compliance with RR-CONT-05 audit policies.]
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
              <span>Watermarked View: {watermarkText}</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1 text-amber-600">
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Trail Active: Access logged with user identity and timestamp</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
