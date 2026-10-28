import cityData from "./marketplace-cities.json";

export interface CityOption {
  name: string;
  count: number;
  isLive?: boolean;
}

// 4 Active Commercial Office Marketplace Locations (Live Now)
export const LIVE_MARKETPLACE_CITIES: CityOption[] = [
  { name: "Delhi NCR", count: 1711, isLive: true },
  { name: "Noida", count: 491, isLive: true },
  { name: "Gurgaon", count: 724, isLive: true },
  { name: "Faridabad", count: 13, isLive: true },
];

export const LIVE_CITY_NAMES = ["Delhi NCR", "Noida", "Gurgaon", "Faridabad"] as const;

// Helper to determine if a city is currently live
export function isCityLive(cityName: string | null | undefined): boolean {
  if (!cityName) return false;
  const c = cityName.trim().toLowerCase();
  return (
    c === "delhi ncr" ||
    c === "ncr" ||
    c === "delhi" ||
    c === "new delhi" ||
    c === "noida" ||
    c === "greater noida" ||
    c === "gurgaon" ||
    c === "gurugram" ||
    c === "faridabad"
  );
}

// Major Metros Expanding Soon to OfficeX
export const COMING_SOON_METROS: CityOption[] = [
  { name: "Bangalore", count: 1543 },
  { name: "Mumbai", count: 483 },
  { name: "Pune", count: 490 },
  { name: "Hyderabad", count: 388 },
  { name: "Ahmedabad", count: 115 },
  { name: "Chennai", count: 346 },
  { name: "Kolkata", count: 230 },
  { name: "Jaipur", count: 122 },
  { name: "Indore", count: 95 },
  { name: "Kochi", count: 70 },
  { name: "Chandigarh", count: 60 },
  { name: "Goa", count: 20 },
];

// All 89 Cities sorted alphabetically
export const ALL_MARKETPLACE_CITIES: CityOption[] = [...cityData.cities].sort((a, b) =>
  a.name.localeCompare(b.name)
);

// All other cities marked Coming Soon
export const COMING_SOON_CITIES: CityOption[] = ALL_MARKETPLACE_CITIES.filter(
  (c) => !isCityLive(c.name)
);

// Backward-compatible exports
export const TOP_METROS: CityOption[] = [
  ...LIVE_MARKETPLACE_CITIES,
  ...COMING_SOON_METROS,
];

// Major Emerging Business Hubs
export const EMERGING_HUBS: CityOption[] = [
  { name: "Jaipur", count: 122 },
  { name: "Indore", count: 95 },
  { name: "Coimbatore", count: 72 },
  { name: "Kochi", count: 70 },
  { name: "Chandigarh", count: 60 },
  { name: "Nagpur", count: 46 },
  { name: "Lucknow", count: 43 },
  { name: "Bhubaneswar", count: 35 },
  { name: "Guwahati", count: 30 },
  { name: "Visakhapatnam", count: 29 },
  { name: "Surat", count: 27 },
  { name: "Patna", count: 26 },
  { name: "Dehradun", count: 26 },
  { name: "Kozhikode", count: 21 },
  { name: "Goa", count: 20 },
  { name: "Bhopal", count: 20 },
  { name: "Mysore", count: 18 },
  { name: "Vadodara", count: 14 },
  { name: "Nashik", count: 14 },
  { name: "Thiruvananthapuram", count: 13 },
  { name: "Raipur", count: 12 },
  { name: "Rajkot", count: 11 },
  { name: "Vijayawada", count: 11 },
  { name: "Ranchi", count: 10 },
];

// Real Top Localities per city directly mapped from database listings
export const CITY_LOCALITIES: Record<string, string[]> = {
  ...cityData.localities,
  // Normalized aliases
  Bengaluru: (cityData.localities as Record<string, string[]>)["Bangalore"] || [],
  "Delhi NCR": [
    ...((cityData.localities as Record<string, string[]>)["Delhi"] || []),
    ...((cityData.localities as Record<string, string[]>)["Gurgaon"] || []),
    ...((cityData.localities as Record<string, string[]>)["Noida"] || []),
    ...((cityData.localities as Record<string, string[]>)["Faridabad"] || []),
  ].slice(0, 20),
  Gurugram: (cityData.localities as Record<string, string[]>)["Gurgaon"] || [],
  Gandhinagar: (cityData.localities as Record<string, string[]>)["Ahmedabad"] || [],
};

// Safe helper to get localities for any city
export function getLocalitiesForCity(cityName: string): string[] {
  if (!cityName) return [];
  const normalized = cityName.trim();
  if (CITY_LOCALITIES[normalized]) return CITY_LOCALITIES[normalized];

  // Case-insensitive lookup
  const lower = normalized.toLowerCase();
  for (const [key, locs] of Object.entries(CITY_LOCALITIES)) {
    if (key.toLowerCase() === lower) return locs;
  }

  if (lower.includes("faridabad")) {
    return (
      (cityData.localities as Record<string, string[]>)["Faridabad"] || [
        "Mathura Road",
        "Sector 28",
        "Sector 16",
        "New Industrial Town",
        "Sector 15A",
      ]
    );
  }
  if (lower.includes("gurgaon") || lower.includes("gurugram")) {
    return (cityData.localities as Record<string, string[]>)["Gurgaon"] || [];
  }
  if (lower.includes("noida")) {
    return (cityData.localities as Record<string, string[]>)["Noida"] || [];
  }
  if (lower.includes("delhi")) {
    return (cityData.localities as Record<string, string[]>)["Delhi"] || [];
  }
  if (lower.includes("bangalore") || lower.includes("bengaluru")) {
    return (cityData.localities as Record<string, string[]>)["Bangalore"] || [];
  }
  if (lower.includes("ahmedabad") || lower.includes("gandhinagar")) {
    return (cityData.localities as Record<string, string[]>)["Ahmedabad"] || [];
  }

  return [
    "Central Business District",
    "Tech Zone",
    "Airport Corridor",
    "IT Park",
    "Main Boulevard",
  ];
}

// Fallback Map View Coordinates for all major cities
export const CITY_COORDS: Record<string, [number, number]> = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  pune: [18.5204, 73.8567],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  "delhi ncr": [28.6139, 77.209],
  hyderabad: [17.385, 78.4867],
  noida: [28.5355, 77.391],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  jaipur: [26.9124, 75.7873],
  ahmedabad: [23.0225, 72.5714],
  indore: [22.7196, 75.8577],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  chandigarh: [30.7333, 76.7794],
  nagpur: [21.1458, 79.0882],
  lucknow: [26.8467, 80.9462],
  bhubaneswar: [20.2961, 85.8245],
  guwahati: [26.1445, 91.7362],
  visakhapatnam: [17.6868, 83.2185],
  surat: [21.1702, 72.8311],
  patna: [25.5941, 85.1376],
  dehradun: [30.3165, 78.0322],
  kozhikode: [11.2588, 75.7804],
  goa: [15.2993, 74.124],
  bhopal: [23.2599, 77.4126],
  mysore: [12.2958, 76.6394],
  vadodara: [22.3072, 73.1812],
  nashik: [19.9975, 73.7898],
  faridabad: [28.4089, 77.3178],
  thiruvananthapuram: [8.5241, 76.9366],
  raipur: [21.2514, 81.6296],
  rajkot: [22.3039, 70.8022],
  vijayawada: [16.5062, 80.648],
  ranchi: [23.3441, 85.3096],
};
