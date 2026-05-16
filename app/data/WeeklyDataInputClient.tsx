"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveWeeklyMarketingData, type SaveWeeklyMarketingDataState } from "@/app/data/actions";
import { channelLabel } from "@/lib/decisionSignals";
import { applyWeeklyAssistedImport, parseWeeklyAssistedImport, type WeeklyAssistedImportResult } from "@/lib/weeklyAssistedImport";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  convertWeeklyDataToDecisionInputs,
  createEmptyWeeklyMarketingData,
  getCalculatedWeeklyMetrics,
  isMetaPerformingBetterThanGoogle,
  normalizeWeeklyMarketingData,
  summarizeWeeklyMarketingData,
  updateWeeklyMarketingDataField,
  validateWeeklyMarketingData,
  type WeeklyMarketingData
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "Salvando..." : "Salvar semana"}
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
  const metrics = useMemo(() => getCalculatedWeeklyMetrics(data), [data]);
  const validation = useMemo(() => validateWeeklyMarketingData(data), [data]);
  const decisionInputs = useMemo(() => convertWeeklyDataToDecisionInputs(data), [data]);

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

  return (
    <form action={formAction} className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-ocean">Dados semanais</p>
            <h2 className="mt-1 text-2xl font-semibold">Dados semanais</h2>
            <p className="mt-2 text-sm text-slate-500">Entrada leve de metricas agregadas para alimentar a auditoria, os sinais de decisao e a Central Semanal.</p>
          </div>
          <SubmitButton />
        </div>

        <StatusMessage source={source} dirty={dirty} status={saveState.status} message={saveState.message} errors={saveState.errors} />

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
