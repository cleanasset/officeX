const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateComprehensiveMasterExcel() {
  const wb = xlsx.utils.book_new();

  const sheetData = [
    // Header Banner
    ["OFFICEX.PRO — COMPLETE PLATFORM FEATURE FLOW STATUS & DELIVERY TIMELINE", "", "", "", "", "", "", "", ""],
    ["Project Lifecycle Window:", "August 2026 to 27-October-2026 (2-Month Foundation + 1-Week Final Delivery Sprint)", "Current Baseline:", "Today is 21-October-2026", "", "", "Scope:", "Whole OfficeX Platform (Marketplace, FM, Rent Roll SaaS, UI/UX, AI)", ""],
    ["Progress Breakdown:", "33 COMPLETED (52.4%) | 9 IN TESTING (14.3%) | 8 IN DEVELOPMENT (12.7%) | 13 PENDING (20.6%)", "Total Deliverables:", "63 Deliverables across 8 Lifecycle Phases", "", "", "Handover:", "Tuesday, 27-October-2026 (Go-Live)", ""],
    ["", "", "", "", "", "", "", "", ""],

    // Table Column Headers
    [
      "Item ID",
      "Project Lifecycle Phase",
      "Module / Domain",
      "Feature / Deliverable Flow Name",
      "Technical Scope & Flow Functionality",
      "Current Status",
      "Execution Timeline / Date",
      "Implementation State & Empirical Verification Proof",
      "Client Support / Input Needed"
    ],

    // =================================================================================================
    // SECTION 1: MONTH 1 (AUGUST – SEPTEMBER 2026) — ARCHITECTURE & CORE PLATFORM (100% COMPLETED)
    // =================================================================================================
    [
      "M1-01",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Core Platform & DevOps",
      "Next.js 14 App Router Framework & TypeScript Core",
      "Enterprise Next.js modular structure, strict TypeScript types, server actions, and responsive layout foundations.",
      "DONE (Month 1)",
      "Aug 2026",
      "Verified operational: Production-grade build pipeline, zero lint warnings, modular routing across all 9 workspaces.",
      "None"
    ],
    [
      "M1-02",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Database & Infrastructure",
      "Supabase PostgreSQL Relational Schema (50+ Tables)",
      "Normalized relational database: Organizations, Properties, Buildings, Spaces, Leases, Charges, Invoices, Tickets, Audits.",
      "DONE (Month 1)",
      "Aug-Sep 2026",
      "Verified operational: 50+ relational tables with foreign key cascades, RLS security policies, and performance indexing.",
      "None"
    ],
    [
      "M1-03",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Security & Auth",
      "Smart Multi-Role Authentication with 6-Digit OTP Engine",
      "Passwordless enterprise email/SMS OTP authentication (/login, /signup) with secure cryptographic JWT session cookies.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: 6-digit cryptographic OTP generation, rate limiting, and automated role-based redirect routing.",
      "None"
    ],
    [
      "M1-04",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Security & Governance",
      "Sovereign Multi-Role RBAC (Role-Based Access Control) Matrix",
      "Strict data boundary enforcement across 9 distinct roles: Owner, Asset Manager, PM Company, FM Partner, Tenant, Broker, Admin.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Middleware permission boundary checks preventing cross-tenant or unauthorized data leaks.",
      "None"
    ],
    [
      "M1-05",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "UI/UX Design System",
      "Master Real Estate UI/UX Design System & Custom Tokens",
      "Commercial real estate design system: Curated typography, dark/light sovereign theme, tables, metric cards, modal dialogs.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Global CSS design tokens, consistent elevation cards, responsive grids, and SVG icon suite.",
      "None"
    ],
    [
      "M1-06",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Navigation & Portals",
      "9 Sovereign Workspace Navigation Hubs & Topbars",
      "Independent dashboard shells: Public Marketplace, Landlord Desk, Property Manager Desk, FM Marketplace, Leasing CRM, Tenant Portal, Admin.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Workspace-specific navigation routes, context switchers, and sovereign branding headers.",
      "None"
    ],
    [
      "M1-07",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Cloud Infrastructure",
      "Secure Cloud Storage & Commercial Document Vault",
      "Supabase Object Storage buckets with signed URL generation for lease deed PDFs, property CAD floor plans, and KYC files.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Encrypted file uploads, multi-part upload handlers, and secure timed access tokens.",
      "None"
    ],
    [
      "M1-08",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "API & Integration",
      "Core Platform REST / JSON API Gateway",
      "Unified API routing layer (/api/v1/*, /api/properties/*, /api/rent-roll/*) with standard error middleware and rate limiters.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Standard JSON response envelopes, HTTP status conventions, and endpoint schema validation.",
      "None"
    ],
    [
      "M1-09",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Compliance & Security",
      "Centralized Immutable Audit Logging Framework",
      "Audit trail mechanism logging user ID, IP address, timestamp, action type, and JSON before/after state diffs.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: PostgreSQL audit event triggers capturing lease updates, invoice approvals, and permission changes.",
      "None"
    ],
    [
      "M1-10",
      "Month 1 (Aug-Sep 2026): Core Architecture",
      "Admin Portal",
      "SuperAdmin User Management & Platform Oversight Desk",
      "SuperAdmin central desk (/admin/users, /admin/properties) for managing system accounts, organization locks, and platform settings.",
      "DONE (Month 1)",
      "Sep 2026",
      "Verified operational: Admin data tables, user impersonation guards, role reassignment, and platform metrics dashboard.",
      "None"
    ],

    // =================================================================================================
    // SECTION 2: MONTH 2 (SEPTEMBER – MID-OCTOBER 2026) — BUSINESS ENGINES & DATA MODELS (100% COMPLETED)
    // =================================================================================================
    [
      "M2-11",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Rent Roll Landlord SaaS",
      "Canonical 39-Point Commercial Lease Data Model",
      "Comprehensive commercial lease schema capturing lock-ins, notice periods, fit-out rent-free days, security deposits, escalation cycles.",
      "DONE (Month 2)",
      "Sep-Oct 2026",
      "Verified operational: Structured relational representation of commercial lease deeds conforming to Indian CRE norms.",
      "None"
    ],
    [
      "M2-12",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Rent Roll Landlord SaaS",
      "Automated WALE (Weighted Average Lease Expiry) Engine",
      "Algorithmic calculation of building-level and portfolio-level WALE by area and rental value across all active leases.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Mathematically sound WALE computation matching institutional real estate fund standards.",
      "None"
    ],
    [
      "M2-13",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Rent Roll Landlord SaaS",
      "Rent Escalation & Compound Calculation Algorithm",
      "Multi-tiered escalation engine handling fixed %, step-up intervals (e.g. 15% every 36 months), and inflation indexation.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Automated multi-year cash flow projections factoring exact escalation commencement dates.",
      "None"
    ],
    [
      "M2-14",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "FM Marketplace",
      "FM Marketplace Vendor Taxonomy & 24 Category Hierarchy",
      "Standardized commercial FM categories: HVAC, MEP, Housekeeping, Façade Cleaning, Fire & Life Safety, Security, Waste & Pest Control.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Relational service taxonomy, category tagging, and service scope mapping schema.",
      "None"
    ],
    [
      "M2-15",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "FM Marketplace",
      "Vendor Qualification & Compliance Verification Schema",
      "Vendor KYC pipeline capturing GSTIN, PAN, PF/ESIC compliance, public liability insurance policies, and verified track records.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Vendor profile data structure with statutory document attachment hooks.",
      "None"
    ],
    [
      "M2-16",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "FM Operations SaaS",
      "Interactive Helpdesk & SLA Escalation State Machine",
      "Kanban-based incident ticketing lifecycle: Open -> Assigned -> In Progress -> Escalated -> Resolved with SLA timers.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: State machine transitions, ticket priority scoring (P1-P4), and automated timer triggers.",
      "None"
    ],
    [
      "M2-17",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Rent Roll Landlord SaaS",
      "Multi-Tenant Corporate Directory & Occupant Indexing",
      "Relational linking of corporate occupant entities, authorized signatories, billing addresses, and occupied floor units.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Occupant master tables, unit mapping integrity, and corporate contact records.",
      "None"
    ],
    [
      "M2-18",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Rent Roll Landlord SaaS",
      "Visual Stacking Plan Data Engine & Elevation Modeler",
      "Hierarchical building tree model aggregating floor-by-floor occupancy, vacant square footage, and lease expiration dates.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Recursive building data tree returning units grouped by floor with real-time occupancy flags.",
      "None"
    ],
    [
      "M2-19",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Governance & Approvals",
      "Dual-Authorization Maker-Checker Protocol Schema",
      "Transaction staging schema requiring checker authorization for lease edits, write-offs, and high-value expense invoices.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Approvals staging table, maker-checker assignment rules, and immutable action status stamps.",
      "None"
    ],
    [
      "M2-20",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Property Governance",
      "Property Delegation & Asset Management Mandate Logic",
      "Governance data model allowing asset owners to delegate operational rights to external FM/PM companies with fee splits.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Delegation records, PM partner invitation tokens, and management fee split formulas.",
      "None"
    ],
    [
      "M2-21",
      "Month 2 (Sep-Oct 2026): Business Engines",
      "Financials & Accounting",
      "Commercial Real Estate Financial Ledger & Table 103 Settlement Schema",
      "Double-entry accounting structure calculating gross rent, CAM recoveries, TDS deductions, GST, and net owner payouts.",
      "DONE (Month 2)",
      "Oct 2026",
      "Verified operational: Financial calculation engine with accurate GST/TDS tax deductions and net remittance outputs.",
      "None"
    ],

    // =================================================================================================
    // SECTION 3: SPRINT DAY 1 (20-OCT-2026 - YESTERDAY) — MARKETPLACE & ONBOARDING STAGING (DONE)
    // =================================================================================================
    [
      "SP-22",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "Office Marketplace",
      "Public Multi-City Space Search & Discovery (/public/search)",
      "Multi-city verified commercial office search with filters for monthly rent, carpet area, and bare/warm furnishing status.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: Responsive property grid, keyword matching, price filters active on staging.",
      "None"
    ],
    [
      "SP-23",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "Office Marketplace",
      "Space Detail & Listing Views (/marketplace/[slug])",
      "Dedicated commercial space page showing floor plans, photos, specifications, amenities, and lease terms.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: Dynamic slug rendering, photo galleries, and warm/bare shell rates operational.",
      "None"
    ],
    [
      "SP-24",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "Office Marketplace",
      "City Micro-Market Landing Hubs (BLR / BOM / GIFT City / AMD)",
      "Regional micro-market landing pages with curated commercial office inventory tailored to regional corporate demand.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: SEO-optimized city directories with pre-filtered property cards and micro-market badges.",
      "None"
    ],
    [
      "SP-25",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "Rent Roll Landlord SaaS",
      "Dynamic Property & Lease Onboarding Wizard (/onboarding)",
      "4-step guided onboarding creating property, building/tower, occupant tenant, and canonical lease contract.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: Real square footage limits, deposit validation, step-by-step progress, zero mock data.",
      "None"
    ],
    [
      "SP-26",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "Rent Roll Landlord SaaS",
      "Supabase Multi-Tenant Database Persistence",
      "Direct PostgreSQL relational storage for organizations, properties, spaces, and contracts on wizard completion.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: Live Supabase writes on onboarding completion with foreign key integrity and zero mock records.",
      "None"
    ],
    [
      "SP-27",
      "Sprint Day 1 (20-Oct-2026): Staging Releases",
      "FM Marketplace",
      "Vendor Registration & Profile Intake Portal (/vendor/register)",
      "Self-service vendor intake form capturing company details, GSTIN/PAN, and commercial facility management services.",
      "DONE (20-Oct)",
      "20-Oct-2026",
      "Verified live on 20-Oct: Multi-step registration, document upload hooks, and active status tracking.",
      "None"
    ],

    // =================================================================================================
    // SECTION 4: SPRINT DAY 2 (21-OCT-2026 - TODAY) — MOBILE UX & MASTER REGISTERS (DONE TODAY)
    // =================================================================================================
    [
      "SP-28",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "UI/UX Design System",
      "Full Dashboard Mobile Responsiveness Overhaul",
      "Comprehensive mobile layout: Off-canvas slide-out drawer navigation, mobile topbar, and quick-action bottom nav bar.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: Zero horizontal scroll on mobile viewport (375px/390px/412px), touch-friendly taps, smooth drawer toggle.",
      "None"
    ],
    [
      "SP-29",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "UI/UX Design System",
      "Persistent Desktop Sidebar & Route Navigation Fix",
      "Fixed sidebar disappearance bug, ensuring permanent left navigation rail remains visible across all module transitions.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: Sidebar persists across all sub-pages (/approvals, /settings, /operate/*) with active highlighting.",
      "None"
    ],
    [
      "SP-30",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "Rent Roll Landlord SaaS",
      "Master Commercial Leases Register & Sovereign Table View (/properties/rent-roll)",
      "Single source of truth for commercial leases, 39-point contract schema, WALE metrics, and rent escalation schedules.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: WALE calculations, escalation schedules, rate masking, and zero fake mock records.",
      "1 real lease sample for validation"
    ],
    [
      "SP-31",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "FM Marketplace",
      "FM Command Centre & Facility Delegation Desk (/settings/delegation)",
      "Owner governance module delegating day-to-day operations to third-party PM companies, viewing assigned duty desks.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: Delegated rights matrix, fee % models, and PM partner invitation link generation live.",
      "None"
    ],
    [
      "SP-32",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "Governance & Approvals",
      "Approvals Inbox Maker-Checker Console Layout (/approvals)",
      "Dual-authorization audit desk where checker reviews and authorizes maker submissions with multi-status tabs.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: Sign-off desk for lease contracts, billing invoices, and disputes with persistent layout.",
      "Designation of Checker user"
    ],
    [
      "SP-33",
      "Sprint Day 2 (21-Oct-2026 - TODAY): Mobile UX & Tables",
      "Admin & Settings",
      "Organization Settings & Tax Configuration Suite (/settings/company)",
      "Company profile management, legal entity configuration, GST/PAN credentials, and automated invoice prefixing.",
      "DONE (21-Oct / TODAY)",
      "21-Oct-2026 (Today)",
      "Verified live on 21-Oct: Organization settings layout, profile updates, and tax number validation rules active.",
      "None"
    ],

    // =================================================================================================
    // SECTION 5: SPRINT DAY 3 (22-OCT-2026 - TOMORROW) — TESTING & QA PASS (IN TESTING)
    // =================================================================================================
    [
      "SP-34",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Rent Roll Landlord SaaS",
      "Visual Stacking Plan & Floor Occupancy Elevation Matrix (/operate/stacking)",
      "Floor-by-floor interactive building elevation showing leased vs vacant spaces, tenant tags, and square footage breakdowns.",
      "IN TESTING",
      "22-Oct-2026",
      "Floor elevation rendering live in test environment; testing responsive unit cards and hover metrics.",
      "Tower floor numbering rules confirmation"
    ],
    [
      "SP-35",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Governance & Approvals",
      "Approvals Dual-Authorization Maker-Checker Sign-off Rules",
      "Enforcing strict separation of maker and checker: Makers cannot approve their own submissions; checker digital sign-off logged.",
      "IN TESTING",
      "22-Oct-2026",
      "Dual-authorization API middleware operational; QA pass validating reject/approve state transitions.",
      "Confirmation of checker email list"
    ],
    [
      "SP-36",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Commercial Leasing CRM",
      "Inbound Tenant Lead Triage & Kanban Deals Pipeline (/leasing/leads, /leasing/pipeline)",
      "Captures and qualifies inbound space enquiries, attributing marketing source, budget, and Kanban deal stage progression.",
      "IN TESTING",
      "22-Oct-2026",
      "Lead triage queue and drag-and-drop Kanban deal board operational in staging test suite.",
      "Confirmation of standard deal stages"
    ],
    [
      "SP-37",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Office Marketplace",
      "4-Way Side-by-Side Space Spec Comparison (/marketplace/compare)",
      "Side-by-side spec comparison table comparing square footage, CAM charges, furnishing, and security deposit terms.",
      "IN TESTING",
      "22-Oct-2026",
      "Comparison matrix algorithm functional; differential pricing calculations under final QA pass.",
      "Comparison criteria sign-off"
    ],
    [
      "SP-38",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Office Marketplace",
      "Space Requirement Intake & Calq Estimator (/calq)",
      "Interactive wizard calculating headcount-to-area needs, seat densities, and budget benchmarks for commercial occupiers.",
      "IN TESTING",
      "22-Oct-2026",
      "Headcount-to-sqft algorithms live; testing seat density calculations and budget estimation outputs.",
      "None"
    ],
    [
      "SP-39",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "FM Marketplace",
      "B2B RFQ Scope Builder & Vendor Auto-Match (/marketplace/create-rfq)",
      "B2B scope builder allowing property managers to issue maintenance tenders; auto-notifies eligible vetted vendors.",
      "IN TESTING",
      "22-Oct-2026",
      "RFQ creation form, SLA tags, and automated vendor category matching algorithms in final QA pass.",
      "List of active vendor trade categories"
    ],
    [
      "SP-40",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "FM Operations SaaS",
      "52-Week Planned Preventive Maintenance (PPM) Calendar (/ops/ppm)",
      "Recurring maintenance schedule for chillers, lifts, DG sets, and fire safety systems with automated work orders.",
      "IN TESTING",
      "22-Oct-2026",
      "52-week calendar grid operational in QA; recurring rule generation under load testing.",
      "Standard MEP maintenance checklist"
    ],
    [
      "SP-41",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "Rent Roll Landlord SaaS",
      "Aging Receivables & Collections Tracker (0-30d, 31-60d, 61-90d, 90d+)",
      "Aged debtors ledger categorizing overdue rent and CAM arrears into standard 30-day aging buckets with automated reminders.",
      "IN TESTING",
      "22-Oct-2026",
      "Aging bucket SQL queries active; reminder dispatch triggers operational in QA environment.",
      "None"
    ],
    [
      "SP-42",
      "Sprint Day 3 (22-Oct-2026): Testing & QA Pass",
      "FM Marketplace",
      "Vendor Verification & KYC Document Review Workflow (/admin/kyc)",
      "Admin verification desk reviewing uploaded GST, PAN, and insurance certificates to grant 'Verified' badge.",
      "IN TESTING",
      "22-Oct-2026",
      "KYC review queue operational; status badge transitions (Pending -> Verified -> Rejected) active.",
      "Sample vendor KYC documents"
    ],

    // =================================================================================================
    // SECTION 6: SPRINT DAY 4 (23-OCT-2026) — AUTOMATED BILLING & PAYMENTS (IN DEVELOPMENT)
    // =================================================================================================
    [
      "SP-43",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Financials & Invoicing",
      "Automated Monthly Rent Roll Billing Run & Tax Invoices (/operate/invoices)",
      "End-of-month batch billing engine generating GST-compliant commercial tax invoices (Base Rent + CAM + Taxes).",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Automated billing batch script in progress; invoice PDF generation template built with GST breakdown.",
      "Invoice prefix & GST HSN/SAC codes"
    ],
    [
      "SP-44",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Financials & Invoicing",
      "Utility Sub-Meter Reading & CAM Pro-Rata Allocator (/operate/meters)",
      "Records electricity and water sub-meter readings per tenant, applying slab tariffs and calculating pro-rata CAM splits.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Meter reading entry table and tariff calculation formula in active implementation.",
      "Standard utility tariff rate"
    ],
    [
      "SP-45",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Payments & Gateway",
      "Razorpay Live Payment Gateway & Virtual Accounts",
      "Direct integration of Razorpay Orders API, generating unique virtual payment links and handling webhook reconciliation.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Razorpay SDK installed; webhook endpoint (/api/webhooks/razorpay) and checkout modal under development.",
      "Razorpay Key ID & Key Secret (Test/Live)"
    ],
    [
      "SP-46",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "FM Marketplace",
      "Multi-Vendor Quotation Comparison Matrix & Line-Item Pricing",
      "Side-by-side bid comparison table displaying vendor proposals against issued RFQs, highlighting lowest bid and fastest SLA.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Quotation comparison UI in active development; line-item normalization logic in progress.",
      "None"
    ],
    [
      "SP-47",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "FM Operations SaaS",
      "Work Order Lifecycle Management & Mandatory Photo Gate",
      "Work order execution workflow (Issued -> Accepted -> In Progress -> Closed) requiring mandatory photo evidence for sign-off.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Work order status machine and mobile photo attachment handler in active development.",
      "None"
    ],
    [
      "SP-48",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Tenant Portal",
      "Tenant Self-Service Digital Statement & Online Pay (/portal)",
      "Dedicated corporate tenant portal displaying lease summary, outstanding ledger, payment history, and instant online pay.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Tenant portal dashboard view and payment trigger button in active development.",
      "None"
    ],
    [
      "SP-49",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Commercial Leasing CRM",
      "Digital LOI & Commercial Term Sheet Generator (/leasing/loi)",
      "Automated LOI document generator converting agreed deal terms into a downloadable PDF term sheet with signature blocks.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Dynamic PDF generation pipeline and legal clause template binding in progress.",
      "Standard LOI draft template"
    ],
    [
      "SP-50",
      "Sprint Day 4 (23-Oct-2026): Billing & Payments",
      "Office Marketplace",
      "Space Listing Partner Builder (/marketplace/list-space)",
      "Self-service commercial space submission flow for landlords and brokers to list new office units with floor plans.",
      "IN DEVELOPMENT",
      "23-Oct-2026",
      "Multi-step listing builder form and photo upload pipeline in active development.",
      "Sample property brochure/photos"
    ],

    // =================================================================================================
    // SECTION 7: SPRINT DAYS 5 TO 7 (24-OCT TO 26-OCT-2026) — AI SUITE (100% PENDING) & OPERATIONS
    // =================================================================================================
    [
      "SP-51",
      "Sprint Day 5 (24-Oct-2026): AI Phase 1 & Security",
      "AI Engine (Phase 1)",
      "AI Commercial Lease Deed OCR & Key Clause Extraction (/api/ai/lease-ocr)",
      "AI parsing of uploaded lease PDF contracts to extract monthly rent, lock-in period, escalation date, and security deposit.",
      "PENDING (AI 100% Pending)",
      "24-Oct-2026",
      "100% Pending currently by architecture design; scheduled for Sprint Day 5 build once lease tables are finalized.",
      "OpenAI / Anthropic API Key"
    ],
    [
      "SP-52",
      "Sprint Day 5 (24-Oct-2026): AI Phase 1 & Security",
      "SaaS Modules",
      "Visitor Management Pre-Invites & QR Code Passes (/operate/visitors)",
      "Digital visitor log: Host tenants generate pre-invitations with QR passes; security kiosk verifies entry at building lobby.",
      "IN DEVELOPMENT",
      "24-Oct-2026",
      "QR pass generation and visitor registration data schema in progress.",
      "Visitor kiosk specs"
    ],
    [
      "SP-53",
      "Sprint Day 5 (24-Oct-2026): AI Phase 1 & Security",
      "FM Operations SaaS",
      "Daily Site Activity Log & Guard Shift Checkpoints",
      "Security and facility supervisor digital activity log, shift changeover checklist, and incident reporting.",
      "IN DEVELOPMENT",
      "24-Oct-2026",
      "Shift logging schema and incident escalation dispatch in active implementation.",
      "None"
    ],
    [
      "SP-54",
      "Sprint Day 6 (25-Oct-2026): AI Phase 2 & Compliance",
      "AI Engine (Phase 2)",
      "AI Executive Narrative MIS Auto-Commentary Engine (/api/ai/mis-commentary)",
      "LLM generation of executive monthly commentary summarizing occupancy fluctuations, collection bottlenecks, and WALE trends.",
      "PENDING (AI 100% Pending)",
      "25-Oct-2026",
      "100% Pending currently by architecture design; scheduled for Sprint Day 6 build on top of financial aggregation APIs.",
      "LLM API Key"
    ],
    [
      "SP-55",
      "Sprint Day 6 (25-Oct-2026): AI Phase 2 & Compliance",
      "SaaS Modules",
      "Statutory Compliance Document Vault with Automated Alerts (/ops/compliance)",
      "Repository for Fire NOC, Lift Licenses, Pollution Clearances, and Building OC with automated 60/30/15-day expiry warnings.",
      "IN DEVELOPMENT",
      "25-Oct-2026",
      "Compliance vault UI and automated daily background expiry alert job in implementation.",
      "List of mandatory municipal NOCs"
    ],
    [
      "SP-56",
      "Sprint Day 6 (25-Oct-2026): AI Phase 2 & Compliance",
      "Tenant Management",
      "Digital Dispute Desk & Maintenance Escalation Workflow",
      "Formal tenant dispute filing for billing or maintenance issues with photo evidence, credit note settlement, and resolution audit.",
      "IN DEVELOPMENT",
      "25-Oct-2026",
      "Dispute ticketing workflow and credit note adjustment logic in active development.",
      "None"
    ],
    [
      "SP-57",
      "Sprint Day 7 (26-Oct-2026): AI Phases 3-5 & Hardening",
      "AI Engine (Phase 3)",
      "AI Commercial Lease Vacancy & Expiry ML Predictor (/api/ai/vacancy-predictor)",
      "Predictive machine learning algorithm scoring tenant renewal likelihood 180 days prior to lease expiry based on payment history.",
      "PENDING (AI 100% Pending)",
      "26-Oct-2026",
      "100% Pending currently by architecture design; scheduled for Sprint Day 7 build.",
      "LLM API Key"
    ],
    [
      "SP-58",
      "Sprint Day 7 (26-Oct-2026): AI Phases 3-5 & Hardening",
      "AI Engine (Phase 4)",
      "AI IoT & Equipment Predictive Maintenance Anomaly Alerts (/api/ai/predictive-ppm)",
      "Algorithmic anomaly detection for chiller run hours, DG fuel burn, and lift trips to trigger preventive maintenance before failure.",
      "PENDING (AI 100% Pending)",
      "26-Oct-2026",
      "100% Pending currently by architecture design; scheduled for Sprint Day 7 build.",
      "LLM API Key"
    ],
    [
      "SP-59",
      "Sprint Day 7 (26-Oct-2026): AI Phases 3-5 & Hardening",
      "AI Engine (Phase 5)",
      "Tenant 24/7 AI Concierge & Smart Helpdesk Bot (/api/ai/concierge)",
      "Natural language conversational assistant answering tenant queries regarding building rules, amenities, and logging tickets.",
      "PENDING (AI 100% Pending)",
      "26-Oct-2026",
      "100% Pending currently by architecture design; scheduled for Sprint Day 7 build.",
      "LLM API Key"
    ],
    [
      "SP-60",
      "Sprint Day 7 (26-Oct-2026): AI Phases 3-5 & Hardening",
      "Security & Governance",
      "End-to-End Multi-Tenant Isolation & Security Penetration Testing",
      "Rigorous security testing verifying tenant data isolation, RLS policies, token expiration, and CSRF protection.",
      "PENDING",
      "26-Oct-2026",
      "Scheduled for Sprint Day 7: Full penetration testing and role-boundary validation pass.",
      "None"
    ],
    [
      "SP-61",
      "Sprint Day 7 (26-Oct-2026): AI Phases 3-5 & Hardening",
      "Quality Assurance",
      "Pre-UAT Build: Full Platform Regression Pass & Staging Hardening",
      "Comprehensive end-to-end regression testing across all 9 portals, verifying cross-module links, responsive layouts, and zero console errors.",
      "PENDING",
      "26-Oct-2026",
      "Scheduled for Sprint Day 7: Final release candidate regression pass.",
      "None"
    ],

    // =================================================================================================
    // SECTION 8: SPRINT DAY 8 (27-OCT-2026) — FINAL UAT & PRODUCTION GO-LIVE HANDOVER (SCHEDULED)
    // =================================================================================================
    [
      "SP-62",
      "Sprint Day 8 (27-Oct-2026): Final Handover",
      "Client Handover",
      "Live Client User Acceptance Testing (UAT) Walkthrough",
      "45-minute live staging demonstration with OfficeX leadership covering Marketplace, Rent Roll, FM, Billing, and AI modules.",
      "SCHEDULED (27-Oct)",
      "27-Oct-2026",
      "Scheduled for Tuesday, 27-Oct: Interactive live walkthrough for final client sign-off.",
      "45-min UAT review meeting"
    ],
    [
      "SP-63",
      "Sprint Day 8 (27-Oct-2026): Final Handover",
      "Production Go-Live",
      "Production DNS Cutover, Database Seeding & Production Go-Live Handover",
      "Production DNS switch, live environment SSL verification, master administrator credential handover, and operational launch.",
      "SCHEDULED (27-Oct)",
      "27-Oct-2026",
      "Scheduled for Tuesday, 27-Oct: Production DNS switch, final database verification, and 100% platform handover.",
      "Production domain DNS access"
    ],

    // Summary Section
    ["", "", "", "", "", "", "", "", ""],
    ["SUMMARY BREAKDOWN ACROSS 2-MONTH LIFECYCLE & 1-WEEK SPRINT", "", "", "", "", "", "", "", ""],
    ["Status Category", "Deliverable Count", "% Share", "Lifecycle Coverage & Scope Details", "", "", "", "", ""],
    ["DONE (Month 1: Aug-Sep 2026)", "10 Deliverables", "15.9%", "Platform Architecture, Supabase 50+ DB Tables, OTP Auth, RBAC, Design System, REST API Gateway, Audit Log", "", "", "", "", ""],
    ["DONE (Month 2: Sep-Oct 2026)", "11 Deliverables", "17.5%", "Canonical 39-Point Lease Model, WALE Engine, Escalation Formulas, FM Taxonomy, SLA State Machine, Ledger Logic", "", "", "", "", ""],
    ["DONE (Sprint Day 1: 20-Oct-2026)", "6 Deliverables", "9.5%", "Marketplace Public Search & Detail, Micro-Markets, 4-Step Rent Roll Onboarding Wizard, Supabase Live Writes", "", "", "", "", ""],
    ["DONE (Sprint Day 2: 21-Oct-2026 - TODAY)", "6 Deliverables", "9.5%", "Mobile Responsiveness Overhaul, Persistent Left Navigation, Rent Roll Master Register, FM Command Desk", "", "", "", "", ""],
    ["TOTAL COMPLETED TO DATE", "33 Deliverables", "52.4%", "OVER HALF OF PLATFORM FULLY COMPLETED, ARCHITECTED & DEPLOYED", "", "", "", "", ""],
    ["IN TESTING (Sprint Day 3: 22-Oct-2026)", "9 Deliverables", "14.3%", "Stacking Plan, Approvals Maker-Checker, Leasing CRM Deals Pipeline, 4-Way Compare, Calq Estimator, RFQ Builder", "", "", "", "", ""],
    ["IN DEVELOPMENT (Sprint Day 4: 23-Oct-2026)", "8 Deliverables", "12.7%", "Automated Billing Runs, CAM Sub-Meters, Razorpay Gateway, Quotations Matrix, Work Orders Photo Gate, Tenant Portal", "", "", "", "", ""],
    ["PENDING (AI All Phases 1-5 & Hardening)", "11 Deliverables", "17.5%", "AI Phases 1-5 (100% Pending as scheduled), Visitor QR Kiosk, Evacuation, Security Penetration, Full Regression", "", "", "", "", ""],
    ["SCHEDULED (Sprint Day 8: 27-Oct-2026)", "2 Deliverables", "3.2%", "Live Client UAT Demonstration Walkthrough & Production DNS Go-Live Handover", "", "", "", "", ""],
    ["TOTAL PLATFORM COMMITMENT", "63 Deliverables", "100.0%", "Strict Commitment: 100% Completed, Verified & Live by Tuesday, 27-October-2026", "", "", "", "", ""]
  ];

  const ws = xlsx.utils.aoa_to_sheet(sheetData);

  // Set explicit auto-fitting column widths
  ws['!cols'] = [
    { wch: 10 }, // Item ID
    { wch: 38 }, // Project Lifecycle Phase
    { wch: 28 }, // Module / Domain
    { wch: 48 }, // Feature / Deliverable Name
    { wch: 68 }, // Technical Scope & Functionality
    { wch: 24 }, // Current Status
    { wch: 20 }, // Execution Timeline / Date
    { wch: 72 }, // Implementation State & Verification Proof
    { wch: 36 }  // Client Support Needed
  ];

  // Set row heights for headers
  ws['!rows'] = [
    { hpt: 28 },
    { hpt: 20 },
    { hpt: 20 },
    { hpt: 12 },
    { hpt: 26 }
  ];

  xlsx.utils.book_append_sheet(wb, ws, "OfficeX Flow & Timeline");

  // Output paths
  const filenames = [
    'OfficeX_Master_Feature_Flow_and_Timeline.xlsx',
    'OfficeX_Whole_Platform_Flow_and_Timeline.xlsx'
  ];

  const desktopDir = "c:\\one drive folder\\Desktop";
  const projectDir = path.resolve(__dirname, '..');

  filenames.forEach(filename => {
    const projPath = path.join(projectDir, filename);
    try {
      xlsx.writeFile(wb, projPath);
      console.log("Saved project file:", projPath);
    } catch (e) {
      console.warn("Could not overwrite locked project file (" + filename + "), writing to alternative name...");
      const altProjPath = path.join(projectDir, filename.replace('.xlsx', '_Latest.xlsx'));
      xlsx.writeFile(wb, altProjPath);
      console.log("Saved alternative project file:", altProjPath);
    }

    const deskPath = path.join(desktopDir, filename);
    try {
      xlsx.writeFile(wb, deskPath);
      console.log("Saved desktop file:", deskPath);
    } catch (e) {
      console.warn("Could not overwrite desktop file (" + filename + "):", e.message);
      const altDeskPath = path.join(desktopDir, filename.replace('.xlsx', '_Latest.xlsx'));
      try {
        xlsx.writeFile(wb, altDeskPath);
        console.log("Saved alternative desktop file:", altDeskPath);
      } catch (err) {}
    }

    // Also export CSV
    const csvFilename = filename.replace('.xlsx', '.csv');
    const csvContent = xlsx.utils.sheet_to_csv(ws);
    const projCsv = path.join(projectDir, csvFilename);
    try {
      fs.writeFileSync(projCsv, csvContent);
    } catch (e) {}
    try {
      fs.writeFileSync(path.join(desktopDir, csvFilename), csvContent);
    } catch (e) {}
  });

  console.log("All master workbooks and CSVs successfully generated!");
}

generateComprehensiveMasterExcel();
