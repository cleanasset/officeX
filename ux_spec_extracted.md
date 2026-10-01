
| OFFICEX.PRO  ·  UX & SCREEN SPECIFICATION FOR SCALEZIX OFFICEX Rent Roll — Screen-by-Screen Specification Wireframe logic · every field · mandatory/optional · DB mapping · formulas · permissions · Excel import · alerts · KPIs Exact UX for Owner, Property Manager, Leasing, Finance and Tenant |


| SCREENS 54 | DERIVED FORMULAS 30 | ALERTS 22 | IMPORT MAPPINGS 83 |


| Document control | Value |
| Reference | OFFICEX-SCL-RR-UX-003  ·  Version 1.0  ·  29 September 2026 |
| Companion to | OFFICEX-SCL-RR-IMP-002 Final Implementation Document V2.1 (the "Implementation Document"). Requirement IDs (RR-…), rule IDs (R-…), formula IDs (F-…) and UAT IDs refer to it. |
| Precedence | For data model and business rules the Implementation Document prevails. For screen layout, field order, labels, controls, UX behaviour and messages, this document prevails. Any conflict must be raised to OFFICEX in writing before build. |
| Product | OFFICEX Rent Roll — standalone SaaS product; every screen here must work for an organisation that has subscribed to Rent Roll only (no CAFM, CRM or Marketplace). |
| Audience | Scalezix UX/UI designers, front-end and back-end engineers, QA and implementation team |
| Status | For implementation. Wireframes define layout logic and content, not visual design; Scalezix UX to produce high-fidelity designs in the OFFICEX design system and submit for approval per module. |

Document Map

| § | Section | Use |
| 1 | How to Read This Document | Notation, field-table columns, conventions |
| 2 | Global UX Framework | App shell, navigation, list/detail patterns, formats, states |
| 3 | Exact UX by Persona | Owner, Property Manager, Leasing, Finance, Tenant (+ Admin, Facility Manager) |
| 4 | Screen Specifications — Staff Application | Dashboards, register, masters, contracts, billing, collections, analytics, operator, settings |
| 5 | Screen Specifications — Tenant Portal | Occupant screens and payment journey |
| 6 | Calculations & Formulas Catalogue | Every computed field and KPI with worked values |
| 7 | Role Permissions | Screen matrix, action matrix, field masking |
| 8 | Excel Import Mapping | Standard template, quick template, synonyms, transforms, error messages |
| 9 | Alerts & Notifications Catalogue | Triggers, timing, recipients, channels, templates |
| 10 | Dashboard KPI Catalogue | Definition, formula, scope, drill-down, thresholds |
| 11 | UX Acceptance Checklist | What QA verifies per screen before sign-off |


| SECTION 1 | How to Read This Document Notation used in every screen specification |

1.1 Structure of Each Screen Specification
Header table: route (URL), roles that can open it, purpose, entry points.
Wireframe: monospace layout showing regions, order and controls. [Button] = button; [Text____] = input; [Select v] = dropdown; ( ) = radio; [x] = checkbox; <link> = link; #### = chart area; {computed} = read-only computed value.
Field table: every field on the screen with UI label, DB field, control, M/O and validation/default. Field order in the table is the on-screen order.
Actions: buttons and what they do, with the roles allowed.
States & rules: empty, loading, error, locked/approval states and business rules applied on the screen.
1.2 Field Table Columns

| Column | Meaning |
| UI label | Exact label text shown to the user (English; labels stored in i18n files for later Hindi support). |
| DB field | table.column in the Implementation Document schema. "calc:" = computed, not stored (formula ID given). "sys" = system-set, read-only. |
| Control | Text, Number, Currency (₹ with lakh grouping), Area, Date, Select, Multi-select, Lookup (type-ahead search on another entity), Toggle, Radio, Upload, Read-only. |
| M/O | M = mandatory to save; C = conditionally mandatory (condition in notes); O = optional; Sys = system-generated. |
| Validation / default | Rule IDs (R-…) from the Implementation Document plus field-level checks, default values and help text. |

1.3 Screen ID Ranges

| Range | Area |
| S-01 … S-06 | Login, role dashboards |
| S-10 … S-19 | Rent roll register, masters (property, building, space, seats, occupant), deals |
| S-20 … S-29 | Contracts: wizard, detail, documents, escalation, expiry, occupancy |
| S-30 … S-39 | Import centre, meter readings, seat counts |
| S-40 … S-49 | Billing, invoices, payments, allocation, ageing, disputes, deposits |
| S-50 … S-59 | Exceptions, forecast, P&L, MIS, owner statements, head leases |
| S-60 … S-69 | Settings and administration |
| T-01 … T-08 | Tenant (occupant) portal |


| SECTION 2 | Global UX Framework Applies to every screen unless the screen specification says otherwise |

2.1 Application Shell
Wireframe — App shell (desktop ≥ 1280 px)

| +------------------------------------------------------------------------------------------------------------+ | [OFFICEX logo | subscriber logo]  Client: [Self v]  Property: [All properties v]  As of: [30-Sep-2026]     | |                         [Search occupant, space, contract, invoice ...........]   [Bell 5] [RM v]          | |------------------------------------------------------------------------------------------------------------| | NAV (by role + entitlement)  | Breadcrumb: Portfolio > Meridian Tech Park > T1 > MTP-T1-03                 | |  Dashboard                   | PAGE TITLE {status chip}                 [Secondary] [Primary]              | |  Rent Roll                   | ------------------------------------------------------------------          | |  Deals                       | Tabs / filter bar  [Filter chips x] [+ Filter] [Saved view v]               | |  Contracts                   |                                                                             | |  Billing                     |  CONTENT AREA                                                               | |  Payments                    |   - list pages: summary strip + table + totals row + pagination             | |  Collections                 |   - detail pages: header card + tabs + right-side activity panel            | |  Reports                     |                                                                             | |  Exceptions (12)             |                                                                             | |  Import                      |                                                                             | |  Settings                    |  Footer: Powered by OFFICEX (hidden on Enterprise white-label)              | +------------------------------------------------------------------------------------------------------------+ |

Client selector appears only when the Multi-Client Operator add-on is active; "Self" is the only value otherwise and the selector is hidden.
Property selector scopes every screen; default "All properties" for portfolio roles and "My properties" for scoped roles. Selection persists per user.
As-of date defaults to today; changing it re-computes the register, dashboards and analytics for that date (RR-VW-03). Transaction screens (billing, payments) ignore it.
Global search returns occupants, spaces, contracts, deals and invoices the user is permitted to see, grouped by type, top 5 each.
Navigation is built from entitlements and role (RR-ENT-04). Items the user cannot open are not shown at all.
Bell opens the notification drawer (latest 50, unread first) with "Open", "Snooze 1 day", "Mark done".
2.2 Navigation by Role

| Menu item | Owner | Prop. Mgr | Leasing | Finance | Fac. Mgr | Org Admin | Tenant portal |
| Dashboard | Owner (S-02) | Today (S-03) | Leasing (S-04) | Finance (S-05) | Today (S-03) | Owner (S-02) | Home (T-01) |
| Rent Roll | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Deals | View | ✓ | ✓ | — | — | ✓ | — |
| Contracts | ✓ | ✓ | ✓ | View | View | ✓ | My Contract (T-06) |
| Billing | View | View | — | ✓ | Charges | ✓ | Invoices (T-02) |
| Payments | View | — | — | ✓ | — | ✓ | Payments (T-04) |
| Collections | ✓ | View | — | ✓ | — | ✓ | — |
| Reports | ✓ | ✓ | Pipeline | ✓ | Charges | ✓ | — |
| Exceptions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Import | — | — | — | — | — | ✓ | — |
| Operations (meters, seats) | — | ✓ | — | ✓ | ✓ | ✓ | — |
| Settings | — | — | — | Billing setup | — | ✓ | Profile (T-08) |

2.3 Standard List Page Pattern
Summary strip of 3–6 KPI tiles above the table; each tile clickable to apply the matching filter.
Server-side pagination (default 50 rows; 25/50/100/200), sort on any sortable column, sticky header and first column, horizontal scroll inside the table only.
Filter bar with chips; "+ Filter" adds any filterable column; filters are written to the URL so a view can be shared.
Saved views (private or shared with organisation); column chooser with drag to reorder; density toggle (comfortable/compact).
Totals row pinned at bottom for numeric columns (sums of all filtered rows, not only the visible page).
Row click opens the detail drawer (right, 480 px) for a quick look; "Open full page" in the drawer opens the detail page.
Bulk select with checkbox → bulk actions bar (only actions permitted for every selected row).
Export (Excel/CSV/PDF) exports all filtered rows with the visible columns, applying role masking (RR-VW-06).
2.4 Standard Detail and Form Patterns
Header card: name, code, status chip, key figures, primary actions. Tabs below. Right panel: activity timeline (audit events and comments) with comment box and @mentions.
Forms open in a full-page editor for create and multi-step items, and in a drawer for small edits. Mandatory fields are marked with a red asterisk; the Save button is enabled only when all mandatory fields are valid.
Inline validation on blur; summary of errors at top on save attempt, each linking to its field.
Unsaved-changes guard on navigation away. Autosave draft every 30 seconds for the contract wizard.
Optimistic locking: if the record changed since opened, show "This record was updated by <user> at <time>. [Reload] [Compare]" and never overwrite silently.
Records pending approval show a yellow banner: "Pending approval by <role> — submitted by <user> on <date>. [View changes] [Approve] [Reject]" (buttons only for approvers; maker cannot approve own change — RR-CON-09).
2.5 Formats and Conventions

| Item | Rule |
| Currency | ₹ with Indian grouping: ₹1,45,45,200.00 in tables with 2 decimals; dashboards may abbreviate: ₹1.45 Cr, ₹24.2 L. USD shown as USD 7,500.00. Negative values in brackets and red. |
| Area | 8,500 sq ft (Indian grouping). sq m shown in brackets when property unit is sqm. |
| Rates | ₹285.20 /sq ft/month; ₹15,000 /seat/month. |
| Dates | DD-MMM-YYYY (30-Sep-2026) in UI; ISO in API and exports option. Financial year shown as FY 2026-27. |
| Percent | One decimal (68.2%); escalation % up to two decimals. |
| Time zone | User time zone, default Asia/Kolkata; timestamps "30-Sep-2026 14:05 IST". |
| Status chips | Green: active, paid, applied, passed. Blue: future, issued, scheduled. Amber: notice served, partially paid, pending approval, warning, due. Red: holding over, overdue, failed, disputed. Grey: draft, expired, cancelled, vacant. |
| Empty values | Show "—"; never "0" for unknown values. |

2.6 Page States

| State | Behaviour |
| Loading | Skeleton rows/tiles; never a blank page; show after 300 ms. |
| Empty (first use) | Illustration + one-line explanation + primary action (e.g. "No properties yet. [Import rent roll] [Add property]"). |
| Empty (filtered) | "No results for these filters. [Clear filters]". |
| Error | Inline message with retry; error reference ID shown for support. |
| No permission | Page not linked in navigation; direct URL shows "You do not have access to this page" with a link to the dashboard. |
| Not entitled | Feature not in subscription: hidden in navigation; direct URL shows upgrade message to Org Admin only. |
| Locked period | Snapshot-locked period: fields read-only with lock icon and tooltip "Period locked on <date>; use a credit/debit note". |

2.7 Responsive Behaviour
Staff application is desktop-first (≥1280 px). On tablet (768–1279 px) navigation collapses to icons. On mobile (<768 px) staff users get: dashboards (tiles stacked), approvals inbox, alerts, contract summary (read-only), and record-payment — nothing else.
Tenant portal is mobile-first: every T-screen must be fully usable at 360 px width, including payment.
Accessibility: WCAG 2.1 AA — keyboard navigation, focus states, labels on all inputs, colour never the only signal (chips also carry text).

| SECTION 3 | Exact UX by Persona What each user sees first, does every day and never sees |

3.1 Owner / Client Principal / Asset Manager

| Aspect | Owner UX |
| Landing screen | S-02 Owner Portfolio Dashboard, scoped to all properties (Client Principal: own client account only). |
| Primary questions | How much am I earning? Am I being paid? What is at risk in the next 12 months? Is anything waiting for my approval? |
| Daily (2 min) | Opens dashboard → reads 8 KPI tiles → clicks red items (overdue >60 days, holding over) → reads exceptions assigned to "Owner". |
| Weekly | Approvals inbox (new contracts, financial-term changes, escalations if configured, owner statements) → approve/reject with comment. |
| Monthly | Receives MIS PDF by email on the 5th (configurable) → opens S-54 MIS for drill-down → downloads investor pack (S-54). |
| Can do | View everything in scope, approve per approval matrix, export, comment, receive statements. |
| Cannot do | Edit contracts, invoices or payments directly; import data; change settings (unless also Org Admin). |
| Notifications | Approval requests (immediate), overdue >60 days, holding over, expiry 12/6/3/1 months for critical occupants, monthly MIS ready, owner statement issued. |
| Mobile | Dashboard tiles, approvals inbox with approve/reject, MIS PDF viewer. |

3.2 Property Manager / Centre Manager

| Aspect | Property Manager UX |
| Landing screen | S-03 Today: task queue for assigned properties. |
| Primary questions | What needs my action today? Is every space and contract correct? Which occupants need follow-up? |
| Daily | Today queue: data exceptions, missing documents, notices received, holding-over contracts, disputes assigned, seat counts or meter readings due → each item opens the exact screen with the record pre-selected. |
| Contract work | Creates contracts via S-21 wizard (draft) → submits for approval; records notice (S-22 "Serve notice"), renewal, surrender of space; uploads documents. |
| Month-end (flex/FM) | By day 25: submits seat counts (S-32) and meter readings (S-31) so billing can run on day 1. |
| Can do | Create/edit spaces, occupants, contracts (draft), documents, seat counts, meter readings for assigned properties; view billing and collections. |
| Cannot do | Approve own financial changes, issue invoices, record payments, change tax or numbering settings. |
| Notifications | Expiry and lock-in alerts, escalation due (info), document expiry, seat count/meter reading due, dispute assigned, data exceptions. |
| Mobile | Today queue, contract summary, record notice with photo of letter, seat count entry. |

3.3 Leasing Manager

| Aspect | Leasing UX |
| Landing screen | S-04 Leasing Dashboard: vacancy, expiry pipeline, deals. |
| Primary questions | What space is free or becoming free? Which renewals must I start now? Where are my deals? |
| Daily | Expiry pipeline (S-24) → moves renewals through stages → creates renewal deal; Deal register (S-18) → updates stage/probability; vacant space list with asking rate. |
| Deal to contract | Deal at "won" → [Convert to contract] → S-21 wizard opens pre-filled from deal → submits for approval → contract becomes future/active. |
| Can do | Create/edit deals and prospects, draft contracts, upload LOI/term sheet, update asking rates (if permitted), view rent roll. |
| Cannot do | See invoices, payments or occupant arrears detail (sees only a "has arrears" flag); approve financial terms. |
| Notifications | Expiry 12/6/3/1 months, lock-in end, renewal option window opening, deal idle >14 days, vacant space >90 days. |
| Mobile | Deal list and stage update, vacancy list, expiry pipeline. |

3.4 Finance / AR Manager

| Aspect | Finance UX |
| Landing screen | S-05 Finance Dashboard: this period billing status, collections, ageing, unallocated cash. |
| Primary questions | Is this month billed correctly? What came in today and is it allocated? Who is overdue? Are GST/TDS right? |
| Monthly cycle | Day 1: create billing run (S-40) → review exceptions (missing GSTIN, pending escalations, unsubmitted seat counts) → review drafts → approve → issue (emails + WhatsApp with pay link). |
| Daily | Payment Centre (S-43): Razorpay payments arrive auto-allocated → review "needs attention" (unallocated, partial, mismatched) → record offline receipts (NEFT/cheque/TDS) → allocate. |
| Weekly | Ageing (S-45) → reminders and follow-up tasks → disputes (S-46) → credit/debit notes (S-42). |
| Month-end | Lock snapshot (S-53), deposit review (S-47), owner statements (S-55) for operators, export to Tally. |
| Can do | All billing, invoice, payment, allocation, note, deposit, statement actions; edit financial terms (maker) and approve others’ changes (checker). |
| Cannot do | Delete issued invoices or payments (cancel/reverse only with reason); edit locked periods. |
| Notifications | Billing run ready, invoices pending approval, payment received/unallocated, overdue cadence, dispute raised, escalation applied, deposit shortfall, e-invoice failure. |
| Mobile | Finance dashboard, approvals, record offline payment. |

3.5 Tenant (Occupant) — Tenant Portal

| Aspect | Tenant UX |
| Access | Invited by email/WhatsApp link from the subscriber; login by email or mobile OTP (no password). Finance contact, admin contact and signatory can all be users; each sees only their occupant company. |
| Landing screen | T-01 Home: total outstanding with [Pay now], next due date, latest invoices, notices, documents. |
| Primary questions | How much do I owe and by when? Can I pay now, in one go or partially? Where is my receipt, agreement, TDS detail? |
| Pay journey | T-02 select invoices (default: all overdue + due) → amount (full or partial) → T-03 Razorpay checkout → success page with receipt → email/WhatsApp receipt. |
| Other tasks | Download invoices/receipts/agreement (occupant-visible only), raise dispute on an invoice (T-05), upload TDS certificate (Form 16A) against invoices, update contacts. |
| Cannot see | Other occupants, internal documents, internal comments, landlord costs, rent roll. |
| Branding | Subscriber logo, colours, sender name; "Powered by OFFICEX" footer unless removed on Enterprise. |
| Notifications | Invoice issued (with pay link), due in 3 days, overdue 1/7/30 days, payment receipt, dispute update, escalation notice (30 days before), document shared. |

3.6 Facility Manager and Organisation Admin (summary)
Facility Manager: lands on S-03 Today filtered to charges work — meter readings, CAM pools, charges-only contracts and service-charge invoices. Cannot change rent or contract commercial terms other than service charges.
Organisation Admin: lands on S-02; additionally sees Import (S-30) and Settings (S-60…S-67); manages users, roles, billing entities, charge types, tax profiles, numbering, alert rules, branding and subscription.

| SECTION 4 | Screen Specifications — Staff Application Dashboards, register, masters and deals (S-01 … S-18) |

S-01  Login & Workspace Selection

| Route | Roles (see §7) | Purpose | Entry points |
| /login, /select-workspace | All staff users | Authenticate and choose organisation/client context | URL, invite email |

Wireframe — S-01 Login

| +------------------------------------------------------------------------------------------------------------+ |                          [Subscriber logo or OFFICEX logo]                                                 | |                          Sign in to OFFICEX Rent Roll                                                      | |                          Email      [______________________________]                                       | |                          ( ) Password [__________]   ( ) Email me a one-time code                          | |                          [Sign in]            <Forgot password>   <Sign in with SSO> (Enterprise)          | |------------------------------------------------------------------------------------------------------------| | After sign-in, if user belongs to >1 organisation:  Choose workspace                                       | |   [Brightspace Properties  - Owner]   [Sharma Estates (managed) - Property Manager]                        | |   [x] Remember my choice                                                                                   | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Email | users.email | Text | M | Valid email; case-insensitive. |
| 2 | Password / one-time code | auth (Supabase) | Password / OTP | M | Lock after 5 failed attempts for 15 min. OTP valid 10 min. |
| 3 | Workspace | org_membership.org_id | Card select | C | Shown only if user has >1 organisation. Default = last used. |

After login the user lands on the role dashboard in §2.2. If the organisation subscription is suspended, only Org Admin can sign in and sees the subscription page.
S-02  Owner Portfolio Dashboard

