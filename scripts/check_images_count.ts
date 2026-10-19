import { db } from '../src/db';
import { properties } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const totalCloudinary = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(sql`${properties.imageUrl} LIKE '%cloudinary%'`);

  const totalUnsplash = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(sql`${properties.imageUrl} LIKE '%unsplash%'`);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties);

  console.log('--- DATABASE IMAGE STATS ---');
  console.log('Total Properties:', total[0]?.count);
  console.log('With Real Cloudinary Images:', totalCloudinary[0]?.count);
  console.log('With Unsplash Placeholder:', totalUnsplash[0]?.count);

  const sample = await db
    .select({
      name: properties.name,
      city: properties.city,
      type: properties.type,
      imageUrl: properties.imageUrl
    })
    .from(properties)
    .where(sql`${properties.imageUrl} LIKE '%cloudinary%'`)
    .limit(5);

  console.log('\nSample Real Properties with Cloudinary Images:');
  console.table(sample);

  process.exit(0);
}

main().catch(console.error);
