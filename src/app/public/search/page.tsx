"use client";
import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  MapPin
} from "lucide-react";
import type { PropertyListing } from "@/components/RealGoogleMap";

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

export default function PropertySearchAndDiscovery() {
  const [city, setCity] = useState("Mumbai");
  const [searchQuery, setSearchQuery] = useState("");
  const [spaceType, setSpaceType] = useState("Office Space");
  const [size, setSize] = useState("2,000 - 5,000 Sq.Ft");
  const [budget, setBudget] = useState("Budget");
  const [gradeA, setGradeA] = useState(true);
  const [furnished, setFurnished] = useState(false);

  // Comparison State
  const [compareList, setCompareList] = useState<PropertyListing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
      pricePerSqft: "₹170/sq.ft.",
      pricePerSeat: "₹11,800/seat",
      propertyScore: 92,
      readiness: "Immediate Move-in",
      commuteScore: 96,
      energyRating: "BEE 5-Star",
      image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
      lat: 19.0682,
      lng: 72.8695
    },
    {
      id: "the-capital",
      title: "The Capital (Platina) — Cybernetic Floor",
      buildingName: "The Capital Commercial Tower",
      location: "Plot C-70, G Block, BKC, Mumbai",
      subLocation: "Behind ICICI Regional HQ",
      area: "3,400 sqft",
      capacity: "45 Seats",
      furnishing: "Warm Shell",
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

  // Filter properties based on search query
  const filteredProperties = properties.filter((p) => {
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
    <div className="h-screen max-h-screen bg-white font-sans flex flex-col overflow-hidden">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Filters & Search Bar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-3 bg-white shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Main Keyword Search Bar */}
          <div className="relative min-w-[260px] max-w-sm">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search building, area, landmark (e.g. One BKC, Godrej)..."
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

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs"
          >
            <option>📍 Mumbai (BKC)</option>
            <option>📍 Bengaluru (Whitefield)</option>
            <option>📍 Pune (Hinjewadi)</option>
            <option>📍 Gurugram (Cyber City)</option>
          </select>

          <select
            value={spaceType}
            onChange={(e) => setSpaceType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs"
          >
            <option>Office Space</option>
            <option>Managed Coworking</option>
            <option>Enterprise Suite</option>
            <option>Retail Floor</option>
          </select>

          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs"
          >
            <option>2,000 - 5,000 Sq.Ft</option>
            <option>&lt; 2,000 Sq.Ft</option>
            <option>&gt; 5,000 Sq.Ft</option>
          </select>

          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white shadow-xs"
          >
            <option>Budget Range</option>
            <option>&lt; ₹1L/mo</option>
            <option>₹1L - ₹2.5L/mo</option>
            <option>&gt; ₹2.5L/mo</option>
          </select>

          <button
            onClick={() => setGradeA(!gradeA)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              gradeA ? "bg-[#0F8B7D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Grade A
          </button>

          <button
            onClick={() => setFurnished(!furnished)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              furnished ? "bg-[#0F8B7D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Furnished
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {compareList.length > 0 && (
            <button
              onClick={() => { setSelectedProperty(null); setIsCompareOpen(true); }}
              className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100 shadow-xs cursor-pointer"
            >
              <Scale size={13} /> Compare ({compareList.length})
            </button>
          )}

          <button
            onClick={() => { setSearchQuery(""); setBudget("Budget"); setGradeA(true); setFurnished(false); }}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Split View: Left Results (40% width, independently scrolling) + Right Real Google Maps (60% width, fixed full height) */}
      <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-[40%_60%] h-full">
        {/* Left Side: Property Listings Feed (Scrolls independently) */}
        <div className="h-full min-h-0 overflow-y-auto p-5 space-y-4 border-r border-gray-200 bg-gray-50/40">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/70">
            <div>
              <h1 className="text-lg font-black text-gray-900">Commercial Workspaces in Mumbai BKC</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Showing {filteredProperties.length} of {properties.length} verified landmark towers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1 cursor-pointer">
                Sort: <span className="text-[#0F8B7D]">OFFICEX Score ⇅</span>
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
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
                    <div className="w-full sm:w-36 h-32 rounded-xl overflow-hidden relative shrink-0">
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
                            onClick={(e) => { e.stopPropagation(); toggleCompare(prop); }}
                            className={`p-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 ${
                              isComp ? "bg-[#0F8B7D] text-white border-[#0F8B7D]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                            title="Compare space"
                          >
                            <Scale size={11} /> {isComp ? "Added" : "Compare"}
                          </button>
                        </div>

                        {/* Specs Grid */}
                        <div className="bg-gray-50 rounded-xl p-2 mt-2 grid grid-cols-3 gap-1 text-[9px]">
                          <div>
                            <p className="text-[7px] font-bold text-gray-400 uppercase">AREA & RATE</p>
                            <p className="font-bold text-gray-800">{prop.area}</p>
                            <p className="text-[8px] text-gray-500">{prop.pricePerSqft}</p>
                          </div>
                          <div>
                            <p className="text-[7px] font-bold text-gray-400 uppercase">SEATS</p>
                            <p className="font-bold text-gray-800">{prop.capacity}</p>
                            <p className="text-[8px] text-gray-500">{prop.pricePerSeat}</p>
                          </div>
                          <div>
                            <p className="text-[7px] font-bold text-gray-400 uppercase">COMMUTE</p>
                            <p className="font-bold text-emerald-700">{prop.commuteScore}/100</p>
                            <p className="text-[8px] text-teal-700 font-semibold">{prop.energyRating}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTAs */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                        <div>
                          <p className="text-base font-black text-gray-900 leading-none">
                            {prop.price} <span className="text-[9px] text-gray-400 font-normal">/mo</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/public/property/${prop.id}`}
                            className="px-3 py-1.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-[10px] font-bold shadow-xs flex items-center gap-1"
                          >
                            View Details <ArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 pt-3 pb-4">
            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-100">← Prev</button>
            <button className="w-6 h-6 rounded-lg bg-[#0F8B7D] text-white font-bold text-[11px]">1</button>
            <button className="w-6 h-6 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-[11px]">2</button>
            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0F8B7D] hover:bg-teal-50">Next →</button>
          </div>
        </div>

        {/* Right Side: 100% REAL Interactive Google Map (60% width) */}
        <div className="w-full h-full relative">
          <RealGoogleMap
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(p) => setSelectedProperty(p)}
          />
        </div>
      </div>

      {/* Comparison Drawer Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl border-t border-gray-200 max-w-6xl w-full p-8 shadow-2xl max-h-[80vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <Scale size={20} className="text-[#0F8B7D]" />
                <h2 className="text-xl font-black text-gray-900">Commercial Space Comparison ({compareList.length}/3)</h2>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {compareList.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                  <div className="h-32 rounded-xl overflow-hidden relative">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      Score: {c.propertyScore}/100
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{c.title}</h3>
                    <p className="text-xs text-gray-500">{c.location}</p>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-gray-200">
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Rent / Month</span>
                      <span className="font-black text-gray-900">{c.price}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Rate / Sq.Ft.</span>
                      <span className="font-bold text-gray-800">{c.pricePerSqft}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Rate / Seat</span>
                      <span className="font-bold text-gray-800">{c.pricePerSeat}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Furnishing</span>
                      <span className="font-semibold text-gray-700">{c.furnishing}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Operational Readiness</span>
                      <span className="font-bold text-teal-700">{c.readiness}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Commute Score</span>
                      <span className="font-bold text-emerald-600">{c.commuteScore}/100</span>
                    </div>
                  </div>

                  <Link
                    href={`/public/property/${c.id}`}
                    className="block text-center w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs"
                  >
                    Select & Request Proposal
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
