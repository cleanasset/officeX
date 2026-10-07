const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { Client } = require('pg');

async function runP1Migration() {
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const url = rawUrl.replace('officeX@18129001', 'officeX%4018129001');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    const filePath = path.join(__dirname, '../drizzle/0004_rent_roll_p1.sql');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`\n=== Running 0004_rent_roll_p1.sql ===`);
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

    // Verify P1 tables
    const expectedP1Tables = [
      'concession',
      'contract_charge',
      'contract_clause',
      'contract_document',
      'rent_step',
      'task'
    ];

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = ANY($1)
      ORDER BY table_name
    `, [expectedP1Tables]);

    console.log(`\nVerified P1 Tables (${res.rows.length}/${expectedP1Tables.length}):`);
    res.rows.forEach(r => console.log(`  ✓ ${r.table_name}`));

    if (res.rows.length !== expectedP1Tables.length) {
      const found = res.rows.map(r => r.table_name);
      const missing = expectedP1Tables.filter(t => !found.includes(t));
      console.warn('⚠️ Missing tables:', missing);
    } else {
      console.log('🎉 All P1 tables verified successfully in Supabase PostgreSQL!');
    }

  } catch (err) {
    console.error('Fatal migration error:', err);
  } finally {
    await client.end();
  }
}

runP1Migration();
