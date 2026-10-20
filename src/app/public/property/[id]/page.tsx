"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import PropertyDetailsClient from "./PropertyDetailsClient";

export default function PropertyPage() {
  const params = useParams();
  const rawId = params?.id;
  const propertyId = Array.isArray(rawId) ? rawId[0] : (rawId || "");

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any | null>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      try {
        // 1. Try Marketplace Listings first (rich scraped & verified data)
        const mpRes = await fetch(`/api/marketplace/listings/${encodeURIComponent(propertyId)}`);
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          if (mpData.listing) {
            const l = mpData.listing;
            setProperty({
              id: l.id,
              slug: l.slug,
              name: l.name,
              title: l.name,
              brandName: l.brandName,
              address: l.fullAddress || `${l.locality || ""}, ${l.city}`,
              location: `${l.locality || l.microMarket || ""}, ${l.city}`,
              city: l.city,
              grade: l.buildingGrade || "Grade A",
              totalArea: l.totalAreaSqft,
              total_area: l.totalAreaSqft,
              capacity: l.totalSeats ? `${l.totalSeats} Seats` : "20-250 Workstations",
              furnishing: (l.vertical || "Coworking").replace(/_/g, " "),
              baseRentPsf: l.pricingPlans?.rentPerSqft || (l.buildingGrade === "Grade A" ? 145 : 95),
              price: l.startingPrice ? `₹${Math.round(Number(l.startingPrice)).toLocaleString("en-IN")}` : "₹8,500",
              pricePerSeat: l.pricingPlans?.dedicatedDeskMonthly 
                ? `₹${Math.round(l.pricingPlans.dedicatedDeskMonthly).toLocaleString("en-IN")} / seat / mo`
                : (l.startingPrice ? `₹${Math.round(Number(l.startingPrice)).toLocaleString("en-IN")} / seat / mo` : "₹8,500 / seat / mo"),
              pricePerSqft: l.pricingPlans?.rentPerSqft ? `₹${l.pricingPlans.rentPerSqft} / sq.ft.` : "₹145 / sq.ft.",
              imageUrl: l.featuredImage || (l.images && l.images[0]) || "/images/workspace_managed_suite.jpg",
              images: Array.isArray(l.images) && l.images.length > 0 ? l.images : [l.featuredImage || "/images/workspace_managed_suite.jpg"],
              pricingPlans: l.pricingPlans || {},
              amenities: Array.isArray(l.amenities) ? l.amenities : [],
              description: l.description,
              operatingHours: l.operatingHours || {},
              avgRating: l.avgRating || "4.50",
              totalReviews: l.totalReviews || 12,
              nearestMetro: l.nearestMetro,
              metroDistance: l.metroDistance,
              latitude: l.latitude,
              longitude: l.longitude,
              propertyScore: 94
            });

            if (Array.isArray(mpData.similar) && mpData.similar.length > 0) {
              setSimilarProperties(mpData.similar.map((s: any) => ({
                id: s.slug || s.id,
                name: s.name,
                title: s.name,
                location: `${s.locality || ""}, ${s.city}`,
                area: s.totalAreaSqft ? `${s.totalAreaSqft} sqft` : "Flexible Layout",
                price: s.startingPrice ? `₹${Math.round(Number(s.startingPrice)).toLocaleString("en-IN")}` : "On Request",
                imageUrl: s.featuredImage || (s.images && s.images[0]) || "/images/workspace_dedicated_desks.jpg"
              })));
            }
            return;
          }
        }

        // 2. Fallback to /api/properties if not found in marketplace
        const res = await fetch(`/api/properties?id=${encodeURIComponent(propertyId)}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [data];
          const match = list.find((p: any) => p.id === propertyId || p.slug === propertyId) || (list.length === 1 && list[0]?.id ? list[0] : null);
          if (match) {
            setProperty(match);
            try {
              const simRes = await fetch(`/api/properties?city=${encodeURIComponent(match.city || "")}&limit=4`);
              if (simRes.ok) {
                const simData = await simRes.json();
                const simList = Array.isArray(simData) ? simData : [];
                setSimilarProperties(simList.filter((p: any) => p.id !== match.id).slice(0, 3));
              }
            } catch {}
          } else {
            setProperty(null);
          }
        }
      } catch (err) {
        console.error("Failed to load property details:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F8B7D] mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Property Details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-md w-full shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F8B7D] mx-auto">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Property Not Found</h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              The requested commercial space does not exist in the active rent roll or has been decommissioned.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/public/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold transition shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Commercial Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PropertyDetailsClient 
      property={property}
      units={property.units || []}
      compliances={property.compliances || []}
      similarProperties={similarProperties}
      isSimilarFallback={false}
    />
  );
}
