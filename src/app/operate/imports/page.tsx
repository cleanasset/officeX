"use client";

import React from "react";
import Link from "next/link";
import { DataImportView } from "@/components/rent-roll/DataImportView";
import {
  FileSpreadsheet,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building,
  UploadCloud,
  History,
  Info
} from "lucide-react";

export default function StandaloneImportCentrePage() {
  return (
    <div className="min-h-screen bg-slate-50/60 p-3.5 sm:p-6 pb-28 md:pb-16 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/properties/rent-roll?tab=rentroll"
              className="text-xs text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Rent Roll Master</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 uppercase tracking-widest">
              Screen S-30 • §11.2
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 tracking-tight">
            Bulk Data Import Centre
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            6-stage transactional ingestion pipeline for legacy rent rolls, lease schedules, and occupant rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/properties/rent-roll?tab=rentroll"
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Building size={14} />
            <span>Active Rent Roll</span>
          </Link>
        </div>
      </div>

      {/* Pipeline Stage Architecture Overview */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hidden sm:grid grid-cols-6 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 1</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">File Ingest</span>
          <span className="text-[10px] text-gray-500">Excel / CSV UTF-8</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 2</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">Auto Profiling</span>
          <span className="text-[10px] text-gray-500">Heuristic Mapping</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 3</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">Validation</span>
          <span className="text-[10px] text-gray-500">18 Pre-flight Rules</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 4</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">Diff Review</span>
          <span className="text-[10px] text-gray-500">Insert vs Mutate</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 5</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">Atomic Commit</span>
          <span className="text-[10px] text-gray-500">PostgreSQL Txn</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Stage 6</span>
          <span className="text-xs font-bold text-gray-800 mt-0.5 block">Audit &amp; Rollback</span>
          <span className="text-[10px] text-gray-500">Batch Code Trail</span>
        </div>
      </div>

      {/* The Ingestion Pipeline Component */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden p-2 sm:p-5">
        <DataImportView />
      </div>
    </div>
  );
}
