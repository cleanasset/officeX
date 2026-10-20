import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  const cities = ['Ahmedabad', 'Bangalore', 'Mumbai', 'Delhi', 'Gurgaon', 'Noida', 'Pune', 'Hyderabad'];
  
  for (const city of cities) {
    console.log(`\n=== TOP LOCALITIES IN ${city.toUpperCase()} ===`);
    const locs = await db.execute(sql`
      SELECT locality, count(*) as count
      FROM marketplace_listings
      WHERE city ILIKE ${'%' + city + '%'}
      GROUP BY locality
      ORDER BY count DESC
      LIMIT 8
    `);
    console.table(locs.rows);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
