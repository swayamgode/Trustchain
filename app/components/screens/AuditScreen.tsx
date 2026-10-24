"use client";

import { useState } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import { SearchIcon, CopyIcon, ShieldCheckIcon, CheckCircleIcon, AlertCircleIcon } from "../ui/Icons";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

const EVENT_TYPES = [
  { key: "all", label: "All Audit Events" },
  { key: "institution_registration", label: "1. Institution Registration" },
  { key: "issuer_authorization", label: "1b. Issuer Authorization" },
  { key: "credential_issuance", label: "2. Record Issuance" },
  { key: "credential_verification", label: "3. Cross-Org Verification" },
  { key: "credential_revocation", label: "4. Revocation Events" },
];

export default function AuditScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { auditEvents } = useTrustChain();
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = auditEvents.filter((e) => {
    const matchesType = filterType === "all" || e.type === filterType;
    const matchesSearch =
      !search ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.related.toLowerCase().includes(search.toLowerCase()) ||
      e.txRef.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full">
              Decentralized Auditability (Workflow Step 5)
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1">
            Blockchain Audit Trail & Ledger
          </h1>
          <p className="text-[14px] text-[#626971]">
            Tamper-evident, cryptographically anchored ledger of all institutional registrations, issuances, cross-org verifications, and revocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="healthy" label="Consensus Finality Confirmed" />
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-[#E8E9E5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-[#F7F7F4] p-1 rounded-[10px] border border-[#E8E9E5]">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
                  filterType === t.key
                    ? "bg-white text-[#101418] font-bold shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by actor, transaction, detail..."
              className="w-full h-[38px] pl-9 pr-3 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F7F4] text-[#8A9097] text-[11px] font-bold uppercase tracking-wider border-b border-[#E8E9E5]">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Event Type</th>
                <th className="py-3 px-5">Actor / Institution DID</th>
                <th className="py-3 px-5">Cryptographic Action</th>
                <th className="py-3 px-5">Tx Hash</th>
                <th className="py-3 px-5">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E9E5]">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#F7F7F4] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[12px] text-[#626971] whitespace-nowrap">
                    {evt.timestamp}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className="font-semibold text-[#101418] capitalize">
                      {evt.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#101418]">
                    <span className="truncate max-w-[180px] inline-block">{evt.actor}</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#101418] font-medium max-w-sm">
                    {evt.related}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#626971]">
                    <div className="flex items-center gap-1.5">
                      <span>{evt.txRef.slice(0, 10)}...</span>
                      <button
                        onClick={() => handleCopy(evt.txRef, evt.id)}
                        className="hover:text-[#1764C0] p-1"
                        title="Copy Tx Hash"
                      >
                        <CopyIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        evt.outcome === "success"
                          ? "bg-[#E8F8E8] text-[#159447]"
                          : evt.outcome === "rejected"
                          ? "bg-[#FFF0DE] text-[#B95B12]"
                          : "bg-[#FDEAE7] text-[#C0392B]"
                      }`}
                    >
                      {evt.outcome.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
