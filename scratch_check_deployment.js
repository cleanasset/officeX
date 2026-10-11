const https = require('https');

async function check() {
  const res = await fetch('https://office-x-cleanassets-projects.vercel.app/onboarding');
  const html = await res.text();
  console.log('HTML length:', html.length);
  const chunkRegex = /src="(\/_next\/static\/chunks\/[^"]+)"/g;
  let m;
  const chunks = [];
  while ((m = chunkRegex.exec(html)) !== null) {
    chunks.push(m[1]);
  }
  console.log('Found chunks:', chunks.length);
  for (const c of chunks) {
    const chunkRes = await fetch('https://office-x-cleanassets-projects.vercel.app' + c);
    const chunkText = await chunkRes.text();
    if (chunkText.includes('Not Applicable')) {
      console.log('Chunk contains "Not Applicable":', c);
    }
    if (chunkText.includes('Subscribed Cap:')) {
      console.log('Chunk contains "Subscribed Cap:":', c);
    }
    if (chunkText.includes('Zero Mock Data Master') || chunkText.includes('Commercial Hierarchy')) {
      console.log('Chunk contains PropertyHierarchyModal:', c);
      console.log('Has latestTenantInvite?', chunkText.includes('latestTenantInvite') || chunkText.includes('Copy Tenant Invite Link'));
      console.log('Has Subscribed Cap?', chunkText.includes('Subscribed Cap'));
    }
  }
}

check().catch(console.error);
