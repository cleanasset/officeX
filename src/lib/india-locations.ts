// Comprehensive Indian States and All Cities Mapping for Commercial Property Registry

export interface StateCitiesMap {
  [state: string]: string[];
}

export const INDIAN_STATES_CITIES: StateCitiesMap = {
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi",
    "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga",
    "Tumakuru", "Raichur", "Bidar", "Hosapete", "Gadag", "Udupi",
    "Robertsonpet (KGF)", "Bhadravati", "Chitradurga", "Kolar", "Mandya",
    "Chikkamagaluru", "Hassan", "Bagalkot", "Ranebennuru", "Karwar"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli",
    "Vasai-Virar", "Chhatrapati Sambhajinagar (Aurangabad)", "Navi Mumbai", "Solapur",
    "Mira-Bhayandar", "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Akola",
    "Panvel", "Ulhasnagar", "Sangli", "Malegaon", "Jalgaon", "Latur",
    "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna"
  ],
  "Delhi (NCT)": [
    "New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi",
    "West Delhi", "South West Delhi", "South East Delhi", "North West Delhi",
    "North East Delhi", "Shahdara", "Connaught Place", "Aerocity", "Okhla", "Nehru Place"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak",
    "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa",
    "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Manesar"
  ],
  "Uttar Pradesh": [
    "Noida", "Greater Noida", "Lucknow", "Kanpur", "Ghaziabad", "Agra",
    "Varanasi", "Meerut", "Prayagraj (Allahabad)", "Bareilly", "Aligarh",
    "Moradabad", "Saharanpur", "Gorakhpur", "Firozabad", "Jhansi",
    "Muzaffarnagar", "Mathura", "Ayodhya", "Rampur", "Shahjahanpur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam",
    "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
    "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Cyberabad", "HITEC City", "Gachibowli"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tiruppur", "Erode", "Tirunelveli", "Vellore", "Thoothukudi",
    "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Ooty",
    "Hosur", "Nagercoil", "Kanchipuram", "Kumbakonam", "OMR Chennai"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Junagadh", "Gandhinagar", "GIFT City", "Anand", "Navsari", "Morbi",
    "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Vapi"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman",
    "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni",
    "New Town Kolkata", "Salt Lake (Bidhannagar)", "Haldia"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara",
    "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Kishangarh",
    "Barmer", "Neemrana", "Bhiwadi"
  ],
  "Kerala": [
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Kollam", "Thrissur",
    "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Manjeri", "Thalassery",
    "Ponnani", "Malappuram", "Kasaragod"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur",
    "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Amaravati"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar",
    "Dewas", "Satna", "Ratlam", "Rewa", "Murwara (Katni)", "Singrauli",
    "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali",
    "Hoshiarpur", "Batala", "Pathankot", "Moga", "Abohar", "Malerkotla",
    "Khanna", "Phagwara", "Muktsar", "Barnala", "Firozpur"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim",
    "Curchorem", "Cuncolim", "Valpoi", "Pernem"
  ],
  "Chandigarh": [
    "Chandigarh", "IT Park Chandigarh", "Industrial Area Phase 1", "Industrial Area Phase 2"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
    "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga",
    "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar",
    "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai Nagar", "Bilaspur", "Korba", "Rajnandgaon",
    "Durg", "Raigarh", "Jagdalpur", "Ambikapur", "Dhamtari"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur",
    "Kashipur", "Rishikesh", "Pantnagar", "Kotdwar"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Baddi", "Nahan", "Paonta Sahib", "Kullu", "Una", "Bilaspur", "Hamirpur", "Chamba"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Sopore", "Pulwama", "Kupwara", "Ganderbal", "Budgam"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Diskit", "Nyoma", "Nubra", "Zanskar"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai", "Villianur"
  ],
  "Tripura": [
    "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia", "Khowai", "Teliamura", "Ambassa"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Baghmara", "Resubelpara", "Mairang"
  ],
  "Manipur": [
    "Imphal", "Churachandpur", "Thoubal", "Bishnupur", "Kakching", "Ukhrul", "Senapati", "Jiribam"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Chumukedima", "Mon"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Lawngtlai"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Namsai", "Tawang", "Ziro", "Roing", "Tezu", "Bomdila"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo", "Singtam", "Jorethang"
  ],
  "Andaman & Nicobar Islands": [
    "Port Blair", "Garacharma", "Bambooflat", "Prothrapur", "Diglipur", "Mayabunder"
  ],
  "Dadra & Nagar Haveli and Daman & Diu": [
    "Daman", "Diu", "Silvassa", "Amli", "Naroli"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni"
  ]
};

export const ALL_INDIAN_STATES = Object.keys(INDIAN_STATES_CITIES).sort();

