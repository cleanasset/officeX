"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Building, MapPin, X, Navigation, ArrowLeft } from "lucide-react";

export default function PublicSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapQuery, setMapQuery] = useState("India");
  const [properties, setProperties] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Local suggestions mock to match exact user searches from mobile
  const localMockSuggestions = [
    { display_name: "DEVASYA GOLD PLUS, New India Colony, Nikol, Ahmedabad", lat: "23.047863", lon: "72.678411" },
    { display_name: "Devasya Gold, Devasya Rd, Gandhinagar, Gujarat", lat: "23.192534", lon: "72.648352" },
    { display_name: "DEVASYA GOLD, Hill Town Circle Road, near PDPU, Gandhinagar", lat: "23.159412", lon: "72.661245" },
    { display_name: "Nikol, Ahmedabad, Gujarat, India", lat: "23.0435", lon: "72.6749" }
  ];

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            city: p.city,
            address: p.address,
            area: parseFloat(p.totalArea).toLocaleString() + " sqft",
            rent: "₹1,05,000/mo"
          }));
          setProperties(formatted);
        }
      } catch (err) {
        console.error("Error loading search properties:", err);
      }
    };
    
    loadProperties();

    // Read query parameter from URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") || "";
      if (urlQuery) {
        setQuery(urlQuery);
        setMapQuery(urlQuery);
      }
    }
  }, []);

  // Handle Autocomplete fetching
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      // Find matches in local mocks first
      const matches = localMockSuggestions.filter(item => 
        item.display_name.toLowerCase().includes(query.toLowerCase())
      );

      try {
        // Fetch from OSM Nominatim search API for real-time global autocomplete suggestions
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=4`, {
          headers: { "Accept-Language": "en" }
        });
        const data = await res.json();
        
        // Merge lists, keeping local overrides on top
        const merged = [...matches, ...data.map((item: any) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon
        }))];

        // Deduplicate
        const unique = merged.filter((v, i, a) => a.findIndex(t => t.display_name === v.display_name) === i);
        setSuggestions(unique);
      } catch (err) {
        setSuggestions(matches);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside listener to hide suggestions list
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (loc: any) => {
    setQuery(loc.display_name);
    setMapQuery(loc.display_name);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMapQuery(query);
    setShowSuggestions(false);
  };

  // Filter local listings based on search text (robust multi-word & trimmed matching)
  const filteredProperties = properties.filter(p => {
    const q = query.trim().toLowerCase();
    if (!q) return true; // Show all listings if search is empty
    
    // Split by spaces and commas, filter out short connector words
    const searchTerms = q.split(/[\s,]+/).filter(t => t.length > 2);
    if (searchTerms.length === 0) return true;

    // Match if any of the significant search terms exists in name, address, or city
    return searchTerms.some(term => 
      p.name.toLowerCase().includes(term) ||
      p.address.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans bg-gray-100 flex flex-col">
      
      {/* Real Google Maps background filling the screen */}
      <div className="absolute inset-0 z-0">
        <iframe
          title="Google Map Search"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Floating Header & Search Control Overlay */}
      <div className="absolute top-6 left-6 z-10 w-full max-w-[400px] flex flex-col gap-3" ref={searchRef}>
        
        {/* Floating Search Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex flex-col gap-2">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search Google Maps location..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 text-xs bg-gray-50/50"
              />
              <Search size={14} className="absolute left-3 text-gray-400" />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* Autocomplete Suggestions list (appears as you type) */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 border-t border-gray-100 pt-2 flex flex-col max-h-[220px] overflow-y-auto">
              {suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin size={14} className="text-teal-600 shrink-0 mt-0.5" />
                  <span className="truncate">{loc.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Property Results list card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-h-[calc(100vh-180px)] overflow-y-auto flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
              {filteredProperties.length > 0 ? "OfficeX Listings Nearby" : "No active listings here"}
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 font-bold text-[9px]">Map Active</span>
          </div>

          {/* Render matched list */}
          {filteredProperties.map((prop, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-gray-100 hover:border-teal-500 bg-white flex flex-col gap-2 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                    <Building size={12} className="text-teal-600" />
                    {prop.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">{prop.address}, {prop.city}</p>
                </div>
                <span className="text-xs font-bold text-teal-600 shrink-0">{prop.rent}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 mt-1">
                <span>Area: {prop.area}</span>
                <Link href={`/public/property/${prop.id}`} className="px-2.5 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                  View Space
                </Link>
              </div>
            </div>
          ))}

          {/* No direct listings prompt */}
          {filteredProperties.length === 0 && (
            <div className="py-2">
              <p className="text-xs text-gray-600 leading-relaxed font-bold">
                No active OfficeX business suites found at this location.
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Centering Google Map on **{mapQuery}** for navigation. You can submit custom requirements to secure office spaces nearby.
              </p>
              <Link href="/public/wizard" className="mt-3 block w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-center font-bold text-[10px] shadow-sm transition-colors">
                Request Office Here
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
