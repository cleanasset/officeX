"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, X, ArrowRight } from "lucide-react";

export default function RBACConfigurator() {
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Seed baseline matrix configurations
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({
    super_admin: { properties: true, leases: true, marketplace: true, compliance: true, ai: true, logs: true },
    property_manager: { properties: true, leases: true, marketplace: true, compliance: true, ai: false, logs: false },
    broker: { properties: true, leases: true, marketplace: false, compliance: false, ai: false, logs: false },
    vendor_admin: { properties: false, leases: false, marketplace: true, compliance: false, ai: false, logs: false },
    tenant_admin: { properties: false, leases: true, marketplace: false, compliance: false, ai: false, logs: false },
    auditor: { properties: true, leases: true, marketplace: true, compliance: true, ai: false, logs: true }
  });

  const togglePermission = (role: string, module: string) => {
    setMatrix({
      ...matrix,
      [role]: {
        ...matrix[role],
        [module]: !matrix[role][module]
      }
    });
  };

  const handleSaveMatrix = () => {
    setIsSaving(true);
    setMessage("");

    // Simulate database update delay
    setTimeout(() => {
      setIsSaving(false);
      setMessage("RBAC permissions matrix successfully updated!");
    }, 1000);
  };

  const roles = [
    { key: "super_admin", label: "Super Admin" },
    { key: "property_manager", label: "Property Manager" },
    { key: "broker", label: "Leasing Broker" },
    { key: "vendor_admin", label: "FM Vendor" },
    { key: "tenant_admin", label: "Tenant Admin" },
    { key: "auditor", label: "Auditor" }
  ];

  const modules = [
    { key: "properties", label: "Properties SaaS" },
    { key: "leases", label: "Leasing CRM" },
    { key: "marketplace", label: "FM Marketplace" },
    { key: "compliance", label: "Compliance NOCs" },
    { key: "ai", label: "AI Configs" },
    { key: "logs", label: "Audit Trails" }
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">RBAC Access Matrix</h1>
          <p className="text-sm text-gray-600 font-semibold mt-1">Configure role capabilities, data boundaries, and operational actions.</p>
        </div>
        <button 
          onClick={handleSaveMatrix}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
        >
          {isSaving ? "Saving Configuration..." : "Save Matrix Rules"}
          <ArrowRight size={14} />
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      {/* Access Matrix Table Grid */}
      <div className="premium-card p-6 border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-4">User Role</th>
                {modules.map((m, idx) => (
                  <th key={idx} className="py-4 text-center">{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r, rIdx) => (
                <tr key={rIdx} className="border-b border-gray-200 text-xs hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 font-bold text-gray-900">{r.label}</td>
                  {modules.map((m, mIdx) => {
                    const isAllowed = matrix[r.key]?.[m.key];
                    return (
                      <td key={mIdx} className="py-5 text-center">
                        <button 
                          onClick={() => togglePermission(r.key, m.key)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto transition-all ${
                            isAllowed 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600" 
                              : "bg-red-50 border-red-200 text-red-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                          }`}
                        >
                          {isAllowed ? <Check size={14} /> : <X size={14} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
