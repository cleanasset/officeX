import { Pool } from "pg";

let pool: Pool | null = null;

export function getAdminPool(): Pool {
  if (pool) return pool;

  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  const connStr = rawUrl.includes("officeX@18129001")
    ? rawUrl.replace("officeX@18129001", "officeX%4018129001")
    : rawUrl;

  pool = new Pool({
    connectionString: connStr,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  return pool;
}

