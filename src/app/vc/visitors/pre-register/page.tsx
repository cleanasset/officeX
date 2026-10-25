"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  QrCode,
  Calendar,
  Building,
  Car,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Send,
  Copy,
  Printer,
  ChevronLeft,
} from "lucide-react";

export default function VisitorPreRegistrationPage() {
  const router = useRouter();

  // Form state
  const [visitorName, setVisitorName] = useState("");
  const [company, setCompany] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [visitorType, setVisitorType] = useState("guest");
  const [hostName, setHostName] = useState("Arun Jaitley (Director)");
  const [tenantName, setTenantName] = useState("TechCorp Solutions Ltd");
  const [purpose, setPurpose] = useState("Commercial Advisory Review");
  const [visitDate, setVisitDate] = useState("2026-10-26");
  const [visitTime, setVisitTime] = useState("10:00");
  const [vehicleNo, setVehicleNo] = useState("");
  const [zone, setZone] = useState("Floor 8 East Wing");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPass, setCreatedPass] = useState<{
    passNumber: string;
    qrToken: string;
    visitorName: string;
    hostName: string;
    validDate: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate simulated pass
      const passNum = `PASS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrToken = `QR_${visitorType.toUpperCase()}_${passNum}`;

      setTimeout(() => {
        setCreatedPass({
          passNumber: passNum,
          qrToken,
          visitorName,
          hostName,
          validDate: `${visitDate} at ${visitTime}`,
        });
        setIsSubmitting(false);
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/vc/dashboard" className="hover:text-blue-400">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Pre-Registration (VC-02)</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Pre-Register Commercial Visitor</h1>
          <p className="text-xs text-slate-400">
            Issue touchless QR speed-gate invitations to scheduled guests, clients, and contractors.
          </p>
        </div>

        <Link
          href="/vc/visitors/live"
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>View Live Inside</span>
        </Link>
      </div>

      {!createdPass ? (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Section 1: Guest Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-extrabold text-white">1. Visitor Identity & Contact</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Kashyap"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bain & Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mobile Number (for SMS QR Link) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 22334"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="shalini@bain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Visitor Type Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Visitor Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "guest", label: "Business Guest" },
                  { id: "client", label: "Corporate Client" },
                  { id: "interview", label: "Candidate" },
                  { id: "contractor", label: "Contractor / Vendor" },
                  { id: "vip", label: "VIP Dignitary" },
                  { id: "delivery", label: "Courier / Delivery" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setVisitorType(type.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      visitorType === type.id
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Host & Logistics */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Building className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">2. Host, Tenant & Location</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Host Person *
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tenant Company *
                </label>
                <input
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Scheduled Date & Time *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="time"
                    required
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Authorized Access Zone
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Floor 8 East Wing">Tower 1 • Floor 8 East Wing</option>
                  <option value="Floor 4 FinTech Core">Tower 1 • Floor 4 FinTech Core</option>
                  <option value="Boardroom Suite">Ground Floor • Executive Boardroom</option>
                  <option value="Service Core">Basement & Service Core (Contractor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vehicle Registration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL 01 AB 1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Meeting Purpose
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automatic watchlist screening will be conducted</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {isSubmitting ? (
                <span>Generating Digital QR Pass...</span>
              ) : (
                <>
                  <span>Create Pre-Registration Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* PASS GENERATED SUCCESS STATE */
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Digital Pass Issued Successfully!</h2>
            <p className="text-xs text-slate-400">
              Invitation QR link has been dispatched to {mobile || email}.
            </p>
          </div>

          {/* Pass Preview Card */}
          <div className="max-w-sm mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-400">{createdPass.passNumber}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                PRE-APPROVED
              </span>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-base font-bold text-white">{createdPass.visitorName}</div>
              <div className="text-xs text-slate-400">Visiting: {createdPass.hostName}</div>
              <div className="text-[11px] text-blue-400 font-medium">Valid: {createdPass.validDate}</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`https://officex.ai/pass/${createdPass.qrToken}`);
                alert("Pass link copied to clipboard!");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Pass Link</span>
            </button>

            <button
              type="button"
              onClick={() => setCreatedPass(null)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Another Guest</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
