const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const url = process.env.DIRECT_URL.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('=== Checking adjustment_notes columns ===');
  const adj = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'adjustment_notes' ORDER BY ordinal_position");
  console.log(adj.rows);

  console.log('=== Checking cam_pools & cam_pool_costs tables ===');
  const cam = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('cam_pools', 'cam_pool_costs')");
  console.log(cam.rows);

  if (cam.rows.length < 2) {
    console.log('Creating cam_pools and cam_pool_costs tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cam_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL,
        property_id UUID NOT NULL,
        pool_name TEXT NOT NULL,
        financial_year TEXT NOT NULL,
        annual_budget NUMERIC(14, 2) NOT NULL,
        apportionment_method TEXT NOT NULL DEFAULT 'area_weighted',
        total_apportionment_area NUMERIC(12, 2) NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS cam_pool_costs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pool_id UUID NOT NULL,
        category TEXT NOT NULL,
        budget_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
        actual_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
        variance NUMERIC(14, 2) NOT NULL DEFAULT 0,
        period TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Tables created successfully!');
  }

  await client.end();
}

run().catch(console.error);
