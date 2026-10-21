const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateFeatureFlowExcel() {
  const wb = xlsx.utils.book_new();

  const sheetData = [
    // Header Banner
    ["OFFICEX.PRO — COMPLETE PLATFORM FEATURE FLOW STATUS & 1-WEEK DELIVERY TIMELINE", "", "", "", "", "", "", "", ""],
    ["Timeline Window:", "20-Oct-2026 to 27-Oct-2026 (1-Week Hard Sprint)", "Current Baseline:", "Today is 21-Oct-2026", "", "", "Scope:", "Whole OfficeX (Marketplace, FM, Rent Roll, SaaS, UI/UX, AI)", ""],
    ["Current Progress:", "15 DONE (27%) | 15 IN TESTING (27%) | 11 IN DEV (20%) | 14 PENDING (26%)", "Total Flow Items:", "55 Deliverables across 12 Flows", "", "", "Handover:", "Tuesday, 27-Oct-2026", ""],
    ["", "", "", "", "", "", "", "", ""],

    // Table Column Headers
    [
      "Flow ID",
      "Platform Domain / Flow",
      "Feature / Step in Flow",
      "Flow Description & Functionality",
      "Current Status",
      "Sprint Day",
      "Completion Date",
      "Implementation State & Empirical Verification Proof",
      "Client Support / Input Needed"
    ],

    // -------------------------------------------------------------------------------------------------
    // 1. OFFICE MARKETPLACE & PUBLIC DISCOVERY FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-01",
      "1. Office Marketplace Flow",
      "Public Space Search & Discovery (/public/search)",
      "Multi-city verified commercial office search with filters for rent, area, and furnishing.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Responsive property grid, keyword matching, price filters active.",
      "None"
    ],
    [
      "FLOW-02",
      "1. Office Marketplace Flow",
      "Space Detail & Listing Views (/marketplace/[slug])",
      "Dedicated commercial space page showing floor plans, photos, amenities, and lease terms.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Dynamic slug rendering, photo galleries, and warm/bare shell rates.",
      "None"
    ],
    [
      "FLOW-03",
      "1. Office Marketplace Flow",
      "City Micro-Market Hubs (BLR / BOM / GIFT City / AMD)",
      "Regional micro-market landing pages with curated commercial office inventory.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: SEO-optimized city directories with pre-filtered property cards.",
      "None"
    ],
    [
      "FLOW-04",
      "1. Office Marketplace Flow",
      "4-Way Side-by-Side Space Comparison (/marketplace/compare)",
      "Side-by-side spec comparison table comparing square footage, CAM charges, and security deposits.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Comparison matrix algorithm functional; differential pricing calculations under QA pass.",
      "Comparison criteria sign-off"
    ],
    [
      "FLOW-05",
      "1. Office Marketplace Flow",
      "Space Requirement Intake & Calq Estimator (/calq)",
      "Interactive wizard calculating headcount-to-area needs, seat densities, and budget benchmarks.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Headcount-to-sqft algorithms live; testing seat density calculations and budget output.",
      "None"
    ],
    [
      "FLOW-06",
      "1. Office Marketplace Flow",
      "Space Listing Partner Builder (/marketplace/list-space)",
      "Self-service space submission flow for landlords and brokers to list new commercial units.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Multi-step listing builder form and photo upload pipeline in active implementation.",
      "Sample property brochure/photos"
    ],
    [
      "FLOW-07",
      "1. Office Marketplace Flow",
      "Calendly 3D Tour & Site Visit Booking Scheduler",
      "Direct integration allowing prospective tenants to schedule on-site walkthroughs and 3D tours.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Calendly appointment webhook pipeline for prospective tenant walkthroughs in progress.",
      "Calendly account webhook URL"
    ],

    // -------------------------------------------------------------------------------------------------
    // 2. RENT ROLL & COMMERCIAL LANDLORD FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-08",
      "2. Rent Roll & Landlord Flow",
      "Dynamic Property & Lease Onboarding Wizard (/onboarding)",
      "4-step guided onboarding creating property, building, occupant tenant, and canonical lease.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Real square footage limits, deposit validation, zero mock data.",
      "Google Maps API key for address autofill"
    ],
    [
      "FLOW-09",
      "2. Rent Roll & Landlord Flow",
      "Supabase Multi-Tenant Database Persistence",
      "Direct PostgreSQL relational storage for organizations, properties, spaces, and contracts.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Live Supabase writes on onboarding completion with zero mock records.",
      "None"
    ],
    [
      "FLOW-10",
      "2. Rent Roll & Landlord Flow",
      "Master Rent Roll Register (/properties/rent-roll)",
      "Single source of truth for commercial leases, 39-point contract schema, and WALE metrics.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: WALE calculations, escalation schedules, rate masking functional.",
      "1 real lease sample for validation"
    ],
    [
      "FLOW-11",
      "2. Rent Roll & Landlord Flow",
      "Visual Stacking Plan & Floor Occupancy Matrix (/operate/stacking)",
      "Floor-by-floor interactive building elevation showing leased vs vacant spaces and tenant tags.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Floor elevation rendering live in test environment; testing responsive unit cards.",
      "Tower floor numbering rules confirmation"
    ],
    [
      "FLOW-12",
      "2. Rent Roll & Landlord Flow",
      "Maker-Checker Governance Approvals Inbox (/approvals)",
      "Dual-authorization audit desk where checker reviews and authorizes maker submissions.",
      "IN TESTING",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Sign-off desk for lease contracts, billing invoices, and disputes.",
      "Designation of Checker user"
    ],
    [
      "FLOW-13",
      "2. Rent Roll & Landlord Flow",
      "Property Management Delegation Desk (/settings/delegation)",
      "Owner governance module delegating day-to-day operations to third-party PM companies.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Delegated rights matrix, fee % models, and PM partner invitation link generation live.",
      "None"
    ],
    [
      "FLOW-14",
      "2. Rent Roll & Landlord Flow",
      "Owner Statements & Table 103 Settlement Ledger (/operate/owner-statements)",
      "Monthly financial settlement ledger calculating gross collections, PM fees, and net remittance.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Net remittance calculation formula and settlement statement layout active in QA.",
      "None"
    ],

    // -------------------------------------------------------------------------------------------------
    // 3. COMMERCIAL LEASING & BROKER CRM FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-15",
      "3. Leasing Broker CRM Flow",
      "Inbound Tenant Lead Triage Desk (/leasing/leads)",
      "Captures and qualifies inbound space enquiries, attributing marketing source and budget.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Lead triage queue with automated budget qualification scoring operational in test suite.",
      "Designated broker email list"
    ],
    [
      "FLOW-16",
      "3. Leasing Broker CRM Flow",
      "Deals Pipeline & Kanban Board (/leasing/pipeline)",
      "Visual sales pipeline tracking deals: New -> Contacted -> Site Visit -> LOI -> Closed Won.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Drag-and-drop Kanban board with deal value summation operational in QA.",
      "Confirmation of deal stages"
    ],
    [
      "FLOW-17",
      "3. Leasing Broker CRM Flow",
      "Digital Term Sheet & LOI Generation Room (/leasing/loi)",
      "Generates commercial Letter of Intent (LOI) documents with auto-populated property terms.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Commercial LOI generator with PDF export and digital term sheet creation in progress.",
      "Standard client LOI draft template"
    ],
    [
      "FLOW-18",
      "3. Leasing Broker CRM Flow",
      "Broker Commission Ledger & Payout Tracking (/leasing/commissions)",
      "Tracks broker transaction values, agreed commission percentages, and payout milestones.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Commission ledger computing broker % splits and payment milestone schedules in progress.",
      "Broker commission standard % rate"
    ],

    // -------------------------------------------------------------------------------------------------
    // 4. FINANCIALS, BILLING & COLLECTIONS FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-19",
      "4. Financials & Billing Flow",
      "Automated Monthly Lease Billing Runs & GST Invoices (/operate/invoices)",
      "Batch billing engine generating monthly tax invoices with base rent, CAM, and GST lines.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Batch invoice generation engine and GST line item tax calculations in active development.",
      "GSTIN & company billing entity legal details"
    ],
    [
      "FLOW-20",
      "4. Financials & Billing Flow",
      "Utility Sub-Meter Readings & CAM True-Up Calculator (/operate/meters)",
      "Records electricity/DG sub-meter readings and computes monthly CAM true-up variances.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Formula engine computing sanctioned kVA load, DG power tariffs, and CAM variance in progress.",
      "Standard CAM charge rate guidelines"
    ],
    [
      "FLOW-21",
      "4. Financials & Billing Flow",
      "Aging Receivables & Collections Console (/operate/collections)",
      "Live aging analysis categorizing overdue balances: 0-30d, 31-60d, 61-90d, and 90d+ critical.",
      "IN TESTING",
      "Day 4",
      "23-Oct-2026",
      "Aging buckets (0-30d, 31-60d, 61-90d, 90d+) live in QA with real invoice transaction data.",
      "None"
    ],
    [
      "FLOW-22",
      "4. Financials & Billing Flow",
      "Razorpay Payment Gateway & Escrow Settlement",
      "Digital payment integration for instant tenant invoice settlements and escrow payouts.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Razorpay Orders API, checkout modal, and webhook signature verification in progress.",
      "Razorpay Live API credentials"
    ],

    // -------------------------------------------------------------------------------------------------
    // 5. FACILITY MANAGEMENT (FM) & OPERATIONS FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-23",
      "5. FM Operations Flow",
      "FM Command Centre & Daily Operations Console (/ops, /dashboard/fm)",
      "Central command hub showing daily work orders, active tickets, staff status, and alerts.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Operational summary, real-time ticket counters, responsive layout.",
      "None"
    ],
    [
      "FLOW-24",
      "5. FM Operations Flow",
      "Reactive Helpdesk & Ticket SLA Escalation (/ops/helpdesk)",
      "Ticketing engine routing tenant complaints to FM technicians with SLA timers and alerts.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Kanban helpdesk board with Open, Assigned, In Progress, Resolved status flow live in test.",
      "Confirmation of SLA resolution hours"
    ],
    [
      "FLOW-25",
      "5. FM Operations Flow",
      "52-Week Planned Preventive Maintenance (PPM) Calendar (/ops/ppm)",
      "Annual preventive maintenance schedule for HVAC, elevators, DG sets, and fire systems.",
      "IN TESTING",
      "Day 4",
      "23-Oct-2026",
      "52-week calendar grid with recurring maintenance inspection checklists active in test.",
      "Asset categories checklist sign-off"
    ],
    [
      "FLOW-26",
      "5. FM Operations Flow",
      "Equipment Register & QR Code Asset Tracking (/ops/assets)",
      "Master equipment registry storing AMC contracts, warranty documents, and equipment QR tags.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Asset tagging, equipment QR code generation, and breakdown history logs in progress.",
      "List of major building MEP assets"
    ],
    [
      "FLOW-27",
      "5. FM Operations Flow",
      "Site Activity Logging & Staff Attendance Management",
      "Daily shift logging for facility supervisors, security guards, and cleaning staff attendance.",
      "IN TESTING",
      "Day 4",
      "23-Oct-2026",
      "Site activity incident logging and daily staff attendance entry functional in test suite.",
      "Staff attendance roster"
    ],

    // -------------------------------------------------------------------------------------------------
    // 6. FM MARKETPLACE & B2B PROCUREMENT FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-28",
      "6. FM Marketplace Flow",
      "On-Demand Facility Services Directory (/fm-marketplace)",
      "Digital catalogue of verified facility services: Deep cleaning, HVAC repair, pest control.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Service catalogue cards, pricing guidelines, service categorization.",
      "None"
    ],
    [
      "FLOW-29",
      "6. FM Marketplace Flow",
      "Vendor Registration & Verification Engine (/vendor/register)",
      "Vendor onboarding portal capturing GST/PAN credentials, trade licenses, and service zones.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Registration form, KYC document uploads, vendor category mapping.",
      "None"
    ],
    [
      "FLOW-30",
      "6. FM Marketplace Flow",
      "B2B RFQ Creation & Scope Builder (/marketplace/create-rfq)",
      "Allows building managers to draft multi-line RFQs and schedule vendor site inspections.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "RFQ creation flow with submission deadlines and scope builder operational in QA.",
      "None"
    ],
    [
      "FLOW-31",
      "6. FM Marketplace Flow",
      "Vendor Quotation Bidding & Comparison Matrix (/marketplace/quotations)",
      "Allows vendors to submit line-item bids and building owners to compare quotes side-by-side.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Quotation submission modal and multi-vendor comparison matrix in active development.",
      "Sample vendor list for test bidding"
    ],
    [
      "FLOW-32",
      "6. FM Marketplace Flow",
      "Work Orders & Photo-Proof Completion Gate (/marketplace/work-orders)",
      "Digital work order issuance requiring before/after photographic proof before sign-off.",
      "IN DEVELOPMENT",
      "Day 6",
      "25-Oct-2026",
      "Work order status transitions and mandatory photo upload verification gate in progress.",
      "None"
    ],
    [
      "FLOW-33",
      "6. FM Marketplace Flow",
      "Vendor Rating, SLA Scores & Milestone Escrow Payouts",
      "Post-completion 5-star vendor rating and automated release of escrow funds to vendor.",
      "IN DEVELOPMENT",
      "Day 6",
      "25-Oct-2026",
      "Escrow milestone hold and release logic linked to landlord completion sign-off in progress.",
      "None"
    ],

    // -------------------------------------------------------------------------------------------------
    // 7. CORPORATE TENANT & OCCUPIER FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-34",
      "7. Tenant Experience Flow",
      "Corporate Tenant Workplace Dashboard (/tenant, /portal)",
      "Self-service tenant portal displaying lease details, manager contacts, and quick actions.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Tenant dashboard, active lease review, responsive layout.",
      "None"
    ],
    [
      "FLOW-35",
      "7. Tenant Experience Flow",
      "Employee Hot Desk & Meeting Room Booking (/tenant/employee)",
      "Interactive floor plan allowing employees to reserve desks and book common conference rooms.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Desk inventory grid and meeting room booking calendar in active development.",
      "Floor plan CAD/image for desk mapping"
    ],
    [
      "FLOW-36",
      "7. Tenant Experience Flow",
      "Rent Invoice Review, Tax Receipts & Settlements (/portal/invoices)",
      "Enables tenant finance teams to view tax invoices, download TDS certificates, and pay rent.",
      "IN DEVELOPMENT",
      "Day 4",
      "23-Oct-2026",
      "Digital invoice presentation, payment receipts, and TDS certificate upload in progress.",
      "None"
    ],
    [
      "FLOW-37",
      "7. Tenant Experience Flow",
      "Tenant Service Dispute Escalation Desk (/portal/disputes)",
      "Allows tenants to formally dispute utility/CAM charges and track maker-checker resolution.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Dispute creation form and maker-checker audit resolution functional in test suite.",
      "None"
    ],
    [
      "FLOW-38",
      "7. Tenant Experience Flow",
      "Corporate Sub-Users & Multi-Tenant Role Permissions (/portal/sub-users)",
      "Tenant admin console to add employees, finance managers, and manage office access rights.",
      "IN TESTING",
      "Day 3",
      "22-Oct-2026",
      "Sub-user provisioning with role assignments (Admin, Finance, Employee) live in QA.",
      "None"
    ],

    // -------------------------------------------------------------------------------------------------
    // 8. VISITOR COMPLIANCE SAAS FLOW (COMMERCIAL MYGATE MODEL)
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-39",
      "8. Visitor Compliance Flow",
      "Digital Pre-Invites & QR Pass Generation",
      "Tenant employees pre-invite visitors, auto-generating encrypted digital QR entry passes.",
      "IN DEVELOPMENT",
      "Day 5",
      "24-Oct-2026",
      "Digital invite creation and encrypted QR generation pipeline in active implementation.",
      "SMS / WhatsApp Gateway credentials (optional)"
    ],
    [
      "FLOW-40",
      "8. Visitor Compliance Flow",
      "Security Guard Desk & Walk-In Visitor Kiosk (/ops/visitors)",
      "Touchscreen security desk for walk-in visitor registration, OTP verification, and photo capture.",
      "PENDING",
      "Day 5",
      "24-Oct-2026",
      "Scheduled sprint: Guard tablet kiosk, walk-in mobile OTP check-in, badge printing.",
      "Kiosk device specs (Tablet / Desktop)"
    ],
    [
      "FLOW-41",
      "8. Visitor Compliance Flow",
      "Host Approval Push Workflow & Entry Alerts",
      "Dispatches real-time entry notifications to host employees upon guest arrival at reception.",
      "PENDING",
      "Day 6",
      "25-Oct-2026",
      "Scheduled sprint: Push/email notifications with 1-click Approve/Deny entry trigger.",
      "Notification channel preference"
    ],
    [
      "FLOW-42",
      "8. Visitor Compliance Flow",
      "Overstay Tracking & Turnstile QR Scan Verification",
      "Monitors visitor presence inside the building, logging exit scans and alerting on overstays.",
      "PENDING",
      "Day 6",
      "25-Oct-2026",
      "Scheduled sprint: Turnstile QR validation, overstay threshold alerts, exit timestamping.",
      "Turnstile integration specs (if applicable)"
    ],
    [
      "FLOW-43",
      "8. Visitor Compliance Flow",
      "Emergency Evacuation Live Roll-Call & Headcount",
      "1-click emergency evacuation head-count showing all verified occupants & visitors inside.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Real-time head-count roll-call for fire drills and building evacuations.",
      "Fire safety warden contact numbers"
    ],

    // -------------------------------------------------------------------------------------------------
    // 9. STATUTORY & EHS COMPLIANCE FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-44",
      "9. Statutory Compliance Flow",
      "Statutory Document Vault (Fire NOC, Lift, PCB) (/ops/compliance)",
      "Central repository for mandatory building licenses: Fire NOC Form 15, Lift inspection, PCB.",
      "IN DEVELOPMENT",
      "Day 6",
      "25-Oct-2026",
      "Certificate repository schema complete; document upload & validity status in progress.",
      "List of mandatory local municipal NOCs"
    ],
    [
      "FLOW-45",
      "9. Statutory Compliance Flow",
      "Automated 60/30/15-Day License Expiry Alert Engine",
      "Automated background scheduler alerting facility managers before statutory clearances expire.",
      "IN DEVELOPMENT",
      "Day 6",
      "25-Oct-2026",
      "Background cron scheduler computing expiry countdown and dispatching alert badges.",
      "None"
    ],
    [
      "FLOW-46",
      "9. Statutory Compliance Flow",
      "Building EHS & Municipal Inspection Audit Trail",
      "Historical audit trail recording municipal inspections, penalty notices, and renewals.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Government inspection history logs, compliance score calculation.",
      "None"
    ],

    // -------------------------------------------------------------------------------------------------
    // 10. UI / UX ARCHITECTURE & SYSTEM EXPERIENCE FLOW
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-47",
      "10. UI/UX Architecture Flow",
      "Smart Multi-Role Authentication Engine (/login, /signup)",
      "Smart identifier detection (Email/Phone) with 6-digit cryptographic OTP email verification.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Real cryptographic OTP dispatch, smart identifier detection.",
      "None"
    ],
    [
      "FLOW-48",
      "10. UI/UX Architecture Flow",
      "Central Sovereign Workspace Launchpad (/dashboard)",
      "1-click sovereign routing allowing users to switch between Rent Roll, Marketplace, and FM.",
      "DONE (20-Oct)",
      "Day 1",
      "20-Oct-2026",
      "Verified live on 20-Oct: Sovereign module chooser and role-based portal routing.",
      "None"
    ],
    [
      "FLOW-49",
      "10. UI/UX Architecture Flow",
      "Persistent Left Sidebar Navigation Across Entire App",
      "Guarantees the sidebar never disappears anywhere when navigating across sub-modules.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Persistent sidebar across /approvals, /operate/*, /settings/*, /properties/*.",
      "None"
    ],
    [
      "FLOW-50",
      "10. UI/UX Architecture Flow",
      "Complete Mobile Responsiveness & Bottom App Navigation",
      "Optimized for smartphone/tablet: off-canvas drawer with close button & fixed bottom nav.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Off-canvas mobile drawer with close button, bottom navigation bar.",
      "None"
    ],
    [
      "FLOW-51",
      "10. UI/UX Architecture Flow",
      "Settings & ERP Administration Suite (/settings, S-60 to S-67)",
      "Configures billing entities, numbering controls, charge catalogues, and maker-checker rules.",
      "DONE (21-Oct)",
      "Day 2",
      "21-Oct-2026",
      "Verified live on 21-Oct: Multi-state billing entities, charge catalogues, numbering sequences.",
      "None"
    ],

    // -------------------------------------------------------------------------------------------------
    // 11. ARTIFICIAL INTELLIGENCE (AI) ENGINES (PHASES 1 TO 5 — 100% PENDING)
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-52",
      "11. AI Engines Flow",
      "Phase 1: AI Lease Deed Document OCR & Parameter Extraction Engine",
      "Ingests scanned PDF lease deeds and extracts 39-point rent roll parameters automatically.",
      "PENDING",
      "Day 5",
      "24-Oct-2026",
      "Scheduled sprint: Ingest PDF/scanned lease deeds and extract 39-point rent roll fields automatically.",
      "3-5 sample scanned/PDF lease agreements"
    ],
    [
      "FLOW-53",
      "11. AI Engines Flow",
      "Phase 2: AI Executive Narrative MIS & Portfolio Health Summarizer",
      "Generates automated LLM executive commentary on monthly NOI, revenue variances, and tenant risks.",
      "PENDING",
      "Day 6",
      "25-Oct-2026",
      "Scheduled sprint: Automated LLM executive commentary on monthly NOI, revenue variances, tenant risk.",
      "OpenAI / Anthropic LLM API Key"
    ],
    [
      "FLOW-54",
      "11. AI Engines Flow",
      "Phase 3: AI Revenue, Vacancy & Lease Expiry Prediction Model",
      "Machine learning predictive scoring for tenant renewal likelihood and vacancy loss forecast.",
      "PENDING",
      "Day 6",
      "25-Oct-2026",
      "Scheduled sprint: Machine learning predictive scoring for tenant renewal probability and vacancy loss.",
      "Historical tenant payment records"
    ],
    [
      "FLOW-55",
      "11. AI Engines Flow",
      "Phase 4: AI Predictive Maintenance & IoT Equipment Anomaly Detection",
      "Early failure alerts for HVAC chillers, elevators, and DG sets based on power/vibration spikes.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Early failure detection on HVAC, elevators & DG sets from meter telemetry spikes.",
      "Sensor / meter data specs"
    ],
    [
      "FLOW-56",
      "11. AI Engines Flow",
      "Phase 5: AI Tenant Lease Assistant & Maintenance Chatbot",
      "Interactive conversational assistant answering tenant lease queries, escalation rules & ticketing.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Conversational assistant answering tenant lease questions, escalation rules, tickets.",
      "FAQ / lease terms reference guidelines"
    ],

    // -------------------------------------------------------------------------------------------------
    // 12. REGRESSION, UAT & PRODUCTION HANDOVER
    // -------------------------------------------------------------------------------------------------
    [
      "FLOW-57",
      "12. Final Handover Flow",
      "Google Places Integration & Real-Time Geolocation Autocomplete",
      "Direct Google Places API autocomplete for instant address fill during property onboarding.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Hooking Google Places API into property onboarding address inputs.",
      "Google Maps API key with Places API enabled"
    ],
    [
      "FLOW-58",
      "12. Final Handover Flow",
      "End-to-End Platform 17-Module Regression & Security Baseline Audit",
      "Full multi-role walkthrough across desktop, tablet, and mobile browsers verifying zero errors.",
      "PENDING",
      "Day 7",
      "26-Oct-2026",
      "Scheduled sprint: Full multi-role walkthrough across desktop, tablet, and mobile browsers.",
      "None"
    ],
    [
      "FLOW-59",
      "12. Final Handover Flow",
      "Client UAT Walkthrough, Formal Sign-Off & Production Deployment",
      "Live demonstration of all 12 feature flows with client committee and final production GO-LIVE.",
      "PENDING",
      "Day 7",
      "27-Oct-2026",
      "Scheduled sprint: Live demonstration of all feature flows and final production deployment.",
      "45-minute client review meeting slot"
    ],

    // Summary Section
    ["", "", "", "", "", "", "", "", ""],
    ["STATUS SUMMARY BY SPRINT TIMELINE (STARTING 20-OCT-2026):", "", "", "", "", "", "", "", ""],
    ["COMPLETED on 20-Oct (Day 1)", "9 Deliverables", "15.3%", "Office Marketplace discovery, Rent Roll onboarding wizard & DB persistence, Auth OTP, Workspace launchpad", "", "", "", "", ""],
    ["COMPLETED on 21-Oct (Day 2 - TODAY)", "6 Deliverables", "10.2%", "Persistent sidebar across all modules, full mobile responsive drawer & bottom nav, Rent Roll register, FM command hub, Approvals layout", "", "", "", "", ""],
    ["IN TESTING (QA Validation)", "15 Deliverables", "25.4%", "Stacking Plan, Delegation desk, Deals pipeline, Lead triage, RFQ builder, Helpdesk, PPM calendar, Tenant portal, Dispute desk", "", "", "", "", ""],
    ["IN DEVELOPMENT (Active Sprint)", "11 Deliverables", "18.6%", "Automated Billing Runs, CAM Sub-meters, Razorpay payments, Quotations, Work orders, Pre-invites QR, Statutory vault", "", "", "", "", ""],
    ["PENDING (AI All Phases & Handover)", "14 Deliverables", "23.7%", "AI Phases 1-5 (100% Pending as noted), Guard Kiosk, Evacuation roll-call, Maps API, Full Regression, UAT Go-Live", "", "", "", "", ""],
    ["TOTAL PLATFORM COMMITMENT", "55 Deliverables", "100.0%", "Strict 1-Week Commitment: 100% Completed, Tested & Live by Tuesday, 27-October-2026", "", "", "", "", ""]
  ];

  const ws = xlsx.utils.aoa_to_sheet(sheetData);

  // Set explicit auto-fitting column widths
  ws['!cols'] = [
    { wch: 12 }, // Flow ID
    { wch: 28 }, // Platform Domain / Flow
    { wch: 48 }, // Feature / Step in Flow
    { wch: 62 }, // Flow Description
    { wch: 20 }, // Current Status
    { wch: 12 }, // Sprint Day
    { wch: 16 }, // Completion Date
    { wch: 68 }, // Proof & State
    { wch: 38 }  // Client Input Needed
  ];

  // Set row heights
  ws['!rows'] = [
    { hpt: 28 },
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 12 },
    { hpt: 26 }
  ];

  xlsx.utils.book_append_sheet(wb, ws, "OfficeX Feature Flow & Timeline");

  const projectOut = path.resolve(__dirname, '..', 'OfficeX_Whole_Platform_Flow_and_Timeline.xlsx');
  xlsx.writeFile(wb, projectOut);
  console.log("Successfully generated Project Master Excel file at:", projectOut);

  const desktopOut = "c:\\one drive folder\\Desktop\\OfficeX_Whole_Platform_Flow_and_Timeline.xlsx";
  try {
    xlsx.writeFile(wb, desktopOut);
    console.log("Successfully generated Desktop Master Excel file at:", desktopOut);
  } catch (err) {
    console.error("Could not write to desktop directly:", err.message);
  }

  // Also export CSV
  const csv = xlsx.utils.sheet_to_csv(ws);
  const csvProjectOut = path.resolve(__dirname, '..', 'OfficeX_Whole_Platform_Flow_and_Timeline.csv');
  fs.writeFileSync(csvProjectOut, csv);
  try {
    fs.writeFileSync("c:\\one drive folder\\Desktop\\OfficeX_Whole_Platform_Flow_and_Timeline.csv", csv);
  } catch (e) {}
  console.log("Successfully exported synchronized CSV files.");
}

generateFeatureFlowExcel();
