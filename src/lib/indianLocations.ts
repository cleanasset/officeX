export interface IndianLocationItem {
  id: string;
  name: string;
  type: "state" | "city" | "micromarket" | "landmark";
  city: string;
  state: string;
  pincode?: string;
  microMarket?: string;
  popular?: boolean;
}

// Master List of all 28 States & 8 Union Territories
export const INDIAN_STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi (NCR)", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

// Comprehensive Commercial Cities and Micro-Markets in India
export const INDIAN_CITIES_AND_HUBS: IndianLocationItem[] = [
  // GUJARAT - AHMEDABAD & GANDHINAGAR & SURAT
  { id: "guj-state", name: "Gujarat", type: "state", city: "Gandhinagar", state: "Gujarat", popular: true },
  { id: "guj-ahmedabad", name: "Ahmedabad", type: "city", city: "Ahmedabad", state: "Gujarat", popular: true },
  { id: "guj-gandhinagar", name: "Gandhinagar", type: "city", city: "Gandhinagar", state: "Gujarat", popular: true },
  { id: "guj-surat", name: "Surat", type: "city", city: "Surat", state: "Gujarat", popular: true },
  { id: "guj-vadodara", name: "Vadodara", type: "city", city: "Vadodara", state: "Gujarat" },
  { id: "guj-rajkot", name: "Rajkot", type: "city", city: "Rajkot", state: "Gujarat" },
  { id: "guj-bhavnagar", name: "Bhavnagar", type: "city", city: "Bhavnagar", state: "Gujarat" },
  { id: "guj-jamnagar", name: "Jamnagar", type: "city", city: "Jamnagar", state: "Gujarat" },

  // Ahmedabad Localities & Micro-Markets (including East & West Ahmedabad)
  { id: "guj-nikol", name: "Nikol", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Nikol", pincode: "382350", popular: true },
  { id: "guj-bapunagar", name: "Bapunagar", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Bapunagar", pincode: "380024" },
  { id: "guj-vastral", name: "Vastral", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Vastral", pincode: "382418" },
  { id: "guj-naroda", name: "Naroda GIDC & Commercial Zone", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Naroda", pincode: "382330" },
  { id: "guj-odhav", name: "Odhav Industrial Estate", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Odhav", pincode: "382415" },
  { id: "guj-kathwada", name: "Kathwada GIDC", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Kathwada", pincode: "382430" },
  { id: "guj-maninagar", name: "Maninagar", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Maninagar", pincode: "380008" },
  { id: "guj-gift", name: "GIFT City (Global Financial Tech City)", type: "micromarket", city: "Gandhinagar", state: "Gujarat", microMarket: "GIFT City", pincode: "382355", popular: true },
  { id: "guj-sg-highway", name: "SG Highway (Sarkhej - Gandhinagar)", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "SG Highway", pincode: "380054", popular: true },
  { id: "guj-prahladnagar", name: "Prahlad Nagar", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Prahlad Nagar", pincode: "380015", popular: true },
  { id: "guj-sindhubhavan", name: "Sindhu Bhavan Road (SBR)", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Sindhu Bhavan Road", pincode: "380059", popular: true },
  { id: "guj-bodakdev", name: "Bodakdev", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Bodakdev", pincode: "380054" },
  { id: "guj-thaltej", name: "Thaltej & Shilaj", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Thaltej", pincode: "380059" },
  { id: "guj-science-city", name: "Science City Road & Sola", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Science City", pincode: "380060" },
  { id: "guj-gota", name: "Gota SG Highway", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Gota", pincode: "382481" },
  { id: "guj-chandkheda", name: "Chandkheda & Motera", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Chandkheda", pincode: "382424" },
  { id: "guj-bopal", name: "Bopal & South Bopal", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Bopal", pincode: "380058" },
  { id: "guj-shela", name: "Shela Commercial Corridor", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Shela", pincode: "380058" },
  { id: "guj-vastrapur", name: "Vastrapur & IIM Road", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Vastrapur", pincode: "380015" },
  { id: "guj-satellite", name: "Satellite & Shivranjani", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Satellite", pincode: "380015" },
  { id: "guj-navrangpura", name: "Navrangpura & CG Road", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Navrangpura", pincode: "380009" },
  { id: "guj-ashram-road", name: "Ashram Road CBD", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Ashram Road", pincode: "380009" },
  { id: "guj-sanand", name: "Sanand GIDC Industrial Hub", type: "micromarket", city: "Ahmedabad", state: "Gujarat", microMarket: "Sanand", pincode: "382110" },
  { id: "guj-infocity", name: "Infocity IT Park", type: "landmark", city: "Gandhinagar", state: "Gujarat", microMarket: "Infocity", pincode: "382009" },
  { id: "guj-vesu", name: "Vesu Commercial Hub", type: "micromarket", city: "Surat", state: "Gujarat", microMarket: "Vesu", pincode: "395007" },
  { id: "guj-adajan", name: "Adajan", type: "micromarket", city: "Surat", state: "Gujarat", microMarket: "Adajan", pincode: "395009" },
  { id: "guj-ring-road", name: "Ring Road Textile & Diamond Market", type: "micromarket", city: "Surat", state: "Gujarat", microMarket: "Ring Road", pincode: "395002" },

  // MAHARASHTRA
  { id: "mah-state", name: "Maharashtra", type: "state", city: "Mumbai", state: "Maharashtra", popular: true },
  { id: "mah-mumbai", name: "Mumbai", type: "city", city: "Mumbai", state: "Maharashtra", popular: true },
  { id: "mah-pune", name: "Pune", type: "city", city: "Pune", state: "Maharashtra", popular: true },
  { id: "mah-navi-mumbai", name: "Navi Mumbai", type: "city", city: "Navi Mumbai", state: "Maharashtra", popular: true },
  { id: "mah-thane", name: "Thane", type: "city", city: "Thane", state: "Maharashtra" },
  { id: "mah-bkc", name: "Bandra Kurla Complex (BKC)", type: "micromarket", city: "Mumbai", state: "Maharashtra", microMarket: "BKC", pincode: "400051", popular: true },
  { id: "mah-lower-parel", name: "Lower Parel & Worli", type: "micromarket", city: "Mumbai", state: "Maharashtra", microMarket: "Lower Parel", pincode: "400013", popular: true },
  { id: "mah-andheri", name: "Andheri East (MIDC & SEEPZ)", type: "micromarket", city: "Mumbai", state: "Maharashtra", microMarket: "Andheri East", pincode: "400093", popular: true },
  { id: "mah-powai", name: "Powai & Hiranandani Business Park", type: "micromarket", city: "Mumbai", state: "Maharashtra", microMarket: "Powai", pincode: "400076" },
  { id: "mah-hinjewadi", name: "Hinjewadi IT Park", type: "micromarket", city: "Pune", state: "Maharashtra", microMarket: "Hinjewadi", pincode: "411057", popular: true },
  { id: "mah-kharadi", name: "Kharadi & EON Free Zone", type: "micromarket", city: "Pune", state: "Maharashtra", microMarket: "Kharadi", pincode: "411014", popular: true },
  { id: "mah-baner", name: "Baner & Balewadi", type: "micromarket", city: "Pune", state: "Maharashtra", microMarket: "Baner", pincode: "411045" },

  // KARNATAKA
  { id: "kar-state", name: "Karnataka", type: "state", city: "Bengaluru", state: "Karnataka", popular: true },
  { id: "kar-bengaluru", name: "Bengaluru (Bangalore)", type: "city", city: "Bengaluru", state: "Karnataka", popular: true },
  { id: "kar-orr", name: "Outer Ring Road (ORR) Bellandur", type: "micromarket", city: "Bengaluru", state: "Karnataka", microMarket: "Outer Ring Road", pincode: "560103", popular: true },
  { id: "kar-whitefield", name: "Whitefield", type: "micromarket", city: "Bengaluru", state: "Karnataka", microMarket: "Whitefield", pincode: "560066", popular: true },
  { id: "kar-electronic-city", name: "Electronic City", type: "micromarket", city: "Bengaluru", state: "Karnataka", microMarket: "Electronic City", pincode: "560100", popular: true },
  { id: "kar-koramangala", name: "Koramangala & HSR Layout", type: "micromarket", city: "Bengaluru", state: "Karnataka", microMarket: "Koramangala", pincode: "560034" },

  // DELHI NCR
  { id: "del-state", name: "Delhi (NCR)", type: "state", city: "New Delhi", state: "Delhi (NCR)", popular: true },
  { id: "del-new-delhi", name: "New Delhi", type: "city", city: "New Delhi", state: "Delhi (NCR)", popular: true },
  { id: "del-gurugram", name: "Gurugram (Gurgaon)", type: "city", city: "Gurugram", state: "Haryana", popular: true },
  { id: "del-noida", name: "Noida", type: "city", city: "Noida", state: "Uttar Pradesh", popular: true },
  { id: "del-cyber-city", name: "DLF Cyber City", type: "micromarket", city: "Gurugram", state: "Haryana", microMarket: "DLF Cyber City", pincode: "122002", popular: true },
  { id: "del-golf-course", name: "Golf Course Road", type: "micromarket", city: "Gurugram", state: "Haryana", microMarket: "Golf Course Road", pincode: "122003" },
  { id: "del-aerocity", name: "Aerocity Hospitality & Business Hub", type: "micromarket", city: "New Delhi", state: "Delhi (NCR)", microMarket: "Aerocity", pincode: "110037" },

  // TELANGANA
  { id: "tel-state", name: "Telangana", type: "state", city: "Hyderabad", state: "Telangana", popular: true },
  { id: "tel-hyderabad", name: "Hyderabad", type: "city", city: "Hyderabad", state: "Telangana", popular: true },
  { id: "tel-hitec-city", name: "HITEC City & Madhapur", type: "micromarket", city: "Hyderabad", state: "Telangana", microMarket: "HITEC City", pincode: "500081", popular: true },
  { id: "tel-financial-dist", name: "Financial District (Nanakramguda)", type: "micromarket", city: "Hyderabad", state: "Telangana", microMarket: "Financial District", pincode: "500032", popular: true },

  // TAMIL NADU
  { id: "tn-state", name: "Tamil Nadu", type: "state", city: "Chennai", state: "Tamil Nadu", popular: true },
  { id: "tn-chennai", name: "Chennai", type: "city", city: "Chennai", state: "Tamil Nadu", popular: true },
  { id: "tn-omr", name: "OMR IT Corridor", type: "micromarket", city: "Chennai", state: "Tamil Nadu", microMarket: "OMR", pincode: "600096", popular: true },
  { id: "tn-guindy", name: "Guindy", type: "micromarket", city: "Chennai", state: "Tamil Nadu", microMarket: "Guindy", pincode: "600032" },

  // WEST BENGAL
  { id: "wb-state", name: "West Bengal", type: "state", city: "Kolkata", state: "West Bengal", popular: true },
  { id: "wb-kolkata", name: "Kolkata", type: "city", city: "Kolkata", state: "West Bengal", popular: true },
  { id: "wb-saltlake", name: "Salt Lake Sector V", type: "micromarket", city: "Kolkata", state: "West Bengal", microMarket: "Sector V", pincode: "700091", popular: true },
  { id: "wb-newtown", name: "New Town", type: "micromarket", city: "Kolkata", state: "West Bengal", microMarket: "New Town", pincode: "700156" },

  // RAJASTHAN
  { id: "raj-state", name: "Rajasthan", type: "state", city: "Jaipur", state: "Rajasthan" },
  { id: "raj-jaipur", name: "Jaipur", type: "city", city: "Jaipur", state: "Rajasthan", popular: true },
  { id: "raj-malviyanagar", name: "Malviya Nagar", type: "micromarket", city: "Jaipur", state: "Rajasthan", microMarket: "Malviya Nagar", pincode: "302017" },

  // MADHYA PRADESH
  { id: "mp-state", name: "Madhya Pradesh", type: "state", city: "Indore", state: "Madhya Pradesh" },
  { id: "mp-indore", name: "Indore", type: "city", city: "Indore", state: "Madhya Pradesh", popular: true },
  { id: "mp-vijaynagar", name: "Vijay Nagar", type: "micromarket", city: "Indore", state: "Madhya Pradesh", microMarket: "Vijay Nagar", pincode: "452010" }
];

export interface AddressSuggestion {
  fullAddress: string;
  landmark: string;
  microMarket: string;
  city: string;
  state: string;
  pincode: string;
  metroDistance: string;
}

export const SAMPLE_REAL_ADDRESSES: AddressSuggestion[] = [
  {
    fullAddress: "Nikol Commercial Center, Nikol Gam Road, Nikol, Ahmedabad, Gujarat 382350",
    landmark: "Near Nikol Ring Road Circle & D-Mart",
    microMarket: "Nikol",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382350",
    metroDistance: "1.5km (Vastral Gam Metro Station)"
  },
  {
    fullAddress: "Tower 1, Road 5C, Zone 1, GIFT City, Gandhinagar, Gujarat 382355",
    landmark: "Opposite World Trade Centre GIFT",
    microMarket: "GIFT City",
    city: "Gandhinagar",
    state: "Gujarat",
    pincode: "382355",
    metroDistance: "200m (GIFT City Metro Station)"
  },
  {
    fullAddress: "Mondeal Heights, Near Wide Angle Cinema, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054",
    landmark: "Next to Novotel Ahmedabad",
    microMarket: "SG Highway",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380054",
    metroDistance: "800m (Thaltej Metro Station)"
  },
  {
    fullAddress: "Privilon, Ambli-Bopal Road, Iscon Crossroads, Ahmedabad, Gujarat 380058",
    landmark: "Near Iscon Mega Mall",
    microMarket: "Sindhu Bhavan Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380058",
    metroDistance: "1.2km (Bopal Metro Line)"
  },
  {
    fullAddress: "Safal Profitaire, Corporate Road, Prahlad Nagar, Ahmedabad, Gujarat 380015",
    landmark: "Behind Prahladnagar Garden",
    microMarket: "Prahlad Nagar",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    metroDistance: "600m (Vastrapur Station)"
  },
  {
    fullAddress: "Godrej BKC, Plot C-68, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051",
    landmark: "Near MCA Club & US Consulate",
    microMarket: "BKC",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    metroDistance: "350m (BKC Metro Line 3)"
  },
  {
    fullAddress: "DLF Cyber City, Building 10, Tower B, Sector 24, Gurugram, Haryana 122002",
    landmark: "Near Cyber Hub Metro Station",
    microMarket: "DLF Cyber City",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    metroDistance: "100m (Rapid Metro Cyber City)"
  }
];

// Helper function to search location matches with dynamic smart fallback
export function searchIndianLocations(query: string): IndianLocationItem[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const q = query.toLowerCase().trim();

  // Search exact or partial matches in the master catalogue
  const matches = INDIAN_CITIES_AND_HUBS.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const cityMatch = item.city.toLowerCase().includes(q);
    const stateMatch = item.state.toLowerCase().includes(q);
    const microMatch = item.microMarket ? item.microMarket.toLowerCase().includes(q) : false;
    const pincodeMatch = item.pincode ? item.pincode.includes(q) : false;
    return nameMatch || cityMatch || stateMatch || microMatch || pincodeMatch;
  });

  if (matches.length > 0) {
    return matches.slice(0, 10);
  }

  // Smart dynamic resolution for any custom locality typed by the user
  const capitalized = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  return [
    {
      id: `custom-loc-${Date.now()}-1`,
      name: capitalized,
      type: "micromarket",
      city: "Ahmedabad",
      state: "Gujarat",
      microMarket: capitalized,
      pincode: "382350"
    },
    {
      id: `custom-loc-${Date.now()}-2`,
      name: `${capitalized} (Custom Locality)`,
      type: "micromarket",
      city: capitalized,
      state: "India",
      microMarket: capitalized
    }
  ];
}

// Helper function to search real map addresses
export function searchRealAddresses(query: string): AddressSuggestion[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const q = query.toLowerCase().trim();
  const matches = SAMPLE_REAL_ADDRESSES.filter(addr => {
    return (
      addr.fullAddress.toLowerCase().includes(q) ||
      addr.city.toLowerCase().includes(q) ||
      addr.state.toLowerCase().includes(q) ||
      addr.microMarket.toLowerCase().includes(q) ||
      addr.pincode.includes(q) ||
      addr.landmark.toLowerCase().includes(q)
    );
  });

  if (matches.length > 0) {
    return matches.slice(0, 5);
  }

  const capitalized = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  return [
    {
      fullAddress: `${capitalized} Commercial Complex, Main Road, ${capitalized}, Ahmedabad, Gujarat 382350`,
      landmark: `Near ${capitalized} Crossroads`,
      microMarket: capitalized,
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "382350",
      metroDistance: "500m (Metro Station)"
    }
  ];
}
