"use client";

import React, { useState } from "react";
import { 
  Users, Building, Mail, Phone, Search, ShieldCheck, 
  MapPin, CheckCircle, Clock, ArrowUpRight, Filter, ChevronRight
} from "lucide-react";

export default function TenantsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tenants = [
    {
      id: 1,
      name: "Aditya Verma",
      title: "Head of Real Estate & Infrastructure",
      company: "Tata Digital Ltd",
      building: "One BKC (Apex Tower)",
      space: "Floor 4, Suite 401 (North Wing)",
      area: "25,000 sq.ft.",
      seats: "180 Workstations",
      email: "aditya.verma@tatadigital.com",
      phone: "+91 98201 44821",
      leaseEnd: "31-Aug-2029",
      status: "Active",
      kyc: "Verified"
    },
    {
      id: 2,
      name: "Priya Nair",
      title: "Director Workplace Services",
      company: "Google India Pvt Ltd",
      building: "One BKC (Apex Tower)",
      space: "Floor 8, Entire Horizon Plate",
      area: "32,000 sq.ft.",
      seats: "240 Workstations",
      email: "pnair@google.com",
      phone: "+91 98190 22391",
      leaseEnd: "14-Oct-2030",
      status: "Active",
      kyc: "Verified"
    },
    {
      id: 3,
      name: "Rahul Mehta",
      title: "Partner - Corporate Operations",
      company: "Deloitte Digital",
      building: "Maker Maxity Mumbai",
      space: "Floor 5, Suite 501",
      area: "18,500 sq.ft.",
      seats: "140 Workstations",
      email: "rmehta@deloitte.com",
      phone: "+91 98210 55102",
      leaseEnd: "31-Dec-2028",
      status: "Active",
      kyc: "Verified"
    },
    {
      id: 4,
      name: "Sneha Rao",
      title: "Vice President - Facilities",
      company: "Wipro Cloud Infrastructure",
      building: "Godrej BKC Horizon",
      space: "Floor 6, Suite 602",
      area: "14,000 sq.ft.",
      seats: "110 Workstations",
      email: "sneha.rao@wipro.com",
      phone: "+91 98330 11984",
      leaseEnd: "14-Feb-2027",
      status: "Renewal Due",
      kyc: "Verified"
    }
  ];

  const filteredTenants = tenants.filter((t) => {
    const matchesBuilding = selectedBuilding === "All" || t.building.includes(selectedBuilding);
    const matchesSearch = !searchQuery.trim() || 
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBuilding && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-full pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">Tenant Directory</h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200 text-[10px] font-black">
              {filteredTenants.length} Active Tenancies
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Directory of corporate occupants, legal representatives, and emergency registers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant name, company, or contact..."
            className="w-full text-xs bg-transparent border-none outline-none"
          />
        </div>

        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 text-xs focus:outline-none"
        >
          <option value="All">All Buildings (3 Campuses)</option>
          <option value="One BKC">One BKC (Apex Tower)</option>
          <option value="Maker Maxity">Maker Maxity</option>
          <option value="Godrej BKC">Godrej BKC</option>
        </select>
      </div>

      {/* Responsive Tenant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {filteredTenants.map((t) => (
          <div 
            key={t.id} 
            className="bg-white rounded-2xl border border-gray-200/90 p-4.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-gray-900 text-sm md:text-base truncate">{t.company}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black flex items-center gap-0.5">
                      <ShieldCheck size={10} /> {t.kyc}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 block mt-0.5">
                    {t.name} <span className="text-[10px] text-gray-400">({t.title})</span>
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 ${
                  t.status === "Active" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {t.status}
                </span>
              </div>

              {/* Space & Location Meta */}
              <div className="bg-gray-50/80 rounded-xl p-3 mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">BUILDING &amp; SUITE</span>
                  <span className="font-bold text-gray-800 block truncate">{t.building}</span>
                  <span className="text-[10px] text-gray-500 block truncate">{t.space}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">OCCUPIED SCALE</span>
                  <span className="font-bold text-teal-700 block">{t.area}</span>
                  <span className="text-[10px] text-gray-500 block">{t.seats}</span>
                </div>
              </div>
            </div>

            {/* Contact Actions Footer */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${t.phone}`}
                  onClick={(e) => { e.stopPropagation(); }}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Phone size={12} /> Call Contact
                </a>
                <a
                  href={`mailto:${t.email}`}
                  onClick={(e) => { e.stopPropagation(); }}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Mail size={12} /> Email
                </a>
              </div>

              <span className="text-[10px] text-gray-400 font-medium">
                Lease Expiry: <strong className="text-gray-700 font-bold">{t.leaseEnd}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
