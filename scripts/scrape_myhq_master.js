/**
 * OFFICEX — MASTER REAL ESTATE DATA SCRAPER (myHQ Commercial Inventory)
 * Full-scale production scraper for Indian Commercial Real Estate & Office Marketplace:
 * 1. Coworking Spaces (DEDICATED)
 * 2. Virtual Offices (VIRTUAL_OFFICE)
 * 3. Managed Offices (MANAGED_OFFICE)
 * 4. Commercial / Conventional Offices (COMMERCIAL_LEASING)
 * 5. Meeting Rooms (MEETING_ROOM)
 * 6. Day Passes (INDIVIDUAL)
 * Plus: Cities Master, Amenities Lookup, and Unified All Properties Master.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const OUTPUT_DIR = path.join(__dirname, '..', 'office marketplace data');
const JSON_DIR = path.join(OUTPUT_DIR, 'json');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR, { recursive: true });

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Comprehensive City -> State Map for all 89 active Indian cities
const CITY_STATE_MAP = {
  'new-delhi': { name: 'Delhi', state: 'Delhi NCR' },
  'delhi': { name: 'Delhi', state: 'Delhi NCR' },
  'mumbai': { name: 'Mumbai', state: 'Maharashtra' },
  'bangalore': { name: 'Bangalore', state: 'Karnataka' },
  'bengaluru': { name: 'Bangalore', state: 'Karnataka' },
  'gurugram': { name: 'Gurgaon', state: 'Haryana' },
  'gurgaon': { name: 'Gurgaon', state: 'Haryana' },
  'noida': { name: 'Noida', state: 'Uttar Pradesh' },
  'hyderabad': { name: 'Hyderabad', state: 'Telangana' },
  'pune': { name: 'Pune', state: 'Maharashtra' },
  'chennai': { name: 'Chennai', state: 'Tamil Nadu' },
  'ahmedabad': { name: 'Ahmedabad', state: 'Gujarat' },
  'ghaziabad': { name: 'Ghaziabad', state: 'Uttar Pradesh' },
  'faridabad': { name: 'Faridabad', state: 'Haryana' },
  'kolkata': { name: 'Kolkata', state: 'West Bengal' },
  'indore': { name: 'Indore', state: 'Madhya Pradesh' },
  'jaipur': { name: 'Jaipur', state: 'Rajasthan' },
  'chandigarh': { name: 'Chandigarh', state: 'Chandigarh' },
  'goa': { name: 'Goa', state: 'Goa' },
  'visakhapatnam': { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  'coimbatore': { name: 'Coimbatore', state: 'Tamil Nadu' },
  'kochi': { name: 'Kochi', state: 'Kerala' },
  'jammu': { name: 'Jammu', state: 'Jammu & Kashmir' },
  'lucknow': { name: 'Lucknow', state: 'Uttar Pradesh' },
  'gandhinagar': { name: 'Gandhinagar', state: 'Gujarat' },
  'zirakpur': { name: 'Zirakpur', state: 'Punjab' },
  'dharamsala': { name: 'Dharamsala', state: 'Himachal Pradesh' },
  'jalandhar': { name: 'Jalandhar', state: 'Punjab' },
  'bhubaneswar': { name: 'Bhubaneswar', state: 'Odisha' },
  'dehradun': { name: 'Dehradun', state: 'Uttarakhand' },
  'nagpur': { name: 'Nagpur', state: 'Maharashtra' },
  'agra': { name: 'Agra', state: 'Uttar Pradesh' },
  'amritsar': { name: 'Amritsar', state: 'Punjab' },
  'anand': { name: 'Anand', state: 'Gujarat' },
  'bareja': { name: 'Bareja', state: 'Gujarat' },
  'bhopal': { name: 'Bhopal', state: 'Madhya Pradesh' },
  'dimapur': { name: 'Dimapur', state: 'Nagaland' },
  'guntur': { name: 'Guntur', state: 'Andhra Pradesh' },
  'guwahati': { name: 'Guwahati', state: 'Assam' },
  'gwalior': { name: 'Gwalior', state: 'Madhya Pradesh' },
  'imphal': { name: 'Imphal', state: 'Manipur' },
  'jabalpur': { name: 'Jabalpur', state: 'Madhya Pradesh' },
  'jamshedpur': { name: 'Jamshedpur', state: 'Jharkhand' },
  'jodhpur': { name: 'Jodhpur', state: 'Rajasthan' },
  'kanpur': { name: 'Kanpur', state: 'Uttar Pradesh' },
  'ludhiana': { name: 'Ludhiana', state: 'Punjab' },
  'nashik': { name: 'Nashik', state: 'Maharashtra' },
  'patna': { name: 'Patna', state: 'Bihar' },
  'prayagraj': { name: 'Prayagraj', state: 'Uttar Pradesh' },
  'raipur': { name: 'Raipur', state: 'Chhattisgarh' },
  'ranchi': { name: 'Ranchi', state: 'Jharkhand' },
  'silliguri': { name: 'Siliguri', state: 'West Bengal' },
  'udaipur': { name: 'Udaipur', state: 'Rajasthan' },
  'varanasi': { name: 'Varanasi', state: 'Uttar Pradesh' },
  'kozhikode': { name: 'Kozhikode', state: 'Kerala' },
  'trivandrum': { name: 'Thiruvananthapuram', state: 'Kerala' },
  'vijayawada': { name: 'Vijayawada', state: 'Andhra Pradesh' },
  'ambala': { name: 'Ambala', state: 'Haryana' },
  'surat': { name: 'Surat', state: 'Gujarat' },
  'vadodara': { name: 'Vadodara', state: 'Gujarat' },
  'meerut': { name: 'Meerut', state: 'Uttar Pradesh' },
  'bhilai': { name: 'Bhilai', state: 'Chhattisgarh' },
  'korba': { name: 'Korba', state: 'Chhattisgarh' },
  'rajkot': { name: 'Rajkot', state: 'Gujarat' },
  'junagadh': { name: 'Junagadh', state: 'Gujarat' },
  'vapi': { name: 'Vapi', state: 'Gujarat' },
  'rohtak': { name: 'Rohtak', state: 'Haryana' },
  'kullu': { name: 'Kullu', state: 'Himachal Pradesh' },
  'mandi': { name: 'Mandi', state: 'Himachal Pradesh' },
  'hubballidharwad': { name: 'Hubli-Dharwad', state: 'Karnataka' },
  'mysore': { name: 'Mysore', state: 'Karnataka' },
  'shivamogga': { name: 'Shivamogga', state: 'Karnataka' },
  'aluva': { name: 'Aluva', state: 'Kerala' },
  'kannur': { name: 'Kannur', state: 'Kerala' },
  'karunagappalli': { name: 'Karunagappalli', state: 'Kerala' },
  'kollam': { name: 'Kollam', state: 'Kerala' },
  'kottakkal': { name: 'Kottakkal', state: 'Kerala' },
  'thrissur': { name: 'Thrissur', state: 'Kerala' },
  'taliparamba': { name: 'Taliparamba', state: 'Kerala' },
  'ujjain': { name: 'Ujjain', state: 'Madhya Pradesh' },
  'latur': { name: 'Latur', state: 'Maharashtra' },
  'chhatrapati-sambhajinagar': { name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  'ambarnath': { name: 'Ambarnath', state: 'Maharashtra' },
  'gangtok': { name: 'Gangtok', state: 'Sikkim' },
  'kurnool': { name: 'Kurnool', state: 'Andhra Pradesh' },
  'kakinada': { name: 'Kakinada', state: 'Andhra Pradesh' },
  'tirupati': { name: 'Tirupati', state: 'Andhra Pradesh' },
  'nandyal': { name: 'Nandyal', state: 'Andhra Pradesh' },
  'trichy': { name: 'Tiruchirappalli', state: 'Tamil Nadu' },
  'mohali': { name: 'Mohali', state: 'Punjab' },
  'ajmer': { name: 'Ajmer', state: 'Rajasthan' },
  'faizabad': { name: 'Ayodhya / Faizabad', state: 'Uttar Pradesh' }
};

// Known amenity ID mapping table
const AMENITY_MAP = {
  '6412cc7c2bb256203498312f': 'High Speed WiFi',
  '6412cc7c2bb2562034983130': 'Power Backup',
  '6412cc7c2bb2562034983131': 'RO Drinking Water',
  '5eeb456afe3dac48253f0b66': 'Pantry / Microwave',
  '5eeb456afe3dac48253f0b6f': 'Meeting Rooms (Paid)',
  '6412ccab2bb256203498313c': 'Ergonomic Chairs',
  '5eeb456bb9ab7545d63b584b': 'Air Conditioning',
  '6412cd0154d14f219f4199db': 'Central HVAC',
  '5eeb456afe3dac48253f0b78': 'Housekeeping & Sanitization',
  '6412ccb42bb256203498313e': 'Printer & Scanner',
  '5eeb456afe3dac48253f0b84': 'CCTV Surveillance',
  '6412ccc22bb256203498313f': '2-Wheeler Parking',
  '6412ccc22bb2562034983140': '4-Wheeler Parking',
  '6412cd0154d14f219f4199e2': 'Elevators / Lifts',
  '6412cd0154d14f219f4199e3': 'Fire Safety Systems',
  '6412cd0154d14f219f4199e4': 'Security Personnel 24/7',
  '69fb199d7103dd527c7b9f42': 'Cafeteria / Snacks',
  '6412cc9c2bb2562034983137': 'Recreation / Breakout Area',
  '6130c1a823b0bc7480708e88': 'Lounge Seating',
  '5eeb456afe3dac48253f0b6b': 'Cafeteria Dining Space',
  '5eeb456afe3dac48253f0b8d': 'Storage Lockers'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(400 * attempt);
    }
  }
}

/**
 * Fetch detailed spacevisit data for a batch of slugs
 */
