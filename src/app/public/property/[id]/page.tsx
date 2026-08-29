import React from "react";
import { db } from "@/db";
import { properties, leaseUnits, complianceCertificates } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import PropertyDetailsClient from "./PropertyDetailsClient";

export const revalidate = 0;

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const propertyId = resolvedParams.id;

  // 1. Fetch current property
  const propRecords = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (propRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center p-8">
          <h2 className="text-lg font-bold text-gray-900">Property Not Found</h2>
          <p className="text-xs text-gray-400 mt-1">Check that the property ID is valid.</p>
        </div>
      </div>
    );
  }

  const property = propRecords[0];

  // 2. Fetch units, compliance documents and similar properties in the same city
  const units = await db.select().from(leaseUnits).where(eq(leaseUnits.propertyId, propertyId));
  const compliances = await db.select().from(complianceCertificates).where(eq(complianceCertificates.propertyId, propertyId));
  
  let similarProperties = await db
    .select()
    .from(properties)
    .where(and(eq(properties.city, property.city), ne(properties.id, propertyId)))
    .limit(3);

  let isSimilarFallback = false;
  if (similarProperties.length === 0) {
    similarProperties = await db
      .select()
      .from(properties)
      .where(ne(properties.id, propertyId))
      .limit(3);
    isSimilarFallback = true;
  }

  return (
    <PropertyDetailsClient 
      property={property}
      units={units}
      compliances={compliances}
      similarProperties={similarProperties}
      isSimilarFallback={isSimilarFallback}
    />
  );
}
