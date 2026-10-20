"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import PropertyDetailsClient from "@/app/public/property/[id]/PropertyDetailsClient";

export default function MarketplaceSlugPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug || "");

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any | null>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const mpRes = await fetch(`/api/marketplace/listings/${encodeURIComponent(slug)}`);
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
              imageUrl: l.featuredImage || (l.images && l.images[0]) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
              images: Array.isArray(l.images) && l.images.length > 0 ? l.images : [l.featuredImage],
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
                imageUrl: s.featuredImage || (s.images && s.images[0]) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
              })));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load marketplace property details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F8B7D] mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Workspace Details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center max-w-md space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mx-auto">
            <Building2 size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Workspace Listing Not Found</h2>
          <p className="text-xs text-gray-500">
            The workspace listing you are looking for may have been leased or moved to another market corridor.
          </p>
          <Link
            href="/public/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F8B7D] text-white text-xs font-bold shadow-sm hover:bg-[#0D7A6E]"
          >
            <ArrowLeft size={14} /> Browse All Workspaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PropertyDetailsClient
      property={property}
      units={[]}
      compliances={[]}
      similarProperties={similarProperties}
      isSimilarFallback={false}
    />
  );
}
