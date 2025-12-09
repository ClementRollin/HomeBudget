import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { getCurrentSession } from "@/lib/auth";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  return <AppShell session={session}>{children}</AppShell>;
};

export default AppLayout;
