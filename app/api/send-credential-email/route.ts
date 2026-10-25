import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

function buildTransport() {
  if (!SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      to,
      studentName,
      credentialTitle,
      institutionName,
      credentialId,
      verificationUrl,
      honours,
      gpa,
      issueDate,
    } = body;

    if (!to || !studentName || !credentialTitle) {
      return NextResponse.json(
        { error: "Missing required fields (to, studentName, credentialTitle)" },
        { status: 400 }
      );
    }

    const emailSubject = `Official Verifiable Credential: ${credentialTitle} — ${institutionName || "TrustChain"}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f4; margin: 0; padding: 24px; color: #101418; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e8e9e5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #111410; color: #ffffff; padding: 28px 32px; text-align: left; border-bottom: 4px solid #bef52a; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #a0a6ae; font-size: 13px; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #e8f8e8; color: #159447; border: 1px solid #cef0ce; }
    .cert-box { background: #fbfbf9; border: 1px solid #e8e9e5; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .cert-title { font-size: 18px; font-weight: 800; color: #101418; margin-bottom: 6px; }
    .cert-sub { font-size: 13px; color: #626971; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e9e5; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #8a9097; font-weight: 600; }
    .value { color: #101418; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background: #111410; color: #bef52a !important; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 10px; margin: 16px 0; text-align: center; }
    .footer { background: #f7f7f4; padding: 20px 32px; text-align: center; font-size: 11px; color: #8a9097; border-top: 1px solid #e8e9e5; }
    .mono { font-family: monospace; font-size: 11px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:20px;">🏛️</span>
        <span style="color:#bef52a;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Official Institution Dispatch</span>
      </div>
      <h1>${institutionName || "Metropolitan University"}</h1>
      <p>Cryptographically Signed Verifiable Credential</p>
    </div>
    <div class="body">
      <div class="badge">Verified Academic Record</div>
      <h2 style="font-size:22px;font-weight:800;margin:16px 0 8px 0;color:#101418;">Hello, ${studentName}</h2>
      <p style="font-size:14px;line-height:1.6;color:#4b5563;margin-top:0;">
        Your issuing institution has anchored your official certificate on the TrustChain decentralized ledger. This credential is cryptographically signed using Ed25519 and tamper-proof.
      </p>
      <div class="cert-box">
        <div class="cert-title">${credentialTitle}</div>
        <div class="cert-sub">Conferred to <strong>${studentName}</strong> on ${issueDate || new Date().toISOString().slice(0, 10)}</div>
        <div style="margin-top:14px;">
          <div class="row"><span class="label">Issuing Authority:</span><span class="value">${institutionName || "Metropolitan University"}</span></div>
          <div class="row"><span class="label">Credential ID:</span><span class="value mono">${credentialId || "N/A"}</span></div>
          ${honours ? `<div class="row"><span class="label">Honours:</span><span class="value">${honours}</span></div>` : ""}
          ${gpa ? `<div class="row"><span class="label">GPA / Standing:</span><span class="value">${gpa}</span></div>` : ""}
          <div class="row"><span class="label">Security Anchor:</span><span class="value" style="color:#159447;">Ed25519 Finalized</span></div>
        </div>
      </div>
      <div style="text-align:center;">
        <a href="${verificationUrl || "#"}" class="btn" target="_blank">View &amp; Verify Certificate →</a>
      </div>
      <p style="font-size:12px;color:#626971;line-height:1.5;margin-top:20px;">
        Log in to the Student Portal using <strong>${to}</strong> to download PDF/JPG copies and share live QR codes with recruiters.
      </p>
    </div>
    <div class="footer">
      TrustChain Decentralized Infrastructure • W3C Verifiable Credentials Standard<br>
      Sent to ${to} • Do not reply to this automated message.
    </div>
  </div>
</body>
</html>`.trim();

    const transport = buildTransport();
    let actualSent = false;

    if (transport) {
      await transport.sendMail({
        from: `"TrustChain Credentials" <${SMTP_FROM}>`,
        to,
        subject: emailSubject,
        html: emailHtml,
      });
      actualSent = true;
    }

    return NextResponse.json({
      success: true,
      actualSent,
      emailId: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject: emailSubject,
      timestamp: new Date().toISOString(),
      previewHtml: emailHtml,
      note: actualSent ? "Email delivered via SMTP" : "SMTP not configured — add SMTP_USER & SMTP_PASS to .env.local",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
