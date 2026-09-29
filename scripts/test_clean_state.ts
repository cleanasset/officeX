async function testAllEmpty() {
  const eps = [
    'properties',
    'spaces',
    'tenants',
    'leases',
    'invoices',
    'collections',
    'escalations',
    'flex-centres',
    'cam-pools',
    'meter-readings',
    'statements',
    'deals',
    'notices',
    'expenses',
    'alerts'
  ];

  console.log("--------------------------------------------------");
  console.log("VERIFYING ALL RENT ROLL ENDPOINTS (ZERO SEED DATA)");
  console.log("--------------------------------------------------");

  for (const ep of eps) {
    const res = await fetch('http://localhost:3000/api/rent-roll/' + ep);
    const json = await res.json();
    const count = Array.isArray(json) ? json.length : (json.pools?.length || json.centres?.length || 0);
    console.log(`${ep.padEnd(18)} : ${count} items`);
  }

  const dashRes = await fetch('http://localhost:3000/api/rent-roll/dashboard');
  const dash = await dashRes.json();
  console.log("--------------------------------------------------");
  console.log("Dashboard KPIs (Clean State):");
  console.log(`Total Monthly Rent : ₹${dash.summary?.totalMonthlyRent || 0}`);
  console.log(`Total Leasable Area: ${dash.summary?.totalLeasableArea || 0} sq ft`);
  console.log(`Occupancy Rate     : ${dash.occupancy?.occupancyPct || 0}%`);
  console.log(`Active Leases Count: ${dash.summary?.activeLeasesCount || 0}`);
  console.log(`Total Tenants Count: ${dash.summary?.tenantsCount || 0}`);
  console.log("--------------------------------------------------");
}

testAllEmpty();
