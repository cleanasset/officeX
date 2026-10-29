import { NextRequest, NextResponse } from "next/server";
import { getAdminPool } from "@/lib/admin-db";

// Core tables categorization for clean UI grouping
export const TABLE_CATEGORIES: Record<string, string[]> = {
  "Marketplace": [
    "marketplace_listings",
    "marketplace_deals",
    "marketplace_enquiries",
    "marketplace_owners",
    "marketplace_site_visits"
  ],
  "Rent Roll & Properties": [
    "property",
    "properties",
    "building",
    "buildings",
    "space",
    "spaces",
    "floors",
    "seat_counts",
    "seat_inventories"
  ],
  "Leases & Contracts": [
    "contract",
    "contracts",
    "leases",
    "lease_units",
    "lease_notices",
    "rent_steps",
    "contract_charges",
    "contract_clauses",
    "contract_documents",
    "deal",
    "deals"
  ],
  "Billing & Invoices": [
    "invoices",
    "invoice_line",
    "payment",
    "payments",
    "payment_allocations",
    "deposit_transactions",
    "collections",
    "billing_runs",
    "billing_entities",
    "billing_entity"
  ],
  "FM & Operations": [
    "rfqs",
    "quotations",
    "work_orders",
    "ppm_tasks",
    "assets",
    "helpdesk_tickets",
    "task",
    "kyc_cases"
  ],
  "CAM & Utilities": [
    "cam_pools",
    "cam_pool_costs",
    "meters",
    "meter_readings",
    "utility_metrics",
    "tariffs"
  ],
  "Compliance & Visitors": [
    "visitors",
    "visits",
    "compliance_certificates",
    "compliance_obligations",
    "cm_incidents",
    "cm_permits",
    "cm_risks",
    "vc_visitors",
    "vc_visits"
  ],
  "Users & Organizations": [
    "users",
    "organizations",
    "organization",
    "organization_memberships",
    "vendor_profiles",
    "broker_profiles",
    "owner_profiles"
  ],
  "Platform Pricing & Settings": [
    "pricing_plans",
    "tariffs",
    "system_kv_store",
    "rent_roll_configurations"
  ]
};

