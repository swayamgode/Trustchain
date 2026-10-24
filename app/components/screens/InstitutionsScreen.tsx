"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTrustChain } from "../../context/TrustChainContext";
import { SearchIcon, CopyIcon, CheckCircleIcon, ShieldCheckIcon, LockIcon } from "../ui/Icons";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import type { Institution } from "../../lib/data";

// ─── 3D Isometric Block Cube Icon ─────────────────────────────────────────────
function Isometric3DBlockIcon({ blockNum, isGenesis }: { blockNum: number; isGenesis: boolean }) {
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)]">
        <polygon
          points="50,10 90,32 50,54 10,32"
          fill={isGenesis ? "#BEF52A" : "#282C27"}
          stroke={isGenesis ? "#172000" : "#BEF52A"}
          strokeWidth="2.5"
        />
        <polygon
          points="10,32 50,54 50,92 10,70"
          fill={isGenesis ? "#172000" : "#111410"}
          stroke={isGenesis ? "#BEF52A" : "#3E433D"}
          strokeWidth="2"
        />
        <polygon
          points="50,54 90,32 90,70 50,92"
          fill={isGenesis ? "#282C27" : "#1C201A"}
          stroke={isGenesis ? "#BEF52A" : "#3E433D"}
          strokeWidth="2"
        />
        <text
          x="50"
          y="35"
          textAnchor="middle"
          fill={isGenesis ? "#172000" : "#BEF52A"}
          fontSize="14"
          fontWeight="900"
          fontFamily="monospace"
        >
          #{blockNum}
        </text>
      </svg>
    </div>
  );
}

// ─── 3D Movable Square Block Component ────────────────────────────────────────
interface Movable3DSquareBlockProps {
  inst: Institution;
  blockNum: number;
  height: number;
  prevHash: string;
  isGenesis: boolean;
  x: number;
  y: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onClick: () => void;
}

