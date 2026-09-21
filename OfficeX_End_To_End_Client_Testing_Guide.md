# OfficeX Platform End-to-End Client Testing & UAT Guide
**Comprehensive Operational Blueprint: Sign-In/Up, Rent Roll SaaS, Visitor Management, Statutory Compliance & Calendly Demo Flow**

* **Document ID:** `WO-OFFICEX-SCL-001 / UAT-REV-2.0`
* **Target Audience:** OfficeX Leadership, Clean Asset Services & Client Review Committee
* **Implementation Partner:** Scalezix Engineering & Delivery Team
* **Review Date & Version:** September 2026 · Version 1.2 (Production Baseline)
* **System Core Directive:** Unified Multi-Tenant CRE SaaS Core (*"Workspaces, Simplified"*)

---

## 1. Executive Summary & Architectural Foundation

This document serves as the formal User Acceptance Testing (UAT) and functional handover guide for the OfficeX Commercial Real Estate (CRE) SaaS Platform. Developed strictly in accordance with the client's architectural directives (*"Workspaces, Simplified"*), this platform delivers an end-to-end operating system uniting Landlords, Property Managers, Corporate Tenants, Facility Management (FM) Operators, Leasing Brokers, and Service Vendors on a single, auditable core.

Unlike legacy software that deploys isolated, fragmented tools, OfficeX operates as a unified multi-tenant architecture sharing a central organizational master: **Organization → Properties → Leases → Visitors → Compliance → Audits → Financials**. All sandbox pills, hardcoded mock hints, and static demo codes have been completely decommissioned. The entire system is now powered by real cryptographic verification, free standard SMTP email dispatch, live financial algorithms, and dynamic workspace routing.

> **Client Guiding Principle:**
> OfficeX sign-in is an enterprise-grade front door reflecting *"Workspaces, Simplified"* rather than an internal module picker. Users authenticate once via their work identity and are dynamically routed to their active workspace based on their verified organization roles.

---

## 2. The 9 Unified Workspaces & Portals Directory

The OfficeX platform consists of 9 integrated workspaces accessible across public marketing and auth-gated enterprise environments:

| Workspace / Portal | Primary Role & Persona | Route / Direct URL | Core Operational Focus |
| :--- | :--- | :--- | :--- |
| **1. Public Discovery & CRE Marketplace** | Prospective Tenants & Public Investors | `/`<br>`/marketplace`<br>`/public/search` | Verified Grade-A building discovery, map search, 3D tour requests, site visit booking via Calendly. |
| **2. Commercial Landlord Desk** | Property Owners & Asset Directors (*Ravi Singhal*) | `/properties`<br>`/operate/rent-roll` | Master portfolio oversight, rent roll cash flow, vacancy loss, lease escalations, and NOI yield tracking. |
| **3. FM Command Centre** | Facility Operations Managers (*Sunil Verma*) | `/ops`<br>`/operate/ppm`<br>`/operate/helpdesk` | Building operations, work orders, reactive tickets, Planned Preventive Maintenance (PPM), and SLA escalations. |
| **4. FM Marketplace** | Corporate Tenants & Building Owners | `/fm-marketplace` | On-demand facility service procurement: Deep cleaning, HVAC maintenance, pest control, and interior fitouts. |
| **5. Corporate Tenant Portal** | Workplace Admin & Facility Leads (*Pooja Iyer*) | `/tenant` | Employee desk booking, office access passes, service requests, utility consumption, and rent invoice review. |
| **6. Leasing Broker CRM** | Agency Brokers & Channel Partners (*Arjun Kapoor*) | `/leasing`<br>`/leasing/pipeline` | Listing distribution, tenant lead CRM, site visit schedules, commission tracking, and digital LOI generation. |
| **7. Service Vendor Hub** | Contractors & Facility Vendors (*Karan Mehra*) | `/vendor` | Work order dispatch acceptance, technician scheduling, milestone billing, and AMC contract compliance. |
| **8. Super Admin Console** | Platform Governance & Security (*Deepak Sharma*) | `/admin` | Organization master, KYC verification, role-based access control (RBAC), security audit logs, and privileged MFA. |
| **9. Executive MIS & Analytics** | Institutional Investors & Fund Managers | `/reporting`<br>`/operate/compliance` | Portfolio-wide ESG benchmarks, statutory compliance audits, tenant aging, and gross-to-net yield analytics. |

---

## 3. Module 1: Real Sign-In & Sign-Up Flow Walkthrough

