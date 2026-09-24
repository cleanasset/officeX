import React from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { db } from "@/db";
import { properties, complianceCertificates, helpdeskTickets, auditLogs } from "@/db/schema";
import { getRentRollDb } from "@/lib/rent-roll-store";
import PropertyDashboardClient from "./PropertyDashboardClient";

export const revalidate = 0; // Disable caching to fetch live data

export default async function PropertyDashboard() {
  let allProperties: any[] = [];
  let activeTickets: any[] = [];
  let certs: any[] = [];
  let logs: any[] = [];

  try {
    const client = supabaseAdmin || supabase;
    const { data: props, error } = await client
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && props && props.length > 0) {
      allProperties = props.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        address: p.address,
        city: p.city,
        state: p.state,
        microMarket: p.micro_market,
        pincode: p.pincode,
        grade: p.grade,
        totalArea: p.total_area,
        ownerName: p.owner_name,
        ownerCompany: p.owner_company,
        ownerUserId: p.owner_user_id,
        imageUrl: p.image_url,
        createdAt: p.created_at
      }));
    }
  } catch (err) {
    console.warn("Supabase fetch warning in properties page:", err);
  }

  // Fallback to db if supabase client returned nothing
  if (allProperties.length === 0) {
    try {
      allProperties = await db.select().from(properties);
    } catch (err) {}
  }

  // Always merge with rent-roll-store database as primary institutional source
  try {
    const rentRollDb = getRentRollDb();
    if (rentRollDb.properties && rentRollDb.properties.length > 0) {
      const existingIds = new Set(allProperties.map(p => p.id));
      const existingNames = new Set(allProperties.map(p => (p.name || "").toLowerCase().trim()));

      for (const p of rentRollDb.properties) {
        if (!existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase().trim())) {
          allProperties.push({
            id: p.id,
            name: p.name,
            type: p.type || "Commercial Office",
            address: p.address,
            city: p.city,
            state: p.state,
            microMarket: p.microMarket,
            pincode: p.pincode,
            grade: p.grade,
            totalArea: p.totalArea,
            ownerName: p.ownerName,
            ownerCompany: rentRollDb.organization.name || "OfficeX Asset Mgmt",
            ownerEmail: p.ownerEmail,
            ownerUserId: p.ownerUserId,
            imageUrl: p.imageUrl,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    if (rentRollDb.alerts && rentRollDb.alerts.length > 0) {
      certs = rentRollDb.alerts.map((a: any) => ({
        id: a.id,
        propertyId: a.propertyId || allProperties[0]?.id || "",
        name: a.title || "Statutory Compliance",
        status: a.severity === "high" ? "expired" : "valid",
        expiryDate: a.dueDate || new Date().toISOString()
      }));
    }

    if (rentRollDb.auditLogs && rentRollDb.auditLogs.length > 0) {
      logs = rentRollDb.auditLogs.map((l: any) => ({
        action: l.action,
        traceId: l.id,
        ipAddress: "127.0.0.1",
        module: l.entityType || "RentRoll",
        createdAt: l.timestamp
      }));
    }
  } catch (err) {
    console.warn("Rent roll store fetch warning:", err);
  }

  const SEED_PROP_NAMES = new Set([
    "fortune sky",
    "apex horizon tower",
    "signature tower b",
    "eka club",
    "business hub",
    "shivalik shilp",
    "apex business tower",
    "apex commercial tower",
    "meridian tech park",
    "nexus hub",
    "maker maxity",
    "godrej bkc horizon"
  ]);

  allProperties = allProperties.filter((p: any) => {
    const name = (p?.name || "").toLowerCase().trim();
    return !SEED_PROP_NAMES.has(name) && !name.includes("commercial portfolio");
  });

  return (
    <PropertyDashboardClient
      initialProperties={allProperties}
      initialTickets={activeTickets}
      initialCerts={certs}
      initialLogs={logs}
    />
  );
}
