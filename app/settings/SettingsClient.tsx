"use client";

import { useState } from "react";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { useMarketingWorkspace } from "@/components/workspace/useMarketingWorkspace";
import { normalizeWorkspaceSettings } from "@/lib/marketing-workspace";

export function SettingsClient() {
  const { workspace, exports, persist, resetLocalWorkspace, storageStatus } = useMarketingWorkspace();
  const [confirmReset, setConfirmReset] = useState(false);

  function updateWeekStartsOn(value: "domingo" | "segunda") {
    persist({ ...workspace, settings: normalizeWorkspaceSettings({ ...workspace.settings, weekStartsOn: value }) });
  }

  function updateIntensity(value: "leve" | "padrao" | "intensa") {
    persist({ ...workspace, settings: normalizeWorkspaceSettings({ ...workspace.settings, defaultEditorialIntensity: value }) });
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v8</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Configuracoes Locais</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Preferencias locais do workspace. Nao ha token, senha, API, paciente, prontuario ou integracao real.</p>
          </div>
          <LocalCopyButton text={exports.backupJson} label="Copiar backup antes de limpar" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Preferencias</p>
          <h3 className="mt-1 text-lg font-semibold">{workspace.settings.workspaceName}</h3>
          <div className="mt-4 grid gap-4">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Semana comeca em</span>
              <select value={workspace.settings.weekStartsOn} onChange={(event) => updateWeekStartsOn(event.target.value as "domingo" | "segunda")} className="w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="domingo">Domingo</option>
                <option value="segunda">Segunda</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-700">Intensidade editorial</span>
              <select value={workspace.settings.defaultEditorialIntensity} onChange={(event) => updateIntensity(event.target.value as "leve" | "padrao" | "intensa")} className="w-full rounded-md border border-slate-300 px-3 py-2">
                <option value="leve">Leve</option>
                <option value="padrao">Padrao</option>
                <option value="intensa">Intensa</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <p className="text-sm font-medium text-ocean">Seguranca local</p>
          <h3 className="mt-1 text-lg font-semibold">{storageStatus}</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>- Modo seguro: {workspace.settings.safetyLimits.safeMode ? "ativo" : "inativo"}</li>
            <li>- Bloqueio de dados sensiveis: {workspace.settings.safetyLimits.blockSensitiveData ? "ativo" : "inativo"}</li>
            <li>- Confirmacao antes de restore: {workspace.settings.safetyLimits.requireRestoreConfirmation ? "ativa" : "inativa"}</li>
            <li>- Retencao de snapshots: {workspace.settings.snapshotRetention}</li>
          </ul>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <input type="checkbox" checked={confirmReset} onChange={(event) => setConfirmReset(event.target.checked)} />
              Confirmo que ja exportei backup local antes de limpar
            </label>
            <button type="button" onClick={() => resetLocalWorkspace(confirmReset)} className="mt-3 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Limpar dados locais
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}
