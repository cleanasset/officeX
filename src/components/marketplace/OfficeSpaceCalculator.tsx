"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator, Building2, Users, DollarSign, ArrowRight,
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, Download,
  TrendingDown, ShieldCheck, HelpCircle, Layers, PieChart,
  Plus, Minus, RefreshCw, Sliders, Briefcase, Coffee, Printer,
  Maximize2, ArrowUpRight, Phone
} from "lucide-react";

interface MicromarketBenchmark {
  name: string;
  rentPsf: number;
  opexPsf: number;
  capexPsf: number;
  miscPsf: number;
  coworkingDeskPrice: number;
}

interface CityData {
  name: string;
  micromarkets: MicromarketBenchmark[];
}

const CITY_BENCHMARKS: Record<string, CityData> = {
  gurgaon: {
    name: "Gurgaon / Delhi NCR",
    micromarkets: [
      { name: "Golf Course Road", rentPsf: 100, opexPsf: 50, capexPsf: 2000, miscPsf: 10, coworkingDeskPrice: 14699 },
      { name: "Cyber City (DLF)", rentPsf: 135, opexPsf: 55, capexPsf: 2200, miscPsf: 12, coworkingDeskPrice: 16500 },
      { name: "Sohna Road", rentPsf: 55, opexPsf: 30, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 8500 },
      { name: "Udyog Vihar", rentPsf: 45, opexPsf: 25, capexPsf: 1500, miscPsf: 8, coworkingDeskPrice: 7500 },
      { name: "Noida Expressway", rentPsf: 50, opexPsf: 28, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 8000 }
    ]
  },
  mumbai: {
    name: "Mumbai",
    micromarkets: [
      { name: "Bandra Kurla Complex (BKC)", rentPsf: 220, opexPsf: 55, capexPsf: 2800, miscPsf: 18, coworkingDeskPrice: 19500 },
      { name: "Lower Parel / Worli", rentPsf: 165, opexPsf: 48, capexPsf: 2400, miscPsf: 15, coworkingDeskPrice: 16000 },
      { name: "Andheri East (MIDC/JB Nagar)", rentPsf: 110, opexPsf: 38, capexPsf: 2000, miscPsf: 12, coworkingDeskPrice: 12500 },
      { name: "Powai / Kanjurmarg", rentPsf: 125, opexPsf: 42, capexPsf: 2100, miscPsf: 14, coworkingDeskPrice: 13500 },
      { name: "Navi Mumbai (Vashi/Airoli)", rentPsf: 60, opexPsf: 26, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 7999 }
    ]
  },
  ahmedabad: {
    name: "Ahmedabad & GIFT City",
    micromarkets: [
      { name: "SG Highway Commercial Corridor", rentPsf: 65, opexPsf: 22, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 7500 },
      { name: "GIFT City SEZ & DTA", rentPsf: 80, opexPsf: 28, capexPsf: 1800, miscPsf: 10, coworkingDeskPrice: 9500 },
      { name: "Prahlad Nagar Corporate Road", rentPsf: 60, opexPsf: 20, capexPsf: 1500, miscPsf: 8, coworkingDeskPrice: 7200 },
      { name: "Sindhu Bhavan Road (SBR)", rentPsf: 75, opexPsf: 24, capexPsf: 1700, miscPsf: 9, coworkingDeskPrice: 8500 },
      { name: "Ashram Road / Central", rentPsf: 50, opexPsf: 18, capexPsf: 1400, miscPsf: 7, coworkingDeskPrice: 6500 }
    ]
  },
  bengaluru: {
    name: "Bengaluru",
    micromarkets: [
      { name: "Outer Ring Road (Bellandur/Sarjapur)", rentPsf: 95, opexPsf: 38, capexPsf: 2200, miscPsf: 12, coworkingDeskPrice: 13500 },
      { name: "Whitefield (ITPB/EPIP)", rentPsf: 65, opexPsf: 30, capexPsf: 1800, miscPsf: 10, coworkingDeskPrice: 9000 },
      { name: "Koramangala", rentPsf: 115, opexPsf: 42, capexPsf: 2400, miscPsf: 14, coworkingDeskPrice: 14500 },
      { name: "Indiranagar", rentPsf: 120, opexPsf: 45, capexPsf: 2400, miscPsf: 14, coworkingDeskPrice: 15000 },
      { name: "Electronic City", rentPsf: 50, opexPsf: 25, capexPsf: 1500, miscPsf: 8, coworkingDeskPrice: 7500 }
    ]
  },
  pune: {
    name: "Pune",
    micromarkets: [
      { name: "Hinjewadi IT Park", rentPsf: 55, opexPsf: 25, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 7500 },
      { name: "Kharadi (EON Free Zone)", rentPsf: 75, opexPsf: 32, capexPsf: 1900, miscPsf: 10, coworkingDeskPrice: 9500 },
      { name: "Baner / Balewadi High Street", rentPsf: 70, opexPsf: 28, capexPsf: 1800, miscPsf: 9, coworkingDeskPrice: 8999 },
      { name: "Viman Nagar / Kalyani Nagar", rentPsf: 80, opexPsf: 35, capexPsf: 2000, miscPsf: 11, coworkingDeskPrice: 10500 }
    ]
  },
  hyderabad: {
    name: "Hyderabad",
    micromarkets: [
      { name: "HITEC City / Madhapur", rentPsf: 75, opexPsf: 30, capexPsf: 1900, miscPsf: 10, coworkingDeskPrice: 9500 },
      { name: "Gachibowli / Financial District", rentPsf: 70, opexPsf: 28, capexPsf: 1800, miscPsf: 9, coworkingDeskPrice: 9000 },
      { name: "Kondapur", rentPsf: 58, opexPsf: 24, capexPsf: 1600, miscPsf: 8, coworkingDeskPrice: 7800 },
      { name: "Banjara Hills / Jubilee Hills", rentPsf: 85, opexPsf: 35, capexPsf: 2100, miscPsf: 12, coworkingDeskPrice: 11000 }
    ]
  }
};

