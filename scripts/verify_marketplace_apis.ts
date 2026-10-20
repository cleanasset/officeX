import { db } from '../src/db';
import { marketplaceListings } from '../src/db/marketplace-schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Testing Marketplace DB & Schema Queries...');

  // 1. Search simulation
  const listings = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.city, 'Bangalore'))
    .limit(3);

  console.log(`✓ Retrieved ${listings.length} Bangalore listings:`);
  listings.forEach((l, idx) => {
    console.log(`  ${idx + 1}. [${l.vertical.toUpperCase()}] ${l.name} - ${l.startingPrice} (${l.startingPriceUnit}) - Images: ${l.images?.length}`);
  });

  // 2. Single listing detail simulation
  const sample = listings[0];
  if (sample) {
    const detail = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.slug, sample.slug))
      .limit(1);

    console.log(`\n✓ Single Listing Detail: ${detail[0]?.name}`);
    console.log(`  Featured Image: ${detail[0]?.featuredImage?.slice(0, 60)}...`);
    console.log(`  Pricing Plans:`, detail[0]?.pricingPlans);
    console.log(`  Amenities:`, detail[0]?.amenities);
  }

  console.log('\nAll queries executed successfully with zero runtime errors!');
  process.exit(0);
}

main().catch(err => {
  console.error('API Verification error:', err);
  process.exit(1);
});
