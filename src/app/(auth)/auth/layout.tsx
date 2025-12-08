import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1e293b,black)] p-6 text-white">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl">
      {children}
    </div>
  </div>
);

export default AuthLayout;
