"use client";

import { useState, useRef } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import {
  VerifyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CopyIcon,
  BlocksIcon,
  FilterIcon,
  ShieldCheckIcon,
} from "../ui/Icons";
import Button from "../ui/Button";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import LedgerCrossValidationModal from "../ui/LedgerCrossValidationModal";

interface VerifyScreenProps {
  onNavigate?: (screen: string) => void;
}

export interface BulkVerifyItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  fileType: "pdf" | "jpg" | "png" | "unknown";
  fileHash: string;
  status: "pending" | "scanning" | "verifying" | "done" | "error";
  credentialId?: string;
  candidateName?: string;
  institution?: string;
  degreeTitle?: string;
  issueDate?: string;
  verdict?: "VALID" | "TAMPER_DETECTED" | "REVOKED" | "NOT_FOUND";
  verdictSummary?: string;
  computedHash?: string;
  expectedHash?: string;
  checks?: { name: string; status: "pass" | "fail"; detail: string }[];
  thumbnailUrl?: string;
  errorMessage?: string;
}

export default function VerifyScreen({ onNavigate }: VerifyScreenProps) {
  const { verifyCredentialAsync, credentials } = useTrustChain();

  // Active view tab: "single" or "bulk"
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single Verification State
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [inputDid, setInputDid] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileHash, setUploadedFileHash] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found" | "notfound">("idle");
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerTargetId, setLedgerTargetId] = useState<string | undefined>(undefined);

  // Bulk Verification State
  const [bulkItems, setBulkItems] = useState<BulkVerifyItem[]>([]);
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const [bulkFilter, setBulkFilter] = useState<"all" | "valid" | "tampered" | "revoked">("all");
  const [selectedBulkItem, setSelectedBulkItem] = useState<BulkVerifyItem | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // Helpers for Hash & Cryptographic Extraction
  // -------------------------------------------------------------

  const computeFileSha256 = async (file: File | Blob): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const extractJpegFromPdf = (buffer: ArrayBuffer): Blob | null => {
    const bytes = new Uint8Array(buffer);
    let startIdx = -1;
    for (let i = 0; i < bytes.length - 3; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
        startIdx = i;
        break;
      }
    }
    if (startIdx === -1) return null;

    let endIdx = -1;
    for (let i = startIdx + 3; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
        endIdx = i + 2;
        break;
      }
    }
    if (endIdx === -1) return null;

    const jpegBytes = bytes.slice(startIdx, endIdx);
    return new Blob([jpegBytes], { type: "image/jpeg" });
  };

  const extractPatternsFromPdf = (buffer: ArrayBuffer): string | null => {
    try {
      const text = new TextDecoder("latin1").decode(buffer);
      const urlMatch = text.match(/[?&]verify=([^&"'\s\)\>]+)/);
      if (urlMatch) return decodeURIComponent(urlMatch[1]).trim();

      const didMatch = text.match(/did:trust:[a-zA-Z0-9_\-\.\:\/]+/);
      if (didMatch) return didMatch[0].trim();

      const credMatch = text.match(/cred-[a-zA-Z0-9_\-\.\:\/]+/);
      if (credMatch) return credMatch[0].trim();
    } catch (e) {
      // Ignore
    }
    return null;
  };

  const scanQrFromImageBlob = async (blob: Blob): Promise<string | null> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsQR = (await import("jsqr")).default;
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
          URL.revokeObjectURL(url);
          if (qrCode?.data) {
            let credId = qrCode.data.trim();
            const urlMatch = qrCode.data.match(/[?&]verify=([^&]+)/);
            if (urlMatch) credId = decodeURIComponent(urlMatch[1]).trim();
            resolve(credId);
          } else {
            resolve(null);
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      }
      img.src = url;
    });
  };

  const findCredentialMatch = (fileName: string, fileHash: string): any => {
    // Exact image hash match
    const byHash = credentials.find(
      (c) => c.documentImageHash && c.documentImageHash.toLowerCase() === fileHash.toLowerCase()
    );
    if (byHash) return byHash;

    const lowerName = fileName.toLowerCase();
    // Credential ID in filename
    const byId = credentials.find(
      (c) =>
        lowerName.includes(c.id.toLowerCase()) ||
        (c.did && lowerName.includes(c.did.toLowerCase()))
    );
    if (byId) return byId;

    // Student name in filename
    const byName = credentials.find((c) => {
      const cleanSub = c.subjectName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanFile = lowerName.replace(/[^a-z0-9]/g, "");
      return cleanSub.length > 3 && cleanFile.includes(cleanSub);
    });
    if (byName) return byName;

    return null;
  };

  // -------------------------------------------------------------
  // Single Verification Workflow
  // -------------------------------------------------------------

  const runVerify = async (id: string, fileHashToUse?: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;
    setResult(null);
    setVerifying(true);
    setProgress(0);

    const targetHash =
      fileHashToUse !== undefined ? fileHashToUse : uploadedFileHash || undefined;

    const steps = [25, 55, 80, 95];
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx++]);
      }
    }, 120);

    try {
      const evalResult = await verifyCredentialAsync(cleanId, targetHash);
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setVerifying(false);
        const cred = evalResult.credential;

        if (cred) {
          const isRev = evalResult.isRevoked;
          const isTamp = evalResult.isTampered;
          const isImgTamp = evalResult.imageTampered;

          setResult({
            verdict: isTamp ? "TAMPER_DETECTED" : isRev ? "REVOKED" : "VALID",
            summary: isImgTamp
              ? `TAMPER DETECTED: The certificate file was modified after issuance! Visual SHA-256 file digest (${targetHash?.slice(0, 16)}...) does not match anchored issuance digest (${cred.documentImageHash?.slice(0, 16)}...).`
              : isTamp
              ? `TAMPER DETECTED: Credential data modified after issuance. SHA-256 digest (${evalResult.computedHash.slice(0, 16)}...) differs from anchored registry digest (${evalResult.expectedHash.slice(0, 16)}...).`
              : isRev
              ? `REVOKED: This credential was revoked by ${cred.issuingInstitution}. Reason: ${(cred as any).revocationReason || "Revoked by issuer"}.`
              : `VERIFIED AUTHENTIC: Cryptographic ledger signature and visual document hash mathematically verified against Trust Registry. Zero tampering detected.`,
            subjectName: cred.subjectName,
            issuer: cred.issuingInstitution,
            issueDate: cred.issueDate,
            credentialId: cred.did || cred.id,
            type: cred.type,
            documentImage: cred.documentImage,
            computedHash: evalResult.computedHash,
            expectedHash: evalResult.expectedHash,
            checks: evalResult.checks,
          });
        } else {
          setResult({
            verdict: "TAMPER_DETECTED",
            summary: `NOT FOUND: No record found in the Trust Registry for '${cleanId}'. The document may be forged or the ID is invalid.`,
            subjectName: "Unknown",
            issuer: "Unknown",
            issueDate: "—",
            credentialId: cleanId,
            type: "—",
            documentImage: null,
            computedHash: evalResult.computedHash,
            expectedHash: evalResult.expectedHash,
            checks: evalResult.checks,
          });
        }
      }, 200);
    } catch (e: any) {
      clearInterval(interval);
      setVerifying(false);
      setResult({
        verdict: "TAMPER_DETECTED",
        summary: `Verification error: ${e?.message || "Failed to query trust registry"}`,
        subjectName: "Unknown",
        issuer: "Unknown",
        issueDate: "—",
        credentialId: cleanId,
        type: "—",
        documentImage: null,
        computedHash: "0xError",
        expectedHash: "0xUnknown",
        checks: [],
      });
    }
  };

  const handleSingleFileUpload = async (file: File) => {
    if (!file) return;
    setScanStatus("scanning");
    setUploadedImage(null);
    setUploadedFileHash(null);

    try {
      const fileHash = await computeFileSha256(file);
      setUploadedFileHash(fileHash);

      let extractedId: string | null = null;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const buffer = await file.arrayBuffer();
        // 1. Try embedded JPEG in PDF
        const jpegBlob = extractJpegFromPdf(buffer);
        if (jpegBlob) {
          extractedId = await scanQrFromImageBlob(jpegBlob);
          setUploadedImage(URL.createObjectURL(jpegBlob));
        }
        // 2. Try pattern search in PDF
        if (!extractedId) {
          extractedId = extractPatternsFromPdf(buffer);
        }
        // 3. Match against known credentials
        if (!extractedId) {
          const match = findCredentialMatch(file.name, fileHash);
          if (match) extractedId = match.did || match.id;
        }
      } else {
        // Image JPG / PNG
        const blobUrl = URL.createObjectURL(file);
        setUploadedImage(blobUrl);
        extractedId = await scanQrFromImageBlob(file);
        if (!extractedId) {
          const match = findCredentialMatch(file.name, fileHash);
          if (match) extractedId = match.did || match.id;
        }
      }

      if (extractedId) {
        setInputDid(extractedId);
        setScanStatus("found");
        runVerify(extractedId, fileHash);
      } else {
        setScanStatus("notfound");
      }
    } catch {
      setScanStatus("notfound");
    }
  };

  // -------------------------------------------------------------
  // Bulk Multi-File Verification Workflow
  // -------------------------------------------------------------

  const handleBulkFilesSelect = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Switch to bulk tab
    setActiveTab("bulk");

    const newItems: BulkVerifyItem[] = fileList.map((file, idx) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const fileType: BulkVerifyItem["fileType"] =
        ext === "pdf" ? "pdf" : ext === "jpg" || ext === "jpeg" ? "jpg" : ext === "png" ? "png" : "unknown";

      return {
        id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        fileHash: "Computing SHA-256...",
        status: "pending",
      };
    });

    setBulkItems((prev) => [...prev, ...newItems]);
    processBulkQueue(newItems);
  };

  const processBulkQueue = async (itemsToProcess: BulkVerifyItem[]) => {
    setIsBulkVerifying(true);

    for (const item of itemsToProcess) {
      if (!item.file) continue;

      // Update status to scanning
      updateBulkItem(item.id, { status: "scanning" });

      try {
        const fileHash = await computeFileSha256(item.file);
        let extractedId: string | null = null;
        let previewUrl: string | undefined = undefined;

        if (item.fileType === "pdf") {
          const buffer = await item.file.arrayBuffer();
          // Extract JPEG stream
          const jpegBlob = extractJpegFromPdf(buffer);
          if (jpegBlob) {
            extractedId = await scanQrFromImageBlob(jpegBlob);
            previewUrl = URL.createObjectURL(jpegBlob);
          }
          // Scan text patterns
          if (!extractedId) {
            extractedId = extractPatternsFromPdf(buffer);
          }
          // Match by filename / hash
          if (!extractedId) {
            const match = findCredentialMatch(item.fileName, fileHash);
            if (match) extractedId = match.did || match.id;
          }
        } else {
          // JPG or PNG
          previewUrl = URL.createObjectURL(item.file);
          extractedId = await scanQrFromImageBlob(item.file);
          if (!extractedId) {
            const match = findCredentialMatch(item.fileName, fileHash);
            if (match) extractedId = match.did || match.id;
          }
        }

        updateBulkItem(item.id, {
          fileHash,
          thumbnailUrl: previewUrl,
          credentialId: extractedId || "Unidentified QR / ID",
          status: "verifying",
        });

        if (!extractedId) {
          updateBulkItem(item.id, {
            status: "done",
            verdict: "NOT_FOUND",
            candidateName: "Unknown",
            institution: "—",
            degreeTitle: "—",
            verdictSummary: "No QR code or valid credential identifier detected in document payload.",
            checks: [
              { name: "Payload Signature", status: "fail", detail: "Document does not contain registered TrustChain identifier" },
              { name: "Visual Digest Anchor", status: "fail", detail: `SHA-256 ${fileHash.slice(0, 16)}... not registered` },
            ],
          });
          continue;
        }

        // Run full cryptographic verification
        const evalResult = await verifyCredentialAsync(extractedId, fileHash);
        const cred = evalResult.credential;

        if (cred) {
          const isRev = evalResult.isRevoked;
          const isTamp = evalResult.isTampered;
          const isImgTamp = evalResult.imageTampered;

          const verdict: BulkVerifyItem["verdict"] = isTamp ? "TAMPER_DETECTED" : isRev ? "REVOKED" : "VALID";
          const summary = isImgTamp
            ? `Visual SHA-256 digest mismatch. File modified after issuance.`
            : isTamp
            ? `Cryptographic signature digest mismatch. Data tampered.`
            : isRev
            ? `Credential was formally revoked by ${cred.issuingInstitution}.`
            : `100% Cryptographic Integrity. Verified against decentralized Trust Registry.`;

          updateBulkItem(item.id, {
            status: "done",
            verdict,
            candidateName: cred.subjectName,
            institution: cred.issuingInstitution,
            degreeTitle: cred.type,
            issueDate: cred.issueDate,
            verdictSummary: summary,
            computedHash: evalResult.computedHash,
            expectedHash: evalResult.expectedHash,
            checks: evalResult.checks,
          });
        } else {
          updateBulkItem(item.id, {
            status: "done",
            verdict: "NOT_FOUND",
            candidateName: "Unregistered",
            institution: "—",
            degreeTitle: "—",
            verdictSummary: `ID '${extractedId}' was not found in the TrustChain Registry.`,
            checks: evalResult.checks,
          });
        }
      } catch (err: any) {
        updateBulkItem(item.id, {
          status: "error",
          verdict: "NOT_FOUND",
          errorMessage: err?.message || "Failed to verify certificate",
        });
      }
    }

    setIsBulkVerifying(false);
  };

  const updateBulkItem = (id: string, updates: Partial<BulkVerifyItem>) => {
    setBulkItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const loadSampleBatch = () => {
    setActiveTab("bulk");
    const sampleItems: BulkVerifyItem[] = [
      {
        id: `sample-1-${Date.now()}`,
        fileName: "David_Kim_BSc_Computer_Science.pdf",
        fileSize: 418290,
        fileType: "pdf",
        fileHash: "0x8f2a1b94c3d8271e504b2a9d8c3e1f4b",
        status: "done",
        credentialId: "did:trust:cred-2023-MIT-9912",
        candidateName: "David Kim",
        institution: "MIT Innovation Labs",
        degreeTitle: "Bachelor of Science in Computer Science",
        issueDate: "2023-06-15",
        verdict: "VALID",
        verdictSummary: "VERIFIED AUTHENTIC: Cryptographic ED25519 signature & SHA-256 match Trust Registry.",
        computedHash: "0x8f2a1b94c3d8271e504b2a9d8c3e1f4b",
        expectedHash: "0x8f2a1b94c3d8271e504b2a9d8c3e1f4b",
        checks: [
          { name: "ED25519 Cryptographic Signature", status: "pass", detail: "Signature matches authorized issuer root public key" },
          { name: "Visual Document Hash (SHA-256)", status: "pass", detail: "File digest identical to registered block anchor" },
          { name: "Revocation Accumulator Status", status: "pass", detail: "Active standing in on-chain accumulator" },
          { name: "Issuing Authority Node Validation", status: "pass", detail: "MIT Innovation Labs registered on Mainnet" },
        ],
      },
      {
        id: `sample-2-${Date.now()}`,
        fileName: "Elena_Rostova_MBA_Finance_Altered.jpg",
        fileSize: 632110,
        fileType: "jpg",
        fileHash: "0x3e1a90c4f82d1b77a012c4e9f3b1d7e2",
        status: "done",
        credentialId: "did:trust:cred-2023-MU-7721",
        candidateName: "Elena Rostova",
        institution: "Metropolitan University",
        degreeTitle: "Master of Business Administration",
        issueDate: "2023-09-20",
        verdict: "TAMPER_DETECTED",
        verdictSummary: "TAMPER DETECTED: Grade values or visual document modified after issuance. Hash mismatch.",
        computedHash: "0x3e1a90c4f82d1b77a012c4e9f3b1d7e2",
        expectedHash: "0x9c4f82d1b77a012c4e9f3b1d7e23e1a9",
        checks: [
          { name: "ED25519 Cryptographic Signature", status: "fail", detail: "Payload hash does not match issuer signed signature" },
          { name: "Visual Document Hash (SHA-256)", status: "fail", detail: "Computed digest differs from registry anchor" },
          { name: "Revocation Accumulator Status", status: "pass", detail: "No explicit revocation recorded" },
        ],
      },
      {
        id: `sample-3-${Date.now()}`,
        fileName: "Marcus_Vance_MD_License_Revoked.pdf",
        fileSize: 521400,
        fileType: "pdf",
        fileHash: "0x5a1b2c3d4e5f67890123456789abcdef",
        status: "done",
        credentialId: "did:trust:cred-2022-SMC-1104",
        candidateName: "Marcus Vance",
        institution: "Stanford Medical Council",
        degreeTitle: "Doctor of Medicine (MD)",
        issueDate: "2022-11-10",
        verdict: "REVOKED",
        verdictSummary: "REVOKED: This medical credential was formally revoked by Stanford Medical Council.",
        computedHash: "0x5a1b2c3d4e5f67890123456789abcdef",
        expectedHash: "0x5a1b2c3d4e5f67890123456789abcdef",
        checks: [
          { name: "ED25519 Cryptographic Signature", status: "pass", detail: "Valid original issuing signature" },
          { name: "Revocation Accumulator Status", status: "fail", detail: "Cryptographic revocation proof published on-chain" },
        ],
      },
    ];

    setBulkItems(sampleItems);
  };

  const exportBatchCsv = () => {
    if (bulkItems.length === 0) return;
    const headers = [
      "File Name",
      "Format",
      "Candidate Name",
      "Degree / Certificate",
      "Issuing University",
      "Credential DID / ID",
      "Verification Verdict",
      "SHA-256 Digest",
      "Verification Timestamp",
    ];

    const rows = bulkItems.map((item) => [
      `"${item.fileName}"`,
      `"${item.fileType.toUpperCase()}"`,
      `"${item.candidateName || "Unknown"}"`,
      `"${item.degreeTitle || "—"}"`,
      `"${item.institution || "—"}"`,
      `"${item.credentialId || "—"}"`,
      `"${item.verdict || "UNKNOWN"}"`,
      `"${item.fileHash || "—"}"`,
      `"${new Date().toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `TrustChain_Batch_Verification_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bulk stats
  const totalBulk = bulkItems.length;
  const validBulk = bulkItems.filter((i) => i.verdict === "VALID").length;
  const tamperedBulk = bulkItems.filter((i) => i.verdict === "TAMPER_DETECTED").length;
  const revokedBulk = bulkItems.filter((i) => i.verdict === "REVOKED" || i.verdict === "NOT_FOUND").length;

  const filteredBulkItems = bulkItems.filter((i) => {
    if (bulkFilter === "valid") return i.verdict === "VALID";
    if (bulkFilter === "tampered") return i.verdict === "TAMPER_DETECTED";
    if (bulkFilter === "revoked") return i.verdict === "REVOKED" || i.verdict === "NOT_FOUND";
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1240px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#1764C0] bg-[#E6F2FC] px-2.5 py-0.5 rounded-full">
            Recruiter Verification Portal
          </span>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1.5">
            Credential Verification & Tamper Detection
          </h1>
          <p className="text-[14px] text-[#626971] mt-1">
            Verify student certificates individually or batch-upload multi-format PDFs and JPGs with automated cryptographic hash matching.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F2F3EF] p-1.5 rounded-[12px] border border-[#E8E9E5] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-4 py-2 rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === "single"
                ? "bg-white text-[#101418] shadow-xs"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            Single Credential
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 rounded-[9px] text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "bulk"
                ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            <span>Bulk Upload (PDF & JPG)</span>
            {bulkItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#BEF52A] text-[#111410] font-black">
                {bulkItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SINGLE VERIFICATION VIEW                           */}
      {/* ========================================================= */}
      {activeTab === "single" && (
        <div className="space-y-7">
          <Card className="space-y-5">
            {/* Manual ID Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097]">
                  Credential ID / DID / Verification Link
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
                  onKeyDown={(e) => e.key === "Enter" && runVerify(inputDid)}
                  placeholder="Paste credential ID or scan QR from certificate..."
                  className="flex-1 h-[44px] px-4 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => runVerify(inputDid)}
                  disabled={verifying || !inputDid.trim()}
                  icon={<VerifyIcon className="w-4 h-4 text-[#BEF52A]" />}
                >
                  {verifying ? "Verifying..." : "Verify Certificate"}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setLedgerTargetId(inputDid.trim() || undefined);
                    setShowLedgerModal(true);
                  }}
                  icon={<ShieldCheckIcon className="w-4 h-4 text-[#111410]" />}
                  className="cursor-pointer font-bold shrink-0"
                >
                  Cross-Validate Ledger
                </Button>
              </div>
            </div>

            {/* Single File Upload Dropzone (Supports PDF & JPG) */}
            <div
              className="rounded-[14px] border-2 border-dashed border-[#D0D3CB] bg-[#F7F7F4] p-5 cursor-pointer hover:border-[#9FD30C] hover:bg-[#F0F7E6] transition-all"
              onClick={() => singleFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 1) {
                  handleBulkFilesSelect(e.dataTransfer.files);
                } else if (e.dataTransfer.files[0]) {
                  handleSingleFileUpload(e.dataTransfer.files[0]);
                }
              }}
            >
              <input
                ref={singleFileInputRef}
                type="file"
                multiple
                accept=".pdf,image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 1) {
                    handleBulkFilesSelect(e.target.files);
                  } else if (e.target.files?.[0]) {
                    handleSingleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {uploadedImage && scanStatus !== "idle" ? (
                <div className="flex items-start gap-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded certificate"
                    className="w-28 h-20 object-cover rounded-[10px] border border-[#E8E9E5] shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="text-[13px] font-bold text-[#101418]">
                      {scanStatus === "scanning" && "🔍 Scanning QR code from certificate..."}
                      {scanStatus === "found" && "✅ QR code detected — credential ID extracted"}
                      {scanStatus === "notfound" &&
                        "⚠️ No QR code found in this document — enter ID manually above"}
                    </div>
                    {scanStatus === "found" && (
                      <div className="text-[11px] font-mono text-[#159447] bg-[#E8F8E8] px-2 py-1 rounded-[6px] break-all">
                        {inputDid}
                      </div>
                    )}
                    {scanStatus === "found" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          runVerify(inputDid);
                        }}
                      >
                        Verify Now →
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1.5 py-3">
                  <div className="text-3xl">📎</div>
                  <div className="text-[14px] font-bold text-[#101418]">
                    Upload Certificate (PDF or JPG)
                  </div>
                  <div className="text-[12px] text-[#626971] max-w-md mx-auto">
                    Drag & drop or click to upload a PDF or JPG certificate. Multiple files dropped here will automatically launch Bulk Verification.
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {verifying && (
              <div className="space-y-2">
                <div className="flex justify-between text-[12px] font-semibold text-[#101418]">
                  <span>Computing SHA-256 digest & querying trust registry...</span>
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

          {/* Results for Single */}
          {result && !verifying && (
            <div className="space-y-6 animate-fade-in">
              {/* Verdict Banner */}
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
                        ? "bg-[#159447]"
                        : result.verdict === "TAMPER_DETECTED"
                        ? "bg-[#C0392B]"
                        : "bg-[#B95B12]"
                    } text-white`}
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
                        ? "✓ Authentic — No Tampering Detected"
                        : result.verdict === "TAMPER_DETECTED"
                        ? "⚠ Tamper Alert: Document Modified After Issuance"
                        : "✕ Credential Revoked by Institution"}
                    </h2>
                    <p className="text-[13px] opacity-90 mt-1 leading-relaxed max-w-2xl">
                      {result.summary}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(result.credentialId)}
                  className="px-3.5 py-2 rounded-[10px] bg-white text-[#101418] text-[12px] font-semibold border border-current/20 hover:bg-black/5 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied" : "Copy Credential ID"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credential Info */}
                <Card className="space-y-3">
                  <h3 className="text-[15px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
                    Credential Record
                  </h3>
                  {[
                    ["Candidate Name", result.subjectName],
                    ["Certificate Type", result.type],
                    ["Issuing Institution", result.issuer],
                    ["Issue Date", result.issueDate],
                    ["Credential DID", result.credentialId],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[13px]">
                      <span className="text-[#626971]">{label}:</span>
                      <span className="font-semibold text-[#101418] text-right max-w-[55%] truncate">
                        {val}
                      </span>
                    </div>
                  ))}
                </Card>

                {/* Hash Comparison */}
                <Card className="space-y-3">
                  <h3 className="text-[15px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
                    SHA-256 Hash Comparison
                  </h3>
                  <div className="space-y-2 text-[12px]">
                    <div>
                      <div className="text-[#8A9097] font-bold uppercase tracking-wide mb-1">
                        Anchored Hash (Issuance)
                      </div>
                      <div className="font-mono text-[#159447] bg-[#E8F8E8] p-2 rounded-[8px] break-all">
                        {result.expectedHash}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A9097] font-bold uppercase tracking-wide mb-1">
                        Computed Hash (Now)
                      </div>
                      <div
                        className={`font-mono p-2 rounded-[8px] break-all ${
                          result.computedHash === result.expectedHash
                            ? "text-[#159447] bg-[#E8F8E8]"
                            : "text-[#C0392B] bg-[#FDEAE7]"
                        }`}
                      >
                        {result.computedHash}
                      </div>
                    </div>
                    <div
                      className={`text-[12px] font-bold mt-1 ${
                        result.computedHash === result.expectedHash
                          ? "text-[#159447]"
                          : "text-[#C0392B]"
                      }`}
                    >
                      {result.computedHash === result.expectedHash
                        ? "✓ Hashes match — data intact"
                        : "✕ Hash mismatch — data was altered"}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Cryptographic Checks */}
              <Card className="!p-0 overflow-hidden">
                <div className="p-5 border-b border-[#E8E9E5]">
                  <h3 className="text-[16px] font-bold text-[#101418]">
                    Cryptographic Audit Checks
                  </h3>
                  <p className="text-[13px] text-[#626971] mt-0.5">
                    Zero college database access required for any of these checks.
                  </p>
                </div>
                <div className="divide-y divide-[#E8E9E5]">
                  {result.checks.map((chk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 md:px-6 flex items-start justify-between gap-4"
                    >
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
                          <div className="text-[12px] text-[#626971] mt-0.5">{chk.detail}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
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
            </div>
          )}
        </div>
      )}


      {/* ========================================================= */}
      {/* TAB 2: BULK MULTI-UPLOAD VERIFICATION (PDF & JPG)          */}
      {/* ========================================================= */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          {/* Multi-Dropzone Card */}
          <Card className="space-y-5">
            <div
              className="rounded-[16px] border-2 border-dashed border-[#D0D3CB] bg-[#F7F7F4] p-8 text-center cursor-pointer hover:border-[#1764C0] hover:bg-[#F2F7FD] transition-all group"
              onClick={() => bulkFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleBulkFilesSelect(e.dataTransfer.files);
              }}
            >
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept=".pdf,image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleBulkFilesSelect(e.target.files);
                }}
              />

              <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F2FC] text-[#1764C0] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                📂
              </div>

              <h2 className="text-[18px] font-extrabold text-[#101418] tracking-tight">
                Drop Multiple Certificates (PDF or JPG / PNG)
              </h2>
              <p className="text-[13px] text-[#626971] max-w-lg mx-auto mt-1">
                Select and verify multiple student credentials simultaneously. Automated cryptographic SHA-256 digest extraction and QR payload matching.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    bulkFileInputRef.current?.click();
                  }}
                  icon={<VerifyIcon className="w-4 h-4 text-[#BEF52A]" />}
                >
                  Select PDF / JPG Files
                </Button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSampleBatch();
                  }}
                  className="px-4 py-2 rounded-[10px] bg-white border border-[#D9DCD5] hover:border-[#111410] text-[13px] font-bold text-[#101418] hover:bg-[#F7F7F4] transition-all shadow-xs cursor-pointer"
                >
                  ⚡ Load Sample Test Batch (3 Files)
                </button>
              </div>

              <div className="text-[11px] font-semibold text-[#8A9097] mt-3">
                Accepted Formats: <span className="font-mono text-[#101418]">.pdf, .jpg, .jpeg, .png</span> • Batch size: Unlimited
              </div>
            </div>

            {/* Batch Processing Indicator */}
            {isBulkVerifying && (
              <div className="p-4 rounded-[12px] bg-[#EBF3FC] border border-[#CCE2F8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#1764C0] animate-ping" />
                  <span className="text-[13px] font-bold text-[#1764C0]">
                    Processing batch verification queue... Computing digests & querying ledger blocks
                  </span>
                </div>
                <span className="text-[12px] font-mono font-bold text-[#1764C0]">In Progress</span>
              </div>
            )}
          </Card>

          {/* Bulk Batch Summary Metrics */}
          {totalBulk > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="p-4 rounded-[14px] bg-white border border-[#E8E9E5] shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                  Total Batch Uploaded
                </div>
                <div className="text-[26px] font-black text-[#101418] mt-1">{totalBulk}</div>
                <div className="text-[11px] text-[#626971] mt-0.5">Certificates in queue</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#E8F8E8] border border-[#CEF0CE] shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#159447]">
                  Verified Authentic
                </div>
                <div className="text-[26px] font-black text-[#159447] mt-1">{validBulk}</div>
                <div className="text-[11px] text-[#159447]/80 mt-0.5">100% hash integrity</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#FDEAE7] border border-[#F9CBC5] shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C0392B]">
                  Tamper Detected
                </div>
                <div className="text-[26px] font-black text-[#C0392B] mt-1">{tamperedBulk}</div>
                <div className="text-[11px] text-[#C0392B]/80 mt-0.5">Digest mismatch / altered</div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#FFF0DE] border border-[#FFE0BA] shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B95B12]">
                  Revoked / Invalid
                </div>
                <div className="text-[26px] font-black text-[#B95B12] mt-1">{revokedBulk}</div>
                <div className="text-[11px] text-[#B95B12]/80 mt-0.5">Revoked or unknown</div>
              </div>
            </div>
          )}

          {/* Batch Action Toolbar & Filters */}
          {totalBulk > 0 && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-[#E8E9E5] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAFAF8]">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] font-bold text-[#8A9097] mr-1">Filter:</span>
                  {[
                    { id: "all", label: `All (${totalBulk})` },
                    { id: "valid", label: `Authentic (${validBulk})` },
                    { id: "tampered", label: `Tampered (${tamperedBulk})` },
                    { id: "revoked", label: `Revoked (${revokedBulk})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setBulkFilter(f.id as any)}
                      className={`px-3 py-1 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                        bulkFilter === f.id
                          ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                          : "bg-white text-[#626971] hover:text-[#101418] border border-[#E8E9E5]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={exportBatchCsv}
                    icon={<span className="text-xs">📥</span>}
                  >
                    Export Report (CSV)
                  </Button>

                  <button
                    onClick={() => setBulkItems([])}
                    className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold text-[#8A9097] hover:text-[#C0392B] hover:bg-[#FDEAE7] transition-colors cursor-pointer"
                  >
                    Clear Batch
                  </button>
                </div>
              </div>

              {/* Batch Verification Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F7F7F4] text-[#8A9097] text-[11px] font-bold uppercase tracking-wider border-b border-[#E8E9E5]">
                    <tr>
                      <th className="py-3 px-5">Document / Candidate</th>
                      <th className="py-3 px-5">Issuing University</th>
                      <th className="py-3 px-5">Credential ID</th>
                      <th className="py-3 px-5">SHA-256 Digest</th>
                      <th className="py-3 px-5">Verification Verdict</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E9E5]">
                    {filteredBulkItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F9FAF8] transition-colors">
                        {/* File & Candidate */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[10px] font-black shrink-0 ${
                                item.fileType === "pdf"
                                  ? "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]"
                                  : "bg-[#E6F2FC] text-[#1764C0] border border-[#CCE2F8]"
                              }`}
                            >
                              {item.fileType.toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-[#101418] truncate max-w-[220px]">
                                {item.candidateName || item.fileName}
                              </div>
                              <div className="text-[11px] text-[#8A9097] truncate max-w-[220px]">
                                {item.fileName} ({Math.round(item.fileSize / 1024)} KB)
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Institution */}
                        <td className="py-3.5 px-5 text-[#101418] font-medium">
                          {item.institution || "—"}
                          {item.degreeTitle && (
                            <div className="text-[11px] text-[#626971] truncate max-w-[180px]">
                              {item.degreeTitle}
                            </div>
                          )}
                        </td>

                        {/* Credential ID */}
                        <td className="py-3.5 px-5 font-mono text-[11px] text-[#626971]">
                          <span className="truncate max-w-[160px] inline-block">
                            {item.credentialId || "Scanning..."}
                          </span>
                        </td>

                        {/* SHA-256 Hash */}
                        <td className="py-3.5 px-5 font-mono text-[11px] text-[#626971]">
                          <div className="flex items-center gap-1.5">
                            <span>{item.fileHash.slice(0, 12)}...</span>
                            <button
                              onClick={() => handleCopy(item.fileHash)}
                              className="p-1 hover:text-[#1764C0]"
                              title="Copy SHA-256 digest"
                            >
                              <CopyIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Verdict Badge */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {item.status === "verifying" || item.status === "scanning" ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1764C0]">
                              <span className="w-2 h-2 rounded-full bg-[#1764C0] animate-ping" />
                              Verifying...
                            </span>
                          ) : item.verdict === "VALID" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E8F8E8] text-[#159447] border border-[#CEF0CE]">
                              <CheckCircleIcon className="w-3 h-3" />
                              Authentic
                            </span>
                          ) : item.verdict === "TAMPER_DETECTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]">
                              <AlertCircleIcon className="w-3 h-3" />
                              Tampered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]">
                              <AlertCircleIcon className="w-3 h-3" />
                              {item.verdict === "REVOKED" ? "Revoked" : "Not Found"}
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedBulkItem(item)}
                            className="px-2.5 py-1 rounded-[6px] bg-[#F2F3EF] hover:bg-[#111410] hover:text-[#BEF52A] text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Inspect Audit →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* BULK ITEM AUDIT INSPECTION MODAL                          */}
      {/* ========================================================= */}
      {selectedBulkItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-2xl w-full border border-[#E8E9E5] shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E9E5] flex items-center justify-between bg-[#F7F7F4]">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[10px] font-black ${
                    selectedBulkItem.fileType === "pdf"
                      ? "bg-[#FDEAE7] text-[#C0392B]"
                      : "bg-[#E6F2FC] text-[#1764C0]"
                  }`}
                >
                  {selectedBulkItem.fileType.toUpperCase()}
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#101418]">
                    {selectedBulkItem.candidateName || selectedBulkItem.fileName}
                  </h3>
                  <div className="text-[11px] text-[#626971]">
                    {selectedBulkItem.institution || "Unknown Institution"} • {selectedBulkItem.degreeTitle || "Degree"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBulkItem(null)}
                className="w-8 h-8 rounded-full bg-[#E8E9E5] hover:bg-[#D0D3CB] flex items-center justify-center text-[#101418] text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-[13px] max-h-[80vh] overflow-y-auto">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-[12px] border ${
                  selectedBulkItem.verdict === "VALID"
                    ? "bg-[#E8F8E8] border-[#CEF0CE] text-[#159447]"
                    : selectedBulkItem.verdict === "TAMPER_DETECTED"
                    ? "bg-[#FDEAE7] border-[#F9CBC5] text-[#C0392B]"
                    : "bg-[#FFF0DE] border-[#FFE0BA] text-[#B95B12]"
                }`}
              >
                <div className="font-bold text-[14px]">
                  {selectedBulkItem.verdict === "VALID"
                    ? "✓ 100% Cryptographic Integrity — Authentic"
                    : selectedBulkItem.verdict === "TAMPER_DETECTED"
                    ? "⚠ Tamper Alert — Cryptographic Hash Mismatch"
                    : "✕ Credential Revoked by Issuer"}
                </div>
                <div className="text-[12px] opacity-90 mt-1 leading-relaxed">
                  {selectedBulkItem.verdictSummary}
                </div>
              </div>

              {/* Cryptographic Checks */}
              {selectedBulkItem.checks && (
                <div className="space-y-2">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097]">
                    Consensus Validation Checks
                  </div>
                  <div className="rounded-[12px] border border-[#E8E9E5] divide-y divide-[#E8E9E5]">
                    {selectedBulkItem.checks.map((chk, idx) => (
                      <div key={idx} className="p-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#101418]">{chk.name}</div>
                          <div className="text-[11px] text-[#626971]">{chk.detail}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            chk.status === "pass"
                              ? "bg-[#E8F8E8] text-[#159447]"
                              : "bg-[#FDEAE7] text-[#C0392B]"
                          }`}
                        >
                          {chk.status === "pass" ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cryptographic Hashes */}
              <div className="bg-[#F7F7F4] p-4 rounded-[12px] border border-[#E8E9E5] space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-[#8A9097] font-sans font-bold block mb-0.5">
                    File SHA-256 Digest:
                  </span>
                  <span className="text-[#101418] break-all">{selectedBulkItem.fileHash}</span>
                </div>
                {selectedBulkItem.expectedHash && (
                  <div>
                    <span className="text-[#8A9097] font-sans font-bold block mb-0.5">
                      Registry Anchored Hash:
                    </span>
                    <span className="text-[#159447] break-all">
                      {selectedBulkItem.expectedHash}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[#8A9097] font-sans font-bold block mb-0.5">
                    Credential DID:
                  </span>
                  <span className="text-[#1764C0] break-all">
                    {selectedBulkItem.credentialId || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8E9E5] bg-[#F7F7F4] flex justify-end">
              <button
                onClick={() => setSelectedBulkItem(null)}
                className="px-4 py-2 rounded-[10px] bg-[#111410] text-[#BEF52A] text-[12px] font-bold cursor-pointer"
              >
                Close Audit Inspector
              </button>
            </div>
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

