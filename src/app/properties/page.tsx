import React from "react";
import { db } from "@/db";
import { properties, complianceCertificates, helpdeskTickets, auditLogs } from "@/db/schema";
import PropertyDashboardClient from "./PropertyDashboardClient";

export const revalidate = 0; // Disable caching to fetch live data

export default async function PropertyDashboard() {
  let allProperties: any[] = [];
  let activeTickets: any[] = [];
  let certs: any[] = [];
  let logs: any[] = [];

  try {
    allProperties = await db.select().from(properties);
    activeTickets = await db.select().from(helpdeskTickets);
    certs = await db.select().from(complianceCertificates);
    logs = await db.select().from(auditLogs);
  } catch (err) {
    console.warn("Database fetch warning, falling back to local dataset:", err);
  }

  return (
    <PropertyDashboardClient
      initialProperties={allProperties}
      initialTickets={activeTickets}
      initialCerts={certs}
      initialLogs={logs}
    />
  );
}
