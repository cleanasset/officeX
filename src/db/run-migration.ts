import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function run() {
  // Use explicit connection params to handle '@' in password cleanly
  const pool = new Pool({
    user: 'postgres.ovvdmbpdmtpxltsnkirx',
    password: 'officeX@18129001',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connected to DB, checking connection...");
  const res = await pool.query("SELECT current_database(), current_user;");
  console.log("DB Test success:", res.rows[0]);

  console.log("Applying migration statements...");
  const sqlFilePath = path.join(__dirname, '../../drizzle/0001_dry_gideon.sql');
  const rawSql = fs.readFileSync(sqlFilePath, 'utf8');

  // Split by statement-breakpoint
  const statements = rawSql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await pool.query(stmt);
      successCount++;
      console.log(`[${i + 1}/${statements.length}] Success: ${stmt.slice(0, 50).replace(/\n/g, ' ')}...`);
    } catch (err: any) {
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate') ||
        err.message.includes('does not exist')
      ) {
        skippedCount++;
        console.log(`[${i + 1}/${statements.length}] Skipped (${err.message.slice(0, 40)}...)`);
      } else {
        console.warn(`[${i + 1}/${statements.length}] Notice: ${err.message} in stmt: \n${stmt}`);
      }
    }
  }

  console.log(`\nMigration completed! Success: ${successCount}, Skipped/Existing: ${skippedCount}`);
  await pool.end();
}

run().catch(err => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
