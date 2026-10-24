"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import dynamic from "next/dynamic";
import { TrustChainProvider } from "../context/TrustChainContext";

const OverviewScreen = dynamic(() => import("./screens/OverviewScreen"), { ssr: false });
const VerifyScreen = dynamic(() => import("./screens/VerifyScreen"), { ssr: false });
const CrossValidationScreen = dynamic(() => import("./screens/CrossValidationScreen"), { ssr: false });
const IssueScreen = dynamic(() => import("./screens/IssueScreen"), { ssr: false });
const StudentPortalScreen = dynamic(() => import("./screens/StudentPortalScreen"), { ssr: false });
const RegistryScreen = dynamic(() => import("./screens/RegistryScreen"), { ssr: false });
const InstitutionsScreen = dynamic(() => import("./screens/InstitutionsScreen"), { ssr: false });
const RevocationScreen = dynamic(() => import("./screens/RevocationScreen"), { ssr: false });
const AuditScreen = dynamic(() => import("./screens/AuditScreen"), { ssr: false });
const NetworkScreen = dynamic(() => import("./screens/NetworkScreen"), { ssr: false });
const SettingsScreen = dynamic(() => import("./screens/SettingsScreen"), { ssr: false });

export default function AppShell() {
  const [activeScreen, setActiveScreen] = useState("overview");

  const renderScreen = () => {
    switch (activeScreen) {
      case "overview":
        return <OverviewScreen onNavigate={setActiveScreen} />;
      case "cross-validation":
        return <CrossValidationScreen onNavigate={setActiveScreen} />;
      case "verify":
        return <VerifyScreen onNavigate={setActiveScreen} />;
      case "issue":
        return <IssueScreen onNavigate={setActiveScreen} />;
      case "student":
        return <StudentPortalScreen onNavigate={setActiveScreen} />;
      case "registry":
        return <RegistryScreen onNavigate={setActiveScreen} />;
      case "institutions":
        return <InstitutionsScreen onNavigate={setActiveScreen} />;
      case "revocation":
        return <RevocationScreen onNavigate={setActiveScreen} />;
      case "audit":
        return <AuditScreen onNavigate={setActiveScreen} />;
      case "network":
        return <NetworkScreen onNavigate={setActiveScreen} />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <OverviewScreen onNavigate={setActiveScreen} />;
    }
  };

  return (
    <TrustChainProvider>
      <div className="flex h-screen overflow-hidden bg-[#F7F7F4]">
        {/* 274px Fixed Sidebar */}
        <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#F7F7F4]">
          <TopNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
          <main className="flex-1 overflow-y-auto bg-[#F7F7F4]">
            {renderScreen()}
          </main>
        </div>
      </div>
    </TrustChainProvider>
  );
}
