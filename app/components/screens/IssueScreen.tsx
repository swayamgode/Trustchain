"use client";

import { useState } from "react";
import { CREDENTIAL_TYPES } from "../../lib/data";
import { useTrustChain, type BulkRecordInput } from "../../context/TrustChainContext";
import { sendCredentialEmail, generateMailtoUrl, type DispatchedEmail } from "../../lib/emailService";
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

const SAMPLE_CSV = `student_id,name,email,course,semester,marks_obtained,maximum_marks,percentage,marksheet_file
MU2026101,Rahul Sharma,rahul.sharma@mu.edu,AI&DS,5,450,600,75.0,https://drive.google.com/file/d/1wzV3qO7BaYAYknOTPdHXADZPc6xV5j5y/view?usp=drive_link
MU2026102,Priya Patil,priya.patil@mu.edu,AI&DS,5,486,600,81.0,https://drive.google.com/file/d/1TCPRzpWT7cKmJuJKUgagB6rDGA8tOJje/view?usp=drive_link
MU2026103,Aman Shah,aman.shah@mu.edu,AI&DS,5,414,600,69.0,https://drive.google.com/file/d/1JV00nebHEaXzTUlKjSDpShIUKaCTWW27/view?usp=drive_link
MU2026104,Sneha Joshi,sneha.joshi@mu.edu,AI&DS,5,528,600,88.0,https://drive.google.com/file/d/1Zp8GjiXhfwfMGAYnd2FM7P5xPT9K5-Nx/view?usp=drive_link
MU2026105,Karan Mehta,karan.mehta@mu.edu,AI&DS,5,396,600,66.0,https://drive.google.com/file/d/1R7VQWEzcrZFdBJLV6KF7HspzFzoLMGSW/view?usp=drive_link`;

