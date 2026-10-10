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
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          const match = list.find((p: any) => p.id === propertyId || p.slug === propertyId);
          if (match) {
            setProperty(match);
            setSimilarProperties(list.filter((p: any) => p.id !== match.id).slice(0, 3));
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
