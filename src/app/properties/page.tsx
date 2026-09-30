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

  // Scope properties: First try matching userEmail/owner, then fallback to recent properties
  try {
    const client = supabaseAdmin || supabase;
    let query = client.from('properties').select('*').order('created_at', { ascending: false });
    
    if (userEmail) {
      const { data: userProps } = await client
        .from('properties')
        .select('*')
        .or(`owner_user_id.eq.${userEmail},owner_company.ilike.%${userEmail}%`)
        .order('created_at', { ascending: false });
      if (userProps && userProps.length > 0) {
        allProperties = userProps.map(formatSupabaseProp);
      }
    }
  } catch (err) {
    console.warn("Supabase fetch warning in properties page:", err);
  }

  // Also check rent-roll-store for registered properties
  try {
    const rentRollDb = getRentRollDb();
    if (rentRollDb.properties && rentRollDb.properties.length > 0) {
      const existingNames = new Set(allProperties.map(p => (p.name || "").toLowerCase().trim()));
      for (const p of rentRollDb.properties) {
        const cleanName = (p.name || "").toLowerCase().trim();
        if (!existingNames.has(cleanName)) {
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
          existingNames.add(cleanName);
        }
      }
    }
  } catch (err) {
    console.warn("Rent roll store fetch warning:", err);
  }

  // Helper formatter for Supabase property records
  function formatSupabaseProp(p: any) {
    return {
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
    };
  }

  // Only filter out null or corrupt property entries
  allProperties = allProperties.filter((p: any) => Boolean(p && (p.id || p.name)));

  return (
    <PropertyDashboardClient
      initialProperties={allProperties}
      initialTickets={activeTickets}
      initialCerts={certs}
      initialLogs={logs}
    />
  );
}
