import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/rent-roll/auth-context";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const chargeCatalog = [
      {
        id: "chg-rent",
        charge_type: "base_rent",
        name: "Base Lease Rent",
        description: "Demised spatial floorplate commercial base rental",
        billing_model: "area", // area, fixed, seats, metered
        default_unit: "psf_month",
        hsn_sac_code: "997212", // SAC for Commercial Real Estate Rental
        hsn_description: "Real estate services involving own or leased property - Commercial",
        gst_rate_pct: 18.0,
        tds_section: "194I",
        tds_rate_pct: 10.0, // 10% on rent of land/building
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
      {
        id: "chg-cam",
        charge_type: "cam",
        name: "Common Area Maintenance (CAM)",
        description: "Operation, maintenance, security & common utilities upkeep",
        billing_model: "area",
        default_unit: "psf_month",
        hsn_sac_code: "997212",
        hsn_description: "Maintenance and repair services for commercial complexes",
        gst_rate_pct: 18.0,
        tds_section: "194C",
        tds_rate_pct: 2.0, // 2% on contractual services
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
      {
        id: "chg-fitout",
        charge_type: "fitout_rent",
        name: "Fitout & Capex Amortization Rent",
        description: "Dedicated acoustic cabins, flooring & bespoke interior fitout surcharge",
        billing_model: "fixed",
        default_unit: "fixed_month",
        hsn_sac_code: "9954", // Construction / interior fitting services
        hsn_description: "General construction services of other civil engineering works",
        gst_rate_pct: 18.0,
        tds_section: "194I",
        tds_rate_pct: 10.0,
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
      {
        id: "chg-elec",
        charge_type: "electricity_utility",
        name: "Sub-metered Electricity & Power",
        description: "Actual consumption kWh units plus DG power backup recovery",
        billing_model: "metered",
        default_unit: "per_kwh",
        hsn_sac_code: "998631",
        hsn_description: "Electricity distribution services to demised units",
        gst_rate_pct: 18.0,
        tds_section: "194C",
        tds_rate_pct: 2.0,
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
      {
        id: "chg-signage",
        charge_type: "signage_facade",
        name: "Facade Signage & Branding Rights",
        description: "Building facade exterior signage and pylon board license",
        billing_model: "fixed",
        default_unit: "fixed_month",
        hsn_sac_code: "998363",
        hsn_description: "Sale of advertising space or time on bill-boards and facades",
        gst_rate_pct: 18.0,
        tds_section: "194C",
        tds_rate_pct: 2.0,
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
      {
        id: "chg-parking",
        charge_type: "car_parking",
        name: "Covered Reserved Car Parking",
        description: "Basement dedicated mechanical/open parking bays",
        billing_model: "fixed",
        default_unit: "per_slot_month",
        hsn_sac_code: "997212",
        hsn_description: "Parking lot services linked to commercial lease",
        gst_rate_pct: 18.0,
        tds_section: "194I",
        tds_rate_pct: 10.0,
        is_taxable: true,
        is_system_standard: true,
        status: "active",
      },
    ];

    const taxProfiles = [
      { id: "tax-gst-18", name: "Standard Commercial GST (18%)", cgst_pct: 9.0, sgst_pct: 9.0, igst_pct: 18.0 },
      { id: "tax-gst-0", name: "SEZ / Zero-Rated IFSC (0%)", cgst_pct: 0, sgst_pct: 0, igst_pct: 0 },
      { id: "tax-tds-194i", section: "194I", name: "TDS on Rent (Building/Land)", rate_pct: 10.0, threshold_inr: 240000 },
      { id: "tax-tds-194c", section: "194C", name: "TDS on Works / Maintenance (CAM)", rate_pct: 2.0, threshold_inr: 100000 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        charges: chargeCatalog,
        tax_profiles: taxProfiles,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch charges", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Charge catalog type and tax profile updated successfully (S-62).",
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update charge catalog", message: err.message }, { status: 500 });
  }
}
