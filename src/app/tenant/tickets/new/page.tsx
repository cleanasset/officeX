"use client";
import React, { useState } from "react";
import { PlusCircle, ArrowRight } from "lucide-react";

export default function RaiseTicket() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [desc, setDesc] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Support ticket successfully raised! Operations team has been notified.");
    setTitle("");
    setDesc("");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">File Helpdesk Ticket</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Submit support tickets for physical failures or operational assistance inside your suite.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs">
          ✔ {message}
        </div>
      )}

      <div className="premium-card p-6 border border-gray-200 bg-white max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Issue Title</label>
            <input 
              type="text" 
              placeholder="e.g. AC cooling failure in conference room" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-xs bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-xs bg-white"
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>HVAC / AC</option>
              <option>Housekeeping</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Description</label>
            <textarea 
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-600 text-xs bg-white resize-none"
              placeholder="Detailed description of physical issues..."
            />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2">
            Submit Support Request <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
