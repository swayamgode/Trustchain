"use client";

import React, { useState } from "react";
import { useTrustChain, type UserRole, DEFAULT_USERS } from "../../context/TrustChainContext";
import { ShieldCheckIcon, CheckCircleIcon, ArrowRightIcon } from "../ui/Icons";

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { loginAs, supabaseSyncStatus, credentials } = useTrustChain();
  const [activeTab, setActiveTab] = useState<"quick" | "form">("quick");
  const [selectedRole, setSelectedRole] = useState<UserRole>("issuer");
  const [email, setEmail] = useState("e.vance@metropolitan.edu");
  const [password, setPassword] = useState("••••••••••••");
  const [quickStudentEmail, setQuickStudentEmail] = useState("rahul.sharma@mu.edu");

  const STUDENT_PRESETS = React.useMemo(() => {
    const list = [
      { name: "Rahul Sharma", email: "rahul.sharma@mu.edu", note: "AI&DS Sem 5 (75%)" },
      { name: "Priya Patil", email: "priya.patil@mu.edu", note: "AI&DS Sem 5 (81%)" },
      { name: "Aman Shah", email: "aman.shah@mu.edu", note: "AI&DS Sem 5 (69%)" },
      { name: "Sneha Joshi", email: "sneha.joshi@mu.edu", note: "AI&DS Sem 5 (88%)" },
      { name: "Karan Mehta", email: "karan.mehta@mu.edu", note: "AI&DS Sem 5 (66%)" },
      { name: "Neha Desai", email: "neha.desai@mu.edu", note: "AI&DS Sem 5 (77%)" },
      { name: "Arjun Kulkarni", email: "arjun.kulkarni@mu.edu", note: "AI&DS Sem 5 (84%)" },
      { name: "Isha Nair", email: "isha.nair@mu.edu", note: "AI&DS Sem 5 (72%)" },
      { name: "Meera Singh", email: "meera.singh@mu.edu", note: "AI&DS Sem 5 (90%)" },
      { name: "Bhavik Jain", email: "bhavik.jain@alumni.edu", note: "Course Completion" },
      { name: "Alex Chen", email: "alex.chen@metropolitan.edu", note: "Computer Science B.S." },
      { name: "Dr. Sarah Lin", email: "sarah.lin@med.metropolitan.edu", note: "Doctor of Medicine (M.D.)" },
      { name: "David K. Vance", email: "david.vance@student.mu.edu", note: "Cloud Systems (Revoked)" },
    ];

    const map = new Map<string, { name: string; email: string; note: string }>();
    list.forEach((s) => map.set(s.email.toLowerCase(), s));

    credentials.forEach((c) => {
      if (c.recipientEmail) {
        const key = c.recipientEmail.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            name: c.subjectName || key.split("@")[0],
            email: c.recipientEmail,
            note: c.type || "Issued Credential",
          });
        }
      }
    });

    return Array.from(map.values());
  }, [credentials]);

  const handleInstantLogin = (role: UserRole) => {
    if (role === "student") {
      const match = credentials.find(
        (c) => c.recipientEmail?.toLowerCase() === quickStudentEmail.toLowerCase()
      ) || STUDENT_PRESETS.find((p) => p.email.toLowerCase() === quickStudentEmail.toLowerCase());
      const studentName =
        (match && "subjectName" in match ? match.subjectName : (match as any)?.name) ||
        quickStudentEmail.split("@")[0].replace(".", " ");
      loginAs("student", {
        email: quickStudentEmail,
        name: studentName,
        avatarLetter: studentName.slice(0, 2).toUpperCase(),
      });
      onLoginSuccess("student");
      return;
    }
    loginAs(role);
    onLoginSuccess(role);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "student") {
      const match = credentials.find(
        (c) => c.recipientEmail?.toLowerCase() === email.toLowerCase() ||
               c.subjectId?.toLowerCase().includes(email.toLowerCase())
      );
      const studentName = match ? match.subjectName : email.split("@")[0].replace(".", " ");
      loginAs("student", {
        email,
        name: studentName,
        avatarLetter: studentName.slice(0, 2).toUpperCase(),
      });
      onLoginSuccess("student");
      return;
    }
    loginAs(selectedRole);
    onLoginSuccess(selectedRole);
  };

  const setRoleAndPrefill = (role: UserRole) => {
    setSelectedRole(role);
    const user = DEFAULT_USERS[role];
    setEmail(user.email);
    setPassword("••••••••••••");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
      {/* Top Bar */}
      <header className="max-w-[1240px] w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E8E9E5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#BEF52A] flex items-center justify-center text-[#111410] font-black text-lg shadow-sm">
            <ShieldCheckIcon className="w-6 h-6 text-[#111410]" />
          </div>
          <div>
            <div className="font-extrabold text-[19px] text-[#101418] tracking-tight leading-tight flex items-center gap-2">
              TrustChain
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111410] text-[#BEF52A]">
                Gateway
              </span>
            </div>
            <div className="text-[12px] font-medium text-[#626971]">
              Decentralized Institutional Trust Infrastructure
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#159447] bg-[#E8F8E8] px-3 py-1.5 rounded-full border border-[#CEF0CE]">
          <span className="w-2 h-2 rounded-full bg-[#159447] animate-pulse" />
          <span>Ledger Ready • {supabaseSyncStatus === "connected" ? "Supabase Online" : "Local Ledger"}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1240px] w-full mx-auto py-8 sm:py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#159447] bg-[#E8F8E8] px-3 py-1 rounded-full">
            Separate Role Access
          </span>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#101418] tracking-tight">
            Select Your Institutional Portal
          </h1>
          <p className="text-[15px] text-[#626971] leading-relaxed">
            Each persona operates in an isolated environment with dedicated cryptographic tooling. Click below for instant 1-click access.
          </p>
        </div>

        {/* Tab Switcher: 1-Click Quick Access vs Custom Sign In */}
        <div className="flex justify-center">
          <div className="inline-flex items-center p-1 bg-white border border-[#E8E9E5] rounded-[14px] shadow-xs">
            <button
              onClick={() => setActiveTab("quick")}
              className={`px-5 py-2 rounded-[10px] text-[13px] font-bold transition-all ${
                activeTab === "quick"
                  ? "bg-[#111410] text-white shadow-xs"
                  : "text-[#626971] hover:text-[#101418]"
              }`}
            >
              ⚡ 1-Click Instant Login (Recommended)
            </button>
            <button
              onClick={() => setActiveTab("form")}
              className={`px-5 py-2 rounded-[10px] text-[13px] font-bold transition-all ${
                activeTab === "form"
                  ? "bg-[#111410] text-white shadow-xs"
                  : "text-[#626971] hover:text-[#101418]"
              }`}
            >
              🔑 Password Login
            </button>
          </div>
        </div>

        {/* 1-CLICK INSTANT PORTAL ACCESS */}
        {activeTab === "quick" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* 1. College / University Card */}
            <div className="bg-white border-2 border-[#111410] rounded-[24px] p-7 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#BEF52A]" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-[16px] bg-[#EFFBCB] text-[#172000] font-black text-2xl flex items-center justify-center border border-[#BEF52A]">
                    🏛️
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#172000] bg-[#EFFBCB] px-2.5 py-1 rounded-full border border-[#BEF52A]">
                    Issuer Authority
                  </span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-[#101418] tracking-tight">
                    College / University
                  </h3>
                  <div className="text-[13px] font-semibold text-[#159447] mt-0.5">
                    Metropolitan University • Registrar
                  </div>
                  <p className="text-[13px] text-[#626971] mt-2 leading-relaxed">
                    Issue verifiable academic degrees, upload authentic photocopy scans, run bulk CSV cohorts, and manage revocation accumulators.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E8E9E5] text-[12px] text-[#4B5563]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#159447] shrink-0" />
                    <span>Single & Bulk CSV Degree Issuance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#159447] shrink-0" />
                    <span>Attach Physical Degree Photocopies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#159447] shrink-0" />
                    <span>Root Keyring & Revocation Control</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInstantLogin("issuer")}
                className="w-full py-3.5 px-4 rounded-[12px] bg-[#111410] hover:bg-[#282C27] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group-hover:scale-[1.02]"
              >
                <span>⚡ 1-Click Login as College</span>
                <ArrowRightIcon className="w-4 h-4 text-[#BEF52A]" />
              </button>
            </div>

            {/* 2. Student / Recipient Card */}
            <div className="bg-white border-2 border-[#111410] rounded-[24px] p-7 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#3B82F6]" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-[16px] bg-[#EFF6FF] text-[#1E3A8A] font-black text-2xl flex items-center justify-center border border-[#93C5FD]">
                    🎓
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E3A8A] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#93C5FD]">
                    Recipient Portal
                  </span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-[#101418] tracking-tight">
                    Student / Graduate
                  </h3>
                  <div className="text-[13px] font-semibold text-[#2563EB] mt-0.5">
                    Individual Private Vault
                  </div>
                  <p className="text-[13px] text-[#626971] mt-2 leading-relaxed">
                    Access your authentic degree documents and share live verification QR codes. Strict privacy controls ensure you only see your own credentials.
                  </p>
                </div>

                {/* Persona Email Selector */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-3 rounded-[12px] space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                    Select Student Account (Test Privacy):
                  </label>
                  <select
                    value={quickStudentEmail}
                    onChange={(e) => setQuickStudentEmail(e.target.value)}
                    className="w-full text-[12px] font-bold text-[#101418] bg-white border border-[#BFDBFE] rounded-[8px] p-2 focus:outline-none cursor-pointer"
                  >
                    {STUDENT_PRESETS.map((p) => (
                      <option key={p.email} value={p.email}>
                        {p.name} ({p.email}) — {p.note}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#E8E9E5] text-[12px] text-[#4B5563]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>View Official Scanned Degree Photocopies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Live QR Code Share with Recruiters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span className="font-semibold text-[#1E3A8A]">Strict Privacy: Only your documents visible</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInstantLogin("student")}
                className="w-full py-3.5 px-4 rounded-[12px] bg-[#111410] hover:bg-[#282C27] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group-hover:scale-[1.02]"
              >
                <span>⚡ 1-Click Login as {STUDENT_PRESETS.find(p => p.email === quickStudentEmail)?.name || "Student"}</span>
                <ArrowRightIcon className="w-4 h-4 text-[#93C5FD]" />
              </button>
            </div>

            {/* 3. Corporate Recruiter / Verifier Card */}
            <div className="bg-white border-2 border-[#111410] rounded-[24px] p-7 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#F59E0B]" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-[16px] bg-[#FFFBEB] text-[#92400E] font-black text-2xl flex items-center justify-center border border-[#FDE68A]">
                    💼
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#92400E] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#FDE68A]">
                    Verifier Portal
                  </span>
                </div>

                <div>
                  <h3 className="text-[20px] font-extrabold text-[#101418] tracking-tight">
                    Corporate Recruiter
                  </h3>
                  <div className="text-[13px] font-semibold text-[#D97706] mt-0.5">
                    Global Talent Verification & HR
                  </div>
                  <p className="text-[13px] text-[#626971] mt-2 leading-relaxed">
                    Verify candidate degrees with 0% access to issuing college databases. Run interactive tamper simulations to catch fraud instantly.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E8E9E5] text-[12px] text-[#4B5563]">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>Zero-Knowledge Proof Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>Candidate Tamper Detection Sandbox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>Ed25519 Cryptographic Matrix</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInstantLogin("recruiter")}
                className="w-full py-3.5 px-4 rounded-[12px] bg-[#111410] hover:bg-[#282C27] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group-hover:scale-[1.02]"
              >
                <span>⚡ 1-Click Login as Recruiter</span>
                <ArrowRightIcon className="w-4 h-4 text-[#FDE68A]" />
              </button>
            </div>
          </div>
        ) : (
          /* PASSWORD FORM WITH 1-CLICK PREFILL PILLS */
          <div className="max-w-md mx-auto bg-white border-2 border-[#111410] rounded-[24px] p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-[20px] font-extrabold text-[#101418]">
                Institutional Portal Login
              </h2>
              <p className="text-[13px] text-[#626971] mt-1">
                Choose a persona below for 1-click credential pre-fill:
              </p>
            </div>

            {/* Quick Fill Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRoleAndPrefill("issuer")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all border ${
                  selectedRole === "issuer"
                    ? "bg-[#EFFBCB] border-[#BEF52A] text-[#172000]"
                    : "bg-[#F7F7F4] border-[#E8E9E5] text-[#626971] hover:text-[#101418]"
                }`}
              >
                🏛️ Fill College
              </button>
              <button
                type="button"
                onClick={() => setRoleAndPrefill("student")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all border ${
                  selectedRole === "student"
                    ? "bg-[#EFF6FF] border-[#93C5FD] text-[#1E3A8A]"
                    : "bg-[#F7F7F4] border-[#E8E9E5] text-[#626971] hover:text-[#101418]"
                }`}
              >
                🎓 Fill Student
              </button>
              <button
                type="button"
                onClick={() => setRoleAndPrefill("recruiter")}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all border ${
                  selectedRole === "recruiter"
                    ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                    : "bg-[#F7F7F4] border-[#E8E9E5] text-[#626971] hover:text-[#101418]"
                }`}
              >
                💼 Fill Recruiter
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#BEF52A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#626971] mb-1">
                  Passkey / Secret
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-[10px] bg-[#F7F7F4] border border-[#E8E9E5] text-[14px] text-[#101418] focus:bg-white focus:outline-none focus:border-[#BEF52A]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-[12px] bg-[#111410] hover:bg-[#282C27] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Enter {DEFAULT_USERS[selectedRole].name} Portal →</span>
              </button>
            </form>
          </div>
        )}

        {/* Peer Node Consensus Option */}
        <div className="text-center pt-4">
          <button
            onClick={() => handleInstantLogin("network")}
            className="text-[12px] font-semibold text-[#626971] hover:text-[#101418] underline underline-offset-4 cursor-pointer"
          >
            Looking for Consensus Validator & Node Operations? 1-Click Node Access →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1240px] w-full mx-auto text-center pt-6 border-t border-[#E8E9E5] text-[12px] text-[#8A9097]">
        TrustChain Institutional Protocol • Production Verifiable Credentials Engine (W3C standard & Ed25519)
      </footer>
    </div>
  );
}
