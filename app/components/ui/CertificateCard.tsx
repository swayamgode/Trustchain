"use client";

import React, { useState } from "react";
import QRCodeCanvas from "./QRCodeCanvas";
import StatusBadge from "./StatusBadge";

export interface CertificateData {
  id: string;
  type: string;
  subjectName: string;
  subjectId: string;
  issuingInstitution: string;
  issuanceDate: string;
  status: "active" | "revoked" | "pending";
  documentImage?: string;
  signature?: string;
  gpa?: string;
}

interface CertificateCardProps {
  cert: CertificateData;
  verificationUrl: string;
  onInspectFull?: () => void;
  showInspectButton?: boolean;
}

export default function CertificateCard({
  cert,
  verificationUrl,
  onInspectFull,
  showInspectButton = true,
}: CertificateCardProps) {
  return (
    <div className="bg-white border-2 border-[#111410] rounded-[24px] p-4 shadow-lg overflow-hidden group transition-all">
      {/* Certificate Frame */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#D9DCD5] aspect-[4/3] w-full select-none shadow-inner">
        {/* Background Parchment & Ornate Border */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/lead_certificate_bg.jpg')" }}
        />

        {/* Top-Right Pill Inspect Button */}
        {showInspectButton && (
          <button
            onClick={onInspectFull}
            className="absolute top-3.5 right-3.5 z-20 bg-[#1E232A]/90 hover:bg-[#101418] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>🔍 Inspect Full Document</span>
          </button>
        )}

        {/* Certificate Content Overlay (Calibrated to match Reference Certificate) */}
        <div className="relative z-10 h-full w-full flex flex-col justify-between pl-[28%] pr-[5%] py-[5%]">
          {/* Top Header: Logo / Institution Name */}
          <div className="flex items-center justify-end pr-2">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-[#1B365D]">
                <span className="font-extrabold text-[15px] tracking-tight leading-none">
                  {cert.issuingInstitution.toUpperCase()}
                </span>
              </div>
              <span className="text-[8.5px] uppercase tracking-wider text-[#64748B] font-medium">
                Accredited Trust Registry Node
              </span>
            </div>
          </div>

          {/* Main Titles */}
          <div className="text-center space-y-0.5 mt-1">
            <h3 className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] text-[#006699] uppercase font-sans">
              Course Completion
            </h3>
            <h1 className="text-[24px] md:text-[30px] font-bold tracking-tight text-[#162740] font-cinzel leading-none">
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B38728]" />
              <p className="text-[9.5px] text-[#475569] font-medium tracking-wide">
                This Certificate is awarded to
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B38728]" />
            </div>
          </div>

          {/* Recipient Name in Cursive Calligraphy */}
          <div className="text-center my-0.5">
            <div className="font-script text-[32px] md:text-[38px] text-[#1A4B8C] leading-tight select-all">
              {cert.subjectName || "Bhavik Jain"}
            </div>
            <div className="w-48 mx-auto h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />
          </div>

          {/* Certificate Description Body */}
          <div className="text-center px-4 space-y-0.5">
            <p className="text-[9px] text-[#475569] font-medium">
              For successful completion of
            </p>
            <p className="text-[11px] md:text-[12px] font-bold text-[#0F172A] leading-tight">
              {cert.type || "Advanced UI/UX Design with LIVE Project"}
            </p>
            <p className="text-[8.5px] text-[#64748B] italic">
              an authentic credential registered on TrustChain decentralized ledger.
            </p>
          </div>

          {/* Footer Grid: Signatures, Endorsement, and Integrated QR Code */}
          <div className="grid grid-cols-12 items-end pt-2 pb-1 border-t border-[#E2D8C3]/60">
            {/* Signature Block (Col 1-4) */}
            <div className="col-span-4 text-center">
              <div className="font-script text-[18px] text-[#0F172A] -mb-1 transform -rotate-2">
                Ashfaq Zaman
              </div>
              <div className="w-24 mx-auto border-b border-[#0F172A]/70 mb-0.5" />
              <div className="text-[8px] font-bold text-[#1E293B] leading-none">
                Ashfaq Zaman
              </div>
              <div className="text-[7px] text-[#64748B]">
                Chairman & Chancellor
              </div>
            </div>

            {/* Endorsement & Issue Date (Col 5-8) */}
            <div className="col-span-4 text-center space-y-1">
              <div className="inline-flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#008080] text-white flex items-center justify-center text-[6px] font-black">
                  ✓
                </div>
                <span className="text-[6.5px] font-bold text-[#334155] tracking-tight">
                  United Nations Global Compact
                </span>
              </div>
              <div className="text-[7.5px] text-[#64748B] font-medium">
                Issued On: {cert.issuanceDate || "February, 2023"}
              </div>
            </div>

            {/* Integrated Verification QR Code (Col 9-12) */}
            <div className="col-span-4 flex flex-col items-center justify-end text-center">
              <div className="bg-white p-1 rounded-[6px] border border-[#CBD5E1] shadow-xs">
                <QRCodeCanvas value={verificationUrl} size={64} />
              </div>
              <div className="mt-0.5">
                <div className="text-[6.5px] font-extrabold text-[#0F172A] tracking-wider uppercase font-mono">
                  Scan To Verify
                </div>
                <div className="text-[6px] font-semibold text-[#159447]">
                  Authentication
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Information Card Bar (Matching User Screenshot) */}
      <div className="pt-3 px-2 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#101418]">Document Title:</span>
          <span className="text-[#626971] font-medium">{cert.type.toLowerCase().includes("completion") ? "completion" : cert.type}</span>
        </div>
        <StatusBadge status={cert.status} />
      </div>
    </div>
  );
}
