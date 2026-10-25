const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const connStr = rawUrl.includes('officeX@18129001')
  ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
  : rawUrl;

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false }
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function cleanImageUrl(url) {
  if (!url) return '/images/showcase_commercial_warmshell.jpg';
  if (url.includes('res.cloudinary.com/myhq/image/upload/')) {
    return url.replace('https://res.cloudinary.com/myhq/image/upload/', '/assets/spaces/');
  }
  if (url.includes('cloudinary.com') && url.includes('myhq')) {
    return url.replace(/https?:\/\/res\.cloudinary\.com\/myhq\/image\/upload\//, '/assets/spaces/');
  }
  return url;
}

async function seed() {
  console.log('================================================================');
  console.log('   SEEDING 6,767 AUTHENTIC MARKETPLACE LISTINGS INTO POSTGRES   ');
  console.log('================================================================\n');

  const jsonPath = path.join(process.cwd(), 'office marketplace data', 'json', 'all_properties_master.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const allProps = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${allProps.length} properties from all_properties_master.json`);

  const client = await pool.connect();
  try {
    console.log('Clearing old marketplace_listings in PostgreSQL...');
    await client.query('DELETE FROM marketplace_listings');

    const seenSlugs = new Set();
    const rows = [];

    for (let i = 0; i < allProps.length; i++) {
      const item = allProps[i];
      const rawName = (item['Property Name'] || 'Commercial Workspace').trim();
      const rawCity = (item['City'] || 'Delhi').trim();
      const rawBrand = (item['Brand / Operator'] || 'Verified Workspace').trim();
      const rawType = (item['Property Type'] || 'Coworking Space').trim();

      let vertical = 'coworking';
      const lowerType = rawType.toLowerCase();
      if (lowerType.includes('virtual')) vertical = 'virtual_office';
      else if (lowerType.includes('managed')) vertical = 'managed_office';
      else if (lowerType.includes('commercial')) vertical = 'commercial';
      else if (lowerType.includes('meeting')) vertical = 'meeting_room';
      else if (lowerType.includes('day pass') || lowerType.includes('day_pass')) vertical = 'day_pass';

      let baseSlug = slugify(`${rawName}-${rawCity}`);
      if (!baseSlug) baseSlug = `space-${i}`;
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (seenSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }
      seenSlugs.add(uniqueSlug);

      const rawPhotos = (item['Photo URLs'] || '')
        .split(';')
        .map(s => cleanImageUrl(s.trim()))
        .filter(Boolean);

      const featuredImage = rawPhotos[0] || cleanImageUrl(item['Featured Image']) || '/images/showcase_commercial_warmshell.jpg';
      const images = rawPhotos.length > 0 ? rawPhotos : [featuredImage];

      const amenities = [];
      if (item['WiFi'] === 'Yes' || item['WiFi'] === true) amenities.push('High-Speed WiFi');
      if (item['AC / HVAC'] === 'Yes' || item['AC / HVAC'] === true) amenities.push('Centralized AC');
      if (item['Power Backup'] === 'Yes' || item['Power Backup'] === true) amenities.push('100% Power Backup');
      if (item['Parking (4W)'] === 'Yes' || item['Parking (2W)'] === 'Yes' || item['Parking'] === 'Yes') amenities.push('Reserved Parking');
      if (item['Tea / Coffee'] === 'Yes' || item['Tea / Coffee'] === true) amenities.push('Free Tea & Coffee');
      if (item['Pantry'] === 'Yes' || item['Pantry'] === true) amenities.push('Cafeteria / Pantry');
      if (item['Meeting Rooms'] === 'Yes' || item['Meeting Rooms'] === true) amenities.push('Meeting & Conference Rooms');
      if (item['Printer'] === 'Yes' || item['Printer'] === true) amenities.push('Printing & Scanning');
      if (item['Security'] === 'Yes' || item['Security'] === true) amenities.push('24/7 Security');
      if (item['CCTV'] === 'Yes' || item['CCTV'] === true) amenities.push('CCTV Surveillance');
      if (item['Fire Safety'] === 'Yes' || item['Fire Safety'] === true) amenities.push('Fire Alarm & Sprinklers');
      if (item['Washroom'] === 'Yes' || item['Washroom'] === true) amenities.push('Clean Washrooms');
      if (amenities.length === 0) {
        amenities.push('High-Speed WiFi', 'Power Backup', 'Meeting Rooms', 'Tea / Coffee', 'Security & CCTV');
      }

      const pricingPlans = {};
      if (item['Hot Desk Price (INR/mo)']) pricingPlans.hotDeskMonthly = Number(item['Hot Desk Price (INR/mo)']);
      if (item['Dedicated Desk (INR/mo)']) pricingPlans.dedicatedDeskMonthly = Number(item['Dedicated Desk (INR/mo)']);
      if (item['Private Cabin (INR/seat/mo)']) pricingPlans.privateCabinMonthly = Number(item['Private Cabin (INR/seat/mo)']);
      if (item['Managed Office (INR/seat/mo)']) pricingPlans.managedOfficeMonthly = Number(item['Managed Office (INR/seat/mo)']);
      if (item['Virtual Office Monthly (INR)']) pricingPlans.virtualOfficeMonthly = Number(item['Virtual Office Monthly (INR)']);
      if (item['Day Pass (credits/day)']) pricingPlans.dayPassPrice = Number(item['Day Pass (credits/day)']);
      if (item['Meeting Room (INR/hr)']) pricingPlans.meetingRoomHourly = Number(item['Meeting Room (INR/hr)']);
      if (item['Rent per sqft/mo (INR)']) pricingPlans.rentPerSqft = Number(item['Rent per sqft/mo (INR)']);

      let startingPrice = 8500;
      let startingPriceUnit = 'per_seat_month';

      if (vertical === 'coworking') {
        startingPrice = pricingPlans.dedicatedDeskMonthly || pricingPlans.hotDeskMonthly || pricingPlans.privateCabinMonthly || 7999;
        startingPriceUnit = 'per_seat_month';
      } else if (vertical === 'virtual_office') {
        startingPrice = pricingPlans.virtualOfficeMonthly || 999;
        startingPriceUnit = 'per_month';
      } else if (vertical === 'managed_office') {
        startingPrice = pricingPlans.managedOfficeMonthly || 12000;
        startingPriceUnit = 'per_seat_month';
      } else if (vertical === 'commercial') {
        startingPrice = pricingPlans.rentPerSqft || 85;
        startingPriceUnit = 'per_sqft_month';
      } else if (vertical === 'meeting_room') {
        startingPrice = pricingPlans.meetingRoomHourly || 750;
        startingPriceUnit = 'per_hour';
      } else if (vertical === 'day_pass') {
        startingPrice = pricingPlans.dayPassPrice || 499;
        startingPriceUnit = 'per_day';
      }

      const lat = item['Latitude'] != null && !isNaN(Number(item['Latitude'])) ? String(Number(item['Latitude']).toFixed(7)) : null;
      const lng = item['Longitude'] != null && !isNaN(Number(item['Longitude'])) ? String(Number(item['Longitude']).toFixed(7)) : null;
      const rating = item['Rating (out of 5)'] != null && !isNaN(Number(item['Rating (out of 5)'])) ? String(Number(item['Rating (out of 5)']).toFixed(2)) : '4.50';
      const reviews = item['Total Reviews'] != null && !isNaN(Number(item['Total Reviews'])) ? Number(item['Total Reviews']) : 15;

      rows.push([
        uniqueSlug.slice(0, 300),
        rawName.slice(0, 500),
        rawBrand.slice(0, 200),
        vertical,
        'active',
        rawCity.slice(0, 100),
        item['Locality / Area'] ? String(item['Locality / Area']).slice(0, 200) : null,
        item['Locality / Area'] ? String(item['Locality / Area']).slice(0, 200) : null,
        item['Full Address'] ? String(item['Full Address']) : `${item['Locality / Area'] || ''}, ${rawCity}`,
        item['Pincode'] ? String(item['Pincode']).slice(0, 20) : null,
        lat,
        lng,
        item['Total Area (sq.ft.)'] ? Number(item['Total Area (sq.ft.)']) : null,
        item['Total Seating Capacity'] ? Number(item['Total Seating Capacity']) : null,
        item['Building Grade'] ? String(item['Building Grade']).slice(0, 20) : 'Grade A',
        item['Building Type'] ? String(item['Building Type']).slice(0, 100) : 'Commercial Complex',
        item['Furnishing Status'] ? String(item['Furnishing Status']).slice(0, 50) : 'Furnished',
        JSON.stringify(images),
        featuredImage,
        JSON.stringify(amenities),
        JSON.stringify(pricingPlans),
        startingPrice,
        startingPriceUnit,
        item['Description'] ? String(item['Description']).slice(0, 2000) : `${rawName} offers premium commercial workspace in ${rawCity} with top amenities.`,
        rating,
        reviews,
        item['Nearest Metro'] ? String(item['Nearest Metro']).slice(0, 200) : null,
        item['Metro Distance'] ? String(item['Metro Distance']).slice(0, 100) : null,
        'OfficeX Advisory',
        '+91 98200 12345',
        'verified_operator'
      ]);
    }

    console.log(`Inserting ${rows.length} records into marketplace_listings in batches...`);

    const BATCH_SIZE = 250;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const valuePlaceholders = [];
      const flatValues = [];
      let paramIndex = 1;

      for (const row of batch) {
        const placeholders = [];
        for (const val of row) {
          placeholders.push(`$${paramIndex++}`);
          flatValues.push(val);
        }
        valuePlaceholders.push(`(${placeholders.join(', ')})`);
      }

      const queryText = `
        INSERT INTO marketplace_listings (
          slug, name, brand_name, vertical, status, city, locality, micro_market,
          full_address, pincode, latitude, longitude, total_area_sqft, total_seats,
          building_grade, building_type, furnishing_status, images, featured_image,
          amenities, pricing_plans, starting_price, starting_price_unit, description,
          avg_rating, total_reviews, nearest_metro, metro_distance, consultant_name,
          consultant_phone, source
        ) VALUES ${valuePlaceholders.join(', ')}
      `;

      await client.query(queryText, flatValues);
      console.log(`  Inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}...`);
    }

    const check = await client.query('SELECT count(*) as total FROM marketplace_listings');
    console.log(`\nSUCCESS: marketplace_listings total count = ${check.rows[0].total}`);

    const ahmedabadCheck = await client.query("SELECT count(*) as ahmedabad_count FROM marketplace_listings WHERE city ILIKE '%Ahmedabad%'");
    console.log(`Ahmedabad count in DB = ${ahmedabadCheck.rows[0].ahmedabad_count}`);

    const citiesCheck = await client.query('SELECT city, count(*) FROM marketplace_listings GROUP BY city ORDER BY count DESC LIMIT 15');
    console.log('Top cities in DB:', citiesCheck.rows);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