export const COMMERCIAL_ASSET_TYPES = [
  { id: "office", label: "Commercial Office Tower" },
  { id: "tech_park", label: "IT & Tech Park Campus" },
  { id: "warehouse", label: "Warehouse & Fulfillment Logistics Hub" },
  { id: "industrial", label: "Industrial Park & Manufacturing Hub" },
  { id: "retail", label: "Commercial Retail Mall & High-Street Shopping Complex" },
  { id: "flex_workspace", label: "Managed Co-Working & Flex Space Facility" },
  { id: "data_center", label: "Hyperscale Data Center Facility" },
  { id: "cold_storage", label: "Cold Storage & Temperature-Controlled Facility" },
  { id: "showroom", label: "Commercial Showroom & Automobile Dealership" },
  { id: "mixed", label: "Mixed-Use Commercial Development" },
  { id: "hospitality", label: "Hospitality & Serviced Commercial Suites" },
  { id: "institutional", label: "Institutional & Educational Campus" },
  { id: "life_sciences", label: "Life Sciences, Biotech & R&D Laboratory Hub" },
  { id: "logistics_park", label: "Logistics Park & Inland Container Depot (ICD)" },
  { id: "sez_commercial", label: "Special Economic Zone (SEZ) Commercial Unit" },
];

export interface OwnershipStructureRule {
  id: string;
  label: string;
  shortLabel: string;
  panRequired: boolean;
  panPlaceholder: string;
  cinLabel: string;
  cinRequired: boolean;
  cinApplicable: boolean;
  cinPlaceholder: string;
  gstinRequired: boolean;
  gstinNote: string;
  complianceRuleText: string;
}

export const LEGAL_OWNERSHIP_STRUCTURES: OwnershipStructureRule[] = [
  {
    id: "pvt_ltd",
    label: "Private Limited Company (Pvt Ltd)",
    shortLabel: "Pvt Ltd Company",
    panRequired: true,
    panPlaceholder: "Company PAN (e.g. AABCP1234K)",
    cinLabel: "Corporate Identity Number (CIN)",
    cinRequired: true,
    cinApplicable: true,
    cinPlaceholder: "U70100KA2020PTC123456 (21 characters)",
    gstinRequired: true,
    gstinNote: "Compulsory for registered corporate lessor (18% SAC 997212)",
    complianceRuleText: "Private Limited Company: CIN (*), Corporate PAN (*), and GSTIN (*) are compulsory.",
  },
  {
    id: "public_ltd",
    label: "Public Limited Company (Ltd)",
    shortLabel: "Public Ltd Company",
    panRequired: true,
    panPlaceholder: "Company PAN (e.g. AABCL1234K)",
    cinLabel: "Corporate Identity Number (CIN)",
    cinRequired: true,
    cinApplicable: true,
    cinPlaceholder: "L70100MH2010PLC123456 (21 characters)",
    gstinRequired: true,
    gstinNote: "Compulsory for registered corporate lessor (18% SAC 997212)",
    complianceRuleText: "Public Limited Company: 21-character CIN (*), Corporate PAN (*), and GSTIN (*) are compulsory.",
  },
  {
    id: "llp",
    label: "Limited Liability Partnership (LLP)",
    shortLabel: "LLP Entity",
    panRequired: true,
    panPlaceholder: "LLP PAN (e.g. AABFL1234K)",
    cinLabel: "LLP Identification Number (LLPIN)",
    cinRequired: true,
    cinApplicable: true,
    cinPlaceholder: "AAA-1234 (7 characters)",
    gstinRequired: true,
    gstinNote: "Compulsory for LLP commercial leasing entities",
    complianceRuleText: "LLP Entity: LLPIN (*) and Partnership PAN (*) are compulsory. GSTIN (*) is compulsory.",
  },
  {
    id: "partnership",
    label: "Partnership Firm",
    shortLabel: "Partnership Firm",
    panRequired: true,
    panPlaceholder: "Firm PAN (e.g. AABFP1234K)",
    cinLabel: "CIN (Not Applicable for Partnership)",
    cinRequired: false,
    cinApplicable: false,
    cinPlaceholder: "Not applicable for Partnership Firm",
    gstinRequired: false,
    gstinNote: "Optional if annual turnover < ₹20L. Compulsory if registered.",
    complianceRuleText: "Partnership Firm: Firm PAN (*) is compulsory. CIN is NOT applicable. GSTIN is optional under ₹20 Lakhs.",
  },
  {
    id: "sole_proprietorship",
    label: "Sole Proprietorship / Individual Landlord",
    shortLabel: "Sole Proprietorship",
    panRequired: true,
    panPlaceholder: "Individual / Proprietor PAN (e.g. ABCDE1234F)",
    cinLabel: "CIN (Not Applicable for Sole Proprietor)",
    cinRequired: false,
    cinApplicable: false,
    cinPlaceholder: "Not applicable for Sole Proprietor",
    gstinRequired: false,
    gstinNote: "Optional if annual commercial rent < ₹20L. Compulsory if registered.",
    complianceRuleText: "Sole Proprietorship: Individual PAN (*) is compulsory. CIN is NOT applicable. GSTIN is optional under ₹20 Lakhs.",
  },
  {
    id: "huf",
    label: "Hindu Undivided Family (HUF)",
    shortLabel: "HUF Entity",
    panRequired: true,
    panPlaceholder: "HUF PAN (e.g. AABCH1234K)",
    cinLabel: "CIN (Not Applicable for HUF)",
    cinRequired: false,
    cinApplicable: false,
    cinPlaceholder: "Not applicable for HUF",
    gstinRequired: false,
    gstinNote: "Optional if annual turnover < ₹20L",
    complianceRuleText: "HUF Entity: HUF PAN (*) is compulsory. CIN is NOT applicable. GSTIN is optional.",
  },
  {
    id: "trust_society",
    label: "Trust / Society / Association of Persons (AOP)",
    shortLabel: "Trust / Society",
    panRequired: true,
    panPlaceholder: "Trust PAN (e.g. AABCT1234K)",
    cinLabel: "Trust / Society Registration Number",
    cinRequired: true,
    cinApplicable: true,
    cinPlaceholder: "Registration Number under Trust / Societies Act",
    gstinRequired: false,
    gstinNote: "Optional / Depends on commercial lease turnover",
    complianceRuleText: "Trust / Society: Registration Number (*) and Trust PAN (*) are compulsory.",
  },
  {
    id: "reit_spv",
    label: "REIT / Real Estate Special Purpose Vehicle (SPV)",
    shortLabel: "REIT / SPV",
    panRequired: true,
    panPlaceholder: "SPV Corporate PAN",
    cinLabel: "SPV Corporate Identity Number (CIN)",
    cinRequired: true,
    cinApplicable: true,
    cinPlaceholder: "SPV CIN (21 characters)",
    gstinRequired: true,
    gstinNote: "Compulsory for institutional REIT / SPV (18% SAC 997212)",
    complianceRuleText: "REIT / SPV: CIN (*), PAN (*), and 18% Commercial GSTIN (*) are all strictly compulsory.",
  },
];

