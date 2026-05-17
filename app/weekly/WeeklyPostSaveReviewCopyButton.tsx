"use client";

import { useState } from "react";

export function WeeklyPostSaveReviewCopyButton({ copyText, label = "Copiar pacote" }: { copyText: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPacket() {
    if (!navigator.clipboard) {
      setCopied(false);
      return;
    }

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={copyPacket} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        {label}
      </button>
      {copied ? <p className="text-xs font-medium text-leaf">Pacote copiado para revisao manual.</p> : null}
    </div>
  );
}
