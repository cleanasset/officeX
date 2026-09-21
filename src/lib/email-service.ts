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
