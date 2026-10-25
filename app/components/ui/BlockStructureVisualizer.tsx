"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BlockchainBlock } from "../../lib/data";
import {
  BlocksIcon,
  CopyIcon,
  SearchIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LinkIcon,
} from "./Icons";
import Card from "./Card";

interface BlockStructureVisualizerProps {
  blocks: BlockchainBlock[];
  highlightBlockNumber?: number | null;
  onSelectBlock?: (block: BlockchainBlock) => void;
}

export default function BlockStructureVisualizer({
  blocks,
  highlightBlockNumber,
  onSelectBlock,
}: BlockStructureVisualizerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "fault" | "pending">("all");
  const [selectedInspectBlock, setSelectedInspectBlock] = useState<BlockchainBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = blocks.filter((b) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && b.status === "verified") ||
      (filterStatus === "fault" && b.status === "fault") ||
      (filterStatus === "pending" && b.status === "pending");

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      b.height.toString().includes(term) ||
      b.hash.toLowerCase().includes(term) ||
      b.prevHash.toLowerCase().includes(term) ||
      b.studentName.toLowerCase().includes(term) ||
      b.credentialId.toLowerCase().includes(term) ||
      b.firstCollege.toLowerCase().includes(term) ||
      (b.issueReason && b.issueReason.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-[16px] border border-[#E8E9E5] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Track block by Block #, Hash, Student, or Issue..."
            className="w-full h-[38px] pl-9 pr-3 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] placeholder-[#8A9097] focus:bg-white focus:outline-none focus:border-[#A9DF16] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: `All Blocks (${blocks.length})` },
            { id: "verified", label: `Verified (${blocks.filter((b) => b.status === "verified").length})` },
            { id: "fault", label: `Faults & Alerts (${blocks.filter((b) => b.status === "fault").length})` },
            { id: "pending", label: `Pending (${blocks.filter((b) => b.status === "pending").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                  : "bg-[#F7F7F4] text-[#626971] hover:text-[#101418] hover:bg-[#EFF0EB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Chain Header Info */}
      <div className="flex items-center justify-between px-1 text-[12px] text-[#626971]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#159447] animate-pulse"></span>
          <span className="font-semibold text-[#101418]">Chronological Consensus Chain</span>
          <span>•</span>
          <span>Direction: Genesis (#1402881) ➔ Latest Finalized Height</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
          <span>SHA-256 Block Anchoring</span>
          <span>Ed25519 Consortium Signatures</span>
        </div>
      </div>

      {/* Chained Blocks List */}
      <div className="space-y-4">
        {filteredBlocks.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-[#E8E9E5] p-12 text-center text-[#8A9097] space-y-2">
            <BlocksIcon className="w-8 h-8 mx-auto text-[#D0D3CB]" />
            <div className="text-[14px] font-bold text-[#101418]">No blockchain blocks matched your criteria</div>
            <div className="text-[12px]">Try clearing search or changing the filter options above.</div>
          </div>
        ) : (
          filteredBlocks.map((block, idx) => {
            const isHighlighted = highlightBlockNumber === block.height;
            const isFault = block.status === "fault";
            const isVerified = block.status === "verified";

            return (
              <div key={block.height} className="relative group">
                {/* Visual Chain Connector Line between blocks */}
                {idx < filteredBlocks.length - 1 && (
                  <div className="absolute left-[34px] sm:left-[44px] -bottom-4 w-[3px] h-4 bg-gradient-to-b from-[#111410]/20 to-[#111410]/40 z-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#111410]/60"></span>
                  </div>
                )}

                <div
                  id={`block-${block.height}`}
                  className={`relative z-10 rounded-[18px] border transition-all p-5 sm:p-6 bg-white ${
                    isHighlighted
                      ? "ring-3 ring-[#BEF52A] border-[#111410] shadow-md"
                      : isFault
                      ? "border-[#F9CBC5] bg-gradient-to-r from-white via-white to-[#FDF5F4] hover:border-[#E88]"
                      : isVerified
                      ? "border-[#E8E9E5] hover:border-[#D0D3CB] hover:shadow-xs"
                      : "border-[#FFE5A3] bg-[#FFFCF3]"
                  }`}
                >
                  {/* Top Bar: Block Number, Status Pill, Validator, Timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E9E5]">
                    <div className="flex items-center gap-3">
                      {/* Block Height Emblem */}
                      <div
                        className={`w-11 h-11 rounded-[12px] flex flex-col items-center justify-center shrink-0 font-mono font-black shadow-xs ${
                          isFault
                            ? "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]"
                            : isVerified
                            ? "bg-[#111410] text-[#BEF52A]"
                            : "bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]"
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-tighter opacity-70">BLK</span>
                        <span className="text-[12px] leading-tight">#{block.height.toString().slice(-4)}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-[16px] text-[#101418] tracking-tight">
                            Block #{block.height.toLocaleString()}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isFault
                                ? "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]"
                                : isVerified
                                ? "bg-[#E8F8E8] text-[#159447] border border-[#CEF0CE]"
                                : "bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]"
                            }`}
                          >
                            {isFault ? (
                              <>
                                <AlertCircleIcon className="w-3 h-3" />
                                <span>Fault / Issue Flagged</span>
                              </>
                            ) : isVerified ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>Verified & Issued</span>
                              </>
                            ) : (
                              <span>Pending Verification</span>
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#626971] flex items-center gap-2 mt-0.5 font-mono">
                          <span>Validated by: <strong>{block.validatorNode}</strong></span>
                          <span>•</span>
                          <span>{block.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Inspect Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInspectBlock(block)}
                        className="px-3 py-1.5 rounded-[9px] bg-[#F7F7F4] hover:bg-[#111410] hover:text-white text-[#101418] text-[12px] font-bold border border-[#E8E9E5] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <BlocksIcon className="w-3.5 h-3.5" />
                        <span>Inspect Raw Block</span>
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Linkage Hashes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 bg-[#F7F7F4] p-3 rounded-[12px] border border-[#E8E9E5]/80 font-mono text-[11px]">
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <div className="min-w-0">
                        <span className="text-[#8A9097] text-[10px] uppercase font-bold tracking-wider block">
                          Current Block Hash
                        </span>
                        <span className="text-[#101418] font-bold truncate block" title={block.hash}>
                          {block.hash.slice(0, 18)}...{block.hash.slice(-10)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(block.hash, `curr-${block.height}`)}
                        className="p-1 hover:text-[#1764C0] text-[#8A9097] shrink-0"
                        title="Copy Block Hash"
                      >
                        <CopyIcon className="w-3 h-3" />
                        {copiedHash === `curr-${block.height}` && (
                          <span className="text-[9px] text-[#159447] font-sans font-bold ml-1">Copied</span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <div className="min-w-0">
                        <span className="text-[#8A9097] text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>Previous Block Hash (Chain Link)</span>
                        </span>
                        <span className="text-[#626971] truncate block" title={block.prevHash}>
                          {block.prevHash.slice(0, 18)}...{block.prevHash.slice(-10)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(block.prevHash, `prev-${block.height}`)}
                        className="p-1 hover:text-[#1764C0] text-[#8A9097] shrink-0"
                        title="Copy Previous Block Hash"
                      >
                        <CopyIcon className="w-3 h-3" />
                        {copiedHash === `prev-${block.height}` && (
                          <span className="text-[9px] text-[#159447] font-sans font-bold ml-1">Copied</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Transaction / Academic Data Payload */}
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                      <div>
                        <span className="text-[#8A9097] block text-[10.5px] uppercase font-bold tracking-wider">
                          Candidate / Student
                        </span>
                        <span className="font-bold text-[#101418] text-[13px]">{block.studentName}</span>
                      </div>
                      <div>
                        <span className="text-[#8A9097] block text-[10.5px] uppercase font-bold tracking-wider">
                          Origin College (First College)
                        </span>
                        <span className="font-bold text-[#101418]">{block.firstCollege}</span>
                      </div>
                      <div>
                        <span className="text-[#8A9097] block text-[10.5px] uppercase font-bold tracking-wider">
                          Credential DID / ID
                        </span>
                        <span className="font-mono text-[#1764C0] font-semibold truncate block">
                          {block.credentialId}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Issue / Fault Reason Banner if Fault */}
                    {block.issueReason && (
                      <div className="p-3.5 rounded-[12px] bg-[#FDEAE7] border border-[#F9CBC5] text-[#C0392B] space-y-1 animate-fade-in">
                        <div className="flex items-center gap-1.5 font-extrabold text-[12px] uppercase tracking-wide">
                          <AlertCircleIcon className="w-4 h-4 shrink-0 text-[#C0392B]" />
                          <span>Reported Issue / Fault Reason on Blockchain Ledger:</span>
                        </div>
                        <p className="text-[12.5px] font-semibold leading-relaxed pl-5 text-[#8A1A10]">
                          "{block.issueReason}"
                        </p>
                      </div>
                    )}

                    {/* Consortium Peer Endorsements Grid */}
                    <div className="pt-2 border-t border-[#E8E9E5]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                        Consortium College Endorsements:
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {/* First College Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-bold ${
                            block.firstCollegeStatus === "verified_and_issued"
                              ? "bg-[#E8F8E8] text-[#159447] border border-[#CEF0CE]"
                              : block.firstCollegeStatus === "fault"
                              ? "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]"
                              : "bg-[#F7F7F4] text-[#626971] border border-[#E8E9E5]"
                          }`}
                        >
                          <span className="opacity-70 text-[9px] uppercase font-mono">1st College:</span>
                          <span>{block.firstCollege.split(" ")[0]}</span>
                          <span>
                            {block.firstCollegeStatus === "verified_and_issued" ? "✓" : block.firstCollegeStatus === "fault" ? "✕" : "⏳"}
                          </span>
                        </span>

                        {/* Peer College Badges */}
                        {block.peerEndorsements?.map((peer, pIdx) => (
                          <span
                            key={pIdx}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-bold ${
                              peer.status === "verified"
                                ? "bg-[#E8F8E8] text-[#159447] border border-[#CEF0CE]"
                                : peer.status === "fault"
                                ? "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]"
                                : "bg-[#F7F7F4] text-[#8A9097] border border-[#E8E9E5]"
                            }`}
                            title={peer.reason ? `Fault Reason: ${peer.reason}` : `Endorsed by ${peer.collegeName}`}
                          >
                            <span>{peer.collegeName.split(" ")[0]}</span>
                            <span>
                              {peer.status === "verified" ? "✓" : peer.status === "fault" ? "✕" : "⏳"}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Raw Block Inspection Modal */}
      {mounted && selectedInspectBlock && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in"
          onClick={() => setSelectedInspectBlock(null)}
        >
          <div
            className="bg-white rounded-[20px] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-[#E8E9E5]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E9E5] flex items-center justify-between bg-[#F7F7F4] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#111410] text-[#BEF52A] flex items-center justify-center font-bold text-sm">
                  #{selectedInspectBlock.height.toString().slice(-4)}
                </div>
                <div>
                  <h3 className="font-extrabold text-[17px] text-[#101418]">
                    Block #{selectedInspectBlock.height.toLocaleString()} Explorer
                  </h3>
                  <div className="text-[11px] text-[#626971] font-mono">
                    Consensus Timestamp: {selectedInspectBlock.timestamp}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInspectBlock(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#E8E9E5] text-[#101418] font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-[13px] flex-1">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-[14px] border ${
                  selectedInspectBlock.status === "fault"
                    ? "bg-[#FDEAE7] border-[#F9CBC5] text-[#C0392B]"
                    : selectedInspectBlock.status === "verified"
                    ? "bg-[#E8F8E8] border-[#CEF0CE] text-[#159447]"
                    : "bg-[#FFF0DE] border-[#FFE0BA] text-[#B95B12]"
                }`}
              >
                <div className="font-bold text-[14px] flex items-center gap-2">
                  {selectedInspectBlock.status === "fault" ? (
                    <>
                      <AlertCircleIcon className="w-5 h-5" />
                      <span>Ledger Fault Detected — Anchored with Dispute Proof</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Block Finality Confirmed — 100% Cryptographic Integrity</span>
                    </>
                  )}
                </div>
                {selectedInspectBlock.issueReason && (
                  <p className="mt-1 text-[12px] opacity-90 leading-relaxed font-semibold">
                    Issue Reason: "{selectedInspectBlock.issueReason}"
                  </p>
                )}
              </div>

              {/* Block Math Properties */}
              <div className="bg-[#F7F7F4] p-4 rounded-[14px] border border-[#E8E9E5] space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
                  <span className="text-[#8A9097]">Block Height:</span>
                  <span className="font-bold text-[#101418]">{selectedInspectBlock.height}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
                  <span className="text-[#8A9097]">Nonce:</span>
                  <span className="font-bold text-[#101418]">0x{selectedInspectBlock.nonce.toString(16)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
                  <span className="text-[#8A9097]">Validator DID:</span>
                  <span className="font-bold text-[#101418] truncate max-w-[280px]">
                    {selectedInspectBlock.validatorDid}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8E9E5]">
                  <span className="text-[#8A9097]">Validator Signature:</span>
                  <span className="font-bold text-[#1764C0] truncate max-w-[280px]">
                    {selectedInspectBlock.signature}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9097]">Merkle Root:</span>
                  <span className="font-bold text-[#101418] truncate max-w-[280px]">
                    {selectedInspectBlock.merkleRoot}
                  </span>
                </div>
              </div>

              {/* Raw JSON Structure */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                    Raw Cryptographic JSON Payload
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(JSON.stringify(selectedInspectBlock, null, 2), "modal-json")
                    }
                    className="text-[11px] font-semibold text-[#1764C0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CopyIcon className="w-3 h-3" />
                    <span>{copiedHash === "modal-json" ? "Copied JSON" : "Copy Raw JSON"}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-[12px] bg-[#111410] text-[#BEF52A] font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(selectedInspectBlock, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8E9E5] bg-[#F7F7F4] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedInspectBlock(null)}
                className="px-4 py-2 rounded-[10px] bg-[#111410] text-[#BEF52A] text-[12px] font-bold hover:bg-[#282C27] transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
