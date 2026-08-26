"use client";
import React, { useState } from "react";
import { Star, MessageSquare, X, Send, CheckCircle, ThumbsUp, Award, TrendingUp } from "lucide-react";

export default function VendorReviews() {
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [reviews, setReviews] = useState([
    {
      id: 1,
      client: "Rajesh Kumar",
      org: "Apex Business Tower (Property Manager)",
      workOrder: "WO-801: HVAC Chiller Overhaul",
      rating: 5,
      date: "Aug 22, 2026",
      comment: "Superb execution on our chiller maintenance. Tech arrived on time at 9 AM sharp and resolved the vibration issue within 4 hours. Pressure tested successfully and BMS sensor recalibrated perfectly.",
      categories: { quality: 5, punctuality: 5, communication: 4.5, safety: 5 },
      replied: false,
      reply: ""
    },
    {
      id: 2,
      client: "Vijay Dev",
      org: "Meridian Tech Park (Facility Manager)",
      workOrder: "WO-802: Weekly Deep Cleaning",
      rating: 4,
      date: "Aug 25, 2026",
      comment: "Good overall housekeeping job. Floor scrubbing was thorough and washrooms were spotless. Minor feedback — glass facade cleaning could have been more meticulous on higher floors.",
      categories: { quality: 4, punctuality: 5, communication: 4, safety: 4 },
      replied: false,
      reply: ""
    },
    {
      id: 3,
      client: "Nexus Management",
      org: "Nexus Hub, Pune",
      workOrder: "WO-803: DG Set B-Check",
      rating: 5,
      date: "Aug 20, 2026",
      comment: "Exceptional electrical work. The team completed transformer oil filtration and relay testing ahead of schedule. Very professional and safety-conscious. Highly recommended for HT electrical AMC.",
      categories: { quality: 5, punctuality: 5, communication: 5, safety: 5 },
      replied: true,
      reply: "Thank you for the kind words. We take safety and timeliness very seriously. Looking forward to the annual AMC renewal."
    }
  ]);

  const handleSubmitReply = (reviewId: number) => {
    if (!replyText.trim()) return;
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, replied: true, reply: replyText } : r));
    showToast("Professional response posted to client review successfully!");
    setReplyText("");
    setSelectedReview(null);
  };

  // Calculate averages
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const totalJobs = reviews.length;

  return (
    <div className="flex flex-col gap-8 font-sans relative">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reviews & Trust Scorecard</h1>
        <p className="text-sm text-gray-600 font-semibold mt-1">Client feedback history, category-wise ratings, and your marketplace trust score. Click any review to respond.</p>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <Star size={24} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-amber-600 font-bold uppercase block">Avg. Rating</span>
            <span className="text-2xl font-extrabold text-gray-900">{avgRating}/5</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <ThumbsUp size={24} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">Client Satisfaction</span>
            <span className="text-2xl font-extrabold text-gray-900">100%</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Award size={24} />
          </div>
          <div>
            <span className="text-[10px] text-blue-600 font-bold uppercase block">Total Jobs Rated</span>
            <span className="text-2xl font-extrabold text-gray-900">{totalJobs}</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[10px] text-purple-600 font-bold uppercase block">Trust Tier</span>
            <span className="text-xl font-extrabold text-gray-900">⭐ Gold</span>
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div className="flex flex-col gap-5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            onClick={() => { setSelectedReview(rev); setReplyText(""); }}
            className="premium-card p-6 border border-gray-200 bg-white hover:border-amber-300 hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-100 shrink-0">
                  {rev.client.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-700">{rev.client}</h3>
                  <span className="text-[10px] text-gray-500 font-semibold block">{rev.org}</span>
                  <span className="text-[10px] text-gray-400 font-medium block mt-0.5">📋 {rev.workOrder} • {rev.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                ))}
                <span className="text-xs font-extrabold text-gray-900 ml-1">{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs text-gray-700 italic leading-relaxed flex items-start gap-2 font-medium">
              <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
              &ldquo;{rev.comment}&rdquo;
            </p>

            {/* Category-wise Mini Bars */}
            <div className="grid grid-cols-4 gap-3 mt-4 text-[10px] font-bold text-gray-500 uppercase">
              {Object.entries(rev.categories).map(([cat, val]) => (
                <div key={cat} className="flex flex-col gap-1">
                  <span className="truncate">{cat}</span>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${((val as number) / 5) * 100}%` }} />
                    </div>
                    <span className="text-gray-700">{val as number}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Existing Reply */}
            {rev.replied && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-gray-700 font-medium">
                <span className="text-[9px] text-emerald-600 font-bold uppercase block mb-1">Your Response</span>
                &ldquo;{rev.reply}&rdquo;
              </div>
            )}

            {!rev.replied && (
              <div className="mt-3 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                💬 Click to respond to this review →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== REVIEW DETAIL & REPLY DRAWER ===== */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-7 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Client Review #{selectedReview.id}</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Review from {selectedReview.client}</h3>
                  <span className="text-[11px] text-gray-500 font-semibold">{selectedReview.org}</span>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rating */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} className={i < selectedReview.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                  ))}
                </div>
                <span className="font-extrabold text-gray-900 text-lg">{selectedReview.rating}.0 / 5.0</span>
              </div>

              {/* Work Order Reference */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Work Order Reference</span>
                <span className="font-bold text-gray-900">{selectedReview.workOrder}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Reviewed on: {selectedReview.date}</span>
              </div>

              {/* Full Comment */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Client Feedback</span>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-medium italic leading-relaxed">
                  &ldquo;{selectedReview.comment}&rdquo;
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Category-wise Breakdown</span>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(selectedReview.categories).map(([cat, val]) => (
                    <div key={cat} className="flex items-center gap-3 text-xs">
                      <span className="w-28 text-gray-600 font-bold capitalize">{cat}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${((val as number) / 5) * 100}%` }} />
                      </div>
                      <span className="font-extrabold text-gray-900 w-8 text-right">{val as number}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Reply */}
              {selectedReview.replied && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Your Published Response</span>
                  <p className="text-gray-700 font-medium italic">&ldquo;{selectedReview.reply}&rdquo;</p>
                </div>
              )}

              {/* Reply Form */}
              {!selectedReview.replied && (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <span className="text-xs font-bold text-gray-900">Compose Professional Response</span>
                  <textarea
                    rows={3}
                    placeholder="e.g. Thank you for the feedback. We strive for excellence in all our service deliveries..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none font-medium"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3 mt-4">
              {!selectedReview.replied && (
                <button
                  onClick={() => handleSubmitReply(selectedReview.id)}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Publish Response
                </button>
              )}
              <button
                onClick={() => setSelectedReview(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
