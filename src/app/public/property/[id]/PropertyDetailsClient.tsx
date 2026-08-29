"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, ShieldCheck, ChevronRight, Star, 
  Award, Sparkles, Calendar, FileText, CheckCircle, X, 
  Download, Zap, Wind, ArrowUpDown, Camera, Dumbbell, 
  ArrowLeftRight, Check, Compass, BatteryCharging, Leaf, Shield
} from "lucide-react";

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
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Proposal Form State
  const [proposalForm, setProposalForm] = useState({
    companyName: "",
    seats: "200",
    email: "",
    phone: ""
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("11:00");
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.companyName.trim() || !proposalForm.email.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }
    setIsSubmittingProposal(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: proposalForm.companyName,
          desiredSqft: "25000",
          budgetRange: "₹1,25,000 / month",
          city: property.city
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowProposalModal(false);
        showToast(`Proposal request for ${proposalForm.companyName} submitted successfully!`);
        setProposalForm({ companyName: "", seats: "200", email: "", phone: "" });
      } else {
        showToast("Submission failed. Try again.");
      }
    } catch (err) {
      showToast("Network error. Try again.");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      showToast("Please select a date.");
      return;
    }
    setIsSubmittingVisit(true);
    setTimeout(() => {
      setIsSubmittingVisit(false);
      setShowVisitModal(false);
      showToast(`Site visit scheduled for ${visitDate} at ${visitTime} successfully!`);
    }, 800);
  };

  const handleDownload = () => {
    showToast("Preparing technical due-diligence package...");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([
        `==================================================\n` +
        `OFFICEX TECHNICAL DUE-DILIGENCE & PROPERTY PACK\n` +
        `==================================================\n\n` +
        `Property: ${property.name}\n` +
        `Address: ${property.address}, ${property.city}\n` +
        `Building Grade: Grade ${property.grade}\n\n` +
        `COMMERCIAL SUMMARY:\n` +
        `- Base Rent: ₹135 / sq.ft / mo (Est. ₹33,75,000 / month)\n` +
        `- Expected Seats: 200 (Est. ₹12,000 / seat / mo)\n` +
        `- Security Deposit: 3 Months Deposit\n` +
        `- Lock-In Period: 3 Years\n` +
        `- Annual Escalation: 5%\n\n` +
        `DECISION INTELLIGENCE SCORE: 86 / 100\n` +
        `- Location Connect: 94 / 100\n` +
        `- Building Quality: 89 / 100\n` +
        `- Accessibility: 91 / 100\n` +
        `- Amenities: 84 / 100\n` +
        `- Value Score: 82 / 100\n` +
        `- Operational Readiness: 88 / 100\n\n` +
        `STATUTORY SAFETY COMPLIANCES:\n` +
        `- Fire NOC Certification: Verified (Valid)\n` +
        `- Lift Safety Certificate: Verified (Valid)\n` +
        `- Diesel Generator Air NOC: Verified (Valid)\n\n` +
        `Energy Rating: LEED Gold Certifed (92/100 Energy Score)`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${property.name.toLowerCase().replace(/\s+/g, "_")}_property_pack.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast("Download started successfully!");
    }, 1000);
  };

  const toggleCompare = () => {
    setIsCompared(!isCompared);
    if (!isCompared) {
      showToast(`${property.name} added to comparison list.`);
    } else {
      showToast(`${property.name} removed from comparison list.`);
    }
  };

  // Specs calculations
  const areaFormatted = parseFloat(property.totalArea).toLocaleString();
  const estimatedRentSqft = "₹135";
  const estimatedSeatCost = "₹12,000";

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Page Layout Wrapper */}
      <div className="w-full">
        
        {/* Header (Figma Design Layout) */}
        <header className="h-[65px] bg-white border-b border-[#DFE4E1] px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={26} height={26} className="object-contain" />
            <span className="font-extrabold text-slate-950 text-sm tracking-widest">OFFICEX</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <Link href="/public/search" className="hover:text-[#0F8B7D] transition-colors">Platform</Link>
            <Link href="/public/search" className="hover:text-[#0F8B7D] transition-colors">Solutions</Link>
            <Link href="/public/search" className="hover:text-[#0F8B7D] transition-colors">Pricing</Link>
          </nav>

          <Link 
            href="/public/search" 
            className="px-4 py-2 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm transition-all"
          >
            Get Started
          </Link>
        </header>

        {/* Centered Page Area */}
        <main className="max-w-7xl mx-auto px-8 py-6 flex flex-col gap-6">
          
          {/* Breadcrumbs (Figma Design Layout) */}
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Link href="/" className="hover:text-[#0F8B7D]">Home</Link>
            <ChevronRight size={10} className="text-slate-300" />
            <Link href="/public/search" className="hover:text-[#0F8B7D]">Properties</Link>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="hover:text-[#0F8B7D]">{property.city}</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-slate-600 font-extrabold">{property.name}</span>
          </div>

          {/* Upper Grid Layout: Image on Left, Pricing Sidebar on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Visual Container (Image Box) */}
            <div className="lg:col-span-2 relative h-[500px] rounded-2xl overflow-hidden border border-[#DFE4E1] shadow-sm">
              <img 
                src={property.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200"} 
                alt={property.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlaid Pill Badge */}
              <div className="absolute top-4 left-4 bg-[#0F8B7D] text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                Verified Grade {property.grade}
              </div>

              {/* Overlaid Photos Button */}
              <button 
                onClick={() => setShowPhotosModal(true)}
                className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1 cursor-pointer border border-[#DFE4E1]"
              >
                <span>+12 Photos</span>
              </button>
            </div>

            {/* Right Sidebar Info Card */}
            <div className="bg-white rounded-2xl border border-[#DFE4E1] p-6 shadow-sm flex flex-col gap-4">
              
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{property.name}</h2>
                <div className="text-[9px] text-slate-400 font-extrabold flex items-center gap-0.5">
                  <MapPin size={11} className="text-[#0F8B7D]" />
                  {property.address}, {property.city}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estimated Rent</span>
                  <span className="text-base font-black text-[#0F8B7D]">₹1,25,000 <span className="text-[9px] text-slate-400 font-bold normal-case">/ month</span></span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Security Deposit</span>
                  <span className="text-xs font-black text-slate-700">3 Months Deposit</span>
                </div>
              </div>

              {/* Client Approved Changes Metrics */}
              <div className="bg-slate-50 rounded-xl p-3 border border-[#DFE4E1] flex flex-col gap-1.5 text-[9px] font-bold text-slate-500">
                <div className="flex justify-between items-center">
                  <span>OFFICEX Property Score</span>
                  <span className="px-2 py-0.5 rounded bg-[#0F8B7D] text-white font-extrabold text-[8px]">86 / 100</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                  <span>Price / Sq.Ft.</span>
                  <span className="font-extrabold text-slate-800">{estimatedRentSqft} / sqft</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Price / Seat</span>
                  <span className="font-extrabold text-slate-800">{estimatedSeatCost} / seat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Est. Occupancy Cost</span>
                  <span className="font-extrabold text-slate-800">₹33,75,000 / mo base</span>
                </div>
              </div>

              {/* Tenant Suitability Recommendation */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[9px] font-bold text-emerald-800">
                <Award size={13} className="text-emerald-600 shrink-0" />
                <span>Best Suited: BFSI, IT/ITES & Corporates</span>
              </div>

              {/* Action Buttons Panel */}
              <div className="flex flex-col gap-2 mt-1">
                <button 
                  onClick={() => setShowVisitModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-[10px] uppercase shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar size={13} />
                  Schedule Site Visit
                </button>
                <button 
                  onClick={() => setShowProposalModal(true)}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#0F8B7D] hover:bg-slate-50 text-[#0F8B7D] font-extrabold text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} />
                  Request Space Proposal
                </button>
                <button 
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  Download Property Pack
                </button>
                
                {/* Compare Checkbox Option */}
                <button 
                  onClick={toggleCompare}
                  className={`w-full py-2 rounded-xl border text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCompared 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <ArrowLeftRight size={12} />
                  {isCompared ? "Space Shortlisted (Compare)" : "Add to Compare Matrix"}
                </button>
              </div>

              <div className="text-[9px] font-bold text-slate-400 leading-relaxed text-center border-t border-slate-100 pt-2.5">
                Contact our institutional team for customized lease structures.
              </div>

            </div>

          </div>

          {/* Stateful Bottom Tabs Panel (Figma Design Layout) */}
          <div className="bg-white rounded-2xl border border-[#DFE4E1] shadow-sm overflow-hidden mt-2">
            
            {/* Tabs Header Menu */}
            <div className="flex border-b border-[#DFE4E1] bg-slate-50">
              <button 
                onClick={() => setActiveTab("specs")}
                className={`px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider transition-colors border-r border-[#DFE4E1] cursor-pointer ${
                  activeTab === "specs" 
                    ? "bg-white text-[#0F8B7D] border-b-2 border-b-[#0F8B7D]" 
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Specs & Details
              </button>
              <button 
                onClick={() => setActiveTab("compliance")}
                className={`px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider transition-colors border-r border-[#DFE4E1] cursor-pointer ${
                  activeTab === "compliance" 
                    ? "bg-white text-[#0F8B7D] border-b-2 border-b-[#0F8B7D]" 
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Compliance & Services
              </button>
              <button 
                onClick={() => setActiveTab("location")}
                className={`px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === "location" 
                    ? "bg-white text-[#0F8B7D] border-b-2 border-b-[#0F8B7D]" 
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Amenities & Location
              </button>
            </div>

            {/* Tabs Body Section */}
            <div className="p-6">
              
              {activeTab === "specs" && (
                <div className="flex flex-col gap-8">
                  
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Space Description</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Premium Grade A workspace in the heart of Mumbai's financial district. Offering state-of-the-art facilities, LEED Gold certification, and exceptional connectivity tailored for multinational corporations and financial institutions.
                    </p>
                  </div>
                  
                  {/* Grid Stats 3x3 */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Specifications Matrix</h4>
                    <div className="grid grid-cols-3 gap-y-6 gap-x-8 text-xs font-semibold text-slate-700">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Area</div>
                        <div className="font-black text-slate-900 mt-0.5">{areaFormatted} sqft</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Seats</div>
                        <div className="font-black text-slate-900 mt-0.5">200</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Floor</div>
                        <div className="font-black text-slate-900 mt-0.5">5th</div>
                      </div>
                      
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Power</div>
                        <div className="font-black text-slate-900 mt-0.5">450 KVA</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Parking</div>
                        <div className="font-black text-slate-900 mt-0.5">25 slots</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Year</div>
                        <div className="font-black text-slate-900 mt-0.5">2019</div>
                      </div>
                      
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">LEED</div>
                        <div className="font-black text-emerald-600 mt-0.5">Gold</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lock-In</div>
                        <div className="font-black text-slate-900 mt-0.5">3yr</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Escalation</div>
                        <div className="font-black text-slate-900 mt-0.5">5%</div>
                      </div>
                    </div>
                  </div>

                  {/* OFFICEX Property Decision Intelligence Panel */}
                  <div className="border-t border-slate-100 pt-6 flex flex-col gap-6">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">OFFICEX Decision Intelligence Analytics</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Column A: Property Score Dimensions (6 Progress Bars) */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Score Dimensions Breakdown</span>
                        
                        <div className="flex flex-col gap-2.5">
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Location Connectivity</span>
                              <span>94 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '94%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Building Structural Quality</span>
                              <span>89 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '89%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Accessibility & Transit</span>
                              <span>91 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '91%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Amenities Checklist</span>
                              <span>84 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '84%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Commercial Value Rating</span>
                              <span>82 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '82%' }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-700 mb-0.5">
                              <span>Operational Readiness</span>
                              <span>88 / 100</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#0F8B7D] h-full rounded-full" style={{ width: '88%' }} />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Column B: Sustainability & Commute Scorecards */}
                      <div className="flex flex-col gap-4">
                        
                        {/* Sustainability and Travel widgets */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                            <Leaf className="text-emerald-600 shrink-0" size={18} />
                            <div>
                              <div className="text-[8px] text-slate-450 font-bold uppercase leading-none mb-0.5">Energy Score</div>
                              <div className="text-xs font-black text-slate-900 leading-none">92 / 100</div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
                            <Compass className="text-[#0F8B7D] shrink-0" size={18} />
                            <div>
                              <div className="text-[8px] text-slate-450 font-bold uppercase leading-none mb-0.5">Commute Score</div>
                              <div className="text-xs font-black text-slate-900 leading-none">94 / 100</div>
                            </div>
                          </div>
                        </div>

                        {/* Estimated Occupancy cost calculations breakdown */}
                        <div className="p-4 rounded-xl border border-[#DFE4E1] bg-slate-50 flex flex-col gap-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Annual Occupancy Cost</span>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-650">
                            <span>Base Rent (₹135/sqft/mo)</span>
                            <span className="font-bold text-slate-800">₹33,75,000 / mo</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-650">
                            <span>FM Operations & Maintenance</span>
                            <span className="font-bold text-slate-800">₹3,75,000 / mo</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold text-slate-650 border-t border-slate-200 pt-1.5 mt-0.5">
                            <span>Total Net Outflow</span>
                            <span className="font-black text-[#0F8B7D]">₹4,50,00,000 / yr</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

              {activeTab === "compliance" && (
                <div className="flex flex-col gap-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Statutory Certificates Compliance Checks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compliances.map((cert, idx) => {
                      const expiry = new Date(cert.expiryDate);
                      const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isExpired = diffDays <= 0;

                      return (
                        <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 border border-[#DFE4E1]">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{cert.name}</div>
                            <div className="text-[9px] text-slate-400 font-bold mt-0.5">{cert.issuingAuthority}</div>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isExpired ? 'bg-red-50 text-red-650' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isExpired ? 'Expired' : 'Valid'}
                          </span>
                        </div>
                      );
                    })}
                    {compliances.length === 0 && (
                      <div className="text-xs text-slate-400 italic py-4">No active statutory certificates found for this property.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div className="flex flex-col gap-6">
                  
                  {/* Visual Amenities Badges (6 Icon Badges) */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Key Amenities Badges</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <Zap size={14} className="text-[#0F8B7D]" />
                        <span>100% Power Backup</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <Wind size={14} className="text-[#0F8B7D]" />
                        <span>Centralized Climate AC</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <ArrowUpDown size={14} className="text-[#0F8B7D]" />
                        <span>4x Passenger Lifts</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <Shield size={14} className="text-[#0F8B7D]" />
                        <span>24/7 Security Patrol</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <Camera size={14} className="text-[#0F8B7D]" />
                        <span>CCTV Surveillance</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-[#DFE4E1] text-[10px] font-bold text-slate-700">
                        <Dumbbell size={14} className="text-[#0F8B7D]" />
                        <span>Tenant Wellness Gym</span>
                      </div>
                    </div>
                  </div>

                  {/* Nearby Landmarks section */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Transport Connectivity & Landmarks</h4>
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-slate-650">
                      <div className="flex justify-between items-center p-2 border-b border-slate-100">
                        <span>Bandra Kurla Metro Station</span>
                        <span className="font-bold text-slate-900">300m walk</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border-b border-slate-100">
                        <span>Trident BKC Luxury Hotel</span>
                        <span className="font-bold text-slate-900">1.2 km</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border-b border-slate-100">
                        <span>Chhatrapati Shivaji International Airport</span>
                        <span className="font-bold text-slate-900">5.5 km</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border-b border-slate-100">
                        <span>Phoenix Marketcity Mall</span>
                        <span className="font-bold text-slate-900">2.1 km</span>
                      </div>
                    </div>
                  </div>

                  {/* Plotted map View */}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Google Map Location View</h4>
                    <div className="w-full h-72 rounded-xl overflow-hidden border border-[#DFE4E1] relative shadow-inner">
                      <iframe
                        title="Property Location Map View"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(property.name + ", " + property.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-2">
                      Exact Address: {property.address}, {property.city} - {property.pincode}
                    </span>
                  </div>

                </div>
              )}

            </div>
          </div>

        {/* Similar Properties Section (Matches Figma exactly) */}
        <div className="w-full mt-8">
          <h3 className="font-black text-slate-900 text-sm mb-5 tracking-tight">
            {isSimilarFallback ? "Featured Workspaces in Other Cities" : `Similar Properties in ${property.city}`}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((item, idx) => {
              const imgPlaceholder = [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400",
                "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=400"
              ][idx % 3];

              const finalImageUrl = item.imageUrl && item.imageUrl.trim() !== "" && !item.imageUrl.startsWith("/")
                ? item.imageUrl 
                : imgPlaceholder;

              const formattedRent = item.expectedRent 
                ? `₹${parseFloat(item.expectedRent).toLocaleString()} / mo` 
                : "₹1,25,000 / mo";

              return (
                <div key={idx} className="rounded-2xl border border-[#DFE4E1] overflow-hidden bg-white hover:border-[#0F8B7D] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div className="h-48 relative bg-slate-100 overflow-hidden">
                    <img 
                      src={finalImageUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0F8B7D] text-white font-extrabold text-[8px] uppercase tracking-widest rounded shadow-sm">
                      Grade {item.grade}
                    </span>
                  </div>
                  
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs truncate group-hover:text-[#0F8B7D] transition-colors">{item.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 mt-1">
                        <MapPin size={10} className="text-slate-400" /> {item.address}, {item.city}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Rent</span>
                        <span className="text-xs font-black text-slate-900 mt-0.5">{formattedRent}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Starting Area</span>
                        <span className="text-xs font-black text-slate-700 mt-0.5">{parseFloat(item.totalArea).toLocaleString()} sqft</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Link 
                        href={`/public/property/${item.id}`}
                        className="w-full py-2 bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-[9px] uppercase rounded-lg shadow-xs transition-all flex items-center justify-center gap-1"
                      >
                        View Space Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            {similarProperties.length === 0 && (
              <div className="col-span-3 text-center text-xs text-slate-400 italic py-8 bg-white border border-[#DFE4E1] rounded-2xl">
                No alternative properties found in this location.
              </div>
            )}
          </div>
        </div>

      </main>

      </div>

      {/* MODALS */}

      {/* 1. Proposal Request Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Request Space Proposal</h3>
              <button onClick={() => setShowProposalModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleProposalSubmit} className="flex flex-col gap-4">
              <div className="text-[10px] text-slate-500 mb-2 font-semibold leading-relaxed">
                Submit your seat requirements for **{property.name}** to auto-log a leasing enquiry lead.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Razorpay Software Pvt Ltd"
                  value={proposalForm.companyName}
                  onChange={(e) => setProposalForm({ ...proposalForm, companyName: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-slate-50/50 text-slate-900 font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Estimated Seats Needed</label>
                <select 
                  value={proposalForm.seats}
                  onChange={(e) => setProposalForm({ ...proposalForm, seats: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="50">50 Seats (~3,500 sqft)</option>
                  <option value="100">100 Seats (~7,000 sqft)</option>
                  <option value="200">200 Seats (~14,000 sqft)</option>
                  <option value="500">500+ Seats (Multiple Floors)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">POC Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. admin@company.com"
                  value={proposalForm.email}
                  onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-slate-50/50 text-slate-900 font-semibold"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmittingProposal}
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] text-white font-extrabold text-xs shadow-md mt-4 transition-all"
              >
                {isSubmittingProposal ? "Submitting Request..." : "Request Proposal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Site Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Schedule Corporate Site Visit</h3>
              <button onClick={() => setShowVisitModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleVisitSubmit} className="flex flex-col gap-4">
              <div className="text-[10px] text-slate-500 mb-2 font-semibold">
                Select a target calendar date and time for guided property tour.
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Target Visit Date</label>
                <input 
                  type="date" 
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] text-xs bg-slate-50/50 text-slate-900 font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Time Slot</label>
                <select 
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-800 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmittingVisit}
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] text-white font-extrabold text-xs shadow-md mt-4 transition-all"
              >
                {isSubmittingVisit ? "Scheduling Tour..." : "Schedule Site Tour"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Photos Lightbox Gallery Modal */}
      {showPhotosModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setShowPhotosModal(false)} 
              className="absolute -top-12 right-0 text-white hover:text-slate-300 font-bold text-sm bg-white/10 p-2 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="grid grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto p-2">
              {[
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600",
                "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600",
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600"
              ].map((src, i) => (
                <div key={i} className="h-56 rounded-xl overflow-hidden border border-white/10 relative">
                  <img src={src} alt="Workspace gallery" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/60 mt-4 font-semibold uppercase tracking-wider">OfficeX Verified Spaces Tour</p>
          </div>
        </div>
      )}

      {/* Footer Exactly Replicating Figma Design */}
      <footer className="bg-[#1F2937] text-slate-350 border-t border-[#DFE4E1]/10 py-10 px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={24} height={24} className="object-contain" />
              <span className="font-extrabold text-white text-xs tracking-widest">OFFICEX</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              © 2024 OfficeX India. Institutional Real Estate Services. All Rights Reserved.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex flex-col gap-2">
              <h5 className="text-white text-[11px] font-black lowercase tracking-normal">Properties</h5>
              <Link href="/public/search" className="text-slate-400 hover:text-white transition-colors">Market Insights</Link>
            </div>

            {/* Links Column 2 */}
            <div className="flex flex-col gap-2">
              <h5 className="text-white text-[11px] font-black lowercase tracking-normal">Legal Policy</h5>
              <Link href="/public/search" className="text-slate-400 hover:text-white transition-colors">Sustainability</Link>
            </div>

            {/* Links Column 3 */}
            <div className="flex flex-col gap-2">
              <h5 className="text-white text-[11px] font-black lowercase tracking-normal">Careers</h5>
              <Link href="/public/search" className="text-slate-400 hover:text-white transition-colors">Newsletter</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
