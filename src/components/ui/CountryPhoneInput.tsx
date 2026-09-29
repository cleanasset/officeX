"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Phone, Check } from "lucide-react";

export interface CountryInfo {
  code: string;       // ISO 2-letter
  name: string;
  dialCode: string;   // e.g. "+91"
  flag: string;       // emoji flag
  formatPlaceholder: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", formatPlaceholder: "98200 12345" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", formatPlaceholder: "50 123 4567" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", formatPlaceholder: "(555) 000-0000" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", formatPlaceholder: "7911 123456" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", formatPlaceholder: "8123 4567" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦", formatPlaceholder: "50 123 4567" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦", formatPlaceholder: "3312 3456" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", formatPlaceholder: "(555) 000-0000" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", formatPlaceholder: "412 345 678" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", formatPlaceholder: "151 1234567" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", formatPlaceholder: "6 12 34 56 78" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱", formatPlaceholder: "6 12345678" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭", formatPlaceholder: "79 123 45 67" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪", formatPlaceholder: "85 123 4567" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰", formatPlaceholder: "9123 4567" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", formatPlaceholder: "90 1234 5678" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", formatPlaceholder: "12-345 6789" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩", formatPlaceholder: "812-3456-7890" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭", formatPlaceholder: "3600 1234" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼", formatPlaceholder: "9001 2345" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲", formatPlaceholder: "9123 4567" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦", formatPlaceholder: "71 123 4567" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿", formatPlaceholder: "21 123 4567" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩", formatPlaceholder: "1712-345678" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", formatPlaceholder: "71 234 5678" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵", formatPlaceholder: "984-1234567" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭", formatPlaceholder: "917 123 4567" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳", formatPlaceholder: "91 234 5678" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷", formatPlaceholder: "(11) 91234-5678" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽", formatPlaceholder: "55 1234 5678" },
];

export interface CountryPhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  defaultCountryCode?: string;
  error?: string;
  helperText?: string;
}

export function CountryPhoneInput({
  value = "",
  onChange,
  label,
  required = false,
  disabled = false,
  placeholder,
  className = "",
  defaultCountryCode = "IN",
  error,
  helperText,
}: CountryPhoneInputProps) {
  // Parse initial country and phone
  const parseInitial = () => {
    if (!value) return { country: COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0], phone: "" };
    
    // Check if value starts with a known dial code
    const clean = value.trim();
    for (const c of COUNTRIES) {
      if (clean.startsWith(c.dialCode)) {
        return { country: c, phone: clean.slice(c.dialCode.length).trim() };
      }
    }
    return { country: COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0], phone: clean };
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => parseInitial().country);
  const [phoneNumber, setPhoneNumber] = useState<string>(() => parseInitial().phone);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    if (!value) {
      setPhoneNumber("");
      return;
    }
    for (const c of COUNTRIES) {
      if (value.startsWith(c.dialCode)) {
        setSelectedCountry(c);
        setPhoneNumber(value.slice(c.dialCode.length).trim());
        return;
      }
    }
    setPhoneNumber(value.trim());
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCountrySelect = (c: CountryInfo) => {
    setSelectedCountry(c);
    setIsOpen(false);
    setSearchQuery("");
    const formatted = phoneNumber ? `${c.dialCode} ${phoneNumber.trim()}` : "";
    onChange(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, spaces, and hyphens
    const cleaned = raw.replace(/[^\d\s-]/g, "");
    setPhoneNumber(cleaned);
    const formatted = cleaned ? `${selectedCountry.dialCode} ${cleaned.trim()}` : "";
    onChange(formatted);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-[#0D7B6C] focus-within:border-[#0D7B6C] transition-all">
        {/* Country Selector Trigger */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="h-10 px-3 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 rounded-l-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer disabled:opacity-50 select-none"
            title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs text-slate-700">{selectedCountry.dialCode}</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Searchable Country Dropdown Modal/List */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-1">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0D7B6C] font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountry.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full px-3 py-2 flex items-center justify-between text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-teal-50 text-[#0D7B6C] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-base leading-none shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500">{c.dialCode}</span>
                          {isSelected && <Check size={13} className="text-[#0D7B6C]" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No countries matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Number Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            disabled={disabled}
            required={required}
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder || selectedCountry.formatPlaceholder}
            className="w-full h-10 px-3.5 py-2 text-xs font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Error or Helper text */}
      {error ? (
        <p className="text-[10px] text-rose-600 font-semibold mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
export default CountryPhoneInput;
