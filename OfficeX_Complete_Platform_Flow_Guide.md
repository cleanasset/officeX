# OFFICEX — Complete Platform Flow Guide
## Unified Commercial Real Estate & Workplace Management Platform

**Document Version:** 1.0  
**Date:** September 2, 2026  
**Prepared by:** OfficeX Product & Engineering Team  
**Confidentiality:** Internal Use Only

---

## TABLE OF CONTENTS

1. Platform Overview & Architecture
2. User Roles & Portal Access
3. Login & Signup Flow
4. Flow 1 — Property Listing (Property Owner / Landlord)
5. Flow 2 — Broker Assignment & Leasing Partnership
6. Flow 3 — Public Property Search & Discovery (Public Portal)
7. Flow 4 — Enquiry Submission (Public to Leasing CRM)
8. Flow 5 — Requirement Wizard (Tenant Onboarding via Public Portal)
9. Flow 6 — Leasing CRM: Lead-to-Lease Pipeline
10. Flow 7 — Site Visit Scheduling & Feedback
11. Flow 8 — LOI & Lease Execution
12. Flow 9 — Tenant Onboarding & Workspace Provisioning
13. Flow 10 — Tenant Portal Operations
14. Flow 11 — Facility Management (Ops Portal)
15. Flow 12 — FM Marketplace & Vendor RFQ Lifecycle
16. Flow 13 — Vendor Portal Operations
17. Flow 14 — Reporting & Analytics
18. Flow 15 — Super Admin Operations
19. Cross-Portal Integration Map
20. Appendix: Demo Credentials

---

## 1. PLATFORM OVERVIEW & ARCHITECTURE

**OfficeX** is a unified SaaS platform for commercial real estate (CRE) and workplace management. It connects **Property Owners (Landlords)**, **Leasing Brokers**, **Facility Managers**, **Corporate Tenants**, **FM Service Vendors**, and **Super Admins** into one integrated operating system.

### Technology Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** PostgreSQL via Supabase (Drizzle ORM)
- **Maps:** Google Maps Platform (Real-time geocoding, pin placement)
- **Payments:** Razorpay PG (Escrow-based milestone payments)
- **Communications:** Twilio SMS, Gupshup WhatsApp
- **AI:** OpenAI API (Predictive analytics, intelligent matching)

### Core Portals

| # | Portal | URL Path | User Role | Primary Purpose |
|---|--------|----------|-----------|-----------------|
| 1 | **Properties Portal** | `/properties` | Property Owner / Landlord | List buildings, manage portfolio, rent roll, compliance |
| 2 | **Leasing Portal** | `/leasing` | Leasing Broker | CRM pipeline, leads, site visits, LOI & lease execution |
| 3 | **Public Portal** | `/public/search` | Anyone (No Login) | Search properties, send enquiries, book site visits |
| 4 | **Ops Portal** | `/ops` | Facility Manager | Helpdesk, PPM, asset management, SLA tracking |
| 5 | **Tenant Portal** | `/tenant` | Corporate Tenant / Occupier | Rent payments, helpdesk, visitor management, documents |
| 6 | **Vendor Portal** | `/vendor` | FM Service Vendor / Contractor | RFQs, work orders, escrow payouts, performance ratings |
| 7 | **Marketplace** | `/marketplace` | Facility Manager (Buyer) | Create RFQs, compare vendor quotes, manage work orders |
| 8 | **Admin Portal** | `/admin` | Super Admin | KYC vetting, escrow control, audit logs, user management |
| 9 | **Reporting** | `/reporting` | Analyst / Auditor | Financial MIS, ESG, AI predictions, workplace analytics |

---

## 2. USER ROLES & PORTAL ACCESS

### Role Definitions

| Role | Login Email (Demo) | Portal Redirect | Description |
|------|-------------------|----------------|-------------|
| **Property Owner (Landlord)** | `owner@officex.in` | `/properties` | Owns or manages commercial buildings. Lists vacant floors, tracks rent roll, manages statutory compliance. |
| **Leasing Broker** | `broker@officex.in` | `/leasing` | Commercial real estate agent. Manages leasing pipeline from enquiry to lease execution. Earns commissions. |
| **Facility Manager (Ops)** | `facilitymanager@officex.in` | `/ops` | Manages building operations — helpdesk tickets, preventive maintenance (PPM), asset health, SLA compliance. |
| **Tenant Admin (Occupier)** | `tenant@officex.in` | `/tenant` | Corporate tenant who rents office space. Manages rent payments, helpdesk requests, visitor registration, employee desk bookings. |
| **FM Vendor (Partner)** | `vendor@officex.in` | `/vendor` | Provides facility management services (HVAC, MEP, cleaning, security). Bids on RFQs, executes work orders, receives escrow payouts. |
| **Super Admin** | `admin@officex.in` | `/admin` | Platform administrator. Manages KYC vetting, escrow controls, audit logs, user accounts, and integration health. |

---

## 3. LOGIN & SIGNUP FLOW

### 3.1 Login Flow

**URL:** `/login`

**Step-by-Step:**

1. **Open the Login Page** — Navigate to `/login`
2. **Enter Credentials:**
   - **Email Address:** Enter registered email (e.g., `owner@officex.in`)
   - **Password:** Enter password (demo: `123456`)
