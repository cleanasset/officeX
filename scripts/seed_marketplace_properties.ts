import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { properties } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  console.log('================================================================');
  console.log('       SEEDING SCRAPED COMMERCIAL REAL ESTATE TO DATABASE       ');
  console.log('================================================================\n');

  const jsonPath = path.join(__dirname, '..', 'office marketplace data', 'json', 'all_properties_master.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const allProps = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${allProps.length} properties from all_properties_master.json`);

  // Existing properties to avoid duplicates
  const existing = await db.select({ name: properties.name, city: properties.city }).from(properties);
  const existingSet = new Set(existing.map(e => `${(e.name || '').toLowerCase().trim()}:::${(e.city || '').toLowerCase().trim()}`));
  console.log(`Current existing properties in database: ${existing.length}`);

  const toInsert: any[] = [];
  const seenInBatch = new Set<string>();

  for (const item of allProps) {
    const rawName = (item['Property Name'] || 'Commercial Workspace').trim();
    const rawCity = (item['City'] || 'Mumbai').trim();
    const key = `${rawName.toLowerCase()}:::${rawCity.toLowerCase()}`;

    if (existingSet.has(key) || seenInBatch.has(key)) continue;
    seenInBatch.add(key);

    const photos = (item['Photo URLs'] || '').split(' ; ').filter(Boolean);
    const imageUrl = photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';
    
    // Clean grade enum
    const rawGrade = item['Building Grade'] || 'Grade A';
    let grade: 'A' | 'B' | 'C' | 'A+' | 'B+' = 'A';
    if (rawGrade.includes('A+')) grade = 'A+';
    else if (rawGrade.includes('B+')) grade = 'B+';
    else if (rawGrade.includes('B')) grade = 'B';
    else if (rawGrade.includes('C')) grade = 'C';

    const lat = item['Latitude'] != null ? String(Number(item['Latitude']).toFixed(7)) : null;
    const lng = item['Longitude'] != null ? String(Number(item['Longitude']).toFixed(7)) : null;
    
    // Pincode clean
    let pincode = String(item['Pincode'] || '').trim().replace(/[^0-9]/g, '');
    if (pincode.length !== 6) pincode = '400001';

    const totalArea = item['Total Area (sq.ft.)'] ? String(item['Total Area (sq.ft.)']) : '15000';

    toInsert.push({
      name: rawName.slice(0, 255),
      type: (item['Property Type'] || 'Coworking Space').slice(0, 100),
      grade: grade,
      address: (item['Full Address'] || `${item['Locality / Area'] || ''}, ${rawCity}`).slice(0, 1000),
      city: rawCity.slice(0, 100),
      state: item['State'] ? String(item['State']).slice(0, 100) : null,
      microMarket: item['Locality / Area'] ? String(item['Locality / Area']).slice(0, 150) : null,
      pincode: pincode,
      totalArea: totalArea,
      latitude: lat,
      longitude: lng,
      ownerName: item['Brand / Operator'] ? String(item['Brand / Operator']).slice(0, 100) : 'OfficeX Advisory',
      ownerCompany: item['Brand / Operator'] ? String(item['Brand / Operator']).slice(0, 255) : 'OfficeX Management',
      imageUrl: imageUrl
    });
  }

  console.log(`Ready to insert ${toInsert.length} new unique commercial properties into database.`);

  const BATCH_SIZE = 250;
  let insertedCount = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(properties).values(chunk);
      insertedCount += chunk.length;
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(toInsert.length / BATCH_SIZE)} (${insertedCount} / ${toInsert.length})...`);
    } catch (e: any) {
      console.error(`  Error inserting batch at ${i}:`, e.message);
    }
  }

  const finalTotal = await db.select({ count: sql<number>`count(*)` }).from(properties);
  console.log('\n================================================================');
  console.log(`Database Seeding Complete! Total properties now in DB: ${finalTotal[0]?.count}`);
  console.log('================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
