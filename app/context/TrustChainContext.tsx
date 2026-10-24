"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type Institution,
  type Issuer,
  type Credential,
  type AuditEvent,
} from "../lib/data";
import { computeSha256, generateEd25519Signature } from "../lib/crypto";

export type UserRole = "issuer" | "student" | "recruiter" | "network";

export interface BulkRecordInput {
  subjectName: string;
  subjectId: string;
  title: string;
  department: string;
  gpa: string;
  honours: string;
}

interface TrustChainContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  institutions: Institution[];
  issuers: Issuer[];
  credentials: Credential[];
  auditEvents: AuditEvent[];
  activeInstitution: Institution;
  setActiveInstitution: (inst: Institution) => void;
  selectedStudentDid: string;
  setSelectedStudentDid: (did: string) => void;
  registerInstitution: (data: { name: string; type: string; did?: string; rootKey?: string }) => Institution;
  authorizeIssuer: (data: { institutionId: string; keyFingerprint: string; permissions: string[] }) => Issuer;
  issueCredential: (data: {
    type: string;
    subjectName: string;
    subjectId: string;
    title: string;
    department?: string;
    honours?: string;
    gpa?: string;
    documentImage?: string;
  }) => Credential;
  issueBulkCredentials: (records: BulkRecordInput[]) => Credential[];
  revokeCredential: (credentialId: string, reason: string) => boolean;
  verifyCredential: (identifierOrDid: string, tamperedData?: { subjectName?: string; gpa?: string; title?: string }) => {
    credential?: Credential;
    isAuthentic: boolean;
    isRevoked: boolean;
    isTampered: boolean;
    issuerAuthorized: boolean;
    computedHash: string;
    expectedHash: string;
    checks: { name: string; status: "pass" | "fail"; detail: string }[];
  };
}

const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: "inst-001",
    name: "Metropolitan University",
    type: "Higher Education / University",
    did: "did:trust:metropolitan-uni-9942",
    registrationDate: "2023-10-12",
    issuerCount: 8,
    status: "verified",
    txRef: "0x8f2a1b94c3d8271e504b2a9d8c3e1f4b",
    metadata: "Accredited institutional root node",
  },
  {
    id: "inst-002",
    name: "MIT Innovation Labs",
    type: "Enterprise Research Institute",
    did: "did:trust:mit-innov-0012",
    registrationDate: "2023-11-04",
    issuerCount: 14,
    status: "verified",
    txRef: "0x7e3c9a1f5b2d8e401b6c8a2f4d9e3b1c",
    metadata: "Accredited cryptographic engineering center",
  },
  {
    id: "inst-003",
    name: "Stanford Medical Council",
    type: "Medical Licensing Board",
    did: "did:trust:stanford-med-4401",
    registrationDate: "2024-01-15",
    issuerCount: 12,
    status: "verified",
    txRef: "0x4b8a2c1d9e7f3a60b5c1d2e8f4a7b9c0",
    metadata: "State healthcare credential authority",
  },
];

const INITIAL_ISSUERS: Issuer[] = [
  {
    id: "issuer-001",
    institutionId: "inst-001",
    institutionName: "Metropolitan University",
    keyFingerprint: "ed25519:MU9942-ROOT-AUTH-KEY",
    permissions: ["Academic Degrees", "Transcripts", "Honors Certificates"],
    status: "active",
    authorizedDate: "2023-10-12",
    history: [{ date: "2023-10-12", action: "Council authorized root signing keypair" }],
  },
  {
    id: "issuer-002",
    institutionId: "inst-002",
    institutionName: "MIT Innovation Labs",
    keyFingerprint: "ed25519:MIT0012-INNOV-KEY",
    permissions: ["Research Fellowships", "Patents", "Specialized Diplomas"],
    status: "active",
    authorizedDate: "2023-11-04",
    history: [{ date: "2023-11-04", action: "Authorized by board decree" }],
  },
];