3. **Click "Continue to Workspace"**
4. **System Behaviour:**
   - The system matches the email against known demo accounts
   - Stores `officex_user_email` and `officex_user_name` in localStorage
   - Redirects to the correct portal based on user role:
     - `owner@officex.in` → `/properties`
     - `broker@officex.in` → `/leasing`
     - `facilitymanager@officex.in` → `/ops`
     - `tenant@officex.in` → `/tenant`
     - `vendor@officex.in` → `/vendor`
     - `admin@officex.in` → `/admin`
5. **Quick Sandbox Access:** The login page also shows 6 one-click demo buttons at the bottom — clicking any of them instantly logs you into that role's portal.

### 3.2 Signup Flow

**URL:** `/signup`

**Step-by-Step:**

1. **Open the Signup Page** — Navigate to `/signup` (or click "Create an account" from login page)
2. **Step 1 — Choose Your Role / Workspace Type:**
   - Property Owner (Landlord)
   - Leasing Broker
   - Facility Manager (Ops)
   - Corporate Tenant (Occupier)
   - Service Vendor (FM Partner)
3. **Step 2 — Enter Your Details & Company Info:**
   - Full Name
   - Company / Entity Name
   - Work Email Address
   - Contact Phone
   - Create Password
4. **Click "Create Account & Enter Workspace"**
5. **System Behaviour:**
   - Creates user in PostgreSQL database via `POST /api/users`
   - Maps signup role to database role (e.g., `property_owner` → `property_manager`)
   - Stores session in localStorage (`officex_user_id`, `officex_user_email`, `officex_user_name`, etc.)
   - Initializes empty arrays for properties and partnerships (Clean Test Mode)
   - Redirects to the portal matching the selected role

---

## 4. FLOW 1 — PROPERTY LISTING (Property Owner / Landlord Portal)

**Portal:** Properties Portal (`/properties`)  
**Login As:** `owner@officex.in` (or signup as Property Owner)

This is the starting point of the entire OfficeX lifecycle. A property owner lists their commercial building, which then becomes visible on the Public Portal for tenant discovery.

### Step-by-Step: How to Add a New Property

1. **Login** to the Properties Portal (`owner@officex.in`)
2. **View Dashboard** — You land on the "Commercial Portfolio & Assets" dashboard showing:
   - Total Properties count
   - Occupancy Rate
   - Tenant Requests count
   - Expired Compliance NOCs count
   - Property Portfolio list (cards)
3. **Click "Add Property"** button (top-right, teal button with + icon)  
   OR click "Create First Property Listing" if portfolio is empty
4. **Navigate to:** `/properties/add` — the **6-Step Property Builder Wizard**

### Property Builder Wizard (6 Steps):

**STEP 1 — Basic Information & Location**
- Property Name (e.g., "Devasya Commercial Tower")
- Property Type (Commercial Office Park / IT SEZ / Co-Working Campus / Retail Mall / Industrial Warehouse)
- Grade (Grade A / Grade A+ / Grade B+)
- Address (with Google Maps autocomplete)
- City (with Indian location autocomplete — supports all major Indian cities)
- State
- Micro Market (e.g., BKC, GIFT City, Whitefield)
- Pincode
- Nearest Metro / Transit Distance
- **Live Map Pin Picker** — Interactive Google Map for exact GPS coordinates

**STEP 2 — Building Specifications & Floor Layout**
- Total Super Built-Up Area (sqft)
- Total Floors
- Typical Floor Plate Size
- Available Area for Leasing
- Max Seating Capacity
- Clear Ceiling Height
- Number of Passenger Lifts
- Number of Service Lifts

**STEP 3 — Commercial Terms & Lease Model**
- Base Rent per sqft/month
- CAM (Common Area Maintenance) charges per sqft
- Security Deposit (in months)
- Lock-in Period (in months)
- Annual Escalation %
- Car Parking Charges
- Bike Parking Charges

**STEP 4 — Power, HVAC & Technical Redundancy**
- Sanctioned Power Load (KVA)
- DG Backup Level (100% / Partial / None)
- HVAC Type (Central AC / VRF / Split Units)
- Telecom Providers available in building

**STEP 5 — Campus Amenities & Parking**
- Car Parking Slots count
- Two-Wheeler Slots count
- EV Charging Stations count
- Amenities checklist (Cafeteria, Gym, Conference Rooms, Concierge, etc.)

**STEP 6 — Statutory Compliance & Documents**
- Fire NOC Expiry Date
- Lift License Expiry Date
- Pollution Consent Expiry Date
- Occupancy Certificate (Yes/No)
- Building Photo / Media Upload

5. **Click "Publish Listing"** at the end of Step 6
6. **System Behaviour:**
   - Property is saved to PostgreSQL database via `POST /api/properties`
   - Auto-geocodes the address to get latitude/longitude (via `/api/geocode`)
   - Property appears in the owner's portfolio dashboard
   - Property becomes **immediately searchable** on the Public Portal (`/public/search`)
   - An audit log entry is created

### After Listing — What the Owner Can Do:
- **View Portfolio Dashboard** — See all properties with KPIs
- **Track Rent Roll** — `/properties/rent-roll` — Monthly rent tracker for all tenants
- **Manage Collections & Invoices** — `/properties/collections`
- **Monitor Compliance** — `/properties/compliance` — Track Fire NOC, Lift License, Pollution Consent expiry
- **View Tenant Directory** — `/properties/tenants`
- **Assign Broker** — Invite a leasing broker to market the property
- **Delete Property** — Remove a listing from the portfolio

