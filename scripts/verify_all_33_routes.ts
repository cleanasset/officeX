const baseUrl = "http://localhost:3000";

async function verifyAllRoutes() {
  console.log("================================================================================");
  console.log("🌐 COMPREHENSIVE 33-ENDPOINT RENT ROLL API VALIDATION");
  console.log("================================================================================");

  const getRoutes = [
    { name: "01. Dashboard", path: "/api/rent-roll/dashboard" },
    { name: "02. Properties", path: "/api/rent-roll/properties" },
    { name: "03. Spaces", path: "/api/rent-roll/spaces" },
    { name: "04. Tenants", path: "/api/rent-roll/tenants" },
    { name: "05. Leases", path: "/api/rent-roll/leases" },
    { name: "06. Invoices", path: "/api/rent-roll/invoices" },
    { name: "07. Collections", path: "/api/rent-roll/collections" },
    { name: "08. Aging", path: "/api/rent-roll/aging" },
    { name: "09. Escalations", path: "/api/rent-roll/escalations" },
    { name: "10. Occupancy", path: "/api/rent-roll/occupancy" },
    { name: "11. Forecast", path: "/api/rent-roll/forecast" },
    { name: "12. PnL", path: "/api/rent-roll/pnl" },
    { name: "13. Flex Centres", path: "/api/rent-roll/flex-centres" },
    { name: "14. CAM Pools", path: "/api/rent-roll/cam-pools" },
    { name: "15. Meter Readings", path: "/api/rent-roll/meter-readings" },
    { name: "16. Client Accounts", path: "/api/rent-roll/client-accounts" },
    { name: "17. Billing Entities", path: "/api/rent-roll/billing-entities" },
    { name: "18. Statements", path: "/api/rent-roll/statements" },
    { name: "19. Snapshots", path: "/api/rent-roll/snapshots" },
    { name: "20. Deals Pipeline", path: "/api/rent-roll/deals" },
    { name: "21. Entitlements", path: "/api/rent-roll/entitlements" },
    { name: "22. Audit Logs", path: "/api/rent-roll/audit" },
    { name: "23. Notices", path: "/api/rent-roll/notices" },
    { name: "24. Expenses", path: "/api/rent-roll/expenses" },
    { name: "25. Alerts", path: "/api/rent-roll/alerts" },
    { name: "26. Organization", path: "/api/rent-roll/organization" },
    { name: "27. Usage Metrics", path: "/api/rent-roll/usage" },
    { name: "28. Single Lease 360", path: "/api/rent-roll/leases/LEASE-APX-01" },
    { name: "29. Export Rent Roll CSV", path: "/api/rent-roll/export?type=rentroll" },
    { name: "30. Export Aging CSV", path: "/api/rent-roll/export?type=aging" },
    { name: "31. Export Invoices CSV", path: "/api/rent-roll/export?type=invoices" },
    { name: "32. Export Collections CSV", path: "/api/rent-roll/export?type=collections" },
    { name: "33. Export Escalations CSV", path: "/api/rent-roll/export?type=escalations" }
  ];

  let passed = 0;
  let failed = 0;

  for (const r of getRoutes) {
    try {
      const res = await fetch(`${baseUrl}${r.path}`);
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        let details = "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          details = Array.isArray(data) ? `${data.length} records` : `${Object.keys(data).length} keys`;
        } else {
          const txt = await res.text();
          details = `${txt.length} bytes text/csv`;
        }
        console.log(`✅ [HTTP 200] ${r.name} -> ${details}`);
        passed++;
      } else {
        console.error(`❌ [HTTP ${res.status}] ${r.name}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`❌ [ERROR] ${r.name}: ${err.message}`);
      failed++;
    }
  }

  console.log("================================================================================");
  console.log(`TOTAL ROUTES TESTED: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

verifyAllRoutes();
