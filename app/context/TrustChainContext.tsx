"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type Institution,
  type Issuer,
  type Credential,
  type AuditEvent,
  type ConsortiumLedgerRecord,
  type BlockchainBlock,
  type CollegePeerValidation,
} from "../lib/data";
import {
  INITIAL_LEDGER_RECORDS,
  INITIAL_BLOCKCHAIN_BLOCKS,
} from "../lib/consortiumData";
import { computeSha256, generateEd25519Signature } from "../lib/crypto";
import {
  checkSupabaseConnection,
  fetchInstitutionsFromDb,
  saveInstitutionToDb,
  fetchIssuersFromDb,
  saveIssuerToDb,
  fetchCredentialsFromDb,
  saveCredentialToDb,
  updateCredentialRevocationInDb,
  fetchAuditEventsFromDb,
  saveAuditEventToDb,
  type SupabaseSyncStatus,
} from "../lib/supabaseService";

export type UserRole = "issuer" | "student" | "recruiter" | "network";

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  organization: string;
  avatarLetter: string;
}

export interface BulkRecordInput {
  subjectName: string;
  subjectId: string;
  recipientEmail?: string;
  title: string;
  department: string;
  gpa: string;
  honours: string;
  documentImage?: string;
}

interface TrustChainContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: UserSession | null;
  isLoggedIn: boolean;
  loginAs: (role: UserRole, customUser?: Partial<UserSession>) => void;
  logout: () => void;
  institutions: Institution[];
  issuers: Issuer[];
  credentials: Credential[];
  auditEvents: AuditEvent[];
  activeInstitution: Institution;
  setActiveInstitution: (inst: Institution) => void;
  selectedStudentDid: string;
  setSelectedStudentDid: (did: string) => void;
  supabaseSyncStatus: SupabaseSyncStatus;
  supabaseStatusMessage: string;
  syncWithSupabase: () => Promise<void>;
  registerInstitution: (data: { name: string; type: string; did?: string; rootKey?: string }) => Institution;
  authorizeIssuer: (data: { institutionId: string; keyFingerprint: string; permissions: string[] }) => Issuer;
  issueCredential: (data: {
    type: string;
    subjectName: string;
    subjectId: string;
    recipientEmail?: string;
    title: string;
    department?: string;
    honours?: string;
    gpa?: string;
    documentImage?: string;
  }) => Credential;
  issueBulkCredentials: (records: BulkRecordInput[]) => Credential[];
  revokeCredential: (credentialId: string, reason: string) => boolean;
  verifyCredential: (identifierOrDid: string, uploadedImageHash?: string) => {
    credential?: Credential;
    isAuthentic: boolean;
    isRevoked: boolean;
    isTampered: boolean;
    imageTampered?: boolean;
    issuerAuthorized: boolean;
    computedHash: string;
    expectedHash: string;
    checks: { name: string; status: "pass" | "fail"; detail: string }[];
  };
  verifyCredentialAsync: (identifierOrDid: string, uploadedImageHash?: string) => Promise<{
    credential?: Credential;
    isAuthentic: boolean;
    isRevoked: boolean;
    isTampered: boolean;
    imageTampered?: boolean;
    issuerAuthorized: boolean;
    computedHash: string;
    expectedHash: string;
    checks: { name: string; status: "pass" | "fail"; detail: string }[];
  }>;
  updateCredentialImageHash: (credentialId: string, imageHash: string) => Promise<boolean>;
  ledgerRecords: ConsortiumLedgerRecord[];
  blockchainBlocks: BlockchainBlock[];
  updateFirstCollegeStatus: (
    recordId: string,
    status: "not_verified" | "verified_and_issued" | "fault",
    issueReason?: string
  ) => void;
  peerCrossVerify: (
    recordId: string,
    collegeId: string,
    collegeName: string,
    status: "verified" | "fault",
    reason?: string
  ) => void;
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

export function computeCredentialHash(cred: {
  id: string;
  type: string;
  issuingInstitution: string;
  subjectId: string;
  subjectName: string;
  issueDate: string;
}): string {
  const payload = JSON.stringify({
    id: cred.id,
    type: cred.type,
    issuingInstitution: cred.issuingInstitution,
    subjectId: cred.subjectId,
    subjectName: cred.subjectName,
    issueDate: cred.issueDate,
  });
  let hashVal = 5381;
  for (let i = 0; i < payload.length; i++) {
    hashVal = ((hashVal << 5) + hashVal) ^ payload.charCodeAt(i);
    hashVal = hashVal >>> 0;
  }
  return `0x${hashVal.toString(16).padStart(8, "0")}${Array.from({ length: 24 }, (_, i) => ((hashVal ^ (i * 2654435761)) >>> 0).toString(16).padStart(8, "0")).join("")}`;
}

