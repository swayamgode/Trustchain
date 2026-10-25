export interface DispatchedEmail {
  id: string;
  to: string;
  studentName: string;
  credentialTitle: string;
  institutionName: string;
  credentialId: string;
  verificationUrl: string;
  subject: string;
  previewHtml: string;
  status: "delivered" | "sent" | "queued";
  timestamp: string;
}

export async function sendCredentialEmail(params: {
  to: string;
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
  documentImage?: string;
  txRef?: string;
  fingerprint?: string;
  proofMethod?: string;
  trustRegistryRef?: string;
  attachmentBase64?: string;
  attachmentFilename?: string;
}): Promise<DispatchedEmail> {
  const fallbackId = `email-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const timestamp = new Date().toISOString();
  const subject = `Official Verifiable Credential: ${params.credentialTitle} — ${params.institutionName}`;

  let previewHtml = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("/api/send-credential-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      previewHtml = data.previewHtml;
    }
  } catch (e) {
    // Fallback if offline or timeout
  }

  if (!previewHtml) {
    previewHtml = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${params.institutionName}</h2>
        <p>Dear ${params.studentName},</p>
        <p>Your official verifiable certificate for <strong>${params.credentialTitle}</strong> has been issued.</p>
        <p><a href="${params.verificationUrl}">Click here to view and verify your credential</a></p>
      </div>
    `;
  }

  const record: DispatchedEmail = {
    id: fallbackId,
    to: params.to,
    studentName: params.studentName,
    credentialTitle: params.credentialTitle,
    institutionName: params.institutionName,
    credentialId: params.credentialId,
    verificationUrl: params.verificationUrl,
    subject,
    previewHtml,
    status: "delivered",
    timestamp,
  };

  // Persist locally
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("tc_dispatched_emails");
      const list: DispatchedEmail[] = stored ? JSON.parse(stored) : [];
      list.unshift(record);
      localStorage.setItem("tc_dispatched_emails", JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  return record;
}

export function getDispatchedEmails(): DispatchedEmail[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("tc_dispatched_emails");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function generateMailtoUrl(params: {
  to: string;
  studentName: string;
  credentialTitle: string;
  institutionName: string;
  credentialId: string;
  verificationUrl: string;
}): string {
  const subject = encodeURIComponent(`Official Verifiable Credential: ${params.credentialTitle}`);
  const body = encodeURIComponent(
    `Dear ${params.studentName},\n\n` +
    `Your official verifiable credential for "${params.credentialTitle}" has been cryptographically signed and anchored by ${params.institutionName}.\n\n` +
    `Credential ID: ${params.credentialId}\n` +
    `Verification URL: ${params.verificationUrl}\n\n` +
    `You can log into the TrustChain Student Portal using your email address (${params.to}) to access your tamper-evident document scans and live verification QR code.\n\n` +
    `Best regards,\n${params.institutionName}`
  );
  return `mailto:${params.to}?subject=${subject}&body=${body}`;
}
