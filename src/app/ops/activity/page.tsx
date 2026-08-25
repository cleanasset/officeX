"use client";
import React, { useState } from "react";
import { ClipboardList, Plus, FileText } from "lucide-react";

export default function OperationsActivity() {
  const [logs] = useState([
    { id: 1, text: "HVAC condenser coil cleaned at Apex Business Tower.", loggedBy: "Sanjay Kumar", time: "10:30 AM" },
    { id: 2, text: "Elevator safety brake shoe adjusted on Lift 2.", loggedBy: "Vikram Shah", time: "12:15 PM" }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Activity Logger</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Audit daily facility operations activity entries and technician log checklists.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center gap-2">
          <Plus size={14} /> Log Activity
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {logs.map((log) => (
          <div key={log.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-3">
            <div className="flex justify-between items-start border-b border-gray-50 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-600" />
                  {log.loggedBy}
                </h3>
                <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Logged at: {log.time}</span>
              </div>
            </div>
            <p className="text-xs text-gray-700 font-semibold">{log.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
