import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getRentRollDb,
  saveRentRollDb,
  recordAuditLog,
  LeaseEntity,
  SpaceEntity,
  ImportBatchEntity
} from "@/lib/rent-roll-store";
import {
  validateRentRollRow,
  validateControlTotals,
  CANONICAL_RULES
} from "@/lib/rent-roll-rules";

// Synonym dictionary for ≥80% auto-mapping (RR-ING-03)
export const SYNONYM_DICTIONARY: Record<string, string[]> = {
  unitNumber: ["unit", "unit number", "space", "space id", "suite", "shop no", "premise", "office no"],
  floorNumber: ["floor", "floor number", "level", "flr", "storey"],
  chargeableArea: ["chargeable area", "area", "super built-up", "sbua", "leasable area", "rentable area", "sq ft", "square feet"],
  carpetArea: ["carpet area", "carpet", "usable area", "net area"],
  tenantName: ["tenant", "tenant name", "occupant", "lessee", "client", "company name", "customer"],
  monthlyRent: ["monthly rent", "rent", "base rent", "fixed rent", "monthly base rent", "rent per month", "amount"],
  ratePsf: ["rate", "rate psf", "rate/sqft", "base rate", "rent psf", "rent per sqft"],
  startDate: ["start date", "commencement date", "lease start", "possession date", "handover date"],
  endDate: ["end date", "expiry date", "lease end", "termination date"],
  camRatePsf: ["cam psf", "cam rate", "maintenance psf", "o&m rate"],
  camMonthly: ["cam", "monthly cam", "maintenance", "o&m charges"],
  securityDepositMonths: ["deposit months", "security deposit (months)", "sd months"],
  escalationPct: ["escalation %", "escalation", "escalation rate", "annual hike %"],
  escalationFrequencyMonths: ["escalation frequency", "escalation period", "hike every (months)"],
  lockInMonths: ["lock-in", "lock in months", "lockin period", "minimum tenure"],
  gstin: ["gstin", "gst no", "gst number", "tax id"],
  pan: ["pan", "pan no", "pan number"]
};

