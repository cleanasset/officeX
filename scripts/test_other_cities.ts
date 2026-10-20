import { db } from "../src/db";
import { marketplaceListings } from "../src/db/marketplace-schema";
import { eq, ilike, and } from "drizzle-orm";

async function testOtherCities() {
  const citiesToTest = ["Chennai", "Jaipur", "Indore", "Kochi", "Kolkata", "Chandigarh", "Goa", "Surat"];

  for (const city of citiesToTest) {
    const spaces = await db
      .select({
        id: marketplaceListings.id,
        name: marketplaceListings.name,
        brandName: marketplaceListings.brandName,
        locality: marketplaceListings.locality,
        startingPrice: marketplaceListings.startingPrice,
      })
      .from(marketplaceListings)
      .where(and(eq(marketplaceListings.status, "active"), ilike(marketplaceListings.city, `%${city}%`)))
      .limit(2);

    console.log(`[${city}]: ${spaces.length > 0 ? "LIVE" : "EMPTY"} - Example: ${spaces[0]?.name} (${spaces[0]?.locality})`);
  }
}

testOtherCities().catch(console.error).finally(() => process.exit(0));
