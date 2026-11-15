"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";

export default function StandaloneContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="flex min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 min-w-0 pl-0 md:pl-[260px] flex flex-col max-w-full overflow-x-hidden">
        <Topbar />

        <main className="flex-1 mt-[60px] p-4 md:p-6 lg:p-8 min-w-0 max-w-full pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Link href="/contracts" className="hover:text-teal-700 transition flex items-center gap-1">
                    <ArrowLeft size={13} />
                    <span>Contracts Registry</span>
                  </Link>
                  <span>/</span>
                  <span className="text-[#0D7B6C] font-extrabold">Contract Verification</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0D7B6C]/10 border border-[#0D7B6C]/20 flex items-center justify-center text-[#0D7B6C]">
                    <FileText size={22} />
                  </div>
                  <span>Commercial Contract Inspection</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Inspecting statutory clauses, fit-out moratorium, billing schedules, and legal lease deed particulars.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Contract Detail Drawer */}
      <ContractDetailDrawer
        contractId={id}
        isOpen={true}
        onClose={() => router.push("/contracts")}
        onRefresh={() => {}}
        onOpenDocViewer={() => {}}
      />
    </div>
  );
}
