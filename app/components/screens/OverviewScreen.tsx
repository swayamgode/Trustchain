"use client";

import { useState } from "react";
import {
  IssueIcon,
  VerifyIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckCircleIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
} from "../ui/Icons";
import MetricCard from "../ui/MetricCard";
import StatusBadge from "../ui/StatusBadge";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface OverviewScreenProps {
  onNavigate: (screen: string) => void;
}

interface ActivityItem {
  id: string;
  title: string;
  entity: string;
  did: string;
  timestamp: string;
  status: "verified" | "issued" | "under_review" | "revoked" | "onboarded";
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "Bachelor of Computer Science Issued",
    entity: "Recipient: Alex Chen (Student ID: MU-2024-8841)",
    did: "did:trust:cred-2024-MU-00192",
    timestamp: "12 mins ago",
    status: "issued",
  },
  {
    id: "act-2",
    title: "Cross-Institution Verification",
    entity: "Verifier: Stanford Medical Council • MD License",
    did: "did:trust:cred-2024-MU-00812",
    timestamp: "34 mins ago",
    status: "verified",
  },
  {
    id: "act-3",
    title: "Tamper Proof Evaluation",
    entity: "MIT Innovation Labs • Cryptographic Hash Validation",
    did: "did:trust:cred-2023-MIT-7710",
    timestamp: "1 hr ago",
    status: "verified",
  },
  {
    id: "act-4",
    title: "Revocation Registry Update",
    entity: "Faculty Board Action • Ticket #112 Misconduct",
    did: "did:trust:cred-2024-MU-11203",
    timestamp: "3 hrs ago",
    status: "revoked",
  },
  {
    id: "act-5",
    title: "New Institution Node Onboarded",
    entity: "National Research Foundation • Authorized Keypair Anchor",
    did: "did:trust:inst-gov-nrf-01",
    timestamp: "5 hrs ago",
    status: "onboarded",
  },
];

