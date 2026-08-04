"use client";

import { useState } from "react";

const CopyInviteCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallback(true);
    }
  };

  if (fallback) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Code famille :</span>
        <input
          readOnly
          value={code}
          onFocus={e => e.target.select()}
          className="rounded border border-white/10 bg-black/30 px-2 py-0.5 font-semibold text-slate-200"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-slate-500 transition hover:text-slate-300"
      title="Copier le code famille"
    >
      Code famille : <span className="font-semibold text-slate-200">{code}</span>
      {copied ? (
        <span className="ml-1 text-accent">✓ Copié</span>
      ) : (
        <span className="ml-1 opacity-50">(copier)</span>
      )}
    </button>
  );
};

export default CopyInviteCodeButton;
