import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('--- TEST 1: Default search for "thaltej" without vertical ---');
  const res1 = await db.execute(sql`
    SELECT name, brand_name, vertical, city, locality, starting_price
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%'
      AND (
        name ILIKE '%thaltej%' OR 
        brand_name ILIKE '%thaltej%' OR 
        locality ILIKE '%thaltej%' OR 
        micro_market ILIKE '%thaltej%' OR 
        full_address ILIKE '%thaltej%'
      )
  `);
  console.log('Result count without vertical filter:', res1.rows.length);
  console.table(res1.rows);

  console.log('\n--- TEST 2: Search for "thaltej" with vertical="commercial" ---');
  const res2 = await db.execute(sql`
    SELECT name, brand_name, vertical, city, locality, starting_price
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%'
      AND vertical = 'commercial'
      AND (
        name ILIKE '%thaltej%' OR 
        brand_name ILIKE '%thaltej%' OR 
        locality ILIKE '%thaltej%' OR 
        micro_market ILIKE '%thaltej%' OR 
        full_address ILIKE '%thaltej%'
      )
  `);
  console.log('Result count WITH vertical="commercial":', res2.rows.length);

  console.log('\n--- TEST 3: Search for "thaltej" with vertical="coworking" ---');
  const res3 = await db.execute(sql`
    SELECT name, brand_name, vertical, city, locality, starting_price
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%'
      AND vertical = 'coworking'
      AND (
        name ILIKE '%thaltej%' OR 
        brand_name ILIKE '%thaltej%' OR 
        locality ILIKE '%thaltej%' OR 
        micro_market ILIKE '%thaltej%' OR 
        full_address ILIKE '%thaltej%'
      )
  `);
  console.log('Result count WITH vertical="coworking":', res3.rows.length);
  console.table(res3.rows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
