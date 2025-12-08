"use client";

import { signOut } from "next-auth/react";

const SignOutButton = () => {
  const handleClick = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Déconnexion
    </button>
  );
};

export default SignOutButton;
