"use client";

import { useState, useRef } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import QRCodeCanvas from "../ui/QRCodeCanvas";
import CertificateCard from "../ui/CertificateCard";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { CopyIcon, CheckCircleIcon, ShieldCheckIcon, ArrowRightIcon } from "../ui/Icons";

export default function StudentPortalScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { credentials, selectedStudentDid, setSelectedStudentDid, updateCredentialImageHash } = useTrustChain();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullscreenPhoto, setShowFullscreenPhoto] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState<"jpg" | "pdf" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"photocopy" | "digital">("photocopy");
  const certRef = useRef<HTMLDivElement>(null);

  // Group credentials by student
  const studentList = Array.from(
    new Set(credentials.map((c) => JSON.stringify({ name: c.subjectName, did: c.subjectId })))
  ).map((str) => JSON.parse(str) as { name: string; did: string });

  const activeStudentCreds = credentials.filter(
    (c) => c.subjectId === selectedStudentDid
  );

  const selectedCert =
    activeStudentCreds[0] ||
    credentials.find((c) => c.subjectName.toLowerCase().includes("bhavik")) ||
    credentials[0];
  const degreePhoto = selectedCert?.documentImage || "/lead_certificate_bg.jpg";

  const verificationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?verify=${selectedCert?.id}`
    : `https://trustchain.network/verify/${selectedCert?.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = async (format: "jpg" | "pdf") => {
    // Ensure photocopy view is active so certRef is mounted
    if (viewMode !== "photocopy") setViewMode("photocopy");
    setDownloading(format);
    setDownloadError(null);

    // Wait for React to render the photocopy view
    await new Promise((r) => setTimeout(r, 150));

    if (!certRef.current) {
      setDownloadError("Certificate element not found in DOM.");
      setDownloading(null);
      return;
    }

    try {
      const { downloadCertificate } = await import("../../lib/downloadCertificate");
      const safeName = `${selectedCert?.subjectName || "certificate"}_${selectedCert?.type || "doc"}`.replace(/[^a-z0-9_\-]/gi, "_");
      await downloadCertificate(
        certRef.current,
        safeName,
        format,
        verificationUrl,
        async (hash) => {
          if (selectedCert?.id) {
            await updateCredentialImageHash(selectedCert.id, hash);
          }
        }
      );
      setShowDownloadModal(false);
    } catch (e: any) {
      console.error("Download failed:", e);
      setDownloadError(e?.message || "Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };


  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full">
              Student / Recipient Portal
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            My Verifiable Documents & Certificates
          </h1>
          <p className="text-[14px] text-[#626971]">
            View original physical degree scans and share cryptographically verifiable documents with recruiters via QR code.
          </p>
        </div>

        {/* Student Switcher */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-[12px] border border-[#E8E9E5]">
          <span className="text-[12px] font-bold text-[#8A9097] px-1">Student:</span>
          <select
            value={selectedStudentDid}
            onChange={(e) => setSelectedStudentDid(e.target.value)}
            className="text-[13px] font-semibold text-[#101418] bg-transparent focus:outline-none cursor-pointer"
          >
            {studentList.map((s) => (
              <option key={s.did} value={s.did}>
                {s.name} ({s.did})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Document Presentation (Photocopy Scan or Digital) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-[10px] border border-[#E8E9E5]">
              <button
                onClick={() => setViewMode("photocopy")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all ${
                  viewMode === "photocopy"
                    ? "bg-[#111410] text-white"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                🖼️ Physical Degree Photocopy
              </button>
              <button
                onClick={() => setViewMode("digital")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all ${
                  viewMode === "digital"
                    ? "bg-[#111410] text-white"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                📄 Digital Credential View
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDownloadModal(true)}
              >
                ⬇ Download
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<span className="w-2 h-2 rounded-full bg-[#BEF52A]" />}
                onClick={() => setShowShareModal(true)}
              >
                Share with Recruiter
              </Button>
            </div>
          </div>

          {selectedCert ? (
            <div>
              {/* PHOTOCOPY SCAN VIEW */}
              {viewMode === "photocopy" && (
                <div className="space-y-4 animate-fade-in">
                  <div ref={certRef}>
                    <CertificateCard
                      cert={{
                        id: selectedCert.id,
                        type: selectedCert.type,
                        subjectName: selectedCert.subjectName,
                        subjectId: selectedCert.subjectId,
                        issuingInstitution: selectedCert.issuingInstitution,
                        issuanceDate: selectedCert.issueDate,
                        status: selectedCert.status as any,
                        documentImage: selectedCert.documentImage,
                        gpa: selectedCert.gpa,
                      }}
                      verificationUrl={verificationUrl}
                      onInspectFull={() => setShowFullscreenPhoto(true)}
                    />
                  </div>
                </div>
              )}

              {/* DIGITAL CARD VIEW */}
              {viewMode === "digital" && (
                <div className="bg-white border-2 border-[#111410] rounded-[20px] p-7 shadow-md relative overflow-hidden space-y-6 animate-fade-in">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-[#BEF52A]" />
                  <div className="flex items-start justify-between border-b border-[#E8E9E5] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[14px] bg-[#EFFBCB] text-[#172000] font-black text-base flex items-center justify-center border border-[#BEF52A]">
                        {selectedCert.issuingInstitution.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[17px] text-[#101418]">
                          {selectedCert.issuingInstitution}
                        </h3>
                        <div className="text-[12px] text-[#626971]">
                          Official Verifiable Credential Record
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={selectedCert.status} />
                  </div>

                  <div className="py-4 text-center space-y-3">
                    <div className="text-[11px] uppercase tracking-widest text-[#8A9097] font-bold">
                      This Certifies That
                    </div>
                    <div className="text-[26px] font-extrabold text-[#101418] underline decoration-[#BEF52A] decoration-4 underline-offset-8">
                      {selectedCert.subjectName}
                    </div>
                    <div className="text-[13px] text-[#626971] pt-1">
                      Has successfully fulfilled all curriculum requirements for
                    </div>
                    <div className="text-[20px] font-bold text-[#101418]">
                      {selectedCert.type}
                    </div>
                    <div className="text-[13px] text-[#159447] font-semibold">
                      Conferred on {selectedCert.issueDate}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[#E8E9E5] flex flex-col sm:flex-row items-center justify-between gap-5 bg-[#F7F7F4] -mx-7 -mb-7 p-6 rounded-b-[18px]">
                    <div className="space-y-1.5 text-[11px] font-mono text-[#626971] min-w-0 flex-1">
                      <div>
                        <span className="text-[#8A9097] font-sans font-bold uppercase tracking-wider block text-[10px]">
                          Credential ID (DID)
                        </span>
                        <span className="text-[#101418] font-bold truncate block">
                          {selectedCert.did || selectedCert.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A9097] font-sans font-bold uppercase tracking-wider block text-[10px]">
                          SHA-256 Digest
                        </span>
                        <span className="text-[#101418] truncate block">
                          {selectedCert.fingerprint}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A9097] font-sans font-bold uppercase tracking-wider block text-[10px]">
                          Blockchain Anchor
                        </span>
                        <span className="text-[#159447] font-bold block">
                          {selectedCert.trustRegistryRef} (Finalized)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <QRCodeCanvas value={verificationUrl} size={110} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9097] mt-1.5">
                        Scan to Verify
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>No credential found for this student.</Card>
          )}
        </div>

        {/* Right Column (5 cols): Share with Recruiter Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-[16px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
              Share with Hiring Recruiter
            </h3>
            <p className="text-[13px] text-[#626971]">
              Send this verified certificate photocopy with QR code to recruiters. They can scan or click the link to confirm authentic signature with zero college database access.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A9097] mb-1">
                  Public Recruiter Verification Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verificationUrl}
                    className="flex-1 h-[40px] px-3 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12px] font-mono text-[#101418] focus:outline-none"
                  />
                  <Button variant="secondary" size="sm" onClick={handleCopyLink}>
                    {copiedLink ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setShowShareModal(true)}
                >
                  Generate Shareable Card with QR Code →
                </Button>
              </div>

              {onNavigate && (
                <div className="pt-1">
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => onNavigate("verify")}
                  >
                    Simulate Recruiter Verification →
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-[15px] font-bold text-[#101418]">
              All My Issued Documents ({activeStudentCreds.length})
            </h3>
            <div className="divide-y divide-[#E8E9E5]">
              {activeStudentCreds.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-[13px]">
                  <div>
                    <div className="font-semibold text-[#101418]">{c.type}</div>
                    <div className="text-[11px] text-[#626971]">{c.issuingInstitution}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {showFullscreenPhoto && (
        <div className="fixed inset-0 bg-[#101418]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-[#159447]" />
                <h3 className="text-[17px] font-bold text-[#101418]">
                  Official University Degree Document Photocopy
                </h3>
              </div>
              <button
                onClick={() => setShowFullscreenPhoto(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative rounded-[16px] overflow-hidden">
              <CertificateCard
                cert={{
                  id: selectedCert.id,
                  type: selectedCert.type,
                  subjectName: selectedCert.subjectName,
                  subjectId: selectedCert.subjectId,
                  issuingInstitution: selectedCert.issuingInstitution,
                  issuanceDate: selectedCert.issueDate,
                  status: selectedCert.status as any,
                  documentImage: selectedCert.documentImage,
                  gpa: selectedCert.gpa,
                }}
                verificationUrl={verificationUrl}
                showInspectButton={false}
              />
            </div>

            {/* Attached Drive Document Box */}
            {selectedCert.documentImage?.includes("drive.google.com") && (() => {
              const driveMatch = selectedCert.documentImage.match(/\/d\/([a-zA-Z0-9_-]+)/);
              const driveId = driveMatch ? driveMatch[1] : null;
              return (
                <div className="bg-[#F7F7F4] border border-[#E8E9E5] rounded-[16px] p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">📁</span>
                      <div>
                        <div className="font-bold text-[14px] text-[#101418]">Original Student Marksheet (Google Drive)</div>
                        <div className="text-[12px] text-[#626971]">Verified physical marksheet uploaded by university issuer</div>
                      </div>
                    </div>
                    <a
                      href={selectedCert.documentImage}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#1B4B8A] hover:bg-[#163c6e] text-white rounded-[10px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      <span>Open on Google Drive ↗</span>
                    </a>
                  </div>
                  {driveId && (
                    <div className="w-full rounded-[12px] overflow-hidden border border-[#D9DCD5] bg-white aspect-[16/10] max-h-[460px]">
                      <iframe
                        src={`https://drive.google.com/file/d/${driveId}/preview`}
                        className="w-full h-full border-0"
                        title="Google Drive Marksheet Preview"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md" onClick={() => setShowFullscreenPhoto(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share with Recruiter Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-[#101418]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[#E8E9E5] text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
              <h3 className="text-[17px] font-bold text-[#101418]">
                Share Certificate with Recruiter
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971]"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[#626971]">
              The recruiter can scan this QR code directly with any camera or verification engine to validate the authentic degree photocopy:
            </p>

            <div className="py-2 flex justify-center">
              <QRCodeCanvas value={verificationUrl} size={180} />
            </div>

            <div className="bg-[#F7F7F4] p-3 rounded-[10px] text-[12px] font-mono break-all text-[#101418]">
              {verificationUrl}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <Button variant="secondary" size="md" onClick={handleCopyLink}>
                {copiedLink ? "Link Copied!" : "Copy Verification URL"}
              </Button>
              <Button variant="primary" size="md" onClick={() => setShowShareModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-[#101418]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-2xl border border-[#E8E9E5] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
              <h3 className="text-[17px] font-bold text-[#101418]">Download Certificate</h3>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971]"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[#626971]">
              Download your certificate with the embedded verification QR code. Send the file to a recruiter — they can verify authenticity without any database access.
            </p>

            <div className="bg-[#F7F7F4] rounded-[12px] p-3 text-[12px] space-y-1">
              <div className="font-bold text-[#101418]">{selectedCert?.subjectName}</div>
              <div className="text-[#626971]">{selectedCert?.type} · {selectedCert?.issuingInstitution}</div>
              <div className="text-[#159447] font-semibold">✔ Cryptographically Signed</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!!downloading}
                onClick={() => handleDownload("jpg")}
                className="flex flex-col items-center gap-2 p-4 rounded-[14px] border-2 border-[#E8E9E5] hover:border-[#111410] hover:bg-[#F7F7F4] transition-all disabled:opacity-50"
              >
                <span className="text-3xl">🖼️</span>
                <span className="text-[13px] font-bold text-[#101418]">
                  {downloading === "jpg" ? "Generating…" : "Download JPG"}
                </span>
                <span className="text-[11px] text-[#8A9097]">Image file</span>
              </button>

              <button
                disabled={!!downloading}
                onClick={() => handleDownload("pdf")}
                className="flex flex-col items-center gap-2 p-4 rounded-[14px] border-2 border-[#E8E9E5] hover:border-[#111410] hover:bg-[#F7F7F4] transition-all disabled:opacity-50"
              >
                <span className="text-3xl">📄</span>
                <span className="text-[13px] font-bold text-[#101418]">
                  {downloading === "pdf" ? "Generating…" : "Download PDF"}
                </span>
                <span className="text-[11px] text-[#8A9097]">PDF document</span>
              </button>
            </div>

            {downloadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3 rounded-[10px]">
                ⚠️ {downloadError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
