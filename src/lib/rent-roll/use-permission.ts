"use client";

import { useState, useEffect } from "react";
import { ROLE_CAPABILITIES, SpecRoleKey, hasCapability } from "./auth-context";

export function usePermission() {
  const [roleKey, setRoleKey] = useState<SpecRoleKey>("owner");
  const [roleLabel, setRoleLabel] = useState<string>("Owner / Client Principal");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = (localStorage.getItem("officex_role_key") || sessionStorage.getItem("officex_role_key") || "owner") as SpecRoleKey;
      const storedLabel = localStorage.getItem("officex_user_role") || sessionStorage.getItem("officex_user_role") || "Owner / Client Principal";
      setRoleKey(storedKey);
      setRoleLabel(storedLabel);
    }
  }, []);

  const can = (action: string, resource?: string): boolean => {
    return hasCapability(roleKey, action);
  };

  return {
    role: roleKey,
    roleLabel,
    can,
    isOwner: roleKey === "owner" || roleKey === "client_principal",
    isPM: roleKey === "property_manager",
    isFinance: roleKey === "finance_manager" || roleKey === "finance",
    isLeasing: roleKey === "leasing_manager",
    isFM: roleKey === "facility_manager",
    isAdmin: roleKey === "org_admin" || roleKey === "super_admin",
    isApprover: ["finance_manager", "finance", "approver", "owner", "client_principal", "org_admin", "super_admin"].includes(roleKey),
    canApproveContracts: ["finance_manager", "finance", "approver", "owner", "client_principal", "org_admin", "super_admin"].includes(roleKey),
    canCreateContracts: ["property_manager", "org_admin", "super_admin"].includes(roleKey),
  };
}
