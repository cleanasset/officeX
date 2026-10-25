const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const connStr = rawUrl.includes('officeX@18129001')
  ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
  : rawUrl;

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    for (const row of res.rows) {
      const t = row.table_name;
      try {
        const c = await pool.query(`SELECT count(*) FROM "${t}"`);
        const count = parseInt(c.rows[0].count, 10);
        if (count > 0 && !t.includes('marketplace') && !t.includes('scraped') && !t.includes('myhq') && !t.includes('city') && !t.includes('locality')) {
          console.log(`${t} -> ${count}`);
        }
      } catch (err) {
        // ignore
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
