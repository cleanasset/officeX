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

  // Normalise DB properties into a format compatible with comparison matrix
  const baseProperties = dbProps.map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    type: p.type,
    grade: p.grade || "A",
    area: parseFloat(p.totalArea).toLocaleString() + " Sq.Ft.",
    rent: p.name.includes("Apex") ? "₹8,50,000/mo" : p.name.includes("Meridian") ? "₹18,50,000/mo" : "₹4,20,000/mo",
    rentPerSqft: p.name.includes("Apex") ? "₹135" : p.name.includes("Meridian") ? "₹150" : "₹95",
    deposit: p.name.includes("Apex") ? "₹25,50,000" : p.name.includes("Meridian") ? "₹55,50,000" : "₹12,60,000",
    lockIn: p.name.includes("Apex") ? "36 Months" : p.name.includes("Meridian") ? "24 Months" : "12 Months",
    powerBackup: "100% (2x DG backup)",
    hvac: p.name.includes("Apex") ? "Central Chilled Water" : "Central VRV System",
    parking: "1 Car / 1,000 Sq.Ft.",
    leed: p.name.includes("Apex") ? "Gold Certified" : p.name.includes("Meridian") ? "Platinum Certified" : "Certified",
    score: p.name.includes("Apex") ? 86 : p.name.includes("Meridian") ? 89 : 82,
    scoresBreakdown: {
      location: p.name.includes("Apex") ? "94%" : p.name.includes("Meridian") ? "96%" : "85%",
      building: p.name.includes("Apex") ? "89%" : p.name.includes("Meridian") ? "92%" : "80%",
      access: p.name.includes("Apex") ? "91%" : p.name.includes("Meridian") ? "93%" : "82%",
      amenities: p.name.includes("Apex") ? "84%" : p.name.includes("Meridian") ? "88%" : "78%",
      value: p.name.includes("Apex") ? "82%" : p.name.includes("Meridian") ? "85%" : "84%",
      readiness: p.name.includes("Apex") ? "88%" : p.name.includes("Meridian") ? "90%" : "82%",
    },
    nocs: {
      fire: true,
      lift: true,
      structure: true,
      pollution: p.name.includes("Apex") ? true : false,
    },
    imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
  }));

  // Add a couple of default sample benchmark properties if DB has less than 2
  if (baseProperties.length < 3) {
    baseProperties.push({
      id: "demo-prop-3",
      name: "Corporate Arena Nikol",
      city: "Ahmedabad",
      type: "Commercial Office",
      grade: "B",
      area: "4,500 Sq.Ft.",
      rent: "₹2,10,000/mo",
      rentPerSqft: "₹46",
      deposit: "₹6,30,000",
      lockIn: "12 Months",
      powerBackup: "100% Backup",
      hvac: "Splits / Cassette units",
      parking: "2 Cars Fixed",
      leed: "Not Certified",
      score: 75,
      scoresBreakdown: {
        location: "78%",
        building: "72%",
        access: "75%",
        amenities: "70%",
        value: "85%",
        readiness: "90%",
      },
      nocs: {
        fire: true,
        lift: false,
        structure: true,
        pollution: true,
      },
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop"
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Navbar Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={28} height={28} className="object-contain" />
          <Image src="/name-removebg-preview.png" alt="OfficeX" width={90} height={18} className="object-contain" />
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
