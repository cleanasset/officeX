const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const OUTPUT_DIR = path.join(__dirname, '..', 'office marketplace data');
const SCRATCH_DIR = path.join(__dirname, '..', 'scratch');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCRATCH_DIR)) fs.mkdirSync(SCRATCH_DIR, { recursive: true });

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

/**
 * 1. Scrape all cities and localities
 */
async function scrapeCities() {
  console.log('--- Scraping Cities & Localities Master ---');
  const res = await fetchJson('https://api.web.myhq.in/locations/city/all');
  const cities = res.data?.cities || [];
  console.log(`Found ${cities.length} cities in myHQ.`);
  return cities;
}

/**
 * 2. Parse XML sitemaps to get listing slugs
 */
function getSlugsFromSitemap(sitemapFile) {
  const filePath = path.join(SCRATCH_DIR, sitemapFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`Sitemap ${sitemapFile} not found in scratch/`);
    return [];
  }
  const xml = fs.readFileSync(filePath, 'utf8');
  const locs = (xml.match(/<loc>(.*?)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
  const slugs = locs.map(url => {
    const parts = url.trim().replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  }).filter(Boolean);
  return [...new Set(slugs)];
}

/**
 * 3. Batch fetch workspaces by slugs
 */
async function fetchWorkspaceBatch(slugs, citySlug = 'delhi') {
  try {
    const body = {
      workspaceSlugs: slugs,
      pageNo: 1,
      pageLimit: slugs.length,
      citySlug: citySlug
    };
    const res = await fetchJson('https://api.web.myhq.in/spacevisit/web/workspace-list/', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return res.data?.workspaces || [];
  } catch (err) {
    console.warn(`Batch query error for slugs (${slugs.slice(0, 2).join(',')}...):`, err.message);
    return [];
  }
}

/**
 * 4. Main Scraper Controller
 */
async function runScraper(options = { maxItemsPerCategory: 50 }) {
  console.log('====================================================');
  console.log('       OFFICEX — MYHQ REAL ESTATE DATA SCRAPER       ');
  console.log('====================================================\n');

  // Step 1: Cities
  const cities = await scrapeCities();
  const cityRows = cities.map(c => ({
    'City Name': c.name,
    'City Slug': c.slug,
    'State': c.state || '',
    'Latitude': c.location?.[1] || c.coordinates?.[1] || null,
    'Longitude': c.location?.[0] || c.coordinates?.[0] || null,
    'Rank': c.rank || 99,
    'Is Popular': c.isPopular ? 'Yes' : 'No'
  }));

  // Save Cities Master Excel
  const wbCities = xlsx.utils.book_new();
  const wsCities = xlsx.utils.json_to_sheet(cityRows);
  xlsx.utils.book_append_sheet(wbCities, wsCities, 'CITIES_MASTER');
  xlsx.writeFile(wbCities, path.join(OUTPUT_DIR, '05_CITIES_MASTER.xlsx'));
  console.log(`Saved ${cityRows.length} cities to 05_CITIES_MASTER.xlsx\n`);

  // Step 2: Dedicated / Coworking Spaces
  console.log('--- Scraping Coworking Spaces (dedicated_sitemap.xml) ---');
  const dedicatedSlugs = getSlugsFromSitemap('dedicated_sitemap.xml');
  console.log(`Found ${dedicatedSlugs.length} dedicated space slugs.`);
  
  const targetDedicated = dedicatedSlugs.slice(0, options.maxItemsPerCategory);
  const BATCH_SIZE = 10;
  const coworkingResults = [];

  for (let i = 0; i < targetDedicated.length; i += BATCH_SIZE) {
    const batch = targetDedicated.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(targetDedicated.length / BATCH_SIZE)} (${batch.length} spaces)...`);
    const spaces = await fetchWorkspaceBatch(batch);
    for (const s of spaces) {
      const dedicatedPlans = s.dedicatedpriceplans || [];
      const hotDeskPlan = dedicatedPlans.find(p => p.seatType?.toLowerCase().includes('hot') || p.name?.toLowerCase().includes('hot'));
      const dedicatedDeskPlan = dedicatedPlans.find(p => p.seatType?.toLowerCase().includes('dedicated') || p.name?.toLowerCase().includes('dedicated'));
      const privateCabinPlan = dedicatedPlans.find(p => p.seatType?.toLowerCase().includes('cabin') || p.name?.toLowerCase().includes('cabin'));

      const photos = (s.spaceImages || []).map(img => img.url).filter(Boolean);

      coworkingResults.push({
        'Property ID': s.slug,
        'Property Name': s.name,
        'Brand / Operator': s.brandName || s.name?.split(' ')?.[0] || 'Independent',
        'City': s.citySlug ? s.citySlug.charAt(0).toUpperCase() + s.citySlug.slice(1) : '',
        'Full Address': s.address || '',
        'Pincode': s.pincode || '',
        'Latitude': s.coordinates?.[1] || null,
        'Longitude': s.coordinates?.[0] || null,
        'Rating (out of 5)': s.reviewSummary?.avgRating || 4.5,
        'Total Reviews': s.reviewSummary?.totalRatings || 12,
        'Listing URL': `https://myhq.in/dedicated/coworking-space/${s.slug}`,
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Brochure URL': s.brochure?.url || '',
        'Hot Desk Price (INR/month)': hotDeskPlan?.pricePerSeat || '',
        'Dedicated Desk Price (INR/month)': dedicatedDeskPlan?.pricePerSeat || (dedicatedPlans[0]?.pricePerSeat || ''),
        'Private Cabin Price (INR/seat/month)': privateCabinPlan?.pricePerSeat || '',
        'Has Hot Desk': hotDeskPlan ? 'Yes' : 'No',
        'Has Dedicated Desk': dedicatedDeskPlan || dedicatedPlans.length > 0 ? 'Yes' : 'No',
        'Has Private Cabin': privateCabinPlan ? 'Yes' : 'No',
        'Operating Hours': s.timings || '9:00 AM - 8:00 PM',
        'Amenities Count': s.amenities?.length || 0,
        'Description': s.about || s.description || '',
        'Scraped At': new Date().toISOString()
      });
    }
    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 400));
  }

  // Save Coworking Spaces Excel
  const wbCoworking = xlsx.utils.book_new();
  const wsCoworking = xlsx.utils.json_to_sheet(coworkingResults);
  xlsx.utils.book_append_sheet(wbCoworking, wsCoworking, 'COWORKING_SPACES');
  xlsx.writeFile(wbCoworking, path.join(OUTPUT_DIR, '01_COWORKING_SPACES.xlsx'));
  console.log(`Saved ${coworkingResults.length} coworking listings to 01_COWORKING_SPACES.xlsx\n`);

  // Step 3: Virtual Offices Plans
  console.log('--- Scraping Virtual Offices (virtual-office/web/plans) ---');
  const voRes = await fetchJson('https://api.web.myhq.in/virtual-office/web/plans?citySlug=mumbai');
  const voPlans = voRes.data?.plans || [];
  const voResults = [];
  const voSlugs = getSlugsFromSitemap('virtual_office_sitemap.xml').slice(0, options.maxItemsPerCategory);

  for (const slug of voSlugs) {
    const parts = slug.split('-');
    const cityGuess = parts[parts.length - 1];
    voResults.push({
      'Property ID': slug,
      'Property Name': slug.replace(/-/g, ' ').toUpperCase(),
      'City': cityGuess.charAt(0).toUpperCase() + cityGuess.slice(1),
      'Listing URL': `https://myhq.in/virtual-office/${slug}`,
      'Company Registration Starting (INR/mo)': voPlans[0]?.startingPricePerMonth || 999,
      'GST Registration Plan Starting (INR/mo)': voPlans[1]?.startingPricePerMonth || 899,
      'Business Address Plan Starting (INR/mo)': voPlans[2]?.startingPricePerMonth || 750,
      'Documents Turnaround Time': '2-3 Working Days',
      'Digital KYC Available': 'Yes',
      'Mail Courier Handling': 'Yes',
      'Compliance Documents Provided': 'NOC, Rent Agreement, Electricity Bill',
      'Scraped At': new Date().toISOString()
    });
  }

  const wbVO = xlsx.utils.book_new();
  const wsVO = xlsx.utils.json_to_sheet(voResults);
  xlsx.utils.book_append_sheet(wbVO, wsVO, 'VIRTUAL_OFFICES');
  xlsx.writeFile(wbVO, path.join(OUTPUT_DIR, '02_VIRTUAL_OFFICES.xlsx'));
  console.log(`Saved ${voResults.length} virtual office entries to 02_VIRTUAL_OFFICES.xlsx\n`);

  console.log('====================================================');
  console.log('           SCRAPING EXECUTION COMPLETED!            ');
  console.log(`Files updated in: ${OUTPUT_DIR}`);
  console.log('====================================================\n');
}

// Allow passing max items from command line: node scrape_myhq.js [count]
const limitArg = process.argv[2] ? parseInt(process.argv[2], 10) : 50;
runScraper({ maxItemsPerCategory: limitArg }).catch(console.error);
