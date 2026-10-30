import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contract,
  occupant,
  space,
  building,
  property,
  organization,
  contractCharge,
  rentStep,
} from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { getAuthContext } from "@/lib/rent-roll/auth-context";
import { generateLeaseAgreementHtml } from "@/lib/pdf/lease-contract-pdf";

function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return "Rupees Zero Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n: number): string => {
    let str = "";
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + " Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (str !== "") str += "and ";
      if (n < 20) {
        str += a[n] + " ";
      } else {
        str += b[Math.floor(n / 10)] + " " + (a[n % 10] ? a[n % 10] + " " : "");
      }
    }
    return str.trim();
  };

  const rupees = Math.floor(Math.abs(num));
  const paise = Math.round((Math.abs(num) - rupees) * 100);

  let result = "Rupees " + inWords(rupees);
  if (paise > 0) {
    result += " and " + inWords(paise) + " Paise";
  }
  result += " Only";
  return result;
}

function formatDate(dStr: string | null | undefined): string {
  if (!dStr) return "--";
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dStr;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    let auth: any = null;
    try {
      auth = getAuthContext(req);
    } catch {
      auth = null;
    }

    // Strict Subscription gate check
    const subHeader = req.headers.get("x-subscription-status") || req.headers.get("x-owner-subscribed");
    const cookieHeader = req.headers.get("cookie") || "";
    const isSubCookie =
      cookieHeader.includes("officex_owner_subscribed=true") ||
      cookieHeader.includes("officex_subscription_status=active") ||
      cookieHeader.includes("officex_subscription=active");

    let isSubscribed = subHeader === "active" || subHeader === "true" || isSubCookie;

    if (!isSubscribed && auth?.orgId) {
      try {
        const [orgRec] = await db
          .select({ status: organization.subscription_status })
          .from(organization)
          .where(eq(organization.id, auth.orgId))
          .limit(1);
        if (orgRec && orgRec.status === "active") {
          isSubscribed = true;
        }
      } catch {
        isSubscribed = false;
      }
    }

    if (!isSubscribed) {
      return NextResponse.json(
        {
          error: "Subscription Required",
          message: "You need an active OfficeX subscription plan to generate and download signed commercial contract agreements. Please upgrade your subscription.",
        },
        { status: 403 }
      );
    }

    // Load Contract record with related entities
    const [c] = await db
      .select()
      .from(contract)
      .where(and(eq(contract.id, id), sql`${contract.deleted_at} IS NULL`))
      .limit(1);

    if (!c) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Load Occupant / Tenant
    let occ: any = null;
    if (c.occupant_id) {
      const [o] = await db
        .select()
        .from(occupant)
        .where(eq(occupant.id, c.occupant_id))
        .limit(1);
      occ = o;
    }

    // Load Space, Building & Property
    let sp: any = null;
    let bldg: any = null;
    let prop: any = null;

    if (c.space_id) {
      const [s] = await db.select().from(space).where(eq(space.id, c.space_id)).limit(1);
      sp = s;
      if (sp?.building_id) {
        const [b] = await db.select().from(building).where(eq(building.id, sp.building_id)).limit(1);
        bldg = b;
        if (bldg?.property_id) {
          const [p] = await db.select().from(property).where(eq(property.id, bldg.property_id)).limit(1);
          prop = p;
        }
      }
    }

    // Load Escalation Rent Steps
    let rentSteps: any[] = [];
    try {
      const rsTable = rentStep as any;
      rentSteps = await db
        .select({
          stepNumber: rsTable.step_no || rsTable.stepNumber,
          startDate: rsTable.effective_date || rsTable.start_date,
          endDate: rsTable.effective_to || rsTable.end_date,
          rentAmount: rsTable.monthly_base_rent || rsTable.rent_amount,
          ratePerSqft: rsTable.base_rate_psf || rsTable.rate_per_sqft,
        })
        .from(rentStep)
        .innerJoin(contractCharge, eq((rentStep as any).contract_charge_id, contractCharge.id))
        .where(and(eq(contractCharge.contract_id, id), sql`${(rentStep as any).deleted_at} IS NULL`))
        .orderBy((rentStep as any).step_no);
    } catch {
      rentSteps = [];
    }

    // Organization info
    let org: any = null;
    if (c.org_id) {
      try {
        const [o] = await db
          .select()
          .from(organization)
          .where(eq(organization.id, c.org_id))
          .limit(1);
        org = o;
      } catch {
        org = null;
      }
    }

    // Parse financial values & parameters
    const cAny = c as any;
    const monthlyRent = Number(cAny.base_rent_rate || cAny.monthly_rent || 0);
    const areaSqft = Number(sp?.chargeable_area_sqft || sp?.usable_area_sqft || 0);
    const depositAmount = Number(cAny.deposit_amount_inr || 0);
    const lockInMonths = Number(cAny.lock_in_months || 12);
    const noticePeriodDays = Number(cAny.notice_period_days || (cAny.notice_period_months ? cAny.notice_period_months * 30 : 90));

    // Entity details
    const tenantName = occ?.occupant_name || "M/S COMMERCIAL TENANT";
    const tenantType = occ?.occupant_type === "individual" ? "sole_proprietorship" : "pvt_ltd";
    const tenantPan = occ?.pan_number || "PAN APPLIED FOR";
    const tenantGstin = occ?.gst_number || "UNREGISTERED";
    const tenantAddress = occ?.address || "Registered Corporate Office Address";
    const isProprietorship = tenantType === "sole_proprietorship";

    // Lessor details
    const lessorName = prop?.property_name ? `${prop.property_name} Asset Holdings` : (org?.name || "COMMERCIAL LESSOR");
    const lessorAddress = prop?.address ? `${prop.address}, ${prop.city || ""}, ${prop.state || ""}` : (org?.legal_name || "Commercial Complex Premises");

    // Use Canonical Commercial Lease Agreement HTML Generator matching Indian Standard Deeds
    const html = generateLeaseAgreementHtml({
      contractCode: c.contract_code || id,
      executionDate: formatDate(c.start_date),
      landlordName: lessorName,
      landlordAddress: lessorAddress,
      landlordPan: (prop as any)?.pan || (org as any)?.pan || "",
      landlordGstin: (prop as any)?.gstin || (org as any)?.gstin || "",
      tenantName: tenantName,
      tenantTradeName: occ?.trade_name || "",
      tenantCompanyType: tenantType,
      tenantCin: occ?.cin_number || "",
      tenantPan: tenantPan,
      tenantGstin: tenantGstin,
      tenantAddress: tenantAddress,
      signatoryName: occ?.signatory_name || "Authorized Signatory",
      signatoryDesignation: occ?.signatory_designation || "Director",
      propertyName: prop?.property_name || "Commercial Property",
      buildingName: bldg?.name,
      floorName: sp?.floor_name || (sp?.floor_number !== undefined ? `Floor ${sp.floor_number}` : undefined),
      spaceName: sp?.name || "Demised Space",
      chargeableAreaSqft: areaSqft,
      monthlyRent: monthlyRent,
      ratePerSqft: Number(cAny.base_rate_psf) || (areaSqft > 0 ? Math.round(monthlyRent / areaSqft) : undefined),
      camMonthly: Number(cAny.cam_amount) || undefined,
      camRatePerSqft: Number(cAny.cam_rate_psf) || undefined,
      securityDeposit: depositAmount,
      startDate: c.start_date || new Date().toISOString().split("T")[0],
      endDate: c.end_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      lockInMonths: lockInMonths,
      noticePeriodDays: noticePeriodDays,
      escalationPct: Number(cAny.escalation_value || cAny.escalation_percentage || 5),
      billingEntity: org?.name || lessorName,
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate lease agreement", message: err.message },
      { status: 500 }
    );
  }
}
