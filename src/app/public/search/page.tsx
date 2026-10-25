"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PublicSearchRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const destination = `/marketplace/search${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(destination);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-5 h-5 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
        <span>Loading Commercial Marketplace...</span>
      </div>
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PublicSearchRedirectInner />
    </Suspense>
  );
}
