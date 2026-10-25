"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTrustChain } from "../../context/TrustChainContext";
import { ConsortiumLedgerRecord, BlockchainBlock } from "../../lib/data";
import {
  BlocksIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  CopyIcon,
  LinkIcon,
  FilterIcon,
} from "../ui/Icons";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import BlockStructureVisualizer from "../ui/BlockStructureVisualizer";

interface CrossValidationScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function CrossValidationScreen({ onNavigate }: CrossValidationScreenProps) {
  const {
    activeRole,
    currentUser,
    activeInstitution,
    setActiveInstitution,
    institutions,
    ledgerRecords,
    blockchainBlocks,
    updateFirstCollegeStatus,
    peerCrossVerify,
  } = useTrustChain();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Active view: "ledger" (matrix & actions) vs "blocks" (visual block explorer) vs "split"
  const [activeView, setActiveView] = useState<"ledger" | "blocks" | "split">("ledger");

  // Tab filter: "all" | "updated" | "non_updated" | "tampered"
  const [ledgerTab, setLedgerTab] = useState<"all" | "updated" | "non_updated" | "tampered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedBlock, setHighlightedBlock] = useState<number | null>(null);

  // Fault Modal State
  const [faultModalOpen, setFaultModalOpen] = useState(false);
  const [faultRecord, setFaultRecord] = useState<ConsortiumLedgerRecord | null>(null);
  const [faultReason, setFaultReason] = useState("");
  const [isPeerFault, setIsPeerFault] = useState(false);

  // Peer Cross-Verify Modal State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyRecord, setVerifyRecord] = useState<ConsortiumLedgerRecord | null>(null);

  // Track copied text
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Broadcast toast — shown when verify propagates to other ledger copies
  const [broadcastToast, setBroadcastToast] = useState<{
    studentName: string;
    credentialId: string;
    count: number;
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Prevent background window from scrolling when fault modal is open
  useEffect(() => {
    if (faultModalOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const mainEl = document.querySelector("main");
      const prevMainOverflow = mainEl ? mainEl.style.overflow : "";
      if (mainEl) mainEl.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        if (mainEl) mainEl.style.overflow = prevMainOverflow;
      };
    }
  }, [faultModalOpen]);

  // Open Fault modal
  const openFaultModal = (record: ConsortiumLedgerRecord, isPeer: boolean = false) => {
    setFaultRecord(record);
    setIsPeerFault(isPeer);
    setFaultReason(
      isPeer
        ? "Cross-verification mismatch: Document visual SHA-256 does not match consortium anchor block."
        : "Transcript discrepancy: Course credits and GPA mismatch with internal registrar record."
    );
    setFaultModalOpen(true);
  };

  const submitFaultModal = () => {
    if (!faultRecord || !faultReason.trim()) return;

    if (isPeerFault) {
      peerCrossVerify(
        faultRecord.id,
        activeInstitution.id,
        activeInstitution.name,
        "fault",
        faultReason.trim()
      );
    } else {
      updateFirstCollegeStatus(faultRecord.id, "fault", faultReason.trim());
    }

    setFaultModalOpen(false);
    setFaultRecord(null);
    setFaultReason("");
  };

  // Quick Endorse for peer college
  const handlePeerEndorse = (record: ConsortiumLedgerRecord) => {
    peerCrossVerify(
      record.id,
      activeInstitution.id,
      activeInstitution.name,
      "verified"
    );
  };

  // First-college verify: broadcast + toast
  const handleFirstCollegeVerify = (record: ConsortiumLedgerRecord) => {
    // Count sibling ledger records sharing same credentialId (they will be auto-updated)
    const siblingCount = ledgerRecords.filter(
      (r) => r.credentialId === record.credentialId && r.id !== record.id
    ).length;
    updateFirstCollegeStatus(record.id, "verified_and_issued");
    if (siblingCount > 0) {
      setBroadcastToast({ studentName: record.studentName, credentialId: record.credentialId, count: siblingCount });
      setTimeout(() => setBroadcastToast(null), 5000);
    }
  };

