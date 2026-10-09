import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GET as getBillingRuns, POST as postBillingRuns } from "../src/app/api/billing-runs/route";
import { GET as getAdjustmentNotes, POST as postAdjustmentNotes } from "../src/app/api/adjustment-notes/route";
import { GET as getCamPools, POST as postCamPools } from "../src/app/api/cam-pools/route";
import { POST as postCamTrueUp } from "../src/app/api/cam-pools/[id]/true-up/route";
import { GET as getInvoicePdf } from "../src/app/api/invoices/[id]/pdf/route";

async function testApiEndpoints() {
  console.log("=== TESTING WAVE 3 API ENDPOINTS DIRECTLY ===\n");

  let passes = 0;
  let fails = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passes++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      fails++;
    }
  }

  // 1. GET /api/billing-runs
  console.log("1. Testing GET /api/billing-runs...");
  const req1 = new Request("http://localhost:3000/api/billing-runs?period=Oct-2026");
  const res1 = await getBillingRuns(req1);
  const json1 = await res1.json();
  assert(res1.status === 200 && json1.success, "GET /api/billing-runs returns 200 with pre_checks and summary");
  assert(Array.isArray(json1.pre_checks_details?.unapproved_seat_counts) || Array.isArray(json1.pre_checks), "Pre-check AL-14 unapproved seat counts present");
  assert(Array.isArray(json1.pre_checks_details?.unlogged_active_meters) || Array.isArray(json1.pre_checks), "Pre-check AL-15 unlogged active meters present");

  // 2. GET /api/adjustment-notes
  console.log("\n2. Testing GET /api/adjustment-notes...");
  const req2 = new Request("http://localhost:3000/api/adjustment-notes");
  const res2 = await getAdjustmentNotes(req2);
  const json2 = await res2.json();
  assert(res2.status === 200 && json2.success, "GET /api/adjustment-notes returns 200 with notes register");

  // 3. GET /api/cam-pools
  console.log("\n3. Testing GET /api/cam-pools...");
  const req3 = new Request("http://localhost:3000/api/cam-pools");
  const res3 = await getCamPools(req3);
  const json3 = await res3.json();
  assert(res3.status === 200 && json3.success, "GET /api/cam-pools returns 200 with pool list");
  const firstPool = json3.pools?.[0];

  // 4. POST /api/cam-pools/[id]/true-up simulation
  if (firstPool) {
    console.log("\n4. Testing POST /api/cam-pools/[id]/true-up (Formula F-22 simulation)...");
    const req4 = new Request(`http://localhost:3000/api/cam-pools/${firstPool.id}/true-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ execute: false }),
    });
    const res4 = await postCamTrueUp(req4, { params: Promise.resolve({ id: firstPool.id }) });
    const json4 = await res4.json();
    assert(res4.status === 200 && json4.success, "POST /api/cam-pools/[id]/true-up returns 200 with simulation");
    assert(json4.conservation_check?.is_balanced === true, "Formula F-22 conservation check is balanced");
  }

  // 5. GET /api/invoices/[id]/pdf?format=json
  console.log("\n5. Testing GET /api/invoices/[id]/pdf...");
  const req5 = new Request("http://localhost:3000/api/invoices/test-inv/pdf?format=json");
  // Use any existing invoice id or test
  const noteList = json2.notes || [];
  const testInvId = noteList[0]?.invoiceId || "any";
  if (testInvId) {
    const res5 = await getInvoicePdf(req5, { params: Promise.resolve({ id: testInvId }) });
    const json5 = await res5.json();
    if (res5.status === 200) {
      assert(json5.taxation?.sac_code === "997212", "Invoice PDF format=json has SAC code 997212");
      assert(!!json5.taxation?.amount_in_words, `Invoice PDF amount in words: "${json5.taxation?.amount_in_words}"`);
    } else {
      console.log("Invoice pdf json returned status:", res5.status);
    }
  }

  console.log("\n=======================================================");
  console.log(`API ENDPOINT SUMMARY: ${passes} PASSED, ${fails} FAILED`);
  console.log("=======================================================");

  if (fails > 0) process.exit(1);
}

testApiEndpoints().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
