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
    const asOfDate = searchParams.get("asOfDate") || new Date().toISOString().split("T")[0];
    let ownerEmail = searchParams.get("ownerEmail")?.toLowerCase().trim();

    if (!ownerEmail) {
      try {
        const cookieStore = await cookies();
        ownerEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();
      } catch {}
    }

    const db = getRentRollDb();
    let properties = db.properties || [];

    if (ownerEmail) {
      properties = properties.filter(p => 
        (p.ownerEmail || "").toLowerCase().trim() === ownerEmail || 
        p.ownerUserId === ownerEmail
      );
    }

    const validPropIds = new Set(properties.map(p => p.id));
    let spaces = (db.spaces || []).filter(s => validPropIds.has(s.propertyId));
    let leases = (db.leases || []).filter(l => validPropIds.has(l.propertyId));
    let invoices = (db.invoices || []).filter(i => validPropIds.has(i.propertyId));
    let expenses = (db.expenses || []).filter(e => validPropIds.has(e.propertyId));

    if (propertyId && propertyId !== "ALL") {
      spaces = spaces.filter(s => s.propertyId === propertyId);
      leases = leases.filter(l => l.propertyId === propertyId);
      properties = properties.filter(p => p.id === propertyId);
      invoices = invoices.filter(i => i.propertyId === propertyId);
      expenses = expenses.filter(e => e.propertyId === propertyId);
    }

    // Filter active leases as of asOfDate
    const activeLeases = leases.filter(l => {
      const isDateValid = l.startDate <= asOfDate && l.endDate >= asOfDate;
      const isStatusValid = l.status === "active" || l.status === "under_notice" || l.status === "holdover" || l.status === "pending_approval";
      return isDateValid && isStatusValid;
    });

    // Space-Centric Metrics (RR-VW-01)
    const totalSpacesCount = spaces.length;
    const occupiedSpacesCount = spaces.filter(s => 
      activeLeases.some(l => l.spaceId === s.id || (l.unitNumber && s.unitNumber && l.unitNumber.toLowerCase() === s.unitNumber.toLowerCase()))
    ).length;
    const vacantSpacesCount = Math.max(0, totalSpacesCount - occupiedSpacesCount);

    const totalPortfolioArea = properties.reduce((sum, p) => sum + p.totalArea, 0) || spaces.reduce((sum, s) => sum + s.chargeableArea, 0);
    const totalOccupiedArea = activeLeases.reduce((sum, l) => sum + l.chargeableArea, 0);
    const vacantArea = Math.max(0, totalPortfolioArea - totalOccupiedArea);

    const occupancyPct = totalPortfolioArea > 0 
      ? round2((totalOccupiedArea / totalPortfolioArea) * 100) 
      : 0;

    // Financial Totals
    const totalMonthlyRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0);
    const totalCamMonthly = activeLeases.reduce((sum, l) => sum + l.camMonthly, 0);
    const totalMonthlyBilling = activeLeases.reduce((sum, l) => sum + l.totalMonthlyGross, 0);
    const totalAnnualGross = activeLeases.reduce((sum, l) => sum + l.annualRentGross, 0);

    // Potential vacant rent
    const potentialVacantRent = spaces
      .filter(s => !activeLeases.some(l => l.spaceId === s.id || (l.unitNumber && s.unitNumber && l.unitNumber.toLowerCase() === s.unitNumber.toLowerCase())))
      .reduce((sum, s) => sum + (s.potentialMonthlyRent || Math.round(s.chargeableArea * (s.standardRatePsf || 150))), 0);

    // Receivables & Invoices as of asOfDate
    const asOfInvoices = invoices.filter(i => {
      const invDate = (i.issueDate || i.invoiceDate || i.createdAt || "2099-12-31").split("T")[0];
      return invDate <= asOfDate;
    });
    const totalOutstanding = asOfInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    const overdueInvoices = asOfInvoices.filter(i => i.status === "overdue" || (i.dueDate && i.dueDate < asOfDate && (i.balanceDue || 0) > 0));
    const overdueLeaseIds = new Set(overdueInvoices.map(i => i.leaseId));

    // Expiry & Alert Pipeline
    const now = new Date(asOfDate);
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
    const upcomingEscalations = (db.escalations || []).filter(e => {
      if (e.status !== "pending") return false;
      const escDate = new Date(e.escalationDate);
      const diffDays = Math.round((escDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= -30 && diffDays <= 60;
    });

    // Occupancy structure
    const occupancyData = {
      totalArea: totalPortfolioArea,
      occupiedArea: totalOccupiedArea,
      vacantArea,
      occupancyPct,
      vacancyPct: round2(100 - occupancyPct),
      totalSpaces: totalSpacesCount,
      occupiedSpaces: occupiedSpacesCount,
      vacantSpaces: vacantSpacesCount,
      potentialVacantRent
    };

    // WALT
    const waltData = calculateWALT(activeLeases.map(l => ({
      chargeableArea: l.chargeableArea,
      monthlyRent: l.monthlyRent,
      expiryDate: l.endDate,
      status: l.status,
    })), now);

    // Net Operating Income (Monthly & Annual)
    const asOfExpenses = expenses.filter(e => {
      const expDate = (e.expenseDate || e.createdAt || "2099-12-31").split("T")[0];
      return expDate <= asOfDate;
    });
    const totalMonthlyExpenses = asOfExpenses.reduce((sum, e) => sum + e.amount, 0);
    const noiMonthly = calculateNOI({
      grossRevenue: totalMonthlyBilling,
      totalExpenses: totalMonthlyExpenses
    });

    const totalPortfolioAssetValue = properties.reduce((sum, p) => sum + (p.assetValue || 0), 0);
    const capRateData = calculateCapRate(noiMonthly.noi * 12, totalPortfolioAssetValue);

    // Aging Buckets
    const agingData = calculateAgingBuckets(asOfInvoices.map(i => ({
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
    })), now);

    // Top 5 Tenants by Rent
    const topTenants = [...activeLeases]
      .sort((a, b) => b.monthlyRent - a.monthlyRent)
      .slice(0, 5)
      .map(l => {
        const tenantObj = (db.tenants || []).find(t => t.id === l.tenantId || t.tradeName.toLowerCase() === l.tenantName.toLowerCase());
        return {
          tenantName: l.tenantName,
          propertyName: l.propertyName,
          monthlyRent: l.monthlyRent,
          areaSqFt: l.chargeableArea,
          sharePct: totalMonthlyRent > 0 ? round2((l.monthlyRent / totalMonthlyRent) * 100) : 0,
          portalLive: Boolean(tenantObj?.portalLive),
          tenantStatus: tenantObj?.status || "invited",
          isTermsPending: Boolean(l.isTermsPending || l.status === "pending_approval" || l.approvalStatus === "submitted")
        };
      });

    // Status breakdown
    const statusCounts = {
      active: leases.filter(l => l.status === "active").length,
      underNotice: leases.filter(l => l.status === "under_notice").length,
      expired: leases.filter(l => l.status === "expired").length,
      draft: leases.filter(l => l.status === "draft").length,
      vacant: vacantSpacesCount
    };

    return NextResponse.json({
      organization: db.organization,
      branding: db.config?.branding,
      billingEntities: db.billingEntities || [],
      summary: {
        totalLeasesCount: leases.length,
        activeLeasesCount: activeLeases.length,
        totalSpacesCount,
        occupiedSpacesCount,
        vacantSpacesCount,
        totalMonthlyRent,
        totalCamMonthly,
        totalMonthlyBilling,
        totalAnnualGross,
        potentialVacantRent,
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
      alerts: (db.alerts || []).filter(a => !a.isRead).slice(0, 5)
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
