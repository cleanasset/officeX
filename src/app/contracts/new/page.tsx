"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PropertyHierarchyModal from "@/components/rent-roll/PropertyHierarchyModal";

export default function StandaloneNewContractPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <PropertyHierarchyModal
        isOpen={true}
        initialTab="contract"
        onClose={() => router.push("/properties/rent-roll")}
        onSuccess={() => router.push("/properties/rent-roll")}
      />
    </div>
  );
}
