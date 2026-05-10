import {
  INTEGRATION_PROVIDERS,
  createIntegrationSimulationJobs,
  credentialStatusLabel,
  filterIntegrationJobsByProvider,
  getIntegrationWarnings,
  getManualPublishingInstructions,
  getNextIntegrationSetupSteps,
  integrationChannelLabel,
  integrationModeLabel,
  providerLabel,
  readinessStatusLabel,
  summarizeIntegrationReadiness,
  validateIntegrationJobReadiness,
  type IntegrationJobStatus,
  type IntegrationProvider,
  type IntegrationReadinessStatus,
  type IntegrationRiskSeverity
} from "@/lib/integrationReadiness";

const providers: IntegrationProvider[] = ["meta", "youtube", "tiktok", "website"];

const readinessClasses: Record<IntegrationReadinessStatus, string> = {
  ready_for_manual_export: "bg-green-50 text-leaf",
  simulated_only: "bg-cyan-50 text-ocean",
  needs_setup: "bg-amber-50 text-amber",
  needs_approval: "bg-amber-50 text-amber",
  blocked: "bg-red-50 text-red-700",
  future_api_candidate: "bg-indigo-50 text-indigo-700"
};

const riskClasses: Record<IntegrationRiskSeverity, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700"
};

const jobStatusClasses: Record<IntegrationJobStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  ready_for_manual_action: "bg-green-50 text-leaf",
  blocked: "bg-red-50 text-red-700",
  simulated_success: "bg-cyan-50 text-ocean",
  simulated_error: "bg-red-50 text-red-700"
};

const jobStatusLabels: Record<IntegrationJobStatus, string> = {
  draft: "Rascunho",
  ready_for_manual_action: "Pronto para ação manual",
  blocked: "Bloqueado",
  simulated_success: "Simulação concluída",
  simulated_error: "Erro simulado"
};

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function IntegrationsPage() {
  const summary = summarizeIntegrationReadiness(INTEGRATION_PROVIDERS);
  const jobs = createIntegrationSimulationJobs();
  const warnings = getIntegrationWarnings();
  const nextSetupSteps = getNextIntegrationSetupSteps(INTEGRATION_PROVIDERS);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Integrações</p>
        <h2 className="mt-1 text-2xl font-semibold">Integrações</h2>
        <p className="mt-2 text-sm text-slate-500">Preparação segura para futuras publicações em Meta, YouTube, TikTok e site.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, nenhuma integração real é executada. Não há OAuth, tokens, credenciais, upload de mídia ou publicação automática.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
        <MetricCard label="Provedores" value={summary.totalProviders} />
        <MetricCard label="Exportação manual" value={summary.readyForManualExport} />
        <MetricCard label="Somente simulado" value={summary.simulatedOnly} />
        <MetricCard label="Bloqueados" value={summary.blockedProviders} />
        <MetricCard label="Candidatos futuros" value={summary.futureApiCandidates} />
        <MetricCard label="Riscos totais" value={summary.totalRisks} />
        <MetricCard label="Riscos altos/críticos" value={summary.highOrCriticalRisks} />
        <MetricCard label="Sem credenciais" value={summary.missingCredentialProviders} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {INTEGRATION_PROVIDERS.map((provider) => (
          <article key={provider.provider} className="panel">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-slate-100 text-slate-700">{integrationModeLabel(provider.mode)}</span>
              <span className="badge bg-slate-100 text-slate-700">{credentialStatusLabel(provider.credentialStatus)}</span>
              <span className={`badge ${readinessClasses[provider.readinessStatus]}`}>{readinessStatusLabel(provider.readinessStatus)}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{provider.displayName}</h3>
            <p className="mt-2 text-sm text-slate-500">Canais suportados nesta preparação:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {provider.channels.map((channel) => (
                <span key={channel} className="badge bg-slate-100 text-slate-700">
                  {integrationChannelLabel(channel)}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">Requisitos pendentes</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {provider.requirements.filter((item) => item.status === "pending").map((requirement) => (
                    <li key={requirement.id}>- {requirement.title}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">Instruções manuais</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {provider.manualInstructions.slice(0, 4).map((instruction) => (
                    <li key={instruction}>- {instruction}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Riscos e mitigações</p>
              <div className="mt-3 space-y-3">
                {provider.risks.map((risk) => (
                  <div key={risk.id} className="text-sm text-slate-600">
                    <span className={`badge ${riskClasses[risk.severity]}`}>{risk.severity}</span>
                    <p className="mt-2 font-semibold text-ink">{risk.title}</p>
                    <p className="mt-1">{risk.description}</p>
                    <p className="mt-1"><span className="font-semibold">Mitigação:</span> {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Jobs simulados de integração</h3>
        <p className="mt-2 text-sm text-slate-500">Estes jobs usam os pacotes de exportação da Central de Publicação. Nenhum job chama API externa.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {jobs.slice(0, 8).map((job) => {
            const readiness = validateIntegrationJobReadiness(job);
            return (
              <article key={job.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{providerLabel(job.provider)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{integrationChannelLabel(job.channel)}</span>
                  <span className={`badge ${jobStatusClasses[job.status]}`}>{jobStatusLabels[job.status]}</span>
                </div>
                <h4 className="mt-3 font-semibold">{job.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{job.nextManualStep}</p>
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p><span className="font-semibold">Aprovação ética exigida:</span> {job.ethicalApprovalRequired ? "sim" : "não"}</p>
                  <p className="mt-1"><span className="font-semibold">Aprovação presente:</span> {job.hasEthicalApproval ? "sim" : "não"}</p>
                  <p className="mt-1"><span className="font-semibold">Leitura:</span> {readiness.ready ? "Pronto para ação manual." : readiness.reasons[0]}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Próximos passos de setup</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {nextSetupSteps.map((step) => (
              <li key={step}>- {step}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">O que ainda falta para automação real</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {[
              "Credenciais",
              "OAuth",
              "Permissões",
              "Upload de mídia",
              "Validação de conta",
              "Agendamento real",
              "Logs",
              "Tratamento de erro",
              "Revisão jurídica/ética",
              "Persistência"
            ].map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos de segurança</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Instruções manuais por provedor</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {providers.map((provider) => (
            <div key={provider} className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">{providerLabel(provider)}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {getManualPublishingInstructions(provider).slice(0, 4).map((instruction) => (
                  <li key={instruction}>- {instruction}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Jobs por provedor</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-4">
          {providers.map((provider) => (
            <div key={provider} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span>{providerLabel(provider)}</span>
              <span className="font-semibold">{filterIntegrationJobsByProvider(jobs, provider).length}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
