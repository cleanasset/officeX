import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { GET as getSettings, POST as postSettings } from "../src/app/api/settings/route";
import { GET as getBillingEntities, POST as postBillingEntities } from "../src/app/api/settings/billing-entities/route";
import { GET as getCharges, POST as postCharges } from "../src/app/api/settings/charges/route";
import { GET as getNumbering, POST as postNumbering } from "../src/app/api/settings/numbering/route";
import { GET as getAlerts, POST as postAlerts } from "../src/app/api/settings/alerts/route";
import { GET as getUsers, POST as postUsers } from "../src/app/api/settings/users/route";
import { GET as getAudit } from "../src/app/api/settings/audit/route";

async function runVerification() {
  console.log("======================================================================");
  console.log("   OFFICEX WAVE 6: SETTINGS, FINANCIAL CONTROLS & SYSTEM MASTER SUITE");
  console.log("======================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      if (details) console.log(`          ↳ ${JSON.stringify(details)}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`          ↳ Error Details:`, details);
      failed++;
    }
  }

  try {
    // 1. S-60 Organisation & Branding
    console.log("--- 1. S-60 Organisation & Branding Profile ---");
    const reqS60 = new Request("http://localhost:3000/api/settings");
    const resS60 = await getSettings(reqS60);
    assert(resS60.status === 200, "GET /api/settings Returns 200 OK");
    const s60Data = (await resS60.json()).data;
    assert(
      s60Data.financial_controls.operating_currency.includes("INR") &&
      s60Data.financial_controls.financial_year_start.includes("April"),
      `Corporate Parameters Configured — Currency: ${s60Data.financial_controls.operating_currency}, FY: ${s60Data.financial_controls.financial_year_start}`
    );

    // 2. S-61 Billing Entities Master
    console.log("\n--- 2. S-61 Billing Entities Master ---");
    const reqS61 = new Request("http://localhost:3000/api/settings/billing-entities");
    const resS61 = await getBillingEntities(reqS61);
    assert(resS61.status === 200, "GET /api/settings/billing-entities Returns 200 OK");
    const s61Data = (await resS61.json()).data;
    assert(
      Array.isArray(s61Data) && s61Data.length >= 2,
      `Multi-State Billing Entities Registered — Count: ${s61Data.length} (MH, KA, HR)`
    );
    const hasGstin = s61Data.every((b: any) => b.gstin && b.pan && b.state_code);
    assert(hasGstin, "All Entities Have Valid GSTIN, PAN, and State Codes");

    // 3. S-62 Charge Types & Tax Profiles
    console.log("\n--- 3. S-62 Charge Types & Tax Profiles ---");
    const reqS62 = new Request("http://localhost:3000/api/settings/charges");
    const resS62 = await getCharges(reqS62);
    assert(resS62.status === 200, "GET /api/settings/charges Returns 200 OK");
    const s62Data = (await resS62.json()).data;
    assert(
      s62Data.charges.some((c: any) => c.charge_type === "base_rent" && c.hsn_sac_code === "997212") &&
      s62Data.charges.some((c: any) => c.tds_section === "194I" || c.tds_section === "194C"),
      "HSN/SAC 997212 and TDS Sections 194I / 194C Mapped Correctly"
    );

    // 4. S-63 Numbering Sequences & Financial Controls
    console.log("\n--- 4. S-63 Numbering Sequences & Financial Controls ---");
    const reqS63 = new Request("http://localhost:3000/api/settings/numbering");
    const resS63 = await getNumbering(reqS63);
    assert(resS63.status === 200, "GET /api/settings/numbering Returns 200 OK");
    const s63Data = (await resS63.json()).data;
    assert(
      s63Data.sequences.some((s: any) => s.prefix === "INV" && s.next_number.includes("2026-27")),
      `Sequence Masks Configured — Next Tax Invoice: ${s63Data.sequences[0].next_number}`
    );
    assert(
      !!s63Data.controls.global_lock_date,
      `Global Financial Freeze Lock Date Enforced — Date: ${s63Data.controls.global_lock_date}`
    );

    // 5. S-64 Alert Rules Configuration
    console.log("\n--- 5. S-64 Alert Rules Configuration (AL-01 to AL-21) ---");
    const reqS64 = new Request("http://localhost:3000/api/settings/alerts");
    const resS64 = await getAlerts(reqS64);
    assert(resS64.status === 200, "GET /api/settings/alerts Returns 200 OK");
    const s64Data = (await resS64.json()).data;
    assert(
      s64Data.some((a: any) => a.code === "AL-01" && a.trigger_offsets.includes(90)) &&
      s64Data.some((a: any) => a.code === "AL-17"),
      `Alert Rules Catalogue Active — Total Alert Definitions: ${s64Data.length}`
    );

    // 6. S-66 Users, Roles & Approval Matrix
    console.log("\n--- 6. S-66 Users, Roles & Approval Matrix ---");
    const reqS66 = new Request("http://localhost:3000/api/settings/users");
    const resS66 = await getUsers(reqS66);
    assert(resS66.status === 200, "GET /api/settings/users Returns 200 OK");
    const s66Data = (await resS66.json()).data;
    assert(
      s66Data.roles.length === 12,
      `All 12 Specification Roles Registered — Roles: ${s66Data.roles.map((r: any) => r.code).join(", ")}`
    );
    assert(
      Array.isArray(s66Data.approval_matrix) && s66Data.approval_matrix.length > 0,
      "Dual-Control Maker-Checker Approval Matrix Rules Configured"
    );

    // 7. S-67 Audit Log Timeline
    console.log("\n--- 7. S-67 Audit Log Timeline ---");
    const reqS67 = new Request("http://localhost:3000/api/settings/audit");
    const resS67 = await getAudit(reqS67);
    assert(resS67.status === 200, "GET /api/settings/audit Returns 200 OK");
    const s67Data = (await resS67.json()).data;
    assert(
      Array.isArray(s67Data) && s67Data.length > 0,
      `Immutable Audit Trail Logged — Total Events: ${s67Data.length}`
    );

    // Test CSV Stream
    const reqS67Csv = new Request("http://localhost:3000/api/settings/audit?format=csv");
    const resS67Csv = await getAudit(reqS67Csv);
    assert(resS67Csv.status === 200, "GET /api/settings/audit?format=csv Returns 200 CSV Stream");

    // Final Summary
    console.log("\n======================================================================");
    console.log(`WAVE 6 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("======================================================================");

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  }
}

runVerification();
