"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search, MapPin, Star, Heart, Check, ChevronLeft, ChevronRight,
  ChevronDown, SlidersHorizontal, Scale, Shield, ShieldCheck,
  Building2, Users, Calendar, Clock, Train, ArrowRight, X,
  CheckCircle2, Sparkles, Filter, Loader2, ArrowUpRight,
  Briefcase, Award, Zap, Layers, Grid, List as ListIcon, Map as MapIcon,
  MessageSquare, UserCheck, FileText, Info, PhoneCall, CheckSquare, Square
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import type { PropertyListing } from "@/components/RealGoogleMap";

// Dynamic Google Maps import to avoid SSR issues
const RealGoogleMap = dynamic(() => import("@/components/RealGoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-500 rounded-2xl">
      <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold font-mono">Loading Real Google Maps...</span>
    </div>
  )
});

import {
  LIVE_MARKETPLACE_CITIES,
  COMING_SOON_METROS,
  COMING_SOON_CITIES,
  isCityLive,
  TOP_METROS,
  ALL_MARKETPLACE_CITIES,
  CITY_COORDS,
  getLocalitiesForCity,
} from "@/data/marketplace-cities";

const BRANDS = [
  "All Operators", "Enterprise Managed", "Grade-A Commercial", "Boutique Coworking", "Institutional Tech Park", "Owner Direct"
];

const PRODUCTS = [
  { id: "all", label: "All Workspaces", title: "Office & Coworking Spaces" },
  { id: "coworking", label: "Coworking Space", title: "Coworking Spaces" },
  { id: "managed", label: "Managed Office", title: "Managed Offices" },
  { id: "commercial", label: "Commercial Office", title: "Commercial Office Spaces" },
  { id: "day_pass", label: "Day Pass", title: "Day Pass Workspaces" },
  { id: "meeting_room", label: "Meeting Rooms", title: "Meeting & Training Rooms" },
  { id: "virtual_office", label: "Virtual Office", title: "Virtual Offices" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Popularity" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Rating: Highest First" },
];

const PRICE_RANGES = [
  { id: "all", label: "All Budgets" },
  { id: "under_8k", label: "Under ₹8,000 / mo" },
  { id: "8k_15k", label: "₹8,000 - ₹15,000 / mo" },
  { id: "15k_25k", label: "₹15,000 - ₹25,000 / mo" },
  { id: "above_25k", label: "Above ₹25,000 / mo" },
];

function MarketplaceSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const initialCity = searchParams?.get("city") || (typeof window !== "undefined" ? localStorage.getItem("officex_marketplace_city") || "Delhi NCR" : "Delhi NCR");
  const initialQ = searchParams?.get("q") || "";
  const initialLocality = searchParams?.get("locality") || "";
  const initialVertical = searchParams?.get("vertical") || searchParams?.get("type") || "all";

  // Filter States
  const [city, setCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedLocality, setSelectedLocality] = useState(initialLocality);
  const [selectedProduct, setSelectedProduct] = useState(initialVertical);
  const [selectedBrand, setSelectedBrand] = useState("All Operators");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");

  // Listings Data
  const [listings, setListings] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Card Interactive States
  const [photoIndexes, setPhotoIndexes] = useState<Record<string, number>>({});
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [comparedListings, setComparedListings] = useState<any[]>([]);
  const [expandedMetro, setExpandedMetro] = useState<Record<string, boolean>>({});

  // Lead / Enquiry Modal State
  const [activeModalProperty, setActiveModalProperty] = useState<any | null>(null);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    teamSize: "10-25 seats",
    moveInDate: "Immediate",
    message: ""
  });

  // Sidebar Inline Quick Enquiry State
  const [sidebarForm, setSidebarForm] = useState({
    name: "",
    phone: "",
    teamSize: "5-15 seats",
  });
  const [isSubmittingSidebar, setIsSubmittingSidebar] = useState(false);
  const [sidebarSuccess, setSidebarSuccess] = useState(false);

  // Selected property for Map view
  const [selectedMapProperty, setSelectedMapProperty] = useState<PropertyListing | null>(null);

  // Localities Horizontal Scroll Ref
  const localitiesScrollRef = useRef<HTMLDivElement>(null);

  const scrollLocalities = (direction: "left" | "right") => {
    if (localitiesScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      localitiesScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Sync state with URL params if they change externally
  useEffect(() => {
    if (searchParams) {
      const c = searchParams.get("city");
      if (c && c !== city) {
        setCity(c);
      } else if (!c) {
        // No city specified in URL: check if user explicitly picked a city in this session, otherwise auto-detect
        const sessionManual = typeof window !== "undefined" ? sessionStorage.getItem("officex_manual_city_chosen") : null;
        if (sessionManual && sessionManual !== city) {
          setCity(sessionManual);
        } else {
          // Auto-detect visitor location dynamically (IP / edge headers)
          fetch("/api/marketplace/detect-location")
            .then((res) => res.json())
            .then((data) => {
              if (data?.city && data.city !== city) {
                setCity(data.city);
                try {
                  localStorage.setItem("officex_marketplace_city", data.city);
                } catch {}
              }
            })
            .catch(() => {});
        }
      }
      const q = searchParams.get("q");
      if (q != null && q !== searchQuery) setSearchQuery(q);
      const loc = searchParams.get("locality");
      if (loc != null && loc !== selectedLocality) setSelectedLocality(loc);
      const v = searchParams.get("vertical") || searchParams.get("type");
      if (v && v !== selectedProduct) setSelectedProduct(v);
    }
  }, [searchParams]);

  // Fetch Listings from API with all active filters
  useEffect(() => {
    let isCancelled = false;
    async function fetchResults() {
      if (!isCityLive(city)) {
        setIsLoading(false);
        setListings([]);
        setTotalCount(0);
        return;
      }
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (city && city.toLowerCase() !== "all") params.set("city", city);
        if (selectedProduct && selectedProduct.toLowerCase() !== "all") params.set("vertical", selectedProduct);
        if (selectedLocality) params.set("locality", selectedLocality);
        if (searchQuery && searchQuery.trim()) params.set("q", searchQuery.trim());
        if (sortBy) params.set("sort", sortBy);
        if (selectedBrand && selectedBrand !== "All Operators") {
          params.set("brand", selectedBrand);
        }
        params.set("limit", "100");

        if (selectedPriceRange === "under_8k") {
          params.set("maxPrice", "8000");
        } else if (selectedPriceRange === "8k_15k") {
          params.set("minPrice", "8000");
          params.set("maxPrice", "15000");
        } else if (selectedPriceRange === "15k_25k") {
          params.set("minPrice", "15000");
          params.set("maxPrice", "25000");
        } else if (selectedPriceRange === "above_25k") {
          params.set("minPrice", "25000");
        }

        const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            let items = Array.isArray(data.listings) ? data.listings : [];
            // Brand client filter if selected
            if (selectedBrand && selectedBrand !== "All Operators") {
              items = items.filter((item: any) =>
                (item.brandName || "").toLowerCase().includes(selectedBrand.toLowerCase()) ||
                (item.name || "").toLowerCase().includes(selectedBrand.toLowerCase())
              );
            }
            setListings(items);
            setTotalCount(data.pagination?.total || items.length);
          }
        }
      } catch (err) {
        console.error("Marketplace search query failed:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchResults, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [city, selectedProduct, selectedLocality, searchQuery, selectedBrand, selectedPriceRange, sortBy]);

  // Carousel photo navigator
  const handlePrevPhoto = (e: React.MouseEvent, id: string, max: number) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndexes((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : max - 1
    }));
  };

  const handleNextPhoto = (e: React.MouseEvent, id: string, max: number) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndexes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) < max - 1 ? (prev[id] || 0) + 1 : 0
    }));
  };

  const toggleShortlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCompare = (e: React.MouseEvent, listing: any) => {
    e.preventDefault();
    e.stopPropagation();
    setComparedListings((prev) => {
      const exists = prev.some((l) => l.id === listing.id);
      if (exists) return prev.filter((l) => l.id !== listing.id);
      if (prev.length >= 4) {
        alert("You can compare up to 4 spaces at a time.");
        return prev;
      }
      return [...prev, listing];
    });
  };

  // Submit quick best-price enquiry modal
  const handleBestPriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      alert("Please enter your name and phone number.");
      return;
    }
    setIsSubmittingEnquiry(true);
    try {
      const res = await fetch("/api/marketplace/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: activeModalProperty?.id || null,
          listingSlug: activeModalProperty?.slug || null,
          propertyName: activeModalProperty?.name || "Marketplace Requirement",
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          companyName: "Private Client",
          teamSize: leadForm.teamSize,
          moveInDate: leadForm.moveInDate,
          city: city,
          budgetMonthly: activeModalProperty?.startingPrice || null,
          notes: leadForm.message || "Office quotation inquiry from OfficeX search"
        })
      });

      if (res.ok) {
        setEnquirySuccess(true);
        setTimeout(() => {
          setActiveModalProperty(null);
          setEnquirySuccess(false);
          setLeadForm({
            name: "",
            email: "",
            phone: "",
            teamSize: "10-25 seats",
            moveInDate: "Immediate",
            message: ""
          });
        }, 2200);
      } else {
        alert("Unable to send request. Please try again.");
      }
    } catch (err) {
      console.error("Enquiry submission error:", err);
      alert("Something went wrong. Please submit your inquiry through the requirement form.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Submit Sidebar Quick Enquiry
  const handleSidebarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarForm.name || !sidebarForm.phone) {
      alert("Please enter your name and phone number.");
      return;
    }
    setIsSubmittingSidebar(true);
    try {
      const res = await fetch("/api/marketplace/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyName: `Workspace Advisory Desk (${city})`,
          name: sidebarForm.name,
          phone: sidebarForm.phone,
          companyName: "Private Client",
          teamSize: sidebarForm.teamSize,
          moveInDate: "Immediate",
          city: city,
          notes: `Direct proposal inquiry from OfficeX search page sidebar (${city})`
        })
      });

      if (res.ok) {
        setSidebarSuccess(true);
        setTimeout(() => {
          setSidebarSuccess(false);
          setSidebarForm({ name: "", phone: "", teamSize: "5-15 seats" });
        }, 3000);
      } else {
        alert("Unable to submit proposal request. Please try again.");
      }
    } catch (err) {
      console.error("Sidebar enquiry error:", err);
      alert("Something went wrong. Please use the requirement form.");
    } finally {
      setIsSubmittingSidebar(false);
    }
  };

  // Convert listings to Map format for Map View
  const mapProperties: PropertyListing[] = listings.map((l) => {
    let lat = l.latitude ? parseFloat(l.latitude) : null;
    let lng = l.longitude ? parseFloat(l.longitude) : null;
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      const cityKey = (l.city || city || "delhi").toLowerCase();
      const coords = CITY_COORDS[cityKey] || [28.6139, 77.2090];
      lat = coords[0];
      lng = coords[1];
    }
    return {
      id: l.slug || l.id,
      slug: l.slug,
      title: l.name,
      buildingName: l.brandName || l.name,
      location: `${l.locality || ""}, ${l.city}`,
      subLocation: l.fullAddress || "",
      area: l.totalAreaSqft ? `${Number(l.totalAreaSqft).toLocaleString("en-IN")} sqft` : "Flexible Layout",
      capacity: l.totalSeats ? `${l.totalSeats} Workstations` : "20-250 Seats",
      furnishing: (l.vertical || "Coworking").replace(/_/g, " "),
      price: `₹${Number(l.startingPrice || 8500).toLocaleString("en-IN")}/mo`,
      pricePerSqft: "—",
      pricePerSeat: `₹${Number(l.startingPrice || 8500).toLocaleString("en-IN")}/seat`,
      propertyScore: 94,
      readiness: "Ready to Move",
      commuteScore: 88,
      energyRating: l.buildingGrade || "Grade A",
      image: l.featuredImage || (l.images && l.images[0]) || "/images/showcase_office_techhorizon_hd.jpg",
      images: l.images || [],
      rating: l.avgRating || "4.5",
      reviews: l.totalReviews || 24,
      amenities: l.amenities || [],
      lat,
      lng
    };
  });

  const activeProductObj = PRODUCTS.find((p) => p.id === selectedProduct) || PRODUCTS[0];
  const activeSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];
  const activePriceObj = PRICE_RANGES.find((pr) => pr.id === selectedPriceRange) || PRICE_RANGES[0];
  const currentCityLocalities = getLocalitiesForCity(city);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col antialiased">
      {/* 1. Universal Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* 2. Top Sub-Navigation with Search Bar, Helpline, Share Requirement, Shortlists */}
      <section className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Instant Keyword Search Box with Location Icon */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search location or workspace in ${city}...`}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0F8B7D] focus:ring-2 focus:ring-[#0F8B7D]/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Action Buttons: Crisp, Organized, Balanced */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-xs">
            {/* Direct Inquiry Desk */}
            <button
              onClick={() => setActiveModalProperty({ name: `Direct Workspace Advisory in ${city}` })}
              className="hidden md:flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#0F8B7D] px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <PhoneCall size={14} className="text-[#0F8B7D]" />
              <span className="hidden lg:inline">Workspace Advisor</span>
            </button>

            {/* Share Requirement */}
            <Link
              href="/marketplace/requirement"
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 font-bold text-slate-700 hover:text-slate-900 bg-white transition-all shadow-2xs hover:bg-slate-50"
            >
              Share requirement
            </Link>

            {/* My Shortlists Badge */}
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700">
              <Heart size={14} className={shortlistedIds.length > 0 ? "text-rose-500 fill-rose-500" : "text-slate-400"} />
              <span className="hidden sm:inline">My Shortlists</span>
              {shortlistedIds.length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {shortlistedIds.length}
                </span>
              )}
            </div>

            {/* Compare Bar if items added */}
            {comparedListings.length > 0 && (
              <Link
                href="/public/property/compare"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-300 text-[#0F8B7D] font-black text-xs shadow-2xs animate-pulse"
              >
                <Scale size={13} />
                <span>Compare ({comparedListings.length})</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Search Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 pt-5 pb-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb row */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
            <Link href="/marketplace" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-slate-600 capitalize">{activeProductObj.label}</span>
            <span>&gt;</span>
            <span className="text-[#0F8B7D] font-bold">{city}</span>
          </nav>

          {/* Heading + Request Callback Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                {activeProductObj.title} In {city}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Zero brokerage • 100% physically audited spaces • Guaranteed best operator rate card
              </p>
            </div>

            <button
              onClick={() => {
                setActiveModalProperty({ name: `General Office Consultation in ${city}` });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#192A56] hover:bg-[#122044] text-white font-extrabold text-xs shadow-sm hover:shadow transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Request Callback</span>
            </button>
          </div>

          {/* 4. Filter Bar - Crisp Two-Tier Select Cards matching reference */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            
            {/* 1. Product Filter Card */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[140px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Product</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5">{activeProductObj.label}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* 2. City Filter Card (Grouped with 4 Live Cities + Coming Soon) */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[140px] max-w-[220px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">City</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5 flex items-center gap-1.5">
                  {city}
                  {!isCityLive(city) && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                      Soon
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCity(newCity);
                  setSelectedLocality("");
                  if (typeof window !== "undefined") {
                    try {
                      localStorage.setItem("officex_marketplace_city", newCity);
                    } catch {}
                  }
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                <optgroup label="🟢 Active Locations (Live Now)">
                  {LIVE_MARKETPLACE_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.count} spaces)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🚀 Other Metros (Coming Soon)">
                  {COMING_SOON_METROS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Coming Soon)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📍 All Other Cities (Coming Soon)">
                  {COMING_SOON_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Coming Soon)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* 3. Locations Filter Card */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[150px] max-w-[210px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Locations</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {selectedLocality || "All Locations"}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                <option value="">All Locations in {city}</option>
                {currentCityLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sort By Filter Card */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[140px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Sort By</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5">{activeSortObj.label}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* 5. Brand Filter Card */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[130px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Brand</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5">{selectedBrand}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 6. Price Range Filter Card */}
            <div className="relative border border-slate-300 hover:border-slate-400 bg-white rounded-lg px-3 py-1.5 min-w-[140px] flex items-center justify-between shadow-2xs group focus-within:border-slate-800 transition-colors cursor-pointer">
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Price Range</span>
                <span className="text-xs font-bold text-slate-900 truncate mt-0.5">{activePriceObj.label}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0 group-hover:text-slate-700 transition-colors" />
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              >
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.id} value={pr.id}>{pr.label}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters Text Button */}
            {(selectedLocality || searchQuery || selectedBrand !== "All Operators" || selectedPriceRange !== "all" || sortBy !== "popular" || (selectedProduct && selectedProduct !== "all")) && (
              <button
                onClick={() => {
                  setSelectedProduct("all");
                  setSelectedLocality("");
                  setSearchQuery("");
                  setSelectedBrand("All Operators");
                  setSelectedPriceRange("all");
                  setSortBy("popular");
                }}
                className="text-xs font-black text-rose-600 hover:text-rose-700 underline px-2 py-1 cursor-pointer transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* 5. Popular Localities Chips Row (Horizontal Scroll with arrows) */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5 overflow-hidden">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
              Popular Localities:
            </span>

            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollLocalities("left")}
              className="w-7 h-7 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 shadow-2xs shrink-0 cursor-pointer transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Localities Track */}
            <div
              ref={localitiesScrollRef}
              className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1"
            >
              {currentCityLocalities.map((loc) => {
                const isSelected = selectedLocality.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocality(isSelected ? "" : loc)}
                    className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0F8B7D] text-white font-bold shadow-xs border border-[#0F8B7D]"
                        : "bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollLocalities("right")}
              className="w-7 h-7 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 shadow-2xs shrink-0 cursor-pointer transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Results Header Row: Showing Results Count + Helper + View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 w-full flex items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {!isCityLive(city) ? (
              <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                OfficeX Expansion Pipeline — Launching Soon in {city}
              </span>
            ) : isLoading ? (
              <span className="flex items-center gap-1.5 text-teal-700">
                <Loader2 size={13} className="animate-spin" /> Fetching live verified spaces in {city}...
              </span>
            ) : (
              <span>
                Showing <b className="text-slate-900">{listings.length} results</b> for {activeProductObj.label.toLowerCase()} in {city}
                {selectedLocality && <span className="text-[#0F8B7D]"> ({selectedLocality})</span>}
              </span>
            )}
          </p>

          <button
            onClick={() => setSetupGuideOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#192A56] hover:text-[#0F8B7D] hover:underline cursor-pointer"
          >
            <Info size={13} className="text-[#192A56]" />
            <span>See which office setup suits you</span>
          </button>
        </div>

        {/* View Switcher (List | Grid | Map) */}
        <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-bold shrink-0 shadow-2xs">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#192A56] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListIcon size={13} />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#192A56] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid size={13} />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-[#192A56] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapIcon size={13} />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {/* 7. Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 flex-1 w-full">
        {!isCityLive(city) ? (
          <div className="py-14 px-6 sm:px-12 text-center bg-white rounded-3xl border border-slate-200 max-w-3xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <Sparkles size={32} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Clock size={12} /> Expansion Pipeline
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                OfficeX Marketplace is Coming Soon to {city}!
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                We are actively surveying and auditing Grade-A commercial office buildings, managed enterprise suites, and premium coworking hubs in <span className="font-bold text-slate-900">{city}</span>.
              </p>
            </div>

            {/* Pre-Registration Card */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs max-w-lg mx-auto text-left">
              <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-1.5">
                <span>🚀 Priority Access Pre-Registration</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Be the first to access live inventory and locked-in pre-launch corporate discounts in {city}.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingEnquiry(true);
                  try {
                    const formEl = e.currentTarget;
                    const name = (formEl.elements.namedItem("name") as HTMLInputElement)?.value;
                    const contact = (formEl.elements.namedItem("contact") as HTMLInputElement)?.value;
                    const seats = (formEl.elements.namedItem("seats") as HTMLSelectElement)?.value;
                    await fetch("/api/marketplace/enquiries", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        fullName: name || "Waitlist Prospect",
                        phone: contact && !contact.includes("@") ? contact : "",
                        email: contact && contact.includes("@") ? contact : "prospect@scalezix.com",
                        teamSize: seats || "10-25 seats",
                        notes: `Priority Waitlist Pre-Registration for ${city}`,
                        moveInTimeline: "Expansion Launch",
                      }),
                    });
                    setEnquirySuccess(true);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsSubmittingEnquiry(false);
                  }
                }}
                className="space-y-3"
              >
                {enquirySuccess ? (
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold text-center space-y-1">
                    <p className="font-black text-sm text-[#0F8B7D]">🎉 You&apos;re on the priority waitlist!</p>
                    <p className="text-teal-700">We&apos;ll notify you with exclusive early-bird rates as soon as {city} opens.</p>
                  </div>
                ) : (
                  <>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-900"
                    />
                    <input
                      name="contact"
                      type="text"
                      required
                      placeholder="Work Email or Phone Number"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-900"
                    />
                    <select
                      name="seats"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F8B7D] bg-white text-slate-900 cursor-pointer"
                    >
                      <option value="1-5 seats">1 - 5 seats (Coworking / Desks)</option>
                      <option value="5-15 seats">5 - 15 seats (Private Cabin)</option>
                      <option value="15-50 seats">15 - 50 seats (Managed Team Suite)</option>
                      <option value="50+ seats">50+ seats (Enterprise Floor)</option>
                      <option value="Virtual Office">Virtual Office / GST Registration</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-black transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingEnquiry ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Notify Me When Available"
                      )}
                    </button>
                  </>
                )}
              </form>
            </div>

            {/* Quick-Switch to 4 Live Markets */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Need space immediately? Explore our 4 active markets with 1,700+ live verified spaces:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCity("Delhi NCR");
                    setSelectedLocality("");
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#0F8B7D] hover:bg-teal-50/50 bg-white text-left transition cursor-pointer shadow-2xs group"
                >
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-[#0F8B7D]">Metro Hub</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Delhi NCR</div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1">1,711 Spaces</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCity("Noida");
                    setSelectedLocality("");
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#0F8B7D] hover:bg-teal-50/50 bg-white text-left transition cursor-pointer shadow-2xs group"
                >
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-[#0F8B7D]">Tech Hub</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Noida</div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1">491 Spaces</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCity("Gurgaon");
                    setSelectedLocality("");
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#0F8B7D] hover:bg-teal-50/50 bg-white text-left transition cursor-pointer shadow-2xs group"
                >
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-[#0F8B7D]">Fortune 500</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Gurgaon</div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1">724 Spaces</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCity("Faridabad");
                    setSelectedLocality("");
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-[#0F8B7D] hover:bg-teal-50/50 bg-white text-left transition cursor-pointer shadow-2xs group"
                >
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 group-hover:text-[#0F8B7D]">Industrial Belt</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Faridabad</div>
                  <div className="text-[11px] font-bold text-teal-700 mt-1">13 Spaces</div>
                </button>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-9 h-9 text-[#0F8B7D] animate-spin" />
            <p className="text-sm font-bold text-slate-700">Loading verified commercial spaces in {city}...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 px-6 text-center bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mx-auto">
              <Building2 size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Spaces Match Your Exact Filter</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              {selectedProduct !== "all" ? (
                <>
                  No spaces found specifically under <span className="font-bold text-slate-800">{activeProductObj.label}</span> in {selectedLocality || city}. Try switching to <strong>All Workspaces</strong> to view all available coworking hubs and managed offices.
                </>
              ) : (
                <>
                  We couldn&apos;t find matching properties in {selectedLocality || city} with the chosen price/brand. Our enterprise sourcing desk can scout off-market floors for you.
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {selectedProduct !== "all" && (
                <button
                  onClick={() => setSelectedProduct("all")}
                  className="px-4 py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  View All Workspaces in {city}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedProduct("all");
                  setSelectedLocality("");
                  setSearchQuery("");
                  setSelectedBrand("All Operators");
                  setSelectedPriceRange("all");
                  setSortBy("popular");
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setActiveModalProperty({ name: `Custom Workspace Scouting in ${city}` })}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Submit Custom Requirement
              </button>
            </div>
          </div>
        ) : viewMode === "map" ? (
          /* MAP VIEW: Split screen */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-2xl overflow-hidden border border-slate-200 bg-white p-3 shadow-sm">
            <div className="lg:col-span-5 h-full overflow-y-auto space-y-3 pr-2">
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMapProperty(mapProperties.find((m) => m.id === item.slug || m.id === item.id) || null)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    selectedMapProperty?.id === item.slug || selectedMapProperty?.id === item.id
                      ? "border-[#0F8B7D] bg-teal-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <img
                    src={item.featuredImage || (item.images && item.images[0]) || "/images/showcase_office_techhorizon_hd.jpg"}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#0F8B7D] uppercase">{item.brandName || "Verified"}</span>
                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">⭐ {item.avgRating || "4.5"}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{item.locality}, {item.city}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-black text-slate-900">₹{Number(item.startingPrice || 8500).toLocaleString("en-IN")}/mo</span>
                      <Link
                        href={`/marketplace/${item.slug || item.id}`}
                        className="text-[11px] font-bold text-[#0F8B7D] hover:underline flex items-center gap-0.5"
                      >
                        Inspect <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-7 h-full rounded-xl overflow-hidden relative">
              <RealGoogleMap
                properties={mapProperties}
                selectedProperty={selectedMapProperty}
                onSelectProperty={(p) => setSelectedMapProperty(p)}
              />
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW: 3-column cards with identical polished anatomy */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((space) => {
              const photos = space.images && space.images.length > 0 ? space.images : [space.featuredImage || "/images/showcase_office_techhorizon_hd.jpg"];
              const currentPhotoIdx = photoIndexes[space.id] || 0;
              const photo = photos[currentPhotoIdx] || photos[0];
              const isShortlisted = shortlistedIds.includes(space.id);
              const isCompared = comparedListings.some((l) => l.id === space.id);

              const displayTitle = (() => {
                const brand = (space.brandName || "").trim();
                const rawName = (space.name || "").trim();
                if (!brand) return rawName;
                if (!rawName || rawName.toLowerCase() === brand.toLowerCase()) {
                  return `${brand} – ${space.locality || space.city}`;
                }
                if (rawName.toLowerCase().startsWith(brand.toLowerCase())) {
                  return rawName;
                }
                return `${brand} – ${rawName}`;
              })();

              return (
                <div
                  key={space.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Photo Carousel Header */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <Link href={`/marketplace/${space.slug || space.id}`} className="block w-full h-full">
                      <img
                        src={photo}
                        alt={space.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </Link>

                    {/* Left & Right Circular Nav Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handlePrevPhoto(e, space.id, photos.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleNextPhoto(e, space.id, photos.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                          aria-label="Next image"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </>
                    )}

                    {/* Photo counter badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        {currentPhotoIdx + 1}/{photos.length}
                      </span>
                    </div>

                    {/* Shortlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleShortlist(e, space.id)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform z-10"
                      aria-label="Toggle shortlist"
                    >
                      <Heart size={13} className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-slate-600"} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      {/* Rating + Compare */}
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 font-bold text-slate-800 text-[11px]">
                          <Star size={11} className="text-amber-500 fill-amber-500" />
                          <span>{space.avgRating || "4.5"}</span>
                          <span className="text-slate-400 font-normal">({space.totalReviews || 18})</span>
                        </div>
                        <button
                          onClick={(e) => toggleCompare(e, space)}
                          className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                        >
                          {isCompared ? <CheckSquare size={12} className="text-[#0F8B7D]" /> : <Square size={12} className="text-slate-400" />}
                          <span>Compare</span>
                        </button>
                      </div>

                      {/* Title */}
                      <Link href={`/marketplace/${space.slug || space.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug line-clamp-1">
                          {displayTitle}
                        </h3>
                      </Link>

                      {/* Location */}
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{space.locality ? `${space.locality}, ${space.city}` : space.city}</span>
                      </p>

                      {/* Timings */}
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} className="text-slate-400 shrink-0" />
                        <span>Open Now, 08:00 to 20:00</span>
                      </p>

                      {/* Amenities pills */}
                      <div className="pt-1 flex flex-wrap items-center gap-1">
                        {(space.amenities || ["Meeting Rooms", "Assured Security", "Parking Available"]).slice(0, 3).map((amenity: string, aIdx: number) => (
                          <span
                            key={aIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-white border border-slate-300 px-1.5 py-0.5 rounded"
                          >
                            <Check size={10} className="text-[#0F8B7D]" />
                            <span>{amenity}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-medium block leading-none">Quoted price</span>
                        <span className="text-base font-extrabold text-slate-900 mt-0.5 block leading-none">
                          ₹{Number(space.startingPrice || 8500).toLocaleString("en-IN")}<span className="text-[10px] font-normal text-slate-500"> / mo</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModalProperty(space)}
                        className="px-3 py-1.5 rounded-lg bg-[#192A56] hover:bg-[#122044] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Get best price
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 8. LIST VIEW (2-COLUMN: Left Cards Feed + Right Sticky Sourcing Desk) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8 of 12 cols): Listing Cards Feed */}
            <div className="lg:col-span-8 space-y-6">
              {listings.map((space, idx) => {
                const photos = space.images && space.images.length > 0
                  ? space.images
                  : [space.featuredImage || "/images/showcase_office_techhorizon_hd.jpg"];
                const currentPhotoIdx = photoIndexes[space.id] || 0;
                const photo = photos[currentPhotoIdx] || photos[0];
                const isShortlisted = shortlistedIds.includes(space.id);
                const isCompared = comparedListings.some((l) => l.id === space.id);
                const numPrice = Number(space.startingPrice || 8500);
                const formattedPrice = "₹" + Math.round(numPrice).toLocaleString("en-IN");
                let priceSuffix = "/ seat / month";
                if (space.startingPriceUnit === "per_sqft_month" || space.vertical === "commercial") {
                  priceSuffix = "/ sq.ft. / month";
                } else if (space.startingPriceUnit === "per_day" || space.vertical === "day_pass") {
                  priceSuffix = "/ day";
                } else if (space.startingPriceUnit === "per_hour" || space.vertical === "meeting_room") {
                  priceSuffix = "/ hour";
                } else if (space.startingPriceUnit === "per_month" && space.vertical === "virtual_office") {
                  priceSuffix = "/ month";
                }

                const displayTitle = (() => {
                  const brand = (space.brandName || "").trim();
                  const rawName = (space.name || "").trim();
                  if (!brand) return rawName;
                  if (!rawName || rawName.toLowerCase() === brand.toLowerCase()) {
                    return `${brand} – ${space.locality || space.city}`;
                  }
                  if (rawName.toLowerCase().startsWith(brand.toLowerCase())) {
                    return rawName;
                  }
                  return `${brand} – ${rawName}`;
                })();

                return (
                  <React.Fragment key={space.id}>
                    {/* Interstitial Banner 1: Exact Enterprise Client Logos Banner matching reference after 1st card */}
                    {idx === 1 && (
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-sm font-bold text-slate-800">
                            5,000+ clients served &amp; counting
                          </span>
                          <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                        </div>
                        {/* Clean authentic client logos */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 items-center gap-6 pt-1">
                          <div className="flex items-center justify-center font-extrabold text-lg tracking-tight text-[#E23744]">
                            zomato
                          </div>
                          <div className="flex items-center justify-center gap-1 font-bold text-sm text-[#00D09C]">
                            <span className="w-4 h-4 rounded-full bg-[#00D09C] text-white flex items-center justify-center text-[10px]">♫</span>
                            <span>JioSaavn</span>
                          </div>
                          <div className="flex items-center justify-center font-serif font-black text-base text-[#D8232A]">
                            Outlook
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="bg-[#124E78] text-white px-2 py-0.5 rounded text-xs font-black">CARS<span className="text-amber-400">24</span></span>
                          </div>
                          <div className="flex items-center justify-center font-black text-xs tracking-wider text-slate-800 border border-slate-300 rounded px-2 py-1">
                            SIGNZY
                          </div>
                          <div className="flex items-center justify-center font-black text-sm italic text-[#2874F0]">
                            Flipkart
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interstitial Banner 2: Enterprise Physical Audit Card after 4th card */}
                    {idx === 4 && (
                      <div className="bg-[#192A56] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-teal-300 text-[10px] font-bold uppercase">
                            <ShieldCheck size={12} /> 100% Physically Audited
                          </div>
                          <h4 className="text-base font-extrabold">Verified Workspaces You Can Trust</h4>
                          <p className="text-xs text-slate-300 max-w-md">
                            Every space listed on OfficeX is physically visited to verify actual internet redundancy, meeting room acoustics, and lease clarity.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveModalProperty({ name: `Physical Space Audit in ${city}` })}
                          className="px-4 py-2 rounded-lg bg-white text-[#192A56] font-extrabold text-xs hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                        >
                          Schedule Free Visit
                        </button>
                      </div>
                    )}

                    {/* The Clean, Organized Listing Card - Horizontal Compact Anatomy */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row group">
                      
                      {/* Left: Photo Carousel */}
                      <div className="relative w-full sm:w-[270px] md:w-[290px] h-48 sm:h-auto min-h-[190px] bg-slate-900 shrink-0 overflow-hidden">
                        <Link href={`/marketplace/${space.slug || space.id}`} className="block w-full h-full">
                          <img
                            src={photo}
                            alt={space.name}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        {/* Prev & Next Navigation Buttons on Hover */}
                        {photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handlePrevPhoto(e, space.id, photos.length)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-md"
                              aria-label="Previous photo"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleNextPhoto(e, space.id, photos.length)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-md"
                              aria-label="Next photo"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}

                        {/* Photo counter badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                            {currentPhotoIdx + 1}/{photos.length}
                          </span>
                        </div>
                      </div>

                      {/* Right: Card Body */}
                      <div className="p-3.5 sm:py-3 sm:px-4 flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1.5">
                          {/* Row 1: Star Rating Pill on Left + Shortlist & Compare on Right */}
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50/80 rounded px-2 py-0.5 text-xs font-bold text-slate-800">
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                              <span>{space.avgRating || "4.5"}</span>
                              <span className="text-slate-400 font-normal">({space.totalReviews || 14} reviews)</span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                              {/* Shortlist Toggle */}
                              <button
                                type="button"
                                onClick={(e) => toggleShortlist(e, space.id)}
                                className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                              >
                                <span>Shortlist</span>
                                <Heart
                                  size={14}
                                  className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-slate-400"}
                                />
                              </button>

                              {/* Compare Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => toggleCompare(e, space)}
                                className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                              >
                                <span>Compare</span>
                                {isCompared ? (
                                  <CheckSquare size={14} className="text-[#0F8B7D]" />
                                ) : (
                                  <Square size={14} className="text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Row 2: Space Title */}
                          <div>
                            <Link href={`/marketplace/${space.slug || space.id}`}>
                              <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#0F8B7D] transition-colors leading-snug truncate">
                                {displayTitle}
                              </h2>
                            </Link>
                          </div>

                          {/* Row 3: Location & Operating Hours in one compact line */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{space.locality ? `${space.locality}, ${space.city}` : space.city}</span>
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock size={12} className="text-slate-400 shrink-0" />
                              <span>Open Now, 08:00 to 20:00</span>
                            </span>
                          </div>

                          {/* Row 4: Amenities Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {(space.amenities || [
                              "Meeting Rooms", "Assured Security", "Parking Available"
                            ]).slice(0, 3).map((amenity: string, aIdx: number) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 border border-slate-300 rounded px-2 py-0.5 bg-white"
                              >
                                <Check size={11} className="text-[#0F8B7D]" />
                                <span>{amenity}</span>
                              </span>
                            ))}
                            {(space.amenities?.length || 0) > 3 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                +{(space.amenities?.length || 4) - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Row 5: Bottom Pricing & "Get best price" CTA Button */}
                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block leading-none">
                              Quoted price (negotiable)
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
                                {formattedPrice}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                {priceSuffix}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/marketplace/${space.slug || space.id}`}
                              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 font-bold text-xs text-slate-700 hover:text-slate-900 bg-white transition-all cursor-pointer"
                            >
                              <span>Explore</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setActiveModalProperty(space)}
                              className="px-4 sm:px-5 py-2 rounded-lg bg-[#192A56] hover:bg-[#122044] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
                            >
                              Get best price
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right Column (4 of 12 cols): OfficeX Dedicated Sourcing Desk & Price Guarantee */}
            <aside className="lg:col-span-4 sticky top-16 space-y-4">
              
              {/* Card 1: Workspace Sourcing Desk with Instant Free Proposals Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0F8B7D] flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      OfficeX Sourcing Desk
                    </h3>
                    <span className="text-[11px] font-bold text-[#0F8B7D] flex items-center gap-1">
                      <ShieldCheck size={12} /> Zero Brokerage • Direct Tariffs
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-normal">
                  Looking for custom private suites or managed desks in {city}? Let our sourcing team negotiate operator discounts on your behalf.
                </p>

                {/* Inline Quick Form */}
                {sidebarSuccess ? (
                  <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-center space-y-1.5">
                    <CheckCircle2 size={24} className="text-[#0F8B7D] mx-auto" />
                    <p className="text-xs font-bold text-slate-900">Proposal Request Received!</p>
                    <p className="text-[11px] text-slate-600">Our advisor will connect with verified options within 4 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSidebarSubmit} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Team Size
                      </label>
                      <select
                        value={sidebarForm.teamSize}
                        onChange={(e) => setSidebarForm({ ...sidebarForm, teamSize: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8B7D] cursor-pointer"
                      >
                        <option value="1-4 seats">1 - 4 Desks</option>
                        <option value="5-15 seats">5 - 15 Desks</option>
                        <option value="16-50 seats">16 - 50 Desks</option>
                        <option value="50+ seats">50+ Desks (Managed Floor)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={sidebarForm.name}
                        onChange={(e) => setSidebarForm({ ...sidebarForm, name: e.target.value })}
                        placeholder="e.g. Aman Verma"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8B7D]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={sidebarForm.phone}
                        onChange={(e) => setSidebarForm({ ...sidebarForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#0F8B7D]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingSidebar}
                      className="w-full py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingSidebar ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Get Free Proposals</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Value bullets */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>Direct-from-operator discounted rates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>Free guided visits scheduled at your convenience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={13} className="text-[#0F8B7D] shrink-0" />
                    <span>100% Zero Brokerage guarantee</span>
                  </div>
                </div>
              </div>

              {/* Card 2: OfficeX Best Price Guarantee */}
              <div className="bg-[#EBF7F2] border border-[#BDE8D6] rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">OfficeX Best Price Guarantee</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                    Zero fees to occupiers. Save up to 15% negotiated directly with flex operators and commercial landlords.
                  </p>
                </div>
              </div>

              {/* Card 3: Top Micro-Markets in Selected City */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Popular in {city}</span>
                  <span className="text-[10px] font-bold text-slate-400">{currentCityLocalities.length} zones</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCityLocalities.slice(0, 8).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocality(selectedLocality === loc ? "" : loc)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        selectedLocality === loc
                          ? "bg-[#0F8B7D] text-white font-bold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* 9. Canonical "Get Best Price" / Callback Modal */}
      {activeModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModalProperty(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X size={16} />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Quotation Request Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our workspace sourcing team has received your inquiry and will connect with your verified quotation shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBestPriceSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#0F8B7D] tracking-wider block">
                    Zero Brokerage • Guaranteed Best Price
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {activeModalProperty.name || "Workspace Inquiry"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Get an instant discounted rate card and schedule a free guided visit.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Work Email</label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Team Size</label>
                      <select
                        value={leadForm.teamSize}
                        onChange={(e) => setLeadForm({ ...leadForm, teamSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
                      >
                        <option value="1-4 seats">1 - 4 Desks</option>
                        <option value="5-15 seats">5 - 15 Desks</option>
                        <option value="16-50 seats">16 - 50 Desks</option>
                        <option value="50+ seats">50+ Desks (Managed)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Move-in Date</label>
                      <select
                        value={leadForm.moveInDate}
                        onChange={(e) => setLeadForm({ ...leadForm, moveInDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
                      >
                        <option value="Immediate">Immediate (&lt; 7 days)</option>
                        <option value="Within 30 days">Within 30 days</option>
                        <option value="1 to 3 months">1 - 3 months</option>
                        <option value="Exploring">Just Exploring</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className="w-full py-2.5 rounded-lg bg-[#192A56] hover:bg-[#122044] text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmittingEnquiry ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Securing best price...</span>
                    </>
                  ) : (
                    <span>Unlock Best Price &amp; Free Tour</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 10. Office Setup Guidance Modal ("See which office setup suits you") */}
      {setupGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSetupGuideOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase text-[#0F8B7D] tracking-wider">OfficeX Workspace Guide</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Which Workspace Type Suits Your Team?</h3>
                <p className="text-xs text-slate-500">Compare workplace types to pick the ideal setup for your team size and budget.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">1. Dedicated Coworking Desks</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">1 - 10 Seats</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Assigned personal workstations inside premium shared hubs. Includes enterprise Wi-Fi, meeting room credits, and reception services.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">2. Private Soundproof Team Cabins</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">5 - 30 Seats</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Lockable private offices built for privacy and collaboration. Acoustic paneling, dedicated executive credenzas, and 24/7 keycard access.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">3. Custom Managed Floors (Enterprise)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">30 - 500+ Seats</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Entire customized floor plates built with zero capital expenditure. Custom branding, private boardrooms, server rooms, and dedicated pantries.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">4. Virtual Office &amp; GST Registration</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Any Team</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Prestigious commercial business address for company incorporation, GST registration, mail handling, and on-demand day office usage.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSetupGuideOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Close Guide
                </button>
                <Link
                  href="/marketplace/requirement"
                  className="px-4 py-2 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Post Your Custom Requirement
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in enquiry drawer */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ audience: "tenant" }}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

export default function MarketplaceSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0F8B7D] animate-spin" />
        </div>
      }
    >
      <MarketplaceSearchContent />
    </Suspense>
  );
}
