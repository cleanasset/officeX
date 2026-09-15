import { NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog, ExpenseEntity } from "@/lib/rent-roll-store";
import { round2 } from "@/lib/rent-roll-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const category = searchParams.get("category");

    const db = getRentRollDb();
    let expenses = db.expenses;

    if (propertyId && propertyId !== "ALL") {
      expenses = expenses.filter(e => e.propertyId === propertyId);
    }
    if (category && category !== "ALL") {
      expenses = expenses.filter(e => e.expenseCategory === category);
    }

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("GET /api/rent-roll/expenses error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      propertyId,
      expenseCategory,
      vendorName,
      invoiceNumber,
      expenseDate,
      amount,
      gstAmount,
      paidDate,
      description
    } = body;

    if (!propertyId || !expenseCategory || !vendorName || !amount) {
      return NextResponse.json({ error: "Missing required expense fields" }, { status: 400 });
    }

    const db = getRentRollDb();
    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const amt = Number(amount);
    const gst = Number(gstAmount || 0);
    const total = round2(amt + gst);

    const newExpense: ExpenseEntity = {
      id: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orgId: db.organization.id,
      propertyId: prop.id,
      propertyName: prop.name,
      expenseCategory: expenseCategory || "cam",
      vendorName,
      invoiceNumber: invoiceNumber || "",
      expenseDate: expenseDate || new Date().toISOString().split('T')[0],
      amount: amt,
      gstAmount: gst,
      totalAmount: total,
      paidDate: paidDate || new Date().toISOString().split('T')[0],
      paymentStatus: "paid",
      description: description || "Operating Expense Entry",
      createdAt: new Date().toISOString()
    };

    db.expenses.unshift(newExpense);

    recordAuditLog({
      entityName: "Expense",
      action: "CREATE_EXPENSE",
      newValues: { property: prop.name, category: expenseCategory, totalAmount: total },
      changedBy: "Operations Manager"
    });

    saveRentRollDb(db);

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rent-roll/expenses error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