| Route | Roles (see §7) | Purpose | Entry points |
| /dashboard/owner | Owner, Client Principal, Asset Manager, Management, Org Admin, Auditor | Portfolio performance at a glance | Default landing for these roles |

Wireframe — S-02 Owner dashboard

| +------------------------------------------------------------------------------------------------------------+ | Owner Dashboard      Scope: [All properties v]  Period: [Sep-2026 v]        [Download MIS] [Share]         | |------------------------------------------------------------------------------------------------------------| | [Annual contracted rev] [Billed this month] [Collected MTD] [Outstanding]   [Collection eff.]              | |   Rs 17.16 Cr  (K-01)     Rs 1.43 Cr (K-02)   Rs 1.21 Cr (K-03) Rs 38.4 L(K-04)  84.6% (K-05)              | | [Occupancy area] [Occupancy seats] [WALE income] [Revenue at risk 12m] [Escalations due 90d]               | |    68.2% (K-06)      84.2% (K-07)    3.86 yrs(K-08)  Rs 5.22 Cr (K-09)     3 / +Rs 2.9 L (K-10)            | |------------------------------------------------------------------------------------------------------------| | Billed vs Collected - last 12 months (K-11)     | Ageing (K-12)       0-30  31-60  61-90  90+              | | #################################################|  ####### donut ####  18.2L  9.6L  4.1L  6.5L            | |------------------------------------------------------------------------------------------------------------| | Lease rollover - next 10 years (K-13)           | Top 10 occupants by revenue (K-14)                       | | ######## stacked bars by property ##############|  1 Innovate Corp      Rs 20.90 L   14.6%                 | |                                                 |  2 NextGen Retail     Rs 20.24 L   14.2%                 | |------------------------------------------------------------------------------------------------------------| | Properties                                   Occ%  Monthly rent  Outstanding  WALE  Exceptions             | |  Apex Business Tower  (APX-BKC)               46%   Rs 52.29 L    Rs 4.1 L     4.2   2                     | |  Meridian Tech Park   (MTP-GGN)               75%   Rs 59.27 L    Rs 31.6 L    2.9   4 (red)               | |------------------------------------------------------------------------------------------------------------| | Awaiting my approval (3)  [Open approvals inbox]    |  Critical exceptions (5)  [Open]                     | +------------------------------------------------------------------------------------------------------------+ |

Every tile and chart segment is clickable and opens the filtered list behind it (drill-down defined per KPI in §10).
Tiles show comparison to the previous period (▲/▼ with %) and threshold colouring per §10.
Client Principal sees the same layout restricted to their client account; the client selector is locked.
Data comes from the reporting layer (refreshed on change, max 15 minutes stale); "Last refreshed hh:mm" shown top-right.
S-03  Today — Property Manager / Facility Manager

| Route | Roles (see §7) | Purpose | Entry points |
| /dashboard/today | Property Manager, Centre Manager, Facility Manager | Single action queue for assigned properties | Default landing for these roles |

Wireframe — S-03 Today queue

| +------------------------------------------------------------------------------------------------------------+ | Today - Tue 29-Sep-2026        Properties: [My properties (3) v]      [+ New contract] [+ Notice]          | |------------------------------------------------------------------------------------------------------------| | [Overdue actions 4] [Due this week 9] [Pending my submission 2] [Occupancy 72%] [Open disputes 1]          | |------------------------------------------------------------------------------------------------------------| | QUEUE                                   Due        Record                    Action                        | | (red)  Holding over - no exit recorded   Today      MTP-T1-04 NextGen         [Record exit/renew]          | | (red)  Seat count not submitted Oct      25-Sep     FLX-4F Brightpath         [Enter seat count]           | | (amb)  Lock-in ends; tenant may serve    31-Oct     MTP-T1-03 Innovate        [Open contract]              | | (amb)  Missing executed agreement        -          NXH-G01 FreshMart         [Upload document]            | | (amb)  Meter readings due (12 meters)    30-Sep     Meridian Tech Park        [Enter readings]             | | (blu)  Escalation due 01-Nov +15%        01-Nov     MTP-T1-03 Innovate        [Review]                     | | (blu)  Insurance certificate expires     15-Oct     APX-05A TechNova          [Request renewal]            | |------------------------------------------------------------------------------------------------------------| | My properties   Occupancy  Vacant space   Expiring 90d   Open exceptions                                   | |  Meridian TP      75.0%     18,500 sq ft       1               4                                           | +------------------------------------------------------------------------------------------------------------+ |

The queue merges alerts (§9) assigned to the user and tasks. Sort: severity, then due date. Each row has [Snooze], [Reassign], [Done] in its overflow menu; "Done" requires the underlying condition to be resolved unless the alert type is informational.
Facility Manager variant: queue limited to meter readings, CAM pools, charges-only contracts, service-charge disputes, document expiry of FM-related documents.
S-04  Leasing Dashboard

| Route | Roles (see §7) | Purpose | Entry points |
| /dashboard/leasing | Leasing Manager (+ Asset Manager, Owner via Reports) | Vacancy, expiries and deals in one place | Default landing for Leasing |

Wireframe — S-04 Leasing dashboard

| +------------------------------------------------------------------------------------------------------------+ | Leasing                       Scope: [All properties v]                   [+ New deal] [Vacancy list]      | |------------------------------------------------------------------------------------------------------------| | [Vacant/reserved 55,700 sq ft] [Vacant seats 38] [Expiring 12m: 2 / Rs 43.5 L pm] [Deals open 6 / Rs 34 L] | |------------------------------------------------------------------------------------------------------------| | EXPIRY PIPELINE (S-24)   0-30d      31-90d      91-180d      181-365d     365d+                            | |                          0          0           1            1            6                                | |                                                  Orbit Edutech  Apex Fin.                                  | |------------------------------------------------------------------------------------------------------------| | DEALS BY STAGE   Enquiry  Qualified  Site visit  Negotiation  LOI   Agreement   Won(30d) Lost(30d)         | |                    2         1          1           1          1        0          1        0              | |------------------------------------------------------------------------------------------------------------| | VACANT & RESERVED SPACE        Area/seats   Asking rate   Vacant since   Days vacant   Deal                | |  APX-09  Apex Business Tower   10,200 sq ft  Rs 290        01-Apr-2026    181           -                  | |  MTP-T2-02 Meridian T2         18,500 sq ft  Rs 100        01-Jan-2026    271 (red)     DEAL-017           | +------------------------------------------------------------------------------------------------------------+ |

Leasing users see an "Arrears" flag (yes/no) on occupants, never amounts.
S-05  Finance Dashboard

| Route | Roles (see §7) | Purpose | Entry points |
| /dashboard/finance | Finance / AR Manager, Org Admin | Month billing status, cash, ageing | Default landing for Finance |

Wireframe — S-05 Finance dashboard

| +------------------------------------------------------------------------------------------------------------+ | Finance         Billing entity: [All v]   Period: [Oct-2026 v]                    [Create billing run]     | |------------------------------------------------------------------------------------------------------------| | BILLING RUN Oct-2026:  Draft (148 invoices, Rs 1.52 Cr)  Exceptions 6  [Review run]   Due: 01-Oct          | |------------------------------------------------------------------------------------------------------------| | [Pending approval 12] [Issued unpaid Rs 72.4 L] [Collected today Rs 11.0 L] [Unallocated Rs 1.6 L]         | | [Overdue >60d Rs 10.6 L] [Disputes open 2] [Deposit shortfalls 1] [TDS certificates pending 9]             | |------------------------------------------------------------------------------------------------------------| | Ageing by bucket (K-12)          |  Collections last 30 days (daily bars)                                  | | ###########################      |  ###############################################                        | |------------------------------------------------------------------------------------------------------------| | NEEDS ATTENTION                                     Amount       Action                                    | |  Payment pay_N8x... partially matched (TechNova)    Rs 11,00,000 [Allocate]                                | |  e-Invoice IRN failed  SE/26-27/0142                Rs 11,80,000 [Retry] [View error]                      | |  Invoice dispute  INV MTP/26-27/0311 (NextGen)      Rs 2,84,320  [Open dispute]                            | +------------------------------------------------------------------------------------------------------------+ |

S-06  Approvals Inbox

| Route | Roles (see §7) | Purpose | Entry points |
| /approvals | Any approver role | One place to approve/reject maker-checker items | Bell, dashboards, email link |

Wireframe — S-06 Approvals

| +------------------------------------------------------------------------------------------------------------+ | Approvals   [Pending 7] [Approved by me 30d] [Rejected 30d]      Type: [All v]  Property: [All v]          | |------------------------------------------------------------------------------------------------------------| | Type                  Record                 Submitted by     On          Impact                           | | New contract          APX-L-0057 Global Log.  Leasing: Anita   27-Sep      +Rs 34.80 L/month  [>]          | | Financial change      MTP-L-0012 rate 95->98  PM: Ravi         28-Sep      +Rs 66,000/month   [>]          | | Escalation apply      GFT-L-0003 +5%          System           29-Sep      +USD 375/month     [>]          | | Billing run           Oct-2026 (148 inv.)     Finance: Meera   01-Oct      Rs 1.52 Cr         [>]          | |------------------------------------------------------------------------------------------------------------| | Detail panel: side-by-side OLD vs NEW for every changed field, source document link,                       | | comments.   [Reject - reason required]   [Approve]                                                         | +------------------------------------------------------------------------------------------------------------+ |

Approval matrix configured in S-66. The maker never sees Approve on their own item. Bulk approve allowed only for escalations and billing-run invoices, never for new contracts.
S-10  Rent Roll Register

| Route | Roles (see §7) | Purpose | Entry points |
| /rent-roll | All staff roles (scoped) | The rent roll: one row per space (and per contract where a space has several) | Nav "Rent Roll", dashboard drill-downs |

Wireframe — S-10 Rent Roll Register

| +------------------------------------------------------------------------------------------------------------+ | Rent Roll      As of [30-Sep-2026]   View: (o) Current ( ) Contracted ( ) Forecast                         | |                Group by: [Property v]     [Columns] [Saved views v] [Export v] [+ New contract]            | |------------------------------------------------------------------------------------------------------------| | [Spaces 13] [Occupied 1,19,600 sq ft | 68.2%] [Monthly base Rs 1.43 Cr] [WALE 3.86 y] [Exceptions 7]       | |------------------------------------------------------------------------------------------------------------| | Filters: [Property: All x] [Status: Active, Notice, Holding over x] [+ Filter]     [Clear]                 | |------------------------------------------------------------------------------------------------------------| |  Space      Occupant             Model  Area    Rate    Monthly base  Expiry     Next esc.  Outst.         | | v Apex Business Tower (APX-BKC)                 40,900         Rs 52.29 L                    4.1 L         | |  APX-05A    TechNova Solutions*  Area   8,500   285.20  24,24,200     31-Mar-32  01-Apr-29  0              | |  APX-07     (Deal) Global Logist. -     12,000  290.00  -             -          -          -              | |  APX-08     Apex Financial Adv.* Area   10,200  275.00  28,05,000     14-Jul-27  -          4.1 L          | |  APX-09     Vacant               -      10,200  (290)   -             -          -          -              | | v Meridian Tech Park (MTP-GGN)                  81,000         Rs 59.27 L                    31.6 L        | |  MTP-T1-04  NextGen Retail (HOLD) Area  22,000  92.00   20,24,000     31-Dec-25  -          31.6 L         | |------------------------------------------------------------------------------------------------------------| | TOTAL (filtered, all pages)                     1,75,300       Rs 1.43 Cr                    38.4 L        | | [< 1 2 >]  50 per page                                                                                     | +------------------------------------------------------------------------------------------------------------+ |

Row click → contract detail drawer (summary, charges, key dates, outstanding, documents, actions). Vacant row click → space drawer with [Create deal] and [Create contract].
Current view: active, notice served, holding over. Contracted view adds future contracts (blue rows). Forecast view adds deals weighted by probability (italic, amber) — deal rows never add to "Monthly base" totals; a separate "Weighted pipeline" total is shown.
Row colours: red background for holding over; amber for notice served; grey for vacant; blue for future.
Asking rate for vacant spaces is shown in brackets in the rate column.
S-10 Register column dictionary (every column in the rent roll)

| Column | Source (DB / calc) | Format | Default visible | Role masking |
| Client account | client_account.name | Text | Hidden unless Multi-Client | — |
| Property | property.name (code) | Text | Yes | — |
| Building | building.name | Text | Yes | — |
| Floor | space.floor | Integer (G = 0) | Yes | — |
| Space | space.space_code | Link to space | Yes | — |
| Space type | space.space_type | Text | No | — |
| Chargeable area | contract_space.area_let or space.chargeable_area if vacant | Area | Yes | — |
| Carpet area | space.carpet_area | Area | No | — |
| Seats (capacity) | space.seat_capacity | Integer | Flex only | — |
| Space status | space.status | Chip | Yes | — |
| Occupant | occupant.legal_name | Link | Yes | — |
| Trade name | occupant.trade_name | Text | No | — |
| Industry | occupant.industry | Text | No | — |
| GSTIN | occupant.gstin | Text | No | Leasing: hidden |
| Critical | occupant.is_critical | Star icon | Yes | — |
| Contract | contract.contract_code | Link | Yes | — |
| Contract type | contract.contract_type | Text | No | — |
| Billing model | contract.billing_model | Text | Yes | — |
| Contract status | contract.status | Chip | Yes | — |
| Commencement | contract.commencement_date | Date | Yes | — |
| Rent commencement | contract.rent_commencement_date | Date | No | — |
| Expiry | contract.expiry_date | Date | Yes | — |
| Days to expiry | calc: D-10 | Integer, red <90 | Yes | — |
| Lock-in end | contract.lock_in_end_date | Date | Yes | — |
| Notice period | contract.notice_period_months | Months | No | — |
| Earliest exit date | calc: D-12 | Date | No | — |
| Current rate | calc: D-07 (base_rent or seat_fee charge) | Rate | Yes | — |
| Monthly base rent | calc: D-01 / D-02 | Currency | Yes | — |
| Annualised base rent | calc: D-03 | Currency | No | — |
| Contracted / min / occupied / billable seats | contract.seats_* ; seat_count.occupied ; calc F-04…F-06 | Integer | Flex only | — |
| CAM (monthly) | calc: D-04 (or "Included") | Currency / text | Yes | — |
| Other recurring charges | calc: Σ other fixed charges | Currency | No | — |
| Gross monthly recurring | calc: D-05 | Currency | Yes | — |
| Effective rate | calc: D-06 | Rate | No | — |
| Escalation | rent_step (type/value/cycle) summary | Text "15% / 36m" | Yes | — |
| Next escalation date | calc: D-08 | Date, amber <90d | Yes | — |
| Next escalation uplift | calc: D-09 | Currency | No | — |
| Rent-free until | concession.end_date (type rent_free) | Date | No | — |
| Deposit required / held | deposit.required_amount / held_amount | Currency | No | Leasing: hidden |
| Deposit shortfall | calc: D-13 | Currency, red >0 | No | Leasing: hidden |
| Billed (period) | Σ invoice.gross for as-of month | Currency | No | Leasing: hidden |
| Collected (period) | Σ payment_allocation in month | Currency | No | Leasing: hidden |
| Outstanding | calc: D-16 | Currency, red if overdue | Yes | Leasing: "Arrears Y/N" |
| Ageing bucket (oldest) | calc: D-17 → bucket | Chip | No | Leasing: hidden |
| Renewal stage | deal.stage (renewal deal) or "—" | Chip | No | — |
| Current agreement | contract.current_document_id | Icon link | Yes | Occupant-visible rules |
| Missing documents | calc: RR-CON-05 flag | Icon | No | — |
| Data quality | contract.data_quality_status | Chip | No | — |
| Last updated | contract.updated_at / by | Timestamp | No | — |

S-10 Filters
Client account, property, building, floor, space type, occupant, industry, critical, contract type, billing model, contract status, space status, area range, rate range, monthly rent range, revenue component present, expiry window (0–30/31–90/91–180/181–365/365+ or custom dates), lock-in window, escalation due window, delinquency (none/overdue/>60/>90), deposit shortfall (yes/no), data quality, missing documents.
S-10 Actions

| Action | Roles | Behaviour |
| + New contract | PM, Leasing, Asset Mgr, Org Admin | Opens S-21 wizard; if a space row is selected, space is pre-filled. |
| Export | All except Tenant | Excel/CSV/PDF of filtered rows and visible columns with masking; audit event "export". |
| Save view | All | Name, private/shared (shared only by Org Admin/Asset Mgr). |
| Bulk: assign property manager | Org Admin | Updates property assignment for selected spaces' properties. |
| Bulk: send statement to occupants | Finance | Emails account statement (T-04 format) to selected occupants. |

S-11  Property Form

| Route | Roles (see §7) | Purpose | Entry points |
| /properties/new, /properties/{id} | Org Admin, Asset Mgr (create); PM (edit assigned) | Create/edit a property | Rent Roll group header, Settings, import |

Wireframe — S-11 Property

| +------------------------------------------------------------------------------------------------------------+ | New property                                                            [Cancel] [Save]                    | |------------------------------------------------------------------------------------------------------------| | IDENTITY        Code* [APX-BKC]   Name* [Apex Business Tower______________]                                | |                 Type* [Office v]  Grade [A v]  Status* [Operational v]  Client account* [Self v]           | | ADDRESS         Line 1* [____________] Line 2 [__________] City* [Mumbai] Micro-market [BKC]               | |                 State* [Maharashtra v] PIN* [400051]  Map pin [Pick on map]                                | | AREA            Chargeable area* [98,400] Carpet area [68,900] Unit* (o) sq ft ( ) sq m                    | |                 Loading {42.8%}   Sum of spaces {98,400 - matches}                                         | | BILLING         Default billing entity* [Apex Realty Pvt Ltd (27AAB...) v] Currency* [INR v]               | | OTHER           Ownership [Single owner v] Acquisition date [__] OC date [__]                              | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Property code | property.property_code | Text (max 20) | M | Unique per org; uppercase letters, digits, hyphen. |
| 2 | Property name | property.name | Text (max 120) | M | — |
| 3 | Property type | property.property_type | Select | M | office | it_park | retail | mixed_use | industrial | warehouse | flex_centre | sez_ifsc. |
| 4 | Grade | property.grade | Select | O | A+ | A | B+ | B | C. |
| 5 | Status | property.status | Select | M | Default operational. |
| 6 | Client account | property.client_account_id | Lookup | M | Default "Self"; hidden unless Multi-Client. |
| 7 | Address line 1 / 2 | property.address_line1/2 | Text | M / O | — |
| 8 | City / Micro-market | property.city / micro_market | Text / Select | M / O | Micro-market list per city (configurable). |
| 9 | State | property.state | Select | M | Indian states + UTs; drives place of supply. |
| 10 | PIN code | property.pincode | Text (6 digits) | M | Numeric, 6 digits. |
| 11 | Map pin | property.geo_lat / geo_lng | Map picker | O | — |
| 12 | Chargeable area | property.total_chargeable_area | Area | M | > 0. Warning R-03 if ≠ Σ spaces ±0.5%. |
| 13 | Carpet area | property.total_carpet_area | Area | O | ≤ chargeable area. |
| 14 | Area unit | property.area_unit | Radio | M | Default sq ft. |
| 15 | Loading | calc: D-14 | Read-only | Sys | — |
| 16 | Default billing entity | property.default_billing_entity_id | Lookup | M | Entities of the selected client account; GSTIN state should match property state (warning). |
| 17 | Operating currency | property.operating_currency | Select | M | Default INR; USD allowed only for sez_ifsc. |
| 18 | Ownership type | property.ownership_type | Select | O | single_owner | strata | jv | reit_spv. |
| 19 | Acquisition date / OC date | property.acquisition_date / oc_date | Date | O | Not in future. |

