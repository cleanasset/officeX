"use client";
import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

export default function VendorReviews() {
  const [reviews] = useState([
    { id: 1, client: "Rajesh Kumar (Apex)", rating: 5, date: "Aug 22, 2026", comment: "Superb execution on AC compressor overhaul. Highly responsive team." }
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reviews & Ratings Scorecard</h1>
        <p className="text-sm text-gray-600 font-bold mt-1">Review client feedback history and monitor your marketplace Trust Scorecards.</p>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="premium-card p-6 border border-gray-200 bg-white flex flex-col gap-3">
            <div className="flex justify-between items-start border-b border-gray-50 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Rating: {rev.rating}/5</h3>
                <span className="text-[10px] text-gray-600 font-bold block mt-0.5">Author: {rev.client} | {rev.date}</span>
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
