"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Clock, Plus, CheckCircle2 } from "lucide-react";

export default function TicketTracker() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("officex_tenant_tickets") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        setTickets(stored);
        return;
      }
    } catch {
      // fallback
    }

    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        } else {
          setTickets([]);
        }
      })
      .catch(() => setTickets([]));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h1>
          <p className="text-xs text-gray-500 mt-0.5">Monitor status updates, dispatches progress, and resolution notes for raised tickets.</p>
        </div>
        <Link
          href="/tenant/tickets/new"
          className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} /> Raise Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No Support Tickets</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            You do not have any open or in-progress maintenance or facility tickets.
          </p>
          <Link
            href="/tenant/tickets/new"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0F8B7D] hover:bg-[#0D7A6E] px-4 py-2.5 rounded-xl shadow-xs"
          >
            <Plus size={14} /> Raise New Ticket
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="p-6 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between min-h-[160px] shadow-xs">
              <div>
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <ClipboardList size={16} className="text-teal-600" />
                      {t.title}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Category: {t.category || "General"}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider border border-teal-200">
                    {t.status || "Open"}
                  </span>
                </div>
                <div className="text-xs text-gray-600 font-medium flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" /> Raised On: {t.created || t.raised || "Recently"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
