"use client";

import { useState } from "react";

const CopyInviteCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
    >
      {copied ? "Code copie" : "Copier"}
    </button>
  );
};

export default CopyInviteCodeButton;
