/**
 * OfficeX Institutional Commission & Monetization Engine
 * Covers:
 * 1. Revenue Stream 1: Leasing Brokerage Commission (45 days' rent on closed leases)
 * 2. Revenue Stream 2: FM Procurement Marketplace Take-Rate (5% - 15% escrow split on completed WOs)
 */

export interface CommissionTransaction {
  id: string;
  type: "brokerage" | "marketplace_escrow";
  clientOrEntity: string;
  property: string;
  dealValue: number; // Total Contract Value (TCV) or Annual Contract Value
  commissionRate: number; // percentage (e.g. 10 or 12.5) or fixed formula
  officeXFee: number; // Retained by OfficeX
  payoutToVendorOrBroker: number; // Disbursed
  status: "PAID" | "PENDING" | "ESCROW_HOLD";
  date: string;
  invoiceRef: string;
  timestamp: number;
}

export function parseCurrencyString(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;

  if (val.includes("Cr")) return num * 10000000;
  if (val.includes("L")) return num * 100000;
  if (val.includes("K")) return num * 1000;
  return num;
}

/**
 * Calculates commercial brokerage fee:
 * Standard Indian CRE practice = 45 days' rent on executed corporate lease (1.5 * monthly rent)
 */
export function calculateBrokerageCommission(monthlyRent: number | string): {
  monthlyRentNum: number;
  brokerageFee: number;
  brokerShare: number; // 70% to deal broker
  officeXPlatformShare: number; // 30% to OfficeX desk
} {
  const rent = typeof monthlyRent === "string" ? parseCurrencyString(monthlyRent) : monthlyRent;
  const brokerageFee = Math.round(rent * 1.5);
  const brokerShare = Math.round(brokerageFee * 0.7);
  const officeXPlatformShare = brokerageFee - brokerShare;

  return {
    monthlyRentNum: rent,
    brokerageFee,
    brokerShare,
    officeXPlatformShare
  };
}

/**
 * Calculates FM Marketplace Escrow Split:
 * OfficeX Take-Rate:
 * - MEP / Critical Engineering: 8%
 * - HVAC / AMCs: 10%
 * - Cleaning / Soft Services: 12%
 * - Security / Turnstiles: 8%
 * - Others: 10%
 */
export function calculateMarketplaceTakeRate(contractValue: number, category: string = "HVAC"): {
  takeRatePercent: number;
  officeXFee: number;
  vendorDisbursement: number;
  warrantyHoldback: number; // 14-day defect liability buffer (6%)
} {
  let takeRatePercent = 10;
  const cat = category.toLowerCase();
  if (cat.includes("clean") || cat.includes("housekeep")) takeRatePercent = 12;
  else if (cat.includes("security")) takeRatePercent = 8;
  else if (cat.includes("mep") || cat.includes("lift") || cat.includes("elevator")) takeRatePercent = 8;
  else takeRatePercent = 10;

  const officeXFee = Math.round((contractValue * takeRatePercent) / 100);
  const warrantyHoldback = Math.round((contractValue * 6) / 100);
  const vendorDisbursement = contractValue - officeXFee - warrantyHoldback;

  return {
    takeRatePercent,
    officeXFee,
    vendorDisbursement,
    warrantyHoldback
  };
}
