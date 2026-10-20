import { db } from "../src/db";
import { marketplaceListings } from "../src/db/marketplace-schema";
import { sql, isNotNull } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Extracting all cities and their top localities from database...");

  // 1. Get all cities with counts
  const cities = await db
    .select({
      city: marketplaceListings.city,
      count: sql<number>`count(*)::int`,
    })
    .from(marketplaceListings)
    .where(isNotNull(marketplaceListings.city))
    .groupBy(marketplaceListings.city)
    .orderBy(sql`count(*) desc`);

  console.log(`Found ${cities.length} distinct cities.`);

  // 2. For each city, get its top localities
  const cityLocalities: Record<string, string[]> = {};

  for (const c of cities) {
    if (!c.city) continue;
    const locs = await db
      .select({
        locality: marketplaceListings.locality,
        count: sql<number>`count(*)::int`,
      })
      .from(marketplaceListings)
      .where(sql`lower(${marketplaceListings.city}) = lower(${c.city}) AND ${marketplaceListings.locality} IS NOT NULL AND ${marketplaceListings.locality} != ''`)
      .groupBy(marketplaceListings.locality)
      .orderBy(sql`count(*) desc`)
      .limit(15);

    cityLocalities[c.city] = locs
      .map((l) => l.locality?.trim())
      .filter((l): l is string => Boolean(l && l.length > 1));
  }

  // 3. Write out a JSON file for inspection & inclusion
  const outputPath = path.join(__dirname, "../src/data/marketplace-cities.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        cities: cities.map((c) => ({ name: c.city, count: c.count })),
        localities: cityLocalities,
      },
      null,
      2
    )
  );

  console.log(`Saved cities and localities to ${outputPath}`);
}

main().catch(console.error).finally(() => process.exit(0));
