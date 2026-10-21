const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const wb = xlsx.utils.book_new();

const headers = [
  'Sr No',
  'Module',
  'Feature / Flow',
  'Real Status',
  'Progress %',
  'What Is Built (Code & UI)',
  'Current Reality (Why Not 100%)',
  'What Is Pending For Production',
  'Target Day (1-Week Sprint)'
];

const rows = [
  // ========== 1. USER MANAGEMENT & AUTH ==========
  [
    1,
    'User Management',
    'Mobile OTP Login (Fast2SMS)',
    'Blocked — SMS Failing',
    '30%',
    'Login page UI, OTP generation API, and database verification logic coded.',
    'SMS OTP is NOT delivering to real mobile numbers. Users cannot log in right now without manual DB bypass.',
    'Fix Fast2SMS API integration / route or replace with working SMS gateway, verify real OTP delivery.',
    'Day 1 (Oct 21)'
  ],
  [
    2,
    'User Management',
    'User Registration & Role Setup',
    'Partially Working',
    '50%',
    'Registration UI, profile form, and 4 role assignments (Asset Manager, Property Manager, Finance, Auditor).',
    'Account creates in DB, but end-to-end welcome flow and profile completeness validation not tested.',
    'Test full signup flow with new number, verify role restrictions and default dashboard redirect.',
    'Day 1 (Oct 21)'
  ],
  [
    3,
    'User Management',
    'Role-Based Access Control (RBAC)',
    'Untested Flow',
    '40%',
    'RBAC middleware and screen permission guards coded in backend routes.',
    'Has not been tested by actually logging in as each of the 4 roles to check if unauthorized screens are blocked.',
    'Login as Asset Manager, Property Manager, Finance, and Auditor to verify screen access and forbidden actions.',
    'Day 1 (Oct 21)'
  ],
  [
    4,
    'User Management',
    'Admin User Management Panel',
    'Partially Working',
    '50%',
    'Admin user table showing users, roles, and status toggle buttons.',
    'Basic list displays, but edit user, deactivate, and role upgrade actions not verified with real multi-user sessions.',
    'Verify deactivate user immediately invalidates active sessions and role changes apply instantly.',
    'Day 1 (Oct 21)'
  ],
  [
    5,
    'User Management',
    'Audit Trail & Activity Logs',
    'Untested Flow',
    '35%',
    'Database audit log table and logging utility function coded.',
    'Only a few actions write to the audit log; most modules do not yet trigger audit events.',
    'Hook audit logging into contract creation, invoice generation, payment receipts, and user changes.',
    'Day 1 (Oct 21)'
  ],

  // ========== 2. RENT ROLL & LEASE MANAGEMENT ==========
  [
    6,
    'Rent Roll',
    'Add Property Master & Address',
    'Partially Working',
    '55%',
    'Property creation form with name, address, leasable area, micro-market selector. Saves to Supabase.',
    'Works for basic entry, but micro-market tagging validation, duplicate property checks, and error boundaries untested.',
    'Test edge cases: duplicate names, invalid area values, special characters in address.',
    'Day 1–2 (Oct 21–22)'
  ],
  [
    7,
    'Rent Roll',
    'Building Hierarchy (Floors, Units, Parking)',
    'Partially Working',
    '50%',
    'Property -> Building -> Floor -> Unit creation modal and database relationships.',
    'Hierarchy displays in UI, but multi-building assets, floor reordering, and parking slot allocation untested.',
    'Build a full 3-floor, 12-unit test building with exact carpet/chargeable areas and parking allocations.',
    'Day 1–2 (Oct 21–22)'
  ],
  [
    8,
    'Rent Roll',
    'Tenant Onboarding & Profile',
    'Partially Working',
    '50%',
    'Tenant profile form with company name, contact person, email, phone, GSTIN, billing address.',
    'Saves basic records, but GSTIN format validation, PAN verification, and multiple contact persons untested.',
    'Validate real GSTIN input, test tenant duplicate prevention, and check document attachment storage.',
    'Day 2 (Oct 22)'
  ],
  [
    9,
    'Rent Roll',
    'Lease Contract Wizard (7-Step Flow)',
    'Untested Flow',
    '45%',
    '39-field 7-step wizard UI (Parties, Terms, Charges, Escalation, Deposits, Docs, Review).',
    'Wizard opens and transitions between steps, but submitting a complete contract with all 39 fields has bugs & untested edges.',
    'Run complete end-to-end lease submission from Step 1 to Step 7 with real dates, charges, and verify DB output.',
    'Day 2 (Oct 22)'
  ],
  [
    10,
    'Rent Roll',
    'Annual Rent Escalation Engine',
    'Untested Flow',
    '40%',
    'Compounding and simple escalation calculation formulas coded in backend.',
    'Math not verified against real multi-year lease schedules (e.g. 5% hike every 12 months over 5 years).',
    'Run escalation test with a 3-year and 5-year lease, verify anniversary date triggers and exact rupee amounts.',
    'Day 2 (Oct 22)'
  ],
  [
    11,
    'Rent Roll',
    'Rent-Free Fitout Concession Period',
    'Untested Flow',
    '40%',
    'Concession months input field and billing offset logic in code.',
    'Has not been tested to ensure invoices during fitout period generate with Rs. 0 rent but active CAM.',
    'Verify fitout concession suppresses base rent while correctly billing CAM charges during concession months.',
    'Day 2 (Oct 22)'
  ],
  [
    12,
    'Rent Roll',
    'Security Deposit Tracking',
    'Untested Flow',
    '45%',
    'Security deposit amount, bank reference, and refund status fields in schema and contract UI.',
    'Deposit tracking displays, but receipt generation and refund/forfeiture workflows not tested.',
    'Test deposit receipt creation, partial deposit payments, and refund deduction ledger.',
    'Day 2 (Oct 22)'
  ],
  [
    13,
    'Rent Roll',
    'Lock-In & Notice Period Tracking',
    'Untested Flow',
    '40%',
    'Lock-in expiry date calculation and notice period duration fields.',
    'Only static display; no warning triggers if tenant attempts early exit during lock-in.',
    'Verify lock-in breach penalty warnings and notice period countdown indicators.',
    'Day 2 (Oct 22)'
  ],
  [
    14,
    'Rent Roll',
    'Rent Roll Master Register View',
    'Partially Working',
    '55%',
    'Full-width grid showing properties, units, tenants, monthly rent, expiry dates, and occupancy status.',
    'Table renders sample data, but pagination, column filters, total rent summation, and live DB sync untested.',
    'Populate with 20+ live units, verify totals match exact sum of active leases, test filter combinations.',
    'Day 2 (Oct 22)'
  ],
  [
    15,
    'Rent Roll',
    'Export Rent Roll to Excel / CSV',
    'Partially Working',
    '60%',
    'CSV download button that formats current rent roll view into spreadsheet rows.',
    'Basic CSV downloads, but currency formatting, date parsing, and Excel column widths need polish.',
    'Test export with large dataset, verify all 18 standard rent roll columns open cleanly in Microsoft Excel.',
    'Day 2 (Oct 22)'
  ],
  [
    16,
    'Rent Roll',
    'Lease Agreement PDF Upload & AI Parsing',
    'Untested Flow',
    '25%',
    'PDF upload dropzone and basic regex text parser for digital PDFs.',
    'Fails completely on scanned/photo PDFs. Digital PDF extraction only catches ~30% of standard legal clauses.',
    'Connect Vision OCR API key or restrict to text-native agreements; test with 3 real Gujarat lease deeds.',
    'Day 7 (Oct 28)'
  ],
  [
    17,
    'Rent Roll',
    'Lease Expiry Pipeline (30/60/90 Days)',
    'Untested Flow',
    '40%',
    'Visual pipeline cards categorizing leases expiring in <30 days, 31-60 days, and 61-90 days.',
    'Logic written, but untested with dynamic current date vs future lease dates; no email alert fired.',
    'Seed test leases with expiry dates in next 20, 45, and 75 days; confirm card placement and countdown accuracy.',
    'Day 2 (Oct 22)'
  ],
  [
    18,
    'Rent Roll',
    'Lease Renewal Action Workflow',
    'Untested Flow',
    '30%',
    'Renewal button and extension dialog UI.',
    'Clicking renew does not clone contract, calculate new escalation base, or archive old agreement in DB.',
    'Implement one-click lease renewal flow creating new contract version linked to prior lease history.',
    'Day 2 (Oct 22)'
  ],
  [
    19,
    'Rent Roll',
    'Deals Register & Pipeline Value',
    'Untested Flow',
    '35%',
    'Deal stage Kanban (Lead, Proposal, LOI, Signing, Closed) with deal value calculation.',
    'Cards move visually, but stage transition database persistence and total pipeline revenue math untested.',
    'Test moving deals across stages, verify deal-to-contract conversion automatically pre-fills lease wizard.',
    'Day 2 (Oct 22)'
  ],

  // ========== 3. BILLING & INVOICING ==========
  [
    20,
    'Billing & Invoicing',
    'Monthly Rent Invoice Generation',
    'Untested Flow',
    '40%',
    'Invoice generation engine calculating Base Rent + CAM Charges + Tax split.',
    'Code exists, but has NEVER been run on a full month cycle with real leases; error handling untested.',
    'Run batch invoice generation for 5 test leases; verify line items, due dates, and invoice numbering sequence.',
    'Day 3 (Oct 23)'
  ],
  [
    21,
    'Billing & Invoicing',
    'GST Tax Engine (CGST 9% + SGST 9% / IGST 18%)',
    'Partially Working',
    '50%',
    'Tax split calculation based on tenant state vs property state (SAC 997212).',
    'Calculation logic written, but Gujarat intra-state vs inter-state tax branch untested with real GSTINs.',
    'Test intra-state invoice (9%+9% = 18%) and inter-state invoice (18% IGST); verify rupee rounding.',
    'Day 3 (Oct 23)'
  ],
  [
    22,
    'Billing & Invoicing',
    'TDS Deduction Tracking (Section 194I - 10%)',
    'Untested Flow',
    '35%',
    '10% TDS deduction field and net payable calculation in invoice schema.',
    'TDS tracking is only a field; no TDS certificate (Form 16A) reconciliation or credit ledger exists.',
    'Add TDS deduction credit workflow so tenant can upload Form 16A and clear the TDS withholding balance.',
    'Day 3 (Oct 23)'
  ],
  [
    23,
    'Billing & Invoicing',
    'Invoice PDF Generation & Download',
    'Partially Working',
    '50%',
    'HTML-to-PDF invoice template with company logo, landlord details, tenant info, bank details, and QR.',
    'PDF generates in browser, but layout breaks on multi-item bills; print margins need alignment.',
    'Refine PDF template to standard A4 tax invoice format, verify GST compliant headers and bank IFSC display.',
    'Day 3 (Oct 23)'
  ],
  [
    24,
    'Billing & Invoicing',
    'Automated Monthly Billing (1st of Month Cron)',
    'Untested Flow',
    '30%',
    'API route `/api/cron/generate-invoices` coded to iterate active leases.',
    'No automated scheduler running. Has only been triggered manually via Postman/browser once.',
    'Configure cron job trigger (Vercel Cron / pg_cron) and add email notification to admin upon batch finish.',
    'Day 3 (Oct 23)'
  ],
  [
    25,
    'Billing & Invoicing',
    'Invoice Dispatch via WhatsApp / Email',
    'Blocked — Missing Credentials',
    '15%',
    'Dispatch hooks and message template strings written in code.',
    'Cannot send because WhatsApp Business API credentials and SMTP email server are not configured.',
    'Configure email server (SendGrid/Resend) or WhatsApp credentials; test automated PDF delivery to tenant.',
    'Day 6 (Oct 27)'
  ],
  [
    26,
    'Billing & Invoicing',
    'Tenant Self-Service Portal',
    'Untested Flow',
    '35%',
    'Tenant portal screen showing outstanding dues, past invoices, payment button, and lease summary.',
    'Screen built, but tenant login session, payment history retrieval, and PDF download not tested together.',
    'Log in as tenant user, check invoice visibility, click pay, and verify receipt download.',
    'Day 3 (Oct 23)'
  ],

  // ========== 4. COLLECTIONS & RECONCILIATION ==========
  [
    27,
    'Collections',
    'Accounts Receivable Aging (0-30, 31-60, 61-90, 90+)',
    'Untested Flow',
    '40%',
    '4-bucket aging table calculating days overdue from invoice due date.',
    'Calculation works on static numbers, but dynamic recalculation on partial payments is untested.',
    'Seed overdue invoices across all 4 age buckets, make partial payment, confirm bucket balances update.',
    'Day 3 (Oct 23)'
  ],
  [
    28,
    'Collections',
    'Online Payment Gateway (Razorpay)',
    'Partially Working',
    '45%',
    'Razorpay standard checkout integration with API keys in environment config.',
    'Checkout popup opens, but live transaction, webhook verification, and automated invoice marking untested.',
    'Perform real test payment (Rs. 1 / test mode), verify webhook marks invoice as PAID and generates receipt.',
    'Day 3 (Oct 23)'
  ],
  [
    29,
    'Collections',
    'Bank Statement Upload & Reconciliation',
    'Untested Flow',
    '30%',
    'CSV/Excel bank statement upload parser matching UTR number and invoice amount.',
    'Upload dialog exists, but fuzzy matching on tenant names and partial match logic is untested and fragile.',
    'Test upload with real HDFC/ICICI bank statement CSV; verify auto-matching of 5 sample rent transactions.',
    'Day 3 (Oct 23)'
  ],
  [
    30,
    'Collections',
    'Automated Payment Dues Reminders',
    'Blocked — Missing Credentials',
    '15%',
    'Reminder scheduling logic (T-3 days, Due Date, T+3 days overdue).',
    'No messages can go out due to lack of SMS / WhatsApp gateway setup.',
    'Connect gateway and test automated reminder message dispatch with payment link.',
    'Day 6 (Oct 27)'
  ],

  // ========== 5. CAM (COMMON AREA MAINTENANCE) ==========
  [
    31,
    'CAM',
    'CAM Expense Pool Setup',
    'Untested Flow',
    '35%',
    'Expense entry screen for security, housekeeping, electricity, DG fuel, and maintenance costs.',
    'Entries save to DB, but recurring expense templates and GST input tax credit tracking untested.',
    'Enter sample monthly building expenses of Rs. 3,50,000 across 5 cost heads; verify total expense pool.',
    'Day 3 (Oct 23)'
  ],
  [
    32,
    'CAM',
    'Proportional CAM Allocation by Area',
    'Untested Flow',
    '40%',
    'Formula dividing total CAM pool by total occupied sq.ft to calculate per-sq.ft rate.',
    'Formula coded, but empty unit handling (landlord CAM share) and common area loss factor untested.',
    'Test CAM allocation across 3 tenants with different sq.ft; verify total billed equals total expense pool.',
    'Day 3 (Oct 23)'
  ],

  // ========== 6. FINANCIAL REPORTS ==========
  [
    33,
    'Financial Reports',
    'Property Profit & Loss (P&L)',
    'Untested Flow',
    '35%',
    'Income statement screen: Gross Rental + CAM Income minus Operational Expenses = Net Operating Income (NOI).',
    'UI renders charts and tables, but calculations have not been verified against real monthly ledger balances.',
    'Populate 1 month of test income and expense; verify NOI calculation, yield %, and operating ratio.',
    'Day 3 (Oct 23)'
  ],
  [
    34,
    'Financial Reports',
    '12-Month Cash Flow Forecast',
    'Untested Flow',
    '30%',
    'Projection chart forecasting next 12 months based on active lease terms and escalation dates.',
    'Algorithm written, but expiry churn assumptions and vacant space re-leasing projections untested.',
    'Verify projected cash flow dynamically adjusts when lease terms or escalation dates change.',
    'Day 3 (Oct 23)'
  ],
  [
    35,
    'Financial Reports',
    'MIS Report Export (Excel)',
    'Untested Flow',
    '35%',
    'Multi-sheet MIS summary export code (Occupancy, Collections, Arrears, P&L).',
    'Export button exists, but generated Excel sheet formatting and cross-sheet formulas untested.',
    'Generate full monthly MIS Excel workbook and verify all tabs open cleanly with correct totals.',
    'Day 3 (Oct 23)'
  ],
  [
    36,
    'Financial Reports',
    'Property Owner Remittance Statement',
    'Untested Flow',
    '30%',
    'Landlord statement: Gross Collections - Property Management Fee - Maintenance = Net Remittance.',
    'Template coded, but owner commission calculation and TDS on payout deduction untested.',
    'Test statement generation for property owner with 10% management fee deduction and net payout figure.',
    'Day 3 (Oct 23)'
  ],

  // ========== 7. OFFICE MARKETPLACE ==========
  [
    37,
    'Office Marketplace',
    'Office Search & Filter Engine',
    'Partially Working',
    '50%',
    '16 search filters: city (Ahmedabad), micro-market (S.G. Highway, Prahlad Nagar, etc.), area, budget, seats.',
    'Backend query works (tested Thaltej script), but frontend UI filter combination synchronization untested.',
    'Test all multi-select filter combinations in browser; verify zero search results fallback message.',
    'Day 4 (Oct 24)'
  ],
  [
    38,
    'Office Marketplace',
    'Property Detail Page',
    'Partially Working',
    '50%',
    'Commercial listing view with photo carousel, floor plan tab, amenities grid, pricing card, inquiry form.',
    'Page displays with mock properties, but dynamic photo uploads, contact owner button, and mobile view untested.',
    'Test detail page with 3 real properties with high-res photos and verify lead capture on inquiry form.',
    'Day 4 (Oct 24)'
  ],
  [
    39,
    'Office Marketplace',
    'Side-by-Side Office Comparison',
    'Untested Flow',
    '35%',
    'Comparison matrix comparing up to 3 selected spaces across 28 specifications.',
    'UI renders table, but selecting spaces from search results and persisting compare list in session untested.',
    'Select 3 properties from search results, open comparison, verify differences highlight correctly.',
    'Day 4 (Oct 24)'
  ],
  [
    40,
    'Office Marketplace',
    'Interactive Google Map View',
    'Blocked — Missing API Key',
    '20%',
    'Map container and marker clustering component coded in React.',
    'Map does not render because Google Maps JavaScript API key is not configured.',
    'Add Google Maps API key; test marker clustering, info windows, and micro-market boundary polygons.',
    'Day 4 (Oct 24)'
  ],
  [
    41,
    'Office Marketplace',
    'List Your Space (Owner Self-Posting)',
    'Untested Flow',
    '40%',
    'Self-listing form: basic info, photos upload, amenities, asking rent, CAM, contact details.',
    'Form exists, but image upload compression, draft saving, and admin approval moderation workflow untested.',
    'Submit test listing as space owner; verify admin approval screen, publish to live marketplace.',
    'Day 4 (Oct 24)'
  ],
  [
    42,
    'Office Marketplace',
    'Schedule Site Visit / Tour Booking',
    'Untested Flow',
    '35%',
    'Tour booking calendar with date/time slot picker and contact info capture.',
    'Saves booking record to DB, but broker notification, calendar invite, and confirmation SMS untested.',
    'Book visit on test listing; confirm booking appears in CRM pipeline and sends confirmation.',
    'Day 4 (Oct 24)'
  ],
  [
    43,
    'Office Marketplace',
    'Marketplace Admin Analytics Dashboard',
    'Untested Flow',
    '30%',
    'Dashboard with total listings, inquiries, conversion rate, and top searched micro-markets.',
    'Charts display mock data; not connected to live marketplace interaction event streams.',
    'Connect charts to live inquiries and listing view database tables; verify daily metric updates.',
    'Day 4 (Oct 24)'
  ],
  [
    44,
    'Office Marketplace',
    'Marketplace Platform Fee Checkout',
    'Untested Flow',
    '30%',
    'Razorpay payment checkout for listing promotion fees and premium badges.',
    'Payment button exists, but transaction verification and automatic listing badge activation untested.',
    'Test live Rs. 1 checkout; verify featured badge appears on listing immediately after payment.',
    'Day 4 (Oct 24)'
  ],

  // ========== 8. FM SERVICES MARKETPLACE ==========
  [
    45,
    'FM Marketplace',
    'FM Service Catalog (8 Verticals)',
    'Partially Working',
    '45%',
    '8 service verticals: Housekeeping, Security, HVAC/MEP, Pest Control, Deep Cleaning, Electrical, Plumbing, Landscaping.',
    'Catalog pages display service tiers and scope descriptions, but dynamic pricing rate-cards untested.',
    'Verify all 8 service pages load, SLA specifications display clearly, and RFQ trigger buttons work.',
    'Day 5 (Oct 25)'
  ],
  [
    46,
    'FM Marketplace',
    'Vendor Registration & Onboarding',
    'Untested Flow',
    '35%',
    'Vendor signup form: company profile, service categories, city coverage, team strength, GSTIN.',
    'Form saves basic info, but multi-file document upload (PAN, GST, Labor License) and KYC workflow untested.',
    'Register test FM vendor with documents; verify record saves to vendor table with PENDING status.',
    'Day 5 (Oct 25)'
  ],
  [
    47,
    'FM Marketplace',
    'Vendor KYC Verification (Admin Portal)',
    'Untested Flow',
    '35%',
    'Admin portal to view vendor applications, preview uploaded documents, and approve/reject.',
    'Screen built, but document preview modal and vendor status notification email untested.',
    'Approve test vendor in admin panel; verify vendor receives approval notice and can access RFQs.',
    'Day 5 (Oct 25)'
  ],
  [
    48,
    'FM Marketplace',
    'RFQ Creation & Broadcast',
    'Untested Flow',
    '30%',
    'RFQ builder: property selection, service required, scope description, frequency, bid deadline.',
    'Form exists, but auto-broadcasting to approved vendors in that category and micro-market untested.',
    'Create RFQ for Housekeeping; verify notification arrives in matching vendors portal.',
    'Day 5 (Oct 25)'
  ],
  [
    49,
    'FM Marketplace',
    'Vendor Quote Submission Portal',
    'Untested Flow',
    '30%',
    'Vendor interface to view open RFQs and submit itemized commercial quotes with terms.',
    'Screen coded, but bid deadline enforcement, quote revision, and price validation untested.',
    'Submit quote as vendor; confirm quote links to RFQ and notifies property manager.',
    'Day 5 (Oct 25)'
  ],
  [
    50,
    'FM Marketplace',
    'Side-by-Side Quote Comparison Matrix',
    'Untested Flow',
    '30%',
    'Comparison matrix comparing vendor bids on price, manpower count, SLA compliance, and rating.',
    'Matrix UI coded, but sorting by lowest bid and auto-scoring algorithm untested with real bids.',
    'Compare 3 vendor quotes for single RFQ; verify cost per sq.ft and score rankings calculate correctly.',
    'Day 5 (Oct 25)'
  ],
  [
    51,
    'FM Marketplace',
    'Work Order Generation from Quote',
    'Untested Flow',
    '30%',
    'Work order creation wizard converting accepted vendor quote into binding operational work order.',
    'Conversion logic coded, but PDF work order generation and contract terms attachment untested.',
    'Accept quote, generate work order PDF, verify work order number links to vendor account.',
    'Day 5 (Oct 25)'
  ],
  [
    52,
    'FM Marketplace',
    'Vendor Performance Rating & Review',
    'Untested Flow',
    '30%',
    '5-star rating form with feedback criteria (punctuality, quality, SLA compliance).',
    'Rating form exists, but recalculating aggregate vendor rating and public review display untested.',
    'Submit rating for completed work order; verify vendor average score updates on marketplace profile.',
    'Day 5 (Oct 25)'
  ],
  [
    53,
    'FM Marketplace',
    'Vendor Dispatch & Job Notification',
    'Blocked — Missing Credentials',
    '15%',
    'SMS / WhatsApp dispatch trigger on new work order.',
    'Cannot fire notifications due to missing WhatsApp Business / SMS gateway integration.',
    'Connect messaging gateway; test real SMS dispatch to vendor supervisor with job details.',
    'Day 6 (Oct 27)'
  ],

  // ========== 9. LEASING CRM ==========
  [
    54,
    'Leasing CRM',
    'Lead Pipeline Kanban (Inquiry -> Tour -> LOI -> Deal)',
    'Untested Flow',
    '40%',
    'Kanban board with drag-and-drop lead stages, lead source tags, and deal value sum.',
    'UI drag-and-drop works visually, but stage change database persistence and broker attribution untested.',
    'Drag lead from Inquiry to Tour to LOI; confirm database updates and activity log records movement.',
    'Day 5 (Oct 25)'
  ],
  [
    55,
    'Leasing CRM',
    'Site Visit Scheduling & Follow-Up Notes',
    'Untested Flow',
    '35%',
    'Visit scheduler with calendar view, leasing agent assignment, and post-visit client feedback box.',
    'Form coded, but agent calendar sync, conflict detection, and automated follow-up reminders untested.',
    'Schedule visit, assign to agent, enter feedback rating (Hot/Warm/Cold); verify lead score updates.',
    'Day 5 (Oct 25)'
  ],
  [
    56,
    'Leasing CRM',
    'Letter of Intent (LOI) Digital Generator',
    'Untested Flow',
    '30%',
    'LOI generator pre-filling commercial terms (rent, deposit, lock-in, fitout) from lead data.',
    'Generator UI exists, but printable LOI PDF layout and client digital acceptance tracking untested.',
    'Generate LOI for prospect, download PDF, verify terms match agreed negotiation values.',
    'Day 5 (Oct 25)'
  ],
  [
    57,
    'Leasing CRM',
    'Broker Commission Ledger',
    'Untested Flow',
    '30%',
    'Broker ledger tracking deals closed by channel partners, tiered commission %, and payout status.',
    'Schema and view coded, but commission calculation on multi-year rent value and GST billing untested.',
    'Add closed deal with 1-month brokerage; confirm ledger displays correct payout and TDS deduction.',
    'Day 5 (Oct 25)'
  ],

  // ========== 10. PROPERTY & FM OPERATIONS (SAAS MODULES) ==========
  [
    58,
    'Property Operations',
    '52-Week Preventive Maintenance (PPM) Calendar',
    'Untested Flow',
    '30%',
    'Annual maintenance schedule for HVAC, Lifts, Transformers, DG sets, Fire fighting systems.',
    'Entirely untouched in terms of real-world operational execution; task completion status not tested.',
    'Generate annual PPM schedule for 5 critical assets; verify weekly checklists and overdue task alerts.',
    'Day 6 (Oct 27)'
  ],
  [
    59,
    'Property Operations',
    'Daily Site Activity Logbook',
    'Untested Flow',
    '30%',
    'Daily logbook for facility managers (DG run hours, water tank levels, housekeeping shift sign-off).',
    'Form coded, but daily auto-closure, manager digital sign-off, and historical trend view untested.',
    'Log daily facility readings; verify auto-calculation of diesel consumption and water usage.',
    'Day 6 (Oct 27)'
  ],
  [
    60,
    'Property Operations',
    'Guard & Staff Attendance Tracking',
    'Untested Flow',
    '30%',
    'Shift-based attendance register for security guards and janitorial staff against contracted headcount.',
    'Screen built, but biometric / mobile punch-in sync and shortage deduction calculation untested.',
    'Enter staff shift attendance with 2 absentees; confirm shortage penalty reflects in monthly vendor billing.',
    'Day 6 (Oct 27)'
  ],
  [
    61,
    'Property Operations',
    'SLA Monitoring & Penalty Calculator',
    'Untested Flow',
    '30%',
    'SLA countdown timers for ticket response/resolution with contractual penalty calculation rules.',
    'Formulas coded, but auto-deduction against monthly vendor billing not integrated or tested.',
    'Simulate breached P1 ticket; verify penalty amount calculates and creates debit note against vendor.',
    'Day 6 (Oct 27)'
  ],
  [
    62,
    'Property Operations',
    'Helpdesk / Maintenance Ticketing',
    'Untested Flow',
    '35%',
    'Tenant ticket creation: category (AC, Electrical, Plumbing, Cleaning), priority (P1-P4), photo upload.',
    'Ticket logs in DB, but technician dispatch notification, tenant status update, and resolution OTP untested.',
    'Submit tenant maintenance ticket; verify technician assignment, status transitions, and resolution sign-off.',
    'Day 6 (Oct 27)'
  ],
  [
    63,
    'Property Operations',
    'Visitor Management & QR Pass',
    'Untested Flow',
    '30%',
    'Visitor pre-registration, QR badge generation, security desk check-in screen, host notification.',
    'QR code generates visually, but camera scanning at security desk and check-out tracking untested.',
    'Create visitor pass, test QR scanning on mobile camera, verify entry/exit timestamp logging.',
    'Day 6 (Oct 27)'
  ],
  [
    64,
    'Property Operations',
    'Consumables & Spares Inventory',
    'Untested Flow',
    '30%',
    'Stock ledger for cleaning materials, electrical spares, DG filters with minimum reorder thresholds.',
    'Stock table coded, but stock-out deduction on ticket resolution and purchase requisition untested.',
    'Add 5 inventory items, deduct stock on ticket completion, verify low-stock warning triggers.',
    'Day 6 (Oct 27)'
  ],
  [
    65,
    'Property Operations',
    'Fixed Asset Register & AMC Tracker',
    'Untested Flow',
    '30%',
    'Equipment register with serial numbers, warranty dates, AMC provider, and QR code tag generation.',
    'Table and form coded, but AMC renewal alerts and asset depreciation calculation untested.',
    'Add asset (1000kVA Transformer) with AMC details; verify warranty countdown and service history log.',
    'Day 6 (Oct 27)'
  ],
  [
    66,
    'Property Operations',
    'Operations MIS & Executive Reporting',
    'Untested Flow',
    '30%',
    'Operations report dashboard summarizing uptime %, tickets resolved, SLA compliance %, attendance %.',
    'Dashboard renders static layout; dynamic aggregation from live operational records untested.',
    'Verify executive dashboard calculations aggregate real ticket, PPM, and attendance records accurately.',
    'Day 6 (Oct 27)'
  ],

  // ========== 11. STATUTORY COMPLIANCE & ESG ==========
  [
    67,
    'Compliance & ESG',
    'Statutory Compliance Document Vault',
    'Untested Flow',
    '35%',
    'Vault for Fire NOC, Lift License, Pollution Control, Factory License with expiry date tracking.',
    'Uploads documents to storage, but expiry status color indicators (Green/Yellow/Red) untested.',
    'Upload 3 compliance certificates with near-expiry dates; confirm alert badge displays on dashboard.',
    'Day 6 (Oct 27)'
  ],
  [
    68,
    'Compliance & ESG',
    'Compliance Expiry Automated Alerts',
    'Blocked — Missing Credentials',
    '15%',
    'Alert dispatch function triggered 30, 15, and 7 days prior to statutory document expiry.',
    'Cannot deliver notifications because WhatsApp / SMS gateway credentials are not configured.',
    'Connect messaging gateway; test reminder dispatch to compliance officer for expiring Fire NOC.',
    'Day 6 (Oct 27)'
  ],
  [
    69,
    'Compliance & ESG',
    'ESG / Energy & Water Consumption Tracker',
    'Untested Flow',
    '30%',
    'Monthly electricity (kWh) and water (kL) meter entry with carbon footprint (tCO2e) calculator.',
    'Form and chart coded, but tenant sub-meter billing split and year-on-year reduction trend untested.',
    'Enter 3 months of energy data; verify carbon footprint calculation and tenant consumption charts.',
    'Day 6 (Oct 27)'
  ],

  // ========== 12. AI & SMART FEATURES ==========
  [
    70,
    'AI & Automation',
    'AI Helpdesk Ticket Categorization',
    'Untested Flow',
    '35%',
    'Keyword-based heuristic engine classifying ticket urgency (P1-P4) and category from text.',
    'Basic heuristics coded, but machine learning / NLP classification for unstructured text untested.',
    'Test with 10 real tenant complaints (e.g. AC water leaking, power trip); confirm priority assignment.',
    'Day 7 (Oct 28)'
  ],
  [
    71,
    'AI & Automation',
    'AI Vendor Matching for RFQs',
    'Untested Flow',
    '30%',
    'Ranking algorithm sorting vendors by distance, rating, available capacity, and historical quotes.',
    'Algorithm written, but ranking accuracy with multiple vendors in same category untested.',
    'Simulate RFQ with 5 registered vendors; confirm algorithm ranks most qualified vendor top.',
    'Day 7 (Oct 28)'
  ],
  [
    72,
    'AI & Automation',
    'AI Lease Document OCR Scanner',
    'Untested Flow',
    '25%',
    'Digital PDF parser with regex patterns for tenant name, rent, and term extraction.',
    'Fails on non-standard layouts and scanned images. Requires Vision AI API key for full accuracy.',
    'Connect OCR API (OpenAI/Google Vision); test with scanned Gujarat commercial lease agreement.',
    'Day 7 (Oct 28)'
  ],
  [
    73,
    'AI & Automation',
    'AI Conversational Assistant',
    'Untested Flow',
    '20%',
    'Chat widget UI with rule-based FAQ responses for tenant and manager inquiries.',
    'Rule-based fallback only; LLM API key not connected for contextual conversation.',
    'Add LLM API key (OpenAI/Gemini); test answering queries about lease expiry and rent payment.',
    'Day 7 (Oct 28)'
  ],

  // ========== 13. EXTERNAL INTEGRATIONS ==========
  [
    74,
    'Integrations',
    'SMS Gateway (Fast2SMS / Twilio)',
    'Blocked — Failing',
    '25%',
    'API adapter and dispatch functions coded in `lib/services/sms.ts`.',
    'SMS dispatch fails or credentials missing; OTP and critical alerts are currently blocked.',
    'Configure valid SMS gateway credentials, test OTP delivery to real Indian mobile numbers.',
    'Day 1 (Oct 21)'
  ],
  [
    75,
    'Integrations',
    'WhatsApp Business Cloud API',
    'Pending Client Setup',
    '15%',
    'Message templates and notification dispatch service coded in backend.',
    'Awaiting Meta WhatsApp Business API credentials / Interakt setup from client.',
    'Client to provide WhatsApp API credentials; verify test message delivery to real mobile.',
    'Day 6 (Oct 27)'
  ],
  [
    76,
    'Integrations',
    'Google Maps JavaScript API',
    'Pending Client Setup',
    '15%',
    'Map components, geocoding helpers, and pin marker clusterers written in React.',
    'Map fails to render because client Google Maps API key has not been provided.',
    'Client to provide Google Maps API key with Geocoding and Maps JS enabled; test interactive map.',
    'Day 4 (Oct 24)'
  ],
  [
    77,
    'Integrations',
    'Razorpay Payment Gateway (Live)',
    'Partially Working',
    '45%',
    'Razorpay SDK integrated with production API keys configured in environment.',
    'Checkout modal opens, but end-to-end webhook verification and live rupee settlement untested.',
    'Execute real Rs. 1 live transaction, verify signature validation and instant DB payment update.',
    'Day 3 (Oct 23)'
  ],

  // ========== 14. PRODUCTION DEPLOYMENT & HOSTING ==========
  [
    78,
    'Deployment',
    'Production Cloud Hosting & SSL',
    'In Progress',
    '20%',
    'Next.js app runs locally on dev server. Environment variables structure defined.',
    'Not yet deployed to production cloud server (Vercel / AWS). SSL and production headers pending.',
    'Deploy build to production cloud host, configure SSL certificates, set production ENV variables.',
    'Day 7 (Oct 28)'
  ],
  [
    79,
    'Deployment',
    'Production Domain (www.officex.pro)',
    'In Progress',
    '20%',
    'Domain registered by client.',
    'DNS A/CNAME records not yet pointed to production hosting server.',
    'Update DNS records, configure SSL certificates, verify HTTPS redirect on www.officex.pro.',
    'Day 7 (Oct 28)'
  ],
  [
    80,
    'Deployment',
    'Production Automated Cron Scheduler',
    'In Progress',
    '20%',
    'Cron API endpoints coded for monthly billing, overdue reminders, and compliance checks.',
    'No scheduler configured on server level to call endpoints automatically on schedule.',
    'Configure Vercel Cron or pg_cron schedule triggers to execute endpoints reliably on schedule.',
    'Day 7 (Oct 28)'
  ]
];

