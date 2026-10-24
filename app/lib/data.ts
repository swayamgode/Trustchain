// TRUSTCHAIN — Demo Data & Types
// All data is synthetic demo data for hackathon presentation purposes.

export interface Institution {
  id: string;
  name: string;
  type: string;
  did: string;
  registrationDate: string;
  issuerCount: number;
  status: "verified" | "pending" | "suspended";
  txRef: string;
  metadata?: string;
}

export interface Issuer {
  id: string;
  institutionId: string;
  institutionName: string;
  keyFingerprint: string;
  permissions: string[];
  status: "active" | "deactivated";
  authorizedDate: string;
  history: { date: string; action: string }[];
}

export interface Credential {
  id: string;
  type: string;
  issuingInstitution: string;
  issuerId: string;
  subjectId: string;
  subjectName: string;
  issueDate: string;
  expirationDate?: string;
  status: "active" | "expired" | "revoked";
  fingerprint: string;
  txRef: string;
  proofMethod: string;
  trustRegistryRef: string;
  revocationRef?: string;
  revocationDate?: string;
  revocationReason?: string;
  did: string;
}

export interface AuditEvent {
  id: string;
  type:
    | "institution_registration"
    | "issuer_authorization"
    | "credential_issuance"
    | "credential_verification"
    | "credential_revocation"
    | "failed_auth";
  actor: string;
  timestamp: string;
  related: string;
  txRef: string;
  outcome: "success" | "rejected" | "alert";
  details: string;
}

export interface VerificationResult {
  overallStatus: "verified" | "tampered" | "unauthorized" | "revoked" | "invalid_signature" | "unable_to_verify";
  checks: VerificationCheck[];
  credential?: Credential;
  expectedFingerprint?: string;
  submittedFingerprint?: string;
  verificationTimestamp: string;
  auditRef: string;
}

export interface VerificationCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning" | "pending";
  explanation: string;
  technical: string;
}

// ─── Demo Institutions ────────────────────────────────────────────────────────

export const DEMO_INSTITUTIONS: Institution[] = [
  {
    id: "inst-001",
    name: "Western Institute of Technology",
    type: "University",
    did: "did:trustchain:wit:8f3a2b91c4d7e6f0a1b2c3d4e5f6a7b8",
    registrationDate: "2024-03-15",
    issuerCount: 12,
    status: "verified",
    txRef: "0xf4a2b8c1d9e7f3a6b0c5d2e8f1a4b7c0",
    metadata: "Accredited research and technology university, est. 1982",
  },
  {
    id: "inst-002",
    name: "National Skills Certification Board",
    type: "Government Body",
    did: "did:trustchain:nscb:2c4e6a8f0b1d3e5c7a9f2b4d6e8a0c2e",
    registrationDate: "2024-01-08",
    issuerCount: 47,
    status: "verified",
    txRef: "0xa1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2",
    metadata: "Federal authority for professional skills certification",
  },
  {
    id: "inst-003",
    name: "Meridian University",
    type: "University",
    did: "did:trustchain:mu:9b3d5f7a1c2e4f6a8b0d2e4f6a8c0e2f",
    registrationDate: "2024-05-22",
    issuerCount: 8,
    status: "verified",
    txRef: "0xc2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2",
    metadata: "Prestigious liberal arts and sciences university",
  },
  {
    id: "inst-004",
    name: "Digital Learning Authority",
    type: "Education Authority",
    did: "did:trustchain:dla:1a3c5e7b9d2f4a6c8e0b3d5f7a9c1e3f",
    registrationDate: "2024-07-11",
    issuerCount: 23,
    status: "verified",
    txRef: "0xe0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0",
    metadata: "National authority for digital education credentials",
  },
];

// ─── Demo Issuers ─────────────────────────────────────────────────────────────

