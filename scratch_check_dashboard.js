async function checkDashboard() {
  const res = await fetch('https://office-x-cleanassets-projects.vercel.app/dashboard/owner');
  const html = await res.text();
  console.log('Dashboard HTML length:', html.length);
  const chunkRegex = /src="(\/_next\/static\/chunks\/[^"]+)"/g;
  let m;
  const chunks = [];
  while ((m = chunkRegex.exec(html)) !== null) {
    chunks.push(m[1]);
  }
  console.log('Found chunks in dashboard:', chunks.length);
  for (const c of chunks) {
    const chunkRes = await fetch('https://office-x-cleanassets-projects.vercel.app' + c);
    const text = await chunkRes.text();
    if (text.includes('Commercial Hierarchy & Lease Setup') || text.includes('Copy Tenant Invite Link') || text.includes('Step 4: Tenant / Occupant Master')) {
      console.log('FOUND Modal in chunk:', c);
      console.log('Has "Copy Tenant Invite Link":', text.includes('Copy Tenant Invite Link'));
      console.log('Has "Notice Period (Days before termination)":', text.includes('Notice Period (Days before termination)'));
      console.log('Has "officex_dismiss_manager_banner":', text.includes('officex_dismiss_manager_banner'));
      console.log('Has "Auto-populated from onboarding":', text.includes('Auto-populated from onboarding'));
    }
  }
}

checkDashboard().catch(console.error);
