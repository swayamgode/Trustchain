"use client";

import { useState } from "react";
import { SearchIcon, BellIcon, ShieldCheckIcon, CheckCircleIcon } from "./ui/Icons";
import { useTrustChain, type UserRole } from "../context/TrustChainContext";

interface TopNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function TopNav({ activeScreen, onNavigate }: TopNavProps) {
  const { activeRole, setActiveRole, activeInstitution, setActiveInstitution, institutions } = useTrustChain();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const ROLES: { id: UserRole; label: string; screen: string }[] = [
    { id: "issuer", label: "🏛️ College Issuer", screen: "issue" },
    { id: "student", label: "🎓 Student (QR)", screen: "student" },
    { id: "recruiter", label: "💼 Recruiter Verifier", screen: "verify" },
    { id: "network", label: "🌐 Peer Institution", screen: "network" },
  ];

  return (
    <header className="h-[74px] bg-white border-b border-[#E8E9E5] px-6 flex items-center justify-between shrink-0 z-10 gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-[420px]">
        <div className="relative flex items-center">
          <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student credentials, DIDs, or keys... (⌘K)"
            className="w-full h-[40px] pl-10 pr-12 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] placeholder-[#8A9097] focus:bg-white focus:outline-none focus:border-[#A9DF16] focus:ring-1 focus:ring-[#A9DF16] transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onNavigate("registry");
              }
            }}
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-[#8A9097] bg-white border border-[#E8E9E5] rounded shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Role Switcher Pills (User Flow switcher) */}
      <div className="hidden lg:flex items-center gap-1 bg-[#F7F7F4] p-1 rounded-[12px] border border-[#E8E9E5]">
        {ROLES.map((r) => {
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                setActiveRole(r.id);
                onNavigate(r.screen);
              }}
              className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all ${
                isActive
                  ? "bg-[#111410] text-white shadow-xs"
                  : "text-[#626971] hover:text-[#101418]"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Issue Button */}
        <button
          onClick={() => onNavigate("issue")}
          className="hidden sm:inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[10px] bg-[#111410] text-white text-[13px] font-medium hover:bg-[#282C27] interactive shadow-xs shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-[#BEF52A]"></span>
          <span>Issue Record</span>
        </button>

        {/* Institution Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-[10px] hover:bg-[#F2F3EF] border border-[#E8E9E5] transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-[#EFFBCB] text-[#172000] font-bold text-[11px] flex items-center justify-center">
              {activeInstitution.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[12px] font-semibold text-[#101418] leading-tight flex items-center gap-1">
                {activeInstitution.name}
                <CheckCircleIcon className="w-3 h-3 text-[#159447]" />
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-[#8A9097]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSwitchMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E8E9E5] rounded-[14px] shadow-lg p-2 z-30 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A9097]">
                Switch Active College / Issuer
              </div>
              {institutions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setActiveInstitution(inst);
                    setShowSwitchMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-[8px] transition-colors flex items-center justify-between ${
                    activeInstitution.id === inst.id
                      ? "bg-[#EFFBCB] text-[#172000] font-semibold"
                      : "hover:bg-[#F2F3EF] text-[#101418]"
                  }`}
                >
                  <div>
                    <div className="text-[13px]">{inst.name}</div>
                    <div className="text-[11px] text-[#626971] truncate max-w-[200px]">
                      {inst.did}
                    </div>
                  </div>
                  {activeInstitution.id === inst.id && (
                    <span className="w-2 h-2 rounded-full bg-[#159447]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
