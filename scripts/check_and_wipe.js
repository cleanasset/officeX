const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function run() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  const connStr = rawUrl.includes("officeX@18129001")
    ? rawUrl.replace("officeX@18129001", "officeX%4018129001")
    : rawUrl;

  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Checking current table counts before wipe...");
    const checkTables = [
      "property", "properties", 
      "contract", "contracts", "leases", 
      "occupant", "occupants", "tenants", 
      "space", "spaces", 
      "building", "buildings", 
      "invoices", "users"
    ];

    for (const t of checkTables) {
      try {
        const res = await pool.query(`SELECT count(*)::int as c FROM "${t}"`);
        console.log(`BEFORE -> ${t}: ${res.rows[0].c}`);
      } catch (e) {
        console.log(`BEFORE -> ${t}: table not found or error (${e.message})`);
      }
    }

    console.log("\nDeleting all records in order of foreign key dependency...");
    const deleteOrder = [
      "contract_document",
      "contract_clause",
      "contract_charge",
      "rent_step",
      "contract_space",
      "concession",
      "deposit_transaction",
      "deposit_transactions",
      "invoice_line",
      "payment_allocation",
      "payment_allocations",
      "payment",
      "payments",
      "invoices",
      "billing_run",
      "deal",
      "deals",
      "contract",
      "contracts",
      "leases",
      "lease_units",
      "lease_notices",
      "space",
      "spaces",
      "seat_count",
      "seat_inventory",
      "floor",
      "floors",
      "building",
      "buildings",
      "user_properties",
      "property",
      "properties",
      "occupant",
      "occupants",
      "tenants",
      "users"
    ];

    for (const t of deleteOrder) {
      try {
        const delRes = await pool.query(`DELETE FROM "${t}"`);
        console.log(`DELETED from ${t}: ${delRes.rowCount} rows`);
      } catch (e) {
        console.log(`Could not delete from ${t}: ${e.message}`);
      }
    }

    console.log("\nChecking counts AFTER wipe:");
    for (const t of checkTables) {
      try {
        const res = await pool.query(`SELECT count(*)::int as c FROM "${t}"`);
        console.log(`AFTER -> ${t}: ${res.rows[0].c}`);
      } catch (e) {}
    }

  } catch (err) {
    console.error("Script error:", err);
  } finally {
    await pool.end();
  }
}

run();

