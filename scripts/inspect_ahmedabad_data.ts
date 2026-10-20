import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('--- ALL CITIES IN MARKETPLACE_LISTINGS ---');
  const cities = await db.execute(sql`
    SELECT city, count(*) as count 
    FROM marketplace_listings 
    GROUP BY city 
    ORDER BY count DESC
  `);
  console.table(cities.rows);

  console.log('\n--- AHMEDABAD / GUJARAT LISTINGS ---');
  const ahmedabadListings = await db.execute(sql`
    SELECT vertical, count(*) as count
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%' OR city ILIKE '%Gandhinagar%'
    GROUP BY vertical
  `);
  console.table(ahmedabadListings.rows);

  const sampleAhmedabad = await db.execute(sql`
    SELECT name, brand_name, vertical, city, locality, starting_price, starting_price_unit
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%' OR city ILIKE '%Gandhinagar%'
    LIMIT 10
  `);
  console.log('\nSample Ahmedabad listings:');
  console.table(sampleAhmedabad.rows);

  console.log('\n--- SEARCHING "thaltej" in MARKETPLACE_LISTINGS ---');
  const thaltej = await db.execute(sql`
    SELECT name, brand_name, vertical, city, locality
    FROM marketplace_listings
    WHERE locality ILIKE '%thaltej%' OR name ILIKE '%thaltej%' OR full_address ILIKE '%thaltej%'
  `);
  console.log('Thaltej results count:', thaltej.rows.length);
  console.table(thaltej.rows);

  console.log('\n--- CORRIDOR ACCURACY CHECKS ---');
  const sgHighway = await db.execute(sql`
    SELECT count(*) as count
    FROM marketplace_listings
    WHERE (city ILIKE '%Ahmedabad%' OR city ILIKE '%Gandhinagar%')
      AND (locality ILIKE '%SG Highway%' OR full_address ILIKE '%SG Highway%' OR name ILIKE '%SG Highway%' OR micro_market ILIKE '%SG Highway%' OR locality ILIKE '%Sarkhej%')
  `);
  console.log('SG Highway spaces in DB:', sgHighway.rows[0].count);

  const giftCity = await db.execute(sql`
    SELECT count(*) as count
    FROM marketplace_listings
    WHERE locality ILIKE '%GIFT%' OR full_address ILIKE '%GIFT%' OR name ILIKE '%GIFT%' OR micro_market ILIKE '%GIFT%' OR city ILIKE '%Gandhinagar%'
  `);
  console.log('GIFT City / Gandhinagar spaces in DB:', giftCity.rows[0].count);

  const prahlad = await db.execute(sql`
    SELECT count(*) as count
    FROM marketplace_listings
    WHERE locality ILIKE '%Prahlad%' OR full_address ILIKE '%Prahlad%' OR locality ILIKE '%Bodakdev%' OR full_address ILIKE '%Bodakdev%'
  `);
  console.log('Prahlad Nagar & Bodakdev spaces in DB:', prahlad.rows[0].count);

  console.log('\n--- ALL LOCALITIES IN AHMEDABAD/GANDHINAGAR ---');
  const allLocs = await db.execute(sql`
    SELECT locality, count(*) as count
    FROM marketplace_listings
    WHERE city ILIKE '%Ahmedabad%' OR city ILIKE '%Gandhinagar%'
    GROUP BY locality
    ORDER BY count DESC
  `);
  console.table(allLocs.rows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
