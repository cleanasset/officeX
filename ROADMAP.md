# OfficeX SaaS Roadmap

## Active Milestone: Enterprise Commercial Asset Suite

### Phase 1: Rent Roll Auth, Onboarding & Supabase Database Persistence
- [x] Fix Supabase Auth account creation in `src/app/api/v1/auth/register/route.ts` (resolve `supabaseAdmin` ReferenceError).
- [x] Unconditionally route new signups and logins needing setup to `/onboarding?context=rent-roll`.
- [x] Ensure 4-step wizard commits organization, properties, user linkage, and spaces to Supabase PostgreSQL (`public.organizations`, `public.properties`, `public.user_properties`, `public.spaces`).
- [x] Lock authorized users in database: `pooja@singhaniagroup.in`, `vikram.test@singhaniarealty.in`, `medistationlifecare@gmail.com`.
- [x] Integrate GSD (Get Shit Done) Empirical Validation protocol into `.agents/rules/` and `AGENTS.md`.
- [ ] User executes commit and push to remote origin (`git push origin main`).

---

### Phase 2: Visitor Compliance SaaS Module
- **Reference Model**: MyGate adapted for Grade-A multi-tenant commercial offices & IT parks.
- **Specification Source**: `client response/OFFICEX_Visitor_Compliance_SaaS_Functional_Specification_UAT.pdf`.
- **Target Audience / Roles**:
  - Security Guard Desk / Kiosk (Check-in, photo/ID capture, badge/pass print or QR).
  - Corporate Occupier / Tenant Admin (Pre-invite visitors, deliveries, contractor approvals).
  - Commercial Landlord / Asset Manager (Building-wide visitor MIS, contractor compliance, emergency roll-call).
  - Visitor (WhatsApp/SMS digital pass, QR scan at turnstile/reception).
- **Core Features**:
  - Pre-approved digital invites & QR codes.
  - Walk-in kiosk registration with OTP verification.
  - Host approval workflow (instant push / WhatsApp notification).
  - Contractor compliance & safety briefing sign-off.
  - Emergency evacuation live head-count.

---

### Phase 3: Statutory Compliance SaaS Module
- **Core Scope**: Building compliance, fire NOC, lift inspection certificates, municipal tax receipts, DG pollution norms, pollution control board (PCB) filings.
- **Integration**: Available to Rent Roll asset owners & facility managers as unified operational compliance.
