import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  try {
    console.log("Connecting to database and clearing all data tables...");
    const pool = new Pool({
      connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const db = drizzle(pool);
    
    // Truncate all transaction and listing tables with CASCADE
    await db.execute(sql`
      TRUNCATE TABLE 
        properties, 
        user_properties, 
        lease_units, 
        leases, 
        rfqs, 
        quotations, 
        work_orders, 
        compliance_certificates, 
        helpdesk_tickets, 
        utility_metrics, 
        audit_logs, 
        assets, 
        ppm_tasks, 
        tenant_onboarding, 
        officex_scores 
      CASCADE;
    `);
    
    console.log("Database cleared successfully! All listings, bids, RFQs, tickets, and logs have been wiped.");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear database:", error);
    process.exit(1);
  }
}

run();
