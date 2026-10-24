"use client";

import { useState } from "react";
import { DEMO_AUDIT_EVENTS, type AuditEvent } from "../../lib/data";

const EVENT_TYPES = [
  { key: "all", label: "All Events" },
  { key: "institution_registration", label: "Institution Registration" },
  { key: "issuer_authorization", label: "Issuer Authorization" },
  { key: "credential_issuance", label: "Credential Issuance" },
  { key: "credential_verification", label: "Credential Verification" },
  { key: "credential_revocation", label: "Credential Revocation" },
  { key: "failed_auth", label: "Failed Auth" },
];

const EVENT_LABELS: Record<string, string> = {
  institution_registration: "Institution Registration",
  issuer_authorization: "Issuer Authorization",
  credential_issuance: "Credential Issuance",
  credential_verification: "Credential Verification",
  credential_revocation: "Credential Revocation",
  failed_auth: "Failed Authorization",
};

const EVENT_COLORS: Record<string, { color: string; bg: string }> = {
  institution_registration: { color: "#65B8FF", bg: "rgba(101,184,255,0.12)" },
  issuer_authorization: { color: "#65B8FF", bg: "rgba(101,184,255,0.12)" },
  credential_issuance: { color: "#63F5C8", bg: "rgba(99,245,200,0.12)" },
  credential_verification: { color: "#42E6A4", bg: "rgba(66,230,164,0.12)" },
  credential_revocation: { color: "#FFC857", bg: "rgba(255,200,87,0.12)" },
  failed_auth: { color: "#FF657A", bg: "rgba(255,101,122,0.12)" },
};

const OUTCOME_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  success: { color: "#42E6A4", bg: "rgba(66,230,164,0.12)", label: "SUCCESS" },
  rejected: { color: "#FFC857", bg: "rgba(255,200,87,0.12)", label: "REJECTED" },
  alert: { color: "#FF657A", bg: "rgba(255,101,122,0.12)", label: "ALERT" },
};

export default function AuditScreen() {
  const [filterType, setFilterType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filtered = DEMO_AUDIT_EVENTS.filter(
    (e) => filterType === "all" || e.type === filterType
  );

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#F2F6FC", letterSpacing: "-0.02em" }}>
          Audit Trail
        </h1>
        <p className="text-sm" style={{ color: "#96A5BB" }}>
          Tamper-evident log of all trust registry events. All actions are cryptographically recorded.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map((et) => (
          <button
            key={et.key}
            onClick={() => setFilterType(et.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: filterType === et.key ? "rgba(99,245,200,0.1)" : "#101827",
              color: filterType === et.key ? "#63F5C8" : "#96A5BB",
              border: filterType === et.key ? "1px solid rgba(99,245,200,0.3)" : "1px solid #263449",
            }}
          >
            {et.label}
            {et.key !== "all" && (
              <span className="ml-1.5" style={{ color: "inherit", opacity: 0.7 }}>
                {DEMO_AUDIT_EVENTS.filter((e) => e.type === et.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Timeline */}
        <div className="flex-1">
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "#101827", border: "1px solid #263449" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #263449" }}>
              <p className="text-sm font-semibold" style={{ color: "#F2F6FC" }}>
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="relative px-5 py-4">
              {/* Timeline line */}
              <div
                className="absolute left-11 top-0 bottom-0 w-0.5"
                style={{ background: "#263449" }}
              />

              {filtered.map((event, i) => {
                const typeClr = EVENT_COLORS[event.type] || { color: "#96A5BB", bg: "rgba(150,165,187,0.12)" };
                const outcomeClr = OUTCOME_COLORS[event.outcome];
                const isSelected = selectedEvent?.id === event.id;

                return (
                  <div
                    key={event.id}
                    className="relative flex gap-4 mb-6 last:mb-0 cursor-pointer"
                    onClick={() => setSelectedEvent(isSelected ? null : event)}
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 relative z-10 mt-0.5" style={{ width: "24px" }}>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: typeClr.bg,
                          border: `2px solid ${typeClr.color}`,
                          boxShadow: isSelected ? `0 0 10px ${typeClr.color}40` : "none",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: typeClr.color }} />
                      </div>
                    </div>

                    {/* Event card */}
                    <div
                      className="flex-1 rounded-lg p-4 transition-all duration-150"
                      style={{
                        background: isSelected ? "rgba(99,245,200,0.04)" : "#162235",
                        border: `1px solid ${isSelected ? "rgba(99,245,200,0.2)" : "#263449"}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ background: typeClr.bg, color: typeClr.color }}
                          >
                            {EVENT_LABELS[event.type]}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                            style={{ background: outcomeClr.bg, color: outcomeClr.color }}
                          >
                            {outcomeClr.label}
                          </span>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "#96A5BB" }}>
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: "#F2F6FC" }}>
                        {event.details}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs mt-2">
                        <span style={{ color: "#96A5BB" }}>
                          Actor: <span style={{ color: "#F2F6FC" }}>{event.actor}</span>
                        </span>
                        <span style={{ color: "#96A5BB" }}>
                          Related: <span className="font-mono" style={{ color: "#65B8FF" }}>{event.related}</span>
                        </span>
                        {event.txRef !== "N/A" && (
                          <span style={{ color: "#96A5BB" }}>
                            Tx: <span className="font-mono" style={{ color: "#65B8FF" }}>{event.txRef.slice(0, 16)}…</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <p className="text-center py-12 text-sm" style={{ color: "#96A5BB" }}>
                  No events match the selected filter.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event detail panel */}
        {selectedEvent && (
          <div
            className="w-full lg:w-80 flex-shrink-0 rounded-xl p-5 animate-slide-in"
            style={{ background: "#101827", border: "1px solid #263449" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: "#F2F6FC" }}>Event Detail</p>
              <button onClick={() => setSelectedEvent(null)} style={{ color: "#96A5BB" }} className="text-xs">✕</button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              {[
                { label: "Event ID", value: selectedEvent.id, mono: true },
                { label: "Event Type", value: EVENT_LABELS[selectedEvent.type] },
                { label: "Outcome", value: OUTCOME_COLORS[selectedEvent.outcome].label },
                { label: "Actor", value: selectedEvent.actor },
                { label: "Timestamp", value: new Date(selectedEvent.timestamp).toLocaleString() },
                { label: "Related Entity", value: selectedEvent.related, mono: true },
                { label: "Transaction Reference", value: selectedEvent.txRef, mono: true },
              ].map((f) => (
                <div key={f.label}>
                  <p className="mb-0.5" style={{ color: "#96A5BB" }}>{f.label}</p>
                  <p className={f.mono ? "font-mono" : ""} style={{ color: f.mono ? "#65B8FF" : "#F2F6FC", wordBreak: "break-all" }}>
                    {f.value}
                  </p>
                </div>
              ))}
              <div>
                <p className="mb-1" style={{ color: "#96A5BB" }}>Details</p>
                <p className="leading-relaxed" style={{ color: "#F2F6FC" }}>{selectedEvent.details}</p>
              </div>
              <div
                className="rounded-lg p-3 mt-2"
                style={{ background: "#162235", border: "1px solid #263449" }}
              >
                <p className="mb-1 font-medium" style={{ color: "#96A5BB" }}>Proof Reference</p>
                <p className="font-mono text-[10px]" style={{ color: "#63F5C8" }}>
                  {selectedEvent.txRef !== "N/A" ? `Block hash: ${selectedEvent.txRef}` : "No on-chain reference — internal event"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
