"use client";

import { useState } from "react";
import { DEMO_INSTITUTIONS, DEMO_ISSUERS, type Institution } from "../../lib/data";
import { SearchIcon, CopyIcon, CheckCircleIcon, ShieldCheckIcon } from "../ui/Icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function InstitutionsScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const [activeTab, setActiveTab] = useState<"directory" | "register" | "issuers">("directory");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Institution | null>(null);

  const filtered = DEMO_INSTITUTIONS.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight">
            Institutions & Issuers
          </h1>
          <p className="text-[14px] text-[#626971]">
            Authorized universities, governing bodies, and cryptographic root authorities.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<span className="w-2 h-2 rounded-full bg-[#BEF52A]" />}
          onClick={() => setActiveTab("register")}
        >
          Register New Institution
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F7F7F4] p-1 rounded-[10px] border border-[#E8E9E5] w-fit">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
            activeTab === "directory"
              ? "bg-white text-[#101418] font-bold shadow-xs"
              : "text-[#626971] hover:text-[#101418]"
          }`}
        >
          Institution Directory ({DEMO_INSTITUTIONS.length})
        </button>
        <button
          onClick={() => setActiveTab("issuers")}
          className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
            activeTab === "issuers"
              ? "bg-white text-[#101418] font-bold shadow-xs"
              : "text-[#626971] hover:text-[#101418]"
          }`}
        >
          Authorized Signers ({DEMO_ISSUERS.length})
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
            activeTab === "register"
              ? "bg-white text-[#101418] font-bold shadow-xs"
              : "text-[#626971] hover:text-[#101418]"
          }`}
        >
          Register Node
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search registered institutions..."
                className="w-full h-[38px] pl-9 pr-3 rounded-[8px] bg-white border border-[#E8E9E5] text-[13px] text-[#101418] focus:outline-none focus:border-[#A9DF16]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((inst) => (
              <Card
                key={inst.id}
                hoverable
                onClick={() => setSelected(inst)}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#EFFBCB] text-[#172000] font-black text-sm flex items-center justify-center">
                      {inst.name.slice(0, 2).toUpperCase()}
                    </div>
                    <StatusBadge status={inst.status} />
                  </div>

                  <h3 className="text-[16px] font-bold text-[#101418]">
                    {inst.name}
                  </h3>
                  <div className="text-[12px] text-[#626971] mt-0.5">{inst.type}</div>

                  <div className="mt-3 p-2 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] font-mono text-[11px] text-[#101418] truncate">
                    {inst.did}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E9E5] flex items-center justify-between text-[12px] text-[#626971]">
                  <span>{inst.issuerCount} Authorized Issuers</span>
                  <span className="font-semibold text-[#101418] hover:text-[#1764C0]">
                    Inspect Node →
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Issuers Management Tab */}
      {activeTab === "issuers" && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8E9E5]">
            <h3 className="text-[16px] font-bold text-[#101418]">
              Authorized Signing Keypairs
            </h3>
            <p className="text-[13px] text-[#626971] mt-0.5">
              Active cryptographic signers delegated by institution councils to sign certificates.
            </p>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F7F7F4] text-[#8A9097] text-[11px] font-bold uppercase tracking-wider border-b border-[#E8E9E5]">
              <tr>
                <th className="py-3 px-5">Institution</th>
                <th className="py-3 px-5">Key Fingerprint</th>
                <th className="py-3 px-5">Authorized Date</th>
                <th className="py-3 px-5">Permissions</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E9E5]">
              {DEMO_ISSUERS.map((iss) => (
                <tr key={iss.id} className="hover:bg-[#F7F7F4]">
                  <td className="py-3.5 px-5 font-semibold text-[#101418]">
                    {iss.institutionName}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[12px] text-[#101418]">
                    {iss.keyFingerprint}
                  </td>
                  <td className="py-3.5 px-5 text-[#626971]">{iss.authorizedDate}</td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded bg-[#F2F3EF] text-[11px] font-medium text-[#626971]">
                      {iss.permissions.join(", ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge status={iss.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Register Institution Tab */}
      {activeTab === "register" && (
        <Card className="max-w-xl mx-auto space-y-5">
          <h2 className="text-[18px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
            Register an Institution on TrustChain
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Institution Name
              </label>
              <input
                type="text"
                placeholder="e.g. Oxford University Council"
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Institution Type
              </label>
              <select className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none">
                <option>Higher Education / University</option>
                <option>Medical Licensing Board</option>
                <option>Government Ministry / Department</option>
                <option>Enterprise Research Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Root Public Key (ED25519)
              </label>
              <input
                type="text"
                placeholder="ed25519:MC4CAQAwBQYDK2VwBCIEII..."
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12px] font-mono text-[#101418] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => setActiveTab("directory")}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={() => setActiveTab("directory")}>
                Submit On-Chain Registration
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