---

## 5. FLOW 2 — BROKER ASSIGNMENT & LEASING PARTNERSHIP

**Portal:** Properties Portal (`/properties`)  
**Login As:** `owner@officex.in`

After listing a property, the owner can assign a leasing broker to market it.

### Step-by-Step:

1. **Go to Properties Dashboard** (`/properties`)
2. **Click "Assign Broker"** button (purple button with handshake icon, top-right)
3. **The Assign Broker Modal opens** showing:
   - **Broker Directory** — List of registered brokers with:
     - Name, Role, Years of Experience, Active Deals, Rating
     - Example: "Ravi Menon — Leasing Director — 12 Yrs — 15 Active Deals — 4.8/5"
   - **Select Property** — Choose which property to assign
   - **Select Broker** — Choose from the directory
   - **Commission Type** — "1 Month Rent" / "5% Annual Value" / Custom
   - **Commission Rate** — e.g., "8.33%"
4. **Click "Send Brokerage Invite"**
5. **System Behaviour:**
   - Creates a new partnership record with status "Awaiting Acceptance"
   - Partnership appears in the "Active Leasing Partnerships" table on the dashboard
   - Broker receives a notification (in their Leasing Portal)
   - Once accepted, status changes to "Active Partner"

### Active Leasing Partnerships Table Columns:
- Partnership ID (e.g., BP-501)
- Property Name
- Broker Name
- Commission Type & Rate
- Status (Active Partner / Awaiting Acceptance)
- Date Assigned

---

## 6. FLOW 3 — PUBLIC PROPERTY SEARCH & DISCOVERY (No Login Required)

**Portal:** Public Portal (`/public/search`)  
**Login Required:** NO — This is a public-facing portal accessible to anyone

This is how a prospective tenant discovers available commercial spaces.

### Step-by-Step: How to Search for Properties

1. **Navigate to:** `/public/search` (or click "Search Spaces" from the Landing Page)
2. **The Search Page loads** with a split-screen layout:
   - **Left Panel (42%):** Property Listings Feed
   - **Right Panel (58%):** Real Google Maps with property pins

3. **Use the Search Bar** (top of page) to find properties:
   - **Keyword Search:** Type building name, landmark, area (e.g., "One BKC", "Apex Tower")
   - **City Filter:** Dropdown with all major Indian cities:
     - Key Hubs: Gujarat, Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata
     - Tier-2 Cities: Ahmedabad, Gandhinagar & GIFT City, Surat, Vadodara, Jaipur, Indore, etc.
     - States: All Indian states available
   - **Space Type Filter:** Office Space / Managed Coworking / Enterprise Suite

4. **Browse Property Cards** — Each card shows:
   - Building Name & Suite/Floor title
   - Location with pin icon
   - Verification Badge (VERIFIED)
   - Grade Badge (GRADE A)
   - OfficeX Property Score (out of 100 with star rating)
   - Specs Grid: Area (sqft), Capacity (seats), Move-in readiness
   - Pricing: Monthly rent, per-sqft rate
   - **"Compare"** button — Add up to 3 properties for side-by-side comparison
   - **"Enquire"** button — Open Quick Enquiry Modal (sends to Leasing CRM)
   - **"Inspect Space"** button — Opens detailed property view

5. **Click on any property card** — The map zooms to that property's location and highlights the pin.

6. **Data Sources:**
   - Shows **real properties from database** (owner-listed properties appear here automatically)
   - Also shows **demo/showcase properties** (One BKC, Maker Maxity, Godrej BKC, The Capital)
   - Properties listed by any owner via `/properties/add` appear here in **real-time**

### Compare Matrix Feature:
1. Click "Compare" on up to 3 property cards
2. A floating comparison dock appears at the bottom of the screen showing selected spaces
3. Click "Compare Now" to go to `/public/property/compare` for a detailed side-by-side matrix

### Property Detail Page:
- Click "Inspect Space" on any property card
- Navigate to `/public/property/[id]` for the full property detail view
- Shows: Full image gallery, complete specs, floor plans, amenities, pricing, energy rating, commute score

---

## 7. FLOW 4 — ENQUIRY SUBMISSION (Public Portal to Leasing CRM)

**Portal:** Public Search Portal (`/public/search`)  
**Login Required:** NO  
**Destination:** Leasing Portal (`/leasing/leads`)

This is a critical cross-portal flow — a public user submits an enquiry that immediately appears in the Broker's Leasing CRM.

### Step-by-Step: How to Send an Enquiry

1. **On the Public Search page** (`/public/search`), find a property you are interested in
2. **Click the "Enquire" button** on the property card (teal button with send icon)
3. **The Quick Enquiry Modal opens** showing:
   - Property Title and Building Name (pre-filled)
   - **Fields to fill:**
     - Company Name (required)
     - Official Email (required)
     - Phone Number
     - Required Seats (defaults to 60)
