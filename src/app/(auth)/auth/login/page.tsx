import { Suspense } from "react";
import Image from "next/image";

import AuthSwitcher from "@/components/auth/AuthSwitcher";

const AuthPage = () => {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="HomeBudget"
            width={240}
            height={160}
            className="w-48 h-auto rounded-3xl border border-white/10 bg-black/30"
            priority
          />
        </div>
        <p className="text-xs uppercase tracking-[0.3rem] text-slate-500">HomeBudget</p>
        <h1 className="text-3xl font-semibold text-white">Connexion &amp; Inscription</h1>
        <p className="text-sm text-slate-400">
          Creez votre famille ou rejoignez-la grace a son code d&apos;invitation.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-slate-400">Chargement...</p>}>
        <AuthSwitcher />
      </Suspense>
      <p className="text-xs text-slate-500">
        Une fois connecte, vous accederez a un espace partage par famille.
      </p>
    </div>
  );
};

export default AuthPage;
