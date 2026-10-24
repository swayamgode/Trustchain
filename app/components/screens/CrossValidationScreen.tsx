"use client";

import { useState, useEffect } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  CrossValidateIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  NetworkIcon,
  SearchIcon,
  LockIcon,
} from "../ui/Icons";
import {
  type LedgerValidationReport,
  executeLedgerCrossValidation,
  exportLedgerReportAsPdf,
} from "../../lib/ledgerValidation";
import type { Credential } from "../../lib/data";

export default function CrossValidationScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const { credentials, institutions, issuers, auditEvents, activeInstitution } = useTrustChain();

  // Selected College from Registered Institutions
  const [selectedInstId, setSelectedInstId] = useState<string>(
    institutions[0]?.id || "inst-001"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectedInstitution =
    institutions.find((i) => i.id === selectedInstId) || institutions[0];

  // Credentials belonging to the loaded college
  const collegeCredentials = credentials.filter(
    (c) =>
      c.issuerId === selectedInstitution?.id ||
      c.issuingInstitution.toLowerCase() === selectedInstitution?.name.toLowerCase()
  );

  // Active selected credential
  const [activeCredId, setActiveCredId] = useState<string>(
    collegeCredentials[0]?.id || credentials[0]?.id || ""
  );

  // Sync active credential when college changes
  useEffect(() => {
    if (collegeCredentials.length > 0) {
      setActiveCredId(collegeCredentials[0].id);
    } else if (credentials.length > 0) {
      setActiveCredId(credentials[0].id);
    }
  }, [selectedInstId]);

  // Validation report state
  const [report, setReport] = useState<LedgerValidationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  const runValidation = async (credId: string) => {
    if (!credId) return;
    setLoading(true);
    try {
      const targetCred = credentials.find(
        (c) => c.id === credId || c.did === credId || c.txRef === credId
      );
      const res = await executeLedgerCrossValidation(
        targetCred || credId,
        credentials,
        institutions,
        issuers,
        auditEvents
      );
      setReport(res);
    } catch (err) {
      console.error("Ledger cross-validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCredId) {
      runValidation(activeCredId);
    }
  }, [activeCredId]);

  const handleExportPdf = async () => {
    if (!report) return;
    setExportingPdf(true);
    try {
      await exportLedgerReportAsPdf(report);
    } catch (err) {
      console.error("Export PDF failed:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overallStatusStyles = {
    Verified: {
      bg: "bg-[#E8F8E8]",
      border: "border-[#86EFAC]",
      badgeBg: "bg-[#15803D]",
      text: "text-[#15803D]",
      icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
    },
    Failed: {
      bg: "bg-[#FEF2F2]",
      border: "border-[#FCA5A5]",
      badgeBg: "bg-[#DC2626]",
      text: "text-[#DC2626]",
      icon: <AlertCircleIcon className="w-6 h-6 text-white" />,
    },
    Inconclusive: {
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
      badgeBg: "bg-[#D97706]",
      text: "text-[#B45309]",
      icon: <AlertCircleIcon className="w-6 h-6 text-white" />,
    },
  }[report?.overallResult || "Inconclusive"];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-7 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Consortium Ledger Interoperability
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1 flex items-center gap-2.5">
            <CrossValidateIcon className="w-7 h-7 text-[#111410]" />
            <span>Ledger Cross-Validation Center</span>
          </h1>
          <p className="text-[14px] text-[#626971]">
            Cross-validate actual blockchain state, block header continuity, document digests, and multi-node quorum consensus across partner institutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleExportPdf}
            disabled={exportingPdf || !report}
            icon={<span>📄</span>}
            className="font-bold cursor-pointer shadow-xs"
          >
            {exportingPdf ? "Generating..." : "Export Report as PDF"}
          </Button>
        </div>
      </div>

      {/* College Selection Cards */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[#101418]">
              Consortium Institutions & Partner Colleges
            </h2>
            <p className="text-[12px] text-[#626971]">
              Select any registered institution below to load its cryptographic identity and credentials for ledger cross-validation.
            </p>
          </div>

          <div className="relative w-64">
            <SearchIcon className="w-3.5 h-3.5 text-[#8A9097] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search college or type..."
              className="w-full h-[36px] pl-8 pr-3 text-[12px] bg-white border border-[#E8E9E5] rounded-[9px] text-[#101418] placeholder-[#8A9097] focus:outline-none focus:border-[#A9DF16]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredInstitutions.map((inst) => {
            const isSelected = inst.id === selectedInstitution?.id;
            const count = credentials.filter(
              (c) => c.issuerId === inst.id || c.issuingInstitution.toLowerCase() === inst.name.toLowerCase()
            ).length;

            return (
              <div
                key={inst.id}
                onClick={() => setSelectedInstId(inst.id)}
                className={`p-3.5 rounded-[14px] border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#111410] ring-2 ring-[#BEF52A] shadow-xs"
                    : "bg-white border-[#E8E9E5] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-[8px] bg-[#111410] text-[#BEF52A] font-black text-[12px] flex items-center justify-center">
                    {inst.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#111410] text-[#BEF52A]"
                        : "bg-[#F7F7F4] text-[#626971]"
                    }`}
                  >
                    {isSelected ? "Loaded" : "Select"}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-[13px] font-bold text-[#101418] truncate leading-tight">
                    {inst.name}
                  </h3>
                  <div className="text-[11px] text-[#626971] truncate">{inst.type}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#F2F3EF] flex items-center justify-between text-[11px] text-[#8A9097]">
                  <span>{count} Registered Degrees</span>
                  <span className="font-semibold text-[#159447]">• Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loaded College Banner */}
      <div className="bg-gradient-to-r from-[#111410] to-[#1C221A] text-white rounded-[18px] p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#111410] bg-[#BEF52A] px-2 py-0.5 rounded-full">
              Loaded for Cross-Validation
            </span>
            <span className="text-[11px] font-mono text-[#D1D5DB]">
              DID: {selectedInstitution?.did}
            </span>
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-white">
            {selectedInstitution?.name}
          </h2>
          <p className="text-[12px] text-[#A1A1AA]">
            Root Key Fingerprint:{" "}
            <span className="font-mono text-white">
              {(selectedInstitution as any)?.rootKey || "ed25519:consortium-root-key-9b3d"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-[12px] border border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-[8px] bg-[#BEF52A] text-[#111410] font-black text-[12px] flex items-center justify-center">
            MU
          </div>
          <div className="text-left text-[12px]">
            <div className="text-[10px] uppercase font-bold text-[#A1A1AA]">Host Quorum Node</div>
            <div className="font-bold text-white leading-tight">
              {activeInstitution?.name || "Metropolitan University"}
            </div>
          </div>
        </div>
      </div>

      {/* Credential Selector & Re-run Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] block mb-1">
              Select Document / Credential to Cross-Validate on Ledger:
            </label>
            <select
              value={activeCredId}
              onChange={(e) => setActiveCredId(e.target.value)}
              className="w-full h-[40px] px-3 rounded-[9px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-medium text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
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
              className="h-[40px] text-[12.5px] font-bold cursor-pointer"
            >
              {loading ? "Cross-Validating..." : "↻ Re-run Cross-Validation"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="py-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#111410] border-t-[#BEF52A] animate-spin mx-auto" />
          <div className="text-[15px] font-bold text-[#101418]">
            Cross-Validating Against Actual Blockchain Ledger...
          </div>
          <p className="text-[12px] text-[#626971]">
            Recalculating SHA-256 digest, verifying block hash link, and querying 5 consensus node replicas.
          </p>
        </Card>
      )}

      {/* Full Validation Report View */}
      {!loading && report && (
        <div className="space-y-6 animate-fade-in">
          {/* Overall Verdict Banner */}
          <div
            className={`p-5 rounded-[18px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${overallStatusStyles.bg} ${overallStatusStyles.border}`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${overallStatusStyles.badgeBg}`}
              >
                {overallStatusStyles.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white ${overallStatusStyles.badgeBg}`}
                  >
                    {report.overallResult}
                  </span>
                  <span className="text-[11px] font-mono text-[#626971]">
                    Timestamp: {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className={`text-[18px] font-black tracking-tight ${overallStatusStyles.text}`}>
                  {report.overallResult === "Verified"
                    ? "Cryptographic Ledger State Verified"
                    : report.overallResult === "Failed"
                    ? "Ledger Validation Failed — Discrepancy Found"
                    : "Ledger Validation Inconclusive"}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#101418] max-w-3xl opacity-90">
                  {report.summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-end gap-1.5 border-t sm:border-t-0 sm:border-l border-current/20 pt-2 sm:pt-0 sm:pl-4">
              <div className="text-[10px] uppercase font-bold text-[#626971]">Block Anchor</div>
              <div className="text-[14px] font-extrabold text-[#101418]">
                Block #{report.blockDetails.blockNumber}
              </div>
              <div className="text-[11px] font-semibold text-[#159447]">
                {report.blockDetails.confirmations} Confirmations
              </div>
            </div>
          </div>

          {/* Ledger Anchor Metadata Grid */}
          <Card className="p-4 text-[12.5px] space-y-2.5">
            <div className="text-[12px] font-bold text-[#101418] uppercase tracking-wide border-b border-[#E8E9E5] pb-2 flex items-center justify-between">
              <span>Actual Ledger Anchor Metadata</span>
              <span className="text-[#8A9097] text-[11px] font-mono">
                ID: {report.credentialId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[#8A9097] text-[11px] block">Candidate:</span>
                <span className="font-bold text-[#101418]">{report.subjectName}</span>
              </div>
              <div>
                <span className="text-[#8A9097] text-[11px] block">Credential:</span>
                <span className="font-bold text-[#101418] truncate block">
                  {report.documentTitle}
                </span>
              </div>
              <div>
                <span className="text-[#8A9097] text-[11px] block">Issuing Authority:</span>
                <span className="font-bold text-[#101418]">{report.issuingInstitution}</span>
              </div>
              <div>
                <span className="text-[#8A9097] text-[11px] block">Block Hash:</span>
                <span className="font-mono text-[11px] text-[#626971] truncate block">
                  {report.blockDetails.blockHash.slice(0, 18)}...
                </span>
              </div>
            </div>
          </Card>

          {/* Cryptographic Checks Breakdown */}
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8E9E5] flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-[#101418]">
                  Detailed Cryptographic Check Results
                </h4>
                <p className="text-[12px] text-[#626971]">
                  Evaluation of hashes, block header references, signatures, and consensus quorum.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#101418] bg-[#F7F7F4] px-2.5 py-1 rounded-[8px] border border-[#E8E9E5]">
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
                  <div key={chk.id} className="p-4.5 space-y-2.5 hover:bg-[#FAFBF9] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                        >
                          {statusConfig.icon}
                        </span>
                        <span className="text-[14px] font-bold text-[#101418]">
                          {idx + 1}. {chk.name}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] bg-[#F7F7F4] p-3 rounded-[10px] border border-[#E8E9E5]">
                      <div>
                        <span className="text-[#8A9097] font-semibold block text-[11px]">Expected Value:</span>
                        <span className="font-mono text-[#101418] break-all">{chk.expectedValue}</span>
                      </div>
                      <div>
                        <span className="text-[#8A9097] font-semibold block text-[11px]">Actual Value:</span>
                        <span
                          className={`font-mono break-all font-semibold ${
                            chk.status === "pass" ? "text-[#15803D]" : chk.status === "fail" ? "text-[#DC2626]" : "text-[#B45309]"
                          }`}
                        >
                          {chk.actualValue}
                        </span>
                      </div>
                    </div>

                    <div className="text-[12.5px] text-[#626971]">
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
          </Card>

          {/* Multi-Node Replica Consistency Matrix */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E9E5] pb-2.5">
              <div className="flex items-center gap-2">
                <NetworkIcon className="w-4 h-4 text-[#111410]" />
                <h4 className="text-[14px] font-bold text-[#101418]">
                  Multi-Node Authenticated Ledger Replicas
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#159447]">
                Quorum: {report.nodeReplicas.filter((n) => n.status === "synced").length} / {report.nodeReplicas.length} Synced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {report.nodeReplicas.map((node) => {
                const isSynced = node.status === "synced";
                const isInc = node.status === "inconsistent";
                return (
                  <div
                    key={node.nodeId}
                    className={`p-3 rounded-[12px] border text-[12px] space-y-1 ${
                      isSynced
                        ? "bg-[#F7F7F4] border-[#E8E9E5]"
                        : isInc
                        ? "bg-[#FEF2F2] border-[#FCA5A5]"
                        : "bg-[#FFFBEB] border-[#FDE68A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#101418] truncate max-w-[130px]">
                        {node.nodeName}
                      </span>
                      <span
                        className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
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
                    <div className="text-[11px] text-[#626971]">
                      Height: #{node.blockHeight} • Latency: {node.latencyMs}ms
                    </div>
                    <div className="font-mono text-[10.5px] text-[#8A9097] truncate">
                      Hash: {node.recordedHash.slice(0, 18)}...
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
