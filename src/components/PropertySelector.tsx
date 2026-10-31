"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { getClientAuthHeaders } from "@/lib/auth-storage";

export interface PropertyOption {
  id: string;
  name: string;
  code?: string;
  city?: string;
}

export default function PropertySelector() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [selectedPropertyName, setSelectedPropertyName] = useState<string>("All Properties");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch properties for this organization (both rent-roll & general properties)
    const authHeaders = getClientAuthHeaders();
    Promise.all([
      fetch("/api/rent-roll/properties", { headers: authHeaders }).then((r) => r.json()).catch(() => null),
      fetch("/api/properties").then((r) => r.json()).catch(() => null),
    ])
      .then(([rrData, propData]) => {
        const rrList = Array.isArray(rrData?.data) ? rrData.data : [];
        const legacyList = Array.isArray(propData) ? propData : (propData?.properties || []);

        const map = new Map<string, PropertyOption>();
        for (const p of rrList) {
          if (p.id) {
            map.set(p.id, {
              id: p.id,
              name: p.property_name || p.name || "Commercial Property",
              code: p.property_code || p.code,
              city: p.city,
            });
          }
        }
        for (const p of legacyList) {
          if (p.id && !map.has(p.id)) {
            map.set(p.id, {
              id: p.id,
              name: p.name || p.property_name || "Commercial Property",
              code: p.code || p.property_code,
              city: p.city,
            });
          }
        }
        const list = Array.from(map.values());
        setProperties(list);

        // Check if property was previously saved
        if (typeof window !== "undefined") {
          const savedId = localStorage.getItem("officex_selected_property") || "all";
          setSelectedPropertyId(savedId);

          if (savedId !== "all") {
            const found = list.find((p: any) => p.id === savedId || p.name.toLowerCase() === savedId.toLowerCase());
            if (found) {
              setSelectedPropertyName(found.name);
              // Dispatch to sync all pages on load
              window.dispatchEvent(
                new CustomEvent("officex-property-change", {
                  detail: { propertyId: found.id, propertyName: found.name },
                })
              );
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load properties for selector:", err);
      });

    // Close on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleGlobalUpdate = (e: any) => {
      if (e.detail?.propertyId) setSelectedPropertyId(e.detail.propertyId);
      if (e.detail?.propertyName) setSelectedPropertyName(e.detail.propertyName);
    };
    window.addEventListener("officex-property-change", handleGlobalUpdate);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("officex-property-change", handleGlobalUpdate);
    };
  }, []);

  const handleSelect = (id: string, name: string) => {
    setSelectedPropertyId(id);
    setSelectedPropertyName(name);
    setIsOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("officex_selected_property", id);
      localStorage.setItem("officex_selected_property_name", name);
      document.cookie = `officex_property_id=${encodeURIComponent(id)}; path=/; max-age=86400; SameSite=Lax`;

      // Broadcast change event to entire app so any active dashboard instantly re-scopes
      window.dispatchEvent(
        new CustomEvent("officex-property-change", {
          detail: { propertyId: id, propertyName: name },
        })
      );
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer max-w-full"
        title="Scope all dashboards and rent roll to selected property (§2.1)"
      >
        <Building2 size={13} className="text-[#0F8B7D] shrink-0" />
        <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">Property:</span>
        <span className="font-bold text-slate-800 truncate max-w-[85px] sm:max-w-[150px]">
          {selectedPropertyName}
        </span>
        <ChevronDown size={13} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Select Property Scope (§2.1)
            </span>
            <span className="text-[10px] font-bold text-teal-700">
              {properties.length} Available
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {/* All Properties option */}
            <button
              onClick={() => handleSelect("all", "All Properties")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                selectedPropertyId === "all"
                  ? "bg-teal-50 text-[#0F8B7D] font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 size={14} className={selectedPropertyId === "all" ? "text-[#0F8B7D]" : "text-slate-400"} />
                <span>All Properties (Portfolio Wide)</span>
              </div>
              {selectedPropertyId === "all" && <Check size={14} className="text-[#0F8B7D]" />}
            </button>

            {/* Individual properties */}
            {properties.map((p) => {
              const isSelected = selectedPropertyId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id, p.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-teal-50 text-[#0F8B7D] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate text-slate-900 font-bold">{p.name}</p>
                    {p.city && <p className="text-[10px] text-slate-400">{p.city}</p>}
                  </div>
                  {isSelected && <Check size={14} className="text-[#0F8B7D] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
