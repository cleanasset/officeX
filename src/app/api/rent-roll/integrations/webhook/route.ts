import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, event = "test.ping" } = await req.json();

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid HTTP/HTTPS Webhook URL." },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const testPayload = {
      event,
      timestamp: new Date().toISOString(),
      officex_entity: "OfficeX Institutional Rent Roll Hub",
      data: {
        invoiceNumber: "INV-2026-TEST-001",
        tenantTradeName: "Acme Cloud Technologies",
        grossAmountINR: 125000,
        status: "issued",
        dueDate: "2026-05-05",
        testMode: true
      }
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OfficeX-ERP-Webhook-Dispatcher/1.0",
        "X-OfficeX-Event": event,
        "X-OfficeX-Delivery": `del_${Date.now()}`
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;
    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      statusText: response.statusText,
      latencyMs,
      responsePreview: responseText.slice(0, 300),
      message: response.ok
        ? `Successfully delivered test webhook in ${latencyMs}ms. Endpoint returned HTTP ${response.status}.`
        : `Endpoint reachable but returned HTTP ${response.status}: ${response.statusText}`
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      statusCode: 0,
      statusText: "Connection Failed",
      error: err.name === "AbortError" ? "Request timed out after 6000ms" : err.message,
      message: `Could not reach destination webhook: ${err.message}`
    });
  }
}
