const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const directUrl = "postgresql://postgres.ovvdmbpdmtpxltsnkirx:officeX@18129001@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const client = new Client({ connectionString: directUrl });

async function run() {
  await client.connect();
  console.log("Connected to PostgreSQL successfully.");

  const email = 'jiyapatel181224@gmail.com';
  const orgId = '8970e102-5e4d-4233-a1c8-897d2a907544';

  const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const tables = tablesRes.rows.map(r => r.table_name);

  console.log(`Found ${tables.length} tables in public schema.`);

  // 1. Identify which tables contain records for this user/org
  const matchedTables = [];
  for (const table of tables) {
    try {
      const colRes = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1`, [table]);
      const cols = colRes.rows.map(c => c.column_name);

      const clauses = [];
      const values = [];

      if (cols.includes('org_id')) {
        values.push(orgId);
        clauses.push(`org_id = $${values.length}`);
      }
      if (cols.includes('orgId')) {
        values.push(orgId);
        clauses.push(`"orgId" = $${values.length}`);
      }
      if (cols.includes('email')) {
        values.push(email);
        clauses.push(`LOWER(email) = LOWER($${values.length})`);
      }
      if (cols.includes('user_email')) {
        values.push(email);
        clauses.push(`LOWER(user_email) = LOWER($${values.length})`);
      }

      if (clauses.length > 0) {
        const queryText = `SELECT COUNT(*) FROM "${table}" WHERE ${clauses.join(' OR ')}`;
        const countRes = await client.query(queryText, values);
        const count = parseInt(countRes.rows[0].count, 10);
        if (count > 0) {
          console.log(`Table [${table}]: ${count} records matching.`);
          matchedTables.push({ table, clauses, values, count });
        }
      }
    } catch (err) {
      console.warn(`Error checking table ${table}:`, err.message);
    }
  }

  // 2. Perform deletions in foreign key safe order or with CASCADE where applicable
  console.log("\nDeleting records across matched tables...");

  // Specifically clean rent roll and subscription tables
  const specificCleanup = [
    // Invoices and financial ledger
    `DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE org_id = '${orgId}')`,
    `DELETE FROM invoices WHERE org_id = '${orgId}'`,
    `DELETE FROM rent_roll_ledger WHERE org_id = '${orgId}'`,
    `DELETE FROM audit_logs WHERE org_id = '${orgId}' OR LOWER(actor_email) = LOWER('${email}')`,

    // Contracts / Leases
    `DELETE FROM contract_units WHERE contract_id IN (SELECT id FROM contract WHERE org_id = '${orgId}')`,
    `DELETE FROM contracts WHERE org_id = '${orgId}'`,
    `DELETE FROM contract WHERE org_id = '${orgId}'`,

    // Tenants
    `DELETE FROM tenants WHERE org_id = '${orgId}'`,
    `DELETE FROM tenant WHERE org_id = '${orgId}'`,

    // Spaces & Buildings
    `DELETE FROM spaces WHERE org_id = '${orgId}' OR "orgId" = '${orgId}'`,
    `DELETE FROM space WHERE org_id = '${orgId}'`,
    `DELETE FROM buildings WHERE org_id = '${orgId}' OR "orgId" = '${orgId}'`,
    `DELETE FROM building WHERE org_id = '${orgId}'`,

    // Properties
    `DELETE FROM properties WHERE org_id = '${orgId}' OR "orgId" = '${orgId}'`,
    `DELETE FROM property WHERE org_id = '${orgId}'`,

    // Property delegations
    `DELETE FROM property_delegations WHERE org_id = '${orgId}'`,

    // Subscriptions
    `DELETE FROM user_subscriptions WHERE LOWER(email) = LOWER('${email}')`,
    `DELETE FROM subscriptions WHERE LOWER(email) = LOWER('${email}') OR org_id = '${orgId}'`,

    // Reset Organization subscription status to none/free and remove org records
    `DELETE FROM billing_entity WHERE org_id = '${orgId}'`,
    `DELETE FROM organization_members WHERE org_id = '${orgId}' OR LOWER(email) = LOWER('${email}')`,
    `DELETE FROM organizations WHERE id = '${orgId}'`,

    // Keep the user login intact or reset role if needed
    `UPDATE users SET role = 'owner', updated_at = NOW() WHERE LOWER(email) = LOWER('${email}')`
  ];

  for (const sql of specificCleanup) {
    try {
      const res = await client.query(sql);
      console.log(`Executed: ${sql.split('WHERE')[0]} -> ${res.rowCount || 0} rows affected.`);
    } catch (e) {
      console.warn(`Notice on query [${sql}]:`, e.message);
    }
  }

  // 3. Clear from system_kv_store
  try {
    const kvRes = await client.query("SELECT data FROM system_kv_store WHERE key = 'officex_user_subscriptions'");
    if (kvRes.rows.length > 0) {
      const map = kvRes.rows[0].data || {};
      if (map[email]) {
        delete map[email];
        await client.query("UPDATE system_kv_store SET data = $1 WHERE key = 'officex_user_subscriptions'", [JSON.stringify(map)]);
        console.log(`Removed ${email} from system_kv_store officex_user_subscriptions.`);
      }
    }
  } catch (e) {
    console.warn("Notice updating system_kv_store:", e.message);
  }

  await client.end();
  console.log("\nDatabase cleanup finished!");

  // 4. Clean local persistent subscription cache file
  const subsFile = path.join(process.cwd(), '.officex_subscriptions.json');
  if (fs.existsSync(subsFile)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(subsFile, 'utf-8'));
      if (Array.isArray(fileData)) {
        const filtered = fileData.filter(e => String(e).toLowerCase().trim() !== email);
        fs.writeFileSync(subsFile, JSON.stringify(filtered, null, 2), 'utf-8');
        console.log(`Removed ${email} from .officex_subscriptions.json.`);
      }
    } catch (e) {
      console.warn("Notice updating .officex_subscriptions.json:", e.message);
    }
  }
}

run().catch(console.error);