4. **Click "Submit Enquiry"**
5. **System Behaviour (Behind the Scenes):**
   - Calls `savePublicEnquiry()` from `leasingStore.ts`
   - Creates a new lead record with: id, companyName, email, phone, propertyTitle, buildingName, seats, moveInDate, budget, createdAt
   - **Simultaneously creates a pipeline deal** in stage 0 (Enquiry) with dealHealth 95% and badge "Live Web Enquiry"
   - Fires a browser event: `officex-lead-added`
   - Shows success toast: "Enquiry sent for [Property]! Added to Leasing CRM."

### Where the Enquiry Shows Up (Broker's View):

**A. Leasing Dashboard (`/leasing`):**
- The enquiry appears as a **Live Action Item** at the top: "Live Public Enquiry: [Company Name]"
- The Leasing Funnel updates — Enquiry stage count increases
- Under "Live Leads From CRM" table, the new lead appears with stage "NEW (WEB)" in green

**B. Leads & Enquiries Page (`/leasing/leads`):**
- The new enquiry appears at the **top of the leads list** with:
  - Green badge: "NEW (WEB)" with green border
  - "LIVE" indicator
  - Company name, contact details, property requested, seats, budget
  - Full detail panel when clicked (showing email, phone, budget, move-in date)

**C. Leasing Pipeline Kanban (`/leasing/pipeline`):**
- The enquiry automatically creates a deal card in **Stage 0 (Enquiry)** column
- Card shows: Company name, property, area, budget, Deal Health 95%
- Badge: "Live Web Enquiry" in green

---

## 8. FLOW 5 — REQUIREMENT WIZARD (Tenant Onboarding via Public Portal)

**Portal:** Public Wizard (`/public/wizard`)  
**Login Required:** NO

For tenants with detailed requirements, OfficeX provides an intelligent matching wizard.

### Step-by-Step:

1. **Navigate to:** `/public/wizard`
2. **The 4-Step Requirement Wizard opens:**

**Step 1 — Company & Identity:**
- Company Name
- Legal Entity Type (Private Limited / LLP / Pvt Ltd / etc.)
- Industry (Technology / IT, Financial Services, Consulting, etc.)
- GSTIN (optional)
- Contact Person Name
- Email & Phone

**Step 2 — Space & Floor Needs:**
- Target City (with autocomplete)
- Micro Market (e.g., BKC / Whitefield)
- Workspace Type (Enterprise Managed Office / Co-Working / Bare Shell)
- Seats Required (slider/input)
- Area in sqft
- Number of Cabins
- Number of Meeting Rooms

**Step 3 — Commercials & FM Ops:**
- Monthly Budget Range
- Target Move-in Timeline (Within 30 Days / 60 Days / 90 Days)
- Lease Term (1 Year / 3 Years / 5 Years)
- Power Backup Need
- HVAC Type Required
- Existing FM Services Required (checkbox: Housekeeping, Security, MEP AMC)

**Step 4 — Intelligent Matches (AI-Powered):**
- The system analyses the requirements and shows **matched properties** with:
  - Match Score (e.g., 98% Match)
  - Property Name, Location, Seats, Monthly Rate
  - OfficeX Score (out of 100)
  - "View Details" and "Send Enquiry" buttons
- User can select a matched property and send an enquiry directly
- Enquiry follows the same flow as Flow 4 (appears in Leasing CRM)

---

## 9. FLOW 6 — LEASING CRM: LEAD-TO-LEASE PIPELINE

**Portal:** Leasing Portal (`/leasing`)  
**Login As:** `broker@officex.in`

### Overview

The Leasing Portal is a full CRM for commercial real estate brokers. It manages the complete lifecycle from lead capture to lease execution.

### Leasing Dashboard (`/leasing`):

Upon login, the broker sees:

1. **Leasing Funnel Visualization:**
   - Enquiry > Qualified > Site Visit > Negotiation > LOI & Term Sheet > Closed & Onboarding
   - Each stage shows count and clickable link

2. **Priority Action Items:**
   - Live enquiries from public portal
   - Unassigned hot leads
   - Lease renewals approaching expiry
   - Pending LOI drafts

3. **Today's Site Visits:**
   - Scheduled visits with status (Completed / In Progress / Upcoming)

4. **Live Leads From CRM Table:**
   - All leads with: ID, Company, Requirements, Area, Stage, Assigned Agent

### Sidebar Navigation (Leasing Portal):
- Broker Dashboard (`/leasing`)
- Leasing Pipeline (`/leasing/pipeline`)
- Leads & Enquiries (`/leasing/leads`)
- Site Visits Schedule (`/leasing/visits`)
- LOI & Leases (`/leasing/loi`)
- Commission Ledger (`/leasing/commissions`)

### Pipeline Kanban Board (`/leasing/pipeline`):

A visual Kanban board with 4 stages:

| Column | Stage | Description |
|--------|-------|-------------|
| **Stage 0** | Enquiry | New leads from public portal, referrals, direct enquiries |
| **Stage 1** | Site Visit | Property tour scheduled or completed |
| **Stage 2** | LOI & Negotiation | Letter of Intent being drafted and negotiated |
| **Stage 3** | Executed & Onboarding | Lease signed, tenant being onboarded |

Each deal card shows:
- Company Name
- Contact Person
- Property Name
- Area & Seat Count
- Monthly Budget
- Deal Health Score (0-100)
- Time in stage
- Badge (e.g., "Live Web Enquiry", "Site Tour Completed")

