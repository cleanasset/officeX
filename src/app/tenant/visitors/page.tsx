"use client";

import React, { useState, useEffect } from "react";
import VisitorManagementConsole from "@/components/visitor/VisitorManagementConsole";

export default function TenantVisitorsPage() {
  const [building, setBuilding] = useState("Commercial Workplace");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("officex_tenant_building");
      if (b) setBuilding(b);
    }
  }, []);

  return <VisitorManagementConsole portalRole="tenant" defaultProperty={building} />;
}
