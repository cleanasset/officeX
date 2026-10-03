import { NextResponse } from "next/server";
import mammoth from "mammoth";

function cleanString(str?: string) {
  if (!str) return "";
  return str.replace(/[:\-]/g, "").replace(/\s+/g, " ").trim();
}

function cleanNum(str?: string) {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function parseDeedText(text: string) {
  const result: {
    monthlyRent?: number;
    securityDeposit?: number;
    securityDepositMonths?: number;
    chargeableArea?: number;
    camMonthly?: number;
    escalationPct?: number;
    lockInMonths?: number;
    tenantName?: string;
    leaseTenureYears?: number;
  } = {};

  if (!text) return result;

  // 1. Monthly Base Rent - supports Rs., INR, ₹, and multiline labels
  const rentMatch = text.match(/(?:lease\s+rent|rent\s+per\s+month|monthly\s+rent|pure\s+rent)[\s\S]{0,100}?(?:INR|Rs\.?|₹)\s*([0-9,\u00ad\s]+)/i)
    || text.match(/(?:INR|Rs\.?|₹)\s*([0-9,\u00ad\s]+)\s*\/?-\s*(?:per\s+month|\/-\s*p\.m\.?)/i)
    || text.match(/(?:INR|Rs\.?|₹)\s*([0-9,\u00ad\s]+)\s*\/-[\s\S]{0,50}?rent/i);
  if (rentMatch) {
    const r = cleanNum(rentMatch[1]);
    if (r > 0) result.monthlyRent = r;
  }

  // 2. Leased Area - handles multiline colons and decimals (e.g. 8877.66 Sq Ft)
  const areaMatch = text.match(/(?:area|super\s+area|chargeable\s+area|covered\s+area)[\s\S]{0,50}?([0-9,]+(?:\.[0-9]+)?)\s*(?:sq\.?\s*ft|sqft)/i);
  if (areaMatch) {
    const a = parseFloat(areaMatch[1].replace(/,/g, ""));
    if (!isNaN(a) && a > 0) result.chargeableArea = a;
  }

  // 3. CAM Charges (e.g. INR 1,42,043 /- per month)
  const camMatch = text.match(/(?:common\s+area\s+maintenance|cam)[\s\S]{0,80}?(?:INR|Rs\.?|₹)\s*([0-9,\u00ad\s]+)/i);
  if (camMatch) {
    const c = cleanNum(camMatch[1]);
    if (c > 0) result.camMonthly = c;
  }

  // 4. Security Deposit (e.g. Rs. 8,20,000/- or 5 Month Lease Rent as IFSD)
  const depositMatch = text.match(/(?:security\s+deposit|ifsd|refundable\s+security)[\s\S]{0,150}?(?:INR|Rs\.?|₹)\s*([0-9,\u00ad\s]+)/i);
  const depVal = depositMatch ? cleanNum(depositMatch[1]) : 0;
  if (depVal > 0) {
    result.securityDeposit = depVal;
  } else {
    // Check if security deposit is given in 'X Month Lease Rent'
    const depositMonthsMatch = text.match(/(?:security\s+deposit|ifsd)[\s\S]{0,120}?([0-9]+)\s*month/i);
    if (depositMonthsMatch && result.monthlyRent) {
      const months = parseInt(depositMonthsMatch[1], 10);
      result.securityDeposit = months * result.monthlyRent;
      result.securityDepositMonths = months;
    }
  }

  // 5. Escalation %
  const escMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*(?:escalation|increase|every\s+(?:year|[0-9]+\s+years))/i)
    || text.match(/escalation[\s\S]{0,60}?([0-9]+(?:\.[0-9]+)?)\s*%/i);
  if (escMatch) {
    result.escalationPct = parseFloat(escMatch[1]);
  }

  // 6. Lock-in Period
  const lockMatch = text.match(/lock\s*in[\s\S]{0,50}?([0-9]+)\s*(year|month)/i);
  if (lockMatch) {
    const num = parseInt(lockMatch[1], 10);
    result.lockInMonths = lockMatch[2].toLowerCase().startsWith("year") ? num * 12 : num;
  }

  // 7. Lease Period / Tenure
  const termMatch = text.match(/(?:lease\s+period|rent\s+period|lease\s+term|term\s+of\s+lease)[\s\S]{0,40}?([0-9]+)\s*(?:year|yr)/i);
  if (termMatch) {
    const tenure = parseInt(termMatch[1], 10);
    if (!isNaN(tenure) && tenure > 0) result.leaseTenureYears = tenure;
  }

  // 8. Tenant / Second Party / Lessee
  const secondPartyMatch = text.match(/(?:Second\s+Party|Lessee|Licensee|TENANT)[\s\S]{0,40}?:[\s\n\r]*([^\n\r,]+)/i)
    || text.match(/AND\s+[\n\r\s]*(M\/s[^\n\r,]+)/i)
    || text.match(/(?:between|between:)\s+[\s\S]*?\s+AND\s+([^,]+)/i);

  if (secondPartyMatch) {
    let name = cleanString(secondPartyMatch[1]);
    name = name.replace(/\(PAN.*$/i, "").replace(/is\s+having.*$/i, "").trim();
    if (name.length > 2 && name.length < 80) {
      result.tenantName = name;
    }
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText = "";

    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const parsed = await mammoth.extractRawText({ buffer });
      rawText = parsed.value || "";
    } else if (fileName.endsWith(".pdf")) {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse(new Uint8Array(buffer));
        const res = await parser.getText();
        rawText = res?.text || "";
      } catch (pdfErr) {
        console.warn("PDF extraction note:", pdfErr);
      }
    } else {
      rawText = buffer.toString("utf-8");
    }

    const extracted = parseDeedText(rawText);

    return NextResponse.json({
      success: true,
      fileName,
      fileSize: file.size,
      rawTextLength: rawText.length,
      extracted,
      samplePreview: rawText.slice(0, 300)
    });
  } catch (error: any) {
    console.error("Error in /api/rent-roll/parse-deed:", error);
    return NextResponse.json({ error: error.message || "Failed to parse deed" }, { status: 500 });
  }
}
