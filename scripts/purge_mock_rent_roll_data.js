const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const connStr = rawUrl.includes('officeX@18129001')
  ? rawUrl.replace('officeX@18129001', 'officeX%4018129001')
  : rawUrl;

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false }
});

async function purgeMockRentRollData() {
  console.log("=== STARTING PURGE OF MOCK / PRE-SEEDED RENT ROLL DATA ===");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Invoices & lines
    try {
      const r1 = await client.query("DELETE FROM invoice_line");
      console.log(`Deleted ${r1.rowCount} rows from invoice_line`);
    } catch (e) {
      console.log("invoice_line:", e.message);
    }

    try {
      const r2 = await client.query("DELETE FROM invoices");
      console.log(`Deleted ${r2.rowCount} rows from invoices`);
    } catch (e) {
      console.log("invoices:", e.message);
    }

    // 2. Deposit transactions
    try {
      const r3 = await client.query("DELETE FROM deposit_transactions");
      console.log(`Deleted ${r3.rowCount} rows from deposit_transactions`);
    } catch (e) {
      console.log("deposit_transactions:", e.message);
    }

    // 3. Reminders & concessions
    try {
      const r4 = await client.query("DELETE FROM tenant_reminders");
      console.log(`Deleted ${r4.rowCount} rows from tenant_reminders`);
    } catch (e) {
      console.log("tenant_reminders:", e.message);
    }

    try {
      const r5 = await client.query("DELETE FROM concession");
      console.log(`Deleted ${r5.rowCount} rows from concession`);
    } catch (e) {
      console.log("concession:", e.message);
    }

    // 4. Rent steps & charges
    try {
      const r6 = await client.query("DELETE FROM rent_step");
      console.log(`Deleted ${r6.rowCount} rows from rent_step`);
    } catch (e) {
      console.log("rent_step:", e.message);
    }

    try {
      const r7 = await client.query("DELETE FROM contract_charge");
      console.log(`Deleted ${r7.rowCount} rows from contract_charge`);
    } catch (e) {
      console.log("contract_charge:", e.message);
    }

    try {
      const r8 = await client.query("DELETE FROM contract_space");
      console.log(`Deleted ${r8.rowCount} rows from contract_space`);
    } catch (e) {
      console.log("contract_space:", e.message);
    }

    try {
      const r9 = await client.query("DELETE FROM contract_documents");
      console.log(`Deleted ${r9.rowCount} rows from contract_documents`);
    } catch (e) {
      console.log("contract_documents:", e.message);
    }

    // 5. Contracts
    try {
      const r10 = await client.query("DELETE FROM contract");
      console.log(`Deleted ${r10.rowCount} rows from contract`);
    } catch (e) {
      console.log("contract:", e.message);
    }

    // 6. Meters & CAM Pools
    try {
      const r11 = await client.query("DELETE FROM meter_readings");
      console.log(`Deleted ${r11.rowCount} rows from meter_readings`);
    } catch (e) {
      console.log("meter_readings:", e.message);
    }

    try {
      const r12 = await client.query("DELETE FROM meters");
      console.log(`Deleted ${r12.rowCount} rows from meters`);
    } catch (e) {
      console.log("meters:", e.message);
    }

    try {
      const r13 = await client.query("DELETE FROM cam_pools");
      console.log(`Deleted ${r13.rowCount} rows from cam_pools`);
    } catch (e) {
      console.log("cam_pools:", e.message);
    }

    // 7. Mock Seat Counts & Tasks
    try {
      const r14 = await client.query("DELETE FROM seat_counts");
      console.log(`Deleted ${r14.rowCount} rows from seat_counts`);
    } catch (e) {
      console.log("seat_counts:", e.message);
    }

    try {
      const r15 = await client.query("DELETE FROM task WHERE title LIKE '%Wave5%' OR title LIKE '%PTP%'");
      console.log(`Deleted ${r15.rowCount} rows from task`);
    } catch (e) {
      console.log("task:", e.message);
    }

    // 8. Spaces, Buildings, Properties
    try {
      const r16 = await client.query("DELETE FROM space");
      console.log(`Deleted ${r16.rowCount} rows from space`);
    } catch (e) {
      console.log("space:", e.message);
    }

    try {
      const r17 = await client.query("DELETE FROM building");
      console.log(`Deleted ${r17.rowCount} rows from building`);
    } catch (e) {
      console.log("building:", e.message);
    }

    try {
      const r18 = await client.query("DELETE FROM property");
      console.log(`Deleted ${r18.rowCount} rows from property`);
    } catch (e) {
      console.log("property:", e.message);
    }

    // 9. Occupants
    try {
      const r19 = await client.query("DELETE FROM occupant");
      console.log(`Deleted ${r19.rowCount} rows from occupant`);
    } catch (e) {
      console.log("occupant:", e.message);
    }

    // 10. Billing entities
    try {
      const r20 = await client.query("DELETE FROM billing_entity");
      console.log(`Deleted ${r20.rowCount} rows from billing_entity`);
    } catch (e) {
      console.log("billing_entity:", e.message);
    }

    // 11. Purge the mock test organization 'Prestige Tech Horizon LLP' (63d0b707-22c0-4b07-a292-d1f344ca8b1e)
    try {
      await client.query("DELETE FROM client_account WHERE org_id = '63d0b707-22c0-4b07-a292-d1f344ca8b1e'");
      await client.query("DELETE FROM organization WHERE id = '63d0b707-22c0-4b07-a292-d1f344ca8b1e'");
      await client.query("DELETE FROM organizations WHERE id = '63d0b707-22c0-4b07-a292-d1f344ca8b1e'");
      console.log("Purged mock test org Prestige Tech Horizon LLP");
    } catch (e) {
      console.log("test org purge:", e.message);
    }

    await client.query("COMMIT");
    console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Purge failed, rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

purgeMockRentRollData();
