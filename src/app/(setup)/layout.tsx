import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SetupLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/");

  const family = await prisma.family.findUnique({
    where: { id: session.user.familyId },
    select: { onboardingCompletedAt: true },
  });

  if (family?.onboardingCompletedAt) redirect("/dashboard");

  return <>{children}</>;
};

export default SetupLayout;
