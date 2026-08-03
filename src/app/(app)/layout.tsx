import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { inviteCode: true },
  });

  return (
    <AppShell session={session} familyInviteCode={family?.inviteCode ?? undefined}>
      {children}
    </AppShell>
  );
};

export default AppLayout;
