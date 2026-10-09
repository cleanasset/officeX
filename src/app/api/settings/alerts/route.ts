import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const alertRules = [
      {
        code: "AL-01",
        name: "Contract Expiry Cadence",
        category: "contract",
        trigger_offsets: [365, 180, 90, 30],
        severity: "critical",
        recipients: ["property_manager", "leasing_broker", "asset_manager"],
        channels: { in_app: true, email: true, whatsapp: false },
        auto_resolves: "Renewal deal won or exit recorded",
        status: "active",
      },
      {
        code: "AL-02",
        name: "Lock-in End & Notice Window",
        category: "contract",
        trigger_offsets: [90, 30],
        severity: "action",
        recipients: ["property_manager", "asset_manager"],
        channels: { in_app: true, email: true, whatsapp: false },
        auto_resolves: "Date passed",
        status: "active",
      },
      {
        code: "AL-03",
        name: "Rent Step Escalation Due",
        category: "contract",
        trigger_offsets: [90, 60, 30],
        severity: "action",
        recipients: ["finance_maker", "finance_checker", "asset_manager"],
        channels: { in_app: true, email: true, whatsapp: true },
        auto_resolves: "Step applied and approved",
        status: "active",
      },
      {
        code: "AL-04",
        name: "Escalation Due & Not Applied (Billing Error)",
        category: "billing",
        trigger_offsets: [0, 1, 7],
        severity: "critical",
        recipients: ["finance_checker", "org_admin"],
        channels: { in_app: true, email: true, whatsapp: true },
        auto_resolves: "Escalation applied in billing run",
        status: "active",
      },
      {
        code: "AL-05",
        name: "Holding Over Without Valid Lease",
        category: "contract",
        trigger_offsets: [1, 7, 30],
        severity: "critical",
        recipients: ["property_manager", "asset_manager", "org_admin"],
        channels: { in_app: true, email: true, whatsapp: false },
        auto_resolves: "Renewal signed or space vacating confirmed",
        status: "active",
      },
      {
        code: "AL-08",
        name: "Overdue Receivables Cadence",
        category: "collection",
        trigger_offsets: [1, 7, 30, 60, 90],
        severity: "action",
        recipients: ["tenant_admin", "finance_maker", "asset_manager"],
        channels: { in_app: true, email: true, whatsapp: true },
        auto_resolves: "Invoice settled or disputed",
        status: "active",
      },
      {
        code: "AL-12",
        name: "Security Deposit Escalation Top-Up Shortfall",
        category: "compliance",
        trigger_offsets: [30, 0],
        severity: "action",
        recipients: ["finance_maker", "asset_manager"],
        channels: { in_app: true, email: true, whatsapp: false },
        auto_resolves: "Top-up deposit received / BG amended",
        status: "active",
      },
      {
        code: "AL-17",
        name: "Operator Mandate Expiry Cadence",
        category: "compliance",
        trigger_offsets: [60, 30],
        severity: "action",
        recipients: ["operator_finance", "org_admin"],
        channels: { in_app: true, email: true, whatsapp: false },
        auto_resolves: "Mandate renewed or client account archived",
        status: "active",
      },
    ];

    return NextResponse.json({ success: true, data: alertRules });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch alert rules", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Alert rules configuration updated successfully (S-64).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update alert rules", message: err.message }, { status: 500 });
  }
}
