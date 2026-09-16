"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RentCollectionTracker() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/properties/rent-roll?tab=collections");
  }, [router]);

  return (
    <div className="p-12 text-center text-gray-400">
      <div className="w-7 h-7 border-2 border-[#0F8B7D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-xs font-semibold text-gray-500">Redirecting to Collections &amp; Receipts Ledger...</p>
    </div>
  );
}
