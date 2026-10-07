/**
 * OFFICEX Rent Roll — Import Diff Engine (§4.15, RR-IMP-07)
 * Compares staged rows against production database to compute new vs updated entities.
 */

import { db } from "@/db";
import { space, occupant, contract } from "@/db/rent-roll-schema";
import { eq, and, isNull } from "drizzle-orm";
import { ExplodedEntities } from "./explode";

export interface DiffRowItem {
  source_row_num: number;
  space_code: string;
  space_action: "new" | "update" | "unchanged";
  occupant_name: string;
  occupant_action: "new" | "update" | "unchanged";
  contract_code: string;
  contract_action: "new" | "update" | "unchanged";
  monthly_rent: number;
  area_sqft: number;
}

export interface DiffSummary {
  new_spaces: number;
  updated_spaces: number;
  new_occupants: number;
  updated_occupants: number;
  new_contracts: number;
  updated_contracts: number;
  unchanged_records: number;
  deleted_records: number;
  rows: DiffRowItem[];
}

export async function calculateImportDiff(
  orgId: string,
  clientAccountId: string | null | undefined,
  stagedEntities: { source_row_num: number; entities: ExplodedEntities }[]
): Promise<DiffSummary> {
  // 1. Fetch existing production identifiers
  const existingSpaces = await db
    .select({ space_code: space.space_code, id: space.id })
    .from(space)
    .where(and(eq(space.org_id, orgId), isNull(space.deleted_at)));

  const existingOccupants = await db
    .select({ occupant_name: occupant.occupant_name, id: occupant.id })
    .from(occupant)
    .where(and(eq(occupant.org_id, orgId), isNull(occupant.deleted_at)));

  const existingContracts = await db
    .select({ contract_code: contract.contract_code, id: contract.id })
    .from(contract)
    .where(and(eq(contract.org_id, orgId), isNull(contract.deleted_at)));

  const spaceSet = new Set(existingSpaces.map((s) => s.space_code.toLowerCase().trim()));
  const occSet = new Set(existingOccupants.map((o) => o.occupant_name.toLowerCase().trim()));
  const contractSet = new Set(existingContracts.map((c) => c.contract_code.toLowerCase().trim()));

  let newSpaces = 0;
  let updatedSpaces = 0;
  let newOccs = 0;
  let updatedOccs = 0;
  let newContracts = 0;
  let updatedContracts = 0;

  const diffRows: DiffRowItem[] = [];

  for (const item of stagedEntities) {
    const { source_row_num, entities } = item;
    const sCode = entities.space.space_code.toLowerCase().trim();
    const oName = entities.occupant.occupant_name.toLowerCase().trim();
    const cCode = entities.contract.contract_code.toLowerCase().trim();

    const spaceAction = spaceSet.has(sCode) ? "update" : "new";
    if (spaceAction === "new") newSpaces++;
    else updatedSpaces++;

    const occAction = occSet.has(oName) ? "update" : "new";
    if (occAction === "new") newOccs++;
    else updatedOccs++;

    const contractAction = contractSet.has(cCode) ? "update" : "new";
    if (contractAction === "new") newContracts++;
    else updatedContracts++;

    diffRows.push({
      source_row_num,
      space_code: entities.space.space_code,
      space_action: spaceAction,
      occupant_name: entities.occupant.occupant_name,
      occupant_action: occAction,
      contract_code: entities.contract.contract_code,
      contract_action: contractAction,
      monthly_rent: entities.charge.rate_amount,
      area_sqft: entities.space.chargeable_area_sqft,
    });
  }

  return {
    new_spaces: newSpaces,
    updated_spaces: updatedSpaces,
    new_occupants: newOccs,
    updated_occupants: updatedOccs,
    new_contracts: newContracts,
    updated_contracts: updatedContracts,
    unchanged_records: 0,
    deleted_records: 0,
    rows: diffRows,
  };
}
