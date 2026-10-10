import { NextResponse } from "next/server";
import {
  CommissionTransaction,
  calculateBrokerageCommission,
  calculateMarketplaceTakeRate
} from "@/lib/commission-engine";

// Initial transactions registry (100% Real Live State - Zero Mock Data)
const initialTransactions: CommissionTransaction[] = [];

// Attach to globalThis for shared memory persistence across Next.js Turbopack route modules
const globalForCommissions = globalThis as unknown as {
  globalTransactions?: CommissionTransaction[];
};

if (!globalForCommissions.globalTransactions) {
  globalForCommissions.globalTransactions = [...initialTransactions];
}

const globalTransactions = globalForCommissions.globalTransactions;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let list = [...globalTransactions];
  if (type && type !== "all") {
    list = list.filter((t) => t.type === type);
  }

  // Sort newest first
  list.sort((a, b) => b.timestamp - a.timestamp);

  const totalGTV = list.reduce((acc, cur) => acc + cur.dealValue, 0);
  const totalOfficeXFee = list.reduce((acc, cur) => acc + cur.officeXFee, 0);
  const totalDisbursed = list.reduce((acc, cur) => acc + cur.payoutToVendorOrBroker, 0);
  const totalHoldback = list.filter((t) => t.status === "ESCROW_HOLD").reduce((acc, cur) => acc + cur.officeXFee, 0);

  return NextResponse.json({
    success: true,
    summary: {
      totalGTV,
      totalOfficeXFee,
      totalDisbursed,
      totalHoldback,
      transactionsCount: list.length
    },
    transactions: list
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, clientOrEntity, property, monthlyRent, contractValue, category } = data;

    if (type === "brokerage") {
      const { brokerageFee, brokerShare, officeXPlatformShare } = calculateBrokerageCommission(
        monthlyRent || "₹1,25,000"
      );
      const newTxn: CommissionTransaction = {
        id: `TXN-BRK-${Math.floor(5000 + Math.random() * 5000)}`,
        type: "brokerage",
        clientOrEntity: clientOrEntity || "Corporate Tenant",
        property: property || "Commercial Tower",
        dealValue: brokerageFee * 8, // Annualized deal value estimate
        commissionRate: 12.5,
        officeXFee: officeXPlatformShare,
        payoutToVendorOrBroker: brokerShare,
        status: "PENDING",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        invoiceRef: `BRK-2026-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: Date.now()
      };

      globalTransactions.unshift(newTxn);

      return NextResponse.json(
        {
          success: true,
          transaction: newTxn,
          message: `Brokerage commission of ₹${brokerageFee.toLocaleString()} (45 days' rent) triggered on lease execution!`
        },
        { status: 201 }
      );
    } else {
      // Marketplace escrow split
      const val = typeof contractValue === "number" ? contractValue : 250000;
      const { takeRatePercent, officeXFee, vendorDisbursement } = calculateMarketplaceTakeRate(
        val,
        category || "HVAC"
      );

      const newTxn: CommissionTransaction = {
        id: `TXN-ESC-${Math.floor(8800 + Math.random() * 1000)}`,
        type: "marketplace_escrow",
        clientOrEntity: clientOrEntity || "Verified Vendor",
        property: property || "Commercial Asset",
        dealValue: val,
        commissionRate: takeRatePercent,
        officeXFee,
        payoutToVendorOrBroker: vendorDisbursement,
        status: "ESCROW_HOLD",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        invoiceRef: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: Date.now()
      };

      globalTransactions.unshift(newTxn);

      return NextResponse.json(
        {
          success: true,
          transaction: newTxn,
          message: `Escrow take-rate of ₹${officeXFee.toLocaleString()} (${takeRatePercent}%) recorded!`
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating commission transaction:", error);
    return NextResponse.json({ error: "Failed to record commission" }, { status: 500 });
  }
}
