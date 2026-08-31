"use client";
import React from "react";
import { useParams } from "next/navigation";
import PropertyDetailsClient from "./PropertyDetailsClient";

// Comprehensive catalog of commercial properties
const fallbackProperties: { [id: string]: any } = {
  "apex-bkc": {
    id: "apex-bkc",
    name: "One BKC — North Wing Executive",
    type: "Commercial Office Tower",
    address: "G Block, Bandra Kurla Complex",
    city: "Mumbai",
    pincode: "400051",
    grade: "Grade A+",
    totalArea: 45000,
    ownerName: "Brookfield India Real Estate",
    ownerCompany: "Brookfield Properties",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    propertyScore: 86
  },
  "maker-maxity": {
    id: "maker-maxity",
    name: "Maker Maxity — 5th Floor Suite",
    type: "Commercial Business Park",
    address: "BKC Entry, Bandra East",
    city: "Mumbai",
    pincode: "400051",
    grade: "Grade A",
    totalArea: 38000,
    ownerName: "Maker Group",
    ownerCompany: "Maker Maxity Developers",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    propertyScore: 89
  },
  "godrej-bkc": {
    id: "godrej-bkc",
    name: "Godrej BKC — Floor 8 Horizon Plate",
    type: "LEED Platinum Commercial Tower",
    address: "G Block, BKC Main Road",
    city: "Mumbai",
    pincode: "400051",
    grade: "Grade A+",
    totalArea: 65000,
    ownerName: "Godrej Properties Ltd",
    ownerCompany: "Godrej Real Estate",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
    propertyScore: 92
  },
  "the-capital": {
    id: "the-capital",
    name: "The Capital (Platina) — Cybernetic Floor",
    type: "Grade A Commercial Tower",
    address: "Plot C-70, G Block, BKC",
    city: "Mumbai",
    pincode: "400051",
    grade: "Grade A",
    totalArea: 52000,
    ownerName: "Wadhwa Group",
    ownerCompany: "The Capital Real Estate",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
    propertyScore: 82
  }
};

const fallbackUnits = [
  {
    id: "unit-401",
    floorNumber: 4,
    unitNumber: "401-A",
    chargeableArea: 4500,
    carpetArea: 3600,
    baseRentPsf: 185,
    camPsf: 22,
    status: "Vacant"
  },
  {
    id: "unit-402",
    floorNumber: 4,
    unitNumber: "402-B",
    chargeableArea: 6200,
    carpetArea: 4950,
    baseRentPsf: 180,
    camPsf: 22,
    status: "Vacant"
  },
  {
    id: "unit-501",
    floorNumber: 5,
    unitNumber: "501",
    chargeableArea: 8500,
    carpetArea: 6800,
    baseRentPsf: 190,
    camPsf: 22,
    status: "Occupied"
  }
];

const fallbackCompliances = [
  {
    id: "comp-1",
    certificateType: "Fire Safety NOC",
    issuingAuthority: "Mumbai Fire Brigade (CFO)",
    certificateNumber: "FB/NOC/2026/4921",
    issueDate: "2026-01-15",
    expiryDate: "2027-01-14",
    status: "Active"
  },
  {
    id: "comp-2",
    certificateType: "Lift Fitness & Passenger Safety",
    issuingAuthority: "PWD Electrical Inspector",
    certificateNumber: "PWD/EL/LFT-882",
    issueDate: "2026-03-01",
    expiryDate: "2027-02-28",
    status: "Active"
  },
  {
    id: "comp-3",
    certificateType: "Pollution Control Board Consent (CTO)",
    issuingAuthority: "Maharashtra Pollution Control Board",
    certificateNumber: "MPCB/CTO/2025/1190",
    issueDate: "2025-06-10",
    expiryDate: "2028-06-09",
    status: "Active"
  },
  {
    id: "comp-4",
    certificateType: "Building Structural Stability Audit",
    issuingAuthority: "MCGM Licensed Structural Engineer",
    certificateNumber: "STR/AUD/2026/04",
    issueDate: "2026-02-20",
    expiryDate: "2029-02-19",
    status: "Active"
  }
];

export default function PropertyPage() {
  const params = useParams();
  const rawId = params?.id;
  const propertyId = Array.isArray(rawId) ? rawId[0] : (rawId || "apex-bkc");

  const property = fallbackProperties[propertyId] || {
    id: propertyId,
    name: `Premium Commercial Space (${propertyId})`,
    type: "Commercial Office Tower",
    address: "Bandra Kurla Complex",
    city: "Mumbai",
    pincode: "400051",
    grade: "Grade A+",
    totalArea: 45000,
    ownerName: "Brookfield India Real Estate",
    ownerCompany: "Brookfield Properties",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    propertyScore: 86
  };

  const similarProperties = Object.values(fallbackProperties).filter((p) => p.id !== propertyId);

  return (
    <PropertyDetailsClient 
      property={property}
      units={fallbackUnits}
      compliances={fallbackCompliances}
      similarProperties={similarProperties}
      isSimilarFallback={true}
    />
  );
}
