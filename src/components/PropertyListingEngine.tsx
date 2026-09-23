"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Building,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  User,
  Compass,
  Layers,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  Car,
  Wifi,
  Wind,
  Flame,
  Activity,
  Award,
  DollarSign,
  Maximize2,
  Check,
  ChevronRight,
  Loader2,
  RefreshCw,
  Upload,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Plus,
  X,
  Eye
} from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import PropertyTitleAutocomplete from "@/components/PropertyTitleAutocomplete";
import { TenantInviteModal } from "@/components/rent-roll/TenantInviteModal";

const MapPinPicker = dynamic(() => import("@/components/MapPinPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-400">
      Loading Interactive Map Pin Locator...
    </div>
  )
});

export interface PropertyListingEngineProps {
  portalRole?: "owner" | "broker";
  redirectPath?: string;
  defaultListedBy?: "owner" | "broker" | "builder";
}

export default function PropertyListingEngine({
  portalRole = "owner",
  redirectPath,
  defaultListedBy
}: PropertyListingEngineProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaMode, setMediaMode] = useState<"upload" | "presets" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [createdPropForInvite, setCreatedPropForInvite] = useState<{
    id: string;
    name: string;
    location?: string;
    inviteCode?: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Unit system for area: "sft" (Square Feet) vs "smt" (Square Meter)
  // 1 sq. meter = 10.7639 sq. feet
  const [areaUnit, setAreaUnit] = useState<"sft" | "smt">("sft");

  const [formData, setFormData] = useState({
    // Step 1: Intent, Category & Contact
    intent: "rent" as "rent" | "sell", // Rent/Lease or Sell
    primaryCategory: "office" as "office" | "retail" | "land" | "storage",
    subType: "Furnished Office",
    grade: "Grade A",
    
    // Contact Details
    listedBy: (defaultListedBy || (portalRole === "broker" ? "broker" : "owner")) as "owner" | "broker" | "builder",
    contactName: "",
    contactPhone: "",
    whatsappAvailable: true,
    contactEmail: "",
    companyName: "",
    reraNumber: "",

    // Step 2: Location & Detection
    propertyName: "",
    city: "Mumbai",
    state: "Maharashtra",
    microMarket: "",
    address: "",
    pincode: "",
    metroDistance: "",
    latitude: null as number | null,
    longitude: null as number | null,

    // Step 3: Size / Area & Office Configuration
    totalArea: "12500", // in selected areaUnit
    carpetArea: "9800",
    plotArea: "",
    noOfCabins: 6,
    noOfMeetingRooms: 3,
    minSeats: 75,
    floorNumber: "4th Floor",
    totalFloors: "12 Floors",
    noOfStaircases: 2,

    // Step 4: Available Features & Technical Engineering
    conferenceRoom: true,
    washroomType: "both" as "private" | "shared" | "both" | "none",
    reception: true,
    pantryType: "Wet Pantry", // "Dry Pantry" | "Wet Pantry" | "Cafeteria" | "None"
    furnishingStatus: "Fully Furnished", // "Fully Furnished" | "Semi-Furnished" | "Bareshell / Unfurnished"
    centralAcType: "Central Air Conditioning", // "Central Air Conditioning" | "VRV/VRF System" | "Split ACs" | "None"
    floorDetails: "Vitrified Tiles & Carpet",
    passengerLifts: 4,
    serviceLifts: 1,
    carParkingSlots: 15,
    twoWheelerSlots: 30,
    visitorParkingAvailable: true,

    // Specialized Technical & Safety
    fireSafetyFeatures: [
      "Smoke Detectors",
      "Automatic Sprinklers",
      "Fire Hydrant & Hose Reels",
      "Fire Extinguishers",
      "Emergency Fire Exit Signage"
    ] as string[],
    oxygenDuctAvailable: false,
    upsAvailable: true,
    upsKva: "60 KVA Online Central UPS",

    // Step 5: Campus Amenities & Legal Compliance
    amenities: [
      "Maintenance Staff",
      "Water Storage (24x7)",
      "Waste Disposal & STP",
      "Wheelchair Accessibility",
      "Cafeteria / Food Court",
      "DG (Diesel Generator)",
      "CCTV Surveillance (24x7)",
      "Visitor Parking",
      "Security Guard (24x7)",
      "100% Power Backup",
      "Intercom Facility",
      "High-Speed Lifts"
    ] as string[],
    ownershipType: "Freehold" as "Freehold" | "Leasehold" | "Co-operative Society" | "Power of Attorney",
    isNocCertified: true,
    fireNocExpiry: "2027-12-31",
    fireNocNumber: "NOC/MH/FIR/2026/8492",
    occupancyCertStatus: "Received (OC Available)" as "Received (OC Available)" | "Applied" | "Pending",
    occupancyCertNumber: "OC/MCGM/2025/1190",

    // Step 6: Commercial Pricing & Media
    // If Rent:
    baseRentPerSqft: "185",
    camPerSqft: "18",
    securityDepositMonths: "3 Months",
    lockInPeriodMonths: "36 Months",
    annualEscalationPct: "5%",
    // If Sell:
    totalSellingPrice: "185000000", // in INR
    priceNegotiable: true,
    bookingTokenAmount: "2100000",
    possessionStatus: "Ready to Move",

    // Media
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80"
    ] as string[]
  });

  // Load existing profile context from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("officex_user_name");
      const storedEmail = localStorage.getItem("officex_user_email");
      const storedCompany = localStorage.getItem("officex_user_company");
      if (storedName || storedEmail || storedCompany) {
        setFormData(prev => ({
          ...prev,
          contactName: prev.contactName || storedName || "",
          contactEmail: prev.contactEmail || storedEmail || "",
          companyName: prev.companyName || storedCompany || (portalRole === "broker" ? "Premier CRE Partners" : "Asset Management Co")
        }));
      }
    }
  }, [portalRole]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY SUB-TYPES MAPPING
  // ─────────────────────────────────────────────────────────────────────────
  const categorySubTypes: Record<string, string[]> = {
    office: [
      "Coworking Office",
      "Managed Office",
      "Bareshell Office",
      "Furnished Office"
    ],
    retail: [
      "Commercial Shop",
      "Showroom"
    ],
    land: [
      "Commercial Land",
      "Industrial Land"
    ],
    storage: [
      "Warehouse",
      "Cold Storage"
    ]
  };

  const handleCategoryChange = (cat: "office" | "retail" | "land" | "storage") => {
    const firstSub = categorySubTypes[cat][0];
    setFormData(prev => ({
      ...prev,
      primaryCategory: cat,
      subType: firstSub
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UNIT CONVERSION (Sft <-> Smt)
  // ─────────────────────────────────────────────────────────────────────────
  const handleUnitToggle = (targetUnit: "sft" | "smt") => {
    if (targetUnit === areaUnit) return;
    const currentVal = parseFloat(formData.totalArea.replace(/,/g, "")) || 0;
    const currentCarpet = parseFloat(formData.carpetArea.replace(/,/g, "")) || 0;

    let convertedTotal = currentVal;
    let convertedCarpet = currentCarpet;

    if (targetUnit === "smt") {
      convertedTotal = Math.round((currentVal / 10.7639) * 100) / 100;
      convertedCarpet = Math.round((currentCarpet / 10.7639) * 100) / 100;
    } else {
      convertedTotal = Math.round(currentVal * 10.7639);
      convertedCarpet = Math.round(currentCarpet * 10.7639);
    }

    setAreaUnit(targetUnit);
    setFormData(prev => ({
      ...prev,
      totalArea: convertedTotal.toString(),
      carpetArea: convertedCarpet.toString()
    }));
    showToast(`Converted areas to ${targetUnit.toUpperCase()} (1 Smt = 10.76 Sft)`, "info");
  };

  const getNormalizedAreaInSft = () => {
    const val = parseFloat(formData.totalArea.replace(/,/g, "")) || 0;
    return areaUnit === "sft" ? val : Math.round(val * 10.7639);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GPS DETECT LOCATION
  // ─────────────────────────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsDetectingLocation(true);
    showToast("Detecting precise GPS coordinates...", "info");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const loc = data.results[0];
              setFormData(prev => ({
                ...prev,
                city: loc.city || prev.city,
                state: loc.state || prev.state,
                microMarket: loc.area || prev.microMarket,
                pincode: loc.pincode || prev.pincode,
                address: loc.fullAddress || prev.address,
                latitude: latitude,
                longitude: longitude
              }));
              showToast(`Location detected: ${loc.area ? loc.area + ", " : ""}${loc.city}`, "success");
            } else {
              setFormData(prev => ({ ...prev, latitude, longitude }));
              showToast(`GPS pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, "success");
            }
          } else {
            setFormData(prev => ({ ...prev, latitude, longitude }));
            showToast("GPS coordinates locked. Please confirm city & micro-market.", "info");
          }
        } catch (err) {
          console.error("Geocode error:", err);
          setFormData(prev => ({ ...prev, latitude, longitude }));
          showToast("GPS coordinates acquired. Please review location details.", "info");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        showToast("GPS permission denied or unavailable. Please select city manually.", "error");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // AMENITIES & FEATURES TOGGLES
  // ─────────────────────────────────────────────────────────────────────────
  const toggleAmenity = (item: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== item)
          : [...prev.amenities, item]
      };
    });
  };

  const toggleFireFeature = (item: string) => {
    setFormData(prev => {
      const exists = prev.fireSafetyFeatures.includes(item);
      return {
        ...prev,
        fireSafetyFeatures: exists
          ? prev.fireSafetyFeatures.filter(f => f !== item)
          : [...prev.fireSafetyFeatures, item]
      };
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE & MEDIA MANAGEMENT (SINGLE / MULTI UPLOAD & TEMPLATES)
  // ─────────────────────────────────────────────────────────────────────────
  const popularCities = [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Bengaluru", state: "Karnataka" },
    { name: "Delhi NCR", state: "Delhi" },
    { name: "Hyderabad", state: "Telangana" },
    { name: "Pune", state: "Maharashtra" },
    { name: "Ahmedabad / GIFT City", state: "Gujarat" },
    { name: "Chennai", state: "Tamil Nadu" },
    { name: "Kolkata", state: "West Bengal" }
  ];

  const templateImages = [
    {
      label: "Modern Glass Facade IT Park",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80"
    },
    {
      label: "Premium Corporate Tower",
      url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80"
    },
    {
      label: "Furnished Workstation Floor",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80"
    },
    {
      label: "Logistics Warehouse Park",
      url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80"
    }
  ];

  const processFiles = async (files: FileList | File[]) => {
    const validImageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) {
        validImageFiles.push(f);
      }
    }

    if (validImageFiles.length === 0) {
      showToast("Please upload valid image files (JPG, PNG, WEBP).", "error");
      return;
    }

    setIsProcessingImages(true);
    showToast(`Uploading ${validImageFiles.length} photo${validImageFiles.length > 1 ? "s" : ""}...`, "info");

    try {
      const readPromises = validImageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      });

      const dataUrls = await Promise.all(readPromises);

      setFormData(prev => {
        const currentGallery = prev.galleryImages || [];
        const isDefaultTemplate = currentGallery.length === 1 && templateImages.some(t => t.url === currentGallery[0]);
        const newGallery = isDefaultTemplate ? dataUrls : [...currentGallery, ...dataUrls];
        const newPrimary = prev.imageUrl && !isDefaultTemplate ? prev.imageUrl : dataUrls[0];

        return {
          ...prev,
          galleryImages: newGallery,
          imageUrl: newPrimary
        };
      });

      showToast(`✓ Added ${dataUrls.length} photo${dataUrls.length > 1 ? "s" : ""} to listing gallery!`, "success");
    } catch (err) {
      console.error("Image processing error:", err);
      showToast("Error reading image files. Please try again.", "error");
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCoverPhoto = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
    showToast("✓ Showcase cover photo updated!", "success");
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData(prev => {
      const updatedGallery = (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove);
      let updatedCover = prev.imageUrl;
      
      if (prev.imageUrl === prev.galleryImages[indexToRemove]) {
        updatedCover = updatedGallery.length > 0 ? updatedGallery[0] : templateImages[0].url;
      }
      
      return {
        ...prev,
        galleryImages: updatedGallery.length > 0 ? updatedGallery : [templateImages[0].url],
        imageUrl: updatedCover
      };
    });
    showToast("Photo removed from gallery.", "info");
  };

  const handleAddCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      showToast("Please enter a valid image URL.", "error");
      return;
    }
    setFormData(prev => {
      const currentGallery = prev.galleryImages || [];
      const isDefaultTemplate = currentGallery.length === 1 && templateImages.some(t => t.url === currentGallery[0]);
      const newGallery = isDefaultTemplate ? [trimmed] : [...currentGallery, trimmed];
      return {
        ...prev,
        galleryImages: newGallery,
        imageUrl: trimmed
      };
    });
    setCustomUrlInput("");
    showToast("✓ Custom image added to gallery & set as cover!", "success");
  };

  const handleSelectTemplate = (url: string) => {
    setFormData(prev => {
      const currentGallery = prev.galleryImages || [];
      const alreadyInGallery = currentGallery.includes(url);
      return {
        ...prev,
        imageUrl: url,
        galleryImages: alreadyInGallery ? currentGallery : [url, ...currentGallery]
      };
    });
    showToast("✓ Preset template photo selected!", "success");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMISSION / PUBLISH HANDLER
  // ─────────────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!formData.propertyName.trim()) {
      showToast("Please provide a property title or building name.", "error");
      setCurrentStep(1);
      return;
    }
    if (!formData.city.trim()) {
      showToast("Please specify the city.", "error");
      setCurrentStep(2);
      return;
    }

    setIsPublishing(true);

    const ownerUserId = typeof window !== "undefined" ? localStorage.getItem("officex_user_id") || "" : "";
    const totalAreaSft = getNormalizedAreaInSft();

    const payload = {
      name: formData.propertyName.trim(),
      type: `${formData.subType} (${formData.primaryCategory.toUpperCase()})`,
      grade: formData.grade.replace(/^Grade\s+/i, ""),
      address: formData.address || `${formData.microMarket}, ${formData.city}, ${formData.state}`,
      city: formData.city,
      state: formData.state,
      microMarket: formData.microMarket || undefined,
      pincode: formData.pincode || "400051",
      totalArea: totalAreaSft,
      latitude: formData.latitude,
      longitude: formData.longitude,
      ownerName: formData.contactName || (formData.listedBy === "owner" ? "Property Owner" : "Broker Representative"),
      ownerCompany: formData.companyName || (portalRole === "broker" ? "Leasing Desk" : "OfficeX Asset Mgmt"),
      ownerUserId: ownerUserId || undefined,
      imageUrl: formData.imageUrl,
      galleryImages: formData.galleryImages,
      compliance: {
        fireNocCertified: formData.isNocCertified,
        fireNocExpiry: formData.fireNocExpiry || undefined,
        occupancyCertificate: formData.occupancyCertStatus.includes("Received")
      }
    };

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const dbProp = await res.json();
      const codeNum = (dbProp?.id || String(Date.now())).replace(/\D/g, "").slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
      const inviteCode = `OX-${codeNum.padStart(4, "7")}`;

      if (typeof window !== "undefined") {
        const fullListingRecord = {
          id: dbProp?.id || `prop-${Date.now()}`,
          ...formData,
          totalAreaSft: totalAreaSft,
          inviteCode: inviteCode,
          publishedAt: new Date().toISOString(),
          dateFormatted: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          status: "Available"
        };

        const existing = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        localStorage.setItem("officex_user_properties", JSON.stringify([fullListingRecord, ...existing]));
        localStorage.setItem("officex_property_name", formData.propertyName);
        localStorage.setItem("officex_last_invite_code", inviteCode);

        const brokerListings = JSON.parse(localStorage.getItem("officex_broker_listings") || "[]");
        localStorage.setItem("officex_broker_listings", JSON.stringify([fullListingRecord, ...brokerListings]));

        window.dispatchEvent(new CustomEvent("officex-property-added", { detail: fullListingRecord }));
      }

      showToast("🎉 Commercial Property registered! Share building code with tenants.", "success");

      setCreatedPropForInvite({
        id: dbProp?.id || `prop-${Date.now()}`,
        name: formData.propertyName || "Commercial Asset",
        location: `${formData.city}, ${formData.state}`,
        inviteCode: inviteCode,
        ownerName: formData.companyName || formData.contactName || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
      });
    } catch (err) {
      console.error("Listing submission error:", err);
      showToast("Network error publishing listing. Saved to your local workspace.", "info");

      const codeNum = String(Date.now()).replace(/\D/g, "").slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
      const inviteCode = `OX-${codeNum.padStart(4, "7")}`;

      if (typeof window !== "undefined") {
        const fullListingRecord = {
          id: `prop-local-${Date.now()}`,
          ...formData,
          totalAreaSft: totalAreaSft,
          inviteCode: inviteCode,
          publishedAt: new Date().toISOString(),
          status: "Available"
        };
        const existing = JSON.parse(localStorage.getItem("officex_user_properties") || "[]");
        localStorage.setItem("officex_user_properties", JSON.stringify([fullListingRecord, ...existing]));
        localStorage.setItem("officex_property_name", formData.propertyName);
        localStorage.setItem("officex_last_invite_code", inviteCode);
      }

      setCreatedPropForInvite({
        id: `prop-local-${Date.now()}`,
        name: formData.propertyName || "Commercial Asset",
        location: `${formData.city}, ${formData.state}`,
        inviteCode: inviteCode,
        ownerName: formData.companyName || formData.contactName || (typeof window !== "undefined" ? (localStorage.getItem("officex_user_name") || localStorage.getItem("officex_active_org")) : "") || "Commercial Property Owner"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const steps = [
    { num: 1, label: "Intent & Category" },
    { num: 2, label: "Location & Detect" },
    { num: 3, label: "Area & Space Specs" },
    { num: 4, label: "Features & Engineering" },
    { num: 5, label: "Amenities & Statutory" },
    { num: 6, label: "Pricing & Publish" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-800 border border-emerald-500"
              : toast.type === "error"
              ? "bg-rose-900 border border-rose-500"
              : "bg-slate-900 border border-slate-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={portalRole === "broker" ? "/leasing" : "/properties"}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#0F8B7D] border border-teal-200/60">
                {portalRole === "broker" ? "Leasing Broker CRM" : "Property Owner Portal"}
              </span>
              <span className="text-[10px] font-bold text-slate-400">• Step {currentStep} of 6</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Commercial Property Listing Builder
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create and publish verified commercial listings for Rent / Lease or Outright Sale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast("Draft saved to workspace!", "success")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save size={14} className="text-slate-500" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setCurrentStep(s.num)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentStep === s.num
                ? "bg-[#0F8B7D] text-white shadow-xs"
                : currentStep > s.num
                ? "bg-teal-50 text-teal-900 border border-teal-200/60"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentStep === s.num
                  ? "bg-white text-[#0F8B7D]"
                  : currentStep > s.num
                  ? "bg-teal-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > s.num ? "✓" : s.num}
            </span>
            <span className="whitespace-nowrap">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* ═══════════════════════════════════════════════════════════════
            STEP 1: INTENT, CATEGORY & CONTACT DETAILS
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                1. Transaction Intent, Property Category & Contact Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Specify whether you are offering space for Lease or Sale, and establish lister credentials.
              </p>
            </div>

            {/* INTENT SELECTOR: Rent/Lease vs Sell */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                YOU ARE LOOKING TO *
              </label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, intent: "rent" })}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    formData.intent === "rent"
                      ? "border-[#0F8B7D] bg-teal-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Rent / Lease</span>
                    {formData.intent === "rent" && <CheckCircle size={16} className="text-[#0F8B7D]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Commercial Lease with monthly rent, CAM & lock-in terms.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, intent: "sell" })}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                    formData.intent === "sell"
                      ? "border-[#0F8B7D] bg-teal-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Sell (Outright)</span>
                    {formData.intent === "sell" && <CheckCircle size={16} className="text-[#0F8B7D]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Asset transfer with total capital value & booking token.
                  </p>
                </button>
              </div>
            </div>

            {/* PRIMARY CATEGORY: Office, Retail, Plot/Land, Storage */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                WHAT KIND OF PROPERTY DO YOU HAVE? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "office", label: "Office", desc: "Corporate, Coworking, IT Parks" },
                  { id: "retail", label: "Retail", desc: "Shops, Showrooms, High Street" },
                  { id: "land", label: "Plot / Land", desc: "Commercial & Industrial Plots" },
                  { id: "storage", label: "Storage", desc: "Warehouses, Logistics & Cold Storage" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id as any)}
                    className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                      formData.primaryCategory === cat.id
                        ? "border-[#0F8B7D] bg-teal-50/40 text-slate-900 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-black block">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TYPES */}
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                SELECT SPACE TYPE / CONFIGURATION *
              </label>
              <div className="flex flex-wrap gap-2">
                {categorySubTypes[formData.primaryCategory].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setFormData({ ...formData, subType: sub })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      formData.subType === sub
                        ? "bg-[#0F8B7D] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTACT DETAILS & LISTER IDENTITY */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={15} className="text-[#0F8B7D]" /> Contact Details & Lister Identity
                </span>
                <span className="text-[10px] font-bold text-slate-400">Direct Buyer / Tenant Connect</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  YOU ARE LISTING AS *
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-sm">
                  {[
                    { id: "owner", label: "Owner / Landlord" },
                    { id: "broker", label: "Broker / Consultant" },
                    { id: "builder", label: "Builder / Developer" }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, listedBy: role.id as any })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-all ${
                        formData.listedBy === role.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    CONTACT NAME *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Ravi Mehra"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="e.g. 9820012345"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="e.g. ravi@apexventures.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    COMPANY / BROKERAGE / ASSET FIRM
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Commercial Realty LLP"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>

                {formData.listedBy === "broker" && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      RERA REGISTRATION NUMBER (FOR BROKERS)
                    </label>
                    <input
                      type="text"
                      value={formData.reraNumber}
                      onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                      placeholder="e.g. A51800012345"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="whatsappCheck"
                  checked={formData.whatsappAvailable}
                  onChange={(e) => setFormData({ ...formData, whatsappAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F8B7D] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="whatsappCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  WhatsApp inquiries allowed on this phone number
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 2: LOCATION & GPS DETECT
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  2. Location, Micro-Market & Map Positioning
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Accurate location drives site visits and public search visibility.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="px-4 py-2.5 rounded-xl bg-teal-50 text-[#0F8B7D] border border-teal-200/80 hover:bg-teal-100/60 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Compass size={15} />
                    <span>Detect My Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Popular Indian Commercial Hubs */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                QUICK CITY SELECTOR (MAJOR COMMERCIAL MARKETS)
              </label>
              <div className="flex flex-wrap gap-2">
                {popularCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, city: c.name, state: c.state })}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      formData.city === c.name
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Title & Building Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  BUILDING / PROJECT / SOCIETY NAME *
                </label>
                <PropertyTitleAutocomplete
                  value={formData.propertyName}
                  onChange={(name, selectedMeta) => {
                    if (selectedMeta) {
                      setFormData(prev => ({
                        ...prev,
                        propertyName: name,
                        microMarket: selectedMeta.area || prev.microMarket,
                        city: selectedMeta.city || prev.city,
                        state: selectedMeta.state || prev.state,
                        pincode: selectedMeta.pincode || prev.pincode,
                        address: selectedMeta.fullAddress || selectedMeta.displayName || prev.address,
                        latitude: selectedMeta.latitude ?? prev.latitude,
                        longitude: selectedMeta.longitude ?? prev.longitude
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, propertyName: name }));
                    }
                  }}
                  placeholder="e.g. Apex Business Tower, Godrej BKC, GIFT One Tower..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  BUILDING GRADE
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Grade A+</option>
                  <option>Grade A</option>
                  <option>Grade B</option>
                  <option>Grade C</option>
                </select>
              </div>
            </div>

            {/* Micro-market, City, State, Pincode */}
            <div className="p-4 rounded-2xl bg-teal-50/30 border border-teal-100/70 space-y-3">
              <span className="text-[10px] font-black text-[#0F8B7D] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} /> Locality & Postal Details
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    LOCALITY / MICRO-MARKET
                  </label>
                  <input
                    type="text"
                    value={formData.microMarket}
                    onChange={(e) => setFormData({ ...formData, microMarket: e.target.value })}
                    placeholder="e.g. Bandra Kurla Complex (BKC)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    CITY *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    STATE
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    PINCODE
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 400051"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    FULL PHYSICAL ADDRESS
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Plot C-59, G-Block, Bandra Kurla Complex, Bandra East, Mumbai 400051"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                    METRO / TRANSIT PROXIMITY
                  </label>
                  <input
                    type="text"
                    value={formData.metroDistance}
                    onChange={(e) => setFormData({ ...formData, metroDistance: e.target.value })}
                    placeholder="e.g. 400m from Metro Line 3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Map Pin Locator */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                INTERACTIVE MAP PIN PICKER (DRAG TO ADJUST PRECISE BUILDING ENTRANCE)
              </label>
              <MapPinPicker
                lat={formData.latitude}
                lng={formData.longitude}
                onChange={(newLat, newLng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: newLat,
                    longitude: newLng
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 3: SIZE / AREA (SFT / SMT) & OFFICE CONFIGURATION
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  3. Size, Area Dimensions & Office Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Define area metrics and workstation capacity according to Indian commercial standards.
                </p>
              </div>

              {/* Area Unit Toggle (Sft vs Smt) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleUnitToggle("sft")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    areaUnit === "sft"
                      ? "bg-[#0F8B7D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sq. Ft (Sft)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle("smt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    areaUnit === "smt"
                      ? "bg-[#0F8B7D] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sq. Mtr (Smt)
                </button>
              </div>
            </div>

            {/* Area Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    SUPER BUILT-UP / TOTAL AREA ({areaUnit.toUpperCase()}) *
                  </label>
                  <span className="text-[9px] font-bold text-[#0F8B7D]">
                    {areaUnit === "sft"
                      ? `≈ ${(parseFloat(formData.totalArea) / 10.7639 || 0).toFixed(1)} Smt`
                      : `≈ ${(parseFloat(formData.totalArea) * 10.7639 || 0).toFixed(0)} Sft`}
                  </span>
                </div>
                <input
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                  placeholder="e.g. 12500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    CARPET AREA ({areaUnit.toUpperCase()})
                  </label>
                  <span className="text-[9px] font-bold text-slate-400">Usable Area</span>
                </div>
                <input
                  type="number"
                  value={formData.carpetArea}
                  onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                  placeholder="e.g. 9800"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                />
              </div>

              {formData.primaryCategory === "land" && (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    PLOT / LAND AREA ({areaUnit.toUpperCase()})
                  </label>
                  <input
                    type="number"
                    value={formData.plotArea}
                    onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                  />
                </div>
              )}
            </div>

            {/* DESCRIBE YOUR OFFICE: Cabins, Meeting Rooms, Min Seats */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={15} className="text-[#0F8B7D]" /> Describe Your Office / Workspace Configuration
                </span>
                <span className="text-[10px] font-bold text-slate-400">Executive & Seat Layout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* No of Cabins */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    NO OF CABINS (EXECUTIVE / DIRECTOR)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, noOfCabins: Math.max(0, formData.noOfCabins - 1) })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={formData.noOfCabins}
                      onChange={(e) => setFormData({ ...formData, noOfCabins: parseInt(e.target.value) || 0 })}
                      className="w-16 text-center text-sm font-black text-slate-900 border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, noOfCabins: formData.noOfCabins + 1 })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* No of Meeting Rooms */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    NO OF MEETING ROOMS
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, noOfMeetingRooms: Math.max(0, formData.noOfMeetingRooms - 1) })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={formData.noOfMeetingRooms}
                      onChange={(e) => setFormData({ ...formData, noOfMeetingRooms: parseInt(e.target.value) || 0 })}
                      className="w-16 text-center text-sm font-black text-slate-900 border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, noOfMeetingRooms: formData.noOfMeetingRooms + 1 })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Min No of Seats */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    MIN NO OF SEATS (WORKSTATIONS)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, minSeats: Math.max(0, formData.minSeats - 5) })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={formData.minSeats}
                      onChange={(e) => setFormData({ ...formData, minSeats: parseInt(e.target.value) || 0 })}
                      className="w-20 text-center text-sm font-black text-slate-900 border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, minSeats: formData.minSeats + 5 })}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Floor Details & Staircases */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    FLOOR POSITION
                  </label>
                  <input
                    type="text"
                    value={formData.floorNumber}
                    onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                    placeholder="e.g. 4th Floor or Entire Building"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    TOTAL FLOORS IN TOWER
                  </label>
                  <input
                    type="text"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                    placeholder="e.g. 14 Floors"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    NO OF STAIRCASES (FIRE EXIT + MAIN) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.noOfStaircases}
                      onChange={(e) => setFormData({ ...formData, noOfStaircases: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                    />
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">NBC Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 4: AVAILABLE FEATURES & SPECIALIZED ENGINEERING
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                4. Available Space Features & Technical Engineering
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mark interior specifications, HVAC, fire life safety, and critical technical redundancy.
              </p>
            </div>

            {/* INTERIOR FEATURES MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  FURNISHING STATUS *
                </label>
                <select
                  value={formData.furnishingStatus}
                  onChange={(e) => setFormData({ ...formData, furnishingStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Fully Furnished</option>
                  <option>Semi-Furnished</option>
                  <option>Bareshell / Unfurnished</option>
                  <option>Warm Shell</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  CENTRAL AC / HVAC TYPE *
                </label>
                <select
                  value={formData.centralAcType}
                  onChange={(e) => setFormData({ ...formData, centralAcType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Central Air Conditioning</option>
                  <option>VRV/VRF System</option>
                  <option>Split ACs</option>
                  <option>Chilled Water System</option>
                  <option>None</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  WASHROOM FACILITY *
                </label>
                <select
                  value={formData.washroomType}
                  onChange={(e) => setFormData({ ...formData, washroomType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option value="private">Private Washroom (Inside Unit)</option>
                  <option value="shared">Shared Washroom (Common Floor)</option>
                  <option value="both">Both Private & Shared</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  PANTRY ARRANGEMENT
                </label>
                <select
                  value={formData.pantryType}
                  onChange={(e) => setFormData({ ...formData, pantryType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Wet Pantry (Sink + Water Line)</option>
                  <option>Dry Pantry</option>
                  <option>Full Cafeteria Setup</option>
                  <option>None</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  FLOORING MATERIAL / DETAILS
                </label>
                <select
                  value={formData.floorDetails}
                  onChange={(e) => setFormData({ ...formData, floorDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F8B7D]"
                >
                  <option>Vitrified Tiles & Carpet</option>
                  <option>Commercial Grade Carpet</option>
                  <option>Hardwood / Luxury Vinyl</option>
                  <option>Bare Concrete</option>
                  <option>Industrial Epoxy</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  LIFTS AVAILABLE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formData.passengerLifts}
                    onChange={(e) => setFormData({ ...formData, passengerLifts: parseInt(e.target.value) || 0 })}
                    placeholder="Passenger: 4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <input
                    type="number"
                    value={formData.serviceLifts}
                    onChange={(e) => setFormData({ ...formData, serviceLifts: parseInt(e.target.value) || 0 })}
                    placeholder="Service: 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Features Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.conferenceRoom}
                  onChange={(e) => setFormData({ ...formData, conferenceRoom: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F8B7D] focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-800">Conference Room</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reception}
                  onChange={(e) => setFormData({ ...formData, reception: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F8B7D] focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-800">Reception Area</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visitorParkingAvailable}
                  onChange={(e) => setFormData({ ...formData, visitorParkingAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0F8B7D] focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-800">Visitor Parking</span>
              </label>
            </div>

            {/* SPECIALIZED TECHNICAL: Fire Safety, Oxygen Duct, UPS */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={15} className="text-amber-600" /> Life Safety, Oxygen Duct & UPS Infrastructure
                </span>
                <span className="text-[10px] font-bold text-amber-700">Critical Technical Redundancy</span>
              </div>

              {/* Fire Safety Checklist */}
              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-2">
                  FIRE SAFETY EQUIPMENT & MEASURES (SELECT ALL ACTIVE) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    "Smoke Detectors",
                    "Automatic Sprinklers",
                    "Fire Hydrant & Hose Reels",
                    "Fire Extinguishers",
                    "Emergency Fire Exit Signage",
                    "Public Address System"
                  ].map((feat) => {
                    const checked = formData.fireSafetyFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFireFeature(feat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-left cursor-pointer transition-all flex items-center gap-2 ${
                          checked
                            ? "bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black ${
                          checked ? "bg-amber-600 text-white" : "border border-slate-300"
                        }`}>
                          {checked ? "✓" : ""}
                        </span>
                        <span>{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Oxygen Duct & UPS Available */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/60">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="oxygenCheck"
                    checked={formData.oxygenDuctAvailable}
                    onChange={(e) => setFormData({ ...formData, oxygenDuctAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0F8B7D] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="oxygenCheck" className="text-xs font-black text-slate-900 cursor-pointer block">
                      Oxygen Duct Available
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Dedicated pipeline ducting for cleanroom, diagnostic, medical, or specialized HVAC setups.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.upsAvailable}
                        onChange={(e) => setFormData({ ...formData, upsAvailable: e.target.checked })}
                        className="w-4 h-4 rounded text-[#0F8B7D] cursor-pointer"
                      />
                      <span>UPS Available (Online Power Backup)</span>
                    </label>
                    <Zap size={14} className="text-amber-500" />
                  </div>
                  {formData.upsAvailable && (
                    <input
                      type="text"
                      value={formData.upsKva}
                      onChange={(e) => setFormData({ ...formData, upsKva: e.target.value })}
                      placeholder="e.g. 60 KVA Online Central UPS"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 5: CAMPUS AMENITIES & STATUTORY COMPLIANCE
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                5. Campus Amenities, Ownership Type & Statutory Certificates
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified compliance certifications (Fire NOC, OC) and shared facility amenities.
              </p>
            </div>

            {/* AMENITIES CHECKLIST */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  BUILDING & CAMPUS AMENITIES (MARK ALL AVAILABLE) *
                </label>
                <span className="text-[10px] font-bold text-[#0F8B7D]">
                  {formData.amenities.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[
                  "Maintenance Staff",
                  "Water Storage (24x7)",
                  "Waste Disposal & STP",
                  "Wheelchair Accessibility",
                  "Cafeteria / Food Court",
                  "DG (Diesel Generator)",
                  "CCTV Surveillance (24x7)",
                  "Visitor Parking",
                  "Security Guard (24x7)",
                  "100% Power Backup",
                  "Intercom Facility",
                  "High-Speed Lifts"
                ].map((amenity) => {
                  const active = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all flex items-center justify-between ${
                        active
                          ? "border-[#0F8B7D] bg-teal-50/50 text-slate-900 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      <span className="truncate pr-1">{amenity}</span>
                      {active && <Check size={14} className="text-[#0F8B7D] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OWNERSHIP TYPE & STATUTORY COMPLIANCE */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#0F8B7D]" /> Ownership Type & Statutory Certifications
              </span>

              {/* Ownership Type */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                  OWNERSHIP TYPE *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    "Freehold",
                    "Leasehold",
                    "Co-operative Society",
                    "Power of Attorney"
                  ].map((own) => (
                    <button
                      key={own}
                      type="button"
                      onClick={() => setFormData({ ...formData, ownershipType: own as any })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center cursor-pointer transition-all ${
                        formData.ownershipType === own
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {own}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fire NOC Certified */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">IS YOUR OFFICE FIRE NOC CERTIFIED? *</span>
                    <span className="text-[10px] text-slate-400">Statutory requirement for commercial spaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isNocCertified: true })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        formData.isNocCertified ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Yes, Certified
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isNocCertified: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        !formData.isNocCertified ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Pending / In Process
                    </button>
                  </div>
                </div>

                {formData.isNocCertified && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                        FIRE NOC CERTIFICATE NUMBER
                      </label>
                      <input
                        type="text"
                        value={formData.fireNocNumber}
                        onChange={(e) => setFormData({ ...formData, fireNocNumber: e.target.value })}
                        placeholder="e.g. NOC/MH/FIR/2026/8492"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                        FIRE NOC EXPIRY DATE
                      </label>
                      <input
                        type="date"
                        value={formData.fireNocExpiry}
                        onChange={(e) => setFormData({ ...formData, fireNocExpiry: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Occupancy Certificate (OC) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">BUILDING OCCUPANCY CERTIFICATE (OC) *</span>
                    <span className="text-[10px] text-slate-400">Issued by local municipal corporation / urban authority</span>
                  </div>
                  <select
                    value={formData.occupancyCertStatus}
                    onChange={(e) => setFormData({ ...formData, occupancyCertStatus: e.target.value as any })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                  >
                    <option>Received (OC Available)</option>
                    <option>Applied / Awaited</option>
                    <option>Pending</option>
                  </select>
                </div>

                {formData.occupancyCertStatus.includes("Received") && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                      OC CERTIFICATE REFERENCE NUMBER
                    </label>
                    <input
                      type="text"
                      value={formData.occupancyCertNumber}
                      onChange={(e) => setFormData({ ...formData, occupancyCertNumber: e.target.value })}
                      placeholder="e.g. OC/MCGM/2025/1190"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 6: COMMERCIAL PRICING, MEDIA & LIVE PREVIEW
            ═══════════════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                6. Commercial Pricing, Media & Real-Time Listing Preview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Finalize financial terms and review the live property card before publishing.
              </p>
            </div>

            {/* DYNAMIC COMMERCIAL PRICING (RENT VS SELL) */}
            <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-4">
              <span className="text-xs font-black text-[#0F8B7D] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={15} /> Commercial Financial Structure ({formData.intent === "rent" ? "Lease Model" : "Sale Terms"})
              </span>

              {formData.intent === "rent" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      EXPECTED RENT (₹ / SQFT / MONTH) *
                    </label>
                    <input
                      type="number"
                      value={formData.baseRentPerSqft}
                      onChange={(e) => setFormData({ ...formData, baseRentPerSqft: e.target.value })}
                      placeholder="e.g. 185"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      CAM CHARGES (₹ / SQFT / MONTH)
                    </label>
                    <input
                      type="number"
                      value={formData.camPerSqft}
                      onChange={(e) => setFormData({ ...formData, camPerSqft: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      SECURITY DEPOSIT
                    </label>
                    <select
                      value={formData.securityDepositMonths}
                      onChange={(e) => setFormData({ ...formData, securityDepositMonths: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    >
                      <option>3 Months</option>
                      <option>6 Months</option>
                      <option>9 Months</option>
                      <option>12 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      LOCK-IN PERIOD
                    </label>
                    <select
                      value={formData.lockInPeriodMonths}
                      onChange={(e) => setFormData({ ...formData, lockInPeriodMonths: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    >
                      <option>12 Months</option>
                      <option>24 Months</option>
                      <option>36 Months</option>
                      <option>60 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      ANNUAL ESCALATION %
                    </label>
                    <select
                      value={formData.annualEscalationPct}
                      onChange={(e) => setFormData({ ...formData, annualEscalationPct: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    >
                      <option>5%</option>
                      <option>7.5%</option>
                      <option>10%</option>
                      <option>15% every 3 yrs</option>
                    </select>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ESTIMATED MONTHLY CASHFLOW</span>
                    <span className="text-sm font-black text-[#0F8B7D]">
                      ₹{(((parseFloat(formData.baseRentPerSqft) || 0) + (parseFloat(formData.camPerSqft) || 0)) * (getNormalizedAreaInSft() || 0)).toLocaleString("en-IN")} / mo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      TOTAL EXPECTED PRICE (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.totalSellingPrice}
                      onChange={(e) => setFormData({ ...formData, totalSellingPrice: e.target.value })}
                      placeholder="e.g. 185000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900"
                    />
                    <span className="text-[10px] font-bold text-[#0F8B7D] mt-0.5 block">
                      ₹{((parseFloat(formData.totalSellingPrice) || 0) / 10000000).toFixed(2)} Crores
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      BOOKING / TOKEN AMOUNT (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.bookingTokenAmount}
                      onChange={(e) => setFormData({ ...formData, bookingTokenAmount: e.target.value })}
                      placeholder="e.g. 2100000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      POSSESSION STATUS
                    </label>
                    <select
                      value={formData.possessionStatus}
                      onChange={(e) => setFormData({ ...formData, possessionStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    >
                      <option>Ready to Move</option>
                      <option>Within 30 Days</option>
                      <option>Under Construction</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* MEDIA & MULTI-IMAGE UPLOAD SUITE */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
                <div>
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#0F8B7D]" />
                    PROPERTY SHOWCASE MEDIA & PHOTO GALLERY
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Upload high-resolution property photos (multi-image upload supported). First photo is your main listing cover.
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setMediaMode("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mediaMode === "upload" ? "bg-white text-[#0F8B7D] shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <UploadCloud size={13} />
                    <span>Upload Photos</span>
                    {(formData.galleryImages?.length || 0) > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-teal-100 text-teal-800 font-black">
                        {formData.galleryImages.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode("presets")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mediaMode === "presets" ? "bg-white text-[#0F8B7D] shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Layers size={13} />
                    <span>Stock Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mediaMode === "url" ? "bg-white text-[#0F8B7D] shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>URL Link</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: UPLOAD PHOTOS (SINGLE & MULTIPLE) */}
              {mediaMode === "upload" && (
                <div className="space-y-4">
                  {/* Drag & Drop Dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? "border-[#0F8B7D] bg-teal-50/70 scale-[1.01]"
                        : "border-slate-300 hover:border-[#0F8B7D] bg-white hover:bg-teal-50/20 shadow-xs"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8B7D] shadow-xs">
                      {isProcessingImages ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <UploadCloud size={28} />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        {isDragging ? "Drop images now..." : "Click to browse or Drag & Drop multiple photos"}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Supports <span className="font-bold text-slate-700">JPG, PNG, WEBP</span> (Multiple file selection enabled)
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessingImages}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Select Photos from Computer</span>
                    </button>
                  </div>

                  {/* Uploaded Gallery Grid */}
                  {formData.galleryImages && formData.galleryImages.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Listing Gallery ({formData.galleryImages.length} Photos)</span>
                          <span className="text-[10px] text-slate-400 font-normal lowercase">(click any photo to set as cover)</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] font-bold text-[#0F8B7D] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add More
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                galleryImages: [templateImages[0].url],
                                imageUrl: templateImages[0].url
                              }));
                              showToast("Reset photo gallery to default template.", "info");
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {formData.galleryImages.map((imgUrl, idx) => {
                          const isPrimary = formData.imageUrl === imgUrl;
                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-2xl overflow-hidden border-2 aspect-video bg-slate-100 transition-all ${
                                isPrimary
                                  ? "border-[#0F8B7D] ring-2 ring-teal-200 shadow-md"
                                  : "border-slate-200 hover:border-slate-400"
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Property ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => handleSetCoverPhoto(imgUrl)}
                              />

                              {/* Index pill */}
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-black backdrop-blur-xs">
                                #{idx + 1}
                              </span>

                              {/* Primary badge */}
                              {isPrimary && (
                                <span className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#0F8B7D] text-white text-[9px] font-black text-center shadow-xs flex items-center justify-center gap-1">
                                  <Star size={10} className="fill-white" /> Primary Cover
                                </span>
                              )}

                              {/* Action Buttons on Hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverPhoto(imgUrl)}
                                    title="Set as Main Cover"
                                    className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                  >
                                    <Star size={10} /> Cover
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  title="Delete Photo"
                                  className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STOCK COMMERCIAL PRESETS */}
              {mediaMode === "presets" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {templateImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTemplate(img.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 text-left cursor-pointer transition-all aspect-video group ${
                          formData.imageUrl === img.url ? "border-[#0F8B7D] shadow-md ring-2 ring-teal-200" : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-2 flex items-end justify-between">
                          <span className="text-[10px] font-bold text-white leading-tight truncate">{img.label}</span>
                          {formData.imageUrl === img.url && (
                            <span className="px-1.5 py-0.5 rounded bg-teal-500 text-white text-[8px] font-black">Cover</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM URL LINK */}
              {mediaMode === "url" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Enter custom image URL (https://images.unsplash.com/...)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomUrl}
                      className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Add & Set Cover
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE PREVIEW CARD */}
            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-teal-400" /> Real-Time Listing Card Preview
                </span>
                <span className="text-[10px] font-bold text-slate-400">Visible to Public & Enterprise Tenants</span>
              </div>

              <div className="p-5 flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
                  <div className="h-40 rounded-2xl overflow-hidden relative border border-slate-200 bg-slate-100">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900/90 text-white backdrop-blur-xs">
                      {formData.grade}
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0F8B7D] text-white">
                      {formData.intent === "rent" ? "For Lease" : "For Sale"}
                    </span>
                    {(formData.galleryImages?.length || 0) > 1 && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon size={10} /> {formData.galleryImages.length} Photos
                      </span>
                    )}
                  </div>

                  {/* Mini Gallery Strip in Preview */}
                  {(formData.galleryImages?.length || 0) > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {formData.galleryImages.slice(0, 5).map((thumb, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: thumb })}
                          title={`Preview photo #${tIdx + 1}`}
                          className={`w-10 h-8 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            formData.imageUrl === thumb ? "border-[#0F8B7D] scale-105" : "border-slate-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={thumb} alt={`thumb ${tIdx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {formData.galleryImages.length > 5 && (
                        <div className="w-10 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                          +{formData.galleryImages.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {formData.propertyName || "Commercial Tower / Workspace"}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                        <MapPin size={12} className="text-[#0F8B7D]" />
                        {formData.microMarket ? `${formData.microMarket}, ` : ""}{formData.city} • {formData.floorNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      {formData.intent === "rent" ? (
                        <>
                          <span className="text-base font-black text-[#0F8B7D]">
                            ₹{formData.baseRentPerSqft}<span className="text-xs font-normal text-slate-500">/sqft</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">+₹{formData.camPerSqft} CAM</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base font-black text-[#0F8B7D]">
                            ₹{((parseFloat(formData.totalSellingPrice) || 0) / 10000000).toFixed(2)} Cr
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            ₹{Math.round((parseFloat(formData.totalSellingPrice) || 0) / (getNormalizedAreaInSft() || 1))} /sqft
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-700">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Area</span>
                      <span>{getNormalizedAreaInSft().toLocaleString("en-IN")} Sft</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Seats</span>
                      <span>{formData.minSeats} Workstations</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Cabins</span>
                      <span>{formData.noOfCabins} Cabins</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Ownership</span>
                      <span className="truncate block">{formData.ownershipType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Fire NOC</span>
                      <span className={formData.isNocCertified ? "text-emerald-700 font-black" : "text-amber-600 font-black"}>
                        {formData.isNocCertified ? "Certified" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                      {formData.furnishingStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                      {formData.centralAcType}
                    </span>
                    {formData.upsAvailable && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-800 border border-amber-200">
                        ⚡ Online UPS ({formData.upsKva.split(" ")[0]})
                      </span>
                    )}
                    {formData.oxygenDuctAvailable && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-bold text-teal-800 border border-teal-200">
                        🧪 Oxygen Duct
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            FOOTER NAVIGATION & PUBLISH ACTION
            ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentStep === 1 ? "opacity-30 pointer-events-none" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0c7267] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublish}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Publish Property Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instant Tenant Invitation Modal right after registration */}
      {createdPropForInvite && (
        <TenantInviteModal
          isOpen={Boolean(createdPropForInvite)}
          onClose={() => {
            setCreatedPropForInvite(null);
            router.push(redirectPath || (portalRole === "broker" ? "/leasing" : "/properties/registry"));
          }}
          property={createdPropForInvite}
        />
      )}
    </div>
  );
}
