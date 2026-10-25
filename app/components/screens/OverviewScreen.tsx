"use client";

import { useState } from "react";
import { useTrustChain } from "../../context/TrustChainContext";
import {
  IssueIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckCircleIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  BlocksIcon,
} from "../ui/Icons";
import MetricCard from "../ui/MetricCard";
import StatusBadge from "../ui/StatusBadge";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface OverviewScreenProps {
  onNavigate: (screen: string) => void;
}

export default function OverviewScreen({ onNavigate }: OverviewScreenProps) {
  const { institutions, credentials, auditEvents, activeInstitution, ledgerRecords, blockchainBlocks } = useTrustChain();
  const [copiedDid, setCopiedDid] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  const handleCopyDid = () => {
    navigator.clipboard?.writeText(activeInstitution.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const activeCount = credentials.filter((c) => c.status === "active").length;
  const revokedCount = credentials.filter((c) => c.status === "revoked").length;

  const WORKFLOW_STEPS = [
    {
      step: "1",
      title: "Institution Registration",
      desc: "Register identities & authorized keypairs",
      screen: "institutions",
    },
    {
      step: "2",
      title: "Record Issuance",
      desc: "Cryptographically sign & anchor credentials",
      screen: "issue",
    },
    {
      step: "3",
      title: "Consortium Ledger",
      desc: "Peer validation & visual block tracking",
      screen: "cross-validation",
    },
    {
      step: "4",
      title: "Revocation & Status",
      desc: "On-chain accumulator revocation checks",
      screen: "revocation",
    },
    {
      step: "5",
      title: "Decentralized Auditability",
      desc: "Independent immutable ledger verification",
      screen: "audit",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1520px] mx-auto space-y-7 animate-fade-in">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E9E5]/60">
        <div>
          <div className="text-[13px] font-semibold text-[#626971] tracking-tight">
            Institutional Trust Node • Mainnet
          </div>
          <h1 className="text-[30px] md:text-[34px] font-extrabold text-[#101418] tracking-tight leading-tight mt-0.5">
            {activeInstitution.name}
          </h1>
          <p className="text-[14px] text-[#626971] mt-1">
            Decentralized institutional trust infrastructure & verifiable credential operations center.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate("registry")}
          >
            Credential Registry
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<span className="w-2 h-2 rounded-full bg-[#BEF52A]" />}
            onClick={() => onNavigate("issue")}
          >
            Issue Credential
          </Button>
        </div>
      </div>

      {/* 2. Interactive Protocol Workflow Guide (5 Steps) */}
      <Card className="!p-4 bg-white border border-[#E8E9E5]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#159447] animate-pulse-node" />
            <h2 className="text-[13px] font-bold text-[#101418] uppercase tracking-wider">
              Core Protocol Workflow Tour
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-[#626971]">
            5 Verifiable Stages • Click any stage to test
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {WORKFLOW_STEPS.map((ws) => (
            <div
              key={ws.step}
              onClick={() => onNavigate(ws.screen)}
              className="p-3 rounded-[12px] bg-[#F7F7F4] hover:bg-[#EFFBCB] border border-[#E8E9E5] hover:border-[#BEF52A] cursor-pointer interactive flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="w-5 h-5 rounded-full bg-[#111410] text-white text-[11px] font-bold flex items-center justify-center">
                    {ws.step}
                  </span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-[#8A9097] group-hover:text-[#172000] transition-colors" />
                </div>
                <div className="font-bold text-[13px] text-[#101418] group-hover:text-[#172000] leading-snug">
                  {ws.title}
                </div>
                <p className="text-[11px] text-[#626971] mt-1 leading-normal">
                  {ws.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Primary Actions: Two Large Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Issue Credential Card */}
        <div
          onClick={() => onNavigate("issue")}
          className="group relative bg-[#111410] border border-[#111410] hover:border-[#282C27] rounded-[16px] p-6 text-white cursor-pointer interactive shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF52A]/5 rounded-bl-[100px] pointer-events-none group-hover:bg-[#BEF52A]/10 transition-colors" />

          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[#282C27] border border-[#3A4039] flex items-center justify-center text-[#BEF52A] group-hover:scale-105 transition-transform">
              <IssueIcon className="w-6 h-6 text-[#BEF52A]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#BEF52A] text-[#172000]">
              Workflow 2: Issuance
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-white group-hover:text-[#EFFBCB] transition-colors">
                Issue a Credential
              </h2>
              <div className="w-8 h-8 rounded-full bg-[#282C27] flex items-center justify-center text-white group-hover:bg-[#BEF52A] group-hover:text-[#111410] transition-colors">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[13px] text-[#A6ADB7] mt-1.5 leading-relaxed">
              Cryptographically sign academic degrees, licenses, and certificates with ED25519 signatures anchored to the trust registry.
            </p>
          </div>
        </div>

        {/* Cross-College Consortium Ledger Card */}
        <div
          onClick={() => onNavigate("cross-validation")}
          className="group relative bg-[#111410] border border-[#111410] hover:border-[#282C27] rounded-[16px] p-6 text-white cursor-pointer interactive shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF52A]/5 rounded-bl-[100px] pointer-events-none group-hover:bg-[#BEF52A]/10 transition-colors" />

          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[#282C27] border border-[#3A4039] flex items-center justify-center text-[#BEF52A] group-hover:scale-105 transition-transform">
              <BlocksIcon className="w-6 h-6 text-[#BEF52A]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#BEF52A] text-[#172000]">
              Workflow 3: Consortium Ledger
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-white group-hover:text-[#EFFBCB] transition-colors">
                Cross-College Ledger & Blocks
              </h2>
              <div className="w-8 h-8 rounded-full bg-[#282C27] flex items-center justify-center text-white group-hover:bg-[#BEF52A] group-hover:text-[#111410] transition-colors">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[13px] text-[#A6ADB7] mt-1.5 leading-relaxed">
              Cross-verify across college ledgers: First College verify & fault flags with blockchain reasons, peer endorsements, and visual block tracking.
            </p>
            <div className="mt-4 pt-3 border-t border-[#282C27] flex items-center justify-between text-[11px]">
              <span className="text-[#A6ADB7]">{ledgerRecords?.length || 0} Records</span>
              <span className="font-mono text-[#BEF52A] font-semibold">{blockchainBlocks?.length || 0} Blocks Anchored</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Credentials in Registry"
          value={credentials.length.toLocaleString()}
          trend="+12 issued this week"
          trendPositive={true}
          icon={<IssueIcon className="w-4 h-4" />}
          iconBg="bg-[#EFFBCB]"
          iconColor="text-[#172000]"
        />
        <MetricCard
          label="Registered Institutions"
          value={institutions.length.toString()}
          trend="128 active network nodes"
          trendPositive={true}
          icon={<ShieldCheckIcon className="w-4 h-4" />}
          iconBg="bg-[#E6F2FC]"
          iconColor="text-[#1764C0]"
        />
        <MetricCard
          label="Active Live Credentials"
          value={activeCount.toLocaleString()}
          trend="100% cryptographic integrity"
          trendPositive={true}
          icon={<CheckCircleIcon className="w-4 h-4" />}
          iconBg="bg-[#E8F8E8]"
          iconColor="text-[#159447]"
        />
        <MetricCard
          label="Revoked Credentials"
          value={revokedCount.toString()}
          trend="On-chain accumulator updated"
          trendPositive={false}
          icon={<AlertCircleIcon className="w-4 h-4" />}
          iconBg="bg-[#FFF0DE]"
          iconColor="text-[#B95B12]"
        />
      </div>

      {/* 5. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Recent Audit Activity */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-[#E8E9E5] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#101418] tracking-tight">
                  Decentralized Audit Stream (Workflow 5)
                </h3>
                <p className="text-[13px] text-[#626971] mt-0.5">
                  Live verifiable transaction stream anchored to blockchain blocks.
                </p>
              </div>
              <button
                onClick={() => onNavigate("audit")}
                className="text-[13px] font-semibold text-[#101418] hover:text-[#1764C0] flex items-center gap-1 transition-colors"
              >
                <span>View Full Ledger</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E8E9E5]">
              {auditEvents.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedAudit(act)}
                  className="p-4 md:px-6 hover:bg-[#F7F7F4] cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                        act.outcome === "success"
                          ? "bg-[#E8F8E8] text-[#159447]"
                          : act.outcome === "rejected"
                          ? "bg-[#FDEAE7] text-[#C0392B]"
                          : "bg-[#EFFBCB] text-[#172000]"
                      }`}
                    >
                      {act.outcome === "success" ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <AlertCircleIcon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[#101418] truncate capitalize">
                        {act.type.replace(/_/g, " ")}
                      </div>
                      <div className="text-[12px] text-[#626971] truncate mt-0.5">
                        {act.related}
                      </div>
                      <div className="text-[11px] font-mono text-[#8A9097] truncate mt-0.5">
                        Actor: {act.actor} • Tx: {act.txRef.slice(0, 14)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          act.outcome === "success"
                            ? "bg-[#E8F8E8] text-[#159447]"
                            : "bg-[#FFF0DE] text-[#B95B12]"
                        }`}
                      >
                        {act.outcome.toUpperCase()}
                      </span>
                      <div className="text-[11px] text-[#8A9097] mt-1">
                        {act.timestamp.split(" ")[1] || act.timestamp}
                      </div>
                    </div>
                    <button
                      className="p-1.5 rounded-[8px] hover:bg-[#E8E9E5] text-[#8A9097] hover:text-[#101418] transition-colors"
                      title="Inspect record"
                    >
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Institution Card */}
          <Card>
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[14px] bg-[#EFFBCB] border border-[#BEF52A] flex items-center justify-center text-[#172000] font-black text-lg">
                  {activeInstitution.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101418] leading-tight">
                    {activeInstitution.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status="verified" label="Workflow 1: Registered Node" />
                  </div>
                </div>
              </div>
            </div>

            {/* DID & Copy */}
            <div className="mt-4 p-2.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A9097]">
                  Decentralized Identifier (DID)
                </div>
                <div className="text-[12px] font-mono font-medium text-[#101418] truncate">
                  {activeInstitution.did}
                </div>
              </div>
              <button
                onClick={handleCopyDid}
                className="shrink-0 p-1.5 rounded-[6px] hover:bg-white text-[#626971] hover:text-[#101418] transition-colors flex items-center gap-1 text-[11px] font-semibold border border-transparent hover:border-[#E8E9E5]"
                title="Copy DID"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                <span>{copiedDid ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Key-Value Details */}
            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Institution Type</span>
                <span className="font-semibold text-[#101418]">{activeInstitution.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Authorized Signers</span>
                <span className="font-semibold text-[#101418]">{activeInstitution.issuerCount} Keys</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Registry Status</span>
                <span className="font-semibold text-[#159447]">Anchored on Ledger</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Registration Date</span>
                <span className="font-semibold text-[#101418]">{activeInstitution.registrationDate}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E8E9E5]">
              <button
                onClick={() => onNavigate("institutions")}
                className="w-full text-center text-[13px] font-semibold text-[#101418] hover:text-[#1764C0] transition-colors"
              >
                Manage Institutions & Signers →
              </button>
            </div>
          </Card>

          {/* Pending Actions */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#101418] tracking-tight">
                Pending Actions
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]">
                {revokedCount > 0 ? "Review Required" : "All Clear"}
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate("cross-validation")}
                className="p-3 rounded-[12px] bg-[#F7F7F4] hover:bg-[#F2F3EF] cursor-pointer transition-colors border border-[#E8E9E5] flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#101418]">
                    Workflow 3: Cross-College Consortium Ledger
                  </div>
                  <div className="text-[11px] text-[#626971] mt-0.5">
                    Peer cross-validation & visual blockchain blocks
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-[#8A9097] shrink-0 ml-2" />
              </div>

              <div
                onClick={() => onNavigate("revocation")}
                className="p-3 rounded-[12px] bg-[#F7F7F4] hover:bg-[#F2F3EF] cursor-pointer transition-colors border border-[#E8E9E5] flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#101418]">
                    Workflow 4: Revocation Management
                  </div>
                  <div className="text-[11px] text-[#626971] mt-0.5">
                    Revoke credentials & check accumulator
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-[#8A9097] shrink-0 ml-2" />
              </div>
            </div>
          </Card>

          {/* Network Status */}
          <Card>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#159447] animate-pulse-node" />
                <h3 className="text-[14px] font-bold text-[#101418]">
                  Trust Network: Operational
                </h3>
              </div>
              <StatusBadge status="healthy" label="99.98% Uptime" />
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Connected Institutions</span>
                <span className="font-semibold text-[#101418]">128 validator nodes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Audit Block Finality</span>
                <span className="font-semibold text-[#101418]">Immutable BFT Consensus</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Revocation Latency</span>
                <span className="font-semibold text-[#101418]">Instantaneous Propagation</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-[#101418]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[#E8E9E5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E5]">
              <h3 className="text-[16px] font-bold text-[#101418]">
                Audit Record Proof
              </h3>
              <button
                onClick={() => setSelectedAudit(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-[13px]">
              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Event
                </span>
                <div className="font-semibold text-[#101418] capitalize mt-0.5">
                  {selectedAudit.type.replace(/_/g, " ")}
                </div>
              </div>
              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Details
                </span>
                <div className="text-[#101418] mt-0.5">{selectedAudit.related}</div>
              </div>
              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Transaction Hash
                </span>
                <div className="font-mono text-[12px] bg-[#F7F7F4] p-2 rounded-[8px] border border-[#E8E9E5] text-[#101418] break-all mt-0.5">
                  {selectedAudit.txRef}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E9E5] flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedAudit(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
