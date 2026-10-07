import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const connStr = rawUrl.includes('officeX@18129001')
  ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
  : rawUrl;

async function applyMigration() {
  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connected to PostgreSQL for Rent Roll P0 migration...");
  const connTest = await pool.query("SELECT current_database(), current_user;");
  console.log("Connection verified:", connTest.rows[0]);

  const sqlFilePath = path.join(__dirname, '../../drizzle/0003_rent_roll_p0.sql');
  const rawSql = fs.readFileSync(sqlFilePath, 'utf8');

  // Split by statement-breakpoint
  const statements = rawSql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} migration statements to execute.`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await pool.query(stmt);
      successCount++;
    } catch (err: any) {
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate') ||
        err.message.includes('multiple primary keys')
      ) {
        skippedCount++;
        // Existing / duplicate is normal on re-runs
      } else {
        console.warn(`[${i + 1}/${statements.length}] Notice on statement: ${err.message}\nSQL: ${stmt.slice(0, 100)}...`);
        failedCount++;
      }
    }
  }

  console.log(`\nMigration run finished! Success: ${successCount}, Skipped/Existing: ${skippedCount}, Failed/Notice: ${failedCount}`);

  // Also sync existing organization records into organization table if table is newly created
  try {
    await pool.query(`
      INSERT INTO "organization" (
        id, name, slug, subscription_status, workspace_name,
        created_at, updated_at, version
      )
      SELECT 
        id, 
        name, 
        COALESCE(slug, lower(regexp_replace(name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(id::text, 1, 8)) AS slug,
        COALESCE(subscription_status, 'active'::subscription_status) AS subscription_status,
        COALESCE(workspace_name, name) AS workspace_name,
        COALESCE(created_at, now()) AS created_at,
        COALESCE(updated_at, now()) AS updated_at,
        1 AS version
      FROM "organizations"
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Synced existing organizations into organization table.");
  } catch (syncErr: any) {
    console.log("Notice on sync:", syncErr.message);
  }

  // EMPIRICAL VERIFICATION (GSD Protocol)
  console.log("\n================ EMPIRICAL VERIFICATION ================");
  const p0Tables = [
    'organization',
    'client_account',
    'property',
    'building',
    'space',
    'occupant',
    'contract',
    'contract_space',
    'charge_type',
    'tax_profile',
    'billing_entity',
    'management_mandate',
    'deal'
  ];

  for (const t of p0Tables) {
    const colRes = await pool.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = $1 AND table_schema = 'public' 
       ORDER BY ordinal_position;`,
      [t]
    );

    const idxRes = await pool.query(
      `SELECT indexname, indexdef 
       FROM pg_indexes 
       WHERE tablename = $1 AND schemaname = 'public';`,
      [t]
    );

    const fkRes = await pool.query(
      `SELECT
         kcu.column_name, 
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name 
       FROM information_schema.table_constraints AS tc 
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;`,
      [t]
    );

    const auditFields = [
      'id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'version', 'deleted_at'
    ];
    const colNames = colRes.rows.map(r => r.column_name);
    const missingAudit = auditFields.filter(f => !colNames.includes(f));

    console.log(`\nTable: [${t}]`);
    console.log(`  Columns (${colRes.rows.length}): ${colNames.slice(0, 8).join(', ')}...`);
    console.log(`  Indexes (${idxRes.rows.length}): ${idxRes.rows.map(r => r.indexname).join(', ')}`);
    console.log(`  Foreign Keys (${fkRes.rows.length}): ${fkRes.rows.map(r => `${r.column_name}->${r.foreign_table_name}`).join(', ')}`);
    console.log(`  Audit check: ${missingAudit.length === 0 ? 'PASS (all present)' : 'FAIL (missing ' + missingAudit.join(', ') + ')'}`);
  }

  await pool.end();
}

applyMigration().catch(err => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
