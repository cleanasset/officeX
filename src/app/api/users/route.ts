import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET() {
  try {
    const list = await db.select().from(users);
    return NextResponse.json({ users: list }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, fullName, role, password } = await request.json();

    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, or role." }, { status: 400 });
    }

    // Insert user into Supabase PostgreSQL
    const newUser = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash: password || "123456",
      fullName: fullName,
      role: role as any
    }).returning();

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
