const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function runP3Migration() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DIRECT_URL or DATABASE_URL not found in .env.local');
  }
  const url = rawUrl.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const filePath = path.join(__dirname, '../drizzle/0006_rent_roll_p3.sql');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`\n=== Running 0006_rent_roll_p3.sql ===`);
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

    // Verify P3 tables
    const expectedTables = [
      'payment',
      'payment_allocation',
      'dispute'
    ];

    console.log('\n--- Verifying Phase 3 tables ---');
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

    // Verify invoice columns
    const invCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='invoices' 
      AND column_name IN ('contract_id', 'occupant_id', 'client_account_id');
    `);
    console.log(`\nInvoice columns present:`, invCols.rows.map(r => r.column_name));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runP3Migration();
