"use client";
import React, { useState } from "react";
import { MessageSquare, Send, User, Building, FileText, CheckCircle, ArrowLeft, Upload, Paperclip, MoreVertical, Search } from "lucide-react";
import Link from "next/link";

interface Message {
  id: number;
  sender: string;
  role: "Broker" | "Landlord" | "Tenant";
  text: string;
  time: string;
  isAttachment?: boolean;
  attachmentName?: string;
}

interface DealRoom {
  id: number;
  title: string;
  property: string;
  broker: string;
  landlord: string;
  tenant: string;
  lastMessage: string;
  unread: boolean;
  messages: Message[];
}

export default function ChatRoomsPage() {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([
    {
      id: 1,
      title: "InfyTech Hub Deal Room",
      property: "Apex Business Tower - Floor 4",
      broker: "Ravi Menon (Broker)",
      landlord: "Rajesh Kumar (Builder)",
      tenant: "Alok Gupta (Tenant)",
      lastMessage: "Lease agreement draft has been shared. Please review.",
      unread: true,
      messages: [
        { id: 1, sender: "Alok Gupta", role: "Tenant", text: "Hi team, we reviewed the Floor 4 layout. We need 4 additional executive cabins.", time: "10:30 AM" },
        { id: 2, sender: "Ravi Menon", role: "Broker", text: "Understand Alok. Rajesh, can the fit-out team accommodate 4 cabins on the west wing?", time: "10:45 AM" },
        { id: 3, sender: "Rajesh Kumar", role: "Landlord", text: "Yes, we can tweak the layout plan. I've instructed the architects. We will share the updated draft today.", time: "11:15 AM" },
        { id: 4, sender: "Ravi Menon", role: "Broker", text: "I've uploaded the draft LOI containing the revised commercial clauses. Please download below.", time: "11:30 AM" },
        { id: 5, sender: "Ravi Menon", role: "Broker", text: "LOI_Draft_InfyTech_Floor4.pdf", time: "11:32 AM", isAttachment: true, attachmentName: "LOI_Draft_InfyTech_Floor4.pdf" }
      ]
    },
    {
      id: 2,
      title: "Scalezix Solutions Deal Room",
      property: "Apex Brick Plaza - Floor 1",
      broker: "Ravi Menon (Broker)",
      landlord: "Rajesh Kumar (Builder)",
      tenant: "Jiya Patel (Tenant)",
      lastMessage: "Site inspection scheduled for tomorrow at 2:00 PM.",
      unread: false,
      messages: [
        { id: 1, sender: "Jiya Patel", role: "Tenant", text: "Looking forward to inspecting the brick plaza site tomorrow.", time: "Yesterday" },
        { id: 2, sender: "Ravi Menon", role: "Broker", text: "Excellent, the site supervisor has been notified. Rajesh will also join us.", time: "Yesterday" }
      ]
    },
    {
      id: 3,
      title: "RazorPay Ops Room",
      property: "Meridian Tech Park - Block B",
      broker: "Ravi Menon (Broker)",
      landlord: "Suresh Mehta (Builder)",
      tenant: "Harish Iyer (Tenant)",
      lastMessage: "Deal closed! Awaiting token deposit release.",
      unread: false,
      messages: [
        { id: 1, sender: "Harish Iyer", role: "Tenant", text: "Token payment initiated via Razorpay checkout.", time: "Aug 24" },
        { id: 2, sender: "Ravi Menon", role: "Broker", text: "Received and tracked. Welcome to Meridian Tech Park!", time: "Aug 24" }
      ]
    }
  ]);

  const [activeRoomId, setActiveRoomId] = useState(1);
  const [typedMessage, setTypedMessage] = useState("");
  const activeRoom = dealRooms.find(r => r.id === activeRoomId) || dealRooms[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "Ravi Menon", // Simulated logged-in Broker/User
      role: "Broker",
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDealRooms(dealRooms.map(room => {
      if (room.id === activeRoom.id) {
        return {
          ...room,
          lastMessage: typedMessage,
          messages: [...room.messages, newMsg]
        };
      }
      return room;
    }));

    setTypedMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden font-sans shadow-inner">
      
      {/* 1. Left Deal Rooms Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              <MessageSquare size={16} className="text-[#2563EB]" />
              Collaboration Rooms
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-extrabold">
              {dealRooms.length} Active
            </span>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search deal rooms..." 
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto">
            {dealRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex flex-col gap-1.5 cursor-pointer ${
                    isActive ? "bg-blue-50/40 border-l-4 border-l-[#2563EB]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-xs truncate max-w-[180px]">{room.title}</span>
                    {room.unread && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold truncate block">{room.property}</span>
                  <span className="text-[10px] text-gray-600 font-semibold truncate block mt-1">{room.lastMessage}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <Link href="/leasing/pipeline" className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Pipeline
          </Link>
        </div>
      </div>

      {/* 2. Main Chat Panel */}
      <div className="flex-1 bg-white flex flex-col justify-between">
        {/* Chat Room Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/40 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">{activeRoom.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-semibold">
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Tenant: {activeRoom.tenant.split(" ")[0]}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Landlord: {activeRoom.landlord.split(" ")[0]}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">Broker: {activeRoom.broker.split(" ")[0]}</span>
            </div>
          </div>
          <button className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Message Feeds */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]/40 flex flex-col gap-4">
          <div className="text-center my-3">
            <span className="px-2.5 py-1 rounded bg-gray-100 text-[10px] text-gray-400 font-extrabold tracking-wider uppercase">
              Secure Negotiation Room Live
            </span>
          </div>

          {activeRoom.messages.map((msg) => {
            const isMe = msg.sender === "Ravi Menon";
            const roleColors = {
              Broker: "bg-emerald-50 text-emerald-700 border-emerald-100",
              Landlord: "bg-amber-50 text-amber-700 border-amber-100",
              Tenant: "bg-blue-50 text-blue-700 border-blue-100"
            };

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[70%] gap-1 ${isMe ? "self-end items-end" : "self-start items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                  <span>{msg.sender}</span>
                  <span className={`px-1.5 py-0.2 rounded-full border text-[8px] uppercase tracking-wider ${roleColors[msg.role]}`}>
                    {msg.role}
                  </span>
                </div>

                {msg.isAttachment ? (
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-[10px]">{msg.attachmentName}</div>
                      <div className="text-[8px] text-gray-400 font-semibold mt-0.5">Click to preview document</div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3.5 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed border ${
                    isMe 
                      ? "bg-[#2563EB] text-white border-teal-600 rounded-tr-none" 
                      : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                )}
                <span className="text-[8px] text-gray-400 font-bold mt-0.5">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input Panel */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
          <button 
            type="button"
            onClick={() => alert("File attachment upload triggered.")}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Paperclip size={16} />
          </button>
          
          <input 
            type="text" 
            placeholder="Type your message to negotiation participants..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-teal-500 bg-gray-50/50"
          />

          <button 
            type="submit"
            className="p-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
