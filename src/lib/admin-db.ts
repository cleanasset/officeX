import { Pool } from "pg";

const globalForAdminDb = globalThis as unknown as { adminPool: Pool | undefined };

export function getAdminPool(): Pool {
  if (globalForAdminDb.adminPool) return globalForAdminDb.adminPool;

  const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const connStr = rawUrl.includes("officeX@18129001")
    ? rawUrl.replace("officeX@18129001", "officeX%4018129001")
    : rawUrl;

  const adminPool = new Pool({
    connectionString: connStr,
    ssl: {
      rejectUnauthorized: false
    },
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  });

  globalForAdminDb.adminPool = adminPool;
  return adminPool;
}

