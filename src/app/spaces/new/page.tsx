"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PropertyHierarchyModal from "@/components/rent-roll/PropertyHierarchyModal";

export default function StandaloneNewSpacePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <PropertyHierarchyModal
        isOpen={true}
        initialTab="space"
        onClose={() => router.push("/rent-roll")}
        onSuccess={() => router.push("/rent-roll")}
      />
    </div>
  );
}
