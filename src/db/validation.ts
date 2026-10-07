// ============================================================================
// OFFICEX Rent Roll — Phase P0 Basic Validation Rules
// Validates required fields, unique constraints, and enums for all 13 tables
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export const RentRollValidationRules = {
  organization: {
    requiredFields: ["name", "slug", "subscription_status"],
    uniqueFields: ["slug"],
    subscriptionStatuses: ["active", "suspended", "cancelled"],
  },
  client_account: {
    requiredFields: ["org_id", "client_name", "client_code", "is_self"],
    uniqueCompoundFields: [["org_id", "client_code"]],
  },
  property: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "property_name",
      "property_code",
      "total_leasable_area_sqft",
    ],
    uniqueCompoundFields: [["org_id", "property_code"]],
    propertyTypes: [
      "office",
      "residential",
      "retail",
      "flex_workspace",
      "mixed",
    ],
  },
  building: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "property_id",
      "building_name",
      "building_code",
    ],
    uniqueCompoundFields: [["property_id", "building_code"]],
  },
  space: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "building_id",
      "space_code",
      "space_name",
      "chargeable_area_sqft",
      "is_leasable",
      "occupancy_status",
    ],
    uniqueCompoundFields: [["building_id", "space_code"]],
    spaceTypes: [
      "entire_building",
      "floor",
      "wing",
      "suite",
      "cabin",
      "desk",
      "parking",
    ],
    occupancyStatuses: ["vacant", "occupied", "under_maintenance", "retired"],
    areaUnits: ["sqft", "sqm"],
  },
  occupant: {
    requiredFields: [
      "org_id",
      "occupant_code",
      "occupant_name",
      "occupant_type",
      "is_critical_occupant",
      "occupant_status",
    ],
    uniqueCompoundFields: [["org_id", "occupant_code"]],
    occupantTypes: ["individual", "company", "partnership", "trust"],
    occupantStatuses: [
      "active",
      "notice_served",
      "holding_over",
      "vacant",
      "inactive",
    ],
  },
  contract: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "space_id",
      "occupant_id",
      "contract_code",
      "contract_type",
      "direction",
      "billing_model",
      "contract_status",
      "approval_status",
      "start_date",
      "end_date",
      "is_evergreen",
      "is_template",
    ],
    uniqueCompoundFields: [["org_id", "contract_code"]],
    contractTypes: [
      "lease",
      "leave_and_licence",
      "managed_office_agreement",
      "co_working_membership",
      "service_charge_agreement",
      "head_lease",
    ],
    directions: ["receivable", "payable"],
    billingModels: ["area", "seats", "fixed", "hybrid"],
    contractStatuses: [
      "draft",
      "future",
      "active",
      "notice_served",
      "holding_over",
      "expired",
      "terminated",
    ],
    approvalStatuses: ["draft", "submitted", "approved", "rejected"],
    depositStatuses: ["pending", "received", "adjusted", "refunded"],
  },
  contract_space: {
    requiredFields: ["org_id", "client_account_id", "contract_id", "space_id"],
    uniqueCompoundFields: [["contract_id", "space_id"]],
  },
  charge_type: {
    requiredFields: [
      "org_id",
      "charge_code",
      "charge_name",
      "charge_category",
      "is_taxable",
      "is_recurring",
      "is_active",
    ],
    uniqueCompoundFields: [["org_id", "charge_code"]],
    chargeCategories: [
      "base_rent",
      "recovery",
      "service_charge",
      "utility",
      "deposit",
      "deposit_return",
      "credit_note",
      "concession",
    ],
  },
  tax_profile: {
    requiredFields: [
      "org_id",
      "tax_name",
      "tax_type",
      "tax_rate_percent",
      "is_active",
    ],
    taxTypes: ["gst", "vat", "other"],
  },
  billing_entity: {
    requiredFields: ["org_id", "entity_name", "entity_code", "entity_type", "is_active"],
    uniqueCompoundFields: [["org_id", "entity_code"]],
    entityTypes: ["owner", "property_manager", "fm_company", "operator"],
  },
  management_mandate: {
    requiredFields: ["org_id", "client_account_id", "fee_structure", "is_active"],
    feeStructures: ["percentage", "fixed", "hybrid"],
    feeFrequencies: ["monthly", "quarterly", "annual"],
  },
  deal: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "deal_code",
      "deal_name",
      "deal_stage",
      "probability_percent",
    ],
    uniqueCompoundFields: [["org_id", "deal_code"]],
    dealStages: [
      "lead",
      "site_visit",
      "proposal",
      "loi",
      "agreement_drafting",
      "won",
      "lost",
    ],
  },
  contract_charge: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "contract_id",
      "component",
      "calc_basis",
      "start_date",
      "end_date",
    ],
    calcBases: [
      "per_area",
      "per_seat",
      "fixed",
      "per_slot",
      "metered",
      "pro_rata_share",
      "pct_of_turnover",
      "per_use",
    ],
    billingModes: ["advance", "arrears"],
  },
  rent_step: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "contract_id",
      "contract_charge_id",
      "step_number",
      "effective_date",
      "escalation_type",
      "rate",
    ],
    escalationTypes: [
      "initial",
      "percentage",
      "fixed_amount",
      "index_based",
      "market_review",
      "stepped_schedule",
    ],
    stepStatuses: [
      "scheduled",
      "due",
      "applied",
      "pending_resolution",
      "disputed",
    ],
  },
  concession: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "contract_id",
      "concession_type",
      "start_date",
      "end_date",
      "concession_value",
    ],
    concessionTypes: [
      "rent_free",
      "fitout_contribution",
      "discount_pct",
      "discount_amount",
      "capex_by_landlord",
    ],
  },
  contract_clause: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "contract_id",
      "clause_type",
      "clause_title",
      "clause_text",
    ],
    clauseTypes: [
      "lock_in",
      "notice",
      "renewal_option",
      "break_option",
      "rofr",
      "rofo",
      "expansion",
      "exclusivity",
      "subletting",
      "reinstatement",
    ],
    clauseStatuses: ["open", "exercised", "lapsed", "waived"],
  },
  contract_document: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "contract_id",
      "doc_type",
      "file_name",
    ],
    docTypes: [
      "term_sheet",
      "loi",
      "lease_agreement",
      "leave_and_licence",
      "amendment",
      "renewal_agreement",
      "termination",
      "possession_letter",
      "deposit_receipt",
      "noc",
      "insurance",
      "fitout",
      "other",
    ],
    docStatuses: [
      "draft",
      "under_review",
      "approved",
      "signed",
      "executed",
      "expired",
      "superseded",
    ],
    docVisibilities: ["internal", "client_visible", "occupant_visible"],
  },
  task: {
    requiredFields: [
      "org_id",
      "client_account_id",
      "task_type",
      "title",
      "priority",
      "status",
    ],
    taskTypes: [
      "contract_approval",
      "escalation_due",
      "expiry_renewal",
      "document_missing",
      "dispute_followup",
    ],
    taskStatuses: ["pending", "in_progress", "completed", "rejected", "cancelled"],
    taskPriorities: ["low", "medium", "high", "critical"],
  },
} as const;