The authentication layer has been re-architected into a clean, identifier-first experience backed by real SMTP email dispatch and cryptographic verification. There are zero simulated sandbox pills.

### A. Role-Based Self-Registration Flow (`/signup`)
1. **Navigate to:** `http://localhost:3000/signup`
2. **Enter Full Name** (e.g., `"Vikram Malhotra"`) and **Corporate Work Email** (e.g., `"vikram@horizonrealty.com"`).
3. **Enter a 10-Digit Mobile Number** (e.g., `"9820112233"`). Country prefix (`+91`) is automatically applied.
4. **Choose Intended Workspace Role:**
   * Property Owner / Asset Manager
   * Commercial Leasing Broker
   * Facility / Service Vendor
5. **Set a Secure Password** (minimum 8 characters with uppercase, numbers, and symbols).
6. Click **Create Account & Verify**.
7. The system dynamically generates a cryptographically random 6-digit PIN and immediately dispatches it via free SMTP to the entered email.
8. Enter the 6-digit code received in the inbox. Upon successful verification, the account is provisioned in the database and redirected to the workspace.

### B. Smart Identifier-First Sign-In Flow (`/login`)
1. **Navigate to:** `http://localhost:3000/login`
2. **Smart Identifier Detection:**
   * The user enters their Work Email (e.g., `"ravi@acme.com"`) OR Mobile Number (e.g., `"9876543210"`).
   * The system instantly detects the format without requiring the user to specify whether it is an email or phone.
3. **Authentication Pathways:**
   * **Password Authentication:** Enter password with 1-click show/hide toggle.
   * **One-Time Passcode (OTP):** Click *"Email me a one-time code instead"* to dispatch a 6-digit PIN.
   * **Enterprise SSO:** If entering a corporate domain (e.g. `@dlf.in` or `@tcs.com`), the form routes to Okta/Azure AD.
   * **Privileged MFA:** Super Administrator (`admin@officex.in`) automatically triggers mandatory Level-2 MFA.
4. **Multi-Workspace Context Chooser (*"Where would you like to work today?"*):**
   * If a user holds multiple roles across organizations (e.g., Landlord of Acme Realty AND Executive at NovaTech), OfficeX presents a branded context selector modal displaying badges, properties, and last-used workspace.
   * Selecting a card routes the user directly to the appropriate portal without requiring re-authentication.

> **Anti-Brute Force Security:**
> The OTP engine enforces a strict 30-second cooldown between resend requests and permanently locks a code after 5 consecutive incorrect attempts. Codes automatically expire in 10 minutes and are consumed upon first use to eliminate replay vulnerabilities.

---

## 4. Module 2: Rent Roll SaaS Operating System Walkthrough

The OfficeX Rent Roll SaaS module transforms traditional static spreadsheets into a real-time, auditable operating system. It serves as the single source of truth for commercial leases, rental escalations, CAM billing, and occupancy forecasting across commercial office towers.

### A. How a Building Owner or Property Manager Operates (`/operate/rent-roll`)
1. **Navigate to:** `http://localhost:3000/operate/rent-roll` (or via Landlord Desk at `/properties`)
2. **Select Active Commercial Asset:**
   * Choose from the property dropdown (e.g., *"Apex Horizon Tower - Bandra Kurla Complex, Mumbai"* or *"GIFT One Tower, GIFT City"*).
3. **Executive KPI Strip (Live Calculations):**
   * **Total Leasable Area:** 285,000 Sq. Ft.
   * **Current Occupancy Rate:** 92.4% (Occupied: 263,340 Sq. Ft. · Vacant: 21,660 Sq. Ft.)
   * **Monthly Gross Rent Collection:** ₹4.82 Cr / month
   * **Weighted Average Lease Expiry (WALE):** 3.8 Years
   * **Monthly Vacancy Loss:** ₹38.98 Lakhs / month (calculated from unleased space at market rental)
4. **Unit-by-Unit Master Rent Roll Table:**
   * **Unit / Suite ID** (e.g., `"Suite 401 - Wing A"`)
   * **Tenant Entity Name** (e.g., `"Morgan Stanley India Support"`, `"KPMG Shared Services"`)
   * **Leased Area (Sq. Ft.)** and **Fitout Status** (Fully Furnished, Bare Shell, Warm Shell)
   * **Base Rent** (₹ / Sq. Ft. / Month) and **Common Area Maintenance (CAM)** (₹ / Sq. Ft.)
   * **Current Monthly Rent** and **Escalation Schedule** (e.g., `"15% every 36 months"` or `"5% annual"`)
   * **Security Deposit** Held in Escrow (Standard 6 months gross rent)
   * **Lease Expiry Date** and **Active Expiry Alert Badge** (Green > 180 days, Amber 90 days, Red < 30 days)