S-12  Building Form

| Route | Roles (see §7) | Purpose | Entry points |
| /properties/{id}/buildings/new | Org Admin, Asset Mgr, PM (assigned) | Add towers/blocks to a property | Property detail > Buildings tab |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Building code | building.building_code | Text | M | Unique within property. Single-building properties get "MAIN" automatically. |
| 2 | Building name | building.name | Text | M | — |
| 3 | Floors above / below ground | building.floors_above / floors_below | Number | O | 0–150 / 0–10. |
| 4 | Chargeable area | building.chargeable_area | Area | O | Warning if ≠ Σ spaces. |

S-13  Space Form (incl. Seat Inventory)

| Route | Roles (see §7) | Purpose | Entry points |
| /spaces/new, /spaces/{id} | Org Admin, Asset Mgr, PM (assigned) | Create/edit a leasable space; for flex floors define seats | Property > Spaces, register vacant row, import |

Wireframe — S-13 Space

| +------------------------------------------------------------------------------------------------------------+ | Space  MTP-T1-03                        {Occupied} Innovate Corp - MTP-L-0012     [Cancel] [Save]          | |------------------------------------------------------------------------------------------------------------| | Property* [Meridian Tech Park v]  Building* [T1 v]  Floor* [3]  Suite no. [301]  Code* [MTP-T1-03]         | | Space type* [Office v]   Fit-out [Warm shell v]   Status {Occupied - derived}  [Override status]           | | Chargeable area* [22,000] sq ft   Carpet area [15,400]   Loading {42.9%}                                   | | Asking rate [___] Rs/sq ft/month (shown for vacant space and marketing)                                    | |------------------------------------------------------------------------------------------------------------| | SEAT INVENTORY (flex_floor / cabin only)                                   [+ Add seat type]               | |   Seat type [Dedicated desk v]  Capacity [120]    Seat type [Cabin seat v]  Capacity [40]                  | |   Total seat capacity {160}                                                                                | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Property / Building | space.property_id / building_id | Lookup | M | Building list filtered by property. |
| 2 | Floor | space.floor | Integer | M | Ground = 0, basements negative, −10 … 150. |
| 3 | Suite number | space.suite_number | Text | O | Preserve leading zeros. |
| 4 | Space code | space.space_code | Text | M | Default = property prefix + floor + suite; unique within property. |
| 5 | Space type | space.space_type | Select | M | office | retail | food_court | storage | parking_block | terrace | antenna_site | flex_floor | cabin | meeting_room | other. |
| 6 | Fit-out condition | space.fitout_condition | Select | O | — |
| 7 | Status | space.status | Read-only (derived) | Sys | Derived nightly from contracts. [Override] allows not_leasable / under_fitout / reserved with reason (audited). |
| 8 | Chargeable area | space.chargeable_area | Area | M | > 0. |
| 9 | Carpet area | space.carpet_area | Area | O | ≤ chargeable; loading warning R-07 outside 20–60%. |
| 10 | Asking rate | space.asking_rate | Currency | O | Per area unit/month, or per seat for flex. |
| 11 | Seat type / capacity | seat_inventory.seat_type / capacity | Select / Integer | C | Mandatory (≥1 row) when space_type = flex_floor or cabin; Flex add-on only. |

S-14  Occupant Form

| Route | Roles (see §7) | Purpose | Entry points |
| /occupants/new, /occupants/{id} | PM, Leasing, Finance, Asset Mgr, Org Admin | Tenant / licensee / member / prospect master | Contract wizard (inline), deal form, import |

Wireframe — S-14 Occupant

| +------------------------------------------------------------------------------------------------------------+ | Occupant  TechNova Solutions Pvt Ltd    {Active}  {Critical}                   [Cancel] [Save]             | |------------------------------------------------------------------------------------------------------------| | Type* [Company v]  Legal name* [TechNova Solutions Pvt Ltd_____]  Trade name [TechNova]                    | | Industry [IT services v]  Status* [Active v]   Possible duplicate: none                                    | | TAX & IDs   GSTIN [27AABCT1234K1Z2] {Maharashtra}  PAN [AABCT1234K] (masked for others) CIN [__]           | | BILLING ADDRESS* Line 1 [__] City [__] State [Maharashtra v] PIN [__]  [Same as occupied space]            | |------------------------------------------------------------------------------------------------------------| | CONTACTS                                                              [+ Add contact]                      | |   Role* [Finance v] Name* [Priya N] Email* [__] Mobile [+91 __]  [x] Receives invoices [x] Portal          | |   Role* [Admin v]   Name* [Karan S] Email* [__] Mobile [+91 __]  [ ] Receives invoices [x] Portal          | |------------------------------------------------------------------------------------------------------------| | RISK   Guarantor [Lookup occupant] Credit rating [CRISIL A+] Internal risk [Low v] Critical [x]            | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Occupant type | occupant.occupant_type | Select | M | company | individual | government | foreign_entity. |
| 2 | Legal name | occupant.legal_name | Text | M | Duplicate check on blur (GSTIN, PAN, fuzzy name ≥ 0.85) — RR-ING-12. |
| 3 | Trade name | occupant.trade_name | Text | O | — |
| 4 | Industry | occupant.industry | Select | O | Controlled list. |
| 5 | Status | occupant.status | Select | M | prospect | active | inactive. Set to active automatically on contract activation. |
| 6 | GSTIN | occupant.gstin | Text (15) | C | Mandatory before first invoice if B2B and GST applies (R-15, R-44). Format + checksum; state derived and shown. |
| 7 | PAN | occupant.pan | Text (10) | O | Format AAAAA9999A; must match GSTIN chars 3–12 if both present. Masked for non-finance roles. |
| 8 | CIN / LLPIN | occupant.cin | Text | O | — |
| 9 | Billing address | occupant.billing_address | Address group | M | State drives place of supply. |
| 10 | Contacts (repeating) | occupant.contacts[]: role, name, email, phone, receives_invoices, portal_access | Repeating group | M | At least one contact with receives_invoices = true and a valid email. Portal access sends invite (T-portal). |
| 11 | Guarantor | occupant.guarantor_occupant_id | Lookup | O | Cannot be self. |
| 12 | Credit rating / internal risk | occupant.credit_rating / internal_risk_score | Text / Select | O | Internal risk editable by Finance only. |
| 13 | Critical | occupant.is_critical | Toggle | Sys/O | Auto for top-10 by annual revenue per property; manual override allowed. |

S-15  Pricing Plan (Flex & Seats add-on)

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/pricing-plans | Org Admin, Asset Mgr, Centre Manager | Reusable seat plans with inclusions | Settings, contract wizard (seat model) |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Plan name | pricing_plan.name | Text | M | e.g. Premium Dedicated Seat. |
| 2 | Seat type | pricing_plan.seat_type | Select | M | dedicated_desk | hot_desk | cabin_seat | team_room_seat | virtual_office. |
| 3 | Rate / period | pricing_plan.rate / rate_period | Currency / Select | M | > 0; period default month. |
| 4 | Included services | pricing_plan.inclusions | Multi-select | M | Any of cam, electricity, housekeeping, internet, water, dg_backup, … At least one selection or "None". |
| 5 | Chargeable extras | pricing_plan.chargeable_extras | Repeating: item + rate + unit | O | e.g. meeting room ₹800/hour; parking ₹4,000/slot/month. |
| 6 | Properties | pricing_plan.property_ids | Multi-select | O | Empty = all flex properties. |
| 7 | Active | pricing_plan.is_active | Toggle | M | Inactive plans cannot be chosen for new contracts. |

S-18  Deal Register & Deal Form

| Route | Roles (see §7) | Purpose | Entry points |
| /deals, /deals/{id} | Leasing, PM, Asset Mgr, Org Admin (Owner view) | Pipeline deals; conversion to contract without re-keying | Nav "Deals", vacant space drawer, expiry pipeline (renewal) |

Wireframe — S-18 Deal register (Kanban or list)

| +------------------------------------------------------------------------------------------------------------+ | Deals   [Kanban | List]   Property [All v]  Owner [All v]   Weighted pipeline {Rs 11.52 L/month}           | |------------------------------------------------------------------------------------------------------------| | ENQUIRY(2)   QUALIFIED(1)  SITE VISIT(1)  NEGOTIATION(1)  LOI(1)          AGREEMENT(0)  WON / LOST         | | [Card]        [Card]        [Card]         [Card]          [DEAL-021      ]                                | |                                                            [Tech Park A 4F]                                | |                                                            [120 seats x16k]                                | |                                                            [60%  Jan-2027 ]                                | |------------------------------------------------------------------------------------------------------------| | DEAL-021 form:  Prospect* [Lookup / + New prospect]  Property* [v] Spaces* [4F-02 x]                       | |   Deal type* (o) New ( ) Renewal ( ) Expansion   Stage* [LOI v]   Probability* [60] %                      | |   Proposed terms:  Billing model* [Seat v] Seats [120] Rate [16,000] Start* [01-Jan-2027]                  | |                    Term [36] months  Escalation [10% / 12 m]  Deposit [3] months  CAM [Included]           | |   Documents: [Upload term sheet / LOI]      Next action [Send draft agreement] due [05-Oct]                | |   [Mark lost - reason]                                     [Save]   [Convert to contract >]                | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Deal code | deal.deal_code | Read-only | Sys | Auto DEAL-nnn. |
| 2 | Prospect | deal.occupant_id | Lookup / create | M | Creates occupant with status prospect if new. |
| 3 | Property / spaces | deal.property_id / space_ids | Lookup / Multi-select | M | Spaces vacant, reserved or expiring before proposed start; warning otherwise. |
| 4 | Deal type | deal.deal_type | Radio | M | new | renewal | expansion. Renewal requires linked contract. |
| 5 | Linked contract | deal.renewal_of_contract_id | Lookup | C | Mandatory for renewal/expansion. |
| 6 | Stage | deal.stage | Select | M | enquiry → qualified → site_visit → negotiation → loi → agreement_drafting → won | lost. |
| 7 | Probability % | deal.probability_pct | Number | M | 0–100; default by stage (10/20/30/45/60/80/100/0), editable. |
| 8 | Billing model | deal.proposed_terms.billing_model | Select | M | Drives which term fields show (same rules as contract step 3). |
| 9 | Area / seats / rate | deal.proposed_terms.area | seats | rate | Number / Currency | C | Area+rate for area model; seats+rate for seat model. |
| 10 | Expected start / term | deal.expected_start / proposed_terms.term_months | Date / Number | M / O | — |
| 11 | Escalation, deposit, CAM treatment | deal.proposed_terms.* | Mixed | O | Copied into contract on conversion. |
| 12 | Next action / due date | deal.next_action / next_action_due | Text / Date | O | Alert AL-19 if overdue or deal idle > 14 days. |
| 13 | Broker | deal.broker_id | Lookup user | O | Carried to contract.broker_id. |
| 14 | Lost reason | deal.lost_reason | Select + text | C | Mandatory when stage = lost. |
| 15 | Weighted monthly value | calc: D-22 | Read-only | Sys | — |

Convert to contract (stage must be loi, agreement_drafting or won): opens S-21 with every mapped field pre-filled and deal documents attached; on contract submit, deal.stage = won and deal.contract_id set. Nothing is re-typed (UAT-61).
S-21  Create / Edit Contract — 7-step Wizard

| Route | Roles (see §7) | Purpose | Entry points |
| /contracts/new, /contracts/{id}/edit | PM, Leasing, Asset Mgr, Finance (maker); Org Admin | Capture a contract once, completely, with approval | Register, vacant space, deal conversion, renewal |

Wireframe — S-21 Wizard frame

| +------------------------------------------------------------------------------------------------------------+ | New contract   Draft saved 14:05                                 [Save draft] [Cancel]                     | |------------------------------------------------------------------------------------------------------------| | (1) Parties & space  (2) Terms & dates  (3) Billing model & charges  (4) Escalation & concessions          | | (5) Deposits & clauses  (6) Documents  (7) Review & submit                                                 | |------------------------------------------------------------------------------------------------------------| |  STEP CONTENT                                              | LIVE SUMMARY (sticky)                         | |                                                            | Occupant: TechNova Solutions                  | |                                                            | Space: APX-05A  8,500 sq ft                   | |                                                            | Model: Area   Rate Rs 248.00                  | |                                                            | Monthly base {Rs 21,08,000}                   | |                                                            | CAM {Rs 2,38,000} GST 18%                     | |                                                            | Gross monthly {Rs 23,70,000}                  | |                                                            | Deposit req. {Rs 1,26,48,000}                 | |                                                            | Errors 0  Warnings 1                          | |------------------------------------------------------------------------------------------------------------| |                                                           [< Back]  [Next >]                               | +------------------------------------------------------------------------------------------------------------+ |

Steps can be visited in any order after step 1; the step indicator shows ✓ complete, ! errors, • incomplete. Submit is available only on step 7 with zero errors.
The live summary recalculates on every change using the same calculation service as billing (no separate front-end formulas).
Fields that do not apply to the chosen billing model are hidden, not disabled.
Step 1 — Parties & space

| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Contract type | contract.contract_type | Select | M | lease_deed | leave_and_licence | managed_office_agreement | coworking_membership | service_charge_agreement | head_lease. Default lease_deed; head_lease only with Flex add-on. |
| 2 | Direction | contract.direction | Read-only | Sys | payable if contract_type = head_lease, else receivable. |
| 3 | Property | contract.property_id | Lookup | M | Scoped to user’s properties. |
| 4 | Occupant (or landlord for head lease) | contract.occupant_id | Lookup + [New] | M | Inline S-14 in a drawer; prospects allowed (become active on activation). |
| 5 | Spaces | contract_space.space_id (repeating) | Multi-lookup | M | At least one. Shows each space status; overlap with active/future contract blocked (R-24). |
| 6 | Area let (per space) | contract_space.area_let | Area | C | Mandatory for area/hybrid/fixed-by-area; default = space chargeable area; ≤ available area. |
| 7 | Seats allocated (per space, per seat type) | contract_space.seats_allocated | Integer | C | Mandatory for seat/hybrid; ≤ free capacity. |
| 8 | Space start / end | contract_space.start_date / end_date | Date | M | Default = contract commencement / expiry. |
| 9 | Billing entity | contract.billing_entity_id (default for charges) | Lookup | M | Default = property.default_billing_entity_id. |
| 10 | Broker | contract.broker_id | Lookup | O | — |
| 11 | Deal | contract.deal_id | Read-only | Sys | Set when converted from a deal. |

Step 2 — Terms & dates
Wireframe — S-21 Step 2

| +------------------------------------------------------------------------------------------------------------+ | Signing date [14-Feb-2023]  Handover [20-Feb-2023]  Commencement* [01-Apr-2023]                            | | Rent commencement* [01-Jun-2023]  Expiry* [31-Mar-2032]  Term {108 months}  [ ] Auto-renew monthly         | | Lock-in [36] months  -> ends {31-Mar-2026}   Lock-in applies to* (o) Both ( ) Tenant ( ) Landlord          | | Notice period [6] months  -> latest notice for expiry {30-Sep-2031}                                        | | Registration [Registered v]  Stamp duty [4,85,000]  borne by [Tenant v]                                    | | Billing: currency* [INR v] frequency* [Monthly v] invoice day* [1] payment due in* [7] days                | |          mode for rent* (o) Advance ( ) Arrears      TDS applicable [x]  rate [10.00] %                    | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Signing date | contract.signing_date | Date | C | Mandatory to move status beyond draft to future/active. |
| 2 | Handover date | contract.handover_date | Date | O | ≤ commencement. |
| 3 | Commencement date | contract.commencement_date | Date | M | < expiry (R-20). |
| 4 | Rent commencement date | contract.rent_commencement_date | Date | M | ≥ commencement. If later than commencement, step 4 proposes a rent-free concession for the gap. |
| 5 | Expiry date | contract.expiry_date | Date | C | Mandatory unless auto_renew = true (rolling membership). |
| 6 | Term (months) | contract.term_months | Read-only | Sys | calc: months between commencement and expiry (D-11 basis). |
| 7 | Auto-renew monthly | contract.auto_renew | Toggle | O | Coworking memberships; then notice in days is used. |
| 8 | Lock-in months / end / party | contract.lock_in_months / lock_in_end_date / lock_in_party | Number / calc / Radio | O | End = commencement + months − 1 day; ≤ expiry (R-22). |
| 9 | Notice period | contract.notice_period_months (or _days) | Number + unit | O | Latest notice date shown (D-12). |
| 10 | Registration status / stamp duty / borne by | contract.registration_status / stamp_duty / stamp_duty_borne_by | Select / Currency / Select | O | Warning if term > 11 months and unregistered. |
| 11 | Billing currency | contract.billing_currency | Select | M | Default property currency. |
| 12 | Billing frequency | contract.billing_frequency | Select | M | monthly | quarterly | half_yearly | annual. |
| 13 | Invoice day | contract.invoice_day | Number 1–28 | M | Default 1. |
| 14 | Payment due (days) | contract.due_days | Number 0–90 | M | Default 7. |
| 15 | Rent billing mode | contract_charge.billing_mode (base) | Radio | M | advance | arrears; default advance. |
| 16 | TDS applicable / rate | contract.tds_applicable / tds_rate | Toggle / Number | O | Default on, 10% for rent (194-I); rate editable 0–20. |

Step 3 — Billing model & charges
Wireframe — S-21 Step 3 (area model shown)

| +------------------------------------------------------------------------------------------------------------+ | Billing model* (o) Area ( ) Seat ( ) Hybrid ( ) Fixed ( ) Revenue share ( ) Charges only                   | | Lease structure [Modified gross v]                                                                         | |------------------------------------------------------------------------------------------------------------| | CHARGES                                                                     [+ Add charge]                 | | Component    Basis     Rate      Qty      Monthly     Incl. Group  Entity        Tax     Start             | | Base rent    Per area  248.00    8,500    21,08,000   [ ]   Rent   Apex Realty   GST-18  01-Jun-23         | | CAM          Per area  28.00     8,500     2,38,000   [ ]   CAM    FM Agency LLP GST-18  01-Apr-23         | | Electricity  Metered   tariff    meter E-05A   -      [ ]   Elec.  Apex Realty   GST-18  01-Apr-23         | | Parking      Per slot  4,000     6            24,000   [ ]   Park.  Apex Realty   GST-18  01-Apr-23        | |------------------------------------------------------------------------------------------------------------| | Seat model shows instead:  Plan* [Enterprise Cabin v] Seats contracted* [100] Minimum [80]                 | |   Seat billing basis* (o) Contracted ( ) Occupied ( ) Minimum commitment   Seat rate* [15,000]             | |   Included (from plan): CAM, Electricity, Housekeeping, Internet  -> not billed separately                 | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Billing model | contract.billing_model | Radio | M | area | seat | hybrid | fixed | revenue_share | charges_only. Seat/hybrid require Flex add-on. |
| 2 | Lease structure | contract.lease_structure | Select | O | Area models only. |
| 3 | Pricing plan | contract.pricing_plan_id | Lookup | C | Mandatory for seat/hybrid; pre-fills rate and inclusions. |
| 4 | Seats contracted / minimum | contract.seats_contracted / seats_minimum | Integer | C | Seat/hybrid; minimum ≤ contracted (R-42). |
| 5 | Seat billing basis | contract.seat_billing_basis | Radio | C | Mandatory for seat/hybrid. |
| 6 | Base commitment amount / seats covered | contract.base_commitment_amount / base_commitment_seats | Currency / Integer | C | Hybrid only. |
| 7 | Charge: component | contract_charge.component | Select | M | From charge_type config. Base rent (area) or seat_fee (seat) is mandatory except charges_only. |
| 8 | Charge: calc basis | contract_charge.calc_basis | Select | M | Filtered by component (e.g. electricity → metered/fixed). |
| 9 | Charge: rate / period | contract_charge.rate / rate_period | Currency / Select | C | Not for metered/per_use; > 0. |
| 10 | Charge: quantity | contract_charge.quantity_basis | Number | C | Default area_let or billable seats; slots for parking. |
| 11 | Charge: monthly amount | calc: rate × qty (F-01/F-03) | Read-only | Sys | — |
| 12 | Charge: included | contract_charge.is_included | Toggle | M | Default from plan inclusions; if included the row shows "Included" and no amount (R-40 blocks duplicate billable row). |
| 13 | Charge: invoice group | contract_charge.invoice_group | Select | M | rent | cam | electricity | water | parking | services; drives separate invoices. |
| 14 | Charge: billing entity | contract_charge.billing_entity_id | Lookup | M | Default contract billing entity; entity needs GSTIN if tax > 0 (R-44). |
| 15 | Charge: tax profile / SAC | contract_charge.tax_profile_id / hsn_sac | Lookup / Text | M | Default from charge type. |
| 16 | Charge: recoverable | contract_charge.is_recoverable | Toggle | O | Default by component (CAM, tax, insurance = true). |
| 17 | Charge: start / end | contract_charge.start_date / end_date | Date | M | Within contract dates. |
| 18 | Charge: meter / CAM pool | contract_charge.meter_id / cam_pool_id | Lookup | C | Mandatory for metered / pro_rata_share. |
| 19 | Charge: source clause | contract_charge.source_document_id + clause ref | Lookup + Text | O | Recommended; required by approver if configured. |

