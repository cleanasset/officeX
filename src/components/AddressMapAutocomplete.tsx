"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Building, Check, Search, X, Sparkles } from "lucide-react";
import { searchRealAddresses, AddressSuggestion } from "@/lib/indianLocations";

interface AddressMapAutocompleteProps {
  value: string;
  onChange: (val: string, suggestion?: AddressSuggestion) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function AddressMapAutocomplete({
  value,
  onChange,
  placeholder = "Search commercial street address, IT park, or landmark (e.g. GIFT City, SG Highway, BKC, DLF Cyber City)...",
  label = "FULL PHYSICAL ADDRESS / GOOGLE MAP LOCATION",
  required = false
}: AddressMapAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setSuggestions(searchRealAddresses(query));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (addr: AddressSuggestion) => {
    setQuery(addr.fullAddress);
    onChange(addr.fullAddress, addr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full text-xs">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[9px] font-bold text-[#0F8B7D] flex items-center gap-1">
            <Sparkles size={11} /> Real Map Address Suggestions
          </span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={query}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onChange(val);
            if (val.trim().length > 0) {
              setIsOpen(true);
              setSuggestions(searchRealAddresses(val));
            } else {
              setIsOpen(false);
              setSuggestions([]);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] focus:ring-2 focus:ring-teal-50 resize-none h-20 shadow-2xs font-medium text-gray-900"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown with Real Map Suggestions */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl divide-y divide-gray-50">
          <div className="p-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>📍 Real Commercial Address Matches</span>
            <span>Click to auto-populate</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/60 transition-colors flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                    {item.fullAddress}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                    Landmark: {item.landmark} • Transit: {item.metroDistance}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">
              Type your custom commercial building street address.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
