// Comprehensive Master Data for all 36 Indian States/UTs (with GST Codes) and Indian Cities

export interface IndianState {
  code: string; // 2-digit GST code
  name: string;
  type: "State" | "Union Territory";
  label: string; // e.g. "27 - Maharashtra"
}

export interface IndianCity {
  name: string;
  state: string;
  stateCode: string;
  isMajorHub?: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "01", name: "Jammu and Kashmir", type: "Union Territory", label: "01 - Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh", type: "State", label: "02 - Himachal Pradesh" },
  { code: "03", name: "Punjab", type: "State", label: "03 - Punjab" },
  { code: "04", name: "Chandigarh", type: "Union Territory", label: "04 - Chandigarh" },
  { code: "05", name: "Uttarakhand", type: "State", label: "05 - Uttarakhand" },
  { code: "06", name: "Haryana", type: "State", label: "06 - Haryana" },
  { code: "07", name: "Delhi", type: "Union Territory", label: "07 - Delhi" },
  { code: "08", name: "Rajasthan", type: "State", label: "08 - Rajasthan" },
  { code: "09", name: "Uttar Pradesh", type: "State", label: "09 - Uttar Pradesh" },
  { code: "10", name: "Bihar", type: "State", label: "10 - Bihar" },
  { code: "11", name: "Sikkim", type: "State", label: "11 - Sikkim" },
  { code: "12", name: "Arunachal Pradesh", type: "State", label: "12 - Arunachal Pradesh" },
  { code: "13", name: "Nagaland", type: "State", label: "13 - Nagaland" },
  { code: "14", name: "Manipur", type: "State", label: "14 - Manipur" },
  { code: "15", name: "Mizoram", type: "State", label: "15 - Mizoram" },
  { code: "16", name: "Tripura", type: "State", label: "16 - Tripura" },
  { code: "17", name: "Meghalaya", type: "State", label: "17 - Meghalaya" },
  { code: "18", name: "Assam", type: "State", label: "18 - Assam" },
  { code: "19", name: "West Bengal", type: "State", label: "19 - West Bengal" },
  { code: "20", name: "Jharkhand", type: "State", label: "20 - Jharkhand" },
  { code: "21", name: "Odisha", type: "State", label: "21 - Odisha" },
  { code: "22", name: "Chhattisgarh", type: "State", label: "22 - Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh", type: "State", label: "23 - Madhya Pradesh" },
  { code: "24", name: "Gujarat", type: "State", label: "24 - Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu", type: "Union Territory", label: "26 - Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra", type: "State", label: "27 - Maharashtra" },
  { code: "29", name: "Karnataka", type: "State", label: "29 - Karnataka" },
  { code: "30", name: "Goa", type: "State", label: "30 - Goa" },
  { code: "31", name: "Lakshadweep", type: "Union Territory", label: "31 - Lakshadweep" },
  { code: "32", name: "Kerala", type: "State", label: "32 - Kerala" },
  { code: "33", name: "Tamil Nadu", type: "State", label: "33 - Tamil Nadu" },
  { code: "34", name: "Puducherry", type: "Union Territory", label: "34 - Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands", type: "Union Territory", label: "35 - Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana", type: "State", label: "36 - Telangana" },
  { code: "37", name: "Andhra Pradesh", type: "State", label: "37 - Andhra Pradesh" },
  { code: "38", name: "Ladakh", type: "Union Territory", label: "38 - Ladakh" },
  { code: "97", name: "Other Territory", type: "Union Territory", label: "97 - Other Territory" },
];

export const MAJOR_METROS = [
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Ahmedabad",
  "Kolkata",
  "Gurugram",
  "Noida",
];