export async function GET(request: NextRequest) {
  try {
    const pool = getAdminPool();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const tableName = searchParams.get("table");

    // 1. Return list of all tables in the database with row counts and categories
    if (action === "tables" || !tableName) {
      const tablesRes = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);

      const allTableNames: string[] = tablesRes.rows.map((r) => r.table_name);

      // Fetch approximate or exact counts for all tables
      const countsRes = await pool.query(`
        SELECT relname as table_name, n_live_tup as approx_count
        FROM pg_stat_user_tables
        WHERE schemaname = 'public';
      `);

      const countMap: Record<string, number> = {};
      countsRes.rows.forEach((r) => {
        countMap[r.table_name] = parseInt(r.approx_count, 10) || 0;
      });

      return NextResponse.json({
        success: true,
        categories: TABLE_CATEGORIES,
        tables: allTableNames.map((tbl) => ({
          name: tbl,
          count: countMap[tbl] ?? 0,
        })),
        totalTables: allTableNames.length,
      });
    }

    // 2. Validate table name exists to prevent SQL injection
    const verifyTable = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );

    if (verifyTable.rows.length === 0) {
      return NextResponse.json(
        { error: `Table '${tableName}' does not exist` },
        { status: 404 }
      );
    }

    // 3. Inspect single row detail
    if (action === "row") {
      const rowId = searchParams.get("id");
      const pkCol = searchParams.get("pk") || "id";
      if (!rowId) {
        return NextResponse.json({ error: "Row ID is required" }, { status: 400 });
      }

      // Safe parameterized query
      const rowRes = await pool.query(
        `SELECT * FROM "${tableName}" WHERE "${pkCol}"::text = $1 LIMIT 1`,
        [rowId]
      );

      if (rowRes.rows.length === 0) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        table: tableName,
        row: rowRes.rows[0],
      });
    }

    // 4. Query columns metadata
    const colsRes = await pool.query(
      `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1 
      ORDER BY ordinal_position;
    `,
      [tableName]
    );

    // Identify primary key column
    const pkRes = await pool.query(
      `
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1;
    `,
      [tableName]
    );

    const primaryKey = pkRes.rows[0]?.column_name || "id";
    const columns = colsRes.rows;

    // 5. Query paginated records with optional search and sort
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();
    const sortBy = searchParams.get("sortBy") || primaryKey;
    const sortDir = (searchParams.get("sortDir") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    // Validate that sortBy column exists
    const validSortCol = columns.some((c) => c.column_name === sortBy) ? sortBy : primaryKey;

    let whereClause = "";
    const queryParams: any[] = [];

    if (search) {
      // Find searchable text/char/uuid columns
      const textCols = columns
        .filter((c) =>
          ["character varying", "text", "character", "uuid"].includes(c.data_type)
        )
        .map((c) => `"${c.column_name}"::text ILIKE $1`);

      if (textCols.length > 0) {
        whereClause = `WHERE (${textCols.join(" OR ")})`;
        queryParams.push(`%${search}%`);
      }
    }

    // Get exact count matching query
    const countQuery = `SELECT count(*) as total FROM "${tableName}" ${whereClause}`;
    const totalCountRes = await pool.query(countQuery, queryParams);
    const total = parseInt(totalCountRes.rows[0]?.total || "0", 10);

    // Get paginated rows
    const dataQuery = `
      SELECT * 
      FROM "${tableName}" 
      ${whereClause}
      ORDER BY "${validSortCol}" ${sortDir} NULLS LAST
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const rowsRes = await pool.query(dataQuery, [...queryParams, limit, offset]);

    return NextResponse.json({
      success: true,
      table: tableName,
      primaryKey,
      columns,
      rows: rowsRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error("Admin DB route error:", err);
    return NextResponse.json(
      { error: "Database operation failed", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = getAdminPool();
    const body = await request.json();
    const { table, id, primaryKeyCol = "id", data } = body;

    if (!table || id === undefined || !data) {
      return NextResponse.json(
        { error: "Missing required parameters: table, id, or data" },
        { status: 400 }
      );
    }

    // Verify table exists
    const verifyTable = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );

    if (verifyTable.rows.length === 0) {
      return NextResponse.json({ error: `Table '${table}' not found` }, { status: 404 });
    }

    // Verify columns exist
    const colsRes = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );
    const validColMap = new Map(colsRes.rows.map((c) => [c.column_name, c.data_type]));

    // Build update assignments safely
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    for (const [key, rawVal] of Object.entries(data)) {
      if (key === primaryKeyCol || !validColMap.has(key)) {
        continue; // Skip primary key or non-existent columns
      }

      const colType = validColMap.get(key);
      let valueToStore = rawVal;

      // Handle JSONB / JSON formatting
      if (colType === "jsonb" || colType === "json") {
        if (typeof rawVal === "object" && rawVal !== null) {
          valueToStore = JSON.stringify(rawVal);
        }
      }

      setClauses.push(`"${key}" = $${paramIdx}`);
      values.push(valueToStore);
      paramIdx++;
    }

    // Automatically touch updated_at if column exists and not provided
    if (validColMap.has("updated_at") && !data.updated_at) {
      setClauses.push(`"updated_at" = NOW()`);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No valid columns provided to update" }, { status: 400 });
    }

    values.push(id);
    const updateQuery = `
      UPDATE "${table}" 
      SET ${setClauses.join(", ")}
      WHERE "${primaryKeyCol}"::text = $${paramIdx}
      RETURNING *;
    `;

    const updateRes = await pool.query(updateQuery, values);

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ error: "Record not found to update" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      updatedRecord: updateRes.rows[0],
      message: `Successfully updated record ${id} in ${table}`,
    });
  } catch (err: any) {
    console.error("Admin DB update error:", err);
    return NextResponse.json(
      { error: "Failed to update database record", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const pool = getAdminPool();
    const body = await request.json();
    const { table, id, primaryKeyCol = "id" } = body;

    if (!table || id === undefined) {
      return NextResponse.json({ error: "Missing table or id" }, { status: 400 });
    }

    // Verify table exists
    const verifyTable = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );

    if (verifyTable.rows.length === 0) {
      return NextResponse.json({ error: `Table '${table}' not found` }, { status: 404 });
    }

    const deleteRes = await pool.query(
      `DELETE FROM "${table}" WHERE "${primaryKeyCol}"::text = $1 RETURNING "${primaryKeyCol}"`,
      [id]
    );

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ error: "Record not found to delete" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: `Successfully deleted record ${id} from ${table}`,
    });
  } catch (err: any) {
    console.error("Admin DB delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete record", details: err.message },
      { status: 500 }
    );
  }
}