**Broker can:**
- Move deals between stages
- Click a deal to view full details
- Click "Generate LOI" when deal reaches LOI stage
- Click "Begin Onboarding" when lease is executed

---

## 10. FLOW 7 — SITE VISIT SCHEDULING & FEEDBACK

**Portal:** Leasing Portal (`/leasing/visits`)  
**Login As:** `broker@officex.in`

### Step-by-Step: Schedule a Site Visit

1. **Go to:** `/leasing/visits`
2. **View the Monthly Calendar** — Shows all scheduled visits with colour-coded status
3. **Fill the "Schedule New Visit" form:**
   - Client / Company Name
   - Property
   - Date (date picker)
   - Time
   - Assigned Agent
   - Special Instructions (optional)
4. **Click "Schedule Visit"**
5. **System Behaviour:**
   - Visit appears on the calendar
   - Visit shows up on the Leasing Dashboard under "Today's Visits"

### Post-Visit Feedback:
1. After a visit is completed, broker fills the **Visit Feedback Form:**
   - Select Visit
   - Client Impression (Highly Interested / Interested / Neutral / Not Interested)
   - Follow-up Date
   - Notes
2. **Click "Save Feedback"**
3. **System updates the lead's stage** in the pipeline

### Public Site Visit Booking:
- Visits can also be booked from the **Public Property Detail page** (`/public/property/[id]`)
- These appear in the Leasing Portal with a "Guided Visit Booked" badge
- Uses `savePublicVisit()` function which also creates a pipeline card at Stage 1

---

## 11. FLOW 8 — LOI & LEASE EXECUTION

**Portal:** Leasing Portal (`/leasing/loi`)  
**Login As:** `broker@officex.in`

### LOI (Letter of Intent) Workflow Stages:

| Stage | Description |
|-------|-------------|
| Property Selected | Tenant has finalized the property |
| Negotiation | Rent, deposit, lock-in terms being negotiated |
| LOI Prep | LOI document being drafted |
| LOI Submitted | LOI sent to tenant for review |
| LOI Signed | Both parties have signed the LOI |
| Documentation | Legal documents, KYC, registration in progress |
| Lease Executed | Final lease agreement signed — deal closed |

### Step-by-Step: Create a New LOI

1. **Go to:** `/leasing/loi`
2. **Click "Create New LOI Draft"** (teal button, top-right)
3. **Fill the LOI Modal Form:**
   - Client / Company Name
   - Property (dropdown of available properties)
   - Area (sqft)
   - Seats
   - Agreed Rent (per month)
   - Security Deposit (in months + amount)
   - Lock-in Period
   - Annual Escalation %
4. **Click "Create LOI"**
5. **System Behaviour:**
   - LOI deal appears in the LOI workflow table
   - Each deal is expandable to show full commercial terms
   - Available actions per stage: "Generate LOI PDF", "Request Signature", "Upload Signed Copy", "Begin Onboarding"

### Deal Progression:
- Broker can advance deals through stages
- When deal reaches "Lease Executed":
  - **"Begin Workspace Onboarding"** button appears
  - Clicking it navigates to `/leasing/onboard?tenant=[Company Name]`
  - This triggers the Tenant Onboarding flow (Flow 9)

---

## 12. FLOW 9 — TENANT ONBOARDING & WORKSPACE PROVISIONING

**Portal:** Leasing Portal (`/leasing/onboard`)  
**Login As:** `broker@officex.in`

After a lease is executed, the broker initiates workspace onboarding for the new tenant.

### 3-Step Workspace Onboarding Wizard:

**Step 1 — Property & Floor Assignment:**
- Property Name (pre-filled)
- Building / Tower Name
- Floor Number
- Space / Zone Name (e.g., "Zone A — 50 Seats")

**Step 2 — Asset & Service Commissioning:**
- Register critical assets for the space:
  - Asset Name (e.g., "AHU-04 Air Handling Unit")
  - Criticality Level (Critical / High / Medium / Low)
  - PM Schedule (Monthly / Quarterly / Annual)
  - AMC Vendor
  - Warranty Expiry
- Define service SLAs:
  - IT & Network Support — 2 Hours SLA
  - Pantry & Cafeteria — 15 Minutes SLA
  - HVAC & Climate Control — 1 Hour SLA

**Step 3 — Vendor & FM Assignment:**
- Assign vendors to the workspace:
  - Vendor Name, Category (HVAC, Electrical, Cleaning, etc.), Status

### Click "Go Live — Launch Workspace"

**System Behaviour:**
- Tenant portal is provisioned
- Assets are registered in the Ops asset register
- Service SLAs are activated
- Vendors are notified
- Tenant can now login and access their portal

---

## 13. FLOW 10 — TENANT PORTAL OPERATIONS

**Portal:** Tenant Portal (`/tenant`)  
**Login As:** `tenant@officex.in`

### Tenant Dashboard Shows:

1. **Property Card** — Current leased space (Building name, Floor, Unit, Area, Location)
2. **Quick Action Cards (2x2 Grid):**
   - **Monthly Rent** — Due date, amount (e.g., Rs 1,91,000), "Pay Now" button leads to `/tenant/payments`
   - **Helpdesk** — Active tickets count, "Raise Ticket" leads to `/tenant/helpdesk`
   - **Visitors** — Expected visitors today, "Register" leads to `/tenant/visitors`
   - **Documents** — Lease documents, "View All" leads to `/tenant/documents`