Step 4 — Escalation & concessions
Wireframe — S-21 Step 4

| +------------------------------------------------------------------------------------------------------------+ | ESCALATION for [Base rent v]  Type* [Fixed % v]  Value [15.00] %  Every [36] months  [x] Compounding       | |    First escalation from [01-Apr-2026]   (default: commencement + cycle)     [Generate schedule]           | |    Step  Effective     Type      Rate       Monthly      Status                                            | |    1     01-Jun-2023   Initial   248.00     21,08,000    applied                                           | |    2     01-Apr-2026   +15%      285.20     24,24,200    scheduled                                         | |    3     01-Apr-2029   +15%      327.98     27,87,830    scheduled                                         | |    [Edit step] allowed only with reason; CPI/market steps show "pending resolution"                        | |------------------------------------------------------------------------------------------------------------| | CONCESSIONS                                                                [+ Add concession]              | |    Rent-free   01-Apr-2023 to 31-May-2023   100%  Base rent   Amortise [x]   Clawback [ ]                  | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Escalation applies to | rent_step.contract_charge_id | Select | M | Any non-metered charge; repeat per charge (CAM often has its own). |
| 2 | Escalation type | rent_step.escalation_type | Select | M | fixed_pct | fixed_amount | cpi_linked | market_review | stepped_schedule | none. |
| 3 | Value | rent_step.escalation_value | Number | C | % or ₹ per type; 0–100%. |
| 4 | Cycle (months) | rent_step.escalation_cycle_months | Number | C | e.g. 12 or 36. |
| 5 | Compounding | rent_step.compounding | Toggle | O | Default on (F-02). |
| 6 | First escalation date | rent_step[2].effective_date | Date | C | Default commencement + cycle (alternative: rent commencement + cycle, selectable). |
| 7 | CPI index / cap / floor | rent_step.cpi_index / cap_pct / floor_pct | Select / Number | C | cpi_linked only. |
| 8 | Generated steps | rent_step rows | Grid | Sys | Generated to expiry (RR-ESC-01); manual edits require reason and are audited. |
| 9 | Concession type | concession.concession_type | Select | M | rent_free | fitout_contribution | discount_pct | discount_amount | capex_by_landlord. |
| 10 | Concession period / value / charge | concession.start_date / end_date / value / contract_charge_id | Date / Number / Select | M | Period within contract; value 0–100% or ₹. |
| 11 | Amortise / clawback | concession.amortise / clawback_clause | Toggle / Text | O | — |

Step 5 — Deposits & clauses

| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Deposit type | deposit.deposit_type | Select | M* | *At least one deposit row unless "No deposit" ticked. security_deposit | advance_rent | bank_guarantee | cam_deposit | utility_deposit. |
| 2 | Basis (months of) | deposit.basis_months + basis_component | Number + Select | O | e.g. 6 × base rent → required amount computed (D-13). |
| 3 | Required amount | deposit.required_amount | Currency | M | Computed from basis or entered. |
| 4 | Held amount (at signing) | deposit.held_amount | Currency | M | Shortfall shown if < required. |
| 5 | Top-up on escalation | deposit.top_up_on_escalation | Toggle | O | Recomputes required amount at each applied step; alert AL-12. |
| 6 | Bank / BG number / BG expiry | deposit.bg_bank / bg_number / bg_expiry_date | Text / Text / Date | C | Mandatory for bank_guarantee. |
| 7 | Clause type | contract_clause.clause_type | Select | O | renewal_option | break_option | rofr | rofo | expansion | exclusivity | subletting | reinstatement. (Lock-in and notice captured in step 2.) |
| 8 | Holder / window / terms / summary | contract_clause.holder / exercise_window_start,end / terms / summary | Mixed | C | Summary mandatory per clause; window mandatory for options (alerts AL-06). |

Step 6 — Documents

| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Document type | contract_document.doc_type | Select | M | term_sheet | loi | lease_agreement | amendment | renewal_agreement | termination | possession_letter | deposit_receipt | noc | insurance | fitout | other. |
| 2 | File | contract_document.storage_path | Upload (PDF, JPG, PNG, DOCX; 25 MB) | M | Virus-scanned; checksum stored. |
| 3 | Status | contract_document.status | Select | M | draft | under_review | approved | signed | executed. |
| 4 | Effective / expiry date | contract_document.effective_date / expiry_date | Date | O | Expiry mandatory for insurance, NOC, BG (alert AL-11). |
| 5 | Visibility | contract_document.visibility | Select | M | internal | client_visible | occupant_visible. Default internal. |

An executed lease_agreement (or leave_and_licence) is required to activate a contract; without it the contract can be approved as future but the RR-CON-05 missing-document flag is raised.
Step 7 — Review & submit
Wireframe — S-21 Step 7

| +------------------------------------------------------------------------------------------------------------+ | REVIEW   All steps complete: 6 of 6   Errors: 0   Warnings: 1  (R-07 loading 42.9% - acknowledged)         | |------------------------------------------------------------------------------------------------------------| | Summary of every field by step (read-only) with [Edit] link per section                                    | | Calculated: Monthly base Rs 21,08,000 | Gross monthly Rs 23,70,000 | Year-1 contracted Rs 2.40 Cr          | |             Escalation schedule 3 steps | Deposit required Rs 1,26,48,000 (held Rs 1,26,48,000)            | |------------------------------------------------------------------------------------------------------------| | Comment to approver [__________________________________________________]                                   | |                                                [Save draft]   [Submit for approval]                        | +------------------------------------------------------------------------------------------------------------+ |

On submit: contract.approval_status = submitted; approvers per S-66 notified; contract visible in register as "Draft – pending approval" only to maker, approvers and admins. On approval: status = future (commencement > today) or active; steps, charges and alerts are generated; occupant status becomes active on activation.
S-22  Contract Detail

| Route | Roles (see §7) | Purpose | Entry points |
| /contracts/{id} | All staff (scoped); Owner read-only | Single source of truth for one contract | Register row, search, alerts |

Wireframe — S-22 Contract detail

| +------------------------------------------------------------------------------------------------------------+ | APX-L-0042  TechNova Solutions Pvt Ltd   {Active} {Critical}   Lease deed | Area | APX-05A                 | | Monthly base Rs 24,24,200 | Gross Rs 26,86,200 | Expiry 31-Mar-2032 (2,009 d) | Outst. Rs 0                | |      [Serve notice] [Renew] [Amend] [Terminate] [Add document] [More v: Surrender space, Expand]           | |------------------------------------------------------------------------------------------------------------| | Summary | Spaces | Charges & schedule | Concessions | Deposits | Dates & clauses | Documents |             | | Invoices & payments | History                                        | ACTIVITY                            | | ---                                                                  |                                     | | SUMMARY tab: key terms grid (2 columns), next events:                | 29-Sep  Escalation 01-Apr-29        | |   - Next escalation 01-Apr-2029 +15% -> Rs 327.98 (+Rs 3.64 L/month) |   scheduled (system)                | |   - Lock-in ended 31-Mar-2026; tenant may exit with 6 months notice  | 01-Apr  Step 2 applied              | |   - Deposit shortfall Rs 18,97,200 (top-up clause)  [Raise demand]   |   by Meera (Finance)                | |                                                                      | [Comment...  @mention]              | +------------------------------------------------------------------------------------------------------------+ |


| Tab | Content | Edit rights |
| Summary | All step-1/2 fields, calculated figures (D-01…D-13), next events list | Via [Amend] only (creates approval) |
| Spaces | contract_space rows with area/seats and dates; history of expansions/surrenders | [Expand] [Surrender] actions |
| Charges & schedule | Charges grid + per-charge rent_step schedule + 12-month billing preview | Amend (maker-checker) |
| Concessions | Concession rows; remaining rent-free days | Amend |
| Deposits | Deposit rows, deposit_transaction ledger, shortfall, BG expiry | Finance: record receipt/adjustment/refund request |
| Dates & clauses | Lock-in, notice, options with windows; computed earliest exit (D-12) | Amend |
| Documents | S-23 embedded, filtered to this contract | Upload/version per S-23 |
| Invoices & payments | Invoices (status, outstanding), payments and allocations, statement download | Finance actions |
| History | Field-level audit (old → new, who, when, source) and version chain (parent/child contracts) | Read-only |

Contract actions (modals)

| Action | Fields captured | Result | Roles |
| Serve notice | Served by (occupant/landlord), notice date*, intended exit date*, notice document*, reason | status = notice_served; exit date must respect lock-in and notice period (warning with override reason); expiry alerts re-based | PM, Asset Mgr |
| Renew | New expiry*, new rate or escalation*, new deposit, renewal document | Creates child contract (parent_contract_id) as draft → approval; current contract ends day before renewal start | PM, Leasing, Asset Mgr |
| Amend | Any financial/term field + effective date* + amendment document* | Creates amendment version → approval; effective from date; history preserved | PM, Leasing, Finance, Asset Mgr |
| Terminate | Termination date*, type (mutual/tenant default/landlord), document*, settlement notes | status = terminated on date; future invoices cancelled; deposit refund workflow triggered | Asset Mgr (approval Owner) |
| Record exit | Actual vacate date*, handover document | Contract expired/terminated; space vacant; final invoice and deposit settlement prompts | PM |
| Expand / surrender space | Space, area/seats, effective date, document | contract_space row added/ended; charges re-quantified from date | PM (approval) |

S-23  Documents Repository

| Route | Roles (see §7) | Purpose | Entry points |
| /documents, contract tab | All staff (scoped); Tenant sees occupant-visible only (T-07) | Versioned documents per contract/deal | Contract detail, alerts |

Wireframe — S-23 Documents

| +------------------------------------------------------------------------------------------------------------+ | Documents - APX-L-0042        [Upload]  Filter: Type [All v] Status [All v] Visibility [All v]             | |------------------------------------------------------------------------------------------------------------| | Type             Version  Status     Effective    Expiry       Visibility   Uploaded                       | | Lease agreement  v2 CUR   Executed   01-Apr-2023  -            Occupant     Ravi 14-Feb-23 [v]             | | Lease agreement  v1       Superseded -            -            Internal     Ravi 02-Feb-23 [v]             | | Insurance cert.  v1 CUR   Approved   01-Nov-2025  15-Oct-2026  Internal     Karan 03-Nov-25[v]             | | [v] menu: View | Download | Upload new version | Change status | Change visibility | Audit                 | +------------------------------------------------------------------------------------------------------------+ |

Upload new version keeps all earlier versions; only one current version per type (except "other"). Executed versions cannot be deleted by anyone; drafts can be deleted by uploader or admin (soft delete).
Every view and download writes an audit event. Viewer opens in-app (PDF/image) with watermark "Confidential — <user> — <date>" for internal documents.
S-24  Expiry Pipeline & Renewals

| Route | Roles (see §7) | Purpose | Entry points |
| /contracts/expiry | Leasing, PM, Asset Mgr, Owner (view) | See and act on expiries early | Leasing dashboard, alerts AL-01/02 |

Wireframe — S-24 Expiry pipeline

| +------------------------------------------------------------------------------------------------------------+ | Expiry pipeline   Basis: (o) Expiry ( ) Lock-in end ( ) Earliest exit   Scope [All v]                      | |------------------------------------------------------------------------------------------------------------| | 0-30 d (0)     31-90 d (0)    91-180 d (1)          181-365 d (1)            365 d+ (6)                    | |                               [NXH-03 Orbit Edutech] [APX-08 Apex Financial]                               | |                               15,000 sq ft           10,200 sq ft  Rs 28.05L                               | |                               Rs 12.60 L/mo gross    Stage: Discussion                                     | |                               NOTICE SERVED          [Create renewal deal]                                 | |------------------------------------------------------------------------------------------------------------| | Revenue at risk (annualised): 91-180 d Rs 1.51 Cr | 181-365 d Rs 3.71 Cr   (K-09)                          | +------------------------------------------------------------------------------------------------------------+ |

Each card: space, occupant, area/seats, monthly gross, expiry, renewal stage, arrears flag, [Create renewal deal] / [Open deal]. Stage set on the renewal deal (S-18); pipeline reads it.
S-25  Escalation Calendar & Apply

| Route | Roles (see §7) | Purpose | Entry points |
| /escalations | Finance, Asset Mgr (approve); PM (view) | Apply scheduled rent steps with approval | Alerts AL-03, Finance dashboard |

Wireframe — S-25 Escalations

| +------------------------------------------------------------------------------------------------------------+ | Escalations   [Calendar | List]   Window: [Next 90 days v]   Status [Due, Scheduled v]                     | |------------------------------------------------------------------------------------------------------------| | Effective    Contract     Occupant        Charge     Old rate  New rate  Uplift/mo    Status               | | 01-Oct-2026  GFT-L-0003   Aurum Global    Base rent  $1.25     $1.3125   USD 375      Due  [x]             | | 01-Nov-2026  MTP-L-0012   Innovate Corp   Base rent  95.00     109.25    3,13,500     Sched.[ ]            | |------------------------------------------------------------------------------------------------------------| | Selected 1   [Apply selected -> approval]   [Notify occupants 30 days before: ON]                          | +------------------------------------------------------------------------------------------------------------+ |

A step becomes "Due" 30 days before effective date. Apply requires checker approval (bulk allowed). Billing uses the applied rate; if a step is due but not applied at billing-run time, the run shows an exception and uses the contractual (new) rate only after approval.
Occupant notification (email/portal) 30 days before effective date with old/new rate and uplift — template AL-03T.
S-26  Occupancy & Stacking Plan

| Route | Roles (see §7) | Purpose | Entry points |
| /occupancy | All staff (scoped) | Visual vacancy/occupancy by floor | Dashboards K-06/K-07 |

Wireframe — S-26 Stacking plan (Meridian Tech Park, T1)

| +------------------------------------------------------------------------------------------------------------+ | Occupancy  [Meridian Tech Park v] [T1 v]   Colour by: (o) Status ( ) Expiry year ( ) Rent/sq ft            | |------------------------------------------------------------------------------------------------------------| | Floor 4 | [MTP-T1-04  NextGen Retail  22,000  HOLDING OVER (red)                              ]            | | Floor 3 | [MTP-T1-03  Innovate Corp   22,000  Active - exp 2032 (green)                       ]            | | Floor 2 | [MTP-T1-02  Vacant 11,000 (grey)       ][MTP-T1-02B Reserved 11,000 (blue)          ]            | |------------------------------------------------------------------------------------------------------------| | Totals: area 1,10,000 | occupied 44,000 (40.0%) | seats: n/a | economic occupancy 38.1%                    | +------------------------------------------------------------------------------------------------------------+ |

Bar width proportional to area (or seats for flex floors). Hover shows occupant, area, rate, expiry; click opens contract drawer.
S-30  Import Centre — 6-step Wizard

| Route | Roles (see §7) | Purpose | Entry points |
| /import, /import/{batch} | Org Admin, Asset Mgr (approve); Admin/Ops (prepare) | Load rent rolls from Excel/CSV safely | Nav "Import", empty-state CTA |

Wireframe — S-30 Import wizard

| +------------------------------------------------------------------------------------------------------------+ | Import  Batch B-2026-09-0007   (1) Upload (2) Profile (3) Map (4) Validate (5) Reconcile (6) Approve       | |------------------------------------------------------------------------------------------------------------| | (1) UPLOAD  Template: ( ) OFFICEX standard multi-sheet  (o) Quick single-sheet  ( ) Saved mapping          | |     Client account [Self v]  Property scope [Auto-detect v]  File [Drop .xlsx/.xls/.csv - 20 MB]           | |     Sheets found: [x] Rent Roll Sep-26  [ ] Summary  [ ] Notes           [Download templates]              | |------------------------------------------------------------------------------------------------------------| | (2) PROFILE  Rows 148 | Header row 3 | Total rows stripped 4 | Duplicates 2 | Blank rent 3                 | |              Date formats: DD/MM/YY, DD.MM.YYYY | Number format: Indian | Area unit: sq ft                 | |------------------------------------------------------------------------------------------------------------| | (3) MAP   Source column        Sample            -> OFFICEX field             Confidence                   | |           "Super Area (sft)"   8,500             -> space.chargeable_area     98% auto                     | |           "Escl"               15% every 3 yrs   -> escalation (parser)       90% auto                     | |           "Remarks"            top up SD         -> [Not mapped - keep v]      -                           | |           [Save as mapping template: name ______]                 Unmapped kept for review: 3              | |------------------------------------------------------------------------------------------------------------| | (4) VALIDATE  Passed 131 | Warning 9 | Failed 6 | Unmapped columns 3   [Download error file]               | |     Row 17 R-12 Monthly amount 24,24,000 <> 8,500 x 285.20 = 24,24,200   [Fix in grid] [Ignore]            | |------------------------------------------------------------------------------------------------------------| | (5) RECONCILE   Source total area 1,75,300 = Staged 1,75,300 OK | Rent 1.43 Cr = 1.43 Cr OK                | |     Diff vs production: New 120 | Changed 22 | Unchanged 0 | To be ended 6                                 | |------------------------------------------------------------------------------------------------------------| | (6) APPROVE  Prepared by Ravi 29-Sep 15:10   [Submit for approval]   Approver: [Approve & commit]          | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Template mode | import_batch.template_mode | Radio | M | standard | quick | saved_mapping. |
| 2 | Client account | import_batch.client_account_id | Lookup | M | Hidden unless Multi-Client. |
| 3 | File | import_batch.file_path / checksum | Upload | M | .xlsx/.xls/.csv ≤ 20 MB; malware scan; same checksum as a committed batch → warning "file already imported". |
| 4 | Sheets | import_batch.sheets[] | Checklist | M | At least one. |
| 5 | Header row | import_batch.header_row | Number (auto) | M | Auto-detected; editable. |
| 6 | Column mapping | mapping_template.columns[] | Mapping grid | M | Every mandatory canonical field mapped or defaulted; unmapped kept (RR-ING-15). |
| 7 | Mapping template name | mapping_template.name | Text | O | Saving reuses on next import. |
| 8 | Control totals | import_batch.control_area / control_rent / control_seats | Number | O | Entered or read from file; variance > 0.5% blocks unless override reason (RR-ING-07). |
| 9 | Override reason | import_batch.override_reason | Text | C | Mandatory when warnings acknowledged or control variance overridden. |

