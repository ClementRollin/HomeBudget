import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriod } from "@/lib/sheets";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { inviteCode: true, onboardingCompletedAt: true },
  });

  if (!family) {
    console.warn(`[AppLayout] Family not found for familyId=${session.user.familyId} — data integrity issue`);
  }

  if (!family?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const currentPeriod = getCurrentPeriod();

  const hasCurrentSheet = !!(await prisma.sheet.findFirst({
    where: {
      familyId: session.user.familyId,
      year: currentPeriod.year,
      month: currentPeriod.month,
    },
    select: { id: true },
  }));

  return (
    <AppShell
      session={session}
      familyInviteCode={family?.inviteCode ?? undefined}
      currentPeriod={currentPeriod}
      hasCurrentSheet={hasCurrentSheet}
    >
      {children}
    </AppShell>
  );
};

export default AppLayout;
