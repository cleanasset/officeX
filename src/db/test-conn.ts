import { Pool } from 'pg';

async function testConnections() {
  const configs = [
    {
      name: "Direct Host (db.<ref>.supabase.co:5432)",
      config: {
        user: 'postgres',
        password: 'officeX@18129001',
        host: 'db.ovvdmbpdmtpxltsnkirx.supabase.co',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Pooler Host Session (aws-0-ap-southeast-1.pooler.supabase.com:5432)",
      config: {
        user: 'postgres.ovvdmbpdmtpxltsnkirx',
        password: 'officeX@18129001',
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Pooler Host Transaction (aws-0-ap-southeast-1.pooler.supabase.com:6543)",
      config: {
        user: 'postgres.ovvdmbpdmtpxltsnkirx',
        password: 'officeX@18129001',
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      }
    }
  ];

  for (const c of configs) {
    console.log(`Testing ${c.name}...`);
    try {
      const pool = new Pool(c.config);
      const res = await pool.query("SELECT current_database(), current_user, version();");
      console.log(`>>> SUCCESS on ${c.name}:`, res.rows[0]);
      await pool.end();
      return c.config;
    } catch (err: any) {
      console.log(`>>> FAILED on ${c.name}:`, err.message);
    }
  }
}

testConnections();
