import { NextRequest, NextResponse } from "next/server";
import { resetRentRollDb, getRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "fixtures" ? "fixtures" : "clean";

    const db = resetRentRollDb(mode);

    recordAuditLog({
      entityName: "RentRollDatabase",
      action: mode === "clean" ? "PURGE_TO_PRISTINE" : "LOAD_SEED_FIXTURES",
      newValues: {
        mode,
        propertiesCount: db.properties.length,
        leasesCount: db.leases.length,
        tenantsCount: db.tenants.length
      },
      changedBy: "System Administrator"
    });

    return NextResponse.json({
      success: true,
      mode,
      message: mode === "clean" 
        ? "Rent roll database wiped to pristine empty workspace (0 fake data)."
        : "Demo prototype fixtures loaded successfully.",
      stats: {
        propertiesCount: db.properties.length,
        leasesCount: db.leases.length,
        tenantsCount: db.tenants.length,
        invoicesCount: db.invoices.length
      }
    });
  } catch (err: any) {
    console.error("POST /api/rent-roll/reset error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
