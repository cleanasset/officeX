"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import ContractDetailDrawer from "@/components/rent-roll/ContractDetailDrawer";

export default function StandaloneContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <ContractDetailDrawer
        contractId={id}
        isOpen={true}
        onClose={() => router.push("/rent-roll")}
        onRefresh={() => {}}
        onOpenDocViewer={() => {}}
      />
    </div>
  );
}
