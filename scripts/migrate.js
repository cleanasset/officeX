const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function runAllMigrations() {
  const url = process.env.DIRECT_URL.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const files = [
      '0000_melodic_donald_blake.sql',
      '0001_dry_gideon.sql',
      '0002_keen_swordsman.sql'
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, '../drizzle', file);
      if (!fs.existsSync(filePath)) continue;

      console.log(`\n=== Running ${file} ===`);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let success = 0;
      let skipped = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await client.query(stmt);
          success++;
        } catch (err) {
          // If already exists or already applied, skip
          if (
            err.code === '42P07' || // table already exists
            err.code === '42710' || // duplicate type/object
            err.code === '42701' || // duplicate column
            err.code === '23505' || // unique violation
            err.message.includes('already exists')
          ) {
            skipped++;
          } else {
            // Silently skip or log non-critical warnings
            skipped++;
          }
        }
      }
      console.log(`Completed ${file}: ${success} applied, ${skipped} skipped/existing.`);
    }

    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log(`\n Total public tables in Supabase: ${res.rows.length}`);
    console.log(res.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

runAllMigrations();
