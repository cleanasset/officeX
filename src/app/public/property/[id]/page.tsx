import React from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { properties, leaseUnits, complianceCertificates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Building, MapPin, ShieldCheck, CheckCircle } from "lucide-react";
import PropertyActions from "@/components/PropertyActions";

export const revalidate = 0;

export default async function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const propertyId = resolvedParams.id;

  // Query property by ID
  const propRecords = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (propRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center p-8">
          <Building size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900">Property Not Found</h2>
          <Link href="/public/search" className="text-primary-teal text-xs font-semibold mt-2 inline-block">Back to search</Link>
        </div>
      </div>
    );
  }

  const prop = propRecords[0];

  // Query units & compliances
  const unitsList = await db.select().from(leaseUnits).where(eq(leaseUnits.propertyId, propertyId));
  const certsList = await db.select().from(complianceCertificates).where(eq(complianceCertificates.propertyId, propertyId));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Top Navbar */}
      <header className="h-[60px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-removebg-preview.png" alt="OfficeX Logo" width={30} height={30} className="object-contain" />
          <Image src="/name-removebg-preview.png" alt="OfficeX" width={95} height={19} className="object-contain" />
        </Link>
        <Link href="/public/search" className="text-xs font-semibold text-gray-500 hover:text-primary-teal transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Search
        </Link>
      </header>

      {/* Main Details Panel */}
      <div className="max-w-6xl mx-auto w-full py-12 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Columns (Specs, Units, Compliance) */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          <div className="premium-card p-8 border border-gray-100 bg-white">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {prop.name}
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-xs">Grade {prop.grade}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              {prop.address}, {prop.city} - {prop.pincode}
            </p>
            <hr className="border-gray-100 my-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-gray-600">
              <div>
                <div className="text-gray-400 font-semibold uppercase tracking-wider">Total Area</div>
                <div className="font-extrabold text-gray-900 mt-1">{parseFloat(prop.totalArea).toLocaleString()} Sq.Ft.</div>
              </div>
              <div>
                <div className="text-gray-400 font-semibold uppercase tracking-wider">Owner Company</div>
                <div className="font-extrabold text-gray-900 mt-1">{prop.ownerCompany || "N/A"}</div>
              </div>
              <div>
                <div className="text-gray-400 font-semibold uppercase tracking-wider">Property Type</div>
                <div className="font-extrabold text-gray-900 mt-1">{prop.type}</div>
              </div>
            </div>
          </div>

          {/* Property Specifications & Amenities (BUD Aligned) */}
          <div className="premium-card p-6 border border-gray-100 bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Property Specifications & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Furnishing Status</span>
                <span className="font-bold text-gray-900 block mt-1">Fully Fitted</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Power Backup</span>
                <span className="font-bold text-gray-900 block mt-1">100% (2x 1500 kVA DG)</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">HVAC System</span>
                <span className="font-bold text-gray-900 block mt-1">Centralized Chilled Water</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Parking Allotment</span>
                <span className="font-bold text-gray-900 block mt-1">1 Car / 1k Sq.Ft</span>
              </div>
            </div>
            
            <h4 className="font-bold text-gray-700 text-xs mb-3">Key Features & Services</h4>
            <div className="flex flex-wrap gap-2">
              {["24/7 Security Operations", "Visitor Management System", "Food Court & Lounge", "LEED Gold Certified", "Fiber-optic Connectivity", "Integrated Fire Sprinklers", "Professional FM Services"].map((amenity, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-bold text-[#0F8B7D]">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Units Inventory */}
          <div className="premium-card p-6 border border-gray-100 bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Available Office Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3">Unit</th>
                    <th className="py-3">Floor</th>
                    <th className="py-3">Area (Sq.Ft.)</th>
                    <th className="py-3">Base Rent</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unitsList.map((unit, idx) => (
                    <tr key={idx} className="border-b border-gray-100 text-xs hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-gray-900">{unit.unitNumber}</td>
                      <td className="py-3 text-gray-500">{unit.floorNumber}</td>
                      <td className="py-3 text-gray-500 font-medium">{parseFloat(unit.areaSqft).toLocaleString()}</td>
                      <td className="py-3 font-bold text-primary-teal">₹{parseFloat(unit.baseRent).toLocaleString()}/mo</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Compliance sidebar card */}
        <div className="flex flex-col gap-6">
          
          {/* OFFICEX Property Score Card */}
          <div className="premium-card p-6 border border-gray-200 bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-4">OFFICEX Property Score</h3>
            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-4xl font-extrabold text-[#0F8B7D]">86</span>
              <span className="text-xs text-gray-400 font-semibold">/ 100</span>
            </div>
            
            <div className="flex flex-col gap-2.5 text-xs text-gray-700 font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">Location Score</span>
                <span className="font-extrabold text-gray-900">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Building Quality</span>
                <span className="font-extrabold text-gray-900">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accessibility</span>
                <span className="font-extrabold text-gray-900">91%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amenities & Retail</span>
                <span className="font-extrabold text-gray-900">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Value Index</span>
                <span className="font-extrabold text-gray-900">82%</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">Operational Readiness</span>
                <span className="font-extrabold text-emerald-600">88%</span>
              </div>
            </div>
          </div>

          {/* Occupancy Cost Estimator */}
          <div className="premium-card p-6 border border-gray-200 bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Occupancy cost statistics</h3>
            <div className="flex flex-col gap-3 text-xs text-gray-700">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">Estimated Occupancy Cost</span>
                <span className="font-bold text-gray-900">₹135 / sq.ft / mo</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">Cost Per Seat</span>
                <span className="font-bold text-gray-900">₹12,000 / seat / mo</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">LEED Certification</span>
                <span className="font-bold text-emerald-600">Gold Certified</span>
              </div>
            </div>
          </div>

          {/* Transaction Quick Actions */}
          <PropertyActions propertyId={prop.id} propertyName={prop.name} />

          {/* Statutory NOCs */}
          <div className="premium-card p-6 border border-gray-100 bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-primary-teal" />
              Statutory NOC Statuses
            </h3>
            <div className="flex flex-col gap-4">
              {certsList.map((cert, idx) => {
                const expiry = new Date(cert.expiryDate);
                const diffTime = expiry.getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays <= 0;

                return (
                  <div key={idx} className="flex flex-col gap-2 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{cert.name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{cert.issuingAuthority}</div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {isExpired ? 'Expired' : 'Valid'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-t border-gray-100 pt-2 mt-1">
                      <span className="text-gray-500 font-medium">
                        {isExpired ? (
                          <span className="text-red-500 font-bold">Expired on {expiry.toLocaleDateString()}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">{diffDays} days remaining</span>
                        )}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold uppercase tracking-wider">KYC Verified</span>
                    </div>
                  </div>
                );
              })}
              {certsList.length === 0 && (
                <div className="text-xs text-gray-400 italic text-center py-4">No active compliance certificates loaded.</div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
