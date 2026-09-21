"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/properties");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-semibold">Redirecting to Portfolio Dashboard...</p>
      </div>
    </div>
  );
}