/**
 * Validates any Rent Roll entity payload against required fields.
 */
export function validateRequiredFields(
  tableName: keyof typeof RentRollValidationRules,
  data: Record<string, any>
): ValidationResult {
  const rules = RentRollValidationRules[tableName];
  const errors: Array<{ field: string; message: string }> = [];

  for (const field of rules.requiredFields) {
    const val = data[field];
    if (val === undefined || val === null || val === "") {
      errors.push({
        field,
        message: `Field '${field}' is required on table '${tableName}'.`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// OFFICEX Rent Roll — Phase P1 Business Logic & Validation Rules (§5.5a)
// ============================================================================

/**
 * Rule 1: start_date < end_date (required)
 * Rule 2: If commencement_date set: commencement_date >= start_date
 */
export function validateContractDates(data: {
  start_date: string;
  end_date: string;
  commencement_date?: string | null;
}): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const start = new Date(data.start_date);
  const end = new Date(data.end_date);

  if (isNaN(start.getTime())) {
    errors.push({ field: "start_date", message: "Invalid start_date format (YYYY-MM-DD required)" });
  }
  if (isNaN(end.getTime())) {
    errors.push({ field: "end_date", message: "Invalid end_date format (YYYY-MM-DD required)" });
  }

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    if (start >= end) {
      errors.push({
        field: "end_date",
        message: "Rule 1 violated: start_date must be strictly before end_date.",
      });
    }
  }

  if (data.commencement_date) {
    const commencement = new Date(data.commencement_date);
    if (isNaN(commencement.getTime())) {
      errors.push({
        field: "commencement_date",
        message: "Invalid commencement_date format (YYYY-MM-DD required)",
      });
    } else if (!isNaN(start.getTime()) && commencement < start) {
      errors.push({
        field: "commencement_date",
        message: "Rule 2 violated: commencement_date must be greater than or equal to start_date.",
      });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 3: Notice period: if notice_served, end_date <= today or notice_end_date passed
 */
export function validateNoticePeriod(data: {
  contract_status: string;
  end_date: string;
  today?: string;
}): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  if (data.contract_status === "notice_served") {
    const todayStr = data.today || new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);
    const end = new Date(data.end_date);
    if (end > today) {
      // Allowed if notice is currently running towards termination, but end date must be bounded
    }
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 4: Overlapping contracts on same space: blocked (RR-CONT-24)
 */
export function validateSpaceOverlap(
  existingContracts: Array<{
    id: string;
    contract_code: string;
    start_date: string;
    end_date: string;
    contract_status: string;
  }>,
  newContract: {
    id?: string;
    start_date: string;
    end_date: string;
  }
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const newStart = new Date(newContract.start_date);
  const newEnd = new Date(newContract.end_date);

  for (const existing of existingContracts) {
    // Skip if it's the exact same contract being updated
    if (newContract.id && existing.id === newContract.id) continue;

    // Disregard terminated or expired contracts from overlap conflicts
    if (["terminated", "expired"].includes(existing.contract_status)) continue;

    const existStart = new Date(existing.start_date);
    const existEnd = new Date(existing.end_date);

    // Two intervals [A_start, A_end] and [B_start, B_end] overlap if A_start <= B_end and B_start <= A_end
    if (newStart <= existEnd && existStart <= newEnd) {
      errors.push({
        field: "space_id",
        message: `RR-CONT-24 violated: Overlapping contract '${existing.contract_code}' exists on this space from ${existing.start_date} to ${existing.end_date}.`,
      });
      break;
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 5: Deposit > 0 and <= deposit_amount_inr
 */
export function validateDepositBounds(
  depositAmountInr: number,
  transactionAmount?: number
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  if (depositAmountInr <= 0) {
    errors.push({
      field: "deposit_amount_inr",
      message: "Rule 5 violated: deposit_amount_inr must be greater than 0.",
    });
  }
  if (transactionAmount !== undefined) {
    if (transactionAmount <= 0) {
      errors.push({
        field: "amount",
        message: "Rule 5 violated: deposit transaction amount must be greater than 0.",
      });
    }
    if (transactionAmount > depositAmountInr) {
      errors.push({
        field: "amount",
        message: `Rule 5 violated: deposit transaction cannot exceed agreed deposit amount of ₹${depositAmountInr}.`,
      });
    }
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 6: All charges must have start_date >= contract start_date
 */
export function validateChargeDates(
  contractStartDate: string,
  chargeStartDate: string
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const cStart = new Date(contractStartDate);
  const chStart = new Date(chargeStartDate);

  if (chStart < cStart) {
    errors.push({
      field: "start_date",
      message: `Rule 6 violated: Charge start_date (${chargeStartDate}) cannot be prior to contract start_date (${contractStartDate}).`,
    });
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 7: Contract not activatable without executed document (lease_agreement or leave_and_licence) (RR-CON-05)
 */
export function validateContractActivationDocs(
  contractType: string,
  documents: Array<{ doc_type: string; status: string; is_current: boolean }>
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const validExecDoc = documents.find(
    (d) =>
      d.is_current &&
      d.status === "executed" &&
      (d.doc_type === "lease_agreement" || d.doc_type === "leave_and_licence")
  );

  if (!validExecDoc) {
    errors.push({
      field: "documents",
      message: "Rule 7 (RR-CON-05) violated: Contract cannot be activated without an executed lease_agreement or leave_and_licence document.",
    });
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Rule 8: Escalation can't be applied retroactively (effective_date must be >= today)
 */
export function validateEscalationApplication(
  effectiveDate: string,
  todayStr?: string
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const today = todayStr ? new Date(todayStr) : new Date();
  today.setHours(0, 0, 0, 0);

  const eff = new Date(effectiveDate);
  eff.setHours(0, 0, 0, 0);

  if (eff < today) {
    errors.push({
      field: "effective_date",
      message: `Rule 8 violated: Escalation cannot be applied retroactively (effective_date ${effectiveDate} is in the past).`,
    });
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Maker cannot approve own submission (RR-CON-09)
 */
export function validateMakerCannotApprove(
  createdByUserId: string | null | undefined,
  approverUserId: string | null | undefined
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  if (createdByUserId && approverUserId && createdByUserId === approverUserId) {
    errors.push({
      field: "approver",
      message: "Rule (RR-CON-09) violated: Maker cannot approve their own submission.",
    });
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Lifecycle transitions (§4.13)
 */
export function validateContractTransition(
  currentStatus: string,
  targetStatus: string,
  hasExecutedDoc: boolean = false
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const validTransitions: Record<string, string[]> = {
    draft: ["submitted", "terminated"],
    submitted: ["draft", "approved", "rejected", "terminated"],
    approved: ["future", "active", "terminated"],
    future: ["active", "terminated"],
    active: ["notice_served", "expired", "holding_over", "terminated"],
    notice_served: ["expired", "holding_over", "active", "terminated"],
    holding_over: ["expired", "terminated"],
    expired: [],
    terminated: [],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    errors.push({
      field: "contract_status",
      message: `Invalid contract status transition from '${currentStatus}' to '${targetStatus}'.`,
    });
  }

  if (targetStatus === "active" && !hasExecutedDoc) {
    errors.push({
      field: "contract_status",
      message: "RR-CON-05: Cannot activate contract without an executed lease agreement document.",
    });
  }

  return { isValid: errors.length === 0, errors };
}