function Movable3DSquareBlock({
  inst,
  blockNum,
  height,
  prevHash,
  isGenesis,
  x,
  y,
  isDragging,
  onPointerDown,
  onClick,
}: Movable3DSquareBlockProps) {
  const BLOCK_W = 190;
  const BLOCK_H = 145;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x - BLOCK_W / 2}px`,
        top: `${y - BLOCK_H / 2}px`,
        width: `${BLOCK_W}px`,
        touchAction: "none",
        zIndex: isDragging ? 50 : 20,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={`select-none cursor-grab active:cursor-grabbing transition-transform duration-75 group ${
        isDragging ? "scale-105" : "hover:scale-[1.02]"
      }`}
    >
      {/* 3D Extruded Chassis */}
      <div
        className={`rounded-[16px] border-2 bg-white overflow-hidden transition-all duration-200 ${
          isDragging
            ? "border-[#BEF52A] shadow-[14px_20px_0px_#111410,0_0_24px_rgba(190,245,42,0.45)] -translate-y-2"
            : "border-[#111410] shadow-[8px_12px_0px_#111410,0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[10px_14px_0px_#BEF52A]"
        }`}
      >
        {/* 3D Isometric Top Plate */}
        <div className="relative bg-[#111410] text-white px-3 py-2 flex items-center justify-between border-b-2 border-[#282C27]">
          {/* Top Neon Laser Seam */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BEF52A] via-[#EFFBCB] to-[#BEF52A]" />

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-[4px] bg-[#282C27] text-[#BEF52A] flex items-center justify-center font-mono font-black text-[10px] border border-[#3E433D]">
              #{blockNum}
            </div>
            <span className="font-mono font-black text-[11px] text-white tracking-wider truncate">
              {isGenesis ? "GENESIS" : `BLOCK #0${blockNum}`}
            </span>
          </div>

          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isGenesis
                ? "bg-[#BEF52A] text-[#172000]"
                : "bg-[#172000] text-[#BEF52A] border border-[#BEF52A]/40"
            }`}
          >
            PoA
          </span>
        </div>

        {/* 3D Cryptographic Hash Bar */}
        <div className="bg-[#F2F3EF] px-3 py-1.5 border-b border-[#D9DCD5] font-mono text-[9px] flex items-center justify-between text-[#626971]">
          <span className="text-[#8A9097] font-bold">HASH:</span>
          <span className="font-bold text-[#101418] truncate max-w-[120px]" title={inst.txRef}>
            {inst.txRef.slice(0, 14)}...
          </span>
        </div>

        {/* 3D Square Block Body */}
        <div className="p-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#111410] text-[#BEF52A] font-black text-xs flex items-center justify-center border border-[#BEF52A] shrink-0 shadow-xs">
              {inst.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <h4 className="font-black text-[13px] text-[#101418] leading-tight truncate group-hover:text-[#159447] transition-colors">
                {inst.name}
              </h4>
              <div className="text-[10px] text-[#626971] truncate">{inst.type}</div>
            </div>
          </div>

          {/* DID Anchor */}
          <div className="px-2 py-1 rounded-[5px] bg-[#F7F7F4] border border-[#E8E9E5] text-[9px] font-mono text-[#101418] truncate mb-2">
            {inst.did}
          </div>

          {/* Block Footer */}
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#E8E9E5] text-[#626971]">
            <span className="font-bold text-[#172000] bg-[#EFFBCB] px-1.5 py-0.5 rounded text-[9px]">
              {inst.issuerCount} Issuers
            </span>
            <span className="font-extrabold text-[#111410] group-hover:text-[#159447] text-[10px]">
              Inspect 3D →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstitutionsScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const { institutions, issuers, registerInstitution, authorizeIssuer } = useTrustChain();
  const [activeTab, setActiveTab] = useState<"directory" | "register" | "issuers" | "add_issuer">("directory");
  const [viewMode, setViewMode] = useState<"3d_mesh" | "3d_chain" | "3d_grid">("3d_mesh");
  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<{ inst: Institution; blockNum: number; prevHash: string; height: number } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 3D Movable Mesh Coordinates
  const canvasRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [simPulse, setSimPulse] = useState(true);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regType, setRegType] = useState("Higher Education / University");
  const [regRootKey, setRegRootKey] = useState("");
  const [regSuccess, setRegSuccess] = useState<Institution | null>(null);

  // Add Issuer State
  const [issuerInstId, setIssuerInstId] = useState("");
  const [issuerKey, setIssuerKey] = useState("");
  const [issuerPermission, setIssuerPermission] = useState("Academic Degrees");

  const filtered = institutions.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  // Initialize radial layout for movable 3D square blocks
  const resetLayout = () => {
    const defaultPositions: Record<string, { x: number; y: number }> = {};
    const total = filtered.length || 1;
    const cx = 460;
    const cy = 340;
    const rx = 340; // horizontal radius
    const ry = 220; // vertical radius

    filtered.forEach((inst, idx) => {
      const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
      defaultPositions[inst.id] = {
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
      };
    });
    setPositions(defaultPositions);
  };

  useEffect(() => {
    setMounted(true);
    resetLayout();
  }, [institutions.length]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedBlock(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Pointer dragging handlers
  const handlePointerDown = (instId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(instId);
    setHasDragged(false);
    const curr = positions[instId] || { x: 400, y: 300 };
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: curr.x,
      initialY: curr.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !dragStart || !canvasRef.current) return;
    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasDragged(true);
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(90, Math.min(rect.width - 90, dragStart.initialX + dx));
    const newY = Math.max(75, Math.min(rect.height - 75, dragStart.initialY + dy));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { x: newX, y: newY },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingId(null);
      setDragStart(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) return;
    const newInst = registerInstitution({
      name: regName,
      type: regType,
      rootKey: regRootKey || "ed25519:default-root-key",
    });
    setRegSuccess(newInst);
    setRegName("");
    setRegRootKey("");
  };

  const handleAddIssuerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerInstId) return;
    authorizeIssuer({
      institutionId: issuerInstId,
      keyFingerprint: issuerKey || `ed25519:${Math.random().toString(16).slice(2, 10)}`,
      permissions: [issuerPermission],
    });
    setActiveTab("issuers");
  };

  const getBlockMeta = (index: number) => {
    const isGenesis = index === 0;
    const blockNum = index + 1;
    const height = 1402880 + blockNum;
    const prevHash = isGenesis
      ? "0x0000000000000000000000000000000000000000000000000000000000000000"
      : filtered[index - 1]?.txRef || "0x8f2a1b94c3d8271e504b2a9d8c3e1f4b";
    return { isGenesis, blockNum, height, prevHash };
  };

  // Center consensus mesh positions
  const cx = 460;
  const cy = 340;
  const innerRadius = 120;
  const validatorNodes = filtered.map((inst, idx) => {
    const angle = (2 * Math.PI * idx) / (filtered.length || 1) - Math.PI / 2;
    const isMiner = idx % 2 === 0; // matching reference diagram: alternate green Miner vs blue Peer
    return {
      instId: inst.id,
      index: idx,
      isMiner,
      x: cx + innerRadius * Math.cos(angle),
      y: cy + innerRadius * Math.sin(angle),
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#159447] bg-[#E8F8E8] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#159447] animate-pulse" />
              Consensus Topology: Fully Connected P2P Mesh
            </span>
            <span className="text-[12px] font-mono text-[#626971] hidden md:inline">
              Chain ID: trustchain-mainnet-1 • Interactive 3D Nodes
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight mt-1 flex items-center gap-2.5">
            <span>3D Blockchain Network & Movable Institutional Blocks</span>
          </h1>
          <p className="text-[14px] text-[#626971]">
            Central validator/miner consensus mesh linked via bidirectional synchronization to movable 3D university blocks. Drag any block to reposition.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<span className="w-2 h-2 rounded-full bg-[#BEF52A]" />}
          onClick={() => {
            setRegSuccess(null);
            setActiveTab("register");
          }}
        >
          Mine New Institutional Block
        </Button>
      </div>

      {/* Tabs & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#F7F7F4] p-1 rounded-[10px] border border-[#E8E9E5] w-fit">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === "directory"
                ? "bg-white text-[#101418] font-bold shadow-xs"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            3D Blockchain Network ({institutions.length} Blocks)
          </button>
          <button
            onClick={() => setActiveTab("issuers")}
            className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === "issuers"
                ? "bg-white text-[#101418] font-bold shadow-xs"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            Authorized Signers ({issuers.length})
          </button>
          <button
            onClick={() => {
              setRegSuccess(null);
              setActiveTab("register");
            }}
            className={`px-4 py-1.5 rounded-[8px] text-[13px] font-medium transition-all ${
              activeTab === "register"
                ? "bg-white text-[#101418] font-bold shadow-xs"
                : "text-[#626971] hover:text-[#101418]"
            }`}
          >
            + Register Node
          </button>
        </div>

        {activeTab === "directory" && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#8A9097] hidden sm:inline">Topology View:</span>
            <div className="flex items-center bg-[#F2F3EF] p-0.5 rounded-[8px] border border-[#E8E9E5]">
              <button
                onClick={() => setViewMode("3d_mesh")}
                className={`px-3 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "3d_mesh"
                    ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                <span>🕸️ 3D Movable Mesh</span>
              </button>
              <button
                onClick={() => setViewMode("3d_chain")}
                className={`px-3 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "3d_chain"
                    ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                <span>🔗 Linear 3D Chain</span>
              </button>
              <button
                onClick={() => setViewMode("3d_grid")}
                className={`px-3 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "3d_grid"
                    ? "bg-[#111410] text-[#BEF52A] shadow-xs"
                    : "text-[#626971] hover:text-[#101418]"
                }`}
              >
                <span>⊞ 3D Grid</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {regSuccess && (
        <div className="p-4 rounded-[14px] bg-[#E8F8E8] border border-[#CEF0CE] text-[#159447] flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-[14px] font-bold">
                {regSuccess.name} mined as new 3D Block on TrustChain!
              </span>
              <div className="text-[12px] opacity-90 font-mono mt-0.5">
                DID: {regSuccess.did} • Block Hash: {regSuccess.txRef}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab("directory")}
          >
            Inspect in Mesh →
          </Button>
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Search & Blockchain Stats Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-[16px] bg-white border border-[#E8E9E5] shadow-[4px_6px_0px_#111410]">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter network blocks, universities, or DIDs..."
                className="w-full h-[38px] pl-9 pr-3 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#A9DF16]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetLayout}
                className="px-3 py-1.5 rounded-[8px] bg-[#F7F7F4] hover:bg-[#E8E9E5] border border-[#D9DCD5] text-[12px] font-bold text-[#101418] flex items-center gap-1.5 transition-all shadow-xs"
              >
                🔄 Reset Mesh Layout
              </button>
              <button
                onClick={() => setSimPulse((prev) => !prev)}
                className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  simPulse
                    ? "bg-[#111410] text-[#BEF52A] border-[#BEF52A]"
                    : "bg-[#F7F7F4] text-[#626971] border-[#D9DCD5]"
                }`}
              >
                ⚡ {simPulse ? "Broadcasting Active" : "Pause Pulses"}
              </button>
            </div>
          </div>

          {/* VIEW 1: 3D MOVABLE MESH TOPOLOGY (REFERENCE DIAGRAM) */}
          {viewMode === "3d_mesh" && (
            <div className="space-y-3">
              {/* Instructions banner */}
              <div className="px-4 py-2.5 rounded-[12px] bg-[#EFFBCB] border border-[#BEF52A] text-[#172000] text-[12px] font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#111410]">💡 Interactive 3D Canvas:</span>
                  <span>Click and drag any university block to move it across the canvas. Connecting bidirectional consensus arrows track in real time.</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#159447]" /> Miner Validator
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1764C0]" /> Consensus Peer
                  </span>
                </div>
              </div>

              {/* Interactive Canvas Container */}
              <div
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full h-[680px] bg-[#FBFBFA] rounded-[24px] border-2 border-[#111410] shadow-[10px_16px_0px_#111410,0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden"
                style={{
                  backgroundImage:
                    "radial-gradient(#D9DCD5 1px, transparent 1px), radial-gradient(#E8E9E5 1px, #FBFBFA 1px)",
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              >
                {/* SVG Connecting Mesh Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  <defs>
                    {/* Arrow markers matching diagram */}
                    <marker
                      id="arrow-green"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#159447" />
                    </marker>
                    <marker
                      id="arrow-dark"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#111410" />
                    </marker>
                  </defs>

                  {/* 1. Fully Connected Central Peer Mesh (K_n graph lines between all inner nodes) */}
                  {validatorNodes.map((n1, i) =>
                    validatorNodes.slice(i + 1).map((n2) => (
                      <line
                        key={`mesh-${n1.index}-${n2.index}`}
                        x1={n1.x}
                        y1={n1.y}
                        x2={n2.x}
                        y2={n2.y}
                        stroke="#94A3B8"
                        strokeWidth="2"
                        strokeOpacity="0.75"
                        strokeDasharray={simPulse ? "none" : "4 2"}
                      />
                    ))
                  )}

                  {/* 2. Bidirectional Arrows connecting Inner Validators to Outer 3D Movable Square Blocks */}
                  {validatorNodes.map((val) => {
                    const blockPos = positions[val.instId] || { x: val.x, y: val.y };
                    const dx = blockPos.x - val.x;
                    const dy = blockPos.y - val.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const perpX = (-dy / len) * 7;
                    const perpY = (dx / len) * 7;

                    // Arrow 1: Green arrow pointing towards 3D Block
                    const gStartX = val.x + perpX;
                    const gStartY = val.y + perpY;
                    const gEndX = blockPos.x + perpX - (dx / len) * 20;
                    const gEndY = blockPos.y + perpY - (dy / len) * 20;

                    // Arrow 2: Dark arrow pointing towards Validator Node
                    const dStartX = blockPos.x - perpX - (dx / len) * 20;
                    const dStartY = blockPos.y - perpY - (dy / len) * 20;
                    const dEndX = val.x - perpX + (dx / len) * 16;
                    const dEndY = val.y - perpY + (dy / len) * 16;

                    return (
                      <g key={`link-${val.instId}`}>
                        {/* Green Arrow (Sync to Block) */}
                        <line
                          x1={gStartX}
                          y1={gStartY}
                          x2={gEndX}
                          y2={gEndY}
                          stroke="#159447"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow-green)"
                        />
                        {/* Dark Arrow (Sync to Validator) */}
                        <line
                          x1={dStartX}
                          y1={dStartY}
                          x2={dEndX}
                          y2={dEndY}
                          stroke="#111410"
                          strokeWidth="2"
                          markerEnd="url(#arrow-dark)"
                        />

                        {/* Animated traveling data packet */}
                        {simPulse && (
                          <circle r="4" fill="#BEF52A" stroke="#111410" strokeWidth="1">
                            <animateMotion
                              path={`M ${gStartX} ${gStartY} L ${gEndX} ${gEndY}`}
                              dur="2.2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* 3. Central Validator / Miner Nodes (Circles) */}
                  {validatorNodes.map((val) => (
                    <g key={`val-node-${val.index}`}>
                      {/* Pulse halo */}
                      {val.isMiner && (
                        <circle
                          cx={val.x}
                          cy={val.y}
                          r="20"
                          fill="none"
                          stroke="#159447"
                          strokeWidth="1.5"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                      {/* Node Body */}
                      <circle
                        cx={val.x}
                        cy={val.y}
                        r="16"
                        fill={val.isMiner ? "#159447" : "#1764C0"}
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                      />
                      {/* Label below node (Miner / Peer) */}
                      {val.isMiner && (
                        <text
                          x={val.x + 18}
                          y={val.y + 4}
                          fill="#101418"
                          fontSize="11"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          Miner
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {/* 3D Movable Square Blocks for Universities */}
                {filtered.map((inst, idx) => {
                  const { isGenesis, blockNum, height, prevHash } = getBlockMeta(idx);
                  const pos = positions[inst.id] || { x: 450, y: 340 };

                  return (
                    <Movable3DSquareBlock
                      key={inst.id}
                      inst={inst}
                      blockNum={blockNum}
                      height={height}
                      prevHash={prevHash}
                      isGenesis={isGenesis}
                      x={pos.x}
                      y={pos.y}
                      isDragging={draggingId === inst.id}
                      onPointerDown={(e) => handlePointerDown(inst.id, e)}
                      onClick={() => {
                        if (!hasDragged) {
                          setSelectedBlock({ inst, blockNum, prevHash, height });
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: LINEAR 3D CHAIN */}
          {viewMode === "3d_chain" && (
            <div className="space-y-4">
              {filtered.map((inst, idx) => {
                const { isGenesis, blockNum, height, prevHash } = getBlockMeta(idx);
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedBlock({ inst, blockNum, prevHash, height })}
                    className="p-5 rounded-[18px] bg-white border-2 border-[#111410] shadow-[8px_12px_0px_#111410] hover:shadow-[10px_14px_0px_#BEF52A] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Isometric3DBlockIcon blockNum={blockNum} isGenesis={isGenesis} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[14px] text-[#101418]">
                            {isGenesis ? "GENESIS BLOCK #001" : `BLOCK #00${blockNum}`}
                          </span>
                          <span className="text-[11px] font-mono text-[#8A9097]">
                            #{height.toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-[17px] font-black text-[#101418]">{inst.name}</h3>
                        <p className="text-[12px] font-mono text-[#626971] truncate">{inst.did}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inst.status} />
                      <span className="font-bold text-[12px] text-[#111410]">Inspect →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 3: 3D GRID */}
          {viewMode === "3d_grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((inst, idx) => {
                const { isGenesis, blockNum, height, prevHash } = getBlockMeta(idx);
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedBlock({ inst, blockNum, prevHash, height })}
                    className="p-5 rounded-[18px] bg-white border-2 border-[#111410] shadow-[8px_12px_0px_#111410] hover:shadow-[10px_14px_0px_#BEF52A] transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Isometric3DBlockIcon blockNum={blockNum} isGenesis={isGenesis} />
                      <StatusBadge status={inst.status} />
                    </div>
                    <h3 className="text-[16px] font-black text-[#101418]">{inst.name}</h3>
                    <div className="p-2 rounded bg-[#F7F7F4] border border-[#E8E9E5] text-[10px] font-mono truncate">
                      {inst.did}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Issuers Management Tab */}
      {activeTab === "issuers" && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 border-b border-[#E8E9E5] flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-[#101418]">
                Authorized Signing Keypairs (Issuer Management)
              </h3>
              <p className="text-[13px] text-[#626971] mt-0.5">
                Active cryptographic signers delegated by institution councils to sign certificates.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab("add_issuer")}
            >
              + Authorize New Signer Key
            </Button>
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
              {issuers.map((iss) => (
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

      {/* Add Issuer Tab */}
      {activeTab === "add_issuer" && (
        <Card className="max-w-xl mx-auto space-y-5">
          <h2 className="text-[18px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
            Authorize Signing Key for Institution
          </h2>
          <form onSubmit={handleAddIssuerSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Select Target Block / Institution
              </label>
              <select
                required
                value={issuerInstId}
                onChange={(e) => setIssuerInstId(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
              >
                <option value="">Select target institution...</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.did})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                ED25519 Public Key Fingerprint
              </label>
              <input
                type="text"
                placeholder="ed25519:a8f9c1d0e2b3..."
                value={issuerKey}
                onChange={(e) => setIssuerKey(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12px] font-mono text-[#101418] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Signing Permissions
              </label>
              <select
                value={issuerPermission}
                onChange={(e) => setIssuerPermission(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
              >
                <option value="Academic Degrees">Academic Degrees & Transcripts</option>
                <option value="Medical Licenses">Medical & Clinical Licenses</option>
                <option value="Professional Credentials">Professional Certifications</option>
                <option value="All Schemas">Unrestricted (Root Authority)</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="md" type="button" onClick={() => setActiveTab("issuers")}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Authorize On-Chain Key
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Register Institution Form */}
      {activeTab === "register" && (
        <Card className="max-w-xl mx-auto space-y-5">
          <h2 className="text-[18px] font-bold text-[#101418] pb-2 border-b border-[#E8E9E5]">
            Mine New Institutional 3D Block on Ledger
          </h2>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Institution Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Stanford University Institute of Computing"
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                Institution Type
              </label>
              <select
                value={regType}
                onChange={(e) => setRegType(e.target.value)}
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] focus:bg-white focus:outline-none"
              >
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
                value={regRootKey}
                onChange={(e) => setRegRootKey(e.target.value)}
                placeholder="ed25519:MC4CAQAwBQYDK2VwBCIEII..."
                className="w-full h-[40px] px-3.5 rounded-[8px] bg-[#F7F7F4] border border-[#E8E9E5] text-[12px] font-mono text-[#101418] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="md" type="button" onClick={() => setActiveTab("directory")}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Mine 3D Block onto Ledger
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 3D BLOCK & NODE INSPECTOR MODAL - RENDERED VIA PORTAL IN VIEWPORT */}
      {selectedBlock && mounted && createPortal(
        <div
          onClick={() => setSelectedBlock(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] max-w-2xl w-full border-2 border-[#111410] shadow-[12px_16px_0px_#111410,0_25px_50px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[85vh] my-auto"
          >
            <div className="bg-[#111410] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#282C27] relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#BEF52A]" />
              <div className="flex items-center gap-3">
                <Isometric3DBlockIcon
                  blockNum={selectedBlock.blockNum}
                  isGenesis={selectedBlock.blockNum === 1}
                />
                <div>
                  <div className="font-mono font-black text-[16px] text-white">
                    {selectedBlock.blockNum === 1
                      ? "GENESIS BLOCK #001"
                      : `BLOCK #00${selectedBlock.blockNum}`}
                  </div>
                  <div className="text-[12px] font-mono text-[#BEF52A]">
                    Height #{selectedBlock.height.toLocaleString()} • Proof-of-Authority Finalized
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="w-8 h-8 rounded-full bg-[#282C27] text-[#8A9097] hover:text-white flex items-center justify-center font-bold text-lg transition-colors border border-[#3E433D]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-[13px]">
              <div className="p-4 rounded-[14px] bg-[#F7F7F4] border-2 border-[#E8E9E5] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[12px] bg-[#111410] text-[#BEF52A] font-black text-lg flex items-center justify-center border-2 border-[#BEF52A]">
                    {selectedBlock.inst.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[17px] text-[#101418]">
                      {selectedBlock.inst.name}
                    </h4>
                    <p className="text-[12px] text-[#626971]">{selectedBlock.inst.type}</p>
                  </div>
                </div>
                <StatusBadge status={selectedBlock.inst.status} />
              </div>

              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-[11px] text-[#8A9097]">
                  3D Cryptographic Block Headers
                </h5>
                <div className="space-y-2 font-mono text-[12px]">
                  <div className="p-3 rounded-[10px] bg-[#F2F3EF] border border-[#D9DCD5]">
                    <div className="text-[10px] text-[#8A9097] uppercase font-sans font-bold">
                      Block Hash (Transaction Anchor)
                    </div>
                    <div className="text-[#101418] font-bold break-all mt-0.5">
                      {selectedBlock.inst.txRef}
                    </div>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#F2F3EF] border border-[#D9DCD5]">
                    <div className="text-[10px] text-[#8A9097] uppercase font-sans font-bold">
                      Previous Block Hash (Parent Link)
                    </div>
                    <div className="text-[#626971] break-all mt-0.5">
                      {selectedBlock.prevHash}
                    </div>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#F2F3EF] border border-[#D9DCD5]">
                    <div className="text-[10px] text-[#8A9097] uppercase font-sans font-bold">
                      Decentralized Identifier (DID)
                    </div>
                    <div className="text-[#101418] break-all mt-0.5">
                      {selectedBlock.inst.did}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 rounded-[10px] bg-white border border-[#E8E9E5] shadow-xs">
                  <span className="text-[#8A9097] block">Authorized Signers</span>
                  <span className="font-bold text-[#101418] text-[14px]">
                    {selectedBlock.inst.issuerCount} Active Keypairs
                  </span>
                </div>
                <div className="p-3 rounded-[10px] bg-white border border-[#E8E9E5] shadow-xs">
                  <span className="text-[#8A9097] block">Registration Date</span>
                  <span className="font-bold text-[#101418] text-[14px]">
                    {selectedBlock.inst.registrationDate}
                  </span>
                </div>
                <div className="p-3 rounded-[10px] bg-white border border-[#E8E9E5] shadow-xs">
                  <span className="text-[#8A9097] block">Signature Scheme</span>
                  <span className="font-bold text-[#101418] text-[14px]">
                    Ed25519Signature2020
                  </span>
                </div>
                <div className="p-3 rounded-[10px] bg-white border border-[#E8E9E5] shadow-xs">
                  <span className="text-[#8A9097] block">Consensus State</span>
                  <span className="font-bold text-[#159447] text-[14px]">
                    PoA Finalized (12 Validators)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F7F7F4] border-t border-[#E8E9E5] flex justify-end shrink-0">
              <Button variant="primary" size="md" onClick={() => setSelectedBlock(null)}>
                Close 3D Inspector
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
