"use client";

import React, { useState, useRef, useEffect } from "react";
import { Building, MapPin, Search, X, Loader2, Globe } from "lucide-react";

export interface PropertySuggestionItem {
  id: string;
  buildingName: string;
  displayName: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress?: string;
  metroDistance?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface PropertyTitleAutocompleteProps {
  value: string;
  onChange: (name: string, selectedMeta?: PropertySuggestionItem) => void;
  placeholder?: string;
}

export default function PropertyTitleAutocomplete({
  value,
  onChange,
  placeholder = "e.g. Shivalik Shilp, Mondeal Heights, Devasya, GIFT One..."
}: PropertyTitleAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PropertySuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(text.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch property suggestions", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: PropertySuggestionItem) => {
    setQuery(item.buildingName);
    onChange(item.buildingName, item);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 w-full">
      <div className="relative flex items-center">
        <Building size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
        
        <input
          type="text"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D] focus:ring-2 focus:ring-teal-50 text-xs font-semibold text-gray-900 bg-white shadow-2xs"
        />

        {isLoading ? (
          <Loader2 size={14} className="absolute right-3 text-[#0F8B7D] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Google Maps Places Recommendations Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl divide-y divide-gray-50">
          <div className="p-2.5 bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#0F8B7D]">
              <Globe size={11} /> Google Maps Places Autocomplete
            </span>
            <span>{isLoading ? "Searching..." : `${suggestions.length} Places Found`}</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/70 transition-colors flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-[#0F8B7D] text-gray-500 group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <MapPin size={13} />
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#0F8B7D] transition-colors leading-tight">
                    {item.buildingName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5 truncate">
                    {item.displayName || item.fullAddress}
                  </span>
                </div>
              </button>
            ))
          ) : !isLoading ? (
            <div className="p-3.5 text-center text-xs text-gray-400">
              Not listed on Google Maps yet? You can manually type your property name & address details below.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
