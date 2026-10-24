"use client";

import { useState } from "react";
import { DEMO_CREDENTIALS } from "../../lib/data";
import { AlertCircleIcon, CheckCircleIcon, ShieldCheckIcon } from "../ui/Icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

const REVOCATION_EVENTS = [
  {
    id: "rev-001",
    credentialId: "did:trust:cred-2024-MU-11203",
    type: "Internship Certificate",
    issuer: "Metropolitan University Faculty Board",
    reason: "Academic Honor Violation (Ticket #112)",
    date: "2024-10-12",
    txRef: "0x88f2a1b94c3d8271",
  },
  {
    id: "rev-002",
    credentialId: "did:trust:cred-2024-DLA-03321",
    type: "Course Completion Certificate",
    issuer: "Digital Learning Authority",
    reason: "Administrative re-issuance with updated grade record",
    date: "2024-09-28",
    txRef: "0xf3e2d1c0b9a8f7e6",
  },
  {
    id: "rev-003",
    credentialId: "did:trust:cred-2024-WIT-00441",
    type: "Academic Degree B.A.",
    issuer: "Western Institute of Technology",
    reason: "Enrollment criteria discrepancy confirmed by registry",
    date: "2024-09-14",
    txRef: "0xe7d6c5b4a3f2e1d0",
  },
];

export default function RevocationScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetCredId, setTargetCredId] = useState("");
  const [reason, setReason] = useState("");
  const [revokedSuccess, setRevokedSuccess] = useState(false);

  const handleRevoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCredId || !reason) return;
    setShowConfirm(true);
  };

  const confirmRevocation = () => {
    setShowConfirm(false);
    setRevokedSuccess(true);
    setTimeout(() => {
      setRevokedSuccess(false);
      setTargetCredId("");
      setReason("");
    }, 4000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight">
            Revocation Registry & Lifecycle
          </h1>
          <p className="text-[14px] text-[#626971]">
            Cryptographic revocation accumulator management. Revocations propagate instantaneously to all verifying institutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#159447] bg-[#E8F8E8] px-3 py-1 rounded-full">
            Accumulator Block: #1,402,881
          </span>
        </div>
      </div>

      {revokedSuccess && (
        <div className="p-4 rounded-[14px] bg-[#E8F8E8] border border-[#CEF0CE] text-[#159447] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-[14px] font-bold">
              Credential successfully revoked on-chain and added to the cryptographic accumulator.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Action Form + Event History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Revoke Form */}
        <div className="lg:col-span-5">
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
              Revocation is an irreversible cryptographic operation. Once anchored, verifiers worldwide will reject proofs for this credential.
            </p>

            <form onSubmit={handleRevoke} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Credential ID or DID
                </label>
                <input
                  type="text"
                  required
                  value={targetCredId}
                  onChange={(e) => setTargetCredId(e.target.value)}
                  placeholder="e.g. did:trust:cred-2024-MU-00192"
                  className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] font-mono text-[#101418] focus:bg-white focus:outline-none focus:border-[#C0392B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Reason for Revocation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
                >
                  <option value="">Select verified institutional reason...</option>
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

        {/* Revocation Events Log */}
        <div className="lg:col-span-7">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E8E9E5] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#101418]">
                  Historical Revocation Events
                </h3>
                <p className="text-[12px] text-[#626971]">
                  Immutable ledger entries verified by 128 network nodes.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E8E9E5]">
              {REVOCATION_EVENTS.map((rev) => (
                <div key={rev.id} className="p-4 hover:bg-[#F7F7F4] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#101418] text-[14px]">
                      {rev.type}
                    </span>
                    <StatusBadge status="revoked" />
                  </div>
                  <div className="text-[12px] font-mono text-[#8A9097]">
                    {rev.credentialId}
                  </div>
                  <div className="text-[12px] text-[#626971]">
                    <strong>Reason:</strong> {rev.reason}
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8A9097] pt-1 border-t border-[#E8E9E5]/60">
                    <span>Issuer: {rev.issuer}</span>
                    <span>{rev.date}</span>
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
              Are you sure you want to revoke credential <strong className="font-mono text-[#101418]">{targetCredId}</strong>? This action is permanently anchored to the TrustChain network.
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