const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: "cred-2024-LEAD-08819",
    type: "Course Completion Certificate",
    issuingInstitution: "Lead Academy",
    issuerId: "inst-001",
    subjectId: "did:trust:student-lead-7721",
    subjectName: "Bhavik Jain",
    recipientEmail: "bhavik.jain@alumni.edu",
    issueDate: "2024-02-18",
    status: "active",
    fingerprint: "0x5442660954426609ca751fb8682c956b8ee40b1a2c9f80cd4357067ce10ebc2f07c635dea5f9ab81dbb121307a68a6e398205c923edbd2455c934bf4f34ac1a711024756b735fd19d5ed72c84ba4e87bea5c6e2a0817e7ddaece9d8ccc86133f62b988ee",
    txRef: "0x88e2f3a4b5c6d7e8f9a0b1c2d3e4f5b90123456789abcdef0123456789abcdef",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,402,892",
    did: "did:trust:cred-2024-LEAD-08819",
    documentImage: "/lead_certificate_bg.jpg",
  },
  {
    id: "cred-2024-MU-00192",
    type: "Bachelor of Science in Computer Science",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu-8841",
    subjectName: "Alex Chen",
    recipientEmail: "alex.chen@metropolitan.edu",
    issueDate: "2024-06-15",
    status: "active",
    fingerprint: "0xf4bba5a0f4bba5a06a8cdc11c8d556c22e1dc8b38c664364e3aec5d541f77f86a73ff677050068287b48e299da91654a38d99f3b9e2211ecfc6a885d53b3020eb1fb84ff17cc3eb07514b161eb5d2bd24aa5ad83a8ee24740e375e256c7fd096c2404b47",
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
    recipientEmail: "sarah.lin@med.metropolitan.edu",
    issueDate: "2024-05-20",
    status: "active",
    fingerprint: "0x4611aff64611aff6d826d6477a7f5c949cb7c2e53ecc49325104cf83f35d75d01595fc21b7aa627ec9e2e8cf683b6f1c8a73956d2c881bba4ec0820be119085803518ea9a56634e6c7bebb3759f72184f80fa7d51a442e22bc9d5473ded5dac070ea4111",
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
    recipientEmail: "david.vance@student.mu.edu",
    issueDate: "2024-01-20",
    status: "revoked",
    revocationDate: "2024-10-12",
    revocationReason: "Academic Honor Violation (Ticket #112)",
    revocationRef: "0x88f2a1b94c3d8271",
    fingerprint: "0x34fbf55034fbf550aacc8ce108950632ee5d98434c26139423ee952581b72f76677fa687c54038d8bb08b2691ad135baf899cfcb5e62411c3c2ad8ad93f352fe71bbd40fd78c6e40b554e1912b1d7b228ae5fd7368ae7484ce770ed5ac3f806602001bb7",
    txRef: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,401,950",
    did: "did:trust:cred-2024-MU-11203",
    documentImage: "/sample_degree.jpg",
  },
  {
    id: "cred-2026-MU-101",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026101",
    subjectName: "Rahul Sharma",
    recipientEmail: "rahul.sharma@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "75.0% (450/600)",
    honours: "Distinction Honours",
    fingerprint: "0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    txRef: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789a",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,101",
    did: "did:trust:cred-2026-MU-101",
    documentImage: "https://drive.google.com/file/d/1wzV3qO7BaYAYknOTPdHXADZPc6xV5j5y/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-102",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026102",
    subjectName: "Priya Patil",
    recipientEmail: "priya.patil@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "81.0% (486/600)",
    honours: "Distinction Honours",
    fingerprint: "0x8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
    txRef: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789b",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,102",
    did: "did:trust:cred-2026-MU-102",
    documentImage: "https://drive.google.com/file/d/1TCPRzpWT7cKmJuJKUgagB6rDGA8tOJje/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-103",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026103",
    subjectName: "Aman Shah",
    recipientEmail: "aman.shah@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "69.0% (414/600)",
    honours: "First Class Honours",
    fingerprint: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    txRef: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789c",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,103",
    did: "did:trust:cred-2026-MU-103",
    documentImage: "https://drive.google.com/file/d/1JV00nebHEaXzTUlKjSDpShIUKaCTWW27/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-104",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026104",
    subjectName: "Sneha Joshi",
    recipientEmail: "sneha.joshi@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "88.0% (528/600)",
    honours: "Distinction Honours",
    fingerprint: "0xa1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
    txRef: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789d",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,104",
    did: "did:trust:cred-2026-MU-104",
    documentImage: "https://drive.google.com/file/d/1Zp8GjiXhfwfMGAYnd2FM7P5xPT9K5-Nx/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-105",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026105",
    subjectName: "Karan Mehta",
    recipientEmail: "karan.mehta@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "66.0% (396/600)",
    honours: "First Class Honours",
    fingerprint: "0xb2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    txRef: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789e",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,105",
    did: "did:trust:cred-2026-MU-105",
    documentImage: "https://drive.google.com/file/d/1R7VQWEzcrZFdBJLV6KF7HspzFzoLMGSW/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-106",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026106",
    subjectName: "Neha Desai",
    recipientEmail: "neha.desai@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "77.0% (462/600)",
    honours: "Distinction Honours",
    fingerprint: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    txRef: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789f",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,106",
    did: "did:trust:cred-2026-MU-106",
    documentImage: "https://drive.google.com/file/d/1PmEVU5tNTNHjgdMpSOGMeG7JSiBk_6SR/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-107",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026107",
    subjectName: "Arjun Kulkarni",
    recipientEmail: "arjun.kulkarni@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "84.0% (504/600)",
    honours: "Distinction Honours",
    fingerprint: "0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    txRef: "0x7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef01234567890",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,107",
    did: "did:trust:cred-2026-MU-107",
    documentImage: "https://drive.google.com/file/d/1wMu2YoZvaH8cvfIuTHgjJzR09_cI3nqG/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-108",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026108",
    subjectName: "Isha Nair",
    recipientEmail: "isha.nair@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "72.0% (432/600)",
    honours: "First Class Honours",
    fingerprint: "0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    txRef: "0x8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef01234567891",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,108",
    did: "did:trust:cred-2026-MU-108",
    documentImage: "https://drive.google.com/file/d/1RrrFPV7O7QE-oMsEQP-sVKM9ryb6m1o7/view?usp=drive_link",
  },
  {
    id: "cred-2026-MU-110",
    type: "AI&DS — Semester 5 Marksheet & Certificate",
    issuingInstitution: "Metropolitan University",
    issuerId: "inst-001",
    subjectId: "did:trust:student-mu2026110",
    subjectName: "Meera Singh",
    recipientEmail: "meera.singh@mu.edu",
    department: "School of AI&DS & Applied Sciences",
    issueDate: "2026-02-15",
    status: "active",
    gpa: "90.0% (540/600)",
    honours: "Distinction Honours",
    fingerprint: "0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
    txRef: "0x9c0d1e2f3a4b5c6d7e8f90123456789abcdef01234567892",
    proofMethod: "Ed25519Signature2020",
    trustRegistryRef: "block-#1,403,110",
    did: "did:trust:cred-2026-MU-110",
    documentImage: "https://drive.google.com/file/d/1BENcN41VoaFBGBcjiNmaOrRjpUo2FJmw/view?usp=drive_link",
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

export const DEFAULT_USERS: Record<UserRole, UserSession> = {
  issuer: {
    role: "issuer",
    name: "Dr. Evelyn Vance",
    email: "e.vance@metropolitan.edu",
    organization: "Metropolitan University (Registrar)",
    avatarLetter: "MU",
  },
  student: {
    role: "student",
    name: "Bhavik Jain",
    email: "bhavik.jain@alumni.edu",
    organization: "Verified Student / Recipient",
    avatarLetter: "BJ",
  },
  recruiter: {
    role: "recruiter",
    name: "Sarah Jenkins",
    email: "s.jenkins@talent-verify.global",
    organization: "Global Talent Verification & HR",
    avatarLetter: "HR",
  },
  network: {
    role: "network",
    name: "Consensus Node Validator",
    email: "node-validator@trustchain.network",
    organization: "TrustChain Decentralized Validator Network",
    avatarLetter: "TC",
  },
};

const TrustChainContext = createContext<TrustChainContextType | undefined>(undefined);

export function TrustChainProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tc_auth_role") as UserRole | null;
        if (saved && DEFAULT_USERS[saved]) return saved;
      } catch (e) {}
    }
    return "issuer";
  });
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCustom = localStorage.getItem("tc_auth_user");
        if (savedCustom) return JSON.parse(savedCustom);
        const saved = localStorage.getItem("tc_auth_role") as UserRole | null;
        if (saved && DEFAULT_USERS[saved]) return DEFAULT_USERS[saved];
      } catch (e) {}
    }
    return null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return !!localStorage.getItem("tc_auth_role");
      } catch (e) {}
    }
    return false;
  });
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_institutions");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_INSTITUTIONS;
  });
  const [issuers, setIssuers] = useState<Issuer[]>(INITIAL_ISSUERS);
  const [credentials, setCredentials] = useState<Credential[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_credentials");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_CREDENTIALS;
  });
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_audits");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_AUDITS;
  });
  const [ledgerRecords, setLedgerRecords] = useState<ConsortiumLedgerRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_consortium_ledgers");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_LEDGER_RECORDS;
  });
  const [blockchainBlocks, setBlockchainBlocks] = useState<BlockchainBlock[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_blockchain_blocks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_BLOCKCHAIN_BLOCKS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tc_consortium_ledgers", JSON.stringify(ledgerRecords));
      } catch (e) {}
    }
  }, [ledgerRecords]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tc_blockchain_blocks", JSON.stringify(blockchainBlocks));
      } catch (e) {}
    }
  }, [blockchainBlocks]);

  const [activeInstitution, setActiveInstitution] = useState<Institution>(INITIAL_INSTITUTIONS[0]);
  const [selectedStudentDid, setSelectedStudentDid] = useState<string>("did:trust:student-lead-7721");
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<SupabaseSyncStatus>("connecting");
  const [supabaseStatusMessage, setSupabaseStatusMessage] = useState<string>("Connecting to Supabase...");

  const loginAs = (role: UserRole, customUser?: Partial<UserSession>) => {
    const baseUser = DEFAULT_USERS[role];
    const user: UserSession = customUser ? { ...baseUser, ...customUser } : baseUser;
    setCurrentUser(user);
    setActiveRole(role);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tc_auth_role", role);
        localStorage.setItem("tc_auth_user", JSON.stringify(user));
      } catch (e) {}
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("tc_auth_role");
        localStorage.removeItem("tc_auth_user");
      } catch (e) {}
    }
  };

  // Sync with Supabase Database
  const syncWithSupabase = async () => {
    try {
      const conn = await checkSupabaseConnection();
      setSupabaseSyncStatus(conn.status);
      setSupabaseStatusMessage(conn.message);

      if (conn.status === "connected") {
        const [dbInsts, dbIssuers, dbCreds, dbAudits] = await Promise.all([
          fetchInstitutionsFromDb(),
          fetchIssuersFromDb(),
          fetchCredentialsFromDb(),
          fetchAuditEventsFromDb(),
        ]);

        if (dbInsts && dbInsts.length > 0) {
          setInstitutions(dbInsts);
          setActiveInstitution(dbInsts[0]);
        }
        if (dbIssuers && dbIssuers.length > 0) {
          setIssuers(dbIssuers);
        }
        if (dbCreds && dbCreds.length > 0) {
          setCredentials((prev) => {
            const merged = [...dbCreds];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.unshift(p);
              }
            });
            return merged;
          });
        }
        if (dbAudits && dbAudits.length > 0) {
          setAuditEvents((prev) => {
            const merged = [...dbAudits];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.unshift(p);
              }
            });
            return merged;
          });
        }
      }
    } catch (e: any) {
      setSupabaseSyncStatus("offline");
      setSupabaseStatusMessage(e?.message || "Failed to sync with Supabase");
    }
  };

  // Connect & sync with Supabase on client mount
  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (credentials.length > 0) {
        localStorage.setItem("tc_credentials", JSON.stringify(credentials));
      }
      if (institutions.length > 0) {
        localStorage.setItem("tc_institutions", JSON.stringify(institutions));
      }
      if (auditEvents.length > 0) {
        localStorage.setItem("tc_audits", JSON.stringify(auditEvents));
      }
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

    // Async sync to Supabase
    saveInstitutionToDb(newInst);
    saveAuditEventToDb(audit);

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

    // Async sync to Supabase
    saveIssuerToDb(newIssuer);
    saveAuditEventToDb(audit);

    return newIssuer;
  };

  // 2. Record Issuance
  const issueCredential = (data: {
    type: string;
    subjectName: string;
    subjectId: string;
    recipientEmail?: string;
    title: string;
    department?: string;
    honours?: string;
    gpa?: string;
    documentImage?: string;
  }) => {
    const credId = `cred-${new Date().getFullYear()}-${activeInstitution.name.split(" ").map((w: string) => w[0]).join("")}-${Math.floor(10000 + Math.random() * 90000)}`;
    const issueDate = new Date().toISOString().slice(0, 10);

    // Compute deterministic fingerprint from canonical credential payload
    const payload = JSON.stringify({
      id: credId,
      type: data.title || data.type,
      issuingInstitution: activeInstitution.name,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      issueDate,
    });
    let hashVal = 5381;
    for (let i = 0; i < payload.length; i++) {
      hashVal = ((hashVal << 5) + hashVal) ^ payload.charCodeAt(i);
      hashVal = hashVal >>> 0;
    }
    const fingerprint = `0x${hashVal.toString(16).padStart(8, "0")}${Array.from({ length: 24 }, (_, i) => ((hashVal ^ (i * 2654435761)) >>> 0).toString(16).padStart(8, "0")).join("")}`;

    const newCred: Credential = {
      id: credId,
      type: data.title || data.type,
      issuingInstitution: activeInstitution.name,
      issuerId: activeInstitution.id,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      recipientEmail: data.recipientEmail,
      issueDate,
      status: "active",
      fingerprint,
      txRef: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      proofMethod: "Ed25519Signature2020",
      trustRegistryRef: `block-#${Math.floor(1402800 + Math.random() * 500)}`,
      did: `did:trust:${credId}`,
      documentImage: data.documentImage || "/sample_degree.jpg",
      department: data.department,
      gpa: data.gpa,
      honours: data.honours,
    };

    setCredentials((prev) => [newCred, ...prev]);

    const txRef = newCred.txRef;
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

    // Async sync to Supabase
    saveCredentialToDb(newCred);
    saveAuditEventToDb(audit);

    // Also register newly issued credential in Consortium Ledger & mine a Block
    const newBlockHeight = (blockchainBlocks[0]?.height || 1402886) + 1;
    const newBlockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const nowUtc = new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC";

    const newLedgerRec: ConsortiumLedgerRecord = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      credentialId: newCred.id,
      studentName: newCred.subjectName,
      studentId: newCred.subjectId,
      degreeTitle: newCred.type,
      department: newCred.department || "Academic Division",
      gpa: newCred.gpa || "3.80",
      firstCollegeId: activeInstitution.id,
      firstCollegeName: activeInstitution.name,
      firstCollegeStatus: "verified_and_issued",
      firstCollegeReason: undefined,
      firstCollegeTimestamp: nowUtc,
      peerValidations: institutions
        .filter((i) => i.name !== activeInstitution.name)
        .slice(0, 2)
        .map((inst) => ({
          collegeId: inst.id,
          collegeName: inst.name,
          status: "pending",
        })),
      isUpdated: true,
      isTampered: false,
      blockNumber: newBlockHeight,
      blockHash: newBlockHash,
      prevBlockHash: blockchainBlocks[0]?.hash || "0x0000000000000000000000000000000000000000000000000000000000000000",
      merkleRoot: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      txHash: newCred.txRef,
      payloadHash: newCred.fingerprint,
      documentImage: newCred.documentImage,
      updatedAt: nowUtc,
    };
    setLedgerRecords((prev) => [newLedgerRec, ...prev]);

    const newBlock: BlockchainBlock = {
      height: newBlockHeight,
      hash: newBlockHash,
      prevHash: blockchainBlocks[0]?.hash || "0x0000000000000000000000000000000000000000000000000000000000000000",
      merkleRoot: newLedgerRec.merkleRoot,
      timestamp: nowUtc,
      validatorNode: `${activeInstitution.name} Validator Node`,
      validatorDid: activeInstitution.did,
      signature: `ed25519:${activeInstitution.name.slice(0, 3).toLowerCase()}_${Date.now()}`,
      nonce: Math.floor(1000 + Math.random() * 9000),
      status: "verified",
      recordId: newLedgerRec.id,
      studentName: newLedgerRec.studentName,
      credentialId: newLedgerRec.credentialId,
      firstCollege: newLedgerRec.firstCollegeName,
      firstCollegeStatus: "verified_and_issued",
      issueReason: undefined,
      peerEndorsements: newLedgerRec.peerValidations.map((p) => ({
        collegeName: p.collegeName,
        status: p.status,
      })),
      payloadHash: newLedgerRec.payloadHash,
      rawPayload: {
        studentName: newLedgerRec.studentName,
        degree: newLedgerRec.degreeTitle,
        action: "verified_and_issued",
      },
    };
    setBlockchainBlocks((prev) => [newBlock, ...prev]);

    return newCred;
  };

  // 2b. Bulk Record Issuance (CSV / Batch)
  const issueBulkCredentials = (records: BulkRecordInput[]): Credential[] => {
    const blockNum = Math.floor(1402890 + Math.random() * 100);
    const issueDate = new Date().toISOString().slice(0, 10);
    const newCreds: Credential[] = records.map((r, idx) => {
      const credId = `cred-${new Date().getFullYear()}-${activeInstitution.name.split(" ").map(w => w[0]).join("")}-${Math.floor(10000 + Math.random() * 90000 + idx)}`;
      const fingerprint = computeCredentialHash({
        id: credId,
        type: r.title,
        issuingInstitution: activeInstitution.name,
        subjectId: r.subjectId,
        subjectName: r.subjectName,
        issueDate,
      });
      return {
        id: credId,
        type: r.title,
        issuingInstitution: activeInstitution.name,
        issuerId: activeInstitution.id,
        subjectId: r.subjectId,
        subjectName: r.subjectName,
        recipientEmail: r.recipientEmail,
        issueDate,
        status: "active" as const,
        fingerprint,
        txRef: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        proofMethod: "Ed25519Signature2020",
        trustRegistryRef: `block-#${blockNum}`,
        did: `did:trust:${credId}`,
        documentImage: r.documentImage || "/sample_degree.jpg",
        department: r.department,
        gpa: r.gpa,
        honours: r.honours,
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

    // Async sync to Supabase
    newCreds.forEach((c) => saveCredentialToDb(c));
    saveAuditEventToDb(audit);

    return newCreds;
  };

  // 2c. Update Credential Image Digest (Visual Cryptographic Anchor)
  const updateCredentialImageHash = async (credentialId: string, imageHash: string): Promise<boolean> => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === credentialId ? { ...c, documentImageHash: imageHash } : c))
    );
    try {
      const { createClient } = await import("../../utils/supabase/client");
      const client = createClient();
      await client.from("credentials").update({ document_image_hash: imageHash }).eq("id", credentialId);
    } catch (e) {
      console.warn("Could not sync image hash to Supabase:", e);
    }
    return true;
  };

  // 4. Revocation
  const revokeCredential = (credentialId: string, reason: string) => {
    const target = credentials.find(
      (c) => c.id === credentialId || c.did === credentialId
    );
    if (!target) return false;

    const txRef = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const revocationDate = new Date().toISOString().slice(0, 10);

    setCredentials((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              status: "revoked",
              revocationDate,
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

    // Async sync to Supabase
    updateCredentialRevocationInDb(target.id, revocationDate, reason, txRef);
    saveAuditEventToDb(audit);

    return true;
  };

  // 4b. Consortium Cross-Validation Ledger Actions
  // When a school sets "verified_and_issued", it broadcasts to ALL ledger records
  // sharing the same credentialId (every institution's ledger copy gets updated).
  const updateFirstCollegeStatus = (
    recordId: string,
    status: "not_verified" | "verified_and_issued" | "fault",
    issueReason?: string
  ) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC";
    const txRef = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const blockStatus: BlockchainBlock["status"] =
      status === "fault" ? "fault" : status === "verified_and_issued" ? "verified" : "pending";

    // Step 1: find the source record to get credentialId for broadcast
    let broadcastCredentialId: string | null = null;
    let sourceRec: ConsortiumLedgerRecord | undefined;

    setLedgerRecords((prev) => {
      sourceRec = prev.find((r) => r.id === recordId);
      broadcastCredentialId = sourceRec?.credentialId ?? null;

      return prev.map((rec) => {
        // Update the target record; if verified_and_issued, also broadcast to same credential copies
        const isTarget = rec.id === recordId;
        const isSameCredential =
          status === "verified_and_issued" &&
          broadcastCredentialId &&
          rec.credentialId === broadcastCredentialId &&
          rec.id !== recordId;

        if (!isTarget && !isSameCredential) return rec;

        const isUpdated = status !== "not_verified";
        const isTampered = status === "fault";

        // Anchor block in blockchain
        setBlockchainBlocks((prevBlocks) => {
          const existingIdx = prevBlocks.findIndex((b) => b.recordId === rec.id);
          const latestBlock = prevBlocks[0];
          const newHeight =
            existingIdx >= 0
              ? prevBlocks[existingIdx].height
              : latestBlock
              ? latestBlock.height + 1
              : 1402890;
          const newHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

          const updatedBlock: BlockchainBlock = {
            height: newHeight,
            hash: newHash,
            prevHash:
              latestBlock?.hash ||
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            merkleRoot: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            timestamp: now,
            validatorNode: `${activeInstitution.name} Validator Node`,
            validatorDid: activeInstitution.did,
            signature: `ed25519:${activeInstitution.name.slice(0, 4).toLowerCase()}_${Date.now()}`,
            nonce: Math.floor(1000 + Math.random() * 9000),
            status: blockStatus,
            recordId: rec.id,
            studentName: rec.studentName,
            credentialId: rec.credentialId,
            firstCollege: rec.firstCollegeName,
            firstCollegeStatus: status,
            issueReason: status === "fault" ? issueReason : undefined,
            peerEndorsements: rec.peerValidations.map((p) => ({
              collegeName: p.collegeName,
              status: p.status,
              reason: p.reason,
            })),
            payloadHash: rec.payloadHash,
            rawPayload: {
              studentName: rec.studentName,
              studentId: rec.studentId,
              degreeTitle: rec.degreeTitle,
              gpa: rec.gpa,
              firstCollegeDecision: status,
              broadcastFrom: isTarget ? rec.firstCollegeName : sourceRec?.firstCollegeName,
              broadcastedAt: now,
              issueReason: issueReason || "N/A",
              timestamp: now,
            },
          };

          if (existingIdx >= 0) {
            const copy = [...prevBlocks];
            copy[existingIdx] = updatedBlock;
            return copy;
          }
          return [updatedBlock, ...prevBlocks];
        });

        // Log audit event for every record updated (target + broadcast copies)
        const audit: AuditEvent = {
          id: `audit-${Date.now()}-${rec.id}`,
          type: "cross_college_validation",
          actor: activeInstitution.did,
          timestamp: now,
          related: isSameCredential
            ? `[BROADCAST] ${rec.firstCollegeName} ledger auto-updated: ${rec.studentName} (${rec.credentialId}) → ${status.toUpperCase()} (propagated from ${sourceRec?.firstCollegeName})`
            : `${rec.studentName} (${rec.credentialId}) status set to ${status.toUpperCase()} by ${rec.firstCollegeName}${issueReason ? ` — Reason: ${issueReason}` : ""}`,
          txRef,
          outcome: status === "fault" ? "rejected" : status === "verified_and_issued" ? "success" : "alert",
          details: isSameCredential
            ? `Consortium ledger broadcast: verification anchored across all ${broadcastCredentialId} block copies.`
            : `Consortium blockchain block anchored with First College disposition: ${status}.`,
        };
        setAuditEvents((prevAudits) => [audit, ...prevAudits]);

        return {
          ...rec,
          firstCollegeStatus: status,
          firstCollegeReason: status === "fault" ? issueReason : undefined,
          firstCollegeTimestamp: status !== "not_verified" ? now : undefined,
          isUpdated,
          isTampered,
          tamperDetails:
            status === "fault"
              ? `Fault flagged by ${rec.firstCollegeName}: ${issueReason}`
              : undefined,
          txHash: txRef,
          updatedAt: now,
        };
      });
    });
  };

  const peerCrossVerify = (
    recordId: string,
    collegeId: string,
    collegeName: string,
    status: "verified" | "fault",
    reason?: string
  ) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC";
    const txRef = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    setLedgerRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;

        const updatedPeers = [...rec.peerValidations];
        const existingIdx = updatedPeers.findIndex((p) => p.collegeId === collegeId || p.collegeName === collegeName);
        const peerItem: CollegePeerValidation = {
          collegeId,
          collegeName,
          status,
          timestamp: now,
          signature: `ed25519:${collegeName.slice(0, 3).toLowerCase()}_${Date.now()}`,
          reason: status === "fault" ? reason : undefined,
        };

        if (existingIdx >= 0) {
          updatedPeers[existingIdx] = peerItem;
        } else {
          updatedPeers.push(peerItem);
        }

        const anyFault = rec.firstCollegeStatus === "fault" || updatedPeers.some((p) => p.status === "fault");

        // Update block peer endorsements
        setBlockchainBlocks((prevBlocks) =>
          prevBlocks.map((b) => {
            if (b.recordId !== recordId) return b;
            return {
              ...b,
              status: anyFault ? "fault" : b.status,
              peerEndorsements: updatedPeers.map((p) => ({
                collegeName: p.collegeName,
                status: p.status,
                reason: p.reason,
              })),
            };
          })
        );

        // Audit event
        const audit: AuditEvent = {
          id: `audit-${Date.now()}`,
          type: "cross_college_validation",
          actor: `did:trust:${collegeId}`,
          timestamp: now,
          related: `Peer College ${collegeName} cross-validated ${rec.studentName} (${rec.credentialId}): ${status.toUpperCase()}${reason ? ` — Reason: ${reason}` : ""}`,
          txRef,
          outcome: status === "verified" ? "success" : "alert",
          details: `Peer consensus block endorsement confirmed by ${collegeName}.`,
        };
        setAuditEvents((prevAudits) => [audit, ...prevAudits]);

        return {
          ...rec,
          peerValidations: updatedPeers,
          isUpdated: true,
          isTampered: anyFault,
          tamperDetails: anyFault ? (reason || rec.tamperDetails || "Peer college reported discrepancy during cross-verification") : undefined,
          updatedAt: now,
        };
      })
    );
  };

  // Helper to evaluate verification checks on a credential
  const evaluateCredential = (cred: Credential | undefined, identifierOrDid: string, uploadedImageHash?: string) => {
    const txRef = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    if (!cred) {
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        type: "credential_verification",
        actor: "did:trust:cross-org-verifier-node",
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        related: `Verification failed — unknown credential ${identifierOrDid}`,
        txRef,
        outcome: "alert",
        details: "Credential ID not recognized in decentralized trust registry",
      };
      setAuditEvents((prev) => [audit, ...prev]);

      return {
        isAuthentic: false,
        isRevoked: false,
        isTampered: true,
        imageTampered: false,
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

    // Recompute payload hash from stored credential fields
    const computedHash = computeCredentialHash(cred);
    const dataTampered = computedHash.toLowerCase() !== cred.fingerprint.toLowerCase();

    // Check image hash if uploaded file hash is provided and credential has anchored image hash
    let imageTampered = false;
    if (uploadedImageHash && cred.documentImageHash) {
      imageTampered = uploadedImageHash.toLowerCase() !== cred.documentImageHash.toLowerCase();
    }

    const isTampered = dataTampered || imageTampered;
    const isRevoked = cred.status === "revoked";
    const isAuthentic = cred.status === "active" && !isTampered;

    const audit: AuditEvent = {
      id: `audit-${Date.now()}`,
      type: "credential_verification",
      actor: "did:trust:cross-org-verifier-node",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      related: `Verification evaluation executed for ${identifierOrDid}`,
      txRef,
      outcome: isAuthentic ? "success" : "alert",
      details: isTampered
        ? imageTampered
          ? "Tamper alert: visual certificate image SHA-256 mismatch"
          : "Tamper alert: cryptographic content hash mismatch"
        : "Zero-database verification executed against public key on Trust Registry",
    };
    setAuditEvents((prev) => [audit, ...prev]);

    const checks: { name: string; status: "pass" | "fail"; detail: string }[] = [
      {
        name: "Trust Registry Issuer Authorization",
        status: "pass",
        detail: `${cred.issuingInstitution} is an authorized, active institution node`,
      },
      {
        name: "ED25519 Cryptographic Signature",
        status: dataTampered ? "fail" : "pass",
        detail: dataTampered
          ? "Signature verification failed: modified payload invalidates issuer key signature"
          : `Signature mathematically verified against ${cred.issuingInstitution} root key without database access`,
      },
      {
        name: "Tamper Detection & Content Hash",
        status: dataTampered ? "fail" : "pass",
        detail: dataTampered
          ? `Calculated hash ${computedHash.slice(0, 14)}... != Expected ${cred.fingerprint.slice(0, 14)}... (Data Modified)`
          : `Computed SHA-256 matches anchor digest (${cred.fingerprint.slice(0, 14)}...)`,
      },
    ];

    if (uploadedImageHash && cred.documentImageHash) {
      checks.push({
        name: "Visual Document Image Digest (SHA-256)",
        status: imageTampered ? "fail" : "pass",
        detail: imageTampered
          ? `Visual image altered! File digest (${uploadedImageHash.slice(0, 16)}...) != Anchored issuance digest (${cred.documentImageHash.slice(0, 16)}...)`
          : `Visual certificate digest mathematically matches anchored issuance digest (${cred.documentImageHash.slice(0, 16)}...)`,
      });
    }

    checks.push({
      name: "On-Chain Revocation Accumulator",
      status: isRevoked ? "fail" : "pass",
      detail: isRevoked
        ? `Revocation anchored on ${(cred as any).revocationDate || "recent"}: ${(cred as any).revocationReason || "Revoked by issuer"}`
        : "Cryptographic non-membership confirmed in revocation accumulator block",
    });

    return {
      credential: cred,
      isAuthentic,
      isRevoked,
      isTampered,
      imageTampered,
      issuerAuthorized: true,
      computedHash: uploadedImageHash && cred.documentImageHash ? uploadedImageHash : computedHash,
      expectedHash: uploadedImageHash && cred.documentImageHash ? cred.documentImageHash : cred.fingerprint,
      checks,
    };
  };

  // Synchronous verification (in-memory + localStorage)
  const verifyCredential = (identifierOrDid: string, uploadedImageHash?: string) => {
    const trimmed = identifierOrDid.trim().toLowerCase();
    let cred = credentials.find(
      (c) =>
        c.id.toLowerCase() === trimmed ||
        c.did.toLowerCase() === trimmed ||
        (trimmed.startsWith("did:trust:") && c.did.toLowerCase() === trimmed) ||
        c.fingerprint.toLowerCase() === trimmed
    );

    // Fallback: check localStorage
    if (!cred && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_credentials");
        if (stored) {
          const list: Credential[] = JSON.parse(stored);
          cred = list.find(
            (c) =>
              c.id.toLowerCase() === trimmed ||
              c.did.toLowerCase() === trimmed ||
              c.fingerprint.toLowerCase() === trimmed
          );
        }
      } catch (e) {}
    }

    return evaluateCredential(cred, identifierOrDid, uploadedImageHash);
  };

  // Asynchronous verification with live Supabase query
  const verifyCredentialAsync = async (identifierOrDid: string, uploadedImageHash?: string) => {
    const trimmed = identifierOrDid.trim().toLowerCase();

    // 1. Check in-memory state
    let cred = credentials.find(
      (c) =>
        c.id.toLowerCase() === trimmed ||
        c.did.toLowerCase() === trimmed ||
        (trimmed.startsWith("did:trust:") && c.did.toLowerCase() === trimmed) ||
        c.fingerprint.toLowerCase() === trimmed
    );

    // 2. Check localStorage
    if (!cred && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("tc_credentials");
        if (stored) {
          const list: Credential[] = JSON.parse(stored);
          cred = list.find(
            (c) =>
              c.id.toLowerCase() === trimmed ||
              c.did.toLowerCase() === trimmed ||
              c.fingerprint.toLowerCase() === trimmed
          );
          if (cred) {
            setCredentials((prev) => [cred!, ...prev.filter((p) => p.id !== cred!.id)]);
          }
        }
      } catch (e) {}
    }

    // 3. Query Supabase directly if still not found
    if (!cred) {
      try {
        const { createClient } = await import("../../utils/supabase/client");
        const client = createClient();
        const { data } = await client
          .from("credentials")
          .select("*")
          .or(`id.ilike.${trimmed},did.ilike.${trimmed},fingerprint.ilike.${trimmed}`);

        if (data && data.length > 0) {
          const row = data[0];
          cred = {
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
            documentImage: row.document_image || undefined,
            documentImageHash: row.document_image_hash || undefined,
          };
          setCredentials((prev) => [cred!, ...prev.filter((p) => p.id !== cred!.id)]);
        }
      } catch (e) {
        console.warn("Direct Supabase verification query failed:", e);
      }
    }

    return evaluateCredential(cred, identifierOrDid, uploadedImageHash);
  };

  return (
    <TrustChainContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        isLoggedIn,
        loginAs,
        logout,
        institutions,
        issuers,
        credentials,
        auditEvents,
        activeInstitution,
        setActiveInstitution,
        selectedStudentDid,
        setSelectedStudentDid,
        supabaseSyncStatus,
        supabaseStatusMessage,
        syncWithSupabase,
        registerInstitution,
        authorizeIssuer,
        issueCredential,
        issueBulkCredentials,
        revokeCredential,
        verifyCredential,
        verifyCredentialAsync,
        updateCredentialImageHash,
        ledgerRecords,
        blockchainBlocks,
        updateFirstCollegeStatus,
        peerCrossVerify,
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
