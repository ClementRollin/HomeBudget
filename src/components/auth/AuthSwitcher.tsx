"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const AuthSwitcher = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="space-y-8">
      <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-black/60 text-white" : "text-slate-400"}`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-black/60 text-white" : "text-slate-400"}`}
        >
          Inscription
        </button>
      </div>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
};

export default AuthSwitcher;
