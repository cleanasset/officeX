import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  console.log('================================================================');
  console.log('   SEEDING MARKETPLACE LISTINGS WITH REAL IMAGES & PRICING      ');
  console.log('================================================================\n');

  const jsonPath = path.join(__dirname, '..', 'office marketplace data', 'json', 'all_properties_master.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const allProps = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${allProps.length} properties from all_properties_master.json`);

  // Clear previous scraped listings to ensure clean, non-duplicate seed with full images
  console.log('Clearing existing scraped marketplace listings...');
  await db.execute(sql`DELETE FROM marketplace_listings WHERE source = 'scraped_myhq'`);

  const toInsert: any[] = [];
  const seenSlugs = new Set<string>();

  for (let i = 0; i < allProps.length; i++) {
    const item = allProps[i];
    const rawName = (item['Property Name'] || 'Commercial Workspace').trim();
    const rawCity = (item['City'] || 'Mumbai').trim();
    const rawBrand = (item['Brand / Operator'] || '').trim();
    const rawType = (item['Property Type'] || 'Coworking Space').trim();

    // Map vertical
    let vertical = 'coworking';
    const lowerType = rawType.toLowerCase();
    if (lowerType.includes('virtual')) vertical = 'virtual_office';
    else if (lowerType.includes('managed')) vertical = 'managed_office';
    else if (lowerType.includes('commercial')) vertical = 'commercial';
    else if (lowerType.includes('meeting')) vertical = 'meeting_room';
    else if (lowerType.includes('day pass') || lowerType.includes('day_pass')) vertical = 'day_pass';

    // Unique Slug
    let baseSlug = slugify(`${rawName}-${rawCity}`);
    if (!baseSlug) baseSlug = `space-${i}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    seenSlugs.add(uniqueSlug);

    // Photos
    const rawPhotos = (item['Photo URLs'] || '').split(' ; ').map((s: string) => s.trim()).filter(Boolean);
    const featuredImage = rawPhotos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';

    // Amenities list
    const amenities: string[] = [];
    if (item['WiFi'] === 'Yes' || item['WiFi'] === true) amenities.push('High-Speed WiFi');
    if (item['AC / HVAC'] === 'Yes' || item['AC / HVAC'] === true) amenities.push('Centralized AC');
    if (item['Power Backup'] === 'Yes' || item['Power Backup'] === true) amenities.push('100% Power Backup');
    if (item['Parking (4W)'] === 'Yes' || item['Parking (2W)'] === 'Yes' || item['Parking'] === 'Yes') amenities.push('Reserved Parking');
    if (item['Tea / Coffee'] === 'Yes' || item['Tea / Coffee'] === true) amenities.push('Free Tea & Coffee');
    if (item['Pantry'] === 'Yes' || item['Pantry'] === true) amenities.push('Cafeteria / Pantry');
    if (item['Meeting Rooms'] === 'Yes' || item['Meeting Rooms'] === true) amenities.push('Meeting & Conference Rooms');
    if (item['Printer'] === 'Yes' || item['Printer'] === true) amenities.push('Printing & Scanning');
    if (item['Security'] === 'Yes' || item['Security'] === true) amenities.push('24/7 Biometric Security');
    if (item['CCTV'] === 'Yes' || item['CCTV'] === true) amenities.push('CCTV Surveillance');
    if (item['Fire Safety'] === 'Yes' || item['Fire Safety'] === true) amenities.push('Fire Alarm & Sprinklers');
    if (item['Washroom'] === 'Yes' || item['Washroom'] === true) amenities.push('Clean Washrooms');

    // Pricing plans
    const pricingPlans: any = {};
    if (item['Hot Desk Price (INR/mo)']) pricingPlans.hotDeskMonthly = Number(item['Hot Desk Price (INR/mo)']);
    if (item['Dedicated Desk (INR/mo)']) pricingPlans.dedicatedDeskMonthly = Number(item['Dedicated Desk (INR/mo)']);
    if (item['Private Cabin (INR/seat/mo)']) pricingPlans.privateCabinMonthly = Number(item['Private Cabin (INR/seat/mo)']);
    if (item['Managed Office (INR/seat/mo)']) pricingPlans.managedOfficeMonthly = Number(item['Managed Office (INR/seat/mo)']);
    if (item['Virtual Office Monthly (INR)']) pricingPlans.virtualOfficeMonthly = Number(item['Virtual Office Monthly (INR)']);
    if (item['Day Pass (credits/day)']) pricingPlans.dayPassPrice = Number(item['Day Pass (credits/day)']);
    if (item['Meeting Room (INR/hr)']) pricingPlans.meetingRoomHourly = Number(item['Meeting Room (INR/hr)']);
    if (item['Rent per sqft/mo (INR)']) pricingPlans.rentPerSqft = Number(item['Rent per sqft/mo (INR)']);
    if (item['Security Deposit (months)']) pricingPlans.depositMonths = Number(item['Security Deposit (months)']);
    if (item['Lock-in Period (months)']) pricingPlans.lockInMonths = Number(item['Lock-in Period (months)']);

    // Starting price and unit determination
    let startingPrice: number | null = null;
    let startingPriceUnit: string = 'per_seat_month';

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
    } else {
      startingPrice = 8500;
      startingPriceUnit = 'per_seat_month';
    }

    const lat = item['Latitude'] != null && !isNaN(Number(item['Latitude'])) ? String(Number(item['Latitude']).toFixed(7)) : null;
    const lng = item['Longitude'] != null && !isNaN(Number(item['Longitude'])) ? String(Number(item['Longitude']).toFixed(7)) : null;
    const rating = item['Rating (out of 5)'] != null && !isNaN(Number(item['Rating (out of 5)'])) ? String(Number(item['Rating (out of 5)']).toFixed(2)) : '4.50';
    const reviews = item['Total Reviews'] != null && !isNaN(Number(item['Total Reviews'])) ? Number(item['Total Reviews']) : 12;

    toInsert.push({
      slug: uniqueSlug.slice(0, 300),
      name: rawName.slice(0, 500),
      brandName: rawBrand ? rawBrand.slice(0, 200) : null,
      vertical: vertical,
      status: 'active',
      city: rawCity.slice(0, 100),
      locality: item['Locality / Area'] ? String(item['Locality / Area']).slice(0, 200) : null,
      microMarket: item['Locality / Area'] ? String(item['Locality / Area']).slice(0, 200) : null,
      fullAddress: item['Full Address'] ? String(item['Full Address']) : `${item['Locality / Area'] || ''}, ${rawCity}`,
      pincode: item['Pincode'] ? String(item['Pincode']).slice(0, 20) : null,
      latitude: lat,
      longitude: lng,
      totalAreaSqft: item['Total Area (sq.ft.)'] ? Number(item['Total Area (sq.ft.)']) : null,
      totalSeats: item['Total Seating Capacity'] ? Number(item['Total Seating Capacity']) : null,
      buildingGrade: item['Building Grade'] ? String(item['Building Grade']).slice(0, 20) : 'Grade A',
      buildingType: item['Building Type'] ? String(item['Building Type']).slice(0, 100) : null,
      furnishingStatus: item['Furnishing Status'] ? String(item['Furnishing Status']).slice(0, 50) : 'Furnished',
      images: rawPhotos,
      featuredImage: featuredImage,
      amenities: amenities,
      pricingPlans: pricingPlans,
      startingPrice: String(startingPrice),
      startingPriceUnit: startingPriceUnit,
      description: item['Description'] ? String(item['Description']) : `${rawName} offers premium flexible commercial space in ${rawCity}. Complete with enterprise-grade infrastructure, high-speed WiFi, meeting rooms, and 24/7 access.`,
      operatingHours: {
        monSat: item['Operating Hours (Mon-Sat)'] || '09:00 AM - 08:00 PM',
        sun: item['Operating Hours (Sunday)'] || 'Closed'
      },
      avgRating: rating,
      totalReviews: reviews,
      nearestMetro: item['Nearest Metro'] ? String(item['Nearest Metro']).slice(0, 200) : null,
      metroDistance: item['Metro Distance'] ? String(item['Metro Distance']).slice(0, 100) : null,
      consultantName: item['Consultant Name'] ? String(item['Consultant Name']).slice(0, 150) : 'OfficeX Advisory',
      consultantPhone: item['Consultant Phone'] ? String(item['Consultant Phone']).slice(0, 50) : '+91 98200 12345',
      source: 'scraped_myhq',
      sourceUrl: item['Listing URL'] ? String(item['Listing URL']) : null
    });
  }

  console.log(`Prepared ${toInsert.length} properties for insertion into marketplace_listings.`);

  const BATCH_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(marketplaceListings).values(chunk);
      inserted += chunk.length;
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(toInsert.length / BATCH_SIZE)} (${inserted} / ${toInsert.length})...`);
    } catch (e: any) {
      console.error(`  Error inserting batch at ${i}:`, e.message);
    }
  }

  const countResult = await db.execute(sql`SELECT count(*) as total, count(featured_image) as with_images FROM marketplace_listings`);
  console.log('\n================================================================');
  console.log('Seeding Complete! Database status:');
  console.log(countResult.rows[0]);
  console.log('================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