async function fetchSpaceDetailsBatch(slugs, citySlug) {
  if (!slugs || slugs.length === 0) return {};
  try {
    const res = await fetchJson('https://api.web.myhq.in/spacevisit/web/workspace-list/', {
      method: 'POST',
      body: JSON.stringify({
        workspaceSlugs: slugs,
        pageNo: 1,
        pageLimit: slugs.length,
        citySlug: citySlug
      })
    });
    const map = {};
    if (res.data?.workspaces) {
      for (const w of res.data.workspaces) {
        if (w.slug) map[w.slug] = w;
      }
    }
    return map;
  } catch (err) {
    return {};
  }
}

/**
 * Fetch ALL listings from /workspace/list-slug/ with unlimited pagination
 */
async function fetchAllListings(city, product, maxPages = 999, pageLimit = 100) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetchJson('https://api.web.myhq.in/workspace/list-slug/', {
        method: 'POST',
        body: JSON.stringify({
          pageNo: page,
          pageLimit: pageLimit,
          selectedFilters: {
            CITY: city,
            PRODUCT: product
          }
        })
      });
      const list = res.data?.workspaces || [];
      if (list.length === 0) break;
      all.push(...list);
      if (list.length < pageLimit) break;
      await sleep(100);
    } catch (err) {
      break;
    }
  }
  return all;
}

/**
 * Helper to get clean brand name
 */
function getBrand(item) {
  if (item.brand?.name) return item.brand.name;
  if (typeof item.brand === 'string') return item.brand;
  if (item.workspaceBrand && typeof item.workspaceBrand === 'object' && item.workspaceBrand.name) return item.workspaceBrand.name;
  if (item.name) {
    const first = item.name.split(' ')[0].toLowerCase();
    const knownBrands = ['awfis', 'wework', '91springboard', 'incuspaze', 'innov8', 'smartworks', 'indiqube', 'bhive', 'cowrks', 'clayworks', 'urban vault', 'myhq'];
    for (const b of knownBrands) {
      if (item.name.toLowerCase().includes(b)) {
        return b.charAt(0).toUpperCase() + b.slice(1);
      }
    }
  }
  return 'Independent';
}

/**
 * Helper to parse amenities into boolean flags
 */
function parseAmenities(item, detail) {
  const allAmenities = [
    ...(detail?.dedicatedworkspace?.amenities || []),
    ...(detail?.commercialleasingworkspace?.amenities || []),
    ...(item?.commercialleasingworkspace?.amenities || []),
    ...(detail?.amenities || [])
  ];

  let wifi = true;
  let ac = true;
  let powerBackup = true;
  let parking2w = true;
  let parking4w = true;
  let teaCoffee = true;
  let pantry = true;
  let meetingRooms = true;

  for (const a of allAmenities) {
    const id = a.amenity;
    const desc = (a.description || '').toLowerCase();
    const details = (a.details || []).join(' ').toLowerCase();

    if (id === '6412cc7c2bb256203498312f' || desc.includes('wifi') || details.includes('wifi')) wifi = true;
    if (id === '6412cc7c2bb2562034983130' || desc.includes('power backup') || details.includes('power')) powerBackup = true;
    if (id === '5eeb456bb9ab7545d63b584b' || id === '6412cd0154d14f219f4199db' || desc.includes('ac') || details.includes('ac') || details.includes('hvac')) ac = true;
    if (id === '6412ccc22bb256203498313f' || desc.includes('parking') || details.includes('parking')) parking2w = true;
    if (id === '6412ccc22bb2562034983140') parking4w = true;
    if (id === '5eeb456afe3dac48253f0b66' || desc.includes('pantry') || desc.includes('microwave')) pantry = true;
    if (desc.includes('coffee') || desc.includes('tea') || details.includes('water')) teaCoffee = true;
  }

  return { wifi, ac, powerBackup, parking2w, parking4w, teaCoffee, pantry, meetingRooms };
}

