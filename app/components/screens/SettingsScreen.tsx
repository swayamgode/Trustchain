"use client";

import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

export default function SettingsScreen() {
  return (
    <div className="p-6 md:p-8 max-w-[900px] mx-auto space-y-7 animate-fade-in">
      <div className="pb-4 border-b border-[#E8E9E5]">
        <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight">
          Settings & Institutional Governance
        </h1>
        <p className="text-[14px] text-[#626971]">
          Configure cryptographic root keys, network endpoints, and automated verification rules.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-[16px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
          Active Root Authority
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#EFFBCB] text-[#172000] font-black text-sm flex items-center justify-center">
              MU
            </div>
            <div>
              <div className="font-bold text-[14px] text-[#101418]">
                Metropolitan University
              </div>
              <div className="font-mono text-[12px] text-[#8A9097]">
                did:trust:metropolitan-uni-9942
              </div>
            </div>
          </div>
          <StatusBadge status="verified" label="Authorized Issuer" />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-[16px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
          Cryptographic Configuration
        </h2>
        <div className="space-y-3 text-[13px]">
          <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
            <span className="text-[#626971]">Primary Signature Algorithm:</span>
            <span className="font-mono text-[#101418]">Ed25519Signature2020</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
            <span className="text-[#626971]">Hashing Standard:</span>
            <span className="font-mono text-[#101418]">SHA-256 with Canonical JSON-LD</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
            <span className="text-[#626971]">Trust Registry Network:</span>
            <span className="font-semibold text-[#159447]">TrustChain Mainnet (BFT-128)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#626971]">Revocation Accumulator:</span>
            <span className="font-semibold text-[#101418]">Cryptographic Dynamic Accumulator v2</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="md">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
