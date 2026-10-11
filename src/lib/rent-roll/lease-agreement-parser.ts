/**
 * Commercial Lease Agreement Parser
 * Extracts commercial lease particulars, rent models (per sq.ft, per seat, fixed),
 * escalation terms, deposits, CAM, parking, and statutory metadata from agreement text.
 */

export interface ExtractedLeaseAgreement {
  // Parties & Property
  occupantName: string;
  companyName: string;
  billingEntity: string;
  propertyName: string;
  buildingName: string;
  spaceName: string;
  
  // Area & Units
  areaSqft: number;
  seatCount: number;

  // Property Condition & Fit-out
  fitoutCondition: "Fully Furnished" | "Bare Shell" | "Warm Shell" | "Semi-Furnished";
  workstationsCount: number;
  cabinsCount: number;
  meetingRoomsCount: number;
  possessionDate: string;

  // Rent Calculation Model
  billingModel: "Area-based" | "Seat-based" | "Fixed" | "Hybrid" | "Pure Rent";
  ratePerSqft: number;
  ratePerSeat: number;
  bareShellRate: number;
  fitoutRate: number;
  monthlyRent: number;

  // Electricity & Utilities
  electricityBilling: "Submeter Actuals" | "Fixed Monthly" | "Included in Rent" | "Proportionate Share";
  electricityLoadKva: number;
  powerBackupType: "100% DG Power Backup" | "Partial DG Backup" | "No DG Backup";
  dgRatePerKwh: number;
  waterCharges: "Included in CAM" | "Actuals" | "Fixed Monthly";

  // CAM & Utilities
  camType: "Per Sq.Ft" | "Fixed Monthly" | "Included" | "Actuals";
  camRate: number;
  camMonthly: number;

  // Parking Terms
  carParkingSlots: number;
  carParkingRate: number;
  twoWheelerSlots: number;
  twoWheelerRate: number;
  parkingMonthly: number;

  // Calculated Gross
  totalMonthlyPayout: number;

  // Dates & Periods
  startDate: string;
  endDate: string;
  leaseTermMonths: number;
  fitoutDays: number;
  lockInMonths: number;
  noticeDays: number;

  // Security Deposit
  securityDeposit: number;
  depositMonths: number;

  // Escalation Terms
  escalationPct: number;
  escalationFrequency: "Annual" | "Biannual" | "Quarterly" | "Triennial";
  escalationStartDate: string;

  // Commercial & Statutory Terms
  paymentTerms: string;
  paymentDueDay: number;
  lateInterestPct: number;
  gstApplicable: boolean;
  tdsApplicable: boolean;
  stampDutySharing: "50:50 Shared" | "100% Tenant" | "100% Landlord";
  notes: string;

  // Parsing Metadata
  confidence: number;
  extractedFieldsCount: number;
  summaryHighlights: string[];
}

/**
 * Normalizes number from Indian and international number strings
 * (e.g., "1,50,000", "150,000.00", "Rs. 85/-")
 */
