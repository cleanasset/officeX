async function testAllEndpoints() {
  const baseUrl = "http://localhost:3000";
  console.log("==================================================");
  console.log("🌐 END-TO-END RENT ROLL API VERIFICATION SUITE");
  console.log("==================================================");

  const endpoints = [
    { name: "Properties Portfolio", path: "/api/rent-roll/properties" },
    { name: "Master Leases (Enriched)", path: "/api/rent-roll/leases" },
    { name: "Dashboard KPI Summary", path: "/api/rent-roll/dashboard" },
    { name: "Monthly Invoices", path: "/api/rent-roll/invoices" },
    { name: "Collections & Receipts", path: "/api/rent-roll/collections" },
    { name: "Escalations Schedule", path: "/api/rent-roll/escalations" },
    { name: "AR Aging Analysis", path: "/api/rent-roll/aging" },
    { name: "Occupancy & Stacking", path: "/api/rent-roll/occupancy" },
    { name: "12-Month Revenue Forecast", path: "/api/rent-roll/forecast" },
    { name: "Property P&L / NOI", path: "/api/rent-roll/pnl" },
    { name: "Tenants Master Registry", path: "/api/rent-roll/tenants" },
    { name: "Commercial Audit Logs", path: "/api/rent-roll/audit" },
    { name: "Management Alerts", path: "/api/rent-roll/alerts" },
    { name: "Single Lease 360 View (LEASE-001)", path: "/api/rent-roll/leases/LEASE-001" },
    { name: "CSV Export (Rent Roll)", path: "/api/rent-roll/export?type=rentroll" },
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep.path}`);
      if (res.ok) {
        let size = 0;
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const json = await res.json();
          size = Array.isArray(json) ? json.length : Object.keys(json).length;
          console.log(`✅ [200 OK] ${ep.name} -> returned ${size} items/keys`);
        } else {
          const text = await res.text();
          console.log(`✅ [200 OK] ${ep.name} -> returned ${text.length} bytes (CSV)`);
        }
        passed++;
      } else {
        console.error(`❌ [HTTP ${res.status}] ${ep.name}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`❌ [ERROR] ${ep.name}: ${err.message}`);
      failed++;
    }
  }

  console.log("==================================================");
  console.log(`API ENDPOINTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

testAllEndpoints();
