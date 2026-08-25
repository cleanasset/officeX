"use client";
import React, { useState } from "react";
import { Building, MapPin, Plus } from "lucide-react";

export default function PropertyRegistry() {
  const [properties] = useState([
    { id: 1, name: "Apex Business Tower", type: "Commercial Office", location: "BKC, Mumbai", units: "48 Units", area: "2,50,000 sq.ft", owner: "Dharma Estates" },
    { id: 2, name: "Meridian Tech Park", type: "IT Park", location: "Whitefield, Bengaluru", units: "120 Units", area: "8,50,000 sq.ft", owner: "United Properties" },
    { id: 3, name: "Nexus Hub", type: "Coworking Center", location: "Hinjewadi, Pune", units: "12 Units", area: "45,000 sq.ft", owner: "Serum Realtors" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Registry</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Detailed directory of building assets, physical areas, and landlord profiles.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-2">
          <Plus size={14} /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Building size={16} className="text-purple-600" />
                  {p.name}
                </h3>
                <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-600 text-[9px] font-bold uppercase tracking-wider">
                  {p.type}
                </span>
              </div>
              <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-2">
                <MapPin size={12} className="text-gray-600" /> {p.location}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-600 font-bold block">Capacity</span>
                  <span className="font-bold text-gray-900">{p.units}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-600 font-bold block">Total Area</span>
                  <span className="font-bold text-gray-900">{p.area}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
