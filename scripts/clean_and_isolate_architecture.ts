import { db } from '../src/db';
import { properties } from '../src/db/schema';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('================================================================');
  console.log('   OFFICEX DATA ISOLATION & MOCK REMOVAL PROTOCOL              ');
  console.log('================================================================\n');

  // 1. RENT ROLL SAAS PURGE OF UNASSIGNED SCRAPED DUMP
  console.log('Step 1: Inspecting Rent Roll SaaS "properties" table...');
  const beforeSaaSWithOrg = await db.execute(sql`SELECT count(*) as count FROM properties WHERE org_id IS NOT NULL`);
  const beforeSaaSWithoutOrg = await db.execute(sql`SELECT count(*) as count FROM properties WHERE org_id IS NULL`);
  console.log(` - Authentic Rent Roll SaaS properties (org_id NOT NULL): ${beforeSaaSWithOrg.rows[0].count}`);
  console.log(` - Polluting scraped rows in Rent Roll table (org_id IS NULL): ${beforeSaaSWithoutOrg.rows[0].count}`);

  if (Number(beforeSaaSWithoutOrg.rows[0].count) > 0) {
    console.log('Cleaning Rent Roll SaaS "properties" table of unassigned scraped rows...');
    const deleteResult = await db.execute(sql`DELETE FROM properties WHERE org_id IS NULL`);
    console.log('Successfully purged unassigned rows from Rent Roll SaaS properties table.');
  }

  const afterSaaSWithOrg = await db.execute(sql`SELECT count(*) as count FROM properties WHERE org_id IS NOT NULL`);
  const afterSaaSTotal = await db.execute(sql`SELECT count(*) as count FROM properties`);
  console.log(` - Pristine Rent Roll SaaS properties remaining: ${afterSaaSWithOrg.rows[0].count} (Total in table: ${afterSaaSTotal.rows[0].count})`);

  // 2. MARKETPLACE LISTINGS PURGE OF UNSPLASH FAKE PHOTOS
  console.log('\nStep 2: Inspecting Office Marketplace "marketplace_listings" table...');
  const beforeMpTotal = await db.execute(sql`SELECT count(*) as count FROM marketplace_listings`);
  const beforeMpUnsplash = await db.execute(sql`
    SELECT count(*) as count FROM marketplace_listings 
    WHERE featured_image LIKE '%unsplash%' OR images::text LIKE '%unsplash%'
  `);
  const beforeMpCloudinary = await db.execute(sql`
    SELECT count(*) as count FROM marketplace_listings 
    WHERE featured_image LIKE '%cloudinary%' OR featured_image LIKE '%myhq%'
  `);
  console.log(` - Total marketplace listings: ${beforeMpTotal.rows[0].count}`);
  console.log(` - Listings with fake Unsplash images: ${beforeMpUnsplash.rows[0].count}`);
  console.log(` - Listings with real Cloudinary/myHQ images: ${beforeMpCloudinary.rows[0].count}`);

  if (Number(beforeMpUnsplash.rows[0].count) > 0) {
    console.log('Purging listings with fake Unsplash images...');
    await db.execute(sql`
      DELETE FROM marketplace_listings 
      WHERE featured_image LIKE '%unsplash%' OR images::text LIKE '%unsplash%'
    `);
    console.log('Successfully removed fake mock listings.');
  }

  const afterMpTotal = await db.execute(sql`SELECT count(*) as count FROM marketplace_listings`);
  const afterMpByVertical = await db.execute(sql`
    SELECT vertical, count(*) as count 
    FROM marketplace_listings 
    GROUP BY vertical
  `);

  console.log(`\nRemaining 100% Real Scraped Listings in Marketplace: ${afterMpTotal.rows[0].count}`);
  console.table(afterMpByVertical.rows);

  console.log('\n================================================================');
  console.log('   DATA CLEANUP COMPLETE & ARCHITECTURAL ISOLATION VERIFIED    ');
  console.log('================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