3. **Building Notices** — Upcoming events (pest control, fire drills, etc.)
4. **Active Service Tickets** — Open helpdesk requests with priority and SLA timer

### Tenant Portal Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| Tenant Workplace | `/tenant` | Dashboard home |
| Employee Desk & Rooms | `/tenant/employee` | Book desks, meeting rooms |
| Visitor Pre-Registration | `/tenant/visitors` | Register expected visitors, generate QR passes |
| Helpdesk & Requests | `/tenant/helpdesk` | Raise maintenance tickets, chat with helpdesk |
| Rent & Invoices | `/tenant/payments` | View and pay rent, download invoices |
| Lease Documents | `/tenant/documents` | Access lease agreement, NOC copies |

### Key Tenant Flows:

**A. Raise a Helpdesk Ticket:**
1. Go to `/tenant/helpdesk`
2. Click "Raise Ticket"
3. Fill: Issue Type, Description, Priority, Location
4. Submit — Ticket appears in Ops Portal (`/ops/helpdesk`)

**B. Pay Rent:**
1. Go to `/tenant/payments` (or click "Pay Now" from dashboard)
2. View current invoice with breakdown
3. Click "Pay Now" — Razorpay payment gateway
4. Payment confirmation shown

**C. Register a Visitor:**
1. Go to `/tenant/visitors`
2. Fill: Visitor Name, Phone, Email, Visit Date, Purpose
3. Submit — QR pass generated for visitor entry

---

## 14. FLOW 11 — FACILITY MANAGEMENT (Ops Portal)

**Portal:** Ops Portal (`/ops`)  
**Login As:** `facilitymanager@officex.in`

### Ops Dashboard — FM Command Centre:

1. **Workplace Health Score** — Overall building health with 7 dimensions:
   - Facility Infrastructure (94/100)
   - Asset Uptime & Telemetry (97/100)
   - SLA Response & Resolution (96/100)
   - Workplace Cleanliness (94/100)
   - HVAC Thermal & Air Comfort (92/100)
   - Energy & Resource Efficiency (87/100)
   - Occupier Experience / CSAT (91/100)

2. **KPI Cards:**
   - Open Helpdesk Tickets (with escalation count)
   - PPM Tasks Today (completion status)
   - Statutory Compliance % (active / breached)
   - Outcome-Based FM Score
   - Average SLA Resolution Time

3. **SLA Dispatch Console:**
   - Critical alerts requiring immediate dispatch
   - One-click technician dispatch with SLA timer

### Ops Portal Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| FM Command Centre | `/ops` | Dashboard home |
| Helpdesk Tickets | `/ops/helpdesk` | Manage all tenant-raised tickets |
| 52-Week PPM Calendar | `/ops/ppm` | Preventive maintenance scheduling |
| Asset Register & Health | `/ops/assets` | Track all building assets with IoT telemetry |
| Outcome-Based FM | `/ops/outcomes` | SLA-based performance tracking |
| Compliance Centre | `/ops/compliance` | Track statutory certifications |

### Key Ops Flows:

**A. Handle a Helpdesk Ticket:**
1. Tenant raises ticket from Tenant Portal
2. Ticket appears at `/ops/helpdesk`
3. FM assigns technician
4. SLA timer starts
5. Work completed — ticket closed
6. CSAT survey sent to tenant

**B. Dispatch Emergency Response:**
1. Critical alert shows on dashboard (e.g., "Server Room AC Condenser Leak")
2. Click "Dispatch Senior Tech"
3. Select available technician from dropdown
4. Click "Confirm Dispatch"
5. SLA timer activates
6. Toast: "Dispatched [Tech Name] to [Issue]! SLA Timer active."

**C. 52-Week PPM Calendar:**
1. Go to `/ops/ppm`
2. View preventive maintenance schedule for entire year
3. Tasks auto-scheduled based on asset PM frequency
4. Mark tasks as completed
5. Compliance tracked automatically

---

## 15. FLOW 12 — FM MARKETPLACE & VENDOR RFQ LIFECYCLE

**Portal:** Marketplace (`/marketplace`)  
**Login As:** `facilitymanager@officex.in` (as Buyer) | `vendor@officex.in` (as Vendor)

### Marketplace Dashboard (`/marketplace`):

1. **Service Category Directory:**
   - MEP (42 vendors), HVAC (38), Security (65), Housekeeping (80)
   - Fire Safety (25), Pest Control (30), Lifts (18), Landscaping (22)

2. **Active RFQs Table:**
   - RFQ ID, Title, Category, Quotes Received, Deadline, Status
   - Statuses: Open / Evaluating / Awarded / Closed

### RFQ Lifecycle — Complete Flow:

**Step 1: Create RFQ (FM Manager)**
1. Go to `/marketplace/create-rfq`
2. Fill: Title, Property, Category, Description, Scope, Budget, Deadline
3. Publish RFQ — Status: "Open for Bids"

**Step 2: Vendor Receives & Bids (Vendor Portal)**
1. Vendor logs in — sees "Matched RFQs" on dashboard
2. Each RFQ shows: Match %, Property, Budget, Deadline
3. Vendor clicks "Submit Quote" — fills pricing, timeline, approach
4. Quote submitted — appears in Marketplace

