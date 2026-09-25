import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, LeaseEntity, ImportBatchEntity } from "@/lib/rent-roll-store";
import { computeFullLeaseSummary } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const db = getRentRollDb();
    return NextResponse.json({
      batches: db.importBatches || [],
      templates: db.mappingTemplates || []
    });
  } catch (error: any) {
    console.error("GET /api/rent-roll/import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = getRentRollDb();

    // Action 1: Rollback Batch (RR-ING-11)
    if (action === "rollback") {
      const { batchId } = body;
      const batch = db.importBatches.find(b => b.id === batchId);
      if (!batch) {
        return NextResponse.json({ error: "Import batch not found" }, { status: 404 });
      }

      // Remove leases created by this batch
      const beforeCount = db.leases.length;
      db.leases = db.leases.filter(l => (l as any).importBatchId !== batchId);
      const removedCount = beforeCount - db.leases.length;

      batch.status = "rolled_back";
      batch.rolledBackAt = new Date().toISOString();
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "ImportBatch",
        action: "ROLLBACK_IMPORT_BATCH",
        newValues: { batchId, removedContracts: removedCount },
        changedBy: "Audit Admin"
      });

      return NextResponse.json({ success: true, message: `Successfully rolled back batch ${batchId}. ${removedCount} contracts removed.` });
    }

    // Action 2: Commit Ingestion Batch (RR-ING-10)
    const {
      fileName = "rent_roll_upload.csv",
      billingModel = "area",
      rows = [],
      targetPropertyId
    } = body;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No lease rows provided to ingest." }, { status: 400 });
    }

    const batchId = `BATCH-${Date.now()}`;
    const defaultProp = db.properties.find(p => p.id === targetPropertyId) || db.properties[0];

    let totalArea = 0;
    let totalMonthlyRent = 0;
    let successRows = 0;

    const newLeases: LeaseEntity[] = rows.map((r: any, idx: number) => {
      const area = Number(r.chargeableArea) || 1000;
      const rent = Number(r.monthlyRent) || 50000;
      const camPsf = Number(r.camRatePsf) || 0;
      const camMonthly = camPsf > 0 ? area * camPsf : 0;
      totalArea += area;
      totalMonthlyRent += rent;
      successRows++;

      const leaseId = `LEASE-IMP-${Date.now()}-${idx + 1}`;
      const code = r.leaseCode || `IMP-${defaultProp?.propertyCode || "PRP"}-${String(idx + 1).padStart(3, "0")}`;

      return {
        id: leaseId,
        orgId: db.organization.id,
        clientAccountId: defaultProp?.clientAccountId || "CA-SELF",
        billingEntityId: defaultProp?.billingEntityId || "BE-APX-01",
        propertyId: defaultProp?.id || "PROP-APX",
        propertyName: defaultProp?.name || "Apex Business Tower",
        spaceId: `SPC-${leaseId}`,
        unitNumber: r.unitNumber || `Suite ${100 + idx}`,
        floorNumber: Number(r.floorNumber) || 1,
        tenantId: `TEN-${leaseId}`,
        tenantName: r.tenantName || "Commercial Tenant",
        leaseCode: code,
        startDate: r.startDate || "2026-04-01",
        endDate: r.endDate || "2031-03-31",
        fitoutPeriodDays: 0,
        rentFreePeriodDays: 0,
        carpetArea: Math.round(area * 0.8),
        chargeableArea: area,
        monthlyRent: rent,
        baseRentPsf: Math.round((rent / area) * 100) / 100,
        camRatePsf: camPsf,
        camMonthly,
        utilityFixedMonthly: Number(r.utilityFixedMonthly) || 0,
        parkingChargesMonthly: 0,
        signageChargesMonthly: 0,
        otherChargesMonthly: 0,
        totalMonthlyGross: rent + camMonthly,
        annualRentGross: (rent + camMonthly) * 12,
        securityDepositMonths: Number(r.securityDepositMonths) || 6,
        securityDepositAmount: rent * (Number(r.securityDepositMonths) || 6),
        securityDepositPaid: rent * (Number(r.securityDepositMonths) || 6),
        escalationPct: Number(r.escalationPct) || 5,
        escalationFrequencyMonths: Number(r.escalationFrequencyMonths) || 12,
        nextEscalationDate: "2027-04-01",
        lockInMonths: Number(r.lockInMonths) || 36,
        lockInEndDate: "2029-03-31",
        noticePeriodDays: 90,
        status: "active",
        renewalStatus: "not_due",
        billingFrequency: "monthly",
        billingModel: (billingModel as any) || "area",
        contractType: "commercial_lease",
        billingDueDay: 5,
        gstRate: 18,
        tdsRate: 10,
        brokeragePaid: 0,
        importBatchId: batchId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any;
    });

    const newBatch: ImportBatchEntity = {
      id: batchId,
      orgId: db.organization.id,
      fileName,
      billingModel,
      totalRows: rows.length,
      validRows: successRows,
      warningRows: 0,
      errorRows: 0,
      controlTotalArea: totalArea,
      controlTotalRent: totalMonthlyRent,
      status: "committed",
      committedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    db.importBatches.unshift(newBatch);
    newLeases.forEach(l => db.leases.unshift(l));
    saveRentRollDb(db);

    recordAuditLog({
      entityName: "ImportBatch",
      action: "COMMIT_IMPORT_BATCH",
      newValues: {
        batchId,
        fileName,
        totalContracts: newLeases.length,
        controlTotalArea: totalArea,
        controlTotalRent: totalMonthlyRent
      },
      changedBy: "Lease Data Analyst"
    });

    return NextResponse.json({
      success: true,
      batchId,
      importedCount: newLeases.length,
      controlTotalArea: totalArea,
      controlTotalRent: totalMonthlyRent
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
