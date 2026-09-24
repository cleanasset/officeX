import React from "react";
import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { getRentRollDb } from "@/lib/rent-roll-store";
import PropertyDashboardClient from "./PropertyDashboardClient";

export const revalidate = 0; // Disable caching to fetch live data

export default async function PropertyDashboard() {
  const cookieStore = await cookies();
  const userEmail = (cookieStore.get("officex_user_email")?.value || "").toLowerCase().trim();

  let allProperties: any[] = [];
  let activeTickets: any[] = [];
  let certs: any[] = [];
  let logs: any[] = [];

  // Strictly scope properties by the authenticated user's email
  if (userEmail) {
    try {
      const client = supabaseAdmin || supabase;
      // Fetch only properties matching the authenticated user's email or user id
      const { data: props, error } = await client
        .from('properties')
        .select('*')
        .or(`owner_user_id.eq.${userEmail},owner_company.ilike.%${userEmail}%`)
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

    // Also check rent-roll-store for user's owned properties
    try {
      const rentRollDb = getRentRollDb();
      if (rentRollDb.properties && rentRollDb.properties.length > 0) {
        const userDbProps = rentRollDb.properties.filter(p => 
          (p.ownerEmail && p.ownerEmail.toLowerCase().trim() === userEmail) ||
          (p.ownerUserId && p.ownerUserId === userEmail)
        );
        const existingIds = new Set(allProperties.map(p => p.id));
        for (const p of userDbProps) {
          if (!existingIds.has(p.id)) {
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
    } catch (err) {
      console.warn("Rent roll store fetch warning:", err);
    }
  }

  // Filter out any known legacy seed/mock test property names if ever present
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
