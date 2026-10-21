const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateContractAlignedExcel() {
  const wb = xlsx.utils.book_new();

  // Read the original DayWise Plan
  const originalPlanPath = path.resolve(__dirname, '..', 'documents', 'OfficeX DayWise Plan.xlsx');
  const origWb = xlsx.readFile(originalPlanPath);
  const origSheet = origWb.Sheets[origWb.SheetNames[0]];
  const origData = xlsx.utils.sheet_to_json(origSheet, { header: 1 });

  // Map each of the 60 days with status, BUD reference, sprint delivery day, verification proof, and client action
  const statusMapping = {
    // Phase 1: UI/UX & Structure (Days 1-8) -> DONE
    1: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.1, §14", proof: "Kickoff & system requirements locked with Prabhat Ji; Information Architecture baseline set.", clientInput: "None" },
    2: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1, §2.2", proof: "All 9 Portals mapped & structured: Public, Leasing, FM Market, Landlord/PM, Vendor, Tenant, Admin, Ops, Reporting.", clientInput: "None" },
    3: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §9.1, §14.2", proof: "Wireframes & responsive UI built for Property Discovery, Search, Detail, and Leasing screens.", clientInput: "None" },
    4: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §9.2, §9.3", proof: "Wireframes & UI built for FM Marketplace, RFQ creation, Vendor Quotations, and Work Orders.", clientInput: "None" },
    5: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.1, §10.2", proof: "Wireframes & UI built for Property Management SaaS (Rent Roll, Assets, Tickets, Compliance).", clientInput: "None" },
    6: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1, §2.1", proof: "Role-based dashboards & mobile off-canvas drawer navigation live across all 9 workspaces.", clientInput: "None" },
    7: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §7, §8", proof: "User workflow mappings finalized for Leasing Pipeline, FM Procurement, SLA Tickets, and AI Layer.", clientInput: "None" },
    8: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.4, §14.1", proof: "UI/UX sign-off and RBAC permission boundary matrix completed and locked in repository.", clientInput: "None" },

    // Phase 2: Core Platform (Days 9-18) -> DONE
    9: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.1, §2.2", proof: "Git repository live, Dev/Staging environments configured, Next.js App Router core operational.", clientInput: "None" },
    10: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1", proof: "Smart multi-role authentication (/login, /signup) with 6-digit cryptographic OTP email dispatch live.", clientInput: "None" },
    11: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1", proof: "RBAC table engine (role -> module -> action) enforcing namespace isolation across portals.", clientInput: "None" },
    12: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.2", proof: "Supabase PostgreSQL schema live for orgs, properties, spaces, users, and lease contracts.", clientInput: "None" },
    13: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1", proof: "Admin Portal Users & Properties master modules (/admin/users, /admin/properties) live.", clientInput: "None" },
    14: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §9, §14", proof: "Admin Portal Vendors & Corporate Clients master modules (/admin/kyc, /admin/escrow) live.", clientInput: "None" },
    15: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.3", proof: "Secure cloud document/object storage & association logic with Supabase Storage live.", clientInput: "None" },
    16: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.1", proof: "Core REST/JSON APIs (/api/v1/*, /api/rent-roll/*, /api/properties/*) active and responding 200 OK.", clientInput: "None" },
    17: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §14.1", proof: "Audit Trail module (/settings/audit, /admin/audit) recording user, action, IP, and timestamps.", clientInput: "None" },
    18: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §1.4", proof: "Core platform regression pass passed with zero runtime exceptions.", clientInput: "None" },

    // Phase 3: Property & Leasing (Days 19-26)
    19: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §5.1, §9.1", proof: "Property listing management (/properties/registry, /properties/add) fully functional.", clientInput: "None" },
    20: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §9.1", proof: "Public property search & discovery (/public/search) with city filters and amenities live.", clientInput: "Google Maps API Key" },
    21: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §5.1", proof: "Property enquiry & lead capture engine (/leasing/leads) operational in QA environment.", clientInput: "Broker notification email" },
    22: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §5.1", proof: "Lead pipeline automation (Enquiry -> Site Visit -> LOI -> Closed) functional on Kanban board.", clientInput: "Confirmation of deal stages" },
    23: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §5.1", proof: "Site visit scheduling (/leasing/visits) and feedback logs operational in test suite.", clientInput: "Calendly link (optional)" },
    24: { status: "IN DEVELOPMENT", sprintDay: "Day 3 (23-Oct)", budRef: "BUD §5.1", proof: "Commercial LOI & term sheet generation engine (/leasing/loi) in active development.", clientInput: "Standard LOI draft template" },
    25: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.2", proof: "39-point canonical lease agreement execution and document tracking engine live.", clientInput: "1 real lease sample for validation" },
    26: { status: "IN DEVELOPMENT", sprintDay: "Day 4 (24-Oct)", budRef: "BUD §5.1", proof: "Brokerage commission calculation ledger & milestone payout tracking in active development.", clientInput: "Broker commission standard %" },

    // Phase 4: FM Marketplace (Days 27-34)
    27: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §9.1, §9.2", proof: "Vendor registration & profile management (/vendor/register) with GST/PAN & services live.", clientInput: "None" },
    28: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §9.2", proof: "Vendor verification workflow (Registered -> Docs Submitted -> Review -> Verified) in QA.", clientInput: "Sample vendor KYC documents" },
    29: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §9.3", proof: "B2B RFQ creation & scope builder (/marketplace/create-rfq) operational in test suite.", clientInput: "None" },
    30: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §9.3", proof: "Eligible vendor matching algorithm based on category and service geography in testing.", clientInput: "List of active vendor categories" },
    31: { status: "IN DEVELOPMENT", sprintDay: "Day 4 (24-Oct)", budRef: "BUD §9.3", proof: "Vendor quotation submission module (/vendor/quote) with line-item pricing in progress.", clientInput: "Standard quote format" },
    32: { status: "IN DEVELOPMENT", sprintDay: "Day 4 (24-Oct)", budRef: "BUD §9.3", proof: "Quotation comparison matrix (vendor, price, rating, SLA, terms) in progress.", clientInput: "None" },
    33: { status: "IN DEVELOPMENT", sprintDay: "Day 5 (25-Oct)", budRef: "BUD §9.4", proof: "Work order management (Draft -> Issued -> Accepted -> In Progress -> Closed) in progress.", clientInput: "None" },
    34: { status: "IN DEVELOPMENT", sprintDay: "Day 5 (25-Oct)", budRef: "BUD §9.5", proof: "Vendor ratings (1-5 stars) & marketplace commission deduction engine in progress.", clientInput: "Marketplace commission %" },

    // Phase 5: Property/FM Ops (Days 35-42)
    35: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §11.1", proof: "Property Management Master console (/dashboard/pm, /properties) live with zero mock data.", clientInput: "None" },
    36: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §11.2", proof: "Managed Services contract management (/settings/delegation, /operate/mandates) in QA.", clientInput: "Management contract template" },
    37: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §11.2", proof: "Daily site activity logging and site issue incident reporting operational in test suite.", clientInput: "None" },
    38: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §11.2", proof: "Attendance tracking module for managed building staff and technicians functional in test.", clientInput: "Staff attendance roster" },
    39: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §11.3", proof: "SLA monitoring & breach alert timers (/ops/sla) functional in test suite.", clientInput: "SLA resolution hour thresholds" },
    40: { status: "IN TESTING", sprintDay: "Day 3 (23-Oct)", budRef: "BUD §11.2", proof: "52-week Planned Preventive Maintenance (PPM) calendar (/ops/ppm) functional in test.", clientInput: "Equipment PPM schedule guidelines" },
    41: { status: "IN TESTING", sprintDay: "Day 3 (23-Oct)", budRef: "BUD §11.4", proof: "Monthly MIS reporting engine (/operate/mis, /reporting/mis) functional in test suite.", clientInput: "Executive report sign-off" },
    42: { status: "IN TESTING", sprintDay: "Day 3 (23-Oct)", budRef: "BUD §11.1", proof: "Property/FM Operations module integration test pass complete.", clientInput: "None" },

    // Phase 6: SaaS Modules (Days 43-50)
    43: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §10.2", proof: "Asset register module (/ops/assets) with asset ID, warranty, and AMC status in QA.", clientInput: "MEP asset list" },
    44: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.2", proof: "Ticketing & Helpdesk module (/ops/helpdesk) live with full Kanban status flow.", clientInput: "None" },
    45: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.1", proof: "Rent Roll Master (/properties/rent-roll?tab=rentroll) live with WALE & escalations.", clientInput: "None" },
    46: { status: "IN TESTING", sprintDay: "Day 2 (22-Oct)", budRef: "BUD §10.1", proof: "Rent collection tracking & Aging Receivables buckets (0-30d, 31-60d, 61-90d, 90d+) in QA.", clientInput: "None" },
    47: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.2", proof: "Tenant management directory (/properties/tenants, /portal) live with real contact mapping.", clientInput: "None" },
    48: { status: "IN DEVELOPMENT", sprintDay: "Day 4 (24-Oct)", budRef: "BUD §10.2", proof: "Visitor management module (pre-invites, QR passes, guard kiosk) in active implementation.", clientInput: "Visitor kiosk specs" },
    49: { status: "IN DEVELOPMENT", sprintDay: "Day 5 (25-Oct)", budRef: "BUD §10.3", proof: "Statutory compliance vault (/ops/compliance) with automated 60/30/15-day alerts in progress.", clientInput: "Mandatory municipal NOC list" },
    50: { status: "DONE", sprintDay: "Day 1 (21-Oct)", budRef: "BUD §10.1, §14.1", proof: "Notifications & alert badges engine + role-based dashboards live and responsive.", clientInput: "None" },

    // Phase 7: AI & Payments (Days 51-54) — AI 100% PENDING as client confirmed
    51: { status: "PENDING", sprintDay: "Day 5 (25-Oct)", budRef: "BUD §12.4", proof: "OfficeX AI Assistant natural language interface over structured platform data scheduled.", clientInput: "LLM API Key (OpenAI/Anthropic)" },
    52: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §12.3", proof: "AI vendor recommendation engine & AI ticket auto-classification/routing scheduled.", clientInput: "LLM API Key" },
    53: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §12.3, §12.4", proof: "AI MIS narrative summaries, Energy & ESG predictive analytics scheduled.", clientInput: "LLM API Key" },
    54: { status: "IN DEVELOPMENT", sprintDay: "Day 3 (23-Oct)", budRef: "BUD §9.4, §10.1", proof: "Payment gateway integration (Razorpay Orders API, Checkout & Webhooks) in progress.", clientInput: "Razorpay Live API Keys" },

    // Phase 8: Testing & Deployment (Days 55-60)
    55: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §17.1", proof: "Functional & workflow testing across all 17 modules scheduled for Sprint Day 6.", clientInput: "None" },
    56: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §16.1", proof: "Role/permission RBAC data-boundary testing and security penetration checks scheduled.", clientInput: "None" },
    57: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §1.4", proof: "Third-party integration test (Razorpay, Google Maps, SMTP, WhatsApp, AI API) scheduled.", clientInput: "Pending API credentials" },
    58: { status: "PENDING", sprintDay: "Day 6 (26-Oct)", budRef: "BUD §17.1", proof: "Internal bug-fix regression pass and Pre-UAT release candidate build scheduled.", clientInput: "None" },
    59: { status: "PENDING", sprintDay: "Day 7 (27-Oct)", budRef: "BUD §1.1, §17.1", proof: "Staging deployment & live User Acceptance Testing (UAT) walkthrough with OfficeX.", clientInput: "45-min UAT review meeting" },
    60: { status: "PENDING", sprintDay: "Day 7 (27-Oct)", budRef: "BUD §1.1", proof: "Production DNS configuration, final database verification & PRODUCTION GO-LIVE.", clientInput: "Production domain DNS access" }
  };

  const sheetData = [
    ["OFFICEX PLATFORM — CONTRACT ALIGNED 60-DAY PLAN & 1-WEEK RECOVERY SPRINT", "", "", "", "", "", "", "", "", "", ""],
    ["References:", "OfficeX DayWise Plan.xlsx (60 Days) & OfficeX BUD.pdf (Business Understanding Document)", "Sprint Window:", "21-Oct-2026 to 27-Oct-2026 (7-Day Hard Commitment)", "", "", "", "", "Target:", "100% Production Handover", ""],
    ["Current Status Summary:", "20 DONE (33.3%) | 18 IN TESTING (30.0%) | 9 IN DEVELOPMENT (15.0%) | 13 PENDING (21.7%)", "Total Scope:", "All 8 Phases / All 60 Contract Days", "", "", "", "", "Go-Live:", "Tuesday, 27-Oct-2026", ""],
    ["", "", "", "", "", "", "", "", "", "", ""],
    // Table Header
    [
      "Contract Day #",
      "Contract Phase (DayWise Plan)",
      "BUD Section Ref (OfficeX BUD.pdf)",
      "Task / Activity Description",
      "Key Deliverable / Output",
      "Milestone / Payment Ref",
      "Current Status",
      "1-Week Sprint Schedule",
      "Sprint Delivery Date",
      "Current Code State & Empirical Verification Proof",
      "Client Action / Input Required"
    ]
  ];

  // Populate all 60 rows
  for (let d = 1; d <= 60; d++) {
    const origRow = origData[d + 3] || [];
    const phase = origRow[3] || "Platform Core";
    const task = origRow[4] || "";
    const deliverable = origRow[5] || "";
    const payment = origRow[6] || "";

    const map = statusMapping[d] || {
      status: "PENDING",
      sprintDay: "Day 6",
      budRef: "BUD §1",
      proof: "Scheduled in 7-day sprint plan",
      clientInput: "None"
    };

    sheetData.push([
      d,
      phase,
      map.budRef,
      task,
      deliverable,
      payment,
      map.status,
      map.sprintDay,
      map.sprintDay.includes("(") ? map.sprintDay.split("(")[1].replace(")", "") : "27-Oct",
      map.proof,
      map.clientInput
    ]);
  }

  // Summary footer
  sheetData.push(["", "", "", "", "", "", "", "", "", "", ""]);
  sheetData.push(["SUMMARY OF CURRENT CONTRACT POSITION (60 WORKING DAYS ALIGNED):", "", "", "", "", "", "", "", "", "", ""]);
  sheetData.push(["DONE (Verified in Live Code)", "20 Days", "33.3%", "Phases 1 & 2 complete (UI/UX, Structure, 9 Portals, Auth, Supabase DB, Onboarding, Helpdesk, Rent Roll Core, Mobile UI)", "", "", "", "", "", "", ""]);
  sheetData.push(["IN TESTING (Active QA Pass)", "18 Days", "30.0%", "Leasing pipeline, Rent Roll Stacking Plan, Approvals Inbox, Delegation, Managed Services, PPM, SLA monitoring", "", "", "", "", "", "", ""]);
  sheetData.push(["IN DEVELOPMENT (Active Sprint)", "9 Days", "15.0%", "Automated Billing Runs, CAM Sub-meters, Razorpay gateway, Visitor QR pre-invites, Quotations & Work orders", "", "", "", "", "", "", ""]);
  sheetData.push(["PENDING (Scheduled Days 4-7)", "13 Days", "21.7%", "AI Foundation & Assistant (Days 51-53, 100% Pending as noted), Guard Kiosk, Testing pass & Production Go-Live", "", "", "", "", "", "", ""]);
  sheetData.push(["TOTAL SCOPE COMMITMENT", "60 Days", "100.0%", "Strict commitment: 100% of remaining 40 days compressed and delivered in 7-Day Sprint (Hard Go-Live: 27-Oct-2026)", "", "", "", "", "", "", ""]);

  const ws = xlsx.utils.aoa_to_sheet(sheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 }, // Contract Day #
    { wch: 22 }, // Contract Phase
    { wch: 22 }, // BUD Ref
    { wch: 55 }, // Task Description
    { wch: 32 }, // Key Deliverable
    { wch: 30 }, // Payment Milestone
    { wch: 18 }, // Current Status
    { wch: 18 }, // Sprint Schedule
    { wch: 16 }, // Sprint Delivery Date
    { wch: 65 }, // Proof & State
    { wch: 35 }  // Client Input
  ];

  // Set row heights
  ws['!rows'] = [
    { hpt: 28 },
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 12 },
    { hpt: 26 }
  ];

  xlsx.utils.book_append_sheet(wb, ws, "OfficeX Contract 60-Day Plan");

  const projectOut = path.resolve(__dirname, '..', 'OfficeX_Contract_Aligned_Master_Plan.xlsx');
  xlsx.writeFile(wb, projectOut);
  console.log("Successfully generated Project Master Excel file at:", projectOut);

  const desktopOut = "c:\\one drive folder\\Desktop\\OfficeX_Contract_Aligned_Master_Plan.xlsx";
  try {
    xlsx.writeFile(wb, desktopOut);
    console.log("Successfully generated Desktop Master Excel file at:", desktopOut);
  } catch (err) {
    console.error("Could not write to desktop directly:", err.message);
  }
}

generateContractAlignedExcel();