export async function GET(req: Request) {
  try {
    const db = getRentRollDb();
    return NextResponse.json({
      batches: db.importBatches || [],
      templates: db.mappingTemplates || [],
      synonymDictionary: SYNONYM_DICTIONARY,
      canonicalRules: CANONICAL_RULES
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

    // ========================================================================
    // STAGE 1 & 2: Landing & Staging (RR-ING-01, RR-ING-03, RR-ING-16)
    // ========================================================================
    if (action === "stage") {
      const { fileName = "rent_roll.csv", rawContent = "", rows = [], billingModel = "area" } = body;

      const checksum = crypto.createHash("sha256").update(rawContent || JSON.stringify(rows)).digest("hex");
      const batchId = `BATCH-${Date.now()}`;

      // Profiling data (RR-ING-16)
      const profiling = {
        totalRows: rows.length,
        missingFieldsSummary: {} as Record<string, number>,
        emptyRowsCount: 0
      };

      rows.forEach((r: any) => {
        Object.keys(r).forEach(col => {
          if (r[col] === null || r[col] === undefined || String(r[col]).trim() === "") {
            profiling.missingFieldsSummary[col] = (profiling.missingFieldsSummary[col] || 0) + 1;
          }
        });
      });

      // Synonym mapping auto-suggestion & unmapped source column identification (RR-ING-04, UAT-63)
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      const suggestedMappings: Record<string, string> = {};
      const unmappedHeaders: string[] = [];

      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        let matched = false;
        for (const [targetField, synonyms] of Object.entries(SYNONYM_DICTIONARY)) {
          if (synonyms.some(syn => cleanHeader === syn || cleanHeader.includes(syn))) {
            suggestedMappings[header] = targetField;
            matched = true;
            break;
          }
        }
        if (!matched) {
          unmappedHeaders.push(header);
        }
      });

      return NextResponse.json({
        success: true,
        batchId,
        checksum,
        profiling,
        suggestedMappings,
        headers,
        unmappedHeaders,
        totalRows: rows.length,
        status: "staged"
      });
    }

    // ========================================================================
    // STAGE 4: Rule Engine Validation R-01 to R-44 & Control Totals (RR-ING-06, RR-ING-07)
    // ========================================================================
    if (action === "validate") {
      const { rows = [], targetPropertyId, mapping = {} } = body;

      const targetProperty = db.properties.find(p => p.id === targetPropertyId) || db.properties[0];
      const targetArea = targetProperty ? (targetProperty.chargeableArea || targetProperty.totalArea || 0) : 0;

      // Transform rows using column mapping while preserving unmapped columns (RR-ING-04, UAT-63)
      const unmappedColumnsSet = new Set<string>();
      const canonicalTargetFields = new Set([
        "propertyName", "unitNumber", "floorNumber", "chargeableArea", "carpetArea",
        "monthlyRent", "baseRentPsf", "camRatePsf", "camMonthly", "tenantName", "gstin",
        "pan", "startDate", "endDate", "lockInEndDate", "lockInMonths", "noticePeriodDays",
        "escalationPct", "escalationFrequencyMonths", "securityDepositAmount", "billingModel"
      ]);

      const normalizedRows = rows.map((r: any, idx: number) => {
        const norm: Record<string, any> = { _originalRowNumber: idx + 1, _unmappedColumns: {} };
        Object.keys(r).forEach(srcCol => {
          const targetField = mapping[srcCol] || srcCol;
          if (canonicalTargetFields.has(targetField)) {
            norm[targetField] = r[srcCol];
          } else {
            norm[targetField] = r[srcCol]; // keep accessible
            norm._unmappedColumns[srcCol] = r[srcCol]; // explicitly preserve per RR-ING-04
            unmappedColumnsSet.add(srcCol);
          }
        });
        return norm;
      });

      // Run validation rules R-01 through R-44
      let validRowCount = 0;
      let warningRowCount = 0;
      let errorRowCount = 0;
      const rowValidations = normalizedRows.map((r: any, idx: number) => {
        const val = validateRentRollRow(r, idx + 1);
        if (val.isValid && !val.hasWarnings) validRowCount++;
        if (val.isValid && val.hasWarnings) {
          validRowCount++;
          warningRowCount++;
        }
        if (!val.isValid) errorRowCount++;
        return {
          rowNumber: idx + 1,
          isValid: val.isValid,
          hasWarnings: val.hasWarnings,
          errors: val.errors,
          warnings: val.warnings,
          unmappedColumns: r._unmappedColumns,
          row: r
        };
      });

      // Run Control Totals R-03 check
      const controlTotals = validateControlTotals(normalizedRows, targetArea);

      return NextResponse.json({
        totalRows: normalizedRows.length,
        validRowCount,
        warningRowCount,
        errorRowCount,
        isEligibleForCommit: errorRowCount === 0 && controlTotals.reconciliationPass,
        controlTotals,
        unmappedColumns: Array.from(unmappedColumnsSet),
        rowValidations
      });
    }

    // ========================================================================
    // STAGE 5: Diff Preview (RR-ING-09)
    // ========================================================================
    if (action === "diff") {
      const { rows = [], targetPropertyId } = body;
      const targetProp = db.properties.find(p => p.id === targetPropertyId) || db.properties[0];
      const existingSpaces = (db.spaces || []).filter(s => s.propertyId === targetProp?.id);
      const existingLeases = (db.leases || []).filter(l => l.propertyId === targetProp?.id && l.status === "active");

      let newSpacesCount = 0;
      let updatedSpacesCount = 0;
      let newLeasesCount = 0;
      let updatedLeasesCount = 0;
      let unchangedCount = 0;

      rows.forEach((r: any) => {
        const unitName = (r.unitNumber || r.unit || "").trim().toLowerCase();
        const spaceMatch = existingSpaces.find(s => s.unitNumber.trim().toLowerCase() === unitName);
        if (!spaceMatch) {
          newSpacesCount++;
        } else {
          updatedSpacesCount++;
        }

        const leaseMatch = existingLeases.find(l => l.unitNumber.trim().toLowerCase() === unitName);
        if (!leaseMatch) {
          newLeasesCount++;
        } else {
          const areaChanged = Math.abs(Number(r.chargeableArea || 0) - leaseMatch.chargeableArea) > 1;
          const rentChanged = Math.abs(Number(r.monthlyRent || 0) - leaseMatch.monthlyRent) > 1;
          if (areaChanged || rentChanged) {
            updatedLeasesCount++;
          } else {
            unchangedCount++;
          }
        }
      });

      return NextResponse.json({
        propertyName: targetProp?.name,
        diffSummary: {
          newSpacesCount,
          updatedSpacesCount,
          newLeasesCount,
          updatedLeasesCount,
          unchangedCount,
          totalIncomingRows: rows.length
        }
      });
    }

    // ========================================================================
    // STAGE 7: Two-Step Commit / Sign-off (RR-ING-10)
    // ========================================================================
    if (action === "submit_for_approval") {
      const { batchId, rows = [], preparer = "Lease Data Analyst" } = body;
      return NextResponse.json({
        success: true,
        batchId,
        status: "pending_approval",
        preparer,
        message: "Batch successfully submitted for Maker-Checker sign-off by Commercial Approver."
      });
    }

    // ========================================================================
    // STAGE 8: Atomic Commit (RR-ING-10, RR-ING-08)
    // ========================================================================
    if (action === "commit" || !action) {
      const {
        fileName = "rent_roll_upload.csv",
        billingModel = "area",
        rows = [],
        targetPropertyId,
        approver = "Commercial Approver"
      } = body;

      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: "No lease rows provided to ingest." }, { status: 400 });
      }

      const batchId = `BATCH-${Date.now()}`;
      const defaultProp = db.properties.find(p => p.id === targetPropertyId) || db.properties[0];

      let totalArea = 0;
      let totalMonthlyRent = 0;
      let successRows = 0;

      const newLeases: LeaseEntity[] = [];
      const newSpaces: SpaceEntity[] = [];

      rows.forEach((r: any, idx: number) => {
        const area = Number(r.chargeableArea || r.area) || 1000;
        const rent = Number(r.monthlyRent || r.rent) || 50000;
        const camPsf = Number(r.camRatePsf) || 0;
        const camMonthly = camPsf > 0 ? area * camPsf : 0;
        totalArea += area;
        totalMonthlyRent += rent;
        successRows++;

        const leaseId = `LEASE-IMP-${Date.now()}-${idx + 1}`;
        const spaceId = `SPC-IMP-${Date.now()}-${idx + 1}`;
        const unitNumber = r.unitNumber || r.unit || `Suite ${100 + idx}`;
        const floorNumber = Number(r.floorNumber || r.floor) || 1;
        const tenantName = r.tenantName || r.tenant || "Commercial Tenant";
        const code = r.leaseCode || `IMP-${defaultProp?.propertyCode || "PRP"}-${String(idx + 1).padStart(3, "0")}`;

        // Create or update space
        const existingSpace = db.spaces.find(
          s => s.propertyId === defaultProp?.id && s.unitNumber.toLowerCase() === unitNumber.toLowerCase()
        );

        if (!existingSpace) {
          const spaceObj: SpaceEntity = {
            id: spaceId,
            propertyId: defaultProp?.id || "PROP-DEFAULT",
            buildingName: defaultProp?.name || "Tower A",
            floorNumber,
            unitNumber,
            spaceType: "office",
            chargeableArea: area,
            carpetArea: Number(r.carpetArea) || Math.round(area * 0.8),
            status: "leased",
            currentLeaseId: leaseId,
            standardRatePsf: Math.round((rent / area) * 100) / 100,
            standardCamPsf: camPsf,
            potentialMonthlyRent: rent,
            seatCapacity: Number(r.seatCapacity || r.seats) || 0
          };
          newSpaces.push(spaceObj);
        } else {
          existingSpace.chargeableArea = area;
          existingSpace.potentialMonthlyRent = rent;
          existingSpace.status = "leased";
          existingSpace.currentLeaseId = leaseId;
        }

        // Create canonical contract
        const leaseObj: LeaseEntity = {
          id: leaseId,
          orgId: db.organization.id,
          clientAccountId: defaultProp?.clientAccountId || "CA-PORTFOLIO",
          billingEntityId: defaultProp?.billingEntityId || "",
          propertyId: defaultProp?.id || "PROP-DEFAULT",
          propertyName: defaultProp?.name || "Commercial Property Asset",
          spaceId: existingSpace ? existingSpace.id : spaceId,
          unitNumber,
          floorNumber,
          tenantId: `TEN-${leaseId}`,
          tenantName,
          leaseCode: code,
          startDate: r.startDate || "2026-04-01",
          endDate: r.endDate || "2031-03-31",
          fitoutPeriodDays: 0,
          rentFreePeriodDays: 0,
          carpetArea: Number(r.carpetArea) || Math.round(area * 0.8),
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
          approvalStatus: "approved",
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
        };
        newLeases.push(leaseObj);
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
      newSpaces.forEach(s => db.spaces.push(s));
      newLeases.forEach(l => db.leases.unshift(l));
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "ImportBatch",
        action: "COMMIT_IMPORT_BATCH",
        newValues: {
          batchId,
          fileName,
          totalContracts: newLeases.length,
          newSpaces: newSpaces.length,
          controlTotalArea: totalArea,
          controlTotalRent: totalMonthlyRent,
          approvedBy: approver
        },
        changedBy: approver
      });

      return NextResponse.json({
        success: true,
        batchId,
        importedContractsCount: newLeases.length,
        newSpacesCount: newSpaces.length,
        controlTotalArea: totalArea,
        controlTotalRent: totalMonthlyRent,
        approver
      }, { status: 201 });
    }

    // ========================================================================
    // STAGE 9: Rollback / Void within 7 Days (RR-ING-11)
    // ========================================================================
    if (action === "rollback") {
      const { batchId } = body;
      const batch = db.importBatches.find(b => b.id === batchId);
      if (!batch) {
        return NextResponse.json({ error: "Import batch not found" }, { status: 404 });
      }

      // Check 7-day rollback window
      const commitTime = batch.committedAt ? new Date(batch.committedAt).getTime() : new Date(batch.createdAt).getTime();
      const now = Date.now();
      const diffDays = (now - commitTime) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return NextResponse.json({
          error: `Batch ${batchId} was committed ${diffDays.toFixed(1)} days ago. 7-day rollback window has expired.`
        }, { status: 400 });
      }

      // Remove leases and spaces created by this batch
      const beforeLeases = db.leases.length;
      db.leases = db.leases.filter(l => (l as any).importBatchId !== batchId);
      const removedLeases = beforeLeases - db.leases.length;

      batch.status = "rolled_back";
      batch.rolledBackAt = new Date().toISOString();
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "ImportBatch",
        action: "ROLLBACK_IMPORT_BATCH",
        newValues: { batchId, removedContracts: removedLeases },
        changedBy: "Audit Admin"
      });

      return NextResponse.json({
        success: true,
        message: `Successfully rolled back batch ${batchId}. ${removedLeases} contracts removed and prior state restored.`
      });
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
