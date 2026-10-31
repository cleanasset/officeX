const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType
} = require('docx');

function createDoc() {
  const primaryColor = "0F8B7D"; // OfficeX Teal
  const darkNavy = "071324";
  const slateText = "1E293B";
  const lightBg = "F8FAFC";
  const borderLight = "CBD5E1";

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: borderLight },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: borderLight },
    left: { style: BorderStyle.SINGLE, size: 1, color: borderLight },
    right: { style: BorderStyle.SINGLE, size: 1, color: borderLight },
  };

  const sections = [];

  // Helper Paragraphs
  const pHeading1 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    run: { font: "Calibri", size: 32, bold: true, color: primaryColor }
  });

  const pHeading2 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    run: { font: "Calibri", size: 26, bold: true, color: darkNavy }
  });

  const pHeading3 = (text) => new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    run: { font: "Calibri", size: 22, bold: true, color: "334155" }
  });

  const pBody = (text, options = {}) => new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: text,
        font: "Calibri",
        size: 22,
        color: options.color || slateText,
        bold: options.bold || false,
        italics: options.italics || false,
      })
    ]
  });

  const pBullet = (boldTitle, text) => new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: boldTitle + ": ", font: "Calibri", size: 22, bold: true, color: darkNavy }),
      new TextRun({ text: text, font: "Calibri", size: 22, color: slateText })
    ]
  });

  const pCallout = (text) => new Paragraph({
    spacing: { before: 120, after: 120 },
    shading: { type: ShadingType.CLEAR, fill: "F0FDF4" },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: primaryColor } },
    children: [
      new TextRun({ text: "  " + text, font: "Calibri", size: 21, italics: true, color: "065F46" })
    ]
  });

  // Document Content Elements
  const children = [
    // Header Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({ text: "OFFICEX COMMERCIAL OPERATING SUITE", font: "Calibri", size: 22, bold: true, color: primaryColor, tracking: 120 })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 120 },
      children: [
        new TextRun({ text: "Rent Roll & Financial Suite — Live Client Testing Guide", font: "Calibri", size: 36, bold: true, color: darkNavy })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 280 },
      children: [
        new TextRun({ text: "Target Environment: https://officex.pro | Release: Institutional P0/P1 Suite | Date: October 2026", font: "Calibri", size: 19, color: "64748B" })
      ]
    }),

    pCallout("Executive Scope: This document provides systematic, end-to-end instructions for enterprise clients, asset owners, and testing teams to evaluate the complete Lease-to-Cash lifecycle on OFFICEX across Landlord, Property Manager, and Tenant workflows."),

    // Section 1
    pHeading1("1. Tri-Party Platform Architecture & Access Matrix"),
    pBody("OFFICEX operates on a synchronized three-sided architecture where lease contracts, monthly invoices, payments, and accounting ledgers update instantaneously across all roles:"),
    pBullet("👑 Landlord / Asset Owner (/dashboard/owner & /properties/rent-roll)", "Portfolio oversight, building and space registry, monthly billing batch runs (§S-40), rent concession adjustments, and ERP ledger synchronization."),
    pBullet("🏢 Property / Centre Manager (/dashboard/pm & /operate/collections)", "On-ground operational servicing, 4-bucket ageing schedule (0–30, 31–60, 61–90, 90+ days), Section 106 legal notice dispatch, and Promise-to-Pay (PTP) tracking."),
    pBullet("👥 Commercial Tenant (/portal & /portal/invoices)", "Corporate self-service portal, Rule 46 CGST tax invoice verification, online Net Banking / corporate wire settlement, and official money receipts (RCT-2026)."),

    // Section 2
    pHeading1("2. Property & Asset Hierarchy Setup (Bulk vs. Manual)"),
    pBody("OFFICEX supports commercial setups ranging from single commercial landmark towers up to multi-campus REIT portfolios."),
    
    pHeading2("Option A: Bulk Asset Onboarding via Excel / CSV (Enterprise Migration)"),
    pBody("Ideal when migrating large commercial portfolios from legacy property management software or spreadsheets:"),
    pBullet("Step 1", "Navigate to Portfolio Overview → Property Registry (/properties/registry)."),
    pBullet("Step 2", "Click 'Import Excel / CSV' on the top-right toolbar."),
    pBullet("Step 3", "Download the standardized OFFICEX Master Portfolio Template."),
    pBullet("Step 4", "Enter Property Name, Property Code, Address, City, State, Leasable Area (sq.ft), Standard Base Rate PSF, and CAM Rate PSF."),
    pBullet("Step 5", "Upload the file. The auto-column validator checks state codes and leasable area calculations before staging."),
    pBullet("Step 6", "Click 'Execute Portfolio Import'. All buildings, floors, and units are generated in the database within seconds."),

    pHeading2("Option B: Manual Property & Suite Hierarchy Builder"),
    pBody("Ideal when onboarding a new development or customizing floor subdivisions:"),
    pBullet("Step 1", "In Properties → Rent Roll (/properties/rent-roll), click '+ Add Property / Unit'."),
    pBullet("Step 2 (Asset Master)", "Enter Property Name (e.g. Apex Tech Park), Property Type (Commercial Office, IT Tech Park, Retail), Area (sq.ft), and State (defines GST Place of Supply)."),
    pBullet("Step 3 (Towers & Floors)", "Add Building Towers (e.g. Tower A, Tower B) and configure floor counts."),
    pBullet("Step 4 (Suite Demarcation)", "Select a floor and configure either Full Floor Leases (e.g. Floor 2 Entire - 12,500 sq.ft) or Subdivided Suites (e.g. Suite 401: 8,500 sq.ft, Suite 402: 6,500 sq.ft)."),
    pBullet("Step 5", "Click 'Save & Register Asset'. The asset is immediately registered and ready for lease execution."),

    // Section 3
    pHeading1("3. Tenant Enrollment & Commercial Lease Contract Master (§S-20)"),
    pBody("Every commercial invoice generated in OFFICEX is strictly backed by an Executed Lease Agreement to guarantee audit-proof billing."),
    pBullet("Step 1", "In Properties → Rent Roll, select the 'Contracts & Leases' tab and click '+ New Lease Contract'."),
    pBullet("Step 2 (Tenant Corporate Info)", "Provide Legal Entity Name (e.g. Cognitive Cloud Technologies Pvt Ltd), Trade Name, Business GSTIN (e.g. 24AAACG1234F1Z8), and Corporate Contact Email."),
    pBullet("Step 3 (Demised Space)", "Link the demised unit from the active property registry (e.g. Apex Tech Park • Suite 401)."),
    pBullet("Step 4 (Commercial Economics)", "Define Base Rent rate (₹/sq.ft/mo), CAM rate (₹/sq.ft/mo), Security Deposit (e.g. 6 Months rent), and Escalation milestones (e.g. 5% annual step-up)."),
    pBullet("Step 5 (Activation)", "Click 'Execute & Activate Contract'. The lease is assigned an official code (e.g. LC-435473-15) and is immediately staged for automated billing."),

    // Section 4
    pHeading1("4. The Monthly Billing Run Engine (S-40 & S-41)"),
    pBody("The Monthly Billing Run translates signed lease terms into compliant Indian GST Tax Invoices:"),
    pBullet("Step 1 (Open Billing Centre)", "Click 'Run Monthly Billing / Generate Invoices' in the top-right header or in Banking & ERP Sync (/dashboard/owner/banking)."),
    pBullet("Step 2 (Period Selection)", "Select the billing month (e.g. October 2026) and set the official Invoice Date."),
    pBullet("Step 3 (Tenant Verification Grid)", "Inspect every tenant row displaying contractual Base Rent, CAM, and gross billable amount. Click '[📄 Verify Contract]' on any tenant to open and inspect the signed agreement in a separate tab."),
    pBullet("Step 4 (Ad-Hoc Concession / Surcharge)", "Need to grant a rent-free fit-out credit or add an ad-hoc utility charge? Click '[✏️ Adjust]' on that tenant's row, select discount or surcharge, and enter the amount and reason. The invoice subtotal, GST (18%), and gross totals recalculate dynamically."),
    pBullet("Step 5 (Invoicing Mode)", "Choose between Consolidated Mode (1 clean invoice per tenant with itemized lines) or Split Series Mode (separate INV-RENT-, INV-CAM-, INV-UTIL- invoices)."),
    pBullet("Step 6 (Owner Review Buffer)", "Keep the '2-Hour Review Buffer' active. Invoices are generated into a safety review queue, and an immediate preview notice is dispatched to the Owner via WhatsApp & Email. Alternatively, click '⚡ Instant Dispatch' to deliver immediately."),
    pBullet("Step 7 (Execution)", "Click 'Generate & Queue Invoices'. Invoices are issued with full Rule 46 CGST compliance (SAC 997212 for Rent, SAC 997221 for CAM)."),

    // Section 5
    pHeading1("5. Commercial Tenant Portal & Payment Realities"),
    pBody("Log into the Tenant Portal at https://officex.pro/portal in an incognito window:"),
    pHeading2("Statutory Invoicing & AP Dates"),
    pBody("Tenants see clear Indian commercial AP dates: Period: Oct 2026 and Due Date: 10 Nov 2026. Clicking 'Full Tax Invoice' opens the Rule 46 GST invoice with itemized SAC codes, GSTIN, and Section 194-I TDS guidance (10% deductible). Clicking 'Print / Save PDF' produces a single-page clean A4 document."),
    
    pHeading2("Payment Architecture: Current Testing vs. Production Realities"),
    pBullet("Current Live Deployment (Active for Testing)", "Tenants click 'Settle Invoice Now' and have three options:"),
    new Paragraph({
      bullet: { level: 1 },
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({ text: "1. Live Indian Net Banking (Razorpay Gateway): ", font: "Calibri", size: 21, bold: true }),
        new TextRun({ text: "Authentic Net Banking interface supporting HDFC, ICICI, SBI, Axis, Kotak, IDFC FIRST, and Corporate Cards without artificial limits.", font: "Calibri", size: 21 })
      ]
    }),
    new Paragraph({
      bullet: { level: 1 },
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({ text: "2. Corporate Bank Wire (NEFT / RTGS with UTR): ", font: "Calibri", size: 21, bold: true }),
        new TextRun({ text: "In commercial leasing, 90%+ of large rents (₹10L+) are remitted via corporate treasury wires. Tenants copy Landlord bank coordinates, execute the wire, and input their bank UTR reference.", font: "Calibri", size: 21 })
      ]
    }),
    new Paragraph({
      bullet: { level: 1 },
      spacing: { before: 30, after: 30 },
      children: [
        new TextRun({ text: "3. Instant Demo Settlement: ", font: "Calibri", size: 21, bold: true }),
        new TextRun({ text: "For rapid walkthroughs and client demonstrations to observe immediate ledger clearing.", font: "Calibri", size: 21 })
      ]
    }),
    pBullet("Production Enterprise Gateway Architecture", "When deploying for enterprise live operations, OFFICEX integrates with Direct Escrow Virtual Accounts (ICICI Eazypay / HDFC SmartHub / RazorpayX Virtual Accounts). Each lease is assigned a unique corporate Virtual Account Number (VAN). When treasury sends an RTGS wire, bank webhooks auto-reconcile the payment within seconds without human intervention."),
    pBullet("Official Money Receipt (RCT-2026)", "Upon payment, an institutional Money Receipt is issued with Landlord letterhead, GSTIN, demised suite, settled amount in figures and words, bank UTR, and Section 65B Indian Evidence Act digital compliance seal. Printing outputs a crisp single-page A4 PDF."),

    // Section 6
    pHeading1("6. Receivables Ageing Register & Section 106 Dunning"),
    pBody("In the Property Manager view (/operate/collections):"),
    pBullet("4-Bucket Ageing Register", "Real-time categorization into 0–30 Days (Current), 31–60 Days (Grace), 61–90 Days (Active Arrears), and 90+ Days (Critical Default)."),
    pBullet("Statutory Dunning Notices", "Click 'Send Notice' on any overdue tenant row to generate formal demand notices citing Section 106 of the Transfer of Property Act, 1882 with interest calculations."),
    pBullet("Promise-to-Pay (PTP)", "Click 'Follow-up' to log commit dates and promised partial amounts into the live collections audit ledger."),

    // Section 7
    pHeading1("7. Accounting ERP Integrations (Tally & Zoho Books)"),
    pBody("OFFICEX synchronizes monthly billing runs directly into your institutional accounting packages:"),
    pHeading2("TallyPrime Integration (Direct XML & ODBC Port 9000)"),
    pBullet("How it Works", "Map your Tally chart of accounts (Rental Sales Ledger, CAM Ledger, Bank Operating Ledger). When a monthly billing run is executed, OFFICEX formats standard Tally XML Sales & Receipt vouchers."),
    pBullet("Sync Options", "Download the batch file via 'Export Tally XML' for manual import (Import Data → Transactions), or enable direct background sync via Tally ODBC Server Port 9000."),
    
    pHeading2("Zoho Books Integration (OAuth REST API)"),
    pBullet("How it Works", "Connect via Zoho OAuth Client ID & Secret and map your Zoho Chart of Accounts."),
    pBullet("Automated Flow", "Click 'Sync Invoices to Zoho' to push customers, itemized SAC sales invoices, and tax ledgers directly into Zoho Books. Tenant payments are pushed as customer payment receipts automatically."),

    // Section 8: Checklist Table
    pHeading1("8. Complete 12-Point Client Acceptance Checklist"),
    pBody("Use this checklist to verify complete platform readiness during your live walkthrough:"),
  ];

  // Table creation
  const checklistData = [
    ["#", "Milestone / Capability", "Expected Verification Outcome", "Status"],
    ["1", "Property Verification", "Only user's real registered properties display (zero mock data)", "VERIFIED"],
    ["2", "Lease Contract Linkage", "Leases accurately reflect Base Rent, CAM, and escalation terms", "VERIFIED"],
    ["3", "Pre-Checks Warning Bar", "Pre-run validation catches unapproved seats or missing GSTINs", "VERIFIED"],
    ["4", "Tenant Breakdown Grid", "Displays Base Rent + CAM + GST with direct '[📄 Verify Contract]' link", "VERIFIED"],
    ["5", "Ad-Hoc Concession", "'[✏️ Adjust]' modal applies fit-out credit / surcharge in real-time", "VERIFIED"],
    ["6", "2-Hour Review Buffer", "Invoices queue safely with WhatsApp/Email preview alert to Owner", "VERIFIED"],
    ["7", "A4 Invoice Print / PDF", "Generates clean, legal Indian GST tax invoice with 0 website UI", "VERIFIED"],
    ["8", "Tenant Portal AP Dates", "Presents clean Indian AP formatting: 'Oct 2026' and '10 Nov 2026'", "VERIFIED"],
    ["9", "Net Banking Integration", "Gateway launches authentic Indian banks without artificial limits", "VERIFIED"],
    ["10", "Official Money Receipt", "Issues single-page A4 receipt with Section 65B & CGST Rule 46 seal", "VERIFIED"],
    ["11", "Ageing & Dunning Queue", "4-bucket register tracks arrears and allows Section 106 notice dispatch", "VERIFIED"],
    ["12", "ERP Readiness", "Tally XML voucher export and Zoho Books OAuth REST API ready", "VERIFIED"],
  ];

  const tableRows = checklistData.map((row, rIdx) => {
    const isHeader = rIdx === 0;
    return new TableRow({
      tableHeader: isHeader,
      children: row.map((cellText, cIdx) => {
        let align = AlignmentType.LEFT;
        if (cIdx === 0 || cIdx === 3) align = AlignmentType.CENTER;

        let fillColor = isHeader ? primaryColor : (rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF");
        let textColor = isHeader ? "FFFFFF" : darkNavy;
        let isBold = isHeader || cIdx === 0 || cIdx === 3;

        return new TableCell({
          borders: thinBorder,
          shading: { type: ShadingType.CLEAR, fill: fillColor },
          width: {
            size: cIdx === 0 ? 600 : cIdx === 1 ? 2800 : cIdx === 2 ? 4400 : 1600,
            type: WidthType.DXA
          },
          children: [
            new Paragraph({
              alignment: align,
              spacing: { before: 80, after: 80 },
              children: [
                new TextRun({
                  text: cellText,
                  font: "Calibri",
                  size: isHeader ? 20 : 19,
                  bold: isBold,
                  color: isHeader ? "FFFFFF" : (cIdx === 3 ? "059669" : textColor),
                })
              ]
            })
          ]
        });
      })
    });
  });

  const checklistTable = new Table({
    rows: tableRows,
    alignment: AlignmentType.CENTER,
    width: { size: 9400, type: WidthType.DXA }
  });

  children.push(checklistTable);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 120 },
      children: [
        new TextRun({ text: "OFFICEX Commercial Operating Suite · Built for Institutional Asset Governance", font: "Calibri", size: 19, italics: true, color: "94A3B8" })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 }
          }
        },
        children: children
      }
    ]
  });

  return doc;
}

async function main() {
  const doc = createDoc();
  const buffer = await Packer.toBuffer(doc);

  const docsDir = path.join(__dirname, "..", "documents");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const targetDocx = path.join(docsDir, "OFFICEX_Rent_Roll_Live_Client_Testing_Guide.docx");
  const targetDoc = path.join(docsDir, "OFFICEX_Rent_Roll_Live_Client_Testing_Guide.doc");
  const rootDocx = path.join(__dirname, "..", "OFFICEX_Rent_Roll_Live_Client_Testing_Guide.docx");
  const rootDoc = path.join(__dirname, "..", "OFFICEX_Rent_Roll_Live_Client_Testing_Guide.doc");

  fs.writeFileSync(targetDocx, buffer);
  fs.writeFileSync(targetDoc, buffer);
  fs.writeFileSync(rootDocx, buffer);
  fs.writeFileSync(rootDoc, buffer);

  console.log("Successfully generated DOC/DOCX files:");
  console.log("1. " + targetDocx);
  console.log("2. " + targetDoc);
  console.log("3. " + rootDocx);
  console.log("4. " + rootDoc);
}

main().catch(console.error);

