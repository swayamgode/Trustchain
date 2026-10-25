"use client";

import { useState } from "react";
import { type Credential } from "../../lib/data";
import { useTrustChain } from "../../context/TrustChainContext";
import { SearchIcon, CopyIcon, ChevronRightIcon, CheckCircleIcon, AlertCircleIcon } from "../ui/Icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function RegistryScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { credentials, activeRole, currentUser } = useTrustChain();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Credential | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentEmail = currentUser?.email?.toLowerCase().trim();
  const currentName = currentUser?.name?.toLowerCase().trim();

  const allCreds = activeRole === "student"
    ? credentials.filter((c) => {
        const credEmail = c.recipientEmail?.toLowerCase().trim();
        if (currentEmail && credEmail && currentEmail === credEmail) return true;
        if (currentName && c.subjectName.toLowerCase().trim() === currentName) return true;
        return false;
      })
    : credentials;
  const filtered = allCreds.filter((c) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && c.status === "active") ||
      (activeTab === "expired" && c.status === "expired") ||
      (activeTab === "revoked" && c.status === "revoked");
    const matchesSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.issuingInstitution.toLowerCase().includes(search.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { key: "all", label: "All Credentials", count: allCreds.length },
    { key: "active", label: "Active", count: allCreds.filter((c) => c.status === "active").length },
    { key: "expired", label: "Expired", count: allCreds.filter((c) => c.status === "expired").length },
    { key: "revoked", label: "Revoked", count: allCreds.filter((c) => c.status === "revoked").length },
  ];

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
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight">
            Credentials Registry
          </h1>
          <p className="text-[14px] text-[#626971]">
            Global tamper-evident repository of institutional credentials and cryptographic claims.
          </p>
        </div>

        {onNavigate && (
          <Button
            variant="primary"
            size="md"
            icon={<span className="w-2 h-2 rounded-full bg-[#BEF52A]" />}
            onClick={() => onNavigate("issue")}
          >
            Issue New Credential
          </Button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Table Area */}
        <div className="flex-1 min-w-0 w-full">
          <Card className="!p-0 overflow-hidden">
            {/* Tabs & Search Header */}
            <div className="p-4 border-b border-[#E8E9E5] flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Tab Pills */}
              <div className="flex items-center gap-1 bg-[#F7F7F4] p-1 rounded-[10px] border border-[#E8E9E5]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-white text-[#101418] font-bold shadow-xs"
                        : "text-[#626971] hover:text-[#101418]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 text-[11px] opacity-70 font-mono">
                      ({tab.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recipient, type, ID..."
                  className="w-full h-[38px] pl-9 pr-3 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F7F7F4] text-[#8A9097] text-[11px] font-bold uppercase tracking-wider border-b border-[#E8E9E5]">
                  <tr>
                    <th className="py-3 px-5">Credential</th>
                    <th className="py-3 px-5">Recipient</th>
                    <th className="py-3 px-5">Issuer</th>
                    <th className="py-3 px-5">Issue Date</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E9E5]">
                  {filtered.map((c) => {
                    const isSelected = selected?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#EFFBCB]/40" : "hover:bg-[#F7F7F4]"
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-[#101418]">{c.type}</div>
                          <div className="text-[11px] font-mono text-[#8A9097] mt-0.5">
                            {c.id}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-[#101418]">
                          {c.subjectName}
                        </td>
                        <td className="py-3.5 px-5 text-[#626971]">
                          {c.issuingInstitution}
                        </td>
                        <td className="py-3.5 px-5 text-[#626971]">{c.issueDate}</td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#E8E9E5] text-[#626971] transition-colors"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Selected Credential Drawer (Right) */}
        {selected && (
          <div className="w-full lg:w-[380px] shrink-0 animate-fade-in">
            <Card className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E9E5]">
                <h3 className="text-[16px] font-bold text-[#101418]">
                  Credential Details
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971]"
                >
                  ✕
                </button>
              </div>

              <div>
                <StatusBadge status={selected.status} />
                <h4 className="text-[17px] font-bold text-[#101418] mt-2">
                  {selected.type}
                </h4>
                <p className="text-[13px] text-[#626971] mt-0.5">
                  Conferred to <strong>{selected.subjectName}</strong>
                </p>
              </div>

              <div className="space-y-2.5 text-[12px] bg-[#F7F7F4] p-3 rounded-[12px] border border-[#E8E9E5]">
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Credential ID:</span>
                  <span className="font-mono text-[#101418]">{selected.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Issuer:</span>
                  <span className="font-semibold text-[#101418] truncate max-w-[180px]">
                    {selected.issuingInstitution}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A9097]">Issue Date:</span>
                  <span className="text-[#101418]">{selected.issueDate}</span>
                </div>
                {selected.revocationReason && (
                  <div className="pt-2 border-t border-[#E8E9E5] text-[#C0392B]">
                    <span className="font-bold">Revocation Notice:</span>{" "}
                    {selected.revocationReason}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] mb-1">
                  SHA-256 Digest
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded-[8px] border border-[#E8E9E5] text-[#101418] break-all flex items-center justify-between">
                  <span className="truncate">{selected.fingerprint}</span>
                  <button
                    onClick={() => handleCopy(selected.fingerprint, "fp")}
                    className="p-1 hover:text-[#1764C0] shrink-0 ml-1"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                {onNavigate && (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => onNavigate("verify")}
                  >
                    Inspect on Verify Screen →
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
