"use client";

import { useState, type ReactNode } from "react";
import type { Session } from "next-auth";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const MobileSidebarController = ({
  session,
  familyInviteCode,
  currentPeriod,
  hasCurrentSheet,
  children,
}: {
  session: Session;
  familyInviteCode?: string;
  currentPeriod: { month: number; year: number };
  hasCurrentSheet: boolean;
  children: ReactNode;
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        hasCurrentSheet={hasCurrentSheet}
        currentPeriod={currentPeriod}
      />
      <div className="flex w-full flex-col">
        <Header
          session={session}
          familyInviteCode={familyInviteCode}
          currentPeriod={currentPeriod}
          onToggleSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
          {children}
        </main>
      </div>
    </>
  );
};

export default MobileSidebarController;
