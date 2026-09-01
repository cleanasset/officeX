"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Search, X, Loader2, Globe } from "lucide-react";

export interface GeoLocationResult {
  id: string;
  name?: string;
  buildingName?: string;
  displayName: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  microMarket?: string;
  lat?: string;
  lon?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (displayText: string, locationMeta?: GeoLocationResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search any locality, area, landmark, or city (e.g. Nikol, Bandra, Whitefield, GIFT City)...",
  label = "SEARCH LOCATION ON MAP (GOOGLE MAPS PLACES AUTOCOMPLETE)",
  required = false,
  className = ""
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoLocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle live search with debouncing
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
        console.error("Failed to fetch map locations", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: GeoLocationResult) => {
    setQuery(item.displayName);
    onChange(item.displayName, item);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[9px] font-bold text-[#0F8B7D] flex items-center gap-1">
            <Globe size={11} /> Real Map Geocoding Active
          </span>
        </div>
      )}

      <div className="relative flex items-center">
        <MapPin size={16} className="absolute left-3.5 text-[#0F8B7D] pointer-events-none" />
        
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
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0F8B7D] focus:ring-2 focus:ring-teal-50 shadow-2xs transition-all"
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

      {/* Live Map Suggestions Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-72 overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-2xl divide-y divide-gray-50">
          <div className="p-2.5 bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>📍 Map Location Recommendations</span>
            <span>{isLoading ? "Searching map..." : `${suggestions.length} Results`}</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/60 transition-colors flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 group-hover:bg-[#0F8B7D] text-[#0F8B7D] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <Navigation size={13} />
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#0F8B7D] transition-colors leading-tight">
                    {item.area || item.displayName.split(",")[0]}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">
                    {item.displayName}
                  </span>
                </div>
              </button>
            ))
          ) : !isLoading ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No matching map location found. You can type any custom address.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
