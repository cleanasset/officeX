import { db } from '../src/db';
import { properties } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const total = await db.select({ count: sql`count(*)` }).from(properties);
  console.log('TOTAL DB PROPERTIES:', total[0]?.count);

  const byType = await db
    .select({ type: properties.type, count: sql`count(*)` })
    .from(properties)
    .groupBy(properties.type)
    .orderBy(sql`count(*) desc`);
  console.log('\n--- BREAKDOWN BY PROPERTY VERTICAL ---');
  console.table(byType);

  const topCities = await db
    .select({ city: properties.city, count: sql`count(*)` })
    .from(properties)
    .groupBy(properties.city)
    .orderBy(sql`count(*) desc`)
    .limit(15);
  console.log('\n--- TOP 15 CITIES IN DATABASE ---');
  console.table(topCities);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
