"use client";

import { useState } from "react";
import { CREDENTIAL_TYPES } from "../../lib/data";
import { useTrustChain, type BulkRecordInput } from "../../context/TrustChainContext";
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

const SAMPLE_CSV = `Alex Chen,did:trust:student-mu-8841,Bachelor of Science in Computer Science,School of Engineering,3.94,First Class Honours
Dr. Sarah Lin,did:trust:student-mu-9014,Doctor of Medicine (M.D.),Faculty of Medicine,3.98,Board Certified Honors
Elena Rostova,did:trust:student-mu-5512,Master of Science in Cybersecurity,Center for Cryptography,3.91,Summa Cum Laude
Marcus Vance,did:trust:student-mu-3390,Bachelor of Business Administration,School of Management,3.85,Magna Cum Laude
Priya Patel,did:trust:student-mu-7721,Bachelor of Science in Data Science,School of Engineering,3.96,Distinction in AI`;

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
  const { issueCredential, issueBulkCredentials, activeInstitution } = useTrustChain();
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single Issuance State
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
  const [issuedCred, setIssuedCred] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("/sample_degree.jpg");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Bulk Issuance State
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkSigning, setBulkSigning] = useState(false);
  const [bulkIssuedResults, setBulkIssuedResults] = useState<any[] | null>(null);

  const parseCsvRows = (text: string): BulkRecordInput[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          subjectName: parts[0] || "Unknown Student",
          subjectId: parts[1] || `did:trust:student-${Math.floor(1000 + Math.random() * 9000)}`,
          title: parts[2] || "Institutional Degree",
          department: parts[3] || "Academic Affairs",
          gpa: parts[4] || "3.80",
          honours: parts[5] || "Honors",
        };
      });
  };

  const parsedBulkRows = parseCsvRows(csvText);

  const handleBulkIssue = () => {
    setBulkSigning(true);
    setBulkProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setBulkProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        const results = issueBulkCredentials(parsedBulkRows);
        setBulkIssuedResults(results);
        setBulkSigning(false);
      }
    }, 250);
  };

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
        const result = issueCredential({
          type: selectedType,
          subjectName: formData.subjectName,
          subjectId: formData.subjectId,
          title: formData.title,
          department: formData.department,
          honours: formData.honours,
          gpa: formData.gpa,
          documentImage: uploadedImage,
        });
        setIssuedCred(result);
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

  return (
    <div className="p-6 md:p-8 max-w-[1250px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full">
              College Issuer Authority: {activeInstitution.name}
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Issue Credentials & Certificates
          </h1>
          <p className="text-[14px] text-[#626971]">
            Cryptographically sign digital certificates with institutional keys and anchor to the trust registry.
          </p>
        </div>

        {/* Mode Selector Tabs: Single vs Bulk CSV */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-[12px] border border-[#E8E9E5]">
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all ${
              mode === "single"
                ? "bg-[#111410] text-white font-bold"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            Single Certificate
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all flex items-center gap-1.5 ${
              mode === "bulk"
                ? "bg-[#111410] text-white font-bold"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            <span>Bulk CSV Issuance</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#BEF52A] text-[#172000]">
              Batch
            </span>
          </button>
        </div>
      </div>

      {/* BULK CSV ISSUANCE MODE */}
      {mode === "bulk" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
              <div>
                <h2 className="text-[17px] font-bold text-[#101418]">
                  Bulk Batch Credential Generator (CSV)
                </h2>
                <p className="text-[13px] text-[#626971] mt-0.5">
                  Colleges can issue certificates to an entire graduating cohort in seconds. Each student receives an individual cryptographic signature.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCsvText(SAMPLE_CSV)}
              >
                Reset Sample Cohort (5 Students)
              </Button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626971] mb-1.5">
                CSV Input Data (Format: Name, Student DID, Degree Title, Faculty, GPA, Honors)
              </label>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 font-mono text-[12px] rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
              />
            </div>

            {/* Parsed Rows Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097]">
                  Parsed Students in Batch ({parsedBulkRows.length})
                </span>
              </div>
              <div className="overflow-x-auto border border-[#E8E9E5] rounded-[12px]">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F7F7F4] text-[#8A9097] text-[10px] font-bold uppercase border-b border-[#E8E9E5]">
                    <tr>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Student ID / DID</th>
                      <th className="py-2.5 px-4">Degree / Certificate</th>
                      <th className="py-2.5 px-4">Faculty</th>
                      <th className="py-2.5 px-4">GPA</th>
                      <th className="py-2.5 px-4">Honours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E9E5]">
                    {parsedBulkRows.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F7F7F4]">
                        <td className="py-2.5 px-4 font-semibold text-[#101418]">{r.subjectName}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#626971]">{r.subjectId}</td>
                        <td className="py-2.5 px-4 text-[#101418]">{r.title}</td>
                        <td className="py-2.5 px-4 text-[#626971]">{r.department}</td>
                        <td className="py-2.5 px-4 font-semibold text-[#159447]">{r.gpa}</td>
                        <td className="py-2.5 px-4 text-[#626971]">{r.honours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {bulkSigning && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                  <span>Cryptographically signing {parsedBulkRows.length} certificates with root key...</span>
                  <span>{bulkProgress}%</span>
                </div>
                <div className="w-full bg-[#E8E9E5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#BEF52A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleBulkIssue}
                disabled={bulkSigning || parsedBulkRows.length === 0}
                icon={<ShieldCheckIcon className="w-5 h-5 text-[#BEF52A]" />}
              >
                {bulkSigning ? "Signing Batch..." : `Sign & Anchor All ${parsedBulkRows.length} Certificates`}
              </Button>
            </div>
          </Card>

          {/* Bulk Results Summary */}
          {bulkIssuedResults && (
            <Card className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2.5 text-[#159447]">
                <CheckCircleIcon className="w-6 h-6" />
                <h3 className="text-[17px] font-bold">
                  Successfully Issued & Anchored {bulkIssuedResults.length} Certificates on Mainnet!
                </h3>
              </div>
              <p className="text-[13px] text-[#626971]">
                Each certificate is now verifiable by recruiters. Students can view their documents with shareable QR codes in the Student Portal.
              </p>

              <div className="flex gap-3">
                {onNavigate && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate("student")}
                  >
                    View in Student Portal →
                  </Button>
                )}
                {onNavigate && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onNavigate("registry")}
                  >
                    View Registry Ledger →
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SINGLE ISSUANCE MODE */}
      {mode === "single" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 pb-2">
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
                          Recipient DID / Student ID
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
                          Issuing Faculty / Department
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

                    {/* Scanned Document Photocopy Upload */}
                    <div className="pt-2">
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-[#101418] mb-1.5 flex items-center justify-between">
                        <span>Physical Degree Photocopy / Scanned Document</span>
                        <span className="text-[11px] text-[#159447] font-semibold">Attached & Ready</span>
                      </label>
                      <div className="p-3 rounded-[12px] bg-[#F7F7F4] border border-[#E8E9E5] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-14 h-11 rounded-[8px] overflow-hidden border border-[#D9DCD5] shrink-0 bg-white shadow-xs">
                            <img
                              src={uploadedImage}
                              alt="Degree Photocopy Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#101418] truncate">
                              Official University Diploma Scan
                            </div>
                            <div className="text-[11px] text-[#626971]">
                              Physical document photocopy with embossed gold seal
                            </div>
                          </div>
                        </div>

                        <label className="cursor-pointer shrink-0">
                          <span className="px-3 py-1.5 text-[12px] font-medium bg-white hover:bg-[#F2F3EF] border border-[#E8E9E5] rounded-[8px] transition-all">
                            Upload New Scan
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8E9E5] flex justify-between">
                    <Button variant="secondary" size="md" onClick={() => setStep(0)}>
                      ← Back
                    </Button>
                    <Button variant="primary" size="md" onClick={() => setStep(2)}>
                      Proceed to Review & Sign →
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Certificate Preview */}
              <div className="lg:col-span-5">
                <div className="bg-white border-2 border-[#E8E9E5] rounded-[16px] p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-[#BEF52A]" />
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E5]">
                    <div className="font-bold text-[13px] text-[#101418]">
                      {activeInstitution.name}
                    </div>
                    <StatusBadge status="verified" label="Authorized Issuer" />
                  </div>

                  <div className="py-6 text-center space-y-2">
                    <div className="text-[11px] uppercase tracking-widest text-[#8A9097] font-semibold">
                      Digital Certificate
                    </div>
                    <div className="text-[18px] font-extrabold text-[#101418]">
                      {formData.title}
                    </div>
                    <div className="text-[13px] text-[#626971]">Conferred Upon</div>
                    <div className="text-[17px] font-bold text-[#101418] underline decoration-[#BEF52A] decoration-2 underline-offset-4">
                      {formData.subjectName}
                    </div>
                    <div className="text-[12px] text-[#626971] pt-1">
                      {formData.department}
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
                  Cryptographic Review & College Signature
                </h2>
                <p className="text-[13px] text-[#626971] mt-1 max-w-md mx-auto">
                  Signing payload with {activeInstitution.name} private key. Recipient student can immediately share this certificate with recruiters.
                </p>
              </div>

              {signing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                    <span>Signing with institutional root keypair...</span>
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
                <Button variant="secondary" size="md" onClick={() => setStep(1)} disabled={signing}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSignAndIssue}
                  disabled={signing}
                  icon={<ShieldCheckIcon className="w-5 h-5 text-[#BEF52A]" />}
                >
                  {signing ? "Signing & Anchoring..." : "Sign & Issue Certificate"}
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
                <h2 className="text-[24px] font-extrabold text-[#101418]">
                  Certificate Successfully Issued!
                </h2>
                <p className="text-[13px] text-[#626971] mt-1">
                  Anchored to the trust registry. Student can now generate a QR code and share with recruiters.
                </p>
              </div>

              <div className="bg-[#F7F7F4] rounded-[14px] p-4 border border-[#E8E9E5] text-left space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Student:</span>
                  <strong className="text-[#101418]">{formData.subjectName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Certificate ID:</span>
                  <span className="font-mono text-[#101418]">{issuedCred?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">SHA-256 Digest:</span>
                  <span className="font-mono text-[#101418] truncate max-w-[280px]">
                    {issuedCred?.fingerprint}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                  Issue Another Certificate
                </Button>
                {onNavigate && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate("student")}
                  >
                    View in Student Portal & Share QR →
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
