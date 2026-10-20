import { db } from "../src/db";
import { marketplaceListings } from "../src/db/marketplace-schema";
import { and, eq, ilike, or } from "drizzle-orm";

async function main() {
  console.log("=== Testing Search for 'thaltej' in Ahmedabad ===");

  const term = "%thaltej%";
  const results = await db
    .select({
      id: marketplaceListings.id,
      name: marketplaceListings.name,
      brandName: marketplaceListings.brandName,
      locality: marketplaceListings.locality,
      microMarket: marketplaceListings.microMarket,
      vertical: marketplaceListings.vertical,
      startingPrice: marketplaceListings.startingPrice,
      featuredImage: marketplaceListings.featuredImage,
    })
    .from(marketplaceListings)
    .where(
      and(
        eq(marketplaceListings.status, "active"),
        ilike(marketplaceListings.city, "%Ahmedabad%"),
        or(
          ilike(marketplaceListings.name, term),
          ilike(marketplaceListings.brandName, term),
          ilike(marketplaceListings.locality, term),
          ilike(marketplaceListings.microMarket, term),
          ilike(marketplaceListings.fullAddress, term)
        )
      )
    );

  console.log(`Found ${results.length} spaces matching 'thaltej' in Ahmedabad:`);
  results.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.vertical}] ${r.name} (${r.brandName}) - ₹${r.startingPrice}/mo`);
    console.log(`     Locality: ${r.locality} | Micro: ${r.microMarket}`);
    console.log(`     Image: ${r.featuredImage?.substring(0, 60)}...`);
  });
}

main().catch(console.error).finally(() => process.exit(0));
