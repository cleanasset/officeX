"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";

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
    // 1. Fetch properties for this organization
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.properties || [];
        setProperties(list);

        // Check if property was previously saved
        if (typeof window !== "undefined") {
          const savedId = localStorage.getItem("officex_selected_property") || "all";
          setSelectedPropertyId(savedId);

          if (savedId !== "all") {
            const found = list.find((p: any) => p.id === savedId);
            if (found) setSelectedPropertyName(found.name);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
        title="Scope all dashboards and rent roll to selected property (§2.1)"
      >
        <Building2 size={13} className="text-[#0F8B7D] shrink-0" />
        <span className="text-[11px] text-slate-400 font-medium">Property:</span>
        <span className="font-bold text-slate-800 truncate max-w-[150px]">
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
