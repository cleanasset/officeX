import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { gstin } = await request.json();

    if (!gstin) {
      return NextResponse.json({ error: "GSTIN parameter is required." }, { status: 400 });
    }

    // Standard Indian GSTIN Regex (15 Characters)
    // 2 digits (state code), 10 char PAN format, 1 alphanumeric (entity code), 1 character (blank/check digit), 1 alphanumeric
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstinRegex.test(gstin.toUpperCase())) {
      return NextResponse.json({ 
        valid: false, 
        message: "Invalid GSTIN format. Must be 15 characters matching the GSTIN state/PAN format guidelines." 
      }, { status: 200 });
    }

    // Mock response database check
    const mockCompanies: Record<string, { legalName: string; tradeName: string; stateCode: string; address: string; status: string }> = {
      "27AAACT1234F1ZP": {
        legalName: "TATA CONSULTANCY SERVICES LIMITED",
        tradeName: "TCS",
        stateCode: "27 (Maharashtra)",
        address: "TCS House, Raveline Street, Fort, Mumbai 400001",
        status: "Active"
      },
      "29AAACI5678B2ZQ": {
        legalName: "INFOSYS LIMITED",
        tradeName: "Infosys",
        stateCode: "29 (Karnataka)",
        address: "Electronics City, Hosur Road, Bengaluru 560100",
        status: "Active"
      },
      "27AABCT9876C1ZR": {
        legalName: "TECHSERVE SOLUTIONS PRIVATE LIMITED",
        tradeName: "TechServe FM Services",
        stateCode: "27 (Maharashtra)",
        address: "Unit 12, Sunrise Plaza, Hinjewadi Phase 2, Pune 411057",
        status: "Active"
      }
    };

    const gstinUpper = gstin.toUpperCase();
    const companyInfo = mockCompanies[gstinUpper] || {
      legalName: "GENERIC ENTERPRISES PRIVATE LIMITED",
      tradeName: "Generic FM Agency",
      stateCode: gstinUpper.substring(0, 2),
      address: "Commercial Office Suite, Sector 5, Salt Lake, Kolkata 700091",
      status: "Active"
    };

    return NextResponse.json({
      valid: true,
      gstin: gstinUpper,
      ...companyInfo
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process GSTIN validation check." }, { status: 500 });
  }
}
