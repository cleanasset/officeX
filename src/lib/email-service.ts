import nodemailer from "nodemailer";

export interface SendOtpOptions {
  to: string;
  otp: string;
  name?: string;
  purpose?: "registration" | "login" | "recovery";
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Configure Nodemailer Transporter from standard environment variables
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : undefined;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a real 6-digit verification code to the recipient's email address
 */
export async function sendOtpEmail({
  to,
  otp,
  name = "Valued Customer",
  purpose = "registration",
}: SendOtpOptions): Promise<SendEmailResult> {
  const transporter = getTransporter();

  const title =
    purpose === "registration"
      ? "Verify your OfficeX Account"
      : purpose === "recovery"
      ? "Reset your OfficeX Password"
      : "Your OfficeX Sign-In Code";

  // Fallback if SMTP credentials are not yet entered in .env.local
  if (!transporter) {
    console.warn(
      `\n=========================================================\n` +
      `📧 [OfficeX EMAIL SERVICE ALERT]\n` +
      `SMTP credentials are not configured in .env.local yet!\n` +
      `Recipient: ${to}\n` +
      `Purpose:   ${purpose}\n` +
      `REAL OTP:  👉 ${otp} 👈\n` +
      `Add SMTP_USER and SMTP_PASS to .env.local to send to real inboxes.\n` +
      `=========================================================\n`
    );

    return {
      success: true,
      simulated: true,
    };
  }

  const fromAddress =
    process.env.SMTP_FROM || `"OfficeX Security" <${process.env.SMTP_USER}>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #0b1f3a 0%, #1e3a8a 100%); text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Office<span style="color: #60a5fa;">X</span></span>
                    <span style="color: #93c5fd; font-size: 11px; margin-left: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">· Gateway</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3;">
                ${title}
              </h1>
              
              <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                Hello <strong>${name}</strong>,<br>
                Please use the following 6-digit verification code to complete your security authentication.
              </p>

              <!-- OTP Display Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 16px; padding: 24px;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; text-indent: 10px;">
                      ${otp}
                    </div>
                    <div style="margin-top: 10px; font-size: 12px; font-weight: 600; color: #64748b;">
                      ⏱️ Valid for 10 minutes · Single use only
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
                <strong>Security Notice:</strong> OfficeX will never call or message you asking for your verification code or password. If you did not make this request, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} OfficeX Ecosystem. All rights reserved.<br>
                Workspaces, simplified · Enterprise Commercial Real Estate
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `${otp} is your OfficeX verification code`,
      html: htmlContent,
      text: `Your OfficeX verification code is: ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
    });

    console.log(`[OfficeX Email Service] OTP email successfully delivered to ${to} (MessageId: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[OfficeX Email Service Error] Failed to send email to ${to}:`, error);
    return {
      success: false,
      error: error.message || "Failed to deliver email via SMTP.",
    };
  }
}

export interface SendInvoiceEmailOptions {
  to: string;
  tenantName: string;
  invoiceNumber: string;
  propertyName?: string;
  spaceName?: string;
  grossTotal: number | string;
  dueDate: string;
  invoiceDate?: string;
  brandName?: string;
  brandLogo?: string;
  portalUrl?: string;
}

/**
 * Dispatches a statutory tax invoice notification email to the tenant
 */
