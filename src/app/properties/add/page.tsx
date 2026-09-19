"use client";

import React from "react";
import PropertyListingEngine from "@/components/PropertyListingEngine";

export default function OwnerPropertyBuilderPage() {
  return (
    <PropertyListingEngine
      portalRole="owner"
      redirectPath="/properties"
      defaultListedBy="owner"
    />
  );
}
