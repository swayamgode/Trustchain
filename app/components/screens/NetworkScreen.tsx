"use client";

import { useState } from "react";
import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";

export default function NetworkScreen({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const [selectedNode, setSelectedNode] = useState<string>("MU");

  const nodes = [
    { id: "MU", label: "MU", fullName: "Metropolitan University", x: 320, y: 130, color: "#BEF52A", issuers: 8, credentials: 14820, type: "Root University Node", status: "Healthy" },
    { id: "MIT", label: "MIT", fullName: "MIT Innovation Labs", x: 130, y: 220, color: "#1764C0", issuers: 14, credentials: 9420, type: "Accredited Node", status: "Healthy" },
    { id: "STAN", label: "STAN", fullName: "Stanford Medical Council", x: 490, y: 200, color: "#159447", issuers: 12, credentials: 6100, type: "Licensing Board", status: "Healthy" },
    { id: "HARV", label: "HARV", fullName: "Harvard Alliance", x: 200, y: 340, color: "#B95B12", issuers: 22, credentials: 18900, type: "Academic Validator", status: "Healthy" },
    { id: "GOV", label: "GOV", fullName: "National Research Registry", x: 440, y: 330, color: "#111410", issuers: 34, credentials: 28400, type: "Government Root", status: "Healthy" },
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E9E5]">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#101418] tracking-tight">
            Trust Network & Validator Topology
          </h1>
          <p className="text-[14px] text-[#626971]">
            Global decentralized trust registry nodes maintaining tamper-evident audit consensus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="healthy" label="Consensus Synchronized (128 Nodes)" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topology Visualization Canvas */}
        <div className="lg:col-span-8">
          <Card className="!p-0 overflow-hidden relative">
            <div className="p-4 border-b border-[#E8E9E5] flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#101418]">
                Interactive Node Topology Map
              </span>
              <span className="text-[11px] text-[#8A9097]">
                Click any node to inspect validator state
              </span>
            </div>

            <div className="h-[420px] bg-[#F7F7F4] relative flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 620 420">
                {/* Connecting lines between nodes */}
                <line x1="320" y1="130" x2="130" y2="220" stroke="#D9DCD5" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="320" y1="130" x2="490" y2="200" stroke="#D9DCD5" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="130" y1="220" x2="200" y2="340" stroke="#D9DCD5" strokeWidth="2" />
                <line x1="490" y1="200" x2="440" y2="330" stroke="#D9DCD5" strokeWidth="2" />
                <line x1="200" y1="340" x2="440" y2="330" stroke="#D9DCD5" strokeWidth="2" />
                <line x1="320" y1="130" x2="200" y2="340" stroke="#D9DCD5" strokeWidth="1.5" />
                <line x1="320" y1="130" x2="440" y2="330" stroke="#D9DCD5" strokeWidth="1.5" />

                {/* Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? "34" : "28"}
                        fill={node.id === "MU" ? "#BEF52A" : "white"}
                        stroke={isSelected ? "#111410" : "#E8E9E5"}
                        strokeWidth={isSelected ? "3" : "2"}
                        className="transition-all duration-200 hover:scale-105"
                      />
                      <text
                        x={node.x}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill="#101418"
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>
        </div>

        {/* Selected Node Details */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-4">
            <div className="pb-3 border-b border-[#E8E9E5]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                Selected Validator Node
              </span>
              <h3 className="text-[18px] font-bold text-[#101418] mt-1">
                {activeNode.fullName}
              </h3>
              <div className="mt-1">
                <StatusBadge status="healthy" label="Node Online" />
              </div>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Role Type:</span>
                <span className="font-semibold text-[#101418]">{activeNode.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Authorized Signers:</span>
                <span className="font-semibold text-[#101418]">{activeNode.issuers}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E9E5]/60">
                <span className="text-[#626971]">Anchored Credentials:</span>
                <span className="font-semibold text-[#101418]">{activeNode.credentials.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#626971]">Block Finality Latency:</span>
                <span className="font-semibold text-[#159447]">34 ms</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
