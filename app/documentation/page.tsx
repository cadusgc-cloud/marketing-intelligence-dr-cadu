import Link from "next/link";
import { AppShell, PageHeader, SectionHeader, StatusBadge } from "@/components/product";
import { V10_EXPECTED_DOCS, V10_EXPECTED_SCRIPTS } from "@/lib/release-polish";

const docsByVersion = [
  ["V4", "docs/MARKETING_OS_V4_QA_DOGFOODING.md"],
  ["V5", "docs/MARKETING_OS_V5_CONTENT_STUDIO.md"],
  ["V6", "docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md"],
  ["V7", "docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md"],
  ["V8", "docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
  ["V9", "docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md"],
  ["V10", "docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"]
];

const reportFolders = ["reports/marketing-os-v4", "reports/marketing-os-v5", "reports/marketing-os-v6", "reports/marketing-os-v7", "reports/marketing-os-v8", "reports/marketing-os-v9", "reports/marketing-os-v10"];

export default function DocumentationPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketing OS v10"
        title="Documentacao"
        description="Hub local de documentos versionados, relatorios, scripts de validacao e troubleshooting. A rota usa manifesto estatico e nao le arquivos em runtime."
        actions={[
          { href: "/release", label: "Ver release", tone: "primary" },
          { href: "/onboarding", label: "Primeiros passos" }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <SectionHeader eyebrow="Docs principais" title="Linha historica V4-V10" description="Documentos markdown versionados para entender cada camada do produto." />
          <div className="mt-4 space-y-2">
            {docsByVersion.map(([version, path]) => (
              <article key={path} className="rounded-md bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={version} tone="info" />
                  <code className="text-xs text-slate-600">{path}</code>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <SectionHeader eyebrow="Relatorios" title="Pacotes versionados" description="Snapshots de QA, readiness, exports e auditorias por fase." />
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {reportFolders.map((folder) => (
              <div key={folder} className="rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">{folder}</div>
            ))}
          </div>
        </section>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Scripts" title="Validacao local recomendada" description="Rode antes de abrir PR. Nada faz push, merge, deploy ou chamada externa." />
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {V10_EXPECTED_SCRIPTS.map((script) => (
            <code key={script} className="rounded-md bg-slate-950 p-2 text-xs text-slate-50">{script}</code>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <SectionHeader eyebrow="Troubleshooting" title="Quando algo nao abrir" description="Sequencia curta para recuperar a rotina local." />
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Reiniciar o dev server na porta 3010.</li>
            <li>Se o CSS sumir ou o servidor travar, parar o processo antigo e limpar apenas o cache .next.</li>
            <li>Rodar npm run health:routes e depois npm run health:routes:local.</li>
            <li>Abrir /command-center para retomar a proxima acao.</li>
          </ol>
        </section>
        <section className="panel">
          <SectionHeader eyebrow="Docs esperadas V10" title="Prontidao documental" description="Lista usada no release polish." />
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {V10_EXPECTED_DOCS.slice(0, 10).map((doc) => <li key={doc}>- {doc}</li>)}
          </ul>
          <Link href="/release" className="mt-4 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Abrir release</Link>
        </section>
      </section>
    </AppShell>
  );
}
