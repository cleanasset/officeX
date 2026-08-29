"use client";

import React, { useState } from "react";
import { FileText, Mail, Phone, User, ShieldCheck, ArrowRight, X, Bell, TrendingUp, DollarSign, ShieldAlert } from "lucide-react";

export default function RentRoll() {
  const [rentroll, setRentroll] = useState([
    { 
      id: 1, 
      tenant: "TCS India", 
      space: "Meridian Tech Park - Block B", 
      billingDay: "1st of Month", 
      baseRent: 1850000, 
      camRent: 185000, 
      escalation: 5.00,
      originalEscalation: 5.00,
      escalationHold: false,
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
      originalEscalation: 5.00,
      escalationHold: false,
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
  const [editingRent, setEditingRent] = useState(false);
  const [newRentVal, setNewRentVal] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Lease initialized", details: "TCS India registered with Base Rent: ₹18.5L, CAM: ₹1.85L", date: "2026-08-01 10:00 AM", user: "system" },
    { id: 2, action: "Lease initialized", details: "Razorpay Tech registered with Base Rent: ₹8.5L, CAM: ₹85K", date: "2026-08-01 10:05 AM", user: "system" }
  ]);

  const [showVariance, setShowVariance] = useState(false);

  const triggerReminder = (tenantName: string, poc: string) => {
    setNotification(`Demand notice & SMS reminder successfully dispatched to ${poc} (${tenantName})!`);
    setTimeout(() => setNotification(""), 4000);
    setSelectedTenant(null);
  };

  const toggleEscalationHold = (id: number) => {
    setRentroll(rentroll.map(t => {
      if (t.id === id) {
        const nextHold = !t.escalationHold;
        const log = {
          id: Date.now(),
          action: nextHold ? "Escalation Hold Enabled" : "Escalation Hold Released",
          details: `${t.tenant}: Escalation hold set to ${nextHold}`,
          date: new Date().toLocaleString(),
          user: "admin@officex.in"
        };
        setAuditLogs(prev => [log, ...prev]);
        return {
          ...t,
          escalationHold: nextHold,
          escalation: nextHold ? 0.00 : t.originalEscalation
        };
      }
      return t;
    }));
    
    // Update drawer view
    if (selectedTenant && selectedTenant.id === id) {
      const nextHold = !selectedTenant.escalationHold;
      setSelectedTenant({
        ...selectedTenant,
        escalationHold: nextHold,
        escalation: nextHold ? 0.00 : selectedTenant.originalEscalation
      });
    }

    showToast("Escalation status updated.");
  };

  const handleUpdateRent = () => {
    if (!newRentVal || isNaN(Number(newRentVal))) {
      alert("Please enter a valid numeric base rent.");
      return;
    }

    const inputDate = new Date(effectiveDate);
    const today = new Date();
    // Check if backdated (retroactive check)
    const isBackdated = inputDate.getTime() < today.getTime() - (24 * 60 * 60 * 1000);

    if (isBackdated) {
      setShowOverrideWarning(true);
    } else {
      applyRentChange();
    }
  };

  const applyRentChange = () => {
    const rentNum = Number(newRentVal);
    setRentroll(rentroll.map(t => {
      if (t.id === selectedTenant.id) {
        const log = {
          id: Date.now(),
          action: "Base Rent Adjusted",
          details: `${t.tenant}: Base rent updated from ₹${t.baseRent.toLocaleString()} to ₹${rentNum.toLocaleString()}`,
          date: new Date().toLocaleString(),
          user: "admin@officex.in"
        };
        setAuditLogs(prev => [log, ...prev]);
        return {
          ...t,
          baseRent: rentNum,
          camRent: Math.round(rentNum * 0.10) // 10% CAM
        };
      }
      return t;
    }));

    setNotification(`Rent successfully updated for ${selectedTenant.tenant} starting ${effectiveDate}!`);
    setTimeout(() => setNotification(""), 4000);
    
    setEditingRent(false);
    setShowOverrideWarning(false);
    setSelectedTenant(null);
  };

  const handleExport = (format: "XLSX" | "PDF") => {
    showToast(`MIS Ledger successfully compiled and exported as ${format}!`);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  // Calculations for summary stats
  const totalBaseRent = rentroll.reduce((sum, item) => sum + item.baseRent, 0);
  const totalCAM = rentroll.reduce((sum, item) => sum + item.camRent, 0);
  const totalGrossDue = totalBaseRent + totalCAM;
  
  // Budget benchmarks
  const budgetedBase = 2800000;
  const budgetedCAM = 280000;
  const budgetedGross = budgetedBase + budgetedCAM;

  const baseVariance = totalBaseRent - budgetedBase;
  const camVariance = totalCAM - budgetedCAM;
  const grossVariance = totalGrossDue - budgetedGross;

  // NOI UAT Calculations: NOI = Revenue - Opex (est. opex at 35% of total income)
  const opexExpenses = Math.round(totalGrossDue * 0.35);
  const netOperatingIncome = totalGrossDue - opexExpenses;

  return (
    <div className="flex flex-col gap-8 relative font-sans text-slate-900 bg-slate-50/20 p-2">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rent Roll Registry</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">Audit active tenant lease commercial rolls, annual escalations, deposits, and CAM calculations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowVariance(!showVariance)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-slate-700 font-bold text-xs cursor-pointer"
          >
            {showVariance ? "Hide Variance" : "Show Variance"}
          </button>
          <button 
            onClick={() => handleExport("XLSX")}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Export XLSX
          </button>
          <button 
            onClick={() => handleExport("PDF")}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-750 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Export PDF
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-150 text-[#0F8B7D] font-bold text-xs animate-pulse flex items-center gap-2 max-w-2xl">
          <Bell size={16} />
          {notification}
        </div>
      )}

      {/* MIS VARIANCE ANALYSIS COMPONENT */}
      {showVariance && (
        <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col gap-4 animate-scale-up">
          <span className="text-[10px] text-amber-700 font-black uppercase tracking-widest block">MIS Actual vs Budget Variance Analysis</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Base Rent Variance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">₹{totalBaseRent.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-semibold">vs ₹{budgetedBase.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1.5 ${baseVariance >= 0 ? "text-emerald-600" : "text-red-650"}`}>
                {baseVariance >= 0 ? "+" : ""}₹{baseVariance.toLocaleString()} ({((baseVariance / budgetedBase) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">CAM Charge Variance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">₹{totalCAM.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-semibold">vs ₹{budgetedCAM.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1.5 ${camVariance >= 0 ? "text-emerald-600" : "text-red-650"}`}>
                {camVariance >= 0 ? "+" : ""}₹{camVariance.toLocaleString()} ({((camVariance / budgetedCAM) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Gross Billing Variance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">₹{totalGrossDue.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-semibold">vs ₹{budgetedGross.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1.5 ${grossVariance >= 0 ? "text-emerald-600" : "text-red-650"}`}>
                {grossVariance >= 0 ? "+" : ""}₹{grossVariance.toLocaleString()} ({((grossVariance / budgetedGross) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
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
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Operational Expenses (OPEX)</span>
          <div className="text-2xl font-black text-red-650 mt-2">₹{opexExpenses.toLocaleString()}</div>
          <span className="text-[9px] text-slate-500 font-bold mt-1 block">Est. 35% opex rollup</span>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Net Operating Income (NOI)</span>
          <div className="text-2xl font-black text-emerald-600 mt-2">₹{netOperatingIncome.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-600 font-bold mt-1 block">Yield margins healthy</span>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Gross Monthly Income</span>
          <div className="text-2xl font-black text-[#0F8B7D] mt-2">₹{totalGrossDue.toLocaleString()}</div>
          <span className="text-[9px] text-slate-500 font-bold mt-1 block">Rent + Standard 10% CAM</span>
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
                onClick={() => {
                  setSelectedTenant(row);
                  setNewRentVal(row.baseRent.toString());
                  setEffectiveDate(new Date().toISOString().split('T')[0]);
                  setEditingRent(false);
                  setShowOverrideWarning(false);
                }}
                className="border-b border-slate-100 text-xs hover:bg-blue-50/10 cursor-pointer transition-colors font-semibold"
              >
                <td className="py-4 font-black text-slate-900 flex items-center gap-2 hover:text-[#0F8B7D] hover:underline">
                  <FileText size={14} className="text-[#0F8B7D]" />
                  {row.tenant}
                  {row.escalationHold && (
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-650 text-[8px] font-black uppercase ml-1">HOLD</span>
                  )}
                </td>
                <td className="py-4 text-slate-700">{row.space}</td>
                <td className="py-4 text-slate-500 font-bold">
                  {row.escalationHold ? "0.00% (Hold)" : `${row.escalation.toFixed(2)}%`}
                </td>
                <td className="py-4 text-slate-650">₹{row.securityDeposit.toLocaleString()}</td>
                <td className="py-4 text-slate-700 font-bold">₹{row.baseRent.toLocaleString()}</td>
                <td className="py-4 text-red-600">₹{row.camRent.toLocaleString()}</td>
                <td className="py-4 text-right font-black text-[#0F8B7D]">₹{(row.baseRent + row.camRent).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-out Drawer Panel for Tenant Details */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedTenant.tenant} Lease Profile</h3>
                  <span className="text-[10px] text-[#0F8B7D] font-bold uppercase tracking-wider">Active Corporate Tenant</span>
                </div>
                <button 
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tenant Profile details */}
              <div className="flex flex-col gap-5 text-xs font-semibold text-slate-750">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Point of Contact</label>
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800">
                    <User size={14} className="text-slate-500" />
                    <span>{selectedTenant.poc} ({selectedTenant.role})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Security Deposit</span>
                    <span className="font-extrabold text-slate-900 mt-1 block">₹{selectedTenant.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Renewal Target</span>
                    <span className="font-extrabold text-slate-900 mt-1 block">{new Date(selectedTenant.renewalDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Edit Lease rent forms */}
                <div className="border-t border-slate-150 pt-4 mt-2">
                  <h4 className="font-bold text-slate-900 text-xs mb-3">Adjust Lease Pricing / Rent Roll</h4>
                  
                  {!editingRent ? (
                    <button
                      onClick={() => setEditingRent(true)}
                      className="w-full py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 text-gray-800 font-bold text-[10px] cursor-pointer"
                    >
                      Update Rental Pricing
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-scale-up">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">New Base Rent (₹)</label>
                        <input
                          type="number"
                          value={newRentVal}
                          onChange={(e) => setNewRentVal(e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white font-semibold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Effective Start Date</label>
                        <input
                          type="date"
                          value={effectiveDate}
                          onChange={(e) => setEffectiveDate(e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white font-semibold text-xs cursor-pointer"
                        />
                      </div>

                      {showOverrideWarning && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-[10px] font-bold flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <ShieldAlert size={12} className="text-red-700" />
                            <strong>Warning: Retroactive adjustment</strong>
                          </span>
                          <span>Backdated changes affect closed billing runs. Requires manager override sign-off.</span>
                          <button
                            type="button"
                            onClick={applyRentChange}
                            className="mt-1.5 py-1 rounded bg-red-650 hover:bg-red-750 text-white font-extrabold text-[9px]"
                          >
                            Confirm Override
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => { setEditingRent(false); setShowOverrideWarning(false); }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] hover:bg-white"
                        >
                          Cancel
                        </button>
                        {!showOverrideWarning && (
                          <button
                            type="button"
                            onClick={handleUpdateRent}
                            className="px-3.5 py-1.5 bg-[#0F8B7D] text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-[#0d7569]"
                          >
                            Save Change
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-150 pt-4 mt-4">
                  <h4 className="font-bold text-slate-900 text-xs mb-3">Audit Logs & Timeline History</h4>
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                    {auditLogs
                      .filter(log => log.details.includes(selectedTenant.tenant))
                      .map((log) => (
                        <div key={log.id} className="p-2 rounded bg-gray-50 border border-gray-100 text-[10px]">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{log.action}</span>
                            <span className="text-slate-450 font-normal">{log.date}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{log.details}</p>
                          <span className="text-[9px] text-[#0F8B7D] font-black mt-1 block">User: {log.user}</span>
                        </div>
                      ))}
                    {auditLogs.filter(log => log.details.includes(selectedTenant.tenant)).length === 0 && (
                      <span className="text-slate-400 text-[10px] italic">No overrides recorded yet.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Actions button */}
            <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => toggleEscalationHold(selectedTenant.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedTenant.escalationHold
                    ? "bg-red-650 hover:bg-red-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                {selectedTenant.escalationHold ? "Release Escalation Hold" : "Put Escalation on Hold (0%)"}
              </button>
              <button 
                onClick={() => triggerReminder(selectedTenant.tenant, selectedTenant.poc)}
                className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
