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

function getCertificateImageSrc(url?: string): string {
  if (!url) return "/lead_certificate_bg.jpg";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
  }
  return url;
}

export default function CertificateCard({
  cert,
  verificationUrl,
  onInspectFull,
  showInspectButton = true,
}: CertificateCardProps) {
  const [imgLoadError, setImgLoadError] = useState(false);
  const isDriveLink = Boolean(cert.documentImage?.includes("drive.google.com"));

  // Only treat as raw standalone physical photo if it's a direct image file, NOT a Drive link, and loads successfully
  const isDirectPhoto =
    !isDriveLink &&
    !imgLoadError &&
    Boolean(cert.documentImage) &&
    cert.documentImage !== "/lead_certificate_bg.jpg" &&
    ((cert.documentImage?.startsWith("data:image/") ||
      cert.documentImage?.startsWith("/") ||
      cert.documentImage?.match(/\.(jpg|jpeg|png|webp|svg)$/i)) ?? false);

  const cleanSubjectId = cert.subjectId
    ? cert.subjectId.replace("did:trust:", "").replace("student-", "").toUpperCase()
    : "";

  return (
    <div className="bg-white border-2 border-[#111410] rounded-[24px] p-4 shadow-lg overflow-hidden group transition-all">
      {/* Certificate Frame */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#D9DCD5] aspect-[4/3] w-full select-none shadow-inner bg-[#FAF8F5]">
        {isDirectPhoto ? (
          /* 1. ACTUAL DIRECT UPLOADED DOCUMENT PHOTOCOPY */
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={getCertificateImageSrc(cert.documentImage)}
              alt={cert.type || "Official Issued Certificate"}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={() => {
                setImgLoadError(true);
              }}
            />

            {/* Top-Right Pill Inspect Button */}
            {showInspectButton && (
              <button
                data-html2canvas-ignore="true"
                onClick={onInspectFull}
                className="absolute top-3.5 right-3.5 z-20 bg-[#1E232A]/90 hover:bg-[#101418] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🔍 Inspect Full Document</span>
              </button>
            )}

            {/* Anchored Verification QR Code on the bottom-right corner */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs p-2 rounded-[12px] border border-black/10 shadow-lg flex flex-col items-center select-none">
              <QRCodeCanvas
                value={verificationUrl}
                size={74}
                noFrame={true}
              />
              <div className="mt-1 text-center font-sans">
                <div className="text-[7px] font-black tracking-[0.14em] text-[#0F172A] uppercase leading-none">
                  SCAN TO VERIFY
                </div>
                <div className="text-[6.5px] font-bold tracking-[0.16em] text-[#0F172A] uppercase leading-none mt-0.5">
                  AUTHENTICATION
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 2. DYNAMIC LEAD ACADEMY / GOLD HONORS CERTIFICATE TEMPLATE WITH STUDENT DETAILS */
          <div className="relative w-full h-full">
            {/* Background Parchment & Ornate Border */}
            <div
              className="absolute inset-0 bg-cover bg-no-repeat bg-center"
              style={{ backgroundImage: "url('/lead_certificate_bg.jpg')" }}
            />

            {/* Top-Left Open on Drive Button if drive link */}
            {isDriveLink && (
              <a
                data-html2canvas-ignore="true"
                href={cert.documentImage}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3.5 left-3.5 z-20 bg-white/95 hover:bg-white text-[#101418] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all border border-black/10 hover:border-black/30"
              >
                <span>📁 Original Marksheet on Drive ↗</span>
              </a>
            )}

            {/* Top-Right Pill Inspect Button */}
            {showInspectButton && (
              <button
                data-html2canvas-ignore="true"
                onClick={onInspectFull}
                className="absolute top-3.5 right-3.5 z-20 bg-[#1E232A]/90 hover:bg-[#101418] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🔍 Inspect Full Document</span>
              </button>
            )}

            {/* Certificate Content Overlay */}
            <div className="relative z-10 h-full w-full flex flex-col justify-between pl-[28%] pr-[6%] py-[4%]">
              {/* Top Header: Logo / Institution Name with clearance from Inspect Button */}
              <div className="flex items-center justify-between pr-24">
                <div className="text-left">
                  <div className="font-extrabold text-[15px] tracking-tight leading-none text-[#1B365D]">
                    {cert.issuingInstitution ? cert.issuingInstitution.toUpperCase() : "INSTITUTE OF ACADEMIC EXCELLENCE"}
                  </div>
                  <div className="text-[7.5px] text-[#006699] font-medium tracking-wide mt-0.5">
                    www.{cert.issuingInstitution?.toLowerCase().replace(/[^a-z0-9]/g, "") || "trustchain"}.edu
                  </div>
                </div>
              </div>

              {/* Main Titles */}
              <div className="text-center space-y-0.5 mt-0.5">
                <h3 className="text-[9.5px] md:text-[10.5px] font-bold tracking-[0.22em] text-[#006699] uppercase font-sans">
                  Course Completion & Academic Standing
                </h3>
                <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight text-[#162740] font-cinzel leading-none">
                  CERTIFICATE
                </h1>
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#B38728]" />
                  <p className="text-[9px] text-[#475569] font-medium tracking-wide">
                    This Certificate is proudly conferred upon
                  </p>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#B38728]" />
                </div>
              </div>

              {/* Recipient Name in Cursive Calligraphy */}
              <div className="text-center my-0.5">
                <div
                  className="text-[28px] md:text-[34px] font-bold text-[#1A4B8C] leading-tight select-all drop-shadow-xs"
                  style={{ fontFamily: "var(--font-script), 'Brush Script MT', 'Dancing Script', cursive, serif" }}
                >
                  {cert.subjectName || "Rahul Sharma"}
                </div>
                <div className="w-52 mx-auto h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mt-0.5" />
                {cleanSubjectId && (
                  <div className="text-[8.5px] font-mono font-bold text-[#64748B] mt-0.5 tracking-wider">
                    STUDENT ID: {cleanSubjectId}
                  </div>
                )}
              </div>

              {/* Certificate Description Body & Grade */}
              <div className="text-center px-2 space-y-0.5">
                <p className="text-[8.5px] text-[#475569] font-medium">
                  for outstanding academic fulfillment and completion of
                </p>
                <p className="text-[11.5px] md:text-[13px] font-bold text-[#0F172A] leading-tight">
                  {cert.type || "AI&DS — Semester 5"}
                </p>
                {cert.gpa && (
                  <div className="pt-0.5">
                    <span className="text-[8.5px] font-bold text-[#159447] bg-[#E8F8E8] px-2 py-0.5 rounded-full border border-[#CEF0CE]">
                      Marks / Score: {cert.gpa}
                    </span>
                  </div>
                )}
                <p className="text-[8px] text-[#64748B] italic">
                  an authentic credential registered on TrustChain decentralized ledger.
                </p>
              </div>

              {/* Signature Block */}
              <div className="text-center pt-0.5 pb-0.5">
                <div
                  className="text-[22px] text-[#0F172A] -mb-1 transform -rotate-1"
                  style={{ fontFamily: "var(--font-script), 'Brush Script MT', cursive, serif" }}
                >
                  Ashfaq Zaman
                </div>
                <div className="w-32 mx-auto border-b border-[#0F172A]/70 mb-0.5" />
                <div className="text-[8.5px] font-bold text-[#1E293B] leading-none">
                  Ashfaq Zaman
                </div>
                <div className="text-[7.5px] text-[#64748B] mt-0.5">
                  Chairman, {cert.issuingInstitution || "Institute of Academic Excellence"}
                </div>
              </div>

              {/* Bottom Bar: Endorsement, Issue Date, and Exact Integrated QR Code */}
              <div className="flex items-end justify-between pt-1 border-t border-[#E2D8C3]/60 pr-1">
                {/* Endorsed by (Left) */}
                <div className="space-y-0.5 pb-0.5">
                  <span className="text-[7.5px] text-[#64748B] italic block">Endorsed by</span>
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#1B4B8A] text-white flex items-center justify-center text-[7px] font-bold">
                      🌐
                    </div>
                    <span className="text-[7.5px] font-bold text-[#1E3A8A] tracking-tight">
                      United Nations Global Compact
                    </span>
                  </div>
                </div>

                {/* Issued Date (Center) */}
                <div className="text-[8px] text-[#64748B] font-medium pb-1">
                  Issued On: {cert.issuanceDate || new Date().toISOString().slice(0, 10)}
                </div>

                {/* Pure Borderless QR Code (Right) */}
                <div className="flex flex-col items-center text-center select-none">
                  <QRCodeCanvas
                    value={verificationUrl}
                    size={72}
                    noFrame={true}
                    transparent={true}
                  />
                  <div className="mt-0.5 text-center">
                    <div className="text-[6.5px] font-black tracking-[0.14em] text-[#0F172A] uppercase leading-tight font-sans">
                      SCAN TO VERIFY
                    </div>
                    <div className="text-[6px] font-bold tracking-[0.16em] text-[#0F172A] uppercase leading-tight font-sans">
                      AUTHENTICATION
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Information Card Bar */}
      <div className="pt-3 px-2 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#101418]">Document Title:</span>
          <span className="text-[#626971] font-medium">
            {cert.type}
          </span>
        </div>
        <StatusBadge status={cert.status} />
      </div>
    </div>
  );
}
