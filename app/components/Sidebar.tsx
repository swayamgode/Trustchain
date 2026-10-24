"use client";

import {
  OverviewIcon,
  VerifyIcon,
  IssueIcon,
  CredentialsIcon,
  InstitutionsIcon,
  RevocationIcon,
  SettingsIcon,
  NetworkIcon,
  ShieldCheckIcon,
  AuditIcon,
} from "./ui/Icons";
import { useTrustChain, type UserRole } from "../context/TrustChainContext";

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const { activeRole, currentUser, logout } = useTrustChain();

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case "student":
        return [
          { id: "student", label: "My Certificates & Scans", icon: CredentialsIcon, badge: "QR" },
          { id: "registry", label: "Public Anchor Registry", icon: OverviewIcon },
        ];
      case "recruiter":
        return [
          { id: "verify", label: "Candidate Verification", icon: VerifyIcon, badge: "Live" },
          { id: "audit", label: "Cryptographic Proof Audit", icon: AuditIcon },
        ];
      case "network":
        return [
          { id: "network", label: "Validator Node Network", icon: NetworkIcon },
          { id: "institutions", label: "Institutional Keys", icon: InstitutionsIcon },
          { id: "audit", label: "Global Ledger", icon: AuditIcon },
          { id: "overview", label: "Network Telemetry", icon: OverviewIcon },
        ];
      case "issuer":
      default:
        return [
          { id: "overview", label: "College Overview", icon: OverviewIcon },
          { id: "issue", label: "Issue Degrees & Bulk CSV", icon: IssueIcon, badge: "Issue" },
          { id: "registry", label: "Credentials Registry", icon: CredentialsIcon },
          { id: "revocation", label: "Revocation Manager", icon: RevocationIcon },
          { id: "institutions", label: "Institutions & Keys", icon: InstitutionsIcon },
          { id: "audit", label: "Blockchain Audit", icon: AuditIcon },
        ];
    }
  };

  const navItems = getNavItems(activeRole);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "student":
        return { label: "Student", bg: "bg-[#EFF6FF]", text: "text-[#1E3A8A]", border: "border-[#93C5FD]" };
      case "recruiter":
        return { label: "Recruiter", bg: "bg-[#FFFBEB]", text: "text-[#92400E]", border: "border-[#FDE68A]" };
      case "network":
        return { label: "Validator", bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", border: "border-[#D8B4FE]" };
      case "issuer":
      default:
        return { label: "College", bg: "bg-[#EFFBCB]", text: "text-[#172000]", border: "border-[#BEF52A]" };
    }
  };

  const roleStyle = getRoleBadgeStyle(activeRole);

  return (
    <aside
      className="w-[274px] shrink-0 bg-white border-r border-[#E8E9E5] flex flex-col justify-between h-full select-none z-20"
      style={{ minWidth: "274px" }}
    >
      {/* Top Brand */}
      <div>
        <div className="h-[74px] px-6 border-b border-[#E8E9E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#BEF52A] flex items-center justify-center text-[#111410] font-black text-base shadow-sm">
              <ShieldCheckIcon className="w-5 h-5 text-[#111410]" />
            </div>
            <div>
              <div className="font-extrabold text-[17px] text-[#101418] tracking-tight leading-tight flex items-center gap-1.5">
                TrustChain
              </div>
              <div className="text-[11px] font-medium text-[#8A9097] tracking-tight">
                {roleStyle.label} Portal
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
            {roleStyle.label}
          </span>
        </div>

        {/* Navigation Section */}
        <div className="p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] px-3 mb-2 flex items-center justify-between">
            <span>{roleStyle.label} Navigation</span>
            <span className="text-[10px] text-[#159447] font-semibold">Active</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all text-left relative cursor-pointer ${
                    isActive
                      ? "bg-[#EFFBCB] text-[#172000] font-semibold"
                      : "text-[#626971] hover:text-[#101418] hover:bg-[#F2F3EF]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Active vertical accent pill on left */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#BEF52A] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? "text-[#172000]" : "text-[#8A9097]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-[#BEF52A] text-[#172000]"
                          : "bg-[#F2F3EF] text-[#626971]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Logged-in User Profile & Switch Account Card */}
      <div className="p-4 border-t border-[#E8E9E5] space-y-3">
        <div className="bg-[#F7F7F4] border border-[#E8E9E5] rounded-[14px] p-3 space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[8px] bg-[#111410] text-[#BEF52A] font-extrabold text-[12px] flex items-center justify-center shrink-0">
              {currentUser?.avatarLetter || "TC"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-bold text-[#101418] truncate leading-tight">
                {currentUser?.name || "Dr. Evelyn Vance"}
              </div>
              <div className="text-[10.5px] text-[#626971] truncate">
                {currentUser?.organization || "Metropolitan University"}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-1.5 px-2 rounded-[8px] bg-white hover:bg-[#F2F3EF] border border-[#E8E9E5] text-[11px] font-bold text-[#101418] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <span>🔄 Switch Portal / Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
