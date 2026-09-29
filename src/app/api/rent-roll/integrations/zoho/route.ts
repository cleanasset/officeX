import { NextRequest, NextResponse } from "next/server";
import { getRentRollDb, saveRentRollDb, recordAuditLog } from "@/lib/rent-roll-store";

export async function GET() {
  try {
    const db = getRentRollDb();
    const zohoConfig = db.config?.zohoConfig || {
      orgId: "",
      authToken: "",
      domain: "zoho.in",
      isConnected: false,
      lastSyncTimestamp: null,
      lastSyncStatus: null,
      lastSyncMessage: null
    };

    return NextResponse.json({
      success: true,
      config: {
        ...zohoConfig,
        // Mask authToken for security
        authTokenMasked: zohoConfig.authToken ? `••••••••${zohoConfig.authToken.slice(-4)}` : ""
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orgId, authToken, domain } = body;
    const db = getRentRollDb();

    if (!db.config) {
      db.config = {} as any;
    }

    if (!db.config.zohoConfig) {
      db.config.zohoConfig = {
        orgId: orgId || "",
        authToken: authToken || "",
        domain: domain || "zoho.in",
        isConnected: false,
        lastSyncTimestamp: null,
        lastSyncStatus: null,
        lastSyncMessage: null
      };
    } else {
      if (orgId !== undefined) db.config.zohoConfig.orgId = orgId;
      if (authToken) db.config.zohoConfig.authToken = authToken;
      if (domain) db.config.zohoConfig.domain = domain;
    }

    const currentOrgId = db.config.zohoConfig.orgId;
    const currentToken = db.config.zohoConfig.authToken;
    const currentDomain = db.config.zohoConfig.domain || "zoho.in";

    // Action 1: Test Live Connection to Zoho Books REST API
    if (action === "test") {
      if (!currentOrgId || !currentToken) {
        return NextResponse.json({
          success: false,
          isLive: false,
          statusText: "Credentials Required",
          message: "Please enter your Zoho Books Organization ID and OAuth Bearer Token from api-console.zoho.in to connect to your live account."
        });
      }

      try {
        const zohoApiUrl = `https://books.${currentDomain}/api/v3/organizations?organization_id=${currentOrgId}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(zohoApiUrl, {
          headers: {
            "Authorization": `Zoho-oauthtoken ${currentToken}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (response.ok && data.code === 0) {
          db.config.zohoConfig.isConnected = true;
          saveRentRollDb(db);
          return NextResponse.json({
            success: true,
            isLive: true,
            statusText: "Connected to Live Zoho Books Account",
            message: `Successfully authenticated with Zoho Books organization: "${data.organizations?.[0]?.name || currentOrgId}"`,
            organizationDetails: data.organizations?.[0]
          });
        } else {
          db.config.zohoConfig.isConnected = false;
          saveRentRollDb(db);
          return NextResponse.json({
            success: false,
            isLive: false,
            statusText: `Zoho API Error (${data.code || response.status})`,
            message: data.message || `Zoho rejected token with HTTP ${response.status}. Check your OAuth token validity.`
          });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          isLive: false,
          statusText: "Connection Failed",
          message: `Network error connecting to https://books.${currentDomain}: ${err.message}`
        });
      }
    }

    // Action 2: Sync Invoices to Zoho Books
    if (action === "sync") {
      if (!currentOrgId || !currentToken) {
        return NextResponse.json({
          success: false,
          isLive: false,
          message: "Cannot sync: Zoho Books credentials not configured. Please enter your Org ID and Auth Token."
        });
      }

      // Read real invoices
      const invoices = (db.invoices || []).slice(0, 10);
      let successCount = 0;
      let errors: any[] = [];

      for (const inv of invoices) {
        try {
          const zohoInvoicePayload = {
            customer_name: inv.tenantName,
            invoice_number: inv.invoiceNumber,
            date: inv.invoiceDate,
            due_date: inv.dueDate,
            line_items: [
              {
                name: "Commercial Office Base Rent",
                rate: inv.baseRent,
                quantity: 1,
                hsn_or_sac: "997212"
              },
              ...(inv.camCharges > 0 ? [{
                name: "Common Area Maintenance (CAM)",
                rate: inv.camCharges,
                quantity: 1,
                hsn_or_sac: "998599"
              }] : [])
            ]
          };

          const res = await fetch(`https://books.${currentDomain}/api/v3/invoices?organization_id=${currentOrgId}`, {
            method: "POST",
            headers: {
              "Authorization": `Zoho-oauthtoken ${currentToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(zohoInvoicePayload)
          });

          const resData = await res.json();
          if (res.ok && resData.code === 0) {
            successCount++;
          } else {
            errors.push({ invoiceNumber: inv.invoiceNumber, error: resData.message || `HTTP ${res.status}` });
          }
        } catch (e: any) {
          errors.push({ invoiceNumber: inv.invoiceNumber, error: e.message });
        }
      }

      db.config.zohoConfig.lastSyncTimestamp = new Date().toISOString();
      db.config.zohoConfig.lastSyncStatus = successCount > 0 ? "success" : "failed";
      db.config.zohoConfig.lastSyncMessage = `Synced ${successCount} invoices to Zoho Books. ${errors.length} failed.`;
      saveRentRollDb(db);

      recordAuditLog({
        entityName: "ZohoBooksIntegration",
        action: "SYNC_INVOICES_TO_ZOHO",
        newValues: { successCount, errorsCount: errors.length },
        changedBy: "Finance AR / Zoho Connector"
      });

      return NextResponse.json({
        success: successCount > 0,
        syncedCount: successCount,
        errors,
        message: `Synced ${successCount} invoices to Zoho Books. ${errors.length > 0 ? `${errors.length} errors.` : ""}`
      });
    }

    saveRentRollDb(db);
    return NextResponse.json({ success: true, config: db.config.zohoConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
