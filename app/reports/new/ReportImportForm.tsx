"use client";

import { useFormState, useFormStatus } from "react-dom";
import { importReport, type ImportReportState } from "@/app/reports/new/actions";

const initialImportReportState: ImportReportState = {
  error: null,
  rawText: ""
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Analisando..." : "Analisar e salvar relatório"}
    </button>
  );
}

export function ReportImportForm() {
  const [state, formAction] = useFormState(importReport, initialImportReportState);

  return (
    <form action={formAction} className="panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Importar novo relatório</h2>
        <p className="mt-1 text-sm text-slate-500">Cole estatísticas agregadas de Reportei, Meta Ads, Google Ads ou Instagram orgânico. Use apenas dados de marketing consolidados.</p>
        <p className="mt-2 rounded-md bg-cyan-50 p-3 text-sm text-ocean">
          Não cole nomes, telefones, DMs, dados de pacientes ou informações clínicas.
        </p>
      </div>
      {state.error ? (
        <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-medium text-danger" role="alert">
          {state.error}
        </div>
      ) : null}
      <textarea
        name="rawText"
        required
        rows={20}
        defaultValue={state.rawText}
        className="w-full rounded-lg border border-slate-300 bg-white p-4 font-mono text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-cyan-100"
        placeholder="Cole aqui o relatório bruto com estatísticas agregadas de marketing. Não inclua nomes, contatos, DMs, prontuários ou qualquer dado de paciente."
      />
      <SubmitButton />
    </form>
  );
}