export async function sendInvoiceNotificationEmail({
  to,
  tenantName,
  invoiceNumber,
  propertyName = "mango plus tower",
  spaceName = "Suite 101",
  grossTotal,
  dueDate,
  invoiceDate = new Date().toISOString().split("T")[0],
  brandName = "Mango Groups Ltd",
  portalUrl = "https://www.officex.pro/portal/invoices",
}: SendInvoiceEmailOptions): Promise<SendEmailResult> {
  const transporter = getTransporter();
  const formattedAmount = Number(grossTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const fromAddress = process.env.SMTP_FROM || `"OfficeX Finance" <${process.env.SMTP_USER}>`;

  if (!transporter) {
    console.warn(`[OfficeX Email] Transporter not ready. Would send invoice ${invoiceNumber} to ${to}`);
    return { success: true, simulated: true };
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #091e3a 0%, #1e3a8a 100%);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">${brandName}</span>
                    <span style="color: #93c5fd; font-size: 11px; display: block; margin-top: 4px; text-transform: uppercase; font-weight: 600;">Statutory GST Tax Invoice · Rule 46</span>
                  </td>
                  <td align="right">
                    <span style="background: rgba(255,255,255,0.15); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">
                      Due ${dueDate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">
                Dear <strong>${tenantName}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
                Your commercial lease invoice for <strong>${propertyName} &middot; ${spaceName}</strong> has been generated and issued. Please review the itemized breakdown below.
              </p>

              <!-- Invoice Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Invoice Number</span>
                    <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">${invoiceNumber}</div>
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; text-align: right;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Invoice Date</span>
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px;">${invoiceDate}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;" colspan="2">
                    <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Gross Invoice Amount (incl. 18% GST)</span>
                    <div style="font-size: 32px; font-weight: 900; color: #1e3a8a; margin-top: 4px;">
                      ₹${formattedAmount}
                    </div>
                    <div style="font-size: 12px; color: #047857; font-weight: 600; margin-top: 4px;">
                      Payment Due on or before: <strong>${dueDate}</strong> (10-Day Advance Notice Window)
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Remittance Instructions -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 12px; color: #065f46;">
                <strong>Bank Wire Remittance (Corporate RTGS/NEFT):</strong><br>
                Bank: <strong>HDFC Bank Ltd</strong> &middot; Account: <strong>50200088991234</strong> &middot; IFSC: <strong>HDFC0000060</strong><br>
                Beneficiary: <strong>${brandName}</strong> &middot; SAC: 997212 (TDS §194-I Applicable)
              </div>

              <!-- Button CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="background-color: #1e3a8a; color: #ffffff; display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(30,58,138,0.3);">
                      View & Settle Invoice Online &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                If you have already initiated this wire transfer, please input your bank UTR transaction number directly in your portal to receive instant automated settlement receipt.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} ${brandName} &middot; Managed via OfficeX Commercial Asset Operations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Tax Invoice ${invoiceNumber} issued for ${propertyName} (Due: ${dueDate})`,
      html: htmlContent,
      text: `Tax Invoice ${invoiceNumber} issued for ${propertyName} (${spaceName}). Gross Amount: ₹${formattedAmount}. Payment Due: ${dueDate}. Please settle online at: ${portalUrl}`,
    });

    console.log(`[OfficeX Email] Invoice ${invoiceNumber} delivered to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[OfficeX Email Error] Failed to send invoice email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

export interface SendReminderEmailOptions {
  to: string;
  tenantName: string;
  invoiceNumber: string;
  propertyName?: string;
  spaceName?: string;
  balanceDue: number | string;
  dueDate: string;
  senderName?: string;
  message?: string;
  brandName?: string;
  portalUrl?: string;
}

/**
 * Dispatches a collection / overdue payment reminder email to the tenant
 */
export async function sendPaymentReminderEmail({
  to,
  tenantName,
  invoiceNumber,
  propertyName = "mango plus tower",
  spaceName = "Suite 101",
  balanceDue,
  dueDate,
  senderName = "JPS Management",
  message,
  brandName = "Mango Groups Ltd",
  portalUrl = "https://www.officex.pro/portal/invoices",
}: SendReminderEmailOptions): Promise<SendEmailResult> {
  const transporter = getTransporter();
  const formattedBalance = Number(balanceDue).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const fromAddress = process.env.SMTP_FROM || `"OfficeX Collections" <${process.env.SMTP_USER}>`;

  if (!transporter) {
    console.warn(`[OfficeX Email] Transporter not ready. Would send reminder to ${to}`);
    return { success: true, simulated: true };
  }

  const customNote = message || `This is an official notice regarding outstanding invoice ${invoiceNumber} for ${propertyName} &middot; ${spaceName}. Please remit payment to maintain your account in good standing.`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder — ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #7c2d12 0%, #b45309 100%);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 18px; font-weight: 900;">⚠️ Payment Notice &middot; ${senderName}</span>
                    <span style="color: #fde68a; font-size: 11px; display: block; margin-top: 4px; text-transform: uppercase; font-weight: 700;">Account Receivables & Collections</span>
                  </td>
                  <td align="right">
                    <span style="background: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px;">
                      DUE: ${dueDate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">
                Dear <strong>${tenantName}</strong>,
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.6; font-weight: 500;">
                  ${customNote}
                </p>
              </div>

              <!-- Balance Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Current Balance Outstanding</span>
                    <div style="font-size: 32px; font-weight: 900; color: #b45309; margin-top: 4px;">
                      ₹${formattedBalance}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                      Invoice: <strong>${invoiceNumber}</strong> &middot; Property: <strong>${propertyName} (${spaceName})</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Button CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" style="background-color: #b45309; color: #ffffff; display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(180,83,9,0.3);">
                      Click Here to Settle Balance Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                If your accounting team has already remitted via RTGS/NEFT, please log your bank UTR on the portal so our finance team can instantly match and issue your settlement receipt.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
              Dispatched by ${senderName} on behalf of ${brandName} via OfficeX
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Payment Reminder: Invoice ${invoiceNumber} for ${propertyName} (₹${formattedBalance})`,
      html: htmlContent,
      text: `Payment Reminder: Outstanding balance of ₹${formattedBalance} for Invoice ${invoiceNumber} (${propertyName}). Please settle promptly via: ${portalUrl}`,
    });

    console.log(`[OfficeX Email] Payment reminder for ${invoiceNumber} delivered to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[OfficeX Email Error] Failed to send reminder email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

