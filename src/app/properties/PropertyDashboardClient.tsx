"use client";
import React, { useState } from "react";
import { 
  Building, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  ClipboardList, 
  Users, 
  Plus, 
  X, 
  CheckCircle, 
  TrendingUp, 
  Handshake, 
  DollarSign,
  ArrowRight,
  Send
} from "lucide-react";
import Link from "next/link";

interface PropertyDashboardClientProps {
  initialProperties: any[];
  initialTickets: any[];
  initialCerts: any[];
  initialLogs: any[];
}

export default function PropertyDashboardClient({
  initialProperties,
  initialTickets,
  initialCerts,
  initialLogs
}: PropertyDashboardClientProps) {
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Form state
  const [assignPropertyId, setAssignPropertyId] = useState(initialProperties[0]?.id || "");
  const [assignBroker, setAssignBroker] = useState("Ravi Menon (Leasing Director)");
  const [commissionType, setCommissionType] = useState("1 Month Rent");
  const [commissionRate, setCommissionRate] = useState("8.33%");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mock list of registered brokers in the directory
  const brokerDirectory = [
    { name: "Ravi Menon", role: "Leasing Director", experience: "12 Yrs", activeDeals: 15, rating: "4.8/5" },
    { name: "Amit Kumar", role: "Commercial Partner", experience: "8 Yrs", activeDeals: 8, rating: "4.6/5" },
    { name: "Priya Sharma", role: "Co-working Specialist", experience: "6 Yrs", activeDeals: 12, rating: "4.7/5" }
  ];

  // Active & Pending partnerships
  const [partnerships, setPartnerships] = useState([
    { id: "BP-501", propertyName: "Apex Business Tower - Floor 4", brokerName: "Ravi Menon", commission: "1 Month Rent", status: "Active Partner", date: "Aug 20, 2026" },
    { id: "BP-502", propertyName: "Meridian Tech Park - Block B", brokerName: "Amit Kumar", commission: "5.0% Annual Value", status: "Awaiting Acceptance", date: "Aug 25, 2026" }
  ]);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProp = initialProperties.find(p => p.id === assignPropertyId) || { name: "Apex Business Tower - Floor 4" };
    
    const newP = {
      id: "BP-" + Math.floor(Math.random() * 900 + 100),
      propertyName: selectedProp.name,
      brokerName: assignBroker.split(" (")[0],
      commission: commissionType,
      status: "Awaiting Acceptance",
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    };

    setPartnerships([newP, ...partnerships]);
    setShowAssignModal(false);
    showToast(`Brokerage invite sent to ${newP.brokerName} for ${newP.propertyName}! Commission set to ${newP.commission}.`);

    // Write log to audit trial dynamically
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: `Broker Partnership proposal: ${newP.brokerName} | Commission: ${newP.commission}`,
        desiredSqft: "25000",
        budgetRange: "Agreement Sent"
      })
    });
  };

  // Calculate statistics
  const propertiesCount = initialProperties.length;
  const openTicketsCount = initialTickets.filter(t => t.status === "open").length;
  const expiredCertsCount = initialCerts.filter(c => c.status === "expired").length;

  return (
    <div className="flex flex-col gap-8 font-sans relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good Morning, Rajesh</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Manage your commercial real estate portfolio and leasing partnerships.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Handshake size={14} /> Assign Broker & Commission
          </button>
          <Link 
            href="/properties/registry?add=true" 
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm"
          >
            Add Property
          </Link>
        </div>
      </div>

      {/* BLOCK 1: KPI BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Properties */}
        <Link 
          href="/properties/registry" 
          className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white shadow-sm hover:border-[#8B5CF6]/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Properties</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-[#8B5CF6]">{propertiesCount}</div>
            <span className="text-[10px] text-green-600 font-bold mt-1 block">🟢 Active Portfolio</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform">
            <Building size={22} />
          </div>
        </Link>

        {/* Occupancy Rate */}
        <Link 
          href="/properties/rent-roll" 
          className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Occupancy</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-emerald-700">94.2%</div>
            <span className="text-[10px] text-green-600 font-bold mt-1 block">↑ 1.8% vs last month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp size={22} />
          </div>
        </Link>

        {/* Open Helpdesk Issues */}
        <Link 
          href="/ops" 
          className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Open Tickets</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2 group-hover:text-amber-700">{openTicketsCount}</div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">⚠ {openTicketsCount} open requests</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <AlertTriangle size={22} />
          </div>
        </Link>

        {/* Expired Compliance NOCs */}
        <Link 
          href="/properties/compliance" 
          className="premium-card p-6 border border-gray-200 flex items-center justify-between bg-white shadow-sm hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Expired NOCs</span>
            <div className="text-3xl font-extrabold text-red-600 mt-2 group-hover:text-red-700">{expiredCertsCount}</div>
            <span className="text-[10px] text-red-600 font-bold mt-1 block">✗ Renewal Required</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
            <ShieldCheck size={22} />
          </div>
        </Link>

      </div>

      {/* LEASING BROKER PARTNERSHIPS & COMMISSION AGREEMENTS LIST */}
      <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Handshake size={18} className="text-purple-600" />
            Leasing Broker Partnerships & Commission Agreements
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">
            {partnerships.length} Active Listings Contracts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4">Contract ID</th>
                <th className="py-4">Property Address</th>
                <th className="py-4">Assigned Broker</th>
                <th className="py-4">Brokerage Commission Terms</th>
                <th className="py-4">Status</th>
                <th className="py-4">Agreement Date</th>
              </tr>
            </thead>
            <tbody>
              {partnerships.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 text-xs hover:bg-purple-50/20 transition-colors">
                  <td className="py-4 font-mono font-bold text-purple-600">{p.id}</td>
                  <td className="py-4 font-bold text-gray-900">{p.propertyName}</td>
                  <td className="py-4 font-bold text-gray-800">{p.brokerName}</td>
                  <td className="py-4 text-emerald-600 font-extrabold">{p.commission}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      p.status.includes("Active")
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-amber-50 border border-amber-200 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400 font-semibold">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOCK 2: TWO-COLUMN ALERTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Critical Alerts */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-red-500" />
            Critical Compliance & Collections Alerts
          </h3>
          <div className="flex flex-col gap-4">
            {initialCerts.filter(c => c.status === "expired").map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-red-500 bg-red-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expired</div>
                  <div className="text-gray-500 font-semibold mt-1">Property: {initialProperties.find(p => p.id === cert.propertyId)?.name || "Apex Tower"}</div>
                </div>
                <Link href="/properties/compliance" className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[10px] uppercase shadow-sm hover:bg-red-700 transition-colors">
                  Renew Certificate
                </Link>
              </div>
            ))}
            
            {initialCerts.filter(c => c.status === "valid" && c.name.includes("Electrical")).map((cert, idx) => (
              <div key={idx} className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{cert.name} Expiring Soon</div>
                  <div className="text-gray-500 font-semibold mt-1">Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</div>
                </div>
                <span className="text-amber-600 font-extrabold">38 Days Left</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Timeline */}
        <div className="premium-card p-6 border border-gray-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ClipboardList size={18} className="text-purple-600" />
            Security & Audit Activity Logs
          </h3>
          <div className="flex flex-col gap-5 relative border-l border-gray-100 pl-6 ml-3">
            {initialLogs.slice(0, 4).map((log, idx) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[31px] w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white"></span>
                <div className="flex justify-between items-center text-gray-400 font-semibold">
                  <span>{new Date(log.createdAt || "").toLocaleDateString()}</span>
                  <span>{log.traceId}</span>
                </div>
                <p className="font-bold text-gray-800 mt-1">{log.action}</p>
                <div className="text-[10px] text-gray-500 font-bold mt-0.5">IP: {log.ipAddress} | Module: {log.module}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ===== ASSIGN LEASING BROKER MODAL ===== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateAssignment}
            className="bg-white rounded-2xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl border border-gray-100 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase">Lease Commissions Brokerage</span>
                <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Assign Leasing Broker</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Listed Property</label>
                <select 
                  value={assignPropertyId}
                  onChange={(e) => setAssignPropertyId(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                >
                  {initialProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Verified Broker partner</label>
                <select 
                  value={assignBroker}
                  onChange={(e) => setAssignBroker(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                >
                  {brokerDirectory.map((b, i) => (
                    <option key={i} value={`${b.name} (${b.role})`}>
                      {b.name} - {b.role} (Rating: {b.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Commission Model</label>
                  <select 
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="1 Month Rent">1 Month Rent Value</option>
                    <option value="2.0% Sale Value">2.0% Total Contract</option>
                    <option value="5.0% Lease Value">5.0% Annual Value</option>
                    <option value="Flat Fee ₹1L">Flat Fee ₹1,00,000</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Commission Rate</label>
                  <input 
                    type="text" 
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                Assigning a broker binds this specific listing to the broker directory, attaching their contact cards to public search views.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send size={13} /> Send Assignment Proposal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
