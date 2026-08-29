"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Building, MapPin, X, Navigation, ArrowLeft, SlidersHorizontal, Star, Heart } from "lucide-react";

export default function PublicSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapQuery, setMapQuery] = useState("India");
  const [properties, setProperties] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [readinessFilter, setReadinessFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("score"); // score, rent, area, commute
  const [shortlisted, setShortlisted] = useState<number[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Local suggestions mock to match exact user searches
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
          // Pre-populate with mock scores and readiness
          const formatted = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            city: p.city,
            address: p.address,
            areaValue: p.totalArea ? parseFloat(p.totalArea) : 5000,
            area: parseFloat(p.totalArea || "5000").toLocaleString() + " sqft",
            rentValue: p.name.includes("Apex") ? 180000 : p.name.includes("Meridian") ? 120000 : 150000,
            rent: p.name.includes("Apex") ? "₹1,80,000/mo" : p.name.includes("Meridian") ? "₹1,20,000/mo" : "₹1,50,000/mo",
            grade: p.grade || "A",
            score: p.name.includes("Apex") ? 86 : p.name.includes("Meridian") ? 89 : 82,
            commuteScore: p.name.includes("Apex") ? 92 : p.name.includes("Meridian") ? 88 : 79,
            readiness: p.name.includes("Apex") ? "Ready to Move" : "Under Fit-out"
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
      const matches = localMockSuggestions.filter(item => 
        item.display_name.toLowerCase().includes(query.toLowerCase())
      );

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=4`, {
          headers: { "Accept-Language": "en" }
        });
        const data = await res.json();
        
        const merged = [...matches, ...data.map((item: any) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon
        }))];

        const unique = merged.filter((v, i, a) => a.findIndex(t => t.display_name === v.display_name) === i);
        setSuggestions(unique);
      } catch (err) {
        setSuggestions(matches);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside listener to hide suggestions
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

  // Filter & Rank listings based on query + filters + sort selection
  const sortedProperties = properties
    .filter(p => {
      // 1. Text filter
      const q = query.trim().toLowerCase();
      let textMatches = true;
      if (q) {
        const searchTerms = q.split(/[\s,]+/).filter(t => t.length > 2);
        if (searchTerms.length > 0) {
          textMatches = searchTerms.some(term => 
            p.name.toLowerCase().includes(term) ||
            p.address.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term)
          );
        }
      }

      // 2. Grade filter
      let gradeMatches = true;
      if (gradeFilter !== "ALL") {
        gradeMatches = p.grade === gradeFilter;
      }

      // 3. Readiness filter
      let readinessMatches = true;
      if (readinessFilter !== "ALL") {
        readinessMatches = p.readiness === readinessFilter;
      }

      return textMatches && gradeMatches && readinessMatches;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "commute") return b.commuteScore - a.commuteScore;
      if (sortBy === "rent") return a.rentValue - b.rentValue;
      if (sortBy === "area") return b.areaValue - a.areaValue;
      return 0;
    });

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans bg-slate-100 flex flex-col">
      
      {/* Real Maps background filling the screen */}
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

      {/* Floating Header & Search Control Overlay (OFFICEX Blue theme) */}
      <div className="absolute top-6 left-6 z-10 w-full max-w-[420px] flex flex-col gap-3" ref={searchRef}>
        
        {/* Floating Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 flex flex-col gap-3">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
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
                placeholder="Search location (e.g. BKC, Hinjewadi)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs font-semibold bg-slate-50/50"
              />
              <Search size={14} className="absolute left-3 text-slate-400" />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-650"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* Autocomplete Suggestions list */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="border-t border-slate-100 pt-2 flex flex-col max-h-[220px] overflow-y-auto">
              {suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                  <span className="truncate">{loc.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Responsive Advanced Filters Row */}
          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <div className="flex-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Building Grade</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold bg-white text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="ALL">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Readiness State</label>
              <select
                value={readinessFilter}
                onChange={(e) => setReadinessFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold bg-white text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="ALL">All Readiness</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Fit-out">Under Fit-out</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort & Rank</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold bg-white text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
              >
                <option value="score">Property Score</option>
                <option value="commute">Commute Score</option>
                <option value="rent">Rent (Low to High)</option>
                <option value="area">Area (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Floating Property Results list card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-h-[calc(100vh-210px)] overflow-y-auto flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
              {sortedProperties.length > 0 ? "OfficeX Verified Listings" : "No active listings"}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F8B7D] font-bold text-[9px] uppercase tracking-wider">Map Active</span>
          </div>

          {/* Render matched list */}
          {sortedProperties.map((prop, idx) => {
            const isShortlisted = shortlisted.includes(prop.id);
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 hover:border-[#0F8B7D] bg-white flex flex-col gap-2.5 transition-all shadow-xs relative">
                
                {/* Save/Shortlist Bookmark Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isShortlisted) {
                      setShortlisted(shortlisted.filter(id => id !== prop.id));
                    } else {
                      setShortlisted([...shortlisted, prop.id]);
                    }
                  }}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title={isShortlisted ? "Remove from shortlist" : "Save to shortlist"}
                >
                  <Heart size={14} className={isShortlisted ? "fill-red-500 text-red-500" : "text-slate-400"} />
                </button>

                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                      <Building size={13} className="text-[#0F8B7D]" />
                      {prop.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{prop.address}, {prop.city}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-black text-[#0F8B7D]">{prop.rent}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-black text-slate-500 uppercase mt-0.5">Grade {prop.grade}</span>
                  </div>
                </div>

                {/* Score Badges row */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 text-[10px] font-bold">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-[#0F8B7D] text-[9px] font-extrabold">
                      Score: {prop.score}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-extrabold">
                      Commute: {prop.commuteScore}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">{prop.readiness}</span>
                  </div>
                  <Link href={`/public/property/${prop.id}`} className="px-3 py-1 rounded bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-[9px] transition-colors shrink-0">
                    View Space
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {sortedProperties.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-xs text-slate-650 leading-relaxed font-bold">
                No matching OfficeX workspace listings found.
              </p>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                You can submit your customized workplace requirements to our CRM team to locate a property suite for you.
              </p>
              <Link href="/public/wizard" className="mt-4 block w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white text-center font-bold text-[10px] shadow-md transition-colors">
                Request Office Here
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
