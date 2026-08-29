"use client";

import React, { useState } from "react";
import { FileText, Mail, Phone, User, ShieldCheck, ArrowRight, X, Bell, TrendingUp, DollarSign } from "lucide-react";

export default function RentRoll() {
  const [rentroll] = useState([
    { 
      id: 1, 
      tenant: "TCS India", 
      space: "Meridian Tech Park - Block B", 
      billingDay: "1st of Month", 
      baseRent: 1850000, 
      camRent: 185000, 
      escalation: 5.00,
      securityDeposit: 5550000,
      renewalDate: "2027-08-31",
      poc: "Priya Sharma",
      role: "Tenant Administrator",
      email: "tenant@officex.in",
      phone: "+91 98765 43210"
    },
    { 
      id: 2, 
      tenant: "Razorpay Tech", 
      space: "Apex Business Tower - Floor 4", 
      billingDay: "5th of Month", 
      baseRent: 850000, 
      camRent: 85000, 
      escalation: 5.00,
      securityDeposit: 2550000,
      renewalDate: "2028-03-31",
      poc: "Harish Iyer",
      role: "Operations Lead",
      email: "harish@razorpay.com",
      phone: "+91 99887 76655"
    }
  ]);

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [notification, setNotification] = useState("");

  const triggerReminder = (tenantName: string, poc: string) => {
    setNotification(`Demand notice & SMS reminder successfully dispatched to ${poc} (${tenantName})!`);
    setTimeout(() => setNotification(""), 4000);
    setSelectedTenant(null);
  };

  // Calculations for summary stats
  const totalBaseRent = rentroll.reduce((sum, item) => sum + item.baseRent, 0);
  const totalCAM = rentroll.reduce((sum, item) => sum + item.camRent, 0);
  const totalGrossDue = totalBaseRent + totalCAM;

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rent Roll Registry</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Audit active tenant lease commercial rolls, annual escalations, deposits, and CAM calculations.</p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-150 text-[#2563EB] font-bold text-xs animate-pulse flex items-center gap-2 max-w-2xl">
          <Bell size={16} />
          {notification}
        </div>
      )}

      {/* RENT ROLL ANALYTICS WIDGET */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Total Monthly Base Rent</span>
          <div className="text-2xl font-black text-slate-900 mt-2">₹{totalBaseRent.toLocaleString()}</div>
          <span className="text-[9px] text-slate-500 font-bold mt-1 block">Excluding CAM fees</span>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Total CAM Collections</span>
          <div className="text-2xl font-black text-slate-900 mt-2">₹{totalCAM.toLocaleString()}</div>
          <span className="text-[9px] text-slate-500 font-bold mt-1 block">At 10% standard rate</span>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Gross Billing Volume</span>
          <div className="text-2xl font-black text-[#2563EB] mt-2">₹{totalGrossDue.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">100% Collected</span>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Standard Escalation</span>
          <div className="text-2xl font-black text-slate-900 mt-2">5.00%</div>
          <span className="text-[9px] text-slate-500 font-bold mt-1 block">Compounded annually</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4">Tenant Name</th>
              <th className="py-4">Lease Unit</th>
              <th className="py-4">Escalation</th>
              <th className="py-4">Security Deposit</th>
              <th className="py-4">Base Rent</th>
              <th className="py-4">CAM Charges</th>
              <th className="py-4 text-right">Total Gross Due</th>
            </tr>
          </thead>
          <tbody>
            {rentroll.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => setSelectedTenant(row)}
                className="border-b border-slate-100 text-xs hover:bg-blue-50/10 cursor-pointer transition-colors font-semibold"
              >
                <td className="py-4 font-black text-slate-900 flex items-center gap-2 hover:text-[#2563EB] hover:underline">
                  <FileText size={14} className="text-[#2563EB]" />
                  {row.tenant}
                </td>
                <td className="py-4 text-slate-700">{row.space}</td>
                <td className="py-4 text-slate-500 font-bold">{row.escalation.toFixed(2)}%</td>
                <td className="py-4 text-slate-650">₹{row.securityDeposit.toLocaleString()}</td>
                <td className="py-4 text-slate-700 font-bold">₹{row.baseRent.toLocaleString()}</td>
                <td className="py-4 text-red-600">₹{row.camRent.toLocaleString()}</td>
                <td className="py-4 text-right font-black text-[#2563EB]">₹{(row.baseRent + row.camRent).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-out Drawer Panel for Tenant Details */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedTenant.tenant} Lease Profile</h3>
                  <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">Active Corporate Tenant</span>
                </div>
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tenant Profile details */}
              <div className="flex flex-col gap-6 text-xs font-semibold text-slate-750">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <User size={14} className="text-slate-500" />
                    <span>{selectedTenant.poc} ({selectedTenant.role})</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <Mail size={14} className="text-slate-500" />
                    <span>{selectedTenant.email}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone Number</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <Phone size={14} className="text-slate-500" />
                    <span>{selectedTenant.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Security Deposit</span>
                    <span className="font-extrabold text-slate-900 mt-1 block">₹{selectedTenant.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Renewal Target</span>
                    <span className="font-extrabold text-slate-900 mt-1 block">{new Date(selectedTenant.renewalDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => triggerReminder(selectedTenant.tenant, selectedTenant.poc)}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
