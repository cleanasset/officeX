"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, Check, X, ShieldCheck, Heart, Award, ArrowRight } from "lucide-react";

interface Property {
  id: string;
  name: string;
  city: string;
  type: string;
  grade: string;
  area: string;
  rent: string;
  rentPerSqft: string;
  deposit: string;
  lockIn: string;
  powerBackup: string;
  hvac: string;
  parking: string;
  leed: string;
  score: number;
  scoresBreakdown: {
    location: string;
    building: string;
    access: string;
    amenities: string;
    value: string;
    readiness: string;
  };
  nocs: {
    fire: boolean;
    lift: boolean;
    structure: boolean;
    pollution: boolean;
  };
  imageUrl: string;
}

export default function PropertyCompareClient({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [toastMsg, setToastMsg] = useState("");

  const handleRemove = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const handleShortlist = (name: string) => {
    setToastMsg(`Property "${name}" successfully added to your corporate shortlist!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="relative">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
          <Building size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-sm">No properties in comparisons list</h3>
          <p className="text-xs text-gray-500 mt-1">Go back and select properties to compare side-by-side.</p>
          <Link href="/public/search" className="mt-4 px-4 py-2 bg-[#0F8B7D] hover:bg-[#0d7569] text-white rounded-lg text-xs font-bold inline-block shadow-sm">
            Search Workspace Listings
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 pr-4 w-1/5 text-xs font-bold text-gray-400 uppercase tracking-wider">Specifications</th>
                {properties.map((p) => (
                  <th key={p.id} className="py-4 px-6 text-center w-1/4 relative group">
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute -top-1 right-2 p-1 rounded-full bg-red-50 text-red-650 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X size={12} />
                    </button>
                    
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F8B7D] text-[9px] font-black uppercase">
                          Grade {p.grade}
                        </span>
                        <h4 className="font-black text-gray-900 text-xs mt-1 leading-snug">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{p.city}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* === SECTION 1: OFFICEX PROPERTY SCORE === */}
              <tr className="bg-slate-50/50">
                <td className="py-3 pr-4 font-black text-gray-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-[#0F8B7D]" /> OFFICEX Property Score
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center bg-[#0F8B7D]/5 font-black text-sm text-[#0F8B7D]">
                    {p.score} <span className="text-[10px] text-gray-400 font-semibold">/ 100</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Location Accessibility</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.scoresBreakdown.location}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Building Quality / Specs</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.scoresBreakdown.building}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Transit Connectivity</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.scoresBreakdown.access}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Amenities & Services</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.scoresBreakdown.amenities}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Commercial Value Index</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.scoresBreakdown.value}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Operational Readiness</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center font-bold text-emerald-600">{p.scoresBreakdown.readiness}</td>
                ))}
              </tr>

              {/* === SECTION 2: COMMERCIAL TERMS === */}
              <tr className="bg-slate-50/50">
                <td className="py-3 pr-4 font-black text-gray-800 text-[10px] uppercase tracking-wider">
                  Commercial Pricing
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6"></td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Total Leasable Area</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-950 font-bold">{p.area}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Target Monthly Rent</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center font-black text-[#0F8B7D]">{p.rent}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Rent per Sq.Ft.</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-900">{p.rentPerSqft} / sq.ft</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Security Deposit</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-700">{p.deposit}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Lock-in Period</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-700">{p.lockIn}</td>
                ))}
              </tr>

              {/* === SECTION 3: TECHNICAL & INFRASTRUCTURE === */}
              <tr className="bg-slate-50/50">
                <td className="py-3 pr-4 font-black text-gray-800 text-[10px] uppercase tracking-wider">
                  Technical Specifications
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6"></td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Power Backup (DG)</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-700">{p.powerBackup}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">HVAC Cooling Standard</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-700">{p.hvac}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Parking Allotment</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center text-gray-700">{p.parking}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">LEED Green Rating</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center font-bold text-emerald-600">{p.leed}</td>
                ))}
              </tr>

              {/* === SECTION 4: STATUTORY NOC COMPLIANCE === */}
              <tr className="bg-slate-50/50">
                <td className="py-3 pr-4 font-black text-gray-800 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#0F8B7D]" /> Statutory NOC Status
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6"></td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Statutory Fire NOC</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center">
                    {p.nocs.fire ? <Check size={16} className="text-emerald-600 mx-auto" /> : <X size={16} className="text-red-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Lift Inspectors License</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center">
                    {p.nocs.lift ? <Check size={16} className="text-emerald-600 mx-auto" /> : <X size={16} className="text-red-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Structure Stability NOC</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center">
                    {p.nocs.structure ? <Check size={16} className="text-emerald-600 mx-auto" /> : <X size={16} className="text-red-500 mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 text-xs font-semibold">
                <td className="py-3 pr-4 pl-4 text-gray-500">Pollution Control Certificate</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-3 px-6 text-center">
                    {p.nocs.pollution ? <Check size={16} className="text-emerald-600 mx-auto" /> : <X size={16} className="text-red-500 mx-auto" />}
                  </td>
                ))}
              </tr>

              {/* === SECTION 5: PROCURMENT ACTIONS === */}
              <tr className="text-xs font-semibold">
                <td className="py-6 pr-4 font-bold text-gray-900">Procurement Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="py-6 px-6 text-center">
                    <div className="flex flex-col gap-2.5 max-w-[170px] mx-auto">
                      <button
                        onClick={() => handleShortlist(p.name)}
                        className="w-full py-2 rounded-xl border border-gray-200 hover:bg-slate-50 text-[#0F8B7D] font-extrabold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Heart size={12} /> Shortlist Space
                      </button>
                      <Link
                        href={`/public/property/${p.id}`}
                        className="w-full py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0d7569] text-white font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        Request Proposal <ArrowRight size={10} />
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
