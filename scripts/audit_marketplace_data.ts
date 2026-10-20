import { db } from '../src/db';
import { marketplaceListings, marketplaceOwners } from '../src/db/marketplace-schema';
import { properties } from '../src/db/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('--- AUDITING MARKETPLACE LISTINGS ---');
  const totalRes = await db.execute(sql`SELECT count(*) as count FROM marketplace_listings`);
  console.log('Total marketplace listings in DB:', totalRes.rows[0].count);

  const unsplashRes = await db.execute(sql`
    SELECT count(*) as count FROM marketplace_listings 
    WHERE featured_image LIKE '%unsplash%'
  `);
  console.log('Listings with Unsplash featured image:', unsplashRes.rows[0].count);

  const unsplashByVertical = await db.execute(sql`
    SELECT vertical, count(*) as count
    FROM marketplace_listings
    WHERE featured_image LIKE '%unsplash%'
    GROUP BY vertical
  `);
  console.log('Unsplash listings by vertical:');
  console.table(unsplashByVertical.rows);

  const sourcesRes = await db.execute(sql`
    SELECT source, count(*) as count
    FROM marketplace_listings
    GROUP BY source
  `);
  console.log('Listing sources:');
  console.table(sourcesRes.rows);

  const cloudinaryRes = await db.execute(sql`
    SELECT count(*) as count FROM marketplace_listings 
    WHERE featured_image LIKE '%cloudinary%' OR featured_image LIKE '%myhq%'
  `);
  console.log('Listings with Cloudinary/myHQ featured image:', cloudinaryRes.rows[0].count);

  const noImageRes = await db.execute(sql`
    SELECT count(*) as count FROM marketplace_listings 
    WHERE featured_image IS NULL OR featured_image = ''
  `);
  console.log('Listings with no image:', noImageRes.rows[0].count);

  // Check master json file
  const jsonPath = path.join(process.cwd(), 'office marketplace data', 'json', 'all_properties_master.json');
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const master = JSON.parse(raw);
    console.log('\n--- MASTER JSON (all_properties_master.json) ---');
    console.log('Total entries in file:', master.length);
    
    let withPhotos = 0;
    let withoutPhotos = 0;
    let unsplashPhotos = 0;
    let cloudinaryPhotos = 0;

    for (const p of master) {
      const photos = (p['Photo URLs'] || '').trim();
      if (!photos) {
        withoutPhotos++;
      } else {
        withPhotos++;
        if (photos.includes('cloudinary') || photos.includes('myhq')) {
          cloudinaryPhotos++;
        }
        if (photos.includes('unsplash')) {
          unsplashPhotos++;
        }
      }
    }
    console.log('Entries with photo URLs in master json:', withPhotos);
    console.log(' - Cloudinary/myHQ photo URLs:', cloudinaryPhotos);
    console.log(' - Unsplash photo URLs:', unsplashPhotos);
    console.log('Entries without photo URLs:', withoutPhotos);
  }

  // Check properties table (Rent Roll SaaS)
  console.log('\n--- PROPERTIES TABLE (RENT ROLL SAAS) ---');
  const rentRollWithOrg = await db.execute(sql`SELECT count(*) as count FROM properties WHERE org_id IS NOT NULL`);
  const rentRollWithoutOrg = await db.execute(sql`SELECT count(*) as count FROM properties WHERE org_id IS NULL`);
  console.log('Properties with org_id (real Rent Roll properties):', rentRollWithOrg.rows[0].count);
  console.log('Properties without org_id (scraped properties mistakenly seeded into rent roll):', rentRollWithoutOrg.rows[0].count);

  const r1 = await db.execute(sql`SELECT count(*) as count FROM buildings WHERE property_id IN (SELECT id FROM properties WHERE org_id IS NULL)`);
  const r2 = await db.execute(sql`SELECT count(*) as count FROM spaces WHERE property_id IN (SELECT id FROM properties WHERE org_id IS NULL)`);
  const r3 = await db.execute(sql`SELECT count(*) as count FROM user_properties WHERE property_id IN (SELECT id FROM properties WHERE org_id IS NULL)`);
  console.log('FK references to properties without org_id:');
  console.log(' - buildings:', r1.rows[0].count);
  console.log(' - spaces:', r2.rows[0].count);
  console.log(' - user_properties:', r3.rows[0].count);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
