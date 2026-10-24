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
} from "./ui/Icons";

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: OverviewIcon },
    { id: "verify", label: "Verify Credential", icon: VerifyIcon },
    { id: "issue", label: "Issue Credential", icon: IssueIcon },
    { id: "registry", label: "Credentials", icon: CredentialsIcon, badge: "14.8k" },
    { id: "institutions", label: "Institutions", icon: InstitutionsIcon },
    { id: "revocation", label: "Revocation", icon: RevocationIcon },
    { id: "network", label: "Trust Network", icon: NetworkIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <aside
      className="w-[274px] shrink-0 bg-white border-r border-[#E8E9E5] flex flex-col justify-between h-full select-none z-20"
      style={{ minWidth: "274px" }}
    >
      {/* Top Brand */}
      <div>
        <div className="h-[74px] px-6 border-b border-[#E8E9E5] flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#BEF52A] flex items-center justify-center text-[#111410] font-black text-base shadow-sm">
            <ShieldCheckIcon className="w-5 h-5 text-[#111410]" />
          </div>
          <div>
            <div className="font-extrabold text-[17px] text-[#101418] tracking-tight leading-tight flex items-center gap-1.5">
              TrustChain
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F2F3EF] text-[#626971]">
                SaaS
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#8A9097] tracking-tight">
              Institutional Trust Protocol
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A9097] px-3 mb-2">
            Main Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all text-left relative ${
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
                      className={`w-[19px] h-[19px] ${
                        isActive ? "text-[#172000]" : "text-[#8A9097]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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

      {/* Bottom Infrastructure Status Card */}
      <div className="p-4 border-t border-[#E8E9E5]">
        <div className="bg-[#F7F7F4] border border-[#E8E9E5] rounded-[14px] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159447] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159447]"></span>
              </span>
              <span className="text-[12px] font-semibold text-[#101418]">
                Trust Network
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#159447] bg-[#E8F8E8] px-2 py-0.5 rounded-full">
              Healthy
            </span>
          </div>

          <div className="text-[12px] text-[#626971] flex justify-between pt-1 border-t border-[#E8E9E5]/70">
            <span>Connected Nodes</span>
            <span className="font-semibold text-[#101418]">128</span>
          </div>
          <div className="text-[12px] text-[#626971] flex justify-between pt-1">
            <span>Avg Proof Latency</span>
            <span className="font-semibold text-[#101418]">38 ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