function parseCleanNumber(val: string | null | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper to normalize date representations into ISO YYYY-MM-DD
 */
function parseCleanDate(val: string | null | undefined): string {
  if (!val) return "";
  const cleaned = val.trim().replace(/(?:st|nd|rd|th)/gi, "");

  // Try standard Date parsing
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    if (month > 12 && day <= 12) {
      // Swapped format MM/DD/YYYY
      const tmp = day; day = month; month = tmp;
    }
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  return "";
}

/**
 * Main parser for commercial lease agreement text
 */
export function parseCommercialLeaseText(rawText: string, fileName?: string): ExtractedLeaseAgreement {
  const text = rawText.replace(/\r\n/g, "\n");
  const highlights: string[] = [];
  let fieldCount = 0;

  // 1. LESSEE / TENANT / OCCUPANT
  let occupantName = "";
  let companyName = "";
  const lesseeRegexes = [
    /(?:LESSEE|TENANT|LICENSEE|SECOND\s+PARTY|PARTY\s+OF\s+THE\s+SECOND\s+PART)\s*[:\-–]?\s*(?:M\/s\.?|Mr\.?|Ms\.?)?\s*([A-Za-z0-9\s&.,()'\-]{3,60}?)(?:,|\n|having|represented|incorporated|a\s+company|a\s+private)/i,
    /(?:between|amongst)\s+.*?\s+and\s+(?:M\/s\.?|Mr\.?|Ms\.?)?\s*([A-Za-z0-9\s&.,()'\-]{3,50}?)(?:,|\n|having|hereinafter\s+referred\s+to\s+as\s+the\s+["“]LESSEE["”])/i,
    /Tenant\s*Name\s*[:\-]\s*([A-Za-z0-9\s&.,()'\-]{3,50})/i,
    /Occupant\s*[:\-]\s*([A-Za-z0-9\s&.,()'\-]{3,50})/i,
  ];

  for (const reg of lesseeRegexes) {
    const match = text.match(reg);
    if (match && match[1]) {
      const candidate = match[1].replace(/[\n\r]+/g, " ").trim();
      if (candidate.length > 2 && !candidate.toLowerCase().includes("hereinafter")) {
        occupantName = candidate;
        companyName = candidate;
        fieldCount++;
        highlights.push(`Tenant: ${occupantName}`);
        break;
      }
    }
  }

  // 2. LESSOR / LANDLORD / SPV (BILLING ENTITY)
  let billingEntity = "";
  const lessorRegexes = [
    /(?:LESSOR|LANDLORD|LICENSOR|FIRST\s+PARTY|PARTY\s+OF\s+THE\s+FIRST\s+PART)\s*[:\-–]?\s*(?:M\/s\.?|Mr\.?|Ms\.?)?\s*([A-Za-z0-9\s&.,()'\-]{3,60}?)(?:,|\n|having|represented|incorporated|a\s+company)/i,
    /(?:by\s+and\s+between)\s+(?:M\/s\.?|Mr\.?|Ms\.?)?\s*([A-Za-z0-9\s&.,()'\-]{3,50}?)(?:,|\n|having|hereinafter\s+referred\s+to\s+as\s+the\s+["“]LESSOR["”])/i,
    /Landlord\s*Name\s*[:\-]\s*([A-Za-z0-9\s&.,()'\-]{3,50})/i,
  ];

  for (const reg of lessorRegexes) {
    const match = text.match(reg);
    if (match && match[1]) {
      const candidate = match[1].replace(/[\n\r]+/g, " ").trim();
      if (candidate.length > 2 && !candidate.toLowerCase().includes("hereinafter")) {
        billingEntity = candidate;
        fieldCount++;
        highlights.push(`Lessor/SPV: ${billingEntity}`);
        break;
      }
    }
  }

  // 3. PROPERTY & BUILDING / DEMISED PREMISES
  let propertyName = "";
  let buildingName = "";
  let spaceName = "";

  const towerMatch = text.match(/(?:Floor\s+of|at|in|known\s+as)\s+([A-Za-z0-9\s]+?(?:Tower|Park|Plaza|Heights|Complex|Centre|Center|Enclave|Hub|Asset|Building|House))\b/i);
  if (towerMatch && towerMatch[1]) {
    propertyName = towerMatch[1].trim();
    buildingName = towerMatch[1].trim();
    fieldCount++;
    highlights.push(`Property: ${propertyName}`);
  } else {
    const premisesMatch = text.match(/(?:demised\s+premises|premises|building|property|tower|tech\s*park)\s*(?:known\s+as|situated\s+at|named|bearing\s+name)?\s*[:\-–]?\s*([A-Za-z0-9\s,.'\-]{4,60}?)(?:,|\n|\.|\band\s+measuring|\bhaving)/i);
    if (premisesMatch && premisesMatch[1]) {
      propertyName = premisesMatch[1].trim().replace(/^,\s*/, "");
      fieldCount++;
      highlights.push(`Property: ${propertyName}`);
    }
  }

  const spaceMatch = text.match(/(?:unit|suite|office|space|demised\s+portion)\s*(?:no\.?|number|bearing\s+no\.?)?\s*[:\-–]?\s*([A-Za-z0-9\s\-\/]{1,25}?)(?:\s+on|\s+at|,|\.|\n)/i) ||
                     text.match(/(?:unit|suite|office|space)\s*(?:no\.?|number)?\s*([A-Za-z0-9\-\/]+)/i);
  if (spaceMatch && spaceMatch[1]) {
    spaceName = spaceMatch[1].trim().startsWith("Unit") ? spaceMatch[1].trim() : `Unit ${spaceMatch[1].trim()}`;
    fieldCount++;
  }

  // 4. AREA (CHARGEABLE / SUPER BUILT-UP / CARPET)
  let areaSqft = 0;
  const areaMatches = [
    /(?:super\s*built[- ]?up|chargeable|leasable|carpet|rentable)\s*area\s*(?:of|measuring|is)?\s*[:\-–]?\s*([0-9,.]+)\s*(?:sq(?:uare)?\.?\s*(?:ft|feet)|sqft)/i,
    /(?:measuring\s*an\s*area\s*of|area\s*of\s*approx(?:imately)?\.?)\s*([0-9,.]+)\s*(?:sq(?:uare)?\.?\s*(?:ft|feet)|sqft)/i,
    /([0-9,.]+)\s*(?:sq(?:uare)?\.?\s*(?:ft|feet)|sqft)\s*(?:super\s*built[- ]?up|chargeable|leasable|carpet)?/i,
  ];

  for (const reg of areaMatches) {
    const match = text.match(reg);
    if (match && match[1]) {
      const num = parseCleanNumber(match[1]);
      if (num > 50 && num < 10000000) {
        areaSqft = Math.round(num);
        fieldCount++;
        highlights.push(`Area: ${areaSqft.toLocaleString()} Sq.Ft`);
        break;
      }
    }
  }

  // 5. SEATS & FIT-OUT SPECIFICATIONS
  let seatCount = 0;
  const seatMatch = text.match(/([0-9,]+)\s*(?:seats?|workstations?|desks?)/i) ||
                    text.match(/(?:allotment\s*of|capacity\s*of|measuring)?\s*([0-9,]+)\s*(?:seats?|workstations?|desks?)/i);
  if (seatMatch && seatMatch[1]) {
    const seats = parseInt(seatMatch[1].replace(/,/g, ""), 10);
    if (seats > 0 && seats < 50000) {
      seatCount = seats;
      fieldCount++;
      highlights.push(`Allocated Seats: ${seatCount} Desks`);
    }
  }

  // Workstations, Cabins & Meeting Rooms
  let workstationsCount = seatCount || 0;
  let cabinsCount = 0;
  let meetingRoomsCount = 0;
  const cabinMatch = text.match(/([0-9]+)\s*(?:cabins?|executive\s*cabins?|manager\s*cabins?)/i);
  if (cabinMatch && cabinMatch[1]) {
    cabinsCount = parseInt(cabinMatch[1], 10);
    highlights.push(`Cabins: ${cabinsCount}`);
  }
  const meetingMatch = text.match(/([0-9]+)\s*(?:meeting|conference)\s*rooms?/i);
  if (meetingMatch && meetingMatch[1]) {
    meetingRoomsCount = parseInt(meetingMatch[1], 10);
    highlights.push(`Meeting Rooms: ${meetingRoomsCount}`);
  }

  // Premises Fit-out Condition (Bare Shell, Warm Shell, Semi-Furnished, Fully Furnished)
  let fitoutCondition: "Fully Furnished" | "Bare Shell" | "Warm Shell" | "Semi-Furnished" = "Fully Furnished";
  if (text.match(/bare\s*shell/i)) {
    fitoutCondition = "Bare Shell";
  } else if (text.match(/warm\s*shell/i)) {
    fitoutCondition = "Warm Shell";
  } else if (text.match(/semi[- ]furnished/i)) {
    fitoutCondition = "Semi-Furnished";
  } else if (text.match(/fully\s*furnished|plug\s*(?:and|&)\s*play|fitted[- ]out/i)) {
    fitoutCondition = "Fully Furnished";
  }
  highlights.push(`Fit-out: ${fitoutCondition}`);

  // 6. RENT PER SQ. FT.
  let ratePerSqft = 0;
  const ratePsfMatches = [
    /(?:rent|lease\s*rent|rate)\s*(?:of|at|@)?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*sq(?:uare)?\.?\s*(?:ft|feet|sqft)\s*(?:per|\/)?\s*(?:month|p\.m\.|pm)?/i,
    /(?:rs\.?|inr|₹)\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*sq(?:uare)?\.?\s*(?:ft|feet|sqft)\s*(?:per|\/)?\s*(?:month|p\.m\.|pm)?/i,
    /@\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:psf|per\s*sqft)/i,
  ];

  for (const reg of ratePsfMatches) {
    const match = text.match(reg);
    if (match && match[1]) {
      const num = parseCleanNumber(match[1]);
      if (num >= 5 && num <= 5000) {
        ratePerSqft = num;
        fieldCount++;
        highlights.push(`Rate: ₹${ratePerSqft}/Sq.Ft/mo`);
        break;
      }
    }
  }

  // 7. BARE SHELL & FITOUT SPLIT
  let bareShellRate = 0;
  let fitoutRate = 0;
  const bareShellMatch = text.match(/(?:bare\s*shell|warm\s*shell)\s*(?:rent|rate)?\s*[:\-–]?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)?\s*sq(?:ft|uare\s*ft)/i);
  if (bareShellMatch && bareShellMatch[1]) {
    bareShellRate = parseCleanNumber(bareShellMatch[1]);
  }
  const fitoutMatch = text.match(/(?:fit[- ]?out|interior)\s*(?:rent|rate|rental)?\s*[:\-–]?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)?\s*sq(?:ft|uare\s*ft)/i);
  if (fitoutMatch && fitoutMatch[1]) {
    fitoutRate = parseCleanNumber(fitoutMatch[1]);
  }

  // 8. RENT PER SEAT
  let ratePerSeat = 0;
  const ratePerSeatMatch = text.match(/(?:rate|fee|rent)\s*(?:of|at|@)?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*(?:seat|desk|workstation)\s*(?:per|\/)?\s*(?:month|p\.m\.|pm)?/i);
  if (ratePerSeatMatch && ratePerSeatMatch[1]) {
    const num = parseCleanNumber(ratePerSeatMatch[1]);
    if (num >= 500 && num <= 100000) {
      ratePerSeat = num;
      fieldCount++;
      highlights.push(`Seat Rate: ₹${ratePerSeat.toLocaleString()}/seat/mo`);
    }
  }

  // 9. TOTAL MONTHLY BASE RENT
  let monthlyRent = 0;
  const monthlyRentMatches = [
    /(?:monthly\s*(?:lease\s*)?rent(?:al)?|license\s*fee|monthly\s*consideration|monthly\s*fee|base\s*rent)\s*(?:of|is|amounting\s*to)?\s*[:\-–]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?/i,
    /(?:sum\s*of\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?\s*(?:per\s*month|\/\s*month|p\.m\.|pm))/i,
    /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?\s*(?:per\s*month|\/\s*month|p\.m\.|pm)/i,
    /amounting\s+to\s+(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?/i,
  ];

  for (const reg of monthlyRentMatches) {
    const match = text.match(reg);
    if (match && match[1]) {
      const num = parseCleanNumber(match[1]);
      if (num >= 1000 && num <= 100000000) {
        monthlyRent = Math.round(num);
        break;
      }
    }
  }

  // Determine Billing Model
  let billingModel: "Area-based" | "Seat-based" | "Fixed" | "Hybrid" | "Pure Rent" = "Area-based";
  if (ratePerSeat > 0 || (seatCount > 0 && !ratePerSqft)) {
    billingModel = "Seat-based";
  } else if (ratePerSqft > 0 && areaSqft > 0) {
    billingModel = "Area-based";
  } else if (bareShellRate > 0 && fitoutRate > 0) {
    billingModel = "Hybrid";
  } else if (monthlyRent > 0) {
    billingModel = "Fixed";
  }

  // Reconcile Monthly Rent if 0
  if (monthlyRent === 0) {
    if (billingModel === "Area-based" && ratePerSqft > 0 && areaSqft > 0) {
      monthlyRent = Math.round(ratePerSqft * areaSqft);
    } else if (billingModel === "Seat-based" && ratePerSeat > 0 && seatCount > 0) {
      monthlyRent = Math.round(ratePerSeat * seatCount);
    }
  } else if (ratePerSqft === 0 && areaSqft > 0 && monthlyRent > 0) {
    ratePerSqft = Math.round((monthlyRent / areaSqft) * 100) / 100;
  }

  if (monthlyRent > 0) {
    fieldCount++;
    highlights.push(`Monthly Rent: ₹${monthlyRent.toLocaleString()}`);
  }

  // 10. COMMON AREA MAINTENANCE (CAM)
  let camType: "Per Sq.Ft" | "Fixed Monthly" | "Included" | "Actuals" = "Per Sq.Ft";
  let camRate = 0;
  let camMonthly = 0;

  const camRateMatch = text.match(/(?:cam|maintenance|c\.a\.m\.)[^\n.]*?(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*sq(?:uare)?\.?\s*(?:ft|feet|sqft)/i);
  if (camRateMatch && camRateMatch[1]) {
    camRate = parseCleanNumber(camRateMatch[1]);
    camType = "Per Sq.Ft";
    camMonthly = areaSqft > 0 ? Math.round(camRate * areaSqft) : 0;
    fieldCount++;
    highlights.push(`CAM: ₹${camRate}/Sq.Ft/mo (₹${camMonthly.toLocaleString()})`);
  } else {
    const camMonthlyMatch = text.match(/(?:cam|maintenance|c\.a\.m\.)[^\n.]*?(?:rs\.?|inr|₹)\s*([0-9,]+)(?:\s*\/\-|\s*\-)?\s*(?:per\s*month|\/\s*month|p\.m\.)/i);
    if (camMonthlyMatch && camMonthlyMatch[1]) {
      camMonthly = Math.round(parseCleanNumber(camMonthlyMatch[1]));
      camType = "Fixed Monthly";
      fieldCount++;
      highlights.push(`CAM: ₹${camMonthly.toLocaleString()}/mo`);
    } else if (text.match(/(?:cam|maintenance)\s*(?:is\s*)?included\s*(?:in\s*the\s*rent)?/i)) {
      camType = "Included";
      highlights.push(`CAM: Included in Rent`);
    }
  }

  // 10b. ELECTRICITY & UTILITY CLAUSES
  let electricityBilling: "Submeter Actuals" | "Fixed Monthly" | "Included in Rent" | "Proportionate Share" = "Submeter Actuals";
  let electricityLoadKva = 20;
  let powerBackupType: "100% DG Power Backup" | "Partial DG Backup" | "No DG Backup" = "100% DG Power Backup";
  let dgRatePerKwh = 25;
  let waterCharges: "Included in CAM" | "Actuals" | "Fixed Monthly" = "Included in CAM";

  if (text.match(/electricity.*?(?:included|inclusive)/i)) {
    electricityBilling = "Included in Rent";
  } else if (text.match(/(?:submeter|sub[- ]meter|actual\s*(?:consumption|reading|discom))/i)) {
    electricityBilling = "Submeter Actuals";
  } else if (text.match(/proportionate\s*(?:basis|share)/i)) {
    electricityBilling = "Proportionate Share";
  }

  const kvaMatch = text.match(/([0-9]+)\s*(?:kva|kw)\s*(?:load|power|electricity)?/i) || text.match(/(?:sanctioned\s*load|power\s*load)\s*[:\-–]?\s*([0-9]+)\s*(?:kva|kw)?/i);
  if (kvaMatch && kvaMatch[1]) {
    electricityLoadKva = parseInt(kvaMatch[1], 10);
  }

  if (text.match(/100%\s*(?:dg|power|generator)\s*backup/i)) {
    powerBackupType = "100% DG Power Backup";
  } else if (text.match(/(?:partial|limited)\s*backup/i)) {
    powerBackupType = "Partial DG Backup";
  }

  const dgRateMatch = text.match(/(?:dg|generator)\s*(?:rate|charge|cost)?[^\n.]*?(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*(?:unit|kwh)/i);
  if (dgRateMatch && dgRateMatch[1]) {
    dgRatePerKwh = parseCleanNumber(dgRateMatch[1]);
  }

  if (text.match(/water.*?(?:actuals|meter|reading)/i)) {
    waterCharges = "Actuals";
  }

  highlights.push(`Power: ${electricityLoadKva} KVA (${powerBackupType}, ${electricityBilling})`);

  // 11. CAR & TWO-WHEELER PARKING
  let carParkingSlots = 0;
  let carParkingRate = 0;
  let twoWheelerSlots = 0;
  let twoWheelerRate = 0;

  const carMatch = text.match(/([0-9]+)\s*(?:car\s*parking|four[- ]wheeler|car\s*bays?|car\s*slots?)/i) ||
                   text.match(/(?:car\s*parking|car\s*bays?|car\s*slots?)\s*[:\-–]?\s*([0-9]+)/i);
  if (carMatch && carMatch[1]) {
    carParkingSlots = parseInt(carMatch[1], 10);
  }

  const carRateMatch = text.match(/(?:car\s*parking|car\s*slot|car\s*bay)\s*(?:slots?\s+)?(?:at|@|of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*(?:slot|car|bay|month)/i);
  if (carRateMatch && carRateMatch[1]) {
    carParkingRate = parseCleanNumber(carRateMatch[1]);
  }

  const bikeMatch = text.match(/([0-9]+)\s*(?:two[- ]wheeler|bike|motorcycle)\s*(?:parking|slots?|bays?)/i) ||
                    text.match(/(?:two[- ]wheeler|bike)\s*[:\-–]?\s*([0-9]+)/i);
  if (bikeMatch && bikeMatch[1]) {
    twoWheelerSlots = parseInt(bikeMatch[1], 10);
  }

  const bikeRateMatch = text.match(/(?:two[- ]wheeler|bike)\s*(?:parking\s*slots?)?\s*(?:at|@|of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,.]+)(?:\s*\/\-|\s*\-)?\s*(?:per|\/)\s*(?:bike|slot|month)/i);
  if (bikeRateMatch && bikeRateMatch[1]) {
    twoWheelerRate = parseCleanNumber(bikeRateMatch[1]);
  }

  const parkingMonthly = (carParkingSlots * carParkingRate) + (twoWheelerSlots * twoWheelerRate);
  if (carParkingSlots > 0 || twoWheelerSlots > 0) {
    fieldCount++;
    highlights.push(`Parking: ${carParkingSlots} Cars, ${twoWheelerSlots} Bikes`);
  }

  // 12. TOTAL MONTHLY GROSS PAYOUT
  const totalMonthlyPayout = monthlyRent + camMonthly + parkingMonthly;

  // 13. SECURITY DEPOSIT / IFRSD
  let securityDeposit = 0;
  let depositMonths = 0;

  const depositAmtMatch = text.match(/(?:interest[- ]free\s*refundable\s*security\s*deposit|security\s*deposit|ifrsd|caution\s*deposit)[^\n.]*?(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?/i) ||
                          text.match(/amounting\s+to\s+(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]+)?)(?:\s*\/\-|\s*\-)?/i);
  if (depositAmtMatch && depositAmtMatch[1]) {
    const depNum = parseCleanNumber(depositAmtMatch[1]);
    if (depNum > 1000) {
      securityDeposit = Math.round(depNum);
    }
  }

  const depositMonthsMatch = text.match(/(?:equivalent\s*to|of)\s*([0-9]+)\s*(?:months?|month's)\s*(?:of\s*)?(?:rent|license\s*fee)?/i);
  if (depositMonthsMatch && depositMonthsMatch[1]) {
    depositMonths = parseInt(depositMonthsMatch[1], 10);
    if (securityDeposit === 0 && monthlyRent > 0) {
      securityDeposit = depositMonths * monthlyRent;
    }
  } else if (securityDeposit > 0 && monthlyRent > 0) {
    depositMonths = Math.round(securityDeposit / monthlyRent);
  }

  if (securityDeposit > 0) {
    fieldCount++;
    highlights.push(`Security Deposit: ₹${securityDeposit.toLocaleString()} (${depositMonths || Math.round(securityDeposit / (monthlyRent || 1))} months)`);
  }

  // 14. DATES (POSSESSION, COMMENCEMENT & EXPIRY)
  let possessionDate = "";
  let startDate = "";
  let endDate = "";
  let leaseTermMonths = 36;

  const possMatch = text.match(/(?:possession\s*date|handover\s*date|date\s*of\s*handing\s*over)\s*[:\-–]?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/i);
  if (possMatch && possMatch[1]) {
    possessionDate = parseCleanDate(possMatch[1]);
    if (possessionDate) {
      highlights.push(`Possession Date: ${possessionDate}`);
    }
  }

  const termMatch = text.match(/(?:lease\s*(?:period|term)|tenure|duration|period\s*of\s*lease)\s*(?:of|is)?\s*[:\-–]?\s*([0-9]+)\s*(?:months|years)/i);
  if (termMatch && termMatch[1]) {
    const rawVal = parseInt(termMatch[1], 10);
    if (termMatch[0].toLowerCase().includes("year")) {
      leaseTermMonths = rawVal * 12;
    } else {
      leaseTermMonths = rawVal;
    }
    fieldCount++;
  }

  const startDateMatch = text.match(/(?:commencement\s*date|effective\s*date|start\s*date|commencing\s*(?:from|on|with\s*effect\s*from)|rent\s*commencement\s*date)\s*[:\-–]?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/i);
  if (startDateMatch && startDateMatch[1]) {
    startDate = parseCleanDate(startDateMatch[1]);
    if (startDate) {
      fieldCount++;
      highlights.push(`Start Date: ${startDate}`);
    }
  }

  const endDateMatch = text.match(/(?:expiry\s*date|ending\s*(?:on|with)|terminating\s*on|end\s*date|expiring\s*on)\s*[:\-–]?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+[0-9]{4}|[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})/i);
  if (endDateMatch && endDateMatch[1]) {
    endDate = parseCleanDate(endDateMatch[1]);
    if (endDate) {
      fieldCount++;
      highlights.push(`End Date: ${endDate}`);
    }
  }

  // Derive End Date from Start Date & Term if not explicit
  if (startDate && !endDate && leaseTermMonths > 0) {
    const st = new Date(startDate);
    st.setMonth(st.getMonth() + leaseTermMonths);
    st.setDate(st.getDate() - 1);
    const yyyy = st.getFullYear();
    const mm = String(st.getMonth() + 1).padStart(2, "0");
    const dd = String(st.getDate()).padStart(2, "0");
    endDate = `${yyyy}-${mm}-${dd}`;
  }

  // 15. FIT-OUT / RENT-FREE PERIOD
  let fitoutDays = 0;
  const fitoutDaysMatch = text.match(/(?:fit[- ]?out\s*period|rent[- ]free\s*period|grace\s*period)\s*(?:of|is)?\s*[:\-–]?\s*([0-9]+)\s*(?:days?|months?)/i);
  if (fitoutDaysMatch && fitoutDaysMatch[1]) {
    const val = parseInt(fitoutDaysMatch[1], 10);
    fitoutDays = fitoutDaysMatch[0].toLowerCase().includes("month") ? val * 30 : val;
    fieldCount++;
    highlights.push(`Fit-out / Rent-free: ${fitoutDays} Days`);
  }

  // 16. LOCK-IN PERIOD
  let lockInMonths = 12;
  const lockInMatch = text.match(/(?:lock[- ]in\s*period|lock[- ]in)\s*(?:of|is)?\s*[:\-–]?\s*([0-9]+)\s*(?:months?|years?)/i);
  if (lockInMatch && lockInMatch[1]) {
    const val = parseInt(lockInMatch[1], 10);
    lockInMonths = lockInMatch[0].toLowerCase().includes("year") ? val * 12 : val;
    fieldCount++;
    highlights.push(`Lock-in: ${lockInMonths} Months`);
  }

  // 17. NOTICE PERIOD
  let noticeDays = 90;
  const noticeMatch = text.match(/(?:notice\s*period)\s*(?:of|is)?\s*[:\-–]?\s*([0-9]+)\s*(?:days?|months?)/i);
  if (noticeMatch && noticeMatch[1]) {
    const val = parseInt(noticeMatch[1], 10);
    noticeDays = noticeMatch[0].toLowerCase().includes("month") ? val * 30 : val;
    fieldCount++;
    highlights.push(`Notice: ${noticeDays} Days`);
  }

  // 18. ESCALATION TERMS
  let escalationPct = 5;
  let escalationFrequency: "Annual" | "Biannual" | "Quarterly" | "Triennial" = "Annual";

  const escPctMatch = text.match(/(?:escalation|rent\s*(?:increase|revision)|escalated?)\s*(?:of|by|at)?\s*([0-9]+(?:\.[0-9]+)?)\s*%/i) ||
                      text.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*(?:escalation|increase\s*in\s*rent)/i);
  if (escPctMatch && escPctMatch[1]) {
    escalationPct = parseFloat(escPctMatch[1]);
    fieldCount++;
  }

  if (text.match(/(?:after\s*every|every)\s*3\s*years/i) || text.match(/36\s*months/i)) {
    escalationFrequency = "Triennial";
  } else if (text.match(/(?:after\s*every|every)\s*2\s*years/i) || text.match(/24\s*months/i)) {
    escalationFrequency = "Biannual";
  } else if (text.match(/quarterly|every\s*3\s*months/i)) {
    escalationFrequency = "Quarterly";
  } else {
    escalationFrequency = "Annual";
  }
  highlights.push(`Escalation: ${escalationPct}% (${escalationFrequency})`);

  let escalationStartDate = "";
  if (startDate) {
    const st = new Date(startDate);
    const addMonths = escalationFrequency === "Triennial" ? 36 : escalationFrequency === "Biannual" ? 24 : escalationFrequency === "Quarterly" ? 3 : 12;
    st.setMonth(st.getMonth() + addMonths);
    const yyyy = st.getFullYear();
    const mm = String(st.getMonth() + 1).padStart(2, "0");
    const dd = String(st.getDate()).padStart(2, "0");
    escalationStartDate = `${yyyy}-${mm}-${dd}`;
  }

  // 19. PAYMENT TERMS & DUE DATE
  let paymentDueDay = 5;
  let paymentTerms = "Due on 5th of month";
  const dueDayMatch = text.match(/(?:payable\s*on\s*or\s*before\s*(?:the)?|due\s*on\s*(?:the)?)\s*([0-9]{1,2})(?:st|nd|rd|th)?\s*(?:day\s*of\s*each\s*(?:calendar\s*)?month)/i);
  if (dueDayMatch && dueDayMatch[1]) {
    paymentDueDay = parseInt(dueDayMatch[1], 10);
    paymentTerms = `Due on ${paymentDueDay}th of month`;
    fieldCount++;
  }

  // 20. STAMP DUTY SHARING
  let stampDutySharing: "50:50 Shared" | "100% Tenant" | "100% Landlord" = "50:50 Shared";
  if (text.match(/stamp\s*duty.*?borne\s*(?:equally|50:50|in\s*equal\s*shares)/i)) {
    stampDutySharing = "50:50 Shared";
  } else if (text.match(/stamp\s*duty.*?borne\s*by\s*(?:the\s*)?lessee/i)) {
    stampDutySharing = "100% Tenant";
  } else if (text.match(/stamp\s*duty.*?borne\s*by\s*(?:the\s*)?lessor/i)) {
    stampDutySharing = "100% Landlord";
  }

  // Notes
  const notes = [
    `Auto-extracted from uploaded agreement: ${fileName || "Lease Deed"}.`,
    `Billing model: ${billingModel} (${ratePerSqft > 0 ? `₹${ratePerSqft}/sqft` : ratePerSeat > 0 ? `₹${ratePerSeat}/seat` : `Fixed ₹${monthlyRent}`}).`,
    camMonthly > 0 ? `CAM: ₹${camMonthly.toLocaleString()}/mo (${camType}).` : null,
    carParkingSlots > 0 ? `Parking: ${carParkingSlots} car slots.` : null,
    `Escalation: ${escalationPct}% ${escalationFrequency}.`,
    `Security Deposit: ₹${securityDeposit.toLocaleString()} (${depositMonths} months).`,
    fitoutDays > 0 ? `Rent-free fit-out: ${fitoutDays} days.` : null,
  ].filter(Boolean).join(" ");

  const confidence = Math.min(100, Math.round((fieldCount / 14) * 100));

  return {
    occupantName: occupantName || "",
    companyName: companyName || occupantName || "",
    billingEntity: billingEntity || "",
    propertyName: propertyName || "",
    buildingName: buildingName || "Main Tower",
    spaceName: spaceName || (areaSqft > 0 ? `Unit (${areaSqft} sqft)` : "Main Space"),
    areaSqft: areaSqft || 0,
    seatCount: seatCount || 0,
    fitoutCondition,
    workstationsCount: workstationsCount || 0,
    cabinsCount: cabinsCount || 0,
    meetingRoomsCount: meetingRoomsCount || 0,
    billingModel,
    ratePerSqft: ratePerSqft || 0,
    ratePerSeat: ratePerSeat || 0,
    bareShellRate: bareShellRate || 0,
    fitoutRate: fitoutRate || 0,
    monthlyRent: monthlyRent || 0,
    camType,
    camRate: camRate || 0,
    camMonthly: camMonthly || 0,
    carParkingSlots,
    carParkingRate,
    twoWheelerSlots,
    twoWheelerRate,
    parkingMonthly,
    totalMonthlyPayout,
    possessionDate: possessionDate || "",
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate: endDate || "",
    leaseTermMonths,
    fitoutDays,
    lockInMonths,
    noticeDays,
    securityDeposit,
    depositMonths,
    escalationPct,
    escalationFrequency,
    escalationStartDate,
    electricityBilling,
    electricityLoadKva,
    powerBackupType,
    dgRatePerKwh,
    waterCharges,
    paymentTerms,
    paymentDueDay,
    lateInterestPct: 18,
    gstApplicable: true,
    tdsApplicable: true,
    stampDutySharing,
    notes,
    confidence,
    extractedFieldsCount: fieldCount,
    summaryHighlights: highlights,
  };
}
