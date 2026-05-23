"use client";

import { ErrorState } from "@/components/product";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <ErrorState title="Algo saiu do eixo operacional" description="A pagina encontrou um erro local. Nenhuma informacao sensivel foi exibida; tente recarregar ou volte ao Command Center." />
      <button type="button" onClick={reset} className="mt-4 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Tentar novamente
      </button>
    </main>
  );
}