5. **Actionable Operational Buttons:**
   * **"Add New Lease":** Opens digital lease creation form with auto-escalation compounding.
   * **"Upload Master Sheet":** Import existing client Excel rent rolls directly into PostgreSQL.
   * **"Export Rent Roll":** Download audit-ready Excel/CSV sheet with formula preservation.
   * **"3-Year Revenue Forecast":** Visualizes compounded revenue growth factoring in contracted escalations.

---

## 5. Module 3: Enterprise Visitor Management SaaS Walkthrough

Designed for Grade-A commercial office buildings, the Visitor Management module eliminates paper logbooks, accelerates reception throughput, and maintains a strict real-time audit trail of all guests, contractors, and VIPs.

### A. End-to-End Visitor Journey (`/operate/visitors`)
1. **Navigate to:** `http://localhost:3000/operate/visitors` (or via FM Command Centre at `/ops`)
2. **Pathway A: Pre-Registration (Host Invites Guest):**
   * Tenant host inputs visitor name, company, mobile number, visit date, and meeting room.
   * The platform automatically generates a Digital QR Pass and dispatches it to the visitor via WhatsApp/Email.
   * Upon arrival at the turnstile or reception, the visitor scans their QR pass for 3-second check-in.
3. **Pathway B: Reception Walk-In Kiosk:**
   * Unscheduled visitor approaches the front desk or self-service tablet.
   * Visitor enters mobile number, captures webcam photo, and accepts building safety/NDA policies.
   * System verifies visitor via mobile OTP and generates a visitor pass with thermal badge printing.
4. **Instant Host Notification:**
   * The host tenant receives an automated alert: *"Your visitor [Guest Name] has arrived at Tower Reception."*
5. **Real-Time Security Command & Evacuation:**
   * Security desk dashboard displays live occupancy: Total Checked-In, Overstay Alerts (>8 hours), and Check-Outs.
   * In the event of a fire drill or emergency, 1-click **"Evacuation Roll-Call"** generates an instant roster of all guests currently on-site.

---

## 6. Module 4: Statutory Compliance & Safety Management Walkthrough

Commercial office operations in India require strict adherence to local municipal, fire, environmental, and labor regulations. The Compliance Management SaaS module monitors certificate expirations, audits, and vendor AMCs.

### A. Regulatory Audit & Expiry Engine (`/operate/compliance`)
1. **Navigate to:** `http://localhost:3000/operate/compliance`
2. **The 4 Mandatory Commercial Real Estate Regulatory Pillars:**
   * **Pillar 1: Fire Safety NOC** (Chief Fire Officer annual inspection & hydrostatic test certificates).
   * **Pillar 2: Lift & Escalator PWD Safety License** (Annual government inspectorate approval & rope certificates).
   * **Pillar 3: Diesel Generator (DG Set) Consent to Operate** (State Pollution Control Board emission norms).
   * **Pillar 4: Structural Stability & Building Occupancy Certificate** (Municipal Corporation sanctioned plan).
3. **Smart Expiry Tracker & Escalation Matrix:**
   * **Green (>90 Days Remaining):** Compliant / Normal state.
   * **Amber (30 to 90 Days Remaining):** Renewal triggered; notification sent to Facility Manager.
   * **Red (<30 Days Remaining):** Critical warning; escalated to Vice President of Property Operations.
4. **Document Vault & Evidence Repository:**
   * Secure storage for scanned government licenses, test reports, challans, and approved drawings.
   * Third-party auditor access allows read-only verification during investor due diligence.

---

## 7. Module 5: Calendly & Calendar Scheduling Integration

To drive maximum lead conversion without creating friction, OfficeX integrates direct meeting scheduling seamlessly into the application flow.

### A. Direct Booking Flow (30-Minute Consultation)
1. **Production Booking Link:** `https://calendly.com/admin-cleanasset/30min`
2. **In-App Trigger Points:**
   * **Marketing Header:** *"Schedule Tour"* / *"Book a Demo"* navigation link.
   * **Property Listing Pages:** *"Schedule Inspection"* / *"Book Site Visit"* buttons on individual towers.
   * **SaaS Solution Banners:** *"Talk to Real Estate Advisor"* across Landlord and FM portals.
