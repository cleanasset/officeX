"use client";
import React, { useState } from "react";
import { Building, Plus, Search, MapPin, Layers } from "lucide-react";

export default function ListingsPage() {
  const [listings, setListings] = useState([
    { id: 1, name: "Apex Business Tower - Floor 4", type: "Office Space", area: "8,500 sq.ft", rate: "₹180/sq.ft", status: "Vacant" },
    { id: 2, name: "Meridian Tech Park - Block B", type: "IT/ITeS Space", area: "15,000 sq.ft", rate: "₹120/sq.ft", status: "Occupied" },
    { id: 3, name: "Nexus Hub - Desk Space", type: "Coworking", area: "200 Desks", rate: "₹12,000/desk", status: "Vacant" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Property Listings</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Configure physical listings, rental rates, and unit availabilities.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md flex items-center gap-2">
          <Plus size={14} /> Add Listing
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Property Name</th>
              <th className="py-4">Space Type</th>
              <th className="py-4">Area / Count</th>
              <th className="py-4">Rental Rate</th>
              <th className="py-4">Vacancy</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-gray-200 text-xs hover:bg-gray-50/50">
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2">
                  <Building size={14} className="text-blue-500" />
                  {l.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{l.type}</td>
                <td className="py-4 text-gray-700 font-semibold">{l.area}</td>
                <td className="py-4 text-gray-900 font-extrabold">{l.rate}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    l.status === "Vacant" ? "bg-emerald-600 text-white" : "bg-gray-600 text-white"
                  }`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
