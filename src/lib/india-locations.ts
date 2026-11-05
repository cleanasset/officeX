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
  "Delhi": [
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
    gstinRequired: false,
    gstinNote: "Compulsory if annual turnover > ₹20L. Standard 18% SAC 997212",
    complianceRuleText: "Private Limited Company: CIN (*) and Corporate PAN (*) are compulsory. GSTIN is required if turnover > ₹20 Lakhs.",
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
    gstinRequired: false,
    gstinNote: "Compulsory if annual turnover > ₹20L. Standard 18% SAC 997212",
    complianceRuleText: "Public Limited Company: 21-character CIN (*) and Corporate PAN (*) are compulsory.",
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
    gstinRequired: false,
    gstinNote: "Compulsory if annual turnover > ₹20L.",
    complianceRuleText: "LLP Entity: LLPIN (*) and Partnership PAN (*) are compulsory.",
  },
  {
    id: "partnership",
    label: "Partnership Firm",
    shortLabel: "Partnership Firm",
    panRequired: true,
    panPlaceholder: "Firm PAN (e.g. AABFP1234K)",
    cinLabel: "Firm Registration / RoF / CIN",
    cinRequired: false,
    cinApplicable: true,
    cinPlaceholder: "Registrar of Firms / Deed No. / CIN (if any)",
    gstinRequired: false,
    gstinNote: "Optional if annual turnover < ₹20L. Compulsory if registered.",
    complianceRuleText: "Partnership Firm: Firm PAN (*) is compulsory. Registration / RoF / CIN is optional. GSTIN is optional under ₹20 Lakhs.",
  },
  {
    id: "sole_proprietorship",
    label: "Sole Proprietorship / Individual Landlord",
    shortLabel: "Sole Proprietorship",
    panRequired: true,
    panPlaceholder: "Individual / Proprietor PAN (e.g. ABCDE1234F)",
    cinLabel: "Registration / Trade License / CIN",
    cinRequired: false,
    cinApplicable: true,
    cinPlaceholder: "Trade License, MSME / Udyam, or CIN (if any)",
    gstinRequired: false,
    gstinNote: "Optional if annual commercial rent < ₹20L. Compulsory if registered.",
    complianceRuleText: "Sole Proprietorship: Individual PAN (*) is compulsory. Registration / Trade License / CIN is optional. GSTIN is optional under ₹20 Lakhs.",
  },
  {
    id: "huf",
    label: "Hindu Undivided Family (HUF)",
    shortLabel: "HUF Entity",
    panRequired: true,
    panPlaceholder: "HUF PAN (e.g. AABCH1234K)",
    cinLabel: "HUF Registration / Deed Number",
    cinRequired: false,
    cinApplicable: true,
    cinPlaceholder: "HUF Deed / Registration Number",
    gstinRequired: false,
    gstinNote: "For turnover > ₹20L",
    complianceRuleText: "HUF Entity: HUF PAN (*) is compulsory.",
  },
  {
    id: "trust_society",
    label: "Trust / Society / Association of Persons (AOP)",
    shortLabel: "Trust / Society",
    panRequired: true,
    panPlaceholder: "Trust PAN (e.g. AABCT1234K)",
    cinLabel: "Trust / Society Registration Number",
    cinRequired: false,
    cinApplicable: true,
    cinPlaceholder: "Registration Number under Societies Act",
    gstinRequired: false,
    gstinNote: "Depends on commercial lease turnover",
    complianceRuleText: "Trust / Society: Trust PAN (*) is compulsory.",
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
    gstinRequired: false,
    gstinNote: "Compulsory for institutional REIT / SPV (18% SAC 997212)",
    complianceRuleText: "REIT / SPV: CIN (*) and PAN (*) are compulsory.",
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
  const canonicalState = matchCanonicalIndianState(stateName) || stateName;
  const cities = INDIAN_STATES_CITIES[canonicalState] || INDIAN_STATES_CITIES[stateName] || [];
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

export interface ParsedIndianAddress {
  state: string | null;
  city: string | null;
  pincode: string | null;
  microMarket: string | null;
}

export const KNOWN_LOCALITY_MAP: Record<string, { city: string; state: string }> = {
  // Gujarat / Ahmedabad & Gandhinagar
  "devasya gold": { city: "Ahmedabad", state: "Gujarat" },
  "devasya international": { city: "Ahmedabad", state: "Gujarat" },
  "devasya": { city: "Ahmedabad", state: "Gujarat" },
  "hill town circle road": { city: "Ahmedabad", state: "Gujarat" },
  "hill town circle": { city: "Ahmedabad", state: "Gujarat" },
  "hill town": { city: "Ahmedabad", state: "Gujarat" },
  "narodaahmeda": { city: "Ahmedabad", state: "Gujarat" },
  "narodaahmedabad": { city: "Ahmedabad", state: "Gujarat" },
  "naroda": { city: "Ahmedabad", state: "Gujarat" },
  "new india colony": { city: "Ahmedabad", state: "Gujarat" },
  "sg highway": { city: "Ahmedabad", state: "Gujarat" },
  "s.g. highway": { city: "Ahmedabad", state: "Gujarat" },
  "sindhubhavan": { city: "Ahmedabad", state: "Gujarat" },
  "sbr": { city: "Ahmedabad", state: "Gujarat" },
  "science city": { city: "Ahmedabad", state: "Gujarat" },
  "sola": { city: "Ahmedabad", state: "Gujarat" },
  "prahlad nagar": { city: "Ahmedabad", state: "Gujarat" },
  "bopal": { city: "Ahmedabad", state: "Gujarat" },
  "bodakdev": { city: "Ahmedabad", state: "Gujarat" },
  "satellite": { city: "Ahmedabad", state: "Gujarat" },
  "thaltej": { city: "Ahmedabad", state: "Gujarat" },
  "vastrapur": { city: "Ahmedabad", state: "Gujarat" },
  "maninagar": { city: "Ahmedabad", state: "Gujarat" },
  "sanand": { city: "Ahmedabad", state: "Gujarat" },
  "nikol": { city: "Ahmedabad", state: "Gujarat" },
  "odhav": { city: "Ahmedabad", state: "Gujarat" },
  "vatva": { city: "Ahmedabad", state: "Gujarat" },
  "bapunagar": { city: "Ahmedabad", state: "Gujarat" },
  "vastral": { city: "Ahmedabad", state: "Gujarat" },
  "kathwada": { city: "Ahmedabad", state: "Gujarat" },
  "gift city": { city: "GIFT City", state: "Gujarat" },
  "infocity": { city: "Gandhinagar", state: "Gujarat" },
  "gandhinagar": { city: "Gandhinagar", state: "Gujarat" },
  "chharodi": { city: "Ahmedabad", state: "Gujarat" },
  "gota": { city: "Ahmedabad", state: "Gujarat" },
  "chandkheda": { city: "Ahmedabad", state: "Gujarat" },
  "motera": { city: "Ahmedabad", state: "Gujarat" },
  "navrangpura": { city: "Ahmedabad", state: "Gujarat" },
  "ashram road": { city: "Ahmedabad", state: "Gujarat" },
  "ahmedabad": { city: "Ahmedabad", state: "Gujarat" },
  "ahmeda": { city: "Ahmedabad", state: "Gujarat" },
  "ahemdabad": { city: "Ahmedabad", state: "Gujarat" },

  // Karnataka / Bengaluru
  "whitefield": { city: "Bengaluru", state: "Karnataka" },
  "koramangala": { city: "Bengaluru", state: "Karnataka" },
  "bellandur": { city: "Bengaluru", state: "Karnataka" },
  "electronic city": { city: "Bengaluru", state: "Karnataka" },
  "marathahalli": { city: "Bengaluru", state: "Karnataka" },
  "indiranagar": { city: "Bengaluru", state: "Karnataka" },
  "hebbal": { city: "Bengaluru", state: "Karnataka" },
  "sarjapur": { city: "Bengaluru", state: "Karnataka" },
  "outer ring road": { city: "Bengaluru", state: "Karnataka" },
  "domlur": { city: "Bengaluru", state: "Karnataka" },
  "manyata": { city: "Bengaluru", state: "Karnataka" },
  "hsr layout": { city: "Bengaluru", state: "Karnataka" },
  "rajajinagar": { city: "Bengaluru", state: "Karnataka" },
  "bannerghatta": { city: "Bengaluru", state: "Karnataka" },
  "yeshwanthpur": { city: "Bengaluru", state: "Karnataka" },
  "malleshwaram": { city: "Bengaluru", state: "Karnataka" },
  "bengaluru": { city: "Bengaluru", state: "Karnataka" },
  "bangalore": { city: "Bengaluru", state: "Karnataka" },

  // Maharashtra / Mumbai & Pune
  "bkc": { city: "Mumbai", state: "Maharashtra" },
  "bandra kurla complex": { city: "Mumbai", state: "Maharashtra" },
  "bandra": { city: "Mumbai", state: "Maharashtra" },
  "andheri": { city: "Mumbai", state: "Maharashtra" },
  "nariman point": { city: "Mumbai", state: "Maharashtra" },
  "lower parel": { city: "Mumbai", state: "Maharashtra" },
  "worli": { city: "Mumbai", state: "Maharashtra" },
  "powai": { city: "Mumbai", state: "Maharashtra" },
  "malad": { city: "Mumbai", state: "Maharashtra" },
  "goregaon": { city: "Mumbai", state: "Maharashtra" },
  "kurla": { city: "Mumbai", state: "Maharashtra" },
  "vashi": { city: "Navi Mumbai", state: "Maharashtra" },
  "navi mumbai": { city: "Navi Mumbai", state: "Maharashtra" },
  "thane": { city: "Thane", state: "Maharashtra" },
  "airoli": { city: "Navi Mumbai", state: "Maharashtra" },
  "mumbai": { city: "Mumbai", state: "Maharashtra" },
  "bombay": { city: "Mumbai", state: "Maharashtra" },
  "hinjewadi": { city: "Pune", state: "Maharashtra" },
  "baner": { city: "Pune", state: "Maharashtra" },
  "wakad": { city: "Pune", state: "Maharashtra" },
  "kharadi": { city: "Pune", state: "Maharashtra" },
  "magarpatta": { city: "Pune", state: "Maharashtra" },
  "viman nagar": { city: "Pune", state: "Maharashtra" },
  "hadapsar": { city: "Pune", state: "Maharashtra" },
  "pune": { city: "Pune", state: "Maharashtra" },

  // Haryana / Gurugram
  "cyber city": { city: "Gurugram", state: "Haryana" },
  "cyber hub": { city: "Gurugram", state: "Haryana" },
  "udyog vihar": { city: "Gurugram", state: "Haryana" },
  "golf course road": { city: "Gurugram", state: "Haryana" },
  "golf course extension": { city: "Gurugram", state: "Haryana" },
  "sohna road": { city: "Gurugram", state: "Haryana" },
  "manesar": { city: "Gurugram", state: "Haryana" },
  "gurugram": { city: "Gurugram", state: "Haryana" },
  "gurgaon": { city: "Gurugram", state: "Haryana" },

  // Uttar Pradesh / Noida
  "sector 62": { city: "Noida", state: "Uttar Pradesh" },
  "sector 16": { city: "Noida", state: "Uttar Pradesh" },
  "sector 18": { city: "Noida", state: "Uttar Pradesh" },
  "sector 125": { city: "Noida", state: "Uttar Pradesh" },
  "sector 132": { city: "Noida", state: "Uttar Pradesh" },
  "expressway noida": { city: "Noida", state: "Uttar Pradesh" },
  "noida": { city: "Noida", state: "Uttar Pradesh" },
  "greater noida": { city: "Greater Noida", state: "Uttar Pradesh" },

  // Telangana / Hyderabad
  "hitec city": { city: "Hyderabad", state: "Telangana" },
  "gachibowli": { city: "Hyderabad", state: "Telangana" },
  "madhapur": { city: "Hyderabad", state: "Telangana" },
  "kondapur": { city: "Hyderabad", state: "Telangana" },
  "financial district": { city: "Hyderabad", state: "Telangana" },
  "nanakramguda": { city: "Hyderabad", state: "Telangana" },
  "hyderabad": { city: "Hyderabad", state: "Telangana" },
  "cyberabad": { city: "Hyderabad", state: "Telangana" },

  // Tamil Nadu / Chennai
  "omr": { city: "Chennai", state: "Tamil Nadu" },
  "guindy": { city: "Chennai", state: "Tamil Nadu" },
  "t nagar": { city: "Chennai", state: "Tamil Nadu" },
  "perungudi": { city: "Chennai", state: "Tamil Nadu" },
  "velachery": { city: "Chennai", state: "Tamil Nadu" },
  "chennai": { city: "Chennai", state: "Tamil Nadu" },
  "madras": { city: "Chennai", state: "Tamil Nadu" },

  // Delhi (NCT)
  "aerocity": { city: "New Delhi", state: "Delhi (NCT)" },
  "connaught place": { city: "New Delhi", state: "Delhi (NCT)" },
  "nehru place": { city: "New Delhi", state: "Delhi (NCT)" },
  "barakhamba": { city: "New Delhi", state: "Delhi (NCT)" },
  "saket": { city: "New Delhi", state: "Delhi (NCT)" },
  "okhla": { city: "New Delhi", state: "Delhi (NCT)" },
  "delhi": { city: "New Delhi", state: "Delhi (NCT)" },
  "new delhi": { city: "New Delhi", state: "Delhi (NCT)" },

  // West Bengal / Kolkata
  "salt lake": { city: "Kolkata", state: "West Bengal" },
  "new town": { city: "Kolkata", state: "West Bengal" },
  "rajarhat": { city: "Kolkata", state: "West Bengal" },
  "kolkata": { city: "Kolkata", state: "West Bengal" },
  "calcutta": { city: "Kolkata", state: "West Bengal" },
};

/**
 * Intelligent parser that extracts Indian State, City, Pincode and Micro-Market
 * directly from any freeform address string (typed, pasted, or selected).
 */
export function parseLocationFromAddress(rawAddress: string): ParsedIndianAddress {
  if (!rawAddress || !rawAddress.trim()) {
    return { state: null, city: null, pincode: null, microMarket: null };
  }

  const text = rawAddress.trim();
  const lower = text.toLowerCase();

  // 1. Pincode Extraction (6 digits)
  let pincode: string | null = null;
  const pinMatch = text.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    pincode = pinMatch[1];
  }

  let state: string | null = null;
  let city: string | null = null;
  let microMarket: string | null = null;

  // 2. Localities & Major Hubs check (Highest accuracy for commercial properties)
  for (const [locKey, info] of Object.entries(KNOWN_LOCALITY_MAP)) {
    const escaped = locKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}`, "i");
    if (regex.test(lower) || lower.includes(locKey)) {
      city = info.city;
      state = info.state;
      if (locKey !== info.city.toLowerCase() && locKey !== info.state.toLowerCase()) {
        microMarket = locKey
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
      break;
    }
  }

  // 3. Fallback: Search all canonical cities across all Indian states
  if (!city) {
    for (const [stName, cityList] of Object.entries(INDIAN_STATES_CITIES)) {
      for (const c of cityList) {
        const cLower = c.toLowerCase();
        // Match whole word or clean substring
        if (new RegExp(`\\b${cLower}\\b`, "i").test(lower)) {
          city = c;
          state = stName;
          break;
        }
      }
      if (city) break;
    }
  }

  // 4. Fallback: Search all Indian states if state is still unresolved
  if (!state) {
    state = matchCanonicalIndianState(text);
  }

  // 5. If state resolved but city not found, default to top city of that state
  if (state && !city) {
    const stateCities = INDIAN_STATES_CITIES[state] || [];
    if (stateCities.length > 0) {
      city = stateCities[0];
    }
  }

  // 6. Infer state from pincode prefix if state still missing
  if (!state && pincode) {
    const prefix2 = parseInt(pincode.slice(0, 2), 10);
    if (prefix2 === 11) { state = "Delhi (NCT)"; if (!city) city = "New Delhi"; }
    else if (prefix2 >= 12 && prefix2 <= 13) { state = "Haryana"; if (!city) city = "Gurugram"; }
    else if (prefix2 >= 20 && prefix2 <= 28) { state = "Uttar Pradesh"; if (!city) city = "Noida"; }
    else if (prefix2 >= 30 && prefix2 <= 34) { state = "Rajasthan"; if (!city) city = "Jaipur"; }
    else if (prefix2 >= 36 && prefix2 <= 39) { state = "Gujarat"; if (!city) city = "Ahmedabad"; }
    else if (prefix2 >= 40 && prefix2 <= 44) { state = "Maharashtra"; if (!city) city = "Mumbai"; }
    else if (prefix2 >= 50 && prefix2 <= 53) { state = "Telangana"; if (!city) city = "Hyderabad"; }
    else if (prefix2 >= 56 && prefix2 <= 59) { state = "Karnataka"; if (!city) city = "Bengaluru"; }
    else if (prefix2 >= 60 && prefix2 <= 64) { state = "Tamil Nadu"; if (!city) city = "Chennai"; }
    else if (prefix2 >= 67 && prefix2 <= 69) { state = "Kerala"; if (!city) city = "Kochi"; }
    else if (prefix2 >= 70 && prefix2 <= 74) { state = "West Bengal"; if (!city) city = "Kolkata"; }
  }

  // 7. Micro-Market extraction from address segments if not set
  if (!microMarket) {
    const segments = text.split(",").map((s) => s.trim()).filter(Boolean);
    if (segments.length > 1) {
      // Often the 2nd segment is the locality or sub-market (e.g. Hill Town Circle Road / New India Colony)
      const cand = segments[1];
      if (
        cand &&
        (!state || !cand.toLowerCase().includes(state.toLowerCase())) &&
        (!city || !cand.toLowerCase().includes(city.toLowerCase())) &&
        !/\b[1-9][0-9]{5}\b/.test(cand)
      ) {
        microMarket = cand;
      }
    }
  }

  return { state, city, pincode, microMarket };
}