export default function OverviewScreen({ onNavigate }: OverviewScreenProps) {
  const [copiedDid, setCopiedDid] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  const handleCopyDid = () => {
    navigator.clipboard?.writeText("did:trust:metropolitan-uni-9942");
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1520px] mx-auto space-y-7 animate-fade-in">
      {/* 1. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8E9E5]/60">
        <div>
          <div className="text-[13px] font-semibold text-[#626971] tracking-tight">
            Good morning,
          </div>
          <h1 className="text-[30px] md:text-[34px] font-extrabold text-[#101418] tracking-tight leading-tight mt-0.5">
            Metropolitan University
          </h1>
          <p className="text-[14px] text-[#626971] mt-1">
            Institutional trust infrastructure & credential operations command center.
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

      {/* 2. Primary Actions: Two Large Horizontal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Issue Credential Card (Primary CTA) */}
        <div
          onClick={() => onNavigate("issue")}
          className="group relative bg-[#111410] border border-[#111410] hover:border-[#282C27] rounded-[16px] p-6 text-white cursor-pointer interactive shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle lime accent glow corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF52A]/5 rounded-bl-[100px] pointer-events-none group-hover:bg-[#BEF52A]/10 transition-colors" />

          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[#282C27] border border-[#3A4039] flex items-center justify-center text-[#BEF52A] group-hover:scale-105 transition-transform">
              <IssueIcon className="w-6 h-6 text-[#BEF52A]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#BEF52A] text-[#172000]">
              Primary Action
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
            <p className="text-[13px] text-[#A6ADB7] mt-1.5 leading-relaxed max-w-[420px]">
              Cryptographically sign academic degrees, licenses, and certificates with ED25519 signatures anchored to the trust registry.
            </p>
          </div>
        </div>

        {/* Verify Credential Card */}
        <div
          onClick={() => onNavigate("verify")}
          className="group relative bg-white border border-[#E8E9E5] hover:border-[#D9DCD5] rounded-[16px] p-6 text-[#101418] cursor-pointer interactive shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[#F2F3EF] border border-[#E8E9E5] flex items-center justify-center text-[#101418] group-hover:scale-105 transition-transform">
              <VerifyIcon className="w-6 h-6 text-[#101418]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F2F3EF] text-[#626971]">
              Cross-Org Verification
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight text-[#101418] group-hover:text-[#1764C0] transition-colors">
                Verify a Credential
              </h2>
              <div className="w-8 h-8 rounded-full bg-[#F2F3EF] flex items-center justify-center text-[#101418] group-hover:bg-[#111410] group-hover:text-white transition-colors">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[13px] text-[#626971] mt-1.5 leading-relaxed max-w-[420px]">
              Instant multi-step cryptographic verification: evaluate issuer authority, digital signatures, merkle proofs, and real-time revocation status.
            </p>
          </div>
        </div>
      </div>

      {/* 3. KPI Metrics Row (4 Compact Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Credentials Issued"
          value="14,820"
          trend="+12.4% this month"
          trendPositive={true}
          icon={<IssueIcon className="w-4 h-4" />}
          iconBg="bg-[#EFFBCB]"
          iconColor="text-[#172000]"
        />
        <MetricCard
          label="Credentials Verified"
          value="48,290"
          trend="+24.1% this week"
          trendPositive={true}
          icon={<VerifyIcon className="w-4 h-4" />}
          iconBg="bg-[#E6F2FC]"
          iconColor="text-[#1764C0]"
        />
        <MetricCard
          label="Active Credentials"
          value="14,685"
          trend="99.1% integrity rate"
          trendPositive={true}
          icon={<ShieldCheckIcon className="w-4 h-4" />}
          iconBg="bg-[#E8F8E8]"
          iconColor="text-[#159447]"
        />
        <MetricCard
          label="Needs Attention"
          value="3"
          trend="2 pending reviews, 1 revocation"
          trendPositive={false}
          icon={<AlertCircleIcon className="w-4 h-4" />}
          iconBg="bg-[#FFF0DE]"
          iconColor="text-[#B95B12]"
        />
      </div>

      {/* 4. Main Two-Column Layout (2.2fr / 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8.5 cols ≈ 2.2fr): Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="!p-0 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-[#E8E9E5] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#101418] tracking-tight">
                  Recent Activity
                </h3>
                <p className="text-[13px] text-[#626971] mt-0.5">
                  Real-time verifiable credential operations and cryptographic audit events.
                </p>
              </div>
              <button
                onClick={() => onNavigate("registry")}
                className="text-[13px] font-semibold text-[#101418] hover:text-[#1764C0] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Activity Table Rows */}
            <div className="divide-y divide-[#E8E9E5]">
              {RECENT_ACTIVITIES.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className="p-4 md:px-6 hover:bg-[#F7F7F4] cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                        act.status === "verified"
                          ? "bg-[#E8F8E8] text-[#159447]"
                          : act.status === "issued"
                          ? "bg-[#E6F2FC] text-[#1764C0]"
                          : act.status === "revoked"
                          ? "bg-[#FDEAE7] text-[#C0392B]"
                          : "bg-[#EFFBCB] text-[#172000]"
                      }`}
                    >
                      {act.status === "verified" ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : act.status === "revoked" ? (
                        <AlertCircleIcon className="w-4 h-4" />
                      ) : (
                        <IssueIcon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-[#101418] truncate">
                        {act.title}
                      </div>
                      <div className="text-[12px] text-[#626971] truncate mt-0.5">
                        {act.entity}
                      </div>
                      <div className="text-[11px] font-mono text-[#8A9097] truncate mt-0.5">
                        {act.did}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <StatusBadge status={act.status} />
                      <div className="text-[11px] text-[#8A9097] mt-1">
                        {act.timestamp}
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

        {/* Right Rail (4 cols ≈ 1fr): Your Institution, Pending Actions, Network Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Your Institution Card */}
          <Card>
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[14px] bg-[#EFFBCB] border border-[#BEF52A] flex items-center justify-center text-[#172000] font-black text-lg">
                  MU
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101418] leading-tight">
                    Metropolitan University
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status="verified" label="Authorized Issuer" />
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
                  did:trust:metropolitan-uni-9942
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
                <span className="font-semibold text-[#101418]">Higher Education</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Jurisdiction / Location</span>
                <span className="font-semibold text-[#101418]">Boston, MA, USA</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Authorized Signers</span>
                <span className="font-semibold text-[#101418]">8 Authorized Issuers</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Registry Member Since</span>
                <span className="font-semibold text-[#101418]">October 2023</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E8E9E5]">
              <button
                onClick={() => onNavigate("institutions")}
                className="w-full text-center text-[13px] font-semibold text-[#101418] hover:text-[#1764C0] transition-colors"
              >
                Manage Institution Details →
              </button>
            </div>
          </Card>

          {/* 2. Pending Actions Card */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#101418] tracking-tight">
                Pending Actions
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]">
                3 items
              </span>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate("verify")}
                className="p-3 rounded-[12px] bg-[#F7F7F4] hover:bg-[#F2F3EF] cursor-pointer transition-colors border border-[#E8E9E5] flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#101418]">
                    Cross-Org Verification Request
                  </div>
                  <div className="text-[11px] text-[#626971] mt-0.5">
                    Harvard Alliance requested student transcript confirmation
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
                    Revocation Approval Queued
                  </div>
                  <div className="text-[11px] text-[#626971] mt-0.5">
                    Faculty Board flagged credential #MU-11203 for review
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-[#8A9097] shrink-0 ml-2" />
              </div>

              <div
                onClick={() => onNavigate("institutions")}
                className="p-3 rounded-[12px] bg-[#F7F7F4] hover:bg-[#F2F3EF] cursor-pointer transition-colors border border-[#E8E9E5] flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#101418]">
                    Key Rotation Scheduled
                  </div>
                  <div className="text-[11px] text-[#626971] mt-0.5">
                    Primary ED25519 signing key due for 180-day rotation
                  </div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-[#8A9097] shrink-0 ml-2" />
              </div>
            </div>
          </Card>

          {/* 3. Network Status Card */}
          <Card>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#159447] animate-pulse-node" />
                <h3 className="text-[14px] font-bold text-[#101418]">
                  Network Status: Operational
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
                <span className="text-[#626971]">Cryptographic Consensus</span>
                <span className="font-semibold text-[#101418]">Byzantine Fault Tolerant</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Revocation Accumulator</span>
                <span className="font-semibold text-[#101418]">Sync: Block #1,402,881</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Avg Verification Latency</span>
                <span className="font-semibold text-[#101418]">38 ms</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Detail for Selected Activity */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-[#101418]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[#E8E9E5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E9E5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#EFFBCB] text-[#172000] flex items-center justify-center font-bold">
                  MU
                </div>
                <h3 className="text-[16px] font-bold text-[#101418]">
                  Cryptographic Audit Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F2F3EF] flex items-center justify-center text-[#626971]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[13px]">
              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Operation
                </span>
                <div className="font-semibold text-[#101418] text-[15px] mt-0.5">
                  {selectedActivity.title}
                </div>
              </div>

              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Associated Entity
                </span>
                <div className="text-[#101418] mt-0.5">{selectedActivity.entity}</div>
              </div>

              <div>
                <span className="text-[#8A9097] text-[11px] uppercase font-bold tracking-wider">
                  Cryptographic Identifier (DID)
                </span>
                <div className="font-mono text-[12px] bg-[#F7F7F4] p-2 rounded-[8px] border border-[#E8E9E5] text-[#101418] break-all mt-0.5">
                  {selectedActivity.did}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[#626971]">Current Status:</span>
                <StatusBadge status={selectedActivity.status} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E9E5] flex justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedActivity(null);
                  onNavigate("verify");
                }}
              >
                Verify on Trust Registry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