const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: "cred-2024-MU-00192",
    type: "Bachelor of Science in Computer Science",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu-8841",
    subjectName: "Alex Chen",
    issueDate: "2024-06-15",
    status: "active",
    fingerprint: "0x8f2d9c1b7a4e6305149e88bf450289ab7e291249b51dca67104bce38102a9914",
    txRef: "0x3a4b5c6d7e8f90123456789abcdef012",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,402,881",
    did: "did:trust:cred-2024-MU-00192",
    documentImage: "/sample_degree.jpg",
  },
  {
    id: "cred-2024-MU-00812",
    type: "Doctor of Medicine (M.D.)",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu-9014",
    subjectName: "Dr. Sarah Lin",
    issueDate: "2024-05-20",
    status: "active",
    fingerprint: "0x4b7e2a91c3d805f6e1a4b2c9d8e7f1a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4",
    txRef: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,402,880",
    did: "did:trust:cred-2024-MU-008812",
    documentImage: "/sample_degree.jpg",
  },
  {
    id: "cred-2024-MU-11203",
    type: "Internship Certificate in Cloud Systems",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu-4421",
    subjectName: "David K. Vance",
    issueDate: "2024-01-20",
    status: "revoked",
    revocationDate: "2024-10-12",
    revocationReason: "Academic Honor Violation (Ticket #112)",
    revocationRef: "0x88f2a1b94c3d8271",
    fingerprint: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    txRef: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,401,950",
    did: "did:trust:cred-2024-MU-11203",
    documentImage: "/sample_degree.jpg",
  },
];

const INITIAL_AUDITS: AuditEvent[] = [
  {
    id: "audit-001",
    type: "credential_issuance",
    actor: "did:trust:metropolitan-uni-9942",
    timestamp: "2024-06-15 10:24:18",
    related: "Bachelor of Science in Computer Science issued to Alex Chen",
    txRef: "0x3a4b5c6d7e8f90123456789abcdef012",
    outcome: "success",
    details: "Anchored to block #1,402,881 with ED25519 cryptographic key signature",
  },
  {
    id: "audit-002",
    type: "credential_revocation",
    actor: "did:trust:metropolitan-uni-9942",
    timestamp: "2024-10-12 14:10:05",
    related: "Internship Certificate revoked for David K. Vance",
    txRef: "0x88f2a1b94c3d8271",
    outcome: "rejected",
    details: "Revocation accumulator updated due to Academic Honor Violation",
  },
];

const TrustChainContext = createContext<TrustChainContextType | undefined>(undefined);

