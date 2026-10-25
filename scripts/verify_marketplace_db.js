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

async function verify() {
  try {
    const total = await pool.query("SELECT count(*) FROM marketplace_listings WHERE status = 'active'");
    console.log("TOTAL ACTIVE LISTINGS IN DB:", total.rows[0].count);

    const ahm = await pool.query("SELECT count(*) FROM marketplace_listings WHERE status = 'active' AND city ILIKE '%Ahmedabad%'");
    console.log("AHMEDABAD ACTIVE COUNT:", ahm.rows[0].count);

    const sample = await pool.query(`
      SELECT id, slug, name, city, locality, starting_price, featured_image
      FROM marketplace_listings
      WHERE status = 'active' AND city ILIKE '%Ahmedabad%'
      LIMIT 3
    `);
    console.log("SAMPLE AHMEDABAD LISTINGS:", JSON.stringify(sample.rows, null, 2));

    const single = await pool.query("SELECT id, slug, name, city, locality, starting_price, featured_image FROM marketplace_listings WHERE slug = $1", [sample.rows[0].slug]);
    console.log("SLUG LOOKUP RESULT:", single.rows[0]);

    const pune = await pool.query("SELECT count(*) FROM marketplace_listings WHERE status = 'active' AND city ILIKE '%Pune%'");
    console.log("PUNE ACTIVE COUNT:", pune.rows[0].count);

    const delhi = await pool.query("SELECT count(*) FROM marketplace_listings WHERE status = 'active' AND (city ILIKE '%Delhi%' OR city ILIKE '%Gurgaon%' OR city ILIKE '%Noida%')");
    console.log("DELHI NCR ACTIVE COUNT:", delhi.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

verify();
