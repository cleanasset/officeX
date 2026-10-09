import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const rolesList = [
      { code: "org_admin", name: "Organisation Admin", scope: "global", description: "Full ERP configuration, billing entities, users and global controls" },
      { code: "owner_principal", name: "Owner / Client Principal", scope: "client_assigned", description: "Portfolio approvals, owner statements, MIS investor packs" },
      { code: "asset_manager", name: "Asset Manager", scope: "portfolio", description: "Checker for leases, financial revisions, credit notes, and budget true-ups" },
      { code: "property_manager", name: "Property Manager", scope: "property_assigned", description: "Maker for lease amendments, move-in/exit inspections, meters" },
      { code: "leasing_broker", name: "Leasing Manager / Broker", scope: "property_assigned", description: "Space demising, pipeline CRM, LOI generator, deal terms" },
      { code: "finance_maker", name: "Finance Maker", scope: "portfolio", description: "Billing runs creation, offline receipt entries, credit notes drafting" },
      { code: "finance_checker", name: "Finance Checker", scope: "portfolio", description: "Approval & issuance of invoices, bank reconciliations, tax returns" },
      { code: "facility_manager", name: "Facility Operations Lead", scope: "property_assigned", description: "Sub-meter logs, DG power readings, PPM upkeep records" },
      { code: "auditor", name: "Statutory & RERA Auditor", scope: "read_only", description: "Read-only access to rent roll, GST invoices, audit trail timelines" },
      { code: "tenant_admin", name: "Occupant Tenant Admin", scope: "occupant_assigned", description: "Tenant self-service portal, Razorpay checkout, TDS certificates" },
      { code: "vendor_admin", name: "Service Vendor Lead", scope: "contract_assigned", description: "CAM repair invoices, work orders, preventive upkeep" },
      { code: "support_breakglass", name: "Platform Support (Break-glass)", scope: "time_limited", description: "Emergency audited diagnostics with auto-expiration" },
    ];

    const usersRoster = [
      {
        id: "usr-01",
        full_name: "Vikram Singhania",
        email: "v.singhania@officex.ai",
        role: "org_admin",
        assigned_properties: ["All Properties (Portfolio-wide)"],
        status: "active",
        last_login: "Today, 09:42 IST",
      },
      {
        id: "usr-02",
        full_name: "Anita Deshmukh",
        email: "a.deshmukh@officex.ai",
        role: "finance_checker",
        assigned_properties: ["All Properties (Portfolio-wide)"],
        status: "active",
        last_login: "Today, 09:15 IST",
      },
      {
        id: "usr-03",
        full_name: "Rohan Kulkarni",
        email: "r.kulkarni@officex.ai",
        role: "asset_manager",
        assigned_properties: ["Meridian Tech Park (Tower 1 & 2)", "Whitefield Global Hub"],
        status: "active",
        last_login: "Yesterday, 17:30 IST",
      },
      {
        id: "usr-04",
        full_name: "Rajesh Sharma",
        email: "r.sharma@sharmatrust.in",
        role: "owner_principal",
        assigned_properties: ["Sharma Family Trust Managed Assets"],
        status: "active",
        last_login: "07-Oct-2026, 14:10 IST",
      },
      {
        id: "usr-05",
        full_name: "Pooja Hegde",
        email: "p.hegde@officex.ai",
        role: "leasing_broker",
        assigned_properties: ["Meridian Tech Park (Tower 1)"],
        status: "active",
        last_login: "06-Oct-2026, 11:20 IST",
      },
    ];

    const approvalMatrix = [
      {
        action_name: "New Lease Contract / Financial Amendment",
        maker_role: "Property Manager / Leasing / Finance Maker",
        checker_role: "Asset Manager / Org Admin",
        threshold_rule: "Always required (Maker cannot approve own submission - §7.2)",
      },
      {
        action_name: "Billing Run Invoicing Issue",
        maker_role: "Finance Maker",
        checker_role: "Finance Checker",
        threshold_rule: "Mandatory two-person sign-off for billing > ₹10,00,000",
      },
      {
        action_name: "GST Credit Note Issuance (S-42)",
        maker_role: "Finance Maker",
        checker_role: "Asset Manager",
        threshold_rule: "Requires Checker approval if credit note amount > ₹1,00,000",
      },
      {
        action_name: "Security Deposit Forfeiture / Exit Settlement",
        maker_role: "Finance Maker",
        checker_role: "Owner Principal / Org Admin",
        threshold_rule: "Always requires Owner Principal approval",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        roles: rolesList,
        users: usersRoster,
        approval_matrix: approvalMatrix,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch users and approval matrix", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "User invited and role assignment configured successfully (S-66).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to invite user", message: err.message }, { status: 500 });
  }
}
