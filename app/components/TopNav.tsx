"use client";

import { useState } from "react";
import { SearchIcon, CheckCircleIcon } from "./ui/Icons";
import { useTrustChain, type UserRole } from "../context/TrustChainContext";

interface TopNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function TopNav({ activeScreen, onNavigate }: TopNavProps) {
  const {
    activeRole,
    currentUser,
    logout,
    loginAs,
    activeInstitution,
    setActiveInstitution,
    institutions,
    supabaseSyncStatus,
    supabaseStatusMessage,
    syncWithSupabase,
  } = useTrustChain();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  return (
    <header className="h-[74px] bg-white border-b border-[#E8E9E5] px-6 flex items-center justify-between shrink-0 z-10 gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-[420px]">
        <div className="relative flex items-center">
          <SearchIcon className="w-4 h-4 text-[#8A9097] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeRole === "student"
                ? "Search my credentials or verify link..."
                : activeRole === "recruiter"
                ? "Enter candidate DID or credential ID to verify..."
                : "Search registered student credentials, DIDs, or keys... (⌘K)"
            }
            className="w-full h-[40px] pl-10 pr-12 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[13px] text-[#101418] placeholder-[#8A9097] focus:bg-white focus:outline-none focus:border-[#A9DF16] focus:ring-1 focus:ring-[#A9DF16] transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (activeRole === "student") onNavigate("student");
                else if (activeRole === "recruiter") onNavigate("verify");
                else onNavigate("registry");
              }
            }}
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-[#8A9097] bg-white border border-[#E8E9E5] rounded shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Cloud Sync Indicator */}
        <button
          onClick={() => syncWithSupabase()}
          title={`Supabase: ${supabaseStatusMessage} (Click to refresh)`}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] border text-[11px] font-medium transition-all shadow-2xs hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor:
              supabaseSyncStatus === "connected"
                ? "#F0FDF4"
                : supabaseSyncStatus === "tables_missing"
                ? "#FFFBEB"
                : "#F8FAFC",
            borderColor:
              supabaseSyncStatus === "connected"
                ? "#BBF7D0"
                : supabaseSyncStatus === "tables_missing"
                ? "#FDE68A"
                : "#E2E8F0",
            color:
              supabaseSyncStatus === "connected"
                ? "#15803D"
                : supabaseSyncStatus === "tables_missing"
                ? "#B45309"
                : "#475569",
          }}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseSyncStatus === "connected"
                ? "bg-[#16A34A] animate-pulse"
                : supabaseSyncStatus === "tables_missing"
                ? "bg-[#D97706]"
                : "bg-[#94A3B8]"
            }`}
          />
          <span className="font-semibold">
            {supabaseSyncStatus === "connected"
              ? "Cloud DB"
              : supabaseSyncStatus === "tables_missing"
              ? "Pending DB"
              : "Local DB"}
          </span>
        </button>

        {/* Role-Specific Primary Action Button */}
        {activeRole === "issuer" && (
          <button
            onClick={() => onNavigate("issue")}
            className="hidden sm:inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[10px] bg-[#111410] text-white text-[13px] font-semibold hover:bg-[#282C27] interactive shadow-xs shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#BEF52A]"></span>
            <span>Issue Degree</span>
          </button>
        )}

        {activeRole === "student" && (
          <button
            onClick={() => onNavigate("student")}
            className="hidden sm:inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[10px] bg-[#111410] text-white text-[13px] font-semibold hover:bg-[#282C27] interactive shadow-xs shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
            <span>Share My QR</span>
          </button>
        )}

        {activeRole === "recruiter" && (
          <button
            onClick={() => onNavigate("verify")}
            className="hidden sm:inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[10px] bg-[#111410] text-white text-[13px] font-semibold hover:bg-[#282C27] interactive shadow-xs shrink-0 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span>Verify Candidate</span>
          </button>
        )}

        {/* Switch Account / Logout Button */}
        <button
          onClick={logout}
          title="Switch persona or logout to gateway"
          className="flex items-center gap-1.5 h-[38px] px-3 rounded-[10px] border border-[#E8E9E5] bg-white hover:bg-[#F2F3EF] text-[#101418] text-[12px] font-bold transition-all cursor-pointer shadow-2xs"
        >
          <span>🔄</span>
          <span className="hidden sm:inline">Logout / Switch</span>
        </button>
      </div>
    </header>
  );
}