**Step 3: Compare Quotes (FM Manager)**
1. Go to `/marketplace/compare`
2. See all received quotes side-by-side
3. Compare: Price, Timeline, Vendor Rating, Past Performance
4. Select winning vendor — Award RFQ

**Step 4: Work Order Issued**
1. Awarded vendor receives Work Order at `/vendor/work-orders`
2. Work order tracks: ID, Client, Property, Category, Timeline, Progress %

**Step 5: Milestone Payments via Escrow**
1. Work milestones defined (e.g., 25%, 50%, 75%, 100%)
2. FM verifies milestone completion
3. Payment released via Razorpay Escrow
4. Vendor sees payout at `/vendor/payments`

### Marketplace Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| Marketplace Directory | `/marketplace` | Dashboard home with categories |
| RFQ Directory | `/marketplace/rfq` | View all RFQs with filters |
| Create RFQ | `/marketplace/create-rfq` | Create new RFQ |
| Quote Comparison | `/marketplace/compare` | Side-by-side vendor quotes |
| Active Work Orders | `/marketplace/work-orders` | Track work order progress |
| Escrow Payments | `/marketplace/payments` | Manage escrow-based payments |

---

## 16. FLOW 13 — VENDOR PORTAL OPERATIONS

**Portal:** Vendor Portal (`/vendor`)  
**Login As:** `vendor@officex.in`

### Vendor Dashboard:

1. **Vendor Verification Banner:**
   - Verified Gold Vendor badge
   - Status: Active
   - Star Rating (e.g., 4.4 out of 5, 23 reviews)
   - Profile Completion: 100%

