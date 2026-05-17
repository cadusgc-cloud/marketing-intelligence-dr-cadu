"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { WeeklyNextCollectionPlanPanel } from "@/app/data/WeeklyNextCollectionPlanPanel";
import { saveWeeklyMarketingData, type SaveWeeklyMarketingDataState } from "@/app/data/actions";
import { channelLabel } from "@/lib/decisionSignals";
import { applyWeeklyAssistedImport, parseWeeklyAssistedImport, type WeeklyAssistedImportResult } from "@/lib/weeklyAssistedImport";
import {
  buildWeeklyCollectionReadinessBoard,
  type WeeklyCollectionReadinessBoard,
  type WeeklyCollectionReadinessStatus,
  type WeeklyCollectionSourceFieldReadiness,
  type WeeklyCollectionSourceReadiness
} from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import {
  buildWeeklyCollectionTemplate,
  getWeeklyCollectionSafetyChecklist,
  getWeeklyCollectionTemplateSections,
  type WeeklyCollectionTemplateSection
} from "@/lib/weeklyCollectionTemplate";
import {
  applyWeeklyCsvColumnMappingPreset,
  buildWeeklyCsvMappedImport,
  getWeeklyCsvColumnMappingOptions,
  getWeeklyCsvColumnMappingPresets,
  parseWeeklyCsvImport,
  type WeeklyCsvColumnMapping,
  type WeeklyCsvColumnMappingKey,
  type WeeklyCsvColumnMappingOption,
  type WeeklyCsvColumnMappingPreset,
  type WeeklyCsvColumnMappingPresetId,
  type WeeklyCsvImportResult,
  type WeeklyCsvReadinessItem
} from "@/lib/weeklyCsvImport";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  buildWeeklySaveReadinessReport,
  convertWeeklyDataToDecisionInputs,
  createEmptyWeeklyMarketingData,
  getCalculatedWeeklyMetrics,
  isMetaPerformingBetterThanGoogle,
  normalizeWeeklyMarketingData,
  summarizeWeeklyMarketingData,
  updateWeeklyMarketingDataField,
  validateWeeklyMarketingData,
  type WeeklyMarketingData,
  type WeeklySaveReadinessItem,
  type WeeklySaveReadinessReport
} from "@/lib/weeklyDataInput";

type WeeklyDataSource = "saved" | "draft";

const initialSaveWeeklyMarketingDataState: SaveWeeklyMarketingDataState = {
  status: "idle",
  message: null,
  errors: []
};

type NumberField = {
  key: keyof WeeklyMarketingData;
  label: string;
  nullable?: boolean;
  step?: string;
};

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function TextInput({
  name,
  label,
  value,
  onChange,
  type = "text"
}: {
  name: keyof WeeklyMarketingData;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={String(name)}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
      />
    </label>
  );
}

function NumberInput({ field, data, onChange }: { field: NumberField; data: WeeklyMarketingData; onChange: (field: NumberField, value: string) => void }) {
  const value = data[field.key] as number | null;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      <input
        name={String(field.key)}
        type="number"
        min="0"
        step={field.step ?? "1"}
        value={value ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
      />
    </label>
  );
}

function SubmitButton({ blocked }: { blocked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending || blocked} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Salvando..." : blocked ? "Complete essenciais" : "Salvar semana"}
    </button>
  );
}

function formatCurrency(value: number | null): string {
  if (value === null) return "sem dado";
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "sem dado";
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}

