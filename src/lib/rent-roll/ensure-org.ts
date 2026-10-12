import { db } from "@/db";
import { organization, client_account } from "@/db/rent-roll-schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

export function getDeterministicOrgId(email: string): string {
  const clean = email.trim().toLowerCase();
  const hash = createHash("sha256").update(`officex-org:${clean}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function getDeterministicClientAccountId(email: string): string {
  const clean = email.trim().toLowerCase();
  const hash = createHash("sha256").update(`officex-client:${clean}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Ensures that an organization and primary client_account exist in PostgreSQL
 * for the given orgId and clientAccountId.
 */
export async function ensureTenantOrgRecord(
  orgId: string,
  clientAccountId?: string | null,
  userEmail?: string | null
): Promise<{ orgId: string; clientAccountId: string }> {
  const finalClientAccountId = clientAccountId || getDeterministicClientAccountId(userEmail || orgId);

  try {
    const existingOrg = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.id, orgId))
      .limit(1);

    if (existingOrg.length === 0) {
      const emailPrefix = userEmail ? userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") : "portfolio";
      const orgName = userEmail ? `${userEmail.split("@")[0]}'s Commercial Entity` : "Commercial Property Workspace";
      const orgSlug = `${emailPrefix || "org"}-${orgId.slice(0, 8)}`;

      await db
        .insert(organization)
        .values({
          id: orgId,
          name: orgName,
          slug: orgSlug,
          subscription_status: "active",
        })
        .onConflictDoNothing();
    }

    const existingClient = await db
      .select({ id: client_account.id })
      .from(client_account)
      .where(eq(client_account.id, finalClientAccountId))
      .limit(1);

    if (existingClient.length === 0) {
      await db
        .insert(client_account)
        .values({
          id: finalClientAccountId,
          org_id: orgId,
          client_name: "Primary Commercial Portfolio",
          client_code: `CLI-${orgId.slice(0, 6).toUpperCase()}`,
          is_self: true,
        })
        .onConflictDoNothing();
    }
  } catch (err: any) {
    // If concurrent insert occurred or constraint already satisfied, ignore
    console.warn("ensureTenantOrgRecord notice:", err?.message || err);
  }

  return { orgId, clientAccountId: finalClientAccountId };
}