export const ALL_INDIAN_CITIES_DETAILED: IndianCity[] = [
  // Maharashtra
  { name: "Mumbai", state: "Maharashtra", stateCode: "27", isMajorHub: true },
  { name: "Pune", state: "Maharashtra", stateCode: "27", isMajorHub: true },
  { name: "Navi Mumbai", state: "Maharashtra", stateCode: "27", isMajorHub: true },
  { name: "Thane", state: "Maharashtra", stateCode: "27", isMajorHub: true },
  { name: "Nagpur", state: "Maharashtra", stateCode: "27" },
  { name: "Nashik", state: "Maharashtra", stateCode: "27" },
  { name: "Aurangabad (Chhatrapati Sambhajinagar)", state: "Maharashtra", stateCode: "27" },
  { name: "Kolhapur", state: "Maharashtra", stateCode: "27" },
  { name: "Solapur", state: "Maharashtra", stateCode: "27" },
  { name: "Amravati", state: "Maharashtra", stateCode: "27" },
  { name: "Akola", state: "Maharashtra", stateCode: "27" },
  { name: "Jalgaon", state: "Maharashtra", stateCode: "27" },
  { name: "Latur", state: "Maharashtra", stateCode: "27" },
  { name: "Dhule", state: "Maharashtra", stateCode: "27" },
  { name: "Ahmednagar", state: "Maharashtra", stateCode: "27" },
  { name: "Sangli", state: "Maharashtra", stateCode: "27" },
  { name: "Satara", state: "Maharashtra", stateCode: "27" },
  { name: "Vasai-Virar", state: "Maharashtra", stateCode: "27" },
  { name: "Kalyan-Dombivli", state: "Maharashtra", stateCode: "27" },

  // Karnataka
  { name: "Bengaluru", state: "Karnataka", stateCode: "29", isMajorHub: true },
  { name: "Mysore (Mysuru)", state: "Karnataka", stateCode: "29" },
  { name: "Mangalore (Mangaluru)", state: "Karnataka", stateCode: "29" },
  { name: "Hubballi-Dharwad", state: "Karnataka", stateCode: "29" },
  { name: "Belagavi (Belgaum)", state: "Karnataka", stateCode: "29" },
  { name: "Gulbarga (Kalaburagi)", state: "Karnataka", stateCode: "29" },
  { name: "Bellary (Ballari)", state: "Karnataka", stateCode: "29" },
  { name: "Davanagere", state: "Karnataka", stateCode: "29" },
  { name: "Shimoga (Shivamogga)", state: "Karnataka", stateCode: "29" },
  { name: "Tumakuru", state: "Karnataka", stateCode: "29" },
  { name: "Udupi", state: "Karnataka", stateCode: "29" },

  // Delhi NCR
  { name: "Delhi", state: "Delhi", stateCode: "07", isMajorHub: true },
  { name: "New Delhi", state: "Delhi", stateCode: "07", isMajorHub: true },
  { name: "Gurugram (Gurgaon)", state: "Haryana", stateCode: "06", isMajorHub: true },
  { name: "Noida", state: "Uttar Pradesh", stateCode: "09", isMajorHub: true },
  { name: "Greater Noida", state: "Uttar Pradesh", stateCode: "09", isMajorHub: true },
  { name: "Faridabad", state: "Haryana", stateCode: "06" },
  { name: "Ghaziabad", state: "Uttar Pradesh", stateCode: "09" },

  // Telangana & Andhra Pradesh
  { name: "Hyderabad", state: "Telangana", stateCode: "36", isMajorHub: true },
  { name: "Warangal", state: "Telangana", stateCode: "36" },
  { name: "Nizamabad", state: "Telangana", stateCode: "36" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", stateCode: "37", isMajorHub: true },
  { name: "Vijayawada", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Guntur", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Tirupati", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Rajahmundry", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Kakinada", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Nellore", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Kurnool", state: "Andhra Pradesh", stateCode: "37" },
  { name: "Anantapur", state: "Andhra Pradesh", stateCode: "37" },

  // Tamil Nadu
  { name: "Chennai", state: "Tamil Nadu", stateCode: "33", isMajorHub: true },
  { name: "Coimbatore", state: "Tamil Nadu", stateCode: "33", isMajorHub: true },
  { name: "Madurai", state: "Tamil Nadu", stateCode: "33" },
  { name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", stateCode: "33" },
  { name: "Salem", state: "Tamil Nadu", stateCode: "33" },
  { name: "Tiruppur", state: "Tamil Nadu", stateCode: "33" },
  { name: "Erode", state: "Tamil Nadu", stateCode: "33" },
  { name: "Tirunelveli", state: "Tamil Nadu", stateCode: "33" },
  { name: "Vellore", state: "Tamil Nadu", stateCode: "33" },
  { name: "Thoothukudi", state: "Tamil Nadu", stateCode: "33" },

  // Gujarat
  { name: "Ahmedabad", state: "Gujarat", stateCode: "24", isMajorHub: true },
  { name: "Gandhinagar (GIFT City)", state: "Gujarat", stateCode: "24", isMajorHub: true },
  { name: "Surat", state: "Gujarat", stateCode: "24", isMajorHub: true },
  { name: "Vadodara", state: "Gujarat", stateCode: "24" },
  { name: "Rajkot", state: "Gujarat", stateCode: "24" },
  { name: "Bhavnagar", state: "Gujarat", stateCode: "24" },
  { name: "Jamnagar", state: "Gujarat", stateCode: "24" },
  { name: "Junagadh", state: "Gujarat", stateCode: "24" },
  { name: "Anand", state: "Gujarat", stateCode: "24" },
  { name: "Nadiad", state: "Gujarat", stateCode: "24" },

  // West Bengal
  { name: "Kolkata", state: "West Bengal", stateCode: "19", isMajorHub: true },
  { name: "Howrah", state: "West Bengal", stateCode: "19" },
  { name: "Durgapur", state: "West Bengal", stateCode: "19" },
  { name: "Asansol", state: "West Bengal", stateCode: "19" },
  { name: "Siliguri", state: "West Bengal", stateCode: "19" },
  { name: "Haldia", state: "West Bengal", stateCode: "19" },

  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", stateCode: "08", isMajorHub: true },
  { name: "Jodhpur", state: "Rajasthan", stateCode: "08" },
  { name: "Udaipur", state: "Rajasthan", stateCode: "08" },
  { name: "Kota", state: "Rajasthan", stateCode: "08" },
  { name: "Bikaner", state: "Rajasthan", stateCode: "08" },
  { name: "Ajmer", state: "Rajasthan", stateCode: "08" },
  { name: "Bhilwara", state: "Rajasthan", stateCode: "08" },
  { name: "Alwar", state: "Rajasthan", stateCode: "08" },
  { name: "Bharatpur", state: "Rajasthan", stateCode: "08" },

  // Uttar Pradesh
  { name: "Lucknow", state: "Uttar Pradesh", stateCode: "09", isMajorHub: true },
  { name: "Kanpur", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Varanasi", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Agra", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Prayagraj (Allahabad)", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Meerut", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Bareilly", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Aligarh", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Moradabad", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Saharanpur", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Gorakhpur", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Jhansi", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Mathura", state: "Uttar Pradesh", stateCode: "09" },
  { name: "Muzaffarnagar", state: "Uttar Pradesh", stateCode: "09" },

  // Madhya Pradesh
  { name: "Indore", state: "Madhya Pradesh", stateCode: "23", isMajorHub: true },
  { name: "Bhopal", state: "Madhya Pradesh", stateCode: "23", isMajorHub: true },
  { name: "Jabalpur", state: "Madhya Pradesh", stateCode: "23" },
  { name: "Gwalior", state: "Madhya Pradesh", stateCode: "23" },
  { name: "Ujjain", state: "Madhya Pradesh", stateCode: "23" },
  { name: "Sagar", state: "Madhya Pradesh", stateCode: "23" },

  // Kerala
  { name: "Kochi (Cochin)", state: "Kerala", stateCode: "32", isMajorHub: true },
  { name: "Thiruvananthapuram", state: "Kerala", stateCode: "32", isMajorHub: true },
  { name: "Kozhikode (Calicut)", state: "Kerala", stateCode: "32" },
  { name: "Thrissur", state: "Kerala", stateCode: "32" },
  { name: "Kollam", state: "Kerala", stateCode: "32" },
  { name: "Kannur", state: "Kerala", stateCode: "32" },

  // Punjab & Chandigarh & Haryana
  { name: "Chandigarh (Tricity)", state: "Chandigarh", stateCode: "04", isMajorHub: true },
  { name: "Mohali", state: "Punjab", stateCode: "03", isMajorHub: true },
  { name: "Panchkula", state: "Haryana", stateCode: "06" },
  { name: "Ludhiana", state: "Punjab", stateCode: "03" },
  { name: "Amritsar", state: "Punjab", stateCode: "03" },
  { name: "Jalandhar", state: "Punjab", stateCode: "03" },
  { name: "Patiala", state: "Punjab", stateCode: "03" },
  { name: "Bathinda", state: "Punjab", stateCode: "03" },
  { name: "Panipat", state: "Haryana", stateCode: "06" },
  { name: "Ambala", state: "Haryana", stateCode: "06" },
  { name: "Karnal", state: "Haryana", stateCode: "06" },
  { name: "Rohtak", state: "Haryana", stateCode: "06" },
  { name: "Sonipat", state: "Haryana", stateCode: "06" },

  // Odisha & Bihar & Jharkhand & Chhattisgarh
  { name: "Bhubaneswar", state: "Odisha", stateCode: "21", isMajorHub: true },
  { name: "Cuttack", state: "Odisha", stateCode: "21" },
  { name: "Rourkela", state: "Odisha", stateCode: "21" },
  { name: "Patna", state: "Bihar", stateCode: "10", isMajorHub: true },
  { name: "Gaya", state: "Bihar", stateCode: "10" },
  { name: "Bhagalpur", state: "Bihar", stateCode: "10" },
  { name: "Muzaffarpur", state: "Bihar", stateCode: "10" },
  { name: "Darbhanga", state: "Bihar", stateCode: "10" },
  { name: "Ranchi", state: "Jharkhand", stateCode: "20", isMajorHub: true },
  { name: "Jamshedpur", state: "Jharkhand", stateCode: "20" },
  { name: "Dhanbad", state: "Jharkhand", stateCode: "20" },
  { name: "Bokaro Steel City", state: "Jharkhand", stateCode: "20" },
  { name: "Raipur", state: "Chhattisgarh", stateCode: "22", isMajorHub: true },
  { name: "Bhilai", state: "Chhattisgarh", stateCode: "22" },
  { name: "Bilaspur", state: "Chhattisgarh", stateCode: "22" },

  // Goa & Uttarakhand & Himachal Pradesh & J&K
  { name: "Panaji (Goa)", state: "Goa", stateCode: "30", isMajorHub: true },
  { name: "Margao", state: "Goa", stateCode: "30" },
  { name: "Dehradun", state: "Uttarakhand", stateCode: "05", isMajorHub: true },
  { name: "Haridwar", state: "Uttarakhand", stateCode: "05" },
  { name: "Rishikesh", state: "Uttarakhand", stateCode: "05" },
  { name: "Shimla", state: "Himachal Pradesh", stateCode: "02" },
  { name: "Dharamshala", state: "Himachal Pradesh", stateCode: "02" },
  { name: "Srinagar", state: "Jammu and Kashmir", stateCode: "01" },
  { name: "Jammu", state: "Jammu and Kashmir", stateCode: "01" },

  // North-East & Others
  { name: "Guwahati", state: "Assam", stateCode: "18", isMajorHub: true },
  { name: "Shillong", state: "Meghalaya", stateCode: "17" },
  { name: "Agartala", state: "Tripura", stateCode: "16" },
  { name: "Imphal", state: "Manipur", stateCode: "14" },
  { name: "Aizawl", state: "Mizoram", stateCode: "15" },
  { name: "Kohima", state: "Nagaland", stateCode: "13" },
  { name: "Dimapur", state: "Nagaland", stateCode: "13" },
  { name: "Gangtok", state: "Sikkim", stateCode: "11" },
  { name: "Itanagar", state: "Arunachal Pradesh", stateCode: "12" },
  { name: "Puducherry (Pondicherry)", state: "Puducherry", stateCode: "34" },
  { name: "Port Blair", state: "Andaman and Nicobar Islands", stateCode: "35" }
];

export const ALL_INDIAN_CITY_NAMES: string[] = ALL_INDIAN_CITIES_DETAILED.map((c) => c.name);

// Helper function to find state by city name
export function getStateForCity(cityName: string): IndianState | undefined {
  if (!cityName) return undefined;
  const clean = cityName.trim().toLowerCase();
  
  // Exact or partial match
  const found = ALL_INDIAN_CITIES_DETAILED.find(
    (c) => c.name.toLowerCase() === clean || c.name.toLowerCase().startsWith(clean) || clean.includes(c.name.toLowerCase())
  );

  if (found) {
    return INDIAN_STATES.find((s) => s.code === found.stateCode || s.name.toLowerCase() === found.state.toLowerCase());
  }

  return undefined;
}

// Helper function to get cities strictly belonging to a specific state or GST code
export function getCitiesForState(stateNameOrCode: string): IndianCity[] {
  if (!stateNameOrCode) return [];
  const clean = stateNameOrCode.trim().toLowerCase();

  // Try matching by stateCode or name (e.g. "27", "Maharashtra", "27 - Maharashtra")
  const stateObj = INDIAN_STATES.find(
    (s) =>
      s.code === clean ||
      s.name.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()) ||
      clean.startsWith(s.code)
  );

  const targetCode = stateObj?.code;
  const targetName = stateObj?.name.toLowerCase();

  return ALL_INDIAN_CITIES_DETAILED.filter((c) => {
    if (targetCode && c.stateCode === targetCode) return true;
    if (targetName && c.state.toLowerCase() === targetName) return true;
    return c.state.toLowerCase() === clean || clean.includes(c.state.toLowerCase());
  });
}
