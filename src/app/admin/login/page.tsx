"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Zap
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin001");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid Super Admin credentials");
      }

      // Store admin session tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_admin", "1");
        localStorage.setItem("officex_role", "super_admin");
        localStorage.setItem("officex_user_email", email.trim().toLowerCase());
        localStorage.setItem("officex_user_name", "OfficeX Super Administrator");
        sessionStorage.setItem("officex_admin", "1");
        document.cookie = "officex_admin=1; path=/; max-age=604800; SameSite=Lax";
        document.cookie = "officex_role=super_admin; path=/; max-age=604800; SameSite=Lax";
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate Super Admin.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail("admin@gmail.com");
    setPassword("admin001");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Grid Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#0F8B7D_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <Image
              src="/logo-removebg-preview.png"
              alt="OfficeX Logo"
              width={42}
              height={42}
              className="object-contain group-hover:scale-105 transition-transform"
              style={{ width: "auto", height: "36px" }}
              priority
            />
            <Image
              src="/name-removebg-preview.png"
              alt="OfficeX"
              width={135}
              height={32}
              className="object-contain brightness-0 invert"
              style={{ width: "auto", height: "28px" }}
              priority
            />
          </Link>

          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/40 text-teal-300 text-[11px] font-bold tracking-wider uppercase mb-4 shadow-inner">
            <ShieldCheck size={14} className="text-teal-400" />
            <span>Master Governance Console</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            OfficeX Super Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Full governance access to Marketplaces, SaaS Modules &amp; Accounts
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium text-xs focus:border-teal-400 outline-none transition placeholder:text-slate-600"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-teal-400 font-mono">admin001</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin001"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-medium text-xs focus:border-teal-400 outline-none transition placeholder:text-slate-600"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick Fill Preset Button */}
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-teal-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Zap size={13} className="text-teal-400" />
              <span>Use Admin Credentials (`admin@gmail.com` / `admin001`)</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#0F8B7D] to-teal-600 hover:from-[#0D7A6E] hover:to-teal-500 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Super Admin Portal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/login"
              className="text-[11px] text-slate-500 hover:text-slate-300 transition"
            >
              ← Return to Standard User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

