import { NextResponse } from "next/server";
import { getRentRollDb } from "@/lib/rent-roll-store";

export async function GET(req: Request) {
  try {
    const db = getRentRollDb();

    // Area under management (chargeable area across active properties)
    const totalAreaSqft = (db.properties || []).reduce((sum, p) => sum + (p.chargeableArea || p.totalArea || 0), 0);

    // Total seat capacity across flex centres
    const totalSeatCapacity = (db.flexCentres || []).reduce((sum, fc) => sum + (fc.seatCapacity || 0), 0);

    // Active contracts count
    const activeContracts = (db.leases || []).filter(l => l.status === "active" || l.status === "under_notice");

    // Client accounts count
    const clientAccountsCount = (db.clientAccounts || []).length;

    // Total monthly billing volume
    const monthlyBillingVolume = activeContracts.reduce((sum, l) => sum + (l.monthlyRent || 0) + (l.camMonthly || 0), 0);

    const usage = {
      orgId: db.organization.id,
      orgName: db.organization.name,
      asOfDate: new Date().toISOString().split("T")[0],
      meteredAt: new Date().toISOString(),
      edition: "Enterprise",
      metrics: {
        totalAreaSqftUnderManagement: totalAreaSqft,
        totalSeatCapacity,
        activeContractsCount: activeContracts.length,
        totalContractsCount: (db.leases || []).length,
        clientAccountsCount,
        propertiesCount: (db.properties || []).length,
        spacesCount: (db.spaces || []).length,
        tenantsCount: (db.tenants || []).length,
        monthlyBillingVolume
      },
      saasBillingFeed: {
        subscriberId: db.organization.id,
        period: new Date().toISOString().slice(0, 7),
        billableAreaSqft: totalAreaSqft,
        billableSeats: totalSeatCapacity,
        activeMandates: (db.managementMandates || []).filter(m => m.status === "active").length
      }
    };

    return NextResponse.json(usage);
  } catch (error: any) {
    console.error("GET /api/rent-roll/usage error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
