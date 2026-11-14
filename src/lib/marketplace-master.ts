import fs from "fs";
import path from "path";

export function cleanImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/images/showcase_commercial_warmshell.jpg";
  let cleaned = url.trim();
  if (!cleaned) return "/images/showcase_commercial_warmshell.jpg";

  if (cleaned.includes("res.cloudinary.com/myhq/image/upload/")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/myhq\/image\/upload\//i, "/assets/spaces/");
  } else if (cleaned.includes("cloudinary.com") && cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//i, "/assets/spaces/");
  }

  // Ensure "myhq" is NEVER present in the URL path presented to the client
  if (cleaned.includes("myhq")) {
    cleaned = cleaned.replace(/myhq/gi, "officex");
  }

  return cleaned;
}

export function sanitizeText(val: string | null | undefined): string {
  if (!val || typeof val !== "string") return "";
  return val.replace(/myhq/gi, "OfficeX");
}

export function sanitizeListing(l: any) {
  if (!l) return l;
  return {
    ...l,
    name: sanitizeText(l.name),
    brandName: sanitizeText(l.brandName),
    description: sanitizeText(l.description),
    featuredImage: cleanImageUrl(l.featuredImage),
    images: Array.isArray(l.images) && l.images.length > 0
      ? l.images.map(cleanImageUrl)
      : [cleanImageUrl(l.featuredImage)],
  };
}

let masterCache: any[] | null = null;

export function getMasterListings(): any[] {
  if (masterCache) return masterCache;
  try {
    const jsonPath = path.join(process.cwd(), "office marketplace data", "json", "all_properties_master.json");
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      const parsed: any[] = raw.map((p: any, idx: number) => {
        const rawPhotoUrls = (p["Photo URLs"] || "").split(";").map((s: string) => s.trim()).filter(Boolean);
        const photos = rawPhotoUrls.map(cleanImageUrl);
        const featuredImage = photos[0] || cleanImageUrl(p["Featured Image"]);

        let vertical = "coworking";
        const rawType = (p["Property Type"] || "").toLowerCase();
        if (rawType.includes("virtual")) vertical = "virtual_office";
        else if (rawType.includes("managed")) vertical = "managed_office";
        else if (rawType.includes("commercial")) vertical = "commercial";
        else if (rawType.includes("meeting")) vertical = "meeting_room";
        else if (rawType.includes("day pass") || rawType.includes("day_pass")) vertical = "day_pass";

        const startingPrice = Number(
          p["Hot Desk Price (INR/mo)"] ||
          p["Dedicated Desk (INR/mo)"] ||
          p["Private Cabin (INR/seat/mo)"] ||
          p["Managed Office (INR/seat/mo)"] ||
          p["Rent per sqft/mo (INR)"] ||
          p["Virtual Office Monthly (INR)"] ||
          8500
        );

        // Dynamically compile amenities
        const dynamicAmenities: string[] = [];
        if (p["WiFi"] === "Yes") dynamicAmenities.push("High-Speed WiFi");
        if (p["AC / HVAC"] === "Yes") dynamicAmenities.push("Central AC / HVAC");
        if (p["Power Backup"] === "Yes") dynamicAmenities.push("100% Power Backup");
        if (p["Meeting Rooms"] === "Yes") dynamicAmenities.push("Meeting Rooms");
        if (p["Tea / Coffee"] === "Yes") dynamicAmenities.push("Tea & Coffee");
        if (p["Pantry"] === "Yes") dynamicAmenities.push("Pantry / Cafeteria");
        if (p["Security"] === "Yes" || p["CCTV"] === "Yes") dynamicAmenities.push("24/7 Security & CCTV");
        if (p["Parking (2W)"] === "Yes" || p["Parking (4W)"] === "Yes") dynamicAmenities.push("Dedicated Parking");
        if (p["Printer"] === "Yes") dynamicAmenities.push("Printing & Scanning");
        if (p["Fire Safety"] === "Yes") dynamicAmenities.push("Fire Safety & Compliance");

        const amenities = dynamicAmenities.length > 0
          ? dynamicAmenities
          : ["High-Speed WiFi", "Power Backup", "Meeting Rooms", "Tea / Coffee", "Security & CCTV"];

        return {
          id: p["Property ID"] || `space-${idx}`,
          slug: p["Property ID"] || `space-${idx}`,
          name: sanitizeText(p["Property Name"] || "Commercial Workspace"),
          brandName: sanitizeText(p["Brand / Operator"] || "Verified Operator"),
          vertical,
          city: p["City"] || "Delhi",
          state: p["State"] || "Delhi NCR",
          locality: p["Locality / Area"] || "",
          microMarket: p["Locality / Area"] || "",
          fullAddress: p["Full Address"] || "",
          pincode: p["Pincode"] || "",
          latitude: String(p["Latitude"] || "28.6139"),
          longitude: String(p["Longitude"] || "77.2090"),
          totalAreaSqft: Number(p["Total Area (sq.ft.)"]) || 10000,
          totalSeats: Number(p["Total Seating Capacity"]) || 150,
          buildingGrade: p["Building Grade"] || "Grade A",
          buildingType: p["Building Type"] || "Commercial Office Building",
          furnishingStatus: p["Furnishing Status"] || "Fully Furnished",
          images: photos.length > 0 ? photos : ["/images/showcase_commercial_warmshell.jpg"],
          featuredImage: featuredImage || "/images/showcase_commercial_warmshell.jpg",
          amenities,
          pricingPlans: {
            hotDeskMonthly: Number(p["Hot Desk Price (INR/mo)"]) || undefined,
            dedicatedDeskMonthly: Number(p["Dedicated Desk (INR/mo)"]) || undefined,
            privateCabinMonthly: Number(p["Private Cabin (INR/seat/mo)"]) || undefined,
            managedOfficeMonthly: Number(p["Managed Office (INR/seat/mo)"]) || undefined,
            rentPerSqft: Number(p["Rent per sqft/mo (INR)"]) || undefined,
            meetingRoomHourly: Number(p["Meeting Room (INR/hr)"]) || undefined,
            virtualOfficeMonthly: Number(p["Virtual Office Monthly (INR)"]) || undefined,
            securityDepositMonths: Number(p["Security Deposit (months)"]) || 2,
            lockInPeriodMonths: Number(p["Lock-in Period (months)"]) || 3,
            priceNegotiable: p["Price Negotiable"] || "Yes",
          },
          operatingHours: {
            monSat: p["Operating Hours (Mon-Sat)"] || "08:00 am to 08:00 pm - Monday to Saturday",
            sunday: p["Operating Hours (Sunday)"] || "Closed",
          },
          startingPrice,
          startingPriceUnit: "per_month",
          description: sanitizeText(p["Description"] || ""),
          avgRating: String(p["Rating (out of 5)"] || "4.5"),
          totalReviews: Number(p["Total Reviews"]) || 15,
          nearestMetro: p["Nearest Metro"] || "",
          metroDistance: p["Metro Distance"] || "",
          badges: p["Badges / Tags"] || "",
          consultantName: "OfficeX Commercial Advisory",
          consultantPhone: "+91 98200 12345",
          status: "active",
          source: "verified_listing",
        };
      });
      masterCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to load master properties JSON:", err);
  }
  return [];
}

