const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function check() {
  const url = process.env.DIRECT_URL.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Tables in Supabase public schema (' + res.rows.length + '):');
    console.log(res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await client.end();
  }
}

check();
