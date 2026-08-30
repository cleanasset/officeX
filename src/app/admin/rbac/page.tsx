"use client";
import React, { useState } from "react";
import { Check, Shield, Info, CheckCircle } from "lucide-react";

export default function RBACConfigurator() {
  const [selectedRole, setSelectedRole] = useState("Property Manager");
  const [scopeRule, setScopeRule] = useState("Restricted by Property Assignment");
  const [toast, setToast] = useState<string | null>(null);

  const roles = [
    "Super Admin",
    "Property Manager",
    "Facility Manager",
    "Auditor",
    "Tenant Admin",
    "Vendor Admin",
    "Broker"
  ];

  const modules = [
    { name: "Property Listings", icon: "🏢", perms: [true, true, true, false, true, true] },
    { name: "Leads & Enquiries", icon: "📢", perms: [true, true, true, false, false, true] },
    { name: "RFQ & Bidding", icon: "🏷️", perms: [true, true, true, false, true, false] },
    { name: "Work Orders", icon: "⚙️", perms: [true, true, true, false, true, true] },
    { name: "Payments & Escrow", icon: "💳", perms: [true, false, false, false, false, true] },
    { name: "Compliance Certificates", icon: "🛡️", perms: [true, true, true, false, true, true] },
    { name: "Tenant Profiles", icon: "👥", perms: [true, true, true, false, false, true] },
    { name: "Analytics Dashboard", icon: "📊", perms: [true, false, false, false, false, true] },
    { name: "Vendor Management", icon: "🏬", perms: [true, false, false, false, true, true] },
    { name: "Security Logs", icon: "🔒", perms: [false, false, false, false, false, false] }
  ];

  const permHeaders = [
    { label: "VIEW", icon: "👁️" },
    { label: "CREATE", icon: "⊕" },
    { label: "EDIT", icon: "✏️" },
    { label: "DELETE", icon: "🗑️" },
    { label: "APPROVE ACTION", icon: "✓" },
    { label: "EXPORT DATA", icon: "⤓" }
  ];

  const [matrix, setMatrix] = useState(modules.map((m) => [...m.perms]));

  const toggleCell = (modIdx: number, permIdx: number) => {
    const updated = [...matrix];
    updated[modIdx][permIdx] = !updated[modIdx][permIdx];
    setMatrix(updated);
  };

  const handleSave = () => {
    setToast(`Custom roles and permissions saved for ${selectedRole}!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Role Configuration Mapping</h1>
          <p className="text-sm text-gray-500 mt-1">Select a role to define granular access controls across the platform modules.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          💾 Save Custom Roles
        </button>
      </div>

      {/* Role Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRole === r
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {selectedRole === r ? `✓ ${r}` : r}
          </button>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[260px]">
                MODULE NAME
              </th>
              {permHeaders.map((ph) => (
                <th key={ph.label} className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{ph.icon}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{ph.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, modIdx) => (
              <tr key={mod.name} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{mod.icon}</span>
                    <span className="text-xs font-bold text-gray-800">{mod.name}</span>
                  </div>
                </td>
                {matrix[modIdx].map((checked, permIdx) => (
                  <td key={permIdx} className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleCell(modIdx, permIdx)}
                      className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors cursor-pointer ${
                        checked ? "bg-[#0F8B7D] text-white" : "border border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      {checked && <Check size={12} strokeWidth={3} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Boundary Rules */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            ⎇
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Data Boundary Rules</h2>
            <p className="text-xs text-gray-500">Enforce logical separation of data based on operational scope.</p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-6 pt-2">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Scope Restriction Layer</label>
            <p className="text-xs text-gray-500 mb-3">
              This setting dictates if the selected role can view all platform data, or only data explicitly associated with their assignments (e.g. specific buildings or portfolios).
            </p>
            <select
              value={scopeRule}
              onChange={(e) => setScopeRule(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
            >
              <option>Restricted by Property Assignment</option>
              <option>Full Global Organization Scope</option>
              <option>Restricted by City / Region</option>
            </select>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900 mb-1">Impact Analysis</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                When &ldquo;Restricted by Property Assignment&rdquo; is active, Property Managers will only see Leads, Work Orders, and Leases for buildings they explicitly manage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
