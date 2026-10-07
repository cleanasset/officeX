"use client";

import React, { useState } from "react";
import {
  Building2,
  ClipboardList,
  Receipt,
  TrendingUp,
  Zap,
  ShieldCheck,
  Users,
  Headphones,
  BarChart3,
  FileCheck,
  Layers,
  Scale,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  X
} from "lucide-react";

export interface SpecRoleItem {
  key: string;
  label: string;
  badge: string;
  dashboardUrl: string;
  description: string;
  icon?: string;
  isPrimary?: boolean;
}

interface RoleSelectorModalProps {
  isOpen: boolean;
  roles: SpecRoleItem[];
  onSelectRole: (role: SpecRoleItem) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  Building2,
  ClipboardList,
  Receipt,
  TrendingUp,
  Zap,
  ShieldCheck,
  Users,
  Headphones,
  BarChart3,
  FileCheck,
  Layers,
  Scale,
};

export default function RoleSelectorModal({
  isOpen,
  roles,
  onSelectRole,
  onClose,
  canDismiss = false,
}: RoleSelectorModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>(roles[0]?.key || "owner");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredRoles = roles.filter(
    (r) =>
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    const chosen = roles.find((r) => r.key === selectedKey) || roles[0];
    if (chosen) {
      onSelectRole(chosen);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white relative">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex items-center gap-2 mb-1 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>OFFICEX Rent Roll · §5.14 Access Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Choose Your Workspace Role
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Select your operational role for this session. Dashboards, permissions, and approval actions will be dynamically scoped.
          </p>

          {/* Quick Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles (e.g. Finance, Leasing, FM, Owner)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Roles List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredRoles.map((role) => {
              const IconComp = (role.icon && ICON_MAP[role.icon]) || Building2;
              const isSelected = selectedKey === role.key;

              return (
                <div
                  key={role.key}
                  onClick={() => setSelectedKey(role.key)}
                  onDoubleClick={() => onSelectRole(role)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                    isSelected
                      ? "bg-white border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-md"
                      : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#0F8B7D] text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {role.label}
                        </h4>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border mt-1 ${role.badge}`}
                        >
                          {role.key}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2
                        size={18}
                        className="text-[#0F8B7D] shrink-0 mt-0.5"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching roles found for "{search}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            Active choice redirects to <span className="font-mono text-slate-700">{roles.find(r => r.key === selectedKey)?.dashboardUrl || "/dashboard"}</span>
          </div>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7367] text-white text-xs font-bold shadow-md shadow-[#0F8B7D]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