export const DEMO_ISSUERS: Issuer[] = [
  {
    id: "issuer-001",
    institutionId: "inst-001",
    institutionName: "Western Institute of Technology",
    keyFingerprint: "SHA256:k8Xm2nP9qR4sT1uV5wY7zA3bC6dE0fG",
    permissions: ["academic_degree", "course_completion", "internship_certificate"],
    status: "active",
    authorizedDate: "2024-03-16",
    history: [{ date: "2024-03-16", action: "Authorized" }],
  },
  {
    id: "issuer-002",
    institutionId: "inst-002",
    institutionName: "National Skills Certification Board",
    keyFingerprint: "SHA256:j7Wl1mO8pQ3rS0tU4vX6yZ2aC5bD9eF",
    permissions: ["professional_qualification", "course_completion"],
    status: "active",
    authorizedDate: "2024-01-09",
    history: [{ date: "2024-01-09", action: "Authorized" }],
  },
  {
    id: "issuer-003",
    institutionId: "inst-003",
    institutionName: "Meridian University",
    keyFingerprint: "SHA256:h6Vk0lN7oP2qR9sT3uW5xY1zB4cE8dG",
    permissions: ["academic_degree", "internship_certificate"],
    status: "active",
    authorizedDate: "2024-05-23",
    history: [{ date: "2024-05-23", action: "Authorized" }],
  },
  {
    id: "issuer-004",
    institutionId: "inst-001",
    institutionName: "Western Institute of Technology",
    keyFingerprint: "SHA256:g5Uj9kM6nO1pQ8rS2tV4wX0yA3bC7dE",
    permissions: ["academic_degree"],
    status: "deactivated",
    authorizedDate: "2024-02-01",
    history: [
      { date: "2024-02-01", action: "Authorized" },
      { date: "2024-09-14", action: "Deactivated — Key rotation" },
    ],
  },
];

// ─── Demo Credentials ─────────────────────────────────────────────────────────

export const DEMO_CREDENTIALS: Credential[] = [
  {
    id: "cred-2024-WIT-09182",
    type: "Academic Degree",
    issuingInstitution: "Western Institute of Technology",
    issuerId: "issuer-001",
    subjectId: "sub:A3F8B2C1D9E7F6A4",
    subjectName: "Jordan A. Chen",
    issueDate: "2024-06-15",
    expirationDate: undefined,
    status: "active",
    fingerprint: "sha256:a4f8b2c1d9e7f6a4b8c2d1e9f7a6b4c2",
    txRef: "0xb4c2d1e9f7a6b4c2d1e9f7a6b4c2d1e9",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "tc:registry:0xf4a2b8c1d9e7f3a6",
    did: "did:trustchain:wit:8f3a2b91c4d7e6f0a1b2c3d4e5f6a7b8",
  },
  {
    id: "cred-2024-NSCB-04521",
    type: "Professional Qualification",
    issuingInstitution: "National Skills Certification Board",
    issuerId: "issuer-002",
    subjectId: "sub:B7E3C4D2F8A1E5B9",
    subjectName: "Priya R. Nair",
    issueDate: "2024-09-01",
    expirationDate: "2027-09-01",
    status: "active",
    fingerprint: "sha256:c7e3c4d2f8a1e5b9c7e3c4d2f8a1e5b9",
    txRef: "0xd8e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "tc:registry:0xa1b3c5d7e9f2a4b6",
    did: "did:trustchain:nscb:2c4e6a8f0b1d3e5c7a9f2b4d6e8a0c2e",
  },
  {
    id: "cred-2024-MU-11203",
    type: "Internship Certificate",
    issuingInstitution: "Meridian University",
    issuerId: "issuer-003",
    subjectId: "sub:C2A9D5E1F7B3C8D4",
    subjectName: "Sam O. Williams",
    issueDate: "2024-08-20",
    expirationDate: "2025-08-20",
    status: "revoked",
    fingerprint: "sha256:e1f7b3c8d4a9d5e1f7b3c8d4a9d5e1f7",
    txRef: "0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "tc:registry:0xc2d4e6f8a0b2c4d6",
    revocationRef: "revoc:0xa8b9c0d1e2f3a4b5",
    revocationDate: "2024-10-05",
    revocationReason: "Subject employment status change",
    did: "did:trustchain:mu:9b3d5f7a1c2e4f6a8b0d2e4f6a8c0e2f",
  },
  {
    id: "cred-2024-DLA-07744",
    type: "Course Completion",
    issuingInstitution: "Digital Learning Authority",
    issuerId: "issuer-002",
    subjectId: "sub:D5F2A8B1C9E3D6F4",
    subjectName: "Alex M. Torres",
    issueDate: "2024-10-01",
    expirationDate: "2026-10-01",
    status: "active",
    fingerprint: "sha256:f2a8b1c9e3d6f4d5f2a8b1c9e3d6f4d5",
    txRef: "0xa2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "tc:registry:0xe0f2a4b6c8d0e2f4",
    did: "did:trustchain:dla:1a3c5e7b9d2f4a6c8e0b3d5f7a9c1e3f",
  },
];

