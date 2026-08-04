import type { ReactNode } from "react";
import type { Session } from "next-auth";

import MobileSidebarController from "@/components/layout/MobileSidebarController";

const AppShell = ({
  session,
  familyInviteCode,
  currentPeriod,
  children,
}: {
  session: Session;
  familyInviteCode?: string;
  currentPeriod: { month: number; year: number };
  children: ReactNode;
}) => (
  <div className="flex min-h-screen bg-background text-white">
    <MobileSidebarController
      session={session}
      familyInviteCode={familyInviteCode}
      currentPeriod={currentPeriod}
    >
      {children}
    </MobileSidebarController>
  </div>
);

export default AppShell;
