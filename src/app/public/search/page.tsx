"use client";
import React, { useState, useEffect, Suspense } from "react";
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
  Send
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

  const [city, setCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [spaceType, setSpaceType] = useState("Office Space");
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

  // Real Iconic Commercial Buildings in Mumbai BKC
  const properties: PropertyListing[] = [
    {
      id: "apex-bkc",
      title: "One BKC — North Wing Executive",
      buildingName: "One BKC Commercial Complex",
      location: "G Block, Bandra Kurla Complex, Mumbai",
      subLocation: "Opp. Bank of Baroda, BKC",
      area: "4,500 sqft",
      capacity: "60 Seats",
      furnishing: "Fully Furnished",
      price: "₹1.25L",
      pricePerSqft: "₹185/sq.ft.",
      pricePerSeat: "₹12,500/seat",
      propertyScore: 86,
      readiness: "Immediate Move-in",
      commuteScore: 94,
      energyRating: "LEED Gold",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
      lat: 19.0664,
      lng: 72.8680
    },
    {
      id: "maker-maxity",
      title: "Maker Maxity — 5th Floor Suite",
      buildingName: "Maker Maxity Business Park",
      location: "BKC Entry, Bandra East, Mumbai",
      subLocation: "Near Jio World Garden",
      area: "2,800 sqft",
      capacity: "35 Seats",
      furnishing: "Semi-Furnished",
      price: "₹72K",
      pricePerSqft: "₹140/sq.ft.",
      pricePerSeat: "₹10,200/seat",
      propertyScore: 89,
      readiness: "Fit-out Ready (10d)",
      commuteScore: 88,
      energyRating: "IGBC Platinum",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
      lat: 19.0607,
      lng: 72.8519
    },
    {
      id: "godrej-bkc",
      title: "Godrej BKC — Floor 8 Horizon Plate",
      buildingName: "Godrej BKC Flagship Tower",
      location: "G Block, BKC Main Road, Mumbai",
      subLocation: "Adjoining MCA Club",
      area: "6,200 sqft",
      capacity: "90 Seats",
      furnishing: "Fully Furnished",
      price: "₹2.10L",
      pricePerSqft: "₹195/sq.ft.",
      pricePerSeat: "₹14,000/seat",
      propertyScore: 92,
      readiness: "Immediate Move-in",
      commuteScore: 91,
      energyRating: "LEED Platinum",
      image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
      lat: 19.0689,
      lng: 72.8695
    },
    {
      id: "the-capital",
      title: "The Capital — Suite 704 Cyber Wing",
      buildingName: "The Capital (Wadhwa)",
      location: "Plot C-70, G Block, BKC, Mumbai",
      subLocation: "Opp. ICICI Bank Towers",
      area: "3,400 sqft",
      capacity: "45 Seats",
      furnishing: "Plug & Play",
      price: "₹95K",
      pricePerSqft: "₹120/sq.ft.",
      pricePerSeat: "₹9,500/seat",
      propertyScore: 82,
      readiness: "Available in 15d",
      commuteScore: 84,
      energyRating: "IGBC Gold",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
      lat: 19.0637,
      lng: 72.8631
    }
  ];

  // Merge with real properties from database
  const [dbProperties, setDbProperties] = useState<PropertyListing[]>([]);

  useEffect(() => {
    async function fetchRealProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          const mapped: PropertyListing[] = data
            .filter((p: any) => p.latitude && p.longitude)
            .map((p: any) => ({
              id: p.id,
              title: p.name,
              buildingName: p.name,
              location: `${p.micro_market || p.microMarket || ""}, ${p.city}, ${p.state || ""}`.replace(/^, /, ""),
              subLocation: p.address || "",
              area: p.total_area ? `${Number(p.total_area).toLocaleString()} sqft` : "N/A",
              capacity: "—",
              furnishing: "Warm Shell",
              price: "Contact",
              pricePerSqft: "Market Rate",
              pricePerSeat: "—",
              propertyScore: 75,
              readiness: "Available",
              commuteScore: 70,
              energyRating: p.grade === "A" ? "Grade A" : `Grade ${p.grade || "A"}`,
              image: p.image_url || p.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
              lat: parseFloat(p.latitude),
              lng: parseFloat(p.longitude)
            }));
          setDbProperties(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch real properties:", err);
      }
    }
    fetchRealProperties();
  }, []);

  // Combine demo and real DB properties
  const allProperties = [...properties, ...dbProperties];

  // Filter properties based on search query
  const filteredProperties = allProperties.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.buildingName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.subLocation.toLowerCase().includes(q) ||
      p.area.toLowerCase().includes(q) ||
      p.price.toLowerCase().includes(q)
    );
  });

  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

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
          {/* Main Keyword Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search building, landmark (e.g. One BKC)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0F8B7D] bg-gray-50/50 focus:bg-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs shrink-0 max-w-[200px]"
            >
              <optgroup label="⭐ Key Hubs">
                <option value="Gujarat">📍 Gujarat (Ahmedabad / GIFT City)</option>
                <option value="Mumbai">📍 Mumbai (BKC / Lower Parel)</option>
                <option value="Bengaluru">📍 Bengaluru (ORR / Whitefield)</option>
                <option value="Delhi NCR">📍 Delhi NCR (Gurugram / Noida)</option>
                <option value="Hyderabad">📍 Hyderabad (HITEC City)</option>
                <option value="Pune">📍 Pune (Hinjewadi / Kharadi)</option>
                <option value="Chennai">📍 Chennai (OMR / Guindy)</option>
                <option value="Kolkata">📍 Kolkata (Sector V / New Town)</option>
              </optgroup>
              <optgroup label="🏢 Tier-2 Cities">
                <option value="Ahmedabad">📍 Ahmedabad</option>
                <option value="Gandhinagar">📍 Gandhinagar & GIFT City</option>
                <option value="Surat">📍 Surat</option>
                <option value="Vadodara">📍 Vadodara</option>
                <option value="Jaipur">📍 Jaipur</option>
                <option value="Indore">📍 Indore</option>
                <option value="Kochi">📍 Kochi</option>
                <option value="Chandigarh">📍 Chandigarh & Mohali</option>
                <option value="Lucknow">📍 Lucknow</option>
                <option value="Bhubaneswar">📍 Bhubaneswar</option>
                <option value="Goa">📍 Goa</option>
              </optgroup>
              <optgroup label="🇮🇳 States">
                <option value="Andhra Pradesh">📍 Andhra Pradesh</option>
                <option value="Assam">📍 Assam</option>
                <option value="Bihar">📍 Bihar</option>
                <option value="Haryana">📍 Haryana</option>
                <option value="Kerala">📍 Kerala</option>
                <option value="Madhya Pradesh">📍 Madhya Pradesh</option>
                <option value="Punjab">📍 Punjab</option>
                <option value="Rajasthan">📍 Rajasthan</option>
                <option value="Tamil Nadu">📍 Tamil Nadu</option>
                <option value="Telangana">📍 Telangana</option>
                <option value="Uttar Pradesh">📍 Uttar Pradesh</option>
                <option value="West Bengal">📍 West Bengal</option>
              </optgroup>
            </select>

            <select
              value={spaceType}
              onChange={(e) => setSpaceType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs shrink-0"
            >
              <option>Office Space</option>
              <option>Managed Coworking</option>
              <option>Enterprise Suite</option>
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
              <h1 className="text-base md:text-lg font-black text-gray-900">Commercial Workspaces in Mumbai BKC</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Showing {filteredProperties.length} verified Grade-A landmark towers
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pb-20 md:pb-6">
            {filteredProperties.map((prop) => {
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
                            href={`/public/property/${prop.id}`}
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
        </div>

        {/* Right: Real Google Map */}
        <div 
          className={`h-full relative overflow-hidden ${
            mobileView === "list" ? "hidden md:block" : "block"
          }`}
        >
          <RealGoogleMap
            properties={filteredProperties}
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
                    href={`/public/property/${selectedProperty.id}`}
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
                  setToast(`Enquiry sent for ${enquiryProperty.title}! Added to Leasing CRM.`);
                  setEnquiryForm({ company: "", email: "", phone: "", seats: "60" });
                  setTimeout(() => setToast(null), 4000);
                }, 600);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">COMPANY NAME</label>
                <input
                  value={enquiryForm.company}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                  placeholder="e.g. Acme Innovations"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OFFICIAL EMAIL</label>
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PHONE</label>
                  <input
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">REQUIRED SEATS</label>
                <input
                  type="number"
                  value={enquiryForm.seats}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, seats: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryProperty(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={12} /> {isSubmitting ? "Sending..." : "Submit Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertySearchAndDiscovery() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-3">
          <div className="w-10 h-10 border-4 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-500">Loading Commercial Properties...</p>
        </div>
      }
    >
      <PropertySearchContent />
    </Suspense>
  );
}
