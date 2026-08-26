"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, HelpCircle, Building, MapPin, ArrowRight } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate simple breadcrumbs from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const formattedBreadcrumb = pathParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("  >  ");

  const popularDestinations = [
    { name: "Ahmedabad", type: "City", count: "3 Listed Assets" },
    { name: "Mumbai", type: "City", count: "5 Listed Assets" },
    { name: "Bengaluru", type: "City", count: "4 Listed Assets" },
    { name: "Apex Business Tower", type: "Building", location: "BKC, Mumbai" },
    { name: "Meridian Tech Park", type: "Building", location: "Whitefield, Bengaluru" },
    { name: "Nexus Hub", type: "Building", location: "Hinjewadi, Pune" },
    { name: "Devasya Gold Plus", type: "Building", location: "Nikol, Ahmedabad" }
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = popularDestinations.filter(d => 
        d.name.toLowerCase().includes(q) || (d.location && d.location.toLowerCase().includes(q))
      );
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setIsDropdownOpen(false);
    router.push(`/public/search?q=${encodeURIComponent(name)}`);
  };

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 fixed top-0 right-0 left-[260px] z-20 px-8 flex items-center justify-between shadow-sm">
      
      {/* Left Breadcrumbs */}
      <div className="text-xs font-bold text-gray-700 uppercase tracking-widest">
        {formattedBreadcrumb || "Dashboard"}
      </div>

      {/* Right Search, Notification and Avatar */}
      <div className="flex items-center gap-6">
        
        {/* Functional Search Input Box */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search properties, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length > 0) setIsDropdownOpen(true); }}
              className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0F8B7D] text-xs w-64 bg-gray-50 transition-colors"
            />
            <Search size={14} className="absolute left-3.5 top-2.5 text-gray-600" />
          </form>

          {/* Search Autocomplete Suggestions Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Matching Cities & Properties
              </div>
              <div className="flex flex-col max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.name)}
                    className="p-3 text-left hover:bg-teal-50/50 flex items-center justify-between border-b border-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.type === "City" ? (
                        <MapPin size={14} className="text-[#0F8B7D]" />
                      ) : (
                        <Building size={14} className="text-purple-600" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 text-xs block">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{item.location || item.count}</span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Link */}
        <a href="#help" className="text-gray-500 hover:text-[#0F8B7D] transition-colors" title="Help & Documentation">
          <HelpCircle size={18} />
        </a>

        {/* Notifications Icon with Red Dot */}
        <button className="relative text-gray-500 hover:text-[#0F8B7D] transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse-green"></span>
        </button>

        {/* User Mini Avatar */}
        <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-primary-teal text-xs shadow-sm">
          U
        </div>

      </div>

    </header>
  );
}