const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);
ws['!cols'] = [
  { wch: 6 },   // Sr No
  { wch: 20 },  // Module
  { wch: 40 },  // Feature / Flow
  { wch: 26 },  // Real Status
  { wch: 12 },  // Progress %
  { wch: 55 },  // What Is Built
  { wch: 55 },  // Current Reality
  { wch: 55 },  // What Is Pending
  { wch: 18 },  // Target Day
];

xlsx.utils.book_append_sheet(wb, ws, 'OfficeX Honest Status');

// Calculate summary
const total = rows.length;
let sumPct = 0;
let statusCounts = {};

rows.forEach(r => {
  const pct = parseInt(r[4].replace('%', ''));
  sumPct += pct;
  const st = r[3];
  statusCounts[st] = (statusCounts[st] || 0) + 1;
});

const avgPct = Math.round(sumPct / total);

// Write files with try/catch to handle Excel file locks
const docDir = path.resolve('documents');
if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

const docPath = path.join(docDir, 'OfficeX_Project_Status.xlsx');
const rootPath = path.resolve('OfficeX_Project_Status.xlsx');

const docPathAlt = path.join(docDir, 'OfficeX_Real_Project_Status.xlsx');
const rootPathAlt = path.resolve('OfficeX_Real_Project_Status.xlsx');

// Always write the alt file (never locked)
xlsx.writeFile(wb, docPathAlt);
xlsx.writeFile(wb, rootPathAlt);
console.log('Saved: ' + docPathAlt);
console.log('Saved: ' + rootPathAlt);

// Try writing to original files if user closed them
try {
  xlsx.writeFile(wb, docPath);
  console.log('Updated: ' + docPath);
} catch (e) {
  console.log('Note: ' + docPath + ' was locked in Excel, please view OfficeX_Real_Project_Status.xlsx or close Excel to overwrite.');
}

try {
  xlsx.writeFile(wb, rootPath);
  console.log('Updated: ' + rootPath);
} catch (e) {
  console.log('Note: ' + rootPath + ' was locked.');
}

console.log('');
console.log('OfficeX Honest Real-World Status Sheet Generated:');
console.log('  File 1:', docPath);
console.log('  File 2:', rootPath);
console.log('');
console.log(`  Total Features: ${total}`);
console.log(`  Overall Real-World Completion: ${avgPct}%`);
console.log('');
console.log('  Status Breakdown:');
Object.entries(statusCounts).sort().forEach(([k, v]) => console.log(`    ${k}: ${v}`));
console.log('');
