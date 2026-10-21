const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateExcel() {
  const wb = xlsx.utils.book_new();

  // Single Sheet Data
  const sheetData = [
    // Header summary banner
    ["OFFICEX PLATFORM — 1-WEEK SPRINT DELIVERY TRACKER & STATUS REPORT", "", "", "", "", "", "", "", ""],
    ["Client:", "Clean Asset Services / Review Committee", "Sprint Window:", "21-Oct-2026 to 27-Oct-2026 (7 Days)", "", "", "", "Target:", "100% Closed"],
    ["Overall Progress:", "4 DONE | 5 IN TESTING | 4 IN DEVELOPMENT | 7 PENDING", "Total Items:", "20 Deliverables", "", "", "", "Commitment:", "Hard Handover 27-Oct"],
    ["", "", "", "", "", "", "", "", ""], // Empty row
    // Table Header Row
    [
      "Module ID",
      "Workstream / Category",
      "Feature / Deliverable",
      "Current Status",
      "Assigned To",
      "Target Day",
      "Delivery Date",
      "Current State & Empirical Verification Proof",
      "Client Support / Input Needed"
    ],
    // 20 Structured Rows
    [
      "MOD-01",
      "Core Platform",
      "Smart Multi-Role Authentication & OTP Engine",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: 6-digit cryptographic OTP email dispatch & smart identifier detection. Zero mock data.",
      "None"
    ],
    [
      "MOD-02",
      "Core Platform",
      "Persistent Left Sidebar & Full Mobile Responsiveness",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Sidebar persists across all sub-modules; mobile drawer & bottom nav live.",
      "None"
    ],
    [
      "MOD-03",
      "Core Platform",
      "Supabase Multi-Tenant Database Synchronization",
      "DONE",
      "Database Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: PostgreSQL sync for orgs, properties, spaces, and user leases.",
      "None"
    ],
    [
      "MOD-04",
      "Rent Roll SaaS",
      "Dynamic Property & Lease Onboarding Wizard",
      "DONE",
      "Product Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: 4-step wizard with real space calculations & automated limits.",
      "Google Maps API key for address autofill"
    ],
    [
      "MOD-05",
      "Rent Roll SaaS",
      "Master Rent Roll Register & Escalation Engine",
      "IN TESTING",
      "QA / Lead Dev",
      "Day 2",
      "22-Oct-2026",
      "Unit tests passing; validating 39-point lease parameters and Excel export.",
      "1 real client lease sample for edge-case test"
    ],
    [
      "MOD-06",
      "Rent Roll SaaS",
      "Visual Stacking Plan & Floor-by-Floor Occupancy",
      "IN TESTING",
      "Frontend Team",
      "Day 2",
      "22-Oct-2026",
      "Color-coded unit vacancy & rate masking logic under UAT test suite.",
      "Floor numbering conventions confirmation"
    ],
    [
      "MOD-07",
      "Governance",
      "Maker-Checker Approvals Inbox (/approvals)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Audit desk live for lease contracts, billing runs, and disputes sign-off.",
      "Designation of Client Checker/Approver role"
    ],
    [
      "MOD-08",
      "Governance",
      "Property Management Delegation Desk (/settings/delegation)",
      "IN TESTING",
      "Product Team",
      "Day 2",
      "22-Oct-2026",
      "Delegated rights, fee % models, and partner invitation links functional.",
      "None"
    ],
    [
      "MOD-09",
      "Financials & AR",
      "Automated Monthly Lease Billing Runs & Tax Invoices",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 3",
      "23-Oct-2026",
      "Invoice PDF generation and GST tax line item calculations in progress.",
      "GSTIN & company billing entity legal details"
    ],
    [
      "MOD-10",
      "Financials & AR",
      "Utility Sub-Meter Readings & CAM True-Up Calculator",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 3",
      "23-Oct-2026",
      "Formula engine computing sanctioned kVA & DG tariff in progress.",
      "Standard CAM charge rate guidelines"
    ],
    [
      "MOD-11",
      "Financials & AR",
      "Aging Receivables & Collections Console (0-90+ Days)",
      "IN TESTING",
      "QA Team",
      "Day 3",
      "23-Oct-2026",
      "Aging buckets (0-30d, 31-60d, 61-90d, 90d+) live with real financial data.",
      "None"
    ],
    [
      "MOD-12",
      "Visitor SaaS",
      "Digital Pre-Invites & QR Pass Generation",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 4",
      "24-Oct-2026",
      "Pass creation schema and QR validation pipeline in progress.",
      "WhatsApp/SMS Gateway API credentials (optional)"
    ],
    [
      "MOD-13",
      "Visitor SaaS",
      "Security Guard Desk & Walk-In Visitor Kiosk",
      "PENDING",
      "Frontend Team",
      "Day 4",
      "24-Oct-2026",
      "Scheduled sprint implementation: OTP check-in, badge print & photo capture.",
      "Kiosk device specs (Tablet / Desktop browser)"
    ],
    [
      "MOD-14",
      "Visitor SaaS",
      "Host Approval Workflow & Overstay Tracking",
      "PENDING",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Scheduled sprint implementation: Real-time host notifications and entry alerts.",
      "Confirmation of notification channels"
    ],
    [
      "MOD-15",
      "Statutory Module",
      "Statutory Document Vault & Expiry Reminders (Fire/PCB/Lifts)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Document schema ready; automated 60/30/15-day expiry alert queue in progress.",
      "List of mandatory local municipal NOCs"
    ],
    [
      "MOD-16",
      "Operations & FM",
      "FM Helpdesk & 52-Week Preventive Maintenance (PPM)",
      "IN TESTING",
      "QA Team",
      "Day 5",
      "25-Oct-2026",
      "Work order ticket escalation and 52-week calendar live in testing.",
      "Confirmation of SLA resolution times"
    ],
    [
      "MOD-17",
      "Visitor SaaS",
      "Emergency Evacuation Live Headcount Roll-Call",
      "PENDING",
      "Fullstack Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint implementation: 1-click active occupants & visitors roll-call.",
      "Fire warden emergency contact details"
    ],
    [
      "MOD-18",
      "Core Platform",
      "Google Places Integration & Geolocation Coordinates",
      "PENDING",
      "Integration Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint implementation: Direct Google Maps address autocompletion.",
      "Google Maps API key with Places API enabled"
    ],
    [
      "MOD-19",
      "UAT & Delivery",
      "Full Platform Regression & Penetration Security Review",
      "PENDING",
      "QA Lead",
      "Day 6",
      "26-Oct-2026",
      "Comprehensive end-to-end testing across desktop, tablet, and mobile viewports.",
      "None"
    ],
    [
      "MOD-20",
      "UAT & Delivery",
      "Client UAT Walkthrough, Sign-off & Production Go-Live",
      "PENDING",
      "Project Manager",
      "Day 7",
      "27-Oct-2026",
      "Live client demonstration and production handover.",
      "45-min client review meeting slot"
    ],
    ["", "", "", "", "", "", "", "", ""],
    ["STATUS SUMMARY:", "", "", "", "", "", "", "", ""],
    ["COMPLETED (DONE)", "4 Items", "20%", "Core platform, responsive mobile sidebar, Supabase DB sync, onboarding", "", "", "", "", ""],
    ["IN TESTING (QA)", "5 Items", "25%", "Rent Roll, Stacking Plan, Approvals Inbox, Delegation, Aging Collections", "", "", "", "", ""],
    ["IN DEVELOPMENT", "4 Items", "20%", "Billing Runs & Tax Invoices, Sub-meters & CAM, Pre-Invites QR, Statutory Vault", "", "", "", "", ""],
    ["PENDING (NEXT)", "7 Items", "35%", "Guard Kiosk, Host Approvals, Evacuation Roll-Call, Maps API, Regression, UAT", "", "", "", "", ""],
    ["TOTAL COMMITMENT", "20 Items", "100%", "Hard deadline: Tuesday, 27-Oct-2026 for complete production release", "", "", "", "", ""]
  ];

  const ws = xlsx.utils.aoa_to_sheet(sheetData);

  // Set explicit column widths for perfect display in Excel without truncation
  ws['!cols'] = [
    { wch: 12 }, // Module ID
    { wch: 24 }, // Workstream
    { wch: 42 }, // Feature / Deliverable
    { wch: 18 }, // Current Status
    { wch: 18 }, // Assigned To
    { wch: 12 }, // Target Day
    { wch: 14 }, // Delivery Date
    { wch: 65 }, // Current State & Proof
    { wch: 38 }  // Client Support Needed
  ];

  // Set row heights for header and title
  ws['!rows'] = [
    { hpt: 28 }, // Title row
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 12 },
    { hpt: 24 }  // Column headers row
  ];

  xlsx.utils.book_append_sheet(wb, ws, "1-Week Sprint Tracker");

  const outputPath = path.resolve(__dirname, "..", "OfficeX_Project_Status_and_1Week_Timeline.xlsx");
  xlsx.writeFile(wb, outputPath);
  console.log("Successfully created Excel sheet at:", outputPath);
}

generateExcel();
