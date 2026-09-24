import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRentRollDb } from "@/lib/rent-roll-store";
import {
  calculateWALT,
  calculateOccupancy,
  calculateNOI,
  calculateCapRate,
  calculateAgingBuckets,
  computeFullLeaseSummary,
  round2
} from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();
    const isDemo = searchParams.get("demo") === "1" || searchParams.get("fixtures") === "1";

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties.filter(p => {
      const lower = (p.name || "").toLowerCase().trim();
      return lower !== "fortune sky" && lower !== "apex horizon tower" && lower !== "signature tower b";
    });

    if (ownerEmail) {
      properties = properties.filter(p => (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || p.ownerUserId === ownerEmail);
    } else if (!isDemo) {
      properties = [];
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let leases = db.leases.filter(l => validPropIds.has(l.propertyId));
    let invoices = db.invoices.filter(i => validPropIds.has(i.propertyId));
    let expenses = db.expenses.filter(e => validPropIds.has(e.propertyId));

    if (propertyId && propertyId !== "ALL") {
      leases = leases.filter(l => l.propertyId === propertyId);
      properties = properties.filter(p => p.id === propertyId);
      invoices = invoices.filter(i => i.propertyId === propertyId);
      expenses = expenses.filter(e => e.propertyId === propertyId);
    }

    const activeLeases = leases.filter(l => l.status === "active" || l.status === "under_notice");

    // Financial Totals
    const totalMonthlyRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
    const totalCamMonthly = activeLeases.reduce((sum, l) => sum + l.camMonthly, 0);
    const totalMonthlyBilling = activeLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);
    const totalAnnualGross = activeLeases.reduce((sum, l) => sum + l.annualRentGross, 0);

    // Receivables & Invoices
    const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    const overdueInvoices = invoices.filter(i => i.status === "overdue");
    const overdueLeaseIds = new Set(overdueInvoices.map(i => i.leaseId));

    // Expiry & Alert Pipeline
    const now = new Date();
    let expiring30Days = 0;
    let expiring90Days = 0;
    let expiredLeases = 0;

    for (const l of activeLeases) {
      const exp = new Date(l.endDate);
      const diffDays = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiredLeases++;
      } else if (diffDays <= 30) {
        expiring30Days++;
        expiring90Days++;
      } else if (diffDays <= 90) {
        expiring90Days++;
      }
    }

    // Escalations Due / Soon (within 60 days)
    const upcomingEscalations = db.escalations.filter(e => {
      if (e.status !== "pending") return false;
      const escDate = new Date(e.escalationDate);
      const diffDays = Math.round((escDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= -30 && diffDays <= 60;
    });

    // Area & Occupancy
    const totalPortfolioArea = properties.reduce((sum, p) => sum + p.totalArea, 0);
    const totalOccupiedArea = activeLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
    const occupancyData = calculateOccupancy(totalPortfolioArea, totalOccupiedArea);

    // WALT
    const waltData = calculateWALT(activeLeases.map(l => ({
      chargeableArea: l.chargeableArea,
      monthlyRent: l.monthlyRent,
      expiryDate: l.endDate,
      status: l.status,
    })));

    // Net Operating Income (Monthly & Annual)
    const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const noiMonthly = calculateNOI({
      grossRevenue: totalMonthlyBilling,
      totalExpenses: totalMonthlyExpenses
    });

    const totalPortfolioAssetValue = properties.reduce((sum, p) => sum + (p.assetValue || 0), 0);
    const capRateData = calculateCapRate(noiMonthly.noi * 12, totalPortfolioAssetValue);

    // Aging Buckets
    const agingData = calculateAgingBuckets(invoices.map(i => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      tenantName: i.tenantName,
      invoiceDate: i.invoiceDate,
      dueDate: i.dueDate,
      grossTotal: i.grossTotal,
      tdsDeducted: i.tdsDeducted,
      amountPaid: i.amountPaid,
      balanceDue: i.balanceDue,
      status: i.status
    })));

    // Top 5 Tenants by Rent
    const topTenants = [...activeLeases]
      .sort((a, b) => b.monthlyRent - a.monthlyRent)
      .slice(0, 5)
      .map(l => ({
        tenantName: l.tenantName,
        propertyName: l.propertyName,
        monthlyRent: l.monthlyRent,
        areaSqFt: l.chargeableArea,
        sharePct: totalMonthlyRent > 0 ? round2((l.monthlyRent / totalMonthlyRent) * 100) : 0
      }));

    // Status breakdown
    const statusCounts = {
      active: leases.filter(l => l.status === "active").length,
      underNotice: leases.filter(l => l.status === "under_notice").length,
      expired: leases.filter(l => l.status === "expired").length,
      draft: leases.filter(l => l.status === "draft").length,
    };

    return NextResponse.json({
      summary: {
        totalLeasesCount: leases.length,
        activeLeasesCount: activeLeases.length,
        totalMonthlyRent,
        totalCamMonthly,
        totalMonthlyBilling,
        totalAnnualGross,
        totalOutstanding,
        overdueLeasesCount: overdueLeaseIds.size,
        expiring30Days,
        expiring90Days,
        expiredLeases,
        escalationsDueCount: upcomingEscalations.length,
      },
      occupancy: occupancyData,
      walt: waltData,
      noi: {
        monthlyRevenue: noiMonthly.grossRevenue,
        monthlyExpenses: noiMonthly.totalExpenses,
        monthlyNOI: noiMonthly.noi,
        oerPct: noiMonthly.oerPct,
        annualNOI: round2(noiMonthly.noi * 12),
        capRatePct: capRateData.capRatePct,
      },
      aging: agingData,
      topTenants,
      statusCounts,
      alerts: db.alerts.filter(a => !a.isRead).slice(0, 5)
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
