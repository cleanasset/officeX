"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import PropertyHierarchyModal from "@/components/rent-roll/PropertyHierarchyModal";

export default function StandaloneNewBuildingPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id ? String(params.id) : "";

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <PropertyHierarchyModal
        isOpen={true}
        initialTab="building"
        onClose={() => router.push(propertyId ? `/properties/registry?id=${propertyId}` : "/properties/registry")}
        onSuccess={() => router.push(propertyId ? `/properties/registry?id=${propertyId}` : "/properties/registry")}
      />
    </div>
  );
}