Step 4 grid supports in-cell correction; corrected cells are highlighted and re-validated instantly. "Download error file" returns the original sheet with two added columns: Error code, Error message.
Commit runs as a background job with progress bar; user can leave the page and is notified when done. Rollback/void available for 7 days from the batch page (RR-ING-11).
S-31  Meter Readings

| Route | Roles (see §7) | Purpose | Entry points |
| /operations/meters | Facility Mgr, PM, Finance | Capture utility consumption for billing (no CAFM needed) | Today queue AL-15, Billing exceptions |

Wireframe — S-31 Meter readings - Sep-2026

| +------------------------------------------------------------------------------------------------------------+ | Meter readings   Property [Meridian Tech Park v]  Period [Sep-2026 v]   [Upload CSV] [Download sheet]      | |------------------------------------------------------------------------------------------------------------| | Meter    Space       Utility   Multiplier  Opening    Closing    Consumption  Tariff  Amount               | | E-T1-03  MTP-T1-03   Elec.     1           1,84,220   [1,96,410] {12,190}     11.50   1,40,185             | | D-T1-03  MTP-T1-03   DG        1           4,210      [4,388]    {178}        24.00   4,272                | |------------------------------------------------------------------------------------------------------------| | Source: manual | csv | api | cafm (auto when CAFM subscribed)    [Save] [Submit for billing]               | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Meter | meter.meter_code | Read-only | Sys | Meters defined in S-65 / imported. |
| 2 | Opening reading | meter_reading.opening | Read-only | Sys | = previous closing. |
| 3 | Closing reading | meter_reading.closing | Number | M | ≥ opening (else "meter reset" confirmation); >3× average consumption → warning. |
| 4 | Reading date | meter_reading.reading_date | Date | M | Within period ±5 days. |
| 5 | Photo | meter_reading.photo_path | Upload | O | Mobile capture. |
| 6 | Consumption / amount | calc: F-09 | Read-only | Sys | Tariff by reading date (S-65). |

S-32  Seat Counts (Flex)

| Route | Roles (see §7) | Purpose | Entry points |
| /operations/seat-counts | Centre Manager, Finance | Record occupied seats per member per period before billing | Today queue AL-14 |

Wireframe — S-32 Seat counts - Oct-2026

| +------------------------------------------------------------------------------------------------------------+ | Seat counts  Centre [Brightspace Flex GGN-44 v]  Period [Oct-2026]   Due 25-Sep   [Upload CSV]             | |------------------------------------------------------------------------------------------------------------| | Member            Plan               Basis        Contracted  Minimum  Occupied   Billable  Amount         | | Brightpath        Enterprise Cabin   Minimum      100         80       [82]       {82}      12,30,000      | | Nimbus Labs       Premium Dedicated  Contracted   60          -        [55]       {60}      6,90,000       | | Hot desk pool     Hot Desk           Occupied     -           -        [30]       {30}      2,25,000       | |------------------------------------------------------------------------------------------------------------| | Capacity 240 | Occupied 202 (84.2%)                      [Save] [Submit -> Finance approval]               | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Occupied seats | seat_count.occupied | Integer | M | 0 … seats allocated/capacity; source manual | csv | api. |
| 2 | Billable seats | calc: F-04 / F-05 / F-06 | Read-only | Sys | — |
| 3 | Amount | calc: F-03 / F-07 | Read-only | Sys | — |
| 4 | Submitted / approved by | seat_count.submitted_by / approved_by | Sys | Sys | Billing run blocks flex contracts without an approved count (AL-14). |

S-40  Billing Centre — Billing Run

| Route | Roles (see §7) | Purpose | Entry points |
| /billing/runs, /billing/runs/{id} | Finance (create/approve); Owner, PM (view) | Generate, review, approve and issue period invoices | Finance dashboard |

Wireframe — S-40 Billing run Oct-2026

| +------------------------------------------------------------------------------------------------------------+ | Billing run  Oct-2026   Entity [All v]   Status {Draft}      [Recalculate] [Approve] [Issue]               | |------------------------------------------------------------------------------------------------------------| | PRE-CHECKS  (must be clear or acknowledged)                                                                | |  (red) 2 flex contracts without approved seat count          [Open S-32]                                   | |  (red) 1 occupant without GSTIN (B2B)                        [Open occupant]                               | |  (amb) 1 escalation due and not applied (GFT-L-0003)          [Open S-25]                                  | |  (amb) 12 meters without readings - electricity will be skipped [Open S-31]                                | |------------------------------------------------------------------------------------------------------------| | SUMMARY   Invoices 148 | Taxable Rs 1.29 Cr | GST Rs 23.2 L | Gross Rs 1.52 Cr                             | | RECONCILIATION  Rent roll billable Rs 1.29 Cr = Draft taxable Rs 1.29 Cr   Difference 0  OK                | |------------------------------------------------------------------------------------------------------------| | Group     Invoices  Taxable      GST         Gross        |  Filter: Property, Group, Entity               | | Rent      62        1,12,40,000  20,23,200   1,32,63,200  |                                                | | CAM       54        12,80,000    2,30,400    15,10,400    |                                                | | Elec.     20        3,10,000     55,800      3,65,800     |                                                | |------------------------------------------------------------------------------------------------------------| | Draft invoices (click to open S-41)   [Select all] [Exclude selected] [Regenerate selected]                | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Period | billing_run.period | Month picker | M | One open run per entity per period. |
| 2 | Billing entities | billing_run.billing_entity_ids | Multi-select | M | Default all. |
| 3 | Invoice date | billing_run.invoice_date | Date | M | Default = invoice_day of period; not in a locked period. |
| 4 | Include | billing_run.include_groups | Checklist | M | rent, cam, electricity, water, parking, services, seat fees, extras. |
| 5 | Consolidate per contract | billing_run.consolidate | Toggle | O | Default off (separate invoices per group). |
| 6 | Pre-check acknowledgements | billing_run.acknowledged_checks | Checkbox per amber check | C | Red checks must be resolved or affected contracts excluded. |

Status flow: draft → approved (checker) → issuing → issued. Issue sends invoice email + WhatsApp with pay link and generates IRN where enabled. Approval and issue are separate so that issue can be scheduled (e.g. 1st 09:00).
S-41  Invoice Detail

| Route | Roles (see §7) | Purpose | Entry points |
| /invoices/{id} | Finance (edit draft); others view; Tenant via T-03 | One invoice: lines, tax, allocations, actions | Billing run, ageing, contract tab, search |

Wireframe — S-41 Invoice SE/26-27/0142

| +------------------------------------------------------------------------------------------------------------+ | Invoice SE/26-27/0142  {Partially paid}   TechNova Solutions | APX-L-0042 | Rent | Oct-2026                | | Issued 01-Oct-2026  Due 08-Oct-2026  Days overdue {0}      [Download PDF] [Resend] [More v]                | |------------------------------------------------------------------------------------------------------------| | Billed by: Apex Realty Pvt Ltd  GSTIN 27AAB...   Billed to: TechNova  GSTIN 27AABCT1234K1Z2                | | Place of supply: Maharashtra (27)  -> intra-state: CGST 9% + SGST 9%        IRN: {not applicable}          | |------------------------------------------------------------------------------------------------------------| | Line  Description                       SAC     Qty     Rate     Taxable      CGST      SGST               | | 1     Base rent Oct-2026, APX-05A        997212  8,500   285.20   24,24,200.00 2,18,178  2,18,178          | |                                               Taxable 24,24,200.00 | Tax 4,36,356.00 | Round-off 0         | |                                               INVOICE TOTAL Rs 28,60,556.00                                | |------------------------------------------------------------------------------------------------------------| | ALLOCATIONS  01-Oct pay_N8x.. Razorpay Rs 20,00,000 | TDS credit Rs 2,42,420 (pending 16A)                 | | OUTSTANDING  Rs 6,18,136.00                                                                                | | [More v]: Credit note | Debit note | Mark disputed | Cancel (draft/unpaid only) | Audit                    | +------------------------------------------------------------------------------------------------------------+ |

Draft invoices are editable (lines, description, quantity) by Finance with reason; issued invoices are immutable — corrections only via credit/debit notes (S-42).
Cancel is allowed only for issued invoices with no allocations, and only within the same GST return period; otherwise a credit note is required.
S-42  Credit / Debit Note

| Route | Roles (see §7) | Purpose | Entry points |
| modal on S-41 | Finance (maker), Finance/Asset Mgr (checker) | Adjust issued invoices | Invoice detail, disputes, CAM true-up |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Note type | adjustment_note.type | Radio | M | credit | debit. |
| 2 | Against invoice | adjustment_note.invoice_id | Read-only | Sys | — |
| 3 | Reason | adjustment_note.reason_code + text | Select + Text | M | proration | rate_correction | dispute_settlement | cam_true_up | waiver | other. |
| 4 | Lines / amount | adjustment_note.lines[] | Grid | M | Credit ≤ invoice outstanding + allocated (cannot exceed invoice); tax recomputed per line. |
| 5 | Note date | adjustment_note.note_date | Date | M | Not in locked period. |

S-43  Payment Centre & Record Payment

| Route | Roles (see §7) | Purpose | Entry points |
| /payments | Finance | All money in; exceptions first | Finance dashboard, AL-09 |

Wireframe — S-43 Payment centre

| +------------------------------------------------------------------------------------------------------------+ | Payments   [Needs attention 3] [Today Rs 11.0 L] [Unallocated Rs 1.6 L]   [+ Record payment]               | |------------------------------------------------------------------------------------------------------------| | Date       Payer         Method    Reference     Amount       Allocated    Unallocated  Status             | | 01-Oct     TechNova      Razorpay  pay_N8x...    20,00,000    20,00,000    0            Allocated          | | 01-Oct     Innovate      NEFT      UTR 4471..    25,00,000    23,40,000    1,60,000     Partial            | |------------------------------------------------------------------------------------------------------------| | RECORD PAYMENT (drawer)                                                                                    | |  Payer* [Innovate Corp v]  Date* [01-Oct-2026]  Method* [NEFT v]  Reference* [UTR 44719..]                 | |  Amount* [25,00,000]  Bank account* [HDFC ..4417 v]   TDS deducted [2,00,000] for invoices [..]            | |  Allocation* (o) Auto: oldest due first ( ) Auto: by charge type order ( ) Manual (S-44)                   | |                                                                      [Save] [Save & allocate]              | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Payer (occupant) | payment.occupant_id | Lookup | M | — |
| 2 | Payment date | payment.payment_date | Date | M | Not future; not in locked period. |
| 3 | Method | payment.method | Select | M | razorpay (system only) | neft | rtgs | imps | upi | cheque | cash | tds_credit. |
| 4 | Reference | payment.reference | Text | M | UTR/cheque no.; duplicate reference + amount → block with message. |
| 5 | Amount | payment.amount | Currency | M | > 0. |
| 6 | Received into | payment.bank_account_ref (billing_entity) | Select | M | Last 4 digits shown only. |
| 7 | Cheque date / bank | payment.cheque_date / cheque_bank | Date / Text | C | Cheque only; status pending_clearance until marked cleared. |
| 8 | TDS deducted | payment.tds_amount + invoice_ids | Currency + Multi-select | O | Creates tds_credit allocations; status "16A pending" until certificate uploaded. |
| 9 | Allocation method | payment.allocation_method | Radio | M | auto_oldest | auto_charge_order | manual (RR-PAY-03). |
| 10 | Idempotency key | payment.idempotency_key | Hidden | Sys | Prevents double submit. |

S-44  Allocation Screen

| Route | Roles (see §7) | Purpose | Entry points |
| /payments/{id}/allocate | Finance | Distribute one payment across invoices | S-43, AL-09 |

Wireframe — S-44 Allocate payment 25,00,000 (Innovate Corp)

| +------------------------------------------------------------------------------------------------------------+ | Payment NEFT UTR 44719 | Rs 25,00,000 | Allocated {23,40,000} | Remaining {1,60,000}                       | |------------------------------------------------------------------------------------------------------------| | [x] Invoice               Group  Due        Outstanding    Allocate                                        | | [x] MTP/26-27/0301        Rent   08-Sep     18,00,000      [18,00,000]                                     | | [x] MTP/26-27/0302        CAM    08-Sep      3,63,440      [ 3,63,440]                                     | | [x] MTP/26-27/0303        Elec.  08-Sep      1,76,560      [ 1,76,560]                                     | | [ ] MTP/26-27/0341        Rent   08-Oct     26,97,000      [        0]                                     | |------------------------------------------------------------------------------------------------------------| | Leave remaining Rs 1,60,000 as: (o) On-account credit ( ) Refund request     [Save allocation]             | +------------------------------------------------------------------------------------------------------------+ |

Allocation total can never exceed payment amount or invoice outstanding (both enforced server-side). Reallocation of a saved allocation requires reason and is audited (UAT-17).
S-45  Ageing & Collections

| Route | Roles (see §7) | Purpose | Entry points |
| /collections | Finance, Owner, Asset Mgr; PM view | Who owes what and how old; follow-up | Dashboards K-04/K-12 |

Wireframe — S-45 Ageing

| +------------------------------------------------------------------------------------------------------------+ | Ageing as of 30-Sep-2026    Group by: [Occupant v]   Entity [All v]   [Send reminders] [Export]            | |------------------------------------------------------------------------------------------------------------| | Occupant           Total       0-30       31-60      61-90      90+        Oldest  Last contact            | | NextGen Retail     31,58,000   8,32,000   8,32,000   8,32,000   6,62,000   98 d    27-Sep call             | | Apex Financial      4,10,000   4,10,000   -          -          -          12 d    -                       | |------------------------------------------------------------------------------------------------------------| | TOTAL              38,40,000  18,20,000   9,60,000   4,10,000   6,50,000                                   | | Row actions: [Log follow-up] [Send statement] [Create task] [Open disputes] [Payment plan]                 | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Follow-up: type | task.type = collection_followup; task.channel | Select | M | call | email | whatsapp | visit | legal_notice. |
| 2 | Follow-up: outcome | task.outcome | Select + Text | M | promised | disputed | no_response | paid | other. |
| 3 | Promise-to-pay date / amount | task.ptp_date / ptp_amount | Date / Currency | C | Mandatory when outcome = promised; alert AL-10 if broken. |
| 4 | Next follow-up date | task.due_date | Date | O | — |

S-46  Disputes

| Route | Roles (see §7) | Purpose | Entry points |
| /disputes | Finance, PM; Tenant raises via T-05 | Track disputed invoices to resolution | Invoice, ageing, T-05 |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Invoice(s) | dispute.invoice_ids | Read-only | Sys | Invoice status → disputed; still counted in ageing with "disputed" tag. |
| 2 | Raised by / on | dispute.raised_by / raised_at | Sys | Sys | Occupant user or staff. |
| 3 | Reason | dispute.reason_code + description | Select + Text | M | rate | quantity | meter_reading | already_paid | service_issue | other. |
| 4 | Disputed amount | dispute.amount | Currency | M | ≤ invoice gross. |
| 5 | Attachments | dispute.attachments | Upload | O | — |
| 6 | Assignee / due | task.assignee_id / due_date | Lookup / Date | M | Default PM of property; SLA 7 days (configurable). |
| 7 | Resolution | dispute.resolution_code + note | Select + Text | C | rejected | credit_note | debit_note | reissue; credit note link mandatory for credit_note. |

S-47  Deposits

| Route | Roles (see §7) | Purpose | Entry points |
| /deposits | Finance; Asset Mgr (approve refunds) | Deposit ledger, shortfalls, refunds, BG expiry | Contract tab, AL-12/AL-11 |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Transaction type | deposit_transaction.type | Select | M | receipt | top_up_demand | adjustment_against_dues | refund | forfeiture. |
| 2 | Amount / date / reference | deposit_transaction.amount / date / reference | Currency / Date / Text | M | Refund ≤ held; forfeiture requires Owner approval. |
| 3 | Adjusted invoices | deposit_transaction.invoice_ids | Multi-select | C | For adjustment_against_dues; creates allocations. |
| 4 | Refund approval | deposit_transaction.approved_by | Approval | C | Routes to Admin payout approval (existing APP flow); payout via Razorpay or bank. |

S-50  Exception Centre

| Route | Roles (see §7) | Purpose | Entry points |
| /exceptions | All staff (own and scoped) | All alerts/exceptions with assignment and resolution | Nav badge, dashboards |

Wireframe — S-50 Exception centre

| +------------------------------------------------------------------------------------------------------------+ | Exceptions  [Critical 5] [Action 14] [Upcoming 22] [Information 31]   Assigned: [Me v]  [Rules]            | |------------------------------------------------------------------------------------------------------------| | Sev   Code   Title                               Record          Assignee   Age   SLA                      | | CRIT  AL-05  Holding over - no exit recorded     MTP-T1-04       Ravi       1 d   Today                    | | CRIT  AL-08  Overdue 90+ days Rs 6,62,000        NextGen Retail  Meera      8 d   Breach                   | | ACT   AL-12  Deposit shortfall Rs 18,97,200      APX-L-0042      Meera      3 d   7 d                      | |------------------------------------------------------------------------------------------------------------| | Row: [Open record] [Assign] [Snooze until] [Resolve - note]   Auto-resolves when condition clears          | +------------------------------------------------------------------------------------------------------------+ |

S-51  12-Month Forecast

| Route | Roles (see §7) | Purpose | Entry points |
| /reports/forecast | Owner, Asset Mgr, Finance | Contracted and forecast revenue by month | Reports menu, K-15 |

Wireframe — S-51 Forecast Oct-2026 - Sep-2027

| +------------------------------------------------------------------------------------------------------------+ | Forecast   Scope [All v]  Renewal assumption [50]%  Vacancy lease-up [No v]  Include deals [x]             | |------------------------------------------------------------------------------------------------------------| | Month    Base rent    Seat fees   CAM       Other    GST        Gross        Esc. uplift  Expiring         | | Oct-26   1,43,00,200  ...         ...       ...      ...        ...          +37,500 USD   0               | | Nov-26   ...                                                                 +3,13,500     0               | |------------------------------------------------------------------------------------------------------------| | Line chart: Contracted (solid) | Forecast incl. renewals and weighted deals (dashed)   [Export]            | +------------------------------------------------------------------------------------------------------------+ |

Forecast logic per D-24 in §6: contracted schedule + renewal assumption applied to contracts expiring in the window + weighted deals from expected start; vacancy lease-up optional at asking rate from a chosen month.
S-52  Property P&L

| Route | Roles (see §7) | Purpose | Entry points |
| /reports/pnl | Owner, Asset Mgr, Finance | Revenue, operating costs, NOI | Reports menu |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Operating cost entry: category | opex_entry.category | Select | M | security | housekeeping | utilities_common | repairs | insurance | property_tax | management_fee | other. Manual or import; auto from CAFM/Marketplace if subscribed. |
| 2 | Amount / period / property | opex_entry.amount / period / property_id | Currency / Month / Lookup | M | — |
| 3 | Recoverable | opex_entry.is_recoverable | Toggle | O | Feeds CAM pool actuals when linked. |

Display: Revenue by component (billed, from invoices), Operating costs by category, NOI and margin (F-19), trend 12 months, per property and portfolio.
S-53  Snapshots (Month-end Lock)

