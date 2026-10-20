import { db } from "../src/db";
import { marketplaceListings } from "../src/db/marketplace-schema";
import { sql } from "drizzle-orm";

async function main() {
  const cityCounts = await db
    .select({
      city: marketplaceListings.city,
      count: sql<number>`count(*)::int`,
    })
    .from(marketplaceListings)
    .groupBy(marketplaceListings.city)
    .orderBy(sql`count(*) desc`);

  const total = cityCounts.reduce((acc, c) => acc + Number(c.count), 0);

  console.log(`=== Total Scraped Properties: ${total} across ${cityCounts.length} Distinct City Entries ===\n`);
  cityCounts.forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.city || "Unknown"}: ${c.count} properties`);
  });
}

main().catch(console.error).finally(() => process.exit(0));
