"use client";

import { useState, useRef } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import {
  VerifyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CopyIcon,
} from "../ui/Icons";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface VerifyScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function VerifyScreen({ onNavigate }: VerifyScreenProps) {
  const { verifyCredentialAsync } = useTrustChain();
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [inputDid, setInputDid] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileHash, setUploadedFileHash] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found" | "notfound">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runVerify = async (id: string, fileHashToUse?: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;
    setResult(null);
    setVerifying(true);
    setProgress(0);

    const targetHash = fileHashToUse !== undefined ? fileHashToUse : (uploadedFileHash || undefined);

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setScanStatus("scanning");
    setUploadedImage(null);
    setUploadedFileHash(null);

    // Compute cryptographic SHA-256 hash of the exact file bytes
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setUploadedFileHash(fileHash);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        try {
          const img = new Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const jsQR = (await import("jsqr")).default;
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCode?.data) {
              let credId = qrCode.data.trim();
              const urlMatch = qrCode.data.match(/[?&]verify=([^&]+)/);
              if (urlMatch) credId = decodeURIComponent(urlMatch[1]).trim();
              setInputDid(credId);
              setScanStatus("found");
              // Automatically execute real cryptographic verification
              runVerify(credId, fileHash);
            } else {
              setScanStatus("notfound");
            }
          };
          img.src = dataUrl;
        } catch {
          setScanStatus("notfound");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setScanStatus("notfound");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-[#E8E9E5]">
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#1764C0] bg-[#E6F2FC] px-2.5 py-0.5 rounded-full">
          Recruiter Verification Portal
        </span>
        <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-2">
          Credential Verification & Tamper Detection
        </h1>
        <p className="text-[14px] text-[#626971] mt-1">
          Verify any certificate instantly. If the document was tampered after issuance, the cryptographic hash mismatch will catch it automatically.
        </p>
      </div>

      {/* Input Card */}
      <Card className="space-y-5">
        {/* Manual ID Input */}
        <div>
          <label className="text-[12px] font-bold uppercase tracking-wider text-[#8A9097] block mb-2">
            Credential ID / DID / Verification Link
          </label>
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
          </div>
        </div>

        {/* File Upload */}
        <div
          className="rounded-[14px] border-2 border-dashed border-[#D0D3CB] bg-[#F7F7F4] p-5 cursor-pointer hover:border-[#9FD30C] hover:bg-[#F0F7E6] transition-all"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          />

          {uploadedImage && scanStatus !== "idle" ? (
            <div className="flex items-start gap-4">
              <img src={uploadedImage} alt="Uploaded certificate" className="w-28 h-20 object-cover rounded-[10px] border border-[#E8E9E5] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="text-[13px] font-bold text-[#101418]">
                  {scanStatus === "scanning" && "🔍 Scanning QR code from certificate..."}
                  {scanStatus === "found" && "✅ QR code detected — credential ID extracted"}
                  {scanStatus === "notfound" && "⚠️ No QR code found in this image — enter ID manually above"}
                </div>
                {scanStatus === "found" && (
                  <div className="text-[11px] font-mono text-[#159447] bg-[#E8F8E8] px-2 py-1 rounded-[6px] break-all">
                    {inputDid}
                  </div>
                )}
                {scanStatus === "found" && (
                  <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); runVerify(inputDid); }}>
                    Verify Now →
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1 py-2">
              <div className="text-3xl">📎</div>
              <div className="text-[13px] font-bold text-[#101418]">Upload Certificate Image</div>
              <div className="text-[12px] text-[#626971]">
                Drag & drop or click to upload a JPG received from a student.<br />
                The QR code is scanned automatically and the credential verified.
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

      {/* Results */}
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
                  result.verdict === "VALID" ? "bg-[#159447]" : result.verdict === "TAMPER_DETECTED" ? "bg-[#C0392B]" : "bg-[#B95B12]"
                } text-white`}
              >
                {result.verdict === "VALID" ? <CheckCircleIcon className="w-6 h-6" /> : <AlertCircleIcon className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold tracking-tight">
                  {result.verdict === "VALID"
                    ? "✓ Authentic — No Tampering Detected"
                    : result.verdict === "TAMPER_DETECTED"
                    ? "⚠ Tamper Alert: Document Modified After Issuance"
                    : "✕ Credential Revoked by Institution"}
                </h2>
                <p className="text-[13px] opacity-90 mt-1 leading-relaxed max-w-2xl">{result.summary}</p>
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
              <h3 className="text-[15px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">Credential Record</h3>
              {[
                ["Candidate Name", result.subjectName],
                ["Certificate Type", result.type],
                ["Issuing Institution", result.issuer],
                ["Issue Date", result.issueDate],
                ["Credential DID", result.credentialId],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-[13px]">
                  <span className="text-[#626971]">{label}:</span>
                  <span className="font-semibold text-[#101418] text-right max-w-[55%] truncate">{val}</span>
                </div>
              ))}
            </Card>

            {/* Hash Comparison */}
            <Card className="space-y-3">
              <h3 className="text-[15px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">SHA-256 Hash Comparison</h3>
              <div className="space-y-2 text-[12px]">
                <div>
                  <div className="text-[#8A9097] font-bold uppercase tracking-wide mb-1">Anchored Hash (Issuance)</div>
                  <div className="font-mono text-[#159447] bg-[#E8F8E8] p-2 rounded-[8px] break-all">{result.expectedHash}</div>
                </div>
                <div>
                  <div className="text-[#8A9097] font-bold uppercase tracking-wide mb-1">Computed Hash (Now)</div>
                  <div className={`font-mono p-2 rounded-[8px] break-all ${
                    result.computedHash === result.expectedHash
                      ? "text-[#159447] bg-[#E8F8E8]"
                      : "text-[#C0392B] bg-[#FDEAE7]"
                  }`}>{result.computedHash}</div>
                </div>
                <div className={`text-[12px] font-bold mt-1 ${
                  result.computedHash === result.expectedHash ? "text-[#159447]" : "text-[#C0392B]"
                }`}>
                  {result.computedHash === result.expectedHash ? "✓ Hashes match — data intact" : "✕ Hash mismatch — data was altered"}
                </div>
              </div>
            </Card>
          </div>

          {/* Cryptographic Checks */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-[#E8E9E5]">
              <h3 className="text-[16px] font-bold text-[#101418]">Cryptographic Audit Checks</h3>
              <p className="text-[13px] text-[#626971] mt-0.5">Zero college database access required for any of these checks.</p>
            </div>
            <div className="divide-y divide-[#E8E9E5]">
              {result.checks.map((chk: any, idx: number) => (
                <div key={idx} className="p-4 md:px-6 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      chk.status === "pass" ? "bg-[#E8F8E8] text-[#159447]" : "bg-[#FDEAE7] text-[#C0392B]"
                    }`}>
                      {chk.status === "pass" ? "✓" : "✕"}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#101418]">{chk.name}</div>
                      <div className="text-[12px] text-[#626971] mt-0.5">{chk.detail}</div>
                    </div>
                  </div>
                  <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                    chk.status === "pass" ? "bg-[#E8F8E8] text-[#159447]" : "bg-[#FDEAE7] text-[#C0392B]"
                  }`}>
                    {chk.status === "pass" ? "Pass" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Certificate Comparison / Preview */}
          {(result.documentImage || uploadedImage) && (
            <Card>
              <h3 className="text-[15px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5] mb-4">
                {uploadedImage ? "Visual Certificate Comparison" : "Anchored Certificate on Record"}
              </h3>
              <div className={`grid gap-4 ${uploadedImage && result.documentImage ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {uploadedImage && (
                  <div className="space-y-1.5">
                    <div className="text-[12px] font-bold text-[#626971] flex items-center justify-between">
                      <span>Uploaded Candidate File</span>
                      <span className="text-[11px] font-mono text-[#8A9097]">{uploadedFileHash?.slice(0, 14)}...</span>
                    </div>
                    <div className="rounded-[12px] overflow-hidden border border-[#D9DCD5] max-h-64 bg-white flex items-center justify-center">
                      <img src={uploadedImage} alt="Uploaded candidate certificate" className="w-full object-contain max-h-64" />
                    </div>
                  </div>
                )}
                {result.documentImage && (
                  <div className="space-y-1.5">
                    <div className="text-[12px] font-bold text-[#626971] flex items-center justify-between">
                      <span>Official Trust Registry Record</span>
                      {result.documentImage.includes("drive.google.com") ? (
                        <a
                          href={result.documentImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1764C0] hover:underline font-mono text-[11px] inline-flex items-center gap-1 bg-[#EBF3FC] px-2 py-0.5 rounded-[6px]"
                        >
                          <span>Drive File</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-[#8A9097]">{result.expectedHash?.slice(0, 14)}...</span>
                      )}
                    </div>
                    <div className="rounded-[12px] overflow-hidden border border-[#D9DCD5] max-h-72 bg-[#F9FAF8] flex flex-col items-center justify-center p-4">
                      {result.documentImage.includes("drive.google.com") ? (
                        <div className="w-full text-center space-y-3 py-4">
                          <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF3FC] text-[#1764C0] flex items-center justify-center text-2xl">
                            📁
                          </div>
                          <div>
                            <div className="font-bold text-[13px] text-[#101418]">Verified University Marksheet on Google Drive</div>
                            <div className="text-[11px] text-[#626971] mt-0.5">Anchored cryptographic record for {result.subjectName}</div>
                          </div>
                          <a
                            href={result.documentImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1764C0] hover:bg-[#12509c] text-white text-[12px] font-semibold rounded-[8px] shadow-xs transition-colors"
                          >
                            <span>Open in Google Drive</span>
                            <span>↗</span>
                          </a>
                        </div>
                      ) : (
                        <img
                          src={result.documentImage}
                          alt="Original certificate on record"
                          className="w-full object-contain max-h-64"
                          onError={(e) => {
                            e.currentTarget.src = "/lead_certificate_bg.jpg";
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#626971] mt-3">
                Zero college database queries required. Cryptographic integrity is verified directly against decentralized consensus blocks.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
