"use client";
import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

export default function RatingsPage() {
  const [reviews] = useState([
    { id: 1, vendor: "TechServe Solutions", reviewer: "Rajesh Kumar (Apex)", rating: 5, comment: "Excellent HVAC chiller service. On time and clean work." },
    { id: 2, vendor: "SafeGuard Services", reviewer: "Rajesh Kumar (Apex)", rating: 4, comment: "Security guard deployment was prompt, minor shift replacement delay." }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketplace Ratings & Feedbacks</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Monitor vendor reviews logs and track aggregated Trust Scorecards.</p>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-3">
            <div className="flex justify-between items-start border-b border-gray-50 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{rev.vendor}</h3>
                <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Rated by: {rev.reviewer}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-700 italic flex items-start gap-2">
              <MessageSquare size={14} className="text-gray-600 shrink-0 mt-0.5" />
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
