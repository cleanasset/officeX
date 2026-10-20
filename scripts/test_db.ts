import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  const result = await db.execute(sql`SELECT 1 as test`);
  console.log('DB Connected successfully! Result:', result.rows);
  process.exit(0);
}

main().catch(err => {
  console.error('DB Connection error:', err);
  process.exit(1);
});
