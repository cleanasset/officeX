import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Prefer DATABASE_URL (Port 6543 pooler) over DIRECT_URL (Port 5432 session) to prevent EMAXCONNSESSION
const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || '';
const connStr = rawUrl.includes('officeX@18129001')
  ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
  : rawUrl;

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: connStr,
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
