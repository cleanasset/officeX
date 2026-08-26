import React from "react";
import { db } from "@/db";
import { properties, complianceCertificates, helpdeskTickets, auditLogs } from "@/db/schema";
import PropertyDashboardClient from "./PropertyDashboardClient";

export const revalidate = 0; // Disable caching to fetch live data

export default async function PropertyDashboard() {
  // 1. Fetch live data from Supabase PostgreSQL via Drizzle
  const allProperties = await db.select().from(properties);
  const activeTickets = await db.select().from(helpdeskTickets);
  const certs = await db.select().from(complianceCertificates);
  const logs = await db.select().from(auditLogs);

  return (
    <PropertyDashboardClient
      initialProperties={allProperties}
      initialTickets={activeTickets}
      initialCerts={certs}
      initialLogs={logs}
    />
  );
}
