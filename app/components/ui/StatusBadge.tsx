export type BadgeStatus =
  | "verified"
  | "issued"
  | "under_review"
  | "pending"
  | "revoked"
  | "onboarded"
  | "healthy"
  | "active"
  | "failed";

interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const norm = status.toLowerCase().replace(/\s+/g, "_");

  let styles = "bg-[#E6F2FC] text-[#1764C0] border border-[#CDE3F9]";
  let defaultLabel = label || status;

  if (norm === "verified" || norm === "healthy" || norm === "active") {
    styles = "bg-[#E8F8E8] text-[#159447] border border-[#CEF0CE]";
    defaultLabel = label || (norm === "verified" ? "Verified" : norm === "healthy" ? "Healthy" : "Active");
  } else if (norm === "issued" || norm === "onboarded") {
    styles = "bg-[#E6F2FC] text-[#1764C0] border border-[#CDE3F9]";
    defaultLabel = label || (norm === "issued" ? "Issued" : "Onboarded");
  } else if (norm === "under_review" || norm === "pending") {
    styles = "bg-[#FFF0DE] text-[#B95B12] border border-[#FFE0BA]";
    defaultLabel = label || (norm === "under_review" ? "Under Review" : "Pending");
  } else if (norm === "revoked" || norm === "failed" || norm === "suspended") {
    styles = "bg-[#FDEAE7] text-[#C0392B] border border-[#F9CBC5]";
    defaultLabel = label || (norm === "revoked" ? "Revoked" : "Failed");
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium tracking-tight ${styles} ${className}`}
    >
      {defaultLabel}
    </span>
  );
}
