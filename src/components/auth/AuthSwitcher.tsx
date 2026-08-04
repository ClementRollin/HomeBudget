"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const AuthSwitcher = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") === "register" ? "register" : "login") as "login" | "register";

  const setMode = (m: "login" | "register") => {
    const params = new URLSearchParams(searchParams.toString());
    if (m === "register") {
      params.set("mode", "register");
    } else {
      params.delete("mode");
    }
    router.replace(`/?${params.toString()}`);
  };

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
