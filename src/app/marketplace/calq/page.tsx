"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Footer from "@/components/Footer";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import OfficeSpaceCalculator from "@/components/marketplace/OfficeSpaceCalculator";

export default function CalQStandalonePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <MarketingHeader activePath="/marketplace" />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <OfficeSpaceCalculator
          onExploreSpaces={(city, micromarket) => {
            router.push(`/public/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(micromarket)}`);
          }}
          onOpenAdvisor={() => setSlideInOpen(true)}
        />
      </main>

      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["marketplace"] }}
      />

      <Footer />
    </div>
  );
}