| Route | Roles (see §7) | Purpose | Entry points |
| /reports/snapshots | Finance (create/lock), Owner (lock if configured) | Freeze month-end rent roll | Finance month-end |

[Create snapshot] for period → preview totals → [Lock]. Lock requires: billing run issued, no unallocated payments older than 7 days (warning), all exceptions of type data-quality resolved (warning). Locked snapshot: immutable; movement report vs previous snapshot (new, exits, escalations, vacancy change).
S-54  Monthly MIS & Investor Pack

| Route | Roles (see §7) | Purpose | Entry points |
| /reports/mis | Owner, Asset Mgr, Finance, Management, Client Principal (own) | Generate, review and distribute MIS | Reports menu, scheduled email |

Wireframe — S-54 MIS generator

| +------------------------------------------------------------------------------------------------------------+ | Monthly MIS   Scope: (o) Portfolio ( ) Property [v] ( ) Client [v]   Period [Sep-2026]  Snapshot {locked}  | | Sections [x] Executive KPIs [x] Revenue & billing [x] Collections & ageing [x] Occupancy                   | |          [x] Expiry & renewals [x] Escalations [x] P&L [x] Exceptions & actions [ ] Deal pipeline          | | Format (o) PDF ( ) Excel ( ) Both   Branding [Subscriber v]                                                | | Schedule [x] Monthly on day [5] to [owner@..., cfo@...]            [Preview] [Generate] [Send]             | +------------------------------------------------------------------------------------------------------------+ |

S-55  Owner Statements (Multi-Client Operator)

| Route | Roles (see §7) | Purpose | Entry points |
| /operator/statements | Finance (operator); Client Principal receives | Monthly statement per client | Operator menu, AL-17 |

Wireframe — S-55 Owner statement - Sharma Family Trust - Oct-2026

| +------------------------------------------------------------------------------------------------------------+ | Billed Rs 52,00,000 | Collected Rs 48,00,000 | Arrears Rs 4,00,000                                         | | Less: Management fee 4% Rs 1,92,000 | GST on fee Rs 34,560 | Expenses on owner behalf Rs 1,20,000          | | NET REMITTANCE {Rs 44,53,440}      Settlement model: direct-to-owner (fee invoiced separately)             | |------------------------------------------------------------------------------------------------------------| | Schedules: A. Invoices & collections  B. Arrears by occupant  C. Expenses with bills  D. Fee calc          | |                                           [Recalculate] [Approve] [Issue to principal] [Record remittance] | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Client account / period | owner_statement.client_account_id / period | Lookup / Month | M | One per client per period. |
| 2 | Expense lines | owner_statement.expenses[]: date, vendor, description, amount, bill upload | Grid | O | Bill upload mandatory per line ≥ ₹10,000 (configurable). |
| 3 | Fee | calc: F-20 from mandate.fee_rules | Read-only | Sys | — |
| 4 | Net remittance | calc: F-21 | Read-only | Sys | — |
| 5 | Remittance reference / date | owner_statement.remittance_ref / date | Text / Date | C | When settlement model = operator collects (OI-6). |

S-56  Client Accounts & Mandates (Multi-Client Operator)

| Route | Roles (see §7) | Purpose | Entry points |
| /operator/clients | Org Admin, Operator management | Set up owners managed by the subscriber | Operator menu |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Client name / legal name | client_account.name / legal_name | Text | M | — |
| 2 | PAN / primary contact | client_account.pan / primary_contact | Text / Contact | O / M | — |
| 3 | Billing entities | billing_entity rows (S-61) | Sub-grid | M | At least one. |
| 4 | Mandate services | management_mandate.services | Multi-select | M | rent_collection | cam_billing | leasing | fm_charges | reporting. |
| 5 | Fee rules | management_mandate.fee_rules[] | Repeating: basis, rate, min, max | M | pct_collections | pct_billed | fixed_monthly | per_sqft | per_new_lease. |
| 6 | Fee GST rate | management_mandate.fee_gst_rate | Number | M | Default 18. |
| 7 | Statement day / remittance day | management_mandate.statement_day / remittance_day | Number | M | 1–28. |
| 8 | Settlement model | management_mandate.settlement_model | Radio | M | direct_to_owner | operator_collects (OI-6). |
| 9 | Approval required from principal for | management_mandate.principal_approvals | Multi-select | O | new_contract | financial_change | termination | forfeiture | statement. |
| 10 | Mandate start / end | management_mandate.start_date / end_date | Date | M / O | Access ends automatically on end date (RR-OPR-09). |
| 11 | Client principals | client_account.principal_user_ids | Invite users | O | Invite by email; role Client Principal. |

S-57  Head Leases & Centre P&L (Flex add-on)

| Route | Roles (see §7) | Purpose | Entry points |
| /flex/centres/{id} | Asset Mgr, Centre Mgr, Finance | What the operator pays vs earns per centre | Flex menu |

Head lease is created through S-21 with contract type head_lease (direction payable). It generates monthly payables (due date, amount, status due/paid) instead of invoices; Finance marks payables paid with reference. Centre P&L page shows member revenue (from invoices), head-lease rent, CAM payable, opex (S-52 entries), contribution, seat occupancy and break-even occupancy (F-23, F-24) with 12-month trend.
Settings & Administration (S-60 … S-67)
Visible to Organisation Admin (Finance sees S-61…S-63). Every settings change is audited and takes effect for new transactions only; existing issued invoices are never altered.
S-60  Organisation, Branding & Subscription

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/org | Org Admin | Identity, white-label, subscription and usage | Settings |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Organisation name / type | organization.name / org_type[] | Text / Multi-select | M | org_type drives onboarding template only. |
| 2 | Reporting currency / FY start | organization.reporting_currency / financial_year_start | Select | M | INR / April default. |
| 3 | Logo / colours | organization.branding.logo / colours | Upload / Colour | O | PNG/SVG ≤ 1 MB; contrast check AA. |
| 4 | Email sender name / domain | organization.branding.sender | Text + DNS verify | O | Resend domain verification wizard. |
| 5 | Subdomain / custom domain | organization.subdomain / custom_domain | Text | O | Custom domain Enterprise only. |
| 6 | Subscription | org_subscription.* | Read-only + [Upgrade] | Sys | Edition, add-ons, renewal date, usage meters (RR-ENT-06). |

S-61  Billing Entities

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/billing-entities | Org Admin, Finance | Legal entities that issue invoices | Settings, property form |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Client account | billing_entity.client_account_id | Lookup | M | Default Self. |
| 2 | Legal name | billing_entity.legal_name | Text | M | As registered for GST. |
| 3 | GSTIN / PAN | billing_entity.gstin / pan | Text | C / M | GSTIN mandatory if any charge has tax > 0. |
| 4 | Registered address | billing_entity.address | Address | M | Printed on invoice. |
| 5 | Invoice series (per FY) | billing_entity.invoice_series | Prefix + next no. | M | e.g. SE/26-27/; gapless; max 16 chars (GST rule). |
| 6 | Credit/debit note series | billing_entity.note_series | Prefix + next no. | M | — |
| 7 | E-invoicing | billing_entity.e_invoice_enabled + GSP credentials | Toggle + secure fields | O | OI-7. |
| 8 | Settlement account | billing_entity.settlement_account_ref | Secure field | M | Encrypted; only last 4 digits displayed. |
| 9 | Invoice template / signatory / logo | billing_entity.template_id / signatory / logo | Select / Text / Upload | O | — |
| 10 | Rounding | billing_entity.round_invoice_total | Toggle | O | Round total to nearest rupee with round-off line (D-20). |

S-62  Charge Types & Tax Profiles

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/charges | Org Admin, Finance | Configure components and tax | Settings |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Charge type code / label | charge_type.code / label | Text | M | System types cannot be deleted; custom types allowed. |
| 2 | Default basis / invoice group | charge_type.default_calc_basis / default_invoice_group | Select | M | — |
| 3 | Default tax profile / SAC | charge_type.default_tax_profile_id / hsn_sac | Lookup / Text | M | e.g. 997212 renting of non-residential property. |
| 4 | Recoverable by default | charge_type.default_recoverable | Toggle | O | — |
| 5 | Tax profile: name / components | tax_profile.name / components[] (CGST, SGST, IGST rates) | Text / Grid | M | GST-18, GST-exempt, Zero-rated (IFSC/SEZ with LUT), Outside scope. |

S-63  Numbering & Financial Controls

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/controls | Org Admin, Finance | Periods, locks, allocation defaults | Settings |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Default allocation rule | org_settings.allocation_default | Select | M | oldest_due | charge_order; charge order list if chosen. |
| 2 | Charge order | org_settings.charge_order[] | Drag list | C | e.g. rent, CAM, electricity, water, parking. |
| 3 | Period lock day | org_settings.period_lock_day | Number | O | Auto-lock previous month on this day if snapshot locked. |
| 4 | Late-payment interest | org_settings.late_interest_pct / grace_days | Number | O | Draft debit note only (RR-BIL-11). |
| 5 | Payment due default | org_settings.default_due_days | Number | M | Default 7. |

S-64  Alert Rules

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/alerts | Org Admin | Timing, recipients, channels for §9 alerts | Settings, S-50 [Rules] |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Alert code | alert_rule.alert_code | Read-only | Sys | From §9 catalogue. |
| 2 | Enabled | alert_rule.enabled | Toggle | M | Critical financial alerts (AL-08, AL-09, AL-20) cannot be disabled. |
| 3 | Lead times | alert_rule.offsets[] | Number list | M | e.g. 365,180,90,30 days. |
| 4 | Recipients (roles / users) | alert_rule.recipient_roles / user_ids | Multi-select | M | Scoped by property automatically. |
| 5 | Channels | alert_rule.channels | Checklist | M | in_app | email | whatsapp | digest. |
| 6 | Property override | alert_rule.property_id | Lookup | O | Overrides organisation rule for one property. |

S-65  Meters & Tariffs

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/meters | Org Admin, Facility Mgr | Meter master and tariff validity | Settings, S-31 |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Meter code / utility / space | meter.meter_code / utility / space_id | Text / Select / Lookup | M | Unique per property. |
| 2 | Multiplier | meter.multiplier | Number | M | Default 1. |
| 3 | Tariff / valid from / to | tariff.rate / valid_from / valid_to | Currency / Date | M | No overlapping validity per property + utility + entity. |

S-66  Users, Roles & Approval Matrix

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/users | Org Admin | Invite users, assign roles, properties and approvals | Settings |

Wireframe — S-66 Users

| +------------------------------------------------------------------------------------------------------------+ | Users   [+ Invite user]   Role [All v]   Status [Active v]                                                 | |------------------------------------------------------------------------------------------------------------| | Name        Email              Role(s)              Scope                     Last login                   | | Ravi M      ravi@...           Property Manager     Meridian TP, Nexus Hub    29-Sep                       | | Meera K     meera@...          Finance              All properties            29-Sep                       | |------------------------------------------------------------------------------------------------------------| | APPROVAL MATRIX   Item                  Maker roles           Checker roles       Threshold                | |                   New contract          PM, Leasing           Asset Mgr, Owner    any                      | |                   Financial change      PM, Leasing, Finance  Finance, Asset Mgr  any                      | |                   Escalation apply      System                Finance             any                      | |                   Billing run           Finance               Finance (other user) any                     | |                   Credit note           Finance               Asset Mgr           > Rs 1,00,000            | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Name / email / mobile | users.name / email / phone | Text | M / M / O | Invite email with 7-day link. |
| 2 | Role(s) | org_membership.roles[] | Multi-select | M | Roles in §7. |
| 3 | Property scope | org_membership.property_ids / portfolio_wide | Multi-select / Toggle | M | Portfolio-wide for Owner, Asset Mgr, Finance by default. |
| 4 | Client scope | org_membership.client_account_ids | Multi-select | C | Multi-Client only. |
| 5 | Access expiry | org_membership.expires_at | Date | C | Mandatory for Auditor. |
| 6 | Approval matrix rows | approval_rule.item / maker_roles / checker_roles / threshold | Grid | M | Checker cannot equal maker user (enforced). |

S-67  Audit Log

| Route | Roles (see §7) | Purpose | Entry points |
| /settings/audit | Org Admin, Auditor | Search every audit event | Settings, record History tabs |

Filters: date range, user, entity type, record, action (create/update/delete/approve/export/view_document/login). Columns: time, user, action, entity, field, old value, new value, source (UI/import/API/system), IP. Export to CSV. Read-only.

| SECTION 5 | Screen Specifications — Tenant Portal Mobile-first; subscriber-branded; occupant sees only its own records (T-01 … T-08) |

T-01  Tenant Home

| Route | Roles (see §7) | Purpose | Entry points |
| /portal | Occupant users | What do I owe; quick pay; recent items | Invite link, invoice email/WhatsApp |

Wireframe — T-01 Tenant home (mobile 360 px shown in desktop frame)

| +------------------------------------------------------------------------------------------------------------+ | [Brightspace logo]                                         TechNova Solutions   [Priya v]                  | |------------------------------------------------------------------------------------------------------------| | TOTAL OUTSTANDING   Rs 10,40,576         Next due 08-Oct-2026                                              | | [ Pay now ]   <View invoices>                                                                              | |------------------------------------------------------------------------------------------------------------| | Overdue: none         Due in 7 days: 3 invoices         Disputes open: 0                                   | |------------------------------------------------------------------------------------------------------------| | Recent invoices                                        Notices                                             | |  Rent Oct-2026   Rs 28,60,556  Part paid  [Pay]         Escalation effective 01-Apr-2029 (info)            | |  CAM Oct-2026    Rs 2,80,840   Unpaid     [Pay]         Insurance certificate due 15-Oct                   | |------------------------------------------------------------------------------------------------------------| | Quick links: My contract | Documents | Payments & receipts | TDS certificates | Contacts                   | +------------------------------------------------------------------------------------------------------------+ |

T-02  Invoices & Pay

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/invoices | Occupant users with pay permission | Select invoices and pay all, selected, one or part | T-01, email link |

Wireframe — T-02 Invoices & pay

| +------------------------------------------------------------------------------------------------------------+ | Invoices   Filter: (o) Unpaid ( ) Paid ( ) All     Group [All v]                                           | |------------------------------------------------------------------------------------------------------------| | [x] Rent   Oct-2026  SE/26-27/0142  Due 08-Oct  Outstanding Rs 6,18,136   <PDF>                            | | [x] CAM    Oct-2026  FM/26-27/0088  Due 08-Oct  Outstanding Rs 2,80,840   <PDF>                            | | [ ] Elec.  Sep-2026  SE/26-27/0133  Due 08-Oct  Outstanding Rs 1,41,600   <PDF>                            | |------------------------------------------------------------------------------------------------------------| | Selected 2 invoices: Rs 8,98,976                                                                           | | Pay amount: (o) Full selected Rs 8,98,976  ( ) Other amount [__________] (min Rs 1,000)                    | | If partial, apply to: oldest due first (shown)                       [Pay Rs 8,98,976 >]                   | +------------------------------------------------------------------------------------------------------------+ |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Invoice selection | client-side list of invoice ids | Checkboxes | M | Default: all overdue + due within 7 days pre-selected. Disputed invoices selectable only for undisputed part. |
| 2 | Pay amount | payment_intent.amount | Radio + Currency | M | Full selected or other amount ≥ ₹1,000 and ≤ selected total (partial — RR-PAY-01). |
| 3 | Allocation preview | calc: allocation rule (org default) | Read-only | Sys | Shows which invoices will be paid/partly paid before payment. |

T-03  Payment & Receipt

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/pay/{intent} | Occupant users | Razorpay checkout and confirmation | T-02 |

Wireframe — T-03 Payment result

| +------------------------------------------------------------------------------------------------------------+ | Razorpay checkout (UPI / Netbanking / Card)  -> returns to:                                                | |------------------------------------------------------------------------------------------------------------| | Payment successful   Rs 8,98,976   Ref pay_N9a...   01-Oct-2026 11:42                                      | | Applied to: SE/26-27/0142 Rs 6,18,136 (paid) | FM/26-27/0088 Rs 2,80,840 (paid)                            | | [Download receipt]  [Back to invoices]         Receipt also sent to priya@technova...                      | |------------------------------------------------------------------------------------------------------------| | If pending: "We are confirming your payment with the bank. This can take up to 30 minutes.                 | | Do not pay again." (webhook finalises; page auto-refreshes)                                                | +------------------------------------------------------------------------------------------------------------+ |

Webhook is the source of truth; the browser return never marks an invoice paid on its own (UAT-34). Failed payment returns to T-02 with selection preserved.
T-04  Payments, Receipts & Statement

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/payments | Occupant users | History, receipts, account statement, TDS upload | T-01 |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Statement period | report param | Date range | M | Default current FY; PDF/Excel download. |
| 2 | TDS certificate upload | tds_certificate.file / quarter / amount / invoice_ids | Upload + fields | O | Form 16A PDF; Finance verifies → TDS credit status "verified". |

T-05  Raise Dispute

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/invoices/{id}/dispute | Occupant users | Dispute an invoice | Invoice row menu |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Reason | dispute.reason_code | Select | M | Wrong rate | Wrong quantity/area | Wrong meter reading | Already paid | Service issue | Other. |
| 2 | Disputed amount | dispute.amount | Currency | M | ≤ invoice outstanding. |
| 3 | Description | dispute.description | Text (min 20 chars) | M | — |
| 4 | Attachments | dispute.attachments | Upload (5 files, 10 MB each) | O | — |

Tenant sees dispute status (Open → Under review → Resolved) and the resolution note; credit note appears automatically in invoices.
T-06  My Contract

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/contract | Occupant users | Read-only key terms | T-01 |

Shows: spaces, area/seats, contract dates, lock-in end, notice period, current rate and next escalation (date and new rate), deposit held, charges list with "Included" markers. No internal fields (approval history, internal notes, landlord costs).
T-07  Documents

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/documents | Occupant users | Occupant-visible documents only | T-01 |

List of documents with visibility = occupant_visible: type, version (current only unless "show history"), date, [View] [Download]. Upload allowed for insurance certificate, NOC and TDS certificate types only (go to "under review").
T-08  Profile & Contacts

| Route | Roles (see §7) | Purpose | Entry points |
| /portal/profile | Occupant admin user | Maintain contacts and invoice recipients | Avatar menu |


| # | UI label | DB field (table.column) | Control | M/O | Validation / default / notes |
| 1 | Contacts | occupant.contacts[] | Repeating group | M | Changes to GSTIN or billing address are requests to Finance (not direct edits). |
| 2 | Invoice recipients | occupant.contacts[].receives_invoices | Toggle | M | At least one. |
| 3 | Portal users | occupant portal membership | Invite / remove | O | Occupant admin can invite colleagues (view or pay permission). |
| 4 | Notification preferences | user_prefs.channels | Checklist | O | Email mandatory for invoices; WhatsApp optional. |


| SECTION 6 | Calculations & Formulas Catalogue One calculation service used by UI, billing, reports and exports |


| Engineering rule All formulas are implemented once in the server-side calculation service and unit-tested with the worked values below and in the Implementation Document §13. The front end never re-implements a formula; it calls the service (including for the live summary in the contract wizard). Money is numeric(14,2), rates numeric(14,4); never floating point. |

6.1 Display and Derived Fields (D-01 … D-30)

