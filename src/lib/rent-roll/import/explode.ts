/**
 * OFFICEX Rent Roll — Entity Explosion Engine (§4.15, RR-IMP-04)
 * Deconstructs one tabular source row into relational entities:
 * Property, Building, Space, Occupant, Contract, Contract Charge, Rent Step, Deposit.
 */

import {
  parseIndianNumber,
  parseImportDate,
  convertAreaToSqft,
  parseOccupancyStatus,
  parseContractType,
  parseEscalationPhrase,
} from "./transform";

export interface ExplodedEntities {
  property: {
    property_name: string;
    property_code: string;
    property_type: "office" | "retail" | "mixed" | "flex_workspace";
  };
  building: {
    building_name: string;
    building_code: string;
  };
  space: {
    space_code: string;
    space_name: string;
    floor_name: string;
    chargeable_area_sqft: number;
    occupancy_status: "vacant" | "occupied" | "under_maintenance" | "retired";
  };
  occupant: {
    occupant_name: string;
    occupant_code: string;
    occupant_type: "company" | "individual";
    occupant_status: "active" | "notice_served" | "holding_over" | "vacant" | "inactive";
  };
  contract: {
    contract_code: string;
    contract_type: "lease" | "leave_and_licence" | "managed_office_agreement" | "co_working_membership";
    contract_status: "active" | "future" | "draft";
    start_date: string;
    end_date: string;
    deposit_amount_inr: number;
    deposit_status: "pending" | "received" | "adjusted" | "refunded";
  };
  charge: {
    charge_code: string;
    rate_amount: number;
    frequency: "monthly" | "quarterly" | "annual";
  };
  rent_step?: {
    step_no: number;
    escalation_type: "percentage" | "fixed_amount" | "index_based" | "stepped_schedule";
    escalation_value: number;
    effective_date: string;
  };
  unmapped_columns: Record<string, any>;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .slice(0, 30);
}

/**
 * Explodes mapped source row into relational domain entities.
 */
export function explodeSourceRow(
  rawRow: Record<string, any>,
  mapping: Record<string, string>, // sourceHeader -> targetStandardField
  options: {
    defaultPropertyName?: string;
    defaultBuildingName?: string;
    asOfDate?: string;
  } = {}
): {
  exploded: ExplodedEntities;
  parsedRow: Record<string, any>;
  unmapped: Record<string, any>;
} {
  const mappedValues: Record<string, any> = {};
  const unmapped: Record<string, any> = {};

  const mappedSourceHeaders = new Set<string>();

  // Invert mapping to find source headers
  for (const [sourceHeader, targetField] of Object.entries(mapping)) {
    if (targetField && targetField !== "unmapped" && rawRow[sourceHeader] !== undefined) {
      mappedValues[targetField] = rawRow[sourceHeader];
      mappedSourceHeaders.add(sourceHeader);
    }
  }

  // Collect unmapped columns (§RR-IMP-08)
  for (const [key, val] of Object.entries(rawRow)) {
    if (!mappedSourceHeaders.has(key)) {
      unmapped[key] = val;
    }
  }

  // 1. Core values
  const spaceCode = String(mappedValues.space_code || `SPC-${Math.floor(1000 + Math.random() * 9000)}`).trim();
  const occupantName = String(mappedValues.occupant_name || "Unknown Tenant").trim();
  const rawArea = mappedValues.chargeable_area_sqft;
  const areaSqft = convertAreaToSqft(rawArea, "sqft") || 1000;
  const rentAmount = parseIndianNumber(mappedValues.monthly_rent) ?? 0;
  const depositAmount = parseIndianNumber(mappedValues.deposit_amount) ?? 0;

  // 2. Dates
  const today = options.asOfDate || new Date().toISOString().split("T")[0];
  let startDate = parseImportDate(mappedValues.start_date).isoDate || today;
  let endDate = parseImportDate(mappedValues.end_date).isoDate;

  // Default end_date = start_date + 5 years if missing (§RR-IMP-04 note)
  if (!endDate) {
    const startObj = new Date(startDate);
    startObj.setFullYear(startObj.getFullYear() + 5);
    endDate = startObj.toISOString().split("T")[0];
  }

  // 3. Statuses
  const occStatus = mappedValues.occupancy_status ? parseOccupancyStatus(mappedValues.occupancy_status) : "occupied";
  const contractType = mappedValues.contract_type ? parseContractType(mappedValues.contract_type) : "lease";

  // 4. Escalation
  let rentStep: ExplodedEntities["rent_step"] | undefined = undefined;
  if (mappedValues.escalation_phrase) {
    const escResult = parseEscalationPhrase(mappedValues.escalation_phrase);
    if (escResult.escalation_type && escResult.escalation_value) {
      const stepDate = new Date(startDate);
      stepDate.setFullYear(stepDate.getFullYear() + 1);
      rentStep = {
        step_no: 1,
        escalation_type: escResult.escalation_type,
        escalation_value: escResult.escalation_value,
        effective_date: stepDate.toISOString().split("T")[0],
      };
    }
  }

  const propName = String(mappedValues.property_name || options.defaultPropertyName || "Main Commercial Center").trim();
  const bldName = String(mappedValues.building_name || options.defaultBuildingName || "Tower 1").trim();
  const floorName = String(mappedValues.floor_name || "Level 1").trim();

  const contractCode = `${slugify(occupantName)}-${slugify(spaceCode)}`;

  const exploded: ExplodedEntities = {
    property: {
      property_name: propName,
      property_code: `PROP-${slugify(propName)}`.toUpperCase(),
      property_type: "office",
    },
    building: {
      building_name: bldName,
      building_code: `BLD-${slugify(bldName)}`.toUpperCase(),
    },
    space: {
      space_code: spaceCode,
      space_name: `Space ${spaceCode}`,
      floor_name: floorName,
      chargeable_area_sqft: areaSqft,
      occupancy_status: occStatus,
    },
    occupant: {
      occupant_name: occupantName,
      occupant_code: `OCC-${slugify(occupantName)}`.toUpperCase(),
      occupant_type: "company",
      occupant_status: "active",
    },
    contract: {
      contract_code: contractCode,
      contract_type: contractType,
      contract_status: "active",
      start_date: startDate,
      end_date: endDate,
      deposit_amount_inr: depositAmount,
      deposit_status: depositAmount > 0 ? "received" : "pending",
    },
    charge: {
      charge_code: "BASE_RENT",
      rate_amount: rentAmount,
      frequency: "monthly",
    },
    rent_step: rentStep,
    unmapped_columns: unmapped,
  };

  const parsedRow = {
    ...mappedValues,
    _normalized_space_code: spaceCode,
    _normalized_occupant_name: occupantName,
    _normalized_area: areaSqft,
    _normalized_rent: rentAmount,
    _normalized_start_date: startDate,
    _normalized_end_date: endDate,
  };

  return { exploded, parsedRow, unmapped };
}
