import { Pool } from 'pg';
import { supabaseAdmin } from './supabase';

let pgPool: Pool | null = null;

function getPool(): Pool | null {
  if (pgPool) return pgPool;

  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  if (!rawUrl) return null;

  try {
    const connStr = rawUrl.includes('officeX@18129001')
      ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
      : rawUrl;

    pgPool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      max: 5
    });

    return pgPool;
  } catch (err) {
    console.warn('[CLOUD_DB] Failed to initialize Postgres pool:', err);
    return null;
  }
}

let tableEnsured = false;
async function ensureKvTable(pool: Pool) {
  if (tableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_kv_store (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn('[CLOUD_DB] Notice on ensureKvTable:', err);
  }
}

/**
 * Persist database snapshot asynchronously to Supabase PostgreSQL.
 * Survives all Vercel redeployments and container teardowns.
 */
export async function persistDbToCloud(dbData: any, key: string = 'rent_roll_db'): Promise<void> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureKvTable(pool);
      await pool.query(
        `INSERT INTO system_kv_store (key, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = NOW();`,
        [key, JSON.stringify(dbData)]
      );
      return;
    } catch (err) {
      console.warn('[CLOUD_DB] Pool persistence failed, attempting Supabase fallback:', err);
    }
  }

  // Supabase REST fallback
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('system_kv_store').upsert({
        key,
        data: dbData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch {
      // Non-blocking fallback
    }
  }
}

/**
 * Hydrate database snapshot from Supabase PostgreSQL.
 */
export async function fetchDbFromCloud(key: string = 'rent_roll_db'): Promise<any | null> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureKvTable(pool);
      const res = await pool.query(
        `SELECT data FROM system_kv_store WHERE key = $1 LIMIT 1;`,
        [key]
      );
      if (res.rows.length > 0 && res.rows[0].data) {
        return res.rows[0].data;
      }
    } catch (err) {
      console.warn('[CLOUD_DB] Pool fetch failed, attempting Supabase fallback:', err);
    }
  }

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('system_kv_store')
        .select('data')
        .eq('key', key)
        .maybeSingle();

      if (!error && data?.data) {
        return data.data;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  return null;
}
