"use client";

import { useState } from "react";
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
    issuer: "Metropolitan University (Authorized Node #1)",
    issueDate: "2024-06-15",
    verdict: "VALID",
    summary: "Cryptographic signature matches issuer public key. No tampering detected. Credential is live and active on the trust registry.",
    checks: [
      { name: "Trust Registry Issuer Authorization", status: "pass", detail: "Metropolitan University is an active root issuer on mainnet" },
      { name: "ED25519 Cryptographic Signature", status: "pass", detail: "Signature 0x5a18... verified against public key ed25519:MU9942" },
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
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("valid");
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(100);
  const [result, setResult] = useState<typeof SCENARIOS[ScenarioKey] | null>(SCENARIOS.valid);
  const [inputDid, setInputDid] = useState("did:trust:cred-2024-MU-00192");
  const [copied, setCopied] = useState(false);

  const runVerification = (scenarioKey: ScenarioKey) => {
    setSelectedScenario(scenarioKey);
    setResult(null);
    setVerifying(true);
    setProgress(0);
    setInputDid(SCENARIOS[scenarioKey].credentialId);

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
              TrustChain Consensus Verification Engine
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Verify a Credential
          </h1>
          <p className="text-[14px] text-[#626971]">
            Cross-institution cryptographic verification: validate digital signatures, issuer authority, and revocation status in milliseconds.
          </p>
        </div>

        {onNavigate && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate("issue")}
          >
            Issue New Credential
          </Button>
        )}
      </div>

      {/* Preset Test Scenarios Selection */}
      <div>
        <div className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097] mb-2 px-1">
          Interactive Test Scenarios
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
                  <span>Run verification</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Box & Action */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="Enter Credential DID, SHA-256 Hash, or paste JSON-LD..."
              className="w-full h-[44px] px-4 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => runVerification(selectedScenario)}
            disabled={verifying}
            icon={<VerifyIcon className="w-4 h-4 text-[#BEF52A]" />}
          >
            {verifying ? "Verifying Proof..." : "Verify Credential"}
          </Button>
        </div>

        {/* Verification Progress Bar if loading */}
        {verifying && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
              <span>Querying Trust Registry & Checking Signatures...</span>
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

      {/* Verification Results Breakdown */}
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
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-extrabold tracking-tight">
                    {result.verdict === "VALID"
                      ? "Credential Cryptographically Verified"
                      : result.verdict === "TAMPER_DETECTED"
                      ? "Tamper Warning: Data Hash Mismatch"
                      : "Credential Status: Revoked by Issuer"}
                  </h2>
                </div>
                <p className="text-[13px] opacity-90 mt-1 leading-relaxed max-w-2xl">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => handleCopy(result.credentialId)}
                className="px-3.5 py-2 rounded-[10px] bg-white text-[#101418] text-[12px] font-semibold border border-current/20 hover:bg-black/5 flex items-center gap-1.5 transition-colors"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                <span>{copied ? "Copied ID" : "Copy Audit Link"}</span>
              </button>
            </div>
          </div>

          {/* 4-Point Cryptographic Evaluation Matrix */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-[#E8E9E5]">
              <h3 className="text-[16px] font-bold text-[#101418]">
                Cryptographic Proof Verification Matrix
              </h3>
              <p className="text-[13px] text-[#626971] mt-0.5">
                Every credential undergoes 4 independent mathematical evaluations before acceptance.
              </p>
            </div>

            <div className="divide-y divide-[#E8E9E5]">
              {result.checks.map((chk, idx) => (
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

          {/* Metadata Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="text-[14px] font-bold text-[#101418] mb-3 pb-2 border-b border-[#E8E9E5]">
                Credential Identity
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Recipient:</span>
                  <span className="font-semibold text-[#101418]">{result.subjectName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Issuing Institution:</span>
                  <span className="font-semibold text-[#101418]">{result.issuer}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626971]">Issue Date:</span>
                  <span className="font-semibold text-[#101418]">{result.issueDate}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-[14px] font-bold text-[#101418] mb-3 pb-2 border-b border-[#E8E9E5]">
                Blockchain Registry Record
              </h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Proof Type:</span>
                  <span className="font-mono text-[#101418]">Ed25519Signature2020</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                  <span className="text-[#626971]">Anchor Block:</span>
                  <span className="font-semibold text-[#101418]">#1,402,881 (Finalized)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#626971]">Consensus Nodes:</span>
                  <span className="font-semibold text-[#159447]">128/128 Unanimous</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
