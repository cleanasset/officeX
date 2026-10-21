const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateStyledPendingAndTimelineExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Scalezix';
  workbook.lastModifiedBy = 'Scalezix';
  workbook.created = new Date();
  workbook.modified = new Date();

  const ws = workbook.addWorksheet('Pending & Roadmap', {
    views: [{ showGridLines: true }]
  });

  // Global styling helpers
  const fontMain = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
  const fontBold = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  const fontHeader = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  // Define column widths (5 columns)
  ws.columns = [
    { key: 'col1', width: 28 }, // Portal / Domain or Day
    { key: 'col2', width: 44 }, // Feature Name or Date
    { key: 'col3', width: 68 }, // Feature Functionality & Flow / Deliverables
    { key: 'col4', width: 22 }, // Current Status
    { key: 'col5', width: 26 }  // Target Timeline Day
  ];

  let rowIndex = 1;

  function addTitleBanner(text, subtext) {
    ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
    const row = ws.getRow(rowIndex);
    row.height = 34;
    const cell = row.getCell(1);
    cell.value = text;
    cell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    rowIndex++;

    ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
    const subRow = ws.getRow(rowIndex);
    subRow.height = 24;
    const subCell = subRow.getCell(1);
    subCell.value = subtext;
    subCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF94A3B8' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    rowIndex++;

    // Blank row
    ws.getRow(rowIndex).height = 10;
    rowIndex++;
  }

  function addSectionHeader(title, countText, bgColorArgb) {
    ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
    const row = ws.getRow(rowIndex);
    row.height = 28;
    const cell = row.getCell(1);
    cell.value = `${title}  —  ${countText}`;
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorArgb } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    rowIndex++;
  }

  function addTableHeaders(headers, headerColor) {
    const row = ws.getRow(rowIndex);
    row.height = 24;
    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1);
      cell.value = h;
      cell.font = fontHeader;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
      cell.alignment = { vertical: 'middle', horizontal: i >= 3 ? 'center' : 'left' };
      cell.border = borderThin;
    });
    rowIndex++;
  }

  function addDataRow(data, statusStyle, isEven) {
    const row = ws.getRow(rowIndex);
    row.height = 24;
    const rowBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    data.forEach((val, i) => {
      const cell = row.getCell(i + 1);
      cell.value = val;
      cell.border = borderThin;
      cell.font = (i === 1 || i === 0) ? fontBold : fontMain;
      cell.alignment = {
        vertical: 'middle',
        horizontal: i >= 3 ? 'center' : 'left',
        wrapText: true
      };

      if (i === 3 && statusStyle) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusStyle.bg } };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: statusStyle.fg } };
      } else if (i === 4 && statusStyle && statusStyle.timelineBg) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusStyle.timelineBg } };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: statusStyle.timelineFg } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      }
    });

    rowIndex++;
  }

  function addSpacer() {
    ws.getRow(rowIndex).height = 14;
    rowIndex++;
  }

  // =================================================================================================
  // 1. BANNER
  // =================================================================================================
  addTitleBanner(
    'OFFICEX.PRO — PENDING PLATFORM FEATURES & DELIVERY ROADMAP',
    '7-Day Core Platform Completion (21–27 Oct 2026)  |  AI Suite Deployment in Days 8–15 (28 Oct–04 Nov 2026)'
  );

  // Status Styles
  const statusTesting = { bg: 'FFFEF3C7', fg: 'FF92400E', timelineBg: 'FFFEF3C7', timelineFg: 'FF92400E' }; // Amber
  const statusDev = { bg: 'FFDBEAFE', fg: 'FF1E40AF', timelineBg: 'FFEFF6FF', timelineFg: 'FF1E40AF' };     // Blue
  const statusPendingCore = { bg: 'FFFFE4E6', fg: 'FF9F1239', timelineBg: 'FFFFF1F2', timelineFg: 'FF9F1239' }; // Rose Core
  const statusPendingAI = { bg: 'FFFCE7F3', fg: 'FF9D174D', timelineBg: 'FFFDF2F8', timelineFg: 'FF9D174D' }; // Pink/Magenta AI
  const statusLater = { bg: 'FFF3E8FF', fg: 'FF6B21A8', timelineBg: 'FFFAF5FF', timelineFg: 'FF6B21A8' };   // Purple Integrations
  const statusSprint = { bg: 'FFDCFCE7', fg: 'FF15803D', timelineBg: 'FFF0FDF4', timelineFg: 'FF15803D' };  // Green 7-Day Plan
  const statusAIRoadmap = { bg: 'FFF5D0FE', fg: 'FF86198F', timelineBg: 'FFFAF5FF', timelineFg: 'FF86198F' }; // Purple AI Roadmap

  // =================================================================================================
  // EXECUTIVE KPI & PERCENTAGE DASHBOARD
  // =================================================================================================
  addSectionHeader('PLATFORM IMPLEMENTATION PROGRESS & STATUS PERCENTAGES', 'Total Scope: 63 Platform Deliverables', 'FF0F172A'); // Dark Navy
  addTableHeaders(['Status Category', 'Deliverables', 'Specific Features Included & Technical Meaning', 'Percentage', 'Target Timeline Window'], 'FF1E3A8A');

  const kpiData = [
    [
      'COMPLETED & OPERATIONAL',
      '32 Deliverables',
      'Marketplace Public Search, Details & Hubs, 4-Step Onboarding Wizard, Live Supabase DB, Master Rent Roll Register, Full Mobile Responsive Layout, FM Desk, RBAC & Core Auth.',
      '50.8%',
      'Verified Live on Staging'
    ],
    [
      'IN FINAL QA TESTING',
      '4 Deliverables',
      'Visual Stacking Plan Matrix, Approvals Maker-Checker Rules, Deals Pipeline Kanban, Calq Space Estimator (100% code implemented; undergoing final edge-case sign-off).',
      '6.4%',
      'Sign-Off Tomorrow (22-Oct)'
    ],
    [
      'CURRENT OVERALL PROGRESS',
      '36 Deliverables',
      'OVER HALF OF FULL PLATFORM (57.2%) IS COMPLETED & OPERATIONAL (Completed Features + Tested Features).',
      '57.2% COMPLETE',
      'Current Working Baseline'
    ],
    [
      'IN ACTIVE DEVELOPMENT',
      '12 Deliverables',
      'Automated Monthly Billing, Utility Sub-Meters, Razorpay Gateway, RFQ Quotations Matrix, Work Orders Photo Gate, Visitor Management QR Passes, PPM Calendar.',
      '19.0%',
      'Days 3 to 5 (23–25 Oct)'
    ],
    [
      'PENDING CORE PLATFORM',
      '5 Deliverables',
      'Specific Pending Features: (1) Digital Dispute Desk, (2) Daily Site Activity Log, (3) Multi-Tenant Security Penetration, (4) Pre-UAT Regression Pass, (5) Production DNS Go-Live.',
      '7.9%',
      'Days 5 to 7 (25–27 Oct)'
    ],
    [
      'PENDING AI SUITE',
      '10 Deliverables',
      'Specific Pending AI Modules: (1) Lease Deed OCR, (2) Executive Narrative MIS, (3) Vacancy ML Predictor, (4) IoT Predictive PPM, (5) Tenant 24/7 AI Concierge Bot.',
      '15.9%',
      'Days 8 to 15 (28 Oct–04 Nov)'
    ],
    [
      'TOTAL PLATFORM COMMITMENT',
      '63 Deliverables',
      'Full Platform Commitment: 100% Core Platform Handover (27-Oct) + 100% AI Suite Handover (04-Nov).',
      '100.0%',
      'Full Project Completion'
    ]
  ];

  kpiData.forEach((row, i) => {
    let style = statusDev;
    if (i === 0) style = statusSprint; // Green
    else if (i === 1) style = statusTesting; // Amber
    else if (i === 2) style = { bg: 'FFBBF7D0', fg: 'FF166534', timelineBg: 'FFDCFCE7', timelineFg: 'FF166534' }; // Bright Green Highlight (57.2% COMPLETE)
    else if (i === 3) style = statusDev; // Blue
    else if (i === 4) style = statusPendingCore; // Rose
    else if (i === 5) style = statusPendingAI; // Pink
    else if (i === 6) style = { bg: 'FFE2E8F0', fg: 'FF0F172A', timelineBg: 'FFF1F5F9', timelineFg: 'FF0F172A' }; // Slate
    addDataRow(row, style, i % 2 === 0);
  });
  addSpacer();

  // =================================================================================================
  // 2. IN TESTING (QA PASS)
  // =================================================================================================
  addSectionHeader('1. FEATURES CURRENTLY IN TESTING (QA PASS)', '11 Deliverables (100% Implemented — QA Verification & Sign-Off)', 'FFD97706'); // Amber 600
  addTableHeaders(['Portal / Domain', 'Feature / Flow Name', 'Functionality & User Flow', 'Current Status', 'Target Timeline'], 'FFB45309');

  const testingData = [
    [
      'Rent Roll & Landlord SaaS',
      'Visual Stacking Plan & Floor Occupancy Matrix',
      'Interactive floor-by-floor building elevation displaying occupied vs vacant units, square footage, and tenant badges.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Rent Roll & Landlord SaaS',
      'Dual-Authorization Maker-Checker Approval Rules',
      'Dual sign-off enforcement preventing makers from self-authorizing; checker approval audit logging on lease edits and invoices.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Commercial Leasing CRM',
      'Inbound Tenant Lead Triage Desk',
      'Intake queue qualifying incoming commercial tenant inquiries, capturing space budget, required sqft, and marketing source.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Commercial Leasing CRM',
      'Deals Pipeline Kanban Board',
      'Visual deal stage progression (Inquiry -> Site Visit -> Negotiation -> Term Sheet LOI -> Contract Signed -> Closed).',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Commercial Leasing CRM',
      'Site Visit Management & Feedback Logs',
      'Scheduling on-site tenant walkthroughs, logging broker follow-ups, and prospective occupier interest feedback.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Office Marketplace',
      '4-Way Commercial Space Spec Comparison',
      'Side-by-side comparison table analyzing monthly rent, CAM charges, furnishing, floor plate, and security deposit terms.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Office Marketplace',
      'Calq Space Requirement & Budget Estimator',
      'Interactive calculator deriving required carpet area, linear workstations, cabins, and budget based on employee headcount.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'FM Marketplace',
      'B2B RFQ Scope Builder & Vendor Auto-Match',
      'Property managers publish maintenance tenders with SLA tags; system automatically matches and notifies eligible vetted vendors.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'FM Marketplace',
      'Vendor KYC & Document Verification Desk',
      'Admin moderation queue verifying uploaded GSTIN, PAN, PF/ESIC, and insurance certificates to grant verified vendor status.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Property & FM Operations',
      '52-Week Planned Preventive Maintenance (PPM) Calendar',
      'Comprehensive 52-week recurring maintenance calendar for chillers, lifts, DG sets, and fire systems with auto work orders.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ],
    [
      'Rent Roll & Landlord SaaS',
      'Aging Receivables & Collections Tracker',
      'Aged debtors ledger categorizing overdue rent and CAM arrears into 0-30, 31-60, 61-90, and 90+ days aging buckets.',
      'IN TESTING',
      'Day 2 (22-Oct-2026)'
    ]
  ];

  testingData.forEach((row, i) => addDataRow(row, statusTesting, i % 2 === 0));
  addSpacer();

  // =================================================================================================
  // 3. IN DEVELOPMENT (ACTIVE SPRINT)
  // =================================================================================================
  addSectionHeader('2. FEATURES CURRENTLY IN DEVELOPMENT (ACTIVE BUILD)', '11 Deliverables (Scheduled Completion in Days 3 to 5)', 'FF2563EB'); // Blue 600
  addTableHeaders(['Portal / Domain', 'Feature / Flow Name', 'Functionality & User Flow', 'Current Status', 'Target Timeline'], 'FF1D4ED8');

  const devData = [
    [
      'Financials & Invoicing',
      'Automated Monthly Rent Roll Billing Run & Tax Invoices',
      'End-of-month batch billing script generating GST-compliant tax invoices (Base Rent + CAM + GST tax calculation).',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'Financials & Invoicing',
      'Utility Sub-Meter Reading & CAM Pro-Rata Allocator',
      'Digital entry table for electricity and water meter readings, calculating slab tariffs and pro-rata tenant CAM splits.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'Payments & Gateway',
      'Razorpay Live Payment Gateway & Virtual Accounts',
      'Integration of Razorpay Orders API for rent collection, unique virtual payment links, and webhook payment settlement.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'FM Marketplace',
      'Quotation Submission & Multi-Vendor Comparison Matrix',
      'Side-by-side comparison matrix for bids submitted by vendors against issued RFQs, highlighting lowest rate and fastest SLA.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'FM Operations SaaS',
      'Work Order Lifecycle & Mandatory Photo Proof Gate',
      'Work order dispatch (Issued -> Accepted -> In Progress -> Closed) requiring mandatory before/after photo upload.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'FM Operations SaaS',
      'Vendor Rating & Marketplace Commission Engine',
      'Post-service vendor 1-5 star ratings, SLA compliance score calculation, and marketplace fee deduction logic.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'Tenant Portal',
      'Tenant Self-Service Statement & Online Invoice Payment',
      'Tenant financial desk to download monthly GST statements, view ledger balances, and settle dues online.',
      'IN DEVELOPMENT',
      'Day 3 (23-Oct-2026)'
    ],
    [
      'Commercial Leasing CRM',
      'Digital LOI & Commercial Term Sheet Generator',
      'Automated PDF term sheet generator populating agreed lease parameters with landlord and tenant signature blocks.',
      'IN DEVELOPMENT',
      'Day 4 (24-Oct-2026)'
    ],
    [
      'Office Marketplace',
      'Space Listing Partner Submission Builder',
      'Self-service listing builder enabling landlords and brokers to add commercial office inventory with floor plans.',
      'IN DEVELOPMENT',
      'Day 4 (24-Oct-2026)'
    ],
    [
      'SaaS Modules',
      'Visitor Management Pre-Invites & QR Code Passes',
      'Host tenants issue digital visitor invitations; visitors receive secure QR passes scanned at security lobby desks.',
      'IN DEVELOPMENT',
      'Day 4 (24-Oct-2026)'
    ],
    [
      'SaaS Modules',
      'Statutory Compliance Document Vault with Expiry Alerts',
      'Centralized vault for Fire NOC, Lift Licenses, and Building OC with automated 60/30/15-day expiry warning triggers.',
      'IN DEVELOPMENT',
      'Day 5 (25-Oct-2026)'
    ]
  ];

  devData.forEach((row, i) => addDataRow(row, statusDev, i % 2 === 0));
  addSpacer();

  // =================================================================================================
  // 4. PENDING CORE PLATFORM & AI PHASES
  // =================================================================================================
  addSectionHeader('3. PENDING FEATURES & AI SUITE BREAKDOWN', 'Core Features (Days 4–7) + AI Suite Scheduled for Days 8–15', 'FFE11D48'); // Rose 600
  addTableHeaders(['Portal / Domain', 'Feature / Flow Name', 'Functionality & User Flow', 'Current Status', 'Target Timeline'], 'FFBE123C');

  const pendingData = [
    [
      'Tenant Management',
      'Digital Dispute Desk & Maintenance Escalation Workflow',
      'Formal tenant dispute filing for billing or maintenance issues with photo evidence, credit notes, and resolution audit.',
      'PENDING',
      'Day 5 (25-Oct-2026)'
    ],
    [
      'FM Operations SaaS',
      'Daily Site Activity Logging & Shift Checkpoints',
      'Digital facility log for security shift handovers, incident reporting, and MEP patrol timestamps.',
      'PENDING',
      'Day 5 (25-Oct-2026)'
    ],
    [
      'Security & Quality',
      'End-to-End Multi-Tenant Isolation & Security Penetration Test',
      'Verification of multi-tenant database row-level security (RLS), permission boundaries, and API token protections.',
      'PENDING',
      'Day 6 (26-Oct-2026)'
    ],
    [
      'Quality Assurance',
      'Pre-UAT Build: Full Platform Regression Pass & Staging Hardening',
      'Complete end-to-end regression pass across all 9 portals verifying zero console errors and clean responsive layouts.',
      'PENDING',
      'Day 6 (26-Oct-2026)'
    ],
    [
      'Platform Handover',
      'Client UAT Demonstration Walkthrough & Core Platform Go-Live',
      'Interactive 45-minute staging walkthrough with leadership, production DNS switch, and core platform handover.',
      'PENDING (SCHEDULED)',
      'Day 7 (27-Oct-2026)'
    ],
    [
      'AI Engine (Phase 1)',
      'AI Commercial Lease Deed OCR & Key Clause Extraction',
      'AI document parser extracting monthly rent, lock-in period, rent escalation dates, and security deposit into database fields.',
      'PENDING (AI 100%)',
      'Days 8–9 (28–29 Oct 2026)'
    ],
    [
      'AI Engine (Phase 2)',
      'AI Executive Narrative MIS Auto-Commentary Engine',
      'LLM generating monthly executive commentary summarizing occupancy fluctuations, collections, and WALE trends.',
      'PENDING (AI 100%)',
      'Days 10–11 (30–31 Oct 2026)'
    ],
    [
      'AI Engine (Phase 3)',
      'AI Commercial Lease Vacancy & Expiry ML Predictor',
      'Machine learning model forecasting tenant lease renewal likelihood 180 days prior to expiry based on payment history.',
      'PENDING (AI 100%)',
      'Days 12–13 (01–02 Nov 2026)'
    ],
    [
      'AI Engine (Phase 4)',
      'AI IoT & Equipment Predictive Maintenance Anomaly Alerts',
      'Algorithmic anomaly detection for chiller run hours, DG fuel burn, and lift trips to trigger preventive servicing before failure.',
      'PENDING (AI 100%)',
      'Days 13–14 (02–03 Nov 2026)'
    ],
    [
      'AI Engine (Phase 5)',
      'Tenant 24/7 AI Concierge & Smart Helpdesk Bot',
      'Natural language assistant answering tenant queries regarding building rules, amenities, and logging maintenance tickets.',
      'PENDING (AI 100%)',
      'Days 14–15 (03–04 Nov 2026)'
    ]
  ];

  pendingData.forEach((row, i) => {
    const isAI = row[3].includes('AI');
    addDataRow(row, isAI ? statusPendingAI : statusPendingCore, i % 2 === 0);
  });
  addSpacer();

  // =================================================================================================
  // 5. PENDING THIRD-PARTY INTEGRATIONS (TO DO LATER)
  // =================================================================================================
  addSectionHeader('4. PENDING THIRD-PARTY INTEGRATIONS (PLANNED FOR PHASE 2 / EXTENSION)', '7 External Services (Core Platform Functions Natively)', 'FF7C3AED'); // Purple 600
  addTableHeaders(['Integration / Service', 'Third-Party Provider', 'Functional Purpose', 'Current Platform Native Handling', 'Target Delivery Phase'], 'FF6D28D9');

  const integrationData = [
    [
      'WhatsApp Business Cloud API / Twilio SMS',
      'Meta / Twilio',
      'Automated tenant rent reminder pings, OTP SMS delivery, and maintenance ticket status updates via WhatsApp.',
      'Operates 100% natively via secure cryptographic email OTP and in-app system notification badges.',
      'Phase 2 Extension'
    ],
    [
      'Razorpay Marketplace Escrow Split Payouts',
      'Razorpay Route',
      'Automated split payouts routing landlord rent to owner bank accounts and vendor service fees automatically.',
      'Operates 100% natively with Razorpay Orders API for direct invoice collection & manual payout authorizations.',
      'Phase 2 FinTech Sprint'
    ],
    [
      'Google Places & Geocoding API',
      'Google Cloud Platform',
      'Real-time address autocomplete and interactive pin drop during property onboarding and search.',
      'Operates 100% natively with structured address entry, city/micro-market selectors, and pincode mapping.',
      'Phase 2 Extension'
    ],
    [
      'Smart IoT Building Hardware Sensors',
      'BACnet / Modbus Hardware',
      'Direct telemetry data stream from chiller run-hour meters, DG fuel sensors, and energy sub-meters into CAM tables.',
      'Operates 100% natively with digital sub-meter reading logs and bulk CSV import.',
      'Phase 2 Smart Building'
    ],
    [
      'Biometric Turnstile & Face Kiosk SDK',
      'Physical Access Hardware',
      'Physical barrier flap turnstile release at building lobby when visitor scans mobile QR code.',
      'Operates 100% natively with mobile/tablet camera QR verification desk at security desks.',
      'Phase 2 Physical Access'
    ],
    [
      'Calendly 3D Virtual Tour Scheduling',
      'Calendly / Matterport',
      'Automated Matterport 3D walkthrough scheduling for prospective tenants directly from space detail pages.',
      'Operates 100% natively with built-in leasing site visit request form and calendar scheduling.',
      'Post-Launch Plug-in'
    ],
    [
      'Municipal Govt Fire/OC Auto-Scraper',
      'Digilocker / Govt APIs',
      'Automated synchronization of fire safety clearances and municipal occupancy certificates from government portals.',
      'Operates 100% natively with Statutory Compliance Vault and automated 60/30/15-day expiry warning alerts.',
      'Phase 2 GovTech'
    ]
  ];

  integrationData.forEach((row, i) => addDataRow(row, statusLater, i % 2 === 0));
  addSpacer();

  // =================================================================================================
  // 6. 7-DAY CORE PLATFORM COMPLETION TIMELINE (21-OCT TO 27-OCT)
  // =================================================================================================
  addSectionHeader('5. STRICT 7-DAY PLAN TO COMPLETE WHOLE CORE OFFICEX PLATFORM', 'Wednesday 21-Oct to Tuesday 27-Oct-2026 (Core Platform Handover)', 'FF16A34A'); // Green 600
  addTableHeaders(['Sprint Day', 'Calendar Date', 'Platform Focus', 'Specific Deliverables Handled', 'Target Output State'], 'FF15803D');

  const sprintTimelineData = [
    [
      'Day 1',
      'Wednesday, 21-Oct (TODAY)',
      'UI/UX Mobile Overhaul & Master Registers',
      'Dashboard Mobile Drawer UX, Persistent Sidebar, Master Rent Roll Register, Approvals Console, FM Command Desk.',
      'COMPLETED TODAY'
    ],
    [
      'Day 2',
      'Thursday, 22-Oct-2026',
      'Testing & QA Sign-Off Pass',
      'Visual Stacking Plan Matrix, Approvals Maker-Checker Rules, Leasing CRM Kanban, 4-Way Compare, Calq Estimator, 52-Week PPM.',
      'COMMITTED (Day 2)'
    ],
    [
      'Day 3',
      'Friday, 23-Oct-2026',
      'Automated Billing, Invoicing & Payments',
      'Automated Rent Roll Billing Run, Utility Sub-Meters, Razorpay Gateway, RFQ Quotations Matrix, Work Orders Photo Gate.',
      'COMMITTED (Day 3)'
    ],
    [
      'Day 4',
      'Saturday, 24-Oct-2026',
      'Visitor Passes & Leasing Document Suite',
      'Digital LOI Term Sheet Generator, Space Listing Partner Builder, Visitor Management QR Passes, Daily Site Activity Log.',
      'COMMITTED (Day 4)'
    ],
    [
      'Day 5',
      'Sunday, 25-Oct-2026',
      'Compliance Vault & Dispute Desk',
      'Statutory Compliance Document Vault with Automated Municipal Alerts, Digital Dispute Desk, Vendor Ratings & Commissions.',
      'COMMITTED (Day 5)'
    ],
    [
      'Day 6',
      'Monday, 26-Oct-2026',
      'Security Hardening & Full Regression Pass',
      'End-to-End Multi-Tenant Security Penetration Test, Pre-UAT Full Platform Regression Pass across all 9 portals.',
      'COMMITTED (Day 6)'
    ],
    [
      'Day 7',
      'Tuesday, 27-Oct-2026',
      'Core Platform UAT Walkthrough & Go-Live',
      'Live Client UAT Demonstration Walkthrough (45 mins), Production DNS Cutover, Database Seeding & Core Platform Handover.',
      'COMMITTED (Day 7 / CORE GO-LIVE)'
    ]
  ];

  sprintTimelineData.forEach((row, i) => addDataRow(row, statusSprint, i % 2 === 0));
  addSpacer();

  // =================================================================================================
  // 7. AI SUITE DEPLOYMENT ROADMAP (DAYS 8 TO 15: 28-OCT TO 04-NOV)
  // =================================================================================================
  addSectionHeader('6. AI SUITE IMPLEMENTATION ROADMAP (DAYS 8 TO 15)', 'Wednesday 28-Oct to Wednesday 04-Nov-2026 (Post-Core Go-Live)', 'FF86198F'); // Deep Magenta/Purple
  addTableHeaders(['AI Phase', 'Target Date Window', 'AI Module Name', 'Technical Scope & Flow Description', 'Target Deliverable Output'], 'FF701A75');

  const aiRoadmapData = [
    [
      'AI Phase 1',
      'Days 8–9 (28–29 Oct 2026)',
      'AI Commercial Lease Deed OCR & Key Clause Extraction',
      'Automated PDF lease deed parser extracting rent, lock-in, escalation dates, and deposit directly into database records.',
      'AI Lease Extraction Live'
    ],
    [
      'AI Phase 2',
      'Days 10–11 (30–31 Oct 2026)',
      'AI Executive Narrative MIS Auto-Commentary Engine',
      'LLM generating monthly executive commentary summarizing occupancy fluctuations, collections, and WALE trends.',
      'AI MIS Commentary Live'
    ],
    [
      'AI Phase 3',
      'Days 12–13 (01–02 Nov 2026)',
      'AI Commercial Lease Vacancy & Expiry ML Predictor',
      'Machine learning model forecasting tenant lease renewal likelihood 180 days prior to expiry based on payment history.',
      'AI Vacancy Predictor Live'
    ],
    [
      'AI Phase 4',
      'Days 13–14 (02–03 Nov 2026)',
      'AI IoT & Equipment Predictive Maintenance Anomaly Alerts',
      'Algorithmic anomaly detection for chiller run hours, DG fuel burn, and lift trips to trigger preventive servicing.',
      'AI Predictive PPM Live'
    ],
    [
      'AI Phase 5',
      'Days 14–15 (03–04 Nov 2026)',
      'Tenant 24/7 AI Concierge & Smart Helpdesk Bot',
      'Natural language assistant answering tenant queries regarding building rules, amenities, and logging tickets + Final AI Handover.',
      'AI Concierge & Final Handover'
    ]
  ];

  aiRoadmapData.forEach((row, i) => addDataRow(row, statusAIRoadmap, i % 2 === 0));

  // Output paths
  const filenames = [
    'OfficeX_Pending_Features_and_7Day_Timeline.xlsx',
    'OfficeX_Status_and_7Day_Completion_Plan.xlsx'
  ];

  const desktopDir = "c:\\one drive folder\\Desktop";
  const projectDir = path.resolve(__dirname, '..');

  for (const filename of filenames) {
    const projPath = path.join(projectDir, filename);
    try {
      await workbook.xlsx.writeFile(projPath);
      console.log("Successfully saved project file:", projPath);
    } catch (e) {
      console.warn("Could not overwrite locked project file (" + filename + "), saving as _Updated.xlsx");
      const altProjPath = path.join(projectDir, filename.replace('.xlsx', '_Updated.xlsx'));
      await workbook.xlsx.writeFile(altProjPath);
      console.log("Saved alternative project file:", altProjPath);
    }

    const deskPath = path.join(desktopDir, filename);
    try {
      await workbook.xlsx.writeFile(deskPath);
      console.log("Successfully saved desktop file:", deskPath);
    } catch (e) {
      console.warn("Could not overwrite desktop file (" + filename + "):", e.message);
      const altDeskPath = path.join(desktopDir, filename.replace('.xlsx', '_Updated.xlsx'));
      try {
        await workbook.xlsx.writeFile(altDeskPath);
        console.log("Saved alternative desktop file:", altDeskPath);
      } catch (err) {}
    }
  }

  // Also export CSV cleanly
  let csv = '';
  ws.eachRow(row => {
    const vals = [];
    row.eachCell({ includeEmpty: true }, (c, colNumber) => {
      if (colNumber <= 5) {
        const text = c.text || '';
        vals.push('"' + String(text).replace(/"/g, '""') + '"');
      }
    });
    csv += vals.join(',') + '\n';
  });

  const csvProj = path.join(projectDir, 'OfficeX_Pending_Features_and_7Day_Timeline.csv');
  fs.writeFileSync(csvProj, csv);
  try {
    fs.writeFileSync(path.join(desktopDir, 'OfficeX_Pending_Features_and_7Day_Timeline.csv'), csv);
  } catch (e) {}

  console.log("All styled Excel workbooks and CSVs generated successfully with ExcelJS!");
}

generateStyledPendingAndTimelineExcel().catch(err => {
  console.error("Error generating styled Excel:", err);
});
