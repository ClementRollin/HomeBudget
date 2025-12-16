import { Suspense } from "react";

import AuthSwitcher from "@/components/auth/AuthSwitcher";

const AuthPage = () => {
  return (
    <div className="space-y-8 text-center">
      <div>
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
