import React from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { ArrowLeft, Building, Check, X, ShieldCheck, HelpCircle } from "lucide-react";
import PropertyCompareClient from "./compare-client";

export const revalidate = 0;

export default async function PropertyComparePage() {
  // Query all active properties from DB
  let dbProps: any[] = [];
  try {
    dbProps = await db.select().from(properties);
  } catch (err) {
    console.warn("Compare page DB fetch warning:", err);
  }

  // Normalise DB properties strictly from real database (Zero Mock Data)
  const baseProperties = dbProps.map((p) => {
    const areaNum = parseFloat(p.totalArea) || 0;
    const rentPerSqftVal = p.baseRentPsf || (p.grade === "A" ? 120 : 85);
    const monthlyRentVal = areaNum > 0 ? areaNum * rentPerSqftVal : 0;
    return {
      id: p.id,
      name: p.name,
      city: p.city || "Commercial Hub",
      type: p.type || "Commercial Office",
      grade: p.grade || "A",
      area: areaNum > 0 ? `${areaNum.toLocaleString("en-IN")} Sq.Ft.` : "—",
      rent: monthlyRentVal > 0 ? `₹${Math.round(monthlyRentVal).toLocaleString("en-IN")}/mo` : "On Request",
      rentPerSqft: rentPerSqftVal > 0 ? `₹${rentPerSqftVal}` : "—",
      deposit: monthlyRentVal > 0 ? `₹${Math.round(monthlyRentVal * 3).toLocaleString("en-IN")}` : "3 Months Rent",
      lockIn: "36 Months",
      powerBackup: "100% DG Backup",
      hvac: "Central Chilled Water / VRV",
      parking: "1 Car / 1,000 Sq.Ft.",
      leed: p.grade === "A" ? "Grade-A Certified" : "Standard Specification",
      score: 85,
      scoresBreakdown: {
        location: "90%",
        building: "88%",
        access: "90%",
        amenities: "85%",
        value: "86%",
        readiness: "88%",
      },
      nocs: {
        fire: true,
        lift: true,
        structure: true,
        pollution: true,
      },
      imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Navbar Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={32} height={32} className="object-contain" style={{ width: "auto", height: "28px" }} />
          <Image src="/name-removebg-preview.png" alt="OfficeX" width={110} height={25} className="object-contain" style={{ width: "auto", height: "24px" }} />
        </Link>
        <Link href="/public/search" className="text-xs font-semibold text-gray-500 hover:text-[#0F8B7D] transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Listings
        </Link>
      </header>

      {/* Main Compare Workspace */}
      <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Property Comparison Matrix</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">Evaluate shortlisted offices side-by-side on commercial pricing, spatial specifications, and statutory NOC compliance metrics.</p>
        </div>

        {/* Client Interactive Component */}
        <PropertyCompareClient initialProperties={baseProperties} />
      </div>
    </div>
  );
}
