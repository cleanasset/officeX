import { NextRequest, NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

export async function GET(request: NextRequest) {
  try {
    const pool = getAdminPool();

    // 1. Fetch all users from public.users with their role
    const usersRes = await pool.query(`
      SELECT id, email, full_name as "fullName", role, created_at as "createdAt"
      FROM public.users
      ORDER BY 
        CASE 
          WHEN email = 'medistationlifecare@gmail.com' THEN 1
          WHEN email = 'admin@gmail.com' THEN 2
          ELSE 3
        END,
        created_at DESC;
    `);

    // 2. Fetch all organizations with their property counts
    const orgsRes = await pool.query(`
      SELECT 
        o.id, 
        o.name, 
        o.slug, 
        o.subscription_status as "subscriptionStatus", 
        o.created_at as "createdAt",
        COUNT(p.id)::int as "propertyCount"
      FROM public.organizations o
      LEFT JOIN public.property p ON p.org_id = o.id
      GROUP BY o.id, o.name, o.slug, o.subscription_status, o.created_at
      ORDER BY 
        CASE WHEN o.name ILIKE '%medistationlifecare%' THEN 1 ELSE 2 END,
        o.created_at DESC;
    `);

    // 3. Fetch all properties with their assigned organization
    const propsRes = await pool.query(`
      SELECT 
        p.id,
        p.property_name as "propertyName",
        p.property_code as "propertyCode",
        p.city,
        p.state,
        p.total_leasable_area_sqft as "areaSqft",
        p.org_id as "orgId",
        o.name as "orgName"
      FROM public.property p
      LEFT JOIN public.organizations o ON p.org_id = o.id
      ORDER BY 
        CASE WHEN p.property_name ILIKE '%SYNERGY TOWER%' THEN 1 ELSE 2 END,
        p.created_at DESC;
    `);

    // 4. Primary account snapshot for medistationlifecare@gmail.com
    const primaryAccount = {
      email: "medistationlifecare@gmail.com",
      displayName: "Medistn tech",
      role: "super_admin",
      roleLabel: "Super Admin & Sovereign Platform Owner",
      organization: "medistationlifecare's Commercial Entity",
      directProperty: {
        name: "SYNERGY TOWER",
        code: "SYT",
        city: "Noida",
        type: "Commercial Office Building"
      },
      managedMarketplaces: [
        {
          id: "office-marketplace",
          name: "Office Marketplace",
          type: "Workspaces, Desks & Private Suites",
          totalListings: 6767,
          cities: ["Delhi", "Gurgaon", "Noida", "Bengaluru", "Mumbai", "Hyderabad", "Pune"],
          status: "Active & Monitored"
        },
        {
          id: "fm-marketplace",
          name: "FM Marketplace (Procurement Gateway)",
          type: "Housekeeping, HVAC, Electrical, Security & MEP",
          commissionRate: "5.0%",
          emergencyCalloutFee: 999,
          status: "Active"
        }
      ],
      managedSaasModules: [
        { name: "Rent Roll & Commercial Leases", status: "Active (Canonical 39-point lease schedule)" },
        { name: "Automated Invoicing & Collections", status: "Active (Monthly batch billing)" },
        { name: "CAM Pooling & True-Up Calculator", status: "Active (Automated true-up ledger)" },
        { name: "Smart Submetering & Utility Splitter", status: "Active (Electricity, Water, BTU)" },
        { name: "CAFM & PPM Work Orders", status: "Active (Preventive maintenance)" },
        { name: "Visitor & Access Compliance (VC)", status: "Active (Digital pass clearance)" }
      ]
    };

    return NextResponse.json({
      success: true,
      primaryAccount,
      users: usersRes.rows,
      organizations: orgsRes.rows,
      properties: propsRes.rows,
      totalUsers: usersRes.rows.length,
      totalOrganizations: orgsRes.rows.length,
      totalProperties: propsRes.rows.length
    });
  } catch (err: any) {
    console.error("Admin users GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users and asset mappings", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = getAdminPool();
    const body = await request.json();
    const { orgId, subscriptionStatus, userId, userRole } = body;

    if (orgId && subscriptionStatus) {
      await pool.query(
        `UPDATE public.organizations SET subscription_status = $1, updated_at = NOW() WHERE id = $2`,
        [subscriptionStatus, orgId]
      );
    }

    if (userId && userRole) {
      await pool.query(
        `UPDATE public.users SET role = $1, updated_at = NOW() WHERE id = $2`,
        [userRole, userId]
      );
    }

    return NextResponse.json({ success: true, message: "Updated successfully" });
  } catch (err: any) {
    console.error("Admin users PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update user or organization", details: err.message },
      { status: 500 }
    );
  }
}
