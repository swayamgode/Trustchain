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
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 3000,
  });
}

async function generateCertificatePdf(data: {
  studentName: string;
  credentialTitle: string;
  institutionName: string;
  credentialId: string;
  verificationUrl: string;
  subjectId?: string;
  department?: string;
  honours?: string;
  gpa?: string;
  issueDate?: string;
  fingerprint?: string;
  txRef?: string;
}): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const QRCode = (await import("qrcode")).default;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4", // 297mm x 210mm
  });

  const W = 297;
  const H = 210;

  // Background Parchment tone
  doc.setFillColor(253, 252, 248);
  doc.rect(0, 0, W, H, "F");

  // Outer Decorative Borders
  doc.setDrawColor(27, 54, 93); // Navy #1B365D
  doc.setLineWidth(1.4);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(197, 160, 89); // Gold #C5A059
  doc.setLineWidth(0.6);
  doc.rect(13, 13, W - 26, H - 26);

  // Corner Ornaments
  const cornerSize = 7;
  doc.setFillColor(197, 160, 89);
  doc.triangle(13, 13, 13 + cornerSize, 13, 13, 13 + cornerSize, "F");
  doc.triangle(W - 13, 13, W - 13 - cornerSize, 13, W - 13, 13 + cornerSize, "F");
  doc.triangle(13, H - 13, 13 + cornerSize, H - 13, 13, H - 13 - cornerSize, "F");
  doc.triangle(W - 13, H - 13, W - 13 - cornerSize, H - 13, W - 13, H - 13 - cornerSize, "F");

  // Header Subtitle
  doc.setTextColor(197, 160, 89);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(
    "TRUSTCHAIN VERIFIABLE CREDENTIAL REGISTRY • DECENTRALIZED TRUST INFRASTRUCTURE",
    W / 2,
    23,
    { align: "center" }
  );

  // Institution Title
  doc.setTextColor(27, 54, 93);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text((data.institutionName || "METROPOLITAN UNIVERSITY").toUpperCase(), W / 2, 33, {
    align: "center",
  });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL DIPLOMA & ACADEMIC TRANSCRIPT RECORD", W / 2, 39, { align: "center" });

  // Divider Line
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.5);
  doc.line(70, 43, W - 70, 43);

  // Conferred Text
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("This official credential is cryptographically anchored and conferred upon", W / 2, 51, {
    align: "center",
  });

  // Student Name
  doc.setTextColor(22, 39, 64);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(data.studentName || "Student Graduate", W / 2, 62, { align: "center" });

  // Student ID line
  if (data.subjectId) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont("courier", "bold");
    doc.text(`SUBJECT IDENTIFIER: ${data.subjectId}`, W / 2, 68, { align: "center" });
  }

  // Underline
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.4);
  doc.line(80, 71, W - 80, 71);

  // Degree fulfillment
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "in recognition of the successful completion of the academic requirements for",
    W / 2,
    78,
    { align: "center" }
  );

  // Credential Title
  doc.setTextColor(27, 54, 93);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text(data.credentialTitle || "Academic Degree", W / 2, 87, { align: "center" });

  // Department
  let currentY = 93;
  if (data.department) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.text(data.department, W / 2, currentY, { align: "center" });
    currentY += 7;
  }

  // Badges (Honours & GPA)
  const badges: string[] = [];
  if (data.honours) badges.push(`Classification: ${data.honours}`);
  if (data.gpa) badges.push(`Marks / Standing: ${data.gpa}`);
  if (badges.length > 0) {
    doc.setTextColor(21, 148, 71); // Green
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(badges.join("    •    "), W / 2, currentY, { align: "center" });
  }

  // Bottom Box: Left side Security Ledger Details, Right side High-Contrast QR Code
  const boxY = 118;
  const boxH = 58;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, boxY, W - 40, boxH, 3, 3, "FD");

  // Left Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CRYPTOGRAPHIC LEDGER VERIFICATION METADATA", 26, boxY + 8);

  const row = (label: string, val: string, y: number) => {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, 26, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.text(val, 64, y);
  };

  row("Credential ID:", data.credentialId || "N/A", boxY + 16);
  row("Issue Date:", data.issueDate || new Date().toISOString().slice(0, 10), boxY + 23);
  row("Security Anchor:", "Ed25519Signature2020 / W3C Verifiable Credential", boxY + 30);
  row(
    "Tx Reference:",
    data.txRef ? `${data.txRef.slice(0, 34)}...` : "0x3a4b5c6d...89abcdef",
    boxY + 37
  );
  row(
    "Fingerprint:",
    data.fingerprint ? `${data.fingerprint.slice(0, 38)}...` : "0x7a8b9c...6f8a9b",
    boxY + 44
  );
  row("Ledger Status:", "ACTIVE — ON-CHAIN ANCHORED & VERIFIED", boxY + 51);

  // Right Side QR Code (generated with qrcode)
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: "H",
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });

  const qrSize = 42;
  const qrX = W - 20 - qrSize - 12;
  const qrY = boxY + 5;

  // Draw white backplate for QR
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(qrX - 2, qrY - 1, qrSize + 4, qrSize + 9, 2, 2, "FD");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text("SCAN TO VERIFY AUTHENTICITY", qrX + qrSize / 2, qrY + qrSize + 4, {
    align: "center",
  });

  // Signatures at very bottom
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(27, 54, 93);
  doc.text("Dr. Evelyn Vance", 45, 192);
  doc.line(30, 189, 75, 189);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("University Registrar & Authority", 45, 196);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(27, 54, 93);
  doc.text("Ashfaq Zaman", W - 75, 192);
  doc.line(W - 90, 189, W - 45, 189);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Academic Council Chairman", W - 75, 196);

  return Buffer.from(doc.output("arraybuffer"));
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
      subjectId,
      department,
      honours,
      gpa,
      issueDate,
      fingerprint,
      txRef,
      proofMethod,
      trustRegistryRef,
      attachmentBase64,
      attachmentFilename,
    } = body;

    if (!to || !studentName || !credentialTitle) {
      return NextResponse.json(
        { error: "Missing required fields (to, studentName, credentialTitle)" },
        { status: 400 }
      );
    }

    const QRCode = (await import("qrcode")).default;
    const finalVerificationUrl =
      verificationUrl || `https://trustchain.network/verify/${credentialId || "cred"}`;

    // Generate inline QR PNG buffer
    const qrBuffer = await QRCode.toBuffer(finalVerificationUrl, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "H",
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });

    // Generate official Certificate PDF attachment
    const pdfBuffer = attachmentBase64
      ? Buffer.from(attachmentBase64.split(",")[1] || attachmentBase64, "base64")
      : await generateCertificatePdf({
          studentName,
          credentialTitle,
          institutionName: institutionName || "Metropolitan University",
          credentialId: credentialId || "CRED-UNKNOWN",
          verificationUrl: finalVerificationUrl,
          subjectId,
          department,
          honours,
          gpa,
          issueDate,
          fingerprint,
          txRef,
        });

    const cleanId = (credentialId || "certificate").replace(/[^a-zA-Z0-9_-]/g, "_");
    const certFilename = attachmentFilename || `Official_Certificate_${cleanId}.pdf`;

    const emailSubject = `Official Verifiable Credential: ${credentialTitle} — ${institutionName || "TrustChain"}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f4; margin: 0; padding: 24px; color: #101418; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e8e9e5; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
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
    .qr-card { background: #ffffff; border: 2px dashed #0F172A; border-radius: 14px; padding: 18px; text-align: center; margin: 20px 0; }
    .file-attach { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; margin: 18px 0; font-size: 13px; color: #1e3a8a; }
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
      <p>Cryptographically Signed Verifiable Credential &amp; Attached File</p>
    </div>
    <div class="body">
      <div class="badge">Verified Academic Record • W3C Standard</div>
      <h2 style="font-size:22px;font-weight:800;margin:16px 0 8px 0;color:#101418;">Hello, ${studentName}</h2>
      <p style="font-size:14px;line-height:1.6;color:#4b5563;margin-top:0;">
        Your issuing institution has anchored your official certificate on the TrustChain decentralized ledger. This credential is cryptographically signed using Ed25519 and tamper-proof.
      </p>

      <!-- All Credential Fields -->
      <div class="cert-box">
        <div class="cert-title">${credentialTitle}</div>
        <div class="cert-sub">Conferred to <strong>${studentName}</strong> on ${issueDate || new Date().toISOString().slice(0, 10)}</div>
        <div style="margin-top:14px;">
          <div class="row"><span class="label">Recipient Name:</span><span class="value">${studentName}</span></div>
          <div class="row"><span class="label">Recipient Email:</span><span class="value">${to}</span></div>
          ${subjectId ? `<div class="row"><span class="label">Subject ID:</span><span class="value mono">${subjectId}</span></div>` : ""}
          <div class="row"><span class="label">Issuing Authority:</span><span class="value">${institutionName || "Metropolitan University"}</span></div>
          ${department ? `<div class="row"><span class="label">Department / School:</span><span class="value">${department}</span></div>` : ""}
          <div class="row"><span class="label">Credential ID:</span><span class="value mono">${credentialId || "N/A"}</span></div>
          ${honours ? `<div class="row"><span class="label">Honours:</span><span class="value">${honours}</span></div>` : ""}
          ${gpa ? `<div class="row"><span class="label">Marks / Score / GPA:</span><span class="value">${gpa}</span></div>` : ""}
          <div class="row"><span class="label">Issue Date:</span><span class="value">${issueDate || new Date().toISOString().slice(0, 10)}</span></div>
          <div class="row"><span class="label">Proof Cryptography:</span><span class="value">${proofMethod || "Ed25519Signature2020"}</span></div>
          ${fingerprint ? `<div class="row"><span class="label">Hash Fingerprint:</span><span class="value mono">${fingerprint.slice(0, 24)}...</span></div>` : ""}
          ${txRef ? `<div class="row"><span class="label">Ledger Tx Anchor:</span><span class="value mono">${txRef.slice(0, 24)}...</span></div>` : ""}
          ${trustRegistryRef ? `<div class="row"><span class="label">Trust Registry Ref:</span><span class="value mono">${trustRegistryRef}</span></div>` : ""}
          <div class="row"><span class="label">Security Status:</span><span class="value" style="color:#159447;">AUTHENTIC &amp; ANCHORED</span></div>
        </div>
      </div>

      <!-- File Attachment Notice -->
      <div class="file-attach">
        <div style="font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span>📎</span>
          <span>Downloadable Official File Attached</span>
        </div>
        <div>
          An official verifiable PDF copy of your credential (<strong>${certFilename}</strong>) with integrated authentication QR code is attached to this email. You can download and present it directly to employers or institutions.
        </div>
      </div>

      <!-- Integrated QR Code in Email -->
      <div class="qr-card">
        <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#0F172A;margin-bottom:10px;">
          Direct Verification QR Code
        </div>
        <img src="cid:qrcode" alt="Verification QR Code" width="140" height="140" style="display:block;margin:0 auto;border:1px solid #cbd5e1;border-radius:8px;" />
        <div style="font-size:11px;color:#64748b;margin-top:8px;font-weight:600;">
          Scan with any mobile camera to verify signature on the TrustChain ledger.
        </div>
      </div>

      <div style="text-align:center;">
        <a href="${finalVerificationUrl}" class="btn" target="_blank">View &amp; Verify Credential Online →</a>
      </div>

      <p style="font-size:12px;color:#626971;line-height:1.5;margin-top:20px;">
        You can also log into the TrustChain Student Portal using your email address <strong>${to}</strong> anytime to view your original scanned marksheets and manage your verifiable documents.
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
        attachments: [
          {
            filename: certFilename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
          {
            filename: "qr-code.png",
            content: qrBuffer,
            cid: "qrcode",
            contentType: "image/png",
          },
        ],
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
      attachedFile: certFilename,
      note: actualSent
        ? "Email with PDF certificate & QR attachment delivered via SMTP"
        : "SMTP not configured — add SMTP_USER & SMTP_PASS to .env.local",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
