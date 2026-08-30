"use client";
import React, { useState } from "react";
import { Filter, X, Send, FileText, CheckCircle, Clock, AlertTriangle, MessageCircle, Paperclip } from "lucide-react";

export default function HelpdeskTicketsTracker() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>("TK-245");
  const [message, setMessage] = useState("");

  const tickets = [
    {
      id: "TK-245", status: "IN PROGRESS", statusColor: "bg-blue-500", priority: "CRITICAL", priorityColor: "bg-red-100 text-red-600",
      title: "Server Room AC Failure", category: "HVAC", raised: "Oct 24, 09:30 AM",
      responseSla: { label: "Met in 12 mins", color: "text-emerald-600", progress: 100 },
      resolutionSla: { label: "3h remaining", color: "text-amber-600", progress: 60 }
    },
    {
      id: "TK-244", status: "OPEN", statusColor: "bg-emerald-500", priority: "HIGH", priorityColor: "bg-amber-100 text-amber-600",
      title: "Intermittent WiFi in Boardroom", category: "IT", raised: "Oct 24, 11:15 AM",
      responseSla: { label: "10m remaining", color: "text-amber-600", progress: 30 },
      resolutionSla: { label: "Pending Response", color: "text-gray-400", progress: 0 }
    },
    {
      id: "TK-242", status: "RESOLVED", statusColor: "bg-gray-400", priority: "MEDIUM", priorityColor: "bg-blue-100 text-blue-600",
      title: "Flickering Lights on Floor 4", category: "Electrical", raised: "Oct 23, 02:00 PM",
      responseSla: { label: "Met in 5 mins", color: "text-emerald-600", progress: 100 },
      resolutionSla: { label: "Met in 4 hours", color: "text-emerald-600", progress: 100 }
    }
  ];

  const chatMessages = [
    { sender: "John Doe (Tenant)", time: "09:30 AM", message: "The primary AC unit in Server Room B has failed. Temperature is rising steadily above 78F. This is critical for the server racks. Need immediate assistance.", attachment: "error_panel.jpg", isUser: true },
    { sender: "Cooling Pros (Vendor)", time: "09:42 AM", message: "Received. Dispatching a technician immediately. ETA is 25 minutes. Please ensure someone is available to grant access to Server Room B.", isUser: false },
    { sender: "John Doe (Tenant)", time: "09:45 AM", message: "Security has been notified. They will let you up to Floor 4.", isUser: true }
  ];

  const selected = tickets.find((t) => t.id === selectedTicket);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Raised</p>
            <p className="text-3xl font-black text-gray-900">12</p>
          </div>
          <FileText size={20} className="text-gray-300" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open</p>
            <p className="text-3xl font-black text-gray-900">2</p>
          </div>
          <AlertTriangle size={20} className="text-red-300" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-black text-gray-900">1</p>
          </div>
          <Clock size={20} className="text-amber-300" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolved</p>
            <p className="text-3xl font-black text-gray-900">1</p>
          </div>
          <CheckCircle size={20} className="text-emerald-300" />
        </div>
      </div>

      {/* Active Tickets + Chat Drawer */}
      <div className="grid grid-cols-[1fr_400px] gap-0">
        {/* Ticket List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Active Tickets</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">
              <Filter size={13} /> Filter
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t.id)}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                  selectedTicket === t.id ? "border-[#0F8B7D] shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      t.priority === "CRITICAL" ? "bg-red-100" : t.priority === "HIGH" ? "bg-amber-100" : "bg-blue-100"
                    }`}>
                      <AlertTriangle size={14} className={t.priority === "CRITICAL" ? "text-red-500" : t.priority === "HIGH" ? "text-amber-500" : "text-blue-500"} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${t.statusColor}`}>{t.status}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.priorityColor}`}>{t.priority}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{t.title}</p>
                      <p className="text-[10px] text-gray-400">Category: {t.category} • Raised: {t.raised}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-[10px] text-gray-400">Response SLA</span>
                      <span className={`text-[10px] font-bold ml-2 ${t.responseSla.color}`}>{t.responseSla.label}</span>
                    </div>
                    <div className="w-32 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${t.responseSla.progress === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${t.responseSla.progress}%` }} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Resolution SLA</span>
                      <span className={`text-[10px] font-bold ml-2 ${t.resolutionSla.color}`}>{t.resolutionSla.label}</span>
                    </div>
                    <div className="w-32 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${t.resolutionSla.progress === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${t.resolutionSla.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Drawer */}
        {selected && (
          <div className="bg-white border-l border-gray-200 flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{selected.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${selected.statusColor}`}>{selected.status}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 mt-1">{selected.title}</p>
                <p className="text-[10px] text-gray-400">{selected.category} • Raised {selected.raised}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex items-center gap-2 mb-1 ${msg.isUser ? "justify-between" : ""}`}>
                    {!msg.isUser && (
                      <div className="w-6 h-6 rounded-full bg-[#0F8B7D] flex items-center justify-center text-white text-[10px] font-bold">V</div>
                    )}
                    <span className="text-[10px] font-bold text-gray-700">{msg.sender}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.isUser && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[10px] font-bold">U</div>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${msg.isUser ? "bg-gray-100 text-gray-700" : "bg-teal-50 text-gray-700"}`}>
                    {msg.message}
                    {msg.attachment && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200 w-fit">
                        <Paperclip size={10} /> {msg.attachment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center">
                <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Ticket Assigned</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">📍 Technician On-Site</span>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message to the vendor..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0F8B7D]"
                />
                <button className="w-9 h-9 rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center cursor-pointer">
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Reopen Ticket</button>
              <button className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                <CheckCircle size={13} /> Mark as Resolved
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
