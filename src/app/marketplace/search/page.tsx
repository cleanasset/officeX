"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search, MapPin, Star, Heart, Check, ChevronLeft, ChevronRight,
  ChevronDown, Phone, SlidersHorizontal, Scale, Shield, ShieldCheck,
  Building2, Users, Calendar, Clock, Train, ArrowRight, X,
  CheckCircle2, Sparkles, Filter, Loader2, ArrowUpRight,
  Briefcase, Award, Zap, Layers, Grid, List as ListIcon, Map as MapIcon,
  MessageSquare, UserCheck
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

// Popular localities per city based on actual 6,767 listings database
const CITY_LOCALITIES: Record<string, string[]> = {
  Delhi: [
    "Connaught Place", "Aerocity", "Saket", "Nehru Place", "Okhla Phase III",
    "Mohan Cooperative", "Vasant Kunj", "Netaji Subhash Place", "Janakpuri",
    "Jasola", "Defence Colony", "Dwarka"
  ],
  Gurgaon: [
    "DLF Cyber City", "Golf Course Road", "Udyog Vihar", "Sector 44",
    "Sohna Road", "Unitech Cyber Park", "MG Road", "Huda City Centre",
    "Golf Course Ext Road", "Sector 32"
  ],
  Noida: [
    "Sector 62", "Sector 63", "Noida Expressway", "Sector 136", "Sector 135",
    "Film City", "Sector 126", "Sector 16", "Sector 2", "Sector 3"
  ],
  Bangalore: [
    "HSR Layout", "Whitefield", "Koramangala", "Indiranagar", "Outer Ring Road",
    "Bellandur", "MG Road", "J P Nagar", "Jayanagar", "Hebbal", "Domlur", "Electronic City"
  ],
  Mumbai: [
    "Bandra Kurla Complex", "Andheri East", "Lower Parel", "Powai", "Goregaon",
    "Andheri West", "Thane", "Vashi", "Nariman Point", "Airoli", "Navi Mumbai"
  ],
  Ahmedabad: [
    "SG Highway", "Prahlad Nagar", "Bodakdev", "Vastrapur", "Navrangpura",
    "Sindhu Bhavan Marg", "Thaltej", "Makarba", "Satellite", "Ambli", "GIFT City"
  ],
  Pune: [
    "Baner", "Kharadi", "Viman Nagar", "Shivajinagar", "Kalyani Nagar",
    "Hinjawadi", "Hadapsar", "Aundh", "Koregaon Park", "Kothrud"
  ],
  Hyderabad: [
    "HITEC City", "Madhapur", "Gachibowli", "Financial District", "Kondapur",
    "Banjara Hills", "Jubilee Hills", "Begumpet", "Kukatpally"
  ]
};

// Fallback coordinates for Map View
const CITY_COORDS: Record<string, [number, number]> = {
  delhi: [28.6139, 77.2090],
  gurgaon: [28.4595, 77.0266],
  noida: [28.5355, 77.3910],
  mumbai: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  ahmedabad: [23.0225, 72.5714],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  jaipur: [26.9124, 75.7873]
};

const BRANDS = [
  "All Brands", "Awfis", "DevX", "WeWork", "91springboard", "Innov8",
  "Regus", "Incuspaze", "Smartworks", "The Address", "Strata", "Oyo Workflo"
];

const PRODUCTS = [
  { id: "coworking", label: "Coworking Space", title: "Coworking Spaces" },
  { id: "managed", label: "Managed Office", title: "Managed Offices" },
  { id: "commercial", label: "Commercial Office", title: "Commercial Office Spaces" },
  { id: "day_pass", label: "Day Pass", title: "Day Pass Workspaces" },
  { id: "meeting_room", label: "Meeting Rooms", title: "Meeting & Training Rooms" },
  { id: "virtual_office", label: "Virtual Office", title: "Virtual Offices" },
];

function MarketplaceSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const initialCity = searchParams?.get("city") || "Delhi";
  const initialQ = searchParams?.get("q") || "";
  const initialLocality = searchParams?.get("locality") || "";
  const initialVertical = searchParams?.get("vertical") || searchParams?.get("type") || "coworking";

  // Filter States
  const [city, setCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedLocality, setSelectedLocality] = useState(initialLocality);
  const [selectedProduct, setSelectedProduct] = useState(initialVertical);
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
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

  // Selected property for Map view
  const [selectedMapProperty, setSelectedMapProperty] = useState<PropertyListing | null>(null);

  // Sync state with URL params if they change externally
  useEffect(() => {
    if (searchParams) {
      const c = searchParams.get("city");
      if (c && c !== city) setCity(c);
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
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (city && city.toLowerCase() !== "all") params.set("city", city);
        if (selectedProduct && selectedProduct.toLowerCase() !== "all") params.set("vertical", selectedProduct);
        if (selectedLocality) params.set("locality", selectedLocality);
        if (searchQuery && searchQuery.trim()) params.set("q", searchQuery.trim());
        if (sortBy) params.set("sort", sortBy);
        if (selectedBrand && selectedBrand !== "All Brands") {
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
            if (selectedBrand && selectedBrand !== "All Brands") {
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

  // Submit quick best-price enquiry
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
          notes: leadForm.message || "Best price quotation request from myHQ-style listing page"
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
      alert("Something went wrong. Please call +91 92050 06361 directly.");
    } finally {
      setIsSubmittingEnquiry(false);
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
  const currentCityLocalities = CITY_LOCALITIES[city] || [
    "Central Business District", "Tech Zone", "Airport Corridor", "IT Park", "Main Boulevard"
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col">
      {/* 1. Universal Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* 2. Top Sub-Navigation with Search Bar, Helpline, Share Requirement, Shortlists */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Instant Keyword Search Box with Location Icon */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search location or workspaces in ${city}...`}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0F8B7D] focus:ring-2 focus:ring-[#0F8B7D]/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Action Icons matching myHQ */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
            {/* Phone Helpline */}
            <a
              href="tel:+919205006361"
              className="hidden lg:flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#0F8B7D] transition-colors"
            >
              <Phone size={14} className="text-[#0F8B7D]" />
              <span>+91 9205006361</span>
            </a>

            {/* Share Requirement */}
            <Link
              href="/marketplace/requirement"
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 font-bold text-slate-700 hover:text-slate-900 bg-white transition-all shadow-2xs"
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
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
            <Link href="/marketplace" className="hover:text-slate-700">Home</Link>
            <span>&gt;</span>
            <span className="text-slate-600 capitalize">{activeProductObj.label}</span>
            <span>&gt;</span>
            <span className="text-[#0F8B7D] font-bold">{city}</span>
          </nav>

          {/* Heading + Request Callback Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeProductObj.title} In {city}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Vetted plug-and-play spaces, verified desks, and customized corporate offices with zero brokerage.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveModalProperty({ name: `General Office Consultation in ${city}` });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D3557] hover:bg-[#152741] text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Request Callback</span>
            </button>
          </div>

          {/* 4. Filter Bar (Horizontal Dropdowns) */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            
            {/* 1. Product Dropdown */}
            <div className="relative">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none"
              >
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>Product: {p.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* 2. City Dropdown */}
            <div className="relative">
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSelectedLocality("");
                }}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none"
              >
                {["Delhi", "Gurgaon", "Noida", "Bangalore", "Mumbai", "Pune", "Hyderabad", "Ahmedabad"].map((c) => (
                  <option key={c} value={c}>City: {c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* 3. Locations Dropdown */}
            <div className="relative">
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none max-w-[170px] truncate"
              >
                <option value="">Locations: All Locations</option>
                {currentCityLocalities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* 4. Sort By Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none"
              >
                <option value="popular">Sort By: Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating: Highest First</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* 5. Brands Dropdown */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none"
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>Brand: {b}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* 6. Price Range Dropdown */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold py-2 pl-3 pr-7 rounded-xl cursor-pointer shadow-2xs focus:ring-2 focus:ring-[#0F8B7D]/20 outline-none"
              >
                <option value="all">Price Range: Any</option>
                <option value="under_8k">Under ₹8,000 / mo</option>
                <option value="8k_15k">₹8,000 - ₹15,000 / mo</option>
                <option value="15k_25k">₹15,000 - ₹25,000 / mo</option>
                <option value="above_25k">Above ₹25,000 / mo</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters Text Button */}
            {(selectedLocality || searchQuery || selectedBrand !== "All Brands" || selectedPriceRange !== "all" || sortBy !== "popular") && (
              <button
                onClick={() => {
                  setSelectedLocality("");
                  setSearchQuery("");
                  setSelectedBrand("All Brands");
                  setSelectedPriceRange("all");
                  setSortBy("popular");
                }}
                className="text-xs font-black text-rose-600 hover:text-rose-700 underline px-2 py-1 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* 5. Popular Localities Chips Row (Horizontal Scroll with arrows) */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Popular Localities:
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {currentCityLocalities.map((loc) => {
                const isSelected = selectedLocality.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocality(isSelected ? "" : loc)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0F8B7D] text-white shadow-2xs font-bold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Results Header Row: Showing Results Count + View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-teal-700">
                <Loader2 size={13} className="animate-spin" /> Fetching live verified spaces...
              </span>
            ) : (
              <span>
                Showing <b className="text-slate-900">{listings.length} results</b> for {activeProductObj.label.toLowerCase()} in {city}
                {selectedLocality && <span className="text-[#0F8B7D]"> ({selectedLocality})</span>}
              </span>
            )}
          </p>

          <Link
            href="/marketplace/requirement"
            className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:underline"
          >
            <span>ℹ See which office setup suits you</span>
          </Link>
        </div>

        {/* View Switcher (List | Grid | Map) */}
        <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl text-xs font-bold shrink-0 shadow-2xs">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-[#0F8B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListIcon size={13} />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#0F8B7D] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid size={13} />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-[#0F8B7D] text-white shadow-xs"
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
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-10 h-10 text-[#0F8B7D] animate-spin" />
            <p className="text-sm font-bold text-slate-600">Loading verified commercial spaces in {city}...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 px-6 text-center bg-white rounded-3xl border border-slate-200 max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mx-auto">
              <Building2 size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Spaces Match Your Exact Filter</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              We couldn&apos;t find matching properties in {selectedLocality || city} with the chosen price/brand. Our enterprise sourcing desk can scout off-market floors for you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedLocality("");
                  setSearchQuery("");
                  setSelectedBrand("All Brands");
                  setSelectedPriceRange("all");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setActiveModalProperty({ name: `Custom Workspace Scouting in ${city}` })}
                className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Submit Custom Requirement
              </button>
            </div>
          </div>
        ) : viewMode === "map" ? (
          /* MAP VIEW: Split screen */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-3xl overflow-hidden border border-slate-200 bg-white p-3 shadow-sm">
            <div className="lg:col-span-5 h-full overflow-y-auto space-y-3 pr-2">
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMapProperty(mapProperties.find((m) => m.id === item.slug || m.id === item.id) || null)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    selectedMapProperty?.id === item.slug || selectedMapProperty?.id === item.id
                      ? "border-[#0F8B7D] bg-teal-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <img
                    src={item.featuredImage || (item.images && item.images[0]) || "/images/showcase_office_techhorizon_hd.jpg"}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
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
            <div className="lg:col-span-7 h-full rounded-2xl overflow-hidden relative">
              <RealGoogleMap
                properties={mapProperties}
                selectedProperty={selectedMapProperty}
                onSelectProperty={(p) => setSelectedMapProperty(p)}
              />
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW: 3-column cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((space) => {
              const photos = space.images && space.images.length > 0 ? space.images : [space.featuredImage || "/images/showcase_office_techhorizon_hd.jpg"];
              const currentPhotoIdx = photoIndexes[space.id] || 0;
              const photo = photos[currentPhotoIdx] || photos[0];
              const isShortlisted = shortlistedIds.includes(space.id);
              const isCompared = comparedListings.some((l) => l.id === space.id);

              return (
                <div
                  key={space.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Photo Carousel */}
                  <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={photo}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => handlePrevPhoto(e, space.id, photos.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={(e) => handleNextPhoto(e, space.id, photos.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-[#0F8B7D] text-white text-[9px] font-extrabold uppercase shadow-xs">
                        {space.brandName || "Grade A"}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                      <button
                        onClick={(e) => toggleShortlist(e, space.id)}
                        className="w-7 h-7 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Heart size={14} className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-slate-600"} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-extrabold text-[#0F8B7D]">⭐ {space.avgRating || "4.5"} ({space.totalReviews || 18} reviews)</span>
                        <span className="text-slate-400 font-bold">{space.totalSeats ? `${space.totalSeats} seats` : "Turnkey"}</span>
                      </div>
                      <Link href={`/marketplace/${space.slug || space.id}`}>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors truncate">
                          {space.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{space.locality}, {space.city}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Starting From</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          ₹{Number(space.startingPrice || 8500).toLocaleString("en-IN")}<span className="text-[10px] font-normal text-slate-500"> / seat</span>
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveModalProperty(space)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1D3557] hover:bg-[#152741] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
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
          /* 8. LIST VIEW (EXACT 2-COLUMN myHQ UX: 70% Cards Feed + 30% Sticky Advisor) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8 of 12 cols): Real Property Cards Feed */}
            <div className="lg:col-span-8 space-y-5">
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
                    {/* Interstitial Banner 1: Client Logos after 2nd card */}
                    {idx === 2 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                          5,000+ Clients Served &amp; Counting ✨
                        </span>
                        <div className="flex flex-wrap items-center justify-between gap-4 grayscale opacity-75">
                          <span className="font-black text-sm tracking-widest text-slate-800">SanDisk</span>
                          <span className="font-extrabold text-xs tracking-wider text-slate-800">ADITYA BIRLA</span>
                          <span className="font-black text-sm text-slate-800">BAJAJ CAPITAL</span>
                          <span className="font-black text-sm text-teal-700">yulu</span>
                          <span className="font-extrabold text-xs text-slate-800">MILES EDU</span>
                        </div>
                      </div>
                    )}

                    {/* Interstitial Banner 2: Trust Card after 5th card */}
                    {idx === 5 && (
                      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                        <div className="space-y-1 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-[10px] font-black uppercase">
                            <CheckCircle2 size={12} /> Physically Audited Stock
                          </div>
                          <h4 className="text-base font-black">Verified Spaces You Can Trust</h4>
                          <p className="text-xs text-emerald-100 max-w-md">
                            Every workspace is personally inspected by OfficeX consultants for lease legitimacy, backup power, acoustic privacy, and sanitization.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveModalProperty({ name: `Personal Workspace Audit in ${city}` })}
                          className="px-4 py-2 rounded-xl bg-white text-teal-900 font-black text-xs hover:bg-emerald-50 transition-all shrink-0 cursor-pointer"
                        >
                          Explore Options
                        </button>
                      </div>
                    )}

                    {/* myHQ Canonical Wide Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:border-teal-400 transition-all duration-300 flex flex-col sm:flex-row group">
                      
                      {/* Left: Rich Photo Carousel (~40% of Card) */}
                      <div className="relative w-full sm:w-72 h-64 sm:h-auto min-h-[220px] bg-slate-900 shrink-0 overflow-hidden">
                        <Link href={`/marketplace/${space.slug || space.id}`} className="block w-full h-full">
                          <img
                            src={photo}
                            alt={space.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        {/* Prev / Next Carousel Arrow Buttons */}
                        {photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handlePrevPhoto(e, space.id, photos.length)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md"
                              aria-label="Previous photo"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleNextPhoto(e, space.id, photos.length)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer z-20 shadow-md"
                              aria-label="Next photo"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </>
                        )}

                        {/* Top Left Tag */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                            Main Entrance Area
                          </span>
                        </div>

                        {/* Photo counter dots */}
                        {photos.length > 1 && (
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                            {photos.slice(0, 5).map((_photo: string, pIdx: number) => (
                              <span
                                key={pIdx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  currentPhotoIdx === pIdx ? "bg-white w-3" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Property Details & CTA (~60% of Card) */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Row 1: Rating badge + Shortlist & Compare checkboxes */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="inline-flex items-center gap-1 text-xs font-black text-slate-800">
                              <span className="text-amber-500">⭐ {space.avgRating || "4.4"}</span>
                              <span className="text-slate-400 font-semibold">({space.totalReviews || 24} reviews)</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Shortlist */}
                              <button
                                onClick={(e) => toggleShortlist(e, space.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Heart size={14} className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-slate-400"} />
                                <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
                              </button>

                              {/* Compare */}
                              <button
                                onClick={(e) => toggleCompare(e, space)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0F8B7D] transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isCompared}
                                  readOnly
                                  className="w-3.5 h-3.5 rounded text-[#0F8B7D] focus:ring-0 cursor-pointer pointer-events-none"
                                />
                                <span>Compare</span>
                              </button>
                            </div>
                          </div>

                          {/* Row 2: Property Name (Brand - Title) */}
                          <Link href={`/marketplace/${space.slug || space.id}`}>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0F8B7D] transition-colors leading-snug">
                              {displayTitle}
                            </h2>
                          </Link>

                          {/* Row 3: Locality & City */}
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span>{space.locality ? `${space.locality}, ${space.city}` : space.city}</span>
                          </p>

                          {/* Row 4: Timings & Metro connectivity */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              <span className="text-emerald-700 font-bold">Open Now</span>, 08:30 to 20:30
                            </span>

                            <button
                              onClick={() => setExpandedMetro((prev) => ({ ...prev, [space.id]: !prev[space.id] }))}
                              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                            >
                              <Train size={12} className="text-teal-600" />
                              <span>Metro/Rail Connectivity</span>
                              <ChevronDown size={12} className={`transition-transform ${expandedMetro[space.id] ? "rotate-180" : ""}`} />
                            </button>
                          </div>

                          {/* Expanded Metro Info */}
                          {expandedMetro[space.id] && (
                            <div className="mt-1.5 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200/80">
                              <span>Nearest Metro: <b className="text-slate-800">{space.locality} Metro Station</b> (~450m walking distance). Rapid feeder auto &amp; shared shuttle available.</span>
                            </div>
                          )}

                          {/* Row 5: Amenities Tags */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {(space.amenities || [
                              "Commute Friendly", "Meeting Rooms", "Break Rooms", "100% DG Backup"
                            ]).slice(0, 3).map((amenity: string, aIdx: number) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                              >
                                <Check size={10} className="text-[#0F8B7D]" />
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

                        {/* Row 6: Bottom Pricing & "Get best price" CTA */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-end justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                              Quoted price (negotiable)
                            </span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
                                {formattedPrice}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {priceSuffix}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/marketplace/${space.slug || space.id}`}
                              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 font-bold text-xs text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              <span>View details</span>
                              <ArrowRight size={12} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setActiveModalProperty(space)}
                              className="px-4 py-2 rounded-xl bg-[#1D3557] hover:bg-[#152741] text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
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

            {/* Right Column (4 of 12 cols): myHQ Canonical Sticky Advisory Card & Price Guarantee */}
            <aside className="lg:col-span-4 sticky top-16 space-y-4">
              
              {/* Consultant Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 leading-snug">
                  Upgrade your office with Himanshu Sheakher &amp; team
                </h3>

                {/* Consultant Profile Details */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-teal-200 shrink-0">
                    <img
                      src="/images/advisor_himanshu.jpg"
                      alt="Himanshu Sheakher"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = "/images/pro_property_manager.jpg";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">Himanshu Sheakher</h4>
                    <span className="text-[11px] text-slate-500 font-mono block">+91-9205006361</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#0F8B7D] bg-teal-50 px-1.5 py-0.2 rounded mt-0.5">
                      <ShieldCheck size={10} /> myHQ / OfficeX Consultant
                    </span>
                  </div>
                </div>

                {/* Subtext description */}
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                  Himanshu&apos;s team has guided 150+ companies to find, customize, and finalize their ideal workspaces across {city}.
                </p>

                {/* Value bullets */}
                <div className="space-y-2 pt-1 text-xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Move into your ideal workspace — stress-free:
                  </span>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Check size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Guidance on location &amp; seating setup</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Check size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Curated workspace tours in 24 hours</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Check size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>Design, fit-out &amp; layout assistance</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Check size={14} className="text-[#0F8B7D] shrink-0 mt-0.5" />
                    <span>End-to-end commercial lease negotiation</span>
                  </div>
                </div>

                {/* Connect button */}
                <button
                  type="button"
                  onClick={() => setActiveModalProperty({ name: `Advisor Consultation with Himanshu Sheakher (${city})` })}
                  className="w-full py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#152741] text-white font-black text-xs transition-all shadow-sm cursor-pointer"
                >
                  Connect with us
                </button>
              </div>

              {/* myHQ Price Guarantee Card */}
              <div className="bg-[#EBF7F2] border border-[#BDE8D6] rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950">OfficeX / myHQ Price Guarantee</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                    Zero fees to tenants. Real savings — up to 15% discount negotiated directly with property owners and flex operators.
                  </p>
                </div>
              </div>

              {/* Enterprise Need Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Briefcase size={14} className="text-[#0F8B7D]" />
                  <span>Looking for 50 to 500+ Desks?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Get dedicated managed floor plates built with zero capex, custom branding, and private boardrooms.
                </p>
                <Link
                  href="/marketplace/requirement"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8B7D] hover:underline pt-1"
                >
                  <span>Build custom enterprise RFP</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* 9. Canonical "Get Best Price" / Callback Modal */}
      {activeModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
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
                <h3 className="text-lg font-black text-slate-900">Quotation Request Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our dedicated corporate advisor is locking in the best negotiated tariff for you and will call you within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBestPriceSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0F8B7D] tracking-wider block">
                    Zero Brokerage • Guaranteed Best Price
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
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
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Work Email</label>
                      <input
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Team Size</label>
                      <select
                        value={leadForm.teamSize}
                        onChange={(e) => setLeadForm({ ...leadForm, teamSize: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-[#0F8B7D] outline-none cursor-pointer"
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
                  className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
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