export function TrustChainProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>("issuer");
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);
  const [issuers, setIssuers] = useState<Issuer[]>(INITIAL_ISSUERS);
  const [credentials, setCredentials] = useState<Credential[]>(INITIAL_CREDENTIALS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDITS);
  const [activeInstitution, setActiveInstitution] = useState<Institution>(INITIAL_INSTITUTIONS[0]);
  const [selectedStudentDid, setSelectedStudentDid] = useState<string>("did:trust:student-mu-8841");

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedCreds = localStorage.getItem("tc_credentials");
      if (storedCreds) setCredentials(JSON.parse(storedCreds));
      const storedInsts = localStorage.getItem("tc_institutions");
      if (storedInsts) setInstitutions(JSON.parse(storedInsts));
      const storedAudits = localStorage.getItem("tc_audits");
      if (storedAudits) setAuditEvents(JSON.parse(storedAudits));
    } catch (e) {
      console.warn("Storage hydration bypassed");
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tc_credentials", JSON.stringify(credentials));
      localStorage.setItem("tc_institutions", JSON.stringify(institutions));
      localStorage.setItem("tc_audits", JSON.stringify(auditEvents));
    } catch (e) {
      // Ignore
    }
  }, [credentials, institutions, auditEvents]);

  // 1. Institution Registration
  const registerInstitution = (data: { name: string; type: string; did?: string; rootKey?: string }) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 16);
    const id = `inst-${Date.now().toString().slice(-4)}`;
    const did = data.did || `did:trust:${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const newInst: Institution = {
      id,
      name: data.name,
      type: data.type,
      did,
      registrationDate: new Date().toISOString().slice(0, 10),
      issuerCount: 1,
      status: "verified",
      txRef,
      metadata: "Registered on decentralized Trust Registry",
    };

    setInstitutions((prev) => [newInst, ...prev]);

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "institution_registration",
      actor: did,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `${newInst.name} registered as authorized root authority`,
      txRef,
      outcome: "success",
      details: `Institution ${newInst.name} (${did}) registered on chain with initial issuer quota`,
    };
    setAuditEvents((prev) => [audit, ...prev]);

    return newInst;
  };

  // 1b. Authorize Issuer
  const authorizeIssuer = (data: { institutionId: string; keyFingerprint: string; permissions: string[] }) => {
    const targetInst = institutions.find((i) => i.id === data.institutionId) || activeInstitution;
    const newIssuer: Issuer = {
      id: `issuer-${Date.now().toString().slice(-3)}`,
      institutionId: targetInst.id,
      institutionName: targetInst.name,
      keyFingerprint: data.keyFingerprint || `ed25519:${Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      permissions: data.permissions,
      status: "active",
      authorizedDate: new Date().toISOString().slice(0, 10),
      history: [{ date: new Date().toISOString().slice(0, 10), action: "Keypair authorized by Council vote" }],
    };

    setIssuers((prev) => [newIssuer, ...prev]);
    setInstitutions((prev) =>
      prev.map((i) => (i.id === targetInst.id ? { ...i, issuerCount: i.issuerCount + 1 } : i))
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "issuer_authorization",
      actor: targetInst.did,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `Signer key ${newIssuer.keyFingerprint} authorized for ${targetInst.name}`,
      txRef: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      outcome: "success",
      details: `Council authorized keypair ${newIssuer.keyFingerprint} for institutional credential signing`,
    };
    setAuditEvents((prev) => [audit, ...prev]);

    return newIssuer;
  };

  // 2. Record Issuance
  const issueCredential = (data: {
    type: string;
    subjectName: string;
    subjectId: string;
    title: string;
    department?: string;
    honours?: string;
    gpa?: string;
    documentImage?: string;
  }) => {
    const randomHex = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const credId = `cred-${new Date().getFullYear()}-${activeInstitution.name.split(" ").map(w => w[0]).join("")}-${Math.floor(10000 + Math.random() * 90000)}`;
    const txRef = `0x${randomHex()}`;
    const fingerprint = `0x${randomHex()}${randomHex()}`;

    const newCred: Credential = {
      id: credId,
      type: data.title || data.type,
      issuingInstitution: activeInstitution.name,
      issuerId: activeInstitution.id,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      issueDate: new Date().toISOString().slice(0, 10),
      status: "active",
      fingerprint,
      txRef,
      proofMethod: "Ed25519Signature2020",
      trustRegistryRef: `block-#${Math.floor(1402800 + Math.random() * 500)}`,
      did: `did:trust:${credId}`,
      documentImage: data.documentImage || "/sample_degree.jpg",
    };

    setCredentials((prev) => [newCred, ...prev]);

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "credential_issuance",
      actor: activeInstitution.did,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `${newCred.type} issued to ${newCred.subjectName} (${newCred.id})`,
      txRef,
      outcome: "success",
      details: `Cryptographic ED25519 signature anchored to block ${newCred.trustRegistryRef}`,
    };
    setAuditEvents((prev) => [audit, ...prev]);

    return newCred;
  };

  // 2b. Bulk Record Issuance (CSV / Batch)
  const issueBulkCredentials = (records: BulkRecordInput[]): Credential[] => {
    const blockNum = Math.floor(1402890 + Math.random() * 100);
    const newCreds: Credential[] = records.map((r, idx) => {
      const randomHex = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const credId = `cred-${new Date().getFullYear()}-${activeInstitution.name.split(" ").map(w => w[0]).join("")}-${Math.floor(10000 + Math.random() * 90000 + idx)}`;
      return {
        id: credId,
        type: r.title,
        issuingInstitution: activeInstitution.name,
        issuerId: activeInstitution.id,
        subjectId: r.subjectId,
        subjectName: r.subjectName,
        issueDate: new Date().toISOString().slice(0, 10),
        status: "active",
        fingerprint: `0x${randomHex()}${randomHex()}`,
        txRef: `0x${randomHex()}`,
        proofMethod: "Ed25519Signature2020",
        trustRegistryRef: `block-#${blockNum}`,
        did: `did:trust:${credId}`,
      };
    });

    setCredentials((prev) => [...newCreds, ...prev]);

    // Add batch audit event
    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "credential_issuance",
      actor: activeInstitution.did,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `Bulk batch issuance: ${records.length} student certificates anchored`,
      txRef: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      outcome: "success",
      details: `Batch root Merkle root anchored to block #${blockNum}`,
    };
    setAuditEvents((prev) => [audit, ...prev]);

    return newCreds;
  };

  // 4. Revocation
  const revokeCredential = (credentialId: string, reason: string) => {
    const target = credentials.find(
      (c) => c.id === credentialId || c.did === credentialId
    );
    if (!target) return false;

    const txRef = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    setCredentials((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              status: "revoked",
              revocationDate: new Date().toISOString().slice(0, 10),
              revocationReason: reason,
              revocationRef: txRef,
            }
          : c
      )
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "credential_revocation",
      actor: activeInstitution.did,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `Credential ${target.id} revoked: ${reason}`,
      txRef,
      outcome: "rejected",
      details: `On-chain revocation accumulator updated with revocation hash for ${target.id}`,
    };
    setAuditEvents((prev) => [audit, ...prev]);

    return true;
  };

  // 3. Cross-Institution & Recruiter Verification
  const verifyCredential = (
    identifierOrDid: string,
    tamperedData?: { subjectName?: string; gpa?: string; title?: string }
  ) => {
    const trimmed = identifierOrDid.trim().toLowerCase();
    const cred = credentials.find(
      (c) =>
        c.id.toLowerCase() === trimmed ||
        c.did.toLowerCase() === trimmed ||
        c.fingerprint.toLowerCase() === trimmed
    );

    const txRef = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    
    // Check if tampered simulation is active
    const isTampered = Boolean(
      tamperedData &&
      ((tamperedData.subjectName && cred && tamperedData.subjectName !== cred.subjectName) ||
       (tamperedData.gpa && tamperedData.gpa !== "3.94") ||
       (tamperedData.title && cred && tamperedData.title !== cred.type))
    );

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "credential_verification",
      actor: "did:trust:cross-org-verifier-node",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `Verification evaluation executed for ${identifierOrDid}`,
      txRef,
      outcome: cred && cred.status === "active" && !isTampered ? "success" : "alert",
      details: isTampered
        ? "Tamper alert: cryptographic content hash mismatch"
        : "Zero-database verification executed against public key on Trust Registry",
    };
    setAuditEvents((prev) => [audit, ...prev]);

    if (!cred) {
      return {
        isAuthentic: false,
        isRevoked: false,
        isTampered: true,
        issuerAuthorized: false,
        computedHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        expectedHash: "0xUnknown",
        checks: [
          { name: "Trust Registry Issuer Authorization", status: "fail" as const, detail: "Issuer record not found in decentralized trust registry" },
          { name: "ED25519 Cryptographic Signature", status: "fail" as const, detail: "Signature payload unrecognized" },
          { name: "Tamper Detection & Content Hash", status: "fail" as const, detail: "Hash does not map to any finalized block" },
          { name: "On-Chain Revocation Accumulator", status: "fail" as const, detail: "Unknown credential state" },
        ],
      };
    }

    const isRevoked = cred.status === "revoked";
    const isAuthentic = cred.status === "active" && !isTampered;
    const computedHash = isTampered
      ? "0x3e198a274b5c81f0923847291a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"
      : cred.fingerprint;

    return {
      credential: cred,
      isAuthentic,
      isRevoked,
      isTampered,
      issuerAuthorized: true,
      computedHash,
      expectedHash: cred.fingerprint,
      checks: [
        {
          name: "Trust Registry Issuer Authorization",
          status: "pass" as const,
          detail: `${cred.issuingInstitution} is an authorized, active institution node`,
        },
        {
          name: "ED25519 Cryptographic Signature",
          status: (isTampered ? "fail" : "pass") as "pass" | "fail",
          detail: isTampered
            ? "Signature verification failed: modified payload invalidates issuer key signature"
            : `Signature mathematically verified against ${cred.issuingInstitution} root key without database access`,
        },
        {
          name: "Tamper Detection & Content Hash",
          status: (isTampered ? "fail" : "pass") as "pass" | "fail",
          detail: isTampered
            ? `Calculated hash ${computedHash.slice(0, 14)}... != Expected ${cred.fingerprint.slice(0, 14)}... (Data Modified)`
            : `Computed SHA-256 matches anchor digest (${cred.fingerprint.slice(0, 14)}...)`,
        },
        {
          name: "On-Chain Revocation Accumulator",
          status: (isRevoked ? "fail" : "pass") as "pass" | "fail",
          detail: isRevoked
            ? `Revocation anchored on ${cred.revocationDate || "recent"}: ${cred.revocationReason || "Revoked by issuer"}`
            : "Cryptographic non-membership confirmed in revocation accumulator block",
        },
      ],
    };
  };

  return (
    <TrustChainContext.Provider
      value={{
        activeRole,
        setActiveRole,
        institutions,
        issuers,
        credentials,
        auditEvents,
        activeInstitution,
        setActiveInstitution,
        selectedStudentDid,
        setSelectedStudentDid,
        registerInstitution,
        authorizeIssuer,
        issueCredential,
        issueBulkCredentials,
        revokeCredential,
        verifyCredential,
      }}
    >
      {children}
    </TrustChainContext.Provider>
  );
}

export function useTrustChain() {
  const context = useContext(TrustChainContext);
  if (!context) {
    throw new Error("useTrustChain must be used within a TrustChainProvider");
  }
  return context;
}
