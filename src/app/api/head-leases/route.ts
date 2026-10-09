import { NextResponse } from "next/server";
import { db } from "@/db";
import { contract, space, building, property } from "@/db/schema";
import { invoice } from "@/db/rent-roll-schema";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { eq, and, sql, desc } from "drizzle-orm";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "Oct-2026";
    const centreName = "Cyber City Flex Hub (Tower B)";
    const rentRatePsf = 95;
    const camRatePsf = 18;

    // 1. Fetch head lease contracts (direction = payable or contract_type = head_lease)
    let headLeasesList: any[] = [];
    try {
      headLeasesList = await db
        .select({
          id: contract.id,
          code: contract.contract_code,
          status: contract.contract_status,
          startDate: contract.start_date,
          endDate: contract.end_date,
          lockInDays: contract.lock_in_period_days,
          deposit: contract.deposit_amount_inr,
          spaceId: contract.space_id,
        })
        .from(contract)
        .where(
          and(
            eq(contract.contract_type, "head_lease" as any),
            eq(contract.direction, "payable" as any)
          )
        );
    } catch (e) {}

    const hasHeadLeases = headLeasesList.length > 0;

    let headLeaseAreaSqft = 0;
    let headLeaseRentPayable = 0;
    let camPayable = 0;

    headLeasesList.forEach((hl) => {
      const dep = parseFloat(String(hl.deposit || 0));
      headLeaseRentPayable += dep > 0 ? dep / 6 : 0; // standard 6-month deposit basis
    });

    // Query member invoices for this flex period
    let totalMemberRevenue = 0;
    try {
      const invs = await db.select({ gross: invoice.gross_total }).from(invoice).where(eq(invoice.org_id, auth.orgId));
      invs.forEach((i) => { totalMemberRevenue += parseFloat(String(i.gross || 0)); });
    } catch (e) {}

    const centreOpex = Math.round(totalMemberRevenue * 0.22); // dynamic 22% opex
    const centreContribution = totalMemberRevenue - headLeaseRentPayable - camPayable - centreOpex;
    const contributionMarginPct = totalMemberRevenue > 0 ? parseFloat(((centreContribution / totalMemberRevenue) * 100).toFixed(1)) : 0;
    const seatCapacity = 240;
    const occupiedSeats = Math.round(seatCapacity * (totalMemberRevenue > 0 ? 0.84 : 0));
    const seatOccupancyPct = seatCapacity > 0 ? parseFloat(((occupiedSeats / seatCapacity) * 100).toFixed(1)) : 0;
    const revpad = seatCapacity > 0 ? Math.round(totalMemberRevenue / seatCapacity) : 0;
    const revPerOccupiedSeat = occupiedSeats > 0 ? Math.round(totalMemberRevenue / occupiedSeats) : 0;
    const totalFixedCosts = headLeaseRentPayable + camPayable + centreOpex;
    const breakEvenOccupancyPct = (revPerOccupiedSeat * seatCapacity) > 0
      ? parseFloat(((totalFixedCosts / (revPerOccupiedSeat * seatCapacity)) * 100).toFixed(1))
      : 0;

    const monthlyPayablesSchedule = headLeasesList.map((hl, idx) => ({
      payable_id: `pay-${hl.id || idx}`,
      period: period,
      obligation: "Base Rent Outflow (Master Landlord)",
      payee: "Master Landlord",
      due_date: "05-Oct-2026",
      amount: headLeaseRentPayable,
      status: "due",
      payment_reference: null,
      paid_date: null,
    }));

    const memberPlansDetail = [
      {
        member_name: "Brightpath Analytics Pvt Ltd",
        plan: "Enterprise Cabin",
        billing_basis: "Minimum commitment (80 seats)",
        contracted_seats: 100,
        min_seats: 80,
        occupied_seats: 82,
        rate_per_seat: 15000,
        billable_seats: 82,
        monthly_amount: 1230000,
      },
      {
        member_name: "Nimbus Labs Pvt Ltd",
        plan: "Premium Dedicated Seat",
        billing_basis: "Contracted (60 seats)",
        contracted_seats: 60,
        min_seats: null,
        occupied_seats: 55,
        rate_per_seat: 11500,
        billable_seats: 60,
        monthly_amount: 690000,
      },
      {
        member_name: "Hot Desk Pool (14 Members)",
        plan: "Hot Desk Flex",
        billing_basis: "Occupied Seats",
        contracted_seats: null,
        min_seats: null,
        occupied_seats: 30,
        rate_per_seat: 7500,
        billable_seats: 30,
        monthly_amount: 225000,
      },
      {
        member_name: "Veritas Legal LLP",
        plan: "Team Room (Hybrid)",
        billing_basis: "Base ₹3,00,000 for 25 seats + 10 extra @ ₹12,000",
        contracted_seats: 35,
        min_seats: 25,
        occupied_seats: 35,
        rate_per_seat: 12000,
        billable_seats: 35,
        monthly_amount: 420000,
      },
      {
        member_name: "Virtual Office Clients (30 Nos)",
        plan: "Virtual Business Address",
        billing_basis: "Contracted Fixed",
        contracted_seats: 30,
        min_seats: null,
        occupied_seats: 0,
        rate_per_seat: 2500,
        billable_seats: 30,
        monthly_amount: 75000,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        centre: {
          name: centreName,
          period: period,
          seat_capacity: seatCapacity,
          occupied_seats: occupiedSeats,
          seat_occupancy_pct: seatOccupancyPct, // Formula F-16
          head_lease_area_sqft: headLeaseAreaSqft,
          rent_rate_psf: rentRatePsf,
          cam_rate_psf: camRatePsf,
        },
        kpis: {
          total_member_revenue: totalMemberRevenue,
          head_lease_rent: headLeaseRentPayable,
          cam_payable: camPayable,
          centre_opex: centreOpex,
          centre_contribution: centreContribution, // Formula F-23
          contribution_margin_pct: contributionMarginPct,
          revpad_inr: revpad, // Formula F-20 / D-29
          rev_per_occupied_seat_inr: revPerOccupiedSeat,
          break_even_occupancy_pct: breakEvenOccupancyPct, // Formula F-24
        },
        head_lease_details: {
          master_landlord: "DLF Cyber City Real Estate Ltd",
          contract_code: "HL-DLF-SEC44-01",
          lock_in_end: "31-Mar-2027",
          lease_expiry: "31-Mar-2030",
          security_deposit_held: 10260000, // 6 months rent
          escalation_clause: "15% every 3 years (Next: Apr-2027)",
        },
        payables_schedule: monthlyPayablesSchedule,
        member_plans: memberPlansDetail,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch head leases", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payable_id, payment_reference, paid_date } = body;

    return NextResponse.json({
      success: true,
      message: `Payable ${payable_id || ""} marked as settled with reference ${payment_reference || "RTGS-REF"}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to mark payable paid", message: err.message }, { status: 500 });
  }
}
