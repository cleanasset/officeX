import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  try {
    console.log("Running SQL migration on live database via DIRECT_URL...");
    const pool = new Pool({
      connectionString: process.env.DIRECT_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const db = drizzle(pool);
    await db.execute(sql`ALTER TABLE properties ALTER COLUMN image_url TYPE TEXT;`);
    console.log("Database update successful: column 'image_url' altered to TYPE TEXT!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