export function getOwnershipStructureRule(id: string): OwnershipStructureRule {
  return LEGAL_OWNERSHIP_STRUCTURES.find((s) => s.id === id) || LEGAL_OWNERSHIP_STRUCTURES[0];
}

/**
 * Normalizes any freeform or geocoded state name to the canonical Indian state / UT name.
 */
export function matchCanonicalIndianState(rawState: string): string | null {
  if (!rawState) return null;
  const s = rawState.trim().toLowerCase();

  for (const canonical of ALL_INDIAN_STATES) {
    if (canonical.toLowerCase() === s) return canonical;
  }

  if (s.includes("delhi")) return "Delhi (NCT)";
  if (s.includes("karnataka") || s === "ka") return "Karnataka";
  if (s.includes("maharashtra") || s === "mh") return "Maharashtra";
  if (s.includes("haryana") || s === "hr") return "Haryana";
  if (s.includes("uttar pradesh") || s === "up") return "Uttar Pradesh";
  if (s.includes("telangana") || s === "tg" || s === "ts") return "Telangana";
  if (s.includes("tamil nadu") || s === "tn") return "Tamil Nadu";
  if (s.includes("gujarat") || s === "gj") return "Gujarat";
  if (s.includes("west bengal") || s === "wb") return "West Bengal";
  if (s.includes("rajasthan") || s === "rj") return "Rajasthan";
  if (s.includes("kerala") || s === "kl") return "Kerala";
  if (s.includes("andhra") || s === "ap") return "Andhra Pradesh";
  if (s.includes("madhya pradesh") || s === "mp") return "Madhya Pradesh";
  if (s.includes("punjab") || s === "pb") return "Punjab";
  if (s.includes("odisha") || s.includes("orissa") || s === "od") return "Odisha";
  if (s.includes("assam") || s === "as") return "Assam";
  if (s.includes("bihar") || s === "br") return "Bihar";
  if (s.includes("chandigarh") || s === "ch") return "Chandigarh";
  if (s.includes("chhattisgarh") || s === "cg") return "Chhattisgarh";
  if (s.includes("goa") || s === "ga") return "Goa";
  if (s.includes("himachal") || s === "hp") return "Himachal Pradesh";
  if (s.includes("jammu") || s.includes("kashmir") || s === "jk") return "Jammu and Kashmir";
  if (s.includes("jharkhand") || s === "jh") return "Jharkhand";
  if (s.includes("uttarakhand") || s.includes("uttaranchal") || s === "uk") return "Uttarakhand";
  if (s.includes("puducherry") || s.includes("pondicherry") || s === "py") return "Puducherry";
  if (s.includes("ladakh") || s === "la") return "Ladakh";

  for (const canonical of ALL_INDIAN_STATES) {
    if (s.includes(canonical.toLowerCase()) || canonical.toLowerCase().includes(s)) {
      return canonical;
    }
  }

  return null;
}

/**
 * Matches a raw geocoded city name against the state's predefined cities list.
 */
export function matchCanonicalIndianCity(stateName: string, rawCity: string): string | null {
  if (!rawCity) return null;
  const cities = INDIAN_STATES_CITIES[stateName] || [];
  const c = rawCity.trim().toLowerCase();

  for (const city of cities) {
    if (city.toLowerCase() === c) return city;
  }

  for (const city of cities) {
    if (c.includes(city.toLowerCase()) || city.toLowerCase().includes(c)) {
      return city;
    }
  }

  return null;
}
