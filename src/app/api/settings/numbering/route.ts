import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const numberingSeries = [
      {
        id: "seq-inv-01",
        document_type: "tax_invoice",
        title: "Standard Commercial Tax Invoice",
        prefix: "INV",
        fy_format: "2026-27",
        mask: "INV/{FY}/{NNNN}",
        current_counter: 142,
        next_number: "INV/2026-27/0143",
        reset_frequency: "fiscal_year",
        auto_pad_length: 4,
        is_active: true,
      },
      {
        id: "seq-cn-02",
        document_type: "credit_note",
        title: "GST Credit Note (Section 34)",
        prefix: "CN",
        fy_format: "2026-27",
        mask: "CN/{FY}/{NNNN}",
        current_counter: 18,
        next_number: "CN/2026-27/0019",
        reset_frequency: "fiscal_year",
        auto_pad_length: 4,
        is_active: true,
      },
      {
        id: "seq-dn-03",
        document_type: "debit_note",
        title: "GST Debit Note / CAM True-Up",
        prefix: "DN",
        fy_format: "2026-27",
        mask: "DN/{FY}/{NNNN}",
        current_counter: 7,
        next_number: "DN/2026-27/0008",
        reset_frequency: "fiscal_year",
        auto_pad_length: 4,
        is_active: true,
      },
      {
        id: "seq-rct-04",
        document_type: "official_receipt",
        title: "Payment Receipt & TDS Voucher",
        prefix: "RCT",
        fy_format: "2026-27",
        mask: "RCT/{FY}/{NNNN}",
        current_counter: 289,
        next_number: "RCT/2026-27/0290",
        reset_frequency: "fiscal_year",
        auto_pad_length: 4,
        is_active: true,
      },
      {
        id: "seq-cnt-05",
        document_type: "contract_code",
        title: "Lease Contract Agreement Code",
        prefix: "CNT",
        fy_format: "2026",
        mask: "CNT-{YYYY}-{NNNN}",
        current_counter: 94,
        next_number: "CNT-2026-0095",
        reset_frequency: "calendar_year",
        auto_pad_length: 4,
        is_active: true,
      },
    ];

    const financialControls = {
      global_lock_date: "2026-09-30",
      lock_status: "locked",
      auto_lock_day_of_month: 7, // 7th of every month
      allow_backdated_invoices: false,
      allow_gap_in_numbering: false,
      require_reconciliation_before_lock: true,
      warning_on_unallocated_payments_days: 7,
    };

    return NextResponse.json({
      success: true,
      data: {
        sequences: numberingSeries,
        controls: financialControls,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch numbering settings", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Numbering sequences and financial control lock dates updated (S-63).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update numbering sequences", message: err.message }, { status: 500 });
  }
}
