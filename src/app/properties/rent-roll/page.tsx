"use client";
import React, { useState } from "react";
import { FileText, Mail, Phone, User, ShieldCheck, ArrowRight, X, Bell } from "lucide-react";

export default function RentRoll() {
  const [rentroll] = useState([
    { 
      id: 1, 
      tenant: "TCS India", 
      space: "Meridian Wing B", 
      billingDay: "1st of Month", 
      baseRent: "₹18,50,000", 
      maintainFee: "₹1,85,000", 
      totalDue: "₹20,35,000",
      poc: "Priya Sharma",
      role: "Tenant Administrator",
      email: "tenant@officex.in",
      phone: "+91 98765 43210",
      complianceRating: "98.5%"
    },
    { 
      id: 2, 
      tenant: "Razorpay Tech", 
      space: "Apex Floor 4", 
      billingDay: "5th of Month", 
      baseRent: "₹8,50,000", 
      maintainFee: "₹85,000", 
      totalDue: "₹9,35,000",
      poc: "Harish Iyer",
      role: "Operations Lead",
      email: "harish@razorpay.com",
      phone: "+91 99887 76655",
      complianceRating: "96.2%"
    }
  ]);

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [notification, setNotification] = useState("");

  const triggerReminder = (tenantName: string, poc: string) => {
    setNotification(`Demand notice & SMS reminder successfully dispatched to ${poc} (${tenantName})!`);
    setTimeout(() => setNotification(""), 4000);
    setSelectedTenant(null);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rent Roll Ledger</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Audit active tenant lease billings, base rentals, and maintenance calculations.</p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 font-bold text-xs animate-bounce flex items-center gap-2 max-w-2xl">
          <Bell size={16} />
          {notification}
        </div>
      )}

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Tenant Name</th>
              <th className="py-4">Lease Unit</th>
              <th className="py-4">Billing Day</th>
              <th className="py-4">Base Rent</th>
              <th className="py-4">CAM Charges</th>
              <th className="py-4">Total Gross Due</th>
            </tr>
          </thead>
          <tbody>
            {rentroll.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => setSelectedTenant(row)}
                className="border-b border-gray-200 text-xs hover:bg-[#F0FDFA]/40 cursor-pointer transition-colors"
              >
                <td className="py-4 font-bold text-teal-700 flex items-center gap-2 hover:underline">
                  <FileText size={14} className="text-purple-600" />
                  {row.tenant}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{row.space}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.billingDay}</td>
                <td className="py-4 text-gray-700 font-semibold">{row.baseRent}</td>
                <td className="py-4 text-red-600 font-semibold">{row.maintainFee}</td>
                <td className="py-4 text-purple-600 font-extrabold">{row.totalDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-out Drawer Panel for Tenant Details */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black/35 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{selectedTenant.tenant} Profile</h3>
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Workspace Tenant</span>
                </div>
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tenant Profile details */}
              <div className="flex flex-col gap-6 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <User size={14} className="text-gray-600" />
                    <span>{selectedTenant.poc} ({selectedTenant.role})</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <Mail size={14} className="text-gray-600" />
                    <span>{selectedTenant.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-800">
                    <Phone size={14} className="text-gray-600" />
                    <span>{selectedTenant.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Space Area</span>
                    <span className="font-extrabold text-gray-900 mt-1 block">{selectedTenant.space}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Total Due</span>
                    <span className="font-extrabold text-purple-600 mt-1 block">{selectedTenant.totalDue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => triggerReminder(selectedTenant.tenant, selectedTenant.poc)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Send Rent Reminder <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