3. **High-Performance Modal Experience:**
   * Clicking the trigger immediately opens a responsive, branded popup modal within OfficeX.
   * The user selects their preferred date, time zone, and meeting time directly on screen without leaving the platform.
   * **Automated Calendar Sync:** Dispatches immediate Google Calendar / Microsoft Outlook invites with Google Meet video links to both the client prospect and the OfficeX / Clean Asset advisory team.

---

## 8. Step-by-Step Client UAT Test Scripts

Execute these test cases in sequence to validate the entire platform flow:

| Test ID & Persona | Module / URL | Step-by-Step Actions & Input Data | Expected Verification Result |
| :--- | :--- | :--- | :--- |
| **TC-01**<br>New User | `/signup` | 1. Fill Name, Work Email, Mobile (+91).<br>2. Select 'Property Owner' role.<br>3. Enter password & click 'Create Account'. | Real 6-digit OTP sent via SMTP to inbox. Entering code creates account with zero sandbox pills. |
| **TC-02**<br>Landlord | `/login` | 1. Enter `ravi@acme.com`.<br>2. System detects email & shows password box.<br>3. Enter `OfficeX@2026` & Submit. | Authenticates cleanly and displays post-auth workspace chooser (*'Where would you like to work today?'*). |
| **TC-03**<br>Mobile User | `/login` | 1. Enter `9876543210`.<br>2. System detects phone & routes to OTP.<br>3. Request verification code. | Dispatches real 6-digit code with 30s timer. Entering code routes to FM Command Centre (`/ops`). |
| **TC-04**<br>Asset Owner | `/operate/rent-roll` | 1. Select 'Apex Horizon Tower'.<br>2. Review Gross Rent, WALE, and Vacancy.<br>3. Click 'Add New Lease'. | KPIs compute dynamically. New lease modal allows configuring sq. ft., base rent, CAM, and escalation %. |
| **TC-05**<br>Auditor | `/operate/rent-roll` | 1. Click 'Export Rent Roll' button at top right. | System immediately downloads audit-ready spreadsheet with tenant breakdown and escalations preserved. |
| **TC-06**<br>Host Tenant | `/operate/visitors` | 1. Click 'Pre-Register Guest'.<br>2. Enter Name, Mobile, Date, and Meeting Room. | System generates unique Digital QR Pass with 1-click WhatsApp/Email dispatch link. |
| **TC-07**<br>Security Desk | `/operate/visitors` | 1. Search visitor by mobile or scan pass.<br>2. Click 'Check In'. | Visitor marked 'Checked-In', live building occupancy increments, and host receives instant notification. |
| **TC-08**<br>Compliance Head | `/operate/compliance` | 1. Review 4 statutory categories.<br>2. Click 'Fire Safety NOC' card. | Shows validity dates, attached inspection certificate, renewal checklist, and 90-day warning badge. |
| **TC-09**<br>Prospect | `/` (Homepage)<br>`/marketplace` | 1. Click 'Book a Demo' or 'Schedule Tour'. | Calendly modal opens smoothly with `https://calendly.com/admin-cleanasset/30min`. Zero page reload. |
| **TC-10**<br>Super Admin | `/login` | 1. Enter `admin@officex.in`.<br>2. Submit credentials. | Enforces mandatory Level-2 MFA before granting access to the Super Admin Governance Console (`/admin`). |

---

## 9. Technical Handover & Production Configuration

For the client's IT and technical operations team, the following environment variables in `.env.local` govern core platform integrations. All services operate under 100% free production-ready tiers:

* `SMTP_HOST`: Standard SMTP server address (e.g. `'smtp.gmail.com'` or `'smtp-relay.brevo.com'`).
* `SMTP_PORT`: Secure port (`'465'` for SSL or `'587'` for TLS).
* `SMTP_USER`: Outgoing sender mailbox address.
* `SMTP_PASS`: 16-character application-specific password (Google App Password / Brevo API key).
* `SMTP_FROM`: Branded sender header (e.g. `'OfficeX Security <noreply@officex.in>'`).
* `NEXT_PUBLIC_SUPABASE_URL` & `ANON_KEY`: High-performance PostgreSQL database backend.

---
*Delivered & Certified by Scalezix Engineering & Delivery Team*  
*OfficeX Platform Ecosystem · Workspaces, Simplified · Confidential Document for Client UAT*