export function getMasterListingBySlug(slug: string): any | null {
  if (!slug) return null;
  const listings = getMasterListings();
  const raw = slug.trim().toLowerCase().replace(/\/+$/, "");
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim().toLowerCase();
  } catch {}

  // 1. Exact match on id or slug
  let found = listings.find((p) => {
    const pId = p.id?.toLowerCase();
    const pSlug = p.slug?.toLowerCase();
    return pId === raw || pSlug === raw || pId === decoded || pSlug === decoded;
  });

  if (found) return found;

  // 2. Fuzzy match if hyphen variation or clean key
  const cleanKey = decoded.replace(/[^a-z0-9]/g, "");
  if (cleanKey.length > 3) {
    found = listings.find((p) => {
      const pClean = (p.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return pClean === cleanKey;
    });
  }

  return found || null;
}

export function getSimilarMasterListings(
  city: string,
  vertical: string,
  excludeId: string,
  limit: number = 4
): any[] {
  const listings = getMasterListings();
  const normCity = (city || "").trim().toLowerCase();
  const normVert = (vertical || "").trim().toLowerCase();
  const normExclude = (excludeId || "").trim().toLowerCase();

  // First priority: same city and same vertical
  const exactMatches = listings.filter((p) => {
    if (p.id?.toLowerCase() === normExclude || p.slug?.toLowerCase() === normExclude) return false;
    const pCity = (p.city || "").toLowerCase();
    const pVert = (p.vertical || "").toLowerCase();
    return pCity.includes(normCity) && pVert === normVert;
  });

  if (exactMatches.length >= limit) {
    return exactMatches.slice(0, limit);
  }

  // Second priority: same city, any vertical
  const cityMatches = listings.filter((p) => {
    if (p.id?.toLowerCase() === normExclude || p.slug?.toLowerCase() === normExclude) return false;
    if (exactMatches.some((m) => m.id === p.id)) return false;
    const pCity = (p.city || "").toLowerCase();
    return pCity.includes(normCity);
  });

  return [...exactMatches, ...cityMatches].slice(0, limit);
}
