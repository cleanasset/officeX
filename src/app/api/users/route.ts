import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { NextResponse } from 'next/server';
import { getAuthContext, isAuthenticated } from "@/lib/rent-roll/auth-context";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Authentication required to view users." }, { status: 401 });
    }

    const auth = getAuthContext(request);
    if (!auth.isSuperAdmin && auth.role !== "super_admin" && auth.role !== "org_admin") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    // Exclude passwordHash and sensitive credentials completely
    const list = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return NextResponse.json({ users: list }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Authentication required to provision users." }, { status: 401 });
    }

    const auth = getAuthContext(request);
    if (!auth.isSuperAdmin && auth.role !== "super_admin" && auth.role !== "org_admin") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { email, fullName, role, password } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, or role." }, { status: 400 });
    }

    // Insert user into Supabase PostgreSQL - Store managed placeholder or hashed value, never expose plaintext
    const newUser = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      passwordHash: password ? "SUPABASE_AUTH_MANAGED" : "SUPABASE_AUTH_MANAGED",
      fullName: fullName.trim(),
      role: role as any
    }).returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    // Log user creation to Audit Logs
    await db.insert(auditLogs).values({
      traceId: "TR-" + Math.floor(Math.random() * 900000 + 100000),
      module: "User Provisioning",
      action: `Provisioned user account: "${fullName}" | Role: ${role} | Email: ${email}`,
      ipAddress: "127.0.0.1",
      severity: "info"
    });

    return NextResponse.json({ success: true, user: newUser[0] }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === '23505') {
      return NextResponse.json({ error: "Email address already registered." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error adding user account." }, { status: 500 });
  }
}
