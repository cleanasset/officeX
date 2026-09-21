import React from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
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

  return (
    <PropertyDashboardClient
      initialProperties={allProperties}
      initialTickets={activeTickets}
      initialCerts={certs}
      initialLogs={logs}
    />
  );
}
