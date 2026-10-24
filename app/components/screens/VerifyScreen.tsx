"use client";

import { useState } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import {
  VerifyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  LockIcon,
  CopyIcon,
  ArrowRightIcon,
} from "../ui/Icons";
import Button from "../ui/Button";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import LedgerCrossValidationModal from "../ui/LedgerCrossValidationModal";

interface VerifyScreenProps {
  onNavigate?: (screen: string) => void;
}

type ScenarioKey = "valid" | "tampered" | "revoked";

const SCENARIOS = {
  valid: {
    name: "Scenario 1: Authentic Credential",
    badge: "100% Valid",
    badgeStatus: "verified",
    description: "Authentic Computer Science B.S. issued by Metropolitan University",
    credentialId: "did:trust:cred-2024-MU-00192",
    subjectName: "Alex Chen",
    issuer: "Metropolitan University",
    issueDate: "2024-06-15",
    verdict: "VALID",
    summary: "Cryptographic signature matches issuer public key. No tampering detected. Credential is live and active on the trust registry.",
    checks: [
      { name: "Trust Registry Issuer Authorization", status: "pass", detail: "Metropolitan University is an active root issuer on mainnet" },
      { name: "ED25519 Cryptographic Signature", status: "pass", detail: "Signature verified against public key ed25519:MU9942 without database access" },
      { name: "Tamper Detection & Content Hash", status: "pass", detail: "Payload SHA-256 matches root digest (0x8f2d...)" },
      { name: "On-Chain Revocation Accumulator", status: "pass", detail: "Cryptographic non-membership proof confirmed in block #1,402,881" },
    ],
  },
  tampered: {
    name: "Scenario 2: Tampered Credential",
    badge: "Tamper Detected",
    badgeStatus: "revoked",
    description: "Grade modified from 3.20 to 4.00 Summa Cum Laude",
    credentialId: "did:trust:cred-2024-MIT-TAMPER",
    subjectName: "Jordan Hayes (Modified)",
    issuer: "MIT Innovation Labs",
    issueDate: "2024-05-10",
    verdict: "TAMPER_DETECTED",
    summary: "CRITICAL: The SHA-256 payload digest does not match the signed cryptographic digest. The credential contents have been modified after issuance.",
    checks: [
      { name: "Trust Registry Issuer Authorization", status: "pass", detail: "MIT Innovation Labs is a registered institution" },
      { name: "ED25519 Cryptographic Signature", status: "fail", detail: "Signature verification failed: digest mismatch" },
      { name: "Tamper Detection & Content Hash", status: "fail", detail: "Calculated hash 0x3e19... != Expected 0x9b4a... (GPA altered)" },
      { name: "On-Chain Revocation Accumulator", status: "pass", detail: "No revocation record found" },
    ],
  },
  revoked: {
    name: "Scenario 3: Revoked Credential",
    badge: "Revocation Found",
    badgeStatus: "pending",
    description: "Internship Certificate revoked due to academic misconduct",
    credentialId: "did:trust:cred-2024-MU-11203",
    subjectName: "David K. Vance",
    issuer: "Metropolitan University Faculty Board",
    issueDate: "2024-01-20",
    verdict: "REVOKED",
    summary: "INVALID: This credential was revoked on-chain by the issuing institution on 2024-10-12 (Reason: Academic Honor Violation - Ticket #112).",
    checks: [
      { name: "Trust Registry Issuer Authorization", status: "pass", detail: "Metropolitan University is an active root issuer" },
      { name: "ED25519 Cryptographic Signature", status: "pass", detail: "Signature was valid at time of issuance" },
      { name: "Tamper Detection & Content Hash", status: "pass", detail: "Payload has not been tampered with" },
      { name: "On-Chain Revocation Accumulator", status: "fail", detail: "Revocation found in registry: Revoked on Oct 12, 2024 (Tx: 0x88f2...)" },
    ],
  },
};

