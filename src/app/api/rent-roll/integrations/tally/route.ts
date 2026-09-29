import { NextRequest, NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";
import { generateTallyPrimeXml } from "@/lib/rent-roll-engine";

export async function GET() {
  try {
    const db = getRentRollDb();
    const tallyConfig = db.config?.tallyConfig || {
      serverUrl: "http://localhost:9000",
      companyName: db.organization.name || "Commercial Asset SPV",
      autoSyncOnApproval: false,
      ledgers: {
        rentIncome: "Commercial Rental Income",
        camIncome: "CAM Recoveries",
        cgst: "Output CGST @ 9%",
        sgst: "Output SGST @ 9%",
        igst: "Output IGST @ 18%",
        bankLedger: "HDFC Bank Escrow Collection A/c",
        tdsLedger: "TDS Receivable u/s 194-I",
        partyGroup: "Sundry Debtors"
      },
      lastSyncTimestamp: null,
      lastSyncStatus: null,
      lastSyncMessage: null
    };

    return NextResponse.json({
      success: true,
      config: tallyConfig,
      invoicesCount: (db.invoices || []).length,
      collectionsCount: (db.collections || []).length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, serverUrl, companyName, ledgers, autoSyncOnApproval } = body;
    const db = getRentRollDb();

    if (!db.config) {
      db.config = {} as any;
    }

    // 1. Update Configuration
    if (!db.config.tallyConfig) {
      db.config.tallyConfig = {
        serverUrl: serverUrl || "http://localhost:9000",
        companyName: companyName || db.organization.name || "Commercial Asset SPV",
        autoSyncOnApproval: !!autoSyncOnApproval,
        ledgers: ledgers || {
          rentIncome: "Commercial Rental Income",
          camIncome: "CAM Recoveries",
          cgst: "Output CGST @ 9%",
          sgst: "Output SGST @ 9%",
          igst: "Output IGST @ 18%",
          bankLedger: "HDFC Bank Escrow Collection A/c",
          tdsLedger: "TDS Receivable u/s 194-I",
          partyGroup: "Sundry Debtors"
        },
        lastSyncTimestamp: null,
        lastSyncStatus: null,
        lastSyncMessage: null
      };
    } else {
      if (serverUrl) db.config.tallyConfig.serverUrl = serverUrl;
      if (companyName) db.config.tallyConfig.companyName = companyName;
      if (ledgers) db.config.tallyConfig.ledgers = { ...db.config.tallyConfig.ledgers, ...ledgers };
      if (typeof autoSyncOnApproval === "boolean") db.config.tallyConfig.autoSyncOnApproval = autoSyncOnApproval;
    }

    const currentUrl = db.config.tallyConfig.serverUrl || "http://localhost:9000";
    const currentCompany = db.config.tallyConfig.companyName || db.organization.name || "Commercial Asset SPV";

    // 2. Action: Test Connectivity to Real Tally XML Server
    if (action === "test") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        // Ping Tally's XML Server with a lightweight metadata request
        const pingXml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <EXPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>List of Companies</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
    </EXPORTDATA>
  </BODY>
</ENVELOPE>`;

        const response = await fetch(currentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml;charset=utf-8",
            "Content-Length": Buffer.byteLength(pingXml).toString()
          },
          body: pingXml,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          return NextResponse.json({
            success: true,
            isLive: true,
            statusText: "Connected to Live Tally Prime XML Server",
            message: `Tally responded successfully on ${currentUrl}. HTTP ${response.status}`,
            rawPreview: text.slice(0, 300)
          });
        } else {
          return NextResponse.json({
            success: false,
            isLive: false,
            statusText: `Tally Server responded with HTTP ${response.status}`,
            message: `Tally XML server responded with an error. Check if Company "${currentCompany}" is opened.`
          });
        }
      } catch (err: any) {
        // Real network failure (e.g. ECONNREFUSED when Tally is not running locally on this machine)
        return NextResponse.json({
          success: false,
          isLive: false,
          statusText: "Connection Failed (ECONNREFUSED / Offline)",
          error: err.name === "AbortError" ? "Connection timed out after 3500ms" : err.message,
          message: `Could not connect to ${currentUrl}. If Tally Prime is running on a different office PC, ensure its IP is reachable and Port 9000 is open in Windows Firewall. You can always use the 1-Click XML Voucher file export immediately.`
        });
      }
    }

    // 3. Action: Live Push Vouchers into Tally Prime
    if (action === "sync") {
      const invoices = db.invoices || [];
      const collections = db.collections || [];
      const notes = db.adjustmentNotes || [];

      const xmlContent = generateTallyPrimeXml({
        companyName: currentCompany,
        invoices: invoices.map(i => ({
          invoiceNumber: i.invoiceNumber,
          invoiceDate: i.invoiceDate,
          tenantName: i.tenantName,
          baseRent: i.baseRent,
          camCharges: i.camCharges,
          gstAmount: i.gstAmount,
          grossTotal: i.grossTotal,
          placeOfSupply: "Maharashtra"
        })),
        collections: collections.map(c => ({
          receiptNumber: c.receiptNumber,
          paymentDate: c.paymentDate,
          tenantName: c.tenantName,
          amountReceived: c.amountReceived,
          tdsDeducted: c.tdsDeducted,
          paymentMode: c.paymentMode,
          referenceNumber: c.referenceNumber,
          bankAccount: c.bankAccount
        })),
        adjustmentNotes: notes.map(n => ({
          noteNumber: n.noteNumber,
          noteType: n.noteType,
          issuedDate: n.issuedDate,
          reason: n.reason,
          amount: n.amount,
          gstAmount: n.gstAmount,
          totalAdjustment: n.totalAdjustment,
          invoiceNumber: n.invoiceId
        }))
      });

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(currentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml;charset=utf-8",
            "Content-Length": Buffer.byteLength(xmlContent).toString()
          },
          body: xmlContent,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const respText = await response.text();

        db.config.tallyConfig.lastSyncTimestamp = new Date().toISOString();
        db.config.tallyConfig.lastSyncStatus = response.ok ? "success" : "failed";
        db.config.tallyConfig.lastSyncMessage = `Live push to Tally: HTTP ${response.status}`;
        saveRentRollDb(db);

        recordAuditLog({
          entityName: "TallyIntegration",
          action: "SYNC_VOUCHERS_TO_TALLY",
          newValues: {
            invoicesCount: invoices.length,
            collectionsCount: collections.length,
            tallyServerUrl: currentUrl,
            status: response.status
          },
          changedBy: "Finance AR / Tally Connector"
        });

        return NextResponse.json({
          success: response.ok,
          isLive: true,
          message: response.ok ? `Successfully transmitted vouchers to Tally Prime on ${currentUrl}!` : `Tally rejected payload with HTTP ${response.status}`,
          tallyResponse: respText.slice(0, 500),
          invoicesSynced: invoices.length,
          collectionsSynced: collections.length
        });
      } catch (networkErr: any) {
        // Tally server not reachable over network: provide clear explanation and fallback XML download
        db.config.tallyConfig.lastSyncTimestamp = new Date().toISOString();
        db.config.tallyConfig.lastSyncStatus = "failed";
        db.config.tallyConfig.lastSyncMessage = `Cannot reach ${currentUrl}: ${networkErr.message}`;
        saveRentRollDb(db);

        return NextResponse.json({
          success: false,
          isLive: false,
          error: networkErr.message,
          message: `Cannot reach Tally on ${currentUrl} (${networkErr.message}). You can download the generated XML voucher file right below and import into Tally in 10 seconds.`,
          xmlFallbackAvailable: true,
          xmlPayloadSize: xmlContent.length
        });
      }
    }

    saveRentRollDb(db);
    return NextResponse.json({ success: true, config: db.config.tallyConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