export function WeeklyDataInputClient({ initialData, source }: { initialData: WeeklyMarketingData; source: WeeklyDataSource }) {
  const [saveState, formAction] = useFormState(saveWeeklyMarketingData, initialSaveWeeklyMarketingDataState);
  const [data, setData] = useState(() => normalizeWeeklyMarketingData(initialData));
  const [dirty, setDirty] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<WeeklyAssistedImportResult | null>(null);
  const [templateCopied, setTemplateCopied] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvResult, setCsvResult] = useState<WeeklyCsvImportResult | null>(null);
  const [csvColumnMappings, setCsvColumnMappings] = useState<WeeklyCsvColumnMapping>({});
  const [csvMappingPresetId, setCsvMappingPresetId] = useState<WeeklyCsvColumnMappingPresetId>("auto");
  const metrics = useMemo(() => getCalculatedWeeklyMetrics(data), [data]);
  const validation = useMemo(() => validateWeeklyMarketingData(data), [data]);
  const saveReadiness = useMemo(() => buildWeeklySaveReadinessReport(data), [data]);
  const collectionReadiness = useMemo(() => buildWeeklyCollectionReadinessBoard(data), [data]);
  const nextCollectionPlan = useMemo(() => buildWeeklyNextCollectionPlan(data, collectionReadiness), [data, collectionReadiness]);
  const decisionInputs = useMemo(() => convertWeeklyDataToDecisionInputs(data), [data]);
  const collectionTemplate = useMemo(() => buildWeeklyCollectionTemplate(), []);
  const collectionSections = useMemo(() => getWeeklyCollectionTemplateSections(), []);
  const collectionSafetyChecklist = useMemo(() => getWeeklyCollectionSafetyChecklist(), []);
  const csvColumnMappingOptions = useMemo(() => getWeeklyCsvColumnMappingOptions(), []);
  const csvColumnMappingPresets = useMemo(() => getWeeklyCsvColumnMappingPresets(), []);

  function setTextField(field: keyof WeeklyMarketingData, value: string) {
    setDirty(true);
    setData((current) => updateWeeklyMarketingDataField(current, field, value as never));
  }

  function setNumberField(field: NumberField, rawValue: string) {
    setDirty(true);
    const normalizedRawValue = rawValue.trim().replace(",", ".");
    const value = normalizedRawValue === "" && field.nullable ? null : Number(normalizedRawValue);
    setData((current) => updateWeeklyMarketingDataField(current, field.key, (Number.isFinite(value as number) || value === null ? value : 0) as never));
  }

  function restoreMockData() {
    setDirty(true);
    setData(normalizeWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK));
  }

  function clearData() {
    setDirty(true);
    setData(createEmptyWeeklyMarketingData());
  }

  function recalculateData() {
    setDirty(true);
    setData((current) => normalizeWeeklyMarketingData(current));
  }

  function previewAssistedImport() {
    setImportResult(parseWeeklyAssistedImport(importText));
  }

  function applyAssistedImport() {
    if (!importResult || importResult.recognizedFields.length === 0 || importResult.sensitiveWarnings.length > 0) return;
    setDirty(true);
    setData((current) => applyWeeklyAssistedImport(current, importResult));
  }

  function clearAssistedImport() {
    setImportText("");
    setImportResult(null);
  }

  async function copyCollectionTemplate() {
    if (!navigator.clipboard) {
      setTemplateCopied(false);
      return;
    }

    await navigator.clipboard.writeText(collectionTemplate);
    setTemplateCopied(true);
  }

  function useCollectionTemplateAsDraft() {
    setImportText(collectionTemplate);
    setImportResult(null);
    setTemplateCopied(false);
  }

  function previewCsvImport() {
    const baseResult = parseWeeklyCsvImport(csvText);
    const presetMappings = applyWeeklyCsvColumnMappingPreset(baseResult.headers, csvMappingPresetId);
    const result = baseResult.headers.length && !baseResult.isFieldValueTable ? buildWeeklyCsvMappedImport(csvText, presetMappings) : baseResult;
    setCsvResult(result);
    setCsvColumnMappings(baseResult.headers.length ? presetMappings : result.suggestedMappings);
  }

  function setCsvColumnMapping(index: number, mapping: WeeklyCsvColumnMappingKey) {
    setCsvColumnMappings((current) => ({ ...current, [index]: mapping }));
  }

  function applyCsvColumnMapping() {
    const result = buildWeeklyCsvMappedImport(csvText, csvColumnMappings);
    setCsvResult(result);
  }

  function applyCsvMappingPreset(presetId: WeeklyCsvColumnMappingPresetId) {
    setCsvMappingPresetId(presetId);
    if (!csvResult || !csvResult.headers.length || csvResult.isFieldValueTable) return;

    const presetMappings = applyWeeklyCsvColumnMappingPreset(csvResult.headers, presetId);
    setCsvColumnMappings(presetMappings);
    setCsvResult(buildWeeklyCsvMappedImport(csvText, presetMappings));
  }

  function sendCsvToAssistedImport() {
    if (!csvResult || !csvResult.readinessReport.canSendToAssistedImport) return;
    setImportText(csvResult.normalizedText);
    setImportResult(csvResult.assistedResult);
  }

  function clearCsvImport() {
    setCsvText("");
    setCsvFileName("");
    setCsvResult(null);
    setCsvColumnMappings({});
    setCsvMappingPresetId("auto");
  }

  async function loadCsvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    setCsvFileName(file.name);
    setCsvText(text);
    setCsvResult(null);
    setCsvColumnMappings({});
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-ocean">Dados semanais</p>
            <h2 className="mt-1 text-2xl font-semibold">Dados semanais</h2>
            <p className="mt-2 text-sm text-slate-500">Entrada leve de metricas agregadas para alimentar a auditoria, os sinais de decisao e a Central Semanal.</p>
          </div>
          <SubmitButton blocked={!saveReadiness.canSave} />
        </div>

        <StatusMessage source={source} dirty={dirty} status={saveState.status} message={saveState.message} errors={saveState.errors} />
        <WeeklySaveReadinessPanel report={saveReadiness} />
        <WeeklyCollectionReadinessBoardPanel board={collectionReadiness} />
        <WeeklyNextCollectionPlanPanel plan={nextCollectionPlan} />

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={restoreMockData} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Restaurar dados simulados
          </button>
          <button type="button" onClick={clearData} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Limpar dados da semana
          </button>
          <button type="button" onClick={recalculateData} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Recalcular indicadores
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
          <div>
            <p className="text-sm font-medium text-ocean">v1.3</p>
            <h3 className="mt-1 text-lg font-semibold">Template de coleta semanal</h3>
            <p className="mt-2 text-sm text-slate-500">
              Use este roteiro para coletar os numeros consolidados da semana antes de colar na importacao assistida. Ele nao busca dados sozinho e nao conecta APIs externas.
            </p>
            <div className="mt-4 grid gap-3">
              {collectionSections.map((section) => (
                <CollectionTemplateSectionSummary key={section.title} section={section} />
              ))}
            </div>
            <div className="mt-4 rounded-md bg-cyan-50 p-3 text-sm text-ocean">
              <p className="font-semibold">Checklist de seguranca</p>
              <ul className="mt-2 space-y-1">
                {collectionSafetyChecklist.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Template copiavel</span>
              <textarea
                readOnly
                value={collectionTemplate}
                rows={16}
                className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 outline-none"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={copyCollectionTemplate} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                Copiar template
              </button>
              <button type="button" onClick={useCollectionTemplateAsDraft} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Usar como rascunho da importacao
              </button>
            </div>
            {templateCopied ? <p className="mt-3 rounded-md bg-green-50 p-3 text-sm font-medium text-leaf">Template copiado para a area de transferencia.</p> : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)]">
          <div>
            <p className="text-sm font-medium text-ocean">v1.7</p>
            <h3 className="mt-1 text-lg font-semibold">Importacao por CSV/planilha</h3>
            <p className="mt-2 text-sm text-slate-500">
              Cole uma tabela CSV/TSV ou carregue um arquivo exportado da planilha. A leitura permite usar presets, mapear colunas e validar a prontidao antes da importacao assistida.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Perfil da planilha</span>
              <select
                value={csvMappingPresetId}
                onChange={(event) => applyCsvMappingPreset(event.target.value as WeeklyCsvColumnMappingPresetId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
              >
                {csvColumnMappingPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-slate-500">
                {csvColumnMappingPresets.find((preset) => preset.id === csvMappingPresetId)?.description}
              </span>
            </label>
            <textarea
              value={csvText}
              onChange={(event) => {
                setCsvText(event.target.value);
                setCsvResult(null);
                setCsvColumnMappings({});
              }}
              rows={8}
              placeholder={csvImportPlaceholder}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Carregar CSV
                <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" onChange={loadCsvFile} className="sr-only" />
              </label>
              <button type="button" onClick={previewCsvImport} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                Gerar previa CSV
              </button>
              <button
                type="button"
                onClick={sendCsvToAssistedImport}
                disabled={!csvResult || !csvResult.readinessReport.canSendToAssistedImport}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar para importacao assistida
              </button>
              <button type="button" onClick={clearCsvImport} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Limpar CSV
              </button>
            </div>
            {csvFileName ? <p className="mt-3 text-sm text-slate-500">Arquivo carregado: {csvFileName}</p> : null}
            <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber">
              CSV/TSV aqui e apenas uma etapa assistida. Revise a previa e depois use o fluxo normal antes de salvar a semana.
            </p>
          </div>
          <CsvImportPreview
            result={csvResult}
            mappings={csvColumnMappings}
            mappingOptions={csvColumnMappingOptions}
            selectedPreset={csvColumnMappingPresets.find((preset) => preset.id === csvMappingPresetId) ?? csvColumnMappingPresets[0]}
            onMappingChange={setCsvColumnMapping}
            onApplyMapping={applyCsvColumnMapping}
          />
        </div>
      </section>

      <section className="panel">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div>
            <p className="text-sm font-medium text-ocean">v1.2</p>
            <h3 className="mt-1 text-lg font-semibold">Importacao assistida</h3>
            <p className="mt-2 text-sm text-slate-500">
              Cole dados agregados de Instagram, Meta Ads, Google Ads ou comercial. O sistema reconhece campos conhecidos e preenche a semana apenas depois da sua confirmacao.
            </p>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={9}
              placeholder={assistedImportPlaceholder}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={previewAssistedImport} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
                Gerar previa
              </button>
              <button
                type="button"
                onClick={applyAssistedImport}
                disabled={!importResult || importResult.recognizedFields.length === 0 || importResult.sensitiveWarnings.length > 0}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar campos detectados
              </button>
              <button type="button" onClick={clearAssistedImport} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Limpar importacao
              </button>
            </div>
            <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber">
              Nao cole nomes, telefones, DMs, prontuarios, dados de paciente ou conversa individual. Use apenas numeros consolidados.
            </p>
          </div>
          <AssistedImportPreview result={importResult} />
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Dados da semana</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextInput name="weekLabel" label="Rotulo da semana" value={data.weekLabel} onChange={(value) => setTextField("weekLabel", value)} />
          <TextInput name="startDate" label="Inicio" type="date" value={data.startDate} onChange={(value) => setTextField("startDate", value)} />
          <TextInput name="endDate" label="Fim" type="date" value={data.endDate} onChange={(value) => setTextField("endDate", value)} />
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Observacoes</span>
          <textarea
            name="notes"
            value={data.notes}
            onChange={(event) => setTextField("notes", event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
          />
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <InputGroup title="Meta Ads" fields={metaFields} data={data} onChange={setNumberField} />
        <InputGroup title="Google Ads" fields={googleFields} data={data} onChange={setNumberField} />
        <InputGroup title="Instagram organico" fields={instagramFields} data={data} onChange={setNumberField} />
        <InputGroup title="Funil comercial" fields={funnelFields} data={data} onChange={setNumberField} />
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Resumo da semana</h3>
        <p className="mt-2 text-sm text-slate-600">{summarizeWeeklyMarketingData(data)}</p>
        {data.notes ? <p className="mt-3 text-sm text-slate-500">{data.notes}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Meta Ads" value={formatCurrency(data.metaSpend)} detail={`${data.metaWhatsappConversations} conversas no WhatsApp`} />
        <MetricCard label="Google Ads" value={formatCurrency(data.googleSpend)} detail={`${data.googleConversions} conversoes`} />
        <MetricCard label="Stories na semana" value={data.instagramStories} detail="minimo operacional: 42" />
        <MetricCard label="Funil" value={validation.valid ? "Completo" : "Incompleto"} detail={`${validation.missingFields.length} campo(s) ausente(s)`} />
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Indicadores calculados</h3>
        <p className="mt-1 text-sm text-slate-500">Campos calculados sao resultados automaticos. O usuario nao precisa digita-los.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Custo por WhatsApp" value={formatCurrency(metrics.metaCostPerWhatsapp)} />
          <MetricCard label="Custo por visita ao perfil" value={formatCurrency(metrics.metaCostPerProfileVisit)} />
          <MetricCard label="CPC Google" value={formatCurrency(metrics.googleCostPerClick)} />
          <MetricCard label="Taxa de conversao Google" value={formatPercent(metrics.googleConversionRate)} detail="Google segue em diagnostico quando conversoes estao zeradas" />
          <MetricCard label="Taxa de comparecimento" value={formatPercent(metrics.consultationShowRate)} />
          <MetricCard label="Taxa de fechamento" value={formatPercent(metrics.surgeryCloseRate)} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas e dados ausentes</h3>
          <p className="mt-1 text-sm text-slate-500">Alertas indicam lacunas operacionais, nao erro tecnico.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {validation.missingFields.map((field) => (
              <li key={field}>- Campo ausente ou zerado: {field}</li>
            ))}
          </ul>
          <h4 className="mt-5 text-sm font-semibold">Avisos operacionais</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {validation.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Previa dos sinais de decisao</h3>
          <p className="mt-2 text-sm text-slate-500">Estas metricas serao convertidas em entradas para o modulo Sinais de decisao depois que a semana for salva.</p>
          <div className="mt-4 space-y-2">
            {decisionInputs.map((input) => (
              <div key={input.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold">{channelLabel(input.channel)} - {input.metric}</p>
                <p className="mt-1">Valor: {input.value === null ? "sem dado" : String(input.value)} {input.unit}</p>
                <p className="mt-1 text-slate-500">{input.context}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">
            Meta como leitura mais confiavel: {isMetaPerformingBetterThanGoogle(data) ? "sim" : "nao"}
          </p>
        </div>
      </section>
    </form>
  );
}

function WeeklySaveReadinessPanel({ report }: { report: WeeklySaveReadinessReport }) {
  return (
    <div className={`mt-4 rounded-md border p-3 text-sm ${saveReadinessPanelClass(report.status)}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold">Validacao antes de salvar</p>
          <p className="mt-1">{report.summary}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
          {saveReadinessStatusLabel(report.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {report.items.map((item) => (
          <WeeklySaveReadinessItemView key={item.id} item={item} />
        ))}
      </div>

      {report.blockers.length ? (
        <div className="mt-3">
          <p className="font-semibold">Bloqueios para salvar</p>
          <ul className="mt-1 space-y-1">
            {report.blockers.map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report.reviewNotes.length ? (
        <div className="mt-3">
          <p className="font-semibold">Pontos para revisao</p>
          <ul className="mt-1 space-y-1">
            {report.reviewNotes.slice(0, 5).map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function WeeklySaveReadinessItemView({ item }: { item: WeeklySaveReadinessItem }) {
  return (
    <div className="rounded-md bg-white p-2">
      <p className="font-semibold text-slate-700">
        {saveReadinessItemStatusLabel(item.status)} {item.label}
      </p>
      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
    </div>
  );
}

function WeeklyCollectionReadinessBoardPanel({ board }: { board: WeeklyCollectionReadinessBoard }) {
  return (
    <div className={`mt-4 rounded-md border p-3 text-sm ${collectionReadinessPanelClass(board.status)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-semibold">Prontidao da coleta por fonte</p>
          <p className="mt-1">{board.summary}</p>
          <p className="mt-2 text-xs opacity-90">
            Score de coleta: {board.score}/100. Esta leitura e interna, manual e baseada somente nos campos agregados preenchidos.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
          {collectionReadinessStatusLabel(board.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {board.sources.map((source) => (
          <WeeklyCollectionSourceCard key={source.id} source={source} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-white p-3 text-slate-700">
          <p className="font-semibold">Proximas acoes de coleta</p>
          <ul className="mt-2 space-y-1 text-sm">
            {board.priorityActions.map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-white p-3 text-slate-700">
          <p className="font-semibold">Guardrails</p>
          <ul className="mt-2 space-y-1 text-sm">
            {board.privacyGuardrails.slice(0, 4).map((guardrail) => (
              <li key={guardrail}>- {guardrail}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {board.nextRoutes.map((route) => (
          <a key={route.href} href={route.href} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            {route.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function WeeklyCollectionSourceCard({ source }: { source: WeeklyCollectionSourceReadiness }) {
  return (
    <article className="rounded-md bg-white p-3 text-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${collectionReadinessBadgeClass(source.status)}`}>{collectionReadinessStatusLabel(source.status)}</span>
        <span className="text-xs font-semibold text-slate-500">{source.score}/100</span>
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{source.title}</h3>
      <p className="mt-1 text-xs text-slate-500">{source.sourceOwner}</p>
      <p className="mt-2 text-sm leading-5 text-slate-600">{source.summary}</p>
      <p className="mt-3 rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-600">{source.nextAction}</p>

      <div className="mt-3 space-y-2">
        {source.fields.map((field) => (
          <WeeklyCollectionFieldLine key={field.id} field={field} />
        ))}
      </div>

      {source.reviewNotes.length ? (
        <details className="mt-3 text-xs text-slate-500">
          <summary className="cursor-pointer font-medium text-slate-700">Notas de revisao</summary>
          <ul className="mt-2 space-y-1">
            {source.reviewNotes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}

function WeeklyCollectionFieldLine({ field }: { field: WeeklyCollectionSourceFieldReadiness }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${collectionFieldBadgeClass(field.status)}`}>{collectionFieldStatusLabel(field.status)}</span>
        <span className="text-xs font-semibold text-slate-700">{field.label}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Valor: {field.valueLabel}. {field.detail}
      </p>
    </div>
  );
}

function saveReadinessPanelClass(status: WeeklySaveReadinessReport["status"]): string {
  if (status === "ready") return "border-green-200 bg-green-50 text-leaf";
  if (status === "blocked") return "border-red-200 bg-red-50 text-danger";
  return "border-amber-200 bg-amber-50 text-amber";
}

function saveReadinessStatusLabel(status: WeeklySaveReadinessReport["status"]): string {
  if (status === "ready") return "pronta";
  if (status === "blocked") return "bloqueada";
  return "revisar";
}

function saveReadinessItemStatusLabel(status: WeeklySaveReadinessItem["status"]): string {
  if (status === "ok") return "OK -";
  if (status === "missing") return "Falta -";
  return "Revisar -";
}

function collectionReadinessPanelClass(status: WeeklyCollectionReadinessStatus): string {
  if (status === "ready") return "border-green-200 bg-green-50 text-leaf";
  if (status === "blocked") return "border-red-200 bg-red-50 text-danger";
  if (status === "missing") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-amber-200 bg-amber-50 text-amber";
}

function collectionReadinessBadgeClass(status: WeeklyCollectionReadinessStatus): string {
  if (status === "ready") return "bg-green-50 text-leaf";
  if (status === "blocked") return "bg-red-50 text-red-700";
  if (status === "missing") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber";
}

function collectionReadinessStatusLabel(status: WeeklyCollectionReadinessStatus): string {
  if (status === "ready") return "pronta";
  if (status === "blocked") return "bloqueada";
  if (status === "missing") return "sem coleta";
  return "revisar";
}

function collectionFieldBadgeClass(status: WeeklyCollectionSourceFieldReadiness["status"]): string {
  if (status === "ok") return "bg-green-50 text-leaf";
  if (status === "missing") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber";
}

function collectionFieldStatusLabel(status: WeeklyCollectionSourceFieldReadiness["status"]): string {
  if (status === "ok") return "ok";
  if (status === "missing") return "falta";
  return "revisar";
}

function CsvImportPreview({
  result,
  mappings,
  mappingOptions,
  selectedPreset,
  onMappingChange,
  onApplyMapping
}: {
  result: WeeklyCsvImportResult | null;
  mappings: WeeklyCsvColumnMapping;
  mappingOptions: WeeklyCsvColumnMappingOption[];
  selectedPreset: WeeklyCsvColumnMappingPreset | undefined;
  onMappingChange: (index: number, mapping: WeeklyCsvColumnMappingKey) => void;
  onApplyMapping: () => void;
}) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <h4 className="font-semibold">Previa CSV</h4>
        <p className="mt-2 text-sm text-slate-500">Cole ou carregue uma tabela e clique em gerar previa para revisar a conversao antes de enviar ao importador.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold">Previa CSV</h4>
      <p className="mt-1 text-sm text-slate-500">
        {result.rowCount} linha(s), {result.columnCount} coluna(s), delimitador: {csvDelimiterLabel(result.delimiter)}.
      </p>

      {result.sensitiveWarnings.length ? (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-danger" role="alert">
          <p className="font-semibold">Revisao obrigatoria</p>
          <ul className="mt-2 space-y-1">
            {result.sensitiveWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <CsvReadinessPanel result={result} />

      {result.headers.length && !result.isFieldValueTable ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Mapeamento manual de colunas</p>
              <p className="mt-1 text-xs text-slate-500">
                Preset aplicado: {selectedPreset?.label ?? "Detectar automaticamente"}. Ajuste qualquer coluna antes de enviar.
              </p>
            </div>
            <button type="button" onClick={onApplyMapping} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Atualizar previa
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            {result.headers.map((header, index) => (
              <label key={`${header}-${index}`} className="grid gap-2 rounded-md bg-white p-3 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <span>
                  <span className="block font-semibold text-slate-700">{header || `Coluna ${index + 1}`}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">Amostra: {result.selectedRow[index] || "sem valor"}</span>
                </span>
                <select
                  value={mappings[index] ?? result.suggestedMappings[index] ?? "ignore"}
                  onChange={(event) => onMappingChange(index, event.target.value as WeeklyCsvColumnMappingKey)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
                >
                  {mappingOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {result.normalizedText ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">Texto convertido para importacao assistida</p>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-600">{result.normalizedText}</pre>
          <p className="mt-3 text-sm text-slate-500">{result.assistedResult.recognizedFields.length} campo(s) reconhecido(s) pela importacao assistida.</p>
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber">Nenhum texto importavel foi gerado.</p>
      )}

      {result.warnings.length ? (
        <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber">
          <p className="font-semibold">Avisos</p>
          <ul className="mt-2 space-y-1">
            {result.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function csvDelimiterLabel(delimiter: WeeklyCsvImportResult["delimiter"]): string {
  if (delimiter === "semicolon") return "ponto e virgula";
  if (delimiter === "comma") return "virgula";
  if (delimiter === "tab") return "tabulacao";
  return "nao identificado";
}

function CsvReadinessPanel({ result }: { result: WeeklyCsvImportResult }) {
  const readiness = result.readinessReport;

  return (
    <div className={`mt-4 rounded-md border p-3 text-sm ${readinessPanelClass(readiness.status)}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold">Validacao antes de enviar</p>
          <p className="mt-1">{readiness.summary}</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
          {readinessStatusLabel(readiness.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {readiness.items.map((item) => (
          <CsvReadinessItemView key={item.id} item={item} />
        ))}
      </div>

      {readiness.blockers.length ? (
        <div className="mt-3">
          <p className="font-semibold">Bloqueios</p>
          <ul className="mt-1 space-y-1">
            {readiness.blockers.map((blocker) => (
              <li key={blocker}>- {blocker}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CsvReadinessItemView({ item }: { item: WeeklyCsvReadinessItem }) {
  return (
    <div className="rounded-md bg-white p-2">
      <p className="font-semibold text-slate-700">
        {readinessItemStatusLabel(item.status)} {item.label}
      </p>
      <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
    </div>
  );
}

function readinessPanelClass(status: WeeklyCsvImportResult["readinessReport"]["status"]): string {
  if (status === "ready") return "border-green-200 bg-green-50 text-leaf";
  if (status === "blocked") return "border-red-200 bg-red-50 text-danger";
  return "border-amber-200 bg-amber-50 text-amber";
}

function readinessStatusLabel(status: WeeklyCsvImportResult["readinessReport"]["status"]): string {
  if (status === "ready") return "pronta";
  if (status === "blocked") return "bloqueada";
  return "revisar";
}

function readinessItemStatusLabel(status: WeeklyCsvReadinessItem["status"]): string {
  if (status === "ok") return "OK -";
  if (status === "missing") return "Falta -";
  return "Revisar -";
}

function CollectionTemplateSectionSummary({ section }: { section: WeeklyCollectionTemplateSection }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="text-sm font-semibold text-slate-700">{section.title}</p>
      <p className="mt-1 text-xs text-slate-500">{section.source}</p>
      <p className="mt-2 text-xs text-slate-500">
        {section.fields.length} campo(s), {section.fields.filter((field) => field.required).length} essencial(is).
      </p>
    </div>
  );
}

function AssistedImportPreview({ result }: { result: WeeklyAssistedImportResult | null }) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <h4 className="font-semibold">Previa da importacao</h4>
        <p className="mt-2 text-sm text-slate-500">Cole um relatorio agregado e clique em gerar previa para revisar os campos antes de aplicar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold">Previa da importacao</h4>
      <p className="mt-1 text-sm text-slate-500">
        {result.recognizedFields.length} campo(s) detectado(s). Campos sensiveis bloqueiam a aplicacao automatica.
      </p>

      {result.sensitiveWarnings.length ? (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-danger" role="alert">
          <p className="font-semibold">Revisao obrigatoria</p>
          <ul className="mt-2 space-y-1">
            {result.sensitiveWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.recognizedFields.length ? (
        <div className="mt-4 grid gap-2">
          {result.recognizedFields.map((field) => (
            <div key={`${field.key}-${field.sourceLine}`} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-700">{field.label}</p>
              <p className="mt-1 text-slate-600">{field.value === null ? "sem dado" : String(field.value)}</p>
              <p className="mt-1 text-xs text-slate-500">{field.sourceLine}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber">Nenhum campo conhecido foi detectado.</p>
      )}

      {result.warnings.length ? (
        <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber">
          <p className="font-semibold">Avisos</p>
          <ul className="mt-2 space-y-1">
            {result.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.ignoredLines.length ? (
        <details className="mt-4 text-sm text-slate-500">
          <summary className="cursor-pointer font-medium text-slate-700">Linhas ignoradas ({result.ignoredLines.length})</summary>
          <ul className="mt-2 space-y-1">
            {result.ignoredLines.slice(0, 8).map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function StatusMessage({
  source,
  dirty,
  status,
  message,
  errors
}: {
  source: WeeklyDataSource;
  dirty: boolean;
  status: "idle" | "success" | "error";
  message: string | null;
  errors: string[];
}) {
  if (status === "success") {
    return <p className="mt-4 rounded-md bg-green-50 p-3 text-sm font-medium text-leaf">{message}</p>;
  }

  if (status === "error") {
    return (
      <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-danger" role="alert">
        <p className="font-semibold">{message}</p>
        {errors.length ? (
          <ul className="mt-2 space-y-1">
            {errors.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (source === "draft") {
    return (
      <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
        Estes sao dados simulados de rascunho. A Central Semanal so usa esta semana depois de salvar.
      </p>
    );
  }

  if (dirty) {
    return (
      <p className="mt-4 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
        Existem alteracoes locais ainda nao salvas. Salve a semana para atualizar a Central Semanal.
      </p>
    );
  }

  return (
    <p className="mt-4 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
      Semana salva carregada do historico. Qualquer edicao precisa ser salva para atualizar a Central Semanal.
    </p>
  );
}

function InputGroup({
  title,
  fields,
  data,
  onChange
}: {
  title: string;
  fields: NumberField[];
  data: WeeklyMarketingData;
  onChange: (field: NumberField, value: string) => void;
}) {
  return (
    <section className="panel">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <NumberInput key={String(field.key)} field={field} data={data} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}

const metaFields: NumberField[] = [
  { key: "metaSpend", label: "Investimento Meta Ads", step: "0.01" },
  { key: "metaWhatsappConversations", label: "Conversas no WhatsApp" },
  { key: "metaProfileVisits", label: "Visitas ao perfil" }
];

const googleFields: NumberField[] = [
  { key: "googleSpend", label: "Investimento Google Ads", step: "0.01" },
  { key: "googleClicks", label: "Cliques" },
  { key: "googleConversions", label: "Conversoes" }
];

const instagramFields: NumberField[] = [
  { key: "instagramStories", label: "Stories na semana" },
  { key: "instagramReels", label: "Reels/Shorts na semana" },
  { key: "instagramPosts", label: "Posts na semana" },
  { key: "instagramProfileVisits", label: "Visitas ao perfil" }
];

const funnelFields: NumberField[] = [
  { key: "whatsappTotal", label: "WhatsApps totais" },
  { key: "qualifiedConversations", label: "Conversas qualificadas" },
  { key: "consultationsScheduled", label: "Consultas marcadas", nullable: true },
  { key: "consultationsAttended", label: "Consultas comparecidas", nullable: true },
  { key: "surgeriesClosed", label: "Cirurgias fechadas", nullable: true }
];

const assistedImportPlaceholder = `Periodo: 11/05/2026 a 17/05/2026
Rotulo da semana: Semana 11/05 a 17/05/2026
Investimento Meta Ads: R$ 780,00
Conversas Meta: 118
Investimento Google Ads: R$ 220,00
Cliques Google Ads: 48
Conversoes Google Ads: 0
Stories publicados: 42
Reels publicados: 3
Posts publicados: 2
WhatsApps totais: 126
Conversas qualificadas: 42
Consultas marcadas: 12
Consultas comparecidas: 9
Cirurgias fechadas: 2`;

const csvImportPlaceholder = `Campo;Valor
Periodo;11/05/2026 a 17/05/2026
Rotulo da semana;Semana 11/05 a 17/05/2026
Investimento Meta Ads;R$ 780,00
Conversas Meta;118
Investimento Google Ads;R$ 220,00
Cliques Google Ads;48
Conversoes Google Ads;0
Stories publicados;42
Consultas marcadas;12`;