2. **KPI Cards:**
   - Active Work Orders (count)
   - Monthly Earnings (Rs amount)
   - Matched RFQs (count, with today's additions)
   - Quality Score (out of 100, percentile ranking)

3. **Performance Radar (5 Dimensions):**
   - Quality (90%)
   - Timeliness (85%)
   - SLA Compliance (92%)
   - Responsiveness (80%)
   - Professionalism (88%)

4. **Matched RFQs Panel:**
   - AI-matched RFQs with Match %, Property, Budget, Deadline
   - "Submit Quote" / "View RFQ" buttons

5. **Earnings & Payout History:**
   - Recent payouts with dates, bank references, amounts

6. **Active Work Orders Table:**
   - WO ID, Client, Property, Category, Timeline, Progress %, Status

### Vendor Portal Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| Vendor Dashboard | `/vendor` | Dashboard home |
| RFQs & Live Bidding | `/vendor/rfqs` | Browse and bid on matched RFQs |
| Active Work Orders | `/vendor/work-orders` | Track assigned work |
| Milestones & Escrow | `/vendor/payments` | View milestone payments & payouts |
| Performance & Ratings | `/vendor/ratings` | View ratings from clients |

---

## 17. FLOW 14 — REPORTING & ANALYTICS

**Portal:** Reporting (`/reporting`)  
**Login As:** Any authenticated user with reporting access

### Reporting Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| Workplace Analytics | `/reporting` | Dashboard home |
| MIS Financial Ledger | `/reporting/mis` | Revenue, expenses, P&L by property |
| ESG & Sustainability | `/reporting/esg` | Energy, water, waste tracking |
| AI Predictive Engine | `/reporting/ai` | AI-powered predictions & insights |
| Utility Tracking | `/reporting/utilities` | Electricity, water, fuel consumption |
| Financial Reports | `/reporting/financials` | Detailed financial breakdowns |

---

## 18. FLOW 15 — SUPER ADMIN OPERATIONS

**Portal:** Admin Portal (`/admin`)  
**Login As:** `admin@officex.in`

### Admin Dashboard:

1. **Platform KPIs:**
   - GTV (Gross Transaction Value): Rs 2.4Cr
   - MRR (Monthly Recurring Revenue): Rs 3.8L
   - Total Users: 342
   - Pending KYC: 8 (Action Required)
   - Managed Properties: 34

2. **Integration Health Monitor:**
   - Razorpay PG: Uptime 99.9%, Latency 142ms
   - Twilio SMS: Online
   - Gupshup WhatsApp: Online
   - PostgreSQL Primary DB: Healthy, 4.2 GB, Last backup 2h ago
   - OpenAI API: Online

3. **Pending Approvals Queue:**
   - Vendor KYC approvals
   - Refund requests
   - Admin onboarding requests
   - Actions: Approve / Reject / Process Refund

4. **System Audit Trail:**
   - Account suspensions
   - Bulk KYC processing
   - Configuration changes
   - Webhook updates

### Admin Portal Sidebar Navigation:
| Menu Item | URL | Function |
|-----------|-----|----------|
| Super Admin Home | `/admin` | Dashboard home |
| KYC & Vetting | `/admin/kyc` | Verify vendor/tenant KYC documents |
| Razorpay Escrow Control | `/admin/escrow` | Manage escrow accounts & releases |
| Platform Users | `/admin/users` | Manage all user accounts |
| System Audit Logs | `/admin/audit` | View all system events |
| AI Studio | `/admin/ai` | AI model configuration |
| RBAC & Permissions | `/admin/rbac` | Role-based access control |
| Platform Settings | `/admin/settings` | System configuration |

---

## 19. CROSS-PORTAL INTEGRATION MAP

This section shows how actions in one portal trigger events in other portals.

### Key Integration Flows:

```
PUBLIC PORTAL                    LEASING PORTAL (BROKER)
User searches property    --->   Lead appears in CRM
User sends enquiry        --->   Lead + Pipeline card created
User books site visit     --->   Visit appears in calendar
User submits requirement  --->   AI-matched leads in pipeline

PROPERTIES PORTAL (OWNER)       LEASING PORTAL (BROKER)
Owner lists property      --->   Property visible in public search
Owner assigns broker      --->   Broker gets partnership invite

LEASING PORTAL (BROKER)         TENANT PORTAL
Lease executed            --->   Workspace onboarding initiated
Onboarding complete       --->   Tenant portal provisioned

TENANT PORTAL                   OPS PORTAL (FM)
Tenant raises ticket      --->   Ticket appears in helpdesk
Tenant requests service   --->   SLA timer starts for FM team

OPS PORTAL (FM)                 MARKETPLACE
FM creates RFQ            --->   RFQ published to matching vendors
FM awards RFQ             --->   Work order issued to vendor
FM verifies milestone     --->   Escrow payment released to vendor

MARKETPLACE                     VENDOR PORTAL
RFQ published             --->   Matched RFQ appears for vendor
Work order issued         --->   Work order in vendor dashboard
Payment released          --->   Payout in vendor earnings

ADMIN PORTAL                    ALL PORTALS
KYC approval/rejection   --->   Vendor/Tenant status updated
Escrow control           --->   Payment release/hold across system
User management          --->   Access granted/revoked
```

### Complete Property Lifecycle (End-to-End):

```
1. OWNER lists property          (/properties/add)
         |
         v
2. OWNER assigns BROKER          (/properties -> Assign Broker)
         |
         v
3. PROPERTY appears on           (/public/search)
   PUBLIC SEARCH
         |
         v
4. TENANT searches & sends       (/public/search -> Enquire)
   ENQUIRY
         |
         v
5. LEAD appears in BROKER's      (/leasing/leads)
   CRM
         |
         v
6. BROKER qualifies lead         (/leasing/leads -> Qualify)
   & schedules SITE VISIT
         |
         v
7. SITE VISIT conducted          (/leasing/visits)
   & feedback recorded
         |
         v
8. NEGOTIATION on terms          (/leasing/pipeline -> Stage 2)
         |
         v
9. LOI drafted & signed          (/leasing/loi -> Generate LOI)
         |
         v
10. LEASE EXECUTED               (/leasing/loi -> Lease Executed)
         |
         v
11. WORKSPACE ONBOARDED          (/leasing/onboard)
    Assets registered,
    Services provisioned,
    Vendors assigned
         |
         v
12. TENANT uses workspace        (/tenant)
    Pays rent, raises tickets,
    registers visitors
         |
         v
13. FM manages operations        (/ops)
    Handles tickets, runs PPM,
    monitors SLAs
         |
         v
14. FM creates RFQs for          (/marketplace/create-rfq)
    vendor services
         |
         v
15. VENDORS bid & execute         (/vendor/rfqs -> /vendor/work-orders)
    work orders
         |
         v
16. ESCROW PAYMENTS released      (/marketplace/payments -> /vendor/payments)
    on milestone completion
         |
         v
17. ADMIN oversees everything     (/admin)
    KYC, Escrow, Audit, Users
```

---

## 20. APPENDIX: DEMO CREDENTIALS

### Quick Login Credentials (Password for all: 123456)

| Role | Email | Portal | URL |
|------|-------|--------|-----|
| Property Owner | owner@officex.in | Properties | /properties |
| Leasing Broker | broker@officex.in | Leasing | /leasing |
| Facility Manager | facilitymanager@officex.in | Ops | /ops |
| Tenant Admin | tenant@officex.in | Tenant | /tenant |
| FM Vendor | vendor@officex.in | Vendor | /vendor |
| Super Admin | admin@officex.in | Admin | /admin |

### Key URLs for Testing Flows:

| Page | URL | Description |
|------|-----|-------------|
| Landing Page | / | Main website homepage |
| Login | /login | Authentication page |
| Signup | /signup | New user registration |
| Add Property | /properties/add | 6-step property listing wizard |
| Public Search | /public/search | Property search with Google Maps |
| Public Wizard | /public/wizard | 4-step requirement submission |
| Leasing Pipeline | /leasing/pipeline | Kanban deal board |
| Leads & Enquiries | /leasing/leads | CRM lead management |
| Site Visits | /leasing/visits | Visit scheduling & calendar |
| LOI & Leases | /leasing/loi | LOI workflow & lease execution |
| Tenant Onboarding | /leasing/onboard | Workspace provisioning |
| Ops Helpdesk | /ops/helpdesk | FM ticket management |
| PPM Calendar | /ops/ppm | Preventive maintenance |
| Marketplace | /marketplace | FM vendor marketplace |
| Create RFQ | /marketplace/create-rfq | New RFQ creation |
| Vendor RFQs | /vendor/rfqs | Vendor's available RFQs |
| Admin Dashboard | /admin | Super admin control panel |

---

**--- END OF DOCUMENT ---**

*OfficeX: The Unified Operating System for Commercial Real Estate & Workplace Management*
