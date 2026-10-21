const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateCompleteOfficeXExcel() {
  const wb = xlsx.utils.book_new();

  const sheetData = [
    // Header Banner
    ["OFFICEX.PRO — COMPLETE PLATFORM STATUS TRACKER & 1-WEEK DELIVERY SPRINT", "", "", "", "", "", "", "", ""],
    ["Client:", "Clean Asset Services / Review Committee", "Sprint Window:", "21-Oct-2026 to 27-Oct-2026 (7-Day Hard Commitment)", "", "", "", "Scope:", "Full Platform Core + AI"],
    ["Overall Progress:", "12 DONE (24%) | 14 IN TESTING (27%) | 10 IN DEVELOPMENT (20%) | 15 PENDING (29%)", "Total Items:", "51 Deliverables across 10 Pillars", "", "", "", "Handover:", "Tuesday, 27-Oct-2026"],
    ["", "", "", "", "", "", "", "", ""],

    // Column Headers
    [
      "Module ID",
      "Pillar / Workstream",
      "Feature / Deliverable",
      "Current Status",
      "Assigned Lead",
      "Target Day",
      "Delivery Date",
      "Current Implementation & Verification Proof",
      "Client Action / Input Required"
    ],

    // -------------------------------------------------------------
    // PILLAR 1: OFFICE MARKETPLACE & PUBLIC DISCOVERY
    // -------------------------------------------------------------
    [
      "MKT-01",
      "Office Marketplace",
      "Public Commercial Space Discovery & Search (/public/search)",
      "DONE",
      "Frontend Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Multi-city search, keyword filtering, verified building tags, responsive cards.",
      "None"
    ],
    [
      "MKT-02",
      "Office Marketplace",
      "Dynamic Space Detail & Listing Pages (/marketplace/[slug])",
      "DONE",
      "Frontend Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Floor layout specs, amenities, photo gallery, warm/bare-shell pricing breakdown.",
      "None"
    ],
    [
      "MKT-03",
      "Office Marketplace",
      "4-Way Side-by-Side Space Comparison (/marketplace/compare)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Spec comparison engine live; validating differential CAM, deposit, and floor plate metrics.",
      "Sample comparison criteria sign-off"
    ],
    [
      "MKT-04",
      "Office Marketplace",
      "Requirement Intake Wizard & Space Calq Estimator (/calq)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Headcount-to-sqft algorithms live; testing seat density calculations and budget output.",
      "None"
    ],
    [
      "MKT-05",
      "Office Marketplace",
      "Space Listing Partner Onboarding Builder (/marketplace/list-space)",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 3",
      "23-Oct-2026",
      "Self-service landlord space listing wizard and photo upload flow in active progress.",
      "Sample property brochure/photos"
    ],
    [
      "MKT-06",
      "Office Marketplace",
      "Calendly 3D Virtual Tour & Site Visit Scheduler",
      "IN DEVELOPMENT",
      "Integration Team",
      "Day 4",
      "24-Oct-2026",
      "Direct Calendly appointment webhook integration for prospective tenant walkthroughs.",
      "Calendly account webhook URL"
    ],
    [
      "MKT-07",
      "Office Marketplace",
      "City Micro-Market Directories (Bengaluru, Mumbai, GIFT City, Ahmedabad)",
      "DONE",
      "SEO / Dev Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Pre-filtered inventory directories, SEO meta headers, responsive layouts.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 2: COMMERCIAL LEASING & BROKER CRM
    // -------------------------------------------------------------
    [
      "LSG-01",
      "Leasing Broker CRM",
      "Deals Pipeline & Kanban Lead Board (/leasing, /leasing/pipeline)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Kanban board with New, Contacted, Site Visit, LOI, Won/Lost stages functional in test suite.",
      "Confirmation of deal stages"
    ],
    [
      "LSG-02",
      "Leasing Broker CRM",
      "Inbound Tenant Lead Triage Desk (/leasing/leads)",
      "IN TESTING",
      "Fullstack Team",
      "Day 2",
      "22-Oct-2026",
      "Lead source attribution, budget qualification score, and broker assignment functional.",
      "Designated broker email list"
    ],
    [
      "LSG-03",
      "Leasing Broker CRM",
      "Digital Term Sheet & LOI Generation Room (/leasing/loi)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 3",
      "23-Oct-2026",
      "Auto-generation of commercial Letter of Intent (LOI) documents from deals in progress.",
      "Standard client LOI draft template"
    ],
    [
      "LSG-04",
      "Leasing Broker CRM",
      "Broker Commission Ledger & Disbursement Tracking (/leasing/commissions)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 4",
      "24-Oct-2026",
      "Broker commission formula (1st month rent % split) and payout milestone ledger in progress.",
      "Broker commission standard % rate"
    ],

    // -------------------------------------------------------------
    // PILLAR 3: RENT ROLL SAAS & LANDLORD DESK
    // -------------------------------------------------------------
    [
      "RNT-01",
      "Rent Roll SaaS",
      "Commercial Property & Lease Onboarding Wizard (/onboarding)",
      "DONE",
      "Product Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: 4-step wizard with real space calculations, automated limits, zero mock data.",
      "Google Maps API key for address autofill"
    ],
    [
      "RNT-02",
      "Rent Roll SaaS",
      "Master Rent Roll Register (/properties/rent-roll?tab=rentroll)",
      "IN TESTING",
      "QA / Lead Dev",
      "Day 2",
      "22-Oct-2026",
      "Validating 39-point lease fields, WALE calculation, rate masking, and Excel export.",
      "1 real client lease sample for validation"
    ],
    [
      "RNT-03",
      "Rent Roll SaaS",
      "Visual Stacking Plan & Floor Occupancy Matrix (/operate/stacking)",
      "IN TESTING",
      "Frontend Team",
      "Day 2",
      "22-Oct-2026",
      "Color-coded floor plate occupancy, vacancy square footage, and rate masking live in test.",
      "Tower floor numbering rules confirmation"
    ],
    [
      "RNT-04",
      "Rent Roll SaaS",
      "Maker-Checker Approvals Inbox (/approvals)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Maker-checker audit desk live for lease contracts, billing runs, and disputes sign-off.",
      "Designation of Checker/Approver user"
    ],
    [
      "RNT-05",
      "Rent Roll SaaS",
      "Property Management Delegation Desk (/settings/delegation)",
      "IN TESTING",
      "Product Team",
      "Day 2",
      "22-Oct-2026",
      "Delegated operational rights, fee % models, and partner invitation link generation live.",
      "None"
    ],
    [
      "RNT-06",
      "Rent Roll SaaS",
      "Owner Statements & Table 103 Settlement (/operate/owner-statements)",
      "IN TESTING",
      "Financial Dev",
      "Day 2",
      "22-Oct-2026",
      "Net owner remittance calculation and operator fee deduction verified with live data.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 4: FACILITY MANAGEMENT (FM) & OPERATIONS
    // -------------------------------------------------------------
    [
      "OPS-01",
      "FM Operations",
      "FM Command Centre & Daily Operations Console (/ops, /dashboard/fm)",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Daily operational summary, ticket statistics, vendor status, responsive layout.",
      "None"
    ],
    [
      "OPS-02",
      "FM Operations",
      "Reactive Helpdesk & Ticket SLA Escalation (/ops/helpdesk)",
      "IN TESTING",
      "QA Team",
      "Day 3",
      "23-Oct-2026",
      "Priority-based ticket dispatch, technician assignment, and SLA timers in testing.",
      "Confirmation of SLA resolution hours"
    ],
    [
      "OPS-03",
      "FM Operations",
      "52-Week Preventive Maintenance (PPM) Calendar (/ops/ppm)",
      "IN TESTING",
      "QA Team",
      "Day 3",
      "23-Oct-2026",
      "Annual 52-week PPM schedules, recurring equipment inspection checklists functional.",
      "Asset categories checklist sign-off"
    ],
    [
      "OPS-04",
      "FM Operations",
      "Equipment Register & QR Code Health Logs (/ops/assets)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 4",
      "24-Oct-2026",
      "Chiller, elevator, and DG set health logs with downloadable equipment QR codes in progress.",
      "List of major building MEP assets"
    ],
    [
      "OPS-05",
      "FM Operations",
      "Utility Sub-Meter Readings & CAM True-Up Calculator (/operate/meters)",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 3",
      "23-Oct-2026",
      "Sanctioned load kVA and DG power tariff calculations formula engine in active progress.",
      "Standard CAM charge rate guidelines"
    ],

    // -------------------------------------------------------------
    // PILLAR 5: FM MARKETPLACE & B2B PROCUREMENT
    // -------------------------------------------------------------
    [
      "FMM-01",
      "FM Marketplace",
      "On-Demand Facility Services Directory (/fm-marketplace)",
      "DONE",
      "Product Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Deep cleaning, HVAC maintenance, pest control, fit-out procurement cards.",
      "None"
    ],
    [
      "FMM-02",
      "FM Marketplace",
      "B2B RFQ Creation & Scope Builder (/marketplace/create-rfq)",
      "IN TESTING",
      "QA Team",
      "Day 3",
      "23-Oct-2026",
      "Line-item RFQ creator with site inspection scheduling functional in test environment.",
      "None"
    ],
    [
      "FMM-03",
      "FM Marketplace",
      "Vendor Line-Item Quotation Bidding (/marketplace/quotations, /vendor/quote)",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 4",
      "24-Oct-2026",
      "Multi-vendor competitive quote submission and line-item comparison matrix in progress.",
      "Sample vendor list for test bidding"
    ],
    [
      "FMM-04",
      "FM Marketplace",
      "Work Orders & Photo-Proof Completion Gate (/marketplace/work-orders)",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 5",
      "25-Oct-2026",
      "Technician work order assignment, before/after photo verification gate in progress.",
      "None"
    ],
    [
      "FMM-05",
      "FM Marketplace",
      "Escrow Milestone Funding & Automated Vendor Payouts (/marketplace/payments)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Milestone escrow hold and automated release upon landlord work sign-off in progress.",
      "Razorpay / Payment Gateway live keys"
    ],
    [
      "FMM-06",
      "FM Marketplace",
      "Vendor Rating, SLA Scores & Contractor Compliance Reviews",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "5-star performance rating and contractor statutory labor compliance check in progress.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 6: CORPORATE OCCUPIER & TENANT EXPERIENCE
    // -------------------------------------------------------------
    [
      "TNT-01",
      "Tenant Experience",
      "Corporate Tenant Workplace Cockpit (/tenant, /portal)",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Tenant executive dashboard, lease overview, PM contact, responsive view.",
      "None"
    ],
    [
      "TNT-02",
      "Tenant Experience",
      "Employee Hot Desk & Meeting Room Booking (/tenant/employee)",
      "IN DEVELOPMENT",
      "Frontend Team",
      "Day 4",
      "24-Oct-2026",
      "Desk selection grid, interactive floor map, and meeting room calendar in active progress.",
      "Floor plan CAD/image for desk mapping"
    ],
    [
      "TNT-03",
      "Tenant Experience",
      "Rent Invoice Review, Tax Receipts & Settlements (/portal/invoices)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 3",
      "23-Oct-2026",
      "Digital tax invoice presentation, payment history, and TDS certificate upload in progress.",
      "GSTIN & company billing entity legal details"
    ],
    [
      "TNT-04",
      "Tenant Experience",
      "Tenant Service Dispute Escalation Desk (/portal/disputes)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Dispute creation against billing/CAM line items and maker-checker resolution live in QA.",
      "None"
    ],
    [
      "TNT-05",
      "Tenant Experience",
      "Company Sub-Users & Multi-Tenant Role Permissions (/portal/sub-users)",
      "IN TESTING",
      "QA Team",
      "Day 2",
      "22-Oct-2026",
      "Tenant admin, finance manager, and employee role provisioning functional in test suite.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 7: VISITOR COMPLIANCE SAAS (COMMERCIAL MYGATE MODEL)
    // -------------------------------------------------------------
    [
      "VIS-01",
      "Visitor Compliance",
      "Digital Pre-Invites & QR Pass Generation",
      "IN DEVELOPMENT",
      "Fullstack Team",
      "Day 4",
      "24-Oct-2026",
      "Tenant pre-invite creation with encrypted digital QR codes in active implementation.",
      "SMS / WhatsApp Gateway credentials (optional)"
    ],
    [
      "VIS-02",
      "Visitor Compliance",
      "Security Guard Desk & Walk-In Visitor Kiosk (/ops/visitors)",
      "PENDING",
      "Frontend Team",
      "Day 4",
      "24-Oct-2026",
      "Scheduled sprint: Touchscreen tablet kiosk, walk-in OTP verification, badge printing.",
      "Kiosk device specs (Tablet / Desktop)"
    ],
    [
      "VIS-03",
      "Visitor Compliance",
      "Host Approval Push Workflow & Entry Logging",
      "PENDING",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Scheduled sprint: Real-time host notification push, 1-click Approve/Deny entry workflow.",
      "Notification channel preference"
    ],
    [
      "VIS-04",
      "Visitor Compliance",
      "Overstay Tracking & Turnstile QR Scan Verification",
      "PENDING",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Scheduled sprint: Turnstile QR validation, overstay threshold alerts, exit timestamping.",
      "Turnstile integration specs (if applicable)"
    ],
    [
      "VIS-05",
      "Visitor Compliance",
      "Emergency Evacuation Live Roll-Call & Headcount",
      "PENDING",
      "Fullstack Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint: 1-click evacuation roll-call showing all verified occupants & guests.",
      "Fire safety warden contact numbers"
    ],

    // -------------------------------------------------------------
    // PILLAR 8: STATUTORY & EHS COMPLIANCE SAAS
    // -------------------------------------------------------------
    [
      "CMP-01",
      "Statutory Compliance",
      "Statutory Document Vault (Fire NOC, Lift, PCB) (/ops/compliance)",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Certificate repository schema complete; document upload & validity status in progress.",
      "List of mandatory local municipal NOCs"
    ],
    [
      "CMP-02",
      "Statutory Compliance",
      "Automated 60/30/15-Day License Expiry Alert Engine",
      "IN DEVELOPMENT",
      "Backend Team",
      "Day 5",
      "25-Oct-2026",
      "Background cron scheduler computing expiry countdown and dispatching alert badges.",
      "None"
    ],
    [
      "CMP-03",
      "Statutory Compliance",
      "Building EHS & Municipal Inspection Audit Trail",
      "PENDING",
      "QA Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint: Government inspection history logs, compliance score calculation.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 9: UI / UX ARCHITECTURE & SYSTEM EXPERIENCE
    // -------------------------------------------------------------
    [
      "UIX-01",
      "UI/UX Architecture",
      "Smart Multi-Role Authentication Engine (/login, /signup)",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: 6-digit cryptographic OTP email dispatch, smart identifier detection.",
      "None"
    ],
    [
      "UIX-02",
      "UI/UX Architecture",
      "Central Sovereign Workspace Hub (/dashboard)",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: 1-click sovereign routing between Rent Roll, Marketplace, and FM desks.",
      "None"
    ],
    [
      "UIX-03",
      "UI/UX Architecture",
      "Persistent Left Sidebar Across All Sub-Modules",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Sidebar persists across /approvals, /operate/*, /settings/*, /properties/*.",
      "None"
    ],
    [
      "UIX-04",
      "UI/UX Architecture",
      "Full Mobile Responsiveness & Bottom App Navigation",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Off-canvas mobile drawer with close button, bottom navigation bar, responsive grids.",
      "None"
    ],
    [
      "UIX-05",
      "UI/UX Architecture",
      "Settings & ERP Administration Master Suite (/settings, S-60 to S-67)",
      "DONE",
      "Engineering Team",
      "Day 1",
      "21-Oct-2026",
      "Verified live: Multi-state billing entities, charge catalogues, numbering sequences.",
      "None"
    ],

    // -------------------------------------------------------------
    // PILLAR 10: ARTIFICIAL INTELLIGENCE (AI) ALL PHASES (PENDING)
    // -------------------------------------------------------------
    [
      "AI-01",
      "AI Engines",
      "Phase 1: AI Lease Deed Document OCR & Parameter Extraction Engine",
      "PENDING",
      "AI / ML Team",
      "Day 4",
      "24-Oct-2026",
      "Scheduled sprint: Ingest PDF/scanned lease deeds and extract 39-point rent roll fields automatically.",
      "3-5 sample scanned/PDF lease agreements"
    ],
    [
      "AI-02",
      "AI Engines",
      "Phase 2: AI Executive Narrative MIS & Portfolio Health Summarizer",
      "PENDING",
      "AI / ML Team",
      "Day 5",
      "25-Oct-2026",
      "Scheduled sprint: Automated LLM executive commentary on monthly NOI, revenue variances, tenant risk.",
      "OpenAI / Anthropic LLM API Key"
    ],
    [
      "AI-03",
      "AI Engines",
      "Phase 3: AI Revenue, Vacancy & Lease Expiry Prediction Model",
      "PENDING",
      "AI / ML Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint: Machine learning predictive scoring for tenant renewal probability and vacancy loss.",
      "Historical tenant payment records"
    ],
    [
      "AI-04",
      "AI Engines",
      "Phase 4: AI Predictive Maintenance & IoT Equipment Anomaly Detection",
      "PENDING",
      "AI / ML Team",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint: Early failure detection on HVAC, elevators & DG sets from meter telemetry spikes.",
      "Sensor / meter data specs"
    ],
    [
      "AI-05",
      "AI Engines",
      "Phase 5: AI Tenant Lease Assistant & Maintenance Chatbot",
      "PENDING",
      "AI / ML Team",
      "Day 7",
      "27-Oct-2026",
      "Scheduled sprint: Conversational assistant answering tenant lease questions, escalation rules, tickets.",
      "FAQ / lease terms reference guidelines"
    ],

    // -------------------------------------------------------------
    // FINAL REGRESSION & HANDOVER
    // -------------------------------------------------------------
    [
      "REG-01",
      "Final Handover",
      "End-to-End Platform Regression & Penetration Security Review",
      "PENDING",
      "QA Lead",
      "Day 6",
      "26-Oct-2026",
      "Scheduled sprint: Full multi-role walkthrough across desktop, tablet, and mobile browsers.",
      "None"
    ],
    [
      "HND-01",
      "Final Handover",
      "Client UAT Walkthrough, Formal Sign-Off & Production Deployment",
      "PENDING",
      "Project Manager",
      "Day 7",
      "27-Oct-2026",
      "Scheduled sprint: Live demonstration of all 10 pillars and final production deployment.",
      "45-minute client review meeting slot"
    ],

    ["", "", "", "", "", "", "", "", ""],
    ["SUMMARY BY STATUS", "", "", "", "", "", "", "", ""],
    ["DONE (Completed & Verified)", "12 Deliverables", "23.5%", "Core Auth, Onboarding, Mobile Drawer, Sidebar Persistence, Workspace Hub, City Directories, etc.", "", "", "", "", ""],
    ["IN TESTING (QA / Validation)", "14 Deliverables", "27.5%", "Rent Roll, Stacking Plan, Approvals Inbox, Delegation, Deals Pipeline, Lead Triage, Helpdesk, PPM, etc.", "", "", "", "", ""],
    ["IN DEVELOPMENT (Active Sprint)", "10 Deliverables", "19.6%", "Billing Runs & Tax Invoices, Sub-meters & CAM, Pre-Invites QR, Listing Partner, Vendor RFQ Bidding, etc.", "", "", "", "", ""],
    ["PENDING (Scheduled Days 4-7)", "15 Deliverables", "29.4%", "AI Phases 1-5, Guard Kiosk, Evacuation Roll-Call, Overstay Alerts, Maps API, Final Regression & UAT", "", "", "", "", ""],
    ["TOTAL PLATFORM COMMITMENT", "51 Deliverables", "100.0%", "Strict 7-Day Sprint Target: 100% Closed & Handed Over by Tuesday, 27-October-2026", "", "", "", "", ""]
  ];

  const ws = xlsx.utils.aoa_to_sheet(sheetData);

  // Set explicit auto-fitting column widths
  ws['!cols'] = [
    { wch: 12 }, // Module ID
    { wch: 26 }, // Pillar / Workstream
    { wch: 48 }, // Feature / Deliverable
    { wch: 18 }, // Current Status
    { wch: 20 }, // Assigned Lead
    { wch: 12 }, // Target Day
    { wch: 14 }, // Delivery Date
    { wch: 70 }, // Current Implementation & Verification Proof
    { wch: 42 }  // Client Action / Input Required
  ];

  // Set row heights for title and headers
  ws['!rows'] = [
    { hpt: 28 }, // Title row
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 12 },
    { hpt: 24 }  // Table header
  ];

  xlsx.utils.book_append_sheet(wb, ws, "OfficeX Master 1-Week Sprint");

  // Output to project root and desktop
  const rootPath = path.resolve(__dirname, "..", "OfficeX_Master_Platform_Status_and_1Week_Timeline.xlsx");
  xlsx.writeFile(wb, rootPath);
  console.log("Successfully written project root Excel file to:", rootPath);

  const desktopPath = "c:\\one drive folder\\Desktop\\OfficeX_Master_Platform_Status_and_1Week_Timeline.xlsx";
  try {
    xlsx.writeFile(wb, desktopPath);
    console.log("Successfully written Desktop Excel file to:", desktopPath);
  } catch (err) {
    console.error("Could not write directly to desktop path, copying instead:", err.message);
  }
}

generateCompleteOfficeXExcel();