// ─── Demo Audit Events ────────────────────────────────────────────────────────

export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt-001",
    type: "credential_verification",
    actor: "External Verifier: Apex Corp HR",
    timestamp: "2024-10-24T12:34:56Z",
    related: "cred-2024-WIT-09182",
    txRef: "0xb4c2d1e9f7a6b4c2",
    outcome: "success",
    details: "All 6 verification checks passed. Signature valid. Issuer authorized.",
  },
  {
    id: "evt-002",
    type: "credential_revocation",
    actor: "issuer-003 (Meridian University)",
    timestamp: "2024-10-05T09:15:22Z",
    related: "cred-2024-MU-11203",
    txRef: "0xa8b9c0d1e2f3a4b5",
    outcome: "success",
    details: "Credential revoked. Reason: Subject employment status change.",
  },
  {
    id: "evt-003",
    type: "failed_auth",
    actor: "Unknown entity: did:unknown:rogue:ff2a8b",
    timestamp: "2024-10-23T18:02:11Z",
    related: "N/A",
    txRef: "N/A",
    outcome: "alert",
    details: "Attempted credential issuance rejected. Issuer not found in trust registry.",
  },
  {
    id: "evt-004",
    type: "credential_issuance",
    actor: "issuer-001 (Western Institute of Technology)",
    timestamp: "2024-06-15T10:00:00Z",
    related: "cred-2024-WIT-09182",
    txRef: "0xb4c2d1e9f7a6b4c2d1e9f7a6b4c2d1e9",
    outcome: "success",
    details: "Academic Degree credential issued to sub:A3F8B2C1D9E7F6A4.",
  },
  {
    id: "evt-005",
    type: "institution_registration",
    actor: "Admin: Digital Learning Authority",
    timestamp: "2024-07-11T08:45:00Z",
    related: "inst-004",
    txRef: "0xe0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0",
    outcome: "success",
    details: "Institution registered and DID anchored to trust registry.",
  },
  {
    id: "evt-006",
    type: "credential_verification",
    actor: "External Verifier: Global Talents Inc.",
    timestamp: "2024-10-22T14:22:33Z",
    related: "cred-2024-MU-11203",
    txRef: "0xc9d8e7f6a5b4c3d2",
    outcome: "rejected",
    details: "Verification failed: credential revoked on 2024-10-05.",
  },
  {
    id: "evt-007",
    type: "issuer_authorization",
    actor: "Admin: Western Institute of Technology",
    timestamp: "2024-03-16T09:00:00Z",
    related: "issuer-001",
    txRef: "0xf4a2b8c1d9e7f3a6b0c5d2e8f1a4b7c0",
    outcome: "success",
    details: "Issuer public key registered and authorized for academic_degree, course_completion, internship_certificate.",
  },
];

// ─── Demo Verification Scenarios ─────────────────────────────────────────────

