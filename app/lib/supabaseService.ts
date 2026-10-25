import { createClient } from "../../utils/supabase/client";
import {
  type Institution,
  type Issuer,
  type Credential,
  type AuditEvent,
} from "./data";

const supabase = createClient();

export type SupabaseSyncStatus = "connected" | "connecting" | "offline" | "tables_missing";

// Test connection and schema availability
export async function checkSupabaseConnection(): Promise<{
  status: SupabaseSyncStatus;
  message: string;
}> {
  try {
    const { error } = await supabase.from("institutions").select("id").limit(1);

    if (error) {
      if (error.code === "PGRST205") {
        // Table not yet created in Supabase
        return {
          status: "tables_missing",
          message: "Connected to Supabase, but schema tables need to be created.",
        };
      }
      return {
        status: "offline",
        message: error.message || "Failed to reach Supabase database.",
      };
    }

    return {
      status: "connected",
      message: "Connected to Supabase (Cloud Synced)",
    };
  } catch (err: any) {
    return {
      status: "offline",
      message: err.message || "Network error reaching Supabase.",
    };
  }
}

// ─── INSTITUTIONS ───────────────────────────────────────────────

export async function fetchInstitutionsFromDb(): Promise<Institution[] | null> {
  try {
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      did: row.did,
      registrationDate: row.registration_date,
      issuerCount: row.issuer_count,
      status: row.status,
      txRef: row.tx_ref,
      metadata: row.metadata,
    }));
  } catch {
    return null;
  }
}

export async function saveInstitutionToDb(inst: Institution): Promise<boolean> {
  try {
    const { error } = await supabase.from("institutions").upsert({
      id: inst.id,
      name: inst.name,
      type: inst.type,
      did: inst.did,
      registration_date: inst.registrationDate,
      issuer_count: inst.issuerCount,
      status: inst.status,
      tx_ref: inst.txRef,
      metadata: inst.metadata || null,
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── ISSUERS ────────────────────────────────────────────────────

export async function fetchIssuersFromDb(): Promise<Issuer[] | null> {
  try {
    const { data, error } = await supabase
      .from("issuers")
      .select("*")
      .order("institution_name", { ascending: true });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      institutionId: row.institution_id,
      institutionName: row.institution_name,
      keyFingerprint: row.key_fingerprint,
      permissions: row.permissions || [],
      status: row.status,
      authorizedDate: row.authorized_date,
      history: row.history || [],
    }));
  } catch {
    return null;
  }
}

export async function saveIssuerToDb(issuer: Issuer): Promise<boolean> {
  try {
    const { error } = await supabase.from("issuers").upsert({
      id: issuer.id,
      institution_id: issuer.institutionId,
      institution_name: issuer.institutionName,
      key_fingerprint: issuer.keyFingerprint,
      permissions: issuer.permissions,
      status: issuer.status,
      authorized_date: issuer.authorizedDate,
      history: issuer.history,
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── CREDENTIALS ────────────────────────────────────────────────

export async function fetchCredentialsFromDb(): Promise<Credential[] | null> {
  try {
    const { data, error } = await supabase
      .from("credentials")
      .select("*")
      .order("issue_date", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      type: row.type,
      issuingInstitution: row.issuing_institution,
      issuerId: row.issuer_id,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      issueDate: row.issue_date,
      expirationDate: row.expiration_date || undefined,
      status: row.status,
      fingerprint: row.fingerprint,
      txRef: row.tx_ref,
      proofMethod: row.proof_method,
      trustRegistryRef: row.trust_registry_ref,
      revocationRef: row.revocation_ref || undefined,
      revocationDate: row.revocation_date || undefined,
      revocationReason: row.revocation_reason || undefined,
      did: row.did,
      recipientEmail: row.recipient_email || undefined,
      documentImage: row.document_image || undefined,
      documentImageHash: row.document_image_hash || undefined,
    }));
  } catch {
    return null;
  }
}

export async function saveCredentialToDb(cred: Credential): Promise<boolean> {
  try {
    const payload: any = {
      id: cred.id,
      type: cred.type,
      issuing_institution: cred.issuingInstitution,
      issuer_id: cred.issuerId,
      subject_id: cred.subjectId,
      subject_name: cred.subjectName,
      issue_date: cred.issueDate,
      expiration_date: cred.expirationDate || null,
      status: cred.status,
      fingerprint: cred.fingerprint,
      tx_ref: cred.txRef,
      proof_method: cred.proofMethod,
      trust_registry_ref: cred.trustRegistryRef,
      revocation_ref: cred.revocationRef || null,
      revocation_date: cred.revocationDate || null,
      revocation_reason: cred.revocationReason || null,
      did: cred.did,
      document_image: cred.documentImage || null,
      document_image_hash: cred.documentImageHash || null,
    };
    if (cred.recipientEmail) {
      payload.recipient_email = cred.recipientEmail;
    }

    const { error } = await supabase.from("credentials").upsert(payload);
    if (error && error.message?.includes("recipient_email")) {
      delete payload.recipient_email;
      const { error: retryError } = await supabase.from("credentials").upsert(payload);
      return !retryError;
    }
    return !error;
  } catch {
    return false;
  }
}

export async function updateCredentialRevocationInDb(
  credentialId: string,
  revocationDate: string,
  revocationReason: string,
  revocationRef: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("credentials")
      .update({
        status: "revoked",
        revocation_date: revocationDate,
        revocation_reason: revocationReason,
        revocation_ref: revocationRef,
      })
      .eq("id", credentialId);

    return !error;
  } catch {
    return false;
  }
}

// ─── AUDIT EVENTS ───────────────────────────────────────────────

export async function fetchAuditEventsFromDb(): Promise<AuditEvent[] | null> {
  try {
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      type: row.type,
      actor: row.actor,
      timestamp: row.timestamp,
      related: row.related,
      txRef: row.tx_ref,
      outcome: row.outcome,
      details: row.details,
    }));
  } catch {
    return null;
  }
}

export async function saveAuditEventToDb(evt: AuditEvent): Promise<boolean> {
  try {
    const { error } = await supabase.from("audit_events").upsert({
      id: evt.id,
      type: evt.type,
      actor: evt.actor,
      timestamp: evt.timestamp,
      related: evt.related,
      tx_ref: evt.txRef,
      outcome: evt.outcome,
      details: evt.details,
    });
    return !error;
  } catch {
    return false;
  }
}
