"use client";

import { useState } from "react";

export function LocalCopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex w-fit rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
