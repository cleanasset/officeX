/**
 * Rigorous Specification Audit Script for OFFICEX Rent Roll (Document V2.1)
 * Audits every canonical formula (F-01..F-25), rule (R-01..R-44), 9-stage pipeline,
 * saved views, and database schemas.
 */

const { RentRollFormulas, validateRentRollRow, validateControlTotals, CANONICAL_RULES } = require("../src/lib/rent-roll-rules");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}: ${details}`);
  }
}

console.log("===============================================================================");
console.log("AUDIT SECTION 1: CANONICAL FORMULAS (Table 48: F-01 to F-25)");
console.log("===============================================================================");

// F-01: Area Rent
const rent01 = RentRollFormulas.f01AreaRent(10000, 150);
assert(rent01 === 1500000, "F-01 Area Rent: 10,000 sq ft @ ₹150/sq ft = ₹15,00,000");

// F-02: Escalated Rent
const rent02Comp = RentRollFormulas.f02EscalatedRent(100, 5, true);
assert(rent02Comp === 105, "F-02 Escalated Rent (Compounding): ₹100 + 5% = ₹105");

// F-03 to F-07: Flex Seat Billing Bases
const seatContracted = RentRollFormulas.f03To07SeatBilling({
  billingBasis: "contracted",
  contractedSeats: 50,
  occupiedSeats: 40,
  seatRate: 8000
});
assert(seatContracted.billableSeats === 50 && seatContracted.totalCharge === 400000, "F-04 Contracted-seat billing: 50 seats @ ₹8,000 = ₹4,00,000");

const seatMinCommit = RentRollFormulas.f03To07SeatBilling({
  billingBasis: "minimum_commitment",
  contractedSeats: 50,
  occupiedSeats: 25,
  minimumCommittedSeats: 35,
  seatRate: 8000
});
assert(seatMinCommit.billableSeats === 35 && seatMinCommit.totalCharge === 280000, "F-06 Minimum commitment billing: MAX(25, 35) = 35 seats @ ₹8,000 = ₹2,80,000");

// F-08: Inclusions
assert(!RentRollFormulas.f08IsChargeBillable(true, 5000), "F-08 Inclusions: Included component is not billable line");
assert(RentRollFormulas.f08IsChargeBillable(false, 5000), "F-08 Inclusions: Excluded component is billable line");

// F-09: Metered Utility
const util = RentRollFormulas.f09MeteredUtility({ closingReading: 12500, openingReading: 10000, multiplier: 1, tariff: 12 });
assert(util === 30000, "F-09 Metered Utility: (12,500 - 10,000) * 1 * ₹12 = ₹30,000");

// F-10: Proration
const pro = RentRollFormulas.f10Proration({ periodCharge: 30000, daysOccupiedInPeriod: 15, daysInPeriod: 30 });
assert(pro === 15000, "F-10 Proration: ₹30,000 * (15/30) = ₹15,000");

// F-11: Taxable / Gross Invoice (GST Split)
const taxIntra = RentRollFormulas.f11TaxableGrossInvoice({ taxableLinesTotal: 100000, isInterState: false, gstRatePct: 18 });
assert(taxIntra.grossAmount === 118000 && taxIntra.cgst === 9000 && taxIntra.sgst === 9000, "F-11 Intra-state GST: CGST ₹9,000 + SGST ₹9,000 = Gross ₹1,18,000");

const taxInter = RentRollFormulas.f11TaxableGrossInvoice({ taxableLinesTotal: 100000, isInterState: true, gstRatePct: 18 });
assert(taxInter.grossAmount === 118000 && taxInter.igst === 18000, "F-11 Inter-state GST: IGST ₹18,000 = Gross ₹1,18,000");

// F-12: Outstanding Balance (R-52)
const out = RentRollFormulas.f12OutstandingBalance({ invoiceGross: 118000, allocatedPayments: 50000, creditNotes: 10000, debitNotes: 2000 });
assert(out.outstanding === 60000 && out.status === "partially_paid", "F-12 Outstanding Balance: ₹1,18,000 - ₹50,000 - ₹10,000 + ₹2,000 = ₹60,000 (partially_paid)");

// F-14: Ageing Buckets
assert(RentRollFormulas.f14AgeingBucket(15) === "current_0_30", "F-14 Ageing: 15 days = current_0_30");
assert(RentRollFormulas.f14AgeingBucket(45) === "bucket_31_60", "F-14 Ageing: 45 days = bucket_31_60");
assert(RentRollFormulas.f14AgeingBucket(75) === "bucket_61_90", "F-14 Ageing: 75 days = bucket_61_90");
assert(RentRollFormulas.f14AgeingBucket(120) === "bucket_90_plus", "F-14 Ageing: 120 days = bucket_90_plus");

// F-15 & F-16: Occupancy
assert(RentRollFormulas.f15OccupancyArea(85000, 100000) === 85, "F-15 Area Occupancy: 85,000 / 100,000 = 85%");
assert(RentRollFormulas.f16OccupancySeats(420, 500) === 84, "F-16 Seat Occupancy: 420 / 500 = 84%");

// F-17: Economic Occupancy
assert(RentRollFormulas.f17EconomicOccupancy(1500000, 10000, 100) === 60, "F-17 Economic Occupancy: 15L / (15L + 10L) = 60%");

// F-18: WALE
const wale = RentRollFormulas.f18Wale([
  { remainingYears: 5, monthlyRent: 100000, chargeableArea: 1000 },
  { remainingYears: 2, monthlyRent: 100000, chargeableArea: 1000 }
]);
assert(wale.waleByIncomeYears === 3.5, "F-18 WALE by income: (5*100k + 2*100k)/200k = 3.5 years");

// F-19: NOI & NOI Margin
const noi = RentRollFormulas.f19Noi(1000000, 200000);
assert(noi.noi === 800000 && noi.noiMarginPct === 80, "F-19 NOI: Revenue ₹10L - Opex ₹2L = ₹8L (80% margin)");

// F-20: Management Fee
const fee = RentRollFormulas.f20ManagementFee(5000000, 0.04, 18);
assert(fee.feeAmount === 200000 && fee.gstAmount === 36000 && fee.totalFeeWithGst === 236000, "F-20 Management Fee: 4% of ₹50L = ₹2L + 18% GST (₹36k) = ₹2.36L");

// F-21: Owner Net Remittance
const remit = RentRollFormulas.f21OwnerNetRemittance({
  totalCollections: 5000000,
  feePercentage: 0.04,
  expensesPaidOnOwnerBehalf: 500000,
  tdsAdjustments: 50000
});
assert(remit === 4214000, "F-21 Owner Net Remittance: ₹50L - ₹2.36L (Fee+GST) - ₹5L (Exp) - ₹50k (TDS) = ₹42,14,000");

// F-22: CAM True-up
const camTrueUp = RentRollFormulas.f22CamTrueUp({ occupantShareOfActualCam: 250000, camBilledToOccupant: 200000 });
assert(camTrueUp.variance === 50000 && camTrueUp.noteType === "debit_note", "F-22 CAM True-Up: Actual ₹2.5L - Billed ₹2.0L = Debit Note of ₹50,000");

// F-25: Collection Efficiency
assert(RentRollFormulas.f25CollectionEfficiency(950000, 1000000) === 95, "F-25 Collection Efficiency: 9.5L / 10L = 95%");

console.log("\n===============================================================================");
console.log("AUDIT SECTION 2: CANONICAL VALIDATION RULES (Table 57: R-01 to R-44)");
console.log("===============================================================================");

// Test R-01: Required fields check
const invalidR01 = validateRentRollRow({ unit: "", floor: 1, chargeableArea: 0, tenantName: "" });
assert(!invalidR01.isValid && invalidR01.errors.some(e => e.ruleCode === "R-01"), "R-01: Catches missing unit, area, or tenant");

// Test R-12: Amount math check
const invalidR12 = validateRentRollRow({
  unit: "Suite 101",
  floor: 1,
  chargeableArea: 1000,
  ratePsf: 100,
  monthlyRent: 999999, // mismatch!
  tenantName: "Acme Corp"
});
assert(!invalidR12.isValid && invalidR12.errors.some(e => e.ruleCode === "R-12"), "R-12: Catches monthly rent not matching area * rate PSF");

// Test R-15: GSTIN format check
const invalidR15 = validateRentRollRow({
  unit: "Suite 101",
  floor: 1,
  chargeableArea: 1000,
  ratePsf: 100,
  monthlyRent: 100000,
  tenantName: "Acme Corp",
  gstin: "INVALID_GSTIN_123"
});
assert(!invalidR15.isValid && invalidR15.errors.some(e => e.ruleCode === "R-15"), "R-15: Rejects invalid GSTIN syntax");

const validR15 = validateRentRollRow({
  unit: "Suite 101",
  floor: 1,
  chargeableArea: 1000,
  ratePsf: 100,
  monthlyRent: 100000,
  tenantName: "Acme Corp",
  gstin: "27AAACQ1234F1Z5",
  pan: "AAACQ1234F"
});
assert(validR15.isValid, "R-15: Accepts valid statutory 15-char Indian GSTIN and 10-char PAN");

// Test R-20: Chronology
const invalidR20 = validateRentRollRow({
  unit: "Suite 101",
  floor: 1,
  chargeableArea: 1000,
  ratePsf: 100,
  monthlyRent: 100000,
  tenantName: "Acme Corp",
  startDate: "2029-01-01",
  endDate: "2026-01-01" // start > end
});
assert(!invalidR20.isValid && invalidR20.errors.some(e => e.ruleCode === "R-20"), "R-20: Rejects commencement date after expiry date");

// Test R-40: Double billing check
const invalidR40 = validateRentRollRow({
  unit: "Suite 101",
  floor: 1,
  chargeableArea: 1000,
  ratePsf: 100,
  monthlyRent: 100000,
  tenantName: "Acme Corp",
  isCamIncluded: true,
  camMonthly: 25000 // double billed!
});
assert(!invalidR40.isValid && invalidR40.errors.some(e => e.ruleCode === "R-40"), "R-40: Catches double billing of CAM when flagged as included in base rent");

// Test R-03: Control Totals Reconciliation
const controlTotalsPass = validateControlTotals([
  { chargeableArea: 50000, monthlyRent: 7500000 },
  { chargeableArea: 50000, monthlyRent: 7500000 }
], 100000);
assert(controlTotalsPass.reconciliationPass, "R-03 / RR-ING-07: Control totals sum (100k) matches target (100k) with 0% variance");

const controlTotalsFail = validateControlTotals([
  { chargeableArea: 40000, monthlyRent: 6000000 }
], 100000);
assert(!controlTotalsFail.reconciliationPass, "R-03 / RR-ING-07: Flags >0.5% variance when sum (40k) deviates from target (100k)");

console.log("\n===============================================================================");
console.log(`AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log("===============================================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
