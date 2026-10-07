const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function runImportMigration() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DIRECT_URL or DATABASE_URL not found in .env.local');
  }
  const url = rawUrl.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const filePath = path.join(__dirname, '../drizzle/0005_rent_roll_import.sql');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`\n=== Running 0005_rent_roll_import.sql ===`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let success = 0;
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        success++;
      } catch (err) {
        if (
          err.code === '42P07' || // table already exists
          err.code === '42710' || // duplicate type/object
          err.code === '42701' || // duplicate column
          err.code === '23505' || // unique violation
          err.message.includes('already exists')
        ) {
          skipped++;
        } else {
          console.error(`Statement ${i + 1} failed:`, stmt.substring(0, 100), '-->', err.message);
          errors.push({ index: i, error: err.message, stmt: stmt.substring(0, 100) });
        }
      }
    }

    console.log(`\nMigration completed: ${success} applied, ${skipped} skipped (already exists), ${errors.length} errors.`);

    // Verify import tables
    const expectedTables = [
      'mapping_template',
      'import_batch',
      'import_row_staging',
      'import_exception'
    ];

    console.log('\n--- Verifying import tables ---');
    for (const tbl of expectedTables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tbl]);
      const exists = res.rows[0].exists;
      console.log(`Table '${tbl}': ${exists ? 'EXISTS (OK)' : 'MISSING'}`);
    }

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runImportMigration();
