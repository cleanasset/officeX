"use client";

import React from "react";
import PropertyListingEngine from "@/components/PropertyListingEngine";

export default function BrokerPropertyListingPage() {
  return (
    <PropertyListingEngine
      portalRole="broker"
      redirectPath="/leasing"
      defaultListedBy="broker"
    />
  );
}
