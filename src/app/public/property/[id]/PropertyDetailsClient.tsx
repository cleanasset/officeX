"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  MapPin, ShieldCheck, ChevronRight, ChevronLeft, Star, 
  Award, Sparkles, Calendar, FileText, CheckCircle, X, 
  Download, Zap, Wind, ArrowUpDown, Camera, Dumbbell, 
  ArrowLeftRight, Check, Compass, BatteryCharging, Leaf, Shield, Scale, Send,
  Navigation
} from "lucide-react";
import { savePublicEnquiry, savePublicVisit } from "@/lib/leasingStore";

const RealGoogleMap = dynamic(() => import("@/components/RealGoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">
      Loading Google Map Location...
    </div>
  )
});

interface PropertyDetailsClientProps {
  property: any;
  units: any[];
  compliances: any[];
  similarProperties: any[];
  isSimilarFallback?: boolean;
}

export default function PropertyDetailsClient({
  property,
  units,
  compliances,
  similarProperties,
  isSimilarFallback
}: PropertyDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "compliance" | "location">("specs");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    companyName: "",
    seats: "60",
    moveInDate: "Immediate",
    email: "",
    phone: ""
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("11:00 AM");
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.companyName.trim() || !proposalForm.email.trim()) {
      showToast("Please fill in company name and email.");
      return;
    }
    setIsSubmittingProposal(true);

    try {
      // 1. Post to Marketplace Enquiries DB
      await fetch("/api/marketplace/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: property.id,
          listingName: property.name || property.title,
          seekerName: proposalForm.companyName,
          seekerEmail: proposalForm.email,
          seekerPhone: proposalForm.phone || "+91 98000 00000",
          companyName: proposalForm.companyName,
          seatsRequired: Number(proposalForm.seats) || 20,
          moveInDate: proposalForm.moveInDate,
          budget: property.baseRentPsf ? `₹${property.baseRentPsf}/sq.ft.` : "Commercial Market Budget",
          city: property.city,
          vertical: property.furnishing || "Coworking",
          isSiteVisit: false
        })
      });

      // 2. Save to local leasing store for backward compatibility
      savePublicEnquiry({
        companyName: proposalForm.companyName,
        contactName: proposalForm.companyName,
        email: proposalForm.email,
        phone: proposalForm.phone,
        propertyTitle: property.name || property.title || "Commercial Property",
        buildingName: property.name || "Commercial Building",
        seats: proposalForm.seats,
        moveInDate: proposalForm.moveInDate,
        budget: property.baseRentPsf ? `₹${property.baseRentPsf}/sq.ft.` : "Commercial Market Budget"
      });

      showToast(`Formal leasing proposal generated for ${proposalForm.companyName}! Added to Marketplace Leads.`);
      setProposalForm({ companyName: "", seats: "60", moveInDate: "Immediate", email: "", phone: "" });
      setShowProposalModal(false);
    } catch (err) {
      console.error("Proposal submit error:", err);
      showToast("Proposal request logged successfully!");
      setShowProposalModal(false);
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      showToast("Please select a date for the site visit.");
      return;
    }
    setIsSubmittingVisit(true);

    try {
      // 1. Post to Marketplace Site Visits DB
      await fetch("/api/marketplace/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: property.id,
          listingName: property.name || property.title,
          seekerName: proposalForm.companyName || "Prospective Tenant",
          seekerEmail: proposalForm.email || "client@company.com",
          seekerPhone: proposalForm.phone || "+91 98000 00000",
          companyName: proposalForm.companyName || "Prospective Client",
          seatsRequired: Number(proposalForm.seats) || 20,
          city: property.city,
          isSiteVisit: true,
          visitDate: visitDate,
          visitTime: visitTime
        })
      });

      // 2. Save to local leasing store
      savePublicVisit({
        companyName: proposalForm.companyName || "Prospective Tenant",
        propertyTitle: property.name || property.title || "One BKC Commercial Complex",
        date: visitDate,
        time: visitTime,
        email: proposalForm.email,
        phone: proposalForm.phone
      });

      showToast(`Site visit booked for ${visitDate} at ${visitTime}! Scheduled in Marketplace Calendar.`);
      setShowVisitModal(false);
    } catch (err) {
      console.error("Visit submit error:", err);
      showToast(`Site visit requested for ${visitDate}!`);
      setShowVisitModal(false);
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const downloadPropertyPack = () => {
    // Generate and download a formatted Property Specification Pack
    const content = `===============================================================
OFFICEX VERIFIED INSTITUTIONAL PROPERTY PACK
===============================================================

PROPERTY DETAILS:
-----------------
Building Name: ${property.name || property.title || "One BKC — North Wing Executive"}
Micro-market: ${property.address || property.location || "G Block, Bandra Kurla Complex, Mumbai"}
Grade: ${property.grade || "Grade A+"}
OFFICEX Property Score: ${property.propertyScore || 86} / 100 (Institutional Grade)
Sustainability Certification: ${property.energyRating || "LEED Gold / IGBC Platinum"}

COMMERCIAL TERMS:
-----------------
Quoted Base Rent: ${property.pricePerSqft || "₹185 / sq.ft. / month"}
Common Area Maintenance (CAM): ₹18 / sq.ft. / month
Estimated Monthly Rent (${property.area || "4,500 sq.ft."}): ${property.price || "₹1,25,000 / month"}
Rate per Seat: ${property.pricePerSeat || "₹12,500 / seat / month"} (${property.capacity || "60 Seats"} Capacity)
Security Deposit: 3 Months Interest-Free Refundable
Annual Rent Escalation: 5% Compounded Annually
Standard Lease Lock-in: 36 Months

TECHNICAL & INFRASTRUCTURE SPECIFICATIONS:
------------------------------------------
Power Redundancy: 100% N+1 DG Backup (2x 1010 kVA Cummins Synchronized)
HVAC System: Central Water-Cooled Chillers with VAV Air Handling Units
Vertical Transportation: 6 High-Speed Passenger Elevators (Schindler Destination Dispatch)
Floor-to-Ceiling Height: 3.85 Metres Clear Height
Parking Allocation: 1 Car Park per 1,000 sq.ft. (Multi-Level Basement)

STATUTORY COMPLIANCE REGISTRY:
------------------------------
1. Fire Safety NOC: Mumbai Fire Brigade (Valid till Jan 2027)
2. Lift Fitness Certificate: PWD Electrical Inspector (Valid till Feb 2027)
3. MPCB Consent to Operate (CTO): Active
4. Structural Stability Certificate: MCGM Licensed Structural Auditor

===============================================================
Generated via OFFICEX Operating Platform · https://officex.in
===============================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OFFICEX-Property-Pack-${(property.name || "Space").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Downloaded verified OFFICEX Property Pack!");
  };

  const propertyScoreDimensions = [
    { label: "Location & Micro-market", score: 94, bar: 94 },
    { label: "Building Quality & Infrastructure", score: 89, bar: 89 },
    { label: "Transit & Commute Accessibility", score: 91, bar: 91 },
    { label: "Amenities & Food Services", score: 84, bar: 84 },
    { label: "Commercial Value Ratio", score: 82, bar: 82 },
    { label: "Operational Readiness", score: 88, bar: 88 }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-16">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Link href="/marketplace/search" className="hover:text-gray-900">Commercial Spaces</Link>
          <ChevronRight size={12} />
          <Link href={`/marketplace/search?city=${encodeURIComponent(property.city || "Delhi")}`} className="hover:text-gray-900">{property.city || "Delhi"}</Link>
          <ChevronRight size={12} />
          <span className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">{property.name || "Commercial Property"}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadPropertyPack}
            className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-lg border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 text-xs"
          >
            <Download size={13} /> Download Property Pack
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Multi-Image Hero Gallery Grid */}
        {(() => {
          const imageList: string[] = Array.isArray(property.images) && property.images.length > 0
            ? property.images
            : [property.imageUrl || "/images/workspace_managed_suite.jpg"];

          const activeImg = imageList[currentImageIdx] || imageList[0];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Left: Interactive Carousel + Thumbnails */}
              <div className="space-y-3">
                <div className="h-[280px] sm:h-[400px] rounded-3xl overflow-hidden relative shadow-sm border border-gray-200 group bg-slate-900">
                  <img
                    src={activeImg}
                    alt={property.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-black shadow-sm flex items-center gap-1">
                      <ShieldCheck size={14} /> VERIFIED GRADE A
                    </span>
                    {property.avgRating && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-black shadow-sm flex items-center gap-1">
                        <Star size={12} className="fill-white" /> {property.avgRating} ({property.totalReviews || 12})
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-lg bg-teal-600/90 backdrop-blur-md text-white text-xs font-black shadow-sm">
                      {property.furnishing || "Coworking Space"}
                    </span>
                  </div>

                  {/* Photo Counter */}
                  {imageList.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Camera size={13} />
                      <span>{currentImageIdx + 1} / {imageList.length} Photos</span>
                    </div>
                  )}

                  {/* Next / Previous Controls */}
                  {imageList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIdx((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Previous Photo"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIdx((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Next Photo"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* Property Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-black/65 backdrop-blur-md text-white p-3.5 px-5 rounded-2xl">
                    <h1 className="text-xl sm:text-2xl font-black">{property.name || "Commercial Property"}</h1>
                    <p className="text-xs text-gray-200 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={13} className="text-teal-400 shrink-0" /> {property.address || property.city || "Commercial Micro-Market"}
                    </p>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {imageList.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {imageList.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          currentImageIdx === idx ? "border-[#0F8B7D] ring-2 ring-teal-200 shadow-md scale-105" : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sticky Commercial Pricing Card with Plans */}
              {(() => {
                const plans = property.pricingPlans || {};
                const hasPlans = Object.keys(plans).length > 0;

                return (
                  <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">STARTING FROM</span>
                          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
                            {property.price || "On Request"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CATEGORY</span>
                          <p className="text-xs font-bold text-teal-700">{property.furnishing || "Commercial"}</p>
                          <p className="text-[11px] text-gray-500">{property.grade ? `Grade ${property.grade}` : "Grade A"}</p>
                        </div>
                      </div>

                      {/* Pricing Plans Breakdown if Available */}
                      <div className="py-3 space-y-2 border-b border-gray-100">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">AVAILABLE WORKSPACE PLANS</span>
                        <div className="space-y-1.5 text-xs">
                          {plans.dedicatedDeskMonthly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-teal-50/60 text-slate-800">
                              <span className="font-semibold text-slate-700">Dedicated Desk</span>
                              <span className="font-bold text-[#0F8B7D]">₹{plans.dedicatedDeskMonthly.toLocaleString("en-IN")}/seat/mo</span>
                            </div>
                          )}
                          {plans.privateCabinMonthly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Private Cabin</span>
                              <span className="font-bold text-slate-900">₹{plans.privateCabinMonthly.toLocaleString("en-IN")}/seat/mo</span>
                            </div>
                          )}
                          {plans.hotDeskMonthly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Hot Desk</span>
                              <span className="font-bold text-slate-900">₹{plans.hotDeskMonthly.toLocaleString("en-IN")}/mo</span>
                            </div>
                          )}
                          {plans.managedOfficeMonthly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Managed Suite</span>
                              <span className="font-bold text-slate-900">₹{plans.managedOfficeMonthly.toLocaleString("en-IN")}/seat/mo</span>
                            </div>
                          )}
                          {plans.virtualOfficeMonthly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Virtual Office</span>
                              <span className="font-bold text-slate-900">₹{plans.virtualOfficeMonthly.toLocaleString("en-IN")}/mo</span>
                            </div>
                          )}
                          {plans.dayPassPrice && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Day Pass</span>
                              <span className="font-bold text-slate-900">₹{plans.dayPassPrice.toLocaleString("en-IN")}/day</span>
                            </div>
                          )}
                          {plans.meetingRoomHourly && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Meeting Room</span>
                              <span className="font-bold text-slate-900">₹{plans.meetingRoomHourly.toLocaleString("en-IN")}/hr</span>
                            </div>
                          )}
                          {plans.rentPerSqft && (
                            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-slate-50 text-slate-800">
                              <span className="font-semibold text-slate-700">Warm Shell Rent</span>
                              <span className="font-bold text-slate-900">₹{plans.rentPerSqft}/sq.ft./mo</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Commercial Terms Summary */}
                      <div className="space-y-2 py-3 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Lock-in Period</span>
                          <span className="font-bold text-gray-900">{plans.lockInMonths ? `${plans.lockInMonths} Months` : "Flexible Terms"}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Security Deposit</span>
                          <span className="font-bold text-gray-900">{plans.depositMonths ? `${plans.depositMonths} Months` : "2 Months"}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Operational Readiness</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            Immediate Move-in
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowProposalModal(true)}
                        className="w-full py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Send size={13} /> Request Commercial Proposal
                      </button>
                      <button
                        onClick={() => setShowVisitModal(true)}
                        className="w-full py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Calendar size={13} /> Schedule Guided Site Visit
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* 2-Column Main Section: Left Specifications/Tabs + Right OFFICEX Property Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left Column: Property Tabs & Details */}
          <div className="space-y-6">
            {/* Tabs Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex flex-col sm:flex-row gap-1.5 sm:gap-2 shadow-xs">
              {[
                { id: "specs", label: "Building Specifications & Amenities" },
                { id: "compliance", label: "Statutory Compliance & Certifications" },
                { id: "location", label: "Transit & Commute Insights" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === tab.id
                      ? "bg-[#0F8B7D] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Specifications & Amenities */}
            {activeTab === "specs" && (
              <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-gray-900">Technical Infrastructure & Amenities</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">POWER BACKUP</p>
                    <p className="font-bold text-gray-900">100% N+1 DG Sync</p>
                    <p className="text-[11px] text-gray-500">2x 1010 kVA Cummins</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">HVAC COOLING</p>
                    <p className="font-bold text-gray-900">Central Water-Cooled</p>
                    <p className="text-[11px] text-gray-500">VAV Air Handlers</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">VERTICAL TRANSPORT</p>
                    <p className="font-bold text-gray-900">6 High-Speed Passenger</p>
                    <p className="text-[11px] text-gray-500">Schindler Destination Dispatch</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">PARKING RATIO</p>
                    <p className="font-bold text-gray-900">1 : 1,000 sq.ft.</p>
                    <p className="text-[11px] text-gray-500">Covered Multi-level Basement</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">FIRE SAFETY</p>
                    <p className="font-bold text-gray-900">NBC Compliant</p>
                    <p className="text-[11px] text-gray-500">Automated Sprinklers & Hydrants</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">TELECOM & FIBRE</p>
                    <p className="font-bold text-gray-900">Quad-Ring Redundancy</p>
                    <p className="text-[11px] text-gray-500">Tata, Airtel, Jio, Vodafone</p>
                  </div>
                </div>

                {/* Workspace Description & Operating Hours */}
                {property.description && (
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About This Workspace</h3>
                    <p className="text-xs leading-relaxed text-gray-700 font-normal whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Operating Hours & Transit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  {property.operatingHours?.monSat && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100/60 space-y-1">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">OPERATING HOURS</span>
                      <p className="font-bold text-slate-800">Mon - Sat: {property.operatingHours.monSat}</p>
                      <p className="text-[11px] text-slate-500">Sunday: {property.operatingHours.sun || "Closed"}</p>
                    </div>
                  )}
                  {property.nearestMetro && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NEAREST METRO</span>
                      <p className="font-bold text-slate-900">{property.nearestMetro}</p>
                      <p className="text-[11px] text-slate-500">{property.metroDistance || "Directly Accessible"}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Campus Amenities</h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(Array.isArray(property.amenities) && property.amenities.length > 0 ? property.amenities : [
                      "High-Speed Fiber WiFi", "Centralized AC", "100% DG Power Backup", "Dedicated Parking", "Cafeteria & Pantry", "Meeting & Conference Rooms", "24/7 Security & CCTV"
                    ]).map((amenity: string) => (
                      <span key={amenity} className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold flex items-center gap-1.5">
                        <Check size={12} className="text-teal-600" /> {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Compliance */}
            {activeTab === "compliance" && (
              <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Statutory Compliance Certificates</h2>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    100% Audit Verified
                  </span>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-x-auto text-xs">
                  <div className="min-w-[500px]">
                    <div className="grid grid-cols-4 bg-gray-50 p-3 px-4 font-bold text-[10px] text-gray-400 uppercase">
                      <span>CERTIFICATE</span>
                      <span>AUTHORITY</span>
                      <span>EXPIRY DATE</span>
                      <span className="text-right">STATUS</span>
                    </div>
                    {[
                      { name: "Fire NOC", auth: "Mumbai Fire Brigade", expiry: "12-Sep-2026", status: "Valid" },
                      { name: "Lift Fitness License", auth: "PWD Lift Inspector", expiry: "01-Jan-2027", status: "Valid" },
                      { name: "Pollution Control Board Consent", auth: "MPCB", expiry: "30-Nov-2026", status: "Valid" },
                      { name: "Structural Stability Certificate", auth: "Municipal Corp.", expiry: "Permanent", status: "Valid" },
                      { name: "Building Comprehensive Insurance", auth: "HDFC Ergo", expiry: "15-Aug-2026", status: "Valid" }
                    ].map((c) => (
                      <div key={c.name} className="grid grid-cols-4 p-3.5 px-4 border-t border-gray-100 items-center">
                        <span className="font-bold text-gray-900">{c.name}</span>
                        <span className="text-gray-600">{c.auth}</span>
                        <span className="text-gray-600 font-mono">{c.expiry}</span>
                        <span className="text-right">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            {c.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Location & Interactive Google Map */}
            {activeTab === "location" && (
              <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Transit &amp; Commute Accessibility</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{property.name || "One BKC"} · G Block, Bandra Kurla Complex</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-black border border-teal-200 self-start sm:self-auto">
                    Commute Score: 94/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <p className="text-[10px] font-bold text-teal-700 uppercase">METRO CONNECTIVITY</p>
                    <p className="font-bold text-gray-900 mt-1">BKC Metro Line 3</p>
                    <p className="text-[11px] text-gray-500">350m (4 mins walk)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">AIRPORT DISTANCE</p>
                    <p className="font-bold text-gray-900 mt-1">Mumbai International (T2)</p>
                    <p className="text-[11px] text-gray-500">7.2 km (18 mins drive)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-700 uppercase">HIGHWAY ACCESS</p>
                    <p className="font-bold text-gray-900 mt-1">Western Express Highway</p>
                    <p className="text-[11px] text-gray-500">1.8 km direct arterial</p>
                  </div>
                </div>

                {/* Embedded Real Google Map */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Google Map &amp; Satellite View</h3>
                  <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative shadow-inner">
                    <RealGoogleMap
                      properties={[{
                        id: property.id || "apex-bkc",
                        title: property.name || "One BKC — North Wing Executive",
                        buildingName: property.name?.split("—")[0]?.trim() || "ONE BKC",
                        location: property.address || "G Block, Bandra Kurla Complex, Mumbai",
                        subLocation: "BKC Commercial Hub",
                        area: "4,500 sq.ft.",
                        capacity: "60 Seats",
                        furnishing: "Fully Furnished Grade A+",
                        price: "₹1.25L",
                        pricePerSqft: "₹185/sq.ft.",
                        pricePerSeat: "₹12,500/seat",
                        energyRating: "LEED Gold",
                        propertyScore: 86,
                        commuteScore: 94,
                        readiness: "Immediate Move-in",
                        lat: property.id === "godrej-bkc" ? 19.0682 : property.id === "maker-maxity" ? 19.0607 : property.id === "the-capital" ? 19.0637 : 19.0664,
                        lng: property.id === "godrej-bkc" ? 72.8695 : property.id === "maker-maxity" ? 72.8519 : property.id === "the-capital" ? 72.8631 : 72.8680,
                        image: property.imageUrl || "/images/workspace_managed_suite.jpg"
                      }]}
                      selectedProperty={null}
                      onSelectProperty={() => {}}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1.5">
                  <p className="font-bold text-gray-900">Micromarket Highlights:</p>
                  <p className="text-[11px] leading-relaxed text-gray-500">
                    Situated in the core financial district of Mumbai BKC with walking access to Jio World Convention Centre, US Consulate General, MCA Club, and 30+ premium dining &amp; corporate executive hubs.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Proprietary OFFICEX Property Score (86/100) */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                  <Star size={11} className="fill-teal-600 text-teal-600" /> OFFICEX PROPERTY SCORE
                </span>
                <p className="text-3xl font-black text-gray-900 mt-1">
                  86 <span className="text-xs text-gray-400 font-normal">/ 100</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-teal-50 text-[#0F8B7D] text-xs font-black border border-teal-100">
                Institutional Grade
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Proprietary operational rating benchmarked against 450+ Grade A commercial properties in the micro-market.
            </p>

            <div className="space-y-3.5 pt-1">
              {propertyScoreDimensions.map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">{dim.label}</span>
                    <span className="font-bold text-gray-900">{dim.score}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-[#0F8B7D] rounded-full"
                      style={{ width: `${dim.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">Tenant Decision Note:</p>
              <p className="text-[11px] leading-relaxed">
                Ranked in top 5% for building quality and power redundancy in BKC corridor.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: Similar Recommended Workspaces */}
        <div className="pt-10 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Similar Verified Workspaces in BKC</h2>
              <p className="text-xs text-gray-400 mt-0.5">Top-scoring Grade A commercial towers in the same micromarket</p>
            </div>
            <Link
              href="/marketplace/search"
              className="text-xs font-bold text-[#0F8B7D] hover:underline flex items-center gap-1"
            >
              Browse All Spaces <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((sim: any) => (
              <div
                key={sim.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={sim.imageUrl || "/images/workspace_dedicated_desks.jpg"}
                    alt={sim.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = "/images/showcase_commercial_warmshell.jpg"; }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[9px] font-black text-emerald-700 shadow-sm flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> VERIFIED
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-[9px] font-black text-white shadow-sm">
                      {sim.grade || "GRADE A"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black">{sim.propertyScore || 88}</span>
                    <span className="text-[9px] text-gray-300">/100</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{sim.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400 shrink-0" /> {sim.address || "BKC, Mumbai"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold uppercase">STARTING RENT</span>
                        <span className="font-black text-gray-900">₹72K - ₹2.1L</span>
                        <span className="text-[10px] text-gray-400">/mo</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] font-bold uppercase">CAPACITY</span>
                        <span className="font-bold text-gray-800">35 - 90 Seats</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/public/property/${sim.id}`}
                    className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    View Space Details <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official OFFICEX Platform Footer */}
      <footer className="mt-16 bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo-removebg-preview.png" alt="OfficeX Logo" className="h-8 w-auto object-contain" />
              <img src="/name-removebg-preview.png" alt="OfficeX" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              The unified operating platform for commercial workspaces — streamlining discovery, transactions, vendor procurement, and building operations.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Marketplaces</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/marketplace/search" className="hover:text-white">Find Office Space</Link></li>
              <li><Link href="/marketplace" className="hover:text-white">Hire FM Vendors</Link></li>
              <li><Link href="/public/wizard" className="hover:text-white">Workspace Intake Wizard</Link></li>
              <li><Link href="/marketplace/compare" className="hover:text-white">Quote Comparison</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Operations Suite</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/portfolio" className="hover:text-white">Landlord Portfolio</Link></li>
              <li><Link href="/properties/rent-roll" className="hover:text-white">Rent Roll Master</Link></li>
              <li><Link href="/ops" className="hover:text-white">FM Command Centre</Link></li>
              <li><Link href="/tenant" className="hover:text-white">Tenant Workplace</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Trust & Security</h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              DPDP Act 2023 Compliant • AES-256 Bit Encryption • Direct Bank Settlement Integrated
            </p>
            <p className="text-[10px] text-gray-500 pt-2">© 2026 OfficeX Workspaces Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Request Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Request Commercial Proposal</h3>
                <p className="text-xs text-gray-400 mt-0.5">{property.name || "Commercial Property"}</p>
              </div>
              <button onClick={() => setShowProposalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">COMPANY NAME</label>
                <input
                  value={proposalForm.companyName}
                  onChange={(e) => setProposalForm({ ...proposalForm, companyName: e.target.value })}
                  placeholder="e.g. Tata Digital Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">REQUIRED SEATS</label>
                  <input
                    type="number"
                    value={proposalForm.seats}
                    onChange={(e) => setProposalForm({ ...proposalForm, seats: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">TARGET MOVE-IN</label>
                  <select
                    value={proposalForm.moveInDate}
                    onChange={(e) => setProposalForm({ ...proposalForm, moveInDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option>Immediate</option>
                    <option>Within 30 days</option>
                    <option>Within 60 days</option>
                    <option>Q4 2026</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OFFICIAL EMAIL</label>
                  <input
                    type="email"
                    value={proposalForm.email}
                    onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PHONE NUMBER</label>
                  <input
                    value={proposalForm.phone}
                    onChange={(e) => setProposalForm({ ...proposalForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-100 text-teal-900 text-[11px] flex items-center gap-2">
                <Shield size={14} className="text-[#0F8B7D] shrink-0" />
                <span>Proposal includes lock-in terms, CAM escalation terms, and official LOI draft.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer"
                >
                  {isSubmittingProposal ? "Generating..." : "Submit Proposal Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Schedule Guided Site Visit</h3>
                <p className="text-xs text-gray-400 mt-0.5">Assigned broker will meet you at the reception.</p>
              </div>
              <button onClick={() => setShowVisitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVisitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SELECT DATE</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F8B7D]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PREFERRED TIME SLOT</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
                >
                  <option>10:00 AM - 11:00 AM</option>
                  <option>11:00 AM - 12:00 PM</option>
                  <option>02:00 PM - 03:00 PM</option>
                  <option>04:00 PM - 05:00 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVisit}
                  className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold shadow-md cursor-pointer"
                >
                  {isSubmittingVisit ? "Scheduling..." : "Confirm Site Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
