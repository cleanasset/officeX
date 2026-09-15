import {
  calculateBaseRentPsf,
  calculateTotalMonthlyGross,
  calculateAnnualRentGross,
  calculateCamMonthly,
  calculateSecurityDeposit,
  calculateDepositShortfall,
  calculateEscalationRent,
  getNextEscalationDate,
  calculateLockInStatus,
  calculateExpiryPipeline,
  calculateWALT,
  calculateOccupancy,
  calculateInvoice,
  calculateAgingBuckets,
  calculateNOI,
  calculateCapRate,
  generate12MonthForecast,
  calculateProratedRent,
  computeFullLeaseSummary
} from '../lib/rent-roll-engine';
import { getRentRollDb } from '../lib/rent-roll-store';

function runTests() {
  console.log("==================================================");
  console.log("🧪 OFFICEX RENT ROLL: 20 BUSINESS RULES & UAT SUITE");
  console.log("==================================================");

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

  // BR-01: Base Rent PSF
  const psf = calculateBaseRentPsf(6000000, 25000);
  assert("BR-01: Base Rent PSF (6,000,000 / 25,000 = 240)", psf === 240, `Got ${psf}`);

  // BR-02: Total Monthly Gross
  const gross = calculateTotalMonthlyGross({
    monthlyRent: 6000000,
    camMonthly: 600000,
    utilityFixedMonthly: 210000,
  });
  assert("BR-02: Total Monthly Gross (60L + 6L + 2.1L = 68.1L)", gross === 6810000, `Got ${gross}`);

  // BR-03: Annual Rent Gross
  const annual = calculateAnnualRentGross(gross);
  assert("BR-03: Annual Rent Gross (68.1L * 12 = 817.2L)", annual === 81720000, `Got ${annual}`);

  // BR-04: CAM Monthly
  const cam = calculateCamMonthly(25000, 24);
  assert("BR-04: CAM Monthly (25,000 sqft * ₹24 = ₹6,00,000)", cam === 600000, `Got ${cam}`);

  // BR-05: Security Deposit Required
  const dep = calculateSecurityDeposit(6000000, 6);
  assert("BR-05: Security Deposit Required (60L * 6 = 3.6 Cr)", dep === 36000000, `Got ${dep}`);

  // BR-06: Security Deposit Shortfall
  const depShort = calculateDepositShortfall(36000000, 30000000);
  assert("BR-06: Security Deposit Shortfall (3.6 Cr - 3.0 Cr = 60L shortfall)", depShort.hasShortfall && depShort.shortfall === 6000000);

  // BR-07: Escalation Rent Calculation
  const esc = calculateEscalationRent(6000000, 5);
  assert("BR-07: Escalation 5% on 60L (Increase = 3L, New = 63L)", esc.calculatedIncrease === 300000 && esc.newRent === 6300000);

  // BR-08: Escalation Date Progression
  const escDate = getNextEscalationDate("2024-09-01", 12, new Date("2025-01-01"));
  assert("BR-08: Next Escalation Date progression", escDate.getFullYear() === 2025 && escDate.getMonth() === 8);

  // BR-09: Lock-In Status
  const lockIn = calculateLockInStatus("2024-09-01", 36, new Date("2026-09-01"));
  assert("BR-09: Lock-In Active (24 mos into 36 mos lock-in is active)", lockIn.isLockInActive);

  // BR-10: Expiry Pipeline
  const expActive = calculateExpiryPipeline("2029-08-31", new Date("2026-09-01"));
  assert("BR-10: Expiry Pipeline (Active lease 3y out)", expActive.bucket === "active");

  const expSoon = calculateExpiryPipeline("2026-09-20", new Date("2026-09-01"));
  assert("BR-10: Expiry Pipeline (Critical <=30 days)", expSoon.bucket === "critical_30");

  // BR-11: WALT Calculation
  const walt = calculateWALT([
    { chargeableArea: 25000, monthlyRent: 6000000, expiryDate: "2029-08-31" },
    { chargeableArea: 32000, monthlyRent: 9120000, expiryDate: "2030-10-14" },
  ], new Date("2026-09-01"));
  assert("BR-11: WALT Calculation (>3 years)", walt.waltByAreaMonths > 36);

  // BR-12: Occupancy Rate
  const occ = calculateOccupancy(100000, 85000);
  assert("BR-12: Occupancy Rate (85,000 / 100,000 = 85%)", occ.occupancyPct === 85 && occ.vacancyPct === 15);

  // BR-13, 14, 15: Invoicing & TDS
  const inv = calculateInvoice({
    baseRent: 100000,
    camCharges: 10000,
    utilityCharges: 5000,
    otherCharges: 0,
    gstRate: 18,
    tdsRate: 10,
    amountPaid: 0,
    dueDate: "2026-09-05"
  }, new Date("2026-09-10"));
  // Subtotal = 115,000. GST 18% = 20,700. Gross = 135,700. TDS 10% on 100,000 = 10,000. Net Payable = 125,700. Overdue by 5 days.
  assert("BR-13: Invoice Subtotal & GST", inv.subtotal === 115000 && inv.gstAmount === 20700 && inv.grossTotal === 135700);
  assert("BR-14: TDS Deduction (10% on Base = 10,000, Net = 125,700)", inv.tdsDeducted === 10000 && inv.netPayable === 125700);
  assert("BR-15: Invoice Status Overdue", inv.status === "overdue" && inv.daysOverdue === 5);

  // BR-16: Aging Buckets
  const aging = calculateAgingBuckets([
    { id: "1", invoiceNumber: "INV-1", tenantName: "T1", invoiceDate: "2026-09-01", dueDate: "2026-09-05", grossTotal: 100, tdsDeducted: 0, amountPaid: 0, balanceDue: 100, status: "overdue" },
    { id: "2", invoiceNumber: "INV-2", tenantName: "T2", invoiceDate: "2026-08-01", dueDate: "2026-08-05", grossTotal: 200, tdsDeducted: 0, amountPaid: 0, balanceDue: 200, status: "overdue" }
  ], new Date("2026-09-15"));
  assert("BR-16: Aging Buckets (INV-1 in 0-30d, INV-2 in 31-60d)", aging.bucket0to30 === 100 && aging.bucket31to60 === 200 && aging.totalOutstanding === 300);

  // BR-17: Net Operating Income (NOI)
  const noi = calculateNOI({ grossRevenue: 1000000, totalExpenses: 250000 });
  assert("BR-17: Net Operating Income (10L - 2.5L = 7.5L NOI, 25% OER)", noi.noi === 750000 && noi.oerPct === 25);

  // BR-18: Cap Rate
  const cap = calculateCapRate(9000000, 100000000);
  assert("BR-18: Cap Rate (90L annual NOI / 10 Cr asset = 9% Cap Rate)", cap.capRatePct === 9);

  // BR-19: 12-Month Forecast
  const forecast = generate12MonthForecast([
    { monthlyRent: 100000, camMonthly: 10000, startDate: "2024-01-01", expiryDate: "2028-12-31", escalationPct: 5, nextEscalationDate: "2027-01-01" }
  ], new Date("2026-09-01"));
  assert("BR-19: 12-Month Forecast has 12 intervals", forecast.length === 12 && forecast[0].projectedGross === 110000);

  // BR-20: Proration Calculation
  const proration = calculateProratedRent(30000, 2026, 8, 16, 30); // Sep 2026 (30 days), days 16-30 (15 days)
  assert("BR-20: Prorated Rent (30,000 for 15/30 days = 15,000)", proration.proratedRent === 15000 && proration.activeDays === 15);

  // Test DB Store
  const db = getRentRollDb();
  assert("DB Store: Seed Leases loaded", db.leases.length >= 10);
  assert("DB Store: Seed Tenants loaded", db.tenants.length >= 10);
  assert("DB Store: Seed Properties loaded", db.properties.length >= 5);
  assert("DB Store: Seed Invoices loaded", db.invoices.length >= 10);

  console.log("==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
