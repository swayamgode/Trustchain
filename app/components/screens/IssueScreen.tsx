"use client";

import { useState } from "react";
import { CREDENTIAL_TYPES } from "../../lib/data";
import {
  IssueIcon,
  CheckCircleIcon,
  CopyIcon,
  ShieldCheckIcon,
  LockIcon,
  ArrowRightIcon,
} from "../ui/Icons";
import Button from "../ui/Button";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";

const STEPS = ["Credential Type", "Recipient Details", "Review & Sign", "Anchored"];

const PRESETS = [
  {
    name: "Alex Chen (Computer Science B.S.)",
    title: "Bachelor of Science in Computer Science",
    institution: "Metropolitan University",
    department: "School of Engineering & Applied Sciences",
    subjectName: "Alex Chen",
    subjectId: "did:trust:student-mu-8841",
    honours: "First Class Honours (Summa Cum Laude)",
    gpa: "3.94 / 4.00",
  },
  {
    name: "Dr. Sarah Lin (Doctor of Medicine)",
    title: "Doctor of Medicine (M.D.)",
    institution: "Metropolitan University",
    department: "Faculty of Medicine & Clinical Sciences",
    subjectName: "Dr. Sarah Lin",
    subjectId: "did:trust:doc-mu-9014",
    honours: "Board Certified Clinical Honors",
    gpa: "3.98 / 4.00",
  },
  {
    name: "David Vance (Cybersecurity Executive)",
    title: "Executive Cybersecurity Specialist",
    institution: "Metropolitan University",
    department: "Center for Cryptographic Infrastructure",
    subjectName: "David Vance",
    subjectId: "did:trust:cyber-mu-4421",
    honours: "Distinction in Zero-Trust Systems",
    gpa: "4.00 / 4.00",
  },
];

