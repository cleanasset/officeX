"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, Building, Boxes, LayoutGrid, Calendar, FileText, Handshake,
  CheckCircle2, KeyRound, ShieldCheck, Search,
  MapPin, Users, Sparkles, ArrowRight, ArrowUpRight,
  Filter, Check, Star, Phone, Clock, ChevronRight,
  SlidersHorizontal, BadgePercent, Award, Shield, Eye,
  Ticket, Briefcase, Presentation, Loader2, X
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import EnquirySlideIn from "@/components/marketing/EnquirySlideIn";
import Footer from "@/components/Footer";
import OfficeSpaceCalculator from "@/components/marketplace/OfficeSpaceCalculator";
import {
  TOP_METROS,
  EMERGING_HUBS,
  ALL_MARKETPLACE_CITIES,
} from "@/data/marketplace-cities";

export default function PropertyMarketplacePage() {
  const router = useRouter();
  const [slideInOpen, setSlideInOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  const [detectedLocationBadge, setDetectedLocationBadge] = useState<string | null>(null);
  type SolutionType = "longterm" | "daypass" | "events" | "virtual";

  const [activeSolution, setActiveSolution] = useState<SolutionType>("longterm");
  const [activeSubPills, setActiveSubPills] = useState<Record<SolutionType, string>>({
    longterm: "office",
    daypass: "meeting",
    events: "coworking",
    virtual: "company",
  });
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTeamSize, setSelectedTeamSize] = useState("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [districtFilter, setDistrictFilter] = useState("all");

  // Synchronize city selection across all sections and persist to localStorage
  const handleCityChange = (newCity: string, isManual: boolean = true) => {
    setSelectedCity(newCity);
    const featuredMapped =
      newCity === "Delhi" || newCity === "Gurgaon" || newCity === "Noida"
        ? "Delhi NCR"
        : newCity === "Bangalore"
        ? "Bengaluru"
        : newCity;
    setFeaturedCity(featuredMapped);

    if (isManual && typeof window !== "undefined") {
      try {
        localStorage.setItem("officex_marketplace_city", newCity);
      } catch {}
    }

    const lower = newCity.toLowerCase();
    if (lower.includes("delhi") || lower.includes("gurgaon") || lower.includes("noida")) {
      setDistrictFilter("delhi-ncr");
    } else if (lower.includes("mumbai")) {
      setDistrictFilter("mumbai");
    } else if (lower.includes("bengaluru") || lower.includes("bangalore")) {
      setDistrictFilter("bengaluru");
    } else if (lower.includes("pune")) {
      setDistrictFilter("pune");
    } else if (lower.includes("hyderabad")) {
      setDistrictFilter("hyderabad");
    } else if (lower.includes("ahmedabad") || lower.includes("gandhinagar")) {
      setDistrictFilter("ahmedabad");
    }
  };

  // Auto-detect visitor location on first load (IP-based, zero permission prompts)
  useEffect(() => {
    // 1. Check if user already manually selected or saved a city
    const savedCity = typeof window !== "undefined" ? localStorage.getItem("officex_marketplace_city") : null;
    if (savedCity) {
      handleCityChange(savedCity, false);
      return;
    }

    // 2. Auto-detect from server IP headers / geo lookup
    async function autoDetectLocation() {
      try {
        const res = await fetch("/api/marketplace/detect-location");
        if (res.ok) {
          const data = await res.json();
          if (data?.city) {
            handleCityChange(data.city, false);
            setDetectedLocationBadge(data.rawCity || data.city);
            try {
              localStorage.setItem("officex_marketplace_city", data.city);
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Marketplace location auto-detection error:", err);
      }
    }
    autoDetectLocation();
  }, []);

  // Google Maps / Places Live Autocomplete State for Marketplace
  const [geoSuggestions, setGeoSuggestions] = useState<any[]>([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showGeoDropdown, setShowGeoDropdown] = useState(false);
  const geoDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowGeoDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationInputChange = (val: string) => {
    setSearchLocationQuery(val);
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    if (val.trim().length < 2) {
      setGeoSuggestions([]);
      setShowGeoDropdown(false);
      return;
    }
    geoDebounceRef.current = setTimeout(async () => {
      setIsGeoLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(val.trim())}&city=${encodeURIComponent(selectedCity)}`
        );
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.results) ? data.results : [];
          setGeoSuggestions(items);
          setShowGeoDropdown(items.length > 0);
        }
      } catch (err) {
        console.warn("Marketplace geocode search error:", err);
      } finally {
        setIsGeoLoading(false);
      }
    }, 280);
  };

  const handleSelectGeoSuggestion = (item: any) => {
    const chosenName = item.buildingName || item.area || item.displayName?.split(",")?.[0] || item.fullAddress;
    setSearchLocationQuery(chosenName);
    if (item.city) {
      setSelectedCity(item.city);
    }
    setShowGeoDropdown(false);
    setGeoSuggestions([]);
  };

  // Tab configurations ensuring 100% equal height and identical structure across all 4 solutions
  const solutionConfigs: Record<
    SolutionType,
    {
      pills: { id: string; label: string; icon: React.ElementType }[];
      descriptions: Record<string, string>;
      buttonText: string;
      placeholder: string;
    }
  > = {
    longterm: {
      pills: [
        { id: "office", label: "Office Space", icon: Building2 },
        { id: "industry", label: "Industry", icon: Building },
        { id: "warehouse", label: "Warehouse", icon: Boxes },
      ],
      descriptions: {
        office: "Grade-A corporate office floor plates, commercial towers, and private enterprise suites",
        industry: "Manufacturing facilities, industrial sheds, factories, and development plots",
        warehouse: "Grade-A warehousing, logistics parks, cold storage, and regional distribution centers",
      },
      buttonText: "View Spaces",
      placeholder: "Search location, industrial zone, or tech park...",
    },
    daypass: {
      pills: [
        { id: "meeting", label: "Meeting Rooms", icon: Users },
        { id: "training", label: "Training Rooms", icon: Presentation },
        { id: "event", label: "Event Spaces", icon: Calendar },
        { id: "single", label: "Day Pass", icon: Ticket },
      ],
      descriptions: {
        meeting: "Fully equipped conference and meeting rooms with video conferencing, whiteboard, and high-speed Wi-Fi",
        training: "Tech-enabled training halls and workshop suites with modular seating layouts",
        event: "Townhall venues, corporate offsite spaces, and networking event arenas",
        single: "On-demand flexible day passes with access to open hot desks and executive business lounges",
      },
      buttonText: "Find Rooms & Venues",
      placeholder: "Search meeting rooms, training halls, or event spaces...",
    },
    events: {
      pills: [
        { id: "coworking", label: "Coworking Space", icon: Building2 },
        { id: "managed", label: "Managed Office", icon: Building },
        { id: "cabins", label: "Private Team Cabins", icon: Users },
      ],
      descriptions: {
        coworking: "Dedicated desks, flexible hot desks, and private seats in Grade-A coworking hubs",
        managed: "Bespoke enterprise managed office floors and private corporate suites with zero capex",
        cabins: "Sound-insulated lockable acoustic cabins with meeting room credits and high-speed Wi-Fi",
      },
      buttonText: "Find Workspaces",
      placeholder: "Search coworking hubs or managed offices...",
    },
    virtual: {
      pills: [
        { id: "company", label: "Company Registration", icon: FileText },
        { id: "gst", label: "GST Registration", icon: ShieldCheck },
        { id: "mailing", label: "Business Mailing Address", icon: Briefcase },
      ],
      descriptions: {
        company: "MCA compliant registered corporate address with rent agreement and NOC",
        gst: "State-level commercial address for GST compliance and official verification",
        mailing: "Prime business address with mail reception and digital scanning",
      },
      buttonText: "Explore Virtual Plans",
      placeholder: "Search prime business addresses...",
    },
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (searchLocationQuery) params.set("q", searchLocationQuery);
    if (activeSolution === "daypass") {
      params.set("vertical", activeSubPills.daypass === "single" ? "day_pass" : "meeting_room");
    } else if (activeSolution === "events") {
      params.set("vertical", activeSubPills.events === "managed" ? "managed_office" : "coworking");
    } else if (activeSolution === "virtual") {
      params.set("vertical", "virtual_office");
    } else {
      if (activeSubPills.longterm === "managed") {
        params.set("vertical", "managed_office");
      } else if (activeSubPills.longterm === "warehouse" || activeSubPills.longterm === "industry") {
        params.set("vertical", "commercial");
      } else {
        params.set("vertical", "all");
      }
    }
    router.push(`/marketplace/search?${params.toString()}`);
  };

  // OfficeX Workspace Models without pricing
  const workspaceModels = [
    {
      id: "managed",
      title: "Enterprise Managed Offices",
      subtitle: "Bespoke private floors custom-built for teams of 30 to 500+",
      badge: "Most Popular for Enterprises",
      image: "/images/workspace_managed_suite.jpg",
      perks: ["Zero Capex & Fit-out Cost", "Dedicated Reception & IT", "Custom Corporate Branding", "All-inclusive CAM & Utilities"]
    },
    {
      id: "coworking",
      title: "Dedicated Coworking Desks",
      subtitle: "Plug-and-play dedicated desks with 24/7 access in Grade-A hubs",
      badge: "Instant Move-in",
      image: "/images/workspace_dedicated_desks.jpg",
      perks: ["High-Speed Fiber Internet", "Meeting Room Credits", "Pantry & Premium Coffee", "Community & Networking Events"]
    },
    {
      id: "cabin",
      title: "Private Team Cabins",
      subtitle: "Lockable sound-insulated acoustic suites for 4 to 25 members",
      badge: "High Privacy",
      image: "/images/workspace_private_cabin.jpg",
      perks: ["Biometric Access Control", "Whiteboard & Ergonomic Seating", "Daily Sanitization", "Mail & Package Handling"]
    },
    {
      id: "warmshell",
      title: "Commercial Warm & Bare Shells",
      subtitle: "Institutional floor plates ready for long-term commercial leases",
      badge: "Direct Landlord Leases",
      image: "/images/showcase_commercial_warmshell.jpg",
      perks: ["100% Power & DG Backup", "Multi-Level Car Parking", "Fire NOC & OC Certified", "Flexible Rent-free Fit-out"]
    }
  ];

  // Top Workspace Hubs across India (Coworking, Managed Suites & Enterprise Floors)
  const topWorkspaceHubs = [
    // Ahmedabad Hubs
    {
      id: "sg-highway",
      name: "SG Highway & Makarba",
      shortName: "SG Highway IT Corridor",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "SG Highway",
      region: "ahmedabad",
      tag: "Top Tech Corridor",
      spaces: "16+ Verified Spaces",
      desc: "Ahmedabad's premier corporate corridor hosting Grade-A coworking hubs like Awfis, Smartworks, and DevX.",
      image: "/images/district_sghighway.jpg",
      highlights: ["Titanium City Center", "Awfis & Smartworks", "S.P. Ring Road Access"],
    },
    {
      id: "prahlad-nagar",
      name: "Prahlad Nagar & Bodakdev",
      shortName: "Prahlad Nagar CBD",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "Bodakdev",
      region: "ahmedabad",
      tag: "Prime Executive CBD",
      spaces: "16+ Verified Spaces",
      desc: "Upscale corporate boulevard with boutique executive suites, fine dining, and premier retail hubs.",
      image: "/images/district_prahladnagar.jpg",
      highlights: ["Opulence & Karyaco", "Sindhu Bhavan Proximity", "Executive Furnished Suites"],
    },
    {
      id: "thaltej",
      name: "Thaltej & Sindhu Bhavan",
      shortName: "Sindhu Bhavan High-Street",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "Thaltej",
      region: "ahmedabad",
      tag: "High-Street Corporate",
      spaces: "8+ Verified Spaces",
      desc: "The fastest-growing executive hub with premium coworking spaces including Sentient, Incuspaze, and URSA.",
      image: "/images/space_prahlad_capital.jpg",
      highlights: ["Sentient Coworking", "Incuspaze & URSA", "SBR Corporate Avenue"],
    },
    {
      id: "navrangpura",
      name: "Navrangpura & CG Road",
      shortName: "Central Financial Hub",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "Navrangpura",
      region: "ahmedabad",
      tag: "Central Business District",
      spaces: "17+ Verified Spaces",
      desc: "Core central business district with traditional banking headquarters and contemporary flexible workspaces.",
      image: "/images/showcase_single_tower.jpg",
      highlights: ["DevX & Sspacia", "CG Road Financial Belt", "Old City & Metro Access"],
    },
    {
      id: "vastrapur",
      name: "Vastrapur & IIM Road",
      shortName: "Vastrapur Innovation Hub",
      city: "Ahmedabad, Gujarat",
      searchCity: "Ahmedabad",
      searchQuery: "Vastrapur",
      region: "ahmedabad",
      tag: "Academic & Tech Hub",
      spaces: "10+ Verified Spaces",
      desc: "Thriving innovation corridor adjacent to IIM Ahmedabad, featuring Incuspaze, The First, and Vastrapur Lake.",
      image: "/images/workspace_managed_suite.jpg",
      highlights: ["Incuspaze Center", "IIM Ahmedabad Cluster", "Alpha One Mall"],
    },
    {
      id: "gift-city",
      name: "GIFT City IFSC, Gandhinagar",
      shortName: "GIFT City IFSC",
      city: "Gandhinagar / Ahmedabad",
      searchCity: "Ahmedabad",
      searchQuery: "GIFT City",
      region: "ahmedabad",
      tag: "Global FinTech IFSC",
      spaces: "5+ Verified Spaces",
      desc: "India's flagship International Financial Services Centre offering global banking and dual-currency trading.",
      image: "/images/district_giftcity.jpg",
      highlights: ["IFSC SEZ FinTech", "GIFT One Tower", "DevX & Incuspaze"],
    },
    // Bengaluru Hubs
    {
      id: "blr-hsr",
      name: "HSR Layout, Bengaluru",
      shortName: "HSR Startup Hub",
      city: "Bengaluru, Karnataka",
      searchCity: "Bangalore",
      searchQuery: "HSR Layout",
      region: "bengaluru",
      tag: "Unicorn Hub",
      spaces: "190+ Verified Spaces",
      desc: "The epicentre of Indian venture-backed startups with vibrant cafes, high-energy incubators, and enterprise floors.",
      image: "/images/district_bangaloreorr.jpg",
      highlights: ["WeWork & 91springboard", "Sector 1-7 Startups", "Outer Ring Road Link"],
    },
    {
      id: "blr-koramangala",
      name: "Koramangala, Bengaluru",
      shortName: "Koramangala CBD",
      city: "Bengaluru, Karnataka",
      searchCity: "Bangalore",
      searchQuery: "Koramangala",
      region: "bengaluru",
      tag: "Venture Capital Hub",
      spaces: "135+ Verified Spaces",
      desc: "Home to India's top tech founders, investors, and premier coworking communities across 8 blocks.",
      image: "/images/workspace_dedicated_desks.jpg",
      highlights: ["VC & Angel Cluster", "80 Feet Road Dining", "Enterprise Flex Desks"],
    },
    {
      id: "blr-whitefield",
      name: "Whitefield, Bengaluru",
      shortName: "Whitefield Tech Parks",
      city: "Bengaluru, Karnataka",
      searchCity: "Bangalore",
      searchQuery: "Whitefield",
      region: "bengaluru",
      tag: "Global Tech Campuses",
      spaces: "160+ Verified Spaces",
      desc: "Massive campus ecosystems hosting multinational GCCs, ITPL tech parks, and Purple Line metro stations.",
      image: "/images/showcase_office_techhorizon_hd.jpg",
      highlights: ["ITPL & EPIP Zone", "Purple Line Metro", "Enterprise Private Floors"],
    },
    {
      id: "blr-indiranagar",
      name: "Indiranagar, Bengaluru",
      shortName: "Indiranagar Lifestyle CBD",
      city: "Bengaluru, Karnataka",
      searchCity: "Bangalore",
      searchQuery: "Indiranagar",
      region: "bengaluru",
      tag: "Boutique Creative",
      spaces: "115+ Verified Spaces",
      desc: "Boutique creative workspaces nestled on 100 Feet and 12th Main Roads with elite connectivity.",
      image: "/images/hero_scene_campus_atrium.jpg",
      highlights: ["100 Feet Road", "Awfis & Indiqube", "Creative & Media Agencies"],
    },
    // Mumbai Hubs
    {
      id: "bkc-mumbai",
      name: "Bandra Kurla Complex (BKC)",
      shortName: "BKC Financial Hub",
      city: "Mumbai, Maharashtra",
      searchCity: "Mumbai",
      searchQuery: "Bandra Kurla Complex",
      region: "mumbai",
      tag: "Financial Capital",
      spaces: "43+ Verified Spaces",
      desc: "The nerve center of Indian banking, private equity, consulates, and Fortune 500 headquarters.",
      image: "/images/district_mumbaibkc.jpg",
      highlights: ["WeWork BKC & Godrej", "Jio World Centre", "Metro Line 3 Link"],
    },
    {
      id: "andheri-mumbai",
      name: "Andheri (East & West), Mumbai",
      shortName: "Andheri Metro Hub",
      city: "Mumbai, Maharashtra",
      searchCity: "Mumbai",
      searchQuery: "Andheri",
      region: "mumbai",
      tag: "Metro & Airport Hub",
      spaces: "110+ Verified Spaces",
      desc: "Western Mumbai's commercial nexus with proximity to Chhatrapati Shivaji Maharaj International Airport.",
      image: "/images/card_office_marketplace.jpg",
      highlights: ["Western Express Highway", "International Airport", "Chakala & MIDC"],
    },
    {
      id: "lower-parel-mumbai",
      name: "Lower Parel & Worli, Mumbai",
      shortName: "Lower Parel Corporate",
      city: "Mumbai, Maharashtra",
      searchCity: "Mumbai",
      searchQuery: "Lower Parel",
      region: "mumbai",
      tag: "Corporate High-Rise",
      spaces: "29+ Verified Spaces",
      desc: "Redeveloped mill district featuring high-end corporate towers, One World Center, and luxury retail.",
      image: "/images/space_gift_one_tower.jpg",
      highlights: ["One World Center", "Kamala Mills", "Boutique Managed Suites"],
    },
    // Delhi NCR Hubs
    {
      id: "cyber-city-gurgaon",
      name: "DLF Cyber City, Gurgaon",
      shortName: "Cyber City Hub",
      city: "Gurgaon, Haryana",
      searchCity: "Gurgaon",
      searchQuery: "DLF Cyber City",
      region: "delhi-ncr",
      tag: "Fortune 500 Hub",
      spaces: "46+ Verified Spaces",
      desc: "Futuristic integrated business district featuring direct Rapid Metro connectivity and world-class CyberHub.",
      image: "/images/district_cybercity.jpg",
      highlights: ["Rapid Metro Access", "CyberHub Dining", "Fortune 500 Campuses"],
    },
    {
      id: "connaught-place-delhi",
      name: "Connaught Place, Central Delhi",
      shortName: "CP Central CBD",
      city: "New Delhi, Delhi",
      searchCity: "Delhi",
      searchQuery: "Connaught Place",
      region: "delhi-ncr",
      tag: "Heritage Central CBD",
      spaces: "59+ Verified Spaces",
      desc: "India's most prestigious central address with Rajiv Chowk metro junction and colonial corporate arcades.",
      image: "/images/workspace_managed_suite.jpg",
      highlights: ["Rajiv Chowk Metro Interchange", "Inner & Outer Circles", "Awfis & Innov8 CP"],
    },
    {
      id: "sector-62-noida",
      name: "Sector 62 & 63, Noida",
      shortName: "Noida Tech Corridor",
      city: "Noida, Uttar Pradesh",
      searchCity: "Noida",
      searchQuery: "Sector 62",
      region: "delhi-ncr",
      tag: "Noida Tech Cluster",
      spaces: "100+ Verified Spaces",
      desc: "Noida's premier IT corridor directly connected by the Blue Line metro and Delhi-Meerut Expressway.",
      image: "/images/showcase_office_techhorizon_hd.jpg",
      highlights: ["Blue Line Metro", "Tech Park Campuses", "Value Enterprise Desks"],
    },
    // Pune Hubs
    {
      id: "baner-pune",
      name: "Baner & Balewadi, Pune",
      shortName: "Baner Tech Corridor",
      city: "Pune, Maharashtra",
      searchCity: "Pune",
      searchQuery: "Baner",
      region: "pune",
      tag: "Western IT Belt",
      spaces: "159+ Verified Spaces",
      desc: "Pune's fastest-expanding IT hub along Mumbai-Bengaluru Highway with high-density coworking supply.",
      image: "/images/district_sghighway.jpg",
      highlights: ["Mumbai-Pune Highway", "Balewadi High Street", "Tech & FinTech Clusters"],
    },
    // Hyderabad Hubs
    {
      id: "hitec-city-hyderabad",
      name: "HITEC City & Madhapur",
      shortName: "Cyberabad Tech Core",
      city: "Hyderabad, Telangana",
      searchCity: "Hyderabad",
      searchQuery: "HITEC City",
      region: "hyderabad",
      tag: "Cyberabad IT Core",
      spaces: "148+ Verified Spaces",
      desc: "The heartbeat of Hyderabad's IT economy, housing major global tech companies and Cyber Towers.",
      image: "/images/district_cybercity.jpg",
      highlights: ["Cyber Towers & Inorbit", "Durgam Cheruvu Metro", "Enterprise Campuses"],
    }
  ];
  const commercialDistricts = topWorkspaceHubs; // Backward compatibility alias

  // Real Database Marketplace Listings state for homepage showcase
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [featuredCity, setFeaturedCity] = useState("Ahmedabad");
  const [featuredTotal, setFeaturedTotal] = useState(116);

  const cityTabs = [
    { id: "Ahmedabad", label: "Ahmedabad", count: 115 },
    { id: "Bangalore", label: "Bengaluru", count: 1543 },
    { id: "Delhi NCR", label: "Delhi NCR", count: 1525 },
    { id: "Mumbai", label: "Mumbai", count: 483 },
    { id: "Pune", label: "Pune", count: 490 },
    { id: "Hyderabad", label: "Hyderabad", count: 388 },
    { id: "Chennai", label: "Chennai", count: 346 },
    { id: "Kolkata", label: "Kolkata", count: 230 },
    { id: "Jaipur", label: "Jaipur", count: 122 },
    { id: "Indore", label: "Indore", count: 95 },
    { id: "Kochi", label: "Kochi", count: 70 },
    { id: "Chandigarh", label: "Chandigarh", count: 60 },
    { id: "Goa", label: "Goa", count: 20 },
  ];

  useEffect(() => {
    let isCancelled = false;
    async function loadFeatured() {
      setIsLoadingFeatured(true);
      try {
        const res = await fetch(`/api/marketplace/listings?city=${encodeURIComponent(featuredCity)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setFeaturedListings(data.listings || []);
            setFeaturedTotal(data.pagination?.total || (data.listings?.length || 0));
          }
        }
      } catch (err) {
        console.warn("Featured listings error:", err);
      } finally {
        if (!isCancelled) setIsLoadingFeatured(false);
      }
    }
    loadFeatured();
    return () => { isCancelled = true; };
  }, [featuredCity]);

  // Current active solution config and pill data
  const currentConfig = solutionConfigs[activeSolution];
  const selectedPillId = activeSubPills[activeSolution] || currentConfig.pills[0].id;
  const currentDesc =
    currentConfig.descriptions[selectedPillId] ||
    currentConfig.descriptions[currentConfig.pills[0].id];

  const districtFilters = [
    { id: "all", label: "All Hubs", count: topWorkspaceHubs.length },
    { id: "ahmedabad", label: "Ahmedabad", count: topWorkspaceHubs.filter(d => d.region === "ahmedabad").length },
    { id: "bengaluru", label: "Bengaluru", count: topWorkspaceHubs.filter(d => d.region === "bengaluru").length },
    { id: "delhi-ncr", label: "Delhi NCR", count: topWorkspaceHubs.filter(d => d.region === "delhi-ncr").length },
    { id: "mumbai", label: "Mumbai", count: topWorkspaceHubs.filter(d => d.region === "mumbai").length },
    { id: "pune", label: "Pune", count: topWorkspaceHubs.filter(d => d.region === "pune").length },
    { id: "hyderabad", label: "Hyderabad", count: topWorkspaceHubs.filter(d => d.region === "hyderabad").length },
  ];

  const filteredDistricts = districtFilter === "all"
    ? commercialDistricts
    : commercialDistricts.filter(d => d.region === districtFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Universal Sticky Marketing Header */}
      <MarketingHeader activePath="/marketplace" />

      {/* 1. HERO SECTION (High-Contrast, Readable Marketplace Banner) */}
      <section className="relative pt-10 md:pt-14 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white min-h-[460px] flex flex-col justify-center">
        
        {/* Background Canvas — Crisp Marketplace Banner with Enhanced Readability Scrim */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/images/marketplace_myhq_hero.jpg"
            alt="Modern Flexible Coworking & Commercial Workspace"
            fill
            priority
            unoptimized
            className="object-cover object-center brightness-[0.55] contrast-[1.10]"
          />
          {/* Multi-tier gradient overlay ensuring 100% crystal-clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          
          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-teal-400/40 bg-teal-950/60 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-3 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Office / CRE Discovery Marketplace</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 max-w-3xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            Discover. Compare. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">Lease.</span>
          </h1>

          {/* Subhead */}
          <p className="text-sm sm:text-base text-slate-100 font-semibold max-w-xl mx-auto mb-3.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Flexible Commercial &amp; Office Spaces for Teams of Every Size
          </p>

          {/* Quick CalQ Calculator Link */}
          <div className="mb-6">
            <a
              href="#calq"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-teal-400/40 text-teal-300 text-xs font-bold transition-all shadow-md backdrop-blur-md cursor-pointer group"
            >
              <span>🧮</span>
              <span>Need to estimate your space? <b className="text-white">Try CalQ Space &amp; Rent Calculator</b></span>
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* OfficeX Multi-Tier Search Widget */}
          <div className="w-full max-w-3xl mx-auto">
            {/* Row 1: 4 Main Solution Tab Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-0">
              <button
                type="button"
                onClick={() => setActiveSolution("longterm")}
                className={`py-2.5 px-3 rounded-t-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSolution === "longterm"
                    ? "bg-white text-[#0F8B7D] font-extrabold shadow-md"
                    : "bg-slate-950/70 hover:bg-slate-950/90 text-white font-bold backdrop-blur-md border-t border-x border-white/20"
                }`}
              >
                <Building2 size={18} className={activeSolution === "longterm" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-xs sm:text-xs">Search Space</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("daypass")}
                className={`py-2 px-2.5 rounded-t-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSolution === "daypass"
                    ? "bg-white text-[#0F8B7D] font-extrabold shadow-md"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Calendar size={17} className={activeSolution === "daypass" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-[11.5px] sm:text-xs">Meetings &amp; Events</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("events")}
                className={`py-2 px-2.5 rounded-t-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSolution === "events"
                    ? "bg-white text-[#0F8B7D] font-extrabold shadow-md"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <LayoutGrid size={17} className={activeSolution === "events" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-[11.5px] sm:text-xs text-center leading-tight">Coworking / Managed Office</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSolution("virtual")}
                className={`py-2 px-2.5 rounded-t-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeSolution === "virtual"
                    ? "bg-white text-[#0F8B7D] font-extrabold shadow-md"
                    : "bg-black/55 hover:bg-black/75 text-white font-bold backdrop-blur-md border-t border-x border-white/15"
                }`}
              >
                <Briefcase size={17} className={activeSolution === "virtual" ? "text-[#0F8B7D]" : "text-white/80"} />
                <span className="text-[11.5px] sm:text-xs">Virtual Office</span>
              </button>
            </div>

            {/* Row 2: Active White Search Container — Compact & Shorter */}
            <div className="bg-white rounded-b-xl shadow-xl p-3 sm:p-4 border border-slate-200 text-left">
              {/* Row 1: Sub-category pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-2.5 min-h-[32px]">
                {currentConfig.pills.map((pill) => {
                  const PillIcon = pill.icon;
                  const isSelected = selectedPillId === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() =>
                        setActiveSubPills((prev) => ({
                          ...prev,
                          [activeSolution]: pill.id,
                        }))
                      }
                      className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "border-2 border-[#0F8B7D] bg-teal-50/80 text-[#0F8B7D] font-extrabold shadow-2xs"
                          : "border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold"
                      }`}
                    >
                      <PillIcon size={13} />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Contextual Description Bar (Compact 1 line) */}
              <div className="bg-slate-50 border border-slate-100 h-7 px-3 rounded-lg text-xs text-slate-600 font-medium flex items-center justify-center text-center mb-2.5">
                <span className="truncate">{currentDesc}</span>
              </div>

              {/* Row 3: Search Row */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* City Selector with Auto-Detect Indicator */}
                <div className="sm:w-52 shrink-0 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-tight">
                      City
                    </label>
                    {detectedLocationBadge && (
                      <span className="text-[9px] font-black text-[#0F8B7D] flex items-center gap-0.5">
                        <MapPin size={9} /> Auto-detected
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <optgroup label="⭐ Top Metros">
                      {TOP_METROS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count} spaces)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🚀 Popular Business Hubs">
                      {EMERGING_HUBS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count} spaces)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📍 All 89 Cities (A-Z)">
                      {ALL_MARKETPLACE_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count} spaces)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Location input with Live Google Maps Autocomplete */}
                <div ref={searchContainerRef} className="flex-1 relative">
                  <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0F8B7D] flex items-center gap-2 transition-all">
                    {isGeoLoading ? (
                      <Loader2 size={15} className="text-[#0F8B7D] animate-spin shrink-0" />
                    ) : (
                      <Search size={15} className="text-slate-400 shrink-0" />
                    )}
                    <input
                      type="text"
                      value={searchLocationQuery}
                      onChange={(e) => handleLocationInputChange(e.target.value)}
                      onFocus={() => {
                        if (geoSuggestions.length > 0) setShowGeoDropdown(true);
                      }}
                      placeholder={`${currentConfig.placeholder} in ${selectedCity}`}
                      className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                    {searchLocationQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchLocationQuery("");
                          setGeoSuggestions([]);
                          setShowGeoDropdown(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                        title="Clear"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Google Maps Live Suggestions Popover */}
                  {showGeoDropdown && geoSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in duration-150">
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-[#0F8B7D]">
                          <Sparkles size={11} /> Google Maps Verified Locations
                        </span>
                        <span>Click to search</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {geoSuggestions.map((item, idx) => {
                          const title = item.buildingName || item.displayName?.split(",")?.[0] || "Location";
                          const subtitle = item.fullAddress || item.displayName || "";
                          return (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => handleSelectGeoSuggestion(item)}
                              className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-teal-50/70 transition cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded-lg bg-teal-100/70 text-[#0F8B7D] flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin size={13} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {title}
                                  </span>
                                  {item.city && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                      {item.city}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{currentConfig.buttonText}</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WORKSPACE MODELS CATEGORIES (Compact, Sleek Category Cards) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              Tailored Commercial Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Workspaces by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mt-2 md:mt-0">
            Whether you need agile team cabins, turnkey enterprise suites, or whole corporate floor plates, we have verified inventory across all prime hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {workspaceModels.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
            >
              {/* Image Area (h-52: 208px - More than content area) */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={model.image}
                  alt={model.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#0F8B7D] font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-teal-200 shadow-2xs">
                  {model.badge}
                </span>
              </div>

              {/* Content Area (Compact ~140px) */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                    Commercial Model
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={model.title}>
                    {model.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate h-4 leading-4" title={model.subtitle}>
                    {model.subtitle}
                  </p>

                  <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                    {model.perks.slice(0, 2).map((perk, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]">
                        <Check size={10} className="text-[#0F8B7D] shrink-0" />
                        <span className="truncate">{perk}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Availability</span>
                    <span className="text-xs font-bold text-teal-700 leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Spaces
                    </span>
                  </div>
                  <button
                    onClick={() => setSlideInOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    <span>Enquire</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VERIFIED REAL PROPERTIES FEED */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200" id="spaces">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-[11px] font-black uppercase tracking-wider mb-2">
                <CheckCircle2 size={13} /> 100% Physically Audited Commercial Assets
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified Spaces in {featuredCity}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mt-1">
                Explore actual commercial office towers, managed enterprise suites, and coworking hubs with live pricing.
              </p>
            </div>

            <Link
              href={`/marketplace/search?city=${encodeURIComponent(featuredCity)}`}
              className="text-xs font-black text-[#0F8B7D] hover:underline flex items-center gap-1 mt-2 sm:mt-0 shrink-0"
            >
              View All {featuredTotal} Spaces in {featuredCity} <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* City Selection Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-4">
            {cityTabs.map((tab) => {
              const isActive =
                featuredCity === tab.id ||
                (tab.id === "Delhi NCR" && (featuredCity === "Delhi" || featuredCity === "Delhi NCR")) ||
                (tab.id === "Bangalore" && (featuredCity === "Bengaluru" || featuredCity === "Bangalore"));
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    handleCityChange(
                      tab.id === "Delhi NCR" ? "Delhi" : tab.id === "Bangalore" ? "Bengaluru" : tab.id
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#0F8B7D] text-white shadow-sm font-extrabold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          {isLoadingFeatured ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#0F8B7D] animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading verified properties in {featuredCity}...</p>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No live spaces found for {featuredCity}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {featuredListings.map((space) => {
                const img = space.images?.[0] || space.featuredImage || "/images/showcase_office_techhorizon_hd.jpg";
                const numPrice = space.startingPrice ? Number(space.startingPrice) : 8500;
                const formattedPrice = "₹" + Math.round(numPrice).toLocaleString("en-IN");
                let priceLabel = `${formattedPrice} / seat`;
                if (space.startingPriceUnit === "per_sqft_month" || space.vertical === "commercial") {
                  priceLabel = `${formattedPrice} / sq.ft.`;
                } else if (space.startingPriceUnit === "per_day" || space.vertical === "day_pass") {
                  priceLabel = `${formattedPrice} / day`;
                }

                const verticalLabel = (space.vertical || "Coworking").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

                return (
                  <div
                    key={space.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
                  >
                    {/* Image Area */}
                    <Link href={`/marketplace/${space.slug || space.id}`} className="relative h-52 w-full overflow-hidden bg-slate-100 shrink-0 block">
                      <img
                        src={img}
                        alt={space.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span className="bg-[#0F8B7D] text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                          {space.brandName || "Grade A"}
                        </span>
                        <span className="bg-white/95 backdrop-blur-xs text-emerald-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                          <Check size={9} strokeWidth={3} /> VERIFIED
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {space.totalAreaSqft ? `${Number(space.totalAreaSqft).toLocaleString("en-IN")} sqft` : (space.totalSeats ? `${space.totalSeats} seats` : verticalLabel)}
                      </div>
                    </Link>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                          {verticalLabel}
                        </span>
                        <Link href={`/marketplace/${space.slug || space.id}`}>
                          <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={space.name}>
                            {space.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate h-4 leading-4" title={space.locality || space.city}>
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{space.locality ? `${space.locality}, ${space.city}` : space.city}</span>
                        </p>

                        <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                          {(space.amenities || ["High-Speed WiFi", "100% DG Backup"]).slice(0, 2).map((f: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]">
                              <Check size={10} className="text-[#0F8B7D] shrink-0" />
                              <span className="truncate">{f}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block leading-none mb-0.5">Starting From</span>
                          <span className="text-xs font-black text-slate-900 leading-none">
                            {priceLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSlideInOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#0F8B7D] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Tour
                          </button>
                          <Link
                            href={`/marketplace/${space.slug || space.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Inspect <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. PRIME BUSINESS DISTRICTS (Ahmedabad & Metros) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B7D] text-[11px] font-black uppercase tracking-wider mb-2">
              <MapPin size={13} /> Popular Micro-Markets
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Popular Workspace Locations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mt-1.5 leading-relaxed">
              Find verified coworking spaces, private team cabins, and managed enterprise suites across India’s highest-demand business micro-markets. Zero brokerage, instant site visits.
            </p>
          </div>

          {/* Dynamic Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 shrink-0">
            {districtFilters.map((f) => {
              const isActive = districtFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setDistrictFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#0F8B7D] shadow-xs font-black border border-teal-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-teal-50 text-[#0F8B7D] font-black" : "bg-slate-200 text-slate-500 font-semibold"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Rich Photo Cards Grid - identical 4-column size & h-52 image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {filteredDistricts.map((district) => (
            <div
              key={district.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl hover:border-teal-400 transition-all duration-300 flex flex-col h-full justify-between group"
            >
              {/* Image Area (h-52: 208px - EXACT SAME AS SECTION 1 & 2) */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-900 shrink-0">
                <Image
                  src={district.image}
                  alt={district.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="backdrop-blur-md bg-white/95 text-teal-900 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/60 shadow-2xs">
                    {district.tag}
                  </span>
                  <span className="backdrop-blur-md bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-md border border-white/20 shadow-2xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {district.spaces}
                  </span>
                </div>

                {/* Bottom Overlay Pin */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                  <div className="flex items-center gap-1 text-[11px] font-semibold drop-shadow-sm text-slate-100 truncate">
                    <MapPin size={11} className="text-teal-400 shrink-0" />
                    <span className="truncate">{district.city}</span>
                  </div>
                </div>
              </div>

              {/* Content Area (Compact ~140px - EXACT SAME AS SECTION 1 & 2) */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block truncate h-4 leading-4">
                    Prime Corridor
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1 group-hover:text-[#0F8B7D] transition-colors truncate h-5 leading-5" title={district.name}>
                    {district.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate h-4 leading-4" title={district.desc}>
                    {district.desc}
                  </p>

                  <div className="h-6 overflow-hidden flex items-center gap-1.5 mt-3">
                    {district.highlights.slice(0, 2).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[125px]"
                      >
                        <Check size={10} className="text-[#0F8B7D] shrink-0" />
                        <span className="truncate">{highlight}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
                      Inventory
                    </span>
                    <span className="text-xs font-bold text-teal-700 leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {district.spaces}
                    </span>
                  </div>

                  <Link
                    href={`/marketplace/search?city=${encodeURIComponent(district.searchCity)}&q=${encodeURIComponent(district.searchQuery)}&vertical=all`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-[#0F8B7D] text-[#0F8B7D] hover:text-white font-bold text-xs transition-all shadow-2xs group-hover:bg-[#0F8B7D] group-hover:text-white cursor-pointer"
                  >
                    <span>Explore Spaces</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4.5 OFFICEX CALQ: OFFICE SPACE FOOTPRINT & RENT CALCULATOR */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-t border-slate-200" id="calq">
        <OfficeSpaceCalculator
          onExploreSpaces={(city, micromarket) => {
            router.push(`/marketplace/search?city=${encodeURIComponent(city)}&q=${encodeURIComponent(micromarket)}`);
          }}
          onOpenAdvisor={() => setSlideInOpen(true)}
        />
      </section>

      {/* 5. WHY CHOOSE OFFICEX WORKSPACES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/80 to-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
              The OfficeX Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Corporate Tenants &amp; Startups Lease with Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B7D] flex items-center justify-center mb-4">
                <BadgePercent size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Zero Brokerage Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with asset owners and institutional landlords. No brokerage or hidden commissions on all listed properties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">100% Physically Audited</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every space undergoes physical verification: power capacity, fire NOC validity, lift licenses, and HVAC health checks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Dedicated Sourcing Desk</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit your requirement through our inquiry form. Our workspace sourcing team curates matching verified spaces and coordinates visits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">Instant Digital LOI &amp; Deal Room</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Draft Letters of Intent, execute Aadhaar-backed digital lease agreements, and transition straight into OfficeX Operate for fit-out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 MARKETPLACE PARTICIPANT PATHWAYS: BROKER & LANDLORD */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Join as Broker */}
          <div className="p-8 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
                  Channel Partners &amp; IPCs
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  1.5x / 45-Day Payout
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Are You a Commercial Leasing Broker?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Partner with OfficeX to close enterprise mandates faster. Access 500+ verified commercial towers, instant legally binding LOI generation, and guaranteed 45-day commission escrow release.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>AI Client Space Match</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Digital LOI with E-Sign</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Zero Dispute Escrow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                  <span>Fortune 500 Mandates</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-4 border-t border-amber-200/60">
              <Link
                href="/signup?context=marketplace&role=broker&redirect=/leasing"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                Join as Broker Partner
              </Link>
              <Link
                href="/leasing"
                className="px-4 py-2.5 rounded-xl border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-bold text-xs transition-all"
              >
                Open Broker CRM →
              </Link>
            </div>
          </div>

          {/* Card 2: List Your Space */}
          <div className="p-8 rounded-3xl border-2 border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/30 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F8B7D] bg-teal-100/80 px-2.5 py-1 rounded-full border border-teal-300">
                  Landlords &amp; Asset Owners
                </span>
                <span className="text-xs font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-md">
                  100% Free Listing
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Own a Commercial Building or Floor Plate?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Publish your vacant spaces directly to pre-vetted corporate occupiers. Zero brokerage fees, built-in digital deal room, automated rent roll tracking, and institutional tenant verification.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D] shrink-0" />
                  <span>Pre-Vetted MNC Tenants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D] shrink-0" />
                  <span>Direct Landlord Deal Room</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D] shrink-0" />
                  <span>Automated Rent Roll</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#0F8B7D] shrink-0" />
                  <span>Zero Listing Charges</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-4 border-t border-teal-200/60">
              <Link
                href="/properties/add"
                className="px-5 py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-bold text-xs shadow-xs transition-all"
              >
                List Your Space (Free)
              </Link>
              <Link
                href="/properties"
                className="px-4 py-2.5 rounded-xl border border-teal-300 hover:bg-teal-100/50 text-teal-900 font-bold text-xs transition-all"
              >
                Explore Landlord SaaS →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-1">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is OfficeX really 100% zero brokerage for tenants?",
              a: "Yes! Commercial tenants and occupiers do not pay any brokerage fee to OfficeX. We partner directly with Grade-A commercial developers, REITs, and landlords."
            },
            {
              q: "Can I schedule guided site visits for spaces in Ahmedabad or GIFT City?",
              a: "Absolutely. Once you request a visit through our inquiry form, our workspace team coordinates with the building manager, issues visitor security passes, and schedules the site inspection."
            },
            {
              q: "What is the difference between Managed Offices and Coworking Desks?",
              a: "Managed Offices are fully customized, private commercial suites designed specifically for your brand (30-500+ team size) with dedicated IT and private reception. Coworking Desks are plug-and-play workstations within shared premium Grade-A communities."
            },
            {
              q: "How does the Digital Deal Room work for commercial lease negotiation?",
              a: "Our collaborative online deal room allows landlords and corporate occupiers to negotiate base rent, fit-out rent-free periods, CAM costs, and security deposits digitally with instant version control and LOI generation."
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-900 hover:text-[#0F8B7D] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-extrabold text-lg ml-2">
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION — MODERN LIGHT ENTERPRISE CARD */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/80 rounded-3xl p-8 sm:p-12 border border-teal-200 shadow-xl shadow-teal-900/5 text-center relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-widest text-[#0F8B7D] block mb-2">
            Start Your Search Today
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Find the Perfect Commercial Space for Your Business
          </h2>
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto mb-8 font-medium">
            Join hundreds of enterprises and high-growth companies that discovered their commercial headquarters on OfficeX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all text-center"
            >
              Explore Available Spaces
            </Link>
            <button
              onClick={() => setSlideInOpen(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all cursor-pointer text-center"
            >
              Submit Space Inquiry
            </button>
          </div>
        </div>
      </section>

      {/* Enquiry SlideIn */}
      <EnquirySlideIn
        isOpen={slideInOpen}
        onClose={() => setSlideInOpen(false)}
        prefill={{ modules: ["marketplace"] }}
      />

      <Footer />
    </div>
  );
}
