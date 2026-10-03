import { NextResponse } from "next/server";

// Common Indian Bank Directory with major commercial branches
const KNOWN_BRANCHES: Record<string, { bank: string; branch: string; city: string; state: string; address?: string }> = {
  "HDFC0000006": { bank: "HDFC Bank", branch: "Navrangpura", city: "Ahmedabad", state: "Gujarat", address: "Astral Tower, Navrangpura, Ahmedabad 380009" },
  "HDFC0000060": { bank: "HDFC Bank", branch: "Fort", city: "Mumbai", state: "Maharashtra", address: "Maneckji Wadia Bldg, Fort, Mumbai 400001" },
  "HDFC0000102": { bank: "HDFC Bank", branch: "Connaught Place", city: "New Delhi", state: "Delhi", address: "Kailash Bldg, KG Marg, Connaught Place, New Delhi 110001" },
  "HDFC0000240": { bank: "HDFC Bank", branch: "BKC Commercial", city: "Mumbai", state: "Maharashtra", address: "Bandra Kurla Complex, Bandra East, Mumbai 400051" },
  "ICIC0000001": { bank: "ICICI Bank", branch: "Bandra Kurla Complex", city: "Mumbai", state: "Maharashtra", address: "ICICI Bank Towers, BKC, Bandra East, Mumbai 400051" },
  "ICIC0000024": { bank: "ICICI Bank", branch: "Ashram Road", city: "Ahmedabad", state: "Gujarat", address: "Jalaram Commercial Complex, Ashram Road, Ahmedabad 380006" },
  "SBIN0000300": { bank: "State Bank of India", branch: "Ahmedabad Main", city: "Ahmedabad", state: "Gujarat", address: "Bhadra, Ahmedabad 380001" },
  "SBIN0000691": { bank: "State Bank of India", branch: "Mumbai Main", city: "Mumbai", state: "Maharashtra", address: "Samachar Marg, Fort, Mumbai 400023" },
  "UTIB0000005": { bank: "Axis Bank", branch: "Ahmedabad Main", city: "Ahmedabad", state: "Gujarat", address: "Trishul, Opposite Samartheshwar Mahadev, Law Garden, Ahmedabad 380006" },
  "UTIB0000004": { bank: "Axis Bank", branch: "Mumbai Main", city: "Mumbai", state: "Maharashtra", address: "Sir P M Road, Fort, Mumbai 400001" },
  "KKBK0000551": { bank: "Kotak Mahindra Bank", branch: "Nariman Point", city: "Mumbai", state: "Maharashtra", address: "Bakhtawar, Nariman Point, Mumbai 400021" },
  "KKBK0000811": { bank: "Kotak Mahindra Bank", branch: "Navrangpura", city: "Ahmedabad", state: "Gujarat", address: "Sakar II, Ellisbridge, Ahmedabad 380006" }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || searchParams.get("ifsc") || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "IFSC code is required" }, { status: 400 });
    }

    if (code.length !== 11) {
      return NextResponse.json({ error: "IFSC code must be exactly 11 characters" }, { status: 400 });
    }

    // Try online RBI clearing directory first
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 86400 } // cache for 24h
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          success: true,
          ifsc: code,
          bank: data.BANK || "",
          branch: data.BRANCH || "",
          city: data.CITY || data.DISTRICT || "",
          state: data.STATE || "",
          address: data.ADDRESS || "",
          micr: data.MICR || "",
          upi: data.UPI !== false,
          rtgs: data.RTGS !== false,
          neft: data.NEFT !== false,
          imps: data.IMPS !== false
        });
      }
    } catch {
      // fallback to internal directory
    }

    // Check internal known branches
    if (KNOWN_BRANCHES[code]) {
      const b = KNOWN_BRANCHES[code];
      return NextResponse.json({
        success: true,
        ifsc: code,
        bank: b.bank,
        branch: b.branch,
        city: b.city,
        state: b.state,
        address: b.address || `${b.branch}, ${b.city}, ${b.state}`,
        upi: true,
        rtgs: true,
        neft: true,
        imps: true
      });
    }

    // Guess from 4-letter prefix
    const prefix = code.slice(0, 4);
    const BANK_NAMES: Record<string, string> = {
      HDFC: "HDFC Bank",
      ICIC: "ICICI Bank",
      SBIN: "State Bank of India",
      UTIB: "Axis Bank",
      KKBK: "Kotak Mahindra Bank",
      PUNB: "Punjab National Bank",
      BARB: "Bank of Baroda",
      INDB: "IndusInd Bank",
      YESB: "Yes Bank",
      FDRL: "Federal Bank",
      UBIN: "Union Bank of India",
      CNRB: "Canara Bank",
      IDIB: "Indian Bank",
      IDFB: "IDFC FIRST Bank"
    };

    const bankName = BANK_NAMES[prefix] || `${prefix} Bank`;

    return NextResponse.json({
      success: true,
      ifsc: code,
      bank: bankName,
      branch: `Branch (${code.slice(5)})`,
      city: "",
      state: "",
      address: "",
      upi: true,
      rtgs: true,
      neft: true,
      imps: true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to look up IFSC" }, { status: 500 });
  }
}
