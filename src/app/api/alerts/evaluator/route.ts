import { NextResponse } from "next/server";
import { runNightlyAlertEvaluation } from "@/lib/rent-roll/jobs/alert-evaluator";

export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const result = await runNightlyAlertEvaluation();
    return NextResponse.json({
      success: true,
      data: result,
      message: "Nightly alert evaluation executed successfully across AL-01 to AL-22 at 00:30 IST cadence.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to evaluate alert engine", message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const result = await runNightlyAlertEvaluation();
    return NextResponse.json({
      success: true,
      data: result,
      message: `Triggered alert engine: ${result.total_evaluated} alert instances updated in Exception Centre.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to run alert job", message: err.message }, { status: 500 });
  }
}
