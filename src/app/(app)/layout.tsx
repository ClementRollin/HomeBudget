import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getCurrentSession } from "@/lib/auth";

const AppLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <div className="flex w-full flex-col">
        <Header />
        <main className="flex-1 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