export default function IssueScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("Academic Degree");
  const [formData, setFormData] = useState({
    title: "Bachelor of Science in Computer Science",
    institution: "Metropolitan University",
    department: "School of Engineering & Applied Sciences",
    subjectName: "Alex Chen",
    subjectId: "did:trust:student-mu-8841",
    honours: "First Class Honours (Summa Cum Laude)",
    gpa: "3.94 / 4.00",
    issueDate: new Date().toISOString().slice(0, 10),
  });

  const [signing, setSigning] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData({
      ...formData,
      title: preset.title,
      department: preset.department,
      subjectName: preset.subjectName,
      subjectId: preset.subjectId,
      honours: preset.honours,
      gpa: preset.gpa,
    });
  };

  const handleSignAndIssue = () => {
    setSigning(true);
    setSignProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setSignProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSigning(false);
          setStep(3);
        }, 300);
      }
    }, 250);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generatedFingerprint = "0x8f2d9c1b7a4e6305149e88bf450289ab7e291249b51dca67104bce38102a9914";
  const generatedSignature = "ed25519:5vQ8M4aK1c9Np7Xz2Y...38xKl9B7eR4qW1s";
  const blockRef = "#1,402,882";

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full">
              Trust Registry Node Active
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Issue a Verifiable Credential
          </h1>
          <p className="text-[14px] text-[#626971]">
            Create, sign with authorized ED25519 root key, and anchor institutional credentials.
          </p>
        </div>

        {/* 1-Click Demo Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#8A9097]">Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-[12px] font-medium bg-white hover:bg-[#EFFBCB] hover:text-[#172000] border border-[#E8E9E5] hover:border-[#BEF52A] rounded-[8px] transition-all"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-3 bg-white p-3 rounded-[16px] border border-[#E8E9E5]">
        {STEPS.map((s, idx) => (
          <div
            key={s}
            className={`flex items-center gap-2 p-2 rounded-[10px] text-[13px] font-medium transition-all ${
              step === idx
                ? "bg-[#EFFBCB] text-[#172000] font-bold"
                : step > idx
                ? "text-[#159447]"
                : "text-[#8A9097]"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === idx
                  ? "bg-[#BEF52A] text-[#172000]"
                  : step > idx
                  ? "bg-[#E8F8E8] text-[#159447]"
                  : "bg-[#F2F3EF] text-[#8A9097]"
              }`}
            >
              {step > idx ? "✓" : idx + 1}
            </div>
            <span className="truncate">{s}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <Card className="space-y-6">
          <h2 className="text-[18px] font-bold text-[#101418]">Select Credential Schema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREDENTIAL_TYPES.map((t) => (
              <div
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setStep(1);
                }}
                className={`p-4 rounded-[14px] border cursor-pointer interactive flex items-start justify-between ${
                  selectedType === t
                    ? "bg-[#EFFBCB] border-[#BEF52A]"
                    : "bg-white border-[#E8E9E5] hover:border-[#D9DCD5]"
                }`}
              >
                <div>
                  <div className="text-[15px] font-bold text-[#101418]">{t}</div>
                  <div className="text-[12px] text-[#626971] mt-1">
                    Standard institutional schema for verified {t.toLowerCase()} issuance.
                  </div>
                  <div className="text-[11px] font-mono text-[#8A9097] mt-2">
                    Schema: schema.org/{t.replace(/\s+/g, "")}
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-[#8A9097] mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Fields */}
          <div className="lg:col-span-7">
            <Card className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
                <h2 className="text-[17px] font-bold text-[#101418]">
                  Credential Information
                </h2>
                <span className="text-[12px] font-semibold text-[#1764C0] bg-[#E6F2FC] px-2 py-0.5 rounded-full">
                  Schema: {selectedType}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                    Credential Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      Recipient DID / ID
                    </label>
                    <input
                      type="text"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      Issuing Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      Honors / Classification
                    </label>
                    <input
                      type="text"
                      value={formData.honours}
                      onChange={(e) => setFormData({ ...formData, honours: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                      GPA / Standing
                    </label>
                    <input
                      type="text"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E9E5] flex justify-between">
                <Button variant="secondary" size="md" onClick={() => setStep(0)}>
                  ← Back to Schema
                </Button>
                <Button variant="primary" size="md" onClick={() => setStep(2)}>
                  Proceed to Review & Sign →
                </Button>
              </div>
            </Card>
          </div>

          {/* Real-time Certificate Preview Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097] mb-2 px-1">
                Live Certificate Preview
              </div>
              <div className="bg-white border-2 border-[#E8E9E5] rounded-[16px] p-6 shadow-sm relative overflow-hidden">
                {/* Certificate Border Accents */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#BEF52A]" />
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E5]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EFFBCB] text-[#172000] font-bold flex items-center justify-center text-xs">
                      MU
                    </div>
                    <div>
                      <div className="font-bold text-[13px] text-[#101418]">
                        Metropolitan University
                      </div>
                      <div className="text-[11px] text-[#8A9097]">
                        Boston, Massachusetts
                      </div>
                    </div>
                  </div>
                  <StatusBadge status="verified" label="Authorized" />
                </div>

                <div className="py-6 text-center space-y-2">
                  <div className="text-[11px] uppercase tracking-widest text-[#8A9097] font-semibold">
                    Verifiable Digital Credential
                  </div>
                  <div className="text-[18px] font-extrabold text-[#101418]">
                    {formData.title || "Degree Title"}
                  </div>
                  <div className="text-[13px] text-[#626971]">Conferred Upon</div>
                  <div className="text-[17px] font-bold text-[#101418] underline decoration-[#BEF52A] decoration-2 underline-offset-4">
                    {formData.subjectName || "Recipient Name"}
                  </div>
                  <div className="text-[12px] text-[#626971] pt-1">
                    {formData.department}
                  </div>
                  <div className="text-[12px] font-semibold text-[#159447]">
                    {formData.honours} • GPA {formData.gpa}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E9E5] text-[11px] text-[#8A9097] space-y-1">
                  <div className="flex justify-between">
                    <span>Recipient DID:</span>
                    <span className="font-mono text-[#101418]">{formData.subjectId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span className="text-[#101418]">{formData.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Root Issuer Key:</span>
                    <span className="font-mono text-[#101418]">did:trust:metropolitan-uni-9942</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="max-w-2xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-[#E8E9E5]">
            <div className="w-12 h-12 rounded-[14px] bg-[#EFFBCB] text-[#172000] flex items-center justify-center mx-auto mb-3">
              <LockIcon className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-bold text-[#101418]">
              Cryptographic Review & Institutional Signature
            </h2>
            <p className="text-[13px] text-[#626971] mt-1 max-w-md mx-auto">
              This payload will be cryptographically hashed (SHA-256), signed with Metropolitan University's active private key, and permanently recorded to the Trust Registry.
            </p>
          </div>

          <div className="bg-[#F7F7F4] rounded-[14px] p-4 border border-[#E8E9E5] space-y-2.5 text-[13px]">
            <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
              <span className="text-[#626971]">Credential:</span>
              <span className="font-semibold text-[#101418]">{formData.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
              <span className="text-[#626971]">Recipient:</span>
              <span className="font-semibold text-[#101418]">{formData.subjectName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
              <span className="text-[#626971]">Issuer Authority:</span>
              <span className="font-semibold text-[#159447]">Metropolitan University (Node #1)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
              <span className="text-[#626971]">Algorithm:</span>
              <span className="font-mono text-[#101418]">ED25519-SHA256-JWS</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#626971]">Estimated Anchor Latency:</span>
              <span className="font-semibold text-[#101418]">~35 ms</span>
            </div>
          </div>

          {signing && (
            <div className="space-y-2">
              <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                <span>Executing Cryptographic Anchoring...</span>
                <span>{signProgress}%</span>
              </div>
              <div className="w-full bg-[#E8E9E5] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#BEF52A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${signProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E9E5]">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(1)}
              disabled={signing}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSignAndIssue}
              disabled={signing}
              icon={<ShieldCheckIcon className="w-5 h-5 text-[#BEF52A]" />}
            >
              {signing ? "Signing & Anchoring..." : "Sign & Anchor to TrustChain"}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[#E8F8E8] text-[#159447] flex items-center justify-center mx-auto ring-8 ring-[#E8F8E8]/50">
            <CheckCircleIcon className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-3 py-1 rounded-full">
              Anchor Confirmed on Mainnet
            </span>
            <h2 className="text-[24px] font-extrabold text-[#101418] mt-3">
              Credential Successfully Issued!
            </h2>
            <p className="text-[13px] text-[#626971] mt-1">
              Anchored to block {blockRef} with immutable proof. Any organization can now verify this credential instantly.
            </p>
          </div>

          <div className="bg-[#F7F7F4] rounded-[14px] p-4 border border-[#E8E9E5] text-left space-y-3 text-[12px]">
            <div>
              <div className="text-[11px] font-bold uppercase text-[#8A9097]">
                SHA-256 Digest Fingerprint
              </div>
              <div className="flex items-center justify-between font-mono bg-white p-2 rounded-[8px] border border-[#E8E9E5] mt-1 text-[#101418] break-all">
                <span>{generatedFingerprint}</span>
                <button
                  onClick={() => handleCopy(generatedFingerprint, "fp")}
                  className="p-1 hover:text-[#1764C0] ml-2 shrink-0"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase text-[#8A9097]">
                ED25519 Cryptographic Signature
              </div>
              <div className="flex items-center justify-between font-mono bg-white p-2 rounded-[8px] border border-[#E8E9E5] mt-1 text-[#101418]">
                <span>{generatedSignature}</span>
                <button
                  onClick={() => handleCopy(generatedSignature, "sig")}
                  className="p-1 hover:text-[#1764C0] ml-2 shrink-0"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E9E5]">
              <div>
                <span className="text-[#8A9097]">Recipient:</span>{" "}
                <strong className="text-[#101418]">{formData.subjectName}</strong>
              </div>
              <div>
                <span className="text-[#8A9097]">Block Reference:</span>{" "}
                <strong className="text-[#101418]">{blockRef}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setStep(1);
              }}
            >
              Issue Another Credential
            </Button>
            {onNavigate && (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate("verify")}
              >
                Verify This Credential Now →
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
