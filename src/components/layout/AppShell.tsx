"use client";

import { useState, type ReactNode } from "react";
import type { Session } from "next-auth";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const AppShell = ({ session, children }: { session: Session; children: ReactNode }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex w-full flex-col">
        <Header session={session} onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
