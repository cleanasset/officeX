"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Settings, Home, LayoutDashboard, Briefcase, FileText, Users, DollarSign, LogOut, ChevronRight, Building } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo-removebg-preview.png" 
              alt="OfficeX Logo" 
              width={32} 
              height={32} 
              className="object-contain filter brightness-0 invert"
              style={{ width: "auto", height: "24px" }}
            />
            <Image 
              src="/name-removebg-preview.png" 
              alt="OfficeX" 
              width={100} 
              height={24} 
              className="object-contain filter brightness-0 invert"
              style={{ width: "auto", height: "18px" }}
            />
          </Link>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 mt-2">Menu</div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400 font-semibold text-sm">
              <LayoutDashboard size={18} /> Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm">
              <Building size={18} /> Portfolio
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm">
              <Briefcase size={18} /> Leasing
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm">
              <Users size={18} /> Tenants
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm">
              <FileText size={18} /> Work Orders
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm">
              <DollarSign size={18} /> Financials
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-sm w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-slate-800">Welcome back, Admin</h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Subscription Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm ml-2">
              A
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
          
          {/* Mockup Image Display based on provided design */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Complete Portfolio Dashboard</h2>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View Reports <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 overflow-hidden mb-8">
              <Image 
                src="/images/features/OfficeX - Complete Portfolio Dashboard.jpg" 
                alt="Dashboard Mockup" 
                width={1600} 
                height={900} 
                className="w-full h-auto rounded-xl border border-slate-100"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <div className="text-sm font-bold text-slate-500 mb-2">Total Managed Area</div>
                 <div className="text-3xl font-black text-slate-800">4.2M sqft</div>
                 <div className="text-xs font-semibold text-green-600 mt-2 flex items-center gap-1">
                   ↑ 12% from last quarter
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <div className="text-sm font-bold text-slate-500 mb-2">Average Occupancy</div>
                 <div className="text-3xl font-black text-slate-800">92.4%</div>
                 <div className="text-xs font-semibold text-green-600 mt-2 flex items-center gap-1">
                   ↑ 2.1% from last quarter
                 </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <div className="text-sm font-bold text-slate-500 mb-2">Active Work Orders</div>
                 <div className="text-3xl font-black text-slate-800">148</div>
                 <div className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
                   42 High Priority
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
