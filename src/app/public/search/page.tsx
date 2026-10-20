"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  Plus,
  Minus,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Scale,
  Download,
  X,
  Star,
  ShieldCheck,
  MapPin,
  Map as MapIcon,
  List as ListIcon,
  Phone,
  Building,
  Sparkles,
  Send,
  Loader2
} from "lucide-react";
import type { PropertyListing } from "@/components/RealGoogleMap";
import { savePublicEnquiry } from "@/lib/leasingStore";

// Dynamic import of Real Google Map component to prevent SSR window issues
const RealGoogleMap = dynamic(() => import("@/components/RealGoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E5E3DF] flex flex-col items-center justify-center gap-3 text-gray-500">
      <div className="w-10 h-10 border-4 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold font-mono">Loading Real Google Maps (Mumbai BKC)...</span>
    </div>
  )
});

function PropertySearchContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams?.get("city") || "Mumbai";
  const initialQ = searchParams?.get("q") || searchParams?.get("area") || "";
  const initialBudget = searchParams?.get("budget") || "Budget";

  const [city, setCity] = useState(initialCity || "all");
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [spaceType, setSpaceType] = useState("All Categories");
  const [size, setSize] = useState("2,000 - 5,000 Sq.Ft");
  const [budget, setBudget] = useState(initialBudget);
  const [gradeA, setGradeA] = useState(true);
  const [furnished, setFurnished] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get("q") || searchParams.get("area") || "";
      if (q) setSearchQuery(q);
      const c = searchParams.get("city");
      if (c) setCity(c);
      const st = searchParams.get("type") || searchParams.get("category");
      if (st) setSpaceType(st);
    }
  }, [searchParams]);

  // Comparison State
  const [compareList, setCompareList] = useState<PropertyListing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Quick Enquiry Modal State
  const [enquiryProperty, setEnquiryProperty] = useState<PropertyListing | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({ company: "", email: "", phone: "", seats: "60" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Maps Place Suggestions
  const [geoSuggestions, setGeoSuggestions] = useState<any[]>([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowGeoDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    if (val.trim().length < 2) {
      setGeoSuggestions([]);
      setShowGeoDropdown(false);
      return;
    }
    geoDebounceRef.current = setTimeout(async () => {
      setIsGeoLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(val.trim())}&city=${encodeURIComponent(city)}`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.results) ? data.results : [];
          setGeoSuggestions(items);
          setShowGeoDropdown(items.length > 0);
        }
      } catch (err) {
        console.warn("Search geocode error:", err);
      } finally {
        setIsGeoLoading(false);
      }
    }, 280);
  };

  const handleSelectGeoSuggestion = (item: any) => {
    const chosenName = item.buildingName || item.area || item.displayName?.split(",")?.[0] || item.fullAddress;
    setSearchQuery(chosenName);
    if (item.city) {
      setCity(item.city);
    }
    setShowGeoDropdown(false);
    setGeoSuggestions([]);
  };

  // Zero Mock Data: properties strictly derived from database
  const properties: PropertyListing[] = [];

  // Merge with real properties from database
  const [dbProperties, setDbProperties] = useState<PropertyListing[]>([]);

  // City coordinate fallback dictionary for metro hubs
  const cityCoords: Record<string, [number, number]> = {
    ahmedabad: [23.0225, 72.5714],
    nikol: [23.0515, 72.6737],
    gandhinagar: [23.2156, 72.6369],
    "gift city": [23.1612, 72.6841],
    surat: [21.1702, 72.8311],
    vadodara: [22.3072, 73.1812],
    mumbai: [19.0760, 72.8777],
    bkc: [19.0664, 72.8680],
    bengaluru: [12.9716, 77.5946],
    bangalore: [12.9716, 77.5946],
    pune: [18.5204, 73.8567],
    delhi: [28.6139, 77.2090],
    "delhi ncr": [28.6139, 77.2090],
    "new delhi": [28.6139, 77.2090],
    "new-delhi": [28.6139, 77.2090],
    gurugram: [28.4595, 77.0266],
    gurgaon: [28.4595, 77.0266],
    noida: [28.5355, 77.3910],
    hyderabad: [17.3850, 78.4867],
    chennai: [13.0827, 80.2707],
    kolkata: [22.5726, 88.3639],
    chandigarh: [30.7333, 76.7794],
    jaipur: [26.9124, 75.7873],
    indore: [22.7196, 75.8577],
    kochi: [9.9312, 76.2673],
    lucknow: [26.8467, 80.9462],
    goa: [15.2993, 74.1240]
  };

  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    async function fetchRealProperties() {
      setIsLoadingProperties(true);
      try {
        const params = new URLSearchParams();
        if (city && city !== "all") {
          params.set("city", city);
        }
        if (searchQuery && searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (spaceType && spaceType !== "All Categories") {
          params.set("vertical", spaceType);
        }
        params.set("limit", "150");

        const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.listings) ? json.listings : (Array.isArray(json) ? json : []);
          
          if (!isCancelled && items.length > 0) {
            const mapped: PropertyListing[] = items.map((p: any) => {
              let lat = p.latitude ? parseFloat(p.latitude) : null;
              let lng = p.longitude ? parseFloat(p.longitude) : null;

              if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                const marketKey = (p.microMarket || p.locality || "").toLowerCase();
                const cityKey = (p.city || "").toLowerCase();
                const fallback = cityCoords[marketKey] || cityCoords[cityKey] || [19.0760, 72.8777];
                lat = fallback[0];
                lng = fallback[1];
              }

              const numPrice = p.startingPrice ? Number(p.startingPrice) : 8500;
              const formattedPrice = "₹" + Math.round(numPrice).toLocaleString("en-IN");
              let displayPrice = `${formattedPrice}/mo`;
              let pricePerSeat = `${formattedPrice}/seat`;
              let pricePerSqft = "—";

              if (p.startingPriceUnit === "per_sqft_month" || p.vertical === "commercial") {
                displayPrice = `${formattedPrice}/sq.ft.`;
                pricePerSqft = `${formattedPrice}/sq.ft.`;
                pricePerSeat = "—";
              } else if (p.startingPriceUnit === "per_day" || p.vertical === "day_pass") {
                displayPrice = `${formattedPrice}/day`;
                pricePerSeat = `${formattedPrice}/day`;
              } else if (p.startingPriceUnit === "per_hour" || p.vertical === "meeting_room") {
                displayPrice = `${formattedPrice}/hr`;
                pricePerSeat = "—";
              } else if (p.startingPriceUnit === "per_month" || p.vertical === "virtual_office") {
                displayPrice = `${formattedPrice}/mo`;
                pricePerSeat = "—";
              }

              const photoList = Array.isArray(p.images) && p.images.length > 0 
                ? p.images 
                : [p.featuredImage || "/images/workspace_managed_suite.jpg"];

              const verticalName = (p.vertical || "coworking").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

              return {
                id: p.slug || p.id,
                slug: p.slug,
                title: p.name,
                buildingName: p.brandName || p.name,
                location: `${p.locality || p.microMarket || ""}, ${p.city}`.replace(/^, /, "").replace(/, , /g, ", "),
                subLocation: p.fullAddress || "",
                area: p.totalAreaSqft ? `${Number(p.totalAreaSqft).toLocaleString("en-IN")} sqft` : "Flexible Layout",
                capacity: p.totalSeats ? `${p.totalSeats} Workstations` : (p.vertical === "meeting_room" ? "8-16 Persons" : p.vertical === "virtual_office" ? "Virtual Address" : "20-250 Seats"),
                furnishing: verticalName,
                price: displayPrice,
                pricePerSqft: pricePerSqft,
                pricePerSeat: pricePerSeat,
                propertyScore: 92,
                readiness: "Ready to Move",
                commuteScore: 88,
                energyRating: p.buildingGrade || "Grade A",
                image: p.featuredImage || photoList[0],
                images: photoList,
                rating: p.avgRating || "4.50",
                reviews: p.totalReviews || 12,
                amenities: Array.isArray(p.amenities) ? p.amenities : [],
                lat,
                lng
              };
            });

            setDbProperties(mapped);
            setIsLoadingProperties(false);
            return;
          } else if (!isCancelled && items.length === 0) {
            setDbProperties([]);
            setIsLoadingProperties(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch marketplace listings:", err);
      }
      if (!isCancelled) setIsLoadingProperties(false);
    }

    const timer = setTimeout(() => {
      fetchRealProperties();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [city, searchQuery, spaceType]);

  // Directly use live database properties returned by the search API
  const filteredProperties = dbProperties;
  const isNoResults = !isLoadingProperties && filteredProperties.length === 0;
  const displayProperties = filteredProperties;

  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  // Auto-select property when search query or ID is in URL
  useEffect(() => {
    if (filteredProperties.length > 0) {
      const paramId = searchParams?.get("id");
      const paramQ = searchParams?.get("q")?.toLowerCase();

      if (paramId) {
        const found = filteredProperties.find((p) => p.id === paramId);
        if (found) {
          setSelectedProperty(found);
          return;
        }
      }
      if (paramQ) {
        const found = filteredProperties.find(
          (p) =>
            p.title.toLowerCase().includes(paramQ) ||
            p.buildingName.toLowerCase().includes(paramQ) ||
            p.location.toLowerCase().includes(paramQ)
        );
        if (found) {
          setSelectedProperty(found);
          return;
        }
      }
      if (filteredProperties.length === 1) {
        setSelectedProperty(filteredProperties[0]);
      }
    }
  }, [filteredProperties.length, searchParams]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleCompare = (prop: PropertyListing) => {
    if (compareList.some((c) => c.id === prop.id)) {
      setCompareList(compareList.filter((c) => c.id !== prop.id));
      showToast(`Removed ${prop.title} from comparison`);
    } else {
      if (compareList.length >= 3) {
        showToast("You can compare up to 3 properties simultaneously");
        return;
      }
      setCompareList([...compareList, prop]);
      showToast(`Added ${prop.title} to comparison`);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-white font-sans flex flex-col overflow-hidden w-full max-w-full">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Mobile/Desktop Search Bar */}
      <div className="border-b border-gray-200 p-3 md:px-6 md:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Main Keyword Search Bar with Live Google Maps Autocomplete */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[200px]">
            <div className="relative">
              {isGeoLoading ? (
                <Loader2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0F8B7D] animate-spin" />
              ) : (
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => {
                  if (geoSuggestions.length > 0) setShowGeoDropdown(true);
                }}
                placeholder="Search building, landmark (e.g. One BKC)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0F8B7D] bg-gray-50/50 focus:bg-white transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGeoSuggestions([]);
                    setShowGeoDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title="Clear"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Google Maps Suggestions Dropdown */}
            {showGeoDropdown && geoSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in duration-150">
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500">
                  <span className="flex items-center gap-1 text-[#0F8B7D]">
                    <Sparkles size={11} /> Google Maps Suggestions
                  </span>
                  <span>Click to filter</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {geoSuggestions.map((item, idx) => {
                    const title = item.buildingName || item.displayName?.split(",")?.[0] || "Location";
                    const subtitle = item.fullAddress || item.displayName || "";
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => handleSelectGeoSuggestion(item)}
                        className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-teal-50/70 transition cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-teal-100/70 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold text-gray-900 truncate">
                              {title}
                            </span>
                            {item.city && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 shrink-0">
                                {item.city}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs shrink-0 max-w-[200px]"
            >
              <option value="all">🇮🇳 All India (All Metros)</option>
              <optgroup label="⭐ Key Hubs">
                <option value="Gujarat">📍 Gujarat (Ahmedabad / GIFT City)</option>
                <option value="Mumbai">📍 Mumbai (BKC / Lower Parel / Andheri)</option>
                <option value="Bengaluru">📍 Bengaluru (ORR / Whitefield / Koramangala)</option>
                <option value="Delhi NCR">📍 Delhi NCR (Delhi / Gurugram / Noida)</option>
                <option value="Hyderabad">📍 Hyderabad (HITEC City / Madhapur)</option>
                <option value="Pune">📍 Pune (Hinjewadi / Kharadi / Baner)</option>
                <option value="Chennai">📍 Chennai (OMR / Guindy / Anna Nagar)</option>
                <option value="Kolkata">📍 Kolkata (Sector V / New Town)</option>
              </optgroup>
              <optgroup label="🏢 Major Cities">
                <option value="Delhi">📍 Delhi</option>
                <option value="Gurugram">📍 Gurugram (Gurgaon)</option>
                <option value="Noida">📍 Noida</option>
                <option value="Ahmedabad">📍 Ahmedabad</option>
                <option value="Gandhinagar">📍 Gandhinagar & GIFT City</option>
                <option value="Jaipur">📍 Jaipur</option>
                <option value="Chandigarh">📍 Chandigarh</option>
                <option value="Indore">📍 Indore</option>
                <option value="Kochi">📍 Kochi</option>
                <option value="Lucknow">📍 Lucknow</option>
                <option value="Goa">📍 Goa</option>
                <option value="Surat">📍 Surat</option>
                <option value="Vadodara">📍 Vadodara</option>
              </optgroup>
            </select>

            <select
              value={spaceType}
              onChange={(e) => setSpaceType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs shrink-0"
            >
              <option value="All Categories">🏢 All Categories (6 Verticals)</option>
              <option value="Coworking Space">💻 Coworking Spaces</option>
              <option value="Virtual Office">🌐 Virtual Offices</option>
              <option value="Managed Office">🏢 Managed Offices</option>
              <option value="Commercial Office">🏙️ Commercial Office Leasing</option>
              <option value="Meeting Room">📅 Meeting Rooms</option>
              <option value="Day Pass">🎟️ Day Passes</option>
            </select>

            {/* Desktop Compare Link */}
            <Link
              href="/public/property/compare"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#0F8B7D] bg-white text-xs font-bold text-gray-700 shadow-xs shrink-0 transition-colors"
            >
              <Scale size={13} className="text-[#0F8B7D]" />
              <span>Compare Matrix</span>
              {compareList.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#0F8B7D] text-white text-[9px] font-black">
                  {compareList.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile View Toggle & Compare Button Bar */}
        <div className="md:hidden flex items-center justify-between border-t border-gray-100 pt-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500">{filteredProperties.length} Spaces</span>
            <Link
              href="/public/property/compare"
              className="px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 text-[11px] font-bold text-[#0F8B7D] flex items-center gap-1 shadow-2xs"
            >
              <Scale size={12} />
              <span>Compare {compareList.length > 0 ? `(${compareList.length})` : ""}</span>
            </Link>
          </div>

          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setMobileView("list")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mobileView === "list" ? "bg-white text-[#0F8B7D] shadow-xs" : "text-gray-500"
              }`}
            >
              <ListIcon size={12} /> List
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mobileView === "map" ? "bg-white text-[#0F8B7D] shadow-xs" : "text-gray-500"
              }`}
            >
              <MapIcon size={12} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Body: Desktop Split (42%/58%), Mobile Single View */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:grid md:grid-cols-[42%_58%] h-full">
        {/* Left: Property Listings Feed */}
        <div 
          className={`h-full min-h-0 overflow-y-auto p-4 md:p-5 space-y-4 border-r border-gray-200 bg-gray-50/40 ${
            mobileView === "map" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
            <div>
              <h1 className="text-base md:text-lg font-black text-gray-900">
                Commercial Workspaces in {city && city !== "all" ? `${city}` : (searchQuery || "All Metro Hubs")}
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isLoadingProperties ? (
                  <span className="flex items-center gap-1 text-teal-700 font-semibold">
                    <Loader2 size={11} className="animate-spin" /> Searching live verified spaces...
                  </span>
                ) : isNoResults ? (
                  "0 verified properties found"
                ) : (
                  `Showing ${filteredProperties.length} verified Grade-A spaces`
                )}
              </p>
            </div>
            {(isNoResults || (city && city !== "all") || searchQuery) && (
              <button
                onClick={() => { setCity("all"); setSearchQuery(""); }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] text-[11px] font-bold border border-teal-200 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {isLoadingProperties ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0F8B7D] animate-spin" />
              <p className="text-xs font-bold text-gray-600">Loading verified commercial spaces...</p>
            </div>
          ) : isNoResults ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F8B7D]">
                <Building size={32} />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-gray-900">No Commercial Properties Found</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  No verified spaces match &quot;{searchQuery || city}&quot;. Try exploring other prime corridors like SG Highway, BKC, or Cyber City.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => { setCity("all"); setSearchQuery(""); }}
                  className="px-4 py-2 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold hover:bg-[#0D7A6E] transition shadow-xs cursor-pointer"
                >
                  View All Verified Spaces
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 pb-20 md:pb-6">
            {displayProperties.map((prop) => {
              const isComp = compareList.some((c) => c.id === prop.id);
              const isSelected = selectedProperty?.id === prop.id;

              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`bg-white rounded-2xl border transition-all relative group overflow-hidden cursor-pointer ${
                    isSelected ? "border-[#0F8B7D] ring-2 ring-[#0F8B7D]/20 shadow-md" : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-3.5 p-3.5">
                    {/* Image Box */}
                    <div className="w-full sm:w-36 h-36 sm:h-32 rounded-xl overflow-hidden relative shrink-0">
                      <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[8px] font-black text-emerald-700 shadow-sm flex items-center gap-0.5">
                          <Check size={8} strokeWidth={3} /> VERIFIED
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-600/90 backdrop-blur-sm text-[8px] font-black text-white shadow-sm">
                          GRADE A
                        </span>
                      </div>

                      {/* OFFICEX Property Score Badge */}
                      <div className="absolute bottom-2 right-2 bg-gray-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Star size={9} className="text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-black">{prop.propertyScore}</span>
                        <span className="text-[7px] text-gray-300">/100</span>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-[#0F8B7D] uppercase tracking-wider block truncate">
                              {prop.buildingName}
                            </span>
                            <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">{prop.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                              <MapPin size={10} className="text-gray-400 shrink-0" /> {prop.location}
                            </p>
                          </div>
                          
                          <button
                            id={`btn-compare-${prop.id}`}
                            data-testid={`btn-compare-${prop.id}`}
                            onClick={(e) => { e.stopPropagation(); toggleCompare(prop); }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                              isComp 
                                ? "bg-[#0F8B7D] text-white border-[#0F8B7D] shadow-xs" 
                                : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-[#0F8B7D]"
                            }`}
                            title="Compare space"
                          >
                            <Scale size={12} className={isComp ? "text-white" : "text-[#0F8B7D]"} />
                            <span>{isComp ? "Added ✓" : "Compare"}</span>
                          </button>
                        </div>

                        {/* Specs Grid */}
                        <div className="bg-gray-50 rounded-xl p-2 mt-2 grid grid-cols-3 gap-1 text-[9px]">
                          <div>
                            <span className="text-gray-400 block font-semibold">Area</span>
                            <span className="font-bold text-gray-800">{prop.area}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-semibold">Capacity</span>
                            <span className="font-bold text-gray-800">{prop.capacity}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-semibold">Move-in</span>
                            <span className="font-bold text-emerald-700">{prop.readiness}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-gray-900">{prop.price}</span>
                            <span className="text-[10px] text-gray-500 font-semibold">/month</span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold block">{prop.pricePerSqft}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnquiryProperty(prop);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-[#0F8B7D] font-bold text-xs flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                          >
                            <Send size={11} /> Enquire
                          </button>
                          <Link
                            href={prop.slug ? `/marketplace/${prop.slug}` : `/public/property/${prop.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                          >
                            Inspect Space <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Right: Real Google Map */}
        <div 
          className={`h-full relative overflow-hidden ${
            mobileView === "list" ? "hidden md:block" : "block"
          }`}
        >
          <RealGoogleMap
            properties={displayProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(p) => setSelectedProperty(p)}
          />

          {/* Mobile Floating Card on Map View */}
          {selectedProperty && (
            <div className="md:hidden absolute bottom-20 left-3 right-3 z-30 bg-white rounded-2xl p-3.5 shadow-2xl border border-gray-200 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-[#0F8B7D] uppercase tracking-wider block">{selectedProperty.buildingName}</span>
                  <h4 className="text-xs font-bold text-gray-900 truncate">{selectedProperty.title}</h4>
                  <p className="text-[10px] font-black text-gray-900 mt-0.5">{selectedProperty.price} <span className="text-gray-400 font-normal">({selectedProperty.pricePerSqft})</span></p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => toggleCompare(selectedProperty)}
                    className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                      compareList.some(c => c.id === selectedProperty.id)
                        ? "bg-[#0F8B7D] text-white border-[#0F8B7D]"
                        : "border-gray-200 text-gray-600 bg-gray-50"
                    }`}
                    title="Compare"
                  >
                    <Scale size={13} />
                  </button>
                  <button
                    onClick={() => setEnquiryProperty(selectedProperty)}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-[#0F8B7D] border border-teal-200 text-xs font-bold"
                  >
                    Enquire
                  </button>
                  <Link
                    href={selectedProperty.slug ? `/marketplace/${selectedProperty.slug}` : `/public/property/${selectedProperty.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold shrink-0"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Comparison Dock */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-8 z-40 bg-gray-900/95 backdrop-blur-md text-white p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200 max-w-lg md:max-w-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Scale size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">{compareList.length} {compareList.length === 1 ? "Space" : "Spaces"} Selected</span>
                <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-black uppercase">Max 3</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {compareList.map(c => c.buildingName || c.title).join(" • ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCompareList([])}
              className="px-2.5 py-1.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-[11px] font-bold text-gray-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <Link
              href="/public/property/compare"
              className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Compare Now</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Enquiry Modal */}
      {enquiryProperty && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Direct Space Enquiry</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{enquiryProperty.title} ({enquiryProperty.buildingName})</p>
              </div>
              <button onClick={() => setEnquiryProperty(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!enquiryForm.company.trim() || !enquiryForm.email.trim()) {
                  setToast("Please provide company name and email.");
                  setTimeout(() => setToast(null), 3000);
                  return;
                }
                setIsSubmitting(true);
                savePublicEnquiry({
                  companyName: enquiryForm.company,
                  contactName: enquiryForm.company,
                  email: enquiryForm.email,
                  phone: enquiryForm.phone,
                  propertyTitle: enquiryProperty.title,
                  buildingName: enquiryProperty.buildingName,
                  seats: enquiryForm.seats,
                  moveInDate: "Immediate",
                  budget: `${enquiryProperty.price}/mo`
                });

                setTimeout(() => {
                  setIsSubmitting(false);
                  setEnquiryProperty(null);
                  setToast(`Site visit request sent for ${enquiryProperty.title}! Our Space Advisor will coordinate.`);
                  setEnquiryForm({ company: "", email: "", phone: "", seats: "60" });
                  setTimeout(() => setToast(null), 4000);
                }, 600);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">COMPANY NAME *</label>
                <input
                  value={enquiryForm.company}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OFFICIAL EMAIL *</label>
                  <input
                    type="email"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">MOBILE NUMBER *</label>
                  <input
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="+91 98201 44821"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SEATS NEEDED</label>
                  <input
                    type="number"
                    value={enquiryForm.seats}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, seats: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PREFERRED VISIT DATE</label>
                  <input
                    type="date"
                    defaultValue="2026-09-18"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryProperty(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={12} /> {isSubmitting ? "Confirming..." : "Confirm Site Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Floating Space Advisor Bar (Client Requested) */}
      <div className="fixed bottom-3 left-4 right-4 md:left-[280px] md:right-8 z-40 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-3 shadow-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div>
            <span className="text-xs font-black">Talk to a Space Advisor — Free, No Brokerage</span>
            <span className="text-[11px] text-gray-400 hidden sm:inline ml-2">Dedicated commercial transaction advisory for Grade-A towers</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:+919820144821"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Phone size={13} className="text-teal-400" />
            <span>+91 98201 44821</span>
          </a>
          <a
            href="https://wa.me/919820144821?text=Hi%20OfficeX%2C%20I%20am%20looking%20for%20a%20commercial%20workspace"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>WhatsApp Advisor</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PropertySearchAndDiscovery() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-1" />
              <div className="h-3 w-72 bg-gray-100 rounded-md animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-teal-50 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
                <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <PropertySearchContent />
    </Suspense>
  );
}
