"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ContractWizardModal from "@/components/rent-roll/ContractWizardModal";

export default function StandaloneNewContractPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <ContractWizardModal
        isOpen={true}
        onClose={() => router.push("/rent-roll")}
        onSuccess={() => router.push("/rent-roll")}
      />
    </div>
  );
}
