"use client";
import React, { useState } from "react";
import { Star, Download, ShieldCheck, Zap, Award, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

export default function VendorReviewsAndRatings() {
  const [filter, setFilter] = useState("All Ratings");
  const [sort, setSort] = useState("Newest First");

  const reviews = [
    {
      id: "WO-045",
      avatar: "AC",
      avatarBg: "bg-blue-100 text-blue-700",
      company: "Apex Corporation",
      date: "Oct 12, 2023",
      rating: 5,
      comment: "Excellent electrical repair service. The team arrived on time, diagnosed the issue quickly, and completed the rewiring with minimal disruption to our office floor. Highly professional and left the area spotless."
    },
    {
      id: "WO-032",
      avatar: "TP",
      avatarBg: "bg-emerald-100 text-emerald-700",
      company: "TechPark Hub",
      date: "Sep 28, 2023",
      rating: 4,
      comment: "Good plumbing maintenance overall. They fixed the primary leak in the main restroom block. Slightly delayed response to the initial ticket, but execution was solid once they arrived."
    },
    {
      id: "WO-028",
      avatar: "GV",
      avatarBg: "bg-purple-100 text-purple-700",
      company: "Global Ventures",
      date: "Sep 15, 2023",
      rating: 5,
      comment: "HVAC installation was flawless. The crew coordinated perfectly with our facility manager and ensured all safety protocols were met. The system has been running perfectly since."
    },
    {
      id: "WO-021",
      avatar: "NS",
      avatarBg: "bg-amber-100 text-amber-700",
      company: "Nexus Solutions",
      date: "Aug 30, 2023",
      rating: 4.5,
      comment: "Painting and drywall repair was done to a high standard. They managed to match the existing texture perfectly. Deducting half a star only because cleanup took a bit longer than expected, but the final result is great."
    },
    {
      id: "WO-018",
      avatar: "ML",
      avatarBg: "bg-teal-100 text-teal-700",
      company: "Meridian Logistics",
      date: "Aug 12, 2023",
      rating: 5,
      comment: "Emergency lock replacement handled swiftly during off-hours. Extremely satisfied with their rapid response time and clear communication throughout the process."
    },
    {
      id: "WO-012",
      avatar: "CR",
      avatarBg: "bg-rose-100 text-rose-700",
      company: "Crest Retailers",
      date: "Jul 05, 2023",
      rating: 4,
      comment: "Deep cleaning services for our retail floor. The standard was acceptable, but they missed a few spots behind the main displays. We discussed this with the supervisor who promised better attention next time."
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reviews & Ratings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your vendor reputation and client feedback.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Main Grid: Left Metric Sidebar + Right Feedback Feed */}
      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* Left Scorecard Sidebar */}
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Score</p>
            <div className="text-5xl font-black text-gray-900 mt-2">
              4.4<span className="text-xl text-gray-400 font-normal">/5.0</span>
            </div>
            <div className="flex justify-center gap-1 text-amber-400 mt-2 mb-1">
              {"★★★★☆"}
            </div>
            <p className="text-xs text-gray-500">Based on 128 verified work orders</p>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Performance Metrics</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Work Quality</span>
                  <span className="text-gray-900 font-bold">90%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "90%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Timeliness</span>
                  <span className="text-gray-900 font-bold">85%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">SLA compliance</span>
                  <span className="text-gray-900 font-bold">92%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Responsiveness</span>
                  <span className="text-gray-900 font-bold">80%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-gray-700">Professionalism</span>
                  <span className="text-gray-900 font-bold">88%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#0F8B7D] rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Achievements</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-bold text-amber-900">
              <Award size={18} className="text-amber-500" /> Gold Vendor
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs font-bold text-teal-900">
              <Zap size={18} className="text-[#0F8B7D]" /> SLA Met 95%+
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs font-bold text-blue-900">
              <ShieldCheck size={18} className="text-blue-500" /> Escrow Verified
            </div>
          </div>
        </div>

        {/* Right Feedback Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Feedback</h2>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
              >
                <option>All Ratings</option>
                <option>5 Stars</option>
                <option>4 Stars & above</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
              >
                <option>Newest First</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${r.avatarBg}`}>
                      {r.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{r.company}</h4>
                      <p className="text-[11px] text-gray-400">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-amber-400 text-xs">
                    {"★".repeat(Math.floor(r.rating))}
                    {r.rating % 1 !== 0 ? "★" : ""}
                    {"☆".repeat(5 - Math.ceil(r.rating))}
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-mono flex items-center gap-1">
                    🔗 Work Order: {r.id}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination & Raise Dispute Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">2</button>
              <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center hover:bg-gray-50">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <ChevronRight size={14} />
              </button>
            </div>

            <button className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
              <AlertCircle size={14} className="text-gray-400" /> Raise Dispute to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