export default function OfficeSpaceCalculator({
  onExploreSpaces,
  onOpenAdvisor
}: {
  onExploreSpaces?: (city: string, micromarket: string) => void;
  onOpenAdvisor?: () => void;
}) {
  // 1. Office Type Switch
  const [officeType, setOfficeType] = useState<"conventional" | "coworking">("conventional");

  // 2. City & Micromarket
  const [selectedCityKey, setSelectedCityKey] = useState("gurgaon");
  const [selectedMarketIndex, setSelectedMarketIndex] = useState(0);

  // 3. Headcount
  const [headcount, setHeadcount] = useState<number>(50);

  // 4. Financial Customization (Pre-filled from benchmark)
  const currentCity = CITY_BENCHMARKS[selectedCityKey] || CITY_BENCHMARKS.gurgaon;
  const currentMarket = currentCity.micromarkets[selectedMarketIndex] || currentCity.micromarkets[0];

  const [customRentPsf, setCustomRentPsf] = useState<number>(currentMarket.rentPsf);
  const [customOpexPsf, setCustomOpexPsf] = useState<number>(currentMarket.opexPsf);
  const [customCapexPsf, setCustomCapexPsf] = useState<number>(currentMarket.capexPsf);
  const [customMiscPsf, setCustomMiscPsf] = useState<number>(currentMarket.miscPsf);
  const [customCoworkingDeskPrice, setCustomCoworkingDeskPrice] = useState<number>(currentMarket.coworkingDeskPrice);

  // Synchronize custom inputs whenever city or micromarket changes
  const handleCityChange = (cityKey: string) => {
    setSelectedCityKey(cityKey);
    setSelectedMarketIndex(0);
    const firstMarket = CITY_BENCHMARKS[cityKey].micromarkets[0];
    setCustomRentPsf(firstMarket.rentPsf);
    setCustomOpexPsf(firstMarket.opexPsf);
    setCustomCapexPsf(firstMarket.capexPsf);
    setCustomMiscPsf(firstMarket.miscPsf);
    setCustomCoworkingDeskPrice(firstMarket.coworkingDeskPrice);
  };

  const handleMarketChange = (index: number) => {
    setSelectedMarketIndex(index);
    const mkt = currentCity.micromarkets[index];
    setCustomRentPsf(mkt.rentPsf);
    setCustomOpexPsf(mkt.opexPsf);
    setCustomCapexPsf(mkt.capexPsf);
    setCustomMiscPsf(mkt.miscPsf);
    setCustomCoworkingDeskPrice(mkt.coworkingDeskPrice);
  };

  // 5. Workstation Layout & Density
  // Linear: 50 sqft/seat | L-Shape: 100 sqft/seat | Cubicle: 150 sqft/seat
  const [workstationType, setWorkstationType] = useState<"linear" | "lshape" | "cubicle">("lshape");
  const workstationAreaMap = { linear: 50, lshape: 100, cubicle: 150 };

  // Manager Cabins
  // Ratio 1:25 default -> Floor(headcount / 25)
  const autoCabinsCount = Math.max(1, Math.floor(headcount / 25));
  const [managerCabinsCount, setManagerCabinsCount] = useState<number>(autoCabinsCount);
  const [cabinType, setCabinType] = useState<"compact" | "standard" | "executive">("standard");
  const cabinAreaMap = { compact: 100, standard: 180, executive: 250 };

  // 6. Meeting Rooms Configuration
  const autoMeetingRooms = Math.max(1, Math.round(headcount / 25));
  const [meetingRooms4to6, setMeetingRooms4to6] = useState<number>(2); // 120 sqft
  const [meetingRooms8to10, setMeetingRooms8to10] = useState<number>(1); // 180 sqft
  const [boardroom12to15, setBoardroom12to15] = useState<number>(0); // 240 sqft
  const [trainingRoom, setTrainingRoom] = useState<number>(0); // 350 sqft

  // 7. Collaborative Spaces
  const [receptionType, setReceptionType] = useState<"none" | "compact" | "large">("large");
  const receptionAreaMap = { none: 0, compact: 150, large: 300 };

  const [hasPantry, setHasPantry] = useState(true);
  const pantryArea = hasPantry ? (headcount > 100 ? 900 : headcount > 40 ? 550 : 250) : 0;

  const [hasBreakRoom, setHasBreakRoom] = useState(true);
  const breakRoomArea = hasBreakRoom ? 270 : 0;

  const [hasReprographic, setHasReprographic] = useState(true);
  const reprographicArea = hasReprographic ? 100 : 0;

  // 8. Lease Terms & Growth
  const [leaseTermYears, setLeaseTermYears] = useState<3 | 5 | 7>(3);
  const [growthExpectation, setGrowthExpectation] = useState<number>(15); // % growth

  // =========================================================================
  // MATHEMATICAL EVALUATION (Exact Qdesq CalQ Formulas)
  // =========================================================================

  // Area Breakdown Calculations
  const calculatedDeskCount = Math.max(1, headcount - managerCabinsCount);
  const totalWorkstationArea = calculatedDeskCount * workstationAreaMap[workstationType];
  const totalCabinsArea = managerCabinsCount * cabinAreaMap[cabinType];
  const totalMeetingRoomsArea =
    (meetingRooms4to6 * 120) +
    (meetingRooms8to10 * 180) +
    (boardroom12to15 * 240) +
    (trainingRoom * 350);
  const totalCollaborativeArea =
    receptionAreaMap[receptionType] +
    pantryArea +
    breakRoomArea +
    reprographicArea;

  const totalAreaRequired =
    totalWorkstationArea +
    totalCabinsArea +
    totalMeetingRoomsArea +
    totalCollaborativeArea;

  // Cost Breakdown Calculations
  const leaseTermMonths = leaseTermYears * 12;

  // 1. Monthly Rent
  const monthlyRent = totalAreaRequired * customRentPsf;

  // 2. Monthly Opex (CAM, AC, Electricity, Housekeeping)
  const monthlyOpex = totalAreaRequired * customOpexPsf;

  // 3. Monthly Misc (Internet, Security, Maintenance)
  const monthlyMisc = totalAreaRequired * customMiscPsf;

  // 4. Amortized Fitout Capex
  const totalFitoutCapex = totalAreaRequired * customCapexPsf;
  const monthlyAmortizedCapex = totalFitoutCapex / leaseTermMonths;

  // Total Conventional Monthly Cost
  const totalConventionalMonthly = Math.round(
    monthlyRent + monthlyOpex + monthlyMisc + monthlyAmortizedCapex
  );

  // Total Coworking Equivalent Monthly Cost
  const totalCoworkingMonthly = Math.round(headcount * customCoworkingDeskPrice);

  // Net Monthly Savings
  const monthlySavings = totalConventionalMonthly - totalCoworkingMonthly;
  const savingsPct = totalConventionalMonthly > 0
    ? Math.round((monthlySavings / totalConventionalMonthly) * 100)
    : 0;

  // Cumulative 3-Year / Lease Term Savings
  const cumulativeSavings = monthlySavings * leaseTermMonths;

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportSummary = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "OfficeX CalQ Workspace & Cost Estimate Summary",
        `Generated Date,${new Date().toLocaleDateString()}`,
        `City,${currentCity.name}`,
        `Micromarket,${currentMarket.name}`,
        `Headcount,${headcount}`,
        `Total Area Required (SqFt),${totalAreaRequired}`,
        `Workstation Footprint (SqFt),${totalWorkstationArea}`,
        `Cabins Area (SqFt),${totalCabinsArea}`,
        `Meeting Rooms Area (SqFt),${totalMeetingRoomsArea}`,
        `Collaborative Area (SqFt),${totalCollaborativeArea}`,
        `Conventional Monthly Rent,₹${monthlyRent.toLocaleString("en-IN")}`,
        `Conventional Monthly Opex,₹${monthlyOpex.toLocaleString("en-IN")}`,
        `Amortized Monthly Capex,₹${Math.round(monthlyAmortizedCapex).toLocaleString("en-IN")}`,
        `Conventional Total Monthly,₹${totalConventionalMonthly.toLocaleString("en-IN")}`,
        `Coworking Equivalent Monthly,₹${totalCoworkingMonthly.toLocaleString("en-IN")}`,
        `Net Monthly Savings,₹${monthlySavings.toLocaleString("en-IN")} (${savingsPct}%)`,
        `Cumulative Term Savings,₹${cumulativeSavings.toLocaleString("en-IN")}`
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OfficeX_CalQ_${currentMarket.name.replace(/\s+/g, "_")}_${headcount}Seats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded official OfficeX CalQ Estimate Report!");
  };

  return (
    <div id="calq" className="w-full max-w-6xl mx-auto py-8 sm:py-12 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-teal-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-xs font-black uppercase tracking-wider mb-2.5">
          <Calculator size={14} />
          <span>OfficeX CalQ · Workspace &amp; Rent Estimator</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Calculate Your Office Space Footprint &amp; Monthly Rent
        </h2>
        <p className="text-xs sm:text-base text-slate-500 mt-2 font-medium">
          Estimate exact square footage based on your team size, configure layouts &amp; meeting rooms, and compare <span className="font-bold text-slate-800">Conventional Office Leasing</span> against <span className="font-bold text-teal-700">Coworking Desks</span>.
        </p>

        {/* Office Type Switch (Conventional vs Coworking) */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-6 shadow-2xs">
          <button
            type="button"
            onClick={() => setOfficeType("conventional")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              officeType === "conventional"
                ? "bg-white text-[#0F8B7D] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 size={16} />
            <span>Conventional Office Space</span>
          </button>
          <button
            type="button"
            onClick={() => setOfficeType("coworking")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
              officeType === "coworking"
                ? "bg-white text-[#0F8B7D] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase size={16} />
            <span>Coworking / Managed Space</span>
          </button>
        </div>
      </div>

      {/* Main Calculator Grid (Left: Configurator / Right: Live Evaluation Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 5-STEP CONFIGURATOR */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: City, Micromarket & Team Size */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center text-xs font-black">1</span>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Location &amp; Team Size</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* City Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  PRIMARY CITY
                </label>
                <select
                  value={selectedCityKey}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  {Object.entries(CITY_BENCHMARKS).map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
                </select>
              </div>

              {/* Micromarket Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  COMMERCIAL SUB-MARKET
                </label>
                <select
                  value={selectedMarketIndex}
                  onChange={(e) => handleMarketChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0F8B7D]"
                >
                  {currentCity.micromarkets.map((mkt, idx) => (
                    <option key={idx} value={idx}>{mkt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Headcount Input & Stepper Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL TEAM STRENGTH (HEADCOUNT)
                </label>
                <span className="text-base font-black text-[#0F8B7D]">{headcount} Seats</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHeadcount(Math.max(5, headcount - 5))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 cursor-pointer shrink-0"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full accent-[#0F8B7D] cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setHeadcount(Math.min(500, headcount + 5))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>5 Seats (Startup)</span>
                <span>50 Seats (Growth)</span>
                <span>200 Seats (Mid-Market)</span>
                <span>500+ Seats (Enterprise)</span>
              </div>
            </div>
          </div>

          {/* STEP 2: Financial Benchmarks (Pre-filled by Micromarket, 100% Editable) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center text-xs font-black">2</span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Financial Rates for {currentMarket.name}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F8B7D] border border-teal-100">
                Live Micromarket Index
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  BASE RENT (₹/SF)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={customRentPsf}
                    onChange={(e) => setCustomRentPsf(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  OPEX / CAM (₹/SF)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={customOpexPsf}
                    onChange={(e) => setCustomOpexPsf(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  FITOUT CAPEX (₹/SF)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={customCapexPsf}
                    onChange={(e) => setCustomCapexPsf(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  COWORKING / SEAT
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={customCoworkingDeskPrice}
                    onChange={(e) => setCustomCoworkingDeskPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-bold text-teal-700 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Rates are auto-calibrated from Grade-A commercial market transactions. You can customize any number above to match your specific quotation.
            </p>
          </div>

          {/* STEP 3: Workstation Density & Layout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center text-xs font-black">3</span>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Workstation Density &amp; Cabins</h3>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                DESK STYLE &amp; DENSITY ALLOCATION
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "linear" as const, label: "Linear Desk", sf: "50 Sq.Ft.", desc: "Compact density for agile tech & call center teams" },
                  { id: "lshape" as const, label: "L-Shape Desk", sf: "100 Sq.Ft.", desc: "Standard ergonomic desk with side pedestal (Recommended)" },
                  { id: "cubicle" as const, label: "Private Cubicle", sf: "150 Sq.Ft.", desc: "Spacious partitioned acoustic workstation" }
                ].map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setWorkstationType(ws.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      workstationType === ws.id
                        ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D] ring-1 ring-[#0F8B7D]"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span className="font-black text-xs block">{ws.label}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-900 block mt-0.5">{ws.sf}</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">{ws.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manager Cabins */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  EXECUTIVE &amp; MANAGER CABINS
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {managerCabinsCount} Cabin{managerCabinsCount > 1 ? "s" : ""} (1:{Math.round(headcount / managerCabinsCount) || 25} Ratio)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "compact" as const, label: "Compact Cabin", sf: "100 Sq.Ft." },
                  { id: "standard" as const, label: "Standard Cabin", sf: "180 Sq.Ft." },
                  { id: "executive" as const, label: "Executive Suite", sf: "250 Sq.Ft." }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCabinType(c.id)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      cabinType === c.id
                        ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D] font-black"
                        : "border-slate-200 text-slate-600 bg-white font-bold"
                    }`}
                  >
                    <span className="text-xs block">{c.label}</span>
                    <span className="text-[10px] text-slate-400">{c.sf}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 4: Meeting Rooms & Collaborative Spaces */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-teal-50 text-[#0F8B7D] flex items-center justify-center text-xs font-black">4</span>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Meeting Rooms &amp; Common Amenities</h3>
            </div>

            {/* Meeting Rooms Steppers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">4–6 SEATER (120 SF)</span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingRooms4to6(Math.max(0, meetingRooms4to6 - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-4">{meetingRooms4to6}</span>
                  <button
                    type="button"
                    onClick={() => setMeetingRooms4to6(meetingRooms4to6 + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">8–10 SEATER (180 SF)</span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingRooms8to10(Math.max(0, meetingRooms8to10 - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-4">{meetingRooms8to10}</span>
                  <button
                    type="button"
                    onClick={() => setMeetingRooms8to10(meetingRooms8to10 + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">BOARDROOM (240 SF)</span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoardroom12to15(Math.max(0, boardroom12to15 - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-4">{boardroom12to15}</span>
                  <button
                    type="button"
                    onClick={() => setBoardroom12to15(boardroom12to15 + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">TRAINING (350 SF)</span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTrainingRoom(Math.max(0, trainingRoom - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm w-4">{trainingRoom}</span>
                  <button
                    type="button"
                    onClick={() => setTrainingRoom(trainingRoom + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Collaborative Spaces Toggles */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setReceptionType(receptionType === "large" ? "compact" : receptionType === "compact" ? "none" : "large")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  receptionType !== "none" ? "bg-teal-50 border-teal-300 text-[#0F8B7D] font-bold" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="block text-[11px]">Reception Area</span>
                <span className="font-black text-xs">{receptionAreaMap[receptionType]} Sq.Ft.</span>
              </button>

              <button
                type="button"
                onClick={() => setHasPantry(!hasPantry)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  hasPantry ? "bg-teal-50 border-teal-300 text-[#0F8B7D] font-bold" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="block text-[11px]">Pantry / Cafe</span>
                <span className="font-black text-xs">{pantryArea} Sq.Ft.</span>
              </button>

              <button
                type="button"
                onClick={() => setHasBreakRoom(!hasBreakRoom)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  hasBreakRoom ? "bg-teal-50 border-teal-300 text-[#0F8B7D] font-bold" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="block text-[11px]">Break &amp; Games</span>
                <span className="font-black text-xs">{breakRoomArea} Sq.Ft.</span>
              </button>

              <button
                type="button"
                onClick={() => setHasReprographic(!hasReprographic)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  hasReprographic ? "bg-teal-50 border-teal-300 text-[#0F8B7D] font-bold" : "border-slate-200 text-slate-500"
                }`}
              >
                <span className="block text-[11px]">Print / Repro</span>
                <span className="font-black text-xs">{reprographicArea} Sq.Ft.</span>
              </button>
            </div>
          </div>

          {/* STEP 5: Lease Terms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LEASE AMORTIZATION TERM
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Capex fitout cost is amortized over this period</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {[3, 5, 7].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLeaseTermYears(term as 3 | 5 | 7)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    leaseTermYears === term
                      ? "bg-white text-[#0F8B7D] shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {term} Years ({term * 12} Mos)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE COST & AREA EVALUATION CARD (Sticky) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-6">
            {/* Header / Savings Banner */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                  ESTIMATED FOOTPRINT &amp; FINANCIALS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save {savingsPct}% with Coworking
                </span>
              </div>

              {/* Total Area Display */}
              <div className="mt-3 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TOTAL ESTIMATED FOOTPRINT
                  </span>
                  <p className="text-3xl font-black text-white mt-0.5">
                    {totalAreaRequired.toLocaleString("en-IN")}{" "}
                    <span className="text-sm font-semibold text-slate-300">Sq.Ft.</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">AREA / SEAT</span>
                  <span className="text-base font-black text-teal-300">
                    {Math.round(totalAreaRequired / headcount)} Sq.Ft.
                  </span>
                </div>
              </div>

              {/* Space Allocation Progress Stack */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>Workstations ({Math.round((totalWorkstationArea / totalAreaRequired) * 100)}%)</span>
                  <span>Cabins ({Math.round((totalCabinsArea / totalAreaRequired) * 100)}%)</span>
                  <span>Meeting ({Math.round((totalMeetingRoomsArea / totalAreaRequired) * 100)}%)</span>
                  <span>Amenities ({Math.round((totalCollaborativeArea / totalAreaRequired) * 100)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/10 flex">
                  <div className="bg-teal-400" style={{ width: `${(totalWorkstationArea / totalAreaRequired) * 100}%` }} />
                  <div className="bg-cyan-400" style={{ width: `${(totalCabinsArea / totalAreaRequired) * 100}%` }} />
                  <div className="bg-amber-400" style={{ width: `${(totalMeetingRoomsArea / totalAreaRequired) * 100}%` }} />
                  <div className="bg-emerald-400" style={{ width: `${(totalCollaborativeArea / totalAreaRequired) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Financial Comparison Box */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              {/* Conventional Office Cost */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      CONVENTIONAL LEASING (MONTHLY)
                    </span>
                    <p className="text-xl font-black text-white mt-0.5">
                      ₹{totalConventionalMonthly.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-slate-400">/ mo</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-1 rounded-lg">
                    ₹{Math.round(totalConventionalMonthly / headcount).toLocaleString("en-IN")} / seat
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>Base Rent: <b className="text-slate-200">₹{monthlyRent.toLocaleString("en-IN")}</b></div>
                  <div>CAM &amp; Opex: <b className="text-slate-200">₹{monthlyOpex.toLocaleString("en-IN")}</b></div>
                  <div>Amortized Fitout: <b className="text-slate-200">₹{Math.round(monthlyAmortizedCapex).toLocaleString("en-IN")}</b></div>
                  <div>Utilities &amp; Misc: <b className="text-slate-200">₹{monthlyMisc.toLocaleString("en-IN")}</b></div>
                </div>
              </div>

              {/* Coworking / Managed Office Equivalent Cost */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-300 uppercase block">
                      COWORKING / MANAGED DESKS (MONTHLY)
                    </span>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">
                      ₹{totalCoworkingMonthly.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-teal-200">/ mo</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-1 rounded-lg border border-teal-500/30">
                    ₹{customCoworkingDeskPrice.toLocaleString("en-IN")} / seat
                  </span>
                </div>

                <p className="text-[10px] text-teal-200/80 mt-2 leading-tight">
                  ✓ 100% Inclusive: Zero Fitout Capex, Zero CAM/Electricity bills, High-speed Wi-Fi, Meeting room credits, and Free Tea/Coffee.
                </p>
              </div>

              {/* Net Monthly Savings Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-center">
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">
                  NET MONTHLY SAVINGS WITH COWORKING
                </span>
                <p className="text-2xl font-black text-white mt-0.5">
                  ₹{monthlySavings.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-bold text-emerald-300">({savingsPct}% Lower)</span>
                </p>
                <p className="text-[10px] text-slate-300 mt-1">
                  Cumulative {leaseTermYears}-Year Savings:{" "}
                  <b className="text-emerald-300">₹{(cumulativeSavings / 100000).toFixed(2)} Lakhs</b>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onExploreSpaces) {
                    onExploreSpaces(currentCity.name, currentMarket.name);
                  } else {
                    showToast(`Filtering workspaces for ${headcount} seats in ${currentMarket.name}...`);
                  }
                }}
                className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Find Spaces in {currentMarket.name}</span>
                <ArrowRight size={16} />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportSummary}
                  className="py-2.5 px-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download size={13} />
                  <span>Download Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAdvisor) {
                      onOpenAdvisor();
                    } else {
                      showToast("Connecting with an OfficeX Space Advisor...");
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Phone size={13} />
                  <span>Talk to Advisor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
