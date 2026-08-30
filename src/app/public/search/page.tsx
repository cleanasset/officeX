"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Minus, Layers, ArrowRight, ChevronLeft, ChevronRight, Check, SlidersHorizontal, Scale, Download, X, Star, ShieldCheck, MapPin } from "lucide-react";

interface PropertyListing {
  id: string;
  title: string;
  location: string;
  area: string;
  capacity: string;
  furnishing: string;
  price: string;
  pricePerSqft: string;
  pricePerSeat: string;
  propertyScore: number;
  readiness: string;
  commuteScore: number;
  energyRating: string;
  image: string;
  coordinates: { x: string; y: string };
}

export default function PropertySearchAndDiscovery() {
  const [city, setCity] = useState("Mumbai");
  const [spaceType, setSpaceType] = useState("Office Space");
  const [size, setSize] = useState("2,000 - 5,000 Sq.Ft");
  const [budget, setBudget] = useState("Budget");
  const [gradeA, setGradeA] = useState(true);
  const [furnished, setFurnished] = useState(false);
  const [selectedScore, setSelectedScore] = useState("All Scores");

  // Comparison State
  const [compareList, setCompareList] = useState<PropertyListing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const properties: PropertyListing[] = [
    {
      id: "apex-bkc",
      title: "Apex BKC Mumbai",
      location: "Bandra Kurla Complex, Mumbai",
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
      coordinates: { x: "42%", y: "38%" }
    },
    {
      id: "meridian-whitefield",
      title: "Meridian Whitefield",
      location: "Whitefield, Bengaluru",
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
      coordinates: { x: "22%", y: "60%" }
    },
    {
      id: "nexus-hub",
      title: "Nexus Innovation Tower",
      location: "Cyber City, Gurugram",
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
      coordinates: { x: "65%", y: "25%" }
    },
    {
      id: "crystal-tower",
      title: "Crystal Business Park",
      location: "Viman Nagar, Pune",
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
      coordinates: { x: "55%", y: "70%" }
    }
  ];

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
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Filters Bar */}
      <div className="border-b border-gray-200 px-8 py-3.5 flex items-center justify-between gap-3 bg-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>📍 Mumbai</option>
            <option>📍 Bengaluru</option>
            <option>📍 Pune</option>
            <option>📍 Gurugram</option>
          </select>

          <select
            value={spaceType}
            onChange={(e) => setSpaceType(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Office Space</option>
            <option>Managed Coworking</option>
            <option>Enterprise Suite</option>
            <option>Retail Floor</option>
          </select>

          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>2,000 - 5,000 Sq.Ft</option>
            <option>&lt; 2,000 Sq.Ft</option>
            <option>&gt; 5,000 Sq.Ft</option>
          </select>

          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <option>Budget Range</option>
            <option>&lt; ₹1L/mo</option>
            <option>₹1L - ₹2.5L/mo</option>
            <option>&gt; ₹2.5L/mo</option>
          </select>

          <button
            onClick={() => setGradeA(!gradeA)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              gradeA ? "bg-[#0F8B7D] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Grade A Certified
          </button>

          <button
            onClick={() => setFurnished(!furnished)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              furnished ? "bg-[#0F8B7D] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Furnished
          </button>
        </div>

        <div className="flex items-center gap-3">
          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0F8B7D] text-xs font-bold flex items-center gap-1.5 hover:bg-teal-100"
            >
              <Scale size={13} /> Compare ({compareList.length})
            </button>
          )}

          <button className="text-xs font-semibold text-gray-500 hover:text-gray-800">Clear All</button>
          <button className="px-5 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-sm">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Split View: Left Results Feed + Right Interactive Map */}
      <div className="flex-1 grid grid-cols-2">
        {/* Left Side: Property Listings Feed */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Properties in Mumbai</h1>
              <p className="text-xs text-gray-400 mt-0.5">Showing 1-4 of 124 verified commercial spaces</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 flex items-center gap-1 cursor-pointer">
                Sort by: <span className="text-[#0F8B7D]">OFFICEX Score ⇅</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {properties.map((prop) => {
              const isComp = compareList.some((c) => c.id === prop.id);

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col p-5 hover:shadow-lg transition-all relative group"
                >
                  <div className="flex gap-5">
                    {/* Image Box */}
                    <div className="w-56 h-44 rounded-xl overflow-hidden relative shrink-0">
                      <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[9px] font-black text-emerald-700 shadow-sm flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> VERIFIED
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-600/90 backdrop-blur-sm text-[9px] font-black text-white shadow-sm">
                          GRADE A
                        </span>
                      </div>

                      {/* OFFICEX Property Score Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-gray-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black">{prop.propertyScore}</span>
                        <span className="text-[9px] text-gray-300 font-semibold">/ 100</span>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">{prop.title}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0F8B7D] text-[10px] font-bold border border-teal-100">
                                {prop.readiness}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <MapPin size={12} className="text-gray-400" /> {prop.location}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => toggleCompare(prop)}
                            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                              isComp ? "bg-[#0F8B7D] text-white border-[#0F8B7D]" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                            title="Compare space"
                          >
                            <Scale size={13} /> {isComp ? "Added" : "Compare"}
                          </button>
                        </div>

                        {/* Specs Grid */}
                        <div className="bg-gray-50/80 rounded-xl p-3 mt-3 grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">AREA & RATE</p>
                            <p className="font-bold text-gray-800 mt-0.5">{prop.area}</p>
                            <p className="text-[10px] text-gray-500">{prop.pricePerSqft}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">CAPACITY & SEAT</p>
                            <p className="font-bold text-gray-800 mt-0.5">{prop.capacity}</p>
                            <p className="text-[10px] text-gray-500">{prop.pricePerSeat}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">COMMUTE & ESG</p>
                            <p className="font-bold text-emerald-700 mt-0.5">{prop.commuteScore}/100 Commute</p>
                            <p className="text-[10px] text-teal-700 font-semibold">{prop.energyRating}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & CTAs */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-2xl font-black text-gray-900 leading-none">
                            {prop.price} <span className="text-xs text-gray-400 font-normal">/month</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/public/property/${prop.id}`}
                            className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs flex items-center gap-1"
                          >
                            View Details <ArrowRight size={13} />
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
          <div className="flex items-center justify-center gap-1 pt-6">
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 flex items-center gap-1">
              ← Previous
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0F8B7D] text-white font-bold text-xs shadow-xs">1</button>
            <button className="w-8 h-8 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-xs">2</button>
            <button className="w-8 h-8 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-xs">3</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="w-8 h-8 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-xs">12</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0F8B7D] hover:bg-teal-50 flex items-center gap-1">
              Next →
            </button>
          </div>
        </div>

        {/* Right Side: Map Canvas */}
        <div className="bg-[#EBF1F5] border-l border-gray-200 relative overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          {/* Map Price Pins with Property Scores */}
          {properties.map((p) => (
            <div
              key={p.id}
              style={{ top: p.coordinates.y, left: p.coordinates.x }}
              className="absolute px-3 py-1.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-black shadow-xl cursor-pointer ring-4 ring-white/70 transform hover:scale-110 transition-transform flex items-center gap-1.5"
            >
              <span>{p.price}</span>
              <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-bold">
                ★{p.propertyScore}
              </span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F8B7D] rotate-45" />
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <button className="p-2.5 hover:bg-gray-50 text-gray-700 border-b border-gray-100"><Plus size={16} /></button>
              <button className="p-2.5 hover:bg-gray-50 text-gray-700"><Minus size={16} /></button>
            </div>
            <button className="p-2.5 bg-white rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 text-gray-700">
              <Layers size={16} />
            </button>
          </div>

          {/* Legend Card */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-200 z-10 space-y-2 text-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OFFICEX AVAILABILITY STATUS</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-700 font-semibold">Available (Active Lease Roll)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-gray-700 font-semibold">Under LOI Negotiation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-700 font-semibold">Leased (Occupied)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Drawer Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200">
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
