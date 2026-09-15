import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connStr = process.env.DATABASE_URL?.includes('officeX@18129001')
  ? process.env.DATABASE_URL.replace('officeX@18129001', 'officeX%4018129001')
  : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connStr,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });
