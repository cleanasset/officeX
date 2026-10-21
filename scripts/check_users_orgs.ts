import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  const users = await db.execute(sql.raw(`SELECT id, email, full_name, role FROM users`));
  console.log("Users:", users.rows);
  const orgs = await db.execute(sql.raw(`SELECT id, name, slug FROM organization`));
  console.log("Organizations:", orgs.rows);
  const clients = await db.execute(sql.raw(`SELECT id, name FROM client_account`));
  console.log("Client Accounts:", clients.rows);
}

main().catch(console.error);