| ID | Field | Formula / logic | Rounding | Worked example | Shown on |
| D-01 | Monthly base rent (area) | Σ contract_space.area_let × current rate of base_rent charge (D-07) | 2 dp per line | 8,500 × 285.20 = 24,24,200 | S-10, S-22 |
| D-02 | Monthly seat fee | Billable seats (F-04 contracted / F-05 occupied / F-06 MAX(occupied, minimum)) × seat rate; hybrid: base commitment + MAX(0, occupied − seats covered) × rate (F-07) | 2 dp | Brightpath MAX(82, 80) × 15,000 = 12,30,000 | S-10, S-32 |
| D-03 | Annualised base rent | (D-01 + D-02) × 12 | 2 dp | 24,24,200 × 12 = 2,90,90,400 | S-10, K-01 |
| D-04 | CAM (monthly) | If CAM charge is_included → "Included"; else rate × quantity (per_area) or fixed amount | 2 dp | 28 × 8,500 = 2,38,000 | S-10 |
| D-05 | Gross monthly recurring | Σ non-included charges with basis per_area, per_seat, fixed, per_slot, valid on as-of date; excludes metered, per_use, turnover | 2 dp | 24,24,200 + 2,38,000 + 24,000 = 26,86,200 | S-10, S-22 |
| D-06 | Effective rate | D-05 ÷ Σ area_let (area models); D-05 ÷ billable seats (seat models) | 2 dp | 26,86,200 ÷ 8,500 = 316.02 | S-10 |
| D-07 | Current rate | Rate of the rent_step with the latest effective_date ≤ as-of and status applied. If a later step is due (effective ≤ as-of) but not applied, show that contractual rate with amber "pending approval" flag | as stored | As of 30-Sep-2026: 285.20 | S-10, S-22 |
| D-08 | Next escalation date | MIN(rent_step.effective_date) where effective_date > as-of | — | 01-Apr-2029 | S-10, S-25 |
| D-09 | Next escalation uplift | (next step rate − current rate) × quantity | 2 dp | (327.98 − 285.20) × 8,500 = 3,63,630 | S-10, S-25, K-10 |
| D-10 | Days to expiry | expiry_date − as-of (calendar days); blank for auto-renew | integer | 31-Mar-2032 − 30-Sep-2026 = 2,009 | S-10, S-24 |
| D-11 | Term months / remaining years | term_months = whole months from commencement to (expiry + 1 day); remaining years = MAX(0, D-10) ÷ 365.25 | integer / 2 dp | 01-Apr-23 → 31-Mar-32 = 108 months; 5.50 years | S-21, F-18 |
| D-12 | Latest notice date / earliest exit date | Latest notice = expiry − notice period; earliest exit = MAX(lock_in_end_date, as-of + notice period) | — | Latest notice 30-Sep-2031; earliest exit MAX(31-Mar-26, 30-Mar-27) = 30-Mar-2027 | S-21, S-22, S-24 |
| D-13 | Deposit required / shortfall / cover | Required = basis months × monthly amount of basis component (at current rate if top_up_on_escalation, else at signing); shortfall = MAX(0, required − held); cover = held ÷ D-01 | 2 dp; cover 1 dp | 6 × 24,24,200 = 1,45,45,200; held 1,26,48,000 → shortfall 18,97,200; cover 5.2 months | S-22, S-47, AL-12 |
| D-14 | Loading % | (chargeable area ÷ carpet area − 1) × 100 | 1 dp | (8,500 ÷ 5,950 − 1) × 100 = 42.9% | S-11, S-13 |
| D-15 | Rent-free days remaining | MAX(0, rent_free end − as-of + 1) | integer | 0 (ended 31-May-2023) | S-22 |
| D-16 | Outstanding / overdue | Outstanding = Σ F-12 over issued invoices; overdue = part of it with due_date < today | 2 dp | TechNova Oct rent: 28,60,556 − 20,00,000 − 2,42,420 = 6,18,136 | S-10, S-45, T-01 |
| D-17 | Oldest due days & bucket | today − MIN(due_date) of invoices with outstanding > 0; bucket 0–30 / 31–60 / 61–90 / 90+ (F-14) | integer | NextGen 98 days → 90+ | S-45 |
| D-18 | Proration | Monthly charge × days occupied in month ÷ calendar days in month | 2 dp | Join 16-Oct: 24,24,200 × 16 ÷ 31 = 12,51,200 | S-40 |
| D-19 | GST split | Place of supply = state where the property is located. If billing-entity GSTIN state code = property state code → CGST = SGST = rate ÷ 2; else IGST = rate. Zero-rated/exempt per tax profile | per line 2 dp | MH entity, MH property: 9% + 9% on 24,24,200 = 2,18,178 each | S-41 |
| D-20 | Rounding | Rates stored 4 dp, displayed 2 dp; escalated rates rounded to 2 dp at each step; line taxable and each tax component rounded 2 dp half-up; invoice total = Σ lines; optional round-off to nearest rupee (max ±0.50) shown as a line | — | 24,24,200.00 + 4,36,356.00 = 28,60,556.00 | S-41, S-61 |
| D-21 | Escalation schedule | Step n (n ≥ 2) effective = first escalation date + (n − 2) × cycle; compounding rate_n = ROUND(rate_(n−1) × (1 + v), 2); non-compounding rate_n = ROUND(initial × (1 + v × (n − 1)), 2); fixed_amount adds v | 2 dp | 248.00 → 285.20 → 327.98 | S-21, S-25 |
| D-22 | Weighted pipeline | Σ over open deals: proposed monthly amount × probability % | 2 dp | 120 × 16,000 × 60% = 11,52,000 | S-18, K-18 |
| D-23 | Revenue at risk (window) | Σ D-05 × 12 for contracts whose expiry (or earliest exit, if chosen) falls in window and whose renewal deal is not won | 2 dp | Orbit (10,80,000 + CAM 1,80,000) × 12 = 1,51,20,000 | S-24, K-09 |
| D-24 | Forecast month m | Scheduled charges of active/future contracts in m (steps, concessions, proration) + renewal assumption % × last gross for contracts expired before m + Σ weighted deals with expected start ≤ m + optional vacancy lease-up at asking rate | 2 dp | See S-51 | S-51, K-15 |
| D-25 | Expected TDS | Taxable rent × tds_rate (TDS never on GST) | 2 dp | 24,24,200 × 10% = 2,42,420 | S-41, S-43 |
| D-26 | Invoice due date | invoice_date + due_days | — | 01-Oct + 7 = 08-Oct-2026 | S-40 |
| D-27 | Days vacant | as-of − date space last became vacant | integer | APX-09: 181 days | S-04 |
| D-28 | Vacancy loss (monthly) | Σ vacant area × asking rate (or seats × asking seat rate) | 2 dp | 10,200 × 290 = 29,58,000 | K-17 |
| D-29 | Revenue per occupied seat | Member revenue in period ÷ occupied seats | 0 dp | 27,21,600 ÷ 202 = 13,473 | S-57, K-19 |
| D-30 | Provisional CAM share | Annual CAM budget × (occupant area ÷ apportionment base) ÷ 12 | 2 dp | 3,80,00,000 × 22,000/1,10,000 ÷ 12 = 6,33,333.33 | S-40 (CAM pools) |

6.2 Business Formulas F-01 … F-25 (from the Implementation Document §4.14)

| IDs | Formula (full definitions in Implementation Document §4.14) |
| F-01…F-03 | Area rent, escalation, seat revenue |
| F-04…F-07 | Contracted / occupied / minimum / hybrid seat billing |
| F-08 | Inclusions — no invoice line |
| F-09 | Metered utility = (closing − opening) × multiplier × tariff |
| F-10 | Proration (D-18) |
| F-11 | Taxable / gross invoice |
| F-12 | Outstanding = gross − allocations − credit notes + debit notes |
| F-13 | Partial payment status |
| F-14 | Ageing buckets |
| F-15…F-17 | Occupancy area / seats / economic |
| F-18 | WALE by income and area |
| F-19 | NOI and margin |
| F-20…F-21 | Management fee; owner net remittance |
| F-22 | CAM true-up |
| F-23…F-24 | Centre contribution; break-even occupancy |
| F-25 | Collection efficiency |


| SECTION 7 | Role Permissions Screen access, action rights and field masking — enforced server-side and in RLS |

7.1 Screen Access Matrix
F = full (create/edit/delete where allowed); E = edit as maker; A = approve (checker); V = view; S prefix = only assigned properties; O = own occupant records only; V* = view with masking per 7.3; — = no access (hidden from navigation).

| Screen | Org Adm | Owner / Princ. | Asset Mgr | Prop Mgr | Leasing | Finance | Fac. Mgr | Auditor | Tenant |
| S-02 Owner dashboard | V | V | V | — | — | V | — | V | — |
| S-03 Today | V | — | V | SV | — | — | SV | — | — |
| S-04 Leasing dashboard | V | V | V | SV | V | — | — | V | — |
| S-05 Finance dashboard | V | V | V | — | — | V | — | V | — |
| S-06 Approvals | A | A | A | — | — | A | — | — | — |
| S-10 Rent roll register | V | V | V | SV | V* | V | SV | V | — |
| S-11/12 Property, building | F | V | E | SE | V | V | SV | V | — |
| S-13 Space & seats | F | V | E | SE | V | V | SV | V | — |
| S-14 Occupant | F | V | E | SE | E | E | SV | V | O |
| S-15 Pricing plans | F | V | E | SE | V | V | — | V | — |
| S-18 Deals | F | V | E | SE | E | — | — | V | — |
| S-21 Contract create/amend | F | A | E/A | SE | E | E/A | — | — | — |
| S-22 Contract detail | V | V | V | SV | V* | V | SV | V | O |
| S-23 Documents | F | V (client) | E | SE | E (deal/LOI) | E | — | V | O (visible) |
| S-24 Expiry pipeline | V | V | V | SV | E | — | — | V | — |
| S-25 Escalations | F | V | A | SV | — | E/A | — | V | — |
| S-26 Occupancy | V | V | V | SV | V | V | SV | V | — |
| S-30 Import | F | — | A | — | — | — | — | — | — |
| S-31 Meter readings | F | — | V | SE | — | E | SE | V | — |
| S-32 Seat counts | F | — | V | SE | — | A | — | V | — |
| S-40 Billing run | F | V | V | SV | — | E/A | SV (charges) | V | — |
| S-41/42 Invoice, notes | F | V | V/A (notes > limit) | SV | — | E | SV (charges) | V | O |
| S-43/44 Payments, allocation | F | V | V | — | — | E | — | V | O (pay) |
| S-45 Ageing | V | V | V | SV | — | E | — | V | — |
| S-46 Disputes | F | V | V | SE | — | E | SE (charges) | V | O (raise) |
| S-47 Deposits | F | A (forfeit) | A (refund) | SV | — | E | — | V | O (balance) |
| S-50 Exceptions | F | V | E | SE | E | E | SE | V | — |
| S-51/52 Forecast, P&L | V | V | E | SV | — | E | — | V | — |
| S-53 Snapshots | F | A | V | — | — | E | — | V | — |
| S-54 MIS | F | V | E | SV | — | E | — | V | — |
| S-55/56 Owner statements, clients | F | V (own) | V | — | — | E | — | V | — |
| S-57 Head leases, centre P&L | F | V | E | SE | — | E | — | V | — |
| S-60…S-66 Settings | F | — | — | — | — | E (S-61…63) | E (S-65) | — | — |
| S-67 Audit log | V | — | — | — | — | — | — | V | — |
| T-01…T-08 Tenant portal | — | — | — | — | — | — | — | — | O |

7.2 Key Action Rights

| Action | Who |
| Submit new contract / amendment (maker) | PM (scoped), Leasing, Asset Mgr, Finance, Org Admin |
| Approve contract / financial change (checker) | Per S-66 matrix — default Asset Mgr, Finance, Owner; never the maker |
| Apply escalation | Finance (maker = system), approved by Finance/Asset Mgr |
| Serve notice / record exit | PM (scoped), Asset Mgr |
| Terminate contract | Asset Mgr; Owner approval |
| Create/approve/issue billing run | Finance creates; a different Finance user or Asset Mgr approves; Finance issues |
| Credit/debit note | Finance; above threshold approved by Asset Mgr |
| Record offline payment / allocate / reallocate | Finance |
| Deposit refund / forfeiture | Finance request; Asset Mgr approves refund; Owner approves forfeiture |
| Lock snapshot | Finance; Owner if configured |
| Import commit | Org Admin / Admin-Ops prepare; Asset Mgr or Org Admin approve |
| Export any list | All staff roles within scope; audited |
| Invite users / change roles / settings | Org Admin only |
| Pay invoices | Tenant users with pay permission; Finance (on behalf, offline) |

7.3 Field-Level Masking

| Field | Visible in full to | Others |
| Occupant PAN, CIN | Finance, Org Admin, Asset Mgr | Others see AAAAAA |
| Occupant contact email/phone | PM, Finance, Leasing, Org Admin, Asset Mgr | Owner, Auditor see name only |
| Bank / settlement account numbers | Org Admin (edit), Finance (last 4) | Never shown in full after save |
| Invoice amounts, outstanding, ageing | Finance, Owner, Asset Mgr, PM, Auditor | Leasing sees "Arrears: Yes/No"; Facility Mgr sees charges-only invoices |
| Deposit amounts | Finance, Owner, Asset Mgr, PM, Auditor | Leasing hidden |
| Internal documents | Staff within scope | Tenant never; Client Principal only client_visible |
| Internal comments / activity | Staff within scope | Tenant never |

Masking applies identically in UI, API responses and exports. Client Principal and Owner see only their client account data. OFFICEX Platform Support access is break-glass, read-only, time-limited and audited.

| SECTION 8 | Excel Import Mapping Standard multi-sheet template, quick single-sheet template, synonyms, transforms, errors |

Two templates are downloadable from S-30. The standard template (one sheet per entity) is used for full onboarding. The quick template (one row per contract-space) matches the way most Indian landlords keep rent rolls and is auto-exploded into canonical records. Any other layout is handled by the mapping step using the synonym dictionary (8.4) and saved as a mapping template.
8.1 Standard Template — Sheet 1 "Properties"

| Template column | DB field | M/O | Format / allowed values | Example |
| property_code | property.property_code | M | Text ≤ 20, unique | APX-BKC |
| property_name | property.name | M | Text | Apex Business Tower |
| property_type | property.property_type | M | office, it_park, retail, mixed_use, industrial, warehouse, flex_centre, sez_ifsc | office |
| grade | property.grade | O | A+, A, B+, B, C | A |
| address_line1 / city / state / pincode | property.address_line1 / city / state / pincode | M | Text; state name or code; 6 digits | C-66 G Block / Mumbai / Maharashtra / 400051 |
| micro_market | property.micro_market | O | Text | BKC |
| total_chargeable_area / total_carpet_area | property.total_chargeable_area / total_carpet_area | M / O | Number | 98400 / 68900 |
| area_unit | property.area_unit | O | sqft (default), sqm | sqft |
| billing_entity_gstin | property.default_billing_entity_id (lookup by GSTIN) | M | GSTIN of an entity in S-61 | 27AABCA1234F1Z5 |
| currency | property.operating_currency | O | INR default; USD for sez_ifsc | INR |
| client_account | property.client_account_id (lookup by name) | O | Multi-Client only | Sharma Family Trust |

8.2 Sheet 2 "Spaces"

| Template column | DB field | M/O | Format / allowed values | Example |
| property_code | space.property_id (lookup) | M | Must exist in sheet 1 or system | APX-BKC |
| building_code | space.building_id (lookup/create) | O | Default MAIN | T1 |
| floor | space.floor | M | Integer; G/Ground = 0; B1 = −1 | 5 |
| suite_number | space.suite_number | O | Text (leading zeros kept) | 5A |
| space_code | space.space_code | M | Unique per property | APX-05A |
| space_type | space.space_type | M | office, retail, flex_floor, cabin, parking_block, … | office |
| chargeable_area / carpet_area | space.chargeable_area / carpet_area | M / O | Number | 8500 / 5950 |
| seat_type / seat_capacity | seat_inventory.seat_type / capacity | C | Required for flex_floor, cabin | dedicated_desk / 120 |
| asking_rate | space.asking_rate | O | Number | 290 |

8.3 Sheets 3–10
Sheet 3 "Occupants"

| Template column | DB field | M/O | Format / allowed values | Example |
| occupant_ref | import key → occupant.id | M | Any unique text in file | TEN-001 |
| legal_name / trade_name | occupant.legal_name / trade_name | M / O | Text | TechNova Solutions Pvt Ltd |
| occupant_type | occupant.occupant_type | M | company, individual, government, foreign_entity | company |
| industry | occupant.industry | O | Controlled list | IT services |
| gstin / pan | occupant.gstin / pan | C / O | GSTIN required for B2B GST billing | 27AABCT1234K1Z2 / AABCT1234K |
| billing_address_line1 / city / state / pincode | occupant.billing_address | M | Text | … |
| finance_contact_name / email / mobile | occupant.contacts[finance] | M / M / O | Valid email; +91 mobile | Priya N / priya@… / 98… |

Sheet 4 "Contracts"

| Template column | DB field | M/O | Format / allowed values | Example |
| contract_code | contract.contract_code | M | Unique | APX-L-0042 |
| occupant_ref / property_code | contract.occupant_id / property_id | M | Must resolve | TEN-001 / APX-BKC |
| space_codes | contract_space.space_id | M | Semicolon-separated | APX-05A |
| area_let / seats_allocated | contract_space.area_let / seats_allocated | C | Area for area models; seats for seat models | 8500 |
| contract_type | contract.contract_type | M | lease_deed, leave_and_licence, managed_office_agreement, coworking_membership, service_charge_agreement, head_lease | lease_deed |
| billing_model | contract.billing_model | M | area, seat, hybrid, fixed, revenue_share, charges_only | area |
| status | contract.status | M | active, future, notice_served, holding_over | active |
| signing_date / commencement_date / rent_commencement_date / expiry_date | contract.* | O / M / M / C | Date (any common format, see 8.5) | 14-02-2023 / 01-04-2023 / 01-06-2023 / 31-03-2032 |
| lock_in_months / notice_period_months | contract.lock_in_months / notice_period_months | O | Integer | 36 / 6 |
| billing_frequency / invoice_day / due_days | contract.* | O | monthly default / 1 / 7 | monthly / 1 / 7 |
| tds_rate | contract.tds_rate | O | Number % | 10 |
| pricing_plan / seats_contracted / seats_minimum / seat_billing_basis | contract.* | C | Seat/hybrid models | Enterprise Cabin / 100 / 80 / minimum_commitment |

Sheet 5 "Charges"

| Template column | DB field | M/O | Format / allowed values | Example |
| contract_code | contract_charge.contract_id | M | Must resolve | APX-L-0042 |
| component | contract_charge.component | M | base_rent, seat_fee, cam, electricity, dg_backup, water, parking, internet, housekeeping, … | cam |
| calc_basis | contract_charge.calc_basis | M | per_area, per_seat, fixed, per_slot, metered, pro_rata_share, pct_of_turnover, per_use | per_area |
| rate / quantity | contract_charge.rate / quantity_basis | C / O | Number; qty defaults to area/seats | 28 / 8500 |
| included | contract_charge.is_included | M | Y / N | N |
| invoice_group / billing_entity_gstin / tax_profile | contract_charge.* | O | Defaults from charge type and contract | cam / 27AAF… / GST-18 |
| start_date / end_date | contract_charge.start_date / end_date | O | Default contract dates | 01-04-2023 |

Sheet 6 "Escalations"

| Template column | DB field | M/O | Format / allowed values | Example |
| contract_code / component | rent_step.contract_charge_id | M | Must resolve | APX-L-0042 / base_rent |
| escalation_type | rent_step.escalation_type | M | fixed_pct, fixed_amount, cpi_linked, market_review, stepped_schedule, none | fixed_pct |
| value / cycle_months / first_escalation_date / compounding | rent_step.* | C | Number / integer / date / Y-N | 15 / 36 / 01-04-2026 / Y |
| step_effective_date / step_rate | rent_step rows | C | For stepped_schedule: one row per step | 01-04-2029 / 327.98 |
| initial_rate | rent_step[1].rate | O | If file gives current rate, system back-calculates only when escalation history supplied; else current rate = step at last effective date | 248 |

