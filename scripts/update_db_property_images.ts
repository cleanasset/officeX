import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { properties } from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';

async function main() {
  console.log('================================================================');
  console.log('       UPDATING DATABASE PROPERTIES WITH REAL MYHQ IMAGES       ');
  console.log('================================================================\n');

  const jsonPath = path.join(__dirname, '..', 'office marketplace data', 'json', 'all_properties_master.json');
  const master = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${master.length} properties from all_properties_master.json`);

  // Build lookup map: name+city -> real photo url
  const photoMap = new Map<string, string>();
  for (const item of master) {
    const rawPhotos = item['Photo URLs'];
    if (!rawPhotos) continue;
    const firstPhoto = rawPhotos.split(' ; ')[0]?.trim();
    if (!firstPhoto || !firstPhoto.startsWith('http')) continue;

    const name = (item['Property Name'] || '').trim().toLowerCase();
    const city = (item['City'] || '').trim().toLowerCase();
    if (name && city) {
      photoMap.set(`${name}:::${city}`, firstPhoto);
    }
  }

  console.log(`Found ${photoMap.size} unique properties with authentic Cloudinary photo URLs.`);

  // Fetch all existing properties from DB
  const dbProps = await db
    .select({
      id: properties.id,
      name: properties.name,
      city: properties.city,
      imageUrl: properties.imageUrl
    })
    .from(properties);

  console.log(`Found ${dbProps.length} properties currently in database.`);

  let updatedCount = 0;
  let batchUpdates = 0;

  for (const prop of dbProps) {
    const name = (prop.name || '').trim().toLowerCase();
    const city = (prop.city || '').trim().toLowerCase();
    const realPhoto = photoMap.get(`${name}:::${city}`);

    if (realPhoto && prop.imageUrl !== realPhoto) {
      try {
        await db
          .update(properties)
          .set({ imageUrl: realPhoto })
          .where(eq(properties.id, prop.id));
        updatedCount++;
        if (updatedCount % 500 === 0) {
          console.log(`  Updated ${updatedCount} properties with real photos...`);
        }
      } catch (err: any) {
        // Continue
      }
    }
  }

  console.log('\n================================================================');
  console.log(`SUCCESS: Updated ${updatedCount} database properties with real myHQ Cloudinary photos!`);
  console.log('================================================================\n');

  // Verify sample
  const sample = await db
    .select({ name: properties.name, city: properties.city, imageUrl: properties.imageUrl })
    .from(properties)
    .limit(5);

  console.log('Verified 5 Sample Properties in Database:');
  console.table(sample);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error updating images:', err);
  process.exit(1);
});
