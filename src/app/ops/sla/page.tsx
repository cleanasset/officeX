"use client";
import React, { useState } from "react";
import { Clock, ShieldAlert, Plus, X, AlertTriangle, CheckCircle, Bell, ArrowRight } from "lucide-react";

export default function OperationsSLA() {
  const [slas, setSlas] = useState([
    { id: 1, ticket: "AC leak - Suite 401", targetResponse: "30 Mins", actualResponse: "12 Mins", targetResolution: "4 Hours", actualResolution: "2.5 Hours", status: "Met", property: "Apex Business Tower", rootCause: "Drain pan condensation blockage cleared by technician." },
    { id: 2, ticket: "Server Room Temp Alert", targetResponse: "15 Mins", actualResponse: "22 Mins", targetResolution: "2 Hours", actualResolution: "3 Hours", status: "Breached", property: "Meridian Tech Park", rootCause: "Secondary PAC unit solenoid valve failure. Replaced under emergency SLA." },
    { id: 3, ticket: "Main Entrance Elevator 2 Entrapment", targetResponse: "10 Mins", actualResponse: "8 Mins", targetResolution: "1 Hour", actualResolution: "45 Mins", status: "Met", property: "Nexus Hub", rootCause: "Door sill interlock dust obstruction cleaned and reset." }
  ]);

  const [selectedSLA, setSelectedSLA] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    ticket: "",
    property: "Apex Business Tower",
    targetResponse: "30 Mins",
    actualResponse: "15 Mins",
    targetResolution: "4 Hours",
    actualResolution: "2 Hours",
    rootCause: ""
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ticket) {
      alert("Please fill ticket description");
      return;
    }
    const isMet = parseInt(form.actualResponse) <= parseInt(form.targetResponse);
    const newS = {
      id: slas.length + 1,
      ticket: form.ticket,
      property: form.property,
      targetResponse: form.targetResponse,
      actualResponse: form.actualResponse,
      targetResolution: form.targetResolution,
      actualResolution: form.actualResolution,
      status: isMet ? "Met" : "Breached",
      rootCause: form.rootCause || "Standard maintenance resolution log."
    };
    setSlas([...slas, newS]);
    setIsAdding(false);
    setForm({ ticket: "", property: "Apex Business Tower", targetResponse: "30 Mins", actualResponse: "15 Mins", targetResolution: "4 Hours", actualResolution: "2 Hours", rootCause: "" });
    showToast(`SLA tracking log for "${newS.ticket}" created!`);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <Bell size={16} className="text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SLA Performance Monitor</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Audit ticket response timings, resolution deadlines, and breach events logs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Log SLA Incident
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Ticket Description</th>
              <th className="py-4">Property</th>
              <th className="py-4">Target Response</th>
              <th className="py-4">Actual Response</th>
              <th className="py-4">Target Resolution</th>
              <th className="py-4">Actual Resolution</th>
              <th className="py-4">SLA Compliance</th>
            </tr>
          </thead>
          <tbody>
            {slas.map((s) => (
              <tr 
                key={s.id} 
                onClick={() => setSelectedSLA(s)}
                className="border-b border-gray-200 text-xs hover:bg-amber-50/20 cursor-pointer transition-colors"
              >
                <td className="py-4 font-bold text-gray-900 flex items-center gap-2 hover:text-amber-600 hover:underline">
                  <Clock size={14} className="text-amber-600" />
                  {s.ticket}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{s.property}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.targetResponse}</td>
                <td className="py-4 text-gray-900 font-bold">{s.actualResponse}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.targetResolution}</td>
                <td className="py-4 text-gray-900 font-bold">{s.actualResolution}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                    s.status === "Met" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SLA Incident Analysis Drawer */}
      {selectedSLA && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                    selectedSLA.status === "Met" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    SLA {selectedSLA.status}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-1">{selectedSLA.ticket}</h3>
                </div>
                <button 
                  onClick={() => setSelectedSLA(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Building Asset</span>
                  <span className="font-bold text-gray-900">{selectedSLA.property}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Response Window</span>
                    <span className="font-bold text-gray-900">Target: {selectedSLA.targetResponse}</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 block mt-1">Actual: {selectedSLA.actualResponse}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Resolution Window</span>
                    <span className="font-bold text-gray-900">Target: {selectedSLA.targetResolution}</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 block mt-1">Actual: {selectedSLA.actualResolution}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Incident Root Cause & Action</span>
                  <p className="text-gray-800 leading-relaxed font-medium mt-1">{selectedSLA.rootCause}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  showToast(`Exported RCA incident report for ${selectedSLA.ticket}`);
                  setSelectedSLA(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Export Incident RCA Report
              </button>
              <button 
                onClick={() => setSelectedSLA(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Incident Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleAdd}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Log SLA Audit Incident</h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Incident / Ticket Description</label>
                <input 
                  type="text"
                  placeholder="e.g. DG Set Auto-Start Failure during grid fluctuation"
                  value={form.ticket}
                  onChange={(e) => setForm({ ...form, ticket: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Building Asset</label>
                  <select 
                    value={form.property}
                    onChange={(e) => setForm({ ...form, property: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Apex Business Tower">Apex Business Tower</option>
                    <option value="Meridian Tech Park">Meridian Tech Park</option>
                    <option value="Nexus Hub">Nexus Hub</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Actual Response (Mins)</label>
                  <input 
                    type="text"
                    value={form.actualResponse}
                    onChange={(e) => setForm({ ...form, actualResponse: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Resolution / RCA Findings</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Relay switch reset and load verified."
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Log SLA Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
