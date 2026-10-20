import { db } from '../src/db';
import { properties, users, organizations, leases } from '../src/db/schema';
import { marketplaceListings, marketplaceOwners } from '../src/db/marketplace-schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('=== RENT ROLL SAAS (OFFICEX.PRO) AUDIT ===');
  const rentRollPropsCount = await db.select({ count: sql<number>`count(*)` }).from(properties);
  const propsWithOrg = await db.select({ count: sql<number>`count(*)` }).from(properties).where(sql`${properties.orgId} IS NOT NULL`);
  const propsWithoutOrg = await db.select({ count: sql<number>`count(*)` }).from(properties).where(sql`${properties.orgId} IS NULL`);
  const leasesCount = await db.select({ count: sql<number>`count(*)` }).from(leases);
  const orgsCount = await db.select({ count: sql<number>`count(*)` }).from(organizations);
  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);

  console.log('Properties in properties table:', rentRollPropsCount[0]?.count);
  console.log(' - With orgId (true Rent Roll SaaS properties):', propsWithOrg[0]?.count);
  console.log(' - Without orgId (dumped scraped rows):', propsWithoutOrg[0]?.count);
  console.log('Leases in rent roll:', leasesCount[0]?.count);
  console.log('Organizations:', orgsCount[0]?.count);
  console.log('Users:', usersCount[0]?.count);

  const realRentRollProps = await db.select({
    id: properties.id,
    name: properties.name,
    city: properties.city,
    type: properties.type,
    orgId: properties.orgId
  }).from(properties).where(sql`${properties.orgId} IS NOT NULL`).limit(10);
  console.log('\nTrue Rent Roll SaaS Properties:');
  console.table(realRentRollProps);

  console.log('\n=== OFFICE MARKETPLACE AUDIT ===');
  const mpListingsCount = await db.select({ count: sql<number>`count(*)` }).from(marketplaceListings);
  const mpOwnersCount = await db.select({ count: sql<number>`count(*)` }).from(marketplaceOwners);
  console.log('Marketplace Listings count:', mpListingsCount[0]?.count);
  console.log('Marketplace Owners count:', mpOwnersCount[0]?.count);

  const mpByVertical = await db.execute(sql`
    SELECT 
      vertical, 
      count(*) as total,
      count(*) FILTER (WHERE images IS NOT NULL AND jsonb_array_length(images) > 0) as with_photos,
      count(*) FILTER (WHERE starting_price IS NOT NULL AND starting_price > 0) as with_price
    FROM marketplace_listings
    GROUP BY vertical
  `);
  console.log('\nMarketplace Listings by Vertical:');
  console.table(mpByVertical.rows);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
