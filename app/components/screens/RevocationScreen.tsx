"use client";

import { useState } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import { AlertCircleIcon, CheckCircleIcon, ShieldCheckIcon, ArrowRightIcon } from "../ui/Icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function RevocationScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const { credentials, revokeCredential, auditEvents } = useTrustChain();
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetCredId, setTargetCredId] = useState("");
  const [reason, setReason] = useState("");
  const [revokedSuccess, setRevokedSuccess] = useState(false);

  const activeCredentials = credentials.filter((c) => c.status === "active");
  const revokedCredentials = credentials.filter((c) => c.status === "revoked");

  const handleRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCredId || !reason) return;
    setShowConfirm(true);
  };

  const confirmRevocation = () => {
    const ok = revokeCredential(targetCredId, reason);
    setShowConfirm(false);
    if (ok) {
      setRevokedSuccess(true);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#C0392B] bg-[#FDEAE7] px-2.5 py-0.5 rounded-full">
              Workflow Step 4: Revocation & Status Verification
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Revocation Registry & Status Manager
          </h1>
          <p className="text-[14px] text-[#626971]">
            Revoke institutional records on-chain. Revocations propagate instantaneously to all verifiers through dynamic cryptographic accumulators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#159447] bg-[#E8F8E8] px-3 py-1 rounded-full">
            Accumulator Block: #1,402,881
          </span>
        </div>
      </div>

      {revokedSuccess && (
        <div className="p-5 rounded-[14px] bg-[#E8F8E8] border border-[#CEF0CE] text-[#159447] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-[14px] font-bold">
                Credential {targetCredId} successfully revoked on-chain!
              </span>
              <p className="text-[12px] opacity-90 mt-0.5">
                Revocation accumulator updated. External verifiers will now detect and reject this credential.
              </p>
            </div>
          </div>
          {onNavigate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("verify")}
              className="shrink-0"
            >
              Verify Revoked Status Now →
            </Button>
          )}
        </div>
      )}

      {/* Main Grid: Action Form + Event History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Revoke Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E9E5]">
              <div className="w-8 h-8 rounded-[8px] bg-[#FDEAE7] text-[#C0392B] flex items-center justify-center font-bold">
                <AlertCircleIcon className="w-4 h-4" />
              </div>
              <h3 className="text-[16px] font-bold text-[#101418]">
                Execute On-Chain Revocation
              </h3>
            </div>

            <p className="text-[12px] text-[#626971]">
              Select an active credential below or input an identifier. Revocation is cryptographically irreversible.
            </p>

            <form onSubmit={handleRevoke} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Active Credential Target
                </label>
                <select
                  value={targetCredId}
                  onChange={(e) => setTargetCredId(e.target.value)}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none mb-1.5"
                >
                  <option value="">Select an active credential...</option>
                  {activeCredentials.slice(0, 10).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.type} — {c.subjectName} ({c.id})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  value={targetCredId}
                  onChange={(e) => setTargetCredId(e.target.value)}
                  placeholder="Or enter DID / ID (e.g. did:trust:cred-...)"
                  className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#C0392B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Verified Institutional Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
                >
                  <option value="">Select verified reason...</option>
                  <option value="Academic Misconduct / Honor Violation">Academic Misconduct / Honor Violation</option>
                  <option value="Administrative Re-issuance">Administrative Re-issuance</option>
                  <option value="Licensing Disciplinary Action">Licensing Disciplinary Action</option>
                  <option value="Subject Request / Expiry">Subject Request / Expiry</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="md"
                  type="submit"
                  className="w-full"
                >
                  Authorize Revocation Notice
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Revoked Credentials & Ledger Proofs */}
        <div className="lg:col-span-7">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8E9E5] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#101418]">
                  Revoked Credentials Ledger ({revokedCredentials.length})
                </h3>
                <p className="text-[12px] text-[#626971]">
                  Immutable revocation accumulator entries verified across all network nodes.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E8E9E5]">
              {revokedCredentials.map((rev) => (
                <div key={rev.id} className="p-4 hover:bg-[#F7F7F4] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#101418] text-[14px]">
                      {rev.type}
                    </span>
                    <StatusBadge status="revoked" />
                  </div>
                  <div className="text-[12px] text-[#101418]">
                    Subject: <strong>{rev.subjectName}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-[#8A9097]">
                    {rev.did || rev.id}
                  </div>
                  <div className="text-[12px] text-[#C0392B]">
                    <strong>Reason:</strong> {rev.revocationReason || "Academic Disciplinary Action"}
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A9097] pt-1 border-t border-[#E8E9E5]/60">
                    <span>Issuer: {rev.issuingInstitution}</span>
                    <span>Revoked Date: {rev.revocationDate || rev.issueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[#101418]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[#E8E9E5] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FDEAE7] text-[#C0392B] flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#101418]">
              Confirm Permanent Revocation
            </h3>
            <p className="text-[13px] text-[#626971]">
              Are you sure you want to revoke credential <strong className="font-mono text-[#101418]">{targetCredId}</strong>?
            </p>
            <p className="text-[12px] text-[#C0392B] bg-[#FDEAE7] p-2.5 rounded-[8px]">
              Reason: {reason}
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <Button variant="secondary" size="md" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="md" onClick={confirmRevocation}>
                Confirm & Sign Revocation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