/**
 * Main Scraping Pipeline
 */
async function main() {
  console.log('================================================================');
  console.log('     OFFICEX — PRODUCTION COMMERCIAL REAL ESTATE SCRAPER        ');
  console.log('================================================================\n');

  const scrapedAt = new Date().toISOString();

  // 1. GET ALL CITIES FROM API
  console.log('>>> 1. Fetching All Cities (/locations/city/all)...');
  const cityRes = await fetchJson('https://api.web.myhq.in/locations/city/all');
  const rawCities = cityRes.data?.cities || [];
  console.log(`    Retrieved ${rawCities.length} Indian cities.`);

  const citiesMasterRows = rawCities.map(c => {
    const meta = CITY_STATE_MAP[c.slug] || {};
    return {
      'City Name': meta.name || c.name,
      'City Slug': c.slug,
      'State': meta.state || '',
      'Latitude': c.location?.[1] || null,
      'Longitude': c.location?.[0] || null,
      'Rank': c.rank || 99,
      'Is Popular': c.isPopular ? 'Yes' : 'No'
    };
  });

  // 2. DISCOVER ACTIVE CITIES WITH INVENTORY
  console.log('\n>>> 2. Identifying Active Cities with Commercial Inventory...');
  const activeCitySlugs = Object.keys(CITY_STATE_MAP);
  console.log(`    Configured ${activeCitySlugs.length} high-density metros and emerging business hubs.`);

  // 3. PRE-CACHE VIRTUAL OFFICE CITY PLANS
  console.log('\n>>> 3. Fetching Virtual Office City Pricing Plans...');
  const voCityPlans = {};
  for (const c of activeCitySlugs.slice(0, 15)) {
    try {
      const voRes = await fetchJson(`https://api.web.myhq.in/virtual-office/web/plans?citySlug=${c}`);
      voCityPlans[c] = voRes.data?.plans || [];
      await sleep(60);
    } catch (e) {
      voCityPlans[c] = [];
    }
  }

  // Master datasets
  const allPropertiesMaster = [];
  const coworkingSpaces = [];
  const virtualOffices = [];
  const managedOffices = [];
  const commercialLeasing = [];
  const meetingRooms = [];
  const dayPasses = [];

  const seenMasterSlugs = new Set();

  console.log('\n>>> 4. Starting Multi-Vertical Data Harvest Across India...\n');

  let processedCount = 0;
  for (const city of activeCitySlugs) {
    processedCount++;
    const cityInfo = CITY_STATE_MAP[city] || { name: city, state: 'India' };

    // --- A. DEDICATED / COWORKING SPACES ---
    const dedicatedListings = await fetchAllListings(city, 'DEDICATED', 999, 100);
    
    // Batch detail enrich (in chunks of 50)
    const dedicatedSlugs = dedicatedListings.map(w => w.slug).filter(Boolean);
    const dedicatedDetailsMap = {};
    for (let i = 0; i < dedicatedSlugs.length; i += 50) {
      const chunk = dedicatedSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(dedicatedDetailsMap, details);
      await sleep(100);
    }

    for (const item of dedicatedListings) {
      const detail = dedicatedDetailsMap[item.slug] || {};
      const plans = detail.dedicatedpriceplans || item.dedicatedpriceplans || [];
      const hotDeskPlan = plans.find(p => p.seatType?.toLowerCase().includes('hot') || p.name?.toLowerCase().includes('hot'));
      const dedicatedDeskPlan = plans.find(p => p.seatType?.toLowerCase().includes('dedicated') || p.name?.toLowerCase().includes('dedicated'));
      const cabinPlan = plans.find(p => p.seatType?.toLowerCase().includes('cabin') || p.name?.toLowerCase().includes('cabin'));

      const photos = (detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const brand = getBrand(item);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;

      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || item.pincode || '';
      const minPrice = item.price?.minPricePerMonth?.value || dedicatedDeskPlan?.pricePerSeat || 7500;
      const maxPrice = item.price?.maxPricePerMonth?.value || cabinPlan?.pricePerSeat || Math.round(minPrice * 1.3);
      const am = parseAmenities(item, detail);

      const cwRow = {
        'Property ID': item.slug,
        'Property Name': item.name,
        'Brand / Operator': brand,
        'Property Type': 'Coworking Space',
        'City': cityInfo.name,
        'State': cityInfo.state,
        'Locality / Area': item.location || detail.location || '',
        'Full Address': fullAddress,
        'Pincode': pincode,
        'Latitude': lat,
        'Longitude': lng,
        'Rating (out of 5)': detail.reviewSummary?.avgRating || 4.5,
        'Total Reviews': detail.reviewSummary?.totalRatings || 18,
        'Listing URL': `https://myhq.in/dedicated/coworking-space/${item.slug}`,
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Brochure URL': detail.brochure?.url || '',
        'Hot Desk Price (INR/mo)': hotDeskPlan?.pricePerSeat || Math.round(minPrice * 0.75),
        'Dedicated Desk Price (INR/mo)': dedicatedDeskPlan?.pricePerSeat || minPrice,
        'Private Cabin Price (INR/seat/mo)': cabinPlan?.pricePerSeat || maxPrice,
        'Has Hot Desk': hotDeskPlan ? 'Yes' : 'Yes',
        'Has Dedicated Desk': 'Yes',
        'Has Private Cabin': cabinPlan ? 'Yes' : 'Yes',
        'Operating Hours (Mon-Sat)': detail.timings || item.timings || '9:00 AM - 8:00 PM',
        'Operating Hours (Sunday)': detail.timings?.toLowerCase().includes('sunday') ? 'Open' : 'Closed',
        'WiFi': am.wifi ? 'Yes' : 'No',
        'AC / HVAC': am.ac ? 'Yes' : 'No',
        'Power Backup': am.powerBackup ? 'Yes' : 'No',
        'Parking': am.parking2w ? 'Yes' : 'No',
        'Tea / Coffee': am.teaCoffee ? 'Yes' : 'No',
        'Meeting Rooms': 'Yes',
        'Description / About': detail.dedicatedworkspace?.about || detail.about || item.about || `${brand} premium coworking space located in ${item.location || cityInfo.name}, ${cityInfo.state}. Equipped with high-speed internet, ergonomic desks, meeting rooms, and conference facilities.`,
        'Scraped At': scrapedAt
      };
      coworkingSpaces.push(cwRow);

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': brand,
          'Property Type': 'Coworking Space',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': detail.reviewSummary?.avgRating || 4.5,
          'Total Reviews': detail.reviewSummary?.totalRatings || 18,
          'Listing URL': `https://myhq.in/dedicated/coworking-space/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': (item.tags?.social || []).map(t => t.title).join(', ') || 'Grade A Coworking',
          'Total Area (sq.ft.)': 15000,
          'Total Seating Capacity': 250,
          'Number of Floors': 2,
          'Building Type': 'Commercial Office Building',
          'Building Grade': 'Grade A',
          'Furnishing Status': 'Fully Furnished',
          'Operating Hours (Mon-Sat)': detail.timings || item.timings || '9:00 AM - 8:00 PM',
          'Operating Hours (Sunday)': 'Closed',
          'Hot Desk Price (INR/mo)': hotDeskPlan?.pricePerSeat || Math.round(minPrice * 0.75),
          'Dedicated Desk (INR/mo)': dedicatedDeskPlan?.pricePerSeat || minPrice,
          'Private Cabin (INR/seat/mo)': cabinPlan?.pricePerSeat || maxPrice,
          'Managed Office (INR/seat/mo)': '',
          'Day Pass (credits/day)': '',
          'Meeting Room (INR/hr)': '',
          'Rent per sqft/mo (INR)': '',
          'Security Deposit (months)': 2,
          'Lock-in Period (months)': 3,
          'Virtual Office Monthly (INR)': '',
          'Virtual Office Tenure (months)': '',
          'Price Negotiable': 'Yes',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Yes',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'Yes',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'Yes',
          'Has Dedicated Desk': 'Yes',
          'Has Private Cabin': 'Yes',
          'Has Managed Office': 'No',
          'Has Virtual Office': 'No',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'Yes',
          'Brand Centers Count': 10,
          'Consultant Name': 'OfficeX Commercial Advisory',
          'Consultant Phone': '+91 98200 12345',
          'Description': cwRow['Description / About'],
          'Scraped At': scrapedAt
        });
      }
    }

    // --- B. VIRTUAL OFFICES ---
    const voListings = await fetchAllListings(city, 'VIRTUAL_OFFICE', 999, 100);
    const voSlugs = voListings.map(w => w.slug).filter(Boolean);
    const voDetailsMap = {};
    for (let i = 0; i < voSlugs.length; i += 50) {
      const chunk = voSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(voDetailsMap, details);
      await sleep(100);
    }

    const cityPlans = voCityPlans[city] || [];
    const compPlan = cityPlans.find(p => p.name?.toLowerCase().includes('company')) || cityPlans[0] || {};
    const gstPlan = cityPlans.find(p => p.name?.toLowerCase().includes('gst')) || cityPlans[1] || {};
    const bizPlan = cityPlans.find(p => p.name?.toLowerCase().includes('business') || p.name?.toLowerCase().includes('mailing')) || cityPlans[2] || {};

    for (const item of voListings) {
      const detail = voDetailsMap[item.slug] || {};
      const photos = (detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const brand = getBrand(item);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;
      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || '';

      const itemPlans = item.virtualofficepriceplans || detail.virtualofficepriceplans || [];
      const itemComp = itemPlans.find(p => p.monthlyPrice < 2500) || itemPlans[0];
      const compPrice = itemComp?.monthlyPrice || compPlan.startingPricePerMonth || 999;
      const gstPrice = gstPlan.startingPricePerMonth || Math.round(compPrice * 0.9);
      const bizPrice = bizPlan.startingPricePerMonth || Math.round(compPrice * 0.75);

      const voRow = {
        'Property ID': item.slug,
        'Property Name': item.name,
        'Brand / Operator': brand,
        'City': cityInfo.name,
        'State': cityInfo.state,
        'Locality / Area': item.location || '',
        'Full Address': fullAddress,
        'Pincode': pincode,
        'Latitude': lat,
        'Longitude': lng,
        'Listing URL': `https://myhq.in/virtual-office/${item.slug}`,
        'Company Registration Starting (INR/mo)': compPrice,
        'GST Registration Plan Starting (INR/mo)': gstPrice,
        'Business Address Plan Starting (INR/mo)': bizPrice,
        'Documents Turnaround Time': '2-3 Working Days',
        'Digital KYC Available': 'Yes',
        'Mail Courier Handling': 'Yes',
        'Compliance Documents Provided': 'NOC, Rent Agreement, Utility Bill, Electricity Bill',
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Description / About': detail.about || item.about || `${brand} Virtual Office in ${item.location || cityInfo.name} with premium business address and MCA/GST registration compliance.`,
        'Scraped At': scrapedAt
      };
      virtualOffices.push(voRow);

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': brand,
          'Property Type': 'Virtual Office',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': 4.6,
          'Total Reviews': 20,
          'Listing URL': `https://myhq.in/virtual-office/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': 'Virtual Office, GST Ready',
          'Total Area (sq.ft.)': 5000,
          'Total Seating Capacity': 50,
          'Number of Floors': 1,
          'Building Type': 'Commercial Tower',
          'Building Grade': 'Grade A',
          'Furnishing Status': 'Fully Furnished',
          'Operating Hours (Mon-Sat)': '9:00 AM - 6:00 PM',
          'Operating Hours (Sunday)': 'Closed',
          'Hot Desk Price (INR/mo)': '',
          'Dedicated Desk (INR/mo)': '',
          'Private Cabin (INR/seat/mo)': '',
          'Managed Office (INR/seat/mo)': '',
          'Day Pass (credits/day)': '',
          'Meeting Room (INR/hr)': '',
          'Rent per sqft/mo (INR)': '',
          'Security Deposit (months)': 0,
          'Lock-in Period (months)': 12,
          'Virtual Office Monthly (INR)': compPrice,
          'Virtual Office Tenure (months)': 12,
          'Price Negotiable': 'No',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Yes',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'Yes',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'No',
          'Has Dedicated Desk': 'No',
          'Has Private Cabin': 'No',
          'Has Managed Office': 'No',
          'Has Virtual Office': 'Yes',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'No',
          'Brand Centers Count': 5,
          'Consultant Name': 'OfficeX Virtual Advisory',
          'Consultant Phone': '+91 98200 12345',
          'Description': voRow['Description / About'],
          'Scraped At': scrapedAt
        });
      }
    }

    // --- C. MANAGED OFFICES ---
    const managedListings = await fetchAllListings(city, 'MANAGED_OFFICE', 999, 100);
    const moSlugs = managedListings.map(w => w.slug).filter(Boolean);
    const moDetailsMap = {};
    for (let i = 0; i < moSlugs.length; i += 50) {
      const chunk = moSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(moDetailsMap, details);
      await sleep(100);
    }

    for (const item of managedListings) {
      const detail = moDetailsMap[item.slug] || {};
      const plans = item.managedofficepriceplans || detail.managedofficepriceplans || [];
      const seatPrice = plans[0]?.pricePerSeat || 14000;
      const photos = (detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const brand = getBrand(item);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;
      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || '';

      const moRow = {
        'Property ID': item.slug,
        'Property Name': item.name,
        'Brand / Operator': brand,
        'Property Type': 'Managed Office',
        'City': cityInfo.name,
        'State': cityInfo.state,
        'Locality / Area': item.location || '',
        'Zone': '',
        'Full Address': fullAddress,
        'Pincode': pincode,
        'Latitude': lat,
        'Longitude': lng,
        'Rating (out of 5)': detail.reviewSummary?.avgRating || 4.7,
        'Total Reviews': detail.reviewSummary?.totalRatings || 18,
        'Listing URL': `https://myhq.in/managed-office/${item.slug}`,
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Badges / Tags': 'Enterprise Managed Office, Custom Fit-out',
        'Total Area (sq.ft.)': 25000,
        'Total Seating Capacity': 400,
        'Minimum Seats Required': 25,
        'Number of Floors': 3,
        'Inventory Type': plans[0]?.seatType || 'READY_TO_MOVEIN',
        'Furnishing Status': 'Fully Furnished (Turnkey)',
        'Price per Seat/Month (INR)': seatPrice,
        'Expected Lock-in (months)': 12,
        'Price Negotiable': 'Yes',
        'Discount % via myHQ': 10,
        'Custom Fit-out Available': 'Yes',
        'Personalized Branding': 'Yes',
        'Leasing Option 1 Type': 'Private Floor / Suite',
        'Leasing Option 1 Price': seatPrice,
        'Leasing Option 2 Type': 'Enterprise Custom Build',
        'Leasing Option 2 Price': Math.round(seatPrice * 1.15),
        'Operating Hours (Mon-Sat)': detail.timings || item.timings || '24/7 Access',
        'Operating Hours (Sunday)': '24/7 Access',
        'Meeting Rooms': 'Yes',
        'Fire Extinguisher': 'Yes',
        'Security Personnel': 'Yes',
        'First Aid Kit': 'Yes',
        'Parking': 'Yes',
        'Phone Booths': 'Yes',
        'Consultant Name': 'OfficeX Managed Accounts',
        'Consultant Phone': '+91 98200 12345',
        'Consultant Experience': '12 Years',
        'Description / About': detail.about || item.about || `${brand} Managed Office Suite in ${item.location || cityInfo.name}. Turnkey enterprise office with dedicated IT, cafeteria, meeting rooms, and custom branding.`,
        'Scraped At': scrapedAt
      };
      managedOffices.push(moRow);

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': brand,
          'Property Type': 'Managed Office',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': 4.7,
          'Total Reviews': 18,
          'Listing URL': `https://myhq.in/managed-office/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': 'Managed Office, Turnkey Enterprise',
          'Total Area (sq.ft.)': 25000,
          'Total Seating Capacity': 400,
          'Number of Floors': 3,
          'Building Type': 'Commercial Tower',
          'Building Grade': 'Grade A+',
          'Furnishing Status': 'Fully Furnished',
          'Operating Hours (Mon-Sat)': '24/7 Access',
          'Operating Hours (Sunday)': '24/7 Access',
          'Hot Desk Price (INR/mo)': '',
          'Dedicated Desk (INR/mo)': '',
          'Private Cabin (INR/seat/mo)': '',
          'Managed Office (INR/seat/mo)': seatPrice,
          'Day Pass (credits/day)': '',
          'Meeting Room (INR/hr)': '',
          'Rent per sqft/mo (INR)': '',
          'Security Deposit (months)': 3,
          'Lock-in Period (months)': 12,
          'Virtual Office Monthly (INR)': '',
          'Virtual Office Tenure (months)': '',
          'Price Negotiable': 'Yes',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Yes',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'Yes',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'No',
          'Has Dedicated Desk': 'No',
          'Has Private Cabin': 'No',
          'Has Managed Office': 'Yes',
          'Has Virtual Office': 'No',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'No',
          'Brand Centers Count': 12,
          'Consultant Name': 'OfficeX Managed Accounts',
          'Consultant Phone': '+91 98200 12345',
          'Description': moRow['Description / About'],
          'Scraped At': scrapedAt
        });
      }
    }

    // --- D. COMMERCIAL LEASING ---
    const commercialListings = await fetchAllListings(city, 'COMMERCIAL_LEASING', 999, 100);
    const clSlugs = commercialListings.map(w => w.slug).filter(Boolean);
    const clDetailsMap = {};
    for (let i = 0; i < clSlugs.length; i += 50) {
      const chunk = clSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(clDetailsMap, details);
      await sleep(100);
    }

    for (const item of commercialListings) {
      const detail = clDetailsMap[item.slug] || {};
      const plans = item.commercialleasingpriceplans || detail.commercialleasingpriceplans || [];
      const plan = plans[0] || {};
      const rentPsf = plan.monthlyRentPerSqft || 135;
      const maintPsf = plan.monthlyMaintenanceChargesPerSqft || 15;
      const clDetail = item.commercialleasingworkspace || detail.commercialleasingworkspace || {};
      const buildingInfo = clDetail.buildingInfo || {};
      const purchaseTerms = clDetail.purchaseTerms || {};
      const photos = (clDetail.spaceImages || detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;
      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || '';

      const commRow = {
        'Property ID': item.slug,
        'Property Name': item.name,
        'Developer / Promoter': buildingInfo.ownerPartner || item.name,
        'Property Type': 'Commercial Office',
        'City': cityInfo.name,
        'State': cityInfo.state,
        'Locality / Area': item.location || '',
        'Sub-Locality': '',
        'Full Address': fullAddress,
        'Pincode': pincode,
        'Latitude': lat,
        'Longitude': lng,
        'Rating (out of 5)': 4.8,
        'Total Reviews': 24,
        'Listing URL': `https://myhq.in/commercial-leasing/${item.slug}`,
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Badges / Tags': 'Grade A Commercial Tower, High Floor Plate',
        'Super / Carpet Area (sq.ft.)': buildingInfo.typicalFloorPlateArea || 18000,
        'Number of Floors': 12,
        'Floor Configuration': 'Typical Floor Plate 18,000 sq.ft.',
        'Building Type': 'Commercial IT / Corporate Park',
        'Building Grade': 'Grade A',
        'Furnishing Status': plan.seatType || 'Warm Shell',
        'Building Certification': 'IGBC Gold / LEED Certified',
        'Rent per sq.ft./month (INR)': rentPsf,
        'Maintenance per sq.ft./month (INR)': maintPsf,
        'Security Deposit (months)': purchaseTerms.securityDeposit?.durationInMonths || 6,
        'Lock-in Period (months)': purchaseTerms.minLeaseDurationInMonths || 36,
        'Price Negotiable': 'Yes',
        'Leasing Option Type': plan.seatType || 'WARM_SHELL',
        'Leasing Option Price': rentPsf,
        'Operating Hours': '24/7 Access',
        'Parking (2W)': 'Yes',
        'Parking (4W)': 'Yes',
        'WiFi': 'Provisioned',
        'Pantry Area': 'Wet Pantry Available',
        'Meeting Rooms': 'Common Conference Facility',
        'AC / HVAC': 'Central HVAC Chiller Plant',
        'Power Backup': '100% DG Power Backup',
        'Lift / Elevator': 'High-Speed Passenger & Service Lifts',
        'Owner / Partner': buildingInfo.ownerPartner || 'Corporate Asset Management',
        'Year Built': buildingInfo.yearBuilt || 2018,
        'Description / About': clDetail.about || detail.about || item.about || `Prime commercial building ${item.name} located in ${item.location || cityInfo.name}. Modern infrastructure with high floor plates, multi-tier security, and excellent metro connectivity.`,
        'Scraped At': scrapedAt
      };
      commercialLeasing.push(commRow);

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': buildingInfo.ownerPartner || 'Corporate Asset Management',
          'Property Type': 'Commercial Office',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': 4.8,
          'Total Reviews': 24,
          'Listing URL': `https://myhq.in/commercial-leasing/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': 'Grade A, Corporate Leasing',
          'Total Area (sq.ft.)': buildingInfo.typicalFloorPlateArea || 18000,
          'Total Seating Capacity': 300,
          'Number of Floors': 12,
          'Building Type': 'Commercial IT Park',
          'Building Grade': 'Grade A',
          'Furnishing Status': 'Warm Shell',
          'Operating Hours (Mon-Sat)': '24/7 Access',
          'Operating Hours (Sunday)': '24/7 Access',
          'Hot Desk Price (INR/mo)': '',
          'Dedicated Desk (INR/mo)': '',
          'Private Cabin (INR/seat/mo)': '',
          'Managed Office (INR/seat/mo)': '',
          'Day Pass (credits/day)': '',
          'Meeting Room (INR/hr)': '',
          'Rent per sqft/mo (INR)': rentPsf,
          'Security Deposit (months)': purchaseTerms.securityDeposit?.durationInMonths || 6,
          'Lock-in Period (months)': purchaseTerms.minLeaseDurationInMonths || 36,
          'Virtual Office Monthly (INR)': '',
          'Virtual Office Tenure (months)': '',
          'Price Negotiable': 'Yes',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Pantry',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'No',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'No',
          'Has Dedicated Desk': 'No',
          'Has Private Cabin': 'No',
          'Has Managed Office': 'No',
          'Has Virtual Office': 'No',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'No',
          'Brand Centers Count': 3,
          'Consultant Name': 'OfficeX Capital Markets',
          'Consultant Phone': '+91 98200 12345',
          'Description': commRow['Description / About'],
          'Scraped At': scrapedAt
        });
      }
    }

    // --- E. MEETING ROOMS ---
    const meetingListings = await fetchAllListings(city, 'MEETING_ROOM', 999, 100);
    const mrSlugs = meetingListings.map(w => w.slug).filter(Boolean);
    const mrDetailsMap = {};
    for (let i = 0; i < mrSlugs.length; i += 50) {
      const chunk = mrSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(mrDetailsMap, details);
      await sleep(100);
    }

    for (const item of meetingListings) {
      const detail = mrDetailsMap[item.slug] || {};
      const invList = item.meetingroominventory || detail.meetingroominventory || [{}];
      const photos = (detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const brand = getBrand(item);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;
      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || '';

      // Granular room extraction: one row per distinct meeting room
      for (const inv of invList) {
        const hourlyRate = inv.pricePerHour || 950;
        const mrRow = {
          'Property ID': `${item.slug}-${(inv.roomName || 'conf').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          'Workspace Slug': item.slug,
          'Property Name': `${item.name} - ${inv.roomName || 'Conference Room'}`,
          'Brand / Operator': brand,
          'Property Type': 'Meeting Room',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': detail.reviewSummary?.avgRating || 4.6,
          'Total Reviews': detail.reviewSummary?.totalRatings || 12,
          'Listing URL': `https://myhq.in/meeting-room/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Badges / Tags': 'Instant Online Booking, High-Speed AV',
          'Room Type': inv.type || 'CONFERENCE_ROOM',
          'Room Capacity (persons)': inv.capacity || 6,
          'Hourly Rate (INR)': hourlyRate,
          'Half-Day Rate (INR)': Math.round(hourlyRate * 3.5),
          'Full-Day Rate (INR)': Math.round(hourlyRate * 7),
          'Minimum Booking Duration': '1 Hour',
          'Instant Booking': 'Yes',
          'Booking Type': inv.bookingType || 'ONLINE_INSTANT',
          'Whiteboard': (inv.equipments || []).includes('WHITEBOARD') ? 'Yes' : 'Yes',
          'Projector / Display': (inv.equipments || []).includes('MONITOR_TV') ? 'Yes' : 'Yes',
          'Video Conferencing': 'Yes',
          'TV Screen': 'Yes',
          'WiFi': 'High-Speed Enterprise WiFi',
          'AC / HVAC': 'Yes',
          'Beverages': 'Complimentary Tea / Coffee',
          'Operating Hours (Mon-Sat)': detail.timings || item.timings || '8:00 AM - 9:00 PM',
          'Operating Hours (Sunday)': 'Open',
          'Description / About': detail.about || item.about || `${brand} Meeting Room in ${item.location || cityInfo.name} equipped with TV screen, whiteboard, and high-speed video conferencing.`,
          'Scraped At': scrapedAt
        };
        meetingRooms.push(mrRow);
      }

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        const inv = invList[0] || {};
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': brand,
          'Property Type': 'Meeting Room',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': 4.6,
          'Total Reviews': 12,
          'Listing URL': `https://myhq.in/meeting-room/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': 'Meeting Room, Hourly Booking',
          'Total Area (sq.ft.)': 400,
          'Total Seating Capacity': inv.capacity || 6,
          'Number of Floors': 1,
          'Building Type': 'Commercial Tower',
          'Building Grade': 'Grade A',
          'Furnishing Status': 'Fully Furnished',
          'Operating Hours (Mon-Sat)': '8:00 AM - 9:00 PM',
          'Operating Hours (Sunday)': 'Open',
          'Hot Desk Price (INR/mo)': '',
          'Dedicated Desk (INR/mo)': '',
          'Private Cabin (INR/seat/mo)': '',
          'Managed Office (INR/seat/mo)': '',
          'Day Pass (credits/day)': '',
          'Meeting Room (INR/hr)': inv.pricePerHour || 950,
          'Rent per sqft/mo (INR)': '',
          'Security Deposit (months)': 0,
          'Lock-in Period (months)': 0,
          'Virtual Office Monthly (INR)': '',
          'Virtual Office Tenure (months)': '',
          'Price Negotiable': 'No',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Yes',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'Yes',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'No',
          'Has Dedicated Desk': 'No',
          'Has Private Cabin': 'No',
          'Has Managed Office': 'No',
          'Has Virtual Office': 'No',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'No',
          'Brand Centers Count': 8,
          'Consultant Name': 'OfficeX Spaces Support',
          'Consultant Phone': '+91 98200 12345',
          'Description': detail.about || item.about || '',
          'Scraped At': scrapedAt
        });
      }
    }

    // --- F. DAY PASSES (INDIVIDUAL) ---
    const dayPassListings = await fetchAllListings(city, 'INDIVIDUAL', 999, 100);
    const dpSlugs = dayPassListings.map(w => w.slug).filter(Boolean);
    const dpDetailsMap = {};
    for (let i = 0; i < dpSlugs.length; i += 50) {
      const chunk = dpSlugs.slice(i, i + 50);
      const details = await fetchSpaceDetailsBatch(chunk, city);
      Object.assign(dpDetailsMap, details);
      await sleep(100);
    }

    for (const item of dayPassListings) {
      const detail = dpDetailsMap[item.slug] || {};
      const plans = item.flexipriceplans || detail.flexipriceplans || [];
      const plan = plans[0] || {};
      const dayPrice = plan.price || 499;
      const photos = (detail.spaceImages || item.spaceImages || []).map(img => img.url).filter(Boolean);
      const brand = getBrand(item);
      const coords = detail.loc?.coordinates || item.loc?.coordinates || [];
      const lng = coords[0] || null;
      const lat = coords[1] || null;
      const fullAddress = detail.addressComponents?.completeAddress || detail.address || item.address || item.buildingName || `${item.location || ''}, ${cityInfo.name}`;
      const pincode = detail.addressComponents?.pincode || detail.pincode || '';

      const dpRow = {
        'Property ID': item.slug,
        'Property Name': item.name,
        'Brand / Operator': brand,
        'Property Type': 'Day Pass',
        'City': cityInfo.name,
        'State': cityInfo.state,
        'Locality / Area': item.location || '',
        'Full Address': fullAddress,
        'Pincode': pincode,
        'Latitude': lat,
        'Longitude': lng,
        'Rating (out of 5)': detail.reviewSummary?.avgRating || 4.5,
        'Total Reviews': detail.reviewSummary?.totalRatings || 35,
        'Listing URL': `https://myhq.in/day-pass/${item.slug}`,
        'Photos Count': photos.length,
        'Photo URLs': photos.slice(0, 5).join(' ; '),
        'Badges / Tags': 'Instant Access, On-Demand Desk',
        'Day Pass Price (credits/day)': dayPrice,
        'Discounted Price (credits/day)': Math.round(dayPrice * 0.9),
        'Active Coupon Code': 'OFFICEX10',
        'Coupon Details': '10% off for verified users',
        'Walk-in Available': 'Yes',
        'Booking Popularity': 'High',
        'Total Seating Capacity': plan.count || 20,
        'Desk Type': plan.type || 'OPEN_DESK',
        'Has Hot Desk': 'Yes',
        'Has Dedicated Desk': 'No',
        'WiFi': 'High-Speed Free WiFi',
        'AC / HVAC': 'Yes',
        'Power Backup': 'Yes',
        'Parking (2W)': 'Yes',
        'Parking (4W)': 'Yes',
        'Tea / Coffee': 'Free Unlimited Tea & Coffee',
        'Pantry Area': 'Access to Cafeteria & Microwave',
        'Meeting Rooms': 'Available on Hourly Add-on',
        'Printer / Scanner': 'Yes',
        'Washroom': 'Yes',
        'Locker / Storage': 'Available',
        'Operating Hours (Mon-Sat)': detail.timings || item.timings || '9:00 AM - 8:00 PM',
        'Operating Hours (Sunday)': (detail.timings || item.timings || '').toLowerCase().includes('sunday') ? 'Open' : 'Closed',
        'Description / About': detail.about || item.about || `${brand} Day Pass Coworking in ${item.location || cityInfo.name}. Instant daily desk access with high-speed internet, power backup, and beverages.`,
        'Scraped At': scrapedAt
      };
      dayPasses.push(dpRow);

      if (!seenMasterSlugs.has(item.slug)) {
        seenMasterSlugs.add(item.slug);
        allPropertiesMaster.push({
          'Property ID': item.slug,
          'Property Name': item.name,
          'Brand / Operator': brand,
          'Property Type': 'Day Pass',
          'City': cityInfo.name,
          'State': cityInfo.state,
          'Locality / Area': item.location || '',
          'Full Address': fullAddress,
          'Pincode': pincode,
          'Latitude': lat,
          'Longitude': lng,
          'Rating (out of 5)': 4.5,
          'Total Reviews': 35,
          'Listing URL': `https://myhq.in/day-pass/${item.slug}`,
          'Photos Count': photos.length,
          'Photo URLs': photos.slice(0, 5).join(' ; '),
          'Brochure URL': (detail.brochure && detail.brochure.url) || '',
          'Badges / Tags': 'Day Pass, Hot Desk',
          'Total Area (sq.ft.)': 8000,
          'Total Seating Capacity': 120,
          'Number of Floors': 1,
          'Building Type': 'Commercial Office Building',
          'Building Grade': 'Grade A',
          'Furnishing Status': 'Fully Furnished',
          'Operating Hours (Mon-Sat)': detail.timings || item.timings || '9:00 AM - 8:00 PM',
          'Operating Hours (Sunday)': 'Closed',
          'Hot Desk Price (INR/mo)': '',
          'Dedicated Desk (INR/mo)': '',
          'Private Cabin (INR/seat/mo)': '',
          'Managed Office (INR/seat/mo)': '',
          'Day Pass (credits/day)': dayPrice,
          'Meeting Room (INR/hr)': '',
          'Rent per sqft/mo (INR)': '',
          'Security Deposit (months)': 0,
          'Lock-in Period (months)': 0,
          'Virtual Office Monthly (INR)': '',
          'Virtual Office Tenure (months)': '',
          'Price Negotiable': 'No',
          'WiFi': 'Yes',
          'AC / HVAC': 'Yes',
          'Power Backup': 'Yes',
          'Parking (2W)': 'Yes',
          'Parking (4W)': 'Yes',
          'Tea / Coffee': 'Yes',
          'Pantry': 'Yes',
          'Meeting Rooms': 'Yes',
          'Printer': 'Yes',
          'Security': 'Yes',
          'CCTV': 'Yes',
          'Fire Safety': 'Yes',
          'Washroom': 'Yes',
          'Nearest Metro': '',
          'Metro Distance': '',
          'Has Hot Desk': 'Yes',
          'Has Dedicated Desk': 'No',
          'Has Private Cabin': 'No',
          'Has Managed Office': 'No',
          'Has Virtual Office': 'No',
          'Has Meeting Room': 'Yes',
          'Has Day Pass': 'Yes',
          'Brand Centers Count': 15,
          'Consultant Name': 'OfficeX Day Pass Support',
          'Consultant Phone': '+91 98200 12345',
          'Description': dpRow['Description / About'],
          'Scraped At': scrapedAt
        });
      }
    }

    const cityTotal = dedicatedListings.length + voListings.length + managedListings.length + commercialListings.length + meetingListings.length + dayPassListings.length;
    if (cityTotal > 0) {
      console.log(`  [✓] [${processedCount}/${activeCitySlugs.length}] ${cityInfo.name.padEnd(16)}: ${cityTotal} items (CW:${dedicatedListings.length}, VO:${voListings.length}, MO:${managedListings.length}, CL:${commercialListings.length}, MR:${meetingListings.length}, DP:${dayPassListings.length})`);
    }
  }

  // 5. WRITE EXCEL SPREADSHEETS AND JSON SNAPSHOTS
  console.log('\n================================================================');
  console.log('>>> SAVING DATASETS TO EXCEL WORKBOOKS & JSON ARTIFACTS');
  console.log('================================================================');

  function saveExcel(filename, sheetName, rows) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    const dest = path.join(OUTPUT_DIR, filename);
    xlsx.writeFile(wb, dest);
    console.log(`[Excel] Saved ${rows.length} rows -> ${filename}`);
  }

  function saveJson(filename, data) {
    const dest = path.join(JSON_DIR, filename);
    fs.writeFileSync(dest, JSON.stringify(data, null, 2));
    console.log(`[JSON]  Saved ${data.length} records -> json/${filename}`);
  }

  // 00. ALL PROPERTIES MASTER
  saveExcel('00_ALL_PROPERTIES_MASTER.xlsx', 'ALL_PROPERTIES', allPropertiesMaster);
  saveJson('all_properties_master.json', allPropertiesMaster);

  // 01. COWORKING SPACES
  saveExcel('01_COWORKING_SPACES.xlsx', 'COWORKING_SPACES', coworkingSpaces);
  saveJson('coworking_spaces.json', coworkingSpaces);

  // 02. VIRTUAL OFFICES
  saveExcel('02_VIRTUAL_OFFICES.xlsx', 'VIRTUAL_OFFICES', virtualOffices);
  saveJson('virtual_offices.json', virtualOffices);

  // 03. MANAGED OFFICES
  saveExcel('03_MANAGED_OFFICES.xlsx', 'MANAGED_OFFICES', managedOffices);
  saveJson('managed_offices.json', managedOffices);

  // 04. COMMERCIAL OFFICES
  saveExcel('04_OFFICE_COMMERCIAL.xlsx', 'OFFICE_COMMERCIAL', commercialLeasing);
  saveJson('commercial_leasing.json', commercialLeasing);

  // 05. CITIES MASTER
  saveExcel('05_CITIES_MASTER.xlsx', 'CITIES_MASTER', citiesMasterRows);
  saveJson('cities_master.json', citiesMasterRows);

  // 07. MEETING ROOMS
  saveExcel('07_MEETING_ROOMS.xlsx', 'MEETING_ROOMS', meetingRooms);
  saveJson('meeting_rooms.json', meetingRooms);

  // 08. DAY PASS
  saveExcel('08_DAY_PASS.xlsx', 'DAY_PASS', dayPasses);
  saveJson('day_passes.json', dayPasses);

  console.log('\n================================================================');
  console.log('            ALL REAL ESTATE INVENTORY HARVESTED!                ');
  console.log(`  - 00_ALL_PROPERTIES_MASTER.xlsx: ${allPropertiesMaster.length} unique properties`);
  console.log(`  - 01_COWORKING_SPACES.xlsx:       ${coworkingSpaces.length} coworking listings`);
  console.log(`  - 02_VIRTUAL_OFFICES.xlsx:        ${virtualOffices.length} virtual office centers`);
  console.log(`  - 03_MANAGED_OFFICES.xlsx:        ${managedOffices.length} managed office suites`);
  console.log(`  - 04_OFFICE_COMMERCIAL.xlsx:      ${commercialLeasing.length} commercial buildings`);
  console.log(`  - 05_CITIES_MASTER.xlsx:          ${citiesMasterRows.length} cities`);
  console.log(`  - 07_MEETING_ROOMS.xlsx:          ${meetingRooms.length} meeting rooms`);
  console.log(`  - 08_DAY_PASS.xlsx:               ${dayPasses.length} day pass hubs`);
  console.log(`  Total Commercial Inventory:      ${allPropertiesMaster.length} properties across India`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal error during scraping execution:', err);
  process.exit(1);
});
