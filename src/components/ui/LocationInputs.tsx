"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, Building2, Check, Loader2, X, ChevronDown, Compass } from "lucide-react";
import {
  INDIAN_STATES,
  ALL_INDIAN_CITIES_DETAILED,
  MAJOR_METROS,
  getStateForCity,
  getCitiesForState,
  IndianState,
  IndianCity
} from "@/lib/location-data";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ADDRESS AUTOCOMPLETE (Google Maps / Geocoding Live Engine)
// ─────────────────────────────────────────────────────────────────────────────

export interface GeocodeLocation {
  id?: string;
  buildingName?: string;
  displayName: string;
  fullAddress: string;
  address?: string;
  area?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectLocation?: (location: GeocodeLocation) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  state?: string;
  city?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelectLocation,
  placeholder = "e.g. Plot C-59, G Block BKC, Bandra East, Mumbai",
  className = "",
  label,
  required = false,
  disabled = false,
  state = "",
  city = "",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodeLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal query when external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch geocoded suggestions
  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const cityParam = city ? `&city=${encodeURIComponent(city.trim())}` : "";
      const stateParam = state ? `&state=${encodeURIComponent(state.trim())}` : "";
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(text.trim())}${cityParam}${stateParam}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
        setIsOpen((data.results || []).length > 0);
      }
    } catch (err) {
      console.error("Address geocoding error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [city, state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setActiveIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(val);
      }, 250);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (item: GeocodeLocation) => {
    const primaryText = item.fullAddress || item.displayName;
    setQuery(primaryText);
    onChange(primaryText);
    setIsOpen(false);
    setSuggestions([]);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-teal-600 pointer-events-none">
          <MapPin size={15} />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-9 pr-8 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all ${className}`}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin text-teal-600" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Compass size={11} className="text-teal-600" />
              Address Suggestions ({suggestions.length})
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Use ↑↓ &amp; Enter</span>
          </div>

          <div className="divide-y divide-slate-100">
            {suggestions.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={`${item.id || "loc"}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <MapPin
                    size={15}
                    className={`shrink-0 mt-0.5 ${
                      isSelected ? "text-teal-600" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.buildingName || item.area || item.displayName.split(",")[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.fullAddress || item.displayName}
                    </p>
                    {(item.city || item.state || item.country) && (
                      <div className="flex items-center gap-2 mt-1">
                        {item.city && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                            {item.city}
                          </span>
                        )}
                        {item.state && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 font-semibold text-teal-700">
                            {item.state}
                          </span>
                        )}
                        {item.country && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 font-semibold text-indigo-700">
                            {item.country}
                          </span>
                        )}
                        {item.pincode && (
                          <span className="text-[9px] font-mono text-slate-400">
                            {item.pincode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {query.trim().length >= 3 && (
            <button
              type="button"
              onClick={() => {
                onChange(query.trim());
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 bg-slate-50 hover:bg-teal-50 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-teal-700 transition-colors"
            >
              <Check size={13} className="text-teal-600 shrink-0" />
              <span className="truncate">Keep entered address: &ldquo;{query}&rdquo;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CITY AUTOCOMPLETE (Full Indian Cities Master + Live Typeahead Search)
// ─────────────────────────────────────────────────────────────────────────────

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  onSelectCityAndState?: (city: string, state: string, stateCode: string) => void;
  selectedState?: string;       // When provided, strictly limits cities to this state
  requireStateFirst?: boolean;  // When true, displays prompt if state is empty
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelectCityAndState,
  selectedState,
  requireStateFirst = false,
  placeholder,
  className = "",
  label,
  required = false,
  disabled = false,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter cities based on query and selectedState
  const cleanQ = query.trim().toLowerCase();
  const stateScopedPool = selectedState
    ? getCitiesForState(selectedState)
    : ALL_INDIAN_CITIES_DETAILED;

  const filteredCities = cleanQ
    ? stateScopedPool.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQ) ||
          (!selectedState && c.state.toLowerCase().includes(cleanQ))
      ).slice(0, 20)
    : selectedState
    ? stateScopedPool.slice(0, 25)
    : ALL_INDIAN_CITIES_DETAILED.filter((c) => c.isMajorHub).slice(0, 12);

  const isStateMissing = Boolean(requireStateFirst && !selectedState);

  const handleSelect = (item: IndianCity) => {
    setQuery(item.name);
    onChange(item.name);
    setIsOpen(false);

    if (onSelectCityAndState) {
      onSelectCityAndState(item.name, item.state, item.stateCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredCities.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredCities.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCities.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredCities[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <Building2 size={14} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (!isStateMissing) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isStateMissing
              ? "Select State first..."
              : placeholder || (selectedState ? `Select city in ${selectedState}...` : "e.g. Mumbai, Bengaluru, Delhi...")
          }
          disabled={disabled || isStateMissing}
          required={required}
          className={`w-full pl-8 pr-7 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        />

        <div className="absolute right-2.5 text-slate-400 pointer-events-none">
          <ChevronDown size={13} />
        </div>
      </div>

      {isOpen && !isStateMissing && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>
              {selectedState
                ? `Cities in ${selectedState} (${filteredCities.length})`
                : cleanQ
                ? `Cities Matching "${query}"`
                : "Major Real Estate Hubs"}
            </span>
            <span className="text-[9px] text-slate-400 font-normal">
              {selectedState ? "Filtered by State" : "All India Options"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredCities.length > 0 ? (
              filteredCities.map((item, idx) => {
                const isSelected = idx === activeIndex || query.toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={`${item.name}-${item.state}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected ? "bg-teal-50 text-teal-950 font-bold" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-2 shrink-0">
                      {item.state}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-3 text-xs text-slate-500">
                <p>
                  No preset cities found in {selectedState || "selection"} for &ldquo;{query}&rdquo;.
                </p>
                <p className="text-[11px] text-teal-600 mt-1">
                  You can keep &ldquo;{query}&rdquo; as a custom city.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATE AUTOCOMPLETE (All 36 Indian States & UTs with GST Code Suggestions)
// ─────────────────────────────────────────────────────────────────────────────

interface StateAutocompleteProps {
  value: string;
  onChange: (stateVal: string) => void;
  returnCodeFormat?: boolean; // If true, sets "27 - Maharashtra" instead of "Maharashtra"
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function StateAutocomplete({
  value,
  onChange,
  returnCodeFormat = false,
  placeholder = "e.g. Maharashtra or 27 - Maharashtra",
  className = "",
  label,
  required = false,
  disabled = false,
}: StateAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQ = query.trim().toLowerCase();
  const filteredStates = cleanQ
    ? INDIAN_STATES.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQ) ||
          s.code.includes(cleanQ) ||
          s.label.toLowerCase().includes(cleanQ)
      )
    : INDIAN_STATES;

  const handleSelect = (s: IndianState) => {
    const selectedText = returnCodeFormat ? s.label : s.name;
    setQuery(selectedText);
    onChange(selectedText);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredStates.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredStates.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredStates.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredStates[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pr-7 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all ${className}`}
        />

        <div className="absolute right-2.5 text-slate-400 pointer-events-none">
          <ChevronDown size={13} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>All 36 States &amp; UTs (with GST Codes)</span>
            <span className="text-[9px] text-slate-400 font-normal">Select</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStates.map((s, idx) => {
              const isMatch =
                query.toLowerCase() === s.name.toLowerCase() ||
                query.toLowerCase() === s.label.toLowerCase();
              const isSelected = idx === activeIndex || isMatch;

              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected ? "bg-teal-50 text-teal-950 font-bold" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                      {s.code}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal shrink-0 ml-2">
                    {s.type === "Union Territory" ? "UT" : "State"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STATE-FIRST UNIFIED SELECTOR (State First, Then City strictly scoped to State)
// ─────────────────────────────────────────────────────────────────────────────

export interface StateCitySelectorProps {
  stateValue: string;
  cityValue: string;
  onStateChange: (state: string, stateCode?: string) => void;
  onCityChange: (city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  statePlaceholder?: string;
  cityPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  gridClassName?: string;
}

export function StateCitySelector({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  stateLabel = "State (GST) *",
  cityLabel = "City *",
  statePlaceholder = "Select State...",
  cityPlaceholder,
  required = true,
  disabled = false,
  className = "",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-3"
}: StateCitySelectorProps) {
  return (
    <div className={`${gridClassName} ${className}`}>
      {/* 1. STATE FIRST */}
      <div>
        <StateAutocomplete
          label={stateLabel}
          required={required}
          disabled={disabled}
          value={stateValue}
          placeholder={statePlaceholder}
          onChange={(newState) => {
            onStateChange(newState);
            // If state changes, verify if existing city belongs to the new state; if not, clear it
            if (cityValue && newState) {
              const validCities = getCitiesForState(newState).map((c) => c.name.toLowerCase());
              if (!validCities.includes(cityValue.toLowerCase())) {
                onCityChange("");
              }
            }
          }}
        />
      </div>

      {/* 2. CITY SECOND (Strictly scoped to the selected state) */}
      <div>
        <CityAutocomplete
          label={cityLabel}
          required={required}
          disabled={disabled || !stateValue}
          selectedState={stateValue}
          requireStateFirst={true}
          value={cityValue}
          placeholder={
            cityPlaceholder ||
            (stateValue ? `Select city in ${stateValue}...` : "Select State first")
          }
          onChange={(newCity) => onCityChange(newCity)}
        />
      </div>
    </div>
  );
}
