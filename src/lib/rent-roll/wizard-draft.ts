"use client";

import { useEffect } from "react";

export type HierarchyTab = "property" | "building" | "space" | "tenant" | "contract" | "delegation";

export interface WizardDraftData {
  isOpen: boolean;
  activeTab: HierarchyTab;
  initialTab?: HierarchyTab;
  preloadSpaceId?: string;
  initialPropertyId?: string;
  lastSavedPropId?: string;
  lastSavedPropName?: string;
  lastSavedOccupantName?: string;

  // Step 1: Property Form & Breakdowns
  propForm?: Record<string, any>;
  floorBreakdown?: Array<{ floorNumber: number; spaceName: string; areaSqft: string }>;
  towersBreakdown?: Array<{ id: string; name: string; floorsCount: string; areaSqft: string }>;

  // Step 2: Space / Building
  bldgForm?: Record<string, any>;
  spaceForm?: Record<string, any>;
  activeStudioFloor?: string;
  selectedTenantSuites?: string[];
  selectedTenantFloor?: string;
  selectedContractFloor?: string;
  selectedTenantBuilding?: string;

  // Step 3: Tenant
  tenantOnboardingMode?: "existing" | "new";
  tenantForm?: Record<string, any>;

  // Step 4: Contract
  contractForm?: Record<string, any>;

  // Step 5: Delegation
  delegationForm?: Record<string, any>;

  updatedAt: number;
}

export const WIZARD_DRAFT_KEY = "officex_hierarchy_wizard_draft";
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getWizardDraft(): WizardDraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const parsed: WizardDraftData = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Check expiration
    if (parsed.updatedAt && Date.now() - parsed.updatedAt > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(WIZARD_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveWizardDraft(updates: Partial<WizardDraftData>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getWizardDraft() || {
      isOpen: true,
      activeTab: "property",
      updatedAt: Date.now(),
    };
    const merged: WizardDraftData = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("officex-wizard-draft-change", { detail: merged }));
  } catch {
    // Non-blocking quota error fallback
  }
}

export function setWizardDraftOpen(isOpen: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getWizardDraft();
    if (existing) {
      existing.isOpen = isOpen;
      existing.updatedAt = Date.now();
      localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(existing));
    }
  } catch {}
}

export function clearWizardDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WIZARD_DRAFT_KEY);
    window.dispatchEvent(new CustomEvent("officex-wizard-draft-cleared"));
  } catch {}
}

export function hasActiveWizardDraft(): boolean {
  const draft = getWizardDraft();
  if (!draft) return false;
  const hasProp = Boolean(draft.propForm?.propertyName?.trim());
  const hasTenant = Boolean(draft.tenantForm?.companyName?.trim() || draft.tenantForm?.occupantName?.trim());
  const isPastStep1 = draft.activeTab !== "property";
  return hasProp || hasTenant || isPastStep1;
}

/**
 * Hook for parent pages hosting PropertyHierarchyModal to auto-reopen
 * the modal if the user refreshed the browser while on step 2, 3, etc.
 */
export function useWizardDraftResume(
  setIsOpen: (open: boolean) => void,
  setTab?: (tab: HierarchyTab) => void,
  setPreloadSpaceId?: (id: string | undefined) => void
) {
  useEffect(() => {
    const draft = getWizardDraft();
    if (draft && draft.isOpen) {
      if (setTab && draft.activeTab) setTab(draft.activeTab);
      if (setPreloadSpaceId && draft.preloadSpaceId) setPreloadSpaceId(draft.preloadSpaceId);
      setIsOpen(true);
    }
  }, [setIsOpen, setTab, setPreloadSpaceId]);
}
