"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  type LedgerValidationReport,
  executeLedgerCrossValidation,
  exportLedgerReportAsPdf,
} from "../../lib/ledgerValidation";
import { useTrustChain } from "../../context/TrustChainContext";
import type { Credential } from "../../lib/data";
import { CheckCircleIcon, AlertCircleIcon, ShieldCheckIcon, NetworkIcon } from "./Icons";
import Button from "./Button";

interface LedgerCrossValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCredentialId?: string;
  initialCredential?: Credential;
  uploadedImageHash?: string;
}

export default function LedgerCrossValidationModal({
  isOpen,
  onClose,
  targetCredentialId,
  initialCredential,
  uploadedImageHash,
}: LedgerCrossValidationModalProps) {
  const { credentials, institutions, issuers, auditEvents } = useTrustChain();

  const [mounted, setMounted] = useState(false);
  const [activeCredId, setActiveCredId] = useState<string>(
    targetCredentialId || initialCredential?.id || credentials[0]?.id || "cred-2024-WIT-09182"
  );
  const [report, setReport] = useState<LedgerValidationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update target when prop changes
  useEffect(() => {
    if (targetCredentialId) {
      setActiveCredId(targetCredentialId);
    } else if (initialCredential?.id) {
      setActiveCredId(initialCredential.id);
    }
  }, [targetCredentialId, initialCredential]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Run validation on actual ledger and data
  const runValidation = async (id: string) => {
    setLoading(true);
    try {
      const selectedCred = credentials.find((c) => c.id === id || c.did === id || c.txRef === id);
      const res = await executeLedgerCrossValidation(
        selectedCred || id,
        credentials,
        institutions,
        issuers,
        auditEvents,
        uploadedImageHash
      );
      setReport(res);
    } catch (err) {
      console.error("Actual ledger validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runValidation(activeCredId);
    }
  }, [isOpen, activeCredId]);

  if (!isOpen || !mounted) return null;

  const handleExportPdf = async () => {
    if (!report) return;
    setExportingPdf(true);
    try {
      await exportLedgerReportAsPdf(report);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const overallStatusStyles = {
    Verified: {
      bg: "bg-[#E8F8E8]",
      border: "border-[#86EFAC]",
      badgeBg: "bg-[#15803D]",
      text: "text-[#15803D]",
      icon: <CheckCircleIcon className="w-5 h-5 text-white" />,
    },
    Failed: {
      bg: "bg-[#FEF2F2]",
      border: "border-[#FCA5A5]",
      badgeBg: "bg-[#DC2626]",
      text: "text-[#DC2626]",
      icon: <AlertCircleIcon className="w-5 h-5 text-white" />,
    },
    Inconclusive: {
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
      badgeBg: "bg-[#D97706]",
      text: "text-[#B45309]",
      icon: <AlertCircleIcon className="w-5 h-5 text-white" />,
    },
  }[report?.overallResult || "Inconclusive"];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] border border-[#E8E9E5] shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Fixed at top) */}
        <div className="px-5 py-4 border-b border-[#E8E9E5] flex items-center justify-between bg-gradient-to-r from-[#111410] to-[#1F261D] text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#BEF52A] flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheckIcon className="w-5 h-5 text-[#111410]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-extrabold tracking-tight truncate">
                  Ledger Cross-Validation Report
                </h2>
                <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#BEF52A] shrink-0">
                  Actual Blockchain State
                </span>
              </div>
              <p className="text-[11.5px] text-[#D1D5DB] truncate mt-0.5">
                Authentic SHA-256 recalculation, block continuity verification, and multi-node consensus audit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf || !report}
              className="hidden sm:flex px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 border border-white/15 text-[11.5px] font-bold text-white items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>📄</span>
              <span>{exportingPdf ? "Generating..." : "Export as PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-[13px] font-bold transition-all cursor-pointer"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable with min-h-0 so it never clips) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 bg-[#F7F7F4]">
          {/* Target Credential Selector */}
          <div className="bg-white rounded-[14px] border border-[#E8E9E5] p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] block mb-1">
                  Selected Credential from Actual Ledger:
                </label>
                <select
                  value={activeCredId}
                  onChange={(e) => setActiveCredId(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[9px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12.5px] font-medium text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                >
                  {credentials.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subjectName} — {c.type} ({c.id}) [{c.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:self-end shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => runValidation(activeCredId)}
                  disabled={loading}
                  className="h-[38px] text-[12px] font-bold cursor-pointer"
                >
                  {loading ? "Cross-Validating..." : "↻ Re-run Validation"}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-[#111410] border-t-[#BEF52A] animate-spin mx-auto" />
              <div className="text-[13.5px] font-bold text-[#101418]">
                Cross-Validating Actual Ledger State...
              </div>
              <p className="text-[11.5px] text-[#626971]">
                Recalculating SHA-256 digest, verifying block hash link, and querying 5 consensus node replicas.
              </p>
            </div>
          )}

          {/* Report Content */}
          {!loading && report && (
            <div className="space-y-4">
              {/* Overall Status Banner */}
              <div
                className={`p-4 sm:p-4.5 rounded-[16px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${overallStatusStyles.bg} ${overallStatusStyles.border}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${overallStatusStyles.badgeBg}`}
                  >
                    {overallStatusStyles.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${overallStatusStyles.badgeBg}`}
                      >
                        {report.overallResult}
                      </span>
                      <span className="text-[10.5px] font-mono text-[#626971]">
                        Timestamp: {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className={`text-[15px] font-black tracking-tight ${overallStatusStyles.text}`}>
                      {report.overallResult === "Verified"
                        ? "Cryptographic Ledger State Verified"
                        : report.overallResult === "Failed"
                        ? "Ledger Validation Failed — Discrepancy Found"
                        : "Ledger Validation Inconclusive"}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-[#101418] max-w-2xl opacity-90">
                      {report.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-end gap-1 border-t sm:border-t-0 sm:border-l border-current/20 pt-2 sm:pt-0 sm:pl-3.5">
                  <div className="text-[9.5px] uppercase font-bold text-[#626971]">Block Anchor</div>
                  <div className="text-[12.5px] font-extrabold text-[#101418]">
                    Block #{report.blockDetails.blockNumber}
                  </div>
                  <div className="text-[10.5px] font-semibold text-[#159447]">
                    {report.blockDetails.confirmations} Confirmations
                  </div>
                </div>
              </div>

              {/* Document & Block Anchor Details */}
              <div className="bg-white rounded-[14px] border border-[#E8E9E5] p-3.5 text-[12px] space-y-2 shadow-2xs">
                <div className="text-[11px] font-bold text-[#101418] uppercase tracking-wide border-b border-[#E8E9E5] pb-1.5 flex items-center justify-between">
                  <span>Actual Ledger Anchor Metadata</span>
                  <span className="text-[#8A9097] text-[10.5px] font-mono">
                    ID: {report.credentialId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[#8A9097] text-[10.5px] block">Candidate:</span>
                    <span className="font-bold text-[#101418]">{report.subjectName}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9097] text-[10.5px] block">Credential:</span>
                    <span className="font-bold text-[#101418] truncate block">
                      {report.documentTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A9097] text-[10.5px] block">Issuing Authority:</span>
                    <span className="font-bold text-[#101418]">{report.issuingInstitution}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9097] text-[10.5px] block">Block Hash:</span>
                    <span className="font-mono text-[10.5px] text-[#626971] truncate block">
                      {report.blockDetails.blockHash.slice(0, 18)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Verification Checks List */}
              <div className="bg-white rounded-[14px] border border-[#E8E9E5] overflow-hidden shadow-2xs">
                <div className="p-3.5 border-b border-[#E8E9E5] flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#101418]">
                      Detailed Cryptographic Check Results
                    </h4>
                    <p className="text-[11px] text-[#626971]">
                      Individual validation tests with actual vs. expected values.
                    </p>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#101418] bg-[#F7F7F4] px-2 py-0.5 rounded-[6px] border border-[#E8E9E5]">
                    {report.checks.filter((c) => c.status === "pass").length} / {report.checks.length} Passed
                  </span>
                </div>

                <div className="divide-y divide-[#E8E9E5]">
                  {report.checks.map((chk, idx) => {
                    const statusConfig = {
                      pass: {
                        color: "text-[#15803D]",
                        bg: "bg-[#E8F8E8]",
                        border: "border-[#86EFAC]",
                        label: "Passed",
                        icon: "✓",
                      },
                      fail: {
                        color: "text-[#DC2626]",
                        bg: "bg-[#FEF2F2]",
                        border: "border-[#FCA5A5]",
                        label: "Failed",
                        icon: "✕",
                      },
                      inconclusive: {
                        color: "text-[#B45309]",
                        bg: "bg-[#FFFBEB]",
                        border: "border-[#FDE68A]",
                        label: "Inconclusive",
                        icon: "!",
                      },
                    }[chk.status];

                    return (
                      <div key={chk.id} className="p-3.5 space-y-2 hover:bg-[#FAFBF9] transition-colors">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                            >
                              {statusConfig.icon}
                            </span>
                            <span className="text-[12.5px] font-bold text-[#101418]">
                              {idx + 1}. {chk.name}
                            </span>
                          </div>

                          <span
                            className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Expected vs Actual Table */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#F7F7F4] p-2 rounded-[8px] border border-[#E8E9E5]">
                          <div>
                            <span className="text-[#8A9097] font-semibold block">Expected Value:</span>
                            <span className="font-mono text-[#101418] break-all">{chk.expectedValue}</span>
                          </div>
                          <div>
                            <span className="text-[#8A9097] font-semibold block">Actual Value:</span>
                            <span
                              className={`font-mono break-all font-semibold ${
                                chk.status === "pass" ? "text-[#15803D]" : chk.status === "fail" ? "text-[#DC2626]" : "text-[#B45309]"
                              }`}
                            >
                              {chk.actualValue}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11.5px] text-[#626971]">
                          <span>{chk.explanation}</span>
                          {chk.errorDetail && (
                            <span className="text-[#DC2626] font-semibold block mt-0.5">
                              Diagnostic: {chk.errorDetail}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Node Ledger Replicas Consensus Section */}
              <div className="bg-white rounded-[14px] border border-[#E8E9E5] p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E8E9E5] pb-2">
                  <div className="flex items-center gap-2">
                    <NetworkIcon className="w-3.5 h-3.5 text-[#111410]" />
                    <h4 className="text-[12.5px] font-bold text-[#101418]">
                      Multi-Node Authenticated Ledger Replicas
                    </h4>
                  </div>
                  <span className="text-[10.5px] font-semibold text-[#15803D]">
                    Quorum: {report.nodeReplicas.filter((n) => n.status === "synced").length} / {report.nodeReplicas.length} Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {report.nodeReplicas.map((node) => {
                    const isSynced = node.status === "synced";
                    const isInc = node.status === "inconsistent";
                    return (
                      <div
                        key={node.nodeId}
                        className={`p-2.5 rounded-[10px] border text-[11px] space-y-0.5 ${
                          isSynced
                            ? "bg-[#F7F7F4] border-[#E8E9E5]"
                            : isInc
                            ? "bg-[#FEF2F2] border-[#FCA5A5]"
                            : "bg-[#FFFBEB] border-[#FDE68A]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#101418] truncate max-w-[120px]">
                            {node.nodeName}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              isSynced
                                ? "bg-[#E8F8E8] text-[#159447]"
                                : isInc
                                ? "bg-[#DC2626] text-white"
                                : "bg-[#D97706] text-white"
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#626971]">
                          Height: #{node.blockHeight} • Ping: {node.latencyMs}ms
                        </div>
                        <div className="font-mono text-[9.5px] text-[#8A9097] truncate">
                          Hash: {node.recordedHash.slice(0, 16)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Fixed at bottom) */}
        <div className="px-5 py-3.5 border-t border-[#E8E9E5] flex items-center justify-between bg-white shrink-0">
          <div className="text-[11px] text-[#8A9097] truncate mr-2">
            TrustChain consensus ledger validation engine • Cryptographic zero-trust verification
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPdf}
              disabled={exportingPdf || !report}
              className="text-[11.5px] font-bold cursor-pointer h-[34px] px-3"
            >
              {exportingPdf ? "Exporting..." : "Export as PDF"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="text-[11.5px] font-bold cursor-pointer h-[34px] px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