export const DEMO_SCENARIOS = {
  valid: {
    label: "Valid Credential",
    description: "All checks pass — signature, issuer authorization, and revocation status.",
    credential: DEMO_CREDENTIALS[0],
    result: {
      overallStatus: "verified" as const,
      expectedFingerprint: "sha256:a4f8b2c1d9e7f6a4b8c2d1e9f7a6b4c2",
      submittedFingerprint: "sha256:a4f8b2c1d9e7f6a4b8c2d1e9f7a6b4c2",
      verificationTimestamp: new Date().toISOString(),
      auditRef: "audit:0x" + Math.random().toString(16).slice(2, 18),
      checks: [
        { id: "c1", label: "Credential structure & required fields", status: "pass" as const, explanation: "All required W3C VC fields present and well-formed.", technical: "Checked: @context, id, type, issuer, issuanceDate, credentialSubject, proof" },
        { id: "c2", label: "Issuer identity resolution", status: "pass" as const, explanation: "Issuer DID resolved to Western Institute of Technology.", technical: "DID: did:trustchain:wit:8f3a2b91c4d7e6f0a1b2c3d4e5f6a7b8 → resolved in trust registry" },
        { id: "c3", label: "Issuer authorization (trust registry)", status: "pass" as const, explanation: "Issuer is authorized by the trust registry to issue Academic Degree credentials.", technical: "Trust registry record: issuer-001, authorized 2024-03-16, scope: academic_degree" },
        { id: "c4", label: "Cryptographic signature verification", status: "pass" as const, explanation: "Ed25519 signature is cryptographically valid.", technical: "Signature verified using issuer public key. Algorithm: Ed25519Signature2020" },
        { id: "c5", label: "Credential integrity & hash comparison", status: "pass" as const, explanation: "Content hash matches the registered fingerprint.", technical: "Expected: sha256:a4f8b2c1d9e7f6a4b8c2d1e9f7a6b4c2 — Match: ✓" },
        { id: "c6", label: "Revocation & validity status", status: "pass" as const, explanation: "Credential is active and has not been revoked.", technical: "Checked revocation registry at block #8,432,112 — status: active" },
        { id: "c7", label: "Audit reference & timestamp", status: "pass" as const, explanation: "Verification event logged to audit trail.", technical: "Audit event recorded with timestamp and verifier identity." },
      ],
    },
  },
  tampered: {
    label: "Tampered Credential",
    description: "Credential content was modified after signing — fingerprint mismatch detected.",
    credential: DEMO_CREDENTIALS[1],
    result: {
      overallStatus: "tampered" as const,
      expectedFingerprint: "sha256:c7e3c4d2f8a1e5b9c7e3c4d2f8a1e5b9",
      submittedFingerprint: "sha256:f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
      verificationTimestamp: new Date().toISOString(),
      auditRef: "audit:0x" + Math.random().toString(16).slice(2, 18),
      checks: [
        { id: "c1", label: "Credential structure & required fields", status: "pass" as const, explanation: "All required fields are present.", technical: "Structure check passed." },
        { id: "c2", label: "Issuer identity resolution", status: "pass" as const, explanation: "Issuer DID resolved successfully.", technical: "DID resolved: National Skills Certification Board" },
        { id: "c3", label: "Issuer authorization (trust registry)", status: "pass" as const, explanation: "Issuer is authorized in the trust registry.", technical: "issuer-002 is authorized for professional_qualification" },
        { id: "c4", label: "Cryptographic signature verification", status: "fail" as const, explanation: "Signature does not match the submitted credential content.", technical: "Ed25519 signature verification failed. Content has been modified after signing." },
        { id: "c5", label: "Credential integrity & hash comparison", status: "fail" as const, explanation: "Content hash does not match the registered fingerprint. Tampering detected.", technical: "Expected: sha256:c7e3c4d2f8a1e5b9c7e3c4d2f8a1e5b9 — Got: sha256:f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6 — MISMATCH" },
        { id: "c6", label: "Revocation & validity status", status: "warning" as const, explanation: "Cannot confirm validity due to tampered content.", technical: "Revocation check skipped — credential integrity compromised." },
        { id: "c7", label: "Audit reference & timestamp", status: "pass" as const, explanation: "Tampering attempt logged to audit trail.", technical: "Security alert event recorded." },
      ],
    },
  },
  unauthorized: {
    label: "Unauthorized Issuer",
    description: "The credential's issuer is not registered or authorized in the trust registry.",
    credential: {
      ...DEMO_CREDENTIALS[0],
      id: "cred-2024-ROGUE-00001",
      issuingInstitution: "Unregistered Education Co.",
      issuerId: "issuer-rogue",
      did: "did:unknown:rogue:ff2a8b3c1d9e7f4a",
      fingerprint: "sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
    },
    result: {
      overallStatus: "unauthorized" as const,
      expectedFingerprint: undefined,
      submittedFingerprint: "sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
      verificationTimestamp: new Date().toISOString(),
      auditRef: "audit:0x" + Math.random().toString(16).slice(2, 18),
      checks: [
        { id: "c1", label: "Credential structure & required fields", status: "pass" as const, explanation: "Credential structure is well-formed.", technical: "Structure validation passed." },
        { id: "c2", label: "Issuer identity resolution", status: "fail" as const, explanation: "Issuer DID not found in the decentralized trust registry.", technical: "DID: did:unknown:rogue:ff2a8b3c1d9e7f4a — NOT FOUND in registry" },
        { id: "c3", label: "Issuer authorization (trust registry)", status: "fail" as const, explanation: "Issuer is not registered or authorized. Credential cannot be trusted.", technical: "No trust registry record found for did:unknown:rogue:ff2a8b3c1d9e7f4a" },
        { id: "c4", label: "Cryptographic signature verification", status: "warning" as const, explanation: "Cannot verify signature — issuer public key is unavailable.", technical: "Public key lookup failed — issuer not in registry." },
        { id: "c5", label: "Credential integrity & hash comparison", status: "warning" as const, explanation: "Integrity check skipped — issuer cannot be resolved.", technical: "Cannot compare fingerprint without verified issuer public key." },
        { id: "c6", label: "Revocation & validity status", status: "warning" as const, explanation: "Cannot check revocation status — issuer unauthorized.", technical: "Revocation check skipped." },
        { id: "c7", label: "Audit reference & timestamp", status: "pass" as const, explanation: "Unauthorized issuer attempt logged.", technical: "Security alert event logged to audit trail." },
      ],
    },
  },
  revoked: {
    label: "Revoked Credential",
    description: "Valid signature, but the credential was explicitly revoked by the issuer.",
    credential: DEMO_CREDENTIALS[2],
    result: {
      overallStatus: "revoked" as const,
      expectedFingerprint: "sha256:e1f7b3c8d4a9d5e1f7b3c8d4a9d5e1f7",
      submittedFingerprint: "sha256:e1f7b3c8d4a9d5e1f7b3c8d4a9d5e1f7",
      verificationTimestamp: new Date().toISOString(),
      auditRef: "audit:0x" + Math.random().toString(16).slice(2, 18),
      checks: [
        { id: "c1", label: "Credential structure & required fields", status: "pass" as const, explanation: "All required fields are present.", technical: "Structure validation passed." },
        { id: "c2", label: "Issuer identity resolution", status: "pass" as const, explanation: "Issuer DID resolved to Meridian University.", technical: "DID: did:trustchain:mu:9b3d5f7a1c2e4f6a8b0d2e4f6a8c0e2f" },
        { id: "c3", label: "Issuer authorization (trust registry)", status: "pass" as const, explanation: "Issuer is authorized to issue Internship Certificate credentials.", technical: "issuer-003 authorized for internship_certificate" },
        { id: "c4", label: "Cryptographic signature verification", status: "pass" as const, explanation: "Ed25519 signature is cryptographically valid.", technical: "Signature is valid — note: a valid signature does not indicate active status." },
        { id: "c5", label: "Credential integrity & hash comparison", status: "pass" as const, explanation: "Content hash matches the registered fingerprint.", technical: "sha256:e1f7b3c8d4a9d5e1f7b3c8d4a9d5e1f7 — Match: ✓" },
        { id: "c6", label: "Revocation & validity status", status: "fail" as const, explanation: "Credential was revoked on 2024-10-05. Revocation reason: Subject employment status change.", technical: "Revocation event: revoc:0xa8b9c0d1e2f3a4b5 — Block #8,301,447" },
        { id: "c7", label: "Audit reference & timestamp", status: "pass" as const, explanation: "Revoked credential verification logged.", technical: "Audit event recorded. Revocation event reference included." },
      ],
    },
  },
};

// ─── Network Stats ─────────────────────────────────────────────────────────────

export const NETWORK_STATS = {
  registeredInstitutions: 47,
  credentialsIssued: 12483,
  successfulVerifications: 34291,
  revokedCredentials: 203,
  activeNodes: 47,
  lastRegistryUpdate: "2024-10-24T11:58:00Z",
  networkSyncStatus: "Synchronized",
  tamperDetected: 7,
  unauthorizedAttempts: 14,
  recentRevocations: 3,
};

export const CREDENTIAL_TYPES = [
  "Academic Degree",
  "Internship Certificate",
  "Course Completion",
  "Professional Qualification",
  "Institutional Document",
];
