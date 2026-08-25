"use client";
import React, { useState } from "react";
import { DollarSign, ShieldCheck } from "lucide-react";

export default function TenantPayments() {
  const [billAmount] = useState("₹20,35,000");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pay Rent Portal</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Pay outstanding monthly rentals and check past transaction receipt records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-5 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-900">Outstanding Rental Dues</h3>
          <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-600 font-bold uppercase tracking-wider block">Due Date: Sep 05, 2026</span>
              <span className="text-3xl font-extrabold text-purple-600 block mt-2">{billAmount}</span>
            </div>
            <button className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-colors">
              Pay Now via Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