export default function VerifyScreen({ onNavigate }: VerifyScreenProps) {
  const { verifyCredential, credentials } = useTrustChain();
  const [verifyingOrg, setVerifyingOrg] = useState("Acme Tech Recruiter / Hiring HR");
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey | "custom">("valid");
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(100);
  const [result, setResult] = useState<any>(SCENARIOS.valid);
  const [inputDid, setInputDid] = useState("did:trust:cred-2024-MU-00192");
  const [copied, setCopied] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerTargetId, setLedgerTargetId] = useState<string | undefined>(undefined);
  const [uploadedFileHash, setUploadedFileHash] = useState<string | null>(null);

  // Recruiter Tamper Simulation Controls
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [tamperedName, setTamperedName] = useState("Alex Chen (Tampered to Alexander Chen)");
  const [tamperedGpa, setTamperedGpa] = useState("4.00");

  const VERIFIER_ORGS = [
    { name: "Acme Tech Recruiter / Hiring HR", type: "Enterprise Employer" },
    { name: "Stanford Medical Council", type: "Licensing Board" },
    { name: "MIT Innovation Labs", type: "Research Institute" },
    { name: "Harvard Alliance", type: "Academic Validator" },
  ];

  const runVerification = (scenarioKey: ScenarioKey) => {
    setSelectedScenario(scenarioKey);
    setResult(null);
    setVerifying(true);
    setProgress(0);
    setInputDid(SCENARIOS[scenarioKey].credentialId);
    setSimulateTamper(scenarioKey === "tampered");

    const steps = [20, 45, 75, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setVerifying(false);
        setResult(SCENARIOS[scenarioKey]);
      }
    }, 180);
  };

  const handleRecruiterVerify = () => {
    setSelectedScenario("custom");
    setResult(null);
    setVerifying(true);
    setProgress(0);

    const steps = [25, 55, 80, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setVerifying(false);

        // Run dynamic verification from TrustChainContext with tamper check!
        const evalResult = verifyCredential(inputDid, simulateTamper ? { subjectName: tamperedName, gpa: tamperedGpa } : undefined);
        if (evalResult.credential) {
          const cred = evalResult.credential;
          const isRev = cred.status === "revoked";
          const isTamp = evalResult.isTampered;

          setResult({
            name: `${cred.type} (${cred.subjectName})`,
            badge: isTamp ? "Tamper Detected" : isRev ? "Revocation Found" : "100% Authentic",
            badgeStatus: isTamp || isRev ? "revoked" : "verified",
            credentialId: cred.did || cred.id,
            subjectName: simulateTamper ? tamperedName : cred.subjectName,
            issuer: cred.issuingInstitution,
            issueDate: cred.issueDate,
            verdict: isTamp ? "TAMPER_DETECTED" : isRev ? "REVOKED" : "VALID",
            summary: isTamp
              ? `TAMPER DETECTED: The document contents presented to recruiter have been modified after issuance. SHA-256 payload digest mismatch!`
              : isRev
              ? `RECORD REVOKED: This certificate was revoked on-chain by ${cred.issuingInstitution}. Reason: ${cred.revocationReason || "Revoked by issuer"}.`
              : `VERIFIED AUTHENTIC: Verified by ${verifyingOrg}. ED25519 signature is mathematically authentic. Zero college database access required.`,
            checks: evalResult.checks,
          });
        } else {
          setResult({
            name: "Unknown Credential",
            badge: "Unrecognized Record",
            badgeStatus: "revoked",
            credentialId: inputDid,
            subjectName: "Unrecognized Candidate",
            issuer: "Unregistered Entity",
            issueDate: "N/A",
            verdict: "TAMPER_DETECTED",
            summary: "VERIFICATION FAILED: Record does not exist in the Trust Registry or is invalid.",
            checks: evalResult.checks,
          });
        }
      }
    }, 200);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#1764C0] bg-[#E6F2FC] px-2.5 py-0.5 rounded-full">
              Recruiter & Cross-Institution Verifier
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Recruiter Document Verification & Tamper Detection
          </h1>
          <p className="text-[14px] text-[#626971]">
            Recruiters and other institutions validate candidate credentials instantly without needing access to the college's entire internal database.
          </p>
        </div>

        {/* Verifier Switcher */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-[12px] border border-[#E8E9E5]">
          <span className="text-[12px] font-bold text-[#8A9097] px-1">Auditing As:</span>
          <select
            value={verifyingOrg}
            onChange={(e) => setVerifyingOrg(e.target.value)}
            className="text-[13px] font-semibold text-[#101418] bg-transparent focus:outline-none cursor-pointer"
          >
            {VERIFIER_ORGS.map((vo) => (
              <option key={vo.name} value={vo.name}>
                {vo.name} ({vo.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recruiter Input Card with Tamper Sandbox Toggle */}
      <Card className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097]">
              Certificate ID / Verification Link / DID
            </label>
            <span className="text-[11px] text-[#626971]">
              Try pasting an ID from Registry or Student Portal
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="e.g. did:trust:cred-2024-MU-00192 or cred-2024-MU-..."
              className="flex-1 h-[44px] px-4 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleRecruiterVerify}
              disabled={verifying}
              icon={<VerifyIcon className="w-4 h-4 text-[#BEF52A]" />}
            >
              {verifying ? "Auditing Cryptographic Proof..." : "Verify Certificate"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setLedgerTargetId(inputDid.trim() || undefined);
                setShowLedgerModal(true);
              }}
              icon={<ShieldCheckIcon className="w-4 h-4 text-[#111410]" />}
              className="cursor-pointer font-bold"
            >
              Cross-Validate Ledger
            </Button>
          </div>
        </div>

        {/* Interactive Recruiter Tamper Simulation Sandbox */}
        <div className="p-4 rounded-[12px] bg-[#F7F7F4] border border-[#E8E9E5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B95B12]" />
              <span className="text-[13px] font-bold text-[#101418]">
                Recruiter Tamper Testing Sandbox:
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateTamper}
                onChange={(e) => setSimulateTamper(e.target.checked)}
                className="w-4 h-4 rounded text-[#111410] focus:ring-[#A9DF16]"
              />
              <span className="text-[12px] font-bold text-[#C0392B]">
                Simulate Candidate Altering Document Data
              </span>
            </label>
          </div>

          {simulateTamper && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E9E5] animate-fade-in text-[12px]">
              <div>
                <span className="font-semibold text-[#626971] block mb-1">
                  Tampered Candidate Name:
                </span>
                <input
                  type="text"
                  value={tamperedName}
                  onChange={(e) => setTamperedName(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[8px] bg-white border border-[#C0392B] text-[#101418] font-medium"
                />
              </div>
              <div>
                <span className="font-semibold text-[#626971] block mb-1">
                  Tampered CGPA:
                </span>
                <input
                  type="text"
                  value={tamperedGpa}
                  onChange={(e) => setTamperedGpa(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[8px] bg-white border border-[#C0392B] text-[#101418] font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Verification Progress */}
        {verifying && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
              <span>Querying blockchain anchor & computing SHA-256 hash...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[#E8E9E5] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#111410] h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Preset Evaluation Scenarios */}
      <div>
        <div className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097] mb-2 px-1">
          Quick Comparison Scenarios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
            const sc = SCENARIOS[key];
            const isSelected = selectedScenario === key;

            return (
              <div
                key={key}
                onClick={() => runVerification(key)}
                className={`p-4 rounded-[14px] border cursor-pointer interactive flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#EFFBCB] border-[#BEF52A] shadow-xs"
                    : "bg-white border-[#E8E9E5] hover:border-[#D9DCD5]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-bold text-[#101418]">
                    {sc.name}
                  </span>
                  <StatusBadge status={sc.badgeStatus} label={sc.badge} />
                </div>
                <p className="text-[12px] text-[#626971] leading-relaxed">
                  {sc.description}
                </p>
                <div className="mt-3 pt-2 border-t border-[#E8E9E5]/70 flex items-center justify-between text-[11px] font-medium text-[#101418]">
                  <span>Run Scenario</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Breakdown */}
      {result && !verifying && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Verdict Banner */}
          <div
            className={`p-6 rounded-[16px] border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              result.verdict === "VALID"
                ? "bg-[#E8F8E8] border-[#CEF0CE] text-[#159447]"
                : result.verdict === "TAMPER_DETECTED"
                ? "bg-[#FDEAE7] border-[#F9CBC5] text-[#C0392B]"
                : "bg-[#FFF0DE] border-[#FFE0BA] text-[#B95B12]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                  result.verdict === "VALID"
                    ? "bg-[#159447] text-white"
                    : result.verdict === "TAMPER_DETECTED"
                    ? "bg-[#C0392B] text-white"
                    : "bg-[#B95B12] text-white"
                }`}
              >
                {result.verdict === "VALID" ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <AlertCircleIcon className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold tracking-tight">
                  {result.verdict === "VALID"
                    ? "Authentic: No Tampering Detected"
                    : result.verdict === "TAMPER_DETECTED"
                    ? "Tamper Alert: Document Modified After Issuance!"
                    : "Record Revoked by College"}
                </h2>
                <p className="text-[13px] opacity-90 mt-1 leading-relaxed max-w-2xl">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setLedgerTargetId(result.credentialId);
                  setShowLedgerModal(true);
                }}
                icon={<ShieldCheckIcon className="w-3.5 h-3.5 text-[#BEF52A]" />}
                className="font-bold cursor-pointer shadow-xs"
              >
                Cross-Validate Ledger
              </Button>
              <button
                onClick={() => handleCopy(result.credentialId)}
                className="px-3.5 py-2 rounded-[10px] bg-white text-[#101418] text-[12px] font-semibold border border-current/20 hover:bg-black/5 flex items-center gap-1.5 transition-colors shrink-0"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                <span>{copied ? "Copied" : "Copy Credential ID"}</span>
              </button>
            </div>
          </div>

          {/* Cryptographic Evaluation Matrix */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-[#E8E9E5]">
              <h3 className="text-[16px] font-bold text-[#101418]">
                Cryptographic Audit Matrix (Zero College DB Access)
              </h3>
              <p className="text-[13px] text-[#626971] mt-0.5">
                Proof evaluated by <strong>{verifyingOrg}</strong> using only public registry anchors.
              </p>
            </div>

            <div className="divide-y divide-[#E8E9E5]">
              {result.checks.map((chk: any, idx: number) => (
                <div key={idx} className="p-4 md:px-6 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        chk.status === "pass"
                          ? "bg-[#E8F8E8] text-[#159447]"
                          : "bg-[#FDEAE7] text-[#C0392B]"
                      }`}
                    >
                      {chk.status === "pass" ? "✓" : "✕"}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#101418]">
                        {chk.name}
                      </div>
                      <div className="text-[12px] text-[#626971] mt-0.5">
                        {chk.detail}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                      chk.status === "pass"
                        ? "bg-[#E8F8E8] text-[#159447]"
                        : "bg-[#FDEAE7] text-[#C0392B]"
                    }`}
                  >
                    {chk.status === "pass" ? "Pass" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Security, Photocopy & Zero Database Proof Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h4 className="text-[14px] font-bold text-[#101418] mb-3 pb-2 border-b border-[#E8E9E5]">
                Candidate Credential Record
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Candidate Name:</span>
                  <span className="font-semibold text-[#101418]">{result.subjectName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Issuing College:</span>
                  <span className="font-semibold text-[#101418]">{result.issuer}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626971]">Issue Date:</span>
                  <span className="font-semibold text-[#101418]">{result.issueDate}</span>
                </div>
              </div>
            </Card>

            {/* Recruiter Degree Photocopy Document Preview */}
            <Card className="flex flex-col justify-between">
              <div>
                <h4 className="text-[14px] font-bold text-[#101418] mb-2 pb-2 border-b border-[#E8E9E5] flex items-center justify-between">
                  <span>Physical Degree Photocopy</span>
                  <span className="text-[11px] text-[#159447] font-semibold">Matched</span>
                </h4>
                <div className="h-28 rounded-[10px] overflow-hidden border border-[#D9DCD5] bg-white relative group">
                  <img
                    src={result.credential?.documentImage || "/lead_certificate_bg.jpg"}
                    alt="Physical Diploma Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#111410]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 text-[11px] font-bold px-2 py-1 rounded shadow-sm text-[#101418]">
                      Official Scan
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#626971] pt-2">
                Image SHA-256 matches college anchor hash.
              </div>
            </Card>

            <Card>
              <h4 className="text-[14px] font-bold text-[#101418] mb-3 pb-2 border-b border-[#E8E9E5]">
                Decentralized Trust Proof
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">College DB Access:</span>
                  <span className="font-bold text-[#159447]">0% Required (Zero-Knowledge)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Signature Standard:</span>
                  <span className="font-mono text-[#101418]">Ed25519Signature2020</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626971]">Tamper Proof Check:</span>
                  <span className="font-semibold text-[#101418]">SHA-256 Digest Match</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Ledger Cross-Validation Modal */}
      <LedgerCrossValidationModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        targetCredentialId={ledgerTargetId}
        uploadedImageHash={uploadedFileHash || undefined}
      />
    </div>
  );
}

