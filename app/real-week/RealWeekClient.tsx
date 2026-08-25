"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  buildRealWeekBaseline,
  buildRealWeekPanel,
  buildRealWeekStoredData,
  decodeMetaCsvBuffer,
  formatBrDate,
  formatBrNumber,
  parseMetaAccountCsv,
  parseMetaContentCsv,
  type MetaAccountParseResult,
  type MetaContentParseResult,
  type RealWeekPanel,
  type RealWeekStoredData
} from "@/lib/real-week";
import {
  clearRealWeekLocalStorage,
  loadRealWeekFromLocalStorage,
  saveRealWeekToLocalStorage
} from "@/lib/real-week/client/realWeekStorage";

type AccountReport = { label: string; text: string };

export function RealWeekClient() {
  const [contentText, setContentText] = useState("");
  const [contentLabel, setContentLabel] = useState<string | null>(null);
  const [accountReports, setAccountReports] = useState<AccountReport[]>([]);
  const [accountDraft, setAccountDraft] = useState("");
  const [stored, setStored] = useState<RealWeekStoredData | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const result = loadRealWeekFromLocalStorage();
    if (result.data) setStored(result.data);
    if (result.error) setStorageMessage(`Dados salvos nao puderam ser lidos: ${result.error}`);
  }, []);

  const contentResult: MetaContentParseResult | null = useMemo(
    () => (contentText.trim() ? parseMetaContentCsv(contentText) : null),
    [contentText]
  );
  const accountResults: Array<{ label: string; result: MetaAccountParseResult }> = useMemo(
    () => accountReports.map((report) => ({ label: report.label, result: parseMetaAccountCsv(report.text) })),
    [accountReports]
  );

  const previewPosts = contentResult?.ok ? contentResult.posts : [];
  const previewDays = accountResults.flatMap((item) => (item.result.ok ? item.result.days : []));
  const hasPreview = previewPosts.length > 0 || previewDays.length > 0;

  const previewPanel = useMemo(
    () => (hasPreview ? buildRealWeekPanel(previewPosts, previewDays) : null),
    [hasPreview, previewPosts, previewDays]
  );
  const storedPanel = useMemo(
    () => (stored ? buildRealWeekPanel(stored.posts, stored.days) : null),
    [stored]
  );

  const activePanel: RealWeekPanel | null = previewPanel ?? storedPanel;
  const activeSource = previewPanel ? "previa" : storedPanel ? "salvo" : null;
  const baseline = useMemo(() => (activePanel ? buildRealWeekBaseline(activePanel) : null), [activePanel]);

  // Ler bytes: os cartoes de Insights > Resultados saem em UTF-16.
  async function readCsvFile(file: File): Promise<string> {
    return decodeMetaCsvBuffer(new Uint8Array(await file.arrayBuffer()));
  }

  async function handleContentFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setContentText(await readCsvFile(file));
    setContentLabel(file.name);
  }

  async function handleAccountFiles(files: FileList | null) {
    if (!files?.length) return;
    const loaded: AccountReport[] = [];
    for (const file of Array.from(files)) {
      loaded.push({ label: file.name, text: await readCsvFile(file) });
    }
    setAccountReports((current) => [...current, ...loaded]);
  }

  function addPastedAccountReport() {
    if (!accountDraft.trim()) return;
    setAccountReports((current) => [...current, { label: `colado ${current.length + 1}`, text: accountDraft }]);
    setAccountDraft("");
  }

  function handleSave() {
    if (!previewPanel || previewPosts.length === 0) {
      setStorageMessage("Importe primeiro o CSV de Conteudo com posts validos antes de salvar.");
      return;
    }
    const data = buildRealWeekStoredData({
      posts: previewPosts,
      days: previewDays,
      importedAt: new Date().toISOString(),
      contentLabel,
      accountLabel: accountReports.map((report) => report.label).join(", ") || null
    });
    const result = saveRealWeekToLocalStorage(data);
    if (!result.ok) {
      setStorageMessage(`Nao consegui salvar no navegador: ${result.error}`);
      return;
    }
    setStored(data);
    setContentText("");
    setContentLabel(null);
    setAccountReports([]);
    setStorageMessage("Semana real salva neste navegador. O dashboard ja mostra os numeros reais.");
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearRealWeekLocalStorage();
    setStored(null);
    setConfirmClear(false);
    setStorageMessage("Dados reais removidos deste navegador.");
  }

  function handleDownloadBaseline() {
    if (!baseline) return;
    const blob = new Blob([baseline.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "baseline-equipe-atual.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Semana Real 001</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Semana real - Meta Business Suite</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Importe os CSVs exportados manualmente do Meta Business Suite (Insights &gt; Conteudo e Insights &gt; Resultados).
              Tudo roda neste navegador: nenhum dado sai da sua maquina e nenhuma API externa e chamada.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/imports" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Importacao guiada
            </Link>
            <Link href="/" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {storageMessage ? (
        <p className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">{storageMessage}</p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Passo 1</p>
          <h3 className="mt-1 text-lg font-semibold">CSV de Conteudo (posts)</h3>
          <p className="mt-1 text-sm text-slate-600">
            No Meta Business Suite: Insights &gt; Conteudo &gt; Exportar dados (ultimos 30 dias). Envie o arquivo ou cole o texto.
          </p>
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="real-week-content-file">
            Enviar arquivo CSV
          </label>
          <input
            id="real-week-content-file"
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={(event) => void handleContentFile(event.target.files)}
            className="mt-2 block w-full text-sm text-slate-600"
          />
          {contentLabel ? <p className="mt-1 text-xs text-slate-500">Arquivo carregado: {contentLabel}</p> : null}
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="real-week-content-text">
            Ou cole o conteudo do CSV
          </label>
          <textarea
            id="real-week-content-text"
            value={contentText}
            onChange={(event) => {
              setContentText(event.target.value);
              setContentLabel(null);
            }}
            placeholder="Cole aqui o CSV de Insights > Conteudo"
            className="mt-2 min-h-[160px] w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 outline-none focus:border-ocean"
          />
          <ImportFeedback
            okSummary={contentResult?.ok ? `${contentResult.posts.length} post(s) reconhecido(s).` : null}
            errors={contentResult?.errors.map((error) => `${error.message}${error.hint ? ` ${error.hint}` : ""}`) ?? []}
            warnings={contentResult?.warnings ?? []}
          />
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Passo 2 (opcional)</p>
          <h3 className="mt-1 text-lg font-semibold">CSV de Resultados (conta por dia)</h3>
          <p className="mt-1 text-sm text-slate-600">
            No Meta Business Suite: Insights &gt; Resultados &gt; Exportar. Traz alcance por dia e seguidores. Pode enviar mais de um
            arquivo (um de alcance e um de seguidores).
          </p>
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="real-week-account-file">
            Enviar arquivo(s) CSV
          </label>
          <input
            id="real-week-account-file"
            type="file"
            accept=".csv,text/csv,text/plain"
            multiple
            onChange={(event) => {
              void handleAccountFiles(event.target.files);
              event.target.value = "";
            }}
            className="mt-2 block w-full text-sm text-slate-600"
          />
          <label className="mt-4 block text-sm font-semibold text-ink" htmlFor="real-week-account-text">
            Ou cole o conteudo do CSV e adicione
          </label>
          <textarea
            id="real-week-account-text"
            value={accountDraft}
            onChange={(event) => setAccountDraft(event.target.value)}
            placeholder="Cole aqui um CSV de Insights > Resultados"
            className="mt-2 min-h-[100px] w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 outline-none focus:border-ocean"
          />
          <button
            type="button"
            onClick={addPastedAccountReport}
            className="mt-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Adicionar relatorio colado
          </button>

          {accountResults.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {accountResults.map((item, index) => (
                <li key={`${item.label}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => setAccountReports((current) => current.filter((_, i) => i !== index))}
                      className="text-xs font-semibold text-slate-500 hover:text-red-600"
                    >
                      Remover
                    </button>
                  </div>
                  <ImportFeedback
                    okSummary={item.result.ok ? `${item.result.days.length} dia(s) reconhecido(s).` : null}
                    errors={item.result.errors.map((error) => `${error.message}${error.hint ? ` ${error.hint}` : ""}`)}
                    warnings={item.result.warnings}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {activePanel && baseline ? (
        <>
          <section className="panel border-2 border-emerald-300 bg-emerald-50/40">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                    Dados reais
                  </span>
                  Semana real importada do Meta Business Suite
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  Painel semanal ({activeSource === "previa" ? "previa, ainda nao salva" : "salvo neste navegador"})
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Periodo: {activePanel.periodStart ? formatBrDate(activePanel.periodStart) : "-"} a {activePanel.periodEnd ? formatBrDate(activePanel.periodEnd) : "-"}.
                  Estes numeros vem dos CSVs importados, nao dos dados de demonstracao.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSource === "previa" ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Salvar semana real no navegador
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    {confirmClear ? "Confirmar remocao dos dados" : "Limpar dados salvos"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Semana</th>
                    <th className="px-3 py-2">Posts</th>
                    <th className="px-3 py-2">Alcance dos posts</th>
                    <th className="px-3 py-2">Alcance medio/post</th>
                    <th className="px-3 py-2">Curtidas</th>
                    <th className="px-3 py-2">Comentarios</th>
                    <th className="px-3 py-2">Compartilhamentos</th>
                    <th className="px-3 py-2">Salvamentos</th>
                    <th className="px-3 py-2">Engajamento</th>
                    <th className="px-3 py-2">Alcance da conta</th>
                    <th className="px-3 py-2">Seguidores</th>
                  </tr>
                </thead>
                <tbody>
                  {activePanel.weeks.map((week) => (
                    <tr key={week.weekStart} className="border-t border-emerald-100">
                      <td className="px-3 py-2 font-medium text-ink">{week.label}</td>
                      <td className="px-3 py-2">{week.posts}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.reachTotal)}</td>
                      <td className="px-3 py-2">{week.reachAvgPerPost === null ? "-" : formatBrNumber(week.reachAvgPerPost)}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.likes)}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.comments)}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.shares)}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.saves)}</td>
                      <td className="px-3 py-2">{formatBrNumber(week.engagementTotal)}</td>
                      <td className="px-3 py-2">{week.accountReach === null ? "-" : formatBrNumber(week.accountReach)}</td>
                      <td className="px-3 py-2">
                        {week.followerGrowth === null ? "-" : `${week.followerGrowth >= 0 ? "+" : ""}${formatBrNumber(week.followerGrowth)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-ocean">Relatorio exportavel</p>
                <h3 className="mt-1 text-lg font-semibold">Baseline da equipe atual</h3>
                <p className="mt-1 text-sm text-slate-600">
                  O numero de referencia contra o qual a operacao propria vai se provar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LocalCopyButton text={baseline.markdown} label="Copiar baseline" />
                <LocalCopyButton text={baseline.tsv} label="Copiar TSV" />
                <button
                  type="button"
                  onClick={handleDownloadBaseline}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Baixar .md
                </button>
              </div>
            </div>
            <pre className="mt-4 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
              {baseline.markdown}
            </pre>
          </section>
        </>
      ) : (
        <section className="panel">
          <h3 className="text-lg font-semibold">Nenhuma semana real importada ainda</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Importe o CSV de Conteudo acima para ver o painel semanal com dados reais. Enquanto isso, o restante do produto continua
            mostrando dados de demonstracao.
          </p>
        </section>
      )}
    </div>
  );
}

function ImportFeedback({ okSummary, errors, warnings }: { okSummary: string | null; errors: string[]; warnings: string[] }) {
  if (!okSummary && errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {okSummary ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{okSummary}</p> : null}
      {errors.map((message, index) => (
        <p key={`error-${index}`} className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {message}
        </p>
      ))}
      {warnings.map((message, index) => (
        <p key={`warning-${index}`} className="rounded-md bg-amber-50 p-2 text-sm text-amber-700">
          {message}
        </p>
      ))}
    </div>
  );
}
