/**
 * Counterparty Identity Isolation Guard (Landlord/Owner/SPV vs Tenant)
 * Ensures owner/SPV and tenant never share email, mobile phone, PAN, or GSTIN.
 */

export function normalizePhoneLast10(phone?: string | null): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

export function normalizeTaxId(id?: string | null): string {
  return (id || "").trim().toUpperCase();
}

export interface OwnerIdentitySnapshot {
  emails?: Array<string | null | undefined>;
  phones?: Array<string | null | undefined>;
  pans?: Array<string | null | undefined>;
  gstins?: Array<string | null | undefined>;
}

export interface TenantIdentityCandidate {
  email?: string | null;
  phone?: string | null;
  altPhone?: string | null;
  pan?: string | null;
  gstin?: string | null;
}

export interface IdentityConflictResult {
  hasConflict: boolean;
  field?: "email" | "phone" | "pan" | "gstin";
  message?: string;
}

export function checkOwnerTenantIdentityOverlap(
  owner: OwnerIdentitySnapshot,
  tenant: TenantIdentityCandidate
): IdentityConflictResult {
  const ownerEmails = new Set((owner.emails || []).map(normalizeEmail).filter(Boolean));
  const ownerPhones = new Set(
    (owner.phones || []).map(normalizePhoneLast10).filter((p) => p.length >= 7)
  );
  const ownerPans = new Set((owner.pans || []).map(normalizeTaxId).filter(Boolean));
  const ownerGstins = new Set((owner.gstins || []).map(normalizeTaxId).filter(Boolean));

  const tEmail = normalizeEmail(tenant.email);
  if (tEmail && ownerEmails.has(tEmail)) {
    return {
      hasConflict: true,
      field: "email",
      message: `Identity Overlap Blocked: Tenant email (${tenant.email?.trim()}) cannot match the property owner / landlord account email.`,
    };
  }

  const tPhone = normalizePhoneLast10(tenant.phone);
  if (tPhone && tPhone.length >= 7 && ownerPhones.has(tPhone)) {
    return {
      hasConflict: true,
      field: "phone",
      message: `Identity Overlap Blocked: Tenant phone (${tenant.phone?.trim()}) cannot match the property owner / SPV contact number.`,
    };
  }

  const tAltPhone = normalizePhoneLast10(tenant.altPhone);
  if (tAltPhone && tAltPhone.length >= 7 && ownerPhones.has(tAltPhone)) {
    return {
      hasConflict: true,
      field: "phone",
      message: `Identity Overlap Blocked: Tenant secondary contact phone (${tenant.altPhone?.trim()}) cannot match the property owner / SPV contact number.`,
    };
  }

  const tPan = normalizeTaxId(tenant.pan);
  if (tPan && ownerPans.has(tPan)) {
    return {
      hasConflict: true,
      field: "pan",
      message: `Self-Leasing Blocked: Tenant PAN (${tPan}) matches the property owner / SPV PAN.`,
    };
  }

  const tGstin = normalizeTaxId(tenant.gstin);
  if (tGstin && ownerGstins.has(tGstin)) {
    return {
      hasConflict: true,
      field: "gstin",
      message: `Self-Leasing Blocked: Tenant GSTIN (${tGstin}) matches the property owner / billing entity GSTIN.`,
    };
  }

  return { hasConflict: false };
}