  // Switch to block visualizer and scroll to block
  const handleTrackInBlock = (blockNumber: number) => {
    setHighlightedBlock(blockNumber);
    if (activeView === "ledger") {
      setActiveView("blocks");
    }
    setTimeout(() => {
      const el = document.getElementById(`block-${blockNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  // Counts
  const totalCount = ledgerRecords.length;
  const updatedCount = ledgerRecords.filter((r) => r.isUpdated).length;
  const nonUpdatedCount = ledgerRecords.filter((r) => !r.isUpdated).length;
  const tamperedCount = ledgerRecords.filter((r) => r.isTampered).length;

  // Filtered records
  const filteredRecords = ledgerRecords.filter((r) => {
    const matchesTab =
      ledgerTab === "all" ||
      (ledgerTab === "updated" && r.isUpdated) ||
      (ledgerTab === "non_updated" && !r.isUpdated) ||
      (ledgerTab === "tampered" && r.isTampered);

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.studentId.toLowerCase().includes(q) ||
      r.credentialId.toLowerCase().includes(q) ||
      r.firstCollegeName.toLowerCase().includes(q) ||
      r.degreeTitle.toLowerCase().includes(q) ||
      (r.firstCollegeReason && r.firstCollegeReason.toLowerCase().includes(q)) ||
      (r.tamperDetails && r.tamperDetails.toLowerCase().includes(q));

    return matchesTab && matchesQuery;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1450px] mx-auto space-y-7 animate-fade-in">

      {/* Broadcast Toast */}
      {broadcastToast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in max-w-sm w-full">
          <div className="bg-[#111410] border border-[#BEF52A]/40 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#BEF52A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircleIcon className="w-4.5 h-4.5 text-[#BEF52A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">
                Verified &amp; Broadcast Complete
              </p>
              <p className="text-[11px] text-[#8A9097] mt-0.5 leading-relaxed">
                <span className="text-[#BEF52A] font-medium">{broadcastToast.studentName}</span>{" "}
                ({broadcastToast.credentialId}) verified and auto-synced to{" "}
                <span className="text-[#BEF52A] font-bold">{broadcastToast.count}</span> other institution ledger{broadcastToast.count !== 1 ? "s" : ""}.
              </p>
            </div>
            <button
              onClick={() => setBroadcastToast(null)}
              className="text-[#8A9097] hover:text-white text-lg leading-none flex-shrink-0"
            >
              Ã—
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#1764C0] bg-[#E6F2FC] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <BlocksIcon className="w-3.5 h-3.5" />
              <span>Decentralized College Consortium Ledger</span>
            </span>
            <span className="text-[11px] font-bold text-[#159447] bg-[#E8F8E8] px-2 py-0.5 rounded-full">
              Multi-Institute Consensus Active
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1.5">
            Cross-College Ledger Validation & Visual Blocks
          </h1>
          <p className="text-[13.5px] text-[#626971] max-w-3xl mt-0.5">
            Cross-verify academic credential ledgers across accredited universities. The First College verifies & issues or flags faults with cryptographic reasons, peer institutes cross-verify on-chain, and all transactions are tracked across visual blockchain blocks.
          </p>
        </div>

        {/* Institution Simulator Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white p-3 rounded-[14px] border border-[#E8E9E5] shadow-2xs">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A9097]">
              Acting Consortium Node:
            </div>
            <select
              value={activeInstitution.id}
              onChange={(e) => {
                const found = institutions.find((i) => i.id === e.target.value);
                if (found) setActiveInstitution(found);
              }}
              className="text-[13px] font-bold text-[#101418] bg-[#F7F7F4] border border-[#E8E9E5] rounded-[8px] px-2.5 py-1 mt-0.5 focus:outline-none focus:border-[#A9DF16] cursor-pointer"
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block w-[1px] h-8 bg-[#E8E9E5]"></div>
          <div className="text-[11px] font-medium text-[#626971]">
            <span className="font-bold text-[#101418]">Node DID:</span>
            <div className="font-mono text-[10px] text-[#8A9097] max-w-[130px] truncate">
              {activeInstitution.did}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Consortium Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-[16px] border border-[#E8E9E5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">Total Ledgers</div>
          <div className="text-[26px] font-extrabold text-[#101418] mt-1">{totalCount}</div>
          <div className="text-[11px] text-[#626971] mt-0.5">Enrolled consortium records</div>
        </div>

        <div className="bg-white p-4.5 rounded-[16px] border border-[#CEF0CE] bg-gradient-to-br from-white to-[#F0FAF0] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#159447] flex items-center justify-between">
            <span>Updated Ledgers</span>
            <CheckCircleIcon className="w-4 h-4 text-[#159447]" />
          </div>
          <div className="text-[26px] font-extrabold text-[#159447] mt-1">{updatedCount}</div>
          <div className="text-[11px] text-[#159447]/80 mt-0.5">Verified / issued on blockchain</div>
        </div>

        <div className="bg-white p-4.5 rounded-[16px] border border-[#FFE0BA] bg-gradient-to-br from-white to-[#FFFBF5] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#B95B12] flex items-center justify-between">
            <span>Non-Updated / Pending</span>
            <span className="w-2 h-2 rounded-full bg-[#B95B12] animate-pulse"></span>
          </div>
          <div className="text-[26px] font-extrabold text-[#B95B12] mt-1">{nonUpdatedCount}</div>
          <div className="text-[11px] text-[#B95B12]/80 mt-0.5">Awaiting 1st college or peer vote</div>
        </div>

        <div className="bg-white p-4.5 rounded-[16px] border border-[#F9CBC5] bg-gradient-to-br from-white to-[#FDF5F4] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C0392B] flex items-center justify-between">
            <span>Tamper & Fault Alerts</span>
            <AlertCircleIcon className="w-4 h-4 text-[#C0392B]" />
          </div>
          <div className="text-[26px] font-extrabold text-[#C0392B] mt-1">{tamperedCount}</div>
          <div className="text-[11px] text-[#C0392B]/80 mt-0.5">Anchored with reason proof</div>
        </div>
      </div>

      {/* 3. Main Navigation Toggle (Ledger View vs Visual Block Structure vs Split) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-[14px] border border-[#E8E9E5] shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView("ledger")}
            className={`px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === "ledger"
                ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                : "text-[#626971] hover:text-[#101418] hover:bg-[#F2F3EF]"
            }`}
          >
            <span>📋</span>
            <span>Consortium Ledger Matrix</span>
          </button>

          <button
            onClick={() => setActiveView("blocks")}
            className={`px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === "blocks"
                ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                : "text-[#626971] hover:text-[#101418] hover:bg-[#F2F3EF]"
            }`}
          >
            <BlocksIcon className="w-4 h-4" />
            <span>Visual Blockchain Structure ({blockchainBlocks.length} Blocks)</span>
          </button>

          <button
            onClick={() => setActiveView("split")}
            className={`hidden md:flex px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all items-center gap-2 cursor-pointer ${
              activeView === "split"
                ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                : "text-[#626971] hover:text-[#101418] hover:bg-[#F2F3EF]"
            }`}
          >
            <span>⚡</span>
            <span>Split View</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-[#8A9097] px-3">
          Synchronized across <strong className="text-[#101418]">{institutions.length} Consortium Colleges</strong>
        </div>
      </div>

      {/* 4. Ledger Content (Shown when view is "ledger" or "split") */}
      {(activeView === "ledger" || activeView === "split") && (
        <div className="space-y-4">
          {/* Sub-Tabs: All, Updated, Non-Updated, Tampered */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-[16px] border border-[#E8E9E5] shadow-xs">
            <div className="flex flex-wrap gap-1 bg-[#F7F7F4] p-1 rounded-[10px] border border-[#E8E9E5]">
              <button
                onClick={() => setLedgerTab("all")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  ledgerTab === "all"
                    ? "bg-white text-[#101418] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                All Ledgers ({totalCount})
              </button>

              <button
                onClick={() => setLedgerTab("updated")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  ledgerTab === "updated"
                    ? "bg-[#E8F8E8] text-[#159447] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                Updated Ledgers ({updatedCount})
              </button>

              <button
                onClick={() => setLedgerTab("non_updated")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  ledgerTab === "non_updated"
                    ? "bg-[#FFF0DE] text-[#B95B12] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                Non-Updated / Pending ({nonUpdatedCount})
              </button>

              <button
                onClick={() => setLedgerTab("tampered")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  ledgerTab === "tampered"
                    ? "bg-[#FDEAE7] text-[#C0392B] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                Tamper / Fault Alerts ({tamperedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, DID, college, or issue..."
                className="w-full h-[36px] pl-9 pr-3 rounded-[9px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12.5px] text-[#101418] placeholder-[#8A9097] focus:bg-white focus:outline-none focus:border-[#A9DF16] transition-all"
              />
            </div>
          </div>

          {/* Ledger Records Cards */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-[16px] border border-[#E8E9E5] p-12 text-center text-[#8A9097] space-y-2">
                <div className="text-3xl">ðŸ”</div>
                <div className="text-[14px] font-bold text-[#101418]">No ledger records found</div>
                <div className="text-[12px]">Try selecting a different tab or clearing your search.</div>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const isFirstCollege =
                  activeInstitution.name.toLowerCase() === record.firstCollegeName.toLowerCase() ||
                  activeInstitution.id === record.firstCollegeId;

                const peerVoteOfCurrent = record.peerValidations.find(
                  (p) =>
                    p.collegeName.toLowerCase() === activeInstitution.name.toLowerCase() ||
                    p.collegeId === activeInstitution.id
                );

                return (
                  <Card
                    key={record.id}
                    className={`space-y-4 border transition-all ${
                      record.isTampered
                        ? "border-[#F9CBC5] bg-gradient-to-r from-white via-white to-[#FDF5F4]"
                        : record.isUpdated
                        ? "border-[#E8E9E5] hover:border-[#D0D3CB]"
                        : "border-[#FFE5A3] bg-[#FFFCF6]"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E9E5]">
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-sm shrink-0 ${
                            record.isTampered
                              ? "bg-[#FDEAE7] text-[#C0392B]"
                              : record.isUpdated
                              ? "bg-[#E8F8E8] text-[#159447]"
                              : "bg-[#FFF0DE] text-[#B95B12]"
                          }`}
                        >
                          {record.isTampered ? "⚠️" : record.isUpdated ? "✓" : "⏳"}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[16px] font-bold text-[#101418] tracking-tight">
                              {record.studentName}
                            </h2>
                            <span className="text-[11px] font-mono text-[#626971] bg-[#F2F3EF] px-2 py-0.5 rounded-[6px]">
                              {record.studentId}
                            </span>
                            <span
                              className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                record.isTampered
                                  ? "bg-[#FDEAE7] text-[#C0392B]"
                                  : record.isUpdated
                                  ? "bg-[#E8F8E8] text-[#159447]"
                                  : "bg-[#FFF0DE] text-[#B95B12]"
                              }`}
                            >
                              {record.isTampered
                                ? "Fault Flagged"
                                : record.isUpdated
                                ? "Updated Ledger"
                                : "Non-Updated (Pending)"}
                            </span>
                          </div>

                          <div className="text-[12px] text-[#626971] mt-0.5">
                            <strong>{record.degreeTitle}</strong> • {record.department} (GPA: {record.gpa})
                          </div>
                        </div>
                      </div>

                      {/* Right: Block Anchor link & copy button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTrackInBlock(record.blockNumber)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#111410] text-[#BEF52A] text-[11px] font-bold hover:bg-[#282C27] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <BlocksIcon className="w-3.5 h-3.5" />
                          <span>Track Block #{record.blockNumber.toLocaleString()} →</span>
                        </button>
                      </div>
                    </div>

                    {/* Prominent Tamper / Issue Alert Box */}
                    {record.isTampered && (
                      <div className="p-3.5 rounded-[12px] bg-[#FDEAE7] border border-[#F9CBC5] text-[#C0392B] space-y-1">
                        <div className="flex items-center gap-2 font-bold text-[12.5px]">
                          <AlertCircleIcon className="w-4 h-4 text-[#C0392B] shrink-0" />
                          <span>Consortium Discrepancy & Reason for Issue:</span>
                        </div>
                        <p className="text-[12px] leading-relaxed font-semibold pl-6 text-[#8A1A10]">
                          "{record.firstCollegeReason || record.tamperDetails || "Discrepancy reported during peer cross-validation."}"
                        </p>
                      </div>
                    )}

                    {/* Dual Action Section: First College Action vs Other Colleges Peer Validation */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                      {/* Left: First College Column */}
                      <div className="lg:col-span-6 bg-[#F7F7F4] p-4 rounded-[14px] border border-[#E8E9E5] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                              1. Origin College (First College)
                            </span>
                            {isFirstCollege && (
                              <span className="text-[9.5px] font-extrabold text-[#172000] bg-[#BEF52A] px-2 py-0.5 rounded-full">
                                You are 1st College
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] font-bold text-[#101418]">
                            {record.firstCollegeName}
                          </span>
                        </div>

                        {/* Current Status Badge for First College */}
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className="text-[#626971]">Registered Disposition:</span>
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase ${
                              record.firstCollegeStatus === "verified_and_issued"
                                ? "bg-[#E8F8E8] text-[#159447]"
                                : record.firstCollegeStatus === "fault"
                                ? "bg-[#FDEAE7] text-[#C0392B]"
                                : "bg-[#FFF0DE] text-[#B95B12]"
                            }`}
                          >
                            {record.firstCollegeStatus === "verified_and_issued"
                              ? "Verified & Issued ✓"
                              : record.firstCollegeStatus === "fault"
                              ? "Fault / Rejected ✕"
                              : "Not Verified ⏳"}
                          </span>
                          {record.firstCollegeTimestamp && (
                            <span className="text-[10px] text-[#8A9097] font-mono">
                              ({record.firstCollegeTimestamp.slice(0, 10)})
                            </span>
                          )}
                        </div>

                        {/* First College 3 Action Buttons (as requested by user!) */}
                        <div className="pt-2 border-t border-[#E8E9E5]/70">
                          <div className="text-[11px] text-[#626971] mb-2 font-medium">
                            {isFirstCollege
                              ? "As the First College, select this student's ledger disposition:"
                              : `Actions restricted to First College (${record.firstCollegeName}). Switch to this node in top dropdown to test.`}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {/* Option 1: Not Verified */}
                            <button
                              disabled={!isFirstCollege}
                              onClick={() => updateFirstCollegeStatus(record.id, "not_verified")}
                              className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all border cursor-pointer ${
                                record.firstCollegeStatus === "not_verified"
                                  ? "bg-white border-[#111410] text-[#101418] font-bold shadow-xs"
                                  : "bg-[#F0F1ED] border-[#E8E9E5] text-[#626971] hover:text-[#101418] hover:bg-white"
                              } ${!isFirstCollege ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              ⚪ Not Verified
                            </button>

                            {/* Option 2: Verify & Issue */}
                            <button
                              disabled={!isFirstCollege}
                              onClick={() => handleFirstCollegeVerify(record)}
                              className={`px-3.5 py-1.5 rounded-[9px] text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                record.firstCollegeStatus === "verified_and_issued"
                                  ? "bg-[#159447] text-white ring-2 ring-[#CEF0CE]"
                                  : "bg-[#E8F8E8] text-[#159447] hover:bg-[#159447] hover:text-white border border-[#CEF0CE]"
                              } ${!isFirstCollege ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Verify & Issue</span>
                            </button>

                            {/* Option 3: Fault (Opens reason prompt) */}
                            <button
                              disabled={!isFirstCollege}
                              onClick={() => openFaultModal(record, false)}
                              className={`px-3.5 py-1.5 rounded-[9px] text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                record.firstCollegeStatus === "fault"
                                  ? "bg-[#C0392B] text-white ring-2 ring-[#F9CBC5]"
                                  : "bg-[#FDEAE7] text-[#C0392B] hover:bg-[#C0392B] hover:text-white border border-[#F9CBC5]"
                              } ${!isFirstCollege ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <AlertCircleIcon className="w-3.5 h-3.5" />
                              <span>Fault / Issue Detected</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Other Colleges (Peer Cross-Validation) */}
                      <div className="lg:col-span-6 bg-[#F7F7F4] p-4 rounded-[14px] border border-[#E8E9E5] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                            2. Other Consortium Colleges (Peer Cross-Verification)
                          </span>
                          {!isFirstCollege && (
                            <span className="text-[9.5px] font-extrabold text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                              Peer Verifier
                            </span>
                          )}
                        </div>

                        {/* Peer Endorsements List */}
                        <div className="space-y-1.5">
                          {record.peerValidations.map((peer, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-[8px] bg-white border border-[#E8E9E5] text-[12px]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#101418]">{peer.collegeName}</span>
                                {peer.collegeName.toLowerCase() === activeInstitution.name.toLowerCase() && (
                                  <span className="text-[9px] font-bold text-[#159447] bg-[#E8F8E8] px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                                    peer.status === "verified"
                                      ? "bg-[#E8F8E8] text-[#159447]"
                                      : peer.status === "fault"
                                      ? "bg-[#FDEAE7] text-[#C0392B]"
                                      : "bg-[#FFF0DE] text-[#B95B12]"
                                  }`}
                                >
                                  {peer.status === "verified"
                                    ? "Verified ✓"
                                    : peer.status === "fault"
                                    ? "Fault ✕"
                                    : "Pending Review"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Peer Actions if current institution is NOT the first college */}
                        {!isFirstCollege ? (
                          <div className="pt-2 border-t border-[#E8E9E5]/70 flex items-center justify-between">
                            <span className="text-[11px] text-[#626971]">
                              Cross-verify as <strong>{activeInstitution.name}</strong>:
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePeerEndorse(record)}
                                className="px-3 py-1.5 rounded-[8px] bg-[#159447] hover:bg-[#117739] text-white text-[11.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>✓ Endorse Ledger</span>
                              </button>
                              <button
                                onClick={() => openFaultModal(record, true)}
                                className="px-3 py-1.5 rounded-[8px] bg-[#FDEAE7] hover:bg-[#C0392B] hover:text-white text-[#C0392B] text-[11.5px] font-bold border border-[#F9CBC5] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <span>✕ Flag Discrepancy</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#8A9097] italic pt-1">
                            Switch acting college above to submit peer cross-validation endorsements.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cryptographic Footprint Footer */}
                    <div className="pt-2 border-t border-[#E8E9E5]/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8A9097] font-mono gap-2">
                      <div className="flex items-center gap-1.5">
                        <span>Tx Hash:</span>
                        <span className="text-[#101418]">{record.txHash.slice(0, 14)}...</span>
                        <button
                          onClick={() => handleCopy(record.txHash, `tx-${record.id}`)}
                          className="hover:text-[#1764C0]"
                          title="Copy Transaction Hash"
                        >
                          <CopyIcon className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span>Block Height: <strong>#{record.blockNumber.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Updated: {record.updatedAt.slice(0, 16)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Visual Block Structure (Shown when view is "blocks" or "split") */}
      {(activeView === "blocks" || activeView === "split") && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-4 rounded-[14px] border border-[#E8E9E5]">
            <div>
              <h2 className="text-[18px] font-extrabold text-[#101418]">
                Visual Blockchain Structure Explorer
              </h2>
              <p className="text-[12.5px] text-[#626971]">
                Interactive chained block visualization. Track cryptographic hashes, previous block linkages, Merkle roots, and consensus payload data.
              </p>
            </div>
          </div>

          <BlockStructureVisualizer
            blocks={blockchainBlocks}
            highlightBlockNumber={highlightedBlock}
          />
        </div>
      )}

      {/* 6. Fault / Issue Reason Modal — Fixed Header/Footer with Scrollable Content Portaled to Body */}
      {mounted && faultModalOpen && faultRecord && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in"
          onClick={() => setFaultModalOpen(false)}
        >
          <div
            className="bg-white rounded-[20px] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#F9CBC5] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header — Fixed */}
            <div className="p-5 md:px-6 border-b border-[#E8E9E5] flex items-center justify-between bg-[#F7F7F4] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FDEAE7] text-[#C0392B] flex items-center justify-center text-xl shrink-0 font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-extrabold text-[17px] text-[#101418] tracking-tight">
                    Record Issue / Flag Fault on Blockchain
                  </h3>
                  <div className="text-[12px] text-[#626971]">
                    Student: <strong>{faultRecord.studentName}</strong> ({faultRecord.credentialId})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFaultModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#E8E9E5] text-[#101418] font-bold text-sm flex items-center justify-center transition-all cursor-pointer border border-[#E8E9E5]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body — Scrollable within the dialog */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1 text-[13px] overscroll-contain">
              <div className="text-[12.5px] text-[#626971] leading-relaxed bg-[#FDF5F4] p-3 rounded-[10px] border border-[#F9CBC5]">
                Every fault or rejected validation is anchored onto the decentralized blockchain with an explicit cryptographic <strong>Reason for Issue</strong>. This reason will be publicly visible on the consensus ledger to prevent document fraud.
              </div>

              {/* Quick Reason Presets */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] block mb-1.5">
                  Quick Reason Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Transcript GPA discrepancy: Gradebook mismatch with internal registrar record",
                    "Certificate visual SHA-256 mismatch: Modified honors or title text",
                    "Forged registrar signature / Invalid cryptographic key certificate",
                    "Credit hour shortage: Graduation requirements unfulfilled",
                    "Duplicate student enrollment detected across consortium nodes",
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setFaultReason(preset)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-[8px] text-left transition-all cursor-pointer border ${
                        faultReason === preset
                          ? "bg-[#FDEAE7] border-[#C0392B] text-[#C0392B] font-bold"
                          : "bg-[#F7F7F4] hover:bg-[#FDEAE7] hover:text-[#C0392B] text-[#626971] border-[#E8E9E5]"
                      }`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] block mb-1">
                  Reason for Issue (Required for Blockchain Block Anchor):
                </label>
                <textarea
                  value={faultReason}
                  onChange={(e) => setFaultReason(e.target.value)}
                  rows={3}
                  placeholder="Describe the discrepancy, fraudulent marks, or tampering detected..."
                  className="w-full p-3 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12.5px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#C0392B] transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer — Fixed */}
            <div className="p-4 md:px-6 border-t border-[#E8E9E5] bg-[#F7F7F4] flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setFaultModalOpen(false)}
                className="px-4 py-2 rounded-[9px] bg-white border border-[#E8E9E5] hover:bg-[#E8E9E5] text-[#101418] text-[12px] font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFaultModal}
                disabled={!faultReason.trim()}
                className="px-4 py-2 rounded-[9px] bg-[#C0392B] hover:bg-[#a5281b] text-white text-[12px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Commit Fault to Blockchain Block
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