Sheet 7 "Deposits", Sheet 8 "Concessions"

| Template column | DB field | M/O | Format / allowed values | Example |
| contract_code / deposit_type | deposit.contract_id / deposit_type | M | security_deposit, advance_rent, bank_guarantee, cam_deposit, utility_deposit | APX-L-0042 / security_deposit |
| required_amount / held_amount | deposit.required_amount / held_amount | M | Number | 14545200 / 12648000 |
| top_up_on_escalation / bg_bank / bg_expiry | deposit.* | O / C / C | Y-N / text / date | Y |
| contract_code / concession_type / start / end / value | concession.* | M | rent_free, discount_pct, discount_amount, fitout_contribution | APX-L-0042 / rent_free / 01-04-2023 / 31-05-2023 / 100 |

Sheet 9 "Opening balances" (cut-over)

| Template column | DB field | M/O | Format / allowed values | Example |
| occupant_ref / contract_code | invoice.occupant_id / contract_id | M / O | Must resolve | TEN-005 / MTP-L-0014 |
| invoice_no / invoice_date / due_date | invoice.invoice_no / invoice_date / due_date | M | Legacy number kept; flagged opening_balance | MTP/25-26/0911 / 01-06-2026 / 08-06-2026 |
| invoice_group / gross_amount / outstanding_amount | invoice.invoice_group / gross / outstanding | M | outstanding ≤ gross | rent / 832000 / 832000 |
| disputed | invoice.status = disputed | O | Y / N | N |

Sheet 10 "Deals" (optional)

| Template column | DB field | M/O | Format / allowed values | Example |
| deal_code / prospect_name / property_code / space_codes | deal.* | M | Creates prospect occupant if new | DEAL-021 / Prospect Co / PROP-002 / 4F-02 |
| stage / probability / billing_model / area_or_seats / rate / expected_start | deal.stage / probability_pct / proposed_terms / expected_start | M | Stage list per S-18 | loi / 60 / seat / 120 / 16000 / 01-01-2027 |

8.4 Quick Single-Sheet Template and Synonym Dictionary
One row per contract-space. The importer explodes each row into property (match or create with approval), space, occupant (match by GSTIN/name), contract, charges, escalation steps and deposit. Recognised header synonyms (case-, space- and punctuation-insensitive):

| Canonical | DB field | Accepted headers (synonyms) |
| Property / Building | property.name → match | Building, Building Name, Property, Tower, Project |
| Floor | space.floor | Floor, Flr, Level, Flr No |
| Unit | space.suite_number / space_code | Unit, Unit No, Suite, Office No, Space |
| Area | space.chargeable_area, contract_space.area_let | Area, Super Area, SBA, Super Built-up, Chargeable Area, Leasable Area, Rentable Area, Area (sft) |
| Carpet | space.carpet_area | Carpet, Carpet Area, Usable Area, RERA Carpet |
| Tenant | occupant.legal_name | Tenant, Tenant Name, Lessee, Licensee, Client, Member, Company |
| GSTIN | occupant.gstin | GST, GST No, GSTIN, GST Number |
| Start | contract.commencement_date | Start, LSD, Lease Start, Commencement, CD, Agreement Start |
| Rent start | contract.rent_commencement_date | Rent Start, RCD, Rent Commencement |
| Expiry | contract.expiry_date | End, LED, Expiry, Lease End, Termination Date |
| Lock-in | contract.lock_in_months | Lock-in, Lock in Period, LIP |
| Notice | contract.notice_period_months | Notice, Notice Period |
| Rent rate | contract_charge[base_rent].rate | Rent/sft, Rate, Rent psf, Rate per sq ft, Rental Rate |
| Monthly rent | control value (R-12) or fixed base rent | Monthly Rent, Rent, Rent Amount, Monthly Rental |
| Seats / Seat rate / Min seats | contract.seats_contracted / seat rate / seats_minimum | Seats, Workstations, WS, Desks / Seat Price, Per Seat / Min Seats, Lock-in Seats |
| CAM | contract_charge[cam].rate | CAM, CAM/sft, Maintenance, CAM Rate, Service Charge |
| CAM / electricity included | is_included | CAM Included, Elec Included, All inclusive (Y/N) |
| Escalation | rent_step (parser) | Escl, Escalation, Esc %, Increment, Hike |
| Next escalation | rent_step effective date check | Next Escl, Escalation Date, Next Hike |
| Deposit / Deposit held | deposit.required_amount / held_amount | SD, IFRSD, Security Deposit, Deposit / SD Received |
| Status | contract.status | Status, Occ Status |
| Remarks | preserved (unmapped) + keyword rules | Remarks, Notes, Comments |

8.5 Transformation Rules

| Input | Rule | Example |
| Numbers | Strip ₹, Rs, commas, spaces; accept Indian (1,45,35,000) and international (14,535,000) grouping; "L"/"lakh" ×1,00,000; "Cr" ×1,00,00,000 | "Rs 24.24 L" → 2424000 |
| Dates | Accept DD-MM-YYYY, DD/MM/YY, DD.MM.YYYY, DD-MMM-YY, Excel serial; two-digit years → 20YY; ambiguous (e.g. 04/05/26) → use batch date-order setting, flagged | "31.03.2032" → 2032-03-31 |
| Area unit | sq m → sq ft × 10.7639 when property unit is sq ft | 100 sqm → 1,076.39 |
| Enums | Case-insensitive match + synonyms: "Occ", "Occupied", "Let" → occupied; "L&L" → leave_and_licence | "Occ." → occupied |
| Escalation text | Parser patterns: "<n>% every <m> yrs/years/months", "<n>% p.a./annually/yearly", "<n>% after <m> years", "₹<x> per sqft every <m> years", "as per market/CPI" → market_review/cpi_linked pending | "15% every 3 yrs" → fixed_pct 15, cycle 36 |
| Lock-in / notice text | "36 months", "3 years", "3 yrs" → months | "3 yrs" → 36 |
| Rent-free | If rent start > commencement → concession rent_free for the gap (confirm) | Apr–May 2023 |
| Totals rows | Rows with blank tenant and numeric columns equal to sum of rows above → removed and used as control totals | "Total" row |
| Merged cells / multi-line headers | Headers concatenated top-to-bottom; merged property name filled down | — |
| Suite numbers | Treated as text; leading zeros kept | "007" stays "007" |

8.6 Import Error and Warning Messages

| Code | Severity | Message shown to user | Fix hint |
| I-01 | Error | File type not supported or file is password-protected. | Save as .xlsx without password. |
| I-02 | Error | Header row not found in sheet "<sheet>". | Set the header row number in step 2. |
| I-03 | Warning | Row <n> duplicates row <m> (same unit and tenant). | Delete one row or mark as intentional. |
| I-04 | Error | Property "<value>" not found. | Map to an existing property or add it in sheet 1. |
| I-05 | Error | Mandatory field <field> is empty. | Enter a value or set a default in mapping. |
| I-06 | Error | Cannot read date "<value>" in <column>. | Use DD-MM-YYYY. |
| I-07 | Warning | Escalation text "<value>" not recognised; set as pending review. | Choose type/value in grid. |
| R-12 | Error | Monthly amount <a> does not equal area × rate <b>. | Correct rate, area or amount. |
| R-15 | Error | GSTIN "<value>" is invalid or does not match the billing state. | Check GSTIN. |
| R-20 | Error | Commencement date is after expiry date. | Check dates. |
| R-24 | Error | Space <code> already has an active contract for this period. | End the earlier contract or correct dates. |
| R-30 | Warning | All spaces in <property> have the same rate <r>; looks like placeholder data. | Confirm with owner before sign-off. |
| R-40 | Error | <component> is marked included and also billable. | Set included = N or remove charge. |


| SECTION 9 | Alerts & Notifications Catalogue Defaults — timing, recipients and channels configurable in S-64 (except critical financial alerts) |


| Code | Alert | Trigger & timing | Severity | Recipients & channels | Message template → link | Auto-resolves when |
| AL-01 | Contract expiry | expiry − today = 365/180/90/30 d | ≤30 Crit; ≤90 Action; else Info | PM, Leasing, Asset Mgr (+Owner if critical occupant) — in-app, email | "<Occupant> at <space> expires on <date> (<n> days). Monthly Rs <gross>." → S-24 | Renewal deal won, notice/exit recorded |
| AL-02 | Lock-in end / notice window | lock_in_end − today = 90/30 d | Action | PM, Leasing, Asset Mgr — in-app, email | "Lock-in for <contract> ends <date>; tenant may exit with <n> months notice." → S-22 | Date passed |
| AL-03 | Escalation due | effective − today = 90/60/30 d | Info → Action at 30 | Finance, PM — in-app, email; Tenant notice at 30 d (AL-03T) | "<charge> for <contract> rises <v>% on <date>: <old> → <new> (+Rs <uplift>/month)." → S-25 | Step applied |
| AL-04 | Escalation not applied | effective ≤ today and status ≠ applied | Critical | Finance, Asset Mgr — in-app, email daily | "Escalation for <contract> was due <date> and is not applied; billing uses old rate." → S-25 | Applied |
| AL-05 | Holding over | today > expiry and no exit/renewal | Critical | PM, Asset Mgr, Owner — in-app, email daily | "<Occupant> is holding over at <space> since <expiry>." → S-22 | Exit or renewal recorded |
| AL-06 | Option window | window_start − today = 90/30/0 d | Action | Leasing, Asset Mgr — in-app, email | "<Renewal/break> option for <contract> opens <date>, closes <date>." → S-22 | Window closed or option exercised/lapsed |
| AL-07 | Invoice due soon | due − today = 3 d | Info | Tenant (email, WhatsApp) | "Invoice <no> of Rs <amt> is due on <date>. [Pay now]" → T-02 | Paid |
| AL-08 | Overdue cadence | today − due = 1/7/30/60/90+ d | 1–30 Action; 60+ Critical | Tenant at 1/7/30; Finance all; Owner/Principal at 60 and 90+ — email, WhatsApp, in-app | Tenant: "Rs <amt> overdue since <date>. [Pay now]"; staff: "<Occupant> Rs <amt> overdue <n> days." → S-45 | Outstanding = 0 or disputed |
| AL-09 | Payment needs attention | unallocated or partially allocated > 24 h; cheque not cleared > 5 d | Action | Finance — in-app | "Payment <ref> Rs <amt>: Rs <x> unallocated." → S-44 | Fully allocated |
| AL-10 | Promise to pay broken | ptp_date passed and amount not received | Action | Finance — in-app | "<Occupant> promised Rs <amt> by <date>." → S-45 | Payment received |
| AL-11 | Document expiry | expiry − today = 90/30/7 d (insurance, NOC, BG) | Action; ≤7 Critical | PM (Finance for BG); Tenant for occupant documents — email | "<Document> for <contract> expires <date>." → S-23 / T-07 | New version uploaded |
| AL-12 | Deposit shortfall | required − held > 0 after escalation/adjustment | Action | Finance, Asset Mgr — in-app, email | "Deposit shortfall Rs <x> on <contract>." → S-47 | Shortfall = 0 or waived with approval |
| AL-13 | Missing executed agreement | active/future contract with no executed agreement | Action | PM — daily digest | "<contract> has no executed agreement uploaded." → S-23 | Executed document uploaded |
| AL-14 | Seat count not submitted | day 25 of month and no approved count for next period | Critical (blocks billing) | Centre Mgr, Finance — in-app, email | "Seat count for <centre> <period> not submitted." → S-32 | Count approved |
| AL-15 | Meter readings due / missing | period end − 2 d; missing at billing run | Action | Facility Mgr, PM — in-app | "<n> meters at <property> need readings for <period>." → S-31 | Readings submitted |
| AL-16 | Approval pending | item waiting > 24 h (contract, change, billing run, note) | Action | Checker roles — in-app, email | "<item> awaiting your approval since <date>." → S-06 | Approved/rejected |
| AL-17 | Owner statement / mandate | statement_day reached; mandate end − today = 60 d | Action | Operator Finance, Org Admin — in-app, email | "Owner statement for <client> <period> is due." → S-55 | Statement issued / mandate renewed |
| AL-18 | Occupancy / revenue variance | occupancy < threshold; actual vs forecast variance > 5% (monthly) | Info | Asset Mgr, Owner — email | "<property> occupancy <x>% below threshold <y>%." → S-26 / S-51 | Next month re-evaluated |
| AL-19 | Deal idle | no stage change 14 d or next action overdue | Info | Leasing — in-app | "<deal> idle for <n> days." → S-18 | Stage or next action updated |
| AL-20 | Data / integration exception | import failures, R-rule failure on live data, IRN failure, webhook failure | Critical (immediate) | Org Admin, Finance — in-app, email; digest option | "<type>: <message>." → S-50 | Underlying record fixed |
| AL-21 | Dispute raised / SLA | dispute created; SLA (7 d) breached | Action → Critical on breach | Finance, PM; Tenant receives status updates | "<Occupant> disputed <invoice> for Rs <amt>." → S-46 | Dispute resolved |
| AL-22 | Long vacancy | space vacant > 90 d (monthly) | Info | Leasing, Asset Mgr — email | "<space> vacant for <n> days; vacancy loss Rs <x>/month." → S-04 | Space let or reserved |

All alerts are evaluated by the nightly job (00:30 IST) except AL-20 and AL-21 (immediate). Each alert instance is one row in the exception centre (S-50); repeated triggers update the same instance instead of creating duplicates.
WhatsApp uses pre-approved templates (Business API) in the subscriber's name; email via Resend with subscriber branding; in-app via bell and S-50. Tenants can mute WhatsApp but not invoice emails.

| SECTION 10 | Dashboard KPI Catalogue Every tile and chart: definition, formula, where shown, drill-down, thresholds |


| ID | KPI | Formula / definition | Shown on | Drill-down | Thresholds / comparison |
| K-01 | Annual contracted revenue | Σ (D-01 + D-02) × 12 over current contracts (excl. GST) | S-02 | S-10 filtered current | — |
| K-02 | Billed this month | Σ invoice gross (incl. GST) with period = selected month, issued | S-02, S-05 | Invoice list | vs. last month |
| K-03 | Collected MTD | Σ payment allocations dated in month (cash + TDS credit shown separately) | S-02, S-05 | S-43 | vs. last month |
| K-04 | Outstanding | Σ D-16 as of date | S-02, S-05 | S-45 | Red if > 15% of monthly billing |
| K-05 | Collection efficiency | F-25 for period | S-02, S-05 | S-45 | Green ≥ 95%, amber 85–95, red < 85 |
| K-06 | Occupancy (area) | F-15 | S-02, S-03 | S-26 | Green ≥ 90%, amber 75–90, red < 75 |
| K-07 | Occupancy (seats) | F-16 | S-02, S-57 | S-32 | Green ≥ break-even + 5 pts, red < break-even |
| K-08 | WALE (income) | F-18 (area variant on toggle) | S-02 | S-24 | Amber < 3 years |
| K-09 | Revenue at risk (12 m) | D-23 for window 0–365 d | S-02, S-04 | S-24 | Red if > 20% of K-01 |
| K-10 | Escalations due (90 d) | Count and Σ D-09 for steps in next 90 d | S-02, S-05 | S-25 | Red if any AL-04 |
| K-11 | Billed vs collected (12 m) | Monthly K-02 and K-03 series | S-02 | Month → invoice list | — |
| K-12 | Ageing buckets | Σ outstanding by F-14 bucket | S-02, S-05 | S-45 filtered | 90+ bucket red if > 0 |
| K-13 | Lease rollover | Σ annualised D-05 by expiry year, next 10 years | S-02 | S-24 | — |
| K-14 | Top-10 occupant concentration | Top 10 by D-05 × 12; share of K-01 | S-02 | S-22 | Amber if top-1 > 20% |
| K-15 | 12-month forecast | Σ D-24 over next 12 months | S-51 | S-51 | vs. budget if loaded |
| K-16 | NOI & margin | F-19 | S-52 | S-52 | Amber margin < 60% (office) |
| K-17 | Vacant area & vacancy loss | Σ vacant area; D-28 | S-04 | S-10 vacant | — |
| K-18 | Weighted pipeline | D-22 | S-04, S-18 | S-18 | — |
| K-19 | Revenue per seat & contribution | D-29; F-23 and margin | S-57 | S-57 | Red if contribution < 0 |
| K-20 | Owner net remittance | F-21 per client | S-55 | S-55 | — |
| K-21 | Deposit cover & shortfall | Σ held ÷ Σ monthly base; Σ D-13 shortfall | S-05 | S-47 | Red if shortfall > 0 |
| K-22 | Open disputes | Count and Σ disputed amount | S-05 | S-46 | Red if SLA breached |
| K-23 | Data quality score | Records with data_quality_status passed ÷ all records | S-03, S-50 | S-50 | Green ≥ 98% |

Every KPI respects the global client, property and as-of selectors and the user's scope. Thresholds are configurable per organisation (S-64). Each tile shows value, comparison to previous period and a tooltip with the formula text above.
Reconciliation rule: KPI totals must equal the totals of the drill-down list (QA check in §11).

| SECTION 11 | UX Acceptance Checklist QA verifies each item per screen before OFFICEX sign-off |


| # | Check | Applies to |
| 1 | Every field in the screen field table exists, in the specified order, with the exact label, control and M/O behaviour | All form screens |
| 2 | Mandatory fields block save with inline and summary errors; conditional fields appear/hide per rule | All forms |
| 3 | Displayed calculated values equal the calculation-service result and the worked examples in §6 | S-10, S-21, S-22, S-32, S-40, S-41, S-55 |
| 4 | Role matrix §7 enforced: hidden navigation, 403 on direct URL/API, masking in UI/API/export | All screens |
| 5 | Maker cannot approve own item; approval banner and old-vs-new comparison shown | S-06, S-21, S-25, S-40, S-42 |
| 6 | List totals equal sum of all filtered rows; KPI tile equals drill-down total | S-02…S-05, S-10, S-45 |
| 7 | Filters, sort, saved views and URL state persist; export matches visible columns and filters | All lists |
| 8 | Empty, loading, error, no-permission, not-entitled and locked states implemented | All screens |
| 9 | Formats: ₹ Indian grouping, DD-MMM-YYYY, sq ft, status chip colours with text | All screens |
| 10 | Import: template download, synonyms, unmapped preservation, error file, reconciliation, approval, rollback | S-30 |
| 11 | Tenant portal usable at 360 px; pay all/selected/partial works; webhook-only settlement; receipt delivered | T-01…T-08 |
| 12 | Every alert in §9 fires at configured timing, reaches configured recipients/channels and auto-resolves | S-50, S-64 |
| 13 | Rent-Roll-only organisation: no CAFM/CRM/Marketplace menus, links or dependencies anywhere | All screens (UAT-41/42) |
| 14 | Audit event written for every create/update/approve/export/document view | All screens |
| 15 | WCAG 2.1 AA: keyboard navigation, focus, labels, contrast | All screens |


| Next step for Scalezix Produce high-fidelity designs module by module in this order: S-10/S-21/S-22 (P1), S-30 (P1), S-40…S-45 and T-01…T-03 (P2–P3), S-32 and S-57 (P2/P4), S-55/S-56 (P4), S-51…S-54 (P5). Submit each module for OFFICEX design approval before build, with this document's screen IDs on every artboard. |