const PRESETS = [
  {
    name: "Bhavik Jain (Course Completion)",
    title: "Advanced UI/UX Design with LIVE Project",
    institution: "Lead Academy",
    department: "School of Design & Creative Technologies",
    subjectName: "Bhavik Jain",
    subjectId: "did:trust:student-lead-7721",
    recipientEmail: "bhavik.jain@alumni.edu",
    honours: "Distinction with Live Project Excellence",
    gpa: "4.00 / 4.00",
  },
  {
    name: "Alex Chen (Computer Science B.S.)",
    title: "Bachelor of Science in Computer Science",
    institution: "Metropolitan University",
    department: "School of Engineering & Applied Sciences",
    subjectName: "Alex Chen",
    subjectId: "did:trust:student-mu-8841",
    recipientEmail: "alex.chen@metropolitan.edu",
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
    recipientEmail: "sarah.lin@med.metropolitan.edu",
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
    recipientEmail: "david.vance@student.mu.edu",
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
    recipientEmail: "alex.chen@metropolitan.edu",
    sendEmailNotification: true,
    honours: "First Class Honours (Summa Cum Laude)",
    gpa: "3.94 / 4.00",
    issueDate: new Date().toISOString().slice(0, 10),
  });
  const [signing, setSigning] = useState(false);
  const [signProgress, setSignProgress] = useState(0);
  const [issuedCred, setIssuedCred] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("/lead_certificate_bg.jpg");
  const [dispatchedEmail, setDispatchedEmail] = useState<DispatchedEmail | null>(null);
  const [previewEmailModal, setPreviewEmailModal] = useState<DispatchedEmail | null>(null);

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
  const [bulkImage, setBulkImage] = useState<string>("/lead_certificate_bg.jpg");
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkSigning, setBulkSigning] = useState(false);
  const [bulkIssuedResults, setBulkIssuedResults] = useState<any[] | null>(null);
  const [bulkSendEmail, setBulkSendEmail] = useState(true);
  const [bulkEmailsDispatched, setBulkEmailsDispatched] = useState(0);

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCsvText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBulkImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const parseCsvRows = (text: string): BulkRecordInput[] => {
    const rawLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawLines.length === 0) return [];

    const firstLine = rawLines[0].toLowerCase();
    const hasHeader =
      firstLine.includes("name") ||
      firstLine.includes("student_id") ||
      firstLine.includes("course") ||
      firstLine.includes("email");

    const dataLines = hasHeader ? rawLines.slice(1) : rawLines;
    const headerCols = hasHeader
      ? rawLines[0].split(",").map((c) => c.trim().toLowerCase())
      : [];

    return dataLines.map((line, idx) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));

      if (hasHeader) {
        const getCol = (...names: string[]) => {
          for (const name of names) {
            const index = headerCols.findIndex((h) => h === name || h.includes(name));
            if (index !== -1 && parts[index] !== undefined && parts[index] !== "") {
              return parts[index];
            }
          }
          return "";
        };

        const studentId = getCol("student_id", "id", "did") || `MU2026${100 + idx}`;
        const name = getCol("name", "student_name") || `Student ${idx + 1}`;
        const email =
          getCol("email", "student_email", "mail", "recipient_email") ||
          `${name.toLowerCase().replace(/[^a-z0-9]/g, ".") || "student"}@mu.edu`;
        const course = getCol("course", "degree", "title") || "Academic Degree";
        const semester = getCol("semester", "sem");
        const percentage = getCol("percentage", "percent");
        const marksObtained = getCol("marks_obtained", "marks");
        const maxMarks = getCol("maximum_marks", "max");
        const marksheet = getCol("marksheet_file", "file", "url", "image") || bulkImage;

        const title = semester ? `${course} — Semester ${semester}` : course;
        const gpa = percentage
          ? `${percentage}%${marksObtained && maxMarks ? ` (${marksObtained}/${maxMarks})` : ""}`
          : "3.80 / 4.00";
        const honours =
          percentage && parseFloat(percentage) >= 75
            ? "Distinction Honours"
            : percentage && parseFloat(percentage) >= 60
            ? "First Class Honours"
            : "Honours";

        return {
          subjectName: name,
          subjectId: studentId.startsWith("did:trust:")
            ? studentId
            : `did:trust:student-${studentId.toLowerCase()}`,
          recipientEmail: email,
          title,
          department: `School of ${course} & Applied Sciences`,
          gpa,
          honours,
          documentImage: marksheet,
        };
      }

      const emailCandidate = parts.find((p) => p.includes("@"));
      const fallbackEmail = `${(parts[0] || "student").toLowerCase().replace(/[^a-z0-9]/g, ".")}@mu.edu`;

      return {
        subjectName: parts[0] || "Unknown Student",
        subjectId: parts[1] || `did:trust:student-${Math.floor(1000 + Math.random() * 9000)}`,
        recipientEmail: emailCandidate || fallbackEmail,
        title: parts[2] || "Institutional Degree",
        department: parts[3] || "Academic Affairs",
        gpa: parts[4] || "3.80",
        honours: parts[5] || "Honors",
        documentImage: parts[6] || bulkImage,
      };
    });
  };

  const parsedBulkRows = parseCsvRows(csvText);

  const handleBulkIssue = () => {
    setBulkSigning(true);
    setBulkProgress(0);
    setBulkEmailsDispatched(0);
    let p = 0;
    const interval = setInterval(async () => {
      p += 20;
      setBulkProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        const results = issueBulkCredentials(
          parsedBulkRows.map((r) => ({
            ...r,
            documentImage: r.documentImage || bulkImage,
          }))
        );
        setBulkIssuedResults(results);

        if (bulkSendEmail) {
          let count = 0;
          for (const r of results) {
            if (r.recipientEmail) {
              const verificationUrl = typeof window !== "undefined"
                ? `${window.location.origin}/?verify=${r.id}`
                : `https://trustchain.network/verify/${r.id}`;
              await sendCredentialEmail({
                to: r.recipientEmail,
                studentName: r.subjectName,
                credentialTitle: r.type,
                institutionName: r.issuingInstitution,
                credentialId: r.id,
                verificationUrl,
                honours: r.honours,
                gpa: r.gpa,
                issueDate: r.issueDate,
                documentImage: r.documentImage,
              });
              count++;
            }
          }
          setBulkEmailsDispatched(count);
        }

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
      recipientEmail: preset.recipientEmail,
      honours: preset.honours,
      gpa: preset.gpa,
    });
  };

  const handleSignAndIssue = () => {
    setSigning(true);
    setSignProgress(0);
    let p = 0;
    const interval = setInterval(async () => {
      p += 25;
      setSignProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        const result = issueCredential({
          type: selectedType,
          subjectName: formData.subjectName,
          subjectId: formData.subjectId,
          recipientEmail: formData.recipientEmail,
          title: formData.title,
          department: formData.department,
          honours: formData.honours,
          gpa: formData.gpa,
          documentImage: uploadedImage,
        });
        setIssuedCred(result);

        if (formData.sendEmailNotification && formData.recipientEmail) {
          const verificationUrl = typeof window !== "undefined"
            ? `${window.location.origin}/?verify=${result.id}`
            : `https://trustchain.network/verify/${result.id}`;
          const sent = await sendCredentialEmail({
            to: formData.recipientEmail,
            studentName: formData.subjectName,
            credentialTitle: result.type,
            institutionName: result.issuingInstitution,
            credentialId: result.id,
            verificationUrl,
            honours: result.honours,
            gpa: result.gpa,
            issueDate: result.issueDate,
            documentImage: result.documentImage,
          });
          setDispatchedEmail(sent);
        }

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E9E5]">
              <div>
                <h2 className="text-[17px] font-bold text-[#101418]">
                  Bulk Batch Credential Generator (CSV)
                </h2>
                <p className="text-[13px] text-[#626971] mt-0.5">
                  Colleges can issue certificates to an entire graduating cohort in seconds. Each student receives an individual cryptographic signature.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="cursor-pointer">
                  <span className="px-3 py-1.5 text-[12px] font-semibold bg-white hover:bg-[#F2F3EF] border border-[#E8E9E5] rounded-[8px] transition-all inline-flex items-center gap-1.5 shadow-2xs">
                    📁 Upload .CSV File
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCsvText(SAMPLE_CSV)}
                >
                  Reset Sample (5 Students)
                </Button>
              </div>
            </div>

            {/* Batch Certificate Template Image */}
            <div className="p-3.5 rounded-[12px] bg-[#F7F7F4] border border-[#E8E9E5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-11 rounded-[8px] overflow-hidden border border-[#D9DCD5] shrink-0 bg-white shadow-2xs">
                  <img
                    src={bulkImage}
                    alt="Cohort Diploma Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#101418] truncate">
                    Cohort Certificate Template Scan
                  </div>
                  <div className="text-[11px] text-[#626971]">
                    Applied as the official background photo for every certificate in this batch
                  </div>
                </div>
              </div>

              <label className="cursor-pointer shrink-0">
                <span className="px-3 py-1.5 text-[12px] font-semibold bg-white hover:bg-[#F2F3EF] border border-[#E8E9E5] rounded-[8px] transition-all shadow-2xs">
                  Upload Template Scan
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBulkImageChange}
                  className="hidden"
                />
              </label>
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
                <span className="text-[11px] font-semibold text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full border border-[#CEF0CE]">
                  ✉️ Email Dispatch Ready
                </span>
              </div>
              <div className="overflow-x-auto border border-[#E8E9E5] rounded-[12px]">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F7F7F4] text-[#8A9097] text-[10px] font-bold uppercase border-b border-[#E8E9E5]">
                    <tr>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Recipient Email</th>
                      <th className="py-2.5 px-4">Student ID / DID</th>
                      <th className="py-2.5 px-4">Degree / Certificate</th>
                      <th className="py-2.5 px-4">Faculty</th>
                      <th className="py-2.5 px-4">GPA / Marks</th>
                      <th className="py-2.5 px-4">Marksheet Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E9E5]">
                    {parsedBulkRows.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F7F7F4]">
                        <td className="py-2.5 px-4 font-semibold text-[#101418]">{r.subjectName}</td>
                        <td className="py-2.5 px-4">
                          <span className="text-[11px] font-mono text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-[6px] border border-[#BFDBFE] inline-flex items-center gap-1">
                            <span>✉️</span>
                            <span>{r.recipientEmail}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#626971]">{r.subjectId}</td>
                        <td className="py-2.5 px-4 text-[#101418]">{r.title}</td>
                        <td className="py-2.5 px-4 text-[#626971]">{r.department}</td>
                        <td className="py-2.5 px-4 font-semibold text-[#159447]">{r.gpa}</td>
                        <td className="py-2.5 px-4">
                          {r.documentImage?.startsWith("http") ? (
                            <a
                              href={r.documentImage}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1764C0] hover:underline font-mono text-[11px] inline-flex items-center gap-1 bg-[#EBF3FC] px-2 py-0.5 rounded-[6px]"
                            >
                              <span>Drive File</span>
                              <span>↗</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-[#8A9097]">Template Image</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {bulkSigning && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                  <span>Cryptographically signing {parsedBulkRows.length} certificates & dispatching emails...</span>
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

            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E8E9E5]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkSendEmail}
                  onChange={(e) => setBulkSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-[#111410] focus:ring-[#BEF52A]"
                />
                <span className="text-[13px] font-semibold text-[#101418]">
                  ✉️ Automatically email official certificate & verification link to all students in batch
                </span>
              </label>

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

              <div className="bg-[#E8F8E8] border border-[#CEF0CE] rounded-[12px] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#159447]">
                  <span>✉️</span>
                  <span>
                    {bulkEmailsDispatched > 0
                      ? `${bulkEmailsDispatched} Official Credential Notification Emails Successfully Dispatched to Students!`
                      : "Batch Anchored Successfully (Email notifications skipped)"}
                  </span>
                </div>
                {bulkEmailsDispatched > 0 && bulkIssuedResults[0] && (
                  <button
                    onClick={() => {
                      const first = bulkIssuedResults[0];
                      const verificationUrl = typeof window !== "undefined"
                        ? `${window.location.origin}/?verify=${first.id}`
                        : `https://trustchain.network/verify/${first.id}`;
                      setPreviewEmailModal({
                        id: `bulk-preview-${first.id}`,
                        to: first.recipientEmail || "student@mu.edu",
                        studentName: first.subjectName,
                        credentialTitle: first.type,
                        institutionName: first.issuingInstitution,
                        credentialId: first.id,
                        verificationUrl,
                        subject: `Official Verifiable Credential: ${first.type}`,
                        previewHtml: "",
                        status: "delivered",
                        timestamp: new Date().toISOString(),
                      });
                    }}
                    className="text-[12px] font-bold text-[#159447] underline cursor-pointer shrink-0"
                  >
                    Preview Sample Student Email →
                  </button>
                )}
              </div>

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

                    {/* Recipient Email Field */}
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1 flex items-center justify-between">
                        <span>Recipient Student Email</span>
                        <span className="text-[11px] font-semibold text-[#159447] lowercase">official notification inbox</span>
                      </label>
                      <input
                        type="email"
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        placeholder="student@university.edu"
                        className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                      />
                    </div>

                    {/* Email Dispatch Checkbox */}
                    <div className="p-3 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="sendEmailCheck"
                        checked={formData.sendEmailNotification}
                        onChange={(e) => setFormData({ ...formData, sendEmailNotification: e.target.checked })}
                        className="w-4 h-4 rounded text-[#111410] focus:ring-[#BEF52A]"
                      />
                      <label htmlFor="sendEmailCheck" className="text-[12px] font-semibold text-[#1E3A8A] cursor-pointer">
                        ✉️ Automatically dispatch verifiable certificate & QR access link to student email upon signing
                      </label>
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
                    {formData.recipientEmail && (
                      <div className="text-[11px] font-mono text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-full inline-block mt-2 border border-[#BFDBFE]">
                        ✉️ {formData.recipientEmail}
                      </div>
                    )}
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

              {/* Review summary with email */}
              <div className="bg-[#F7F7F4] rounded-[14px] p-4 border border-[#E8E9E5] space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Student Name:</span>
                  <strong className="text-[#101418]">{formData.subjectName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Student Email:</span>
                  <span className="font-mono text-[#1E3A8A] font-semibold">{formData.recipientEmail || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Document Title:</span>
                  <span className="text-[#101418] font-bold">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Notification Action:</span>
                  <span className="text-[#159447] font-semibold">
                    {formData.sendEmailNotification ? "✉️ Immediate student email dispatch active" : "Email skipped"}
                  </span>
                </div>
              </div>

              {signing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                    <span>Signing with institutional root keypair & dispatching email...</span>
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

              {/* Email dispatch banner */}
              {formData.recipientEmail && (
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">✉️</span>
                      <div>
                        <div className="text-[13px] font-bold text-[#1E3A8A]">
                          Official Certificate Dispatched via Email
                        </div>
                        <div className="text-[11px] font-mono text-[#2563EB]">
                          Delivered to: <strong>{formData.recipientEmail}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full border border-[#CEF0CE]">
                      ✓ Delivered
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#DBEAFE]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const verificationUrl = typeof window !== "undefined"
                          ? `${window.location.origin}/?verify=${issuedCred?.id}`
                          : `https://trustchain.network/verify/${issuedCred?.id}`;
                        setPreviewEmailModal(
                          dispatchedEmail || {
                            id: `preview-${issuedCred?.id}`,
                            to: formData.recipientEmail,
                            studentName: formData.subjectName,
                            credentialTitle: issuedCred?.type || formData.title,
                            institutionName: activeInstitution.name,
                            credentialId: issuedCred?.id || "",
                            verificationUrl,
                            subject: `Official Verifiable Credential: ${issuedCred?.type || formData.title}`,
                            previewHtml: "",
                            status: "delivered",
                            timestamp: new Date().toISOString(),
                          }
                        );
                      }}
                    >
                      ✉️ Preview Delivered Email
                    </Button>
                    <a
                      href={generateMailtoUrl({
                        to: formData.recipientEmail,
                        studentName: formData.subjectName,
                        credentialTitle: issuedCred?.type || formData.title,
                        institutionName: activeInstitution.name,
                        credentialId: issuedCred?.id || "",
                        verificationUrl: typeof window !== "undefined"
                          ? `${window.location.origin}/?verify=${issuedCred?.id}`
                          : `https://trustchain.network/verify/${issuedCred?.id}`,
                      })}
                      className="px-3 py-1.5 rounded-[8px] bg-white hover:bg-[#F2F3EF] border border-[#DBEAFE] text-[12px] font-semibold text-[#1E3A8A] inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <span>Open in Mail Client</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              )}

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

      {/* Email Preview Modal */}
      {previewEmailModal && (
        <div className="fixed inset-0 bg-[#101418]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-2">
                <span className="text-xl">✉️</span>
                <div>
                  <h3 className="text-[17px] font-bold text-[#101418]">
                    Student Notification Email Preview
                  </h3>
                  <p className="text-[12px] text-[#626971]">
                    Recipient: <strong className="font-mono text-[#101418]">{previewEmailModal.to}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewEmailModal(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F7F7F4] p-3 rounded-[10px] text-[12px] space-y-1 text-[#626971] border border-[#E8E9E5]">
              <div><strong>From:</strong> registrar@{activeInstitution.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.edu (TrustChain Verified Issuer)</div>
              <div><strong>To:</strong> {previewEmailModal.to} ({previewEmailModal.studentName})</div>
              <div><strong>Subject:</strong> {previewEmailModal.subject}</div>
            </div>

            <div className="border border-[#E8E9E5] rounded-[14px] overflow-hidden bg-white">
              {previewEmailModal.previewHtml ? (
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: previewEmailModal.previewHtml }}
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EFFBCB] text-[#172000] flex items-center justify-center mx-auto text-xl font-bold">
                    🏛️
                  </div>
                  <h4 className="font-bold text-[18px] text-[#101418]">{activeInstitution.name}</h4>
                  <p className="text-[13px] text-[#626971]">
                    Official Verifiable Credential conferred to <strong>{previewEmailModal.studentName}</strong>
                  </p>
                  <div className="bg-[#F7F7F4] p-3 rounded-[10px] text-[12px] font-mono text-[#101418] border border-[#E8E9E5]">
                    {previewEmailModal.credentialTitle}
                  </div>
                  <a
                    href={previewEmailModal.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-5 py-2.5 rounded-[10px] bg-[#111410] text-[#BEF52A] font-bold text-[13px]"
                  >
                    View & Verify Credential on Student Portal →
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="md" onClick={() => setPreviewEmailModal(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
