"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Search,
  Loader2,
  X,
  CheckCircle2,
  Building2,
  Sparkles,
  Globe,
  Navigation,
} from "lucide-react";

export interface AddressAutofillResult {
  fullAddress: string;
  streetAddress: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  microMarket: string;
  latitude: number | null;
  longitude: number | null;
}

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onAddressSelect: (result: AddressAutofillResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  hint?: string;
}

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Search property address, landmark, building...",
  label = "Property Address",
  required = false,
  className = "",
  hint = "Type any building, landmark, or street name. Selecting an address autofills City, State & Pincode.",
}: GoogleAddressAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [autofilledBadge, setAutofilledBadge] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync internal query if external value changes (e.g. from parent reset or edit)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search handler hitting our multi-engine / Google geocode endpoint
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.warn("Geocode suggestions fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setAutofilledBadge(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 280);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    setAutofilledBadge(null);
    inputRef.current?.focus();
  };

  const handleSelect = (item: any) => {
    // Extract clean street address vs complete display name
    const bName = item.buildingName || "";
    const fAddress = item.fullAddress || item.displayName || "";
    
    // Choose clean street address representation
    let streetAddress = fAddress;
    if (bName && !fAddress.toLowerCase().startsWith(bName.toLowerCase())) {
      streetAddress = `${bName}, ${fAddress}`;
    }

    const payload: AddressAutofillResult = {
      fullAddress: fAddress,
      streetAddress: streetAddress,
      pincode: item.pincode || "",
      city: item.city || "",
      state: item.state || "",
      country: item.country || "India",
      microMarket: item.area || bName || "",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    };

    setQuery(streetAddress);
    onChange(streetAddress);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    // Call parent autofill
    onAddressSelect(payload);

    // Show nice confirmation badge
    const detailParts = [payload.city, payload.state, payload.pincode ? `PIN: ${payload.pincode}` : ""]
      .filter(Boolean)
      .join(", ");
    setAutofilledBadge(detailParts ? `Autofilled: ${detailParts}` : "Address Autofilled from Google Maps");
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin size={13} className="text-red-500 shrink-0" />
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        </div>
      )}

      {/* Main Autocomplete Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0D7B6C] transition-colors">
          {isLoading ? (
            <Loader2 size={15} className="animate-spin text-[#0D7B6C]" />
          ) : (
            <MapPin size={15} className="text-red-500" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0D7B6C] focus:ring-2 focus:ring-[#0D7B6C]/10 outline-none transition shadow-2xs"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
            title="Clear address"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Helpful Hint / Success Autofill Badge */}
      <div className="mt-1 flex items-center justify-between">
        {autofilledBadge ? (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 animate-in fade-in duration-200">
            <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
            <span>{autofilledBadge}</span>
          </div>
        ) : (
          hint && <p className="text-[11px] text-slate-500 font-normal">{hint}</p>
        )}
      </div>

      {/* Google Maps Style Suggestions Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-teal-600" />
              Worldwide Google Maps Suggestions
            </span>
            <span>Click to autofill PIN, City & State</span>
          </div>

          <div className="divide-y divide-slate-100">
            {suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const title = item.buildingName || item.displayName?.split(",")?.[0] || "Location";
              const subtitle = item.fullAddress || item.displayName || "";

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition cursor-pointer ${
                    isSelected ? "bg-teal-50/80 text-teal-950" : "hover:bg-slate-50/80 text-slate-800"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MapPin size={14} className="text-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {title}
                      </span>
                      {item.city && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {item.city}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {subtitle}
                    </p>
                    {item.pincode && (
                      <span className="inline-block mt-1 text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/50">
                        PIN: {item.pincode}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Powered by Google Maps & Global Geocoding</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono">
              ESC to close
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
}
