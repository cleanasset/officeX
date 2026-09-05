"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Building2, 
  ArrowRight,
  Sparkles,
  Zap,
  Check
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  billingPeriod?: string;
  serviceTitle: string;
  targetDashboardUrl: string;
  features?: string[];
}

export default function PaymentModal({
  isOpen,
  onClose,
  planName,
  price,
  billingPeriod = "month",
  serviceTitle,
  targetDashboardUrl,
  features = []
}: PaymentModalProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !companyName) return;

    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onClose();
        router.push(targetDashboardUrl);
      }, 1600);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-scaleUp">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#071324] to-[#0B1E38] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F8B7D]/20 text-[#2dd4bf] text-[10px] font-black tracking-wider uppercase border border-[#0F8B7D]/40 mb-2">
            <Zap size={11} className="fill-current" />
            <span>Instant Dashboard Access</span>
          </div>
          <h3 className="text-xl font-black text-white">{planName}</h3>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{serviceTitle}</p>
          
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{price}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {billingPeriod}</span>
          </div>
        </div>

        {/* Success Screen */}
        {status === "success" ? (
          <div className="p-8 text-center flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D] mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-black text-slate-900">Payment Successful!</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Your account has been activated. Redirecting to your dashboard...
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#0F8B7D]">
              <div className="w-4 h-4 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
              <span>Launching Workspace...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-4">
            
            {features.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Included Capabilities</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check size={13} className="text-[#0F8B7D] shrink-0 stroke-[3]" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Company / Organization</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Commercial Real Estate"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27ABCDE1234F1Z5"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F8B7D] font-medium uppercase"
                />
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D] shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D] shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Zap size={14} />
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-[#0F8B7D] bg-teal-50/50 text-[#0F8B7D] shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building2 size={14} />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Trust & Escrow Guarantee */}
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Lock size={13} className="text-[#0F8B7D]" />
                <span>256-Bit Escrow Secured</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck size={14} className="text-[#0F8B7D]" />
                <span>Instant Activation</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "processing"}
              className="w-full py-3.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {status === "processing" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Payment...</span>
                </>
              ) : (
                <>
                  <span>Confirm &amp; Pay {price}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
