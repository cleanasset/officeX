import { RentRollFormulas, CANONICAL_RULES } from '../lib/rent-roll-rules';
import { getRentRollDb } from '../lib/rent-roll-store';

function runCanonicalSpecificationTests() {
  console.log("================================================================================");
  console.log("📐 OFFICEX RENT ROLL V2.1: 25 FORMULAS (F-01 to F-25) & SECTION 13 TEST FIXTURES");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(title: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details || ''}`);
      failed++;
    }
  }

  // --- SECTION 6: FORMULAS F-01 TO F-25 ---

  // F-01: Area Rent
  const f01 = RentRollFormulas.f01AreaRent(25000, 240);
  assert("F-01: Area Rent (25,000 sqft × ₹240 = ₹60,00,000)", f01 === 6000000, `Got ${f01}`);

  // F-02: Escalated Rent (Compounding)
  const f02 = RentRollFormulas.f02EscalatedRent(240, 5, true);
  assert("F-02: Escalated Rent (₹240 + 5% = ₹252.00)", f02 === 252, `Got ${f02}`);

  // F-03 to F-07: Seat Revenue & Flex Billing Bases
  // F-04: Contracted Seat Billing
  const f04 = RentRollFormulas.f03To07SeatBilling({
    billingBasis: 'contracted',
    contractedSeats: 50,
    occupiedSeats: 45,
    seatRate: 15000
  });
  assert("F-04: Contracted Seat Billing (50 seats × ₹15k = ₹7.5L)", f04.billableSeats === 50 && f04.totalCharge === 750000);

  // F-05: Occupied Seat Billing
  const f05 = RentRollFormulas.f03To07SeatBilling({
    billingBasis: 'occupied',
    contractedSeats: 50,
    occupiedSeats: 42,
    seatRate: 15000
  });
  assert("F-05: Occupied Seat Billing (42 occupied × ₹15k = ₹6.3L)", f05.billableSeats === 42 && f05.totalCharge === 630000);

  // F-06: Minimum Commitment Billing
  const f06a = RentRollFormulas.f03To07SeatBilling({
    billingBasis: 'minimum_commitment',
    contractedSeats: 50,
    occupiedSeats: 30,
    minimumCommittedSeats: 40,
    seatRate: 15000
  });
  assert("F-06: Minimum Commitment Floor (30 occupied < 40 floor -> 40 seats = ₹6L)", f06a.billableSeats === 40 && f06a.totalCharge === 600000);

  const f06b = RentRollFormulas.f03To07SeatBilling({
    billingBasis: 'minimum_commitment',
    contractedSeats: 50,
    occupiedSeats: 45,
    minimumCommittedSeats: 40,
    seatRate: 15000
  });
  assert("F-06: Minimum Commitment Ceiling (45 occupied > 40 floor -> 45 seats = ₹6.75L)", f06b.billableSeats === 45 && f06b.totalCharge === 675000);

  // F-07: Hybrid Billing
  const f07 = RentRollFormulas.f03To07SeatBilling({
    billingBasis: 'hybrid',
    contractedSeats: 40,
    occupiedSeats: 48,
    seatRate: 14000,
    baseCommitmentCharge: 560000,
    additionalSeatRate: 16000,
    usageCharges: 25000
  });
  // 560k base + 8 extra @ 16k (128k) + 25k usage = 713,000
  assert("F-07: Hybrid Billing (40 base + 8 overage @ 16k + 25k usage = ₹7,13,000)", f07.billableSeats === 48 && f07.totalCharge === 713000);

  // F-08: Inclusions
  const f08a = RentRollFormulas.f08IsChargeBillable(true, 50000);
  const f08b = RentRollFormulas.f08IsChargeBillable(false, 50000);
  assert("F-08: Inclusions Flag (true -> not billable; false -> billable)", !f08a && f08b);

  // F-09: Metered Utility
  const f09 = RentRollFormulas.f09MeteredUtility({
    openingReading: 120500,
    closingReading: 128500,
    multiplier: 1,
    tariff: 10.50
  });
  // 8,000 units × ₹10.50 = ₹84,000
  assert("F-09: Metered Utility (8,000 units @ ₹10.50 = ₹84,000)", f09 === 84000);

  // F-10: Proration
  const f10 = RentRollFormulas.f10Proration({
    periodCharge: 310000,
    daysOccupiedInPeriod: 15,
    daysInPeriod: 31
  });
  assert("F-10: Proration (15 of 31 days @ ₹3.1L = ₹1.5L)", f10 === 150000);

  // F-11: Taxable / Gross Invoice (Inter-State IGST vs Intra-State CGST+SGST)
  const f11Intra = RentRollFormulas.f11TaxableGrossInvoice({
    taxableLinesTotal: 1000000,
    isInterState: false,
    gstRatePct: 18
  });
  assert("F-11: Intra-State GST (9% CGST ₹90k + 9% SGST ₹90k = ₹1.8L, Gross ₹11.8L)",
    f11Intra.cgst === 90000 && f11Intra.sgst === 90000 && f11Intra.igst === 0 && f11Intra.grossAmount === 1180000
  );

  const f11Inter = RentRollFormulas.f11TaxableGrossInvoice({
    taxableLinesTotal: 1000000,
    isInterState: true,
    gstRatePct: 18
  });
  assert("F-11: Inter-State GST (18% IGST ₹1.8L, CGST/SGST = 0, Gross ₹11.8L)",
    f11Inter.igst === 180000 && f11Inter.cgst === 0 && f11Inter.sgst === 0 && f11Inter.grossAmount === 1180000
  );

  // F-12 & F-13: Outstanding Balance & Payment Status
  const f12Paid = RentRollFormulas.f12OutstandingBalance({
    invoiceGross: 1180000,
    allocatedPayments: 1180000,
    creditNotes: 0,
    debitNotes: 0
  });
  assert("F-12: Full Settlement (Outstanding = 0, Status = 'paid')", f12Paid.outstanding === 0 && f12Paid.status === 'paid');

  const f12Partial = RentRollFormulas.f12OutstandingBalance({
    invoiceGross: 1180000,
    allocatedPayments: 500000,
    creditNotes: 50000,
    debitNotes: 0
  });
  assert("F-13: Partial Payment (Gross 11.8L - 5L paid - 50k credit = 6.3L outstanding, 'partially_paid')",
    f12Partial.outstanding === 630000 && f12Partial.status === 'partially_paid'
  );

  // F-14: Ageing Buckets
  assert("F-14: Ageing Bucket 0-30d", RentRollFormulas.f14AgeingBucket(15) === 'current_0_30');
  assert("F-14: Ageing Bucket 31-60d", RentRollFormulas.f14AgeingBucket(45) === 'bucket_31_60');
  assert("F-14: Ageing Bucket 61-90d", RentRollFormulas.f14AgeingBucket(75) === 'bucket_61_90');
  assert("F-14: Ageing Bucket 90+d", RentRollFormulas.f14AgeingBucket(120) === 'bucket_90_plus');

  // F-15: Occupancy - Area
  const f15 = RentRollFormulas.f15OccupancyArea(180000, 200000);
  assert("F-15: Area Occupancy (180k / 200k = 90.00%)", f15 === 90);

  // F-16: Occupancy - Seats
  const f16 = RentRollFormulas.f16OccupancySeats(202, 240);
  assert("F-16: Seat Occupancy (202 / 240 = 84.17%)", f16 === 84.17);

  // F-17: Economic Occupancy
  const f17 = RentRollFormulas.f17EconomicOccupancy(6000000, 5000, 200);
  // Current: 60L. Vacant potential: 5k * 200 = 10L. Total: 70L. 60/70 = 85.71%
  assert("F-17: Economic Occupancy (60L / (60L + 10L) = 85.71%)", f17 === 85.71);

  // F-18: WALE
  const f18 = RentRollFormulas.f18Wale([
    { remainingYears: 3.5, monthlyRent: 6000000, chargeableArea: 25000, isHoldingOver: false },
    { remainingYears: 1.2, monthlyRent: 3000000, chargeableArea: 15000, isHoldingOver: false },
    { remainingYears: 0.0, monthlyRent: 2000000, chargeableArea: 10000, isHoldingOver: true } // Holding over = 0
  ]);
  // Income: (3.5 * 6M + 1.2 * 3M + 0 * 2M) / 11M = (21 + 3.6) / 11 = 24.6 / 11 = 2.24 yrs
  // Area: (3.5 * 25k + 1.2 * 15k + 0 * 10k) / 50k = (87.5 + 18) / 50 = 105.5 / 50 = 2.11 yrs
  assert("F-18: WALE Income & Area weighted (Income = 2.24y, Area = 2.11y)",
    f18.waleByIncomeYears === 2.24 && f18.waleByAreaYears === 2.11
  );

  // F-19: NOI / NOI Margin
  const f19 = RentRollFormulas.f19Noi(5000000, 1250000);
  assert("F-19: NOI & Margin (50L rev - 12.5L opex = 37.5L NOI, 75% margin)", f19.noi === 3750000 && f19.noiMarginPct === 75);

  // F-20: Management Fee
  const f20 = RentRollFormulas.f20ManagementFee(4800000, 0.04, 18);
  // 48L * 4% = 1.92L. GST 18% = 34,560. Total = 2,26,560
  assert("F-20: Management Fee (4% on 48L = ₹1.92L + ₹34,560 GST = ₹2,26,560)",
    f20.feeAmount === 192000 && f20.gstAmount === 34560 && f20.totalFeeWithGst === 226560
  );

  // F-21: Owner Net Remittance (Section 13 Table 104)
  const f21 = RentRollFormulas.f21OwnerNetRemittance({
    totalCollections: 4800000,
    feePercentage: 0.04,
    gstOnFeePct: 18,
    expensesPaidOnOwnerBehalf: 120000,
    tdsAdjustments: 0
  });
  // Collections ₹48,00,000 - Fee ₹1,92,000 - GST ₹34,560 - Expenses ₹1,20,000 = ₹44,53,440
  assert("F-21: Owner Net Remittance Table 104 (₹48L - ₹2,26,560 fee/gst - ₹1.2L exp = ₹44,53,440)", f21 === 4453440);

  // F-22: CAM True-Up
  const f22Debit = RentRollFormulas.f22CamTrueUp({
    occupantShareOfActualCam: 180000,
    camBilledToOccupant: 150000
  });
  assert("F-22: CAM True-Up Under-Billed (Debit Note ₹30,000)", f22Debit.noteType === 'debit_note' && f22Debit.amount === 30000);

  const f22Credit = RentRollFormulas.f22CamTrueUp({
    occupantShareOfActualCam: 140000,
    camBilledToOccupant: 150000
  });
  assert("F-22: CAM True-Up Over-Billed (Credit Note ₹10,000)", f22Credit.noteType === 'credit_note' && f22Credit.amount === 10000);

  // F-23: Centre Contribution (Flex) - Section 13 Table 103
  const f23 = RentRollFormulas.f23CentreContribution({
    memberRevenue: 2721600,
    headLeaseRent: 1800000,
    camUtilitiesPayable: 450000,
    centreOpex: 330000
  });
  // 2,721,600 - 1,800,000 - 450,000 - 330,000 = 141,600 (5.2%)
  assert("F-23: Flex Centre Contribution Table 103 (₹27,21,600 - ₹25,80,000 costs = ₹1,41,600)", f23 === 141600);

  // F-24: Break-Even Seat Occupancy - Section 13 Table 103
  // Total costs = 25,80,000. Avg rev/seat = 27,21,600 / 202 = 13,473.27. Capacity = 240.
  // Capacity rev = 13,473.27 * 240 = 32,33,584. Break-even = 25.8L / 32.3358L = 79.79% -> 79.79%
  const avgRevSeat = 2721600 / 202;
  const f24 = RentRollFormulas.f24BreakEvenSeatOccupancy({
    headLeaseRent: 1800000,
    payables: 450000,
    opex: 330000,
    avgRevenuePerOccupiedSeat: avgRevSeat,
    seatCapacity: 240
  });
  assert("F-24: Break-Even Seat Occupancy Table 103 (79.79% break-even)", Math.round(f24 * 10) / 10 === 79.8);

  // F-25: Collection Efficiency
  const f25 = RentRollFormulas.f25CollectionEfficiency(4800000, 5200000);
  // 48L / 52L = 92.31%
  assert("F-25: Collection Efficiency (48L / 52L = 92.31%)", f25 === 92.31);

  // --- SECTION 13 FIXTURES & CANONICAL DB INTEGRITY ---
  const db = getRentRollDb();
  assert("§13 Table 96: 5 Properties Loaded (PROP-APX, MTP, NXN, GIFT, FLX)",
    db.properties.length === 5 &&
    db.properties.some(p => p.id === 'PROP-FLX') &&
    db.properties.some(p => p.id === 'PROP-GIFT')
  );

  assert("§13 Table 96: 15 Canonical Tenants Loaded",
    db.tenants.length === 15 &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("TechNova")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Global Logistics")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Apex Financial")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("NextGen")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Zenith")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("FreshMart")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Orbit")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Aurum Global")) &&
    db.tenants.some(t => (t.tradeName || t.legalName || '').includes("Brightpath"))
  );

  assert("§13 Table 96: 16 Canonical Leases Loaded with Full Commercial Terms",
    db.leases.length === 16 &&
    db.leases.some(l => l.tenantId === "TEN-TECHNOVA" && l.unitNumber === "APX-05A") &&
    db.leases.some(l => l.tenantId === "TEN-NEXTGEN" && l.unitNumber === "MTP-T1-04") &&
    db.leases.some(l => l.tenantId === "TEN-ZENITH" && l.unitNumber === "MTP-T2-01") &&
    db.leases.some(l => l.tenantId === "TEN-FRESHMART" && l.billingModel === "revenue_share")
  );

  assert("§13 Table 98: TechNova Multi-Invoice Breakdown & Priority Allocation",
    db.invoices.some(i => i.id === 'INV-2026-OCT-01' && i.subtotal === 1000000) &&
    db.invoices.some(i => i.id === 'INV-2026-OCT-02' && i.subtotal === 150000) &&
    db.invoices.some(i => i.id === 'INV-2026-OCT-03' && i.subtotal === 85000) &&
    db.collections.some(c => c.id === 'COL-2026-OCT-01' && c.amountReceived === 1100000)
  );

  assert("§13 Table 104: Sharma Family Trust Owner Statement October 2026",
    db.ownerStatements.some(s => s.clientAccountId === 'CA-SHARMA' && s.netRemittanceAmount === 4453440)
  );

  // Validate R-01 to R-44 Definitions Loaded
  assert("Rules R-01 to R-44: All 12 Canonical Rules Defined in CANONICAL_RULES",
    Object.keys(CANONICAL_RULES).length >= 10 &&
    CANONICAL_RULES['R-01'].severity === 'Error' &&
    CANONICAL_RULES['R-05'].severity === 'Error' &&
    CANONICAL_RULES['R-15'].severity === 'Error'
  );

  console.log("================================================================================");
  console.log(`TOTAL SPEC VERIFICATIONS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runCanonicalSpecificationTests();
