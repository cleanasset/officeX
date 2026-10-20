import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  const samples = await db.select().from(marketplaceListings).limit(3);
  console.log('Sample marketplace listings in DB:');
  console.log(JSON.stringify(samples.map(p => ({
    id: p.id,
    name: p.name,
    city: p.city,
    vertical: p.vertical,
    startingPrice: p.startingPrice,
    startingPriceUnit: p.startingPriceUnit,
    imagesCount: p.images?.length,
    featuredImage: p.featuredImage?.slice(0, 70),
    amenities: p.amenities?.slice(0, 4),
    rating: p.avgRating,
    reviews: p.totalReviews
  })), null, 2));

  const cityCounts = await db.execute(sql`
    SELECT city, count(*) as count 
    FROM marketplace_listings 
    GROUP BY city 
    ORDER BY count DESC 
    LIMIT 10
  `);
  console.log('\nTop 10 Cities:');
  console.table(cityCounts.rows);

  const verticalCounts = await db.execute(sql`
    SELECT vertical, count(*) as count 
    FROM marketplace_listings 
    GROUP BY vertical 
    ORDER BY count DESC
  `);
  console.log('\nBy Vertical:');
  console.table(verticalCounts.rows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
